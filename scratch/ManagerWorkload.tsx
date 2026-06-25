import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';

export default function ManagerWorkload() {
  const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);

  const data = useMemo(() => {
    const wl: Record<string, { name: string; active: number; onboarding: number }> = {};
    const activeManagers = settings?.managers?.map((m: any) => m.name) || [];

    activeManagers.forEach((m: string) => (wl[m] = { name: m, active: 0, onboarding: 0 }));

    projects.forEach((p) => {
      let m = p.assignee || 'Unassigned';
      if (m !== 'Unassigned' && !activeManagers.includes(m)) {
        m = 'Unassigned';
      }
      if (!wl[m]) wl[m] = { name: m, active: 0, onboarding: 0 };

      if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') wl[m].active++;
      else if (p.projectStatus === 'Onboarding') wl[m].onboarding++;
    });

    return Object.values(wl)
      .filter((c) => c.name !== 'Unassigned' && (c.active > 0 || c.onboarding > 0))
      .sort((a, b) => b.active + b.onboarding - (a.active + a.onboarding));
  }, [projects, settings?.managers]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full min-h-[200px]">
        <span className="text-sm">No manager data to display</span>
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
                className="bg-blue-500 h-full transition-all duration-500" 
                style={{ width: `${activePct}%` }} 
                title={`${m.active} Active`}
              />
              <div 
                className="bg-purple-500 h-full transition-all duration-500 border-l border-white/20" 
                style={{ width: `${onbPct}%` }}
                title={`${m.onboarding} Onboarding`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{m.active} Active</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>{m.onboarding} Onboarding</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
