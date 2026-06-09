"import React, { useEffect } from 'react';\nimport { X, ChevronRight } from 'lucide-react';\nimport { useUI } from '../../context/UIContext';\nimport { useAppState } from '../../context/AppStateContext';\n\nexport default function DashDrilldownDrawer() {\n  const { activeDrawer, closeDrawer, openDrawer } = useUI();\n  const { clients } = useAppState();\n  \n  const isOpen = activeDrawer.type === 'dashDrilldown';\n  const { title, subtitle, projects } = activeDrawer.data || {};\n\n  // Close on escape key\n  useEffect(() => {\n    const handleEsc = (e: KeyboardEvent) => {\n      if (e.key === 'Escape' && isOpen) closeDrawer();\n    };\n    window.addEventListener('keydown', handleEsc);\n    return () => window.removeEventListener('keydown', handleEsc);\n  }, [isOpen, closeDrawer]);\n\n  const handleProjectClick = (projectId: string) => {\n    openDrawer('project', projectId);\n  };\n\n  return (\n    <>\n      {/* Overlay */}\n      <div \n        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}\n        onClick={closeDrawer}\n      />\n\n      {/* Drawer */}\n      <div \n        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-border z-[110] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}\n      >\n        <div className=\"px-6 py-5 border-b border-border bg-slate-50 flex items-start justify-between shrink-0\">\n          <div className=\"min-w-0 pr-4\">\n             <h2 className=\"text-xl font-bold text-foreground tracking-tight truncate\">{title || 'Relevant Projects'}</h2>\n             <p className=\"text-sm text-muted-foreground mt-1 truncate\">{subtitle || 'Filtered view'}</p>\n          </div>\n          <button onClick={closeDrawer} className=\"p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200 active:scale-95 shrink-0 focus:outline-none\">\n  
<truncated 2229 bytes>
        <div className="flex-1 overflow-y-auto bg-background p-0 custom-thin-scroll">
          <div className="p-5 space-y-3">
            {projects && projects.length > 0 ? (
  const { clients, settings } = useAppState();
                const mColorName = settings?.managers?.find((m:any) => m.name === p.assignee)?.color || 'slate';
  const { isDrawerOpen, getDrawerData, closeDrawer, openDrawer } = useUI();

  const isOpen = isDrawerOpen('dashDrilldown');
  const drawerData = getDrawerData('dashDrilldown');
  const { title, subtitle, projects, contextType } = drawerData?.data || {};
                  if (!val) return null;
                  const v = val.trim().toLowerCase();

                const phName = p.onboardingPhase || 'Not Started';
                const phColorName = matchItem(settings?.phases || [], phName)?.color || 'slate';
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-sm text-[#0ea5e9] group-hover:text-primary transition-colors truncate pr-2" title={p.name}>{p.name}</h3>
export default function DashDrilldownDrawer() {
  const { activeDrawer, closeDrawer, openDrawer } = useUI();
  const { clients, settings, projects: globalProjects } = useAppState();
              const allSystemFeatures = Array.from(new Set((globalProjects || []).flatMap((proj:any) => proj.features || [])));
              const adoptionRate = allSystemFeatures.length > 0 ? Math.round(((p.features || []).length / allSystemFeatures.length) * 100) : 0;
              const adoptionHex = adoptionRate >= 80 ? '#5ea500' : adoptionRate >= 50 ? '#fe9a00' : '#e7000b';
        <div className="flex flex-col gap-3">
          {projects && projects.length > 0 ? (
            [...projects].sort((a: any, b: any) => {
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white flex flex-col border-l border-border z-[110] transform transition-all duration-300 ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}
              const statusB = b.projectStatus;
              
              if (statusA !== statusB) {
                  return statusA === 'Onboarding' ? 1 : -1;
              }

              const dateA = a.releaseDateVal || 0;
              const dateB = b.releaseDateVal || 0;

              if (statusA === 'Active' || statusA === 'Suspended') {
                  return dateB - dateA; // Newest first
              } else {
                  // Oldest first (No Date at the bottom)
                  if (dateA === 0 && dateB !== 0) return 1;
                  if (dateB === 0 && dateA !== 0) return -1;
                  return dateA - dateB;
              }
            }).map((p: any) => {
              const clientDisplay = (p.clients || []).join(', ');
              <div className="text-sm text-muted-foreground font-medium text-center py-10 w-full block">No projects found.</div>
                    className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"