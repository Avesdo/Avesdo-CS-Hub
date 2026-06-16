import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, CheckCircle2, AlertCircle, Play, FileText, Database } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { doc, updateDoc, collection, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { toast } from '../../utils/toast';

type FileState = {
  file: File | null;
  parsedData: any[] | null;
  error: string | null;
};

export function DataUploader() {
  const { projects, clients } = useAppState();

  const [satisfactionFile, setSatisfactionFile] = useState<FileState>({ file: null, parsedData: null, error: null });
  const [sessionsFile, setSessionsFile] = useState<FileState>({ file: null, parsedData: null, error: null });
  const [viewsFile, setViewsFile] = useState<FileState>({ file: null, parsedData: null, error: null });

  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<{ updated: number; intakes: number } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'satisfaction' | 'sessions' | 'views') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Only CSV files are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        
        if (type === 'satisfaction') setSatisfactionFile({ file, parsedData: result.data, error: null });
        if (type === 'sessions') setSessionsFile({ file, parsedData: result.data, error: null });
        if (type === 'views') setViewsFile({ file, parsedData: result.data, error: null });
        
      } catch (err: any) {
        if (type === 'satisfaction') setSatisfactionFile({ file, parsedData: null, error: err.message });
        if (type === 'sessions') setSessionsFile({ file, parsedData: null, error: err.message });
        if (type === 'views') setViewsFile({ file, parsedData: null, error: err.message });
      }
    };
    reader.readAsText(file);
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

            if (targetProject.userVol !== userVolScore || targetProject.opActivity !== opActivityScore) {
              await updateDoc(doc(db, 'projects', targetProject.id), {
                userVol: userVolScore,
                opActivity: opActivityScore
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

      if (aliasesAdded > 0) {
        await batch.commit();
      }

      setCompileResult({ updated: updateCount, intakes: aliasesAdded });
      toast.success('Compilation successful!');
      
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

  const isReadyToCompile = satisfactionFile.parsedData || (sessionsFile.parsedData && viewsFile.parsedData);

  const renderDropzone = (
    title: string,
    fileState: FileState,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    accept: string = ".csv"
  ) => {
    return (
      <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer h-32">
        <input 
          type="file" 
          accept={accept}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        {fileState.file ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-slate-800">{fileState.file.name}</span>
            <span className="text-xs text-slate-500">{fileState.parsedData?.length || 0} rows parsed</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-slate-400 mb-2 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-slate-600">{title}</span>
            <span className="text-xs text-slate-400 mt-1">Click or drag CSV here</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Data Compiler</h2>
          <p className="text-sm text-slate-500">Upload your CSV exports to automatically update Firestore metrics.</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Customer Satisfaction
          </h3>
          {renderDropzone('Satisfaction Report - Customer.csv', satisfactionFile, (e) => handleFileUpload(e, 'satisfaction'))}
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Userpilot Analytics (Requires Both)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderDropzone('Userpilot_Sessions Started.csv', sessionsFile, (e) => handleFileUpload(e, 'sessions'))}
            {renderDropzone('Userpilot_Page Views.csv', viewsFile, (e) => handleFileUpload(e, 'views'))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          disabled={!isReadyToCompile || isCompiling}
          onClick={runCompiler}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
        >
          {isCompiling ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
