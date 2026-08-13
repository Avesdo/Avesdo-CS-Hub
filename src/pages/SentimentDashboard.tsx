import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { OnboardingCSATWidget } from '../components/quality/OnboardingCSATWidget';
import { SupportCSATWidget } from '../components/quality/SupportCSATWidget';
import { NPSWidget } from '../components/quality/NPSWidget';
import { DateRangePicker, PresetRange } from '../components/ui/DateRangePicker';
import { useAppStore } from '../store/useAppStore';
import { getQualityMetricsData } from '../utils/qualityUtils';

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

export default function SentimentDashboard() {
  const [preset, setPreset] = useState<PresetRange>('thisYear');
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly'>('monthly');

  const projects = useAppStore((state) => state.projects);
  const clients = useAppStore((state) => state.clients);

  const metricsData = React.useMemo(() => {
    return getQualityMetricsData(projects, clients, preset, startDate, endDate, viewMode);
  }, [projects, clients, preset, startDate, endDate, viewMode]);

  return (
    <div className="flex h-full flex-col min-h-0 bg-white relative overflow-hidden">
      {/* FIXED HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 shrink-0 px-4 md:px-6 pt-8 pb-4 bg-white z-30">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Sentiment Analytics
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Track customer satisfaction, net promoter scores, and overall project delivery quality.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto mt-2 md:mt-0">
          <DateRangePicker
            preset={preset}
            startDate={startDate}
            endDate={endDate}
            onChange={(newPreset, start, end) => {
              setPreset(newPreset);
              if (newPreset === 'custom') {
                setStartDate(start);
                setEndDate(end);
              } else {
                setStartDate(null);
                setEndDate(null);
              }
            }}
            minDate={new Date(2025, 9, 1)}
            maxDate={new Date()}
          />
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('quarterly')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                viewMode === 'quarterly'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 custom-thin-scroll">
        <motion.div
          className="px-4 md:px-6 flex flex-col gap-5 pb-6 pt-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col gap-5">
            <motion.div variants={itemVariants}>
              <OnboardingCSATWidget data={metricsData.onboardingCsat} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SupportCSATWidget data={metricsData.supportCsat} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <NPSWidget data={metricsData.nps} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// force reload
