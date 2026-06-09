"import React, { useState, useMemo, useRef } from 'react';\nimport { useLocation } from 'react-router-dom';\nimport { useAppState } from '../context/AppStateContext';\nimport { PageHeader } from '../components/PageHeader';\nimport { useUI } from '../context/UIContext';\nimport { universalExportCSV } from '../utils/exportUtils';\nimport { Download, Database, Filter, Target, AlertOctagon, Building, Zap } from 'lucide-react';\nimport { ProjectTrackerTable } from '../components/ProjectTracker/ProjectTrackerTable';\nimport { BulkActionBar } from '../components/ProjectTracker/BulkActionBar';\nimport { useOnClickOutside } from '../hooks/useOnClickOutside';\nimport { TrendIndicator } from '../components/TrendIndicator';\nimport { updateProjectRecord } from '../api/dbService';\n\nexport default function ProjectTracker() {\n    const location = useLocation();\n    const { projects, settings } = useAppState();\n    const { openModal, openDrawer } = useUI();\n    const [showExportMenu, setShowExportMenu] = useState(false);\n    const exportMenuRef = useRef<HTMLDivElement>(null);\n    useOnClickOutside(exportMenuRef, () => setShowExportMenu(false), showExportMenu);\n\n    const [activeTab, setActiveTab] = useState<string>(location.state?.ptTab || 'Actively Onboarding');\n    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');\n    const [searchTerm, setSearchTerm] = useState('');\n    const [selectedRows, setSelectedRows] = useState<string[]>([]);\n    \n    // sorting\n    const [sortCol, setSortCol] = useState('releaseDateVal');\n    const [sortAsc, setSortAsc] = useState(true);\n\n    const handleSort = (col: string) => {\n        if (sortCol === col) setSortAsc(!sortAsc);\n        else { setSortCol(col); setSortAsc(true); }\n    };\n\n    // 1. KPI Calculations (similar to Dashboard)\n    const { onboardingCount, prevOnboardingCount, pipelineCount, prevPipelineCount, riskCount, prevRiskCount, liveUnits, prevLiveUnits } = useMemo(() => {\n        let ob = 0, prevOb = 0;\n        let pipe = 0, prevPipe = 
<truncated 15702 bytes>
import { Download, Database, Filter, Target, AlertOctagon, Building, Zap, Calendar } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { TrendIndicator } from '../components/TrendIndicator';
import { calculateProjectHealth } from '../utils/scoringUtils';
import { getHealthBadge, getSettingBadge } from '../utils/uiUtils';
                                            const isActive = activeTab === tab.label;
                                            const isSuspended = tab.label === 'Suspended';
                                            return (
                                                <button 
import { ProjectTrackerTable } from '../components/ProjectTracker/ProjectTrackerTable';
import { ProjectTrackerCalendar } from '../components/ProjectTracker/ProjectTrackerCalendar';
import { BulkActionBar } from '../components/ProjectTracker/BulkActionBar';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { updateProjectRecord, addProjectAutoLog, addAutoLog } from '../api/dbService';
import toast from 'react-hot-toast';
export default function ProjectTracker() {
                                            );
                                        })}
    const { projects, settings, user } = useAppState();
                                    <>
                                        {tabs.map(tab => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.label;
                                            const isSuspended = tab.label === 'Suspended';
                                            return (
                                                <button 
                                                    key={tab.label}
                                                    onClick={() => setPtFilter(tab.label)}
                                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 ${isActive ? 'bg-white text-foreground border-border' : `bg-muted border-transparent hover:bg-accent hover:border-border ${isSuspended ? 'text-destructive/70 hover:text-destructive' : 'text-muted-foreground hover:text-foreground'}`}`}
                                                >
                                                    <Icon className={`w-4 h-4 shrink-0 ${isActive && isSuspended ? 'text-destructive' : (isActive ? 'text-primary' : 'opacity-70')}`} />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </>
                                );
"            <div className=\"bg-white border border-border rounded-b-xl rounded-t-xl shadow-sm flex flex-col relative mx-4 md:mx-6 mb-6\">\n                {viewMode === 'list' ? (\n                    <>\n                        <ProjectTrackerTable \n                            projects={filteredProjects}\n                            activeTab={activeTab}\n                            settings={settings}\n                            selectedRows={selectedRows}\n                            setSelectedRows={setSelectedRows}\n                            sortCol={sortCol}\n                            sortAsc={sortAsc}\n                            onSort={handleSort}\n                            onUpdateProject={handleUpdateProject}\n                            openDrawer={(type, id, data) => openDrawer(type as any, id, data)}\n                            statusFilter={statusFilter}\n                            setStatusFilter={setStatusFilter}\n                            healthFilter={healthFilter}\n                            setHealthFilter={setHealthFilter}\n                            nameFilter={nameFilter}\n                            setNameFilter={setNameFilter}\n                            clientFilter={clientFilter}\n                            setClientFilter={setClientFilter}\n                            managerFilter={managerFilter}\n                            setManagerFilter={setManagerFilter}\n                            timelineFilter={timelineFilter}\n                            setTimelineFilter={setTimelineFilter}\n                            phaseFilter={phaseFilter}\n                            setPhaseFilter={setPhaseFilter}\n                            headerElement={\n                                <div className=\"flex flex-col gap-3 relative\">\n                                    <div className=\"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative\">\n                                        <div className=\"flex items-center gap-2 overflow-x-a
<truncated 12458 bytes>
"            <div className=\"bg-white border-y border-border sm:border sm:rounded-xl shadow-sm flex flex-col relative mx-4 md:mx-6 mb-6\">\n                <div className=\"px-4 py-3 font-normal bg-white z-30 sticky top-0 sm:rounded-t-xl before:absolute before:-top-[1px] before:inset-x-0 before:h-[1px] before:bg-white before:-z-10\">\n                    <div className=\"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative\">\n                        <div className=\"flex items-center gap-2 overflow-x-auto custom-thin-scroll pt-2 pb-2 px-1 -ml-1\">\n                            <div className=\"flex items-center bg-slate-100/80 border border-slate-200 rounded-lg p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] mr-2 shrink-0\">\n                                <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 focus:border-primary ${viewMode === 'list' ? 'bg-white text-foreground shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-foreground'}`}>\n                                    List View\n                                </button>\n                                <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 focus:border-primary ${viewMode === 'calendar' ? 'bg-white text-foreground shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-foreground'}`}>\n                                    Calendar\n                                </button>\n                            </div>\n                            {(() => {\n                                const hasSuspendedProjects = projects.some(p => p.projectStatus === 'Suspended');\n                                const tabs = [\n                                    { label: 'Actively Onboarding', icon: PlayCircle },\n                                
<truncated 11531 bytes>
                        <ProjectTrackerTable 
                            projects={filteredProjects}
                {viewMode === 'list' ? (
                    <>
                        <div className="overflow-x-auto custom-thin-scroll w-full">
                            <ProjectTrackerTable 
                                projects={filteredProjects}
                                activeTab={activeTab}
                            phaseFilter={phaseFilter}
                            setPhaseFilter={setPhaseFilter}
                        />
                        </div>
                        <div className="bg-slate-50 border-t border-border font-medium text-foreground px-4 py-[12px] h-[45px] flex items-center shrink-0 sm:rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)] relative before:absolute before:-bottom-[1px] before:inset-x-0 before:h-[1px] before:bg-border before:-z-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-0 shrink-0 relative z-10 px-4 md:px-6">
            <div className="bg-white border border-border rounded-b-xl rounded-t-xl shadow-sm flex flex-col relative mx-4 md:mx-6 mb-6">
                <div className="px-4 py-3 font-normal bg-white z-30 sticky top-0 sm:rounded-t-xl before:absolute before:-top-[1px] before:inset-x-0 before:h-[1px] before:bg-white before:-z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative">
                        <div className="flex items-center gap-2 overflow-x-auto custom-thin-scroll pt-2 pb-2 px-1 -ml-1">
                            <div className="flex items-center bg-slate-100/80 rounded-lg p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] mr-2 shrink-0">
                                <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 focus:border-primary ${viewMode === 'list' ? 'bg-white text-foreground shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-foreground'}`}>
                                    List View
                                </button>
                                <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 focus:border-primary ${viewMode === 'calendar' ? 'bg-white text-foreground shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-foreground'}`}>
                                    Calendar
                                </button>
                            </div>
                <div className="px-4 py-3 font-normal bg-white z-30 sticky top-0 sm:rounded-t-xl before:absolute before:-top-[1px] before:-left-[2px] before:-right-[2px] before:bottom-0 before:bg-white before:-z-10">
                        <div className="bg-slate-50 border-y border-border font-medium text-foreground px-[128px] py-[12px] h-[45px] flex justify-between items-center shrink-0 rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)] relative before:absolute before:-bottom-[1px] before:inset-x-0 before:h-[1px] before:bg-border before:-z-10">
                            <span className="text-[11px] capitalize tracking-wider text-muted-foreground font-bold">Total Projects: <span className="text-foreground text-[13px] ml-1">{filteredProjects.length}</span></span>
                            <span className="text-[11px] capitalize tracking-wider text-muted-foreground font-bold">Total Units Displayed: <span className="text-foreground text-[13px] font-bold ml-1">{filteredProjects.reduce((sum, p) => sum + (Number(p.units) || 0), 0).toLocaleString()}</span></span>
                        </div>
                {viewMode === 'list' ? (
                    <>
                        <ProjectTrackerTable 
                            projects={filteredProjects}
                            setPhaseFilter={setPhaseFilter}
                        />
                        <div className="bg-slate-50 border-y border-border font-medium text-foreground px-[128px] py-[12px] h-[45px] flex justify-between items-center shrink-0 rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)] relative before:absolute before:-bottom-[1px] before:inset-x-0 before:h-[1px] before:bg-border before:-z-10">
            <div className="bg-white border-y border-border sm:border sm:rounded-xl shadow-sm flex flex-col relative mx-4 md:mx-6 mb-6 w-fit min-w-[calc(100%-2rem)] md:min-w-[calc(100%-3rem)]">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 shrink-0 relative z-30 px-4 md:px-6 w-fit min-w-[calc(100%-2rem)] md:min-w-[calc(100%-3rem)]">    
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-foreground">Project Tracker</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[600px]">Monitor and manage all onboarding and active projects, their timelines, phases, and release dates in one central view.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setAddProjectModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap"
                    >
                        + New Project
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-0 shrink-0 relative z-10 px-4 md:px-6 w-fit min-w-[calc(100%-2rem)] md:min-w-[calc(100%-3rem)]">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-0 shrink-0 relative z-10 px-4 md:px-6 w-fit min-w-[calc(100%-2rem)] md:min-w-[calc(100%-3rem)]">
        // Tab Filter
        let filtered: any[] = projects.map(p => {
            const hist = healthHistory[p.id] || [];
            const sortedHist = [...hist].filter((x:any) => x.timeVal >= thirtyDaysAgo).sort((a:any,b:any) => a.timeVal - b.timeVal);
            const trendData = sortedHist.map((h:any) => h.score);
            if (typeof p.healthScore === 'number') trendData.push(p.healthScore);
            return { ...p, trendData };
        }).filter(p => {
        // Tab Filter
        let filtered: any[] = projects.map(p => {
            const healthCalc = calculateProjectHealth(p, settings);
            const finalScore = typeof p.healthScore === 'number' ? p.healthScore : healthCalc.totalScore;

            const hist = healthHistory[p.id] || [];
            const sortedHist = [...hist].filter((x:any) => x.timeVal >= thirtyDaysAgo).sort((a:any,b:any) => a.timeVal - b.timeVal);
            const trendData = sortedHist.map((h:any) => h.score);
            if (typeof finalScore === 'number') trendData.push(finalScore);
            return { ...p, healthScore: finalScore, trendData };
        }).filter(p => {
                    {(nameFilter.length > 0 || clientFilter.length > 0 || managerFilter.length > 0 || timelineFilter.length > 0 || phaseFilter.length > 0 || statusFilter.length > 0 || healthFilter.length > 0 || featuresFilter.length > 0 || releaseDateFilter !== null) && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="text-xs font-semibold text-slate-500 tracking-wider mr-1">Active Filters:</span>
                            {nameFilter.map(f => (
                        </div>
                    )}
                        </div>
                    )}
                </div>
                </div>
                ) : (
                    <ProjectTrackerCalendar openDrawer={openDrawer} />
                )}
                ) : (
                    <ProjectTrackerCalendar openDrawer={(type, id, data) => openDrawer(type as any, id, data)} />
                )}
                if (field === 'projectStatus' && p.clientIds) {
                    for (const cid of p.clientIds) {
                        await addAutoLog(cid, `Project "${p.name}" Status bulk updated from ${oldVal} to ${value}`, user?.name || 'System');
                    }
                }
        if (field === 'projectStatus') fieldName = 'Status';
            if (field === 'projectStatus') fieldName = 'Status';
            filtered = filtered.filter(p => phaseFilter.includes(p.onboardingPhase || 'Not Set'));
            filtered = filtered.filter(p => timelineFilter.includes(p.timelineStatus || 'Not Set'));
            filtered = filtered.filter(p => statusFilter.includes(p.projectStatus || 'Not Set'));
                await updateProjectRecord({ ...p, ...updates }, { silent: true });
                const oldVal = p[field as keyof typeof p] || 'Unassigned/None';
                await addProjectAutoLog(p.id, `${fieldName} bulk updated to ${value}`, user?.name || 'System');
                
                if (field === 'status' && p.clientIds) {
                    for (const cid of p.clientIds) {
                        await addAutoLog(cid, `Project "${p.name}" Status bulk updated from ${oldVal} to ${value}`, user?.name || 'System');
                    }
                }
            }
                        <div className="flex items-center gap-2 overflow-x-auto custom-thin-scroll py-2 px-2 -mx-2">