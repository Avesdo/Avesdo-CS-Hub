import { SupportTicket } from '../store/useSupportStore';
import {
  format,
  subDays,
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  differenceInDays,
  getDay,
  getHours,
} from 'date-fns';

const parseDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    // Convert from EST to PST by subtracting 3 hours
    d.setHours(d.getHours() - 3);
    return d;
  } catch {
    return null;
  }
};

const CHART_THEME = {
  blue: '#00bdd9',
  purple: '#8b5cf6',
  orange: '#f59e0b',
  green: '#10b981',
  grey: '#64748b',
  teal: '#14b8a6',
};

const CATEGORIES = [
  'All Categories',
  'Onboarding',
  'Maintenance',
  'Services',
  'Product',
  'Internal',
];

export function getBaseTickets(
  tickets: SupportTicket[],
  dateRange: string,
  customStartDate: string | number | null,
  customEndDate: string | number | null
) {
  if (!tickets || tickets.length === 0) return { currentPeriodBase: [], previousPeriodBase: [] };

  const now = new Date();
  let start = new Date(0);
  let end = new Date(now);
  let prevStart = new Date(0);
  let prevEnd = new Date(0);

  if (dateRange === '7d') {
    start = subDays(startOfDay(now), 6);
    end = now;
    prevEnd = subDays(start, 1);
    prevEnd.setHours(23, 59, 59, 999);
    prevStart = subDays(startOfDay(prevEnd), 6);
  } else if (dateRange === 'thisMonth') {
    start = startOfMonth(now);
    end = now;
    prevStart = startOfMonth(subMonths(now, 1));
    prevEnd = endOfMonth(subMonths(now, 1));
    prevEnd.setHours(23, 59, 59, 999);
  } else if (dateRange === 'lastMonth') {
    start = startOfMonth(subMonths(now, 1));
    end = endOfMonth(subMonths(now, 1));
    end.setHours(23, 59, 59, 999);
    prevStart = startOfMonth(subMonths(now, 2));
    prevEnd = endOfMonth(subMonths(now, 2));
    prevEnd.setHours(23, 59, 59, 999);
  } else if (dateRange === 'thisQuarter') {
    start = startOfQuarter(now);
    end = now;
    prevStart = startOfQuarter(subQuarters(now, 1));
    prevEnd = endOfQuarter(subQuarters(now, 1));
    prevEnd.setHours(23, 59, 59, 999);
  } else if (dateRange === 'lastQuarter') {
    start = startOfQuarter(subQuarters(now, 1));
    end = endOfQuarter(subQuarters(now, 1));
    end.setHours(23, 59, 59, 999);
    prevStart = startOfQuarter(subQuarters(now, 2));
    prevEnd = endOfQuarter(subQuarters(now, 2));
    prevEnd.setHours(23, 59, 59, 999);
  } else if (dateRange === 'ytd') {
    start = new Date(now.getFullYear(), 0, 1);
    end = now;
    prevStart = new Date(now.getFullYear() - 1, 0, 1);
    prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  } else if (dateRange === 'all') {
    start = new Date(0);
    end = now;
    prevStart = new Date(0);
    prevEnd = new Date(0);
  } else if (dateRange === 'custom') {
    start = customStartDate ? startOfDay(new Date(customStartDate)) : new Date(0);
    const customEnd = customEndDate ? startOfDay(new Date(customEndDate)) : new Date();
    end = new Date(customEnd.getTime() + 86400000 - 1);
    const duration = end.getTime() - start.getTime() + 1;
    prevStart = new Date(start.getTime() - duration);
    prevEnd = new Date(start.getTime() - 1);
  }

  const currentPeriodBase = tickets.filter((t) => {
    const created = parseDate(t['Created At']);
    return created && created >= start && created <= end;
  });

  const previousPeriodBase = tickets.filter((t) => {
    const created = parseDate(t['Created At']);
    return created && dateRange !== 'all' && created >= prevStart && created <= prevEnd;
  });

  return { currentPeriodBase, previousPeriodBase };
}

export function getFilteredTicketsData(
  currentPeriodBase: SupportTicket[],
  previousPeriodBase: SupportTicket[],
  selectedCategory: string,
  managerFilter: string,
  projectFilter: string
) {
  if (!currentPeriodBase || currentPeriodBase.length === 0) {
    return {
      filteredTickets: [],
      prevTickets: [],
      availableCategories: CATEGORIES,
      availableManagers: ['All Agents'],
      allProjects: ['All Projects'],
    };
  }

  const catSet = new Set<string>();
  const mgrSet = new Set<string>();
  const projSet = new Set<string>();

  currentPeriodBase.forEach((t) => {
    const cat = t['Ticket Category'] || 'Uncategorized';
    const mgr = t['Assigned Agent Name']?.split(' ')[0] || 'Unknown';
    const tagsString = (t['Ticket Tags'] || '').toLowerCase();

    // Check matches for the *other* filters
    const matchesManager = managerFilter === 'All Agents' || mgr === managerFilter;
    const matchesProject =
      projectFilter === 'All Projects' || tagsString.includes(projectFilter.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || cat === selectedCategory;

    if (matchesManager && matchesProject && cat.toLowerCase() !== 'calls') catSet.add(cat);
    if (matchesCategory && matchesProject && cat.toLowerCase() !== 'calls' && mgr !== 'Unknown')
      mgrSet.add(mgr);
    if (matchesCategory && matchesManager && cat.toLowerCase() !== 'calls') {
      const tags = (t['Ticket Tags'] || '').split(/[;,]/).map((p) => p.trim());
      tags.forEach((p) => {
        const lower = p.toLowerCase();
        if (lower && lower !== 'no project' && lower !== 'unknown project' && lower !== 'unknown') {
          projSet.add(p);
        }
      });
    }
  });

  const filterBySettings = (period: SupportTicket[]) =>
    period.filter((t) => {
      const cat = t['Ticket Category'] || '';
      const tags = (t['Ticket Tags'] || '').toLowerCase();

      const matchesCategory = selectedCategory === 'All Categories' || cat === selectedCategory;
      const matchesAgent =
        managerFilter === 'All Agents' ||
        t['Assigned Agent Name']?.startsWith(managerFilter.split(' ')[0]);
      const matchesProject =
        projectFilter === 'All Projects' || tags.includes(projectFilter.toLowerCase());

      return cat.toLowerCase() !== 'calls' && matchesCategory && matchesAgent && matchesProject;
    });

  return {
    filteredTickets: filterBySettings(currentPeriodBase),
    prevTickets: filterBySettings(previousPeriodBase),
    availableCategories: ['All Categories', ...Array.from(catSet).sort()],
    availableManagers: ['All Agents', ...Array.from(mgrSet).sort()],
    allProjects: ['All Projects', ...Array.from(projSet).sort()],
  };
}

export function calculateKPIs(filteredTickets: SupportTicket[], prevTickets: SupportTicket[]) {
  const calcKpis = (data: any[]) => {
    const resolved = data.filter(
      (t: any) =>
        t['Ticket Status']?.toLowerCase() === 'closed' ||
        t['Ticket Status']?.toLowerCase() === 'solved'
    );

    const resolutionTimes = resolved
      .filter((t: any) => t['Last Closed At'] && t['Created At'])
      .map((t: any) => {
        const closedAt = parseDate(t['Last Closed At']);
        const createdAt = parseDate(t['Created At']);
        if (!closedAt || !createdAt) return 0;
        const diff = closedAt.getTime() - createdAt.getTime();
        return diff / (1000 * 60 * 60);
      });

    const firstResponses = data
      .filter((t: any) => typeof t['First Response Time (Minutes)'] === 'number')
      .map((t: any) => t['First Response Time (Minutes)']);

    return {
      totalVolume: data.length,
      avgResolution: resolutionTimes.length
        ? (
            resolutionTimes.reduce((a: number, b: number) => a + b, 0) / resolutionTimes.length
          ).toFixed(1)
        : '0',
      oneTouchPct: resolved.length
        ? (
            (resolved.filter((t: any) => t['Number of Agent Replies'] === 1).length /
              resolved.length) *
            100
          ).toFixed(0)
        : '0',
      firstResponse: firstResponses.length
        ? (
            firstResponses.reduce((a: number, b: number) => a + b, 0) / firstResponses.length
          ).toFixed(0)
        : '0',
    };
  };

  const current = calcKpis(filteredTickets);
  const prev = calcKpis(prevTickets);
  const getTrend = (curr: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

  return {
    totalVolume: {
      value: current.totalVolume,
      trend: getTrend(current.totalVolume, prev.totalVolume),
    },
    resolution: {
      value: current.avgResolution,
      trend: getTrend(Number(current.avgResolution), Number(prev.avgResolution)) * -1,
    },
    oneTouch: {
      value: current.oneTouchPct,
      trend: getTrend(Number(current.oneTouchPct), Number(prev.oneTouchPct)),
    },
    firstResponse: {
      value: current.firstResponse,
      trend: getTrend(Number(current.firstResponse), Number(prev.firstResponse)) * -1,
    },
  };
}

export function getChartData(
  filteredTickets: SupportTicket[],
  prevTickets: SupportTicket[],
  dateRange: string,
  customStartDate: string | number | null,
  customEndDate: string | number | null,
  managerFilter: string,
  workloadSortBy: 'volume' | 'time'
) {
  const CATEGORY_COLORS = [
    CHART_THEME.blue,
    CHART_THEME.purple,
    CHART_THEME.orange,
    CHART_THEME.grey,
    CHART_THEME.green,
    CHART_THEME.teal,
  ];

  const trendMap = new Map<
    string,
    {
      date: string;
      tickets: number;
      prevTickets: number;
      totalResolutionTime: number;
      resolvedTickets: number;
      sortVal: number;
    }
  >();

  const getGroupKey = (d: Date) => {
    if (dateRange === '7d') {
      return format(d, 'EEE'); // Mon, Tue
    } else if (
      dateRange === 'thisMonth' ||
      dateRange === 'lastMonth' ||
      dateRange === 'thisQuarter' ||
      dateRange === 'lastQuarter'
    ) {
      return `Week of ${format(startOfWeek(d, { weekStartsOn: 1 }), 'MMM d')}`;
    } else if (dateRange === 'ytd' || dateRange === 'all') {
      return format(startOfMonth(d), 'MMM yy');
    } else if (dateRange === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : new Date(0);
      const end = customEndDate ? new Date(customEndDate) : new Date();
      const diff = differenceInDays(end, start);
      if (diff <= 7) return format(d, 'EEE');
      if (diff <= 90) return `Week of ${format(startOfWeek(d, { weekStartsOn: 1 }), 'MMM d')}`;
      return format(startOfMonth(d), 'MMM yy');
    }
    return format(d, 'MMM d');
  };

  filteredTickets.forEach((t) => {
    const created = parseDate(t['Created At']);
    if (created) {
      const dateKey = getGroupKey(created);
      if (!trendMap.has(dateKey))
        trendMap.set(dateKey, {
          date: dateKey,
          tickets: 0,
          prevTickets: 0,
          totalResolutionTime: 0,
          resolvedTickets: 0,
          sortVal: created.getTime(),
        });
      const entry = trendMap.get(dateKey)!;
      entry.tickets += 1;
      const isResolved =
        t['Ticket Status']?.toLowerCase() === 'closed' ||
        t['Ticket Status']?.toLowerCase() === 'solved';

      if (isResolved && t['Last Closed At']) {
        const closed = parseDate(t['Last Closed At']);
        if (closed && created) {
          const resolutionTimeSec = (closed.getTime() - created.getTime()) / 1000;
          if (resolutionTimeSec > 0) {
            entry.totalResolutionTime += resolutionTimeSec / 3600;
            entry.resolvedTickets += 1;
          }
        }
      }
    }
  });
  prevTickets.forEach((t) => {
    const created = parseDate(t['Created At']);
    if (created) {
      const periodMs =
        filteredTickets.length && prevTickets.length
          ? (parseDate(filteredTickets[0]['Created At'])?.getTime() || 0) -
            (parseDate(prevTickets[0]['Created At'])?.getTime() || 0)
          : 0;
      const shiftedDate = new Date(created.getTime() + periodMs);
      const dateKey = getGroupKey(shiftedDate);
      if (trendMap.has(dateKey)) trendMap.get(dateKey)!.prevTickets += 1;
    }
  });
  const trendData = Array.from(trendMap.values())
    .map((entry) => ({
      ...entry,
      avgResolution:
        entry.resolvedTickets > 0
          ? Number((entry.totalResolutionTime / entry.resolvedTickets).toFixed(1))
          : 0,
    }))
    .sort((a, b) => a.sortVal - b.sortVal);

  const assigneeMap = new Map<string, { name: string; tickets: number; timeSpent: number }>();
  filteredTickets.forEach((t) => {
    const assignee = t['Assigned Agent Name'] || 'Unassigned';
    if (!assigneeMap.has(assignee))
      assigneeMap.set(assignee, { name: assignee, tickets: 0, timeSpent: 0 });
    assigneeMap.get(assignee)!.tickets += 1;
    assigneeMap.get(assignee)!.timeSpent += (t['Time Spent (seconds)'] || 0) / 3600;
  });
  const assigneeData = Array.from(assigneeMap.values())
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 10);

  const catMap = new Map<string, number>();
  filteredTickets.forEach((t) => {
    const cat = t['Ticket Category'] || 'Uncategorized';
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  });
  const categoryData = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const catClassMap = new Map<string, Map<string, number>>();
  filteredTickets.forEach((t) => {
    const cat = t['Ticket Category'] || 'Uncategorized';
    const classification =
      t['Onboarding Classification'] ||
      t['Maintenance Classification'] ||
      t['Product Classification'] ||
      t['Internal Classification'] ||
      t['Services Classification'] ||
      'None';
    if (!catClassMap.has(cat)) catClassMap.set(cat, new Map());
    catClassMap.get(cat)!.set(classification, (catClassMap.get(cat)!.get(classification) || 0) + 1);
  });
  const classificationGrids = Array.from(catClassMap.entries()).map(([cat, classMap]) => ({
    category: cat,
    data: Array.from(classMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
  }));

  const projMap = new Map<string, { name: string; total: number; [key: string]: any }>();
  const allCategories = new Set<string>();
  const allClassifications = new Set<string>();

  filteredTickets.forEach((t) => {
    const rawProjects = t['Ticket Tags'] || '';
    const projects = rawProjects
      .split(',')
      .map((p) => p.trim())
      .filter((p) => {
        const lower = p.toLowerCase();
        return (
          lower && lower !== 'no project' && lower !== 'unknown project' && lower !== 'unknown'
        );
      });

    const cat = t['Ticket Category'] || 'Uncategorized';
    const classification =
      t['Onboarding Classification'] ||
      t['Maintenance Classification'] ||
      t['Product Classification'] ||
      t['Internal Classification'] ||
      t['Services Classification'] ||
      'None';

    allCategories.add(cat);
    allClassifications.add(classification);

    projects.forEach((project) => {
      if (!projMap.has(project)) projMap.set(project, { name: project, total: 0 });
      const p = projMap.get(project)!;
      p.total++;
      p[`cat_${cat}`] = (p[`cat_${cat}`] || 0) + 1;
      p[`class_${classification}`] = (p[`class_${classification}`] || 0) + 1;
    });
  });
  const projectData = Array.from(projMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const contactMap = new Map<string, { name: string; total: number; [key: string]: any }>();
  filteredTickets.forEach((t) => {
    const contact = (t['Contact Name'] || t['Contact Email'] || '').trim();
    if (!contact) return;
    const lowerContact = contact.toLowerCase();
    if (
      lowerContact === 'unknown contact' ||
      lowerContact === 'unknown' ||
      lowerContact === 'no contact' ||
      lowerContact === 'none'
    )
      return;

    const cat = t['Ticket Category'] || 'Uncategorized';

    if (!contactMap.has(contact)) contactMap.set(contact, { name: contact, total: 0 });
    const c = contactMap.get(contact)!;
    c.total++;
    c[`cat_${cat}`] = (c[`cat_${cat}`] || 0) + 1;
  });
  const contactData = Array.from(contactMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const categoryKeys = Array.from(allCategories)
    .sort((a, b) => {
      const aIndex = CATEGORIES.indexOf(a);
      const bIndex = CATEGORIES.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    })
    .map((c) => `cat_${c}`);
  const classificationKeys = Array.from(allClassifications).map((c) => `class_${c}`);

  const heatmapMatrix = Array.from({ length: 7 }, () => Array(24).fill(0));
  let minDate = Infinity;
  let maxDate = -Infinity;

  filteredTickets.forEach((t) => {
    const created = parseDate(t['Created At']);
    if (created) {
      const time = created.getTime();
      // Ignore Unix epoch fallback dates (e.g. 1970) which destroy the weekly average denominator
      if (time > new Date('2015-01-01').getTime()) {
        if (time < minDate) minDate = time;
        if (time > maxDate) maxDate = time;
      }

      // Map JS getDay (0=Sun, 1=Mon) to our 0=Mon, 6=Sun format
      const day = (getDay(created) + 6) % 7;
      const hour = getHours(created);
      heatmapMatrix[day][hour]++;
    }
  });

  let totalWeeks = 1;
  if (minDate !== Infinity && maxDate !== -Infinity && maxDate > minDate) {
    const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
    totalWeeks = Math.max(1, daysDiff / 7);
  }

  let rawMaxHeat = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      const rawAvg = heatmapMatrix[i][j] / totalWeeks;
      if (rawAvg > rawMaxHeat) rawMaxHeat = rawAvg;
    }
  }

  // Automatically use decimals only if the max volume is less than 10 to preserve variance
  const needsDecimals = rawMaxHeat > 0 && rawMaxHeat < 10;
  let maxHeat = 0;

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      const rawVal = heatmapMatrix[i][j];
      if (rawVal === 0) {
        heatmapMatrix[i][j] = 0;
        continue;
      }

      const rawAvg = rawVal / totalWeeks;
      let avg = needsDecimals ? Math.round(rawAvg * 10) / 10 : Math.round(rawAvg);

      // Safety: if it rounded to 0 but there is volume, force it to the minimum visible unit
      if (avg === 0) avg = needsDecimals ? 0.1 : 1;

      heatmapMatrix[i][j] = avg;
      if (avg > maxHeat) maxHeat = avg;
    }
  }

  const dayTotals = heatmapMatrix.map((row) => {
    const sum = row.reduce((a, b) => a + b, 0);
    return needsDecimals ? Math.round(sum * 10) / 10 : Math.round(sum);
  });

  const hourTotals = Array.from({ length: 24 }, (_, i) => {
    const sum = heatmapMatrix.reduce((s, row) => s + row[i], 0);
    return needsDecimals ? Math.round(sum * 10) / 10 : Math.round(sum);
  });

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const HOURS = [
    '12 AM',
    '1 AM',
    '2 AM',
    '3 AM',
    '4 AM',
    '5 AM',
    '6 AM',
    '7 AM',
    '8 AM',
    '9 AM',
    '10 AM',
    '11 AM',
    '12 PM',
    '1 PM',
    '2 PM',
    '3 PM',
    '4 PM',
    '5 PM',
    '6 PM',
    '7 PM',
    '8 PM',
    '9 PM',
    '10 PM',
    '11 PM',
  ];

  let maxDayIdx = 0;
  let maxHourIdx = 0;
  dayTotals.forEach((total, idx) => {
    if (total > dayTotals[maxDayIdx]) maxDayIdx = idx;
  });
  hourTotals.forEach((total, idx) => {
    if (total > hourTotals[maxHourIdx]) maxHourIdx = idx;
  });
  const peakDay = DAYS[maxDayIdx];
  const peakTime = HOURS[maxHourIdx];

  const channelMap = new Map<string, number>();
  filteredTickets.forEach((t) => {
    let channel = t['Channel'] || 'Unknown';
    const cLower = channel.toLowerCase();
    if (cLower === 'voice' || cLower === 'phone_aircall') channel = 'Phone';
    else if (cLower === 'api') channel = 'Chat';
    else if (cLower === 'admin_panel') channel = 'Created by Agent';
    else if (cLower === 'support center') channel = 'Purchaser/Realtor Portal';
    else if (cLower === 'customer_panel') channel = 'Knowledge Base';
    else if (cLower === 'email') channel = 'Email';
    else channel = channel.charAt(0).toUpperCase() + channel.slice(1);
    
    channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
  });
  const channelData = Array.from(channelMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const workloadMap = new Map<
    string,
    { name: string; volume: number; totalTime: number; avgTime: number }
  >();
  filteredTickets.forEach((t) => {
    const keys =
      managerFilter === 'All Agents'
        ? [t['Assigned Agent Name'] || 'Unassigned']
        : (t['Ticket Tags'] || '')
            .split(',')
            .map((p) => p.trim())
            .filter((p) => {
              const lower = p.toLowerCase();
              return (
                lower &&
                lower !== 'no project' &&
                lower !== 'unknown project' &&
                lower !== 'unknown'
              );
            });

    if (keys.length === 0) return;

    keys.forEach((k) => {
      if (!workloadMap.has(k)) workloadMap.set(k, { name: k, volume: 0, totalTime: 0, avgTime: 0 });
      const entry = workloadMap.get(k)!;
      entry.volume += 1;
      entry.totalTime += Number(t['Time Spent (seconds)'] || 0) / 60;
    });
  });

  const workloadDataRaw = Array.from(workloadMap.values())
    .filter((d) => d.volume > 0 && d.name !== 'Unassigned')
    .map((d) => ({
      ...d,
      avgTime: Math.round(d.totalTime / d.volume),
    }));

  const workloadData = workloadDataRaw
    .filter((d) => d.totalTime > 0)
    .sort((a, b) => {
      if (workloadSortBy === 'volume') {
        return b.volume - a.volume;
      } else {
        return b.avgTime - a.avgTime;
      }
    });

  const avgWorkloadVolume =
    workloadData.length > 0
      ? workloadData.reduce((acc, curr) => acc + curr.volume, 0) / workloadData.length
      : 0;
  const avgWorkloadTime =
    workloadData.length > 0
      ? workloadData.reduce((acc, curr) => acc + curr.avgTime, 0) / workloadData.length
      : 0;

  // --- NEW: Time Analysis Quadrant Data ---
  const timeAnalysisMap = new Map<
    string,
    {
      name: string;
      type: 'project' | 'category' | 'classification';
      volume: number;
      totalTimeSpentSec: number;
      resolvedTickets: number;
      totalResolutionTimeSec: number;
    }
  >();

  filteredTickets.forEach((t) => {
    const cat = t['Ticket Category'] || 'Uncategorized';
    const classification =
      t['Onboarding Classification'] ||
      t['Maintenance Classification'] ||
      t['Product Classification'] ||
      t['Internal Classification'] ||
      t['Services Classification'] ||
      'None';

    const rawProjects = t['Ticket Tags'] || '';
    const projects = rawProjects
      .split(',')
      .map((p) => p.trim())
      .filter((p) => {
        const lower = p.toLowerCase();
        return (
          lower && lower !== 'no project' && lower !== 'unknown project' && lower !== 'unknown'
        );
      });

    const timeSpentSec = Number(t['Time Spent (seconds)'] || 0);
    const isResolved =
      t['Ticket Status']?.toLowerCase() === 'closed' ||
      t['Ticket Status']?.toLowerCase() === 'solved';
    let resolutionTimeSec = 0;
    if (isResolved && t['Last Closed At'] && t['Created At']) {
      const closed = parseDate(t['Last Closed At']);
      const created = parseDate(t['Created At']);
      if (closed && created) {
        resolutionTimeSec = (closed.getTime() - created.getTime()) / 1000;
      }
    }

    const addToMap = (name: string, type: 'project' | 'category' | 'classification') => {
      const key = `${type}_${name}`;
      if (!timeAnalysisMap.has(key)) {
        timeAnalysisMap.set(key, {
          name,
          type,
          volume: 0,
          totalTimeSpentSec: 0,
          resolvedTickets: 0,
          totalResolutionTimeSec: 0,
        });
      }
      const entry = timeAnalysisMap.get(key)!;
      entry.volume += 1;
      entry.totalTimeSpentSec += timeSpentSec;
      if (isResolved && resolutionTimeSec > 0) {
        entry.resolvedTickets += 1;
        entry.totalResolutionTimeSec += resolutionTimeSec;
      }
    };

    addToMap(cat, 'category');
    addToMap(classification, 'classification');
    projects.forEach((p) => addToMap(p, 'project'));
  });

  const timeAnalysisData = Array.from(timeAnalysisMap.values())
    .map((d) => ({
      name: d.name,
      type: d.type,
      volume: d.volume,
      timeSpentHours: Number((d.totalTimeSpentSec / 3600).toFixed(1)),
      avgResolutionHours:
        d.resolvedTickets > 0
          ? Number((d.totalResolutionTimeSec / d.resolvedTickets / 3600).toFixed(1))
          : 0,
    }))
    .filter((d) => d.volume > 0 && (d.timeSpentHours > 0 || d.avgResolutionHours > 0));

  return {
    trendData,
    channelData,
    assigneeData,
    categoryData,
    classificationGrids,
    projectData,
    contactData,
    categoryKeys,
    classificationKeys,
    heatmapMatrix,
    maxHeat,
    dayTotals,
    hourTotals,
    peakDay,
    peakTime,
    CATEGORY_COLORS,
    workloadData,
    avgWorkloadVolume,
    avgWorkloadTime,
    timeAnalysisData,
  };
}

export function getDoughnutData(chartData: any, selectedRingCategory: string | null) {
  const inner: any[] = [];
  const outer: any[] = [];

  const catColors: Record<string, string> = {
    Onboarding: '#00bdd9',
    Product: '#8b5cf6',
    Maintenance: '#10b981',
    Services: '#f59e0b',
    Internal: '#64748b',
    Uncategorized: '#cbd5e1',
  };
  const getCatColor = (cat: string) => catColors[cat] || catColors['Uncategorized'];

  // Generate lighter shades for the outer ring using HSL
  // E.g., #00bdd9 is roughly hsl(188, 100%, 43%)
  const outerCatColors: Record<string, string[]> = {
    Onboarding: ['#33cadf', '#66d8e6', '#99e5ec', '#ccf2f5', '#e5f9fb'],
    Product: ['#a27df8', '#b99dfa', '#d0befb', '#e8defd', '#f3effe'],
    Maintenance: ['#40c79b', '#70d6b4', '#9fe4cd', '#cff2e6', '#e7f9f2'],
    Services: ['#f7b13b', '#f9c56c', '#fad89c', '#fcebcd', '#fdf5e6'],
    Internal: ['#8390a3', '#a2abb9', '#c1c7cf', '#e0e3e7', '#f0f1f3'],
    Uncategorized: ['#d5dfe9', '#e0e7ee', '#eaeff3', '#f4f7f9', '#f9fbcc'],
  };

  if (selectedRingCategory) {
    const catData = chartData.categoryData.find((c: any) => c.name === selectedRingCategory);
    if (catData) {
      inner.push({ name: catData.name, value: catData.value, fill: getCatColor(catData.name) });
    }
    const classData = chartData.classificationGrids.find(
      (c: any) => c.category === selectedRingCategory
    );
    if (classData) {
      classData.data.forEach((cls: any, i: number) => {
        const colors = outerCatColors[selectedRingCategory] || outerCatColors['Uncategorized'];
        outer.push({
          name: cls.name,
          value: cls.value,
          category: selectedRingCategory,
          fill: colors[i % colors.length],
        });
      });
    }
  } else {
    chartData.categoryData.forEach((cat: any) => {
      inner.push({ name: cat.name, value: cat.value, fill: getCatColor(cat.name) });

      const classData = chartData.classificationGrids.find((c: any) => c.category === cat.name);
      if (classData) {
        classData.data.forEach((cls: any, i: number) => {
          const colors = outerCatColors[cat.name] || outerCatColors['Uncategorized'];
          outer.push({
            name: cls.name,
            value: cls.value,
            category: cat.name,
            fill: colors[i % colors.length],
          });
        });
      }
    });
  }

  return { inner, outer };
}

export function getCurrentQuadrantData(
  chartData: any,
  timeAnalysisView: string,
  timeAnalysisFilter: string
) {
  let data = chartData.timeAnalysisData.filter((d: any) => d.type === timeAnalysisView);
  if (timeAnalysisFilter === 'significant') {
    // Must have at least 3 hours of active time OR took more than 4 hours to resolve
    data = data
      .filter((d: any) => d.timeSpentHours >= 3 || d.avgResolutionHours >= 4)
      .sort((a: any, b: any) => b.timeSpentHours - a.timeSpentHours)
      .slice(0, 50);
  }
  if (data.length === 0)
    return { data: [], avgX: 0, avgY: 0, minX: 0, maxX: 10, minY: 0, maxY: 10 };

  const xVals = data.map((d: any) => d.avgResolutionHours).sort((a: any, b: any) => a - b);
  const yVals = data.map((d: any) => d.timeSpentHours).sort((a: any, b: any) => a - b);

  // Use stricter 80th percentile for better zooming
  const pX = xVals[Math.floor(xVals.length * 0.8)] || 0;
  const pY = yVals[Math.floor(yVals.length * 0.8)] || 0;

  const avgX = xVals.reduce((a: any, b: any) => a + b, 0) / (xVals.length || 1);
  const avgY = yVals.reduce((a: any, b: any) => a + b, 0) / (yVals.length || 1);

  const rawMinX = xVals.length > 0 ? xVals[0] : 0;
  const rawMinY = yVals.length > 0 ? yVals[0] : 0;

  // Give a little breathing room below the minimum point, bounded at 0
  const minX = Math.max(0, Math.floor(rawMinX * 0.9));
  const minY = Math.max(0, Math.floor(rawMinY * 0.9));

  // Provide a reasonable max that covers 80% of data plus a 20% buffer, using Math.ceil to prevent JS float inaccuracy
  const maxX = Math.ceil(Math.max(pX * 1.2, avgX * 1.5, 5));
  const maxY = Math.ceil(Math.max(pY * 1.2, avgY * 1.5, 2));

  const clampedData = data.map((d: any) => ({
    ...d,
    displayX: Math.min(d.avgResolutionHours, maxX),
    displayY: Math.min(d.timeSpentHours, maxY),
    isOutlierX: d.avgResolutionHours > maxX,
    isOutlierY: d.timeSpentHours > maxY,
  }));

  return { data: clampedData, avgX, avgY, minX, maxX, minY, maxY };
}
