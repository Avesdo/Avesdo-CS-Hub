import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';

export default function FeatureAdoption() {
  const projects = useAppStore(state => state.projects);

  const data = useMemo(() => {
    if (!projects) return [];
    
    // Get all unique features across all projects
    const allSystemFeatures = Array.from(new Set(projects.flatMap((p) => p.features || [])));
    
    const counts: Record<string, { name: string; active: number; onboarding: number }> = {};
    allSystemFeatures.forEach((f) => (counts[f] = { name: f, active: 0, onboarding: 0 }));

    projects.forEach((p) => {
      if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') {
        (p.features || []).forEach((f: string) => {
          counts[f].active++;
        });
      } else if (p.projectStatus === 'Onboarding') {
        (p.features || []).forEach((f: string) => {
          counts[f].onboarding++;
        });
      }
    });

    return Object.values(counts)
      .sort((a, b) => (b.active + b.onboarding) - (a.active + a.onboarding))
      .slice(0, 8); // top 8 features to keep it clean
  }, [projects]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full min-h-[200px]">
        <span className="text-sm">No feature data to display</span>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.active + d.onboarding));

  return (
    <div className="flex flex-col gap-4 mt-2 mb-2 pr-2 overflow-y-auto max-h-[250px] custom-thin-scroll">
      {data.map((m) => {
        const total = m.active + m.onboarding;
        const activePct = (m.active / maxTotal) * 100;
        const onbPct = (m.onboarding / maxTotal) * 100;
        
        return (
          <div key={m.name} className="flex flex-col gap-1.5 group shrink-0">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{m.name}</span>
              <span className="font-bold text-slate-700">{total} <span className="text-muted-foreground font-normal text-[10px] ml-0.5">Projects</span></span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${activePct}%` }} 
                title={`${m.active} Active`}
              />
              <div 
                className="bg-amber-500 h-full transition-all duration-500 border-l border-white/20" 
                style={{ width: `${onbPct}%` }}
                title={`${m.onboarding} Onboarding`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{m.active} Active</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{m.onboarding} Onboarding</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
