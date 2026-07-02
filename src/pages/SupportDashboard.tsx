import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSupportStore, SupportTicket } from '../store/useSupportStore';
import { useAppStore } from '../store/useAppStore';
import {
  format,
  subDays,
  isAfter,
  isBefore,
  startOfDay,
  getDay,
  getHours,
  startOfWeek,
  startOfMonth,
  differenceInDays,
} from 'date-fns';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Line,
  ReferenceLine,
  Label,
} from 'recharts';
import {
  ChevronDown,
  Clock,
  CheckCircle2,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Inbox,
  AlertCircle,
  ArrowRight,
  Layers,
  AlertTriangle,
  Ticket,
  Loader2,
  Search,
  PieChart as PieChartIcon,
  Activity,
  SearchX,
  LayoutGrid,
} from 'lucide-react';
import { TruncatedText } from '../components/ui/TruncatedText';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { Tooltip as UITooltip } from '../components/ui/Tooltip';
import { TrendIndicator } from '../components/TrendIndicator';
import EmptyState from '../components/EmptyState';
import {
  getBaseTickets,
  getFilteredTicketsData,
  calculateKPIs,
  getChartData,
  getDoughnutData,
  getCurrentQuadrantData,
} from '../utils/supportUtils';

const parseDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    // Convert from EST to PST by subtracting 3 hours
    d.setHours(d.getHours() - 3);
    return d;
  } catch {
    return null;
  }
};

const CHART_THEME = {
  blue: '#00bdd9',
  purple: '#8b5cf6',
  orange: '#f59e0b',
  green: '#10b981',
  grey: '#64748b',
  teal: '#14b8a6',
};

const CATEGORY_COLORS: Record<string, string> = {
  Onboarding: CHART_THEME.blue,
  Product: CHART_THEME.purple,
  Services: CHART_THEME.orange,
  Internal: CHART_THEME.grey,
  Maintenance: CHART_THEME.green,
  Uncategorized: CHART_THEME.teal,
};

const CATEGORIES = [
  'All Categories',
  'Onboarding',
  'Maintenance',
  'Services',
  'Product',
  'Internal',
];

export default function SupportDashboard() {
  const {
    tickets,
    isLoading,
    fetchTickets,
    dateRange,
    setDateRange,
    customStartDate,
    customEndDate,
    setCustomDates,
  } = useSupportStore();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(categoryMenuRef, () => setShowCategoryMenu(false), showCategoryMenu);

  const { settings } = useAppStore();
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const projectMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(projectMenuRef, () => setShowProjectMenu(false), showProjectMenu);

  const [managerFilter, setManagerFilter] = useState('All Agents');
  const [showAmMenu, setShowAmMenu] = useState(false);
  const amMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(amMenuRef, () => setShowAmMenu(false), showAmMenu);

  const [frictionSourceView, setFrictionSourceView] = useState<'project' | 'contact'>('project');
  const [workloadSortBy, setWorkloadSortBy] = useState<'volume' | 'time'>('volume');
  const [showWorkingHours, setShowWorkingHours] = useState(false);
  const [selectedRingCategory, setSelectedRingCategory] = useState<string | null>(null);
  const [timeAnalysisView, setTimeAnalysisView] = useState<
    'project' | 'category' | 'classification'
  >('project');
  const [timeAnalysisFilter, setTimeAnalysisFilter] = useState<'all' | 'significant'>('all');

  // 1. Base tickets for the current and previous period, BEFORE applying dropdown filters
  const { currentPeriodBase, previousPeriodBase } = useMemo(() => {
    return getBaseTickets(tickets, dateRange, customStartDate, customEndDate);
  }, [tickets, dateRange, customStartDate, customEndDate]);

  // 2. Cross-filter the dropdown options and the final tickets
  const { filteredTickets, prevTickets, availableCategories, availableManagers, allProjects } =
    useMemo(() => {
      return getFilteredTicketsData(
        currentPeriodBase,
        previousPeriodBase,
        selectedCategory,
        managerFilter,
        projectFilter
      );
    }, [currentPeriodBase, previousPeriodBase, selectedCategory, managerFilter, projectFilter]);

  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return allProjects;
    const query = projectSearch.toLowerCase();
    return allProjects.filter((p) => p.toLowerCase().includes(query));
  }, [allProjects, projectSearch]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const kpis = useMemo(() => {
    return calculateKPIs(filteredTickets, prevTickets);
  }, [filteredTickets, prevTickets]);

  const chartData = useMemo(() => {
    return getChartData(
      filteredTickets,
      prevTickets,
      dateRange,
      customStartDate,
      customEndDate,
      managerFilter,
      workloadSortBy
    );
  }, [
    filteredTickets,
    prevTickets,
    dateRange,
    customStartDate,
    customEndDate,
    managerFilter,
    workloadSortBy,
  ]);

  const doughnutData = useMemo(() => {
    return getDoughnutData(chartData, selectedRingCategory);
  }, [chartData, selectedRingCategory]);

  const formatTime = (hours: number) => {
    if (hours === 0) return '0h';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Number(hours.toFixed(1))}h`;
    return `${Number((hours / 24).toFixed(1))}d`;
  };

  const currentQuadrantData = useMemo(() => {
    return getCurrentQuadrantData(chartData, timeAnalysisView, timeAnalysisFilter);
  }, [chartData, timeAnalysisView, timeAnalysisFilter]);

  if (isLoading)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      </div>
    );

  return (
    <div className="flex h-full flex-col min-h-0 bg-white relative overflow-hidden">
      {/* FIXED HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 shrink-0 px-4 md:px-6 pt-4 pb-4 bg-white z-40">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Support Dashboard
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Comprehensive overview of ticket trends, resolution metrics, and team workload.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto mt-2 md:mt-0">
          {/* Project Selector */}
          <div className="relative rounded-lg mr-2" ref={projectMenuRef}>
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="group inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all duration-300 border border-transparent bg-slate-100 hover:bg-slate-200 active:scale-95 hover:-translate-y-0.5 text-slate-700 px-4 py-2 h-9 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-slate-400/20"
            >
              <div className="flex items-center gap-1.5 flex-1 text-left">
                <TruncatedText text={projectFilter} className="text-foreground font-bold" />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
            <AnimatePresence>
              {showProjectMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md p-1.5 shadow-xl border border-slate-200/60 rounded-xl w-[320px] max-h-[400px] flex flex-col z-[90]"
                >
                  <div className="sticky top-0 bg-white/95 backdrop-blur-md pb-2 z-10">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 flex-1">
                    {filteredProjects.length === 0 ? (
                      <div className="py-4 text-center text-sm text-slate-500">
                        No projects found
                      </div>
                    ) : (
                      filteredProjects.map((proj, index) => (
                        <React.Fragment key={proj}>
                          <div
                            className={`group px-2 py-2 text-sm font-medium rounded-md hover:bg-primary/5 cursor-pointer transition-colors hover:text-primary mt-0.5 ${
                              projectFilter === proj ? 'text-primary' : ''
                            }`}
                            onClick={() => {
                              setProjectFilter(proj);
                              setShowProjectMenu(false);
                              setProjectSearch('');
                            }}
                          >
                            <TruncatedText text={proj} />
                          </div>
                          {index === 0 && !projectSearch && (
                            <div className="border-t border-slate-100 my-1"></div>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Global Category Selector */}
          <div className="relative rounded-lg mr-2" ref={categoryMenuRef}>
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="group inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all duration-300 border border-transparent bg-slate-100 hover:bg-slate-200 active:scale-95 hover:-translate-y-0.5 text-slate-700 px-4 py-2 h-9 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-slate-400/20"
            >
              <div className="flex items-center gap-1.5 flex-1 text-left">
                <TruncatedText text={selectedCategory} className="text-foreground font-bold" />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
            <AnimatePresence>
              {showCategoryMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md p-1.5 shadow-xl border border-slate-200/60 rounded-xl min-w-[150px] z-[90]"
                >
                  {availableCategories.map((category, index) => (
                    <React.Fragment key={category}>
                      <div
                        className={`group px-2 py-2 text-sm font-medium rounded-md hover:bg-primary/5 cursor-pointer transition-colors hover:text-primary mt-0.5 ${
                          selectedCategory === category ? 'text-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryMenu(false);
                        }}
                      >
                        {category}
                      </div>
                      {index === 0 && <div className="border-t border-slate-100 my-1"></div>}
                    </React.Fragment>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Manager Selector */}
          <div className="relative rounded-lg mr-2" ref={amMenuRef}>
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
                  {availableManagers.map((m, index) => (
                    <React.Fragment key={m}>
                      <div
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
                      {index === 0 && <div className="border-t border-slate-100 my-1"></div>}
                    </React.Fragment>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DateRangePicker
            preset={dateRange}
            startDate={customStartDate}
            endDate={customEndDate}
            onChange={(preset, start, end) => {
              if (preset === 'custom') setCustomDates(start, end);
              setDateRange(preset);
            }}
            minDate={new Date(2025, 9, 1)}
            maxDate={new Date()}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 custom-thin-scroll">
        {/* KPI CARDS */}
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

        <div className="px-4 md:px-6">
          <div className="w-full space-y-6 mt-2">
            {/* 1. Operations Trend */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Operations Trend</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ticket volume vs average resolution time
                  </p>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                  <ComposedChart
                    data={chartData.trendData}
                    margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00bdd9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#00bdd9" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="colorResolution" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1eaeb" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#74868a', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#74868a', fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#74868a', fontSize: 12, fontWeight: 500 }}
                      domain={[0, 'auto']}
                    />
                    <RechartsTooltip
                      cursor={{ fill: '#f8fafa' }}
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                              <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
                                {label}
                              </p>
                              <div className="flex flex-col gap-3">
                                {payload.map((entry: any, index: number) => {
                                  let formattedValue = entry.value;
                                  if (entry.name === 'avgResolution') {
                                    const hours = Math.floor(entry.value);
                                    const mins = Math.round((entry.value - hours) * 60);
                                    formattedValue = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                                  }
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between gap-6"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div
                                          className="w-2.5 h-2.5 rounded-[3px] shadow-sm"
                                          style={{
                                            backgroundColor:
                                              entry.name === 'tickets' ? '#00bdd9' : '#84cc16',
                                          }}
                                        />
                                        <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                          {entry.name === 'tickets' ? (
                                            <Ticket className="w-3.5 h-3.5" />
                                          ) : (
                                            <Clock className="w-3.5 h-3.5" />
                                          )}
                                          {entry.name === 'tickets'
                                            ? 'Ticket Volume'
                                            : 'Avg Resolution'}
                                        </span>
                                      </div>
                                      <span className="text-[14px] font-bold text-foreground">
                                        {formattedValue}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#74868a',
                      }}
                      formatter={(value) =>
                        value === 'tickets' ? 'Ticket Volume' : 'Avg Resolution Time'
                      }
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="tickets"
                      name="tickets"
                      fill="url(#colorTickets)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgResolution"
                      name="avgResolution"
                      stroke="#84cc16"
                      strokeWidth={3}
                      fill="url(#colorResolution)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#84cc16' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 4. Ticket Origins & Classifications */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 overflow-hidden mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Ticket Origins & Classifications
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Dual-ring breakdown of ticket categories and their classifications
                </p>
              </div>
              <AnimatePresence>
                {selectedRingCategory && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => setSelectedRingCategory(null)}
                    className="mt-4 md:mt-0 text-sm font-semibold text-[#00bdd9] bg-[#00bdd9]/10 hover:bg-[#00bdd9]/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Back to All Categories
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="w-full lg:w-1/2 h-[500px] relative shrink-0">
                {doughnutData.inner.length === 0 ? (
                  <EmptyState
                    icon={PieChartIcon}
                    title="No Ticket Origins Found"
                    subtitle="There are no tickets matching your current filter criteria."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <RechartsTooltip
                        cursor={{ fill: '#f8fafa' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const total = data.category
                              ? doughnutData.outer.reduce((sum, item) => sum + item.value, 0)
                              : doughnutData.inner.reduce((sum, item) => sum + item.value, 0);
                            const percentage = Math.round((data.value / total) * 100);

                            return (
                              <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                                <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
                                  {data.category
                                    ? data.category + ' Classification'
                                    : 'Ticket Category'}
                                </p>
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2.5">
                                      <div
                                        className="w-2.5 h-2.5 rounded-[3px] shadow-sm"
                                        style={{ backgroundColor: data.fill }}
                                      />
                                      <span className="text-[13px] font-medium text-muted-foreground">
                                        {data.name}
                                      </span>
                                    </div>
                                    <span className="text-[14px] font-bold text-foreground flex items-center gap-2">
                                      <span>{data.value}</span>
                                      <span className="text-muted-foreground font-normal text-xs">
                                        •
                                      </span>
                                      <span className="text-[#00bdd9]">
                                        {percentage}% of {data.category ? data.category : 'Total'}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Inner Ring: Categories */}
                      <Pie
                        data={doughnutData.inner}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={110}
                        outerRadius={160}
                        paddingAngle={selectedRingCategory ? 0 : 2}
                        onClick={(data) => {
                          if (!selectedRingCategory && data?.name) {
                            setSelectedRingCategory(data.name);
                          }
                        }}
                        className={
                          !selectedRingCategory
                            ? 'cursor-pointer hover:opacity-90 transition-all duration-200'
                            : ''
                        }
                        stroke="none"
                        isAnimationActive={true}
                      >
                        {doughnutData.inner.map((entry, index) => (
                          <Cell key={`inner-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>

                      {/* Outer Ring: Classifications */}
                      <Pie
                        data={doughnutData.outer}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={165}
                        outerRadius={200}
                        paddingAngle={1}
                        stroke="none"
                        isAnimationActive={true}
                      >
                        {doughnutData.outer.map((entry, index) => (
                          <Cell key={`outer-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {/* Center Label */}
                <AnimatePresence mode="wait">
                  {!selectedRingCategory && doughnutData.inner.length > 0 ? (
                    <motion.div
                      key="global"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-bold text-slate-800"
                      >
                        {doughnutData.inner.reduce((acc, curr) => acc + curr.value, 0)}
                      </motion.div>
                      <div className="text-sm font-semibold text-slate-500 capitalize tracking-wide mt-1">
                        Total Tickets
                      </div>
                    </motion.div>
                  ) : selectedRingCategory && doughnutData.inner.length > 0 ? (
                    <motion.div
                      key="category"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-bold text-slate-800"
                      >
                        {doughnutData.outer.reduce((acc, curr) => acc + curr.value, 0)}
                      </motion.div>
                      <div
                        className="text-sm font-semibold capitalize tracking-wide mt-1"
                        style={{ color: doughnutData.inner[0].fill }}
                      >
                        {selectedRingCategory}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Legends */}
              {doughnutData.inner.length > 0 && (
                <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-8 lg:py-6">
                  {/* Categories Column */}
                  <div
                    className="w-full md:w-1/2 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-2"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    <h4 className="text-sm font-bold text-slate-700 mb-1 border-b border-slate-100 pb-2 sticky top-0 bg-white z-10">
                      Categories
                    </h4>
                    {chartData.categoryData.map((item, idx) => {
                      const isSelected = selectedRingCategory === item.name;
                      const hasSelection = selectedRingCategory !== null;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedRingCategory(isSelected ? null : item.name)}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${isSelected ? 'border-[#00bdd9] bg-[#00bdd9]/5 shadow-sm opacity-100' : hasSelection ? 'border-slate-100 opacity-50 hover:opacity-100 hover:bg-slate-50' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3.5 h-3.5 rounded-full shadow-sm"
                              style={{
                                backgroundColor:
                                  CATEGORY_COLORS[item.name] || CATEGORY_COLORS['Uncategorized'],
                              }}
                            />
                            <span className="font-semibold text-sm text-slate-700">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-slate-500">{item.value}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Classifications Column */}
                  <div
                    className="w-full md:w-1/2 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-2"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    <h4 className="text-sm font-bold text-slate-700 mb-1 border-b border-slate-100 pb-2 sticky top-0 bg-white z-10">
                      {selectedRingCategory
                        ? `${selectedRingCategory} Classifications`
                        : 'All Classifications'}
                    </h4>
                    {(() => {
                      const classMap = new Map<string, { value: number; fill: string }>();
                      doughnutData.outer.forEach((item) => {
                        if (!classMap.has(item.name)) {
                          classMap.set(item.name, { value: 0, fill: item.fill });
                        }
                        classMap.get(item.name)!.value += item.value;
                      });
                      const classList = Array.from(classMap.entries())
                        .map(([name, data]) => ({
                          name,
                          value: data.value,
                          fill: data.fill,
                        }))
                        .sort((a, b) => b.value - a.value);

                      return classList.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2.5 h-2.5 rounded-full shadow-sm opacity-80"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="font-medium text-xs text-slate-700">{item.name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">{item.value}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* 4. Busiest Times (Activity Heatmap) */}
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden flex flex-col mt-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2 flex-wrap">
                    Busiest Times (Activity Heatmap)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ticket volume concentrated by day of week and hour of day
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setShowWorkingHours(false)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      !showWorkingHours
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    24 Hours
                  </button>
                  <button
                    onClick={() => setShowWorkingHours(true)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      showWorkingHours
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Working Hours
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full overflow-x-auto custom-thin-scroll pb-4 pt-8">
                {filteredTickets.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No Activity Data"
                    subtitle="Try adjusting your filters to see ticket activity patterns."
                    className="min-h-[300px]"
                  />
                ) : (
                  <div className="min-w-[700px]">
                    {(() => {
                      const gridCols = showWorkingHours
                        ? 'repeat(5, minmax(0, 1fr)) 32px repeat(13, minmax(0, 1fr)) 40px repeat(6, minmax(0, 1fr))'
                        : '32px repeat(24, minmax(0, 1fr)) 40px';
                      const offset = showWorkingHours ? 5 : 0;
                      const totalCol = offset + (showWorkingHours ? 15 : 26);

                      return (
                        <>
                          {/* X-Axis Labels (Hours) */}
                          <div
                            className="grid gap-1.5 mb-2 items-center"
                            style={{ gridTemplateColumns: gridCols }}
                          >
                            <div style={{ gridColumnStart: offset + 1, gridRowStart: 1 }} />{' '}
                            {/* Empty slot for Y-axis label */}
                            <AnimatePresence initial={false}>
                              {[
                                '12a',
                                '1a',
                                '2a',
                                '3a',
                                '4a',
                                '5a',
                                '6a',
                                '7a',
                                '8a',
                                '9a',
                                '10a',
                                '11a',
                                '12p',
                                '1p',
                                '2p',
                                '3p',
                                '4p',
                                '5p',
                                '6p',
                                '7p',
                                '8p',
                                '9p',
                                '10p',
                                '11p',
                              ]
                                .map((hr, i) => ({ hr, i }))
                                .filter(({ i }) => !showWorkingHours || (i >= 6 && i <= 18))
                                .map(({ hr, i }, filteredIdx) => (
                                  <motion.div
                                    key={i}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                      gridColumnStart: offset + filteredIdx + 2,
                                      gridRowStart: 1,
                                    }}
                                    className="text-center text-[10px] font-semibold text-slate-400"
                                  >
                                    {hr}
                                  </motion.div>
                                ))}
                            </AnimatePresence>
                            <div style={{ gridColumnStart: totalCol, gridRowStart: 1 }} />{' '}
                            {/* Empty slot for Row Total label */}
                          </div>

                          {/* The Grid */}
                          <div className="flex flex-col gap-1.5">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                              (day, dayIdx) => (
                                <div
                                  key={dayIdx}
                                  className="grid gap-1.5 items-center"
                                  style={{ gridTemplateColumns: gridCols }}
                                >
                                  {/* Y-Axis Label (Day) */}
                                  <motion.div
                                    layout
                                    transition={{ duration: 0.3 }}
                                    className="text-[11px] font-semibold text-slate-400 text-right"
                                    style={{ gridColumnStart: offset + 1, gridRowStart: 1 }}
                                  >
                                    {day}
                                  </motion.div>

                                  {/* 24 Hour Blocks */}
                                  <AnimatePresence initial={false}>
                                    {(() => {
                                      const filteredBlocks = chartData.heatmapMatrix[dayIdx]
                                        .map((val: number, hourIdx: number) => ({ val, hourIdx }))
                                        .filter(
                                          ({ hourIdx }) =>
                                            !showWorkingHours || (hourIdx >= 6 && hourIdx <= 18)
                                        );

                                      return filteredBlocks.map(({ val, hourIdx }, filteredIdx) => {
                                        let bgClass = 'bg-slate-100/70 border-slate-200/50';
                                        if (val > 0) {
                                          const ratio = val / (chartData.maxHeat || 1);
                                          if (ratio <= 0.25)
                                            bgClass = 'bg-[#00bdd9]/20 border-[#00bdd9]/30';
                                          else if (ratio <= 0.5)
                                            bgClass = 'bg-[#00bdd9]/50 border-[#00bdd9]/60';
                                          else if (ratio <= 0.75)
                                            bgClass = 'bg-[#00bdd9]/80 border-[#00bdd9]/90';
                                          else bgClass = 'bg-[#00bdd9] border-[#0096ad]';
                                        }

                                        const isFirst = filteredIdx === 0;
                                        const isLast = filteredIdx === filteredBlocks.length - 1;

                                        return (
                                          <motion.div
                                            key={hourIdx}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                              gridColumnStart: offset + filteredIdx + 2,
                                              gridRowStart: 1,
                                            }}
                                            className={`aspect-square rounded-[3px] border ${bgClass} transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-[#00bdd9]/50 group relative cursor-pointer`}
                                          >
                                            {/* Tooltip */}
                                            <div
                                              className={`absolute bottom-full mb-2 hidden group-hover:flex flex-col z-50 pointer-events-none ${isFirst ? 'left-0 items-start' : isLast ? 'right-0 items-end' : 'left-1/2 -translate-x-1/2 items-center'}`}
                                            >
                                              <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                                                <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
                                                  {day} at{' '}
                                                  {hourIdx === 0
                                                    ? '12 AM'
                                                    : hourIdx < 12
                                                      ? `${hourIdx} AM`
                                                      : hourIdx === 12
                                                        ? '12 PM'
                                                        : `${hourIdx - 12} PM`}
                                                </p>
                                                <div className="flex flex-col gap-3">
                                                  <div className="flex items-center justify-between gap-6">
                                                    <div className="flex items-center gap-2.5">
                                                      <div className="w-2.5 h-2.5 rounded-[3px] shadow-sm bg-[#00bdd9]" />
                                                      <span className="text-[13px] font-medium text-muted-foreground">
                                                        Avg Tickets
                                                      </span>
                                                    </div>
                                                    <span className="text-[14px] font-bold text-foreground">
                                                      {val}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </motion.div>
                                        );
                                      });
                                    })()}
                                  </AnimatePresence>

                                  {/* Row Total */}
                                  <motion.div
                                    layout
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center justify-center ml-1"
                                    style={{ gridColumnStart: totalCol, gridRowStart: 1 }}
                                  >
                                    <span className="text-[11px] font-bold text-slate-500">
                                      {chartData.dayTotals[dayIdx]}
                                    </span>
                                  </motion.div>
                                </div>
                              )
                            )}

                            {/* Column Totals Row */}
                            <div
                              className="grid gap-1.5 items-center mt-1"
                              style={{ gridTemplateColumns: gridCols }}
                            >
                              <motion.div
                                layout
                                transition={{ duration: 0.3 }}
                                className="text-[10px] font-bold text-slate-400 text-right"
                                style={{ gridColumnStart: offset + 1, gridRowStart: 1 }}
                              >
                                Avg
                              </motion.div>
                              <AnimatePresence initial={false}>
                                {chartData.hourTotals
                                  .map((total, i) => ({ total, i }))
                                  .filter(({ i }) => !showWorkingHours || (i >= 6 && i <= 18))
                                  .map(({ total, i }, filteredIdx) => (
                                    <motion.div
                                      key={i}
                                      layout
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{ duration: 0.3 }}
                                      style={{
                                        gridColumnStart: offset + filteredIdx + 2,
                                        gridRowStart: 1,
                                      }}
                                      className="text-center text-[10px] font-bold text-slate-500"
                                    >
                                      {total}
                                    </motion.div>
                                  ))}
                              </AnimatePresence>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* Bottom Bar: Badges + Legend */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#00bdd9]/10 text-[#0096ad] text-[11px] px-2 py-0.5 rounded-full font-bold">
                          Peak Day: {chartData.peakDay}
                        </span>
                        <span className="bg-[#00bdd9]/10 text-[#0096ad] text-[11px] px-2 py-0.5 rounded-full font-bold">
                          Peak Time: {chartData.peakTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                        <span>Less</span>
                        <div className="w-3 h-3 rounded-[2px] bg-slate-100/70 border border-slate-200/50"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-[#00bdd9]/20 border border-[#00bdd9]/30"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-[#00bdd9]/50 border border-[#00bdd9]/60"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-[#00bdd9]/80 border border-[#00bdd9]/90"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-[#00bdd9] border border-[#0096ad]"></div>
                        <span>More</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time & Effort Quadrant */}
          <div className="grid grid-cols-1 gap-6 mt-6 mb-8">
            <div className="rounded-xl border border-border bg-white shadow-sm p-6 overflow-hidden flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-foreground text-lg">Time & Effort Quadrant</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Correlation between Total Time Spent and Avg Resolution Time
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setTimeAnalysisView('project')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        timeAnalysisView === 'project'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => setTimeAnalysisView('category')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        timeAnalysisView === 'category'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Categories
                    </button>
                    <button
                      onClick={() => setTimeAnalysisView('classification')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        timeAnalysisView === 'classification'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Classifications
                    </button>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setTimeAnalysisFilter('all')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        timeAnalysisFilter === 'all'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      All Data
                    </button>
                    <button
                      onClick={() => setTimeAnalysisFilter('significant')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        timeAnalysisFilter === 'significant'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Significant Effort
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 w-full overflow-hidden">
                <div className="h-[500px] w-full">
                  {currentQuadrantData.data.length === 0 ? (
                    <EmptyState
                      icon={Activity}
                      title="No Data Available"
                      subtitle={`There is no time or resolution data for ${timeAnalysisView}s in this period.`}
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e1eaeb" />
                        <XAxis
                          type="number"
                          dataKey="displayX"
                          name="Avg Resolution Time"
                          domain={[currentQuadrantData.minX, currentQuadrantData.maxX]}
                          tickFormatter={formatTime}
                          tick={{ fill: '#74868a', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        >
                          <Label
                            value="Average Resolution Time (Hours)"
                            position="bottom"
                            offset={0}
                            fill="#74868a"
                            fontSize={12}
                          />
                        </XAxis>
                        <YAxis
                          type="number"
                          dataKey="displayY"
                          name="Total Time Spent"
                          domain={[currentQuadrantData.minY, currentQuadrantData.maxY]}
                          tickFormatter={formatTime}
                          tick={{ fill: '#74868a', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        >
                          <Label
                            value="Total Time Spent (Hours)"
                            angle={-90}
                            position="insideLeft"
                            offset={-5}
                            fill="#74868a"
                            fontSize={12}
                          />
                        </YAxis>
                        <ZAxis
                          type="number"
                          dataKey="volume"
                          range={[60, 400]}
                          name="Ticket Volume"
                        />
                        <ReferenceLine
                          x={currentQuadrantData.avgX}
                          stroke="#94a3b8"
                          strokeDasharray="3 3"
                          label={{
                            value: 'Avg Resolution',
                            position: 'insideTopLeft',
                            fill: '#94a3b8',
                            fontSize: 11,
                          }}
                        />
                        <ReferenceLine
                          y={currentQuadrantData.avgY}
                          stroke="#94a3b8"
                          strokeDasharray="3 3"
                          label={{
                            value: 'Avg Time Spent',
                            position: 'insideBottomRight',
                            fill: '#94a3b8',
                            fontSize: 11,
                          }}
                        />
                        <RechartsTooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px]">
                                  <p className="font-bold text-foreground border-b border-border pb-2 mb-3 text-sm flex justify-between items-center">
                                    {data.name}
                                    {(data.isOutlierX || data.isOutlierY) && (
                                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded ml-2">
                                        Outlier
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between gap-6">
                                      <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-sm bg-[#00bdd9]"></div>
                                        Total Time Spent
                                      </span>
                                      <span className="text-[14px] font-bold text-foreground">
                                        {formatTime(data.timeSpentHours)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6">
                                      <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]"></div>
                                        Avg Resolution Time
                                      </span>
                                      <span className="text-[14px] font-bold text-foreground">
                                        {formatTime(data.avgResolutionHours)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6 pt-1 mt-1 border-t border-slate-100">
                                      <span className="text-[13px] font-medium text-muted-foreground">
                                        Ticket Volume
                                      </span>
                                      <span className="text-[13px] font-bold text-slate-500">
                                        {data.volume}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter name="Data" data={currentQuadrantData.data} fillOpacity={0.7}>
                          {currentQuadrantData.data.map((entry: any, index: number) => {
                            const colors = Object.values(CHART_THEME);
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={colors[index % colors.length]}
                                stroke={colors[index % colors.length]}
                                strokeWidth={1}
                              />
                            );
                          })}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* High-Friction Sources (Horizontal Stacked Bar) */}
          <div className="grid grid-cols-1 gap-6 mt-6">
            <div className="rounded-xl border border-border bg-white shadow-sm p-6 overflow-hidden flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-foreground text-lg">High-Friction Sources</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Top 10 ticket sources broken down by category
                  </p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setFrictionSourceView('project')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      frictionSourceView === 'project'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => setFrictionSourceView('contact')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      frictionSourceView === 'contact'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Contacts
                  </button>
                </div>
              </div>
              <div className="p-6 pt-0 h-[500px] w-full">
                {(frictionSourceView === 'project' ? chartData.projectData : chartData.contactData)
                  .length === 0 ? (
                  <EmptyState
                    icon={SearchX}
                    title="No High-Friction Sources"
                    subtitle="Great news! There are no high-friction tickets matching your criteria."
                  />
                ) : (
                  <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart
                      layout="vertical"
                      data={
                        frictionSourceView === 'project'
                          ? chartData.projectData
                          : chartData.contactData
                      }
                      margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1eaeb" />
                      <XAxis
                        type="number"
                        axisLine={{ stroke: '#e1eaeb' }}
                        tickLine={false}
                        tick={{ fill: '#74868a', fontSize: 12 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={(props: any) => {
                          const { x, y, payload } = props;
                          const yAxisWidth = frictionSourceView === 'project' ? 185 : 120;
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <foreignObject
                                x={-yAxisWidth}
                                y={-12}
                                width={yAxisWidth - 10}
                                height={24}
                              >
                                <div className="w-full h-full flex items-center justify-end">
                                  <TruncatedText
                                    text={payload.value}
                                    className="text-[#74868a] text-[12px] font-medium text-right"
                                    containerClassName="w-full flex justify-end"
                                  />
                                </div>
                              </foreignObject>
                            </g>
                          );
                        }}
                        width={frictionSourceView === 'project' ? 185 : 120}
                      />
                      <RechartsTooltip
                        cursor={{ fill: '#f8fafa' }}
                        content={({ active, payload, label }: any) => {
                          if (active && payload && payload.length) {
                            const total = payload.reduce(
                              (acc: number, entry: any) => acc + (entry.value || 0),
                              0
                            );
                            return (
                              <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                                <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm flex justify-between">
                                  <span>{label}</span>
                                  <span className="ml-4 font-bold text-primary">{total}</span>
                                </p>
                                <div className="flex flex-col gap-2">
                                  {payload.map((entry: any, index: number) => {
                                    if (!entry.value) return null;
                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between gap-6"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-2.5 h-2.5 rounded-[3px] shadow-sm"
                                            style={{ backgroundColor: entry.color }}
                                          />
                                          <div className="max-w-[150px] min-w-0">
                                            <TruncatedText
                                              text={entry.name.replace('cat_', '')}
                                              className="text-[13px] font-medium text-muted-foreground"
                                            />
                                          </div>
                                        </div>
                                        <span className="text-[14px] font-bold text-foreground">
                                          {entry.value}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{
                          paddingTop: '10px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#74868a',
                        }}
                        formatter={(value) => value.replace('cat_', '')}
                      />
                      {chartData.categoryKeys.map((catKey, index) => (
                        <Bar
                          key={catKey}
                          dataKey={catKey}
                          name={catKey}
                          stackId="a"
                          fill={chartData.CATEGORY_COLORS[index % chartData.CATEGORY_COLORS.length]}
                          radius={[3, 3, 3, 3]}
                          stroke="#ffffff"
                          strokeWidth={2}
                          maxBarSize={20}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* 3. Dynamic Workload Matrix (Scatter Plot) */}
          <div className="grid grid-cols-1 gap-6 mt-6">
            <div className="rounded-xl border border-border bg-white shadow-sm p-6 overflow-hidden flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-foreground text-lg">Dynamic Workload Matrix</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {managerFilter === 'All Agents'
                      ? 'Distribution by Agent: Ticket Volume vs Average Time Spent'
                      : `Distribution by Project for ${managerFilter}: Ticket Volume vs Average Time Spent`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 mr-1">Sort by:</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setWorkloadSortBy('volume')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        workloadSortBy === 'volume'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Volume
                    </button>
                    <button
                      onClick={() => setWorkloadSortBy('time')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        workloadSortBy === 'time'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Time Drain
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 w-full overflow-hidden">
                <div className="h-[450px] w-full overflow-x-auto overflow-y-hidden custom-thin-scroll pb-4">
                  {chartData.workloadData.length === 0 ? (
                    <EmptyState
                      icon={LayoutGrid}
                      title="No Workload Data"
                      subtitle="There are no tickets to plot in the workload matrix."
                    />
                  ) : (
                    <div
                      style={{
                        minWidth:
                          chartData.workloadData.length > 15
                            ? `${chartData.workloadData.length * 60}px`
                            : '100%',
                        height: '100%',
                      }}
                    >
                      <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                        <ComposedChart
                          data={chartData.workloadData}
                          margin={{ top: 20, right: 10, bottom: 20, left: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1eaeb" />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#74868a', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                          />
                          <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#74868a', fontSize: 12, fontWeight: 500 }}
                          >
                            <Label
                              value="Ticket Volume"
                              angle={-90}
                              position="insideLeft"
                              offset={-5}
                              style={{
                                textAnchor: 'middle',
                                fill: '#74868a',
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            />
                          </YAxis>
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#84cc16', fontSize: 12, fontWeight: 500 }}
                          >
                            <Label
                              value="Avg Time (mins)"
                              angle={90}
                              position="insideRight"
                              offset={-5}
                              style={{
                                textAnchor: 'middle',
                                fill: '#84cc16',
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            />
                          </YAxis>
                          <RechartsTooltip
                            cursor={{ fill: '#f1f5f9' }}
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl flex flex-col min-w-[200px] transform transition-all duration-200">
                                    <p className="font-semibold text-foreground border-b border-border pb-2 mb-3 text-sm">
                                      {data.name}
                                    </p>
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center justify-between gap-6">
                                        <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                          <div className="w-2.5 h-2.5 rounded-sm bg-[#00bdd9]"></div>
                                          Ticket Volume
                                        </span>
                                        <span className="text-[14px] font-bold text-foreground">
                                          {data.volume}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-6">
                                        <span className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                                          <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16]"></div>
                                          Average Time
                                        </span>
                                        <span className="text-[14px] font-bold text-foreground">
                                          {data.avgTime} mins
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-6 pt-1 mt-1 border-t border-slate-100">
                                        <span className="text-[13px] font-medium text-muted-foreground">
                                          Total Time
                                        </span>
                                        <span className="text-[13px] font-bold text-slate-500">
                                          {data.totalTime.toFixed(0)} mins
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend
                            wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }}
                          />
                          <Bar
                            yAxisId="left"
                            dataKey="volume"
                            name="Ticket Volume"
                            fill="#00bdd9"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="avgTime"
                            name="Average Time Spent"
                            stroke="#84cc16"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#84cc16' }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
