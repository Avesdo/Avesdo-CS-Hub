"import React, { useState } from 'react';\nimport { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';\nimport { useAppState } from '../../context/AppStateContext';\n\ninterface ProjectTrackerCalendarProps {\n  openDrawer: (type: string, id: string, data?: any) => void;\n}\n\nexport const ProjectTrackerCalendar: React.FC<ProjectTrackerCalendarProps> = ({ openDrawer }) => {\n  const { projects, settings } = useAppState();\n  const [currentDate, setCurrentDate] = useState(new Date());\n  const [activePopover, setActivePopover] = useState<string | null>(null);\n\n  const year = currentDate.getFullYear();\n  const month = currentDate.getMonth();\n\n  const monthNames = [\"January\", \"February\", \"March\", \"April\", \"May\", \"June\", \"July\", \"August\", \"September\", \"October\", \"November\", \"December\"];\n  \n  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));\n  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));\n  const handleToday = () => setCurrentDate(new Date());\n\n  const firstDay = new Date(year, month, 1).getDay();\n  const daysInMonth = new Date(year, month + 1, 0).getDate();\n  const daysInPrevMonth = new Date(year, month, 0).getDate();\n\n  const isToday = (d: number, m: number, y: number) => {\n    const today = new Date();\n    return d === today.getDate() && m === today.getMonth() && y === today.getFullYear();\n  };\n\n  const unscheduledProjects = projects.filter(p => p.projectStatus === 'Onboarding' && (!p.releaseDateVal || p.releaseDateVal === 0));\n\n  const getColorClasses = (timelineStatus: string) => {\n    let item = settings?.timelineStatuses?.find((s: any) => s.name === timelineStatus);\n    if (!item) {\n        item = settings?.archivedData?.timelineStatuses?.find((s: any) => s.name === timelineStatus);\n    }\n    const cName = item?.color || 'slate';\n\n    switch (cName) {\n      case 'green': return { bg: 'bg-lime-500/10', border: 'border-lime-500/20', text: 'text-lime-700' };\n      case 
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle, User } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { getSafeHex, hexToRgba } from '../../utils/uiUtils';
          <div className="text-xs font-medium mb-2 text-slate-300">{i}</div>
        </div>
      );
      cells.push(
        <div key={`day-${day}`} className={`${dayBgClass} p-2 min-h-[120px] flex flex-col relative`}>
          <div className={`text-xs font-bold mb-2 ${isToday(day, month, year) ? 'text-primary' : 'text-foreground opacity-70'}`}>
      cells.push(
        <div key={`prev-${i}`} className="bg-slate-50/30 p-2 min-h-[120px]">
  const [activePopover, setActivePopover] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activePopover) {
        e.stopPropagation();
        setActivePopover(null);
      }
    };
    if (activePopover) {
      window.addEventListener('keydown', handleKeyDown, true);
    }
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [activePopover]);
      );
        <div className="font-bold truncate text-slate-800 leading-tight mb-1 text-[11px]">{pName}</div>
        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium leading-normal overflow-hidden">
          <User className="w-3 h-3 shrink-0 opacity-70" />
          <span className="truncate">{mgr}</span>
          <span className="mx-0.5 opacity-50 shrink-0">•</span>
          <span className="truncate">{pPhase}</span>
        </div>
  const getColorClasses = (timelineStatus: string) => {
    let item = settings?.timelines?.find((s: any) => s.name === timelineStatus);
    if (!item) {
        item = settings?.archivedData?.timelines?.find((s: any) => s.name === timelineStatus);
    }
  const getColorClasses = (timelineStatus: string) => {
    let item = (settings?.timelines || settings?.timelineStatuses)?.find((s: any) => s.name === timelineStatus);
    if (!item) {
        item = (settings?.archivedData?.timelines || settings?.archivedData?.timelineStatuses)?.find((s: any) => s.name === timelineStatus);
    }
  const renderProjectBlock = (p: any) => {
    const { borderL } = getColorClasses(p.timelineStatus);
    const pName = p.name || 'Not Set';
    const mgr = p.assignee || 'Unassigned';
    const pPhase = p.onboardingPhase || 'Not Set';

    return (
      <div 
        key={p.id}
        onClick={() => openDrawer('project', p.id)}
        className={`p-2 mb-1.5 rounded-md border-y border-r border-slate-200 border-l-4 ${borderL} bg-white shadow-sm cursor-pointer hover:-translate-y-[1px] hover:shadow-md hover:border-slate-300 hover:border-l-[${borderL.split('-').slice(1).join('-')}] transition-all group`}
    const pName = p.name || 'Not Set';
    const mgr = p.assignee || 'Unassigned';
    const pPhase = p.onboardingPhase || 'Not Set';
          <User className="w-3 h-3 shrink-0 opacity-70" />
          <span className="truncate">{mgr}</span>
          <span className="mx-0.5 opacity-50 shrink-0">•</span>
          <span className="truncate">{pPhase}</span>
        </div>
      </div>
    );
  };
        className={`p-2 mb-1.5 rounded-md border-y border-r border-slate-200 border-l-4 ${borderL} bg-white shadow-sm cursor-pointer hover:-translate-y-[1px] hover:shadow-md hover:border-slate-300 transition-all group`}
      <div 
      <div 
        key={p.id}
        onClick={() => openDrawer('project', p.id)}
        className="p-2 mb-1.5 rounded-md border border-l-4 shadow-sm cursor-pointer hover:-translate-y-[1px] hover:shadow-md transition-all group"
        style={{ 
          borderLeftColor: borderHex,
          borderTopColor: hexToRgba(borderHex, 0.3),
          borderRightColor: hexToRgba(borderHex, 0.3),
          borderBottomColor: hexToRgba(borderHex, 0.3),
          backgroundColor: hexToRgba(borderHex, 0.08)
        }}
      >
        <button 
          onClick={() => openDrawer('unscheduledProjects', '')}
          className="flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all duration-200"
        >
        <button 
          onClick={() => openDrawer('unscheduledProjects', '')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <AlertCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-semibold text-sm text-foreground">Unscheduled</span>
          <span className="ml-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {unscheduledProjects.length}
          </span>
        </button>
        <button 
          onClick={() => openDrawer('unscheduledProjects', '')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <AlertCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-semibold text-sm text-foreground">Unscheduled</span>
          <span className="ml-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold group-hover:bg-red-200 group-hover:text-red-700 transition-colors">
            {unscheduledProjects.length}
          </span>
        </button>