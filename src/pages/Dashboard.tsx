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
import { DashboardKPIs } from '../components/dashboard/DashboardKPIs';
import { ClientHealthWidget } from '../components/dashboard/ClientHealthWidget';
import { ProjectDeliveryWidget } from '../components/dashboard/ProjectDeliveryWidget';
import { FeatureAdoptionWidget } from '../components/dashboard/FeatureAdoptionWidget';
import { ManagerWorkloadWidget } from '../components/dashboard/ManagerWorkloadWidget';
import { UpcomingActivityWidget } from '../components/dashboard/UpcomingActivityWidget';
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget';

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

  const [healthHistory, setHealthHistory] = useState<any>({});
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

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
        <DashboardKPIs
          totalScored={totalScored}
          avgHealth={avgHealth}
          prevHealth={prevHealth}
          getHealthColorClass={getHealthColorClass}
          totalUnits={totalUnits}
          prevUnits={prevUnits}
          pipelineCount={pipelineCount}
          prevPipelineCount={prevPipelineCount}
          qRev={qRev}
          prevQRev={prevQRev}
        />

        {/* SCROLLABLE MAIN CONTENT */}
        <div className="px-4 md:px-6 flex flex-col min-h-0">
          {/* MAIN BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 relative z-10 animate-in fade-in duration-700 delay-300 fill-mode-both">
            {/* LEFT COLUMN: Data & Analytics (2/3 Width) */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <ClientHealthWidget
                totalScored={totalScored}
                activeClients={activeClients}
                healthyThresh={healthyThresh}
                warningThresh={warningThresh}
                healthyCount={healthyCount}
                warningCount={warningCount}
                riskCount={riskCount}
                openDrawer={openDrawer}
                suspendedProjects={suspendedProjects}
                atRiskClients={atRiskClients}
                hasSus={hasSus}
                hasRisk={hasRisk}
                settings={settings}
                movers={movers}
                isFetchingHistory={isFetchingHistory}
              />

              <ProjectDeliveryWidget
                onboardingPhases={onboardingPhases}
                settings={settings}
                filteredProjects={filteredProjects}
                projects={projects}
                openDrawer={openDrawer}
                deliveryTimelines={deliveryTimelines}
              />

              <FeatureAdoptionWidget
                featureAdoptionCombined={featureAdoptionCombined}
                filteredProjects={filteredProjects}
                openDrawer={openDrawer}
              />
            </div>

            {/* RIGHT COLUMN: People & Activity (1/3 Width) */}
            <div className="flex flex-col gap-5 h-full lg:block lg:relative">
              <div className="flex flex-col gap-5 lg:absolute lg:inset-0">
                <ManagerWorkloadWidget
                  managerWorkload={managerWorkload}
                  settings={settings}
                  filteredProjects={filteredProjects}
                  openDrawer={openDrawer}
                />

                <UpcomingActivityWidget
                  upcomingActivity={upcomingActivity}
                  getServiceIcon={getServiceIcon}
                  settings={settings}
                  openDrawer={openDrawer}
                />

                <RecentActivityWidget
                  recentActivity={recentActivity}
                  recentServices={recentServices}
                  recentLaunches={recentLaunches}
                  getServiceIcon={getServiceIcon}
                  settings={settings}
                  openDrawer={openDrawer}
                />
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
