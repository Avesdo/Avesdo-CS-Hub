import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Settings, DollarSign, Users, Smile, AlertCircle, PlayCircle, XCircle, CheckCircle2, Wrench, Archive, Zap, Blocks, Edit2, Plus, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getHealthHistory } from '../../../api/dbService';
import { calculateProjectHealth } from '../../../utils/scoringUtils';
import { useAppStore } from '../../../store/useAppStore';
import OnboardingCsatFormModal from '../OnboardingCsatFormModal';
import { motion } from 'framer-motion';
import { Tooltip as UITooltip } from '../../ui/Tooltip';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface ProjectHealthTabProps {
  project: any;
}

const pt_features = [
  'Contracts', 'Inventory', 'Pricing', 'Deposits',
  'Payments', 'Allocations', 'Workflows', 'Reporting',
];

export default function ProjectHealthTab({ project }: ProjectHealthTabProps) {
  const [showCsatModal, setShowCsatModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filter, setFilter] = useState<'30' | '90' | '365' | 'all'>('30');

  const settings = useAppStore(state => state.settings);

  const fLen = Array.isArray(project?.features) ? project.features.length : 0;
  const fTotal = Array.isArray(settings?.features) && settings?.features.length > 0
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
  const overallScore = healthResult.totalScore;

  const getScoreColor = (val: number | string) => {
    if (typeof val !== 'number') return 'text-slate-400';
    if (val >= 80) return 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    if (val >= 50) return 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]';
    return 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]';
  };

  const getStrokeColor = (val: number | string) => {
    if (typeof val !== 'number') return '#cbd5e1';
    if (val >= 80) return '#10b981'; // emerald-500
    if (val >= 50) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  const getProgressColor = (val: number | string) => {
    if (typeof val !== 'number') return 'bg-slate-200';
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAuraColor = (val: number | string) => {
    if (typeof val !== 'number') return 'bg-slate-400';
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Status Logic
  const isSuspended = project?.projectStatus === 'Suspended' || project?.invoiceStatus === 'Suspended';
  const isOnboarding = project?.projectStatus === 'Onboarding' || project?.status === 'Onboarding';
  const isClosed = project?.projectStatus === 'Closed' || project?.projectStatus === 'Completed' || project?.projectStatus === 'Churned';
  const isCancelled = project?.projectStatus === 'Cancelled';
  const isActive = !isOnboarding && !isClosed && !isCancelled;

  // Chart Data
  const chartData = {
    labels: optimizedHistory.map((h) =>
      new Date(h.timeVal).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        data: optimizedHistory.map((h) => h.score),
        borderColor: '#00bdd9', // brand primary
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(0, 189, 217, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 189, 217, 0)');
          return gradient;
        },
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#00bdd9',
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#0f172a',
        bodyColor: '#334155',
        borderColor: 'transparent',
        borderWidth: 0,
        padding: 12,
        displayColors: false,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            return `Health Score: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: { 
        min: 0, 
        max: 100, 
        grid: { color: '#f1f5f9', drawBorder: false }, 
        border: { display: false, dash: [4, 4] } 
      },
      x: { 
        grid: { display: false, drawBorder: false },
        border: { display: false }
      },
    },
  };

  const normalizedScore = typeof overallScore === 'number' ? Math.max(0, Math.min(100, overallScore)) : 0;
  const arcLength = Math.PI * 80;
  const gap = 3.5;
  const redLength = arcLength * 0.5 - gap;
  const orangeLength = arcLength * 0.3 - gap;
  const greenLength = arcLength * 0.2;
  
  const getScoreLabel = (val: number | string) => {
    if (typeof val !== 'number') return { text: 'Unknown', color: 'bg-slate-100 text-slate-500' };
    if (val >= 80) return { text: 'Healthy', color: 'bg-emerald-100 text-emerald-700' };
    if (val >= 50) return { text: 'Warning', color: 'bg-orange-100 text-orange-700' };
    return { text: 'At Risk', color: 'bg-red-100 text-red-700' };
  };
  const scoreLabel = getScoreLabel(overallScore);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 1. STATE BANNER (Top Layer) */}
      {(!isActive || isSuspended) && (
        <div className={`w-full rounded-2xl border p-4 flex items-center justify-between shadow-sm overflow-hidden relative backdrop-blur-md ${
          isSuspended ? 'bg-red-500/5 border-red-500/20' :
          isOnboarding ? 'bg-primary/5 border-primary/20' :
          'bg-slate-500/5 border-slate-500/20'
        }`}>
          <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-50 pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/2 ${
            isSuspended ? 'bg-red-500/20 animate-pulse' :
            isOnboarding ? 'bg-primary/20' :
            'bg-slate-500/20'
          }`}></div>
          
          <div className="flex items-center gap-3 relative z-10">
            {isSuspended ? (
              <div className="p-2 bg-red-100 rounded-xl"><AlertCircle className="w-5 h-5 text-red-600" /></div>
            ) : isOnboarding ? (
              <div className="p-2 bg-primary/10 rounded-xl"><Wrench className="w-5 h-5 text-primary" /></div>
            ) : isCancelled ? (
              <div className="p-2 bg-slate-200 rounded-xl"><XCircle className="w-5 h-5 text-slate-600" /></div>
            ) : (
              <div className="p-2 bg-slate-200 rounded-xl"><Archive className="w-5 h-5 text-slate-600" /></div>
            )}
            
            <div>
              <h3 className={`text-base font-bold ${
                isSuspended ? 'text-red-700' :
                isOnboarding ? 'text-primary' :
                'text-slate-700'
              }`}>
                {isSuspended ? 'Project Suspended' :
                 isOnboarding ? 'Onboarding Phase' :
                 isCancelled ? 'Project Cancelled' :
                 project?.projectStatus || 'Status Unknown'}
              </h3>
              <p className={`text-xs font-medium mt-0.5 ${
                isSuspended ? 'text-red-600/80' :
                isOnboarding ? 'text-primary/80' :
                'text-slate-500'
              }`}>
                {isSuspended ? 'This project is suspended due to outstanding invoices.' :
                 isOnboarding ? 'Metrics will begin calculating upon project release.' :
                 isCancelled ? 'Project was cancelled. No health tracking or historical data was recorded.' :
                 'Historical data is preserved, but active tracking has concluded.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. HERO DASHBOARD (Merged Gauge + Chart) */}
      {(isOnboarding || isClosed || isCancelled) ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[280px] flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-slate-50/50 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-md">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${
              isOnboarding ? 'bg-primary/5 border border-primary/10 text-primary' :
              isClosed ? 'bg-slate-100 border border-slate-200 text-slate-500' :
              'bg-slate-100 border border-slate-200 text-slate-500'
            }`}>
              {isOnboarding ? <Wrench className="w-8 h-8" /> :
               isClosed ? <Archive className="w-8 h-8" /> :
               <XCircle className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
              {isOnboarding ? 'Health Tracking Pending' :
               isClosed ? 'Project Closed' :
               'Project Cancelled'}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {isOnboarding ? 'Health metrics, trajectories, and scores will begin calculating automatically once this project is officially released from onboarding.' :
               isClosed ? 'This project has been closed. Active health tracking and scoring have been disabled, but you can still view historical activity.' :
               'This project was cancelled before launch. No health metrics or trajectory data were generated.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col lg:flex-row min-h-[280px]">
          
          {/* LEFT PANE: GAUGE */}
          <div className="lg:w-1/3 p-6 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent pointer-events-none"></div>
            
            <div className="flex flex-col items-center z-10 relative w-full h-full justify-center">
              <div className="relative flex flex-col items-center justify-end w-64 h-40">
                <svg viewBox="0 0 200 120" className="absolute top-0 w-full h-full drop-shadow-sm overflow-visible">
                  {/* Background Track Groove */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="transparent"
                    stroke="#f8fafc"
                    strokeWidth="22"
                    strokeLinecap="butt"
                  />
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                    strokeLinecap="butt"
                  />
                  
                  {/* Background Track - Red Zone (0-50) */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="16"
                    strokeLinecap="butt"
                    strokeDasharray={`${redLength} ${arcLength}`}
                    className="opacity-90"
                  />
                  {/* Background Track - Orange Zone (50-80) */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="16"
                    strokeLinecap="butt"
                    strokeDasharray={`0 ${arcLength * 0.5} ${orangeLength} ${arcLength}`}
                    className="opacity-90"
                  />
                  {/* Background Track - Green Zone (80-100) */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="16"
                    strokeLinecap="butt"
                    strokeDasharray={`0 ${arcLength * 0.8} ${greenLength} ${arcLength}`}
                    className="opacity-90"
                  />
                  
                  {/* Indicator Dot */}
                  <g
                    className="transition-transform duration-1000 ease-out"
                    style={{ transform: `rotate(${180 * (normalizedScore / 100)}deg)`, transformOrigin: '100px 100px' }}
                  >
                    {/* Pulsing ring behind dot */}
                    <circle cx="20" cy="100" r="14" fill="#00bdd9" fillOpacity="0.1" />
                    {/* Main Dot Outer Shell */}
                    <circle cx="20" cy="100" r="10" fill="#ffffff" stroke="#00bdd9" strokeWidth="3" className="drop-shadow-md" />
                    {/* Main Dot Inner Core */}
                    <circle cx="20" cy="100" r="4" fill="#00bdd9" />
                  </g>
                </svg>
                
                <div className="relative z-10 flex flex-col items-center justify-center pb-2">
                  <span className="text-sm font-semibold text-slate-500 tracking-wide mb-1">Health Score</span>
                  <span className={`text-6xl font-black tabular-nums tracking-tight leading-none ${getScoreColor(overallScore)}`}>
                    {typeof overallScore === 'number' ? overallScore : '-'}
                  </span>
                </div>
              </div>
              <div className={`mt-4 px-5 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-sm ${scoreLabel.color}`}>
                {scoreLabel.text}
              </div>
            </div>
          </div>

          {/* RIGHT PANE: CHART */}
          <div className="lg:w-2/3 p-6 flex flex-col bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Trajectory</h3>
              <div className="inline-flex items-center rounded-lg p-[3px] bg-slate-100/50 w-max h-8 shrink-0 relative">
                {['30', '90', '365', 'all'].map((f) => {
                  const isActive = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={`relative inline-flex h-full items-center justify-center rounded-md px-3 py-0.5 text-[11px] font-bold tracking-wider transition-colors duration-200 z-10 ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <div 
                        className={`absolute inset-0 bg-white rounded-md shadow-sm border border-slate-200/60 transition-all duration-300 ease-out ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                        style={{ zIndex: -1 }}
                      />
                      {f === 'all' ? 'All' : f === '365' ? '1Y' : `${f}D`}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex-1 min-h-[180px] relative">
              {loadingHistory ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : optimizedHistory.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Activity className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-sm font-bold text-slate-400">No Data Points</p>
                  <p className="text-xs text-slate-400 mt-1">Not enough history to generate a trend.</p>
                </div>
              ) : (
                <Line data={chartData} options={chartOptions as any} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. KPI GRID (Modern Glassmorphic Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Engagement */}
        <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${getAuraColor(opVal)}`}></div>
          <div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/5 text-slate-500 group-hover:text-primary transition-colors">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight">Platform Engagement</span>
              <UITooltip content={<span className="text-xs">Measures frequency & volume of core workflows.</span>}>
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
              </UITooltip>
            </div>
            <div className="flex flex-col mb-1">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(opVal)}`}>{opVal}</span>
              <span className="text-[11px] font-medium text-slate-500 mt-1">{project?.eventCount ? `${project.eventCount.toLocaleString()} logged events` : 'Logged events unavailable'}</span>
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(opVal)}`} style={{ width: `${Math.min(typeof opVal === 'number' ? opVal : 0, 100)}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Active Users */}
        <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${getAuraColor(usrVal)}`}></div>
          <div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/5 text-slate-500 group-hover:text-primary transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight">Active Users</span>
              <UITooltip content={<span className="text-xs">Tracks volume of unique, authenticated active users.</span>}>
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
              </UITooltip>
            </div>
            <div className="flex flex-col mb-1">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(usrVal)}`}>{usrVal}</span>
              <span className="text-[11px] font-medium text-slate-500 mt-1">{project?.activeUserCount ? `${project.activeUserCount.toLocaleString()} active users` : 'Active users unavailable'}</span>
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(usrVal)}`} style={{ width: `${Math.min(typeof usrVal === 'number' ? usrVal : 0, 100)}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Feature Adoption */}
        <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${getAuraColor(fPct)}`}></div>
          <div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/5 text-slate-500 group-hover:text-primary transition-colors">
                <Blocks className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight">Feature Adoption</span>
              <UITooltip content={<span className="text-xs">Percentage of available features actively used.</span>}>
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
              </UITooltip>
            </div>
            <div className="flex flex-col mb-1">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(fPct)}`}>{fPct}%</span>
              <span className="text-[11px] font-medium text-slate-500 mt-1">{fLen} of {fTotal} active features</span>
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(fPct)}`} style={{ width: `${Math.min(typeof fPct === 'number' ? fPct : 0, 100)}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Financial */}
        <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${getAuraColor(healthResult.financial)}`}></div>
          <div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/5 text-slate-500 group-hover:text-primary transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight">Financial Standing</span>
              <UITooltip content={<span className="text-xs">Evaluates payment consistency and invoice status.</span>}>
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
              </UITooltip>
            </div>
            <div className="flex flex-col mb-1">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(healthResult.financial)}`}>{healthResult.financial}</span>
              <span className={`text-[11px] font-medium mt-1 truncate max-w-[150px] ${project?.invoiceStatus === 'Suspended' ? 'text-red-500' : 'text-slate-500'}`}>
                Invoice status: {project?.invoiceStatus || 'Current'}
              </span>
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(healthResult.financial)}`} style={{ width: `${Math.min(typeof healthResult.financial === 'number' ? healthResult.financial : 0, 100)}%` }} />
            </div>
          </div>
        </motion.div>

        {/* CSAT */}
        <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${getAuraColor(csatVal)}`}></div>
          <div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/5 text-slate-500 group-hover:text-primary transition-colors">
                <Smile className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight">Client Sentiment</span>
              <UITooltip content={<span className="text-xs">Direct client sentiment scoring for implementation.</span>}>
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
              </UITooltip>
            </div>
            <div className="flex flex-col mb-1 relative z-10">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(csatVal)}`}>{csatVal}</span>
              <div className="flex items-center justify-between mt-1 min-h-[20px]">
                <span className="text-[11px] font-medium text-slate-500">
                  Onboarding CSAT: {project?.health?.onboardingCsat ? `${project.health.onboardingCsat.score || 'Logged'}` : project?.onboardingCsat ? 'Legacy' : 'None'}
                </span>
                {project?.health?.onboardingCsat ? (
                    <button
                      onClick={() => setShowCsatModal(true)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] font-medium text-slate-400 hover:text-primary hover:bg-primary/5 px-1.5 py-0.5 rounded-md transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  ) : project?.onboardingCsat ? (
                    <button
                      onClick={() => setShowCsatModal(true)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] font-medium text-slate-400 hover:text-primary hover:bg-primary/5 px-1.5 py-0.5 rounded-md transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  ) : null}
              </div>
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(csatVal)}`} style={{ width: `${Math.min(typeof csatVal === 'number' ? csatVal : 0, 100)}%` }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. ACTIVITY TIMELINE FEED */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          Health Activity Feed
        </h3>
        
        {loadingHistory ? (
          <div className="flex flex-col space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-3 h-3 bg-slate-200 rounded-full mt-1"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : optimizedHistory.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center py-12 text-center rounded-2xl overflow-hidden border border-slate-100">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-slate-200/40 rounded-full blur-2xl pointer-events-none"></div>
            <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-xl mb-3 border border-slate-100 shadow-sm relative z-10">
              <Activity className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700 relative z-10">No Activity Recorded</p>
            <p className="text-[13px] text-slate-500 mt-1 max-w-[250px] relative z-10">There are no historical changes to display for the selected timeframe.</p>
          </div>
        ) : (
          <div className="relative ml-2 pl-6 border-l-2 border-slate-100 space-y-1 pb-4">
            {[...optimizedHistory].reverse().map((h, i, arr) => {
              const prevScore = i < arr.length - 1 ? arr[i + 1].score : h.score;
              const diff = h.score - prevScore;
              
              let Icon = Minus;
              let iconWrapper = 'bg-slate-100 text-slate-500 border-slate-200';
              let badgeColor = 'bg-slate-100 text-slate-600';
              let message = `Health Score recorded at ${h.score}`;
              
              if (diff > 0) {
                Icon = TrendingUp;
                iconWrapper = 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-4 ring-emerald-50/50';
                badgeColor = 'bg-emerald-50 text-emerald-700 ring-emerald-200/50';
                message = `Health Score improved to ${h.score}`;
              } else if (diff < 0) {
                Icon = TrendingDown;
                iconWrapper = 'bg-red-50 text-red-600 border-red-100 ring-4 ring-red-50/50';
                badgeColor = 'bg-red-50 text-red-700 ring-red-200/50';
                message = `Health Score dropped to ${h.score}`;
              }

              return (
                <div key={i} className="relative group flex items-start gap-4 -mx-2 px-2 py-3 rounded-2xl hover:bg-slate-50/80 transition-colors cursor-default">
                  <div className={`absolute -left-[29px] top-3.5 w-6 h-6 rounded-full border flex items-center justify-center bg-white ${iconWrapper} transition-all duration-300`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-start gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{message}</p>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5 tracking-tight">
                        {new Date(h.timeVal).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {diff !== 0 && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ring-1 inset-ring ${badgeColor}`}>
                        {diff > 0 ? '+' : ''}{diff} pts
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCsatModal && (
        <OnboardingCsatFormModal project={project} onClose={() => setShowCsatModal(false)} />
      )}
    </div>
  );
}
