import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Pencil,
  Check,
  ChevronDown,
  AlertTriangle,
  Trash2,
  Calendar,
  Building,
  Users,
  Search,
  Plus,
  LayoutDashboard,
  ClipboardList,
  Activity,
  Layers,
  FileText,
  Target
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import { getSettingBadge } from '../../utils/uiUtils';
import {
  updateProjectRecord,
  addAutoLog,
  deleteProjectRecord,
  updateServiceRecord,
} from '../../api/dbService';

// Tabs
import ProjectOverviewTab from './projectProfile/ProjectOverviewTab';
import ProjectOnboardingTab from './projectProfile/ProjectOnboardingTab';
import ProjectHealthTab from './projectProfile/ProjectHealthTab';
import ProjectServicesTab from './projectProfile/ProjectServicesTab';
import { NotesTab } from '../ui/NotesTab';

import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import toast from 'react-hot-toast';

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

export default function ProjectProfileModal() {
  const { isDrawerOpen, getDrawerData, closeDrawer, activeDrawers } = useUI();
  const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);
  const clients = useAppStore(state => state.clients);
  const user = useAppStore(state => state.user);
  const services = useAppStore(state => state.services);
  
  const [activeTab, setActiveTab] = useState<
    'overview' | 'onboarding' | 'health' | 'services' | 'notes'
  >('overview');

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const isOpen = isDrawerOpen('project');
  const drawerData = getDrawerData('project');
  const isClosing = drawerData?.isClosing;
  const project = projects.find((p) => p.id === drawerData?.entityId);

  useEffect(() => {
    if (isConfirmingDelete) {
      const timer = setTimeout(() => setIsConfirmingDelete(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingDelete]);

  useEffect(() => {
    if (project) {
      setEditNameValue(project.name || '');
      setIsConfirmingDelete(false);
    }
  }, [project]);

  useEffect(() => {
    if (isOpen) {
      if (drawerData?.data?.targetTab) {
        setActiveTab(drawerData.data.targetTab as any);
      } else if (project?.projectStatus === 'Onboarding') {
        setActiveTab('onboarding');
      } else {
        setActiveTab('overview');
      }
    }
  }, [isOpen, drawerData?.entityId, drawerData?.data?.targetTab, project?.projectStatus]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditingName(false);
      setPopoverOpen(null);
    }
  }, [isOpen]);

  const handleUpdateName = async () => {
    if (!project || !editNameValue.trim() || editNameValue === project.name) {
      setIsEditingName(false);
      return;
    }
    setIsEditingName(false);
    try {
      const oldName = project.name || 'Unnamed Project';
      const newName = editNameValue.trim();
      await updateProjectRecord(
        { ...project, name: newName },
        {
          successMsg: `Project Name successfully updated to '${newName}'.`,
          errorMsg: `Failed to update Project Name to '${newName}'.`,
        },
        `Project name updated from "${oldName}" to "${newName}"`,
        user?.name
      );

      const servicesToUpdate = services.filter(
        (s: any) =>
          s.projectId === project.id || (s.projectIds && s.projectIds.includes(project.id))
      );
      if (servicesToUpdate.length > 0) {
        const servicePromises = servicesToUpdate.map(async (s: any) => {
          await updateServiceRecord(
            { ...s, projectName: newName },
            true,
            `Attached project name updated from "${oldName}" to "${newName}"`,
            user?.name,
            true
          );
        });
        await Promise.all(servicePromises);
      }

      if (project.clientIds) {
        await Promise.all(
          project.clientIds.map(async (cid: string) => {
            await addAutoLog(
              cid,
              `Project name updated from "${oldName}" to "${newName}"`,
              user?.name || 'System',
              true
            );
          })
        );
      }
    } catch (err) {
      setEditNameValue(project.name || '');
    }
  };

  const handleUpdateStatus = async (val: string) => {
    if (!project || project.status === val) return;
    const oldVal = project.status || 'Active';
    const logMsg = `Status changed from ${oldVal} to ${val}`;
    await updateProjectRecord(
      {
        ...project,
        status: val as 'Active' | 'On Hold' | 'Completed' | 'Churned' | 'Pipeline' | 'Cancelled',
        projectStatus: val as 'Active' | 'On Hold' | 'Completed' | 'Churned' | 'Pipeline' | 'Cancelled',
      },
      {
        successMsg: `Status successfully updated for '${project?.name}'.`,
        errorMsg: `Failed to update status for '${project?.name}'.`,
      },
      logMsg,
      user?.name
    );

    if (project.clientIds) {
      for (const cid of project.clientIds)
        await addAutoLog(
          cid,
          `Project "${project.name}" Status changed from ${oldVal} to ${val}`,
          user?.name || 'System',
          true
        );
    }
  };

  const handleUpdateManager = async (val: string) => {
    if (!project || project.assignee === val) return;
    const oldVal = project.assignee || 'Unassigned';
    await updateProjectRecord(
      { ...project, assignee: val },
      {
        successMsg: `Account Manager successfully assigned for '${project.name}'.`,
        errorMsg: `Failed to assign Account Manager for '${project.name}'.`,
      },
      `Assignee changed from ${oldVal} to ${val}`,
      user?.name
    );
  };

  const handleUpdateGeneric = async (field: string, value: any) => {
    if (!project || project[field] === value) return;
    try {
      const updates: any = { [field]: value };
      let actionLog = '';
      
      if (field === 'releaseDateVal') {
        if (value) {
          const parsed = new Date(value);
          if (!isNaN(parsed.getTime())) {
            updates.releaseDateStr = parsed.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            actionLog = `Release Date changed to ${updates.releaseDateStr}`;
          }
        } else {
          updates.releaseDateStr = '';
          actionLog = `Release Date cleared`;
        }
      } else if (field === 'units') {
        actionLog = `Live Units updated to ${value}`;
      }

      await updateProjectRecord(
        { ...project, ...updates },
        { successMsg: `Updated successfully.`, errorMsg: `Failed to update.` },
        actionLog,
        user?.name
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleClientArrayItem = async (clientId: string, clientName: string) => {
    if (!project) return;
    const cIds = project.clientIds || [];
    const cNames = project.clients || [];
    const isRemoving = cIds.includes(clientId);

    let newCIds = [...cIds];
    let newCNames = [...cNames];

    const client = clients.find((c) => c.clientId === clientId || c.id === clientId);
    const isDev = client?.clientType === 'Developer';
    const isSM = client?.clientType === 'Sales & Marketing';

    let newDevIds = project.developerIds || [];
    let newDevNames = project.developers || [];
    let newSMIds = project.salesMarketingIds || [];
    let newSMNames = project.salesMarketingClients || [];

    if (isRemoving) {
      newCIds = newCIds.filter((id: string) => id !== clientId);
      newCNames = newCNames.filter((n: string) => n !== clientName);
      if (isDev) {
        newDevIds = newDevIds.filter((id: string) => id !== clientId);
        newDevNames = newDevNames.filter((n: string) => n !== clientName);
      } else if (isSM) {
        newSMIds = newSMIds.filter((id: string) => id !== clientId);
        newSMNames = newSMNames.filter((n: string) => n !== clientName);
      } else {
        newDevIds = newDevIds.filter((id: string) => id !== clientId);
        newDevNames = newDevNames.filter((n: string) => n !== clientName);
      }
    } else {
      newCIds.push(clientId);
      newCNames.push(clientName);
      if (isDev) {
        newDevIds.push(clientId);
        newDevNames.push(clientName);
      } else if (isSM) {
        newSMIds.push(clientId);
        newSMNames.push(clientName);
      } else {
        newDevIds.push(clientId);
        newDevNames.push(clientName);
      }
    }

    const logMsg = isRemoving
      ? `Project "${project.name}" detached from client ${clientName}`
      : `Project "${project.name}" attached to client ${clientName}`;

    await updateProjectRecord(
      {
        ...project,
        clientIds: newCIds,
        clients: newCNames,
        developerIds: newDevIds,
        developers: newDevNames,
        salesMarketingIds: newSMIds,
        salesMarketingClients: newSMNames,
      },
      {
        successMsg: `Attached Clients successfully updated for '${project.name}'.`,
        errorMsg: `Failed to update Attached Clients for '${project.name}'.`,
      },
      logMsg,
      user?.name
    );

    // Cascade update child services
    const childServices = services.filter(
      (s: any) => s.projectId === project.id || (s.projectIds && s.projectIds.includes(project.id))
    );
    for (const svc of childServices) {
      const sCIds = svc.clientIds || [];
      const sCNames = svc.clients || [];
      let svcNewCIds = [...sCIds];
      let svcNewCNames = [...sCNames];

      if (isRemoving) {
        svcNewCIds = svcNewCIds.filter((id: string) => id !== clientId);
        svcNewCNames = svcNewCNames.filter((n: string) => n !== clientName);
      } else {
        if (!svcNewCIds.includes(clientId)) svcNewCIds.push(clientId);
        if (!svcNewCNames.includes(clientName)) svcNewCNames.push(clientName);
      }

      await updateServiceRecord({ ...svc, clientIds: svcNewCIds, clients: svcNewCNames }, true);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    try {
      await deleteProjectRecord(project.id, {
        successMsg: `Project '${project.name}' deleted successfully.`,
        errorMsg: `Failed to delete '${project.name}'.`,
      });

      if (project.clientIds) {
        await Promise.all(
          project.clientIds.map(async (cid: string) => {
            await addAutoLog(cid, `Project "${project.name}" was deleted.`, user?.name || 'System', true);
          })
        );
      }
      closeDrawer();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = useMemo(() => {
    const sorted = [...clients].sort((a, b) => {
      const aName = a.companyName || a.name || '';
      const bName = b.companyName || b.name || '';
      return aName.localeCompare(bName);
    });
    if (!clientSearch) return sorted;
    return sorted.filter((c: any) =>
      (c.companyName || c.name || '').toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clients, clientSearch]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'onboarding', label: 'Onboarding', icon: ClipboardList },
    { id: 'health', label: 'Health & Trends', icon: Activity },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'notes', label: 'Activity Logs', icon: FileText },
  ];

  if (!project && isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()} modal={false}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[99]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[95vw] max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 flex"
                onEscapeKeyDown={(e) => {
                  e.preventDefault();
                  closeDrawer();
                }}
                onInteractOutside={(e) => {
                  e.preventDefault();
                  closeDrawer();
                }}
              >
                {/* LEFT SIDEBAR: Persistent Control Center */}
                <div className="w-[320px] bg-slate-50/80 border-r border-slate-200/60 flex flex-col shrink-0">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Project Profile</span>
                      </div>
                    {isEditingName ? (
                      <div className="flex flex-col gap-2 -mx-3 px-3 py-3 bg-slate-50 border border-primary/20 rounded-xl shadow-inner mb-1">
                        <textarea
                          value={editNameValue}
                          onChange={(e) => {
                            setEditNameValue(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleUpdateName();
                            }
                            if (e.key === 'Escape') {
                              setEditNameValue(project?.name || '');
                              setIsEditingName(false);
                            }
                          }}
                          autoFocus
                          rows={2}
                          placeholder="Project Name"
                          className="w-full bg-transparent border-none p-0 text-2xl font-extrabold text-slate-800 tracking-tight leading-tight text-balance resize-none focus:ring-0 focus:outline-none custom-thin-scroll"
                        />
                        <div className="flex justify-end gap-2 mt-1">
                          <button
                            onClick={() => {
                              setEditNameValue(project?.name || '');
                              setIsEditingName(false);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateName}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="group flex items-start justify-between cursor-pointer rounded-xl -mx-3 px-3 py-2 hover:bg-slate-200/50 transition-colors"
                        onClick={() => setIsEditingName(true)}
                      >
                        <h2 
                          title={project?.name}
                          className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-2"
                        >
                          {project?.name || 'Unnamed Project'}
                        </h2>
                        <Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto custom-thin-scroll px-6 pb-6 flex flex-col gap-8">
                    {/* Top Priority: Metadata Tokens */}
                    <div className="flex flex-col gap-3">
                      <Popover.Root open={popoverOpen === 'status'} onOpenChange={(o) => setPopoverOpen(o ? 'status' : null)}>
                        <Popover.Trigger asChild>
                          <div>
                            <TokenTrigger
                              label="Status"
                              value={project?.status || 'Active'}
                              icon={Activity}
                            />
                          </div>
                        </Popover.Trigger>
                        <Popover.Content sideOffset={4} className="z-[110] w-[260px]">
                          <Select
                            options={['Pipeline', 'Onboarding', 'Active', 'On Hold', 'Completed', 'Cancelled', 'Churned']}
                            value={project?.status || 'Active'}
                            onChange={(val) => {
                              handleUpdateStatus(val);
                              setPopoverOpen(null);
                            }}
                            label="Project Status"
                          />
                        </Popover.Content>
                      </Popover.Root>

                      <Popover.Root open={popoverOpen === 'manager'} onOpenChange={(o) => setPopoverOpen(o ? 'manager' : null)}>
                        <Popover.Trigger asChild>
                          <div>
                            <TokenTrigger
                              label="Manager"
                              value={project?.assignee || 'Unassigned'}
                              icon={Users}
                            />
                          </div>
                        </Popover.Trigger>
                        <Popover.Content sideOffset={4} className="z-[110] w-[260px]">
                          <Select
                            options={settings.accountManagers || []}
                            value={project?.assignee || ''}
                            onChange={(val) => {
                              handleUpdateManager(val);
                              setPopoverOpen(null);
                            }}
                            label="Account Manager"
                          />
                        </Popover.Content>
                      </Popover.Root>

                      <Popover.Root open={popoverOpen === 'releaseDate'} onOpenChange={(o) => setPopoverOpen(o ? 'releaseDate' : null)}>
                        <Popover.Trigger asChild>
                          <div>
                            <TokenTrigger
                              label="Release"
                              value={project?.releaseDateVal ? new Date(project.releaseDateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date'}
                              icon={Calendar}
                            />
                          </div>
                        </Popover.Trigger>
                        <Popover.Content sideOffset={4} className="z-[110] bg-white rounded-2xl shadow-xl border border-slate-200/60 p-1">
                          <DatePicker
                            value={project?.releaseDateVal}
                            onChange={(val) => {
                              handleUpdateGeneric('releaseDateVal', val);
                              setPopoverOpen(null);
                            }}
                            label="Release Date"
                          />
                        </Popover.Content>
                      </Popover.Root>

                      <div className="relative group/input mt-1">
                        <label className="sr-only">Live Units</label>
                        <div className="relative transition-transform duration-200 group-hover/input:translate-x-1">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                             <Building className="w-4 h-4 text-slate-400 group-hover/input:text-primary transition-colors" />
                             <span className="text-[13px] font-medium text-slate-500">Units:</span>
                          </div>
                          <input
                            type="number"
                            className="w-full h-10 rounded-full border border-slate-200 bg-white pl-[84px] pr-4 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-[13px] font-semibold text-slate-900 transition-all hover:border-primary/50 hover:shadow-md"
                            defaultValue={project?.units || 0}
                            onBlur={(e) => handleUpdateGeneric('units', parseInt(e.target.value) || 0)}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                          />
                        </div>
                    </div>

                    {/* Entities Links */}
                    <div className="flex flex-col gap-6 pt-6 border-t border-slate-200/60">
                      {/* Developer Clients */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Developer Clients</span>
                        {project?.developers?.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {project.developers.map((cName: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200/60 px-3 py-2 rounded-xl shadow-sm">
                                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{cName}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[12px] italic text-slate-400 px-1">None attached</span>
                        )}
                        <Popover.Root open={popoverOpen === 'devClients'} onOpenChange={(o) => setPopoverOpen(o ? 'devClients' : null)}>
                          <Popover.Trigger asChild>
                            <button className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 mt-1 transition-colors px-1 w-max">
                              <Plus className="w-3.5 h-3.5" />
                              Add Developer
                            </button>
                          </Popover.Trigger>
                          <Popover.Content side="right" sideOffset={12} className="z-[110] w-[300px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[300px]">
                            <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                              <Search className="w-4 h-4 text-slate-400 ml-2" />
                              <input
                                type="text"
                                placeholder="Search developers..."
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                autoFocus
                              />
                            </div>
                            <div className="overflow-y-auto p-1 custom-thin-scroll">
                              {filteredClients
                                .filter((c) => c.clientType === 'Developer' || !c.clientType)
                                .map((c) => {
                                  const isSelected = project?.developerIds?.includes(c.clientId || c.id) || project?.clientIds?.includes(c.clientId || c.id);
                                  return (
                                    <button
                                      key={c.clientId || c.id}
                                      onClick={() => toggleClientArrayItem(c.clientId || c.id, c.companyName)}
                                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${isSelected ? 'bg-primary/5 text-primary font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                                    >
                                      <span className="truncate text-left">{c.companyName}</span>
                                      {isSelected && <Check className="w-4 h-4 shrink-0" />}
                                    </button>
                                  );
                                })}
                            </div>
                          </Popover.Content>
                        </Popover.Root>
                      </div>

                      {/* Sales & Marketing Clients */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sales & Marketing</span>
                        {project?.salesMarketingClients?.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {project.salesMarketingClients.map((cName: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200/60 px-3 py-2 rounded-xl shadow-sm">
                                <Target className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{cName}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[12px] italic text-slate-400 px-1">None attached</span>
                        )}
                        <Popover.Root open={popoverOpen === 'smClients'} onOpenChange={(o) => setPopoverOpen(o ? 'smClients' : null)}>
                          <Popover.Trigger asChild>
                            <button className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 mt-1 transition-colors px-1 w-max">
                              <Plus className="w-3.5 h-3.5" />
                              Add Sales/Marketing
                            </button>
                          </Popover.Trigger>
                          <Popover.Content side="right" sideOffset={12} className="z-[110] w-[300px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[300px]">
                            <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                              <Search className="w-4 h-4 text-slate-400 ml-2" />
                              <input
                                type="text"
                                placeholder="Search sales & marketing..."
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                autoFocus
                              />
                            </div>
                            <div className="overflow-y-auto p-1 custom-thin-scroll">
                              {filteredClients
                                .filter((c) => c.clientType === 'Sales & Marketing')
                                .map((c) => {
                                  const isSelected = project?.salesMarketingIds?.includes(c.clientId || c.id) || project?.clientIds?.includes(c.clientId || c.id);
                                  return (
                                    <button
                                      key={c.clientId || c.id}
                                      onClick={() => toggleClientArrayItem(c.clientId || c.id, c.companyName)}
                                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${isSelected ? 'bg-primary/5 text-primary font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                                    >
                                      <span className="truncate text-left">{c.companyName}</span>
                                      {isSelected && <Check className="w-4 h-4 shrink-0" />}
                                    </button>
                                  );
                                })}
                            </div>
                          </Popover.Content>
                        </Popover.Root>
                      </div>
                    </div>

                    {/* Secondary Navigation (Vertical Tabs) */}
                    <div className="flex flex-col gap-1 pt-6 border-t border-slate-200/60 mt-auto">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                              isActive 
                                ? 'bg-white text-primary shadow-sm border border-slate-200/60 font-bold' 
                                : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 font-medium'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                            <span className="text-[13px] tracking-wide">{item.label}</span>
                            {isActive && (
                              <motion.div
                                layoutId="activeProfileTab"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 mt-6 border-t border-slate-200/60">
                      {isConfirmingDelete ? (
                        <div className="flex flex-col gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                          <p className="text-[11px] font-semibold text-red-600 text-center">Are you sure? This cannot be undone.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsConfirmingDelete(false)}
                              className="flex-1 px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDelete}
                              className="flex-1 px-3 py-1.5 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsConfirmingDelete(true)}
                          className="flex items-center justify-center gap-2 w-full py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Project
                        </button>
                      )}
                    </div>

                    </div>
                  </div>
                );
              })()}

                {/* RIGHT PANE: Main Content */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative rounded-r-3xl">
                  {/* Close Button overlay */}
                  <div className="absolute top-6 right-6 z-50">
                    <button
                      onClick={closeDrawer}
                      className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
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
                        {activeTab === 'overview' && <ProjectOverviewTab project={project} />}
                        {activeTab === 'onboarding' && <ProjectOnboardingTab project={project} />}
                        {activeTab === 'health' && <ProjectHealthTab project={project} />}
                        {activeTab === 'services' && <ProjectServicesTab project={project} />}
                        {activeTab === 'notes' && project && (
                          <NotesTab
                            entityId={project.id || ''}
                            entityType="project"
                            notes={project.notes || ''}
                            onSave={async (content: any) => {
                              await updateProjectRecord({ ...project, notes: content } as any, {
                                successMsg: 'Activity logs saved.',
                                errorMsg: 'Failed to save logs.',
                              });
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
