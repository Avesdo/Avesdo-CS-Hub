import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { UploadCloud, CheckCircle2, AlertCircle, Play, FileText, Database, Clock, Undo2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { doc, updateDoc, collection, writeBatch, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { toast } from '../../utils/toast';

type FileState = {
  file: File | null;
  parsedData: any[] | null;
  error: string | null;
};

export function DataUploader() {
  const projects = useAppStore(state => state.projects);
  const clients = useAppStore(state => state.clients);
  const user = useAppStore(state => state.user);

  const [satisfactionFile, setSatisfactionFile] = useState<FileState>({ file: null, parsedData: null, error: null });
  const [sessionsFile, setSessionsFile] = useState<FileState>({ file: null, parsedData: null, error: null });
  const [viewsFile, setViewsFile] = useState<FileState>({ file: null, parsedData: null, error: null });

  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<{ updated: number; intakes: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importLogs, setImportLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const q = query(collection(db, 'import_logs'), orderBy('timestamp', 'desc'), limit(5));
      const snap = await getDocs(q);
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setImportLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const undoCompilation = async (log: any) => {
    if (!window.confirm('Are you sure you want to undo this compilation? This will revert all updated metrics to their previous states.')) return;
    
    try {
      const batch = writeBatch(db);
      for (const mapping of log.mappings || []) {
        if (mapping.type === 'project') {
          batch.update(doc(db, 'projects', mapping.targetId), mapping.previousState);
        } else if (mapping.type === 'client') {
          batch.update(doc(db, 'clients', mapping.targetId), mapping.previousState);
        }
      }
      batch.delete(doc(db, 'import_logs', log.id));
      await batch.commit();
      
      toast.success('Compilation undone successfully');
      fetchLogs();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to undo: ' + err.message);
    }
  };

  const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.name.endsWith('.csv')) {
        toast.error(`${file.name} is not a CSV file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const result = Papa.parse(text, { header: true, skipEmptyLines: true });
          
          const lowerName = file.name.toLowerCase();
          if (lowerName.includes('satisfaction') || lowerName.includes('customer') || lowerName.includes('happyfox') || lowerName.includes('csat')) {
            setSatisfactionFile({ file, parsedData: result.data, error: null });
          } else if (lowerName.includes('sessions')) {
            setSessionsFile({ file, parsedData: result.data, error: null });
          } else if (lowerName.includes('views') || lowerName.includes('pageviews') || lowerName.includes('pages')) {
            setViewsFile({ file, parsedData: result.data, error: null });
          } else {
            toast.error(`Unrecognized file: ${file.name}. Ensure the filename contains "satisfaction", "sessions", or "views".`);
          }
          
        } catch (err: any) {
          toast.error(`Error parsing ${file.name}: ${err.message}`);
        }
      };
      reader.readAsText(file);
    });
  };

  const getAvg = (row: any) => {
    const monthsToAvg = ['Apr 1, 2026', 'May 1, 2026', 'Jun 1, 2026'];
    let sum = 0;
    let count = 0;
    for (const m of monthsToAvg) {
      if (row[m] !== undefined && !isNaN(parseInt(row[m]))) {
        sum += parseInt(row[m]);
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  };

  const runCompiler = async () => {
    setIsCompiling(true);
    setCompileResult(null);
    let updateCount = 0;
    let aliasesAdded = 0;
    const batch = writeBatch(db);
    const mappings: any[] = [];

    try {
      const aliasesSnapshot = await getDocs(collection(db, 'aliases'));
      const aliases = aliasesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));

      // 1. Process Userpilot Data
      if (sessionsFile.parsedData && viewsFile.parsedData) {
        const sessionsData = sessionsFile.parsedData;
        const viewsData = viewsFile.parsedData;

        const uniqueIDs = new Set([...sessionsData.map(r => String(r.ID)), ...viewsData.map(r => String(r.ID))].filter(id => id && id !== 'undefined' && id !== 'null_prod'));

        for (const id of Array.from(uniqueIDs)) {
          let targetProject = projects.find(p => p.developmentId && p.developmentId + '_prod' === id);
          if (!targetProject) {
            const aliasMatch = aliases.find((a: any) => a.rawName === id && a.status === 'resolved' && a.type === 'project');
            if (aliasMatch) {
              targetProject = projects.find(p => p.id === aliasMatch.targetId);
            }
          }

          if (targetProject) {
            const projSessions = sessionsData.filter(r => String(r.ID) === id && r.Email);
            let activeUsersCount = 0;
            let totalSessionsOfActiveUsers = 0;

            for (const r of projSessions) {
              const avgSessions = getAvg(r);
              if (avgSessions > 0) {
                activeUsersCount++;
                totalSessionsOfActiveUsers += avgSessions;
              }
            }
            const avgSessionsPerUser = activeUsersCount > 0 ? totalSessionsOfActiveUsers / activeUsersCount : 0;

            let userVolScore = 0;
            if (activeUsersCount >= 5) userVolScore += 50;
            else if (activeUsersCount >= 3) userVolScore += 35;
            else if (activeUsersCount >= 1) userVolScore += 15;

            if (avgSessionsPerUser >= 10) userVolScore += 50;
            else if (avgSessionsPerUser >= 4) userVolScore += 35;
            else if (avgSessionsPerUser >= 1) userVolScore += 15;

            const projViews = viewsData.filter(r => String(r.ID) === id && r['Tagged Page'] && r['Tagged Page'] !== 'Untagged Pages');
            let distinctFeatures = 0;
            let totalPageViews = 0;

            for (const r of projViews) {
              const avgViews = getAvg(r);
              if (avgViews > 0) {
                distinctFeatures++;
                totalPageViews += avgViews;
              }
            }
            const untaggedViewsRow = viewsData.find(r => String(r.ID) === id && r['Tagged Page'] === 'Untagged Pages');
            if (untaggedViewsRow) {
              totalPageViews += getAvg(untaggedViewsRow);
            }

            let opActivityScore = 0;
            if (distinctFeatures >= 4) opActivityScore += 50;
            else if (distinctFeatures >= 2) opActivityScore += 35;
            else if (distinctFeatures >= 1) opActivityScore += 15;

            if (
              targetProject.userVol !== userVolScore ||
              targetProject.opActivity !== opActivityScore ||
              targetProject.activeUserCount !== activeUsersCount ||
              targetProject.eventCount !== totalPageViews
            ) {
              await updateDoc(doc(db, 'projects', targetProject.id), {
                userVol: userVolScore,
                opActivity: opActivityScore,
                activeUserCount: activeUsersCount,
                eventCount: totalPageViews
              });
              
              mappings.push({
                rawName: id,
                type: 'project',
                targetId: targetProject.id,
                targetName: targetProject.name,
                previousState: {
                  userVol: targetProject.userVol,
                  opActivity: targetProject.opActivity,
                  activeUserCount: targetProject.activeUserCount,
                  eventCount: targetProject.eventCount
                }
              });
              
              updateCount++;
            }
          } else {
            const aliasExists = aliases.some((a: any) => a.rawName === id);
            if (!aliasExists) {
              const newAliasRef = doc(collection(db, 'aliases'));
              batch.set(newAliasRef, {
                type: 'project',
                rawName: id,
                targetId: '',
                status: 'pending_approval',
                contextName: 'Userpilot'
              });
              aliasesAdded++;
            }
          }
        }
      }

      // 2. Process Satisfaction Report
      if (satisfactionFile.parsedData) {
        for (const row of satisfactionFile.parsedData) {
          const feedbackReceived = parseInt(row['Feedback Received'], 10) || 0;
          if (feedbackReceived > 0) {
            const rawName = row['Customer Name'] || 'Unknown Customer';
            const happy = parseInt(row['Happy'], 10) || 0;
            const csat = Math.round((happy / feedbackReceived) * 100);

            let targetClient = clients.find(c => c.companyName && c.companyName.toLowerCase() === rawName.toLowerCase());
            if (!targetClient) {
              const aliasMatch = aliases.find((a: any) => a.rawName === rawName && a.status === 'resolved' && a.type === 'client');
              if (aliasMatch) {
                targetClient = clients.find(c => c.clientId === aliasMatch.targetId || c.id === aliasMatch.targetId);
              }
            }

            if (targetClient) {
              if (targetClient.clientCsat !== csat) {
                await updateDoc(doc(db, 'clients', targetClient.clientId || targetClient.id), {
                  clientCsat: csat
                });
                
                mappings.push({
                  rawName: rawName,
                  type: 'client',
                  targetId: targetClient.clientId || targetClient.id,
                  targetName: targetClient.companyName,
                  previousState: {
                    clientCsat: targetClient.clientCsat
                  }
                });
                
                updateCount++;
              }
            } else {
              const aliasExists = aliases.some((a: any) => a.rawName === rawName);
              if (!aliasExists) {
                const newAliasRef = doc(collection(db, 'aliases'));
                batch.set(newAliasRef, {
                  type: 'client',
                  rawName: rawName,
                  targetId: '',
                  status: 'pending_approval',
                  contextName: 'Satisfaction Report'
                });
                aliasesAdded++;
              }
            }
          }
        }
      }

      if (updateCount > 0 || aliasesAdded > 0) {
        const logRef = doc(collection(db, 'import_logs'));
        const fileNames = [];
        if (sessionsFile.file) fileNames.push('Userpilot Sessions');
        if (viewsFile.file) fileNames.push('Userpilot Page Views');
        if (satisfactionFile.file) fileNames.push('Happyfox Support CSAT');
        
        batch.set(logRef, {
          timestamp: new Date().getTime(),
          uploadedBy: user?.name || 'System',
          fileNames: fileNames,
          autoProcessedCount: updateCount,
          sentForReviewCount: aliasesAdded,
          mappings: mappings
        });
        
        await batch.commit();
      }

      setCompileResult({ updated: updateCount, intakes: aliasesAdded });
      toast.success('Compilation successful');
      
      // Reset forms
      setSatisfactionFile({ file: null, parsedData: null, error: null });
      setSessionsFile({ file: null, parsedData: null, error: null });
      setViewsFile({ file: null, parsedData: null, error: null });

    } catch (err: any) {
      console.error(err);
      toast.error('Compiler error: ' + err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  const isReadyToCompile = satisfactionFile.parsedData || sessionsFile.parsedData || viewsFile.parsedData;

  const renderFileStatus = (title: string, fileState: FileState) => {
    const isSuccess = !!fileState.file;
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${isSuccess ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-center gap-3">
          {isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-dashed" />}
          <span className={`text-sm font-medium ${isSuccess ? 'text-emerald-900' : 'text-slate-500'}`}>{title}</span>
        </div>
        {isSuccess && <span className="text-xs font-bold text-emerald-600/80">{fileState.parsedData?.length || 0} rows</span>}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Database className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Data Compiler</h3>
          <p className="text-sm text-slate-500">
            Upload your CSV exports to automatically update Firestore metrics.
          </p>
        </div>
      </div>

      {compileResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-800">Compilation Complete!</h3>
            <p className="text-sm text-green-700 mt-1">
              Updated <strong>{compileResult.updated}</strong> target metrics and pushed <strong>{compileResult.intakes}</strong> unrecognized entries to the Data Intake pipeline.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Required Data Exports
        </h3>
        <div className="flex flex-col gap-4">
          {renderSingleDropzone()}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {renderFileStatus('Satisfaction Report', satisfactionFile)}
            {renderFileStatus('Userpilot Sessions', sessionsFile)}
            {renderFileStatus('Userpilot Page Views', viewsFile)}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-200">
        <button
          onClick={async () => {
            try {
              setIsCompiling(true);
              const { generateDailyHealthSnapshots } = await import('../../api/snapshotService');
              await generateDailyHealthSnapshots();
              toast.success('Snapshots generated successfully');
            } catch (err: any) {
              toast.error('Failed to generate snapshots: ' + err.message);
            } finally {
              setIsCompiling(false);
            }
          }}
          disabled={isCompiling}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-colors"
        >
          <Database className="w-4 h-4" />
          Force Generate Daily Snapshots
        </button>

        <button
          disabled={!isReadyToCompile || isCompiling}
          onClick={runCompiler}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
        >
          {isCompiling ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-[#00bdd9] rounded-full animate-spin" />
              Compiling Data...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run Compiler
            </>
          )}
        </button>
      </div>
    </div>
  );
}
