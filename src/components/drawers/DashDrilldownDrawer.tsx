import React, { useEffect, useMemo } from 'react';
import { X, ChevronRight, User, Calendar, ClipboardCheck, Target } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppState } from '../../context/AppStateContext';
import { getSafeHex, hexToRgba, getSettingBadge, getHealthBadge } from '../../utils/uiUtils';

export default function DashDrilldownDrawer() {
  const { isDrawerOpen, getDrawerData, closeDrawer, openDrawer, activeDrawers } = useUI();
  const { clients, settings, projects: globalProjects } = useAppState();

  const isOpen = isDrawerOpen('dashDrilldown');
  const drawerData = getDrawerData('dashDrilldown');
  const { title, subtitle, projects, contextType } = drawerData?.data || {};

  const handleProjectClick = (projectId: string) => {
    openDrawer('project', projectId);
  };

  if (!isOpen) return null;

  const drawerIndex = activeDrawers.findIndex((d) => d.type === 'dashDrilldown');
  const zIndexOverlay = 100 + Math.max(0, drawerIndex) * 20;
  const zIndexDrawer = 110 + Math.max(0, drawerIndex) * 20;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer ${drawerData?.isClosing ? 'animate-out fade-out' : 'animate-in fade-in'} duration-300 ease-in-out transform-gpu`}
        style={{ zIndex: zIndexOverlay }}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white flex flex-col border-l border-border shadow-2xl ${drawerData?.isClosing ? 'animate-out slide-out-to-right fade-out' : 'animate-in slide-in-from-right'} duration-300 ease-in-out transform-gpu`}
        style={{ zIndex: zIndexDrawer }}
      >
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-start justify-between shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight truncate">
              {title || 'Relevant Projects'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {subtitle || 'Filtered view'}
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
            {projects && projects.length > 0 ? (
              [...projects]
                .sort((a: any, b: any) => {
                  if (contextType === 'featureAdoption') {
                    const allSysFeats = Array.from(
                      new Set((globalProjects || []).flatMap((proj: any) => proj.features || []))
                    );
                    const totalFeats = allSysFeats.length;
                    const adA = totalFeats > 0 ? (a.features || []).length / totalFeats : 0;
                    const adB = totalFeats > 0 ? (b.features || []).length / totalFeats : 0;
                    return adA - adB; // Lowest adoption first
                  }

                  const statusA = a.projectStatus;
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
                })
                .map((p: any) => {
                  const clientDisplay = (p.clients || []).join(', ');

                  // Helper to calculate total adoption across all system features for the badge
                  const allSystemFeatures = Array.from(
                    new Set((globalProjects || []).flatMap((proj: any) => proj.features || []))
                  );
                  const adoptionRate =
                    allSystemFeatures.length > 0
                      ? Math.round(((p.features || []).length / allSystemFeatures.length) * 100)
                      : 0;

                  // Map to standard tailwind classes
                  let adoptionClasses = 'bg-red-50 text-red-600 border-red-200';
                  if (adoptionRate >= 80)
                    adoptionClasses = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                  else if (adoptionRate >= 50)
                    adoptionClasses = 'bg-amber-50 text-amber-600 border-amber-200';

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
                          {contextType === 'featureAdoption' ? (
                            <div className="flex items-center gap-1.5">
                              {getSettingBadge('managers', p.assignee, settings)}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              {p.releaseDateVal
                                ? new Date(p.releaseDateVal).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'No Date'}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {contextType === 'featureAdoption' ? (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-sm ${adoptionClasses}`}
                            >
                              <Target className="w-3 h-3 mr-1 inline-block shrink-0" />
                              {adoptionRate}% Adoption
                            </span>
                          ) : contextType === 'managerWorkloadActive' ? (
                            (() => {
                              const primaryClientName =
                                p.clients && p.clients.length > 0 ? p.clients[0] : null;
                              const primaryClient = clients?.find(
                                (c: any) => c.companyName === primaryClientName
                              );
                              const score =
                                p.healthScore ||
                                (primaryClient?.healthScore !== 'N/A' &&
                                typeof primaryClient?.healthScore === 'number'
                                  ? primaryClient.healthScore
                                  : 0);
                              return getHealthBadge(score, settings);
                            })()
                          ) : contextType === 'managerWorkloadOnboarding' ? (
                            <>
                              {getSettingBadge(
                                'phases',
                                p.onboardingPhase || 'Not Started',
                                settings
                              )}
                              {getSettingBadge('timelines', p.timelineStatus, settings)}
                            </>
                          ) : contextType === 'timeline' ? (
                            <>
                              {getSettingBadge('managers', p.assignee, settings)}
                              {getSettingBadge(
                                'phases',
                                p.onboardingPhase || 'Not Started',
                                settings
                              )}
                            </>
                          ) : (
                            <>
                              {getSettingBadge('managers', p.assignee, settings)}
                              {getSettingBadge('timelines', p.timelineStatus, settings)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="bg-slate-50/50 rounded-xl p-8 flex flex-col items-center justify-center text-center border border-dashed border-border mt-4 mx-2">
                <p className="text-sm font-medium text-muted-foreground">
                  No relevant projects found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
