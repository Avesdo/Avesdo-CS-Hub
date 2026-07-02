import React from 'react';
import { AlertOctagon, PauseCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { TruncatedText } from '../ui/TruncatedText';
import EmptyState from '../EmptyState';
import { getHealthBadge } from '../../utils/uiUtils';

export interface ActionRequiredFeedProps {
  suspendedProjects: any[];
  atRiskClients: any[];
  openDrawer: (type: string, id: string, options?: any) => void;
  hasSus: boolean;
  hasRisk: boolean;
  settings: any;
}

export const ActionRequiredFeed: React.FC<ActionRequiredFeedProps> = ({
  suspendedProjects,
  atRiskClients,
  openDrawer,
  hasSus,
  hasRisk,
  settings,
}) => {
  return (
    <div className="p-4 flex flex-col gap-3 bg-white">
      <div className="text-sm font-bold text-foreground flex items-center gap-2">
        <AlertOctagon className="w-4 h-4 text-red-500" /> Action Required
      </div>
      <div className="flex flex-col gap-2.5 h-[280px] overflow-y-auto custom-thin-scroll pr-2 content-start">
        {!hasSus && !hasRisk ? (
          <EmptyState
            icon={ShieldCheck}
            title="Inbox Zero"
            subtitle="No clients currently suspended or at risk."
            className="h-full"
          />
        ) : (
          <>
            {/* Suspended First */}
            {suspendedProjects.map((p) => {
              const clientDisplay = (p.clients || []).join(', ');
              return (
                <div
                  key={p.id}
                  onClick={() => openDrawer('project', p.id)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-white shadow-sm cursor-pointer hover:border-amber-400/50 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <PauseCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <TruncatedText
                        text={p.name}
                        className="text-[13px] font-bold text-foreground group-hover:text-amber-600 transition-colors"
                      />
                      <TruncatedText
                        text={clientDisplay || 'Unknown Client'}
                        className="text-[11px] font-semibold text-muted-foreground"
                      />
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground shrink-0 ml-2" />
                </div>
              );
            })}
            {/* At Risk Second */}
            {atRiskClients.map((c) => (
              <div
                key={c.clientId || c.id}
                onClick={() => openDrawer('client', c.clientId, { targetTab: 'health' })}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-white shadow-sm cursor-pointer hover:border-red-400/50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <TruncatedText
                      text={c.companyName}
                      className="text-[13px] font-bold text-foreground group-hover:text-red-600 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center shrink-0 ml-2">
                  {getHealthBadge(c.healthScore, settings)}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground ml-2" />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
