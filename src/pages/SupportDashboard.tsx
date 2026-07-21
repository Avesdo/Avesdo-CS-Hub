import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSupportStore } from '../store/useSupportStore';
import { useAcademyStore } from '../store/useAcademyStore';
import { ChevronDown, Loader2, Search } from 'lucide-react';
import { TruncatedText } from '../components/ui/TruncatedText';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import {
  getBaseTickets,
  getFilteredTicketsData,
  calculateKPIs,
  getChartData,
  getDoughnutData,
} from '../utils/supportUtils';

import { SupportKPIs } from '../components/support/SupportKPIs';
import { OperationsTrendWidget } from '../components/support/OperationsTrendWidget';
import { OriginsAndClassificationsWidget } from '../components/support/OriginsAndClassificationsWidget';
import { ActivityHeatmapWidget } from '../components/support/ActivityHeatmapWidget';
import { TimeAndEffortQuadrantWidget } from '../components/support/TimeAndEffortQuadrantWidget';
import { HighFrictionSourcesWidget } from '../components/support/HighFrictionSourcesWidget';
import { WorkloadMatrixWidget } from '../components/support/WorkloadMatrixWidget';
import { QualityMetricsWidget } from '../components/support/QualityMetricsWidget';
import { InflowChannelWidget } from '../components/support/InflowChannelWidget';

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

  const fetchQuizzes = useAcademyStore((state) => state.fetchQuizzes);

  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(categoryMenuRef, () => setShowCategoryMenu(false), showCategoryMenu);

  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const projectMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(projectMenuRef, () => setShowProjectMenu(false), showProjectMenu);

  const [managerFilter, setManagerFilter] = useState('All Agents');
  const [showAmMenu, setShowAmMenu] = useState(false);
  const amMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(amMenuRef, () => setShowAmMenu(false), showAmMenu);

  const [selectedRingCategory, setSelectedRingCategory] = useState<string | null>(null);

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
    fetchQuizzes(true);
  }, [fetchTickets, fetchQuizzes]);

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
      'volume' // We pass 'volume' statically, widget handles sorting
    );
  }, [filteredTickets, prevTickets, dateRange, customStartDate, customEndDate, managerFilter]);

  const doughnutData = useMemo(() => {
    return getDoughnutData(chartData, selectedRingCategory);
  }, [chartData, selectedRingCategory]);

  if (isLoading)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      </div>
    );

  return (
    <div className="flex h-full flex-col min-h-0 bg-white relative overflow-hidden">
      {/* FIXED HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 shrink-0 px-4 md:px-6 pt-4 pb-4 bg-white z-30">
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
        <SupportKPIs kpis={kpis} />
        <motion.div
          className="px-4 md:px-6 flex flex-col gap-5 pb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <OperationsTrendWidget chartData={chartData} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <InflowChannelWidget chartData={chartData} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <OriginsAndClassificationsWidget
              doughnutData={doughnutData}
              chartData={chartData}
              selectedRingCategory={selectedRingCategory}
              setSelectedRingCategory={setSelectedRingCategory}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ActivityHeatmapWidget chartData={chartData} hasTickets={filteredTickets.length > 0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <TimeAndEffortQuadrantWidget chartData={chartData} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <HighFrictionSourcesWidget chartData={chartData} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <WorkloadMatrixWidget chartData={chartData} managerFilter={managerFilter} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <QualityMetricsWidget />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
