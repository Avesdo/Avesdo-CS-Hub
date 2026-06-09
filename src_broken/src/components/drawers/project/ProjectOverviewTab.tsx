"import React, { useState, useEffect, useRef, useMemo } from 'react';\nimport { Calendar, Link as LinkIcon, Edit2, ExternalLink, ChevronDown, Check, X, Copy, Search } from 'lucide-react';\nimport { updateProjectRecord, addAutoLog } from '../../../api/dbService';\nimport { useAppState } from '../../../context/AppStateContext';\nimport { getSettingBadge } from '../../../utils/uiUtils';\nimport toast from 'react-hot-toast';\n\ninterface ProjectOverviewTabProps {\n  project: any;\n}\n\nexport default function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {\n  const { clients, settings, user } = useAppState();\n\n  const [openPop, setOpenPop] = useState<'date' | 'clients' | 'manager' | 'status' | 'timeline' | 'phase' | null>(null);\n  const popRef = useRef<HTMLDivElement>(null);\n\n  const [editingChecklist, setEditingChecklist] = useState(false);\n  const [clientSearch, setClientSearch] = useState('');\n  \n  // Date Picker State\n  const [calMonth, setCalMonth] = useState(() => {\n     if (project?.releaseDateVal) {\n        const d = new Date(project.releaseDateVal);\n        return new Date(d.getFullYear(), d.getMonth(), 1);\n     }\n     return new Date(new Date().getFullYear(), new Date().getMonth(), 1);\n  });\n\n  useEffect(() => {\n    const handleClickOutside = (event: MouseEvent) => {\n      if (popRef.current && !popRef.current.contains(event.target as Node)) {\n        setOpenPop(null);\n      }\n    };\n    document.addEventListener('mousedown', handleClickOutside);\n    return () => document.removeEventListener('mousedown', handleClickOutside);\n  }, []);\n\n  const handleUpdate = async (field: string, value: any, oldVal?: any) => {\n    if (!project || project[field] === value) return;\n    try {\n      const updates: any = { [field]: value };\n      let actionLog = '';\n\n      // Automation Intercepts\n      if ((field === 'timelineStatus' || field === 'onboardingPhase') && value === 'Released') {\n         updates.projectStatus = 'Active';\n         const today = new Date();\n         upd
<truncated 18185 bytes>
                {project?.checklistUrl ? (
                    <div className="flex-1 font-medium">Deliverables Checklist</div>
                ) : (
                    <span className="flex-1 text-muted-foreground italic">None</span>
                )}
"      {/* 4. Resources */}\n      <div className=\"pb-2\">\n        <label className=\"block text-sm font-medium text-muted-foreground mb-1.5\">Deliverables Checklist URL</label>\n        {editingChecklist ? (\n            <input \n              type=\"url\" \n              autoFocus\n              className=\"w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00bdd9]/20 min-h-[38px] text-sm transition-all text-blue-600 hover:text-blue-800 underline\" \n              defaultValue={project?.checklistUrl || ''} \n              onBlur={(e) => {\n                  handleUpdate('checklistUrl', e.target.value, project?.checklistUrl);\n                  setEditingChecklist(false);\n              }}\n              onKeyDown={(e) => {\n                  if (e.key === 'Enter') {\n                      handleUpdate('checklistUrl', e.currentTarget.value, project?.checklistUrl);\n                      setEditingChecklist(false);\n                  }\n                  if (e.key === 'Escape') setEditingChecklist(false);\n              }}\n              placeholder=\"https://\"\n            />\n        ) : (\n            <div className=\"flex items-center gap-2\">\n                {project?.checklistUrl ? (\n                    <>\n                       <a href={project.checklistUrl} target=\"_blank\" rel=\"noreferrer\" className=\"px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm\">\n                           Open Link <ExternalLink className=\"w-3.5 h-3.5\" />\n                       </a>\n                       <button onClick={copyChecklistUrl} className=\"p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md transition-colors shadow-sm\" title=\"Copy URL\">\n                           <Copy className=\"w-4 h-4\" />\n                       </button>\n                    </>\n                ) : (\n                 
<truncated 466 bytes>
      // Log on the target client
      await addAutoLog(clientId, logMsg, user?.name || 'System');
      
      // Log on the project
      await addProjectAutoLog(project.id, logMsg, user?.name || 'System');
          if (field === 'releaseDateStr') displayField = 'Release Date';
          if (field === 'manager') displayField = 'Account Manager';
          if (field === 'units') displayField = 'Live Units';
          if (field === 'checklistUrl') displayField = 'Deliverables Checklist';
          
          const logMsg = `Changed ${displayField} from ${oldVal || 'Unknown'} to ${value}`;
                          placeholder="Paste KYC data here..."
        </div>
      </div>
      
      {/* 3. Workflow States */}
"      {/* 2.5 Key Details */}\n      <div className=\"flex flex-col gap-6 pb-6 border-b border-border\">\n         <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n            <div className=\"relative\">\n               <label className=\"block text-sm font-medium text-muted-foreground mb-1.5\">Account Manager</label>\n               <div className=\"flex\">\n                  <button onClick={() => setOpenPop(openPop === 'manager' ? null : 'manager')} className=\"text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex\">\n                     {getSettingBadge('managers', project?.assignee || 'Unassigned', settings)}\n                  </button>\n               </div>\n               {openPop === 'manager' && (\n                  <div className=\"absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1\">\n                     {settings?.managers?.map((m: any) => (\n                        <button key={m.name} onClick={() => { handleUpdate('assignee', m.name, project?.assignee); setOpenPop(null); }} className=\"w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap\">\n                           {getSettingBadge('managers', m.name, settings)}\n                        </button>\n                     ))}\n                  </div>\n               )}\n            </div>\n            \n            <div className=\"relative\">\n               <label className=\"block text-sm font-medium text-muted-foreground mb-1.5\">Project Status</label>\n               <div className=\"flex\">\n                  <button onClick={() => setOpenPop(openPop === 'status' ? null : 'status')} className=\"text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex\">\n                     {getSettingBadge('statuses', project?.projectStatus || 'Unknown', settings)}\n                  </button>\n               </div>\n               {openPop === 'status' && (\n                  <div 
<truncated 782 bytes>
"      {/* 2. Relationships & Core Details */}\n      <div className=\"flex flex-col gap-6 pb-6 border-b border-border\">\n        <div className=\"relative\">\n          <label className=\"block text-sm font-medium text-muted-foreground mb-1.5\">Attached Clients</label>\n          <div \n             className=\"min-h-[38px] bg-white border border-input rounded-md px-3 py-2 text-sm shadow-sm cursor-pointer hover:border-primary/50 transition-colors flex flex-wrap gap-2 items-center\"\n             onClick={() => setOpenPop(openPop === 'clients' ? null : 'clients')}\n          >\n             {project?.clients?.length > 0 ? (\n                project.clients.map((cName: string, i: number) => (\n                   <span key={i} className=\"bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 font-medium\">\n                      {cName}\n                   </span>\n                ))\n             ) : (\n                <span className=\"italic text-muted-foreground\">Select Clients...</span>\n             )}\n          </div>\n          {openPop === 'clients' && (\n             <div className=\"absolute top-full left-0 mt-2 w-[400px] bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px]\">\n                <div className=\"p-2 border-b border-border bg-slate-50 flex items-center gap-2\">\n                   <Search className=\"w-4 h-4 text-muted-foreground ml-2\" />\n                   <input \n                      type=\"text\" \n                      placeholder=\"Search clients...\" \n                      className=\"flex-1 bg-transparent border-none outline-none text-sm\"\n                      value={clientSearch}\n                      onChange={e => setClientSearch(e.target.value)}\n                      autoFocus\n                   />\n                </div>\n                <div className=\"overflow-y-auto p-1 custom-thin-scroll\">\n                   {filteredClients.map(c => {\n                      const isSelected = project?.clientI
<truncated 3631 bytes>
"        // Logging\n        const displayVal = (val: any) => {\n            if (val === null || val === undefined || val === '') return 'None';\n            if (typeof val === 'boolean') return val ? 'Yes' : 'No';\n            if (field.includes('DateVal') || field === 'dateVal') {\n                 const parsed = new Date(val);\n                 if (isNaN(parsed.getTime())) return 'None';\n                 return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });\n            }\n            if (field === 'price' || field === 'commission') {\n                 const num = Number(val);\n                 if (isNaN(num)) return 'None';\n                 return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);\n            }\n            return String(val);\n        };\n\n        if (project.clientIds) {\n            for (const cid of project.clientIds) {\n                if (actionLog) await addAutoLog(cid, actionLog, user?.name || 'System');\n                if (oldVal !== undefined) {\n                    let displayField = field;\n                    if (field === 'projectStatus') displayField = 'Status';\n                    if (field === 'timelineStatus') displayField = 'Timeline';\n                    if (field === 'onboardingPhase') displayField = 'Phase';\n                    if (field === 'releaseDateStr' || field === 'releaseDateVal') displayField = 'Release Date';\n                    if (field === 'manager') displayField = 'Account Manager';\n                    if (field === 'units') displayField = 'Live Units';\n                    if (field === 'checklistUrl') displayField = 'Deliverables Checklist';\n                    \n                    const logMsg = `Project \"${project.name}\" ${displayField} changed from ${displayVal(oldVal)} to ${displayVal(value)}`;\n                    await addAutoLog(cid, logMsg, user?.name || 'System');\n                }\n            }\n        }\n\n        // Project-level l
<truncated 987 bytes>
  const filteredClients = useMemo(() => {
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
                     {getSettingBadge('phases', project?.onboardingPhase || 'Not Set', settings)}
                     {getSettingBadge('timelines', project?.timelineStatus || 'Not Set', settings)}
                     {getSettingBadge('statuses', project?.projectStatus || 'Not Set', settings)}
                    {project?.checklistUrl && (
                        <>
                           <a href={project.checklistUrl.match(/^https?:\/\//) ? project.checklistUrl : `https://${project.checklistUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm">
                               Open Link <ExternalLink className="w-3.5 h-3.5" />
                           </a>
                           <button onClick={copyChecklistUrl} className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md transition-colors shadow-sm" title="Copy URL">
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Release Date</label>
          let displayField = field;
          if (field === 'projectStatus') displayField = 'Project Status';
          if (field === 'timelineStatus') displayField = 'Schedule Status';
          if (field === 'onboardingPhase') displayField = 'Onboarding Phase';
          if (field === 'releaseDateStr' || field === 'releaseDateVal') displayField = 'Release Date';
         actionLog = `Schedule Status set to Released. Project Status set to Active, Onboarding Phase set to Released.`;
          if (field === 'units') displayField = 'Live Units';
         actionLog = `Schedule Status set to Indefinitely Delayed. Release Date cleared.`;
         actionLog = `Onboarding Phase set to Released. Project Status set to Active, Schedule Status set to Released.`;
               <label className="block text-sm font-medium text-muted-foreground mb-1.5">Onboarding Phase</label>
               <label className="block text-sm font-medium text-muted-foreground mb-1.5">Schedule Status</label>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Manager</label>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Release Date</label>
      } else if (field === 'timelineStatus' && (value === 'Indefinitely Delayed' || value === 'Currently Delayed')) {
         updates.releaseDateVal = null;
         updates.releaseDateStr = '';
         actionLog = `Schedule Status set to ${value}. Release Date cleared.`;
      } else if (field === 'releaseDateVal') {
      } else if (field === 'releaseDateVal') {
         if (value) {
             updates.releaseDateStr = new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
         } else {
             updates.releaseDateStr = '';
         }
      }
        successMsg: `Attached Clients successfully updated for '${project.name}'.`,
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

      await updateProjectRecord({ ...project, ...updates }, { successMsg, errorMsg });
      });
                      await addAutoLog(cid, logMsg, user?.name || 'System', true);
                  if (actionLog) await addAutoLog(cid, actionLog, user?.name || 'System', true);
            onChange={(val, str) => {
               handleUpdate('releaseDateVal', val, project?.releaseDateVal);
            }}
          if (field === 'checklistUrl') displayField = 'Deliverables Checklist';
          if (field === 'kycDetails') displayField = 'KYC Details';
          
          if (field === 'kycDetails') {
              projectLogMsg = `Updated KYC Details`;
          } else {
              projectLogMsg = `Changed ${displayField} from ${displayVal(oldVal)} to ${displayVal(value)}`;
          }
      let projectLogMsg = actionLog;
      if (!projectLogMsg) {
               <div className="flex [&_span]:text-[13px] [&_span]:px-3 [&_span]:py-1.5 [&_svg]:w-4 [&_svg]:h-4">
                  <button onClick={() => setOpenPop(openPop === 'phase' ? null : 'phase')} className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex">
                     {getSettingBadge('phases', project?.onboardingPhase || 'Not Set', settings)}
                  </button>
               </div>
               <div className="flex [&_span]:text-[13px] [&_span]:px-3 [&_span]:py-1.5 [&_svg]:w-4 [&_svg]:h-4">
                  <button onClick={() => setOpenPop(openPop === 'timeline' ? null : 'timeline')} className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex">
                     {getSettingBadge('timelines', project?.timelineStatus || 'Not Set', settings)}
                  </button>
               </div>