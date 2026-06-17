import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Activity } from 'lucide-react';
import { updateProjectRecord, addAutoLog, addProjectAutoLog } from '../../../api/dbService';
import { calculateProjectHealth } from '../../../utils/scoringUtils';
import { useAppStore } from '../../../store/useAppStore';
import OnboardingCsatModal from './OnboardingCsatModal';
import ProjectTrendsTab from './ProjectTrendsTab';

interface ProjectHealthTabProps {
  project: any;
}

const pt_features = [
  'Contracts',
  'Inventory',
  'Pricing',
  'Deposits',
  'Payments',
  'Allocations',
  'Workflows',
  'Reporting',
];

export default function ProjectHealthTab({ project }: ProjectHealthTabProps) {
  const [csatMenuOpen, setCsatMenuOpen] = useState(false);
  const [showCsatModal, setShowCsatModal] = useState(false);
  const csatRef = useRef<HTMLDetailsElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const settings = useAppStore(state => state.settings);
  const user = useAppStore(state => state.user);

  const fLen = Array.isArray(project?.features) ? project.features.length : 0;
  const fTotal =
    Array.isArray(settings?.features) && settings?.features.length > 0
      ? settings.features.length
      : pt_features.length;

  if (project?.projectStatus === 'Onboarding' || project?.status === 'Onboarding') {
    return (
      <div className="bg-muted/50 text-muted-foreground border border-border rounded-xl px-6 py-4 text-sm font-semibold flex flex-col items-center gap-2 text-center mt-4 mx-4">
        <Activity className="w-6 h-6 shrink-0 text-muted-foreground mb-1" />
        <span>No active data to score.</span>
        <span className="font-normal text-xs max-w-xs">
          Metrics will automatically calculate once the project is active.
        </span>
      </div>
    );
  }

  const isClosed =
    project?.projectStatus === 'Closed' ||
    project?.projectStatus === 'Completed' ||
    project?.projectStatus === 'Cancelled' ||
    project?.projectStatus === 'Churned';
  if (isClosed) {
    return (
      <div className="bg-muted/50 text-muted-foreground border border-border rounded-xl px-6 py-4 text-sm font-semibold flex flex-col items-center gap-2 text-center mt-4 mx-4">
        <Activity className="w-6 h-6 shrink-0 text-muted-foreground mb-1" />
        <span>No active data to score.</span>
        <span className="font-normal text-xs max-w-xs">
          Metrics are no longer tracked for {project?.projectStatus?.toLowerCase()} projects.
        </span>
      </div>
    );
  }

  const healthResult = calculateProjectHealth(project, settings);

  const fPct = healthResult.featAdoption;
  const opVal = healthResult.opActivity;
  const usrVal = healthResult.userVol;
  const csatVal = healthResult.csat;

  const getScoreColor = (val: number | string) => {
    if (typeof val !== 'number') return 'text-slate-400';
    if (val >= 80) return 'text-lime-600';
    if (val >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBarColor = (val: number | string) => {
    if (typeof val !== 'number') return 'bg-slate-200';
    if (val >= 80) return 'bg-lime-500';
    if (val >= 50) return 'bg-orange-400';
    return 'bg-red-500';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(event.target as Node)) {
        setCsatMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && csatMenuOpen) {
        event.stopPropagation();
        setCsatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [csatMenuOpen]);

  const handleCsatChange = async (val: string) => {
    if (!project || project.csat === val) {
      setCsatMenuOpen(false);
      return;
    }

    const oldVal = project.csat || 'None';
    await updateProjectRecord(
      { ...project, csat: val },
      {
        successMsg: `Onboarding CSAT successfully updated for '${project.name}'.`,
        errorMsg: `Failed to update Onboarding CSAT for '${project.name}'.`,
      }
    );
    setCsatMenuOpen(false);

    await addProjectAutoLog(
      project.id,
      `CSAT changed from ${oldVal} to ${val || 'None'}`,
      user?.name || 'System'
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Expandable: Platform Engagement */}
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Platform Engagement
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              Measures the frequency and volume of core workflows and events executed within this
              specific project.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(opVal)}`}
                style={{ width: typeof opVal === 'number' ? `${Math.min(opVal, 100)}%` : '0%' }}
              ></div>
            </div>
            <span
              className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(opVal)}`}
            >
              {opVal}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Logged Events</span>
            <span className="font-semibold text-foreground">
              {typeof opVal === 'number' ? opVal : 0}
            </span>
          </div>
        </div>
      </details>

      {/* 2. Expandable: Feature Adoption */}
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Feature Adoption
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              The percentage of available platform modules and features actively utilized during
              this rollout.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(fPct)}`}
                style={{ width: typeof fPct === 'number' ? `${fPct}%` : '0%' }}
              ></div>
            </div>
            <span
              className={`w-10 text-right font-bold text-xl tabular-nums ${getScoreColor(fPct)}`}
            >
              {fPct}%
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 border-t border-border pt-4 text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Active Features</span>
            <span className="font-bold text-foreground">
              {fLen} of {fTotal}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {project?.features?.map((f: string) => (
              <span
                key={f}
                className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-xs font-semibold"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </details>

      {/* 3. Expandable: Financial Standing */}
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Financial Standing
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              Evaluates payment consistency and outstanding invoice status for this specific
              project.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(healthResult.financial)}`}
                style={{
                  width:
                    typeof healthResult.financial === 'number'
                      ? `${Math.min(healthResult.financial, 100)}%`
                      : '0%',
                }}
              ></div>
            </div>
            <span
              className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(healthResult.financial)}`}
            >
              {healthResult.financial}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Invoice Status</span>
            <span
              className={`font-semibold ${project?.invoiceStatus === 'Overdue 60+ Days' || project?.invoiceStatus === 'Suspended' ? 'text-destructive' : 'text-foreground'}`}
            >
              {project?.invoiceStatus || 'Current'}
            </span>
          </div>
        </div>
      </details>

      {/* 4. Expandable: Active Users */}
      <details className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group overflow-hidden">
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Active Users
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              Tracks the volume of unique, authenticated users actively accessing this project.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(usrVal)}`}
                style={{ width: typeof usrVal === 'number' ? `${Math.min(usrVal, 100)}%` : '0%' }}
              ></div>
            </div>
            <span
              className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(usrVal)}`}
            >
              {usrVal}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 border-t border-border text-sm text-muted-foreground space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <span>Active Users</span>
            <span className="font-semibold text-foreground">
              {typeof usrVal === 'number' ? usrVal : 0}
            </span>
          </div>
        </div>
      </details>

      {/* 5. Expandable: Client Sentiment */}
      <details
        ref={csatRef}
        className="bg-white border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-primary/40 group relative"
      >
        <summary className="p-5 cursor-pointer outline-none hover:bg-slate-50 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-col pr-4">
            <span className="mb-1 text-sm font-bold text-foreground tracking-tight">
              Client Sentiment
            </span>
            <span className="text-xs text-muted-foreground font-medium leading-snug">
              Direct client sentiment and satisfaction scoring for this specific implementation.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:flex">
              <div
                className={`h-full transition-all ${getBarColor(csatVal)}`}
                style={{ width: typeof csatVal === 'number' ? `${csatVal}%` : '0%' }}
              ></div>
            </div>
            <span
              className={`w-8 text-right font-bold text-xl tabular-nums ${getScoreColor(csatVal)}`}
            >
              {csatVal}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="px-5 pb-5 pt-4 text-sm text-muted-foreground space-y-3 border-t border-border bg-white">
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground">Onboarding Sentiment</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">
                {project?.onboardingCsat
                  ? `${project.onboardingCsat.score}/100`
                  : project?.csat || 'No Rating'}
              </span>
              <button
                onClick={() => setShowCsatModal(true)}
                className="px-3 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
              >
                {project?.onboardingCsat ? 'View / Edit' : 'Record Survey'}
              </button>
            </div>
          </div>
        </div>
      </details>
      {showCsatModal && (
        <OnboardingCsatModal project={project} onClose={() => setShowCsatModal(false)} />
      )}
      
      <div className="mt-8 border-t border-border pt-8">
        <h3 className="px-4 text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Health Trends</h3>
        <ProjectTrendsTab project={project} />
      </div>
    </div>
  );
}
