import React from 'react';
import { Activity, ChevronDown } from 'lucide-react';
import { calculateClientHealth } from '../../../utils/scoringUtils';
import { useAppStore } from '../../../store/useAppStore';

interface ClientHealthTabProps {
  client: any;
}

export default React.memo(function ClientHealthTab({ client }: ClientHealthTabProps) {
  const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);

  const healthResult = calculateClientHealth(client, projects, settings);

  if (client?.activeProjectCount === 0 || healthResult.totalScore === 'N/A') {
    return (
      <div className="bg-muted/50 text-muted-foreground border border-border rounded-xl px-6 py-4 text-sm font-semibold flex flex-col items-center gap-2 text-center mt-4 mx-4">
        <Activity className="w-6 h-6 shrink-0 text-muted-foreground mb-1" />
        <span>No active data to score.</span>
        <span className="font-normal text-xs max-w-xs">
          Metrics will automatically calculate when the client has active projects.
        </span>
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

  const finVal = healthResult.financial;
  const opVal = healthResult.opActivity;
  const usrVal = healthResult.userVol;
  const fPct = healthResult.featAdoption;
  const csatVal = healthResult.csat;

  return (
    <div className="space-y-4">
      {/* 1. Expandable: Platform Engagement */}
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Platform Engagement
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              The aggregated volume of core platform events and workflows executed across all of the
              client's active projects.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(opVal)}`}
                style={{ width: typeof opVal === 'number' ? `${Math.min(opVal, 100)}%` : '0%' }}
              ></div>
            </div>
            <span
              className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(opVal)}`}
            >
              {opVal}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Average Logged Events Score</span>
            <span className="font-semibold text-foreground">
              {typeof opVal === 'number' ? opVal : 0}
            </span>
          </div>
        </div>
      </details>

      {/* 2. Expandable: Feature Adoption */}
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Feature Adoption
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              The average breadth of platform features and modules toggled on across all active
              projects.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(fPct)}`}
                style={{ width: typeof fPct === 'number' ? `${fPct}%` : '0%' }}
              ></div>
            </div>
            <span
              className={`w-10 text-right font-bold text-xl tabular-nums ${getScoreColor(fPct)}`}
            >
              {fPct}%
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 border-t border-border pt-4 text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Average Adoption Score</span>
            <span className="font-bold text-foreground">{fPct}%</span>
          </div>
        </div>
      </details>

      {/* 3. Expandable: Financial Standing */}
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Financial Standing
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              Average financial health based on outstanding invoices across active projects.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(finVal)}`}
                style={{ width: typeof finVal === 'number' ? `${Math.min(finVal, 100)}%` : '0%' }}
              ></div>
            </div>
            <span
              className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(finVal)}`}
            >
              {finVal}
            </span>
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
            <span>Aggregated Invoice Status</span>
            <span
              className={`font-semibold ${healthResult.details.invoiceStatus === 'Overdue 60+ Days' || healthResult.details.invoiceStatus === 'Suspended' ? 'text-destructive' : 'text-foreground'}`}
            >
              {healthResult.details.invoiceStatus || 'Current'}
            </span>
          </div>
        </div>
      </details>

      {/* 4. Expandable: Active Users */}
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Active Users
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              The average volume of unique users successfully logging in across the client's project
              portfolio.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(usrVal)}`}
                style={{ width: typeof usrVal === 'number' ? `${Math.min(usrVal, 100)}%` : '0%' }}
              ></div>
            </div>
            <span
              className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(usrVal)}`}
            >
              {usrVal}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Average Active Users Score</span>
            <span className="font-semibold text-foreground">
              {typeof usrVal === 'number' ? usrVal : 0}
            </span>
          </div>
        </div>
      </details>

      {/* 5. Expandable: Client Sentiment */}
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Client Sentiment
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              The overall satisfaction and sentiment of the client, combining implementation
              feedback and ongoing support.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(csatVal)}`}
                style={{ width: typeof csatVal === 'number' ? `${csatVal}%` : '0%' }}
              ></div>
            </div>
            <span
              className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(csatVal)}`}
            >
              {csatVal}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Onboarding Sentiment</span>
            <span className="font-semibold text-foreground">
              {healthResult.details.avgProjectCsat === 'N/A'
                ? 'N/A'
                : `${Math.round(healthResult.details.avgProjectCsat as number)}/100`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Support Sentiment</span>
            <span className="font-semibold text-foreground">
              {healthResult.details.supportCsat === 'N/A'
                ? 'N/A'
                : `${healthResult.details.supportCsat}/100`}
            </span>
          </div>
        </div>
      </details>
    </div>
  );
});
