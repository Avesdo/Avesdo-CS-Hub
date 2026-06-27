import React, { ReactNode } from 'react';

export interface HealthTooltipCardProps {
  title: string;
  icon: ReactNode;
  description: string;
  children?: ReactNode; // Data grid or inline text
  status?: 'healthy' | 'warning' | 'critical' | 'neutral';
  width?: string;
}

export default function HealthTooltipCard({
  title,
  icon,
  description,
  children,
  status = 'neutral',
  width = 'w-[260px]',
}: HealthTooltipCardProps) {
  // Map status to badge colors
  const statusConfig = {
    healthy: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    neutral: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  };

  const badge = statusConfig[status];

  return (
    <div className={`flex flex-col ${width}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100/60">
        <div className="flex items-center gap-2">
          <div className="text-slate-400">{icon}</div>
          <span className="text-xs font-bold text-slate-800">{title}</span>
        </div>
        {status !== 'neutral' && (
          <span
            className={`px-1.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>

      {/* Hero Content (Data Grid, Inline Values, etc.) */}
      {children && <div className="mb-3">{children}</div>}

      {/* Footer Description */}
      <div className="pt-2.5 border-t border-slate-100/60 bg-slate-50/50 -mx-3 -mb-2 px-3 pb-2.5 rounded-b-xl mt-auto">
        <p className="text-[10.5px] text-slate-500 leading-relaxed whitespace-normal break-words">
          {description}
        </p>
      </div>
    </div>
  );
}
