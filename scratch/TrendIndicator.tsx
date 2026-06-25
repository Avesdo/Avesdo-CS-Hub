import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const TrendIndicator = ({
  current,
  previous,
  prefix = '',
  suffix = '',
  periodText = 'last 30 days',
  inverted = false,
  neutral = false,
  colorClass = 'text-foreground',
}: any) => {
  if (previous === undefined || previous === null)
    return (
      <div className="text-3xl font-bold tracking-tight text-foreground relative z-10 mt-auto pt-0">
        {prefix}
        {current}
        {suffix}
      </div>
    );

  const diff = current - previous;
  const pct =
    previous === 0 ? (current > 0 ? 100 : 0) : Math.abs(Math.round((diff / previous) * 100));
  const isZero = diff === 0 || pct === 0;
  const isUp = diff >= 0 && !isZero;

  const tColor = isZero
    ? 'text-slate-600 bg-slate-100 border-slate-200/60'
    : neutral
      ? 'text-primary bg-primary/10 border-primary/20'
      : isUp
        ? inverted
          ? 'text-red-600 bg-red-50 border-red-200'
          : 'text-emerald-600 bg-emerald-50 border-emerald-200'
        : inverted
          ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
          : 'text-red-600 bg-red-50 border-red-200';
  const Icon = isZero ? Minus : isUp ? TrendingUp : TrendingDown;
  const displayVal =
    prefix +
    current.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) +
    suffix;

  return (
    <div className="flex flex-col relative z-10 mt-auto pt-3">
      <div className="flex items-center gap-3">
        <p className={`text-3xl font-bold tracking-tight ${colorClass}`}>{displayVal}</p>
        <span
          className={`inline-flex w-fit shrink-0 items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${tColor} gap-1 shadow-sm`}
        >
          {Icon && <Icon className="w-3 h-3" strokeWidth={2.5} />}
          {isZero ? '0%' : (isUp ? '+' : '-') + pct + '%'}
        </span>
      </div>
    </div>
  );
};
