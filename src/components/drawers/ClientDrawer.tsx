import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Building2,
  Info,
  Pencil,
  ChevronDown,
  Check,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import { getSettingBadge } from '../../utils/uiUtils';
import { calculateClientHealth } from '../../utils/scoringUtils';
import {
  updateClientRecord,
  deleteClientRecord,
  updateProjectRecord,
  updateServiceRecord,
  addAutoLog,
  addServiceAutoLog,
  addProjectAutoLog,
} from '../../api/dbService';

import ClientHealthTab from './client/ClientHealthTab';
import ClientTrendsTab from './client/ClientTrendsTab';
import ClientProjectsTab from './client/ClientProjectsTab';
import ClientServicesTab from './client/ClientServicesTab';
import { NotesTab } from '../ui/NotesTab';
import { Select } from '../ui/Select';
import { Tooltip } from '../ui/Tooltip';

export default function ClientDrawer() {
  const { isDrawerOpen, getDrawerData, closeDrawer, activeDrawers } = useUI();
  const { clients, projects, settings, user, services } = useAppStore();
  const [activeTab, setActiveTab] = useState<
    'health' | 'trends' | 'projects' | 'services' | 'notes'
  >('health');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isOpen = isDrawerOpen('client');
  const drawerData = getDrawerData('client');
  const client = clients.find(
    (c) => c.clientId === drawerData?.entityId || c.id === drawerData?.entityId
  );

  // Auto-hide confirm delete
  useEffect(() => {
    if (isConfirmingDelete) {
      const timer = setTimeout(() => setIsConfirmingDelete(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingDelete]);

  useEffect(() => {
    if (client) {
      setEditNameValue(client.companyName || client.name || '');
      setIsConfirmingDelete(false);
    }
  }, [client]);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(drawerData?.data?.targetTab || 'health');
    }
  }, [isOpen, drawerData?.entityId, drawerData?.data?.targetTab]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditingName(false);
    }
  }, [isOpen]);

  if (!isOpen || !client) return null;

  const handleSaveName = async () => {
    if (!client || !editNameValue.trim() || editNameValue === (client.companyName || client.name)) {
      setIsEditingName(false);
      return;
    }
    setIsEditingName(false);
    try {
      const oldName = client.companyName || client.name;
      const newName = editNameValue.trim();
      await updateClientRecord(
        { ...client, companyName: newName, name: newName },
        {
          successMsg: `Client Name successfully updated to '${newName}'.`,
          errorMsg: `Failed to update Client Name to '${newName}'.`,
        },
        `Client Name updated from "${oldName}" to "${newName}"`,
        user?.name
      );

      // Cascade to projects and services
      const projectsToUpdate = projects.filter((p: any) =>
        p.clientIds?.includes(client.clientId || client.id)
      );
      if (projectsToUpdate.length > 0) {
        const projectPromises = projectsToUpdate.map((p: any) => {
          const updatedClients = p.clients.map((c: any) => (c === oldName ? newName : c));
          return updateProjectRecord(
            { ...p, clients: updatedClients },
            true,
            `Client name updated from "${oldName}" to "${newName}"`,
            user?.name,
            true
          );
        });
        await Promise.all(projectPromises);
      }
      const servicesToUpdate = services.filter((s: any) =>
        s.clientIds?.includes(client.clientId || client.id)
      );
      if (servicesToUpdate.length > 0) {
        const servicePromises = servicesToUpdate.map(async (s: any) => {
          const updatedClients = s.clients.map((c: any) => (c === oldName ? newName : c));
          await updateServiceRecord(
            { ...s, clients: updatedClients },
            true,
            `Attached client name updated from "${oldName}" to "${newName}"`,
            user?.name,
            true
          );
        });
        await Promise.all(servicePromises);
      }
    } catch (err) {
      setEditNameValue(client.companyName || client.name || '');
    }
  };

  const handleUpdateType = async (type: string) => {
    if (!client || client.clientType === type) return;
    const oldType = client.clientType || 'Unknown';
    await updateClientRecord(
      { ...client, clientType: type },
      {
        successMsg: `Client Type successfully updated for '${client.companyName || client.name}'.`,
        errorMsg: `Failed to update Client Type for '${client.companyName || client.name}'.`,
      },
      `Client Type changed from ${oldType} to ${type}`,
      user?.name
    );
  };

  const handleUpdateManager = async (manager: string) => {
    if (!client || client.accountManager === manager) return;
    const oldManager = client.accountManager || 'Unassigned';
    await updateClientRecord(
      { ...client, accountManager: manager },
      {
        successMsg: `Manager successfully assigned for '${client.companyName || client.name}'.`,
        errorMsg: `Failed to assign Manager for '${client.companyName || client.name}'.`,
      },
      `Manager changed from ${oldManager} to ${manager || 'Unassigned'}`,
      user?.name
    );
  };

  const handleDelete = async () => {
    if (!client) return;
    if (window.confirm(`Are you sure you want to delete ${client.companyName || client.name}?`)) {
      await deleteClientRecord(client.clientId || client.id, client.companyName || client.name);
      closeDrawer();
    }
  };

  const tabs = [
    { id: 'health', label: 'Health' },
    { id: 'trends', label: 'Trends' },
    { id: 'projects', label: 'Projects' },
    { id: 'services', label: 'Services' },
    { id: 'notes', label: 'Notes & Logs' },
  ] as const;

  const healthResult = calculateClientHealth(client, projects, settings);
  const hasSuspendedProjects = healthResult.hasSuspended;
  const healthScore =
    client?.activeProjectCount === 0 && !hasSuspendedProjects ? 'N/A' : healthResult.totalScore;

  const drawerIndex = activeDrawers.findIndex((d) => d.type === 'client');
  const zIndexOverlay = 100 + Math.max(0, drawerIndex) * 20;
  const zIndexDrawer = 110 + Math.max(0, drawerIndex) * 20;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer ${drawerData?.isClosing ? 'animate-out fade-out' : 'animate-in fade-in'} duration-300 ease-in-out transform-gpu`}
        style={{ zIndex: zIndexOverlay }}
        onClick={closeDrawer}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[700px] bg-white shadow-2xl flex flex-col border-l border-border ${drawerData?.isClosing ? 'animate-out slide-out-to-right fade-out' : 'animate-in slide-in-from-right'} duration-300 ease-in-out transform-gpu`}
        style={{ zIndex: zIndexDrawer }}
      >
        {hasSuspendedProjects && (
          <div className="bg-red-50 text-red-600 border-b border-red-200 px-6 py-3 text-sm font-semibold flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>This client has projects that are suspended due to outstanding invoices.</span>
          </div>
        )}

        {client?.activeProjectCount === 0 && !hasSuspendedProjects && (
          <div className="bg-muted/50 text-muted-foreground border-b border-border px-6 py-3 text-sm font-semibold flex items-center gap-2 shrink-0">
            <Info className="w-5 h-5 shrink-0 text-muted-foreground" />
            <span>
              This client currently has no Active projects. Health metrics are paused until a
              project goes live.
            </span>
          </div>
        )}

        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center gap-6 relative shrink-0">
          <div className="gauge-container shrink-0">
            <svg className="gauge-svg" viewBox="0 0 100 100">
              <circle className="gauge-bg" cx="50" cy="50" r="42" />
              <circle
                className={`gauge-fill ${healthScore === 'N/A' ? 'text-slate-200' : (healthScore as number) < 50 ? 'text-red-600' : (healthScore as number) < 80 ? 'text-amber-600' : 'text-lime-600'}`}
                cx="50"
                cy="50"
                r="42"
                strokeDasharray="264"
                strokeDashoffset="264"
                style={{
                  strokeDashoffset:
                    healthScore === 'N/A' ? 0 : 264 - (264 * (healthScore as number)) / 100,
                  stroke: 'currentcolor',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`leading-none font-bold ${healthScore === 'N/A' ? 'text-slate-400 text-[22px]' : (healthScore as number) < 50 ? 'text-red-600 text-[30px]' : (healthScore as number) < 80 ? 'text-amber-600 text-[30px]' : 'text-lime-600 text-[30px]'}`}
              >
                {healthScore}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">Health</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 pr-20 flex flex-col justify-center py-2 relative">
            <div className="flex items-center gap-3 group mb-1">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    autoFocus
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setEditNameValue(client?.companyName || client?.name || '');
                        setIsEditingName(false);
                      }
                    }}
                    className="text-2xl font-semibold text-foreground tracking-tight leading-tight w-full bg-transparent border-b-2 border-primary outline-none px-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 hover:bg-emerald-50 rounded-md text-emerald-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditNameValue(client?.companyName || client?.name || '');
                      setIsEditingName(false);
                    }}
                    className="p-1 hover:bg-muted rounded-md text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-foreground tracking-tight leading-tight truncate">
                    {client?.companyName || client?.name}
                  </h2>
                  <Tooltip content="Edit Name" position="bottom">
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all active:scale-95 shrink-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 group relative">
              <div className="relative inline-block">
                <Select
                  value={client?.clientType || 'Standard'}
                  options={(settings?.clientTypes?.map((t: any) => t.name) || []).map((t: any) => ({
                    label: getSettingBadge('clientTypes', t, settings),
                    value: t,
                  }))}
                  onChange={handleUpdateType}
                  hideCheckmark={true}
                  trigger={
                    <button className="hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-block">
                      {getSettingBadge('clientTypes', client?.clientType || 'Standard', settings)}
                    </button>
                  }
                />
              </div>
              <div className="relative inline-block">
                <Select
                  value={client?.accountManager || 'Unassigned'}
                  options={(settings?.managers?.map((m: any) => m.name) || []).map((m: any) => ({
                    label: getSettingBadge('managers', m, settings),
                    value: m,
                  }))}
                  onChange={handleUpdateManager}
                  hideCheckmark={true}
                  trigger={
                    <button className="hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-block">
                      {getSettingBadge(
                        'managers',
                        client?.accountManager || 'Unassigned',
                        settings
                      )}
                    </button>
                  }
                />
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1">
            {isConfirmingDelete ? (
              <button
                onClick={async () => {
                  if (client) {
                    const cid = client.clientId || client.id;
                    const cname = client.companyName || client.name || 'Record';
                    await deleteClientRecord(cid, cname);
                    await addAutoLog(cid, `Client profile archived`, user?.name || 'System');
                    const cProjects = projects.filter((p: any) => p.clientIds?.includes(cid));
                    for (const p of cProjects)
                      await addProjectAutoLog(
                        p.id,
                        `Client "${client.companyName || client.name}" archived`,
                        user?.name || 'System',
                        true
                      );
                    const cServices = services.filter((s: any) => s.clientIds?.includes(cid));
                    for (const s of cServices)
                      await addServiceAutoLog(
                        s.id,
                        `Attached Client "${client.companyName || client.name}" archived`,
                        user?.name || 'System',
                        true
                      );
                    closeDrawer();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-red-300 rounded-md text-red-600 bg-white hover:bg-red-50 font-semibold shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <AlertTriangle className="w-4 h-4" /> Confirm Archive
              </button>
            ) : (
              <Tooltip content="Archive Client" position="bottom-right">
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Close Drawer" position="bottom-right">
              <button
                onClick={closeDrawer}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="bg-slate-50 shrink-0 border-b border-border">
          <div role="tablist" className="flex overflow-x-auto px-6 custom-thin-scroll -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                data-state={activeTab === tab.id ? 'active' : 'inactive'}
                className={`relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all active:scale-95 whitespace-nowrap outline-none ${activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white custom-thin-scroll">
          {activeTab === 'health' && <ClientHealthTab client={client} />}
          {activeTab === 'trends' && <ClientTrendsTab client={client} />}
          {activeTab === 'projects' && <ClientProjectsTab client={client} />}
          {activeTab === 'services' && <ClientServicesTab client={client} />}
          {activeTab === 'notes' && (
            <NotesTab
              notes={client?.notes || []}
              onSaveNotes={async (updatedNotes) => {
                if (!client) return;
                await updateClientRecord({ ...client, notes: updatedNotes } as any, {
                  successMsg: `Note successfully added for '${client.companyName || client.name}'.`,
                  errorMsg: `Failed to add note for '${client.companyName || client.name}'.`,
                });
              }}
              emptyStateMessage="Be the first to add a note or make changes to generate system logs."
            />
          )}
        </div>
      </div>
    </>
  );
}
