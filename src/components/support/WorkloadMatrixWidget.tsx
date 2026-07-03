import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Tooltip as RechartsTooltip,
  Legend,
  Bar,
  Line,
} from 'recharts';
import EmptyState from '../EmptyState';

interface WorkloadMatrixWidgetProps {
  chartData: any;
  managerFilter: string;
}

export function WorkloadMatrixWidget({ chartData, managerFilter }: WorkloadMatrixWidgetProps) {
  const [workloadSortBy, setWorkloadSortBy] = useState<'volume' | 'time'>('volume');

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      <div className="rounded-xl border border-border bg-white shadow-sm p-6 overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-bold text-foreground text-lg">Dynamic Workload Matrix</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {managerFilter === 'All Agents'
                ? 'Distribution by Agent: Ticket Volume vs Average Time Spent'
                : `Distribution by Project for ${managerFilter}: Ticket Volume vs Average Time Spent`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Sort by:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setWorkloadSortBy('volume')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  workloadSortBy === 'volume'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Volume
              </button>
              <button
                onClick={() => setWorkloadSortBy('time')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  workloadSortBy === 'time'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Time Drain
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0 w-full overflow-hidden">
          <div className="h-[450px] w-full overflow-x-auto overflow-y-hidden custom-thin-scroll pb-4">
            {chartData.workloadData.length === 0 ? (
              <EmptyState
                icon={LayoutGrid}
                title="No Workload Data"
                subtitle="There are no tickets to plot in the workload matrix."
              />
            ) : (
              <div
                style={{
                  minWidth:
                    chartData.workloadData.length > 15
                      ? `${chartData.workloadData.length * 60}px`
                      : '100%',
                  height: '100%',
                }}
              >
                <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                  <ComposedChart
                    data={[...chartData.workloadData].sort((a: any, b: any) => {
                      if (workloadSortBy === 'volume') {
                        return b.volume - a.volume;
                      } else {
                        return b.avgTime - a.avgTime;
                      }
                    })}
                    margin={{ top: 20, right: 10, bottom: 20, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1eaeb" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#74868a', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#74868a', fontSize: 12, fontWeight: 500 }}
                    >
                      <Label
                        value="Ticket Volume"
                        angle={-90}
                        position="insideLeft"
                        offset={-5}
                        style={{
                          textAnchor: 'middle',
                          fill: '#74868a',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      />
                    </YAxis>
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#84cc16', fontSize: 12, fontWeight: 500 }}
                    >
                      <Label
                        value="Avg Time (mins)"
                        angle={90}
                        position="insideRight"
                        offset={-5}
                        style={{
                          textAnchor: 'middle',
                          fill: '#84cc16',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      />
                    </YAxis>
                    <RechartsTooltip
                      cursor={{ fill: '#f1f5f9' }}
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                              <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
                                {data.name}
                              </p>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-sm bg-[#00bdd9]"></div>
                                    Ticket Volume
                                  </span>
                                  <span className="text-[14px] font-bold text-foreground">
                                    {data.volume}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16]"></div>
                                    Average Time
                                  </span>
                                  <span className="text-[14px] font-bold text-foreground">
                                    {data.avgTime} mins
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-6 pt-1 mt-1 border-t border-slate-100">
                                  <span className="text-[13px] font-medium text-muted-foreground">
                                    Total Time
                                  </span>
                                  <span className="text-[13px] font-bold text-slate-500">
                                    {data.totalTime.toFixed(0)} mins
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="volume"
                      name="Ticket Volume"
                      fill="#00bdd9"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgTime"
                      name="Average Time Spent"
                      stroke="#84cc16"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#84cc16' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
