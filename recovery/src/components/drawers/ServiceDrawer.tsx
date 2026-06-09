"import React, { useState } from 'react';\nimport { X, Layers } from 'lucide-react';\nimport { useUI } from '../../context/UIContext';\nimport { useAppState } from '../../context/AppStateContext';\n\nimport ServiceDetailsTab from './service/ServiceDetailsTab';\nimport ServiceNotesTab from './service/ServiceNotesTab';\n\nexport default function ServiceDrawer() {\n  const { activeDrawer, closeDrawer } = useUI();\n  const { services } = useAppState();\n  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');\n  \n  if (activeDrawer.type !== 'service') return null;\n\n  const service = services.find(s => s.id === activeDrawer.entityId);\n  const isOpen = activeDrawer.type === 'service';\n\n  const tabs = [\n    { id: 'details', label: 'Service Details' },\n    { id: 'notes', label: 'Notes & Logs' }\n  ] as const;\n\n  return (\n    <>\n      <div \n        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} \n        onClick={closeDrawer}\n      ></div>\n      \n      <div \n        className={`fixed top-0 right-0 h-full w-[800px] max-w-[100vw] bg-white border-l border-border shadow-2xl z-[105] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}\n      >\n        <div className=\"px-6 py-5 border-b border-border flex justify-between items-start bg-slate-50 shrink-0\">\n          <div className=\"flex gap-4 items-center\">\n            <div className=\"w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 shadow-sm border border-purple-200\">\n              <Layers className=\"w-6 h-6 text-purple-600\" />\n            </div>\n            <div className=\"flex-1 min-w-0\">\n              <h2 className=\"text-2xl font-bold text-foreground tracking-tight leading-tight truncate\">{service?.serviceName || 'Loading Service...'}</h2>\n              <div className=\"flex items-center gap-2 mt-1\">\n             
<truncated 2029 bytes>
import { useUI } from '../../context/UIContext';
import { useAppState } from '../../context/AppStateContext';
import { getSettingBadge } from '../../utils/uiUtils';
              </div>
export default function ServiceDrawer() {
  const { activeDrawer, closeDrawer } = useUI();
  const { services, settings } = useAppState();
  const { isDrawerOpen, getDrawerData, closeDrawer } = useUI();
  const { services } = useAppState();

  const isOpen = isDrawerOpen('service');
  const drawerData = getDrawerData('service');
  const service = services.find(s => s.id === drawerData?.entityId);
        className={`fixed top-0 right-0 h-full w-[800px] max-w-[100vw] bg-white border-l border-border flex flex-col transform transition-all duration-300 ease-in-out z-[105] ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}
      <div 
        className={`fixed top-0 right-0 h-full w-[800px] max-w-[100vw] bg-white border-l border-border flex flex-col transform transition-all duration-300 ease-in-out z-[130] ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}
      >
        <div className="px-6 py-5 border-b border-border flex justify-between items-start bg-slate-50 shrink-0">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 shadow-sm border border-purple-200">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground tracking-tight leading-tight truncate">{service?.serviceName || 'Loading Service...'}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <div className="active:scale-95 transition-all">
                   {getSettingBadge('serviceStatuses', service?.status || 'Unknown', settings)}
                 </div>
                 <div className="active:scale-95 transition-all">
                   {getSettingBadge('serviceTypes', service?.type || 'Standard', settings)}
                 </div>
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