import { useMemo } from 'react';
import { SupportTicket } from '../store/useSupportStore';

export interface TrueCostCategory {
  name: string;
  avgWallClockDays: number;
  avgActiveEffortHours: number;
  volume: number;
  totalActiveEffortHours: number;
}
export interface TrueCostProject {
  name: string;
  avgWallClockDays: number;
  avgActiveEffortHours: number;
  volume: number;
  totalActiveEffortHours: number;
  categories: TrueCostCategory[];
}
export interface TrueCostKPIs {
  totalEffortHours: number;
  overallAvgResolutionDays: number;
  firedrillCount: number; // tickets with active effort > 2.0 hours
}
export interface TrueCostResult {
  projects: TrueCostProject[];
  kpis: TrueCostKPIs;
}

export function useTrueCostAnalytics(tickets: SupportTicket[]): TrueCostResult {
  return useMemo(() => {
    const projectMap: Record<
      string,
      {
        wallClockDaysSum: number;
        activeEffortHoursSum: number;
        volume: number;
        categoryMap: Record<
          string,
          {
            wallClockDaysSum: number;
            activeEffortHoursSum: number;
            volume: number;
          }
        >;
      }
    > = {};

    let totalEffortHours = 0;
    let totalWallClockDays = 0;
    let totalValidVolume = 0;
    let firedrillCount = 0;

    for (const t of tickets) {
      if (!t['Last Closed At'] || !t['Created At']) continue;

      const closedTime = new Date(t['Last Closed At']).getTime();
      const createdTime = new Date(t['Created At']).getTime();

      if (isNaN(closedTime) || isNaN(createdTime) || closedTime <= createdTime) {
        continue;
      }

      const wallClockDays = (closedTime - createdTime) / (1000 * 60 * 60 * 24);
      const activeEffortHours = (Number(t['Time Spent (seconds)']) || 0) / 3600;

      totalEffortHours += activeEffortHours;
      totalWallClockDays += wallClockDays;
      totalValidVolume += 1;

      if (activeEffortHours > 2.0) {
        firedrillCount += 1;
      }

      const projectName = t['Ticket Tags']?.split(',')[0]?.trim() || 'Unassigned';
      const categoryName = t['Ticket Category']?.trim() || 'Unassigned';

      if (!projectMap[projectName]) {
        projectMap[projectName] = {
          wallClockDaysSum: 0,
          activeEffortHoursSum: 0,
          volume: 0,
          categoryMap: {},
        };
      }

      const proj = projectMap[projectName];
      proj.wallClockDaysSum += wallClockDays;
      proj.activeEffortHoursSum += activeEffortHours;
      proj.volume += 1;

      if (!proj.categoryMap[categoryName]) {
        proj.categoryMap[categoryName] = {
          wallClockDaysSum: 0,
          activeEffortHoursSum: 0,
          volume: 0,
        };
      }

      const cat = proj.categoryMap[categoryName];
      cat.wallClockDaysSum += wallClockDays;
      cat.activeEffortHoursSum += activeEffortHours;
      cat.volume += 1;
    }

    const projects: TrueCostProject[] = Object.entries(projectMap).map(([projName, projData]) => {
      const categories: TrueCostCategory[] = Object.entries(projData.categoryMap).map(
        ([catName, catData]) => ({
          name: catName,
          avgWallClockDays: catData.wallClockDaysSum / catData.volume,
          avgActiveEffortHours: catData.activeEffortHoursSum / catData.volume,
          volume: catData.volume,
          totalActiveEffortHours: catData.activeEffortHoursSum,
        })
      );

      categories.sort((a, b) => b.totalActiveEffortHours - a.totalActiveEffortHours);

      return {
        name: projName,
        avgWallClockDays: projData.wallClockDaysSum / projData.volume,
        avgActiveEffortHours: projData.activeEffortHoursSum / projData.volume,
        volume: projData.volume,
        totalActiveEffortHours: projData.activeEffortHoursSum,
        categories,
      };
    });

    projects.sort((a, b) => b.totalActiveEffortHours - a.totalActiveEffortHours);

    const kpis: TrueCostKPIs = {
      totalEffortHours,
      overallAvgResolutionDays: totalValidVolume > 0 ? totalWallClockDays / totalValidVolume : 0,
      firedrillCount,
    };

    return {
      projects,
      kpis,
    };
  }, [tickets]);
}
