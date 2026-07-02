import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import EmptyState from '../EmptyState';
import { TruncatedText } from '../ui/TruncatedText';
import { ActionRequiredFeed } from './ActionRequiredFeed';

export interface ClientHealthWidgetProps {
  totalScored: number;
  activeClients: any[];
  healthyThresh: number;
  warningThresh: number;
  healthyCount: number;
  warningCount: number;
  riskCount: number;
  openDrawer: (type: any, id?: string, data?: any) => void;
  suspendedProjects: any[];
  atRiskClients: any[];
  hasSus: boolean;
  hasRisk: boolean;
  settings: any;
  movers: any;
  isFetchingHistory: boolean;
}

export function ClientHealthWidget({
  totalScored,
  activeClients,
  healthyThresh,
  warningThresh,
  healthyCount,
  warningCount,
  riskCount,
  openDrawer,
  suspendedProjects,
  atRiskClients,
  hasSus,
  hasRisk,
  settings,
  movers,
  isFetchingHistory,
}: ClientHealthWidgetProps) {
  const [hoveredHealth, setHoveredHealth] = useState<'healthy' | 'warning' | 'risk' | null>(null);

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden">
      {/* TOP: Segmented Distribution Bar */}
      <div className="p-4 pb-2 border-b border-border bg-white/95 backdrop-blur-md flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-semibold tracking-tight text-foreground">
              Client Health
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Real-time health segmentation and action feed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground leading-none">{totalScored}</div>
            <div className="text-[11px] text-muted-foreground font-semibold mt-1">
              Active Clients
            </div>
          </div>
        </div>

        {totalScored > 0 ? (
          <div className="flex flex-col gap-2">
            <div
              className="flex flex-col gap-2 w-full mt-1"
              onMouseLeave={() => setHoveredHealth(null)}
            >
              {/* The Bar */}
              <div className="w-full h-3 rounded-full flex bg-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden relative">
                {/* Healthy */}
                <div
                  onClick={() =>
                    openDrawer('dashDrilldown', undefined, {
                      title: 'Healthy',
                      subtitle: 'Active Clients',
                      viewAllPath: '/clients',
                      viewAllState: { kpiFilter: 'healthy' },
                      clients: activeClients.filter(
                        (c: any) =>
                          c.healthScore !== 'N/A' &&
                          typeof c.healthScore === 'number' &&
                          c.healthScore >= healthyThresh
                      ),
                    })
                  }
                  onMouseEnter={() => setHoveredHealth('healthy')}
                  style={{ width: `${(healthyCount / totalScored) * 100}%` }}
                  className={`bg-lime-500 h-full transition-all duration-300 cursor-pointer group ${hoveredHealth === 'healthy' ? 'brightness-110 shadow-md' : ''} ${hoveredHealth && hoveredHealth !== 'healthy' ? 'opacity-50' : ''}`}
                ></div>
                {/* Warning */}
                <div
                  onClick={() =>
                    openDrawer('dashDrilldown', undefined, {
                      title: 'Warning',
                      subtitle: 'Active Clients',
                      viewAllPath: '/clients',
                      viewAllState: { kpiFilter: 'warning' },
                      clients: activeClients.filter(
                        (c: any) =>
                          c.healthScore !== 'N/A' &&
                          typeof c.healthScore === 'number' &&
                          c.healthScore >= warningThresh &&
                          c.healthScore < healthyThresh
                      ),
                    })
                  }
                  onMouseEnter={() => setHoveredHealth('warning')}
                  style={{ width: `${(warningCount / totalScored) * 100}%` }}
                  className={`bg-orange-400 h-full transition-all duration-300 cursor-pointer group border-l border-white/20 ${hoveredHealth === 'warning' ? 'brightness-110 shadow-md' : ''} ${hoveredHealth && hoveredHealth !== 'warning' ? 'opacity-50' : ''}`}
                ></div>
                {/* Risk */}
                <div
                  onClick={() =>
                    openDrawer('dashDrilldown', undefined, {
                      title: 'At Risk',
                      subtitle: 'Active Clients',
                      viewAllPath: '/clients',
                      viewAllState: { kpiFilter: 'risk' },
                      clients: activeClients.filter(
                        (c: any) =>
                          c.healthScore !== 'N/A' &&
                          typeof c.healthScore === 'number' &&
                          c.healthScore < warningThresh
                      ),
                    })
                  }
                  onMouseEnter={() => setHoveredHealth('risk')}
                  style={{ width: `${(riskCount / totalScored) * 100}%` }}
                  className={`bg-red-500 h-full transition-all duration-300 cursor-pointer group border-l border-white/20 ${hoveredHealth === 'risk' ? 'brightness-110 shadow-md' : ''} ${hoveredHealth && hoveredHealth !== 'risk' ? 'opacity-50' : ''}`}
                ></div>
              </div>

              {/* The Badges */}
              <div className="flex items-center justify-between gap-2 mt-1">
                <button
                  onClick={() =>
                    openDrawer('dashDrilldown', undefined, {
                      title: 'Healthy',
                      subtitle: 'Active Clients',
                      viewAllPath: '/clients',
                      viewAllState: { kpiFilter: 'healthy' },
                      clients: activeClients.filter(
                        (c: any) =>
                          c.healthScore !== 'N/A' &&
                          typeof c.healthScore === 'number' &&
                          c.healthScore >= healthyThresh
                      ),
                    })
                  }
                  onMouseEnter={() => setHoveredHealth('healthy')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border shadow-sm transition-all cursor-pointer bg-lime-500/10 text-lime-700 border-lime-500/20 whitespace-nowrap active:scale-95 ${hoveredHealth === 'healthy' ? '-translate-y-0.5 shadow-md ring-2 ring-lime-500/30' : ''} ${hoveredHealth && hoveredHealth !== 'healthy' ? 'opacity-50' : ''}`}
                >
                  <span className="font-bold">{healthyCount}</span> Healthy
                </button>
                <button
                  onClick={() =>
                    openDrawer('dashDrilldown', undefined, {
                      title: 'Warning',
                      subtitle: 'Active Clients',
                      viewAllPath: '/clients',
                      viewAllState: { kpiFilter: 'warning' },
                      clients: activeClients.filter(
                        (c: any) =>
                          c.healthScore !== 'N/A' &&
                          typeof c.healthScore === 'number' &&
                          c.healthScore >= warningThresh &&
                          c.healthScore < healthyThresh
                      ),
                    })
                  }
                  onMouseEnter={() => setHoveredHealth('warning')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border shadow-sm transition-all cursor-pointer bg-orange-400/10 text-orange-700 border-orange-400/20 whitespace-nowrap active:scale-95 ${hoveredHealth === 'warning' ? '-translate-y-0.5 shadow-md ring-2 ring-orange-400/30' : ''} ${hoveredHealth && hoveredHealth !== 'warning' ? 'opacity-50' : ''}`}
                >
                  <span className="font-bold">{warningCount}</span> Warning
                </button>
                <button
                  onClick={() =>
                    openDrawer('dashDrilldown', undefined, {
                      title: 'At Risk',
                      subtitle: 'Active Clients',
                      viewAllPath: '/clients',
                      viewAllState: { kpiFilter: 'risk' },
                      clients: activeClients.filter(
                        (c: any) =>
                          c.healthScore !== 'N/A' &&
                          typeof c.healthScore === 'number' &&
                          c.healthScore < warningThresh
                      ),
                    })
                  }
                  onMouseEnter={() => setHoveredHealth('risk')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border shadow-sm transition-all cursor-pointer bg-red-500/10 text-red-700 border-red-500/20 whitespace-nowrap active:scale-95 ${hoveredHealth === 'risk' ? '-translate-y-0.5 shadow-md ring-2 ring-red-500/30' : ''} ${hoveredHealth && hoveredHealth !== 'risk' ? 'opacity-50' : ''}`}
                >
                  <span className="font-bold">{riskCount}</span> At Risk
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2 font-medium flex items-center justify-center bg-white rounded-md border border-dashed">
            No scored clients
          </div>
        )}
      </div>

      {/* BODY: Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* LEFT COL: Action Required Feed */}
        <ActionRequiredFeed
          suspendedProjects={suspendedProjects}
          atRiskClients={atRiskClients}
          openDrawer={openDrawer}
          hasSus={hasSus}
          hasRisk={hasRisk}
          settings={settings}
        />

        {/* MID COL: Top Improvers */}
        <div className="p-4 flex flex-col gap-3 bg-white">
          <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-lime-500" /> Top Improvers
          </div>
          <div className="flex flex-col gap-2.5 h-[280px] overflow-y-auto custom-thin-scroll pr-2 content-start">
            {isFetchingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : !movers || movers.improvers.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No Movement"
                subtitle="No upward shifts in the last 90 days."
                className="h-full"
              />
            ) : (
              <>
                {movers.improvers.map((m: any) => (
                  <div
                    key={m.id}
                    onClick={() => openDrawer('client', m.id, { targetTab: 'health' })}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-white shadow-sm cursor-pointer hover:border-lime-500/50 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-lime-100 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4 text-lime-600" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <TruncatedText
                          text={m.name}
                          className="text-[13px] font-bold text-foreground group-hover:text-lime-600 transition-colors"
                        />
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-lime-500/10 text-lime-600 shadow-sm shrink-0 ml-2">
                      +{m.diff}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COL: At Risk (Dropping) */}
        <div className="p-4 flex flex-col gap-3 bg-white">
          <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" /> At Risk (Dropping)
          </div>
          <div className="flex flex-col gap-2.5 h-[280px] overflow-y-auto custom-thin-scroll pr-2 content-start">
            {isFetchingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : !movers || movers.droppers.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No Movement"
                subtitle="No downward shifts in the last 90 days."
                className="h-full"
              />
            ) : (
              <>
                {movers.droppers.map((m: any) => (
                  <div
                    key={m.id}
                    onClick={() => openDrawer('client', m.id, { targetTab: 'health' })}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-white shadow-sm cursor-pointer hover:border-red-500/50 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <TruncatedText
                          text={m.name}
                          className="text-[13px] font-bold text-foreground group-hover:text-red-600 transition-colors"
                        />
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-500/10 text-red-600 shadow-sm shrink-0 ml-2">
                      {m.diff}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
