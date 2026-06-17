import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { updateProjectRecord, addProjectAutoLog } from '../../../api/dbService';
import { useAppStore } from '../../../store/useAppStore';

interface ProjectFeaturesTabProps {
  project: any;
}

export default function ProjectFeaturesTab({ project }: ProjectFeaturesTabProps) {
  const { settings, projects, user } = useAppStore();

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
          successMsg: `Active Features successfully updated for '${project.name}'.`,
          errorMsg: `Failed to update features for '${project.name}'.`,
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

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-lime-600';
    if (val >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBarColor = (val: number) => {
    if (val >= 80) return 'bg-lime-500';
    if (val >= 50) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Adoption Summary Header */}
      <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-foreground tracking-tight">Feature Adoption</h3>
            <p className="text-xs text-muted-foreground font-medium">
              {activeCount} of {totalCount} Active
            </p>
          </div>
          <span className={`text-2xl font-bold tabular-nums ${getScoreColor(pct)}`}>{pct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${getBarColor(pct)}`}
            style={{ width: `${pct}%` }}
          ></div>
        </div>
      </div>

      {/* The Feature Grid */}
      <div id="pd-features-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {featuresList.map((feature: string) => {
          const isActive = localFeatures.includes(feature);
          return (
            <div
              key={feature}
              onClick={() => handleToggle(feature)}
              className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 group active:scale-[0.98] select-none ${isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-white hover:border-primary/40 hover:bg-slate-50 shadow-sm'}`}
            >
              <div className="flex-1 flex flex-col pr-4">
                <span
                  className={`text-sm font-bold tracking-tight transition-colors ${isActive ? 'text-primary' : 'text-slate-700'}`}
                >
                  {feature}
                </span>
              </div>
              <div className="shrink-0 flex items-center justify-center">
                {isActive ? (
                  <CheckCircle2 className="w-5 h-5 text-primary transition-transform scale-110" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 transition-colors group-hover:text-primary/50" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
