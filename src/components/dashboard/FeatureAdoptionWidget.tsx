import React from 'react';
import { TruncatedText } from '../../components/ui/TruncatedText';

export interface FeatureAdoptionWidgetProps {
  featureAdoptionCombined: any;
  filteredProjects: any[];
  openDrawer: (type: any, id?: string, data?: any) => void;
}

export function FeatureAdoptionWidget({
  featureAdoptionCombined,
  filteredProjects,
  openDrawer,
}: FeatureAdoptionWidgetProps) {
  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 pb-3 border-b border-border bg-white/95 backdrop-blur-md shrink-0">
        <div className="flex flex-col pr-4 min-w-0">
          <TruncatedText
            text={String('Feature Adoption')}
            containerClassName="text-base font-semibold tracking-tight text-foreground"
          >
            Feature Adoption
          </TruncatedText>
          <TruncatedText
            text={String(
              'Combined adoption across all projects'
            )}
            containerClassName="text-xs text-muted-foreground mt-1 font-medium"
          >
            Combined adoption across all projects
          </TruncatedText>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-5 content-start custom-thin-scroll bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {featureAdoptionCombined.data.length === 0 ? (
            <span className="text-sm text-muted-foreground font-medium text-center w-full block md:col-span-2 py-4">
              No features tracked.
            </span>
          ) : (
            featureAdoptionCombined.data.map(({ feature, active, onboarding, total }: any) => {
              const totalPct =
                featureAdoptionCombined.totalProjects > 0
                  ? Math.round((total / featureAdoptionCombined.totalProjects) * 100)
                  : 0;

              return (
                <div
                  key={feature}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col gap-2 flex-1 overflow-hidden pr-2">
                    <TruncatedText
                      text={String('' + feature + '')}
                      containerClassName="text-sm font-bold text-foreground group-hover:text-primary transition-colors"
                    >
                      {feature}
                    </TruncatedText>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          openDrawer('dashDrilldown', undefined, {
                            contextType: 'featureAdoption',
                            title: `Feature: ${feature}`,
                            subtitle: 'Active Projects',
                            viewAllPath: '/projects',
                            viewAllState: {
                              ptTab: 'All Projects',
                              kpiFilter: 'units',
                              featuresFilter: feature,
                            },
                            projects: filteredProjects.filter(
                              (p) =>
                                (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') &&
                                (p.features || []).includes(feature)
                            ),
                          })
                        }
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-green-50 text-green-600 border border-green-200/50 hover:bg-green-100 hover:shadow-sm active:scale-95 transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {active} Active
                      </button>
                      <button
                        onClick={() =>
                          openDrawer('dashDrilldown', undefined, {
                            contextType: 'featureAdoption',
                            title: `Feature: ${feature}`,
                            subtitle: 'Onboarding Projects',
                            viewAllPath: '/projects',
                            viewAllState: {
                              ptTab: 'All Projects',
                              statusFilter: 'Onboarding',
                              featuresFilter: feature,
                            },
                            projects: filteredProjects.filter(
                              (p) =>
                                p.projectStatus === 'Onboarding' &&
                                (p.features || []).includes(feature)
                            ),
                          })
                        }
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200/50 hover:bg-blue-100 hover:shadow-sm active:scale-95 transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {onboarding} Onboarding
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center shrink-0 pl-4 border-l border-slate-100 min-w-[70px]">
                    <span className="text-2xl font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                      {totalPct}%
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground mt-1 tracking-wider">
                      {total} Projects
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
