"import React, { useState } from 'react';\nimport { X, FolderOpen } from 'lucide-react';\nimport { useUI } from '../../context/UIContext';\nimport { useAppState } from '../../context/AppStateContext';\n\n// Tabs\nimport ProjectOverviewTab from './project/ProjectOverviewTab';\nimport ProjectHealthTab from './project/ProjectHealthTab';\nimport ProjectTrendsTab from './project/ProjectTrendsTab';\nimport ProjectFeaturesTab from './project/ProjectFeaturesTab';\nimport ProjectServicesTab from './project/ProjectServicesTab';\nimport ProjectNotesTab from './project/ProjectNotesTab';\n\nexport default function ProjectDrawer() {\n  const { activeDrawer, closeDrawer } = useUI();\n  const { projects } = useAppState();\n  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'trends' | 'features' | 'services' | 'notes'>('overview');\n  \n  if (activeDrawer.type !== 'project') return null;\n\n  const project = projects.find(p => p.id === activeDrawer.entityId);\n  const isOpen = activeDrawer.type === 'project';\n\n  const tabs = [\n    { id: 'overview', label: 'Overview' },\n    { id: 'health', label: 'Health' },\n    { id: 'trends', label: 'Trends' },\n    { id: 'features', label: 'Features' },\n    { id: 'services', label: 'Services' },\n    { id: 'notes', label: 'Notes & Logs' }\n  ] as const;\n\n  return (\n    <>\n      <div \n        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} \n        onClick={closeDrawer}\n      ></div>\n      \n      <div \n        className={`fixed top-0 right-0 h-full w-[800px] max-w-[100vw] bg-white border-l border-border shadow-2xl z-[105] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}\n      >\n        <div className=\"px-6 py-5 border-b border-border flex justify-between items-start bg-slate-50 shrink-0\">\n          <div className=\"flex gap-4 items-center\">\n            <div className=\"w-12 h-1
<truncated 2957 bytes>
import { useUI } from '../../context/UIContext';
import { useAppState } from '../../context/AppStateContext';
import { getSettingBadge } from '../../utils/uiUtils';

// Tabs
  const { activeDrawer, closeDrawer } = useUI();
  const { projects, settings } = useAppState();
  const { isDrawerOpen, getDrawerData, closeDrawer } = useUI();
  const { projects } = useAppState();

  const isOpen = isDrawerOpen('project');
  const drawerData = getDrawerData('project');
  const project = projects.find(p => p.id === drawerData?.entityId);
        className={`fixed top-0 right-0 h-full w-[800px] max-w-[100vw] bg-white border-l border-border flex flex-col transform transition-all duration-300 ease-in-out z-[105] ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}
      <div 
        className={`fixed top-0 right-0 h-full w-[800px] max-w-[100vw] bg-white border-l border-border flex flex-col transform transition-all duration-300 ease-in-out z-[120] ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}
      >
        <div className="px-6 py-5 border-b border-border flex justify-between items-start bg-slate-50 shrink-0">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm border border-indigo-200">
              <FolderOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground tracking-tight leading-tight truncate">{project?.name || 'Loading Project...'}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <div className="active:scale-95 transition-all">
                   {getSettingBadge('statuses', project?.projectStatus || 'Unknown', settings)}
                 </div>
                 <span className="text-sm text-muted-foreground">{project?.clients?.join(', ') || 'No clients'}</span>
              </div>
            </div>
        <div className="bg-slate-50 shrink-0 border-b border-border py-3">
          <div className="flex overflow-x-auto px-6 gap-2 custom-thin-scroll">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-bold rounded-full transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 ${ activeTab === tab.id ? 'bg-white text-foreground border-border' : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border' }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>