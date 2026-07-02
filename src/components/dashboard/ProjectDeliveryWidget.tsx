import React, { useState } from 'react';
import { hexToRgba, getSafeHex } from '../../utils/uiUtils';

export interface ProjectDeliveryWidgetProps {
  onboardingPhases: any[];
  settings: any;
  filteredProjects: any[];
  projects: any[];
  openDrawer: (type: any, id?: string, data?: any) => void;
  deliveryTimelines: any[];
}

export function ProjectDeliveryWidget({
  onboardingPhases,
  settings,
  filteredProjects,
  projects,
  openDrawer,
  deliveryTimelines,
}: ProjectDeliveryWidgetProps) {
  const [hoveredTimeline, setHoveredTimeline] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 pb-3 border-b border-border bg-white/95 backdrop-blur-md shrink-0">
        <div className="flex flex-col min-w-0">
          <div className="text-base font-semibold tracking-tight text-foreground">
            Project Delivery
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Implementation pipeline and schedule health for onboarding projects
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-2xl font-bold text-foreground leading-none">
            {onboardingPhases.reduce((acc, curr) => acc + Number(curr[1]), 0)}
          </div>
          <div className="text-[11px] text-muted-foreground font-semibold mt-1">
            Onboarding Projects
          </div>
        </div>
      </div>

      <div className="flex flex-col p-6 gap-6">
        {/* Top Half: Pipeline */}
        <div className="relative min-h-[120px] flex items-center justify-center">
          <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] z-0"></div>
          <div className="flex items-center w-full justify-between relative z-10 px-[10%] h-full">
            {onboardingPhases.length === 0 ? (
              <span className="bg-white px-4 text-muted-foreground font-medium z-10 w-full text-center">
                No onboarding projects
              </span>
            ) : (
              onboardingPhases.map(([phase, count], idx) => {
                const isTop = idx % 2 === 0;
                const colorName = settings?.phases?.find(
                  (p: any) => p.name?.toLowerCase() === String(phase).toLowerCase()
                )?.color;
                const hexColor = getSafeHex(colorName, 'slate');

                return (
                  <div
                    key={phase}
                    className="relative flex flex-col items-center justify-center group cursor-pointer transition-all duration-300 z-10"
                    onClick={() =>
                      openDrawer('dashDrilldown', undefined, {
                        title: `Milestone: ${phase}`,
                        subtitle: 'Onboarding Projects',
                        viewAllPath: '/projects',
                        viewAllState: {
                          ptTab: 'All Projects',
                          statusFilter: 'Onboarding',
                          phaseFilter: phase === 'Not Started' ? 'Not Started' : phase,
                        },
                        projects: filteredProjects.filter(
                          (p) =>
                            p.projectStatus === 'Onboarding' &&
                            (p.onboardingPhase === phase ||
                              (!p.onboardingPhase && phase === 'Not Started'))
                        ),
                      })
                    }
                  >
                    {isTop && (
                      <div className="absolute bottom-full mb-3 flex flex-col items-center justify-end text-center w-[120px] transition-transform group-hover:-translate-y-1.5">
                        <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-none tracking-tight">
                          {count}
                        </span>
                        <span className="text-[11px] font-semibold text-muted-foreground mt-1.5 whitespace-normal leading-tight">
                          {phase}
                        </span>
                      </div>
                    )}
                    <div
                      className="w-8 h-4 shrink-0 rounded-full ring-[3px] ring-white shadow-md group-hover:scale-110 transition-transform z-10"
                      style={{ backgroundColor: hexColor }}
                    ></div>
                    {!isTop && (
                      <div className="absolute top-full mt-3 flex flex-col items-center justify-start text-center w-[120px] transition-transform group-hover:translate-y-1.5">
                        <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-none tracking-tight">
                          {count}
                        </span>
                        <span className="text-[11px] font-semibold text-muted-foreground mt-1.5 whitespace-normal leading-tight">
                          {phase}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border w-[90%] mx-auto"></div>

        {/* Bottom Half: Health Progress Bar */}
        <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto pt-2 pb-6">
          <div className="w-full flex gap-1 h-3 mt-1 items-center">
            {deliveryTimelines.map((t) => {
              const hexColor = getSafeHex(t.color, 'slate');
              return (
                <div
                  key={t.name}
                  title={`${t.name}: ${t.count}`}
                  onMouseEnter={() => setHoveredTimeline(t.name)}
                  onMouseLeave={() => setHoveredTimeline(null)}
                  className={`h-full rounded-full cursor-pointer transition-all duration-300 ${hoveredTimeline === t.name ? '-translate-y-0.5 shadow-md brightness-110' : ''}`}
                  style={{ width: `${t.percentage}%`, backgroundColor: hexColor }}
                  onClick={() =>
                    openDrawer('dashDrilldown', undefined, {
                      title: `Schedule Status: ${t.name}`,
                      subtitle: 'Onboarding Projects',
                      contextType: 'timeline',
                      viewAllPath: '/projects',
                      viewAllState: {
                        ptTab: 'All Projects',
                        statusFilter: 'Onboarding',
                        timelineFilter: t.name,
                      },
                      projects: projects.filter(
                        (p) => p.projectStatus === 'Onboarding' && p.timelineStatus === t.name
                      ),
                    })
                  }
                />
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            {deliveryTimelines.map((t) => {
              const hexColor = getSafeHex(t.color, 'slate');
              return (
                <button
                  key={t.name}
                  onMouseEnter={() => setHoveredTimeline(t.name)}
                  onMouseLeave={() => setHoveredTimeline(null)}
                  onClick={() =>
                    openDrawer('dashDrilldown', undefined, {
                      title: `Schedule Status: ${t.name}`,
                      subtitle: 'Onboarding Projects',
                      contextType: 'timeline',
                      viewAllPath: '/projects',
                      viewAllState: {
                        ptTab: 'All Projects',
                        statusFilter: 'Onboarding',
                        timelineFilter: t.name,
                      },
                      projects: projects.filter(
                        (p) => p.projectStatus === 'Onboarding' && p.timelineStatus === t.name
                      ),
                    })
                  }
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-bold border shadow-sm transition-all cursor-pointer bg-white whitespace-nowrap active:scale-95 ${hoveredTimeline === t.name ? '-translate-y-1 shadow-md' : ''}`}
                  style={{
                    backgroundColor: hexToRgba(hexColor, 0.08),
                    color: hexColor,
                    borderColor: hexToRgba(hexColor, 0.2),
                  }}
                >
                  <span className="font-black">{t.count}</span> {t.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
