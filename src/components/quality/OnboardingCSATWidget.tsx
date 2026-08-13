import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  Legend,
} from 'recharts';
import { Rocket, Target, Star, ArrowRight } from 'lucide-react';
import { OnboardingCsatMetric } from '../../utils/qualityUtils';
import { useUIStore } from '../../store/useUIStore';

interface WidgetProps {
  data: {
    trend: OnboardingCsatMetric[];
    aggregate: {
      averageScore: number;
      csatReceived: number;
      projectsLaunched: number;
    };
    submissions: any[];
  };
}

export function OnboardingCSATWidget({ data }: WidgetProps) {
  const { trend, aggregate } = data;
  const completionRate =
    aggregate.projectsLaunched > 0
      ? Math.round((aggregate.csatReceived / aggregate.projectsLaunched) * 100)
      : 0;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col xl:flex-row">
      {/* Left Panel - KPIs */}
      <div className="w-full xl:w-[350px] border-b xl:border-b-0 xl:border-r border-border p-6 bg-slate-50/50 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Onboarding CSAT</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Satisfaction scores for new project launches
            </p>
          </div>
        </div>

        <div className="mt-8 mb-8">
          <div className="flex items-end gap-3">
            <span
              className={`text-5xl font-black tracking-tight ${
                aggregate.averageScore >= 80
                  ? 'text-[#10b981]'
                  : aggregate.averageScore >= 60
                    ? 'text-amber-500'
                    : 'text-rose-500'
              }`}
            >
              {aggregate.averageScore > 0 ? `${aggregate.averageScore.toFixed(0)}%` : '--'}
            </span>
            <span className="text-lg font-medium text-slate-500 mb-1">avg score</span>
          </div>
          {aggregate.averageScore > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round((aggregate.averageScore / 100) * 5)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-600">
                {((aggregate.averageScore / 100) * 5).toFixed(1)} / 5
              </span>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700">Volume & Response Rate</h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#00bdd9]/10">
                <Rocket className="w-4 h-4 text-[#00bdd9]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Projects Launched</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[#00bdd9]">{aggregate.projectsLaunched}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#4dd2e5]/15">
                <Target className="w-4 h-4 text-[#4dd2e5]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">CSAT Received</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[#4dd2e5]">{aggregate.csatReceived}</span>
          </div>

          <div className="pt-4 border-t border-border/50 mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Response Rate</span>
              <span className="text-sm font-bold text-slate-700">{completionRate}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  completionRate >= 80
                    ? 'bg-[#10b981]'
                    : completionRate >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                }`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() =>
              useUIStore
                .getState()
                .openDrawer('csatSubmissions', undefined, { submissions: data.submissions })
            }
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
          >
            View submissions
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Right Panel - Chart */}
      <div className="flex-1 p-6 flex flex-col min-h-[300px]">
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
            <ComposedChart
              data={trend}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <defs>
                <linearGradient id="colorLaunched" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00bdd9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00bdd9" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4dd2e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4dd2e5" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1eaeb" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#74868a',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#74868a',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                }}
                domain={[0, (dataMax: number) => Math.max(1, Math.ceil(dataMax * 1.25))]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#74868a',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                }}
                domain={[
                  (dataMin: number) => Math.max(0, Math.floor(dataMin - 10)),
                  (dataMax: number) => Math.min(100, Math.ceil(dataMax + 10)),
                ]}
              />
              <RechartsTooltip
                cursor={{ fill: '#f8fafa' }}
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px]">
                        <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
                          {label}
                        </p>
                        <div className="flex flex-col gap-3">
                          {[...payload]
                            .sort((a, b) => {
                              const order = ['averageScore', 'projectsLaunched', 'csatReceived'];
                              return order.indexOf(a.dataKey) - order.indexOf(b.dataKey);
                            })
                            .map((entry: any, index: number) => {
                              let displayName = entry.name;
                              let displayValue = entry.value;

                              if (
                                entry.name === 'Projects Launched' ||
                                entry.dataKey === 'projectsLaunched'
                              ) {
                                displayName = 'Projects Released';
                              } else if (
                                entry.name === 'CSAT Received' ||
                                entry.dataKey === 'csatReceived'
                              ) {
                                displayName = 'CSATs Received';
                              } else if (
                                entry.name === 'Average Score' ||
                                entry.dataKey === 'averageScore'
                              ) {
                                displayName = 'CSAT Score';
                                const rawPercent = Number(entry.value);
                                const outOf5 = (rawPercent / 100) * 5;
                                displayValue = `${outOf5.toFixed(2)} (${rawPercent.toFixed(1)}%)`;
                              }

                              let dotColor = entry.color;
                              if (entry.dataKey === 'projectsLaunched') dotColor = '#00bdd9';
                              if (entry.dataKey === 'csatReceived') dotColor = '#4dd2e5';
                              if (entry.dataKey === 'averageScore') dotColor = '#10b981';

                              return (
                                <div
                                  key={index}
                                  className="flex items-center justify-between gap-6"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className="w-2.5 h-2.5 rounded-[3px] shadow-sm"
                                      style={{ backgroundColor: dotColor }}
                                    />
                                    <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                      {displayName}
                                    </span>
                                  </div>
                                  <span className="text-[13px] font-bold text-slate-700">
                                    {displayValue}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingTop: '20px' }}
                formatter={(value) => <span className="text-slate-500">{value}</span>}
                // @ts-ignore - Recharts types strip payload, but it is supported at runtime
                payload={[
                  { value: 'Average Score', type: 'circle', color: '#10b981', id: 'averageScore' },
                  {
                    value: 'Projects Launched',
                    type: 'circle',
                    color: '#00bdd9',
                    id: 'projectsLaunched',
                  },
                  { value: 'CSATs Received', type: 'circle', color: '#4dd2e5', id: 'csatReceived' },
                ]}
              />
              <Bar
                yAxisId="left"
                dataKey="projectsLaunched"
                name="Projects Launched"
                fill="url(#colorLaunched)"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
              <Bar
                yAxisId="left"
                dataKey="csatReceived"
                name="CSAT Received"
                fill="url(#colorReceived)"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="averageScore"
                name="Average Score"
                stroke="#10b981" // emerald green
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorScore)"
                dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
