import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export interface ScoringWeights {
  opActivity: number;
  featAdoption: number;
  userVol: number;
  financial: number;
  csat: number;
}

export interface ScoringThresholds {
  healthy: number;
  warning: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  opActivity: 35,
  featAdoption: 25,
  userVol: 15,
  financial: 15,
  csat: 10,
};

export const DEFAULT_THRESHOLDS: ScoringThresholds = {
  healthy: 80,
  warning: 50,
};

export const PILLARS = [
  {
    key: 'opActivity' as const,
    label: 'Platform Engagement',
    color: '#0ea5e9',
    tooltip: 'Measures engagement based on the pages accessed and total page views.',
  },
  {
    key: 'featAdoption' as const,
    label: 'Feature Adoption',
    color: '#0284c7',
    tooltip:
      'Measures the breadth of platform utilization based on enabled features versus total available features.',
  },
  {
    key: 'financial' as const,
    label: 'Financial Standing',
    color: '#3b82f6',
    tooltip: 'Measures financial standing based on current invoice payment status.',
  },
  {
    key: 'userVol' as const,
    label: 'Active Users',
    color: '#6366f1',
    tooltip: 'Measures user activity based on active users and their average login frequency.',
  },
  {
    key: 'csat' as const,
    label: 'Client Sentiment',
    color: '#8b5cf6',
    tooltip:
      'Measures client sentiment based on onboarding satisfaction, support feedback, and NPS.',
  },
];

export const SLIDER_STYLES = `
  .premium-slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%;
    background: var(--slider-color); cursor: grab; transition: transform 0.15s; margin-top: -4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .premium-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
  .premium-slider::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(0.9); }
  .premium-slider::-moz-range-thumb {
    width: 16px; height: 16px; border-radius: 50%; background: var(--slider-color); cursor: grab;
    transition: transform 0.15s; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .premium-slider::-moz-range-thumb:hover { transform: scale(1.2); }
  .premium-slider::-moz-range-thumb:active { cursor: grabbing; transform: scale(0.9); }
  .premium-slider::-webkit-slider-runnable-track { border-radius: 8px; height: 8px; background: #f1f5f9; }
  .premium-slider::-moz-range-track { border-radius: 8px; height: 8px; background: #f1f5f9; }
`;

export function TotalAllocationBadge({ total }: { total: number }) {
  if (total === 100) {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        Total: 100% (Balanced)
      </span>
    );
  }
  if (total < 100) {
    return (
      <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        Total: {total}% ({100 - total}% remaining)
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
      <AlertCircle className="w-4 h-4 text-rose-600" />
      Total: {total}% ({total - 100}% over)
    </span>
  );
}

interface PillarRowProps {
  pillar: (typeof PILLARS)[number];
  value: number;
  canEdit: boolean;
  onChange: (val: number) => void;
}

export function PillarRow({ pillar, value, canEdit, onChange }: PillarRowProps) {
  return (
    <div className="flex items-center gap-4">
      <Tooltip content={pillar.tooltip} position="top">
        <label className="text-sm font-semibold text-slate-600 w-44 flex items-center justify-between gap-1.5 shrink-0 cursor-help pr-2 border-r border-slate-100">
          {pillar.label}
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
        </label>
      </Tooltip>
      <input
        type="range"
        min={0}
        max={100}
        disabled={!canEdit}
        className="flex-1 appearance-none bg-transparent cursor-pointer premium-slider disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ '--slider-color': pillar.color } as React.CSSProperties}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          min={0}
          max={100}
          step="1"
          disabled={!canEdit}
          value={value}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            onChange(isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed)));
          }}
          className="w-14 text-right font-bold text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
        />
        <span className="font-bold text-sm text-slate-700">%</span>
      </div>
    </div>
  );
}
