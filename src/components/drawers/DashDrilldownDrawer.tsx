import React, { useEffect, useMemo } from 'react';
import { X, ChevronRight, User, Calendar, ClipboardCheck, Target } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import { getSafeHex, hexToRgba, getSettingBadge, getHealthBadge, renderIcon } from '../../utils/uiUtils';
import { useNavigate } from 'react-router-dom';

export default function DashDrilldownDrawer() {
  const navigate = useNavigate();
  const { isDrawerOpen, getDrawerData, closeDrawer, openDrawer, activeDrawers } = useUI();
  const clients = useAppStore(state => state.clients);
  const settings = useAppStore(state => state.settings);
  const globalProjects = useAppStore(state => state.projects);

  const isOpen = isDrawerOpen('dashDrilldown');
  const drawerData = getDrawerData('dashDrilldown');
  const { title, subtitle, projects, clients: rawClients, contextType, viewAllPath, viewAllState } = drawerData?.data || {};

  const handleProjectClick = (projectId: string) => {
    openDrawer('project', projectId);
  };

  const handleClientClick = (clientId: string) => {
    openDrawer('client', clientId);
  };

  const handleViewAll = () => {
    closeDrawer();
    if (viewAllPath) {
      navigate(viewAllPath, { state: viewAllState });
    } else {
      navigate('/projects');
    }
  };

  if (!isOpen) return null;

  const drawerIndex = activeDrawers.findIndex((d) => d.type === 'dashDrilldown');
  const zIndexOverlay = 100 + Math.max(0, drawerIndex) * 20;
  const zIndexDrawer = 110 + Math.max(0, drawerIndex) * 20;

  const cleanTitle = title ? title.replace('Schedule Status: ', '').replace('Milestone: ', '') : '';
  let headerIcon = 'Target';
  let headerColor = 'slate';

  if (cleanTitle) {
    for (const key of ['phases', 'timelines', 'serviceStatuses', 'serviceOutcomes']) {
      const list = settings?.[key] || [];
      const item = list.find((i: any) => i.name === cleanTitle);
      if (item) {
        headerIcon = item.icon || 'Target';
        headerColor = item.color || 'slate';
        break;
      }
    }
  }

  const hexColor = getSafeHex(headerColor, 'slate');
  const bgRgba = hexToRgba(hexColor, 0.1);

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
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-50 flex flex-col border-l border-border shadow-2xl ${drawerData?.isClosing ? 'animate-out slide-out-to-right fade-out' : 'animate-in slide-in-from-right'} duration-300 ease-in-out transform-gpu`}
        style={{ zIndex: zIndexDrawer }}
      >
        <div className="px-6 py-6 border-b border-border bg-white flex flex-col shrink-0 relative overflow-hidden shadow-sm">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner"
                style={{ backgroundColor: bgRgba, color: hexColor, borderColor: hexToRgba(hexColor, 0.2) }}
              >
                {renderIcon(headerIcon, 'w-5 h-5')}
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  {title || 'Relevant Projects'}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                  {subtitle || 'Filtered view'}
                </p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-full transition-all duration-200 active:scale-95 shrink-0 bg-white shadow-sm border border-slate-200 z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between relative z-10">
             <span className="text-xs font-bold text-muted-foreground tracking-wider shrink-0">
               {projects?.length ? `${projects.length} Projects` : rawClients?.length ? `${rawClients.length} Clients` : '0 Items'}
             </span>
             <div className="flex items-center gap-3 flex-1 ml-4">
               <div className="h-px bg-border flex-1"></div>
               <button 
                 onClick={handleViewAll}
                 className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors shrink-0"
               >
                 View all in {viewAllPath === '/clients' ? 'Clients' : 'Projects'} <ChevronRight className="w-3.5 h-3.5" />
               </button>
             </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 custom-thin-scroll">
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

                  // Determine left border color based on status
                  let borderLeftClass = 'border-l-slate-300';
                  if (p.projectStatus === 'Active') borderLeftClass = 'border-l-emerald-500';
                  else if (p.projectStatus === 'Onboarding') borderLeftClass = 'border-l-blue-500';
                  else if (p.projectStatus === 'Suspended') borderLeftClass = 'border-l-amber-500';

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleProjectClick(p.id)}
                      className={`bg-white border border-border border-l-[4px] ${borderLeftClass} rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 cursor-pointer group relative overflow-hidden`}
                    >
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-slate-400 group-hover:text-primary">
                        <ChevronRight className="w-5 h-5" />
                      </div>

                      <div className="flex justify-between items-start mb-1 pr-8">
                        <h3
                          className="font-bold text-sm text-foreground group-hover:text-primary transition-colors"
                        >
                          {p.name}
                        </h3>
                      </div>
                      <p
                        className="text-xs text-muted-foreground font-medium pr-8"
                      >
                        {clientDisplay || 'Unknown Client'}
                      </p>
                      
                      <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100 pr-4">
                        <div className="flex flex-col gap-1 items-start justify-center shrink-0">
                          {contextType === 'featureAdoption' ? (
                            <div className="flex items-center gap-1.5">
                              {getSettingBadge('managers', p.assignee, settings)}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-sm ${adoptionClasses}`}
                            >
                              <Target className="w-3 h-3 mr-1 mb-0.5 inline-block shrink-0" />
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
            ) : rawClients && rawClients.length > 0 ? (
              [...rawClients]
                .sort((a: any, b: any) => {
                  const scoreA = typeof a.healthScore === 'number' ? a.healthScore : 0;
                  const scoreB = typeof b.healthScore === 'number' ? b.healthScore : 0;
                  return scoreA - scoreB; // Lowest score first
                })
                .map((c: any) => {
                  // Determine left border color based on health score
                  let borderLeftClass = 'border-l-slate-300';
                  if (typeof c.healthScore === 'number') {
                    const healthyThresh = settings?.scoring?.thresholds?.healthy ?? 80;
                    const warningThresh = settings?.scoring?.thresholds?.warning ?? 50;
                    if (c.healthScore >= healthyThresh) borderLeftClass = 'border-l-lime-500';
                    else if (c.healthScore >= warningThresh) borderLeftClass = 'border-l-orange-500';
                    else borderLeftClass = 'border-l-red-500';
                  }

                  return (
                    <div
                      key={c.clientId || c.id}
                      onClick={() => handleClientClick(c.clientId || c.id)}
                      className={`bg-white border border-border border-l-[4px] ${borderLeftClass} rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 cursor-pointer group relative overflow-hidden`}
                    >
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-slate-400 group-hover:text-primary">
                        <ChevronRight className="w-5 h-5" />
                      </div>

                      <div className="flex justify-between items-start mb-1 pr-8">
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {c.companyName || 'Unknown Client'}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium pr-8">
                        {c.clientType || 'Standard'}
                      </p>
                      
                      <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100 pr-4">
                        <div className="flex flex-col gap-1 items-start justify-center shrink-0">
                          {getSettingBadge('managers', c.accountManager, settings)}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {getHealthBadge(c.healthScore, settings)}
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="bg-slate-50/50 rounded-xl p-8 flex flex-col items-center justify-center text-center border border-dashed border-border mt-4 mx-2">
                <p className="text-sm font-medium text-muted-foreground">
                  No relevant items found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
