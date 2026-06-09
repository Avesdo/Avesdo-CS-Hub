"import React, { useState } from 'react';\nimport { ArrowUpDown, Calendar, ChevronRight, CheckSquare, ExternalLink, Activity, Info, MoreHorizontal } from 'lucide-react';\nimport { getSettingBadge, getHealthBadge } from '../../utils/uiUtils';\nimport { Select } from '../ui/Select';\nimport EmptyState from '../EmptyState';\nimport { DatePickerPopover } from '../ui/DatePickerPopover';\n\ninterface ProjectTrackerTableProps {\n  projects: any[];\n  activeTab: string;\n  settings: any;\n  selectedRows: string[];\n  setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>;\n  sortCol: string;\n  sortAsc: boolean;\n  onSort: (col: string) => void;\n  onUpdateProject: (projectId: string, field: string, value: any) => Promise<void>;\n  openDrawer: (type: string, id: string, data?: any) => void;\n}\n\nexport const ProjectTrackerTable: React.FC<ProjectTrackerTableProps> = ({\n  projects,\n  activeTab,\n  settings,\n  selectedRows,\n  setSelectedRows,\n  sortCol,\n  sortAsc,\n  onSort,\n  onUpdateProject,\n  openDrawer\n}) => {\n  const showTimelineAndPhase = activeTab !== 'All Released';\n  const showHealthScore = activeTab === 'All Released' || activeTab === 'All Projects';\n  const showChecklist = activeTab !== 'All Released';\n\n  const toggleAll = () => {\n    if (selectedRows.length === projects.length && projects.length > 0) {\n      setSelectedRows([]);\n    } else {\n      setSelectedRows(projects.map(p => p.id));\n    }\n  };\n\n  const toggleRow = (id: string, e: React.MouseEvent) => {\n    e.stopPropagation();\n    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);\n  };\n\n  const stopProp = (e: React.MouseEvent) => e.stopPropagation();\n\n  return (\n    <div className=\"flex-1 bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col relative\">\n      <div className=\"overflow-x-auto\">\n        <table className=\"w-full text-sm text-left\">\n          <thead className=\"text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-s
import { ArrowUpDown, Calendar, ChevronRight, CheckSquare, ExternalLink, Activity, Info, MoreHorizontal, Plus } from 'lucide-react';
import { getSettingBadge, getHealthBadge, getFeatureBadgeProps } from '../../utils/uiUtils';
import { TruncatedText } from '../ui/TruncatedText';
                    <span className="whitespace-nowrap">{p.releaseDateStr || 'Not Set'}</span>
                    <input 
                      type="date"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      value={p.releaseDateVal ? new Date(p.releaseDateVal).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const dateObj = new Date(val + 'T12:00:00Z'); // force midday UTC to avoid timezone shift
                        const dateStr = val ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
                        const dateVal = val ? dateObj.getTime() : null;
                        
                        // We must call both or handle it at the DB level, let's just trigger one that triggers an update
                        onUpdateProject(p.id, 'releaseDateVal', dateVal);
                        if (val) {
                           onUpdateProject(p.id, 'releaseDateStr', dateStr);
                        }
                      }}
                    />
  managerFilter?: string[];
  setManagerFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  timelineFilter?: string[];
  setTimelineFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  phaseFilter?: string[];
  setPhaseFilter?: React.Dispatch<React.SetStateAction<string[]>>;
}
          <tbody className="">
              <th className="sticky left-12 z-40 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('name')}>
                <div className="flex items-center gap-1.5 whitespace-nowrap">Project Name <ArrowUpDown className="w-3 h-3"/></div>
              </th>
  return (
  managerFilter,
  setManagerFilter,
  timelineFilter,
  setTimelineFilter,
  phaseFilter,
  setPhaseFilter
}) => {
  const showTimelineAndPhase = activeTab !== 'All Released';
  const showHealthScore = activeTab === 'All Released' || activeTab === 'All Projects';
  const showChecklist = activeTab !== 'All Released';

  const allNames = Array.from(new Set(projects.map(p => p.name || 'Unnamed Project'))).sort();
  const allClients = Array.from(new Set(projects.flatMap(p => p.clients || []))).sort();
  const allManagers = Array.from(new Set(projects.map(p => p.assignee || 'Unassigned'))).sort();
  const allTimelines = Array.from(new Set(projects.map(p => p.timelineStatus || 'Unassigned'))).sort();
  const allPhases = Array.from(new Set(projects.map(p => p.onboardingPhase || 'Unassigned'))).sort();

  const toggleAll = () => {
    if (selectedRows.length === projects.length && projects.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(projects.map(p => p.id));
    }
  };

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
        <table className="w-full text-sm text-left">
          <thead className="sticky top-[46px] z-40 bg-white shadow-sm before:absolute before:-top-[1px] before:inset-x-0 before:h-[1px] before:bg-white before:-z-10">
            <tr className="text-[11px] font-bold tracking-wider text-slate-500 bg-slate-50 border-y border-border h-[45px] uppercase">
  return (
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 z-40 bg-white shadow-sm before:absolute before:-top-[1px] before:inset-x-0 before:h-[1px] before:bg-white before:-z-10">
            <tr className="text-[11px] font-bold tracking-wider text-slate-500 bg-slate-50 border-y border-border h-[45px] capitalize">
              <th className="sticky left-0 z-40 bg-slate-50 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] border-r-0 px-4 py-3 w-12 group/th">
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  {p.units ? parseInt(p.units).toLocaleString() : '0'}
                </td>
                {showChecklist && (
                  <td className="px-4 py-3 text-center" onClick={stopProp}>
                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-input shadow-sm text-xs font-medium hover:bg-slate-50 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 focus:border-primary">
                      <ExternalLink className="w-3.5 h-3.5" /> Link
                    </button>
                  </td>
                )}
                {showFeatures && (
                  <td className="px-4 py-3 text-center" onClick={(e) => { e.stopPropagation(); openDrawer('project', p.id, { targetTab: 'features' }); }}>
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-500 font-semibold text-xs hover:bg-primary/10 hover:text-primary transition-colors shadow-sm border border-slate-200">
                      {p.features?.length || 0}
                    </div>
                  </td>
                )}
                <td className="sticky left-12 z-20 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.05)] border-r-0 px-4 py-3 font-semibold text-foreground max-w-[250px] 2xl:max-w-[400px] truncate" title={p.name || 'Unnamed Project'}>
                  {p.name || 'Unnamed Project'}
                </td>
                {showFeatures && (
                  <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); openDrawer('project', p.id, { targetTab: 'features' }); }}>
                    {(() => {
                      const pt_features = ['Contracts', 'Inventory', 'Pricing', 'Deposits', 'Payments', 'Allocations', 'Workflows', 'Reporting'];
                      const fTotal = Array.isArray(settings?.features) && settings?.features.length > 0 ? settings.features.length : pt_features.length;
                      const fCount = Array.isArray(p.features) ? p.features.length : 0;
                      const pct = Math.round((fCount / fTotal) * 100);
                      const colors = getFeatureBadgeProps(pct, settings);
                      
                      return (
                        <div className="flex items-center justify-between gap-3 group/feature cursor-pointer">
  const allNames = Array.from(new Set(projects.map(p => p.name || 'Not Set'))).sort();
  const allClients = Array.from(new Set(projects.flatMap(p => p.clients || []))).sort();
  const allManagers = Array.from(new Set(projects.map(p => p.assignee || 'Unassigned'))).sort();
  const allTimelines = Array.from(new Set(projects.map(p => p.timelineStatus || 'Not Set'))).sort();
  const allPhases = Array.from(new Set(projects.map(p => p.onboardingPhase || 'Not Set'))).sort();
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                )}
                  {setManagerFilter && <ColumnFilter options={allManagers} selected={managerFilter || []} onChange={setManagerFilter} />}
                        <div className="flex items-center justify-between gap-3 group/feature cursor-pointer">
                          <div className="w-full max-w-[64px] bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                            <div className={`h-full rounded-full ${colors.fill} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}></div>
                          </div>
                          <span className={`text-[11px] font-bold tabular-nums w-8 text-right transition-colors ${colors.text} group-hover/feature:text-primary`}>
                            {pct}%
                          </span>
                        </div>
                      return (
                        <div className="flex items-center justify-between gap-3 group/feature cursor-pointer">
                          <div className="w-full max-w-[64px] bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                            <div className={`h-full rounded-full ${colors.fill} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}></div>
                          </div>
                          <span className={`text-[11px] font-bold tabular-nums w-8 text-right transition-colors ${colors.text} group-hover/feature:text-primary`}>
                            {pct}%
                          </span>
                        </div>
                      );
                      return (
                        <div className="flex items-center justify-center gap-2.5 group/feature cursor-pointer">
                  onChange={toggleAll}
                  className="rounded border-slate-300 text-primary focus:ring-0 focus-visible:ring-2 focus-visible:ring-[#00bdd9]/20 focus:ring-offset-0 outline-none cursor-pointer"
                />
                          <span className={`text-[11px] font-bold tabular-nums w-8 text-right transition-colors ${colors.text} group-hover/feature:text-primary`}>
                            {pct}%
                          </span>
                        </div>
                      );
                {showChecklist && (
                  <td className="px-4 py-3 text-center" onClick={(e) => { e.stopPropagation(); if (p.checklistUrl) { const url = p.checklistUrl.match(/^https?:\/\//) ? p.checklistUrl : `https://${p.checklistUrl}`; window.open(url, '_blank'); } else openDrawer('project', p.id, { targetTab: 'overview' }); }}>
                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-input shadow-sm text-xs font-medium hover:bg-slate-50 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 focus:border-primary">
                      <ExternalLink className="w-3.5 h-3.5" /> Link
                    </button>
                  </td>
                )}
                {showHealthScore && (
                  <td className="px-4 py-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); openDrawer('project', p.id, { targetTab: 'health' }); }}>
                    <div className="flex items-center gap-4 group/trend p-1 -m-1 rounded hover:bg-slate-100 transition-colors w-fit">
                      <div className="relative group/health">
                        {getHealthBadge(p.healthScore, settings)}
                        {typeof p.healthScore === 'number' && (
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover/health:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
                            Health Score: {p.healthScore}
                          </div>
                        )}
                      </div>
                {showChecklist && (
                  <td className="px-4 py-3 text-center" onClick={(e) => { e.stopPropagation(); if (p.checklistUrl) { const url = p.checklistUrl.match(/^https?:\/\//) ? p.checklistUrl : `https://${p.checklistUrl}`; window.open(url, '_blank'); } else openDrawer('project', p.id, { targetTab: 'overview' }); }}>
                    {p.checklistUrl ? (
                      <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-input shadow-sm text-xs font-medium hover:bg-slate-50 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 focus:border-primary">
                        <ExternalLink className="w-3.5 h-3.5" /> Link
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-transparent text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-50">
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </td>
                )}
                <td className="sticky left-12 z-20 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.05)] border-r-0 px-4 py-3 font-semibold text-foreground max-w-[250px] 2xl:max-w-[400px] truncate">
                  <Tooltip content={p.name || 'Unnamed Project'} className="block truncate">
                    <span className="group-hover:text-primary transition-colors">{p.name || 'Unnamed Project'}</span>
                  </Tooltip>
                </td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[250px]">
                  <Tooltip content={p.clients?.join(', ') || 'No clients attached'} className="block truncate">
                    {p.clients?.join(', ') || 'No clients'}
                  </Tooltip>
                </td>
                <td className="sticky left-12 z-20 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.05)] border-r-0 px-4 py-3 font-semibold text-foreground" title={p.name || 'Unnamed Project'}>
                  <div className="max-w-[250px] 2xl:max-w-[400px] truncate group-hover:text-primary transition-colors">
                    {p.name || 'Unnamed Project'}
                  </div>
                </td>
                <td className="sticky left-12 z-20 bg-inherit shadow-[1px_0_0_0_rgba(0,0,0,0.05)] border-r-0 px-4 py-3 font-semibold text-foreground group/tt">
                  <div className="max-w-[250px] 2xl:max-w-[400px] truncate group-hover:text-primary transition-colors">
                    {p.name || 'Unnamed Project'}
                  </div>
                  <div className="absolute top-full left-4 mt-1 opacity-0 group-hover/tt:opacity-100 transition-opacity z-[60] pointer-events-none">
                    <div className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
                      {p.name || 'Unnamed Project'}
                      <div className="absolute w-2 h-2 bg-slate-800 rotate-45 top-[-4px] left-4" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground group/tt relative">
                  <div className="truncate max-w-[250px]">
                    {p.clients?.join(', ') || 'No clients'}
                  </div>
                  <div className="absolute top-full left-4 mt-1 opacity-0 group-hover/tt:opacity-100 transition-opacity z-[60] pointer-events-none">
                    <div className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
                      {p.clients?.join(', ') || 'No clients attached'}
                      <div className="absolute w-2 h-2 bg-slate-800 rotate-45 top-[-4px] left-4" />
                    </div>
                  </div>
                </td>
                      {getHealthBadge(p.healthScore, settings)}
                    onChange={(e) => toggleRow(project.id, e)}
                    className="rounded border-slate-300 text-primary focus:ring-0 focus-visible:ring-2 focus-visible:ring-[#00bdd9]/20 focus:ring-offset-0 outline-none cursor-pointer"
                  />
                      return (
                        <div className="flex items-center justify-center gap-2.5 group/feature cursor-pointer">
                          <div className="w-[40px] shrink-0 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${colors.fill} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}></div>
                          </div>
                          <span className={`text-[11px] font-bold tabular-nums w-8 text-right transition-colors ${colors.text} group-hover/feature:text-primary`}>
                            {pct}%
                          </span>
                        </div>
                      );