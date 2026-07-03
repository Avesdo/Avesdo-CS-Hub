import React from 'react';
import { hexToRgba, getSafeHex } from '../../utils/uiUtils';
import { TruncatedText } from '../../components/ui/TruncatedText';

export interface ManagerWorkloadWidgetProps {
  managerWorkload: any[];
  settings: any;
  filteredProjects: any[];
  openDrawer: (type: any, id?: string, data?: any) => void;
}

export function ManagerWorkloadWidget({
  managerWorkload,
  settings,
  filteredProjects,
  openDrawer,
}: ManagerWorkloadWidgetProps) {
  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden">
      <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-white/95 backdrop-blur-md shrink-0">
        <div className="text-base font-semibold tracking-tight text-foreground">
          Manager Workload
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Project volume distribution by assignee
        </p>
      </div>
      <div className="flex-1 overflow-auto p-5 space-y-3 content-start custom-thin-scroll bg-white">
        {managerWorkload.length === 0 && (
          <span className="text-sm text-muted-foreground font-medium text-center w-full block">
            No manager workload data.
          </span>
        )}
        {managerWorkload.map(([manager, counts]) => {
          const initials =
            manager !== 'Unassigned'
              ? manager
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : '?';
          const mHex = getSafeHex(
            settings?.managers?.find((m: any) => m.name === manager)?.color,
            'slate'
          );
          const total = counts.active + counts.onboarding;

          return (
            <div
              key={manager}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-slate-200"
                    style={{
                      backgroundColor: hexToRgba(mHex, 0.08),
                      color: mHex,
                      borderColor: hexToRgba(mHex, 0.2),
                    }}
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <TruncatedText
                      text={String('' + manager + '')}
                      containerClassName="text-sm font-bold text-foreground"
                    >
                      {manager}
                    </TruncatedText>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() =>
                          openDrawer('dashDrilldown', undefined, {
                            contextType: 'managerWorkloadActive',
                            title: 'Active Projects',
                            subtitle: manager,
                            viewAllPath: '/projects',
                            viewAllState: {
                              ptTab: 'All Projects',
                              kpiFilter: 'units',
                              managerFilter: manager,
                            },
                            projects: filteredProjects.filter(
                              (p: any) =>
                                p.assignee === manager &&
                                (p.projectStatus === 'Active' || p.projectStatus === 'Suspended')
                            ),
                          })
                        }
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-green-50 text-green-600 border border-green-200/50 hover:bg-green-100 hover:shadow-sm active:scale-95 transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {counts.active} Active
                      </button>
                      <button
                        onClick={() =>
                          openDrawer('dashDrilldown', undefined, {
                            contextType: 'managerWorkloadOnboarding',
                            title: 'Onboarding Projects',
                            subtitle: manager,
                            viewAllPath: '/projects',
                            viewAllState: {
                              ptTab: 'All Projects',
                              statusFilter: 'Onboarding',
                              managerFilter: manager,
                            },
                            projects: filteredProjects.filter(
                              (p: any) => p.assignee === manager && p.projectStatus === 'Onboarding'
                            ),
                          })
                        }
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200/50 hover:bg-blue-100 hover:shadow-sm active:scale-95 transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {counts.onboarding} Onboarding
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-center shrink-0 pl-4 border-l border-slate-100">
                <span className="text-2xl font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                  {total}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground mt-1 tracking-wider">
                  Total
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
