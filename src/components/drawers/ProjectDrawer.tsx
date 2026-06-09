import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Pencil,
  Check,
  ChevronDown,
  AlertTriangle,
  Trash2,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppState } from '../../context/AppStateContext';
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
import ProjectHealthTab from './project/ProjectHealthTab';
import ProjectTrendsTab from './project/ProjectTrendsTab';
import ProjectFeaturesTab from './project/ProjectFeaturesTab';
import ProjectServicesTab from './project/ProjectServicesTab';
import { NotesTab } from '../ui/NotesTab';
import { Select } from '../ui/Select';

export default function ProjectDrawer() {
  const { isDrawerOpen, getDrawerData, closeDrawer, activeDrawers } = useUI();
  const { projects, settings, clients, user, services } = useAppState();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'health' | 'trends' | 'features' | 'services' | 'notes'
  >('overview');

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isConfirmingDelete) {
      const timer = setTimeout(() => setIsConfirmingDelete(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingDelete]);

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
      setActiveTab(drawerData?.data?.targetTab || 'overview');
    }
  }, [isOpen, drawerData?.entityId, drawerData?.data?.targetTab]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditingName(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

      // Cascade to services
      const servicesToUpdate = services.filter((s: any) => s.projectId === project.id);
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
        // Note: Add client auto log separately if needed, but since it's just a log on a Client, we can leave it as addAutoLog since it doesn't update the client directly, or wait, does updateClientRecord support it? Yes, but we don't want to update the client. So we keep addAutoLog for the client.
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
      },
      {
        successMsg: `Status successfully updated for '${project.name}'.`,
        errorMsg: `Failed to update status for '${project.name}'.`,
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

  const handleUpdatePhase = async (val: string) => {
    if (!project || project.phase === val) return;
    const oldVal = project.phase || 'N/A';
    await updateProjectRecord(
      { ...project, phase: val },
      {
        successMsg: `Phase successfully updated for '${project.name}'.`,
        errorMsg: `Failed to update phase for '${project.name}'.`,
      },
      `Phase changed from ${oldVal} to ${val}`,
      user?.name
    );
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

  const handleUpdateTimeline = async (val: string) => {
    if (!project || project.timeline === val) return;
    const oldVal = project.timeline || 'On Track';
    await updateProjectRecord(
      { ...project, timeline: val as 'On Track' | 'At Risk' | 'Delayed' | 'Not Started' },
      {
        successMsg: `Delivery Status successfully updated for '${project.name}'.`,
        errorMsg: `Failed to update delivery status for '${project.name}'.`,
      },
      `Delivery Status changed from ${oldVal} to ${val}`,
      user?.name
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'health', label: 'Health' },
    { id: 'trends', label: 'Trends' },
    { id: 'features', label: 'Features' },
    { id: 'services', label: 'Services' },
    { id: 'notes', label: 'Notes & Logs' },
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
        className={`fixed top-0 right-0 h-full w-full max-w-[650px] bg-white border-l border-border flex flex-col shadow-2xl ${drawerData?.isClosing ? 'animate-out slide-out-to-right fade-out' : 'animate-in slide-in-from-right'} duration-300 ease-in-out transform-gpu`}
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

        {(project?.projectStatus === 'Closed' ||
          project?.projectStatus === 'Completed' ||
          project?.projectStatus === 'Cancelled' ||
          project?.projectStatus === 'Churned') && (
          <div className="bg-muted/50 text-muted-foreground border-b border-border px-6 py-3 text-sm font-semibold flex items-center gap-2 shrink-0">
            <Info className="w-5 h-5 shrink-0 text-muted-foreground" />
            <span>This project is {project?.projectStatus}. Health metrics are stopped.</span>
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
                {healthScore === 'N/A' ? 'N/A' : healthScore}
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
                      if (e.key === 'Enter') handleUpdateName();
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setEditNameValue(project?.name || '');
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
                      setEditNameValue(project?.name || '');
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
                    {project?.name || 'Loading Project...'}
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
              {project?.clients?.join(', ') || 'No clients'}
            </span>

            <div className="flex items-center gap-3 mt-1 group relative flex-wrap">
              <div className="relative inline-block">
                <Select
                  value={project?.projectStatus || 'Not Set'}
                  options={(settings?.statuses?.map((s: any) => s.name) || []).map((s: any) => ({
                    label: getSettingBadge('statuses', s, settings),
                    value: s,
                  }))}
                  onChange={handleUpdateStatus}
                  hideCheckmark={true}
                  trigger={
                    <button className="hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-block">
                      {getSettingBadge('statuses', project?.projectStatus || 'Not Set', settings)}
                    </button>
                  }
                />
              </div>

              <div className="relative inline-block">
                <Select
                  value={project?.assignee || 'Unassigned'}
                  options={(settings?.managers?.map((m: any) => m.name) || []).map((m: any) => ({
                    label: getSettingBadge('managers', m, settings),
                    value: m,
                  }))}
                  onChange={handleUpdateManager}
                  hideCheckmark={true}
                  trigger={
                    <button className="hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-block">
                      {getSettingBadge('managers', project?.assignee || 'Unassigned', settings)}
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
                  if (project) {
                    await deleteProjectRecord(project.id, project.name);
                    await addProjectAutoLog(project.id, `Project archived`, user?.name || 'System');
                    if (project.clientIds) {
                      for (const cid of project.clientIds)
                        await addAutoLog(
                          cid,
                          `Project "${project.name}" archived`,
                          user?.name || 'System',
                          true
                        );
                    }
                    const pServices = services.filter((s: any) => s.projectId === project.id);
                    for (const svc of pServices)
                      await addServiceAutoLog(
                        svc.id,
                        `Attached Project "${project.name}" archived`,
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
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                title="Archive Project"
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

        <div className="flex-1 overflow-y-auto p-6 bg-white custom-thin-scroll">
          {activeTab === 'overview' && <ProjectOverviewTab project={project} />}
          {activeTab === 'health' && <ProjectHealthTab project={project} />}
          {activeTab === 'trends' && <ProjectTrendsTab project={project} />}
          {activeTab === 'features' && <ProjectFeaturesTab project={project} />}
          {activeTab === 'services' && <ProjectServicesTab project={project} />}
          {activeTab === 'notes' && (
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
          )}
        </div>
      </div>
    </>
  );
}
