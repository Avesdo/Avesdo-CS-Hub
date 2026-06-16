import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import {
  AlertCircle,
  ArchiveRestore,
  RotateCcw,
  Trash2,
  History,
  Search,
  Settings as SettingsIcon,
  Users,
  FolderOpen,
  Package,
  ChevronDown,
  Grid,
  Building2,
  Home,
  Briefcase,
  CheckCircle2,
  XCircle,
  Edit,
  Plus,
} from 'lucide-react';
import {
  getSystemLogs,
  restoreRecord,
  hardDeleteRecord,
  saveSettings,
  addAutoLog,
  addServiceAutoLog,
  addProjectAutoLog,
  getPendingAliases,
  resolveAlias,
  addGlobalLog,
  clearAuditTrail,
} from '../api/dbService';
import { PageHeader } from '../components/PageHeader';
import { toast } from '../utils/toast';
import MultiSelectCombobox from '../components/MultiSelectCombobox';

export default function AdminHub() {
  const [activeTab, setActiveTab] = useState<'audit' | 'archives' | 'intake'>('audit');
  const {
    settings,
    archivedClients,
    archivedProjects,
    archivedServices,
    services,
    projects,
    clients,
    user,
  } = useAppState();

  // --- AUDIT TRAIL STATE ---
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<
    'All' | 'Clients' | 'Projects' | 'Services' | 'Settings'
  >('All');
  const [auditLimit, setAuditLimit] = useState(50);

  // --- ARCHIVES STATE ---
  const [archiveTab, setArchiveTab] = useState<
    'all' | 'clients' | 'projects' | 'services' | 'settings'
  >('all');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [confirmArchiveDeleteId, setConfirmArchiveDeleteId] = useState<string | null>(null);

  // --- INTAKE STATE ---
  const [pendingAliases, setPendingAliases] = useState<any[]>([]);
  const [loadingAliases, setLoadingAliases] = useState(false);
  const [correctingAliasId, setCorrectingAliasId] = useState<string | null>(null);
  const [correctionTargetId, setCorrectionTargetId] = useState<string>('');

  // Move functions above useEffect to fix ReferenceError
  const loadAliases = async () => {
    setLoadingAliases(true);
    const data = await getPendingAliases();
    setPendingAliases(data);
    setLoadingAliases(false);
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    const data = await getSystemLogs();
    setLogs(data);
    setLoadingLogs(false);
  };

  useEffect(() => {
    loadAliases();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadLogs();
    } else if (activeTab === 'intake') {
      loadAliases();
    }
  }, [activeTab]);

  const handleResolveAlias = async (
    id: string,
    action: 'approve' | 'reject' | 'correct' | 'create_new',
    targetId?: string
  ) => {
    await resolveAlias(id, action, targetId);
    if (action === 'correct' || action === 'create_new') {
      setCorrectingAliasId(null);
      setCorrectionTargetId('');
    }
    loadAliases();
  };

  // Functions moved up

  // --- ARCHIVES ACTIONS ---
  const handleRestoreRecordLocal = async (collectionName: string, item: any) => {
    const title = item.companyName || item.name || 'Record';
    toast.promise(
      restoreRecord(collectionName, item.clientId || item.id, title, { silent: true }).then(
        async () => {
          if (collectionName === 'projects') {
            if (item.clientIds) {
              for (const cid of item.clientIds) {
                await addAutoLog(cid, `Project "${item.name}" restored`, 'System', true);
              }
            }
            const pServices =
              services?.filter(
                (s: any) =>
                  s.projectId === item.id || (s.projectIds && s.projectIds.includes(item.id))
              ) || [];
            const pArchivedServices =
              archivedServices?.filter(
                (s: any) =>
                  s.projectId === item.id || (s.projectIds && s.projectIds.includes(item.id))
              ) || [];
            for (const svc of [...pServices, ...pArchivedServices]) {
              await addServiceAutoLog(
                svc.id,
                `Attached Project "${item.name}" restored`,
                'System',
                true
              );
            }
          } else if (collectionName === 'clients') {
            const cProjects =
              projects?.filter((p: any) => p.clientIds?.includes(item.clientId || item.id)) || [];
            const cArchivedProjects =
              archivedProjects?.filter((p: any) =>
                p.clientIds?.includes(item.clientId || item.id)
              ) || [];
            for (const p of [...cProjects, ...cArchivedProjects]) {
              await addProjectAutoLog(
                p.id,
                `Client "${item.companyName || item.name}" restored`,
                'System',
                true
              );
            }
            const cServices =
              services?.filter((s: any) => s.clientIds?.includes(item.clientId || item.id)) || [];
            const cArchivedServices =
              archivedServices?.filter((s: any) =>
                s.clientIds?.includes(item.clientId || item.id)
              ) || [];
            for (const svc of [...cServices, ...cArchivedServices]) {
              await addServiceAutoLog(
                svc.id,
                `Attached Client "${item.companyName || item.name}" restored`,
                'System',
                true
              );
            }
          } else if (collectionName === 'services') {
            const pIds =
              item.projectIds ||
              (item.projectId && item.projectId !== 'N/A' ? [item.projectId] : []);
            for (const pId of pIds) {
              await addProjectAutoLog(pId, `Service "${item.name}" restored`, 'System', true);
            }
            if (item.clientIds) {
              for (const cid of item.clientIds) {
                await addAutoLog(cid, `Service "${item.name}" restored`, 'System', true);
              }
            }
          }
        }
      ),
      {
        loading: `Restoring ${title}...`,
        success: `${title} restored successfully.`,
        error: `Failed to restore ${title}.`,
      }
    );
  };

  const handleHardDeleteRecordLocal = async (collectionName: string, item: any) => {
    const title = item.companyName || item.name || 'Record';
    toast.promise(
      hardDeleteRecord(collectionName, item.clientId || item.id, title, { silent: true }).then(
        async () => {
          let entityType: any = 'System';
          if (collectionName === 'clients') entityType = 'Client';
          if (collectionName === 'projects') entityType = 'Project';
          if (collectionName === 'services') entityType = 'Service';
          const author = user?.name || user?.email || 'Admin';
          await addGlobalLog(
            `Permanently deleted archived record`,
            entityType,
            item.clientId || item.id,
            title,
            author
          );
          loadLogs();

          if (collectionName === 'projects') {
            if (item.clientIds) {
              for (const cid of item.clientIds) {
                await addAutoLog(cid, `Project "${item.name}" permanently deleted`, 'System', true);
              }
            }
            const pServices =
              services?.filter(
                (s: any) =>
                  s.projectId === item.id || (s.projectIds && s.projectIds.includes(item.id))
              ) || [];
            const pArchivedServices =
              archivedServices?.filter(
                (s: any) =>
                  s.projectId === item.id || (s.projectIds && s.projectIds.includes(item.id))
              ) || [];
            for (const svc of [...pServices, ...pArchivedServices]) {
              await addServiceAutoLog(
                svc.id,
                `Attached Project "${item.name}" permanently deleted`,
                'System',
                true
              );
            }
          } else if (collectionName === 'clients') {
            const cProjects =
              projects?.filter((p: any) => p.clientIds?.includes(item.clientId || item.id)) || [];
            const cArchivedProjects =
              archivedProjects?.filter((p: any) =>
                p.clientIds?.includes(item.clientId || item.id)
              ) || [];
            for (const p of [...cProjects, ...cArchivedProjects]) {
              await addProjectAutoLog(
                p.id,
                `Client "${item.companyName || item.name}" permanently deleted`,
                'System',
                true
              );
            }
            const cServices =
              services?.filter((s: any) => s.clientIds?.includes(item.clientId || item.id)) || [];
            const cArchivedServices =
              archivedServices?.filter((s: any) =>
                s.clientIds?.includes(item.clientId || item.id)
              ) || [];
            for (const svc of [...cServices, ...cArchivedServices]) {
              await addServiceAutoLog(
                svc.id,
                `Attached Client "${item.companyName || item.name}" permanently deleted`,
                'System',
                true
              );
            }
          } else if (collectionName === 'services') {
            if (item.projectId && item.projectId !== 'N/A') {
              await addProjectAutoLog(
                item.projectId,
                `Service "${item.name}" permanently deleted`,
                'System',
                true
              );
            }
            if (item.clientIds) {
              for (const cid of item.clientIds) {
                await addAutoLog(cid, `Service "${item.name}" permanently deleted`, 'System', true);
              }
            }
          }
        }
      ),
      {
        loading: `Permanently deleting ${title}...`,
        success: `${title} permanently deleted.`,
        error: `Failed to delete ${title}.`,
      }
    );
  };

  const fieldDisplayNames: Record<string, string> = {
    managers: 'Account manager',
    phases: 'Implementation Status',
    statuses: 'Status',
    timelines: 'Delivery Status',
    clientTypes: 'Client Type',
    features: 'Feature',
    services: 'Service',
    serviceTypes: 'Service Type',
    serviceOutcomes: 'Service Outcome',
    serviceStatuses: 'Fulfillment Status',
  };

  const handleRestoreSetting = async (category: string, index: number, isSettingsData: boolean) => {
    if (!settings || !settings.archivedData) return;
    const newSettings = { ...settings };
    let restoredItem: any;

    if (isSettingsData) {
      restoredItem = newSettings.archivedData.settingsData.splice(index, 1)[0];
      if (!newSettings.settingsData) newSettings.settingsData = [];
      newSettings.settingsData.push(restoredItem);
    } else {
      restoredItem = newSettings.archivedData[category].splice(index, 1)[0];
      if (!newSettings[category as keyof typeof newSettings]) (newSettings as any)[category] = [];
      (newSettings as any)[category].push(restoredItem);
    }
    await saveSettings(newSettings, { silent: true });

    const restoredName =
      typeof restoredItem === 'string' ? restoredItem : restoredItem?.name || 'Unknown';
    const displayField = fieldDisplayNames[category] || category;
    const msg = `${displayField} '${restoredName}' restored.`;
    const author = user?.name || user?.email || 'Admin';

    addGlobalLog(msg, 'Setting', category, restoredName, author).then(() => loadLogs());
    toast.success(msg);
  };

  const handleHardDeleteSetting = async (
    category: string,
    index: number,
    isSettingsData: boolean
  ) => {
    if (!settings || !settings.archivedData) return;
    const newSettings = { ...settings };
    let deletedItem: any;
    if (isSettingsData) {
      deletedItem = newSettings.archivedData.settingsData.splice(index, 1)[0];
    } else {
      deletedItem = newSettings.archivedData[category].splice(index, 1)[0];
    }
    await saveSettings(newSettings, { silent: true });

    const deletedName =
      typeof deletedItem === 'string' ? deletedItem : deletedItem?.name || 'Unknown';
    const displayField = fieldDisplayNames[category] || category;
    const msg = `${displayField} '${deletedName}' permanently deleted.`;
    const author = user?.name || user?.email || 'Admin';

    addGlobalLog(msg, 'Setting', category, deletedName, author).then(() => loadLogs());
    toast.success(msg);
  };

  // --- RENDER HELPERS ---
  const renderAuditTrail = () => {
    const filteredLogs = logs.filter((log) => {
      if (
        auditFilter !== 'All' &&
        log.entityType !== auditFilter &&
        log.entityType !== auditFilter.slice(0, -1)
      ) {
        return false;
      }
      if (auditSearch) {
        const term = auditSearch.toLowerCase();
        return (
          (log.action || '').toLowerCase().includes(term) ||
          (log.entityName || '').toLowerCase().includes(term) ||
          (log.author || '').toLowerCase().includes(term)
        );
      }
      return true;
    });

    const displayedLogs = filteredLogs.slice(0, auditLimit);

    // Group by Date
    const groupedLogs: { [key: string]: any[] } = {};
    displayedLogs.forEach((log) => {
      const d = new Date(log.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupName = '';
      if (d.toDateString() === today.toDateString()) {
        groupName = 'Today';
      } else if (d.toDateString() === yesterday.toDateString()) {
        groupName = 'Yesterday';
      } else {
        groupName = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      if (!groupedLogs[groupName]) groupedLogs[groupName] = [];
      groupedLogs[groupName].push(log);
    });

    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto py-2 px-2 -mx-2 sm:px-2 sm:-mx-2 hide-scrollbar shrink-0">
            {[
              { id: 'All', label: 'All', icon: Grid },
              { id: 'Clients', label: 'Clients', icon: Building2 },
              { id: 'Projects', label: 'Projects', icon: Home },
              { id: 'Services', label: 'Services', icon: Briefcase },
              { id: 'Settings', label: 'Settings', icon: SettingsIcon },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAuditFilter(f.id as any)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  auditFilter === f.id
                    ? 'bg-white text-foreground border-border'
                    : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'
                }`}
              >
                <f.icon
                  className={`w-4 h-4 ${auditFilter === f.id ? 'text-primary' : 'opacity-70'}`}
                />{' '}
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to permanently clear the entire audit trail?')) {
                  await clearAuditTrail();
                  loadLogs();
                }
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Clear Log"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          {loadingLogs ? (
            <div className="p-12 text-center text-sm font-medium text-slate-500 animate-pulse">
              Loading audit trail...
            </div>
          ) : displayedLogs.length === 0 ? (
            <div className="p-12 text-center text-sm font-medium text-slate-500">
              No logs found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {Object.entries(groupedLogs).map(([dateLabel, group]) => (
                <div key={dateLabel}>
                  <div className="bg-slate-50/80 px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10 border-b border-border">
                    {dateLabel}
                  </div>
                  <div className="divide-y divide-border/50">
                    {group.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0
                                                    ${
                                                      log.entityType === 'Client'
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : log.entityType === 'Project'
                                                          ? 'bg-indigo-100 text-indigo-600'
                                                          : log.entityType === 'Service'
                                                            ? 'bg-emerald-100 text-emerald-600'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                        >
                          {log.entityType === 'Client' ? (
                            <Building2 className="w-4 h-4" />
                          ) : log.entityType === 'Project' ? (
                            <Home className="w-4 h-4" />
                          ) : log.entityType === 'Service' ? (
                            <Briefcase className="w-4 h-4" />
                          ) : (
                            <SettingsIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 leading-snug">
                            {log.action}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {log.entityName}
                            </span>
                            <span className="flex items-center gap-1">
                              <History className="w-3.5 h-3.5" />{' '}
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" /> {log.author}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {filteredLogs.length > displayedLogs.length && (
          <div className="mt-6 text-center pb-6">
            <button
              onClick={() => setAuditLimit((prev) => prev + 50)}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all active:scale-95"
            >
              <ChevronDown className="w-4 h-4" /> Load More Logs
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderArchiveRow = (item: any) => {
    const isConfirming = confirmArchiveDeleteId === item.id;
    const name = item.companyName || item.name || (typeof item === 'string' ? item : 'Unknown');
    const type = item._archiveType;

    const isSetting = !!item._category;
    const onDelete = isSetting
      ? () => {
          handleHardDeleteSetting(item._category, item._idx, item._isSettingsData);
          setConfirmArchiveDeleteId(null);
        }
      : () => {
          handleHardDeleteRecordLocal(item._collection, item._originalItem);
          setConfirmArchiveDeleteId(null);
        };

    const onRestore = isSetting
      ? () => handleRestoreSetting(item._category, item._idx, item._isSettingsData)
      : () => handleRestoreRecordLocal(item._collection, item._originalItem);

    let iconContent = <ArchiveRestore className="w-4 h-4" />;
    let iconBg = 'bg-slate-100 text-slate-600';
    if (type === 'Client') {
      iconContent = <Building2 className="w-4 h-4" />;
      iconBg = 'bg-blue-100 text-blue-600';
    } else if (type === 'Project') {
      iconContent = <Home className="w-4 h-4" />;
      iconBg = 'bg-indigo-100 text-indigo-600';
    } else if (type === 'Service') {
      iconContent = <Briefcase className="w-4 h-4" />;
      iconBg = 'bg-emerald-100 text-emerald-600';
    } else if (isSetting) {
      iconContent = <SettingsIcon className="w-4 h-4" />;
      iconBg = 'bg-slate-100 text-slate-600';
    }

    return (
      <div
        key={item.id}
        className="flex flex-col p-4 hover:bg-slate-50 transition-colors relative group"
      >
        {isConfirming ? (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-between px-6 z-20 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-sm font-semibold text-destructive">
              <AlertCircle className="w-5 h-5" /> Permanently delete "{name}"?
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmArchiveDeleteId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-md transition-colors shadow-sm"
              >
                Delete Forever
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-start gap-4">
          <div
            className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
          >
            {iconContent}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900 leading-snug">{name}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md capitalize text-xs">
                    {type}
                  </span>
                  {type === 'Project' && item.clients?.length > 0 && (
                    <span>{item.clients.join(', ')}</span>
                  )}
                  {type === 'Service' && (
                    <span>
                      {item.clients?.length > 0 ? item.clients.join(', ') : 'No Client'}{' '}
                      {item.projectName && item.projectName !== 'N/A'
                        ? `• ${item.projectName}`
                        : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={onRestore}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
                <button
                  onClick={() => setConfirmArchiveDeleteId(item.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderArchives = () => {
    let itemsToRender: any[] = [];

    const addItems = (source: any[], typeLabel: string, collection: string) => {
      return source.map((item) => ({
        ...item,
        id: item.clientId || item.id,
        _archiveType: typeLabel,
        _collection: collection,
        _originalItem: item,
      }));
    };

    if (archiveTab === 'all' || archiveTab === 'clients') {
      itemsToRender = [...itemsToRender, ...addItems(archivedClients, 'Client', 'clients')];
    }
    if (archiveTab === 'all' || archiveTab === 'projects') {
      itemsToRender = [...itemsToRender, ...addItems(archivedProjects, 'Project', 'projects')];
    }
    if (archiveTab === 'all' || archiveTab === 'services') {
      itemsToRender = [...itemsToRender, ...addItems(archivedServices, 'Service', 'services')];
    }
    if (archiveTab === 'all' || archiveTab === 'settings') {
      if (settings?.archivedData) {
        Object.entries(settings.archivedData).forEach(([category, items]) => {
          if (Array.isArray(items)) {
            const isSettingsData = category === 'settingsData';
            items.forEach((item: any, idx: number) => {
              const name = typeof item === 'string' ? item : item.name;
              const subCategory = isSettingsData ? item.category : category;
              itemsToRender.push({
                id: `setting-${category}-${idx}`,
                name,
                _archiveType: subCategory.replace(/([A-Z])/g, ' $1').trim(),
                _category: category,
                _idx: idx,
                _isSettingsData: isSettingsData,
              });
            });
          }
        });
      }
    }

    // Apply Search
    if (archiveSearch) {
      itemsToRender = itemsToRender.filter((item) => {
        const name = item.companyName || item.name || '';
        return name.toLowerCase().includes(archiveSearch.toLowerCase());
      });
    }

    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto py-2 px-2 -mx-2 sm:px-2 sm:-mx-2 hide-scrollbar shrink-0">
            {[
              { id: 'all', label: 'All', icon: Grid },
              { id: 'clients', label: 'Clients', icon: Building2 },
              { id: 'projects', label: 'Projects', icon: Home },
              { id: 'services', label: 'Services', icon: Briefcase },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setArchiveTab(f.id as any)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  archiveTab === f.id
                    ? 'bg-white text-foreground border-border'
                    : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'
                }`}
              >
                <f.icon
                  className={`w-4 h-4 ${archiveTab === f.id ? 'text-primary' : 'opacity-70'}`}
                />{' '}
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search archives..."
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          {itemsToRender.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <ArchiveRestore className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">
                No archived records found matching search.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {itemsToRender.map((item) => renderArchiveRow(item))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderIntake = () => {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-300 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Data Intake Pipeline</h3>
              <p className="text-sm text-slate-500">
                Review and approve AI-generated alignments for incoming data.
              </p>
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-visible shadow-sm">
            {loadingAliases ? (
              <div className="p-12 text-center text-sm font-medium text-slate-500 animate-pulse">
                Loading pending merges...
              </div>
            ) : pendingAliases.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
                <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No pending merges require approval.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {pendingAliases.map((alias) => {
                  const isCorrecting = correctingAliasId === alias.id;
                  return (
                    <div
                      key={alias.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                                            ${
                                              alias.type === 'client'
                                                ? 'bg-blue-100 text-blue-600'
                                                : alias.type === 'project'
                                                  ? 'bg-indigo-100 text-indigo-600'
                                                  : 'bg-emerald-100 text-emerald-600'
                                            }`}
                        >
                          {alias.type === 'client' ? (
                            <Building2 className="w-4 h-4" />
                          ) : alias.type === 'project' ? (
                            <Home className="w-4 h-4" />
                          ) : (
                            <Briefcase className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">
                            Incoming Raw String:{' '}
                            <span className="font-bold text-slate-900 px-1 py-0.5 bg-slate-100 rounded border">
                              "{alias.rawName}"{' '}
                              {alias.contextName && (
                                <span className="text-slate-500 font-normal">
                                  ({alias.contextName})
                                </span>
                              )}
                            </span>
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">
                              Gemini Suggests Merge With:
                            </span>
                            <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                              {(() => {
                                if (alias.type === 'client') {
                                  const match = clients.find(
                                    (c) => c.clientId === alias.targetId || c.id === alias.targetId
                                  );
                                  return match ? match.companyName : '[Create New Entity]';
                                }
                                if (alias.type === 'project') {
                                  const match = projects.find((p) => p.id === alias.targetId);
                                  return match ? match.name : '[Create New Entity]';
                                }
                                if (alias.type === 'service') {
                                  const match = services.find((s) => s.id === alias.targetId);
                                  return match ? match.name : '[Create New Entity]';
                                }
                                return alias.targetId;
                              })()}
                            </span>
                          </div>
                          {isCorrecting && (
                            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <SearchableSelect
                                value={correctionTargetId}
                                onChange={setCorrectionTargetId}
                                options={
                                  alias.type === 'client'
                                    ? clients.map((c) => ({
                                        label: c.companyName || c.name || '',
                                        value: c.clientId || (c.id as string),
                                      }))
                                    : alias.type === 'project'
                                      ? projects.map((p) => ({ label: p.name || '', value: p.id }))
                                      : alias.type === 'service'
                                        ? services.map((s) => ({
                                            label: s.name || '',
                                            value: s.id,
                                          }))
                                        : []
                                }
                                placeholder={`Select correct ${alias.type}...`}
                                className="flex-1 min-w-[200px]"
                              />
                              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <button
                                  onClick={() => {
                                    if (correctionTargetId)
                                      handleResolveAlias(alias.id, 'correct', correctionTargetId);
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!correctionTargetId}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setCorrectingAliasId(null);
                                    setCorrectionTargetId('');
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {!isCorrecting && (
                        <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end w-full sm:w-auto mt-3 sm:mt-0">
                          <button
                            onClick={() => setCorrectingAliasId(alias.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5" /> Correct
                          </button>
                          <button
                            onClick={() => {
                              const prefix =
                                alias.type === 'client'
                                  ? 'C'
                                  : alias.type === 'project'
                                    ? 'P'
                                    : 'S';
                              handleResolveAlias(
                                alias.id,
                                'create_new',
                                `${prefix}-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`
                              );
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" /> Create New
                          </button>
                          <button
                            onClick={() => handleResolveAlias(alias.id, 'reject')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Ignore
                          </button>
                          <button
                            onClick={() => handleResolveAlias(alias.id, 'approve')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 border border-emerald-600 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden flex-col bg-white pt-2 px-4 md:px-6 pb-0">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 shrink-0 relative z-30">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Admin Hub
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            System audit logs and archived records.
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 w-full bg-white border border-border rounded-xl shadow-sm overflow-hidden flex-col md:flex-row">
        <div className="w-full md:w-72 bg-slate-50 border-b md:border-b-0 md:border-r border-border shrink-0 p-4 flex flex-col gap-1 overflow-y-auto custom-thin-scroll">
          {[
            { id: 'intake', label: 'Data Intake & Approvals', icon: FolderOpen },
            { id: 'audit', label: 'Audit Trail', icon: History },
            { id: 'archives', label: 'Archives', icon: ArchiveRestore },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all active:scale-95  w-full text-left outline-none ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-200/50 hover:text-foreground'}`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-4 h-4 opacity-70" /> {tab.label}
              </div>
              {tab.id === 'intake' && pendingAliases.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingAliases.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white custom-thin-scroll">
          {activeTab === 'intake' && renderIntake()}
          {activeTab === 'audit' && renderAuditTrail()}
          {activeTab === 'archives' && renderArchives()}
        </div>
      </div>
    </div>
  );
}
