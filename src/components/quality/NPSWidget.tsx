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
import { Heart, ThumbsDown, Minus, MessageSquare, ArrowRight } from 'lucide-react';
import { NpsMetric } from '../../utils/qualityUtils';
import { useUIStore } from '../../store/useUIStore';

interface WidgetProps {
  data: {
    trend: NpsMetric[];
    submissions: any[];
    aggregate: {
      npsScore: number;
      promoters: number;
      detractors: number;
      passives: number;
      totalFeedback: number;
    };
  };
}

export function NPSWidget({ data }: WidgetProps) {
  const { trend, aggregate } = data;
  const breakdownTotal = aggregate.promoters + aggregate.passives + aggregate.detractors;
  const total = breakdownTotal > 0 ? breakdownTotal : aggregate.totalFeedback;

  const promoterPct = total > 0 ? Math.round((aggregate.promoters / total) * 100) : 0;
  const detractorPct = total > 0 ? Math.round((aggregate.detractors / total) * 100) : 0;
  const passivePct = total > 0 ? Math.round((aggregate.passives / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col xl:flex-row">
      {/* Left Panel - KPIs */}
      <div className="w-full xl:w-[350px] border-b xl:border-b-0 xl:border-r border-border p-6 bg-slate-50/50 flex flex-col">
        <div>
          <h3 className="text-lg font-bold text-foreground">Net Promoter Score</h3>
          <p className="text-sm text-muted-foreground mt-1">Global NPS and feedback breakdown</p>
        </div>

        <div className="mt-8 mb-8">
          <div className="flex items-end gap-3">
            <span
              className={`text-5xl font-black tracking-tight ${
                aggregate.npsScore >= 50
                  ? 'text-[#10b981]'
                  : aggregate.npsScore >= 0
                    ? 'text-amber-500'
                    : 'text-rose-500'
              }`}
            >
              {aggregate.totalFeedback > 0 ? aggregate.npsScore : '--'}
            </span>
            <span className="text-lg font-medium text-slate-500 mb-1">NPS</span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            {aggregate.totalFeedback} total feedback received
          </p>
        </div>

        <div className="flex-1" />

        {/* Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Feedback Breakdown
          </h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Promoters</p>
                <p className="text-xs text-slate-500">{aggregate.promoters} received</p>
              </div>
            </div>
            <span className="text-sm font-bold text-emerald-600">{promoterPct}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Minus className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Passives</p>
                <p className="text-xs text-slate-500">{aggregate.passives} received</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-600">{passivePct}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <ThumbsDown className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Detractors</p>
                <p className="text-xs text-slate-500">{aggregate.detractors} received</p>
              </div>
            </div>
            <span className="text-sm font-bold text-rose-600">{detractorPct}%</span>
          </div>

          {/* Progress bar visual */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full mt-4 flex overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${promoterPct}%` }} />
            <div className="h-full bg-slate-400" style={{ width: `${passivePct}%` }} />
            <div className="h-full bg-rose-500" style={{ width: `${detractorPct}%` }} />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() =>
                useUIStore.getState().openDrawer('csatSubmissions', undefined, {
                  submissions: data.submissions,
                  type: 'nps',
                })
              }
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00bdd9] transition-colors group"
            >
              View submissions
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
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
                <linearGradient id="colorFeedbackNps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00bdd9" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#00bdd9" stopOpacity={0} />
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
                tick={{ fill: '#74868a', fontSize: 12, fontWeight: 500 }}
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
                  (dataMin: number) => Math.max(-100, Math.floor(dataMin - 10)),
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
                              const order = ['averageScore', 'promoters', 'passives', 'detractors'];
                              return order.indexOf(a.dataKey) - order.indexOf(b.dataKey);
                            })
                            .map((entry: any, index: number) => {
                              let dotColor = entry.color;
                              if (entry.dataKey === 'promoters') dotColor = '#34d399';
                              if (entry.dataKey === 'passives') dotColor = '#cbd5e1';
                              if (entry.dataKey === 'detractors') dotColor = '#fb7185';
                              if (entry.dataKey === 'averageScore') dotColor = '#00bdd9';

                              let labelText = '';
                              if (entry.dataKey === 'averageScore') labelText = 'NPS Score';
                              else if (entry.dataKey === 'promoters') labelText = 'Promoters';
                              else if (entry.dataKey === 'passives') labelText = 'Passives';
                              else if (entry.dataKey === 'detractors') labelText = 'Detractors';

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
                                      {labelText}
                                    </span>
                                  </div>
                                  <span className="text-[13px] font-bold text-slate-700">
                                    {entry.dataKey === 'averageScore'
                                      ? Number(entry.value).toFixed(0)
                                      : entry.value}
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
                content={() => (
                  <div className="flex justify-center items-center gap-4 pt-5 text-[13px] font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00bdd9]"></div>
                      <span>NPS Score</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]"></div>
                      <span>Promoters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]"></div>
                      <span>Passives</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#fb7185]"></div>
                      <span>Detractors</span>
                    </div>
                  </div>
                )}
              />
              <Bar
                yAxisId="left"
                dataKey="detractors"
                name="Detractors"
                stackId="a"
                fill="#fb7185"
                barSize={32}
                zIndex={1}
              />
              <Bar
                yAxisId="left"
                dataKey="passives"
                name="Passives"
                stackId="a"
                fill="#cbd5e1"
                barSize={32}
                zIndex={1}
              />
              <Bar
                yAxisId="left"
                dataKey="promoters"
                name="Promoters"
                stackId="a"
                fill="#34d399"
                radius={[6, 6, 0, 0]}
                barSize={32}
                zIndex={1}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="averageScore"
                name="NPS Score"
                stroke="#00bdd9"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorFeedbackNps)"
                dot={{ r: 5, fill: '#00bdd9', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#00bdd9', stroke: '#fff', strokeWidth: 3 }}
                zIndex={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
