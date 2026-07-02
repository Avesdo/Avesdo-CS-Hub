import { Service, Settings } from '../types';

export function getFilteredServices(
  services: Service[],
  activeTab: string,
  nameFilter: string[],
  projectFilter: string[],
  clientFilter: string[],
  typeFilter: string[],
  managerFilter: string[],
  statusFilter: string[],
  dateRange: { start: string; end: string } | null
): Service[] {
  return services.filter((s) => {
    if (activeTab === 'Pending' && s.status !== 'Proposal Sent') return false;
    if (activeTab === 'Won' && s.outcome !== 'Won') return false;
    if (activeTab === 'Lost' && s.outcome !== 'Lost') return false;
    if (activeTab === 'Additional' && s.type !== 'Additional') return false;
    if (activeTab === 'Included' && s.type !== 'Included') return false;

    if (nameFilter.length > 0 && !nameFilter.includes(s.name || 'Unnamed')) return false;
    if (projectFilter.length > 0) {
      const pNames = s.projectName?.split(', ').filter(Boolean) || ['None'];
      if (!pNames.some((n: string) => projectFilter.includes(n))) return false;
    }
    if (clientFilter.length > 0 && !clientFilter.includes(s.clientName || s.clients?.[0] || 'None'))
      return false;
    if (typeFilter.length > 0 && !typeFilter.includes(s.type || 'None')) return false;
    if (managerFilter.length > 0) {
      const mNames = s.managers?.length ? s.managers : [s.manager || 'Unassigned'];
      if (!mNames.some((m: string) => managerFilter.includes(m))) return false;
    }
    if (statusFilter.length > 0 && !statusFilter.includes(s.status || 'None')) return false;

    if (dateRange && s.dateVal) {
      const sDate = new Date(s.dateVal);
      if (dateRange.start) {
        const start = new Date(dateRange.start);
        if (sDate < start) return false;
      }
      if (dateRange.end) {
        const end = new Date(dateRange.end);
        end.setMonth(end.getMonth() + 1); // include the end month
        if (sDate >= end) return false;
      }
    } else if (dateRange && !s.dateVal) {
      return false;
    }

    return true;
  });
}

export function getServiceKpiData(services: Service[]) {
  let revWonThisYear = 0;
  let revWonLastYear = 0;
  let revWonThisQuarter = 0;
  let revWonLastQuarter = 0;
  let totalServicesRev = 0;
  let totalCommissionThisYear = 0;
  let totalCommissionLastYear = 0;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
  const lastQuarterYear = currentQuarter === 0 ? currentYear - 1 : currentYear;

  const pytdLimit = new Date(
    currentYear - 1,
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  ).getTime();

  // Calculate the equivalent date in the previous quarter
  const monthInQuarter = today.getMonth() % 3;
  const pqtdLimit = new Date(
    lastQuarterYear,
    lastQuarter * 3 + monthInQuarter,
    today.getDate(),
    23,
    59,
    59
  ).getTime();

  services.forEach((s) => {
    if (s.outcome === 'Won') {
      const p = parseFloat(s.price?.toString().replace(/[^0-9.-]+/g, '')) || 0;
      const c = parseFloat(s.commission?.toString().replace(/[^0-9.-]+/g, '')) || 0;

      totalServicesRev += p;

      const timestamp = s.dateVal || (s.dateInput ? new Date(s.dateInput).getTime() : 0);

      if (timestamp) {
        const sDate = new Date(timestamp);
        const sYear = sDate.getFullYear();
        const sQuarter = Math.floor(sDate.getMonth() / 3);

        if (sYear === currentYear) {
          revWonThisYear += p;
          totalCommissionThisYear += c;
        } else if (sYear === currentYear - 1 && timestamp <= pytdLimit) {
          revWonLastYear += p;
          totalCommissionLastYear += c;
        }

        if (sYear === currentYear && sQuarter === currentQuarter) {
          revWonThisQuarter += p;
        } else if (
          sYear === lastQuarterYear &&
          sQuarter === lastQuarter &&
          timestamp <= pqtdLimit
        ) {
          revWonLastQuarter += p;
        }
      }
    }
  });

  return {
    revWonThisYear,
    revWonLastYear,
    revWonThisQuarter,
    revWonLastQuarter,
    totalServicesRev,
    totalCommissionThisYear,
    totalCommissionLastYear,
  };
}

export function getAllServiceNames(services: Service[]): string[] {
  return Array.from(new Set(services.map((s) => s.name || 'Unnamed'))).sort();
}

export function getAllServiceProjects(services: Service[]): string[] {
  return Array.from(new Set(services.map((s) => s.projectName || 'None'))).sort();
}

export function getAllServiceClients(services: Service[]): string[] {
  return Array.from(new Set(services.map((s) => s.clientName || s.clients?.[0] || 'None'))).sort();
}

export function getAllServiceTypes(settings: Settings | null): string[] {
  return settings?.serviceTypes?.map((t: any) => t.name) || [];
}

export function getAllServiceManagers(services: Service[], settings: Settings | null): string[] {
  const managers = new Set<string>();
  services?.forEach((s) => {
    if (s.managers && s.managers.length > 0) {
      s.managers.forEach((m: string) => managers.add(m));
    } else if (s.manager) {
      managers.add(s.manager);
    }
  });
  const managerOrder = settings?.managers?.map((m: any) => m.name) || [];
  return Array.from(managers).sort((a, b) => {
    const idxA = managerOrder.indexOf(a);
    const idxB = managerOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function getAllServiceStatuses(settings: Settings | null): string[] {
  return (
    settings?.serviceStatuses?.map((s: any) => s.name) || [
      'Proposal Sent',
      'Accepted',
      'Awaiting Inputs',
      'In Progress',
      'Completed',
      'Not Accepted',
    ]
  );
}
