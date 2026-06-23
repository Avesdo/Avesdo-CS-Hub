import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Copy,
  ExternalLink,
  Globe,
  Users,
  Building2,
  MapPin,
  Search,
  Plus,
  Calendar,
  Link as LinkIcon,
  Edit2,
  ChevronDown,
  Check,
  CheckSquare,
  X,
  Pencil,
} from 'lucide-react';
import {
  updateProjectRecord,
  addAutoLog,
  addProjectAutoLog,
  updateServiceRecord,
} from '../../../api/dbService';
import { useAppStore } from '../../../store/useAppStore';
import { calculateProjectHealth } from '../../../utils/scoringUtils';
import { Tooltip } from '../../ui/Tooltip';
import { getSettingBadge } from '../../../utils/uiUtils';
import { DatePicker } from '../../../components/ui/DatePicker';
import { RichTextEditor } from '../../ui/RichTextEditor';
import ProjectFeaturesTab from './ProjectFeaturesTab';
import toast from 'react-hot-toast';

interface ProjectOverviewTabProps {
  project: any;
}

export default React.memo(function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const clients = useAppStore(state => state.clients);
  const settings = useAppStore(state => state.settings);
  const user = useAppStore(state => state.user);
  const services = useAppStore(state => state.services);

  const [openPop, setOpenPop] = useState<
    'clients' | 'manager' | 'status' | 'timeline' | 'phase' | 'devClients' | 'smClients' | null
  >(null);
  const popRef = useRef<HTMLDivElement>(null);
  const openPopRef = useRef(openPop);
  useEffect(() => {
    openPopRef.current = openPop;
  }, [openPop]);

  const [editingChecklist, setEditingChecklist] = useState(false);

  // KYC Accordion State
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isKycEditing, setIsKycEditing] = useState(false);
  const [kycDraft, setKycDraft] = useState(project?.kycDetails || '');

  useEffect(() => {
    setKycDraft(project?.kycDetails || '');
  }, [project?.kycDetails]);

  const handleSaveKyc = async () => {
    setIsKycEditing(false);
    handleUpdate('kycDetails', kycDraft, project?.kycDetails);
  };
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openPopRef.current && !target.closest('.popover-container')) {
        setOpenPop(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openPopRef.current) {
        event.stopPropagation();
        setOpenPop(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleUpdate = async (field: string, value: any, oldVal?: any) => {
    if (!project || project[field] === value) return;
    try {
      const updates: any = { [field]: value };
      let actionLog = '';

      // Automation Intercepts
      if (field === 'timelineStatus') {
        if (value === 'Released') {
          updates.projectStatus = 'Active';
          updates.onboardingPhase = 'Released';
          const today = new Date();
          // Force local midnight to avoid timezone shifting
          const localMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          updates.releaseDateVal = localMidnight.getTime();
          updates.releaseDateStr = localMidnight.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          actionLog = `Schedule Status set to Released. Project Status set to Active, Onboarding Phase set to Released.`;
        } else if (value === 'Indefinitely Delayed') {
          updates.releaseDateVal = null;
          updates.releaseDateStr = '';
          actionLog = `Schedule Status set to ${value}. Release Date cleared.`;
        } else {
          actionLog = `Schedule Status set to ${value}.`;
        }
      } else if (field === 'onboardingPhase' && value === 'Released') {
        updates.projectStatus = 'Active';
        updates.timelineStatus = 'Released';
        const today = new Date();
        const localMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        updates.releaseDateVal = localMidnight.getTime();
        updates.releaseDateStr = localMidnight.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        actionLog = `Onboarding Phase set to Released. Project Status set to Active, Schedule Status set to Released.`;
      } else if (field === 'timelineStatus' && value === 'Indefinitely Delayed') {
        updates.releaseDateVal = null;
        updates.releaseDateStr = '';
        actionLog = `Schedule Status set to ${value}. Release Date cleared.`;
      } else if (field === 'releaseDateVal') {
        if (value) {
          const parsed = new Date(value);
          if (!isNaN(parsed.getTime())) {
            updates.releaseDateStr = parsed.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          }
        } else {
          updates.releaseDateStr = '';
        }
      }

      let successMsg = `Updates to '${project.name}' saved successfully.`;
      let errorMsg = `Failed to save updates to '${project.name}'.`;

      if (field === 'releaseDateVal') {
        successMsg = `Release Date successfully updated for '${project.name}'.`;
        errorMsg = `Failed to update Release Date for '${project.name}'.`;
      } else if (field === 'units') {
        successMsg = `Live Units successfully updated for '${project.name}'.`;
        errorMsg = `Failed to update Live Units for '${project.name}'.`;
      } else if (field === 'kycDetails') {
        successMsg = `KYC details successfully updated for '${project.name}'.`;
        errorMsg = `Failed to update KYC details for '${project.name}'.`;
      }

      const displayVal = (val: any) => {
        if (val === null || val === undefined || val === '') return 'None';
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (field.includes('DateVal') || field === 'dateVal') {
          const parsed = new Date(val);
          if (isNaN(parsed.getTime())) return 'None';
          return parsed.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
        }
        if (field === 'price' || field === 'commission') {
          const num = Number(val);
          if (isNaN(num)) return 'None';
          return (
            '$' +
            new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(num)
          );
        }
        return String(val);
      };

      // Project-level logging
      let projectLogMsg = actionLog;
      if (!projectLogMsg) {
        let displayField = field;
        if (field === 'projectStatus') displayField = 'Project Status';
        if (field === 'timelineStatus') displayField = 'Schedule Status';
        if (field === 'onboardingPhase') displayField = 'Implementation Status';
        if (field === 'releaseDateStr' || field === 'releaseDateVal') displayField = 'Release Date';
        if (field === 'manager' || field === 'assignee') displayField = 'Account Manager';
        if (field === 'units') displayField = 'Live Units';
        if (field === 'checklistUrl') displayField = 'Deliverables Checklist';
        if (field === 'kycDetails') displayField = 'KYC Details';

        if (displayField === field) {
          displayField =
            field.charAt(0).toUpperCase() +
            field
              .replace(/([A-Z])/g, ' $1')
              .slice(1)
              .trim();
        }

        if (field === 'kycDetails') {
          projectLogMsg = `Updated KYC Details`;
        } else {
          projectLogMsg = `Changed ${displayField} from ${displayVal(oldVal)} to ${displayVal(value)}`;
        }
      }

      if (field === 'releaseDateVal') {
        if (value) {
          updates.releaseDateStr = new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } else {
          updates.releaseDateStr = '';
        }
      }

      await updateProjectRecord(
        { ...project, ...updates },
        { successMsg, errorMsg },
        projectLogMsg,
        user?.name
      );

      if (project.clientIds) {
        for (const cid of project.clientIds) {
          // Only cascade Status changes to Client
          if (field === 'projectStatus' || (field === 'onboardingPhase' && value === 'Released')) {
            if (actionLog) await addAutoLog(cid, actionLog, user?.name || 'System', true);
            else if (oldVal !== undefined && field === 'projectStatus') {
              const logMsg = `Project "${project.name}" Status changed from ${displayVal(oldVal)} to ${displayVal(value)}`;
              await addAutoLog(cid, logMsg, user?.name || 'System', true);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleClientArrayItem = async (clientId: string, clientName: string) => {
    const cIds = project?.clientIds || [];
    const cNames = project?.clients || [];
    const isRemoving = cIds.includes(clientId);

    let newCIds = [...cIds];
    let newCNames = [...cNames];

    const client = clients.find((c) => c.clientId === clientId || c.id === clientId);
    const isDev = client?.clientType === 'Developer';
    const isSM = client?.clientType === 'Sales & Marketing';

    let newDevIds = project?.developerIds || [];
    let newDevNames = project?.developers || [];
    let newSMIds = project?.salesMarketingIds || [];
    let newSMNames = project?.salesMarketingClients || [];

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
        // Fallback for untyped devs
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
        // Fallback
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

  const copyChecklistUrl = () => {
    if (project?.checklistUrl) {
      navigator.clipboard.writeText(project.checklistUrl);
      toast.success('URL Copied');
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

  return (
    <div className="flex flex-col space-y-6" ref={popRef}>
      {/* 1. Logistics & Sizing */}
      <div className="bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 rounded-3xl shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all duration-500 hover:border-blue-200/60">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-500 group-hover:bg-blue-500/10 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Timeline & Scale</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="popover-container group/input">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground mb-1.5">
                Release Date
              </label>
              <div className="transition-transform duration-200 group-hover/input:translate-x-1">
                <DatePicker
                  value={project?.releaseDateVal}
                  onChange={(val, str) => {
                    handleUpdate('releaseDateVal', val, project?.releaseDateVal);
                  }}
                  label="Set Release Date"
                  placeholder="No Date"
                />
              </div>
            </div>
            <div className="group/input">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground mb-1.5">
                Live Units
              </label>
              <div className="relative transition-transform duration-200 group-hover/input:translate-x-1">
                <input
                  type="number"
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-700 transition-all"
                  defaultValue={project?.units || 0}
                  onBlur={(e) => handleUpdate('units', parseInt(e.target.value) || 0, project?.units)}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                />
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Relationships & Core Details */}
      <div className="bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 rounded-3xl shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all duration-500 hover:border-indigo-200/60">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-500 group-hover:bg-indigo-500/10 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Project Entities</h3>
          </div>
        <div className="flex flex-col gap-8">
          <div className="relative popover-container group/input">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground mb-1.5">
              Developer Client(s)
            </label>
            <div
              className="min-h-[46px] bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm shadow-sm cursor-pointer hover:border-indigo-400 hover:ring-4 hover:ring-indigo-500/10 transition-all flex flex-wrap gap-2 items-center"
              onClick={() => setOpenPop(openPop === 'devClients' ? null : 'devClients')}
            >
              {project?.developers?.length > 0 ? (
                project.developers.map((cName: string, i: number) => (
                  <span
                    key={i}
                    className="bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-500/20 px-2.5 py-0.5 rounded border border-slate-200 font-medium"
                  >
                    {cName}
                  </span>
                ))
              ) : (
                <span className="italic text-muted-foreground">Select Developers...</span>
              )}
            </div>
            {openPop === 'devClients' && (
              <div className="absolute top-full left-0 mt-2 w-[350px] bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px]">
                <div className="p-2 border-b border-border bg-slate-50 flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground ml-2" />
                  <input
                    type="text"
                    placeholder="Search developers..."
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto p-1 custom-thin-scroll">
                  {filteredClients
                    .filter((c) => c.clientType === 'Developer' || !c.clientType)
                    .map((c) => {
                      const isSelected =
                        project?.developerIds?.includes(c.clientId || c.id) ||
                        project?.clientIds?.includes(c.clientId || c.id);
                      return (
                        <button
                          key={c.clientId || c.id}
                          onClick={() => toggleClientArrayItem(c.clientId || c.id, c.companyName)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 rounded-md transition-colors"
                        >
                          <span className="font-medium">{c.companyName}</span>
                          {isSelected && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div className="relative popover-container group/input">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground mb-1.5">
              Sales & Marketing Client(s)
            </label>
            <div
              className="min-h-[46px] bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm shadow-sm cursor-pointer hover:border-indigo-400 hover:ring-4 hover:ring-indigo-500/10 transition-all flex flex-wrap gap-2 items-center"
              onClick={() => setOpenPop(openPop === 'smClients' ? null : 'smClients')}
            >
              {project?.salesMarketingClients?.length > 0 ? (
                project.salesMarketingClients.map((cName: string, i: number) => (
                  <span
                    key={i}
                    className="bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-500/20 px-2.5 py-0.5 rounded border border-slate-200 font-medium"
                  >
                    {cName}
                  </span>
                ))
              ) : (
                <span className="italic text-muted-foreground">Select Sales & Marketing...</span>
              )}
            </div>
            {openPop === 'smClients' && (
              <div className="absolute top-full left-0 mt-2 w-[350px] bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px]">
                <div className="p-2 border-b border-border bg-slate-50 flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground ml-2" />
                  <input
                    type="text"
                    placeholder="Search sales & marketing clients..."
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto p-1 custom-thin-scroll">
                  {filteredClients
                    .filter((c) => c.clientType === 'Sales & Marketing')
                    .map((c) => {
                      const isSelected =
                        project?.salesMarketingIds?.includes(c.clientId || c.id) ||
                        project?.clientIds?.includes(c.clientId || c.id);
                      return (
                        <button
                          key={c.clientId || c.id}
                          onClick={() => toggleClientArrayItem(c.clientId || c.id, c.companyName)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 rounded-md transition-colors"
                        >
                          <span className="font-medium">{c.companyName}</span>
                          {isSelected && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
          <div className="group/input">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground mb-1.5">
              Avesdo Development ID
            </label>
            <div className="relative transition-transform duration-200 group-hover/input:translate-x-1">
              <input
                type="text"
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold text-slate-700 transition-all"
                defaultValue={project?.developmentId || ''}
                onBlur={(e) => handleUpdate('developmentId', e.target.value, project?.developmentId)}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                placeholder="e.g. 123"
              />
              <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 rounded-3xl shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all duration-500 hover:border-emerald-200/60">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-500 group-hover:bg-emerald-500/10 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Features</h3>
          </div>
          <ProjectFeaturesTab project={project} />
        </div>
      </div>
    </div>
  );
});
