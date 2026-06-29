import React, { useMemo } from 'react';

export interface HeatmapData {
  day: number; // 0-6 (Sun-Sat)
  hour: number; // 0-23
  count: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12A';
  if (i === 12) return '12P';
  return i < 12 ? `${i}A` : `${i - 12}P`;
});

export function HeatmapChart({ data }: HeatmapChartProps) {
  const maxCount = useMemo(() => {
    let max = 0;
    data.forEach((d) => {
      if (d.count > max) max = d.count;
    });
    return max || 1; // Prevent division by zero
  }, [data]);

  // Create a 7x24 grid initialized with 0
  const grid = useMemo(() => {
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    data.forEach((d) => {
      if (d.day >= 0 && d.day <= 6 && d.hour >= 0 && d.hour <= 23) {
        g[d.day][d.hour] = d.count;
      }
    });
    return g;
  }, [data]);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px]">
        {/* Header row for hours */}
        <div className="flex ml-10 mb-2">
          {HOURS.map((hour, i) => (
            <div
              key={hour}
              className="flex-1 text-center text-[10px] font-semibold text-slate-400 select-none"
            >
              {i % 2 === 0 ? hour : ''}
            </div>
          ))}
        </div>

        {/* Rows for each day */}
        <div className="flex flex-col gap-1">
          {DAYS.map((day, dIdx) => (
            <div key={day} className="flex items-center gap-1">
              <div className="w-9 text-xs font-semibold text-slate-500 text-right pr-2 select-none">
                {day}
              </div>
              <div className="flex flex-1 gap-1">
                {grid[dIdx].map((count, hIdx) => {
                  const intensity = count / maxCount;
                  // Color gradient from bg-slate-100 to bg-primary
                  // For intensity = 0: slate-50
                  // For intensity > 0: opacity scales from 20% to 100% of primary

                  return (
                    <div
                      key={hIdx}
                      className="flex-1 aspect-square rounded-sm relative group cursor-pointer transition-colors"
                      style={{
                        backgroundColor:
                          count === 0
                            ? '#f8fafc'
                            : `rgba(37, 99, 235, ${Math.max(0.15, intensity)})`,
                      }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                        <div className="bg-slate-800 text-white text-[11px] font-medium py-1 px-2 rounded shadow-xl whitespace-nowrap">
                          {count} tickets at {day} {HOURS[hIdx]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
