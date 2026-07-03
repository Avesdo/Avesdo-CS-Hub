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
import { Ticket, Clock } from 'lucide-react';

interface OperationsTrendWidgetProps {
  chartData: any;
}

export function OperationsTrendWidget({ chartData }: OperationsTrendWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Operations Trend</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ticket volume vs average resolution time
          </p>
        </div>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
          <ComposedChart
            data={chartData.trendData}
            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00bdd9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00bdd9" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorResolution" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1eaeb" />
            <XAxis
              dataKey="date"
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
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#74868a', fontSize: 12, fontWeight: 500 }}
              domain={[0, 'auto']}
            />
            <RechartsTooltip
              cursor={{ fill: '#f8fafa' }}
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                      <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
                        {label}
                      </p>
                      <div className="flex flex-col gap-3">
                        {payload.map((entry: any, index: number) => {
                          let formattedValue = entry.value;
                          if (entry.name === 'avgResolution') {
                            const hours = Math.floor(entry.value);
                            const mins = Math.round((entry.value - hours) * 60);
                            formattedValue = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                          }
                          return (
                            <div key={index} className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-2.5 h-2.5 rounded-[3px] shadow-sm"
                                  style={{
                                    backgroundColor:
                                      entry.name === 'tickets' ? '#00bdd9' : '#84cc16',
                                  }}
                                />
                                <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                  {entry.name === 'tickets' ? (
                                    <Ticket className="w-3.5 h-3.5" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5" />
                                  )}
                                  {entry.name === 'tickets' ? 'Ticket Volume' : 'Avg Resolution'}
                                </span>
                              </div>
                              <span className="text-[14px] font-bold text-foreground">
                                {formattedValue}
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
                paddingTop: '20px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#74868a',
              }}
              formatter={(value) => (value === 'tickets' ? 'Ticket Volume' : 'Avg Resolution Time')}
            />
            <Bar
              yAxisId="left"
              dataKey="tickets"
              name="tickets"
              fill="url(#colorTickets)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="avgResolution"
              name="avgResolution"
              stroke="#84cc16"
              strokeWidth={3}
              fill="url(#colorResolution)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#84cc16' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
