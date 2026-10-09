import { startOfDay } from 'date-fns';
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

const METADATA_KEYS = new Set([
  'id',
  'submittedat',
  'updatedat',
  'submittedby',
  'projectid',
  'status',
  'createdat',
  'score',
]);

const UNANSWERED_VALUES = new Set(['unanswered', 'n/a', 'na', 'none', '-', 'null', 'undefined']);

const COMMENT_KEYWORDS = ['comment', 'feedback', 'recognize', 'note', 'additional'];

export const parseLikertValue = (text: string): number | null => {
  const lower = text.trim().toLowerCase();
  if (!lower) return null;

  if (UNANSWERED_VALUES.has(lower)) {
    return null;
  }

  // 1. Neutral (50)
  // Evaluated first to ensure "neither agree nor disagree" or "neither satisfied nor dissatisfied"
  // does not match "agree" or "dissatisfied"
  if (
    lower.includes('neither') ||
    lower.includes('neutral') ||
    lower.includes('acceptable') ||
    /\b(fair|average)\b/.test(lower)
  ) {
    return 50;
  }

  // 2. Extreme negative (0)
  if (
    lower.includes('extremely dissatisfied') ||
    lower.includes('very dissatisfied') ||
    lower.includes('strongly disagree') ||
    lower.includes('terrible') ||
    lower.includes('very poor') ||
    lower === 'no'
  ) {
    return 0;
  }

  // 3. Mild negative (25)
  if (
    lower.includes('somewhat dissatisfied') ||
    lower.includes('dissatisfied') ||
    lower.includes('somewhat disagree') ||
    lower.includes('disagree') ||
    lower.includes('poor')
  ) {
    return 25;
  }

  // 4. Extreme positive (100)
  if (
    lower.includes('extremely satisfied') ||
    lower.includes('very satisfied') ||
    lower.includes('strongly agree') ||
    lower.includes('excellent') ||
    lower.includes('great') ||
    lower === 'yes'
  ) {
    return 100;
  }

  // 5. Mild positive (75)
  if (
    lower.includes('somewhat satisfied') ||
    lower.includes('satisfied') ||
    lower.includes('somewhat agree') ||
    lower.includes('agree') ||
    /\bgood\b/.test(lower)
  ) {
    return 75;
  }

  return null;
};

export interface ExtractedCsatMetrics {
  validScore: number;
  comments: string;
  count: number;
}

export const extractCsatMetrics = (csatData: any): ExtractedCsatMetrics => {
  if (!csatData || typeof csatData !== 'object' || Array.isArray(csatData)) {
    return { validScore: 0, comments: '', count: 0 };
  }

  const templateFieldsById: Record<string, any> = {};
  try {
    const templates = useAppStore.getState().settings?.templates;
    const csatTemplate = templates?.onboardingCsat;
    if (csatTemplate?.fields && Array.isArray(csatTemplate.fields)) {
      csatTemplate.fields.forEach((f: any) => {
        if (f.id) templateFieldsById[f.id] = f;
      });
    }
  } catch {
    // Ignore template lookup failures in test/isolated environments
  }

  const isCommentOrFreeText = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    if (COMMENT_KEYWORDS.some((kw) => lowerKey.includes(kw))) {
      return true;
    }
    const templateField = templateFieldsById[key];
    if (templateField?.label && typeof templateField.label === 'string') {
      const lowerLabel = templateField.label.toLowerCase();
      if (COMMENT_KEYWORDS.some((kw) => lowerLabel.includes(kw))) {
        return true;
      }
    }
    return false;
  };

  let totalScore = 0;
  let count = 0;
  const commentParts: string[] = [];

  const addComment = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (UNANSWERED_VALUES.has(trimmed.toLowerCase())) return;
    if (!commentParts.includes(trimmed)) {
      commentParts.push(trimmed);
    }
  };

  Object.entries(csatData).forEach(([key, val]) => {
    const lowerKey = key.toLowerCase();

    // c) Filter out metadata keys
    if (METADATA_KEYS.has(lowerKey)) return;

    // Filter out null / undefined
    if (val === undefined || val === null) return;

    // d) Filter out unanswered text
    if (typeof val === 'string') {
      const trimmed = val.trim();
      const lowerVal = trimmed.toLowerCase();
      if (!trimmed || UNANSWERED_VALUES.has(lowerVal)) return;
    }

    // e) Filter out comment / free-text fields from the quantitative average
    if (isCommentOrFreeText(key)) {
      if (typeof val === 'string') {
        addComment(val);
      }
      return;
    }

    // a) Direct numeric ratings: Number value
    if (typeof val === 'number') {
      if (!isNaN(val)) {
        const is10Scale =
          lowerKey.includes('nps') ||
          lowerKey.includes('10') ||
          lowerKey.includes('recommend') ||
          val > 5;
        let score: number;
        if (val > 10) {
          score = val;
        } else if (is10Scale) {
          score = (val / 10) * 100;
        } else {
          score = (val / 5) * 100;
        }
        totalScore += Math.min(100, Math.max(0, score));
        count++;
      }
      return;
    }

    // String ratings (numeric prefixes, fractions, Likert, or comments)
    if (typeof val === 'string') {
      const trimmed = val.trim();

      // Handle fractions: "4/5", "8 / 10"
      const fractionMatch = trimmed.match(/^(\d+(\.\d+)?)\s*\/\s*(\d+(\.\d+)?)/);
      if (fractionMatch) {
        const num = parseFloat(fractionMatch[1]);
        const denom = parseFloat(fractionMatch[3]);
        if (!isNaN(num) && !isNaN(denom) && denom > 0) {
          totalScore += Math.min(100, Math.max(0, (num / denom) * 100));
          count++;
          return;
        }
      }

      // a) Handle strings starting with numbers (e.g. "5 - Excellent", "4 / 5", "8")
      const numMatch = trimmed.match(/^(\d+(\.\d+)?)/);
      if (numMatch && numMatch[1]) {
        const numVal = parseFloat(numMatch[1]);
        if (!isNaN(numVal)) {
          const is10Scale =
            lowerKey.includes('nps') ||
            lowerKey.includes('10') ||
            lowerKey.includes('recommend') ||
            numVal > 5;
          let score: number;
          if (numVal > 10) {
            score = numVal;
          } else if (is10Scale) {
            score = (numVal / 10) * 100;
          } else {
            score = (numVal / 5) * 100;
          }
          totalScore += Math.min(100, Math.max(0, score));
          count++;
          return;
        }
      }

      // b) Standard Likert text options
      const likertVal = parseLikertValue(trimmed);
      if (likertVal !== null) {
        totalScore += likertVal;
        count++;
        return;
      }

      // Unscored text captured as qualitative comments
      addComment(trimmed);
    }
  });

  // f) Calculate validScore = count > 0 ? Math.min(100, Math.round(totalScore / count)) : 0
  let validScore = count > 0 ? Math.min(100, Math.round(totalScore / count)) : 0;

  // Fallback for legacy objects that only have a direct `score` property
  if (
    count === 0 &&
    csatData.score !== undefined &&
    csatData.score !== null &&
    csatData.score !== ''
  ) {
    const raw = csatData.score;
    if (typeof raw === 'number' && !isNaN(raw)) {
      validScore = raw <= 5 ? Math.round((raw / 5) * 100) : Math.min(100, Math.round(raw));
    } else if (typeof raw === 'string') {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        validScore =
          parsed <= 5 ? Math.round((parsed / 5) * 100) : Math.min(100, Math.round(parsed));
      } else {
        const likert = parseLikertValue(raw);
        if (likert !== null) {
          validScore = likert;
        }
      }
    }
  }

  // Fallback for legacy comments fields
  if (commentParts.length === 0) {
    const legacyComment =
      csatData.comments || csatData.comment || csatData.note || csatData.feedback;
    if (typeof legacyComment === 'string') {
      addComment(legacyComment);
    }
  }

  return {
    validScore,
    comments: commentParts.join('\n'),
    count,
  };
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
