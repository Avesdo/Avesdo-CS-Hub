import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  Database,
  CircleDashed,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { doc, updateDoc, collection, writeBatch, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { toast } from '../../utils/toast';

type FileState = {
  file: File | null;
  parsedData: any[] | null;
  error: string | null;
};

export function DataUploader() {
  const projects = useAppStore((state) => state.projects);
  const clients = useAppStore((state) => state.clients);
  const user = useAppStore((state) => state.user);

  const [satisfactionFile, setSatisfactionFile] = useState<FileState>({
    file: null,
    parsedData: null,
    error: null,
  });
  const [sessionsFile, setSessionsFile] = useState<FileState>({
    file: null,
    parsedData: null,
    error: null,
  });
  const [viewsFile, setViewsFile] = useState<FileState>({
    file: null,
    parsedData: null,
    error: null,
  });

  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<{ updated: number; intakes: number } | null>(
    null
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.name.endsWith('.csv')) {
        toast.error(`${file.name} is not a CSV file.`);
        return;
      }

      // Guess type based on file name
      let type: 'satisfaction' | 'sessions' | 'views' | null = null;
      if (
        file.name.toLowerCase().includes('satisfaction') ||
        file.name.toLowerCase().includes('customer')
      ) {
        type = 'satisfaction';
      } else if (file.name.toLowerCase().includes('sessions')) {
        type = 'sessions';
      } else if (file.name.toLowerCase().includes('views')) {
        type = 'views';
      } else {
        toast.error(
          `Could not determine report type for ${file.name}. Please ensure filename contains 'satisfaction', 'sessions', or 'views'.`
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const result = Papa.parse(text, { header: true, skipEmptyLines: true });

          if (type === 'satisfaction')
            setSatisfactionFile({ file, parsedData: result.data, error: null });
          if (type === 'sessions') setSessionsFile({ file, parsedData: result.data, error: null });
          if (type === 'views') setViewsFile({ file, parsedData: result.data, error: null });
        } catch (err: any) {
          if (type === 'satisfaction')
            setSatisfactionFile({ file, parsedData: null, error: err.message });
          if (type === 'sessions') setSessionsFile({ file, parsedData: null, error: err.message });
          if (type === 'views') setViewsFile({ file, parsedData: null, error: err.message });
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
    const autoProcessedMap = new Map();

    try {
      const aliasesSnapshot = await getDocs(collection(db, 'aliases'));
      const aliases = aliasesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as any);

      // 1. Process Userpilot Data
      if (sessionsFile.parsedData && viewsFile.parsedData) {
        const sessionsData = sessionsFile.parsedData;
        const viewsData = viewsFile.parsedData;

        const uniqueIDs = new Set(
          [...sessionsData.map((r) => String(r.ID)), ...viewsData.map((r) => String(r.ID))].filter(
            (id) => id && id !== 'undefined' && id !== 'null_prod'
          )
        );

        for (const id of Array.from(uniqueIDs)) {
          let targetProject = projects.find(
            (p) => p.developmentId && p.developmentId + '_prod' === id
          );
          if (!targetProject) {
            const aliasMatch = aliases.find(
              (a: any) =>
                a.rawName === id &&
                (a.status === 'resolved' || a.status === 'verified') &&
                a.type === 'project'
            );
            if (aliasMatch) {
              targetProject = projects.find((p) => p.id === aliasMatch.targetId);
              if (targetProject) {
                autoProcessedMap.set(aliasMatch.id, {
                  id: aliasMatch.id,
                  type: 'project',
                  rawName: aliasMatch.rawName,
                  targetId: aliasMatch.targetId,
                  targetName: targetProject.name,
                  contextName: aliasMatch.contextName,
                  timestamp: new Date().getTime(),
                });
              }
            }
          }

          if (targetProject) {
            const projSessions = sessionsData.filter((r) => String(r.ID) === id && r.Email);
            let activeUsersCount = 0;
            let totalSessionsOfActiveUsers = 0;

            for (const r of projSessions) {
              const avgSessions = getAvg(r);
              if (avgSessions > 0) {
                activeUsersCount++;
                totalSessionsOfActiveUsers += avgSessions;
              }
            }
            const avgSessionsPerUser =
              activeUsersCount > 0 ? totalSessionsOfActiveUsers / activeUsersCount : 0;

            let userVolScore = 0;
            if (activeUsersCount >= 5) userVolScore += 50;
            else if (activeUsersCount >= 3) userVolScore += 35;
            else if (activeUsersCount >= 1) userVolScore += 15;

            if (avgSessionsPerUser >= 10) userVolScore += 50;
            else if (avgSessionsPerUser >= 4) userVolScore += 35;
            else if (avgSessionsPerUser >= 1) userVolScore += 15;

            const projViews = viewsData.filter(
              (r) =>
                String(r.ID) === id && r['Tagged Page'] && r['Tagged Page'] !== 'Untagged Pages'
            );
            let distinctFeatures = 0;
            let totalPageViews = 0;

            for (const r of projViews) {
              const avgViews = getAvg(r);
              if (avgViews > 0) {
                distinctFeatures++;
                totalPageViews += avgViews;
              }
            }
            const untaggedViewsRow = viewsData.find(
              (r) => String(r.ID) === id && r['Tagged Page'] === 'Untagged Pages'
            );
            if (untaggedViewsRow) {
              totalPageViews += getAvg(untaggedViewsRow);
            }

            let opActivityScore = 0;
            if (distinctFeatures >= 4) opActivityScore += 50;
            else if (distinctFeatures >= 2) opActivityScore += 35;
            else if (distinctFeatures >= 1) opActivityScore += 15;

            if (totalPageViews >= 200) opActivityScore += 50;
            else if (totalPageViews >= 100) opActivityScore += 35;
            else if (totalPageViews >= 25) opActivityScore += 15;

            const avgSessions = parseFloat(avgSessionsPerUser.toFixed(1));

            if (
              targetProject.userVol !== userVolScore ||
              targetProject.opActivity !== opActivityScore ||
              targetProject.activeUserCount !== activeUsersCount ||
              targetProject.eventCount !== totalPageViews ||
              targetProject.avgSessions !== avgSessions
            ) {
              await updateDoc(doc(db, 'projects', targetProject.id), {
                userVol: userVolScore,
                opActivity: opActivityScore,
                activeUserCount: activeUsersCount,
                eventCount: totalPageViews,
                avgSessions: avgSessions,
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
                contextName: 'Userpilot',
              });
              aliasesAdded++;
            }
          }
        }
      }

      // 2. Process Satisfaction Report
      if (satisfactionFile.parsedData) {
        const aggregatedCsat = new Map<string, any>();

        for (const row of satisfactionFile.parsedData) {
          const feedbackReceived = parseInt(row['Feedback Received'], 10) || 0;
          if (feedbackReceived > 0) {
            const rawName = row['Customer Name'] || 'Unknown Customer';
            const happy = parseInt(row['Happy'], 10) || 0;
            const neutral = parseInt(row['Neutral'] || row['Passive'], 10) || 0;
            const unhappy = parseInt(row['Unhappy'] || row['Detractor'], 10) || 0;

            if (!aggregatedCsat.has(rawName)) {
              aggregatedCsat.set(rawName, { feedback: 0, happy: 0, neutral: 0, unhappy: 0 });
            }
            const existing = aggregatedCsat.get(rawName);
            existing.feedback += feedbackReceived;
            existing.happy += happy;
            existing.neutral += neutral;
            existing.unhappy += unhappy;
          }
        }

        for (const [rawName, data] of aggregatedCsat.entries()) {
          const csat = Math.round((data.happy / data.feedback) * 100);
          
          let targetClient = clients.find(
            (c) => c.companyName && c.companyName.toLowerCase() === rawName.toLowerCase()
          );
          if (!targetClient) {
            const aliasMatch = aliases.find(
              (a: any) =>
                a.rawName === rawName &&
                (a.status === 'resolved' || a.status === 'verified') &&
                a.type === 'client'
            );
            if (aliasMatch) {
              targetClient = clients.find(
                (c) => c.clientId === aliasMatch.targetId || c.id === aliasMatch.targetId
              );
              if (targetClient) {
                autoProcessedMap.set(aliasMatch.id, {
                  id: aliasMatch.id,
                  type: 'client',
                  rawName: aliasMatch.rawName,
                  targetId: aliasMatch.targetId,
                  targetName: targetClient.companyName || targetClient.name,
                  contextName: aliasMatch.contextName,
                  timestamp: new Date().getTime(),
                });
              }
            }
          }

          if (targetClient) {
            const supportCsatObj = {
              score: csat,
              totalUsers: data.feedback,
              promoters: data.happy,
              passives: data.neutral,
              detractors: data.unhappy
            };
            
            // Compare existing to save writes
            const existingObj = targetClient.supportCsat;
            let needsUpdate = false;
            if (!existingObj) needsUpdate = true;
            else {
              if (existingObj.score !== supportCsatObj.score || 
                  existingObj.totalUsers !== supportCsatObj.totalUsers ||
                  existingObj.promoters !== supportCsatObj.promoters ||
                  existingObj.passives !== supportCsatObj.passives ||
                  existingObj.detractors !== supportCsatObj.detractors) {
                needsUpdate = true;
              }
            }

            if (needsUpdate) {
              await updateDoc(doc(db, 'clients', targetClient.clientId || targetClient.id), {
                supportCsat: supportCsatObj,
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
                contextName: 'Satisfaction Report',
              });
              aliasesAdded++;
            }
          }
        }
      }

      if (aliasesAdded > 0) {
        await batch.commit();
      }

      // Save upload log to system_logs
      const logId = crypto.randomUUID();
      const filesUploaded = [
        satisfactionFile.file?.name,
        sessionsFile.file?.name,
        viewsFile.file?.name,
      ]
        .filter(Boolean)
        .join(', ');

      let uploadedTypes = [];
      if (satisfactionFile.file) uploadedTypes.push('Happyfox Support CSAT');
      if (sessionsFile.file) uploadedTypes.push('Userpilot Sessions');
      if (viewsFile.file) uploadedTypes.push('Userpilot Page Views');
      
      const formattedEntityName = uploadedTypes.join(', ');

      const logData = {
        id: logId,
        action: 'Data Import',
        entityType: 'Upload',
        entityId: 'upload',
        entityName: formattedEntityName || 'Multiple Files',
        timestamp: new Date().getTime(),
        author: user?.name || user?.email || 'System',
        autoProcessed: Array.from(autoProcessedMap.values()).map(item => ({
          ...item,
          targetName: item.targetName || 'Unknown',
          contextName: item.contextName || 'Unknown',
        })),
        updatedMetrics: updateCount,
        sentForReview: aliasesAdded,
      };

      // Strip any lingering undefined values to prevent Firebase crash
      const sanitizedLogData = JSON.parse(JSON.stringify(logData));

      await setDoc(doc(db, 'system_logs', logId), sanitizedLogData);

      setCompileResult({ updated: updateCount, intakes: aliasesAdded });
      toast.success('Compilation successful');
      window.dispatchEvent(new Event('pipeline-updated'));

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

  const isReadyToCompile =
    satisfactionFile.parsedData || sessionsFile.parsedData || viewsFile.parsedData;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {compileResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-800">Compilation Complete!</h3>
            <p className="text-sm text-green-700 mt-1">
              Updated <strong>{compileResult.updated}</strong> target metrics and pushed{' '}
              <strong>{compileResult.intakes}</strong> unrecognized entries to the Data Intake
              pipeline.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Upload Section Group */}
          <div>
            {/* Single Row Sleek Modern Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 group h-12">
                <input
                  type="file"
                  accept=".csv"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Drag & Drop CSV files here or click to browse"
                />
                <div className="flex items-center justify-start px-4 gap-2 h-full bg-slate-50 border border-slate-200 border-dashed rounded-lg text-sm font-medium text-slate-600 transition-all group-hover:border-primary/50 group-hover:bg-slate-100 group-hover:text-primary shadow-sm hover:border-solid">
                  <UploadCloud className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  Drop or Select CSV Data Files
                </div>
              </div>

              <button
                disabled={!isReadyToCompile || isCompiling}
                onClick={runCompiler}
                className="flex items-center justify-center gap-2 px-8 h-12 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95 shrink-0"
              >
                {isCompiling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Run Compiler
                  </>
                )}
              </button>
            </div>

            {/* Note about filenames required */}
            <p className="text-[11px] text-slate-400 px-1 mt-1.5">
              <strong>Required CSV Filenames:</strong> To automatically parse your data, ensure your
              filenames contain the corresponding keywords:
              <span className="font-medium text-slate-500 mx-1">"satisfaction"</span> (or
              "customer"),
              <span className="font-medium text-slate-500 mx-1">"sessions"</span>, and
              <span className="font-medium text-slate-500 ml-1">"views"</span>.
            </p>
          </div>

          {/* Three fields tracking progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {[
              { key: 'satisfaction', label: 'Happyfox Support CSAT', data: satisfactionFile },
              { key: 'sessions', label: 'Userpilot Sessions', data: sessionsFile },
              { key: 'views', label: 'Userpilot Page Views', data: viewsFile },
            ].map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-all"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${f.data.parsedData ? 'bg-emerald-50' : f.data.error ? 'bg-red-50' : 'bg-slate-50 border border-slate-200 border-dashed'}`}
                >
                  {f.data.parsedData ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : f.data.error ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate transition-colors leading-tight ${f.data.file ? 'text-slate-800' : 'text-slate-400'}`}
                  >
                    {f.label}
                  </p>
                  {(f.data.parsedData || f.data.error || f.data.file) && (
                    <div className="mt-0.5">
                      {f.data.parsedData ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          {f.data.parsedData.length} rows parsed
                        </span>
                      ) : f.data.error ? (
                        <span
                          className="text-[10px] font-medium text-red-600 truncate block"
                          title={f.data.error}
                        >
                          Error parsing file
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 truncate block">
                          {f.data.file?.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
