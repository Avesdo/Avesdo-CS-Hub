import os
import re

drawer_path = "C:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/components/drawers/ProjectDrawer.tsx"

new_content = """import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  X,
  Pencil,
  Check,
  ChevronDown,
  AlertTriangle,
  Trash2,
  ArrowLeft,
  Info,
  Calendar,
  Building,
  Target,
  Hash,
  User,
  Layers,
  Search,
  Users
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import { getSettingBadge } from '../../utils/uiUtils';
import {
  updateProjectRecord,
  addAutoLog,
  deleteProjectRecord,
  addProjectAutoLog,
  updateServiceRecord,
  addServiceAutoLog,
} from '../../api/dbService';
import { calculateProjectHealth } from '../../utils/scoringUtils';

// Tabs
import ProjectOverviewTab from './project/ProjectOverviewTab';
import ProjectOnboardingTab from './project/ProjectOnboardingTab';
import ProjectHealthTab from './project/ProjectHealthTab';
import ProjectServicesTab from './project/ProjectServicesTab';
import { NotesTab } from '../ui/NotesTab';
import { Select } from '../ui/Select';
import { Tooltip } from '../ui/Tooltip';
import { DatePicker } from '../ui/DatePicker';

const TokenTrigger = ({ label, value, icon: Icon, error, onClick, className = '' }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex items-center h-10 px-4 rounded-full border bg-white shadow-sm transition-all duration-200 active:scale-95 hover:border-primary/50 hover:shadow-md focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-destructive' : 'border-slate-200'} ${className}`}
  >
    {Icon && <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors mr-2 shrink-0" />}
    <span className="text-[13px] font-medium text-slate-500 mr-2">{label}:</span>
    <span className={`text-[13px] font-semibold truncate max-w-[160px] ${value ? 'text-slate-900' : 'text-slate-400'}`}>
      {value || 'Select'}
    </span>
    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

export default function ProjectDrawer() {
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
  const project = projects.find((p) => p.id === drawerData?.entityId);

  // Auto-hide confirm delete
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
      } else if (field === 'developmentId') {
        actionLog = `Avesdo ID updated to ${value}`;
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

  const filteredClients = useMemo(() => {
    const cNames = project?.clients || [];
    const sorted = [...clients].sort((a, b) => {
      const aName = a.companyName || a.name || '';
      const bName = b.companyName || b.name || '';
      const aSelected = cNames.includes(aName);
      const bSelected = cNames.includes(bName);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return aName.localeCompare(bName);
    });

    if (!clientSearch) return sorted;
    return sorted.filter((c: any) =>
      (c.companyName || c.name || '').toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clients, clientSearch, project?.clients]);

  if (!isOpen) return null;

  const isReleased = project?.timelineStatus === 'Released' || project?.onboardingPhase === 'Released';

  const tabs = isReleased
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'health', label: 'Health & Trends' },
        { id: 'services', label: 'Services' },
        { id: 'notes', label: 'Activity Logs' },
        { id: 'onboarding', label: 'Onboarding' },
      ] as const
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'onboarding', label: 'Onboarding' },
        { id: 'health', label: 'Health & Trends' },
        { id: 'services', label: 'Services' },
        { id: 'notes', label: 'Activity Logs' },
      ] as const;

  const healthData = project ? calculateProjectHealth(project, settings) : null;
  const healthScore = healthData?.totalScore ?? 'N/A';
  const isSuspended = project?.projectStatus === 'Suspended';

  const drawerIndex = activeDrawers.findIndex((d) => d.type === 'project');
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
        className={`fixed top-0 right-0 h-full w-full max-w-[800px] bg-white border-l border-border flex flex-col shadow-2xl ${drawerData?.isClosing ? 'animate-out slide-out-to-right fade-out' : 'animate-in slide-in-from-right'} duration-300 ease-in-out transform-gpu`}
        style={{ zIndex: zIndexDrawer }}
      >
        {isSuspended && (
          <div className="bg-red-50 text-red-600 border-b border-red-200 px-6 py-3 text-sm font-semibold flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>This project is suspended due to outstanding invoices.</span>
          </div>
        )}

        {project?.projectStatus === 'Onboarding' && (
          <div className="bg-muted/50 text-muted-foreground border-b border-border px-6 py-3 text-sm font-semibold flex items-center gap-2 shrink-0">
            <Info className="w-5 h-5 shrink-0 text-muted-foreground" />
            <span>
              This project is currently in Onboarding. Health metrics are paused until it goes Live.
            </span>
          </div>
        )}

        {/* Global Header / Spotlight */}
        <div className="px-6 pt-6 pb-2 shrink-0 relative bg-white">
          <div className="absolute top-6 right-6 flex items-center gap-4">
            <div className="w-12 h-12 relative group shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                <circle
                  className={`${healthScore === 'N/A' ? 'text-slate-200' : (healthScore as number) < 50 ? 'text-red-500' : (healthScore as number) < 80 ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={healthScore === 'N/A' ? 0 : 264 - (264 * (healthScore as number)) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[12px] font-bold ${healthScore === 'N/A' ? 'text-slate-400' : (healthScore as number) < 50 ? 'text-red-600' : (healthScore as number) < 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {healthScore === 'N/A' ? 'N/A' : healthScore}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isConfirmingDelete ? (
                <button
                  onClick={async () => {
                    if (project) {
                      await deleteProjectRecord(project.id, project.name);
                      await addProjectAutoLog(project.id, `Project archived`, user?.name || 'System');
                      if (project.clientIds) {
                        for (const cid of project.clientIds)
                          await addAutoLog(cid, `Project "${project.name}" archived`, user?.name || 'System', true);
                      }
                      closeDrawer();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-md text-red-600 bg-red-50 hover:bg-red-100 font-semibold shadow-sm text-sm"
                >
                  <AlertTriangle className="w-4 h-4" /> Confirm
                </button>
              ) : (
                <Tooltip content="Archive Project" position="bottom">
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </Tooltip>
              )}
              <Tooltip content="Close Drawer" position="bottom">
                <button
                  onClick={closeDrawer}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="mb-6 pr-40 group">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateName();
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setEditNameValue(project?.name || '');
                      setIsEditingName(false);
                    }
                  }}
                  className="text-4xl font-bold text-slate-900 bg-transparent outline-none w-full border-b-2 border-primary focus:border-primary"
                />
                <button onClick={handleUpdateName} className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={() => { setEditNameValue(project?.name || ''); setIsEditingName(false); }} className="p-2 bg-slate-100 text-slate-600 rounded-md">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight truncate">
                  {project?.name || 'Loading Project...'}
                </h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Token Bar */}
          <div className="flex items-center gap-3 overflow-x-auto custom-thin-scroll pb-2">
            <div className="relative shrink-0">
              <Select
                value={project?.projectStatus || 'Not Set'}
                options={(settings?.statuses?.map((s: any) => s.name) || []).map((s: any) => ({
                  label: getSettingBadge('statuses', s, settings),
                  value: s,
                }))}
                onChange={handleUpdateStatus}
                hideCheckmark={true}
                trigger={
                  <div className="hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-block cursor-pointer">
                    {getSettingBadge('statuses', project?.projectStatus || 'Not Set', settings)}
                  </div>
                }
              />
            </div>

            <div className="relative shrink-0">
              <Select
                value={project?.assignee || 'Unassigned'}
                options={(settings?.managers?.map((m: any) => m.name) || []).map((m: any) => ({
                  label: getSettingBadge('managers', m, settings),
                  value: m,
                }))}
                onChange={handleUpdateManager}
                hideCheckmark={true}
                trigger={
                  <div className="hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-block cursor-pointer">
                    {getSettingBadge('managers', project?.assignee || 'Unassigned', settings)}
                  </div>
                }
              />
            </div>

            {/* Clients Popover */}
            <Popover.Root open={popoverOpen === 'clients'} onOpenChange={(open) => setPopoverOpen(open ? 'clients' : null)} modal={false}>
              <Popover.Trigger asChild>
                <div>
                  <TokenTrigger label="Clients" value={`${project?.clientIds?.length || 0} Attached`} icon={Users} />
                </div>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] p-2" align="start" sideOffset={8}>
                  <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-slate-50 rounded-lg">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="bg-transparent border-none outline-none text-sm w-full"
                      placeholder="Search clients..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-thin-scroll flex flex-col gap-1">
                    {filteredClients.map((c) => {
                      const isSelected = project?.clientIds?.includes(c.clientId || c.id);
                      return (
                        <button
                          key={c.clientId || c.id}
                          onClick={() => toggleClientArrayItem(c.clientId || c.id, c.companyName)}
                          className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${isSelected ? 'bg-primary/5 text-primary font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <span>{c.companyName}</span>
                          {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Release Date */}
            <Popover.Root open={popoverOpen === 'date'} onOpenChange={(open) => setPopoverOpen(open ? 'date' : null)} modal={false}>
              <Popover.Trigger asChild>
                <div>
                  <TokenTrigger label="Release Date" value={project?.releaseDateStr || 'Not Set'} icon={Calendar} />
                </div>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="z-[999]" align="start" sideOffset={8}>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3">
                    <DatePicker
                      value={project?.releaseDateVal}
                      onChange={(val, str) => {
                        handleUpdateGeneric('releaseDateVal', val);
                        setPopoverOpen(null);
                      }}
                    />
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Units */}
            <Popover.Root open={popoverOpen === 'units'} onOpenChange={(open) => setPopoverOpen(open ? 'units' : null)} modal={false}>
              <Popover.Trigger asChild>
                <div>
                  <TokenTrigger label="Live Units" value={project?.units?.toString()} icon={Building} />
                </div>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="z-[999]" align="start" sideOffset={8}>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-64">
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Live Units</label>
                    <input
                      type="number"
                      autoFocus
                      defaultValue={project?.units || ''}
                      onBlur={(e) => {
                        handleUpdateGeneric('units', parseInt(e.target.value) || 0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateGeneric('units', parseInt(e.currentTarget.value) || 0);
                          setPopoverOpen(null);
                        }
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="e.g. 250"
                    />
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Avesdo ID */}
            <Popover.Root open={popoverOpen === 'avesdoId'} onOpenChange={(open) => setPopoverOpen(open ? 'avesdoId' : null)} modal={false}>
              <Popover.Trigger asChild>
                <div>
                  <TokenTrigger label="Avesdo ID" value={project?.developmentId} icon={Hash} />
                </div>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="z-[999]" align="start" sideOffset={8}>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-64">
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Avesdo Development ID</label>
                    <input
                      type="text"
                      autoFocus
                      defaultValue={project?.developmentId || ''}
                      onBlur={(e) => {
                        handleUpdateGeneric('developmentId', e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateGeneric('developmentId', e.currentTarget.value);
                          setPopoverOpen(null);
                        }
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="e.g. 123"
                    />
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 shrink-0 border-b border-slate-100 bg-white">
          <div role="tablist" className="flex overflow-x-auto gap-2 -mb-px pt-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                data-state={activeTab === tab.id ? 'active' : 'inactive'}
                className={`relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all active:scale-95 whitespace-nowrap outline-none ${activeTab === tab.id ? 'border-primary text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 custom-thin-scroll">
          {activeTab === 'overview' && <ProjectOverviewTab project={project} />}
          {activeTab === 'onboarding' && <ProjectOnboardingTab project={project} />}
          {activeTab === 'health' && <ProjectHealthTab project={project} />}
          {activeTab === 'services' && <ProjectServicesTab project={project} />}
          {activeTab === 'notes' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
              <NotesTab
                notes={project?.notes || []}
                onSaveNotes={async (updatedNotes) => {
                  if (!project) return;
                  await updateProjectRecord({ ...project, notes: updatedNotes } as any, {
                    successMsg: `Note successfully added for '${project.name}'.`,
                    errorMsg: `Failed to add note for '${project.name}'.`,
                  });
                }}
                emptyStateMessage="Be the first to add a note to this project."
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
"""

with open(drawer_path, "w", encoding="utf-8") as f:
    f.write(new_content)
