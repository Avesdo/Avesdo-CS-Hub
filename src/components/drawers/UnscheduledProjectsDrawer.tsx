import React from 'react';
import { X, Calendar, User, Target } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import { getSettingBadge } from '../../utils/uiUtils';

export default function UnscheduledProjectsDrawer() {
  const { isDrawerOpen, closeDrawer, openDrawer, activeDrawers } = useUI();
  const { projects, settings } = useAppStore();

  const isOpen = isDrawerOpen('unscheduledProjects');

  // Unscheduled projects are those without a releaseDateVal AND with status "Onboarding"
  const unscheduledProjects = projects
    .filter(
      (p) => p.projectStatus === 'Onboarding' && (!p.releaseDateVal || p.releaseDateVal === 0)
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const handleProjectClick = (projectId: string) => {
    openDrawer('project', projectId);
  };

  if (!isOpen) return null;

  const drawerIndex = activeDrawers.findIndex((d) => d.type === 'unscheduledProjects');
  const zIndexOverlay = 100 + Math.max(0, drawerIndex) * 20;
  const zIndexDrawer = 110 + Math.max(0, drawerIndex) * 20;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300 ease-in-out transform-gpu`}
        style={{ zIndex: zIndexOverlay }}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white flex flex-col border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 ease-in-out transform-gpu`}
        style={{ zIndex: zIndexDrawer }}
      >
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-start justify-between shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight truncate">
              Unscheduled Projects
            </h2>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              Projects missing a release date
            </p>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-thin-scroll">
          <div className="flex flex-col gap-3">
            {unscheduledProjects.length > 0 ? (
              unscheduledProjects.map((p) => {
                const clientDisplay = (p.clients || []).join(', ');

                return (
                  <div
                    key={p.id}
                    onClick={() => handleProjectClick(p.id)}
                    className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate pr-2"
                        title={p.name}
                      >
                        {p.name}
                      </h3>
                    </div>
                    <p
                      className="text-xs text-muted-foreground truncate font-medium"
                      title={clientDisplay}
                    >
                      {clientDisplay || 'Unknown Client'}
                    </p>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-border gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex flex-col gap-1 items-start justify-center shrink-0">
                        {getSettingBadge('managers', p.assignee, settings)}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {getSettingBadge('phases', p.onboardingPhase || 'Not Started', settings)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-50/50 rounded-xl p-8 flex flex-col items-center justify-center text-center border border-dashed border-border mt-4 mx-2">
                <p className="text-sm font-medium text-muted-foreground">
                  All projects are scheduled.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
