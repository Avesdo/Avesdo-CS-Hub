import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileText, Copy, ExternalLink, Globe, Layout, Building2, MapPin, Search, Plus, Calendar, Link as LinkIcon, Edit2, ChevronDown, Check, X, Pencil } from 'lucide-react';
import { updateProjectRecord, addAutoLog, addProjectAutoLog, updateServiceRecord } from '../../../api/dbService';
import { useAppState } from '../../../context/AppStateContext';
import { getSettingBadge } from '../../../utils/uiUtils';
import { DatePicker } from '../../../components/ui/DatePicker';
import toast from 'react-hot-toast';

interface ProjectOverviewTabProps {
  project: any;
}

export default function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const { clients, settings, user, services } = useAppState();

  const [openPop, setOpenPop] = useState<'clients' | 'manager' | 'status' | 'timeline' | 'phase' | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const openPopRef = useRef(openPop);
  useEffect(() => { openPopRef.current = openPop; }, [openPop]);

  const [editingChecklist, setEditingChecklist] = useState(false);

  // KYC Accordion State
  const [isKycOpen, setIsKycOpen] = useState(!!project?.kycDetails);
  const [isKycEditing, setIsKycEditing] = useState(false);
  const [kycDraft, setKycDraft] = useState(project?.kycDetails || '');

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
            updates.releaseDateVal = today.getTime();
            updates.releaseDateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            actionLog = `Schedule Status set to Released. Project Status set to Active, Onboarding Phase set to Released.`;
         } else if (value === 'Indefinitely Delayed' || value === 'Currently Delayed') {
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
         updates.releaseDateVal = today.getTime();
         updates.releaseDateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
         actionLog = `Onboarding Phase set to Released. Project Status set to Active, Schedule Status set to Released.`;
      } else if (field === 'timelineStatus' && (value === 'Indefinitely Delayed' || value === 'Currently Delayed')) {
         updates.releaseDateVal = null;
         updates.releaseDateStr = '';
         actionLog = `Schedule Status set to ${value}. Release Date cleared.`;
      } else if (field === 'releaseDateVal') {
         if (value) {
             updates.releaseDateStr = new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
               return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          }
          if (field === 'price' || field === 'commission') {
               const num = Number(val);
               if (isNaN(num)) return 'None';
               return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
          }
          return String(val);
      };

      // Project-level logging
      let projectLogMsg = actionLog;
      if (!projectLogMsg) {
          let displayField = field;
          if (field === 'projectStatus') displayField = 'Project Status';
          if (field === 'timelineStatus') displayField = 'Schedule Status';
          if (field === 'onboardingPhase') displayField = 'Implementation Milestone';
          if (field === 'releaseDateStr' || field === 'releaseDateVal') displayField = 'Release Date';
          if (field === 'manager' || field === 'assignee') displayField = 'Manager';
          if (field === 'units') displayField = 'Live Units';
          if (field === 'checklistUrl') displayField = 'Deliverables Checklist';
          if (field === 'kycDetails') displayField = 'KYC Details';
          
          if (field === 'kycDetails') {
              projectLogMsg = `Updated KYC Details`;
          } else {
              projectLogMsg = `Changed ${displayField} from ${displayVal(oldVal)} to ${displayVal(value)}`;
          }
      }

      await updateProjectRecord({ ...project, ...updates }, { successMsg, errorMsg }, projectLogMsg, user?.name);

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

      if (isRemoving) {
          newCIds = newCIds.filter((id: string) => id !== clientId);
          newCNames = newCNames.filter((n: string) => n !== clientName);
      } else {
          newCIds.push(clientId);
          newCNames.push(clientName);
      }

      const logMsg = isRemoving 
         ? `Project "${project.name}" detached from client ${clientName}`
         : `Project "${project.name}" attached to client ${clientName}`;

      await updateProjectRecord({ ...project, clientIds: newCIds, clients: newCNames }, {
        successMsg: `Attached Clients successfully updated for '${project.name}'.`,
        errorMsg: `Failed to update Attached Clients for '${project.name}'.`
      }, logMsg, user?.name);

      // Cascade update child services
      const childServices = services.filter((s: any) => s.projectId === project.id);
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
      const sorted = [...clients].sort((a,b) => (a.companyName || a.name || '').localeCompare(b.companyName || b.name || ''));
      if (!clientSearch) return sorted;
      return sorted.filter((c: any) => (c.companyName || c.name || '').toLowerCase().includes(clientSearch.toLowerCase()));
  }, [clients, clientSearch]);

  return (
    <div className="flex flex-col space-y-6" ref={popRef}>
      {/* 1. Logistics & Sizing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border items-start">
        <div className="popover-container">
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Release Date</label>
          <DatePicker
            value={project?.releaseDateVal}
            onChange={(val, str) => {
               handleUpdate('releaseDateVal', val, project?.releaseDateVal);
            }}
            label="Set Release Date"
            placeholder="No Date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Live Units</label>
          <input 
            type="number" 
            className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-1.5 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[38px] text-sm font-semibold transition-all" 
            defaultValue={project?.units || 0} 
            onBlur={(e) => handleUpdate('units', parseInt(e.target.value) || 0, project?.units)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        </div>
      </div>

      {/* 2. Relationships & Core Details */}
      <div className="flex flex-col gap-6 pb-6 border-b border-border">
        <div className="relative popover-container">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Attached Clients</label>
          <div 
             className="min-h-[38px] bg-white border border-input rounded-md px-3 py-2 text-sm shadow-sm cursor-pointer hover:border-primary/50 transition-colors flex flex-wrap gap-2 items-center"
             onClick={() => setOpenPop(openPop === 'clients' ? null : 'clients')}
          >
             {project?.clients?.length > 0 ? (
                project.clients.map((cName: string, i: number) => (
                   <span key={i} className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 font-medium">
                      {cName}
                   </span>
                ))
             ) : (
                <span className="italic text-muted-foreground">Select Clients...</span>
             )}
          </div>
          {openPop === 'clients' && (
             <div className="absolute top-full left-0 mt-2 w-[400px] bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px]">
                <div className="p-2 border-b border-border bg-slate-50 flex items-center gap-2">
                   <Search className="w-4 h-4 text-muted-foreground ml-2" />
                   <input 
                      type="text" 
                      placeholder="Search clients..." 
                      className="flex-1 bg-transparent border-none outline-none text-sm"
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                      autoFocus
                   />
                </div>
                <div className="overflow-y-auto p-1 custom-thin-scroll">
                   {filteredClients.map(c => {
                      const isSelected = project?.clientIds?.includes(c.clientId || c.id);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="relative popover-container">
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Manager</label>
              <button onClick={() => setOpenPop(openPop === 'manager' ? null : 'manager')} className="w-full flex items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 active:scale-95 hover:bg-slate-50 hover:border-primary/50 focus:outline-none min-h-[38px]">
                 <span className="truncate font-semibold text-foreground">{project?.assignee || 'Unassigned'}</span>
                 <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
              {openPop === 'manager' && (
                 <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
                    {settings?.managers?.map((m: any) => (
                       <button key={m.name} onClick={() => { handleUpdate('assignee', m.name, project?.assignee); setOpenPop(null); }} className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap">
                          {m.name}
                       </button>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* 3. Workflow States */}
      <div className="flex flex-col gap-6 pb-6 border-b border-border">
         <div className="w-full md:w-1/2 md:pr-3">
            <div className="relative popover-container">
               <label className="block text-sm font-medium text-muted-foreground mb-1.5">Project Status</label>
               <div className="flex">
                  <button onClick={() => setOpenPop(openPop === 'status' ? null : 'status')} className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex">
                     {getSettingBadge('statuses', project?.projectStatus || 'Not Set', settings, true)}
                  </button>
               </div>
               {openPop === 'status' && (
                  <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
                     {settings?.statuses?.map((s: any) => (
                        <button key={s.name} onClick={() => { handleUpdate('projectStatus', s.name, project?.projectStatus); setOpenPop(null); }} className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap">
                           {getSettingBadge('statuses', s.name, settings, true)}
                        </button>
                     ))}
                  </div>
               )}
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative popover-container">
               <label className="block text-sm font-medium text-muted-foreground mb-1.5">Schedule Status</label>
               <div className="flex">
                  <button onClick={() => setOpenPop(openPop === 'timeline' ? null : 'timeline')} className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex">
                     {getSettingBadge('timelines', project?.timelineStatus || 'Not Set', settings)}
                  </button>
               </div>
               {openPop === 'timeline' && (
                  <div className="absolute top-full left-0 mt-2 min-w-[220px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
                     {settings?.timelines?.map((t: any) => (
                        <button key={t.name} onClick={() => { handleUpdate('timelineStatus', t.name, project?.timelineStatus); setOpenPop(null); }} className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap">
                           {getSettingBadge('timelines', t.name, settings)}
                        </button>
                     ))}
                  </div>
               )}
            </div>

            <div className="relative popover-container">
               <label className="block text-sm font-medium text-muted-foreground mb-1.5">Implementation Milestone</label>
               <div className="flex">
                  <button onClick={() => setOpenPop(openPop === 'phase' ? null : 'phase')} className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex">
                     {getSettingBadge('phases', project?.onboardingPhase || 'Not Set', settings)}
                  </button>
               </div>
               {openPop === 'phase' && (
                  <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
                     {settings?.phases?.map((p: any) => (
                        <button key={p.name} onClick={() => { handleUpdate('onboardingPhase', p.name, project?.onboardingPhase); setOpenPop(null); }} className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap">
                           {getSettingBadge('phases', p.name, settings)}
                        </button>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* 4. Resources */}
      <div className="pb-2">
        {editingChecklist ? (
            <input 
              type="url" 
              autoFocus
              className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[38px] text-sm transition-all text-blue-600 hover:text-blue-800 underline" 
              defaultValue={project?.checklistUrl || ''} 
              onBlur={(e) => {
                  handleUpdate('checklistUrl', e.target.value, project?.checklistUrl);
                  setEditingChecklist(false);
              }}
              onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                      handleUpdate('checklistUrl', e.currentTarget.value, project?.checklistUrl);
                      setEditingChecklist(false);
                  }
                  if (e.key === 'Escape') setEditingChecklist(false);
              }}
              placeholder="https://"
            />
        ) : (
            <div className="flex items-center gap-3 w-full min-h-[38px] rounded-md border border-input bg-white px-3 py-2 shadow-sm text-sm transition-all group">
                <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                {project?.checklistUrl ? (
                    <div className="flex-1 font-medium">Deliverables Checklist</div>
                ) : (
                    <span className="flex-1 text-muted-foreground italic">None</span>
                )}
                <div className="flex items-center gap-2">
                    {project?.checklistUrl && (
                        <>
                           <a href={project.checklistUrl.match(/^https?:\/\//) ? project.checklistUrl : `https://${project.checklistUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm">
                               Open Link <ExternalLink className="w-3.5 h-3.5" />
                           </a>
                           <button onClick={copyChecklistUrl} className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md transition-colors shadow-sm" title="Copy URL">
                               <Copy className="w-4 h-4" />
                           </button>
                        </>
                    )}
                    <button onClick={() => setEditingChecklist(true)} className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md transition-colors shadow-sm" title="Edit URL">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* 5. KYC & Onboarding Details */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all mt-4">
          <div className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsKycOpen(!isKycOpen)}>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                      <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                      <h4 className="text-sm font-semibold text-slate-800">KYC & Onboarding Details</h4>
                      <p className="text-xs text-slate-500">Foundational project knowledge and setup requirements</p>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  {isKycOpen && !isKycEditing && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); setIsKycEditing(true); setKycDraft(project?.kycDetails || ''); }}
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                  )}
                  {isKycOpen && isKycEditing && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleSaveKyc(); }}
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                          <Check className="w-3.5 h-3.5" /> Save
                      </button>
                  )}
                  <button onClick={() => setIsKycOpen(!isKycOpen)} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors ml-1">
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isKycOpen ? 'rotate-180' : ''}`} />
                  </button>
              </div>
          </div>
          
          {isKycOpen && (
              <div className="p-0 border-t border-slate-200 bg-white">
                  {isKycEditing ? (
                      <textarea 
                          className="w-full min-h-[400px] bg-slate-50 border-0 p-5 outline-none text-sm resize-y focus:ring-inset focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 font-mono text-slate-700 leading-relaxed"
                          placeholder="Paste KYC data here..."
                          value={kycDraft}
                          onChange={(e) => setKycDraft(e.target.value)}
                      ></textarea>
                  ) : (
                      <div className="p-5 max-h-[500px] overflow-y-auto custom-thin-scroll bg-white">
                          {project?.kycDetails ? (
                              <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium">
                                  {project.kycDetails}
                              </div>
                          ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                  <FileText className="w-8 h-8 mb-2 opacity-20" />
                                  <p className="text-sm">No KYC details have been added yet.</p>
                                  <button onClick={() => setIsKycEditing(true)} className="mt-3 text-sm text-blue-600 hover:underline font-semibold">Add Details</button>
                              </div>
                          )}
                      </div>
                  )}
              </div>
          )}
      </div>

    </div>
  );
}
