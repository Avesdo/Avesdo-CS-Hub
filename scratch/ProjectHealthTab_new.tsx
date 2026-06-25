import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Activity, Settings, DollarSign, Users, Smile, AlertCircle, PlayCircle, XCircle, CheckCircle2 } from 'lucide-react';
import { updateProjectRecord, addProjectAutoLog, getHealthHistory } from '../../../api/dbService';
import { calculateProjectHealth } from '../../../utils/scoringUtils';
import { useAppStore } from '../../../store/useAppStore';
import OnboardingCsatModal from './OnboardingCsatModal';
import { HealthChart, HealthHistoryTable } from './ProjectTrendsTab';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectHealthTabProps {
  project: any;
}

const pt_features = [
  'Contracts',
  'Inventory',
  'Pricing',
  'Deposits',
  'Payments',
  'Allocations',
  'Workflows',
  'Reporting',
];

export default function ProjectHealthTab({ project }: ProjectHealthTabProps) {
  const [csatMenuOpen, setCsatMenuOpen] = useState(false);
  const [showCsatModal, setShowCsatModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filter, setFilter] = useState<'30' | '90' | '365' | 'all'>('30');
  
  const popRef = useRef<HTMLDivElement>(null);

  const settings = useAppStore(state => state.settings);
  const user = useAppStore(state => state.user);

  const fLen = Array.isArray(project?.features) ? project.features.length : 0;
  const fTotal =
    Array.isArray(settings?.features) && settings?.features.length > 0
      ? settings.features.length
      : pt_features.length;

  // Fetch History
  useEffect(() => {
    async function fetchH() {
      setLoadingHistory(true);
      try {
        if (project?.projectId || project?.id) {
          const h = await getHealthHistory(project.projectId || project.id);
          setHistory(Array.isArray(h) ? h : []);
        } else {
          setHistory([]);
        }
      } catch (e) {
        console.error(e);
      }
      setLoadingHistory(false);
    }
    fetchH();
  }, [project]);

  const optimizedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    const now = new Date().getTime();
    let cutoff = 0;
    if (filter !== 'all') {
      cutoff = now - parseInt(filter) * 24 * 60 * 60 * 1000;
    }
    const inWindow = history.filter((h) => h.timeVal >= cutoff);
    if (inWindow.length === 0) return [];
    const chronological = [...inWindow].sort((a, b) => a.timeVal - b.timeVal);
    const dailyMap = new Map<string, any>();
    chronological.forEach((h) => {
      const dateStr = new Date(h.timeVal).toDateString();
      dailyMap.set(dateStr, h);
    });
    const dailyArray = Array.from(dailyMap.values()).sort((a, b) => a.timeVal - b.timeVal);
    const finalArray: any[] = [];
    for (let i = 0; i < dailyArray.length; i++) {
      const current = dailyArray[i];
      if (i === 0 || i === dailyArray.length - 1) {
        finalArray.push(current);
      } else {
        const prev = finalArray[finalArray.length - 1];
        if (current.score !== prev.score) {
          finalArray.push(current);
        }
      }
    }
    return finalArray;
  }, [history, filter]);

  const healthResult = calculateProjectHealth(project, settings);
  const fPct = healthResult.featAdoption;
  const opVal = healthResult.opActivity;
  const usrVal = healthResult.userVol;
  const csatVal = healthResult.csat;
  const overallScore = healthResult.overall;

  const getScoreColor = (val: number | string) => {
    if (typeof val !== 'number') return 'text-slate-400';
    if (val >= 80) return 'text-lime-600';
    if (val >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getStrokeColor = (val: number | string) => {
    if (typeof val !== 'number') return '#cbd5e1';
    if (val >= 80) return '#84cc16';
    if (val >= 50) return '#f97316';
    return '#ef4444';
  };

  // Status Logic
  const isSuspended = project?.invoiceStatus === 'Suspended';
  const isOnboarding = project?.projectStatus === 'Onboarding' || project?.status === 'Onboarding';
  const isClosed = project?.projectStatus === 'Closed' || project?.projectStatus === 'Completed' || project?.projectStatus === 'Churned';
  const isCancelled = project?.projectStatus === 'Cancelled';
  const isActive = !isOnboarding && !isClosed && !isCancelled;

  // Gauge Rendering
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = typeof overallScore === 'number' ? circumference - (overallScore / 100) * circumference : circumference;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 1. HERO SECTION: Score & Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: GAUGE & STATUS */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden flex-1 min-h-[220px]">
            {/* Soft background aura */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            
            {(isOnboarding || isClosed || isCancelled) ? (
              <div className="flex flex-col items-center text-center z-10">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 shadow-inner">
                  {isOnboarding && <PlayCircle className="w-8 h-8 text-slate-400" />}
                  {isClosed && <CheckCircle2 className="w-8 h-8 text-slate-400" />}
                  {isCancelled && <XCircle className="w-8 h-8 text-slate-400" />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {isOnboarding && 'Not Yet Scoring'}
                  {isClosed && 'Tracking Stopped'}
                  {isCancelled && 'Cancelled'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  {isOnboarding && 'Metrics will automatically calculate once the project is released.'}
                  {(isClosed || isCancelled) && 'Historical data is preserved, but active tracking has concluded.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center z-10 relative">
                <div className="relative flex items-center justify-center w-32 h-32">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <circle
                      cx="64"
                      cy="64"
                      r="40"
                      stroke={getStrokeColor(overallScore)}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black tabular-nums tracking-tight ${getScoreColor(overallScore)}`}>
                      {typeof overallScore === 'number' ? overallScore : '-'}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-600 mt-2 tracking-tight uppercase">Health Score</h3>
              </div>
            )}
          </div>

          {/* STATUS BADGE */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 backdrop-blur-sm ${
            isSuspended ? 'bg-red-50/50 border-red-100' :
            isActive ? 'bg-emerald-50/50 border-emerald-100' :
            'bg-slate-50 border-slate-100'
          }`}>
            {isSuspended ? (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            ) : isActive ? (
              <Activity className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <Activity className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            )}
            <div>
              <h4 className={`text-sm font-bold ${
                isSuspended ? 'text-red-700' :
                isActive ? 'text-emerald-700' :
                'text-slate-600'
              }`}>
                {isSuspended ? 'Suspended due to Invoices' :
                 isActive ? 'Actively Tracking' :
                 project?.projectStatus || 'Status Unknown'}
              </h4>
              {isSuspended && (
                <p className="text-xs text-red-600/80 mt-1 font-medium leading-snug">
                  Financial Standing is locked at 0 until outstanding invoices are resolved.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHART */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[280px]">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Project Health Trajectory</h3>
          <div className="h-[220px]">
            <HealthChart history={optimizedHistory} filter={filter} setFilter={setFilter} loading={loadingHistory} />
          </div>
        </div>
      </div>

      {/* 2. KPI GRID (Replacing Accordions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
        
        {/* Engagement */}
        <motion.div whileHover={{ y: -4 }} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/10 transition-colors text-slate-500 group-hover:text-primary">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 tracking-tight">Engagement</span>
          </div>
          <div className="flex items-end justify-between">
            <span className={`text-2xl font-black tabular-nums ${getScoreColor(opVal)}`}>{opVal}</span>
            <span className="text-[11px] font-semibold text-slate-400 mb-1">Score</span>
          </div>
        </motion.div>

        {/* Feature Adoption */}
        <motion.div whileHover={{ y: -4 }} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/10 transition-colors text-slate-500 group-hover:text-primary">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 tracking-tight">Features</span>
          </div>
          <div className="flex items-end justify-between">
            <span className={`text-2xl font-black tabular-nums ${getScoreColor(fPct)}`}>{fPct}%</span>
            <span className="text-[11px] font-semibold text-slate-400 mb-1">{fLen} of {fTotal} Active</span>
          </div>
        </motion.div>

        {/* Financial */}
        <motion.div whileHover={{ y: -4 }} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/10 transition-colors text-slate-500 group-hover:text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 tracking-tight">Financial</span>
          </div>
          <div className="flex items-end justify-between">
            <span className={`text-2xl font-black tabular-nums ${getScoreColor(healthResult.financial)}`}>{healthResult.financial}</span>
            <span className={`text-[11px] font-semibold mb-1 truncate max-w-[80px] ${project?.invoiceStatus === 'Suspended' ? 'text-red-500' : 'text-slate-400'}`}>
              {project?.invoiceStatus || 'Current'}
            </span>
          </div>
        </motion.div>

        {/* Active Users */}
        <motion.div whileHover={{ y: -4 }} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/10 transition-colors text-slate-500 group-hover:text-primary">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 tracking-tight">Users</span>
          </div>
          <div className="flex items-end justify-between">
            <span className={`text-2xl font-black tabular-nums ${getScoreColor(usrVal)}`}>{usrVal}</span>
            <span className="text-[11px] font-semibold text-slate-400 mb-1">Score</span>
          </div>
        </motion.div>

        {/* CSAT */}
        <motion.div whileHover={{ y: -4 }} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-3 w-full">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/10 transition-colors text-slate-500 group-hover:text-primary">
                <Smile className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600 tracking-tight">CSAT</span>
            </div>
            <button
              onClick={() => setShowCsatModal(true)}
              className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded transition-colors"
            >
              {project?.onboardingCsat ? 'EDIT' : 'ADD'}
            </button>
          </div>
          <div className="flex items-end justify-between">
            <span className={`text-2xl font-black tabular-nums ${getScoreColor(csatVal)}`}>{csatVal}</span>
            <span className="text-[11px] font-semibold text-slate-400 mb-1">
              {project?.onboardingCsat ? `${project.onboardingCsat.score}/100` : 'No Rating'}
            </span>
          </div>
        </motion.div>

      </div>

      {/* 3. HISTORY TABLE */}
      <HealthHistoryTable history={optimizedHistory} loading={loadingHistory} />

      {showCsatModal && (
        <OnboardingCsatModal project={project} onClose={() => setShowCsatModal(false)} />
      )}
    </div>
  );
}