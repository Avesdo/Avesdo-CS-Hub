import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Play,
  Server,
  FileText,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { db } from '../api/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { toast } from '../utils/toast';

export default function NotionMigration() {
  const { settings } = useAppState();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [csvData, setCsvData] = useState<any[]>([]);

  // Extracted Unique Values
  const [uniqueServices, setUniqueServices] = useState<string[]>([]);
  const [uniqueOnboarding, setUniqueOnboarding] = useState<string[]>([]);
  const [uniqueTimelines, setUniqueTimelines] = useState<string[]>([]);
  const [uniqueClients, setUniqueClients] = useState<string[]>([]);

  // Mappings
  const [serviceMapping, setServiceMapping] = useState<Record<string, string>>({});
  const [onboardingMapping, setOnboardingMapping] = useState<Record<string, string>>({});
  const [timelineMapping, setTimelineMapping] = useState<Record<string, string>>({});
  const [clientMapping, setClientMapping] = useState<
    Record<string, { type: 'Developer' | 'Sales & Marketing'; finalName: string }>
  >({});

  // Payloads
  const [generatedClients, setGeneratedClients] = useState<any[]>([]);
  const [generatedProjects, setGeneratedProjects] = useState<any[]>([]);

  const [isExecuting, setIsExecuting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        setCsvData(data);

        // Extract unique values
        const sSet = new Set<string>();
        const oSet = new Set<string>();
        const tSet = new Set<string>();
        const cSet = new Set<string>();

        data.forEach((row) => {
          if (row['Services']) {
            row['Services'].split(',').forEach((s: string) => sSet.add(s.trim()));
          }
          if (row['Onboarding Status']) oSet.add(row['Onboarding Status'].trim());
          if (row['Project Status']) tSet.add(row['Project Status'].trim());
          if (row['Developer/Sales']) {
            row['Developer/Sales'].split(',').forEach((c: string) => cSet.add(c.trim()));
          }
        });

        setUniqueServices(Array.from(sSet).filter(Boolean));
        setUniqueOnboarding(Array.from(oSet).filter(Boolean));
        setUniqueTimelines(Array.from(tSet).filter(Boolean));
        setUniqueClients(Array.from(cSet).filter(Boolean));

        // Initialize empty mappings
        const cMap: any = {};
        Array.from(cSet)
          .filter(Boolean)
          .forEach((c) => {
            cMap[c] = { type: 'Developer', finalName: c };
          });
        setClientMapping(cMap);

        setStep(2);
      },
    });
  };

  const generatePayloads = () => {
    const newClients: any[] = [];
    const newProjects: any[] = [];

    // Build Clients
    Object.entries(clientMapping).forEach(([rawName, mapData]) => {
      newClients.push({
        clientId: `C-${new Date().getTime()}-${Math.floor(Math.random() * 10000)}`,
        companyName: mapData.finalName,
        clientType: mapData.type,
        csatScore: 'N/A',
        financialStanding: 'N/A',
        createdAt: new Date().toISOString(),
      });
    });

    // Build Projects
    csvData.forEach((row, i) => {
      const rawProjectName = row['Project Name'] || `Unnamed Project ${i}`;
      const rawAssignee = row['Assignee'] || 'Unassigned';
      const rawChecklist = row['Deliverable Checklist'] || '';
      const rawNotes = row['Notes'] || '';
      const rawReleaseDate = row['Release Date'] || '';
      const rawUnits = row['Units'] ? parseInt(row['Units'].replace(/,/g, ''), 10) : 0;
      const rawServices = row['Services']
        ? row['Services'].split(',').map((s: string) => s.trim())
        : [];
      const rawOnboarding = row['Onboarding Status']?.trim() || '';
      const rawTimeline = row['Project Status']?.trim() || '';
      const rawClients = row['Developer/Sales']
        ? row['Developer/Sales'].split(',').map((c: string) => c.trim())
        : [];

      const resolveMapping = (rawVal: string, mapping: Record<string, string>) => {
        const mapped = mapping[rawVal];
        if (!mapped) return rawVal;
        if (mapped.startsWith('__CUSTOM__:')) return mapped.replace('__CUSTOM__:', '').trim();
        return mapped;
      };

      const mappedFeatures = rawServices
        .map((s: string) => resolveMapping(s, serviceMapping))
        .filter(Boolean);
      const mappedOnboarding = resolveMapping(rawOnboarding, onboardingMapping);
      const mappedTimeline = resolveMapping(rawTimeline, timelineMapping);

      // Enforce Project Status Logic: if mapped onboarding phase contains 'Release', it's Active.
      const pStatus = mappedOnboarding.toLowerCase().includes('release') ? 'Active' : 'Onboarding';

      const projectClientIds = rawClients
        .map((rc: string) => {
          const found = newClients.find((c) => c.companyName === clientMapping[rc]?.finalName);
          return found ? found.clientId : null;
        })
        .filter(Boolean);

      const notesArr = rawNotes
        ? [
            {
              id: `note-${Date.now()}-${Math.random()}`,
              text: `Notion Import Note: ${rawNotes}`,
              date: new Date().toISOString(),
              author: 'System Import',
            },
          ]
        : [];

      newProjects.push({
        id: `P-${new Date().getTime()}-${i}`,
        name: rawProjectName,
        assignee: rawAssignee,
        projectStatus: pStatus,
        timelineStatus: mappedTimeline,
        onboardingMilestone: mappedOnboarding,
        features: mappedFeatures,
        units: isNaN(rawUnits) ? 0 : rawUnits,
        releaseDateStr: rawReleaseDate,
        checklistUrl: rawChecklist,
        clientIds: projectClientIds,
        notes: notesArr,
        createdAt: new Date().toISOString(),
      });
    });

    setGeneratedClients(newClients);
    setGeneratedProjects(newProjects);
    setStep(4);
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
        ...generatedClients.map((c) => ({
          ref: doc(collection(db, 'clients'), c.clientId),
          data: c,
        })),
        ...generatedProjects.map((p) => ({ ref: doc(collection(db, 'projects'), p.id), data: p })),
      ];

      const batches = chunks(allOperations, 450); // Safe batch size below 500

      for (let i = 0; i < batches.length; i++) {
        const batch = writeBatch(db);
        batches[i].forEach((op) => {
          batch.set(op.ref, op.data);
        });
        await batch.commit();
      }

      toast.success(
        'Migration Complete!',
        `Successfully imported ${generatedClients.length} clients and ${generatedProjects.length} projects.`
      );
      setStep(1);
      setCsvData([]);
      setGeneratedClients([]);
      setGeneratedProjects([]);
    } catch (error) {
      console.error(error);
      toast.error('Migration Failed', 'Check the console for errors.');
    } finally {
      setIsExecuting(false);
    }
  };

  const renderMappingSelect = (
    rawVal: string,
    mappingState: Record<string, string>,
    setMappingState: any,
    options: string[]
  ) => {
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
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="__CUSTOM__">+ Edit / Create Custom Mapping...</option>
          </select>
          {isCustom && (
            <input
              type="text"
              placeholder="Type new custom mapping value..."
              value={customValue}
              onChange={(e) =>
                setMappingState({ ...mappingState, [rawVal]: `__CUSTOM__:${e.target.value}` })
              }
              className="w-full py-1.5 px-3 border border-indigo-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50"
              autoFocus
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 pb-12">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-500" /> Notion Data Migration
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Safely map and import your one-time CSV export from Notion.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 bg-slate-50 p-3 rounded-lg border border-border">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}
            >
              {s}
            </div>
            {s < 4 && (
              <div className={`flex-1 h-1 ${step > s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Upload Notion CSV</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6 max-w-md">
            Drag and drop the `notion_export.csv` file here, or click to browse. The file will be
            parsed locally in your browser.
          </p>
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm">
            Select CSV File
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-5 py-3 border-b border-border">
              <h3 className="font-bold text-slate-800">Map Features / Services</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Map unique CSV values to official Hub features. This maps ALL instances across your
                700+ projects at once.
              </p>
            </div>
            <div className="p-5">
              {uniqueServices.map((val) =>
                renderMappingSelect(
                  val,
                  serviceMapping,
                  setServiceMapping,
                  settings?.features || []
                )
              )}
            </div>
          </div>
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-5 py-3 border-b border-border">
              <h3 className="font-bold text-slate-800">Map Onboarding Phases</h3>
            </div>
            <div className="p-5">
              {uniqueOnboarding.map((val) =>
                renderMappingSelect(
                  val,
                  onboardingMapping,
                  setOnboardingMapping,
                  (settings?.phases || []).map((p: any) => p.name)
                )
              )}
            </div>
          </div>
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-5 py-3 border-b border-border">
              <h3 className="font-bold text-slate-800">Map Timeline Statuses</h3>
            </div>
            <div className="p-5">
              {uniqueTimelines.map((val) =>
                renderMappingSelect(
                  val,
                  timelineMapping,
                  setTimelineMapping,
                  (settings?.timelines || []).map((t: any) => t.name)
                )
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-5 py-3 border-b border-border">
              <h3 className="font-bold text-slate-800">Map Clients</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Define whether each extracted client is a Developer or Sales & Marketing entity. You
                can also correct typos (e.g. rename "Avesdo" to "Avesdo Tech"), and it will apply
                globally to all projects assigned to that client.
              </p>
            </div>
            <div className="p-5 divide-y divide-border/50">
              {uniqueClients.map((rawName) => (
                <div key={rawName} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3">
                  <div className="w-1/3 text-sm font-medium text-slate-700 break-all">
                    {rawName}
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="text"
                      value={clientMapping[rawName]?.finalName || ''}
                      onChange={(e) =>
                        setClientMapping({
                          ...clientMapping,
                          [rawName]: { ...clientMapping[rawName], finalName: e.target.value },
                        })
                      }
                      className="flex-1 py-1.5 px-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    />
                    <select
                      value={clientMapping[rawName]?.type || 'Developer'}
                      onChange={(e) =>
                        setClientMapping({
                          ...clientMapping,
                          [rawName]: { ...clientMapping[rawName], type: e.target.value as any },
                        })
                      }
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
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-md font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              Back
            </button>
            <button
              onClick={generatePayloads}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Generate Preview <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-yellow-800">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">Final Verification</p>
              <p>
                You are about to write <strong>{generatedClients.length}</strong> Clients and{' '}
                <strong>{generatedProjects.length}</strong> Projects directly into the live
                database. Review the sample below to ensure mappings are correct.
              </p>
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
                    <th className="px-4 py-3">Milestones / Timelines</th>
                    <th className="px-4 py-3">Features</th>
                    <th className="px-4 py-3">Clients Linked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {generatedProjects.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${p.projectStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}
                        >
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
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-md font-semibold hover:bg-slate-50 transition-colors shadow-sm"
              disabled={isExecuting}
            >
              Back to Mapping
            </button>
            <button
              onClick={executeMigration}
              disabled={isExecuting}
              className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-2.5 rounded-md font-bold hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? 'Writing to Database...' : 'Run Migration to Database'}{' '}
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
