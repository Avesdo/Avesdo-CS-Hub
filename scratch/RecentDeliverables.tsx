import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Rocket, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { renderIcon, getHealthBadge } from '../../utils/uiUtils';
export default function RecentDeliverables() {
  const projects = useAppStore(state => state.projects);
  const services = useAppStore(state => state.services);
  const settings = useAppStore(state => state.settings);

  const getServiceIcon = (type: string) => {
    const s = settings?.serviceTypes?.find((x: any) => x.name === type);
    if (s) return { iconName: s.icon || 'Briefcase', color: s.color || 'blue' };
    return { iconName: 'Briefcase', color: 'blue' };
  };

  const formatCurrency = (val: number | string | undefined) => {
    if (val === undefined || val === null) return '$0.00';
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : val;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const deliverables = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentQtr = Math.floor((new Date().getMonth() + 3) / 3);
    
    const recentServices = [...(services || [])].filter((s) => {
      if (s.outcome !== 'Won') return false;
      if (!s.dateVal) return false;
      const d = new Date(s.dateVal);
      return d.getFullYear() === currentYear && Math.floor((d.getMonth() + 3) / 3) === currentQtr;
    }).map(s => ({
      id: `service_${s.id}`,
      type: 'service' as const,
      name: s.name,
      clientName: s.clientName,
      date: s.dateVal || 0,
      meta: formatCurrency(s.price),
      iconData: getServiceIcon(s.type || '')
    }));

    const recentLaunches = [...(projects || [])].filter((p) => {
      if (p.projectStatus === 'Onboarding' && p.timelineStatus !== 'Released' && p.onboardingPhase !== 'Released') return false;
      if (p.projectStatus === 'Cancelled' || p.projectStatus === 'Churned') return false;
      let timestamp = p.releaseDateVal;
      if (!timestamp && p.releaseDate) {
        const parsed = new Date(p.releaseDate).getTime();
        if (!isNaN(parsed)) timestamp = parsed;
      }
      if (!timestamp) return false;
      const d = new Date(timestamp);
      return d.getFullYear() === currentYear && Math.floor((d.getMonth() + 3) / 3) === currentQtr;
    }).map(p => {
      let timestamp = p.releaseDateVal || (p.releaseDate ? new Date(p.releaseDate).getTime() : 0);
      return {
        id: `launch_${p.id}`,
        type: 'launch' as const,
        name: p.name,
        clientName: (p.clients || []).join(', '),
        date: timestamp,
        meta: `${p.units || 0} Units`,
        iconData: { iconName: 'Rocket', color: 'purple' }
      };
    });

    return [...recentServices, ...recentLaunches].sort((a, b) => b.date - a.date).slice(0, 8);
  }, [projects, services, settings]);

  if (deliverables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <span className="text-sm">No recent deliverables in this quarter</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {deliverables.map((item) => (
        <div key={item.id} className="flex flex-col p-3 rounded-lg border border-border/50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.type === 'launch' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {item.type === 'launch' ? 'Project Launch' : 'Service Delivered'}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">{item.date > 0 ? format(new Date(item.date), 'MMM d, yyyy') : ''}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden flex-1 pr-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'launch' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                {item.type === 'launch' ? <Rocket className="w-4 h-4" /> : renderIcon(item.iconData.iconName, 'w-4 h-4')}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">{item.name}</span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {item.type === 'service' ? (
                    <>
                      <span className="font-medium text-slate-600">{item.serviceType}</span>
                      {item.projectName && ` • ${item.projectName}`}
                      {item.clientName && ` • ${item.clientName}`}
                    </>
                  ) : (
                    <>{item.clientName || 'No Client'}</>
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className={`text-[13px] font-bold ${item.type === 'launch' ? (item.healthScore && item.healthScore >= 80 ? 'text-lime-600' : item.healthScore && item.healthScore >= 50 ? 'text-orange-500' : item.healthScore ? 'text-red-500' : 'text-slate-600') : 'text-foreground'}`}>
                {item.type === 'launch' && item.healthScore !== 'N/A' ? `Health: ${item.healthScore}` : item.meta}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
