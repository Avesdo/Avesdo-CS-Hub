import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Layers,
  Pencil,
  Check,
  ChevronDown,
  Trash2,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppState } from '../../context/AppStateContext';
import { getSettingBadge, COLOR_MAP, hexToRgba, renderIcon } from '../../utils/uiUtils';
import {
  updateServiceRecord,
  addAutoLog,
  addProjectAutoLog,
  deleteServiceRecord,
  addServiceAutoLog,
} from '../../api/dbService';

import ServiceDetailsTab from './service/ServiceDetailsTab';
import { NotesTab } from '../ui/NotesTab';
import { Select } from '../ui/Select';

export default function ServiceDrawer() {
  const { isDrawerOpen, getDrawerData, closeDrawer, activeDrawers } = useUI();
  const { services, settings, user, clients, projects } = useAppState();
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Auto-hide confirm delete
  useEffect(() => {
    if (isConfirmingDelete) {
      const timer = setTimeout(() => setIsConfirmingDelete(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingDelete]);

  const isOpen = isDrawerOpen('service');
  const drawerData = getDrawerData('service');
  const service = services.find((s) => s.id === drawerData?.entityId);

  const clientNames =
    service?.clientName || (service?.clients?.length ? service.clients.join(', ') : null);
  const projectName =
    service?.projectName && service.projectName !== 'N/A' ? service.projectName : null;

  const relationalContext = clientNames
    ? projectName
      ? `${clientNames} • ${projectName}`
      : `${clientNames} • Client Level Service`
    : 'Orphaned Service';

  useEffect(() => {
    if (service) {
      setEditNameValue(service.name || '');
      setIsConfirmingDelete(false);
    }
  }, [service]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
    }
  }, [isOpen, drawerData?.entityId]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditingName(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateName = async () => {
    if (!service || !editNameValue.trim() || editNameValue === service.name) {
      setIsEditingName(false);
      return;
    }
    setIsEditingName(false);
    try {
      const oldName = service.name || 'Unnamed Service';
      const newName = editNameValue.trim();
      await updateServiceRecord(
        { ...service, name: newName },
        {
          successMsg: `Service Name successfully updated to '${newName}'.`,
          errorMsg: `Failed to update Service Name to '${newName}'.`,
        },
        `Service name updated from "${oldName}" to "${newName}"`,
        user?.name
      );

      if (service.clientIds) {
        for (const cid of service.clientIds) {
          await addAutoLog(
            cid,
            `Service name updated from "${oldName}" to "${newName}"`,
            user?.name || 'System',
            true
          );
        }
      }
      if (service.projectId && service.projectId !== 'N/A') {
        await addProjectAutoLog(
          service.projectId,
          `Service name updated from "${oldName}" to "${newName}"`,
          user?.name || 'System',
          true
        );
      }
    } catch (err) {
      setEditNameValue(service.name || '');
    }
  };

  const handleUpdateManager = async (manager: string) => {
    if (!service || service.manager === manager) return;
    const oldManager = service.manager || 'Unassigned';
    await updateServiceRecord(
      { ...service, manager },
      {
        successMsg: `Manager successfully updated for '${service.name}'.`,
        errorMsg: `Failed to update manager for '${service.name}'.`,
      },
      `Manager changed from ${oldManager} to ${manager}`,
      user?.name
    );
  };

  const handleUpdateStatus = async (status: string) => {
    if (!service || service.status === status) return;
    const oldStatus = service.status || 'Unknown';
    const updates: any = { status };

    if (status === 'Accepted') {
      updates.outcome = 'Won';
    } else if (status === 'Not Accepted') {
      updates.outcome = 'Lost';
    } else if (status === 'Completed') {
      updates.dateVal = new Date().getTime();
      updates.dateStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    await updateServiceRecord(
      { ...service, ...updates },
      {
        successMsg: `Status successfully updated for '${service.name}'.`,
        errorMsg: `Failed to update status for '${service.name}'.`,
      },
      `Status changed from ${oldStatus} to ${status}`,
      user?.name
    );

    if (status === 'Completed') {
      if (service.clientIds) {
        for (const cid of service.clientIds) {
          await addAutoLog(
            cid,
            `Service "${service.name}" status changed from ${oldStatus} to ${status}`,
            user?.name || 'System',
            true
          );
        }
      }
      if (service.projectId && service.projectId !== 'N/A') {
        await addProjectAutoLog(
          service.projectId,
          `Service "${service.name}" status changed from ${oldStatus} to ${status}`,
          user?.name || 'System',
          true
        );
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!service) return;
    setIsConfirmingDelete(false);
    try {
      await deleteServiceRecord(service.id);

      if (service.clientIds) {
        for (const cid of service.clientIds) {
          await addAutoLog(cid, `Service "${service.name}" archived`, user?.name || 'System', true);
        }
      }
      if (service.projectId && service.projectId !== 'N/A') {
        await addProjectAutoLog(
          service.projectId,
          `Service "${service.name}" archived`,
          user?.name || 'System',
          true
        );
      }
      await addServiceAutoLog(service.id, `Service archived`, user?.name || 'System');
      closeDrawer();
    } catch (err) {
      console.error('Failed to archive service', err);
    }
  };

  const tabs = [
    { id: 'details', label: 'Overview' },
    { id: 'notes', label: 'Notes & Logs' },
  ] as const;

  const drawerIndex = activeDrawers.findIndex((d) => d.type === 'service');
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
        className={`fixed top-0 right-0 h-full w-full max-w-[600px] bg-white border-l border-border flex flex-col shadow-2xl ${drawerData?.isClosing ? 'animate-out slide-out-to-right fade-out' : 'animate-in slide-in-from-right'} duration-300 ease-in-out transform-gpu`}
        style={{ zIndex: zIndexDrawer }}
      >
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center gap-6 relative shrink-0">
          <div className="shrink-0">
            {(() => {
              const serviceType = settings?.serviceTypes?.find(
                (t: any) => t.name === service?.type
              );
              const hex = serviceType
                ? COLOR_MAP[serviceType.color] || COLOR_MAP.slate
                : COLOR_MAP.slate;
              return (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm border transition-colors"
                  style={{
                    backgroundColor: hexToRgba(hex, 0.1),
                    color: hex,
                    borderColor: hexToRgba(hex, 0.2),
                  }}
                  title={service?.type || 'Unknown Type'}
                >
                  {renderIcon(serviceType?.icon, 'w-6 h-6')}
                </div>
              );
            })()}
          </div>

          <div className="flex-1 min-w-0 pr-20 flex flex-col justify-center py-2 relative">
            <div className="flex items-center gap-3 group mb-1">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    autoFocus
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateName();
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setEditNameValue(service?.name || '');
                        setIsEditingName(false);
                      }
                    }}
                    className="text-2xl font-semibold text-foreground tracking-tight leading-tight w-full bg-transparent border-b-2 border-primary outline-none px-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    onClick={handleUpdateName}
                    className="p-1 hover:bg-emerald-50 rounded-md text-emerald-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditNameValue(service?.name || '');
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
                    {service?.name || 'Loading Service...'}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all active:scale-95 shrink-0"
                    title="Edit Name"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <span className="text-sm text-muted-foreground mb-2 truncate block">
              {relationalContext}
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative inline-block">
                  <Select
                    value={service?.manager || 'Unassigned'}
                    options={(settings?.managers?.map((m: any) => m.name) || []).map((m: any) => ({
                      label: getSettingBadge('managers', m, settings),
                      value: m,
                    }))}
                    onChange={handleUpdateManager}
                    hideCheckmark={true}
                    trigger={
                      <button className="hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-block">
                        {getSettingBadge('managers', service?.manager || 'Unassigned', settings)}
                      </button>
                    }
                  />
                </div>
                <div className="relative inline-block">
                  <Select
                    value={service?.status || 'Not Set'}
                    options={(
                      (settings?.settingsData || [])
                        .filter((s: any) => s.category === 'ServiceStatus')
                        .map((s: any) => s.name) || []
                    ).map((s: any) => ({
                      label: getSettingBadge('serviceStatuses', s, settings),
                      value: s,
                    }))}
                    onChange={handleUpdateStatus}
                    hideCheckmark={true}
                    trigger={
                      <button className="hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-block">
                        {getSettingBadge('serviceStatuses', service?.status || 'Not Set', settings)}
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-1">
            {isConfirmingDelete ? (
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-red-300 rounded-md text-red-600 bg-white hover:bg-red-50 font-semibold shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <AlertTriangle className="w-4 h-4" /> Confirm Archive
              </button>
            ) : (
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                title="Archive Service"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={closeDrawer}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 duration-200"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
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

        <div className="flex-1 overflow-y-auto p-6 custom-thin-scroll bg-white">
          {activeTab === 'details' && <ServiceDetailsTab service={service} />}
          {activeTab === 'notes' && (
            <NotesTab
              notes={service?.notes || []}
              onSaveNotes={async (updatedNotes) => {
                if (!service) return;
                await updateServiceRecord({ ...service, notes: updatedNotes } as any, {
                  successMsg: `Note successfully added for '${service.name}'.`,
                  errorMsg: `Failed to add note for '${service.name}'.`,
                });
              }}
              emptyStateMessage="Be the first to add a note to this service."
            />
          )}
        </div>
      </div>
    </>
  );
}
