import React, { useEffect, useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Smile, AlertCircle, BarChart2, Eye, HelpCircle, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingCsatFormModal from '../OnboardingCsatFormModal';
import { calculateProjectHealth } from '../../../utils/scoringUtils';
import { useAppStore } from '../../../store/useAppStore';
import { PageTabs } from '../../ui/PageTabs';

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
  const [activeTab, setActiveTab] = useState('Support');
  const [viewingProject, setViewingProject] = useState<any>(null);
  const settings = useAppStore((state) => state.settings);

  const isChildOpenRef = useRef(false);

  useEffect(() => {
    if (viewingProject) {
      isChildOpenRef.current = true;
    } else {
      const timer = setTimeout(() => {
        isChildOpenRef.current = false;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [viewingProject]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isChildOpenRef.current) {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape, { capture: true });
    return () => window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [onClose]);

  const clientId = client.clientId || client.id;
  const clientName = client.companyName || client.name;

  const clientProjects = projects.filter((p) => {
    if (clientId && p.clientIds?.includes(clientId)) return true;
    if (clientName && p.clients?.includes(clientName)) return true;
    if (clientName && p.client === clientName) return true;
    return false;
  });

  const projectsWithCsat = clientProjects.filter(
    (p) => p.health?.onboardingCsat || p.onboardingCsat
  );

  const supportCsatData = client?.supportCsat;
  const clientNpsData = client?.clientNps;

  const getScoreColor = (val: any) => {
    if (val === undefined || val === null || val === 'N/A') return 'text-slate-400';
    if (val >= 80) return 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]';
    if (val >= 60) return 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]';
    return 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]';
  };

  const calculateBarWidths = () => {
    if (!supportCsatData || typeof supportCsatData !== 'object' || !supportCsatData.totalUsers) {
      return { promoters: 0, passives: 0, detractors: 0 };
    }
    const total = supportCsatData.totalUsers;
    return {
      promoters: (supportCsatData.promoters / total) * 100 || 0,
      passives: (supportCsatData.passives / total) * 100 || 0,
      detractors: (supportCsatData.detractors / total) * 100 || 0,
    };
  };

  const barWidths = calculateBarWidths();

  const calculateNpsBarWidths = () => {
    if (!clientNpsData || !clientNpsData.totalUsers) {
      return { promoters: 0, passives: 0, detractors: 0 };
    }
    const total = clientNpsData.totalUsers;
    return {
      promoters: (clientNpsData.promoters / total) * 100 || 0,
      passives: (clientNpsData.passives / total) * 100 || 0,
      detractors: (clientNpsData.detractors / total) * 100 || 0,
    };
  };
  const npsBarWidths = calculateNpsBarWidths();

  return (
    <>
      <Dialog.Root
        open={true}
        onOpenChange={(open) => {
          if (!open && !isChildOpenRef.current) onClose();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[var(--z-modal-overlay)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-3xl max-h-[85vh] bg-white flex flex-col rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-[var(--z-modal)] overflow-hidden outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300"
            onInteractOutside={(e) => {
              if (viewingProject) e.preventDefault();
            }}
            onEscapeKeyDown={(e) => {
              if (viewingProject) e.preventDefault();
            }}
          >
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 pt-5 pb-5 flex flex-col gap-4 sticky top-0 z-40">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Client Sentiment
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Detailed view of CSAT metrics for {client.companyName || client.name}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Standard Tab Switcher */}
              <PageTabs
                tabs={[
                  { label: 'Support', icon: BarChart2 },
                  { label: 'Onboarding', icon: Smile },
                  { label: 'Platform NPS', icon: ThumbsUp },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            <div className="p-8 overflow-y-auto custom-thin-scroll flex flex-col relative bg-white">
              <AnimatePresence mode="wait">
                {activeTab === 'Support' ? (
                  <motion.div
                    key="support"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {supportCsatData !== undefined && typeof supportCsatData === 'object' ? (
                      <>
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* Hero Scorecard */}
                          <div className="flex-shrink-0 w-full md:w-56 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                            <div
                              className={`absolute inset-0 bg-gradient-to-b opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${supportCsatData.score >= 80 ? 'from-emerald-500 to-transparent' : supportCsatData.score >= 60 ? 'from-amber-500 to-transparent' : 'from-rose-500 to-transparent'}`}
                            ></div>
                            <span className="text-xs font-bold text-slate-400 mb-3 relative z-10">
                              Total Score
                            </span>
                            <div
                              className={`text-7xl font-black tabular-nums tracking-tighter relative z-10 ${getScoreColor(supportCsatData.score)}`}
                            >
                              {supportCsatData.score}
                            </div>
                          </div>

                          {/* Right Side Stats */}
                          <div className="flex-grow flex flex-col justify-center space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                  Happyfox Ticket Feedback
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5">
                                  Aggregated satisfaction from support resolutions
                                </p>
                              </div>
                              <div className="text-sm font-bold text-slate-500 bg-white shadow-sm px-4 py-1.5 rounded-full border border-slate-200">
                                {supportCsatData.totalUsers} Total
                              </div>
                            </div>

                            {/* Thicker Distribution Bar */}
                            <div className="w-full h-4 bg-slate-200/50 rounded-full overflow-hidden flex shadow-inner">
                              {barWidths.promoters > 0 && (
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-1000"
                                  style={{ width: `${barWidths.promoters}%` }}
                                  title="Promoters"
                                />
                              )}
                              {barWidths.passives > 0 && (
                                <div
                                  className="h-full bg-amber-400 transition-all duration-1000"
                                  style={{ width: `${barWidths.passives}%` }}
                                  title="Passives"
                                />
                              )}
                              {barWidths.detractors > 0 && (
                                <div
                                  className="h-full bg-rose-500 transition-all duration-1000"
                                  style={{ width: `${barWidths.detractors}%` }}
                                  title="Detractors"
                                />
                              )}
                            </div>

                            {/* Distribution Legends */}
                            <div className="flex items-center gap-6 text-sm font-bold">
                              <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                {supportCsatData.promoters || 0} Happy
                              </div>
                              <div className="flex items-center gap-2.5 text-amber-700 bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-100/50">
                                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                                {supportCsatData.passives || 0} Neutral
                              </div>
                              <div className="flex items-center gap-2.5 text-rose-700 bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100/50">
                                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                                {supportCsatData.detractors || 0} Unhappy
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Breakdown List */}
                        {supportCsatData.users && supportCsatData.users.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-xs font-bold text-slate-400 mb-4 ml-1">
                              Feedback by User
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {supportCsatData.users.map((user: any, idx: number) => {
                                const totalInteractions =
                                  (user.happy || 0) + (user.neutral || 0) + (user.unhappy || 0);
                                let dominantColor = 'bg-slate-300';
                                if (user.happy > user.unhappy && user.happy >= user.neutral)
                                  dominantColor = 'bg-emerald-500';
                                else if (user.unhappy > user.happy && user.unhappy >= user.neutral)
                                  dominantColor = 'bg-rose-500';
                                else if (user.neutral > user.happy && user.neutral > user.unhappy)
                                  dominantColor = 'bg-amber-400';

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between bg-white border border-slate-200/60 shadow-sm rounded-2xl p-4 hover:-translate-y-1 hover:shadow-md hover:border-primary/40 transition-all duration-300 group cursor-default relative overflow-hidden"
                                  >
                                    {/* Dominant sentiment accent border */}
                                    <div
                                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${dominantColor}`}
                                    ></div>

                                    {/* Left Side: Name and Volume */}
                                    <div className="flex-1 min-w-0 pl-2">
                                      <div className="font-bold text-slate-800 text-sm truncate group-hover:text-primary transition-colors">
                                        {user.name}
                                      </div>
                                      <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                                        {totalInteractions} Total Interaction
                                        {totalInteractions !== 1 ? 's' : ''}
                                      </div>
                                    </div>

                                    {/* Right Side: Score Pills */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      {user.happy > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                          <Smile className="w-3.5 h-3.5" /> {user.happy}
                                        </span>
                                      )}
                                      {user.neutral > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                          <HelpCircle className="w-3.5 h-3.5" /> {user.neutral}
                                        </span>
                                      )}
                                      {user.unhappy > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                                          <AlertCircle className="w-3.5 h-3.5" /> {user.unhappy}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <BarChart2 className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">No Support Data</p>
                        <p className="text-sm font-medium text-slate-400 mt-1 max-w-sm text-center">
                          {supportCsatData !== undefined
                            ? `Legacy Score: ${supportCsatData}`
                            : 'This client has not logged any Happyfox support feedback yet.'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : activeTab === 'Onboarding' ? (
                  <motion.div
                    key="onboarding"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    {projectsWithCsat.length > 0 ? (
                      <>
                        {/* Calculate Aggregates */}
                        {(() => {
                          const validProjects = projectsWithCsat
                            .map((p) => ({
                              project: p,
                              score: calculateProjectHealth(p, settings).csat,
                            }))
                            .filter((p) => typeof p.score === 'number');

                          const totalScore =
                            validProjects.length > 0
                              ? Math.round(
                                  validProjects.reduce((sum, p) => sum + (p.score as number), 0) /
                                    validProjects.length
                                )
                              : 0;

                          const promoters = validProjects.filter(
                            (p) => (p.score as number) >= 80
                          ).length;
                          const passives = validProjects.filter(
                            (p) => (p.score as number) >= 60 && (p.score as number) < 80
                          ).length;
                          const detractors = validProjects.filter(
                            (p) => (p.score as number) < 60
                          ).length;
                          const total = validProjects.length;

                          const obBarWidths = {
                            promoters: total ? (promoters / total) * 100 : 0,
                            passives: total ? (passives / total) * 100 : 0,
                            detractors: total ? (detractors / total) * 100 : 0,
                          };

                          return (
                            <>
                              <div className="flex flex-col md:flex-row gap-8">
                                {/* Hero Scorecard */}
                                <div className="flex-shrink-0 w-full md:w-56 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                                  <div
                                    className={`absolute inset-0 bg-gradient-to-b opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${totalScore >= 80 ? 'from-emerald-500 to-transparent' : totalScore >= 60 ? 'from-amber-500 to-transparent' : 'from-rose-500 to-transparent'}`}
                                  ></div>
                                  <span className="text-xs font-bold text-slate-400 mb-3 relative z-10">
                                    Average Score
                                  </span>
                                  <div
                                    className={`text-7xl font-black tabular-nums tracking-tighter relative z-10 ${getScoreColor(totalScore)}`}
                                  >
                                    {totalScore}
                                  </div>
                                </div>

                                {/* Right Side Stats */}
                                <div className="flex-grow flex flex-col justify-center space-y-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                        Project Onboarding Surveys
                                      </h3>
                                      <p className="text-sm text-slate-500 mt-0.5">
                                        CSAT scores submitted during the launch phase
                                      </p>
                                    </div>
                                    <div className="text-sm font-bold text-slate-500 bg-white shadow-sm px-4 py-1.5 rounded-full border border-slate-200">
                                      {total} Projects
                                    </div>
                                  </div>

                                  {/* Thicker Distribution Bar */}
                                  <div className="w-full h-4 bg-slate-200/50 rounded-full overflow-hidden flex shadow-inner">
                                    {obBarWidths.promoters > 0 && (
                                      <div
                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                        style={{ width: `${obBarWidths.promoters}%` }}
                                        title="Promoters"
                                      />
                                    )}
                                    {obBarWidths.passives > 0 && (
                                      <div
                                        className="h-full bg-amber-400 transition-all duration-1000"
                                        style={{ width: `${obBarWidths.passives}%` }}
                                        title="Passives"
                                      />
                                    )}
                                    {obBarWidths.detractors > 0 && (
                                      <div
                                        className="h-full bg-rose-500 transition-all duration-1000"
                                        style={{ width: `${obBarWidths.detractors}%` }}
                                        title="Detractors"
                                      />
                                    )}
                                  </div>

                                  {/* Distribution Legends */}
                                  <div className="flex items-center gap-6 text-sm font-bold">
                                    <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                      {promoters || 0} Happy
                                    </div>
                                    <div className="flex items-center gap-2.5 text-amber-700 bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-100/50">
                                      <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                                      {passives || 0} Neutral
                                    </div>
                                    <div className="flex items-center gap-2.5 text-rose-700 bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100/50">
                                      <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                                      {detractors || 0} Unhappy
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <h4 className="text-xs font-bold text-slate-400 mb-4 ml-1">
                                  Feedback by Project
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {projectsWithCsat.map((p) => {
                                    const pHealth = calculateProjectHealth(p, settings);
                                    const score = pHealth.csat;
                                    const numericScore = typeof score === 'number' ? score : 0;
                                    const isLegacy =
                                      !p.health?.onboardingCsat && !!p.onboardingCsat;

                                    let dominantColor = 'bg-slate-300';
                                    if (numericScore >= 80) dominantColor = 'bg-emerald-500';
                                    else if (numericScore >= 60) dominantColor = 'bg-amber-400';
                                    else dominantColor = 'bg-rose-500';

                                    return (
                                      <div
                                        key={p.id}
                                        className="flex items-center justify-between bg-white border border-slate-200/60 shadow-sm rounded-2xl p-4 hover:-translate-y-1 hover:shadow-md hover:border-primary/40 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                        onClick={() => setViewingProject(p)}
                                      >
                                        {/* Dominant sentiment accent border */}
                                        <div
                                          className={`absolute left-0 top-0 bottom-0 w-1.5 ${dominantColor}`}
                                        ></div>

                                        <div className="flex-1 min-w-0 pl-2 pr-4">
                                          <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                            {p.name}
                                          </p>
                                          <div className="mt-1 flex items-center h-4">
                                            {isLegacy && (
                                              <span className="text-[10px] font-medium text-slate-400 group-hover:hidden">
                                                Legacy Data
                                              </span>
                                            )}
                                            <span
                                              className={`text-[10px] font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${!isLegacy ? 'group-hover:translate-y-0 translate-y-1' : ''}`}
                                            >
                                              <Eye className="w-3 h-3" /> View Form
                                            </span>
                                          </div>
                                        </div>

                                        <div
                                          className={`shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-lg bg-white ${numericScore >= 80 ? 'text-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : numericScore >= 60 ? 'text-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : 'text-rose-500 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]'} ${numericScore >= 80 ? 'bg-emerald-50/50' : numericScore >= 60 ? 'bg-amber-50/50' : 'bg-rose-50/50'}`}
                                        >
                                          {score}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Smile className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">No Onboarding CSATs</p>
                        <p className="text-sm font-medium text-slate-400 mt-1 text-center max-w-sm">
                          This client's projects have no satisfaction surveys.
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : activeTab === 'Platform NPS' ? (
                  <motion.div
                    key="platform-nps"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {clientNpsData !== undefined && clientNpsData.totalUsers > 0 ? (
                      <>
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* Hero Scorecard */}
                          <div className="flex-shrink-0 w-full md:w-56 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                            <div
                              className={`absolute inset-0 bg-gradient-to-b opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${clientNpsData.score >= 80 ? 'from-emerald-500 to-transparent' : clientNpsData.score >= 60 ? 'from-amber-500 to-transparent' : 'from-rose-500 to-transparent'}`}
                            ></div>
                            <span className="text-xs font-bold text-slate-400 mb-3 relative z-10">
                              Total Score
                            </span>
                            <div
                              className={`text-7xl font-black tabular-nums tracking-tighter relative z-10 ${getScoreColor(clientNpsData.score)}`}
                            >
                              {clientNpsData.score}
                            </div>
                          </div>

                          {/* Right Side Stats */}
                          <div className="flex-grow flex flex-col justify-center space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                  Userpilot NPS
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5">
                                  Aggregated platform NPS score
                                </p>
                              </div>
                              <div className="text-sm font-bold text-slate-500 bg-white shadow-sm px-4 py-1.5 rounded-full border border-slate-200">
                                {clientNpsData.totalUsers} Total
                              </div>
                            </div>

                            {/* Thicker Distribution Bar */}
                            <div className="w-full h-4 bg-slate-200/50 rounded-full overflow-hidden flex shadow-inner">
                              {npsBarWidths.promoters > 0 && (
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-1000"
                                  style={{ width: `${npsBarWidths.promoters}%` }}
                                  title="Promoters"
                                />
                              )}
                              {npsBarWidths.passives > 0 && (
                                <div
                                  className="h-full bg-amber-400 transition-all duration-1000"
                                  style={{ width: `${npsBarWidths.passives}%` }}
                                  title="Passives"
                                />
                              )}
                              {npsBarWidths.detractors > 0 && (
                                <div
                                  className="h-full bg-rose-500 transition-all duration-1000"
                                  style={{ width: `${npsBarWidths.detractors}%` }}
                                  title="Detractors"
                                />
                              )}
                            </div>

                            {/* Distribution Legends */}
                            <div className="flex items-center gap-6 text-sm font-bold">
                              <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                {clientNpsData.promoters || 0} Promoters
                              </div>
                              <div className="flex items-center gap-2.5 text-amber-700 bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-100/50">
                                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                                {clientNpsData.passives || 0} Passives
                              </div>
                              <div className="flex items-center gap-2.5 text-rose-700 bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100/50">
                                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                                {clientNpsData.detractors || 0} Detractors
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Breakdown List */}
                        {clientNpsData.feedback && clientNpsData.feedback.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-xs font-bold text-slate-400 mb-4 ml-1">
                              Individual Feedback
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                              {clientNpsData.feedback.map((f: any, idx: number) => {
                                let dominantColor = 'bg-slate-300';
                                if (f.score >= 9) dominantColor = 'bg-emerald-500';
                                else if (f.score >= 7) dominantColor = 'bg-amber-400';
                                else dominantColor = 'bg-rose-500';

                                return (
                                  <div
                                    key={idx}
                                    className="flex flex-col bg-white border border-slate-200/60 shadow-sm rounded-2xl p-4 hover:shadow-md hover:border-primary/40 transition-all duration-300 relative overflow-hidden"
                                  >
                                    {/* Dominant sentiment accent border */}
                                    <div
                                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${dominantColor}`}
                                    ></div>

                                    <div className="flex items-center justify-between pl-2">
                                      <div className="font-bold text-slate-800 text-sm">
                                        {f.name}
                                      </div>
                                      <div
                                        className={`shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm bg-white ${f.score >= 9 ? 'text-emerald-500 border-emerald-500' : f.score >= 7 ? 'text-amber-500 border-amber-500' : 'text-rose-500 border-rose-500'} ${f.score >= 9 ? 'bg-emerald-50/50' : f.score >= 7 ? 'bg-amber-50/50' : 'bg-rose-50/50'}`}
                                      >
                                        {f.score}
                                      </div>
                                    </div>
                                    {f.feedback && (
                                      <div className="mt-3 pl-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        "{f.feedback}"
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <ThumbsUp className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">No NPS Data</p>
                        <p className="text-sm font-medium text-slate-400 mt-1 max-w-sm text-center">
                          This client has not recorded any NPS surveys in Userpilot.
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Render the Onboarding Csat Form modal nested or conditionally overlayed */}
      {viewingProject && (
        <div className="relative z-[var(--z-popover)]">
          <OnboardingCsatFormModal
            project={viewingProject}
            onClose={() => setViewingProject(null)}
          />
        </div>
      )}
    </>
  );
}
