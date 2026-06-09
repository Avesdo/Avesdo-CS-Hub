import React from 'react';
import { Activity, ChevronDown } from 'lucide-react';
import { calculateClientHealth } from '../../../utils/scoringUtils';
import { useAppState } from '../../../context/AppStateContext';

interface ClientHealthTabProps {
  client: any;
}

export default function ClientHealthTab({ client }: ClientHealthTabProps) {
  const { projects, settings } = useAppState();

  const healthResult = calculateClientHealth(client, projects, settings);

  if (client?.activeProjectCount === 0 || healthResult.totalScore === 'N/A') {
    return (
      <div className="bg-muted/50 text-muted-foreground border border-border rounded-xl px-6 py-4 text-sm font-semibold flex flex-col items-center gap-2 text-center mt-4 mx-4">
        <Activity className="w-6 h-6 shrink-0 text-muted-foreground mb-1" />
        <span>No active data to score.</span>
        <span className="font-normal text-xs max-w-xs">Metrics will automatically calculate once an onboarding project is released.</span>
      </div>
    );
  }

  const getScoreColor = (val: number | string) => {
    if (typeof val !== 'number') return 'text-slate-400';
    if (val >= 80) return 'text-lime-600';
    if (val >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBarColor = (val: number | string) => {
    if (typeof val !== 'number') return 'bg-slate-200';
    if (val >= 80) return 'bg-lime-500';
    if (val >= 50) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">Financial Standing (15%)</span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">Tracks recent invoice payments to indicate financial health.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div className={`h-full transition-all ${getBarColor(healthResult.financial)}`} style={{ width: `${healthResult.financial}%` }}></div>
            </div>
            <span className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(healthResult.financial)}`}>{healthResult.financial}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          {healthResult.hasSuspended && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-[13px] font-medium mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 shrink-0" />
              Account contains suspended projects due to outstanding invoices.
            </div>
          )}
          <div className="flex justify-between items-center">
            <span>Invoice Status</span>
            <span className={`font-semibold ${healthResult.details.invoiceStatus === 'Overdue 60+ Days' || healthResult.details.invoiceStatus === 'Suspended' ? 'text-destructive' : 'text-foreground'}`}>
              {healthResult.details.invoiceStatus || 'Current'}
            </span>
          </div>
        </div>
      </details>

      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">Platform Engagement (50%)</span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">Measures overall event activity and user logins.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div className={`h-full transition-all ${getBarColor(healthResult.engagement)}`} style={{ width: `${healthResult.engagement}%` }}></div>
            </div>
            <span className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(healthResult.engagement)}`}>{healthResult.engagement}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Operational Activity</span>
            <span className="font-semibold text-foreground">{healthResult.details.avgOpActivity}/100</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Active User Volume</span>
            <span className="font-semibold text-foreground">{healthResult.details.avgUserVol}/100</span>
          </div>
        </div>
      </details>

      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">Product Utilization (25%)</span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">Measures how many available features are added to projects.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div className={`h-full transition-all ${getBarColor(healthResult.utilization)}`} style={{ width: `${healthResult.utilization}%` }}></div>
            </div>
            <span className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(healthResult.utilization)}`}>{healthResult.utilization}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Feature Adoption Rate</span>
            <span className="font-semibold text-foreground">{healthResult.utilization}%</span>
          </div>
        </div>
      </details>

      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">Client Experience (10%)</span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">Average CSAT across onboarding and support.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div className={`h-full transition-all ${getBarColor(healthResult.experience)}`} style={{ width: `${healthResult.experience}%` }}></div>
            </div>
            <span className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(healthResult.experience)}`}>{healthResult.experience}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Onboarding CSAT</span>
            <span className="font-semibold text-foreground">{healthResult.details.avgProjectCsat === "N/A" ? "N/A" : `${Math.round(healthResult.details.avgProjectCsat as number)}/100`}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Support CSAT</span>
            <span className="font-semibold text-foreground">{healthResult.details.supportCsat === "N/A" ? "N/A" : `${healthResult.details.supportCsat}/100`}</span>
          </div>
        </div>
      </details>
    </div>
  );
}
