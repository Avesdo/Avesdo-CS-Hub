import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DataItem[];
  total: number;
}

export function DonutChart({ data, total }: DonutChartProps) {
  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            animationDuration={600}
            animationBegin={0}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            formatter={(value: any) => [`${value}%`, 'Weight']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: 'white',
              fontSize: '14px',
              fontWeight: 500,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className={`text-3xl font-bold transition-colors duration-300 ${total === 100 ? 'text-lime-600' : 'text-red-500'}`}
        >
          {total}%
        </span>
        <span className="text-sm font-semibold text-slate-500 mt-1">Total</span>
      </div>
    </div>
  );
}
