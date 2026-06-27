import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  Database,
  CircleDashed,
  Smile,
  Users,
  Activity,
  Info,
  Loader2,
  ThumbsUp,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { doc, updateDoc, collection, writeBatch, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { toast } from '../../utils/toast';
import { Tooltip } from '../ui/Tooltip';

type FileState = {
  file: File | null;
  parsedData: any[] | null;
  error: string | null;
};

type Props = {
  onCompileStateChange?: (isCompiling: boolean) => void;
};

export const DataUploader: React.FC<Props> = ({ onCompileStateChange }) => {
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
  const [npsFile, setNpsFile] = useState<FileState>({
    file: null,
    parsedData: null,
    error: null,
  });

  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState(0);
  const [compileResult, setCompileResult] = useState<{ updated: number; intakes: number } | null>(
    null
  );

  useEffect(() => {
    onCompileStateChange?.(isCompiling);
  }, [isCompiling, onCompileStateChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.name.endsWith('.csv')) {
        toast.error(`${file.name} is not a CSV file.`);
        return;
      }

      let type: 'satisfaction' | 'sessions' | 'views' | 'nps' | null = null;
      if (
        file.name.toLowerCase().includes('satisfaction') ||
        file.name.toLowerCase().includes('customer')
      ) {
        type = 'satisfaction';
      } else if (file.name.toLowerCase().includes('sessions')) {
        type = 'sessions';
      } else if (file.name.toLowerCase().includes('views')) {
        type = 'views';
      } else if (file.name.toLowerCase().includes('nps')) {
        type = 'nps';
      } else {
        toast.error(
          `Could not determine report type for ${file.name}. Please ensure filename contains 'satisfaction', 'sessions', 'views', or 'NPS'.`
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
          if (type === 'nps') setNpsFile({ file, parsedData: result.data, error: null });
        } catch (err: any) {
          if (type === 'satisfaction')
            setSatisfactionFile({ file, parsedData: null, error: err.message });
          if (type === 'sessions') setSessionsFile({ file, parsedData: null, error: err.message });
          if (type === 'views') setViewsFile({ file, parsedData: null, error: err.message });
          if (type === 'nps') setNpsFile({ file, parsedData: null, error: err.message });
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
    return count > 0 ? Math.round(sum / count) : 0;
  };

  const runCompiler = async () => {
    setIsCompiling(true);
    setCompileStep(1); // 1: Parsing
    try {
      await new Promise((r) => setTimeout(r, 600));
      setCompileStep(2); // 2: Resolving
      await new Promise((r) => setTimeout(r, 800));

      const batch = writeBatch(db);
      const autoProcessedMap = new Map();
      let updateCount = 0;
      let totalParsed = 0;
      let aliasesAdded = 0;

      const aliasesSnapshot = await getDocs(collection(db, 'aliases'));
      const aliases = aliasesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as any);

      const updatePromises: Promise<any>[] = [];

      // 1. Process Userpilot Data
      if (sessionsFile.parsedData || viewsFile.parsedData) {
        const sessionsData = sessionsFile.parsedData || [];
        const viewsData = viewsFile.parsedData || [];
        totalParsed += sessionsData.length + viewsData.length;

        const uniqueIDs = new Set(
          [
            ...sessionsData.map((r: any) => String(r.ID)),
            ...viewsData.map((r: any) => String(r.ID)),
          ].filter((id) => id && id !== 'undefined' && id !== 'null_prod')
        );

        for (const id of Array.from(uniqueIDs)) {
          let targetProject = projects.find(
            (p) => p.developmentId && p.developmentId + '_prod' === id
          );
          if (targetProject) {
            autoProcessedMap.set(`direct-${id}`, {
              id: `direct-${id}`,
              type: 'project',
              rawName: id,
              targetId: targetProject.id,
              targetName: targetProject.name,
              contextName: 'Userpilot (Direct Match)',
              timestamp: new Date().getTime(),
            });
          }

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
            let userVolScore = targetProject.userVol || 0;
            let activeUsersCount = targetProject.activeUserCount || 0;
            let avgSessionsPerUser = targetProject.avgSessions || 0;

            if (sessionsData.length > 0) {
              const projSessions = sessionsData.filter((r: any) => String(r.ID) === id && r.Email);
              activeUsersCount = 0;
              let totalSessionsOfActiveUsers = 0;

              for (const r of projSessions) {
                const avgSessions = getAvg(r);
                if (avgSessions > 0) {
                  activeUsersCount++;
                  totalSessionsOfActiveUsers += avgSessions;
                }
              }
              avgSessionsPerUser =
                activeUsersCount > 0 ? totalSessionsOfActiveUsers / activeUsersCount : 0;

              userVolScore = 0;
              if (activeUsersCount >= 5) userVolScore += 50;
              else if (activeUsersCount >= 3) userVolScore += 35;
              else if (activeUsersCount >= 1) userVolScore += 15;

              if (avgSessionsPerUser >= 10) userVolScore += 50;
              else if (avgSessionsPerUser >= 4) userVolScore += 35;
              else if (avgSessionsPerUser >= 1) userVolScore += 15;
            }

            let opActivityScore = targetProject.opActivity || 0;
            let distinctFeatures = targetProject.distinctFeatures || 0;
            let totalPageViews = targetProject.eventCount || 0;

            if (viewsData.length > 0) {
              const projViews = viewsData.filter(
                (r: any) =>
                  String(r.ID) === id && r['Tagged Page'] && r['Tagged Page'] !== 'Untagged Pages'
              );
              distinctFeatures = 0;
              totalPageViews = 0;

              for (const r of projViews) {
                const avgViews = getAvg(r);
                if (avgViews > 0) {
                  distinctFeatures++;
                  totalPageViews += avgViews;
                }
              }
              const untaggedViewsRow = viewsData.find(
                (r: any) => String(r.ID) === id && r['Tagged Page'] === 'Untagged Pages'
              );
              if (untaggedViewsRow) {
                totalPageViews += getAvg(untaggedViewsRow);
              }

              opActivityScore = 0;
              if (distinctFeatures >= 4) opActivityScore += 50;
              else if (distinctFeatures >= 2) opActivityScore += 35;
              else if (distinctFeatures >= 1) opActivityScore += 15;

              if (totalPageViews >= 200) opActivityScore += 50;
              else if (totalPageViews >= 100) opActivityScore += 35;
              else if (totalPageViews >= 25) opActivityScore += 15;
            }

            const avgSessions = parseFloat(avgSessionsPerUser.toFixed(1));

            if (
              targetProject.userVol !== userVolScore ||
              targetProject.opActivity !== opActivityScore ||
              targetProject.activeUserCount !== activeUsersCount ||
              targetProject.eventCount !== totalPageViews ||
              targetProject.avgSessions !== avgSessions ||
              targetProject.distinctFeatures !== distinctFeatures
            ) {
              updatePromises.push(
                updateDoc(doc(db, 'projects', targetProject.id), {
                  userVol: userVolScore,
                  opActivity: opActivityScore,
                  activeUserCount: activeUsersCount,
                  eventCount: totalPageViews,
                  avgSessions: avgSessions,
                  distinctFeatures: distinctFeatures,
                })
              );
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
        const clientCsatMap = new Map<string, any>();
        const unmatchedNames = new Set<string>();

        for (const row of satisfactionFile.parsedData) {
          const feedbackReceived = parseInt(row['Feedback Received'], 10) || 0;
          if (feedbackReceived > 0) {
            totalParsed++;
            const rawName =
              row['Customer Name'] || row['Company'] || row['Client'] || 'Unknown Customer';
            const userName =
              row['Contact Name'] ||
              row['Contact'] ||
              row['Name'] ||
              row['User Name'] ||
              row['User'] ||
              row['Customer'] ||
              row['Requester'] ||
              row['Customer Name'] ||
              rawName ||
              'Unknown User';
            const happy = parseInt(row['Happy'], 10) || 0;
            const neutral = parseInt(row['Neutral'] || row['Passive'], 10) || 0;
            const unhappy = parseInt(row['Unhappy'] || row['Detractor'] || row['Sad'], 10) || 0;

            let targetClient = clients.find(
              (c) => c.companyName && c.companyName.toLowerCase() === rawName.toLowerCase()
            );

            if (targetClient) {
              autoProcessedMap.set(`direct-client-${rawName}`, {
                id: `direct-client-${rawName}`,
                type: 'client',
                rawName: rawName,
                targetId: targetClient.clientId || targetClient.id,
                targetName: targetClient.companyName || targetClient.name,
                contextName: 'Satisfaction Report (Direct Match)',
                timestamp: new Date().getTime(),
              });
            }

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
              const clientId = targetClient.clientId || targetClient.id;
              if (!clientCsatMap.has(clientId)) {
                clientCsatMap.set(clientId, {
                  client: targetClient,
                  feedback: 0,
                  happy: 0,
                  neutral: 0,
                  unhappy: 0,
                  users: {},
                });
              }
              const clientData = clientCsatMap.get(clientId);
              clientData.feedback += feedbackReceived;
              clientData.happy += happy;
              clientData.neutral += neutral;
              clientData.unhappy += unhappy;

              if (!clientData.users[userName]) {
                clientData.users[userName] = { happy: 0, neutral: 0, unhappy: 0, total: 0 };
              }
              clientData.users[userName].happy += happy;
              clientData.users[userName].neutral += neutral;
              clientData.users[userName].unhappy += unhappy;
              clientData.users[userName].total += feedbackReceived;
            } else {
              unmatchedNames.add(rawName);
            }
          }
        }

        // Now save the aggregated data per client
        for (const [clientId, data] of clientCsatMap.entries()) {
          const csat = data.feedback > 0 ? Math.round((data.happy / data.feedback) * 100) : 0;

          const usersArray = Object.keys(data.users).map((name) => ({
            name,
            happy: data.users[name].happy,
            neutral: data.users[name].neutral,
            unhappy: data.users[name].unhappy,
            total: data.users[name].total,
          }));

          const targetClient = data.client;
          const supportCsatObj = {
            score: csat,
            totalUsers: data.feedback,
            promoters: data.happy,
            passives: data.neutral,
            detractors: data.unhappy,
            users: usersArray,
          };

          // Compare existing to save writes
          const existingObj = targetClient.supportCsat;
          let needsUpdate = false;
          if (!existingObj) needsUpdate = true;
          else if (
            existingObj.score !== csat ||
            existingObj.totalUsers !== data.feedback ||
            existingObj.promoters !== data.happy ||
            existingObj.passives !== data.neutral ||
            existingObj.detractors !== data.unhappy ||
            JSON.stringify(existingObj.users) !== JSON.stringify(usersArray)
          ) {
            needsUpdate = true;
          }

          if (needsUpdate) {
            updatePromises.push(
              updateDoc(doc(db, 'clients', clientId), {
                supportCsat: supportCsatObj,
              })
            );
            updateCount++;
          }
        }

        // Process unmatched names for aliases
        for (const rawName of unmatchedNames) {
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

      // 3. Process NPS Report
      if (npsFile.parsedData) {
        const clientNpsMap = new Map<string, any>();
        const unmatchedNames = new Map<string, string>();

        for (const row of npsFile.parsedData) {
          const userIdRaw = row['User Id'] || row['Email'] || '';
          const userEmail = userIdRaw.replace('_prod', '').trim();
          const rawName = row['Name'] || userEmail || row['Company'] || 'Unknown User';
          const userName = row['Name'] || userEmail || 'Unknown User';
          const score = parseInt(row['Score'], 10);
          const feedbackText =
            row['Feedback'] && row['Feedback'].trim() !== '-' ? row['Feedback'].trim() : '';

          if (!isNaN(score)) {
            totalParsed++;

            let targetClient = clients.find(
              (c) => c.companyName && c.companyName.toLowerCase() === rawName.toLowerCase()
            );

            if (targetClient) {
              autoProcessedMap.set(`direct-client-nps-${rawName}`, {
                id: `direct-client-nps-${rawName}`,
                type: 'client',
                rawName: rawName,
                subLabel: userEmail,
                targetId: targetClient.clientId || targetClient.id,
                targetName: targetClient.companyName || targetClient.name,
                contextName: 'NPS Report (Direct Match)',
                timestamp: new Date().getTime(),
              });
            }

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
                    subLabel: aliasMatch.subLabel || userEmail,
                    targetId: aliasMatch.targetId,
                    targetName: targetClient.companyName || targetClient.name,
                    contextName: aliasMatch.contextName,
                    timestamp: new Date().getTime(),
                  });
                }
              }
            }

            if (!targetClient && userEmail.includes('@')) {
              const domainStr = userEmail.split('@')[1].toLowerCase();
              const genericDomains = [
                'gmail.com',
                'yahoo.com',
                'hotmail.com',
                'outlook.com',
                'aol.com',
                'icloud.com',
              ];
              if (!genericDomains.includes(domainStr)) {
                const domainBase = domainStr.split('.')[0];
                targetClient = clients.find((c) => {
                  if (!c.companyName) return false;
                  const compClean = c.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
                  if (compClean === domainBase) return true;
                  if (compClean.length > 3 && domainBase.length > 3) {
                    if (compClean.startsWith(domainBase) || domainBase.startsWith(compClean))
                      return true;
                  }
                  return false;
                });

                if (targetClient) {
                  autoProcessedMap.set(`domain-client-nps-${rawName}`, {
                    id: `domain-client-nps-${rawName}`,
                    type: 'client',
                    rawName: rawName,
                    subLabel: userEmail,
                    targetId: targetClient.clientId || targetClient.id,
                    targetName: targetClient.companyName || targetClient.name,
                    contextName: 'NPS Report (Domain Match)',
                    timestamp: new Date().getTime(),
                  });
                }
              }
            }

            if (targetClient) {
              const clientId = targetClient.clientId || targetClient.id;
              if (!clientNpsMap.has(clientId)) {
                clientNpsMap.set(clientId, {
                  client: targetClient,
                  promoters: 0,
                  passives: 0,
                  detractors: 0,
                  total: 0,
                  feedback: [],
                });
              }

              const clientData = clientNpsMap.get(clientId);
              clientData.total++;

              if (score >= 9) clientData.promoters++;
              else if (score >= 7) clientData.passives++;
              else clientData.detractors++;

              clientData.feedback.push({
                name: userName,
                score: score,
                feedback: feedbackText,
              });
            } else {
              if (!unmatchedNames.has(rawName)) {
                unmatchedNames.set(rawName, userEmail);
              }
            }
          }
        }

        // Now save the aggregated NPS data per client
        for (const [clientId, data] of clientNpsMap.entries()) {
          const npsScore =
            data.total > 0
              ? Math.round(
                  (data.promoters * 100 + data.passives * 50 + data.detractors * 0) / data.total
                )
              : 0;

          const targetClient = data.client;
          const npsObj = {
            score: npsScore,
            totalUsers: data.total,
            promoters: data.promoters,
            passives: data.passives,
            detractors: data.detractors,
            feedback: data.feedback,
          };

          updatePromises.push(
            updateDoc(doc(db, 'clients', clientId), {
              clientNps: npsObj,
            })
          );
          updateCount++;
        }

        for (const [rawName, email] of unmatchedNames.entries()) {
          const aliasExists = aliases.some((a: any) => a.rawName === rawName);
          if (!aliasExists) {
            const newAliasRef = doc(collection(db, 'aliases'));
            batch.set(newAliasRef, {
              type: 'client',
              rawName: rawName,
              subLabel: email,
              targetId: '',
              status: 'pending_approval',
              contextName: 'NPS Report',
            });
            aliasesAdded++;
          }
        }
      }

      if (aliasesAdded > 0) {
        await batch.commit();
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      setCompileStep(3); // 3: Updating Scores
      await new Promise((r) => setTimeout(r, 600));

      // Save upload log to system_logs
      const logId = crypto.randomUUID();
      const filesUploaded = [
        satisfactionFile.file?.name,
        sessionsFile.file?.name,
        viewsFile.file?.name,
      ]
        .filter(Boolean)
        .join(', ');

      const uploadedTypes = [];
      if (satisfactionFile.file) uploadedTypes.push('Happyfox Support CSAT');
      if (sessionsFile.file) uploadedTypes.push('Userpilot Sessions');
      if (viewsFile.file) uploadedTypes.push('Userpilot Page Views');
      if (npsFile.file) uploadedTypes.push('Userpilot NPS');

      const formattedEntityName = uploadedTypes.join(', ');

      const logData = {
        id: logId,
        action: 'Data Import',
        entityType: 'Upload',
        entityId: 'upload',
        entityName: formattedEntityName || 'Multiple Files',
        timestamp: new Date().getTime(),
        author: user?.name || user?.email || 'System',
        autoProcessed: Array.from(autoProcessedMap.values()).map((item) => ({
          ...item,
          targetName: item.targetName || 'Unknown',
          contextName: item.contextName || 'Unknown',
        })),
        updatedMetrics: updateCount,
        sentForReview: aliasesAdded,
        totalParsed: totalParsed,
      };

      // Strip any lingering undefined values to prevent Firebase crash
      const sanitizedLogData = JSON.parse(JSON.stringify(logData));

      await setDoc(doc(db, 'system_logs', logId), sanitizedLogData);

      setCompileStep(4); // 4: Done
      setCompileResult({ updated: updateCount, intakes: aliasesAdded });
      toast.success('Compilation successful');
      window.dispatchEvent(new Event('pipeline-updated'));

      setNpsFile({ file: null, parsedData: null, error: null });
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
    satisfactionFile.parsedData ||
    sessionsFile.parsedData ||
    viewsFile.parsedData ||
    npsFile.parsedData;

  const stagedFiles = [
    {
      type: 'satisfaction',
      label: 'Satisfaction Data',
      data: satisfactionFile,
      icon: Smile,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      type: 'sessions',
      label: 'Sessions Data',
      data: sessionsFile,
      icon: Users,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
    },
    {
      type: 'views',
      label: 'Views Data',
      data: viewsFile,
      icon: Activity,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      type: 'nps',
      label: 'Platform NPS',
      data: npsFile,
      icon: ThumbsUp,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
  ].filter((f) => f.data.file || f.data.error);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {compileResult ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800">Data Successfully Processed!</h3>
          <p className="text-base text-green-700 mt-2 max-w-md mx-auto">
            Aggregated data and updated <strong>{compileResult.updated}</strong> target records.
            Pushed <strong>{compileResult.intakes}</strong> unrecognized entries to the Data Intake
            pipeline.
          </p>
        </div>
      ) : isCompiling ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
          <h3 className="text-lg font-bold text-slate-800 mb-6">Compiling Health Data</h3>

          <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              {compileStep > 1 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              )}
              <span
                className={`text-sm font-semibold ${compileStep >= 1 ? 'text-slate-800' : 'text-slate-400'}`}
              >
                1. Parsing CSV data and mapping columns
              </span>
            </div>
            <div className="flex items-center gap-3">
              {compileStep > 2 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : compileStep === 2 ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
              )}
              <span
                className={`text-sm font-semibold ${compileStep >= 2 ? 'text-slate-800' : 'text-slate-400'}`}
              >
                2. Resolving entities & finding aliases
              </span>
            </div>
            <div className="flex items-center gap-3">
              {compileStep > 3 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : compileStep === 3 ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
              )}
              <span
                className={`text-sm font-semibold ${compileStep >= 3 ? 'text-slate-800' : 'text-slate-400'}`}
              >
                3. Updating Health Scores globally
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Big Canvas Drop Zone */}
          <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-primary/50 transition-colors bg-slate-50/50 hover:bg-primary/5 cursor-pointer">
            <input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title=""
            />
            <div className="flex flex-col items-center justify-center p-12 text-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-primary/30 transition-all">
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Drop CSV Data Files Here</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                or click to browse from your computer
              </p>

              <div className="relative z-20 pointer-events-auto">
                <Tooltip
                  content="Filenames must contain 'satisfaction' (or 'customer'), 'sessions', 'views', or 'nps' to be auto-mapped."
                  position="bottom"
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-white hover:bg-slate-50 transition-colors px-3 py-1.5 rounded-full border border-slate-200 shadow-sm cursor-help">
                    <Info className="w-3.5 h-3.5" />
                    <span>Formatting guidelines</span>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Dynamic Staged Files */}
          {stagedFiles.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-400" /> Staged for Import
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {stagedFiles.length} ready
                </span>
              </div>

              <div className="space-y-3">
                {stagedFiles.map((f, idx) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${f.bg} ${f.border} ${f.color}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{f.label}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate max-w-[200px] sm:max-w-[400px]">
                            {f.data.file?.name}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center">
                        {f.data.parsedData ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {f.data.parsedData.length} rows parsed
                          </span>
                        ) : f.data.error ? (
                          <span
                            className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full max-w-[150px] truncate"
                            title={f.data.error}
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{f.data.error}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  disabled={!isReadyToCompile}
                  onClick={runCompiler}
                  className="flex items-center justify-center gap-2 px-8 h-12 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 w-full sm:w-auto"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Run Compiler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
