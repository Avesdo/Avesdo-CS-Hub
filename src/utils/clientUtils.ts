import { Client, Project, Settings } from '../types';

export interface EnhancedClient extends Client {
  cProjects: Project[];
  activeProjectsCount: number;
  onboardingProjectsCount: number;
  closedProjectsCount: number;
  trendData: number[];
  computedStatus: string;
}

export function getClientComputedStatus(c: Client, projects: Project[]): string {
  if (c.statusOverride) return c.statusOverride;

  const cProjects = projects.filter((p) => (p.clients || []).includes(c.companyName || ''));
  const activeProjectsCount = cProjects.filter(
    (p) => p.projectStatus === 'Active' || p.projectStatus === 'Suspended'
  ).length;
  const onboardingProjectsCount = cProjects.filter((p) => p.projectStatus === 'Onboarding').length;
  const closedProjectsCount = cProjects.filter(
    (p) => p.projectStatus === 'Closed' || p.projectStatus === 'Completed'
  ).length;
  const lostProjectsCount = cProjects.filter(
    (p) =>
      p.projectStatus === 'Cancelled' || p.projectStatus === 'Churned' || p.projectStatus === 'Lost'
  ).length;

  if (
    activeProjectsCount > 0 ||
    onboardingProjectsCount > 0 ||
    cProjects.some((p) => p.projectStatus === 'Pre-launch')
  ) {
    return 'Active';
  } else if (lostProjectsCount > 0 && closedProjectsCount === 0 && cProjects.length > 0) {
    return 'Lost';
  } else if (cProjects.length > 0) {
    return 'Inactive';
  }
  return 'Inactive';
}

import { calculateClientHealth } from './scoringUtils';

export function getEnhancedClients(
  clients: Client[],
  projects: Project[],
  healthHistory: Record<string, any[]>,
  settings: Settings | null
): EnhancedClient[] {
  const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
  return clients.map((c) => {
    const cProjects = projects.filter((p) => (p.clients || []).includes(c.companyName || ''));
    const activeProjectsCount = cProjects.filter(
      (p) => p.projectStatus === 'Active' || p.projectStatus === 'Suspended'
    ).length;
    const onboardingProjectsCount = cProjects.filter(
      (p) => p.projectStatus === 'Onboarding'
    ).length;
    const closedProjectsCount = cProjects.filter(
      (p) => p.projectStatus === 'Closed' || p.projectStatus === 'Completed'
    ).length;

    const lostProjectsCount = cProjects.filter(
      (p) =>
        p.projectStatus === 'Cancelled' ||
        p.projectStatus === 'Churned' ||
        p.projectStatus === 'Lost'
    ).length;

    const computedStatus = getClientComputedStatus(c, projects);

    const hist = healthHistory[c.clientId] || [];
    const sortedHist = [...hist]
      .filter((x: any) => x.timeVal >= thirtyDaysAgo)
      .sort((a: any, b: any) => a.timeVal - b.timeVal);

    const healthRes = calculateClientHealth(c, cProjects, settings);
    const healthScore = healthRes.totalScore;

    const trendData = sortedHist.map((h: any) => h.score);
    if (typeof healthScore === 'number') {
      trendData.push(healthScore);
    }
    if (trendData.length === 1 && typeof healthScore === 'number') {
      trendData.unshift(healthScore);
    }

    return {
      ...c,
      cProjects,
      activeProjectsCount,
      onboardingProjectsCount,
      closedProjectsCount,
      trendData,
      computedStatus,
      healthScore,
    };
  });
}

export function getClientKpis(
  enhancedClients: EnhancedClient[],
  settings: Settings | null,
  healthHistory: Record<string, any[]>
) {
  const thresholds = settings?.scoring?.thresholds || { healthy: 80, warning: 50 };
  let atRisk = 0,
    warning = 0,
    healthy = 0,
    active = 0;
  let prevAtRisk = 0,
    prevWarning = 0,
    prevHealthy = 0,
    prevActive = 0;
  const thirtyDaysAgo = new Date().getTime() - 30 * 86400000;

  enhancedClients.forEach((c) => {
    if (c.activeProjectsCount > 0) {
      active++;
    }

    let clientWasActive = false;
    for (const p of c.cProjects) {
      const hist = p.history || [];
      const olderThan30 = hist
        .filter((x: any) => x.timeVal <= thirtyDaysAgo)
        .sort((a: any, b: any) => b.timeVal - a.timeVal);
      if (olderThan30.length > 0) {
        const snap = olderThan30[0];
        if (snap.status === 'Active' || snap.status === 'Suspended') {
          clientWasActive = true;
          break;
        }
      } else {
        if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') {
          if (p.releaseDateVal && p.releaseDateVal <= thirtyDaysAgo) {
            clientWasActive = true;
            break;
          }
        }
      }
    }
    if (clientWasActive) prevActive++;

    if (typeof c.healthScore === 'number') {
      if (c.healthScore >= thresholds.healthy) healthy++;
      else if (c.healthScore >= thresholds.warning) warning++;
      else atRisk++;

      const hist = healthHistory[c.clientId] || [];
      const olderThan30 = hist
        .filter((x: any) => x.timeVal <= thirtyDaysAgo)
        .sort((a: any, b: any) => b.timeVal - a.timeVal);
      let pastScore = c.healthScore;

      if (olderThan30.length > 0) {
        pastScore = olderThan30[0].score;
      } else if (hist.length > 0) {
        const earliest = [...hist].sort((a: any, b: any) => a.timeVal - b.timeVal);
        pastScore = earliest[0].score;
      }

      if (pastScore >= thresholds.healthy) prevHealthy++;
      else if (pastScore >= thresholds.warning) prevWarning++;
      else prevAtRisk++;
    }
  });

  return {
    atRisk,
    warning,
    healthy,
    active,
    prevAtRisk,
    prevWarning,
    prevHealthy,
    prevActive,
  };
}

export function getFilteredClients(
  enhancedClients: EnhancedClient[],
  settings: Settings | null,
  activeTab: string,
  globalSearch: string,
  nameFilter: string[],
  typeFilter: string[],
  healthFilter: string[],
  projectFilter: string[],
  managerFilter: string[],
  statusFilter: string[] = []
): EnhancedClient[] {
  const thresholds = settings?.scoring?.thresholds || { healthy: 80, warning: 50 };

  return enhancedClients.filter((c) => {
    // Global Search Filter
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      const matchesName = c.companyName?.toLowerCase().includes(term);
      const matchesType = ((c as any).clientType || '').toLowerCase().includes(term);
      const matchesManager = (c.accountManager || '').toLowerCase().includes(term);
      if (!matchesName && !matchesType && !matchesManager) return false;
    }

    // Tab Filter
    const score = c.healthScore;
    const isHealthy = typeof score === 'number' && score >= thresholds.healthy;
    const isWarning =
      typeof score === 'number' && score >= thresholds.warning && score < thresholds.healthy;
    const isAtRisk = typeof score === 'number' && score < thresholds.warning;

    if (activeTab === 'Active' && c.activeProjectsCount === 0) return false;
    if (activeTab === 'Healthy' && !isHealthy) return false;
    if (activeTab === 'Warning' && !isWarning) return false;
    if (activeTab === 'At Risk' && !isAtRisk) return false;

    // Column Multi-select Filters
    if (nameFilter.length > 0 && !nameFilter.includes(c.companyName || 'Unnamed')) return false;

    const cType = (c as any).clientType || 'Unassigned';
    if (typeFilter.length > 0 && !typeFilter.includes(cType)) return false;

    const cManager = c.accountManager || 'Unassigned';
    if (managerFilter.length > 0 && !managerFilter.includes(cManager)) return false;

    if (healthFilter.length > 0) {
      const matchesHealth = healthFilter.some((hf) => {
        if (hf === 'Healthy') return isHealthy;
        if (hf === 'Warning') return isWarning;
        if (hf === 'At Risk') return isAtRisk;
        return false;
      });
      if (!matchesHealth) return false;
    }

    if (projectFilter.length > 0) {
      const hasActive = c.activeProjectsCount > 0;
      const hasOnboarding = c.onboardingProjectsCount > 0;
      const hasClosed = c.closedProjectsCount > 0;

      const matchesProjectFilter = projectFilter.some((pf) => {
        if (pf === 'Active') return hasActive;
        if (pf === 'Onboarding') return hasOnboarding;
        if (pf === 'Closed') return hasClosed;
        return false;
      });
      if (!matchesProjectFilter) return false;
    }

    if (statusFilter && statusFilter.length > 0) {
      if (!statusFilter.includes(c.computedStatus)) return false;
    }

    return true;
  });
}

export function getSortedClients(
  filteredClients: EnhancedClient[],
  sortCol: string,
  sortAsc: boolean
): EnhancedClient[] {
  return [...filteredClients].sort((a, b) => {
    let valA: any = 0;
    let valB: any = 0;

    if (sortCol === 'companyName') {
      valA = (a.companyName || '').toLowerCase();
      valB = (b.companyName || '').toLowerCase();
    } else if (sortCol === 'type') {
      valA = ((a as any).clientType || '').toLowerCase();
      valB = ((b as any).clientType || '').toLowerCase();
    } else if (sortCol === 'healthScore') {
      valA = typeof a.healthScore === 'number' ? a.healthScore : 999;
      valB = typeof b.healthScore === 'number' ? b.healthScore : 999;
    } else if (sortCol === 'projectCount') {
      valA = a.activeProjectsCount || 0;
      valB = b.activeProjectsCount || 0;
    } else if (sortCol === 'manager') {
      valA = (a.accountManager || '').toLowerCase();
      valB = (b.accountManager || '').toLowerCase();
    } else if (sortCol === 'status') {
      valA = (a.computedStatus || '').toLowerCase();
      valB = (b.computedStatus || '').toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    const nameA = (a.companyName || '').toLowerCase();
    const nameB = (b.companyName || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

export function getAllCompanyNames(clients: Client[]): string[] {
  return Array.from(new Set(clients.map((c) => c.companyName || 'Unnamed'))).sort();
}

export function getAllClientTypes(clients: Client[], settings: Settings | null): string[] {
  const types = new Set<string>();
  clients?.forEach((c) => {
    if ((c as any).clientType) types.add((c as any).clientType);
  });
  const typeOrder = settings?.clientTypes?.map((t) => t.name) || [];
  return Array.from(types).sort((a, b) => {
    const idxA = typeOrder.indexOf(a);
    const idxB = typeOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function getAllManagers(clients: Client[], settings: Settings | null): string[] {
  const managers = new Set<string>();
  clients?.forEach((c) => {
    if (c.accountManager) managers.add(c.accountManager);
  });
  const managerOrder = settings?.managers?.map((m) => m.name) || [];
  return Array.from(managers).sort((a, b) => {
    const idxA = managerOrder.indexOf(a);
    const idxB = managerOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}
