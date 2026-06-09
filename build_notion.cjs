const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Upload, CheckCircle2, ArrowRight, Play, Server, Save, RotateCcw, Edit3, X, MousePointerClick } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { db } from '../api/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { toast } from '../utils/toast';

export interface ParsedRow {
    originalIndex: number;
    rawProjectName: string;
    rawDeveloperSales: string;
    parsedProjectName: string;
    parsedDevelopers: string; // comma separated
    parsedSales: string; // comma separated
    rowData: any;
}

export default function NotionMigration() {
    const { settings } = useAppState();
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [csvData, setCsvData] = useState<any[]>([]);

    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);

    const [uniqueServices, setUniqueServices] = useState<string[]>([]);
    const [uniqueOnboarding, setUniqueOnboarding] = useState<string[]>([]);
    const [uniqueTimelines, setUniqueTimelines] = useState<string[]>([]);
    const [uniqueClients, setUniqueClients] = useState<string[]>([]);

    const [serviceMapping, setServiceMapping] = useState<Record<string, string>>({});
    const [onboardingMapping, setOnboardingMapping] = useState<Record<string, string>>({});
    const [timelineMapping, setTimelineMapping] = useState<Record<string, string>>({});
    const [clientMapping, setClientMapping] = useState<Record<string, { type: 'Developer' | 'Sales & Marketing', finalName: string }>>({});

    const [generatedClients, setGeneratedClients] = useState<any[]>([]);
    const [generatedProjects, setGeneratedProjects] = useState<any[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);

    // Filters for step 3
    const [showOnlyExtracted, setShowOnlyExtracted] = useState(false);
    
    // Save/Resume state
    const [savedSessionInfo, setSavedSessionInfo] = useState<{ date: string, length: number } | null>(null);

    // Tagger Modal State
    const [taggerIndex, setTaggerIndex] = useState<number | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('notion_migration_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data && data.step) {
                    setSavedSessionInfo({ date: data.date, length: data.parsedRows?.length || 0 });
                }
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (step > 1 && parsedRows.length > 0) {
            const stateToSave = {
                step, csvData, parsedRows, uniqueServices, uniqueOnboarding, uniqueTimelines, uniqueClients,
                serviceMapping, onboardingMapping, timelineMapping, clientMapping,
                date: new Date().toLocaleString()
            };
            localStorage.setItem('notion_migration_progress', JSON.stringify(stateToSave));
        }
    }, [step, parsedRows, serviceMapping, onboardingMapping, timelineMapping, clientMapping]);

    const handleResume = () => {
        const saved = localStorage.getItem('notion_migration_progress');
        if (saved) {
            const data = JSON.parse(saved);
            setStep(data.step || 1);
            setCsvData(data.csvData || []);
            setParsedRows(data.parsedRows || []);
            setUniqueServices(data.uniqueServices || []);
            setUniqueOnboarding(data.uniqueOnboarding || []);
            setUniqueTimelines(data.uniqueTimelines || []);
            setUniqueClients(data.uniqueClients || []);
            setServiceMapping(data.serviceMapping || {});
            setOnboardingMapping(data.onboardingMapping || {});
            setTimelineMapping(data.timelineMapping || {});
            setClientMapping(data.clientMapping || {});
            setSavedSessionInfo(null);
        }
    };

    const handleClearSaved = () => {
        localStorage.removeItem('notion_migration_progress');
        setSavedSessionInfo(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                setCsvData(data);
                
                const sSet = new Set<string>();
                const oSet = new Set<string>();
                const tSet = new Set<string>();

                const initialParsedRows = data.map((row, i) => {
                    let projectNameStr = row['Project Name'] || '';
                    let extractedDevs: string[] = [];
                    
                    const projMatch = projectNameStr.match(/^(.*?)\\s+(?:-|\\u2013|\\u2014|\\|)\\s+(.*)$/);
                    if (projMatch) {
                        extractedDevs.push(projMatch[1].trim());
                        projectNameStr = projMatch[2].trim();
                    }

                    const devSalesStr = row['Developer/Sales'] || '';
                    if (devSalesStr) {
                        devSalesStr.split(/[,\\/&]+/).forEach((c: string) => {
                            const cleaned = c.trim();
                            if (cleaned && !extractedDevs.includes(cleaned)) extractedDevs.push(cleaned);
                        });
                    }

                    if (row['Services']) {
                        row['Services'].split(',').forEach((s: string) => sSet.add(s.trim()));
                    }
                    if (row['Onboarding Status']) oSet.add(row['Onboarding Status'].trim());
                    if (row['Project Status']) tSet.add(row['Project Status'].trim());

                    return {
                        originalIndex: i,
                        rawProjectName: row['Project Name'] || '',
                        rawDeveloperSales: row['Developer/Sales'] || '',
                        parsedProjectName: projectNameStr,
                        parsedDevelopers: extractedDevs.join(', '),
                        parsedSales: '',
                        rowData: row
                    };
                });

                setParsedRows(initialParsedRows);
                setUniqueServices(Array.from(sSet).filter(Boolean));
                setUniqueOnboarding(Array.from(oSet).filter(Boolean));
                setUniqueTimelines(Array.from(tSet).filter(Boolean));

                setStep(2);
            }
        });
    };

    const handleParsedRowChange = (index: number, field: keyof ParsedRow, value: string) => {
        const newRows = [...parsedRows];
        newRows[index] = { ...newRows[index], [field]: value };
        setParsedRows(newRows);
    };

    const handleCleanDataNext = () => {
        const cSet = new Set<string>();
        parsedRows.forEach(row => {
            if (row.parsedDevelopers) {
                row.parsedDevelopers.split(',').forEach(c => c.trim() && cSet.add(c.trim()));
            }
            if (row.parsedSales) {
                row.parsedSales.split(',').forEach(c => c.trim() && cSet.add(c.trim()));
            }
        });

        const cList = Array.from(cSet).filter(Boolean);
        setUniqueClients(cList);

        const cMap: any = {};
        cList.forEach(c => {
            cMap[c] = { type: 'Developer', finalName: c };
        });
        
        parsedRows.forEach(row => {
             if (row.parsedSales) {
                 row.parsedSales.split(',').forEach(c => {
                     const cleaned = c.trim();
                     if (cleaned && cMap[cleaned]) {
                         cMap[cleaned].type = 'Sales & Marketing';
                     }
                 });
             }
        });

        setClientMapping(cMap);
        setStep(4);
    };

    const generatePayloads = () => {
        const newClients: any[] = [];
        const newProjects: any[] = [];

        Object.entries(clientMapping).forEach(([rawName, mapData]) => {
            newClients.push({
                clientId: \`C-\${new Date().getTime()}-\${Math.floor(Math.random() * 10000)}\`,
                companyName: mapData.finalName,
                clientType: mapData.type,
                csatScore: 'N/A',
                financialStanding: 'N/A',
                createdAt: new Date().toISOString()
            });
        });

        parsedRows.forEach((pRow) => {
            const row = pRow.rowData;
            const rawAssignee = row['Assignee'] || 'Unassigned';
            const rawChecklist = row['Deliverable Checklist'] || '';
            const rawNotes = row['Notes'] || '';
            const rawReleaseDate = row['Release Date'] || '';
            const rawUnits = row['Units'] ? parseInt(row['Units'].replace(/,/g, ''), 10) : 0;
            const rawServices = row['Services'] ? row['Services'].split(',').map((s: string) => s.trim()) : [];
            const rawOnboarding = row['Onboarding Status']?.trim() || '';
            const rawTimeline = row['Project Status']?.trim() || '';
            
            const rawClients: string[] = [];
            if (pRow.parsedDevelopers) pRow.parsedDevelopers.split(',').forEach(c => c.trim() && rawClients.push(c.trim()));
            if (pRow.parsedSales) pRow.parsedSales.split(',').forEach(c => c.trim() && rawClients.push(c.trim()));

            const resolveMapping = (rawVal: string, mapping: Record<string, string>) => {
                const mapped = mapping[rawVal];
                if (!mapped) return rawVal;
                if (mapped.startsWith('__CUSTOM__:')) return mapped.replace('__CUSTOM__:', '').trim();
                return mapped;
            };

            const mappedFeatures = rawServices.map((s: string) => resolveMapping(s, serviceMapping)).filter(Boolean);
            const mappedOnboarding = resolveMapping(rawOnboarding, onboardingMapping);
            const mappedTimeline = resolveMapping(rawTimeline, timelineMapping);

            const pStatus = mappedOnboarding.toLowerCase().includes('release') ? 'Active' : 'Onboarding';

            const projectClientIds = rawClients.map((rc: string) => {
                const found = newClients.find(c => c.companyName === clientMapping[rc]?.finalName);
                return found ? found.clientId : null;
            }).filter(Boolean);

            const notesArr = rawNotes ? [{
                id: \`note-\${Date.now()}-\${Math.random()}\`,
                text: \`Notion Import Note: \${rawNotes}\`,
                date: new Date().toISOString(),
                author: 'System Import'
            }] : [];

            newProjects.push({
                id: \`P-\${new Date().getTime()}-\${pRow.originalIndex}\`,
                name: pRow.parsedProjectName || \`Unnamed Project \${pRow.originalIndex}\`,
                assignee: rawAssignee,
                projectStatus: pStatus,
                timelineStatus: mappedTimeline,
                onboardingPhase: mappedOnboarding,
                features: mappedFeatures,
                units: isNaN(rawUnits) ? 0 : rawUnits,
                releaseDateStr: rawReleaseDate,
                checklistUrl: rawChecklist,
                clientIds: projectClientIds,
                notes: notesArr,
                createdAt: new Date().toISOString()
            });
        });

        setGeneratedClients(newClients);
        setGeneratedProjects(newProjects);
        setStep(5);
    };

    const executeMigration = async () => {
        setIsExecuting(true);
        try {
            const chunks = (arr: any[], size: number) => {
                return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
                    arr.slice(i * size, i * size + size)
                );
            };

            const allOperations = [
                ...generatedClients.map(c => ({ ref: doc(collection(db, 'clients'), c.clientId), data: c })),
                ...generatedProjects.map(p => ({ ref: doc(collection(db, 'projects'), p.id), data: p }))
            ];

            const batches = chunks(allOperations, 450);

            for (let i = 0; i < batches.length; i++) {
                const batch = writeBatch(db);
                batches[i].forEach(op => {
                    batch.set(op.ref, op.data);
                });
                await batch.commit();
            }

            toast.success('Migration Complete!', \`Successfully imported \${generatedClients.length} clients and \${generatedProjects.length} projects.\`);
            handleClearSaved();
            setStep(1);
            setCsvData([]);
            setParsedRows([]);
            setGeneratedClients([]);
            setGeneratedProjects([]);
        } catch (error) {
            console.error(error);
            toast.error('Migration Failed', 'Check the console for errors.');
        } finally {
            setIsExecuting(false);
        }
    };

    const renderMappingSelect = (rawVal: string, mappingState: Record<string, string>, setMappingState: any, options: string[]) => {
        const currentVal = mappingState[rawVal] || '';
        const isCustom = currentVal.startsWith('__CUSTOM__:');
        const customValue = isCustom ? currentVal.replace('__CUSTOM__:', '') : '';

        return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 last:border-0 gap-4">
            <div className="text-sm font-medium text-slate-700 break-all w-full sm:w-1/3">{rawVal}</div>
            <div className="flex-1 w-full sm:w-2/3 flex flex-col gap-2">
                <select
                    className="w-full py-1.5 px-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    value={isCustom ? '__CUSTOM__' : currentVal}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__CUSTOM__') {
                            setMappingState({ ...mappingState, [rawVal]: '__CUSTOM__:' });
                        } else {
                            setMappingState({ ...mappingState, [rawVal]: val });
                        }
                    }}
                >
                    <option value="">-- Keep raw value --</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    <option value="__CUSTOM__">+ Edit / Create Custom Mapping...</option>
                </select>
                {isCustom && (
                    <input 
                        type="text"
                        placeholder="Type new custom mapping value..."
                        value={customValue}
                        onChange={(e) => setMappingState({ ...mappingState, [rawVal]: \`__CUSTOM__:\${e.target.value}\` })}
                        className="w-full py-1.5 px-3 border border-indigo-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50"
                        autoFocus
                    />
                )}
            </div>
        </div>
    )};

    // Step 3 Filtering
    const displayedRows = showOnlyExtracted ? parsedRows.filter(r => r.parsedDevelopers.length > 0 && r.parsedProjectName !== r.rawProjectName) : parsedRows;

    // Tagger Component State variables
    const activeTaggerRow = taggerIndex !== null ? parsedRows.find(r => r.originalIndex === taggerIndex) : null;
    const [taggerForm, setTaggerForm] = useState({ proj: '', dev: '', sales: '' });
    
    // Derived chips from the active row's raw strings (split by hyphens, pipes, slashes, ampersands, commas, and words)
    const [chips, setChips] = useState<string[]>([]);

    useEffect(() => {
        if (activeTaggerRow) {
            setTaggerForm({
                proj: activeTaggerRow.parsedProjectName,
                dev: activeTaggerRow.parsedDevelopers,
                sales: activeTaggerRow.parsedSales
            });
            const rawCombined = (activeTaggerRow.rawProjectName + " | " + activeTaggerRow.rawDeveloperSales);
            // Splitting logic to generate meaningful chips
            const segments = rawCombined.split(/(?:\\s*[-|&/,]\\s*)+/).map(s => s.trim()).filter(Boolean);
            setChips(segments);
        }
    }, [activeTaggerRow]);

    const appendToField = (field: 'proj' | 'dev' | 'sales', text: string) => {
        setTaggerForm(prev => {
            let current = prev[field];
            if (current) current += \`, \${text}\`;
            else current = text;
            return { ...prev, [field]: current };
        });
    };

    const saveTagger = () => {
        if (taggerIndex !== null) {
            handleParsedRowChange(taggerIndex, 'parsedProjectName', taggerForm.proj);
            handleParsedRowChange(taggerIndex, 'parsedDevelopers', taggerForm.dev);
            handleParsedRowChange(taggerIndex, 'parsedSales', taggerForm.sales);
            setTaggerIndex(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300 pb-12 relative">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Server className="w-5 h-5 text-indigo-500"/> Notion Data Migration</h2>
                    <p className="text-sm text-slate-500 mt-1">Safely map and import your one-time CSV export from Notion.</p>
                </div>
                {step > 1 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-border px-3 py-1.5 rounded-md shadow-sm">
                        <Save className="w-3.5 h-3.5 text-indigo-500" />
                        Progress Auto-Saved
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 mb-8 bg-slate-50 p-3 rounded-lg border border-border">
                {[1, 2, 3, 4, 5].map((s) => (
                    <React.Fragment key={s}>
                        <div className={\`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold \${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}\`}>
                            {s}
                        </div>
                        {s < 5 && <div className={\`flex-1 h-1 \${step > s ? 'bg-indigo-600' : 'bg-slate-200'}\`} />}
                    </React.Fragment>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-6">
                    {savedSessionInfo && (
                        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-indigo-900 flex items-center gap-2"><Save className="w-5 h-5" /> Saved Progress Found</h3>
                                <p className="text-sm text-indigo-700 mt-1">You have an incomplete migration session saved locally.</p>
                                <p className="text-xs text-indigo-500 mt-1">Last Saved: {savedSessionInfo.date} • {savedSessionInfo.length} rows parsed</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleClearSaved} className="px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-md border border-slate-300 hover:bg-slate-50 transition-colors">Start Fresh</button>
                                <button onClick={handleResume} className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"><RotateCcw className="w-4 h-4"/> Resume Progress</button>
                            </div>
                        </div>
                    )}
                    <div className="bg-white border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Upload Notion CSV</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-6 max-w-md">Drag and drop the \`notion_export.csv\` file here.</p>
                        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm">
                            Select CSV File
                            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-5 py-3 border-b border-border">
                            <h3 className="font-bold text-slate-800">Map Features / Services</h3>
                        </div>
                        <div className="p-5">
                            {uniqueServices.map(val => renderMappingSelect(val, serviceMapping, setServiceMapping, settings?.features || []))}
                        </div>
                    </div>
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-5 py-3 border-b border-border">
                            <h3 className="font-bold text-slate-800">Map Onboarding Phases</h3>
                        </div>
                        <div className="p-5">
                            {uniqueOnboarding.map(val => renderMappingSelect(val, onboardingMapping, setOnboardingMapping, (settings?.phases || []).map((p: any) => p.name)))}
                        </div>
                    </div>
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-5 py-3 border-b border-border">
                            <h3 className="font-bold text-slate-800">Map Timeline Statuses</h3>
                        </div>
                        <div className="p-5">
                            {uniqueTimelines.map(val => renderMappingSelect(val, timelineMapping, setTimelineMapping, (settings?.timelines || []).map((t: any) => t.name)))}
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-md font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                            Back
                        </button>
                        <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                            Next Step <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 relative">
                    {/* Visual Tagger Modal */}
                    {activeTaggerRow && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-5 border-b border-border flex justify-between items-center bg-slate-50">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Edit3 className="w-5 h-5 text-indigo-500" /> Interactive Data Splitter</h3>
                                        <p className="text-xs text-slate-500 mt-1">Click a generated "chip" below, then assign it to a field.</p>
                                    </div>
                                    <button onClick={() => setTaggerIndex(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X className="w-5 h-5"/></button>
                                </div>
                                
                                <div className="p-6 space-y-8">
                                    {/* Chips Section */}
                                    <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                                        <div className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <MousePointerClick className="w-4 h-4" /> 
                                            Select parts of the original strings:
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {chips.map((chip, idx) => (
                                                <div className="flex flex-wrap gap-1 items-center" key={idx}>
                                                    <span className="px-3 py-1.5 bg-white border border-indigo-200 rounded-md text-sm font-bold text-slate-700 shadow-sm">{chip}</span>
                                                    <div className="flex bg-white rounded-md border shadow-sm overflow-hidden">
                                                        <button onClick={() => appendToField('proj', chip)} className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-r" title="Add to Project Name">Proj</button>
                                                        <button onClick={() => appendToField('dev', chip)} className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-r" title="Add to Developers">Dev</button>
                                                        <button onClick={() => appendToField('sales', chip)} className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Add to Sales & Mkt">Sales</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-indigo-200/50">
                                            Raw Strings: "{activeTaggerRow.rawProjectName}" &nbsp; | &nbsp; "{activeTaggerRow.rawDeveloperSales}"
                                        </div>
                                    </div>

                                    {/* Edit Fields */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Project Name</label>
                                            <input 
                                                type="text" 
                                                value={taggerForm.proj}
                                                onChange={(e) => setTaggerForm({...taggerForm, proj: e.target.value})}
                                                className="w-full py-2 px-3 border border-input rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Developers (comma separated)</label>
                                                <input 
                                                    type="text" 
                                                    value={taggerForm.dev}
                                                    onChange={(e) => setTaggerForm({...taggerForm, dev: e.target.value})}
                                                    className="w-full py-2 px-3 border border-input rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Sales & Marketing (comma separated)</label>
                                                <input 
                                                    type="text" 
                                                    value={taggerForm.sales}
                                                    onChange={(e) => setTaggerForm({...taggerForm, sales: e.target.value})}
                                                    className="w-full py-2 px-3 border border-input rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-5 border-t border-border bg-slate-50 flex justify-end gap-3">
                                    <button onClick={() => setTaggerIndex(null)} className="px-5 py-2 rounded-md font-bold text-slate-600 bg-white border shadow-sm hover:bg-slate-50">Cancel</button>
                                    <button onClick={saveTagger} className="px-5 py-2 rounded-md font-bold text-white bg-indigo-600 shadow-sm hover:bg-indigo-700">Save & Close</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white border rounded-xl shadow-sm flex flex-col h-[700px]">
                        <div className="bg-slate-50 px-5 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800">Clean Project Data</h3>
                                <p className="text-xs text-slate-500 font-normal mt-0.5 max-w-2xl">
                                    The auto-parser has split Developer/Sales by ",", "/", and "&". It also extracted implicit clients from Project Names separated by "-" or "|". 
                                    Review the parsed values below and correct any mistakes. Use comma separated values to define multiple entities.
                                    <br/><br/>
                                    <strong>Tip:</strong> Click the <Edit3 className="w-3 h-3 inline mx-1" /> icon to open the Interactive Splitter tool for complex names!
                                </p>
                            </div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white px-3 py-1.5 rounded-md border shadow-sm cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" checked={showOnlyExtracted} onChange={(e) => setShowOnlyExtracted(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                Show Only Auto-Extracted Projects
                            </label>
                        </div>
                        
                        <div className="flex-1 overflow-auto bg-slate-50/50">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white border-b border-border text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 w-10">Split</th>
                                        <th className="px-4 py-3 min-w-[200px]">Original Strings (Proj / Devs)</th>
                                        <th className="px-4 py-3 min-w-[200px]">Parsed Project Name</th>
                                        <th className="px-4 py-3 min-w-[200px]">Developers (comma separated)</th>
                                        <th className="px-4 py-3 min-w-[200px]">Sales & Mkt (comma separated)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-white">
                                    {displayedRows.map((r, renderIndex) => (
                                        <tr key={r.originalIndex} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => setTaggerIndex(r.originalIndex)} className="p-2 text-indigo-500 bg-indigo-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 hover:text-white" title="Interactive Split Tool">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500 break-words">
                                                <div className="font-bold text-slate-700">{r.rawProjectName}</div>
                                                <div className="text-[10px] mt-1">{r.rawDeveloperSales}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="text" 
                                                    value={r.parsedProjectName}
                                                    onChange={(e) => handleParsedRowChange(r.originalIndex, 'parsedProjectName', e.target.value)}
                                                    className="w-full py-1.5 px-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="text" 
                                                    value={r.parsedDevelopers}
                                                    onChange={(e) => handleParsedRowChange(r.originalIndex, 'parsedDevelopers', e.target.value)}
                                                    placeholder="e.g. Tien Sher, Stryke"
                                                    className="w-full py-1.5 px-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="text" 
                                                    value={r.parsedSales}
                                                    onChange={(e) => handleParsedRowChange(r.originalIndex, 'parsedSales', e.target.value)}
                                                    placeholder="e.g. Key Marketing"
                                                    className="w-full py-1.5 px-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(2)} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-md font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                            Back
                        </button>
                        <button onClick={handleCleanDataNext} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                            Next: Map Unique Clients <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6">
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-5 py-3 border-b border-border">
                            <h3 className="font-bold text-slate-800">Map Clients</h3>
                            <p className="text-xs text-slate-500 font-normal mt-0.5">We found {uniqueClients.length} unique clients from your cleaned data. Define their type and fix any final typos before generating the import payload.</p>
                        </div>
                        <div className="p-5 divide-y divide-border/50 max-h-[600px] overflow-auto">
                            {uniqueClients.map(rawName => (
                                <div key={rawName} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3">
                                    <div className="w-1/3 text-sm font-medium text-slate-700 break-all">{rawName}</div>
                                    <div className="flex-1 flex items-center gap-3">
                                        <input 
                                            type="text" 
                                            value={clientMapping[rawName]?.finalName || ''}
                                            onChange={(e) => setClientMapping({...clientMapping, [rawName]: {...clientMapping[rawName], finalName: e.target.value}})}
                                            className="flex-1 py-1.5 px-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                        />
                                        <select
                                            value={clientMapping[rawName]?.type || 'Developer'}
                                            onChange={(e) => setClientMapping({...clientMapping, [rawName]: {...clientMapping[rawName], type: e.target.value as any}})}
                                            className="w-40 py-1.5 px-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white font-medium"
                                        >
                                            <option value="Developer">Developer</option>
                                            <option value="Sales & Marketing">Sales & Marketing</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-md font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                            Back
                        </button>
                        <button onClick={generatePayloads} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                            Generate Preview <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {step === 5 && (
                <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-yellow-800">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-bold mb-1">Final Verification</p>
                            <p>You are about to write <strong>{generatedClients.length}</strong> Clients and <strong>{generatedProjects.length}</strong> Projects directly into the live database. Review the sample below to ensure mappings are correct.</p>
                        </div>
                    </div>

                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-5 py-3 border-b border-border">
                            <h3 className="font-bold text-slate-800">Generated Projects Preview (First 5)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-border text-xs uppercase text-slate-500 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">Project Name</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Phases / Timelines</th>
                                        <th className="px-4 py-3">Features</th>
                                        <th className="px-4 py-3">Clients Linked</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {generatedProjects.slice(0, 5).map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={\`px-2 py-0.5 rounded text-xs font-bold \${p.projectStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}\`}>
                                                    {p.projectStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                <div>OB: {p.onboardingPhase || 'None'}</div>
                                                <div>TL: {p.timelineStatus || 'None'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                {p.features?.length > 0 ? p.features.join(', ') : 'None'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                {p.clientIds?.length} client(s)
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(4)} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-md font-semibold hover:bg-slate-50 transition-colors shadow-sm" disabled={isExecuting}>
                            Back to Map Clients
                        </button>
                        <button 
                            onClick={executeMigration} 
                            disabled={isExecuting}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-2.5 rounded-md font-bold hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExecuting ? 'Writing to Database...' : 'Run Migration to Database'} <Play className="w-4 h-4 fill-current" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
`;

fs.writeFileSync('src/components/NotionMigration.tsx', content);
