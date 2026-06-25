import React, { useState, useEffect } from 'react';
import { updateProjectRecord, addProjectAutoLog } from '../../../api/dbService';
import { useAppStore } from '../../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';

interface ProjectFeaturesTabProps {
  project: any;
}

export default function ProjectFeaturesTab({ project }: ProjectFeaturesTabProps) {
  const settings = useAppStore(state => state.settings);
  const user = useAppStore(state => state.user);

  // Local state for optimistic UI feedback
  const [localFeatures, setLocalFeatures] = useState<string[]>(project?.features || []);

  // Sync local state if the external project prop changes
  useEffect(() => {
    setLocalFeatures(project?.features || []);
  }, [project?.features]);

  const handleToggle = async (feature: string) => {
    if (!project) return;

    const isCurrentlyActive = localFeatures.includes(feature);

    // Optimistic evaluation
    const newFeatures = isCurrentlyActive
      ? localFeatures.filter((f: string) => f !== feature)
      : [...localFeatures, feature];

    // Optimistic UI Update (local tab)
    setLocalFeatures(newFeatures);

    try {
      // Background Sync
      await updateProjectRecord(
        { ...project, features: newFeatures },
        {
          successMsg: `Active Features successfully updated for '${project.name}'`,
          errorMsg: `Failed to update features for '${project.name}'`,
        }
      );

      const logMsg = isCurrentlyActive
        ? `Deactivated feature: ${feature}`
        : `Activated feature: ${feature}`;
      await addProjectAutoLog(project.id, logMsg, user?.name || 'System');
    } catch (err) {
      console.error('Failed to sync feature toggle', err);
      // Rollback on error
      setLocalFeatures(project?.features || []);
    }
  };

  const featuresList = settings?.features?.length
    ? settings.features
    : [
        'Contracts',
        'Inventory',
        'Pricing',
        'Deposits',
        'Payments',
        'Allocations',
        'Workflows',
        'Reporting',
      ];
      
  const activeCount = featuresList.filter((f: string) => localFeatures.includes(f)).length;
  const totalCount = featuresList.length;
  const pct = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  // Gauge colors based on score
  const getGaugeColors = (val: number) => {
    if (val >= 80) return { stroke: 'stroke-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', fill: 'fill-emerald-500' };
    if (val >= 50) return { stroke: 'stroke-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', fill: 'fill-blue-500' };
    return { stroke: 'stroke-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', fill: 'fill-amber-500' };
  };

  const colors = getGaugeColors(pct);
  
  // SVG Semi-Circular progress values
  const radius = 45;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col space-y-6">
      {/* Adoption Score Widget */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden pb-6 border-b border-slate-100"
      >
        {/* Soft Aura Background */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 ${colors.bg} rounded-full blur-3xl opacity-60 pointer-events-none`}></div>
        
        <div className="relative p-6 flex flex-col sm:flex-row items-center gap-8">
          {/* Semi-Circular Gauge */}
          <div className="relative shrink-0 flex items-center justify-center w-[120px] h-[70px]">
            <svg width="120" height="70" viewBox="0 0 120 70" className="overflow-visible">
              {/* Background Arc */}
              <path
                d="M 15 60 A 45 45 0 0 1 105 60"
                className="stroke-slate-100"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
              {/* Foreground Arc */}
              <motion.path
                d="M 15 60 A 45 45 0 0 1 105 60"
                className={`${colors.stroke}`}
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center flex-col">
              <span className={`text-2xl font-extrabold tracking-tight ${colors.text} leading-none`}>{pct}%</span>
            </div>
          </div>

          {/* Insights Text */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className={`w-5 h-5 ${colors.text}`} />
              Platform Adoption
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              This project is currently utilizing <strong className="text-slate-700">{activeCount}</strong> out of <strong className="text-slate-700">{totalCount}</strong> tracked platform features. <br className="hidden sm:block" />
              Toggle the features below to keep the platform configuration synced.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      {featuresList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 mt-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-3">
            <Layers className="w-6 h-6 text-slate-300" />
          </div>
          <h4 className="text-[14px] font-bold text-slate-700">No Features Configured</h4>
          <p className="text-[13px] text-slate-500 mt-1 max-w-[250px]">
            There are no platform features defined in your settings. Please configure features to track adoption.
          </p>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {featuresList.map((feature: string) => {
            const isActive = localFeatures.includes(feature);
            
            return (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                key={feature}
                onClick={() => handleToggle(feature)}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 group select-none shadow-sm border ${
                  isActive 
                    ? 'bg-primary/5 border-primary/30 shadow-[0_4px_20px_rgb(14,165,233,0.07)]' 
                    : 'bg-white border-slate-200/60 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex-1 pr-4">
                  <span className={`text-[14px] font-semibold tracking-tight transition-colors ${isActive ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900'}`}>
                    {feature}
                  </span>
                </div>
                
                {/* Animated Pill Toggle */}
                <div 
                  className={`shrink-0 w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    isActive ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-white rounded-full shadow-sm pointer-events-none"
                    animate={{ 
                      x: isActive ? 20 : 0 
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
