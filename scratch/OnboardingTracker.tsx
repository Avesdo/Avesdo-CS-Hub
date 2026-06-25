import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';

export default function OnboardingTracker() {
  const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);

  const data = useMemo(() => {
    if (!projects || !settings?.phases || !settings?.timelines) return [];
    
    const onboardingProjects = projects.filter((p) => p.projectStatus === 'Onboarding');
    
    // Create a mapping of Phase -> { name, total: 0, statuses: { [timeline]: count } }
    const phaseData: Record<string, any> = {};
    const phasesOrder = settings.phases.map((p) => p.name);
    
    phasesOrder.forEach(ph => {
      phaseData[ph] = { name: ph, total: 0, statuses: {} };
      settings.timelines?.forEach(t => {
        phaseData[ph].statuses[t.name] = 0;
      });
    });

    onboardingProjects.forEach((p) => {
      const ph = p.onboardingPhase || settings.phases?.[0]?.name || 'Not Started';
      const matchedPhase = settings.phases?.find((sp) => sp.name?.toLowerCase() === ph.toLowerCase())?.name || ph;
      
      const tl = p.timelineStatus || settings.timelines?.[0]?.name || 'Not Started';
      const matchedTimeline = settings.timelines?.find((st) => st.name?.toLowerCase() === tl.toLowerCase())?.name || tl;
      
      if (!phaseData[matchedPhase]) {
        phaseData[matchedPhase] = { name: matchedPhase, total: 0, statuses: {} };
        settings.timelines?.forEach(t => {
          phaseData[matchedPhase].statuses[t.name] = 0;
        });
      }
      
      phaseData[matchedPhase].statuses[matchedTimeline] = (phaseData[matchedPhase].statuses[matchedTimeline] || 0) + 1;
      phaseData[matchedPhase].total++;
    });

    return Object.values(phaseData)
      .filter((ph) => ph.total > 0)
      .sort((a, b) => {
      let ia = phasesOrder.indexOf(a.name);
      let ib = phasesOrder.indexOf(b.name);
      if (ia === -1) ia = 999;
      if (ib === -1) ib = 999;
      return ia - ib;
    });
  }, [projects, settings]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full min-h-[200px]">
        <span className="text-sm">No onboarding projects to display</span>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.total));

  return (
    <div className="flex flex-col gap-4 mt-2 mb-2 pr-2 overflow-y-auto max-h-[250px] custom-thin-scroll">
      {data.map((ph) => {
        return (
          <div key={ph.name} className="flex flex-col gap-1.5 group shrink-0">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{ph.name}</span>
              <span className="font-bold text-slate-700">{ph.total} <span className="text-muted-foreground font-normal text-[10px] ml-0.5">Projects</span></span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
              {settings?.timelines?.map(t => {
                const count = ph.statuses[t.name] || 0;
                if (count === 0) return null;
                const pct = (count / maxTotal) * 100;
                return (
                  <div 
                    key={t.name}
                    className="h-full transition-all duration-500 border-l border-white/20 first:border-0" 
                    style={{ width: `${pct}%`, backgroundColor: t.color || '#94a3b8' }} 
                    title={`${count} ${t.name}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-muted-foreground">
              {settings?.timelines?.map(t => {
                const count = ph.statuses[t.name] || 0;
                if (count === 0) return null;
                return (
                  <span key={t.name} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color || '#94a3b8' }}></span>
                    {count} {t.name}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
