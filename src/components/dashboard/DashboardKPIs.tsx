import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Building, TrendingUp, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TrendIndicator } from '../TrendIndicator';
import { Tooltip as UITooltip } from '../ui/Tooltip';

export interface DashboardKPIsProps {
  totalScored: number;
  avgHealth: number;
  prevHealth: number;
  getHealthColorClass: (score: number) => string;
  totalUnits: number;
  prevUnits: number;
  pipelineCount: number;
  prevPipelineCount: number;
  qRev: number;
  prevQRev: number;
}

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

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({
  totalScored,
  avgHealth,
  prevHealth,
  getHealthColorClass,
  totalUnits,
  prevUnits,
  pipelineCount,
  prevPipelineCount,
  qRev,
  prevQRev,
}) => {
  const navigate = useNavigate();

  return (
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
          <TrendIndicator current={qRev} previous={prevQRev} prefix="$" periodText="last quarter" />
        </motion.div>
      </motion.div>
    </div>
  );
};
