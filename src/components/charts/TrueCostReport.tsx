import React, { useMemo, useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SupportTicket } from '../../store/useSupportStore';
import { useTrueCostAnalytics } from '../../hooks/useTrueCostAnalytics';

interface TrueCostReportProps {
  tickets: SupportTicket[];
}

export const TrueCostReport: React.FC<TrueCostReportProps> = ({ tickets }) => {
  const { projects, kpis } = useTrueCostAnalytics(tickets);
  const [selectedProjectRef, setSelectedProjectRef] = useState<string | null>(null);

  const top10Projects = useMemo(() => {
    // Top 10 Projects by totalActiveEffortHours
    return projects.slice(0, 10).map((p) => {
      let fill = '#0d9488'; // Teal for < 3d
      if (p.avgWallClockDays > 7) {
        fill = '#ef4444'; // Red for > 7d
      } else if (p.avgWallClockDays >= 3) {
        fill = '#f97316'; // Orange for 3-7d
      }

      return {
        name: p.name,
        effort: p.totalActiveEffortHours,
        avgDays: p.avgWallClockDays,
        fill,
        projectRef: p.name,
      };
    });
  }, [projects]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectRef) return null;
    return projects.find((p) => p.name === selectedProjectRef) || null;
  }, [projects, selectedProjectRef]);

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6 flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">True Cost Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Identify where your team is burning human labor.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-border shadow-sm rounded-lg p-4 flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Total Tracked Effort
          </span>
          <span className="text-2xl font-bold text-foreground">
            {kpis?.totalEffortHours?.toFixed(1) || '0.0'}h
          </span>
        </div>
        <div className="bg-white border border-border shadow-sm rounded-lg p-4 flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Overall Avg Resolution
          </span>
          <span className="text-2xl font-bold text-foreground">
            {kpis?.overallAvgResolutionDays?.toFixed(1) || '0.0'}d
          </span>
        </div>
        <div className="bg-white border border-border shadow-sm rounded-lg p-4 flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Firedrill Count
          </span>
          <span className="text-2xl font-bold text-foreground">{kpis?.firedrillCount || 0}</span>
        </div>
      </div>

      {/* Main Content: Radial Chart + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
        {/* Radial Chart */}
        <div className="flex flex-col space-y-3 h-full">
          <h3 className="text-sm font-bold text-foreground">Top 10 Projects by Effort</h3>
          <div className="flex-1 w-full border border-border rounded-lg bg-slate-50 p-4">
            {top10Projects.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="100%"
                  data={top10Projects}
                >
                  <RadialBar
                    minPointSize={15}
                    background
                    dataKey="effort"
                    cornerRadius={10}
                    onClick={(data: any) => {
                      if (data && data.payload) {
                        setSelectedProjectRef(data.payload.projectRef);
                      }
                    }}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${Number(value || 0).toFixed(1)}h (Avg: ${props.payload.avgDays.toFixed(1)}d)`,
                      'Effort',
                    ]}
                  />
                  <Legend
                    iconSize={10}
                    width={140}
                    height={140}
                    layout="vertical"
                    verticalAlign="middle"
                    wrapperStyle={{ right: 0, top: 0, bottom: 0, margin: 'auto' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                No project data available.
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Project Details */}
        <div className="flex flex-col space-y-3 h-full overflow-hidden">
          <h3 className="text-sm font-bold text-foreground">
            {selectedProject ? `${selectedProject.name} Categories` : 'Select a Project'}
          </h3>
          <div className="flex-1 w-full border border-border rounded-lg bg-white flex flex-col overflow-hidden">
            {selectedProject ? (
              <div className="p-4 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4 shrink-0">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Project Effort</div>
                    <div className="font-semibold text-foreground">
                      {selectedProject.totalActiveEffortHours.toFixed(1)}h
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Avg Resolution</div>
                    <div className="font-semibold text-foreground">
                      {selectedProject.avgWallClockDays.toFixed(1)}d
                    </div>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {selectedProject.categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div
                        className="font-medium text-sm text-slate-700 truncate pr-2"
                        title={cat.name}
                      >
                        {cat.name}
                      </div>
                      <div className="flex items-center gap-4 text-sm whitespace-nowrap shrink-0">
                        <div className="text-right">
                          <span className="font-semibold text-slate-700">
                            {cat.totalActiveEffortHours.toFixed(1)}
                          </span>
                          <span className="text-slate-500 text-xs ml-1">h</span>
                        </div>
                        <div className="text-right w-12">
                          <span className="font-semibold text-slate-700">
                            {cat.avgWallClockDays.toFixed(1)}
                          </span>
                          <span className="text-slate-500 text-xs ml-1">d</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                Click on a project ring in the chart to view its category breakdown.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
