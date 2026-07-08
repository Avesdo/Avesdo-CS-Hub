import { Client, Project, Service, Settings } from '../types';

export const getFilteredProjects = (
  projects: Project[] | null,
  managerFilter: string
): Project[] => {
  if (!projects) return [];
  if (managerFilter === 'All Managers') return projects;
  return projects.filter((p) => p.assignee === managerFilter);
};

export const getFilteredClients = (clients: Client[] | null, managerFilter: string): Client[] => {
  if (!clients) return [];
  if (managerFilter === 'All Managers') return clients;
  return clients.filter((c) => c.accountManager === managerFilter);
};

export const getFilteredServices = (
  services: Service[] | null,
  managerFilter: string
): Service[] => {
  if (!services) return [];
  if (managerFilter === 'All Managers') return services;
  return services.filter((s) => s.manager === managerFilter);
};

export const getActiveClients = (filteredClients: Client[]): Client[] => {
  return filteredClients.filter((c) => c.activeProjectCount > 0);
};

export interface HealthStats {
  healthyCount: number;
  warningCount: number;
  riskCount: number;
  avgHealth: number;
  totalScored: number;
  prevHealth: number;
}

export const calculateHealthStats = (
  activeClients: Client[],
  healthHistory: any,
  healthyThresh: number,
  warningThresh: number
): HealthStats => {
  let h = 0,
    w = 0,
    r = 0,
    totalScore = 0,
    scoredCount = 0;
  let prevTotalScore = 0,
    prevScoredCount = 0;
  const thirtyDaysAgo = new Date().getTime() - 30 * 86400000;

  activeClients.forEach((c) => {
    if (c.healthScore !== 'N/A' && typeof c.healthScore === 'number') {
      totalScore += c.healthScore;
      scoredCount++;
      if (c.healthScore >= healthyThresh) h++;
      else if (c.healthScore >= warningThresh) w++;
      else r++;

      // Prev Health
      const hist = healthHistory[c.clientId] || [];
      const olderThan30 = hist
        .filter((x: any) => x.timeVal <= thirtyDaysAgo)
        .sort((a: any, b: any) => b.timeVal - a.timeVal);

      if (olderThan30.length > 0) {
        prevTotalScore += olderThan30[0].score;
        prevScoredCount++;
      } else if (hist.length > 0) {
        const sortedAsc = [...hist].sort((a: any, b: any) => a.timeVal - b.timeVal);
        prevTotalScore += sortedAsc[0].score;
        prevScoredCount++;
      }
    }
  });
  const currentAvg = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
  const prevAvg = prevScoredCount > 0 ? Math.round(prevTotalScore / prevScoredCount) : 0;
  return {
    healthyCount: h,
    warningCount: w,
    riskCount: r,
    avgHealth: currentAvg,
    totalScored: scoredCount,
    prevHealth: prevAvg,
  };
};

export interface UnitAndPipelineStats {
  totalUnits: number;
  prevUnits: number;
  pipelineCount: number;
  prevPipelineCount: number;
}

export const calculateUnitAndPipelineStats = (
  filteredProjects: Project[]
): UnitAndPipelineStats => {
  let u = 0,
    prevU = 0,
    p = 0,
    prevP = 0;
  const thirtyDaysAgo = new Date().getTime() - 30 * 86400000;
  const fortyFiveDays = new Date().getTime() + 45 * 86400000;
  const fifteenDays = new Date().getTime() + 15 * 86400000;

  filteredProjects.forEach((proj) => {
    const currentUnits = parseInt(proj.units as any) || 0;
    if (proj.projectStatus === 'Active' || proj.projectStatus === 'Suspended') {
      u += currentUnits;
    }
    if (proj.projectStatus === 'Onboarding') {
      if (proj.releaseDateVal && proj.releaseDateVal <= fortyFiveDays) p++;
    }

    const hist = proj.history || [];
    const olderThan30 = hist
      .filter((x: any) => x.timeVal <= thirtyDaysAgo)
      .sort((a: any, b: any) => b.timeVal - a.timeVal);

    if (olderThan30.length > 0) {
      const snapshot = olderThan30[0];
      if (snapshot.status === 'Active' || snapshot.status === 'Suspended') {
        prevU += snapshot.units || 0;
      }
      if (snapshot.status === 'Onboarding') {
        if (proj.releaseDateVal && proj.releaseDateVal <= fifteenDays) prevP++;
      }
    } else {
      if (proj.projectStatus === 'Active' || proj.projectStatus === 'Suspended') {
        if (proj.releaseDateVal && proj.releaseDateVal <= thirtyDaysAgo) {
          prevU += currentUnits;
        } else if (proj.releaseDateVal && proj.releaseDateVal > thirtyDaysAgo) {
          if (proj.releaseDateVal <= fifteenDays) prevP++;
        }
      } else if (proj.projectStatus === 'Onboarding') {
        if (proj.releaseDateVal && proj.releaseDateVal <= fifteenDays) prevP++;
      }
    }
  });
  return { totalUnits: u, prevUnits: prevU, pipelineCount: p, prevPipelineCount: prevP };
};

export interface QuarterlyRevenue {
  qRev: number;
  prevQRev: number;
}

export const calculateQuarterlyRevenue = (filteredServices: Service[]): QuarterlyRevenue => {
  let rev = 0;
  let prevRev = 0;
  const today = new Date().getTime();
  const ninetyDaysAgo = today - 90 * 24 * 60 * 60 * 1000;
  const oneEightyDaysAgo = today - 180 * 24 * 60 * 60 * 1000;

  filteredServices.forEach((s) => {
    if (s.outcome === 'Won') {
      const price = parseFloat(s.price?.toString().replace(/[^0-9.-]+/g, '')) || 0;
      const timestamp = s.dateVal || (s.dateInput ? new Date(s.dateInput).getTime() : 0);

      if (timestamp >= ninetyDaysAgo && timestamp <= today) {
        rev += price;
      } else if (timestamp >= oneEightyDaysAgo && timestamp < ninetyDaysAgo) {
        prevRev += price;
      }
    }
  });
  return { qRev: rev, prevQRev: prevRev };
};

export const calculateOnboardingPhases = (
  filteredProjects: Project[],
  phases: Settings['phases']
): [string, number][] => {
  const obProjs = filteredProjects.filter((p) => p.projectStatus === 'Onboarding');
  const counts: Record<string, number> = {};
  obProjs.forEach((p) => {
    const ph = p.onboardingPhase || phases?.[0]?.name || 'Not Started';

    // Match exactly with the settings phase name if possible (case-insensitive) to ensure color mapping
    const matchedPhase =
      phases?.find((sp) => sp.name?.toLowerCase() === ph.toLowerCase())?.name || ph;

    counts[matchedPhase] = (counts[matchedPhase] || 0) + 1;
  });
  const phasesOrder = phases?.map((p) => p.name) || [];
  const activePhases = Object.keys(counts).sort((a, b) => {
    let ia = phasesOrder.indexOf(a);
    let ib = phasesOrder.indexOf(b);
    if (ia === -1) ia = 999;
    if (ib === -1) ib = 999;
    return ia - ib;
  });
  return activePhases.map((ph) => [ph, counts[ph]]);
};

export const calculateDeliveryTimelines = (
  filteredProjects: Project[],
  timelines: Settings['timelines']
): any[] => {
  if (!filteredProjects || !timelines) return [];
  const onboardingProjects = filteredProjects.filter((p) => p.projectStatus === 'Onboarding');
  const total = onboardingProjects.length || 1;

  return timelines
    .map((t) => {
      const count = onboardingProjects.filter((p) => {
        const status = p.timelineStatus || timelines?.[0]?.name || 'Not Started';
        return status.toLowerCase() === t.name.toLowerCase();
      }).length;
      return {
        name: t.name,
        color: t.color,
        count,
        percentage: (count / total) * 100,
      };
    })
    .filter((t) => t.count > 0);
};

export const getAllSystemFeatures = (projects: Project[] | null): string[] => {
  if (!projects) return [];
  return Array.from(new Set(projects.flatMap((p) => p.features || [])));
};

export const calculateFeatureAdoption = (
  filteredProjects: Project[],
  allSystemFeatures: string[]
) => {
  const activeProjs = filteredProjects.filter(
    (p) => p.projectStatus === 'Active' || p.projectStatus === 'Suspended'
  );
  const onbProjs = filteredProjects.filter((p) => p.projectStatus === 'Onboarding');

  const combined: Record<string, { active: number; onboarding: number }> = {};
  allSystemFeatures.forEach((f) => {
    combined[f] = { active: 0, onboarding: 0 };
  });

  activeProjs.forEach((p) => {
    (p.features || []).forEach((f: string) => {
      if (combined[f]) combined[f].active += 1;
    });
  });

  onbProjs.forEach((p) => {
    (p.features || []).forEach((f: string) => {
      if (combined[f]) combined[f].onboarding += 1;
    });
  });

  const data = Object.entries(combined)
    .map(([feature, counts]) => ({
      feature,
      active: counts.active,
      onboarding: counts.onboarding,
      total: counts.active + counts.onboarding,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    data,
    totalActiveProjects: activeProjs.length,
    totalOnbProjects: onbProjs.length,
    totalProjects: activeProjs.length + onbProjs.length,
  };
};

export const calculateManagerWorkload = (
  projects: Project[],
  managers: string[]
): [string, { active: number; onboarding: number }][] => {
  const wl: Record<string, { active: number; onboarding: number }> = {};
  const activeManagers = managers || [];

  activeManagers.forEach((m: string) => (wl[m] = { active: 0, onboarding: 0 }));

  projects.forEach((p) => {
    let m = p.assignee || 'Unassigned';
    if (m !== 'Unassigned' && !activeManagers.includes(m)) {
      m = 'Unassigned';
    }
    if (!wl[m]) wl[m] = { active: 0, onboarding: 0 };

    if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') wl[m].active++;
    else if (p.projectStatus === 'Onboarding') wl[m].onboarding++;
  });
  return Object.entries(wl)
    .filter(([name, c]) => name !== 'Unassigned' && (c.active > 0 || c.onboarding > 0))
    .sort((a, b) => b[1].active + b[1].onboarding - (a[1].active + a[1].onboarding));
};

export const getRecentServices = (filteredServices: Service[]): Service[] => {
  const ninetyDaysAgo = new Date().getTime() - 90 * 24 * 60 * 60 * 1000;
  return [...filteredServices]
    .filter((s) => {
      if (s.outcome !== 'Won') return false;
      if (s.status !== 'Completed') return false;
      if (!s.dateVal) return false;
      return s.dateVal >= ninetyDaysAgo;
    })
    .sort((a, b) => (b.dateVal || 0) - (a.dateVal || 0));
};

export const getRecentLaunches = (filteredProjects: Project[]): Project[] => {
  const ninetyDaysAgo = new Date().getTime() - 90 * 24 * 60 * 60 * 1000;
  return [...filteredProjects]
    .filter((p) => {
      // Must be actually launched (not in Onboarding) OR explicitly marked as Released
      if (
        p.projectStatus === 'Onboarding' &&
        p.timelineStatus !== 'Released' &&
        p.onboardingPhase !== 'Released'
      )
        return false;

      // Exclude cancelled/closed projects from being considered a recent launch
      if (p.projectStatus === 'Cancelled' || p.projectStatus === 'Churned') return false;

      let timestamp = p.releaseDateVal;
      if (!timestamp && p.releaseDate) {
        const parsed = new Date(p.releaseDate).getTime();
        if (!isNaN(parsed)) timestamp = parsed;
      }
      if (!timestamp) return false;

      return timestamp >= ninetyDaysAgo;
    })
    .sort((a, b) => {
      const valA = a.releaseDateVal || (a.releaseDate ? new Date(a.releaseDate).getTime() : 0);
      const valB = b.releaseDateVal || (b.releaseDate ? new Date(b.releaseDate).getTime() : 0);
      return valB - valA;
    });
};

export const getRecentActivity = (recentServices: Service[], recentLaunches: Project[]): any[] => {
  const activities: any[] = [];

  recentServices.forEach((s: any) => {
    activities.push({
      id: `srv-${s.id}`,
      type: 'service',
      dateVal: s.dateVal || (s.dateInput ? new Date(s.dateInput).getTime() : 0),
      title: s.name,
      serviceType: s.serviceType || s.type || 'Unknown Type',
      projectName: s.projectName || 'Unknown Project',
      clientName: s.clientName || 'No Client',
      manager: s.manager || 'Unassigned',
      amount: s.price,
      originalItem: s,
    });
  });

  recentLaunches.forEach((p: any) => {
    const primaryClientName = p.clients && p.clients.length > 0 ? p.clients[0] : null;
    const val = p.releaseDateVal || (p.releaseDate ? new Date(p.releaseDate).getTime() : 0);
    activities.push({
      id: `prj-${p.id}`,
      type: 'launch',
      dateVal: val,
      title: p.projectName || p.name,
      clientName: primaryClientName || 'No Client',
      manager: p.assignee || 'Unassigned',
      amount: null,
      originalItem: p,
    });
  });

  return activities.sort((a, b) => b.dateVal - a.dateVal);
};

export const calculateQuarterlyMovers = (activeClients: Client[], healthHistory: any): any => {
  if (!healthHistory || Object.keys(healthHistory).length === 0) return null;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const timeThresh = ninetyDaysAgo.getTime();

  const improvers: any[] = [];
  const droppers: any[] = [];

  activeClients.forEach((c) => {
    if (c.healthScore !== 'N/A' && typeof c.healthScore === 'number') {
      const rawHistory = healthHistory[c.clientId] || [];
      const history = rawHistory
        .filter((h: any) => h.timeVal >= timeThresh && typeof h.score === 'number')
        .sort((a: any, b: any) => a.timeVal - b.timeVal);

      if (history.length > 0) {
        const oldest = history[0].score;
        const diff = c.healthScore - oldest;
        const dataObj = {
          id: c.clientId,
          name: c.companyName,
          oldest,
          latest: c.healthScore,
          diff,
        };
        if (diff > 0) improvers.push(dataObj);
        else if (diff < 0) droppers.push(dataObj);
      }
    }
  });

  improvers.sort((a, b) => b.diff - a.diff);
  droppers.sort((a, b) => a.diff - b.diff);

  return {
    improvers: improvers.slice(0, 5),
    droppers: droppers.slice(0, 5),
  };
};

export const getAtRiskClients = (filteredClients: Client[], warningThresh: number): Client[] => {
  return filteredClients
    .filter(
      (c) =>
        c.healthScore !== 'N/A' &&
        typeof c.healthScore === 'number' &&
        (c.healthScore as number) < warningThresh
    )
    .sort((a, b) => ((a.healthScore as number) || 0) - ((b.healthScore as number) || 0));
};

export const getSuspendedProjects = (filteredProjects: Project[]): Project[] => {
  return filteredProjects.filter((p) => p.projectStatus === 'Suspended');
};

export const getUpcomingActivity = (
  filteredProjects: Project[],
  filteredServices: Service[]
): any[] => {
  const now = new Date().getTime();
  const activities: any[] = [];

  filteredProjects.forEach((p) => {
    if (p.projectStatus !== 'Onboarding') return;
    if (!p.releaseDateVal) return;
    const diffTime = p.releaseDateVal - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 45 && diffDays >= -30) {
      activities.push({
        id: `prj-${p.id}`,
        type: 'launch',
        dateVal: p.releaseDateVal,
        title: p.projectName || p.name,
        clientName: p.clients && p.clients.length > 0 ? p.clients[0] : 'No Client',
        manager: p.assignee || 'Unassigned',
        diffDays,
        originalItem: p,
      });
    }
  });

  filteredServices.forEach((s) => {
    if (s.outcome === 'Lost' || s.status === 'Completed' || s.status === 'Cancelled') return;
    if (!s.dateVal) return;
    const diffTime = s.dateVal - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 45 && diffDays >= -30) {
      activities.push({
        id: `srv-${s.id}`,
        type: 'service',
        dateVal: s.dateVal,
        title: s.name,
        serviceType: s.serviceType || s.type || 'Unknown Type',
        projectName: s.projectName || 'Unknown Project',
        clientName: s.clientName || 'No Client',
        manager: s.manager || 'Unassigned',
        diffDays,
        originalItem: s,
      });
    }
  });

  return activities.sort((a, b) => a.dateVal - b.dateVal);
};
