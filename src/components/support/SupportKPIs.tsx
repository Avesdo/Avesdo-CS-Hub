import React from 'react';
import { Clock, CheckCircle2, Zap, Inbox, AlertCircle, ArrowRight } from 'lucide-react';
import { Tooltip as UITooltip } from '../ui/Tooltip';
import { TrendIndicator } from '../TrendIndicator';

interface SupportKPIsProps {
  kpis: any;
}

export function SupportKPIs({ kpis }: SupportKPIsProps) {
  return (
    <div className="shrink-0 mb-4 px-4 md:px-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Volume */}
        <div
          className="cursor-default flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{ animationDelay: '50ms' }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-full blur-xl transition-colors duration-200"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                <Inbox className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                Ticket Volume
                <UITooltip content="Total number of tickets received in the current period">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                </UITooltip>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
          </div>
          <TrendIndicator
            current={kpis.totalVolume.value}
            previous={
              kpis.totalVolume.value - kpis.totalVolume.value * (kpis.totalVolume.trend / 100)
            }
            neutral={true}
          />
        </div>

        {/* 2. Avg First Response */}
        <div
          className="cursor-default flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-amber-500/40 transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{ animationDelay: '100ms' }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/5 group-hover:bg-amber-500/10 rounded-full blur-xl transition-colors duration-200"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                First Response Time
                <UITooltip content="Average time taken to send the first reply to a client">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                </UITooltip>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
          </div>
          <div className="flex items-end gap-2 mt-auto">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {Number(kpis.firstResponse.value) > 59
                ? (Number(kpis.firstResponse.value) / 60).toFixed(1)
                : kpis.firstResponse.value}{' '}
              <span className="text-xl font-normal text-muted-foreground">
                {Number(kpis.firstResponse.value) > 59 ? 'hrs' : 'min'}
              </span>
            </div>
            <TrendIndicator
              current={Number(kpis.firstResponse.value)}
              previous={Number(kpis.firstResponse.value) / (1 - kpis.firstResponse.trend / 100)}
              isPositiveBetter={false}
              showValue={false}
            />
          </div>
        </div>

        {/* 3. Avg Resolution */}
        <div
          className="cursor-default flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-lime-500/40 transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{ animationDelay: '150ms' }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-lime-500/5 group-hover:bg-lime-500/10 rounded-full blur-xl transition-colors duration-200"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-lime-500/10 text-lime-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                Avg Resolution Time
                <UITooltip content="Average time taken to completely resolve a ticket">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                </UITooltip>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
          </div>
          <div className="flex items-end gap-2 mt-auto">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {kpis.resolution.value}{' '}
              <span className="text-xl font-normal text-muted-foreground">hrs</span>
            </div>
            <TrendIndicator
              current={Number(kpis.resolution.value)}
              previous={Number(kpis.resolution.value) / (1 - kpis.resolution.trend / 100)}
              isPositiveBetter={false}
              showValue={false}
            />
          </div>
        </div>

        {/* 4. One-Touch */}
        <div
          className="cursor-default flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{ animationDelay: '200ms' }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 group-hover:bg-purple-500/10 rounded-full blur-xl transition-colors duration-200"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                One-Touch Resolutions
                <UITooltip content="Percentage of tickets resolved with a single reply">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                </UITooltip>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
          </div>
          <div className="flex items-end gap-2 mt-auto">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {kpis.oneTouch.value}%
            </div>
            <TrendIndicator
              current={Number(kpis.oneTouch.value)}
              previous={Number(kpis.oneTouch.value) - kpis.oneTouch.trend}
              showValue={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
