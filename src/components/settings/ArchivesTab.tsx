import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  saveSettings,
  restoreRecord,
  hardDeleteRecord,
  addProjectAutoLog,
  addAutoLog,
  addServiceAutoLog,
  addGlobalLog,
} from '../../api/dbService';
import { toast } from '../../utils/toast';
import {
  Building2,
  Home,
  Briefcase,
  Settings as SettingsIcon,
  Grid,
  ArchiveRestore,
  Search,
  AlertTriangle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Tooltip as UITooltip } from '../ui/Tooltip';
import { motion } from 'framer-motion';
import { TruncatedText } from '../../components/ui/TruncatedText';

export function ArchivesTab({ loadLogs }: { loadLogs: () => void }) {
  const settings = useAppStore((state) => state.settings);
  const projects = useAppStore((state) => state.projects);
  const services = useAppStore((state) => state.services);
  const user = useAppStore((state) => state.user);

  const archivedClients = useAppStore((state) => state.archivedClients);
  const archivedProjects = useAppStore((state) => state.archivedProjects);
  const archivedServices = useAppStore((state) => state.archivedServices);

  const [archiveTab, setArchiveTab] = useState<
    'all' | 'clients' | 'projects' | 'services' | 'settings'
  >('all');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [confirmArchiveDeleteId, setConfirmArchiveDeleteId] = useState<string | null>(null);

  const fieldDisplayNames: Record<string, string> = {
    managers: 'Account manager',
    phases: 'Implementation Status',
    statuses: 'Status',
    timelines: 'Schedule Status',
    clientTypes: 'Client Type',
    features: 'Feature',
    services: 'Service',
    serviceTypes: 'Service Type',
    serviceOutcomes: 'Service Outcome',
    serviceStatuses: 'Fulfillment Status',
  };

  const handleRestoreRecordLocal = async (collectionName: string, item: any) => {
    const title = item.companyName || item.name || 'Record';
    toast.promise(
      restoreRecord(
        collectionName,
        item.clientId || item.id,
        title,
        { silent: true },
        user?.name || user?.email || 'System'
      ).then(async () => {
        if (collectionName === 'projects') {
          await addProjectAutoLog(
            item.clientId || item.id,
            `Project "${item.name}" restored`,
            user?.name || 'System'
          );
          if (item.clientIds) {
            for (const cid of item.clientIds) {
              await addAutoLog(
                cid,
                `Project "${item.name}" restored`,
                user?.name || 'System',
                true
              );
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
              user?.name || 'System',
              true
            );
          }
        } else if (collectionName === 'clients') {
          const cProjects =
            projects?.filter((p: any) => p.clientIds?.includes(item.clientId || item.id)) || [];
          const cArchivedProjects =
            archivedProjects?.filter((p: any) => p.clientIds?.includes(item.clientId || item.id)) ||
            [];
          for (const p of [...cProjects, ...cArchivedProjects]) {
            await addProjectAutoLog(
              p.id,
              `Client "${item.companyName || item.name}" restored`,
              user?.name || 'System',
              true
            );
          }
          const cServices =
            services?.filter((s: any) => s.clientIds?.includes(item.clientId || item.id)) || [];
          const cArchivedServices =
            archivedServices?.filter((s: any) => s.clientIds?.includes(item.clientId || item.id)) ||
            [];
          for (const svc of [...cServices, ...cArchivedServices]) {
            await addServiceAutoLog(
              svc.id,
              `Attached Client "${item.companyName || item.name}" restored`,
              user?.name || 'System',
              true
            );
          }
        } else if (collectionName === 'services') {
          const pIds =
            item.projectIds || (item.projectId && item.projectId !== 'N/A' ? [item.projectId] : []);
          for (const pId of pIds) {
            await addProjectAutoLog(
              pId,
              `Service "${item.name}" restored`,
              user?.name || 'System',
              true
            );
          }
          if (item.clientIds) {
            for (const cid of item.clientIds) {
              await addAutoLog(
                cid,
                `Service "${item.name}" restored`,
                user?.name || 'System',
                true
              );
            }
          }
        }
      }),
      {
        loading: `Restoring ${title}...`,
        success: `${title} restored successfully`,
        error: `Failed to restore ${title}`,
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
                await addAutoLog(
                  cid,
                  `Project "${item.name}" permanently deleted`,
                  user?.name || 'System',
                  true
                );
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
                user?.name || 'System',
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
                user?.name || 'System',
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
                user?.name || 'System',
                true
              );
            }
          } else if (collectionName === 'services') {
            if (item.projectId && item.projectId !== 'N/A') {
              await addProjectAutoLog(
                item.projectId,
                `Service "${item.name}" permanently deleted`,
                user?.name || 'System',
                true
              );
            }
            if (item.clientIds) {
              for (const cid of item.clientIds) {
                await addAutoLog(
                  cid,
                  `Service "${item.name}" permanently deleted`,
                  user?.name || 'System',
                  true
                );
              }
            }
          }
        }
      ),
      {
        loading: `Permanently deleting ${title}...`,
        success: `${title} permanently deleted`,
        error: `Failed to delete ${title}`,
      }
    );
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
    const msg = `${displayField} '${restoredName}' restored`;
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
    const msg = `${displayField} '${deletedName}' permanently deleted`;
    const author = user?.name || user?.email || 'Admin';

    addGlobalLog(msg, 'Setting', category, deletedName, author).then(() => loadLogs());
    toast.success(msg);
  };

  const renderArchiveRow = (item: any) => {
    const isConfirming = confirmArchiveDeleteId === item.id;
    const name = item.companyName || item.name || (typeof item === 'string' ? item : 'Unknown');
    const type = item._archiveType;
    const archivedAt = item.archivedAt
      ? new Date(item.archivedAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null;

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
    let iconBg = 'bg-slate-100 text-slate-600 border-slate-200';
    let typeBadge = 'bg-slate-100 text-slate-600 border-slate-200';
    if (type === 'Client') {
      iconContent = <Building2 className="w-4 h-4" />;
      iconBg = 'bg-blue-50 text-blue-600 border-blue-100';
      typeBadge = 'bg-blue-50/50 text-blue-700 border-blue-200/60';
    } else if (type === 'Project') {
      iconContent = <Home className="w-4 h-4" />;
      iconBg = 'bg-indigo-50 text-indigo-600 border-indigo-100';
      typeBadge = 'bg-indigo-50/50 text-indigo-700 border-indigo-200/60';
    } else if (type === 'Service') {
      iconContent = <Briefcase className="w-4 h-4" />;
      iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-100';
      typeBadge = 'bg-emerald-50/50 text-emerald-700 border-emerald-200/60';
    } else if (isSetting) {
      iconContent = <SettingsIcon className="w-4 h-4" />;
      iconBg = 'bg-slate-50 text-slate-600 border-slate-100';
      typeBadge = 'bg-slate-50/50 text-slate-700 border-slate-200/60';
    }

    return (
      <div
        key={item.id}
        className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 hover:shadow-sm transition-all relative group flex flex-col"
      >
        {isConfirming ? (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 z-20 animate-in fade-in duration-200 border border-red-200 shadow-sm gap-4">
            <div className="flex items-center gap-3 text-sm font-bold text-red-700">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              Permanently delete "{name}"?
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setConfirmArchiveDeleteId(null)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-red-600/20"
              >
                Delete Forever
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${iconBg}`}
            >
              {iconContent}
            </div>
            <div className="min-w-0 pt-0.5 pr-2">
              <TruncatedText text={name} containerClassName="text-sm font-bold text-slate-900">
                {name}
              </TruncatedText>
              {(isSetting || type === 'Project' || type === 'Service') && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {isSetting && (
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-bold capitalize tracking-wide ${typeBadge}`}
                    >
                      {type.toLowerCase()}
                    </span>
                  )}
                  {type === 'Project' && item.clients?.length > 0 && (
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      Client: {item.clients.join(', ')}
                    </span>
                  )}
                  {type === 'Service' && (
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      {item.clients?.length > 0 ? item.clients.join(', ') : 'No Client'}
                      {item.projectName && item.projectName !== 'N/A' && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          {item.projectName}
                        </>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 h-10">
            <div className="flex flex-col items-end transition-all">
              {archivedAt ? (
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  <ArchiveRestore className="w-3.5 h-3.5 text-slate-400" />
                  {archivedAt}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  Legacy Record
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <UITooltip content="Restore Record">
                <button
                  onClick={onRestore}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 focus:outline-none"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </UITooltip>
              <UITooltip content="Permanently Delete">
                <button
                  onClick={() => setConfirmArchiveDeleteId(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 focus:outline-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </UITooltip>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              archivedAt: item.archivedAt || null,
            });
          });
        }
      });
    }
  }

  if (archiveSearch) {
    itemsToRender = itemsToRender.filter((item) => {
      const name = item.companyName || item.name || '';
      return name.toLowerCase().includes(archiveSearch.toLowerCase());
    });
  }

  return (
    <div className="animate-in fade-in duration-300 w-full max-w-5xl h-full flex flex-col relative z-10">
      <div className="space-y-4 mb-8 shrink-0">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Archives</h3>
          <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
            Manage deleted records and settings. Restoring an item will return it to active use.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div className="relative flex items-center bg-slate-100/80 p-1 rounded-xl shadow-inner shrink-0">
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
              className={`relative flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 z-10 whitespace-nowrap ${
                archiveTab === f.id ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {archiveTab === f.id && (
                <motion.div
                  layoutId="archiveFilterIndicator"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <f.icon
                className={`w-4 h-4 ${archiveTab === f.id ? 'text-primary' : 'text-slate-400'}`}
              />{' '}
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search archives..."
            value={archiveSearch}
            onChange={(e) => setArchiveSearch(e.target.value)}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-transparent focus:bg-white focus:border-primary/50 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-thin-scroll pb-8 -mx-2 px-2">
        {itemsToRender.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-16 text-center flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
              <ArchiveRestore className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No archived records</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              There are currently no items matching your search criteria in the archives.
            </p>
          </div>
        ) : (
          <div className="space-y-3">{itemsToRender.map((item) => renderArchiveRow(item))}</div>
        )}
      </div>
    </div>
  );
}
