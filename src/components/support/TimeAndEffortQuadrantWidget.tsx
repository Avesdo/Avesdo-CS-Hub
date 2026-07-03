import React, { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  Cell,
} from 'recharts';
import { Activity } from 'lucide-react';
import EmptyState from '../EmptyState';
import { getCurrentQuadrantData } from '../../utils/supportUtils';

const CHART_THEME = {
  blue: '#00bdd9',
  purple: '#8b5cf6',
  orange: '#f59e0b',
  green: '#10b981',
  grey: '#64748b',
  teal: '#14b8a6',
};

const formatTime = (hours: number) => {
  if (hours < 24) return `${Number(hours.toFixed(1))}h`;
  return `${Number((hours / 24).toFixed(1))}d`;
};

interface TimeAndEffortQuadrantWidgetProps {
  chartData: any;
}

export function TimeAndEffortQuadrantWidget({ chartData }: TimeAndEffortQuadrantWidgetProps) {
  const [timeAnalysisView, setTimeAnalysisView] = useState<
    'project' | 'category' | 'classification'
  >('project');
  const [timeAnalysisFilter, setTimeAnalysisFilter] = useState<'all' | 'significant'>('all');

  const currentQuadrantData = useMemo(() => {
    return getCurrentQuadrantData(chartData, timeAnalysisView, timeAnalysisFilter);
  }, [chartData, timeAnalysisView, timeAnalysisFilter]);

  return (
    <div className="grid grid-cols-1 gap-6 mt-6 mb-8">
      <div className="rounded-xl border border-border bg-white shadow-sm p-6 overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-bold text-foreground text-lg">Time & Effort Quadrant</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Correlation between Total Time Spent and Avg Resolution Time
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setTimeAnalysisView('project')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeAnalysisView === 'project'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setTimeAnalysisView('category')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeAnalysisView === 'category'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setTimeAnalysisView('classification')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeAnalysisView === 'classification'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Classifications
              </button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setTimeAnalysisFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeAnalysisFilter === 'all'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                All Data
              </button>
              <button
                onClick={() => setTimeAnalysisFilter('significant')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeAnalysisFilter === 'significant'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Significant Effort
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 w-full overflow-hidden">
          <div className="h-[500px] w-full">
            {currentQuadrantData.data.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No Data Available"
                subtitle={`There is no time or resolution data for ${timeAnalysisView}s in this period.`}
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1eaeb" />
                  <XAxis
                    type="number"
                    dataKey="displayX"
                    name="Avg Resolution Time"
                    domain={[currentQuadrantData.minX, currentQuadrantData.maxX]}
                    tickFormatter={formatTime}
                    tick={{ fill: '#74868a', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  >
                    <Label
                      value="Average Resolution Time (Hours)"
                      position="bottom"
                      offset={0}
                      fill="#74868a"
                      fontSize={12}
                    />
                  </XAxis>
                  <YAxis
                    type="number"
                    dataKey="displayY"
                    name="Total Time Spent"
                    domain={[currentQuadrantData.minY, currentQuadrantData.maxY]}
                    tickFormatter={formatTime}
                    tick={{ fill: '#74868a', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  >
                    <Label
                      value="Total Time Spent (Hours)"
                      angle={-90}
                      position="insideLeft"
                      offset={-5}
                      fill="#74868a"
                      fontSize={12}
                    />
                  </YAxis>
                  <ZAxis type="number" dataKey="volume" range={[60, 400]} name="Ticket Volume" />
                  <ReferenceLine
                    x={currentQuadrantData.avgX}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={{
                      value: 'Avg Resolution',
                      position: 'insideTopLeft',
                      fill: '#94a3b8',
                      fontSize: 11,
                    }}
                  />
                  <ReferenceLine
                    y={currentQuadrantData.avgY}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={{
                      value: 'Avg Time Spent',
                      position: 'insideBottomRight',
                      fill: '#94a3b8',
                      fontSize: 11,
                    }}
                  />
                  <RechartsTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px]">
                            <p className="font-bold text-foreground border-b border-border pb-2 mb-3 text-sm flex justify-between items-center">
                              {data.name}
                              {(data.isOutlierX || data.isOutlierY) && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded ml-2">
                                  Outlier
                                </span>
                              )}
                            </p>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-6">
                                <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-sm bg-[#00bdd9]"></div>
                                  Total Time Spent
                                </span>
                                <span className="text-[14px] font-bold text-foreground">
                                  {formatTime(data.timeSpentHours)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-6">
                                <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]"></div>
                                  Avg Resolution Time
                                </span>
                                <span className="text-[14px] font-bold text-foreground">
                                  {formatTime(data.avgResolutionHours)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-6 pt-1 mt-1 border-t border-slate-100">
                                <span className="text-[13px] font-medium text-muted-foreground">
                                  Ticket Volume
                                </span>
                                <span className="text-[13px] font-bold text-slate-500">
                                  {data.volume}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Data" data={currentQuadrantData.data} fillOpacity={0.7}>
                    {currentQuadrantData.data.map((entry: any, index: number) => {
                      const colors = Object.values(CHART_THEME);
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                          stroke={colors[index % colors.length]}
                          strokeWidth={1}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
