import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Settings, DollarSign, Users, Smile, AlertCircle, PlayCircle, XCircle, CheckCircle2, Wrench, Archive, Zap, Blocks, Edit2, Plus, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getHealthHistory } from '../../../api/dbService';
import { calculateProjectHealth } from '../../../utils/scoringUtils';
import { useAppStore } from '../../../store/useAppStore';
import OnboardingCsatModal from './OnboardingCsatModal';
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

const MiniGauge = ({ score, suffix = '' }: { score: number | string, suffix?: string }) => {
  if (typeof score !== 'number') {
    return (
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <div className="w-full h-full rounded-full border-4 border-slate-100" />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400">N/A</span>
      </div>
    );
  }
  
  const normalized = Math.max(0, Math.min(100, score));
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;
  
  let color = '#f43f5e'; // red-500
  if (normalized >= 50) color = '#f97316'; // orange-500
  if (normalized >= 80) color = '#10b981'; // emerald-500

  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle 
          cx="24" cy="24" r="20" 
          fill="none" 
          stroke={color} 
          strokeWidth="4" 
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black tracking-tighter text-slate-700">
        {normalized}{suffix}
      </span>
    </div>
  );
};

export default function ProjectHealthTab({ project }: ProjectHealthTabProps) {
  const [showCsatModal, setShowCsatModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filter, setFilter] = useState<'30' | '90' | '365' | 'all'>('30');
  const tabId = React.useId();

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
        borderColor: '#0ea5e9',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
          gradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)');
          return gradient;
        },
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#0ea5e9',
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderWidth: 3,
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#0f172a',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            return `Score: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: { 
        min: 0, 
        max: 100, 
        grid: { color: '#f8fafc', drawBorder: false }, 
        border: { display: false, dash: [4, 4] },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '600' }, padding: 10, maxTicksLimit: 5 }
      },
      x: { 
        grid: { display: false, drawBorder: false }, 
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '600' }, padding: 10, maxTicksLimit: 6 }
      },
    },
  };

  const normalizedScore = typeof overallScore === 'number' ? Math.max(0, Math.min(100, overallScore)) : 0;
  const arcLength = Math.PI * 80;
  const redLength = arcLength * 0.50;
  const orangeLength = arcLength * 0.80;
  const needleRotation = (normalizedScore / 100) * 180 - 90;
  
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
      <div className={`w-full rounded-2xl border p-4 flex items-center justify-between shadow-sm overflow-hidden relative backdrop-blur-md ${
        isSuspended ? 'bg-red-500/5 border-red-500/20' :
        isActive ? 'bg-emerald-500/5 border-emerald-500/20' :
        isOnboarding ? 'bg-primary/5 border-primary/20' :
        'bg-slate-500/5 border-slate-500/20'
      }`}>
        <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-50 pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/2 ${
          isSuspended ? 'bg-red-500/20 animate-pulse' :
          isActive ? 'bg-emerald-500/20' :
          isOnboarding ? 'bg-primary/20' :
          'bg-slate-500/20'
        }`}></div>
        
        <div className="flex items-center gap-3 relative z-10">
          {isSuspended ? (
            <div className="p-2 bg-red-100 rounded-xl"><AlertCircle className="w-5 h-5 text-red-600" /></div>
          ) : isActive ? (
            <div className="p-2 bg-emerald-100 rounded-xl"><Activity className="w-5 h-5 text-emerald-600" /></div>
          ) : isOnboarding ? (
            <div className="p-2 bg-primary/10 rounded-xl"><PlayCircle className="w-5 h-5 text-primary" /></div>
          ) : (
            <div className="p-2 bg-slate-200 rounded-xl"><CheckCircle2 className="w-5 h-5 text-slate-600" /></div>
          )}
          
          <div>
            <h3 className={`text-base font-bold ${
              isSuspended ? 'text-red-700' :
              isActive ? 'text-emerald-700' :
              isOnboarding ? 'text-primary' :
              'text-slate-700'
            }`}>
              {isSuspended ? 'Project Suspended' :
               isActive ? 'Actively Tracking Health' :
               isOnboarding ? 'Onboarding Phase' :
               isCancelled ? 'Project Cancelled' :
               project?.projectStatus || 'Status Unknown'}
            </h3>
            <p className={`text-xs font-medium mt-0.5 ${
              isSuspended ? 'text-red-600/80' :
              isActive ? 'text-emerald-600/80' :
              isOnboarding ? 'text-primary/80' :
              'text-slate-500'
            }`}>
              {isSuspended ? 'This project is suspended due to outstanding invoices.' :
               isActive ? 'Metrics are live and contributing to global health scores.' :
               isOnboarding ? 'Metrics will begin calculating upon project release.' :
               isCancelled ? 'Project was cancelled. No health tracking or historical data was recorded.' :
               'Historical data is preserved, but active tracking has concluded.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. HERO DASHBOARD (Merged Gauge + Chart) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col lg:flex-row min-h-[280px]">
        
        {/* LEFT PANE: GAUGE */}
        <div className="lg:w-1/3 p-6 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-slate-100">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent pointer-events-none"></div>
          
          {(isOnboarding || isClosed || isCancelled) ? (
            <div className="flex flex-col items-center text-center z-10 p-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-inner">
                {isOnboarding && <PlayCircle className="w-8 h-8 text-slate-400" />}
                {isClosed && <CheckCircle2 className="w-8 h-8 text-slate-400" />}
                {isCancelled && <XCircle className="w-8 h-8 text-slate-400" />}
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Not Scoring</h3>
            </div>
          ) : (
            <div className="flex flex-col items-center z-10 relative">
              <div className="relative flex items-center justify-center w-36 h-36 mb-2">
                <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-2xl"></div>
                <svg className="transform -rotate-90 w-full h-full drop-shadow-md">
                  <circle cx="72" cy="72" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <circle
                    cx="72"
                    cy="72"
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
                  <span className={`text-4xl font-black tabular-nums tracking-tight ${getScoreColor(overallScore)}`}>
                    {typeof overallScore === 'number' ? overallScore : '-'}
                  </span>
                </div>
              </div>
              <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Global Score</h3>
            </div>
          )}
        </div>

        {/* RIGHT PANE: CHART */}
        <div className="lg:w-2/3 p-6 flex flex-col bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Trajectory</h3>
            <div className="inline-flex items-center rounded-lg p-[3px] text-muted-foreground bg-slate-50 border border-slate-100 w-max h-8 shrink-0">
              {['30', '90', '365', 'all'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`relative inline-flex h-full items-center justify-center rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${filter === f ? 'bg-white text-primary shadow-sm ring-1 ring-slate-900/5' : 'hover:text-slate-700 hover:bg-slate-100'}`}
                >
                  {f === 'all' ? 'All' : f === '365' ? '1Y' : `${f}D`}
                </button>
              ))}
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

      {/* 3. KPI GRID (Modern Glassmorphic Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Engagement */}
        <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${getAuraColor(opVal)}`}></div>
          <div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/5 text-slate-500 group-hover:text-primary transition-colors">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight">Platform Engagement</span>
              <Tooltip content={<span className="text-xs">Measures frequency & volume of core workflows.</span>}>
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
              </Tooltip>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(opVal)}`}>{opVal}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Score</span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(opVal)}`} style={{ width: `${Math.min(typeof opVal === 'number' ? opVal : 0, 100)}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Feature Adoption */}
        <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${getAuraColor(fPct)}`}></div>
          <div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/5 text-slate-500 group-hover:text-primary transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700 tracking-tight">Feature Adoption</span>
              <Tooltip content={<span className="text-xs">Percentage of available features actively used.</span>}>
                <AlertCircle className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
              </Tooltip>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(fPct)}`}>{fPct}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{fLen}/{fTotal} Active</span>
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
            <div className="flex items-end gap-2 mb-1">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(healthResult.financial)}`}>{healthResult.financial}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 truncate max-w-[120px] ${project?.invoiceStatus === 'Suspended' ? 'text-red-500' : 'text-slate-400'}`}>
                Invoice: {project?.invoiceStatus || 'Current'}
              </span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(healthResult.financial)}`} style={{ width: `${Math.min(typeof healthResult.financial === 'number' ? healthResult.financial : 0, 100)}%` }} />
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
            <div className="flex items-end gap-2 mb-1">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(usrVal)}`}>{usrVal}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Score</span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(usrVal)}`} style={{ width: `${Math.min(typeof usrVal === 'number' ? usrVal : 0, 100)}%` }} />
            </div>
          </div>
        </motion.div>

        {/* CSAT */}
        <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${getAuraColor(csatVal)}`}></div>
          <div>
            <div className="flex items-center justify-between mb-4 w-full relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary/5 text-slate-500 group-hover:text-primary transition-colors">
                  <Smile className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-700 tracking-tight">Client Sentiment</span>
                <UITooltip content={<span className="text-xs">Direct client sentiment scoring for implementation.</span>}>
                  <AlertCircle className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
                </UITooltip>
              </div>
              <button
                onClick={() => setShowCsatModal(true)}
                className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded transition-all uppercase"
              >
                {project?.onboardingCsat ? 'Edit' : 'Record Survey'}
              </button>
            </div>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${getScoreColor(csatVal)}`}>{csatVal}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Onboarding: {project?.onboardingCsat ? `${project.onboardingCsat.score}/100` : 'None'}
              </span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
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
          <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Activity className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-600">No Activity Recorded</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">There are no historical changes to display for the selected timeframe.</p>
          </div>
        ) : (
          <div className="relative pl-3 border-l-2 border-slate-100 space-y-8 pb-4">
            {[...optimizedHistory].reverse().map((h, i, arr) => {
              const prevScore = i < arr.length - 1 ? arr[i + 1].score : h.score;
              const diff = h.score - prevScore;
              
              let dotColor = 'bg-slate-300 ring-slate-100';
              let badgeColor = 'bg-slate-100 text-slate-600';
              let message = `Health Score recorded at ${h.score}`;
              
              if (diff > 0) {
                dotColor = 'bg-emerald-500 ring-emerald-50';
                badgeColor = 'bg-emerald-50 text-emerald-700 ring-emerald-200/50';
                message = `Health Score improved to ${h.score}`;
              } else if (diff < 0) {
                dotColor = 'bg-red-500 ring-red-50';
                badgeColor = 'bg-red-50 text-red-700 ring-red-200/50';
                message = `Health Score dropped to ${h.score}`;
              }

              return (
                <div key={i} className="relative group flex items-start gap-4">
                  <div className={`absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full ring-4 ${dotColor}`}></div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{message}</p>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1 tracking-wide uppercase">
                        {new Date(h.timeVal).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {diff !== 0 && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ring-1 inset-ring ${badgeColor}`}>
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
        <OnboardingCsatModal project={project} onClose={() => setShowCsatModal(false)} />
      )}
    </div>
  );
}