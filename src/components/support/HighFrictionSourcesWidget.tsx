import React, { useState } from 'react';
import { SearchX } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import EmptyState from '../EmptyState';
import { TruncatedText } from '../ui/TruncatedText';

interface HighFrictionSourcesWidgetProps {
  chartData: any;
}

export function HighFrictionSourcesWidget({ chartData }: HighFrictionSourcesWidgetProps) {
  const [frictionSourceView, setFrictionSourceView] = useState<'project' | 'contact' | 'channel'>('project');

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      <div className="rounded-xl border border-border bg-white shadow-sm p-6 overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-foreground text-lg">High-Friction Sources</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Top 10 ticket sources broken down by category
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setFrictionSourceView('project')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                frictionSourceView === 'project'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setFrictionSourceView('contact')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                frictionSourceView === 'contact'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Contacts
            </button>
            <button
              onClick={() => setFrictionSourceView('channel')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                frictionSourceView === 'channel'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Channels
            </button>
          </div>
        </div>
        <div className="p-6 pt-0 h-[500px] w-full">
          {(frictionSourceView === 'project'
            ? chartData.projectData
            : frictionSourceView === 'contact'
            ? chartData.contactData
            : chartData.channelData
          ).length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No High-Friction Sources"
              subtitle="Great news! There are no high-friction tickets matching your criteria."
            />
          ) : (
            <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
              <BarChart
                layout="vertical"
                data={
                  frictionSourceView === 'project'
                    ? chartData.projectData
                    : frictionSourceView === 'contact'
                    ? chartData.contactData
                    : chartData.channelData
                }
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1eaeb" />
                <XAxis
                  type="number"
                  axisLine={{ stroke: '#e1eaeb' }}
                  tickLine={false}
                  tick={{ fill: '#74868a', fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={(props: any) => {
                    const { x, y, payload } = props;
                    const yAxisWidth = frictionSourceView === 'project' ? 185 : 120;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <foreignObject x={-yAxisWidth} y={-12} width={yAxisWidth - 10} height={24}>
                          <div className="w-full h-full flex items-center justify-end">
                            <TruncatedText
                              text={payload.value}
                              className="text-[#74868a] text-[12px] font-medium text-right"
                              containerClassName="w-full flex justify-end"
                            />
                          </div>
                        </foreignObject>
                      </g>
                    );
                  }}
                  width={frictionSourceView === 'project' ? 185 : 120}
                />
                <RechartsTooltip
                  cursor={{ fill: '#f8fafa' }}
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const total = payload.reduce(
                        (acc: number, entry: any) => acc + (entry.value || 0),
                        0
                      );
                      return (
                        <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                          <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm flex justify-between">
                            <span>{label}</span>
                            <span className="ml-4 font-bold text-primary">{total}</span>
                          </p>
                          <div className="flex flex-col gap-2">
                            {payload.map((entry: any, index: number) => {
                              if (!entry.value) return null;
                              return (
                                <div
                                  key={index}
                                  className="flex items-center justify-between gap-6"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2.5 h-2.5 rounded-[3px] shadow-sm"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <div className="max-w-[150px] min-w-0">
                                      <TruncatedText
                                        text={entry.name.replace('cat_', '')}
                                        className="text-[13px] font-medium text-muted-foreground"
                                      />
                                    </div>
                                  </div>
                                  <span className="text-[14px] font-bold text-foreground">
                                    {entry.value}
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
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#74868a',
                  }}
                  formatter={(value) => value.replace('cat_', '')}
                />
                {chartData.categoryKeys.map((catKey: string, index: number) => (
                  <Bar
                    key={catKey}
                    dataKey={catKey}
                    name={catKey}
                    stackId="a"
                    fill={chartData.CATEGORY_COLORS[index % chartData.CATEGORY_COLORS.length]}
                    radius={[3, 3, 3, 3]}
                    stroke="#ffffff"
                    strokeWidth={2}
                    maxBarSize={20}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
