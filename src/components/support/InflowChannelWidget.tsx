import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from 'recharts';
import { MessagesSquare } from 'lucide-react';
import EmptyState from '../EmptyState';
import { CHART_THEME } from '../../utils/chartUtils';

interface InflowChannelWidgetProps {
  chartData: {
    channelData: [string, number][];
  };
}

export function InflowChannelWidget({ chartData }: InflowChannelWidgetProps) {
  const data = chartData.channelData
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const colors = [
    CHART_THEME.blue,
    CHART_THEME.purple,
    CHART_THEME.orange,
    CHART_THEME.green,
    CHART_THEME.teal,
    CHART_THEME.grey,
  ];

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6 overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground">Inflow Channels</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Volume of tickets submitted by communication channel
        </p>
      </div>

      <div className="w-full h-[350px]">
        {data.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="No Channel Data Found"
            subtitle="There is no inflow channel data for the selected period."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                width={120}
              />
              <RechartsTooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 p-4 rounded-xl shadow-xl">
                        <div className="font-bold text-slate-800 text-sm mb-2">
                          {payload[0].payload.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: payload[0].payload.fill }}
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            {payload[0].value?.toLocaleString()} tickets
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
