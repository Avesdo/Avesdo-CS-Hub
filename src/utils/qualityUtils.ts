import { startOfQuarter, endOfQuarter, subQuarters, startOfDay } from 'date-fns';
import { useAppStore } from '../store/useAppStore';

export interface OnboardingCsatMetric {
  month: string;
  projectsLaunched: number;
  csatReceived: number;
  averageScore: number;
  timestamp: number;
}

export interface SupportCsatMetric {
  month: string;
  feedbackCount: number;
  promoters: number;
  passives: number;
  detractors: number;
  averageScore: number;
  timestamp: number;
}

export interface NpsMetric {
  month: string;
  feedbackCount: number;
  promoters: number;
  passives: number;
  detractors: number;
  averageScore: number;
  timestamp: number;
}

export interface QualityMetricsData {
  onboardingCsat: {
    trend: OnboardingCsatMetric[];
    aggregate: {
      averageScore: number;
      csatReceived: number;
      projectsLaunched: number;
    };
    submissions: any[];
  };
  supportCsat: {
    trend: SupportCsatMetric[];
    submissions: any[];
    aggregate: {
      averageScore: number;
      promoters: number;
      detractors: number;
      passives: number;
      totalFeedback: number;
    };
  };
  nps: {
    trend: NpsMetric[];
    submissions: any[];
    aggregate: {
      npsScore: number;
      promoters: number;
      detractors: number;
      passives: number;
      totalFeedback: number;
    };
  };
}

export const extractCsatMetrics = (csatData: any) => {
  let validScore = 0;
  let comments = '';
  const scoreRaw = csatData.score;

  if (scoreRaw !== undefined && scoreRaw !== null && scoreRaw !== '') {
    const parsed = Number(scoreRaw);
    if (!isNaN(parsed)) {
      validScore = parsed <= 5 ? (parsed / 5) * 100 : parsed;
    }
  } else {
    // Generic dynamic extraction: scan all values
    let sum = 0;
    let count = 0;

    Object.entries(csatData).forEach(([key, val]) => {
      // Ignore metadata keys
      if (['id', 'submittedAt', 'submittedBy', 'projectId', 'status'].includes(key)) return;

      if (typeof val === 'number') {
        sum += val;
        count++;
      } else if (typeof val === 'string') {
        // Check if it's a rating like "5 - Excellent" or "4"
        const numMatch = val.match(/^(\d+(\.\d+)?)/);
        if (numMatch && numMatch[1]) {
          const num = parseFloat(numMatch[1]);
          // Only consider reasonable ratings (0 to 10)
          if (!isNaN(num) && num <= 10) {
            sum += num;
            count++;
          }
        }
      }
    });

    validScore = count > 0 ? (sum / count / 5) * 100 : 0;
    // Cap at 100 in case they used a 10-point scale but it was divided by 5
    if (validScore > 100) validScore = 100;
  }

  // Explicit comments fields take precedence (case-insensitive key search)
  let commentKey = Object.keys(csatData).find((key) => {
    const lowerKey = key.toLowerCase();
    return lowerKey.includes('comment') || lowerKey.includes('feedback') || lowerKey === 'note';
  });

  // If no direct key matched, try to find a field in the template whose label contains "comment" or "feedback"
  if (!commentKey) {
    try {
      const templates = useAppStore.getState().settings?.templates;
      const csatTemplate = templates?.onboardingCsat;
      if (csatTemplate?.fields) {
        const templateField = csatTemplate.fields.find((f: any) => {
          const label = (f.label || '').toLowerCase();
          return label.includes('comment') || label.includes('feedback') || label === 'note';
        });
        if (templateField) {
          commentKey = templateField.id;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (commentKey && typeof csatData[commentKey] === 'string') {
    comments = csatData[commentKey];
  }

  return { validScore, comments };
};

export function getQualityMetricsData(
  projects: any[],
  clients: any[],
  preset: string,
  customStartDate: number | null,
  customEndDate: number | null,
  viewMode: 'monthly' | 'quarterly' = 'monthly'
): QualityMetricsData {
  const now = new Date();
  let start = 0;
  let end = now.getTime();

  if (preset === 'thisYear') {
    start = new Date(now.getFullYear(), 0, 1).getTime();
  } else if (preset === 'lastYear') {
    start = new Date(now.getFullYear() - 1, 0, 1).getTime();
    end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999).getTime();
  } else if (preset === 'all') {
    start = 0;
  } else if (preset === 'custom') {
    start = customStartDate !== null ? startOfDay(new Date(customStartDate)).getTime() : 0;
    const customEnd = customEndDate !== null ? startOfDay(new Date(customEndDate)) : now;
    end = customEnd.getTime() + 86400000 - 1;
  } else {
    // Default fallback
    start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
  }

  const parseDate = (dateVal: any): number | null => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d.getTime();
  };

  const formatGroup = (timestamp: number): string => {
    const d = new Date(timestamp);
    if (viewMode === 'quarterly') {
      const q = Math.floor(d.getMonth() / 3) + 1;
      return `Q${q} ${d.getFullYear()}`;
    }
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getGroupStart = (timestamp: number): number => {
    const d = new Date(timestamp);
    if (viewMode === 'quarterly') {
      const q = Math.floor(d.getMonth() / 3);
      return new Date(d.getFullYear(), q * 3, 1).getTime();
    }
    return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  };

  const inRange = (ts: number | null): boolean => {
    if (ts === null) return false;
    return ts >= start && ts <= end;
  };

  // 1. Onboarding CSAT
  const onboardingByMonth: Record<
    number,
    { launched: number; received: number; totalScore: number }
  > = {};
  let totalOnboardingScore = 0;
  let totalOnboardingCount = 0;
  let totalProjectsLaunched = 0;

  // First pass: Count all projects launched in each month (goLiveDate or createdAt)
  projects?.forEach((project) => {
    const launchTs = project.releaseDateVal || parseDate(project.goLiveDate || project.createdAt);
    if (inRange(launchTs) && launchTs !== null) {
      totalProjectsLaunched++;
      const groupTs = getGroupStart(launchTs);
      if (!onboardingByMonth[groupTs]) {
        onboardingByMonth[groupTs] = { launched: 0, received: 0, totalScore: 0 };
      }
      onboardingByMonth[groupTs].launched += 1;
    }
  });

  // Second pass: Count CSAT received (legacy and current)
  const submissions: any[] = [];

  projects?.forEach((project) => {
    const launchTs = project.releaseDateVal || parseDate(project.goLiveDate || project.createdAt);

    // Check current CSAT first
    if (project?.health?.onboardingCsat) {
      const csatData = project.health.onboardingCsat;
      const ts = parseDate(csatData.submittedAt) || launchTs; // fallback to release date for new CSAT

      if (inRange(ts) && ts !== null) {
        const groupTs = getGroupStart(ts);
        if (!onboardingByMonth[groupTs]) {
          onboardingByMonth[groupTs] = { launched: 0, received: 0, totalScore: 0 };
        }
        onboardingByMonth[groupTs].received += 1;

        const { validScore, comments } = extractCsatMetrics(csatData);

        onboardingByMonth[groupTs].totalScore += validScore;
        totalOnboardingCount += 1;
        totalOnboardingScore += validScore;

        submissions.push({
          projectId: project.id,
          projectName: project.name,
          clientName: project.clientName || '',
          score: validScore,
          comments,
          submittedAt: ts,
          group: formatGroup(groupTs),
        });
      }
    }
    // Fallback to legacy CSAT
    else if (project?.onboardingCsat) {
      const csatData = project.onboardingCsat;
      const ts = launchTs; // Always use release date for legacy CSAT

      if (inRange(ts) && ts !== null) {
        const groupTs = getGroupStart(ts);
        if (!onboardingByMonth[groupTs]) {
          onboardingByMonth[groupTs] = { launched: 0, received: 0, totalScore: 0 };
        }
        onboardingByMonth[groupTs].received += 1;

        const { validScore, comments } = extractCsatMetrics(csatData);

        onboardingByMonth[groupTs].totalScore += validScore;
        totalOnboardingCount += 1;
        totalOnboardingScore += validScore;

        submissions.push({
          projectId: project.id,
          projectName: project.name,
          clientName: project.clientName || '',
          score: validScore,
          comments,
          submittedAt: ts,
          group: formatGroup(groupTs),
        });
      }
    }
  });

  const onboardingCsatTrend: OnboardingCsatMetric[] = Object.keys(onboardingByMonth)
    .map(Number)
    .sort((a, b) => a - b)
    .map((groupTs) => {
      const data = onboardingByMonth[groupTs];
      const averageScore =
        data.received > 0 ? Number((data.totalScore / data.received).toFixed(2)) : 0;
      return {
        month: formatGroup(groupTs),
        projectsLaunched: data.launched,
        csatReceived: data.received,
        averageScore,
        timestamp: groupTs,
      };
    });

  // 2. Support CSAT
  const supportByMonth: Record<
    number,
    { count: number; promoters: number; passives: number; detractors: number }
  > = {};
  let totalSupportFeedback = 0;
  let supportPromoters = 0;
  let supportDetractors = 0;
  let supportPassives = 0;
  const supportCsatSubmissions: any[] = [];

  clients?.forEach((client) => {
    client?.supportCsatHistory?.forEach((entry: any) => {
      const ts = parseDate(entry?.submittedAt);
      if (inRange(ts) && ts !== null) {
        const groupTs = getGroupStart(ts);
        if (!supportByMonth[groupTs]) {
          supportByMonth[groupTs] = { count: 0, promoters: 0, passives: 0, detractors: 0 };
        }
        const promoters = Number(entry?.promoters) || 0;
        const detractors = Number(entry?.detractors) || 0;
        const passives = Number(entry?.passives) || 0;
        const total = promoters + detractors + passives || 1; // Fallback

        supportByMonth[groupTs].count += total;
        supportByMonth[groupTs].promoters += promoters;
        supportByMonth[groupTs].passives += passives;
        supportByMonth[groupTs].detractors += detractors;

        totalSupportFeedback += total;
        supportPromoters += promoters;
        supportDetractors += detractors;
        supportPassives += passives;

        if (entry?.users && Array.isArray(entry.users)) {
          entry.users.forEach((user: any) => {
            supportCsatSubmissions.push({
              name: user.name,
              happy: user.happy,
              neutral: user.neutral,
              unhappy: user.unhappy,
              total: user.total,
              submittedAt: entry.submittedAt,
            });
          });
        }
      }
    });
  });

  const supportCsatTrend: SupportCsatMetric[] = Object.keys(supportByMonth)
    .map(Number)
    .sort((a, b) => a - b)
    .map((groupTs) => {
      const data = supportByMonth[groupTs];
      // Formula: (Promoters / Total) * 100
      const averageScore = data.count > 0 ? Math.round((data.promoters / data.count) * 100) : 0;
      return {
        month: formatGroup(groupTs),
        feedbackCount: data.count,
        promoters: data.promoters,
        passives: data.passives,
        detractors: data.detractors,
        averageScore,
        timestamp: groupTs,
      };
    });

  // 3. NPS
  const npsByMonth: Record<
    number,
    { count: number; promoters: number; passives: number; detractors: number }
  > = {};
  let totalNpsFeedback = 0;
  let npsPromoters = 0;
  let npsDetractors = 0;
  let npsPassives = 0;
  const npsSubmissions: any[] = [];

  clients?.forEach((client) => {
    client?.clientNpsHistory?.forEach((entry: any) => {
      const ts = parseDate(entry?.submittedAt);
      if (inRange(ts) && ts !== null) {
        const groupTs = getGroupStart(ts);
        if (!npsByMonth[groupTs]) {
          npsByMonth[groupTs] = { count: 0, promoters: 0, passives: 0, detractors: 0 };
        }

        let promoters = Number(entry?.promoters) || 0;
        let detractors = Number(entry?.detractors) || 0;
        let passives = Number(entry?.passives) || 0;

        // Backwards compatibility for legacy mock data that only has a 0-10 score
        if (entry?.promoters === undefined && entry?.score !== undefined) {
          const s = Number(entry.score);
          if (s >= 9) promoters = 1;
          else if (s >= 7) passives = 1;
          else detractors = 1;
        }

        const total = promoters + detractors + passives || 1;

        npsByMonth[groupTs].count += total;
        npsByMonth[groupTs].promoters += promoters;
        npsByMonth[groupTs].passives += passives;
        npsByMonth[groupTs].detractors += detractors;

        totalNpsFeedback += total;
        npsPromoters += promoters;
        npsDetractors += detractors;
        npsPassives += passives;

        if (entry?.feedback && Array.isArray(entry.feedback)) {
          entry.feedback.forEach((f: any) => {
            npsSubmissions.push({
              name: f.name,
              email: f.email,
              score: f.score,
              feedback: f.feedback,
              submittedAt: entry.submittedAt,
            });
          });
        }
      }
    });
  });

  const npsTrend: NpsMetric[] = Object.keys(npsByMonth)
    .map(Number)
    .sort((a, b) => a - b)
    .map((groupTs) => {
      const data = npsByMonth[groupTs];
      // Formula: ((Promoters - Detractors) / Total) * 100
      const averageScore =
        data.count > 0 ? Math.round(((data.promoters - data.detractors) / data.count) * 100) : 0;
      return {
        month: formatGroup(groupTs),
        feedbackCount: data.count,
        promoters: data.promoters,
        passives: data.passives,
        detractors: data.detractors,
        averageScore,
        timestamp: groupTs,
      };
    });

  const globalNpsScore =
    totalNpsFeedback > 0
      ? Math.round(((npsPromoters - npsDetractors) / totalNpsFeedback) * 100)
      : 0;

  const globalSupportScore =
    totalSupportFeedback > 0 ? Math.round((supportPromoters / totalSupportFeedback) * 100) : 0;

  return {
    onboardingCsat: {
      trend: onboardingCsatTrend,
      aggregate: {
        averageScore: totalOnboardingCount > 0 ? totalOnboardingScore / totalOnboardingCount : 0,
        csatReceived: totalOnboardingCount,
        projectsLaunched: totalProjectsLaunched,
      },
      submissions,
    },
    supportCsat: {
      trend: supportCsatTrend,
      aggregate: {
        averageScore: globalSupportScore,
        promoters: supportPromoters,
        passives: supportPassives,
        detractors: supportDetractors,
        totalFeedback: totalSupportFeedback,
      },
      submissions: supportCsatSubmissions,
    },
    nps: {
      trend: npsTrend,
      aggregate: {
        npsScore: globalNpsScore,
        promoters: npsPromoters,
        passives: npsPassives,
        detractors: npsDetractors,
        totalFeedback: totalNpsFeedback,
      },
      submissions: npsSubmissions,
    },
  };
}
