import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebase';
import { useAppStore } from '../store/useAppStore';

import {
  Activity,
  Building,
  TrendingUp,
  DollarSign,
  Filter,
  ChevronDown,
  Plus,
  Download,
  Users,
  ListTodo,
  Briefcase,
  PieChart,
  ShieldCheck,
  PauseCircle,
  AlertOctagon,
  History,
  BarChart3,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  Package,
  Rocket,
  HousePlus,
  Calendar,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useUI } from '../context/UIContext';
import { getHealthHistory, getSystemLogs } from '../api/dbService';
import {
  getHealthBadge,
  getSettingBadge,
  hexToRgba,
  getSafeHex,
  renderIcon,
} from '../utils/uiUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import { universalExportCSV } from '../utils/exportUtils';
import {
  getFilteredProjects,
  getFilteredClients,
  getFilteredServices,
  getActiveClients,
  calculateHealthStats,
  calculateUnitAndPipelineStats,
  calculateQuarterlyRevenue,
  calculateOnboardingPhases,
  calculateDeliveryTimelines,
  getAllSystemFeatures,
  calculateFeatureAdoption,
  calculateManagerWorkload,
  getRecentServices,
  getRecentLaunches,
  getRecentActivity,
  calculateQuarterlyMovers,
  getAtRiskClients,
  getSuspendedProjects,
  getUpcomingActivity,
} from '../utils/dashboardUtils';

import { TrendIndicator } from '../components/TrendIndicator';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { Tooltip as UITooltip } from '../components/ui/Tooltip';
import { TruncatedText } from '../components/ui/TruncatedText';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export default function Dashboard() {
  const clients = useAppStore((state) => state.clients);
  const projects = useAppStore((state) => state.projects);
  const services = useAppStore((state) => state.services);
  const settings = useAppStore((state) => state.settings);
  const { openModal, openDrawer } = useUI();
  const navigate = useNavigate();
  const [managerFilter, setManagerFilter] = useState('All Managers');
  const [showAmMenu, setShowAmMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [actionTab, setActionTab] = useState<'risk' | 'sus'>('sus');
  const [healthHistory, setHealthHistory] = useState<any>({});
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

  // Feature adoption tabs: 'active' or 'onb'
  const [featTab, setFeatTab] = useState<'active' | 'onb'>('active');
  const [hoveredTimeline, setHoveredTimeline] = useState<string | null>(null);
  const [hoveredHealth, setHoveredHealth] = useState<'healthy' | 'warning' | 'risk' | null>(null);

  const amMenuRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(amMenuRef, () => setShowAmMenu(false), showAmMenu);
  useOnClickOutside(addMenuRef, () => setShowAddMenu(false), showAddMenu);
  useOnClickOutside(exportMenuRef, () => setShowExportMenu(false), showExportMenu);

  useEffect(() => {
    getHealthHistory()
      .then((data) => {
        setHealthHistory(data);
        setIsFetchingHistory(false);
      })
      .catch((err) => {
        console.error('Failed to load history for movers', err);
        setIsFetchingHistory(false);
      });

    const oneYearAgo = new Date().getTime() - 365 * 24 * 60 * 60 * 1000;
    const q = query(collection(db, 'system_logs'), where('timestamp', '>=', oneYearAgo));
    const unsubLogs = onSnapshot(q, (snap) => {
      const validLogs = snap.docs.map((doc) => doc.data());
      validLogs.sort((a: any, b: any) => b.timestamp - a.timestamp);
      setSystemLogs(validLogs.slice(0, 10)); // limit to 10 latest
    });
    return () => unsubLogs();
  }, []);

  const allManagers = useMemo(() => {
    return settings?.managers?.map((m) => m.name) || [];
  }, [settings]);

  const filteredProjects = useMemo(
    () => getFilteredProjects(projects, managerFilter),
    [projects, managerFilter]
  );
  const filteredClients = useMemo(
    () => getFilteredClients(clients, managerFilter),
    [clients, managerFilter]
  );
  const filteredServices = useMemo(
    () => getFilteredServices(services, managerFilter),
    [services, managerFilter]
  );
  const activeClients = useMemo(() => getActiveClients(filteredClients), [filteredClients]);

  const healthyThresh = settings?.scoring?.thresholds?.healthy || 80;
  const warningThresh = settings?.scoring?.thresholds?.warning || 50;

  const { healthyCount, warningCount, riskCount, avgHealth, totalScored, prevHealth } = useMemo(
    () => calculateHealthStats(activeClients, healthHistory, healthyThresh, warningThresh),
    [activeClients, healthHistory, healthyThresh, warningThresh]
  );

  const { totalUnits, prevUnits, pipelineCount, prevPipelineCount } = useMemo(
    () => calculateUnitAndPipelineStats(filteredProjects),
    [filteredProjects]
  );

  const { qRev, prevQRev } = useMemo(
    () => calculateQuarterlyRevenue(filteredServices),
    [filteredServices]
  );

  const onboardingPhases = useMemo(
    () => calculateOnboardingPhases(filteredProjects, settings?.phases || []),
    [filteredProjects, settings?.phases]
  );

  // Timelines
  const deliveryTimelines = useMemo(
    () => calculateDeliveryTimelines(filteredProjects, settings?.timelines || []),
    [filteredProjects, settings?.timelines]
  );

  const allSystemFeatures = useMemo(() => getAllSystemFeatures(projects), [projects]);

  const featureAdoptionCombined = useMemo(
    () => calculateFeatureAdoption(filteredProjects, allSystemFeatures),
    [filteredProjects, allSystemFeatures]
  );

  const managerWorkload = useMemo(
    () => calculateManagerWorkload(projects, settings?.managers || []),
    [projects, settings?.managers]
  );

  const recentServices = useMemo(() => getRecentServices(filteredServices), [filteredServices]);

  const getServiceIcon = (type: string) => {
    const s = settings?.serviceTypes?.find((x: any) => x.name === type);
    if (s) return { iconName: s.icon || 'Briefcase', color: s.color || 'blue' };
    return { iconName: 'Briefcase', color: 'blue' };
  };

  const recentLaunches = useMemo(() => getRecentLaunches(filteredProjects), [filteredProjects]);

  const recentActivity = useMemo(
    () => getRecentActivity(recentServices, recentLaunches),
    [recentServices, recentLaunches]
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);

  // Quarterly Movers calculation
  const movers = useMemo(
    () => calculateQuarterlyMovers(activeClients, healthHistory),
    [activeClients, healthHistory]
  );

  // Action Required
  const atRiskClients = useMemo(
    () => getAtRiskClients(filteredClients, warningThresh),
    [filteredClients, warningThresh]
  );

  const suspendedProjects = useMemo(
    () => getSuspendedProjects(filteredProjects),
    [filteredProjects]
  );

  const hasRisk = atRiskClients.length > 0;
  const hasSus = suspendedProjects.length > 0;
  const showActionReq = hasRisk || hasSus;

  // Upcoming Activity
  const upcomingActivity = useMemo(
    () => getUpcomingActivity(filteredProjects, filteredServices),
    [filteredProjects, filteredServices]
  );

  // Health color dynamic based on score
  const getHealthColorClass = (score: number) => {
    if (score >= healthyThresh) return 'text-lime-600';
    if (score >= warningThresh) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="flex h-full flex-col min-h-0 bg-white relative overflow-hidden">
      {/* FIXED HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 shrink-0 px-4 md:px-6 pt-4 pb-4 bg-white z-40">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            High-level overview of portfolio health, project activity, and service revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto mt-2 md:mt-0">
          {/* Global View Selector */}
          <div className="relative rounded-lg" ref={amMenuRef}>
            <button
              onClick={() => setShowAmMenu(!showAmMenu)}
              className="group inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all duration-300 border border-transparent bg-slate-100 hover:bg-slate-200 active:scale-95 hover:-translate-y-0.5 text-slate-700 px-4 py-2 h-9 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-slate-400/20"
            >
              <div className="flex items-center gap-1.5 flex-1 text-left">
                <TruncatedText text={managerFilter} className="text-foreground font-bold" />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
            <AnimatePresence>
              {showAmMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md p-1.5 shadow-xl border border-slate-200/60 rounded-xl min-w-[150px] z-[90]"
                >
                  <div
                    className={`group px-2 py-2 text-sm font-medium rounded-md hover:bg-primary/5 cursor-pointer transition-colors hover:text-primary ${
                      managerFilter === 'All Managers' ? 'text-primary' : ''
                    }`}
                    onClick={() => {
                      setManagerFilter('All Managers');
                      setShowAmMenu(false);
                    }}
                  >
                    All Managers
                  </div>
                  <div className="border-t border-slate-100 my-1"></div>
                  {allManagers.map((m) => (
                    <div
                      key={m}
                      className={`group px-2 py-2 text-sm font-medium rounded-md hover:bg-primary/5 cursor-pointer transition-colors hover:text-primary mt-0.5 ${
                        managerFilter === m ? 'text-primary' : ''
                      }`}
                      onClick={() => {
                        setManagerFilter(m);
                        setShowAmMenu(false);
                      }}
                    >
                      {m}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create Shortcut */}
          <div className="relative rounded-lg" ref={addMenuRef}>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="group inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] shadow-sm px-4 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Plus className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
              <span>Create</span>
            </button>
            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md p-1.5 shadow-xl border border-slate-200/60 rounded-xl min-w-[150px] z-[90]"
                >
                  <div
                    className="group px-2 py-2 rounded-md hover:bg-primary/5 cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => {
                      openModal('addClient');
                      setShowAddMenu(false);
                    }}
                  >
                    <Building className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />{' '}
                    Client
                  </div>
                  <div
                    className="group px-2 py-2 rounded-md hover:bg-primary/5 cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary mt-0.5"
                    onClick={() => {
                      openModal('addProject');
                      setShowAddMenu(false);
                    }}
                  >
                    <HousePlus className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />{' '}
                    Project
                  </div>
                  <div
                    className="group px-2 py-2 rounded-md hover:bg-primary/5 cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary mt-0.5"
                    onClick={() => {
                      openModal('addService');
                      setShowAddMenu(false);
                    }}
                  >
                    <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />{' '}
                    Service
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pb-12 relative scroll-smooth custom-thin-scroll">
        {/* KPI CARDS */}
        <div className="shrink-0 mb-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 px-4 md:px-6 pt-4 mb-6"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => navigate('/clients', { state: { kpiFilter: 'active' } })}
              className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-lime-500/40 transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
              style={{ animationDelay: '50ms' }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-lime-500/5 group-hover:bg-lime-500/10 rounded-full blur-xl transition-colors duration-200"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-lime-500/10 text-lime-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    Global Health Index
                    <UITooltip content="Average score of all active accounts">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </UITooltip>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </div>
              {totalScored > 0 ? (
                <TrendIndicator
                  current={avgHealth}
                  previous={prevHealth}
                  colorClass={getHealthColorClass(avgHealth)}
                />
              ) : (
                <div className="mt-auto pt-2 relative z-10">
                  <div className="text-3xl font-bold tracking-tight text-muted-foreground">N/A</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Add health scores to clients to see index
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() =>
                navigate('/projects', { state: { ptTab: 'All Projects', kpiFilter: 'units' } })
              }
              className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
              style={{ animationDelay: '150ms' }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-full blur-xl transition-colors duration-200"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    Live Units
                    <UITooltip content="Total scale of actively supported product">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </UITooltip>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </div>
              <TrendIndicator current={totalUnits} previous={prevUnits} />
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => navigate('/projects', { state: { ptTab: 'Actively Onboarding' } })}
              className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-purple-500/40 transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
              style={{ animationDelay: '250ms' }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 group-hover:bg-purple-500/10 rounded-full blur-xl transition-colors duration-200"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    Launch Pipeline
                    <UITooltip content="Projects launching in ≤ 45 days">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </UITooltip>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </div>
              <TrendIndicator current={pipelineCount} previous={prevPipelineCount} neutral={true} />
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => {
                const d = new Date();
                const y = d.getFullYear();
                const q = Math.floor(d.getMonth() / 3);
                const sm = String(q * 3 + 1).padStart(2, '0');
                const em = String(q * 3 + 3).padStart(2, '0');
                navigate('/services', {
                  state: { svTab: 'Won', dateRange: { start: `${y}-${sm}`, end: `${y}-${em}` } },
                });
              }}
              className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
              style={{ animationDelay: '350ms' }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-full blur-xl transition-colors duration-200"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    Service Revenue
                    <UITooltip content="Revenue won in last 90 days">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </UITooltip>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </div>
              <TrendIndicator
                current={qRev}
                previous={prevQRev}
                prefix="$"
                periodText="last quarter"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <div className="px-4 md:px-6 flex flex-col min-h-0">
          {/* MAIN BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 relative z-10 animate-in fade-in duration-700 delay-300 fill-mode-both">
            {/* LEFT COLUMN: Data & Analytics (2/3 Width) */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Client Health Hub */}
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
                      <div className="text-2xl font-bold text-foreground leading-none">
                        {totalScored}
                      </div>
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
                              onClick={() =>
                                openDrawer('client', c.clientId, { targetTab: 'health' })
                              }
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

              {/* Project Delivery Hub */}
              <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden">
                <div className="flex justify-between items-center p-4 pb-3 border-b border-border bg-white/95 backdrop-blur-md shrink-0">
                  <div className="flex flex-col min-w-0">
                    <div className="text-base font-semibold tracking-tight text-foreground">
                      Project Delivery
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      Implementation pipeline and schedule health for onboarding projects
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-2xl font-bold text-foreground leading-none">
                      {onboardingPhases.reduce((acc, curr) => acc + Number(curr[1]), 0)}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-semibold mt-1">
                      Onboarding Projects
                    </div>
                  </div>
                </div>

                <div className="flex flex-col p-6 gap-6">
                  {/* Top Half: Pipeline */}
                  <div className="relative min-h-[120px] flex items-center justify-center">
                    <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] z-0"></div>
                    <div className="flex items-center w-full justify-between relative z-10 px-[10%] h-full">
                      {onboardingPhases.length === 0 ? (
                        <span className="bg-white px-4 text-muted-foreground font-medium z-10 w-full text-center">
                          No onboarding projects
                        </span>
                      ) : (
                        onboardingPhases.map(([phase, count], idx) => {
                          const isTop = idx % 2 === 0;
                          const colorName = settings?.phases?.find(
                            (p) => p.name?.toLowerCase() === String(phase).toLowerCase()
                          )?.color;
                          const hexColor = getSafeHex(colorName, 'slate');

                          return (
                            <div
                              key={phase}
                              className="relative flex flex-col items-center justify-center group cursor-pointer transition-all duration-300 z-10"
                              onClick={() =>
                                openDrawer('dashDrilldown', undefined, {
                                  title: `Milestone: ${phase}`,
                                  subtitle: 'Onboarding Projects',
                                  viewAllPath: '/projects',
                                  viewAllState: {
                                    ptTab: 'All Projects',
                                    statusFilter: 'Onboarding',
                                    phaseFilter: phase === 'Not Started' ? 'Not Started' : phase,
                                  },
                                  projects: filteredProjects.filter(
                                    (p) =>
                                      p.projectStatus === 'Onboarding' &&
                                      (p.onboardingPhase === phase ||
                                        (!p.onboardingPhase && phase === 'Not Started'))
                                  ),
                                })
                              }
                            >
                              {isTop && (
                                <div className="absolute bottom-full mb-3 flex flex-col items-center justify-end text-center w-[120px] transition-transform group-hover:-translate-y-1.5">
                                  <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-none tracking-tight">
                                    {count}
                                  </span>
                                  <span className="text-[11px] font-semibold text-muted-foreground mt-1.5 whitespace-normal leading-tight">
                                    {phase}
                                  </span>
                                </div>
                              )}
                              <div
                                className="w-8 h-4 shrink-0 rounded-full ring-[3px] ring-white shadow-md group-hover:scale-110 transition-transform z-10"
                                style={{ backgroundColor: hexColor }}
                              ></div>
                              {!isTop && (
                                <div className="absolute top-full mt-3 flex flex-col items-center justify-start text-center w-[120px] transition-transform group-hover:translate-y-1.5">
                                  <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-none tracking-tight">
                                    {count}
                                  </span>
                                  <span className="text-[11px] font-semibold text-muted-foreground mt-1.5 whitespace-normal leading-tight">
                                    {phase}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border w-[90%] mx-auto"></div>

                  {/* Bottom Half: Health Progress Bar */}
                  <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto pt-2 pb-6">
                    <div className="w-full flex gap-1 h-3 mt-1 items-center">
                      {deliveryTimelines.map((t) => {
                        const hexColor = getSafeHex(t.color, 'slate');
                        return (
                          <div
                            key={t.name}
                            title={`${t.name}: ${t.count}`}
                            onMouseEnter={() => setHoveredTimeline(t.name)}
                            onMouseLeave={() => setHoveredTimeline(null)}
                            className={`h-full rounded-full cursor-pointer transition-all duration-300 ${hoveredTimeline === t.name ? '-translate-y-0.5 shadow-md brightness-110' : ''}`}
                            style={{ width: `${t.percentage}%`, backgroundColor: hexColor }}
                            onClick={() =>
                              openDrawer('dashDrilldown', undefined, {
                                title: `Schedule Status: ${t.name}`,
                                subtitle: 'Onboarding Projects',
                                contextType: 'timeline',
                                viewAllPath: '/projects',
                                viewAllState: {
                                  ptTab: 'All Projects',
                                  statusFilter: 'Onboarding',
                                  timelineFilter: t.name,
                                },
                                projects: projects.filter(
                                  (p) =>
                                    p.projectStatus === 'Onboarding' && p.timelineStatus === t.name
                                ),
                              })
                            }
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                      {deliveryTimelines.map((t) => {
                        const hexColor = getSafeHex(t.color, 'slate');
                        return (
                          <button
                            key={t.name}
                            onMouseEnter={() => setHoveredTimeline(t.name)}
                            onMouseLeave={() => setHoveredTimeline(null)}
                            onClick={() =>
                              openDrawer('dashDrilldown', undefined, {
                                title: `Schedule Status: ${t.name}`,
                                subtitle: 'Onboarding Projects',
                                contextType: 'timeline',
                                viewAllPath: '/projects',
                                viewAllState: {
                                  ptTab: 'All Projects',
                                  statusFilter: 'Onboarding',
                                  timelineFilter: t.name,
                                },
                                projects: projects.filter(
                                  (p) =>
                                    p.projectStatus === 'Onboarding' && p.timelineStatus === t.name
                                ),
                              })
                            }
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-bold border shadow-sm transition-all cursor-pointer bg-white whitespace-nowrap active:scale-95 ${hoveredTimeline === t.name ? '-translate-y-1 shadow-md' : ''}`}
                            style={{
                              backgroundColor: hexToRgba(hexColor, 0.08),
                              color: hexColor,
                              borderColor: hexToRgba(hexColor, 0.2),
                            }}
                          >
                            <span className="font-black">{t.count}</span> {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Adoption */}
              <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden">
                <div className="flex justify-between items-center p-4 pb-3 border-b border-border bg-white/95 backdrop-blur-md shrink-0">
                  <div className="flex flex-col pr-4 min-w-0">
                    <div
                      className="text-base font-semibold tracking-tight text-foreground truncate"
                      title="Feature Adoption"
                    >
                      Feature Adoption
                    </div>
                    <p
                      className="text-xs text-muted-foreground mt-1 font-medium truncate"
                      title={`Combined adoption across ${featureAdoptionCombined.totalProjects} total projects`}
                    >
                      Combined adoption across {featureAdoptionCombined.totalProjects} total
                      projects
                    </p>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-5 content-start custom-thin-scroll bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {featureAdoptionCombined.data.length === 0 ? (
                      <span className="text-sm text-muted-foreground font-medium text-center w-full block md:col-span-2 py-4">
                        No features tracked.
                      </span>
                    ) : (
                      featureAdoptionCombined.data.map(({ feature, active, onboarding, total }) => {
                        const totalPct =
                          featureAdoptionCombined.totalProjects > 0
                            ? Math.round((total / featureAdoptionCombined.totalProjects) * 100)
                            : 0;

                        return (
                          <div
                            key={feature}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
                          >
                            <div className="flex flex-col gap-2 flex-1 overflow-hidden pr-2">
                              <span
                                className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors"
                                title={feature}
                              >
                                {feature}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    openDrawer('dashDrilldown', undefined, {
                                      contextType: 'featureAdoption',
                                      title: `Feature: ${feature}`,
                                      subtitle: 'Active Projects',
                                      viewAllPath: '/projects',
                                      viewAllState: {
                                        ptTab: 'All Projects',
                                        kpiFilter: 'units',
                                        featuresFilter: feature,
                                      },
                                      projects: filteredProjects.filter(
                                        (p) =>
                                          (p.projectStatus === 'Active' ||
                                            p.projectStatus === 'Suspended') &&
                                          (p.features || []).includes(feature)
                                      ),
                                    })
                                  }
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-green-50 text-green-600 border border-green-200/50 hover:bg-green-100 hover:shadow-sm active:scale-95 transition-all"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  {active} Active
                                </button>
                                <button
                                  onClick={() =>
                                    openDrawer('dashDrilldown', undefined, {
                                      contextType: 'featureAdoption',
                                      title: `Feature: ${feature}`,
                                      subtitle: 'Onboarding Projects',
                                      viewAllPath: '/projects',
                                      viewAllState: {
                                        ptTab: 'All Projects',
                                        statusFilter: 'Onboarding',
                                        featuresFilter: feature,
                                      },
                                      projects: filteredProjects.filter(
                                        (p) =>
                                          p.projectStatus === 'Onboarding' &&
                                          (p.features || []).includes(feature)
                                      ),
                                    })
                                  }
                                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200/50 hover:bg-blue-100 hover:shadow-sm active:scale-95 transition-all"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  {onboarding} Onboarding
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-center shrink-0 pl-4 border-l border-slate-100 min-w-[70px]">
                              <span className="text-2xl font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                                {totalPct}%
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground mt-1 tracking-wider">
                                {total} Projects
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: People & Activity (1/3 Width) */}
            <div className="flex flex-col gap-5 h-full lg:block lg:relative">
              <div className="flex flex-col gap-5 lg:absolute lg:inset-0">
                {/* Manager Workload */}
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden">
                  <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-white/95 backdrop-blur-md shrink-0">
                    <div className="text-base font-semibold tracking-tight text-foreground">
                      Manager Workload
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Project volume distribution by assignee
                    </p>
                  </div>
                  <div className="flex-1 overflow-auto p-5 space-y-3 content-start custom-thin-scroll bg-white">
                    {managerWorkload.length === 0 && (
                      <span className="text-sm text-muted-foreground font-medium text-center w-full block">
                        No manager workload data.
                      </span>
                    )}
                    {managerWorkload.map(([manager, counts]) => {
                      const initials =
                        manager !== 'Unassigned'
                          ? manager
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .substring(0, 2)
                              .toUpperCase()
                          : '?';
                      const mHex = getSafeHex(
                        settings?.managers?.find((m: any) => m.name === manager)?.color,
                        'slate'
                      );
                      const total = counts.active + counts.onboarding;

                      return (
                        <div
                          key={manager}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
                        >
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-slate-200"
                                style={{
                                  backgroundColor: hexToRgba(mHex, 0.08),
                                  color: mHex,
                                  borderColor: hexToRgba(mHex, 0.2),
                                }}
                              >
                                {initials}
                              </div>
                              <div className="flex flex-col">
                                <span
                                  className="text-sm font-bold text-foreground truncate"
                                  title={manager}
                                >
                                  {manager}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <button
                                    onClick={() =>
                                      openDrawer('dashDrilldown', undefined, {
                                        contextType: 'managerWorkloadActive',
                                        title: 'Active Projects',
                                        subtitle: manager,
                                        viewAllPath: '/projects',
                                        viewAllState: {
                                          ptTab: 'All Projects',
                                          kpiFilter: 'units',
                                          managerFilter: manager,
                                        },
                                        projects: filteredProjects.filter(
                                          (p: any) =>
                                            p.assignee === manager &&
                                            (p.projectStatus === 'Active' ||
                                              p.projectStatus === 'Suspended')
                                        ),
                                      })
                                    }
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-green-50 text-green-600 border border-green-200/50 hover:bg-green-100 hover:shadow-sm active:scale-95 transition-all"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    {counts.active} Active
                                  </button>
                                  <button
                                    onClick={() =>
                                      openDrawer('dashDrilldown', undefined, {
                                        contextType: 'managerWorkloadOnboarding',
                                        title: 'Onboarding Projects',
                                        subtitle: manager,
                                        viewAllPath: '/projects',
                                        viewAllState: {
                                          ptTab: 'All Projects',
                                          statusFilter: 'Onboarding',
                                          managerFilter: manager,
                                        },
                                        projects: filteredProjects.filter(
                                          (p: any) =>
                                            p.assignee === manager &&
                                            p.projectStatus === 'Onboarding'
                                        ),
                                      })
                                    }
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200/50 hover:bg-blue-100 hover:shadow-sm active:scale-95 transition-all"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    {counts.onboarding} Onboarding
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-center shrink-0 pl-4 border-l border-slate-100">
                            <span className="text-2xl font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                              {total}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground mt-1 tracking-wider">
                              Total
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upcoming Activity */}
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md min-h-[300px] lg:min-h-0 lg:flex-1 overflow-hidden">
                  <div className="flex items-center justify-between p-4 pb-3 border-b border-border bg-white/95 backdrop-blur-md shrink-0">
                    <div className="flex flex-col">
                      <div className="text-base font-semibold tracking-tight text-foreground">
                        Upcoming Activity
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        Projects & services scheduled for the next 45 days
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>{' '}
                        {upcomingActivity.filter((a) => a.type === 'service').length} Services
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-500"></span>{' '}
                        {upcomingActivity.filter((a) => a.type === 'launch').length} Projects
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto custom-thin-scroll bg-white">
                    <div className="p-5 flex flex-col relative min-h-full z-0">
                      {/* vertical timeline line */}
                      {upcomingActivity.length > 0 && (
                        <div className="absolute left-[96px] top-6 bottom-6 w-0.5 bg-slate-200 -z-10"></div>
                      )}

                      {upcomingActivity.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center mt-4 pb-4">
                          No upcoming activity.
                        </div>
                      )}

                      {upcomingActivity.map((act) => {
                        const d = new Date(act.dateVal);
                        const dateStr = d.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });

                        const isService = act.type === 'service';
                        const iconObj = isService
                          ? getServiceIcon(act.originalItem.serviceType || act.originalItem.type)
                          : null;

                        const hexColor = isService
                          ? getSafeHex(iconObj?.color, 'blue')
                          : getSafeHex('violet', 'violet');
                        const IconName = isService ? iconObj?.iconName || 'Briefcase' : 'Rocket';

                        const isOverdue = act.diffDays < 0;
                        const isSoon = act.diffDays >= 0 && act.diffDays <= 14;

                        let badgeClass = 'bg-slate-100 text-slate-600';
                        let badgeText = `${act.diffDays} days`;
                        if (isOverdue) {
                          badgeClass = 'bg-red-50 text-red-600 border border-red-200/50';
                          badgeText = 'Overdue';
                        } else if (isSoon) {
                          badgeClass = 'bg-orange-50 text-orange-600 border border-orange-200/50';
                          badgeText = act.diffDays === 0 ? 'Today' : `${act.diffDays} days`;
                        } else {
                          badgeClass = 'bg-slate-50 text-slate-600 border border-slate-200/50';
                        }

                        const initials =
                          act.manager !== 'Unassigned'
                            ? act.manager
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()
                            : '?';

                        const mHex = getSafeHex(
                          settings?.managers?.find((m: any) => m.name === act.manager)?.color,
                          'slate'
                        );

                        return (
                          <div key={act.id} className="flex items-center gap-4 relative py-2 group">
                            <div className="w-[45px] shrink-0 text-right">
                              <span className="text-[11px] font-bold text-slate-400">
                                {dateStr}
                              </span>
                            </div>

                            <div className="relative z-10 flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-white shadow-sm shrink-0 transition-transform group-hover:scale-110">
                                <div
                                  className="w-full h-full rounded-full border flex items-center justify-center"
                                  style={{
                                    backgroundColor: hexToRgba(hexColor, 0.1),
                                    color: hexColor,
                                    borderColor: hexToRgba(hexColor, 0.2),
                                  }}
                                  title={isService ? act.serviceType : 'Launch'}
                                >
                                  {renderIcon(IconName, 'w-4 h-4')}
                                </div>
                              </div>
                            </div>

                            <div
                              className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl p-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                              onClick={() =>
                                isService
                                  ? openDrawer('service', act.originalItem.id)
                                  : openDrawer('project', act.originalItem.id, {
                                      targetTab: 'overview',
                                    })
                              }
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col min-w-0 pr-2">
                                  <div className="flex items-center gap-2">
                                    <TruncatedText
                                      text={act.title}
                                      className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors"
                                      containerClassName="flex-shrink min-w-0"
                                    />
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${badgeClass}`}
                                    >
                                      {badgeText}
                                    </span>
                                  </div>
                                  {isService ? (
                                    <span
                                      className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate"
                                      title={`${act.projectName} • ${act.clientName}`}
                                    >
                                      {act.projectName} &bull; {act.clientName}
                                    </span>
                                  ) : (
                                    <span
                                      className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate"
                                      title={act.clientName}
                                    >
                                      {act.clientName}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col items-end shrink-0 pl-2">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md"
                                    title={act.manager}
                                    style={{
                                      backgroundColor: hexToRgba(mHex, 0.1),
                                      color: mHex,
                                      borderColor: hexToRgba(mHex, 0.25),
                                      borderWidth: '1px',
                                    }}
                                  >
                                    {initials}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* Recent Activity */}
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md min-h-[400px] lg:min-h-0 lg:flex-1 overflow-hidden">
                  <div className="flex items-center justify-between p-4 pb-3 border-b border-border bg-white/95 backdrop-blur-md shrink-0">
                    <div className="flex flex-col">
                      <div className="text-base font-semibold tracking-tight text-foreground">
                        Recent Activity
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        Projects released and services sold in the last 90 days
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>{' '}
                        {recentServices.length} Services
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-500"></span>{' '}
                        {recentLaunches.length} Projects
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto custom-thin-scroll bg-white">
                    <div className="p-5 flex flex-col relative min-h-full z-0">
                      {/* vertical timeline line */}
                      {recentActivity.length > 0 && (
                        <div className="absolute left-[96px] top-6 bottom-6 w-0.5 bg-slate-200 -z-10"></div>
                      )}

                      {recentActivity.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center mt-4 pb-4">
                          No recent activity.
                        </div>
                      )}

                      {recentActivity.map((act) => {
                        const d = new Date(act.dateVal);
                        const dateStr = d.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });

                        const isService = act.type === 'service';
                        const iconObj = isService
                          ? getServiceIcon(act.originalItem.serviceType || act.originalItem.type)
                          : null;

                        const hexColor = isService
                          ? getSafeHex(iconObj?.color, 'blue')
                          : getSafeHex('violet', 'violet');
                        const IconName = isService ? iconObj?.iconName || 'Briefcase' : 'Rocket';

                        const initials =
                          act.manager !== 'Unassigned'
                            ? act.manager
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()
                            : '?';

                        const mHex = getSafeHex(
                          settings?.managers?.find((m: any) => m.name === act.manager)?.color,
                          'slate'
                        );

                        return (
                          <div key={act.id} className="flex items-center gap-4 relative py-2 group">
                            <div className="w-[45px] shrink-0 text-right">
                              <span className="text-[11px] font-bold text-slate-400">
                                {dateStr}
                              </span>
                            </div>

                            <div className="relative z-10 flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-white shadow-sm shrink-0 transition-transform group-hover:scale-110">
                                <div
                                  className="w-full h-full rounded-full border flex items-center justify-center"
                                  style={{
                                    backgroundColor: hexToRgba(hexColor, 0.1),
                                    color: hexColor,
                                    borderColor: hexToRgba(hexColor, 0.2),
                                  }}
                                  title={isService ? act.serviceType : 'Launch'}
                                >
                                  {renderIcon(IconName, 'w-4 h-4')}
                                </div>
                              </div>
                            </div>

                            <div
                              className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl p-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                              onClick={() =>
                                isService
                                  ? openDrawer('service', act.originalItem.id)
                                  : openDrawer('project', act.originalItem.id)
                              }
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col min-w-0 pr-2">
                                  <TruncatedText
                                    text={act.title}
                                    className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors"
                                    containerClassName="flex-shrink min-w-0"
                                  />
                                  {isService ? (
                                    <span
                                      className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate"
                                      title={`${act.projectName} • ${act.clientName}`}
                                    >
                                      {act.projectName} &bull; {act.clientName}
                                    </span>
                                  ) : (
                                    <span
                                      className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate"
                                      title={act.clientName}
                                    >
                                      {act.clientName}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col items-end shrink-0 pl-2">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md"
                                    title={act.manager}
                                    style={{
                                      backgroundColor: hexToRgba(mHex, 0.1),
                                      color: mHex,
                                      borderColor: hexToRgba(mHex, 0.25),
                                      borderWidth: '1px',
                                    }}
                                  >
                                    {initials}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Spacer */}
          <div className="h-6 shrink-0 w-full" />
        </div>
      </div>
    </div>
  );
}
