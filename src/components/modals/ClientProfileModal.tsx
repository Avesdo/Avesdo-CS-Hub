import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Pencil,
  Check,
  ChevronDown,
  Building,
  User,
  Search,
  LayoutDashboard,
  Activity,
  Briefcase,
  Layers,
  History,
  AlertTriangle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import {
  updateClientRecord,
  addAutoLog,
  deleteClientRecord,
  updateProjectRecord,
  updateServiceRecord
} from '../../api/dbService';

// Tabs
import ClientHealthTab from './clientProfile/ClientHealthTab';
import ClientProjectsTab from './clientProfile/ClientProjectsTab';
import ClientServicesTab from './clientProfile/ClientServicesTab';
import { TimelineTab } from '../ui/TimelineTab';

import { Select } from '../ui/Select';
import toast from 'react-hot-toast';
import { renderIcon } from '../../utils/uiUtils';

const TokenTrigger = ({ label, value, icon: Icon, error, onClick, className = '' }: any) => {
  const isSuspended = value === 'Suspended' || value === 'On Hold';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center h-10 px-4 rounded-full border shadow-sm transition-all duration-200 active:scale-95 hover:shadow-md focus:ring-2 w-full justify-between ${
        error ? 'border-destructive bg-white focus:border-destructive focus:ring-destructive/20' : 
        isSuspended ? 'bg-red-50/80 border-red-200 hover:border-red-300 focus:border-red-400 focus:ring-red-500/20' : 
        'bg-white border-slate-200 hover:border-primary/50 focus:border-primary focus:ring-primary/20'
      } ${className}`}
    >
      <div className="flex items-center truncate">
        {Icon && <Icon className={`w-4 h-4 transition-colors mr-2 shrink-0 ${isSuspended ? 'text-red-500 group-hover:text-red-600' : 'text-slate-400 group-hover:text-primary'}`} />}
        <span className={`text-[13px] font-medium mr-2 ${isSuspended ? 'text-red-600/80' : 'text-slate-500'}`}>{label}:</span>
        <span className={`text-[13px] font-semibold truncate ${
          isSuspended ? 'text-red-700' :
          value ? 'text-slate-900' : 'text-slate-400'
        }`}>
          {value || 'Select'}
        </span>
      </div>
      <ChevronDown className={`w-3.5 h-3.5 ml-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isSuspended ? 'text-red-400' : 'text-slate-400'}`} />
    </button>
  );
};

export default function ClientProfileModal() {
  const { isDrawerOpen, getDrawerData, closeDrawer } = useUI();
  const clients = useAppStore(state => state.clients);
  const settings = useAppStore(state => state.settings);
  const projects = useAppStore(state => state.projects);
  const user = useAppStore(state => state.user);
  const services = useAppStore(state => state.services);
  
  const [activeTab, setActiveTab] = useState<
    'health' | 'projects' | 'services' | 'notes'
  >('health');

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const isOpen = isDrawerOpen('client');
  const drawerData = getDrawerData('client');
  const client = clients.find((c) => c.clientId === drawerData?.entityId || c.id === drawerData?.entityId);

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

  useEffect(() => {
    if (isOpen) {
      if (drawerData?.data?.targetTab) {
        setActiveTab(drawerData.data.targetTab as any);
      } else {
        setActiveTab('health');
      }
    }
  }, [isOpen, drawerData?.entityId, drawerData?.data?.targetTab]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditingName(false);
      setPopoverOpen(null);
    }
  }, [isOpen]);

  const handleUpdateName = async () => {
    const oldName = client?.companyName || client?.name || 'Unnamed Client';
    if (!client || !editNameValue.trim() || editNameValue === oldName) {
      setIsEditingName(false);
      return;
    }
    setIsEditingName(false);
    try {
      const newName = editNameValue.trim();
      await updateClientRecord(
        { ...client, companyName: newName, name: newName },
        {
          successMsg: `Client Name successfully updated to '${newName}'`,
          errorMsg: `Failed to update Client Name to '${newName}'`,
        },
        `Client name updated from "${oldName}" to "${newName}"`,
        user?.name
      );

      // Cascade updates
      const projectsToUpdate = projects.filter(p => p.clientIds?.includes(client.clientId || client.id));
      for (const p of projectsToUpdate) {
        const cIds = p.clientIds || [];
        const cNames = p.clients || [];
        const idx = cIds.indexOf(client.clientId || client.id);
        if (idx !== -1) {
          const newCNames = [...cNames];
          newCNames[idx] = newName;
          await updateProjectRecord(
            { ...p, clients: newCNames },
            { successMsg: '', errorMsg: '' },
            `Attached client name updated from "${oldName}" to "${newName}"`,
            user?.name,
            true
          );
        }
      }

      const servicesToUpdate = services.filter(s => s.clientIds?.includes(client.clientId || client.id));
      for (const s of servicesToUpdate) {
        const cIds = s.clientIds || [];
        const cNames = s.clients || [];
        const idx = cIds.indexOf(client.clientId || client.id);
        if (idx !== -1) {
          const newCNames = [...cNames];
          newCNames[idx] = newName;
          await updateServiceRecord(
            { ...s, clients: newCNames },
            true,
            `Attached client name updated from "${oldName}" to "${newName}"`,
            user?.name,
            true
          );
        }
      }
    } catch (err) {
      setEditNameValue(client?.companyName || client?.name || '');
    }
  };

  const handleUpdateType = async (val: string) => {
    if (!client || client.clientType === val) return;
    const oldVal = client.clientType || 'Unassigned';
    await updateClientRecord(
      { ...client, clientType: val },
      {
        successMsg: `Client Type successfully updated`,
        errorMsg: `Failed to update Client Type`,
      },
      `Client Type changed from ${oldVal} to ${val}`,
      user?.name
    );
  };

  const handleUpdateManager = async (val: string) => {
    if (!client || client.accountManager === val) return;
    const oldVal = client.accountManager || 'Unassigned';
    await updateClientRecord(
      { ...client, accountManager: val },
      {
        successMsg: `Account Manager successfully assigned`,
        errorMsg: `Failed to assign Account Manager`,
      },
      `Account Manager changed from ${oldVal} to ${val}`,
      user?.name
    );
  };

  const toggleProjectArrayItem = async (projectId: string, projectName: string) => {
    if (!client) return;
    const targetProject = projects.find(p => p.id === projectId);
    if (!targetProject) return;

    const cIds = targetProject.clientIds || [];
    const cNames = targetProject.clients || [];
    const isRemoving = cIds.includes(client.clientId || client.id);

    let newCIds = [...cIds];
    let newCNames = [...cNames];

    if (isRemoving) {
      newCIds = newCIds.filter((id: string) => id !== (client.clientId || client.id));
      newCNames = newCNames.filter((n: string) => n !== (client.companyName || client.name));
    } else {
      newCIds.push(client.clientId || client.id);
      newCNames.push(client.companyName || client.name);
    }

    const logMsg = isRemoving
      ? `Client "${client.companyName || client.name}" detached from project ${projectName}`
      : `Client "${client.companyName || client.name}" attached to project ${projectName}`;

    await updateProjectRecord(
      {
        ...targetProject,
        clientIds: newCIds,
        clients: newCNames,
      },
      {
        successMsg: `Attached Projects successfully updated`,
        errorMsg: `Failed to update Attached Projects`,
      },
      logMsg,
      user?.name
    );
  };

  const handleDelete = async () => {
    if (!client) return;
    try {
      await deleteClientRecord(client.clientId || client.id, client.companyName || client.name, user?.name || 'System');
      closeDrawer();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      const aName = a.name || '';
      const bName = b.name || '';
      return aName.localeCompare(bName);
    });
    if (!projectSearch) return sorted;
    return sorted.filter((p: any) =>
      (p.name || '').toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [projects, projectSearch]);

  const navItems = [
    { id: 'health', label: 'Health & Trends', icon: Activity },
    { id: 'projects', label: 'Projects', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'notes', label: 'Timeline Log', icon: History },
  ];

  if (!client && isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()} modal={true}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999]"
              />
            </Dialog.Overlay>
            <Dialog.Content
              onEscapeKeyDown={(e) => {
                e.preventDefault();
                closeDrawer();
              }}
              onInteractOutside={(e) => {
                e.preventDefault();
                closeDrawer();
              }}
              asChild
            >
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[95vw] max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 flex"
              >
                {/* LEFT SIDEBAR: Persistent Control Center */}
                <div className="w-[320px] bg-slate-50/80 border-r border-slate-200/60 flex flex-col shrink-0">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    {isEditingName ? (
                      <div className="flex items-start justify-between rounded-xl -mx-3 px-3 py-2 bg-slate-100/50">
                        <textarea
                          ref={(el) => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = el.scrollHeight + 'px';
                            }
                          }}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                          }}
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleUpdateName();
                            }
                            if (e.key === 'Escape') {
                              setEditNameValue(client?.companyName || client?.name || '');
                              setIsEditingName(false);
                            }
                          }}
                          autoFocus
                          rows={1}
                          className="flex-1 w-full min-w-0 bg-transparent border-none p-0 text-2xl font-extrabold text-slate-900 tracking-tight leading-tight resize-none focus:outline-none focus:ring-0 overflow-hidden"
                        />
                        <div className="flex flex-col gap-1 shrink-0 ml-4 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateName();
                            }}
                            className="p-1.5 text-primary/80 hover:text-primary hover:bg-primary/10 rounded-md transition-colors shadow-sm"
                            title="Save"
                          >
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditNameValue(client?.companyName || client?.name || '');
                              setIsEditingName(false);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors shadow-sm"
                            title="Cancel"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="group flex items-start justify-between cursor-pointer rounded-xl -mx-3 px-3 py-2 hover:bg-slate-200/50 transition-colors"
                        onClick={() => setIsEditingName(true)}
                      >
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance break-words">
                          {client?.companyName || client?.name || 'Unnamed Client'}
                        </h2>
                        <Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto custom-thin-scroll px-6 pb-6 flex flex-col gap-5">
                    {/* Top Priority: Metadata Tokens */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <Select
                          options={(settings?.clientTypes?.map((t: any) => t.name) || ['Developer', 'Sales & Marketing']).map((o: string) => ({ label: o, value: o }))}
                          value={client?.clientType || 'Unassigned'}
                          onChange={(val) => handleUpdateType(val)}
                          trigger={
                            <TokenTrigger
                              label="Type"
                              value={client?.clientType || 'Unassigned'}
                              icon={Building}
                            />
                          }
                        />
                      </div>

                      <div>
                        <Select
                          options={(settings?.managers?.map((m: any) => m.name) || []).map((o: string) => ({ label: o, value: o }))}
                          value={client?.accountManager || ''}
                          onChange={(val) => handleUpdateManager(val)}
                          trigger={
                            <TokenTrigger
                              label="Manager"
                              value={client?.accountManager || 'Unassigned'}
                              icon={User}
                            />
                          }
                        />
                      </div>
                    </div>

                    {/* Entities Links */}
                    <div className="flex flex-col gap-6 pt-6 border-t border-slate-200/60">
                      {/* Projects Summary */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[12px] font-bold text-slate-500 tracking-wide">Projects</span>
                        {(() => {
                          const attachedProjects = projects.filter(p => p.clientIds?.includes(client?.clientId || client?.id));
                          if (attachedProjects.length > 0) {
                            const countsByStatus = attachedProjects.reduce((acc, p) => {
                              const status = p.projectStatus || p.status || 'Unknown';
                              acc[status] = (acc[status] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);

                            return (
                              <div className="flex flex-col gap-1.5">
                                {Object.entries(countsByStatus)
                                  .sort((a, b) => b[1] - a[1]) // sort by count descending
                                  .map(([status, count]) => (
                                  <div key={status} className="flex items-center justify-between gap-2 text-[13px] font-medium text-slate-700 bg-slate-100/50 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors">
                                    <div className="flex items-center gap-2 truncate">
                                      {(() => {
                                        const s = settings?.statuses?.find((x: any) => x.name === status);
                                        return s?.icon ? renderIcon(s.icon, 'w-3.5 h-3.5 text-slate-400 shrink-0') : <LayoutDashboard className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
                                      })()}
                                      <span className="truncate">{status}</span>
                                    </div>
                                    <span className="text-[12px] font-bold text-slate-500 shrink-0">
                                      {count}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          } else {
                            return <span className="text-[12px] italic text-slate-400 px-1">None</span>;
                          }
                        })()}
                      </div>

                      {/* Services Summary */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[12px] font-bold text-slate-500 tracking-wide">Services</span>
                        {(() => {
                          const attachedServices = services.filter(s => s.clientIds?.includes(client?.clientId || client?.id));
                          if (attachedServices.length > 0) {
                            const countsByType = attachedServices.reduce((acc, s) => {
                              const type = s.type || s.serviceType || 'Unknown';
                              acc[type] = (acc[type] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);

                            return (
                              <div className="flex flex-col gap-1.5">
                                {Object.entries(countsByType)
                                  .sort((a, b) => b[1] - a[1]) // sort by count descending
                                  .map(([type, count]) => (
                                  <div key={type} className="flex items-center justify-between gap-2 text-[13px] font-medium text-slate-700 bg-slate-100/50 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors">
                                    <div className="flex items-center gap-2 truncate">
                                      {(() => {
                                        const t = settings?.serviceTypes?.find((x: any) => x.name === type);
                                        return t?.icon ? renderIcon(t.icon, 'w-3.5 h-3.5 text-slate-400 shrink-0') : <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
                                      })()}
                                      <span className="truncate">{type}</span>
                                    </div>
                                    <span className="text-[12px] font-bold text-slate-500 shrink-0">
                                      {count}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          } else {
                            return <span className="text-[12px] italic text-slate-400 px-1">None</span>;
                          }
                        })()}
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-4 mt-auto border-t border-slate-200/60">
                      {isConfirmingDelete ? (
                        <div className="flex flex-col gap-2 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                          <p className="text-[11px] font-medium text-red-600 text-center">Archive this client?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsConfirmingDelete(false)}
                              className="flex-1 px-3 py-1.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDelete}
                              className="flex-1 px-3 py-1.5 text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsConfirmingDelete(true)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium text-slate-400 hover:bg-red-50/50 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <LucideIcons.Archive className="w-4 h-4" />
                          Archive Client
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* RIGHT PANE: Main Content */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative rounded-r-3xl">
                  {/* Close Button overlay */}
                  <div className="absolute top-4 right-4 z-50">
                    <button
                      onClick={closeDrawer}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Horizontal Tabs Header */}
                  <div className="flex px-8 pt-4 pb-0 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-40 pr-16 overflow-x-auto custom-thin-scroll">
                    <div className="flex gap-6">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`relative flex items-center gap-2 pb-4 pt-2 transition-colors ${
                              isActive ? 'text-primary font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                            <span className="text-[13px] whitespace-nowrap tracking-wide">{item.label}</span>
                            {isActive && (
                              <motion.div
                                layoutId="activeClientHorizontalTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto custom-thin-scroll p-10 relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        {activeTab === 'health' && <ClientHealthTab client={client} />}
                        {activeTab === 'projects' && <ClientProjectsTab client={client} />}
                        {activeTab === 'services' && <ClientServicesTab client={client} />}
                        {activeTab === 'notes' && client && (
                          <TimelineTab
                            notes={client.notes || []}
                            onSaveNotes={async (updatedNotes: any[]) => {
                              await updateClientRecord({ ...client, notes: updatedNotes } as any, {
                                successMsg: 'Timeline saved.',
                                errorMsg: 'Failed to save timeline.',
                              }, "Timeline updated", user?.name);
                            }}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
