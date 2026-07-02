import { Project, Settings } from '../types';
import { calculateProjectHealth } from './scoringUtils';

export function getMappedProjects(
  projects: Project[],
  settings: Settings | null,
  healthHistory: any
): Project[] {
  const today = new Date().getTime();
  const thirtyDaysAgo = today - 30 * 24 * 60 * 60 * 1000;

  return projects.map((p) => {
    const healthCalc = calculateProjectHealth(p, settings);
    const finalScore = healthCalc.totalScore;

    const hist = healthHistory[p.id] || [];
    const sortedHist = [...hist]
      .filter((x: any) => x.timeVal >= thirtyDaysAgo)
      .sort((a: any, b: any) => a.timeVal - b.timeVal);
    const trendData = sortedHist.map((h: any) => h.score);
    if (typeof finalScore === 'number') trendData.push(finalScore);
    if (trendData.length === 1 && typeof finalScore === 'number') trendData.unshift(finalScore);
    return { ...p, healthScore: finalScore, trendData };
  });
}

export function calculateProjectKPIs(mappedProjects: Project[]) {
  let ob = 0,
    prevOb = 0;
  let pipe = 0,
    prevPipe = 0;
  let r = 0,
    prevR = 0;
  let units = 0,
    prevU = 0;

  const thirtyDaysAgo = new Date().getTime() - 30 * 86400000;
  const fortyFiveDays = new Date().getTime() + 45 * 86400000;
  const fifteenDays = new Date().getTime() + 15 * 86400000;

  mappedProjects.forEach((p) => {
    const currentUnits = parseInt(p.units as any) || 0;
    const finalScore = p.healthScore;

    // Current State
    if (p.projectStatus === 'Onboarding') {
      ob++;
      if (p.releaseDateVal && p.releaseDateVal <= fortyFiveDays) pipe++;
    }
    if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') {
      units += currentUnits;
      if (finalScore !== 'N/A' && typeof finalScore === 'number' && finalScore < 50) r++;
    }

    // Previous State
    const hist = p.history || [];
    const olderThan30 = hist
      .filter((x: any) => x.timeVal <= thirtyDaysAgo)
      .sort((a: any, b: any) => b.timeVal - a.timeVal);

    if (olderThan30.length > 0) {
      const snapshot = olderThan30[0];
      if (snapshot.status === 'Onboarding') {
        prevOb++;
        if (p.releaseDateVal && p.releaseDateVal <= fifteenDays) prevPipe++;
      }
      if (snapshot.status === 'Active' || snapshot.status === 'Suspended') {
        prevU += snapshot.units || 0;
        if (snapshot.healthScore < 50) prevR++;
      }
    } else {
      // Fallback: If no history > 30 days, deduce past state based on releaseDateVal
      if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') {
        if (p.releaseDateVal && p.releaseDateVal <= thirtyDaysAgo) {
          prevU += currentUnits;
        } else if (p.releaseDateVal && p.releaseDateVal > thirtyDaysAgo) {
          prevOb++;
          if (p.releaseDateVal <= fifteenDays) prevPipe++;
        }
      } else if (p.projectStatus === 'Onboarding') {
        prevOb++;
        if (p.releaseDateVal && p.releaseDateVal <= fifteenDays) prevPipe++;
      }
    }
  });

  return {
    onboardingCount: ob,
    prevOnboardingCount: prevOb,
    pipelineCount: pipe,
    prevPipelineCount: prevPipe,
    riskCount: r,
    prevRiskCount: prevR,
    liveUnits: units,
    prevLiveUnits: prevU,
  };
}

export function getBaseProjects(mappedProjects: Project[], activeTab: string): Project[] {
  const today = new Date().getTime();
  const fortyFiveDays = today + 45 * 86400000;

  return mappedProjects.filter((p) => {
    if (activeTab === 'Actively Onboarding') {
      return (
        p.projectStatus === 'Onboarding' && !!p.releaseDateVal && p.releaseDateVal <= fortyFiveDays
      );
    }
    if (activeTab === 'Upcoming (> 45 Days)') {
      return (
        p.projectStatus === 'Onboarding' && p.releaseDateVal && p.releaseDateVal > fortyFiveDays
      );
    }
    if (activeTab === 'No Due Date') {
      return p.projectStatus === 'Onboarding' && !p.releaseDateVal;
    }
    if (activeTab === 'All Onboarding') {
      return p.projectStatus === 'Onboarding';
    }
    if (activeTab === 'All Released') {
      return p.projectStatus === 'Active' || p.projectStatus === 'Closed';
    }
    if (activeTab === 'Suspended') {
      return p.projectStatus === 'Suspended';
    }
    // All Projects
    return true;
  });
}

export function getFilteredProjects(
  baseProjects: Project[],
  filters: {
    statusFilter: string[];
    nameFilter: string[];
    clientFilter: string[];
    managerFilter: string[];
    timelineFilter: string[];
    phaseFilter: string[];
    healthFilter: string[];
    featuresFilter: string[];
    releaseDateFilter: { start: string; end: string } | 'no-date' | null;
    searchTerm: string;
  },
  sortConfig: {
    sortCol: string;
    sortAsc: boolean;
  },
  settings: Settings | null
): Project[] {
  const {
    statusFilter,
    nameFilter,
    clientFilter,
    managerFilter,
    timelineFilter,
    phaseFilter,
    healthFilter,
    featuresFilter,
    releaseDateFilter,
    searchTerm,
  } = filters;
  const { sortCol, sortAsc } = sortConfig;

  let filtered = [...baseProjects];

  // Column Filters
  if (statusFilter.length > 0) {
    filtered = filtered.filter((p) => statusFilter.includes(p.projectStatus || 'Not Set'));
  }
  if (nameFilter.length > 0) {
    filtered = filtered.filter((p) => nameFilter.includes(p.name || 'Unnamed Project'));
  }
  if (clientFilter.length > 0) {
    filtered = filtered.filter((p) => p.clients?.some((c: string) => clientFilter.includes(c)));
  }
  if (managerFilter.length > 0) {
    filtered = filtered.filter((p) => managerFilter.includes(p.assignee || 'Unassigned'));
  }
  if (timelineFilter.length > 0) {
    filtered = filtered.filter((p) => timelineFilter.includes(p.timelineStatus || 'Not Set'));
  }
  if (phaseFilter.length > 0) {
    filtered = filtered.filter((p) => phaseFilter.includes(p.onboardingPhase || 'Not Set'));
  }

  if (healthFilter.length > 0) {
    const thresholds = settings?.scoring?.thresholds || { healthy: 80, warning: 50 };
    filtered = filtered.filter((p) => {
      const score = p.healthScore;
      const isHealthy = typeof score === 'number' && score >= thresholds.healthy;
      const isWarning =
        typeof score === 'number' && score >= thresholds.warning && score < thresholds.healthy;
      const isAtRisk = typeof score === 'number' && score < thresholds.warning;
      return healthFilter.some((hf) => {
        if (hf === 'Healthy') return isHealthy;
        if (hf === 'Warning') return isWarning;
        if (hf === 'At Risk') return isAtRisk;
        return false;
      });
    });
  }

  if (featuresFilter.length > 0) {
    filtered = filtered.filter(
      (p) => p.features && p.features.some((f: string) => featuresFilter.includes(f))
    );
  }

  if (releaseDateFilter) {
    if (releaseDateFilter === 'no-date') {
      filtered = filtered.filter((p) => !p.releaseDateVal);
    } else {
      const startStr = releaseDateFilter.start;
      const endStr = releaseDateFilter.end;

      // To compare dates simply, since releaseDateVal is a timestamp and start/end are "YYYY-MM"
      let startMs = 0;
      let endMs = Infinity;
      if (startStr) {
        const d = new Date(startStr + '-01T00:00:00');
        startMs = d.getTime();
      }
      if (endStr) {
        // To get end of month, go to next month day 0
        const [y, m] = endStr.split('-');
        const d = new Date(Number(y), Number(m), 0, 23, 59, 59, 999);
        endMs = d.getTime();
      }

      filtered = filtered.filter((p) => {
        if (!p.releaseDateVal) return false;
        return p.releaseDateVal >= startMs && p.releaseDateVal <= endMs;
      });
    }
  }

  // Search Filter
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(lower) ||
        (p.assignee || '').toLowerCase().includes(lower) ||
        (p.clients?.join(', ') || '').toLowerCase().includes(lower)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let valA: any = a[sortCol as keyof typeof a];
    let valB: any = b[sortCol as keyof typeof b];

    if (sortCol === 'clients') {
      valA = a.clients?.join(', ') || '';
      valB = b.clients?.join(', ') || '';
    }
    if (sortCol === 'developers') {
      valA = a.developers?.join(', ') || '';
      valB = b.developers?.join(', ') || '';
    }
    if (sortCol === 'salesMarketingClients') {
      valA = a.salesMarketingClients?.join(', ') || '';
      valB = b.salesMarketingClients?.join(', ') || '';
    }

    // Normalize missing dates to 0 for consistent falsy checks
    if (sortCol === 'releaseDateVal') {
      valA = valA || 0;
      valB = valB || 0;
    }

    if (valA === valB) {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
    }

    if (sortCol === 'releaseDateVal') {
      if (!valA) return 1;
      if (!valB) return -1;
    } else {
      if (valA === null || valA === undefined || valA === '') return 1;
      if (valB === null || valB === undefined || valB === '') return -1;
    }

    if (typeof valA === 'string') {
      if (sortAsc) {
        return valA > (valB as string) ? 1 : valA < (valB as string) ? -1 : 0;
      } else {
        return (valB as string) > valA ? 1 : (valB as string) < valA ? -1 : 0;
      }
    }
    return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
  });

  return filtered;
}
