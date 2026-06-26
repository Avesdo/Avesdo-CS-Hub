import React, { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Smile, AlertCircle, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClientCsatBreakdownModalProps {
  client: any;
  healthResult: any;
  projects?: any[];
  onClose: () => void;
}

export default function ClientCsatBreakdownModal({
  client,
  healthResult,
  projects = [],
  onClose,
}: ClientCsatBreakdownModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape, { capture: true });
    return () => window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [onClose]);

  const clientProjects = projects.filter((p) => p.client === client.name);
  const projectsWithCsat = clientProjects.filter(
    (p) => p.health?.onboardingCsat || p.onboardingCsat
  );

  const supportCsatData = client?.supportCsat;

  const getScoreColor = (val: any) => {
    if (val === undefined || val === null || val === 'N/A') return 'text-slate-400';
    if (val >= 80) return 'text-emerald-500';
    if (val >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-3xl max-h-[85vh] bg-slate-50 flex flex-col rounded-2xl shadow-2xl z-[130] overflow-hidden outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Smile className="w-5 h-5 text-primary" />
                Client Sentiment Breakdown
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Detailed view of CSAT metrics for {client.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-thin-scroll flex flex-col gap-6">
            
            {/* Support CSAT Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-500">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 tracking-tight">
                  Support CSAT (NPS)
                </h3>
              </div>
              
              {supportCsatData && typeof supportCsatData === 'object' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">Score</p>
                    <p className={`text-2xl font-black ${getScoreColor(supportCsatData.score)}`}>
                      {supportCsatData.score}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">Promoters</p>
                    <p className="text-2xl font-black text-emerald-500">
                      {supportCsatData.promoters || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">Passives</p>
                    <p className="text-2xl font-black text-amber-500">
                      {supportCsatData.passives || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">Detractors</p>
                    <p className="text-2xl font-black text-red-500">
                      {supportCsatData.detractors || 0}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-4 text-xs text-slate-500 text-right mt-1">
                    Based on {supportCsatData.totalUsers || 0} total responses over the last 12 months.
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
                  {supportCsatData !== undefined ? `Legacy Score: ${supportCsatData}` : 'No Support CSAT data available.'}
                </div>
              )}
            </div>

            {/* Project CSATs Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-500">
                  <Smile className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 tracking-tight">
                  Project Onboarding CSATs
                </h3>
              </div>
              
              {projectsWithCsat.length > 0 ? (
                <div className="space-y-3">
                  {projectsWithCsat.map((p) => {
                    const score = p.health?.onboardingCsat?.score || p.onboardingCsat?.score || p.onboardingCsat || 'Logged';
                    const isLegacy = !p.health?.onboardingCsat && !!p.onboardingCsat;
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-500">
                            {isLegacy ? 'Source: Legacy Data' : 'Source: Dynamic Form'}
                          </p>
                        </div>
                        <div className={`text-lg font-black ${getScoreColor(score)}`}>
                          {score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                  No project onboarding CSATs recorded for this client.
                </div>
              )}
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
