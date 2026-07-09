import { Settings } from '../types';
import { getClientComputedStatus } from './clientUtils';

export interface ProjectHealthResult {
  totalScore: number | 'N/A';
  opActivity: number;
  featAdoption: number;
  userVol: number;
  financial: number;
  csat: number | 'N/A';
}

export interface ClientHealthResult {
  totalScore: number | 'N/A';
  opActivity: number;
  featAdoption: number;
  userVol: number;
  financial: number;
  csat: number | 'N/A';
  hasSuspended: boolean;
  details: {
    invoiceStatus: string;
    avgProjectCsat: number | 'N/A';
    supportCsat: any | 'N/A';
    avgSessions: number;
    activeUserCount: number;
    avgDistinctFeatures: number;
    eventCount: number;
    clientNps: any | 'N/A';
  };
}

export function calculateProjectHealth(
  project: any,
  settings: Settings | null
): ProjectHealthResult {
  const defaultResult: ProjectHealthResult = {
    totalScore: 'N/A',
    opActivity: 0,
    featAdoption: 0,
    userVol: 0,
    financial: 100,
    csat: 'N/A',
  };

  if (!project || !settings) return defaultResult;

  // Calculate raw sub-pillars (clamped to 100 max)
  const rawOp =
    typeof project.opActivity === 'number'
      ? project.opActivity
      : typeof project.score_op === 'number'
        ? project.score_op
        : 0;
  const rawUsr =
    typeof project.userVol === 'number'
      ? project.userVol
      : typeof project.score_usr === 'number'
        ? project.score_usr
        : 0;

  const opActivity = Math.min(rawOp, 100);
  const userVol = Math.min(rawUsr, 100);

  // Feature Adoption
  const activeFeatures = Array.isArray(project.features) ? project.features.length : 0;
  const totalFeatures =
    Array.isArray(settings.features) && settings.features.length > 0 ? settings.features.length : 1;
  const calculatedFeatAdoption = Math.round(50 + (activeFeatures / totalFeatures) * 50);
  const featAdoption = Math.min(calculatedFeatAdoption, 100);

  // CSAT
  let csat: number | 'N/A' = 'N/A';
  if (
    project.health?.onboardingCsat &&
    Object.keys(project.health.onboardingCsat).filter(
      (k) => !['submittedAt', 'updatedAt'].includes(k)
    ).length > 0
  ) {
    const csatEntries = Object.entries(project.health.onboardingCsat);
    let totalScore = 0;
    let count = 0;

    csatEntries.forEach(([key, val]) => {
      if (['submittedAt', 'updatedAt'].includes(key)) return;

      if (
        typeof val === 'number' ||
        (typeof val === 'string' && !isNaN(parseFloat(val)) && !isNaN(Number(val)))
      ) {
        const numVal = typeof val === 'number' ? val : parseFloat(val);
        if (numVal > 10) {
          totalScore += numVal;
        } else if (
          key.toLowerCase().includes('nps') ||
          numVal > 5 ||
          key.toLowerCase().includes('10')
        ) {
          totalScore += (numVal / 10) * 100;
        } else {
          totalScore += (numVal / 5) * 100;
        }
        count++;
      } else if (typeof val === 'string') {
        const lowerVal = val.toLowerCase();
        if (lowerVal.includes('extremely satisfied') || lowerVal.includes('very satisfied')) {
          totalScore += 100;
          count++;
        } else if (lowerVal.includes('somewhat satisfied') || lowerVal === 'satisfied') {
          totalScore += 75;
          count++;
        } else if (lowerVal.includes('neither') || lowerVal.includes('neutral')) {
          totalScore += 50;
          count++;
        } else if (lowerVal.includes('somewhat dissatisfied') || lowerVal === 'dissatisfied') {
          totalScore += 25;
          count++;
        } else if (
          lowerVal.includes('extremely dissatisfied') ||
          lowerVal.includes('very dissatisfied')
        ) {
          totalScore += 0;
          count++;
        }
      }
    });

    if (count > 0) {
      csat = Math.round(totalScore / count);
    }
  } else if (project.onboardingCsat !== undefined) {
    const parsed =
      typeof project.onboardingCsat === 'object'
        ? parseFloat(project.onboardingCsat.score)
        : parseFloat(project.onboardingCsat);
    if (!isNaN(parsed)) csat = parsed;
  } else if (project.csat === 'Satisfied') {
    csat = 100;
  } else if (project.csat === 'Neutral') {
    csat = 50;
  } else if (project.csat === 'Dissatisfied') {
    csat = 0;
  }

  // Financial Standing
  let financial = 100; // Default to Current
  if (
    project.projectStatus === 'Suspended' ||
    project.status === 'Suspended' ||
    project.invoiceStatus === 'Suspend' ||
    project.invoiceStatus === 'Suspended'
  ) {
    financial = 0;
  }

  // Math - Weights
  const weights = {
    opActivity: settings.scoring?.weights?.opActivity ?? 35,
    featAdoption: settings.scoring?.weights?.featAdoption ?? 25,
    userVol: settings.scoring?.weights?.userVol ?? 15,
    financial: settings.scoring?.weights?.financial ?? 15,
    csat: settings.scoring?.weights?.csat ?? 10,
  };

  let totalScore: number | 'N/A' = 0;
  let totalWeight = 0;

  totalScore += opActivity * (weights.opActivity / 100);
  totalWeight += weights.opActivity;

  totalScore += featAdoption * (weights.featAdoption / 100);
  totalWeight += weights.featAdoption;

  totalScore += userVol * (weights.userVol / 100);
  totalWeight += weights.userVol;

  if (weights.financial !== undefined) {
    totalScore += financial * (weights.financial / 100);
    totalWeight += weights.financial;
  }

  if (csat !== 'N/A') {
    totalScore += csat * (weights.csat / 100);
    totalWeight += weights.csat;
  }

  // Dynamic Re-weighting
  if (totalWeight > 0) {
    totalScore = Math.round(((totalScore as number) / totalWeight) * 100);
  } else {
    totalScore = 'N/A';
  }

  if (
    project.projectStatus === 'Onboarding' ||
    project.projectStatus === 'Closed' ||
    project.projectStatus === 'Completed' ||
    project.projectStatus === 'Cancelled' ||
    project.projectStatus === 'Churned'
  ) {
    totalScore = 'N/A';
  }

  return {
    totalScore,
    opActivity,
    featAdoption,
    userVol,
    financial,
    csat,
  };
}

export function calculateClientHealth(
  client: any,
  projects: any[],
  settings: Settings | null
): ClientHealthResult {
  const defaultResult: ClientHealthResult = {
    totalScore: 'N/A',
    opActivity: 0,
    featAdoption: 0,
    userVol: 0,
    financial: 100,
    csat: 'N/A',
    hasSuspended: false,
    details: {
      invoiceStatus: 'Current',
      avgProjectCsat: 'N/A',
      supportCsat: 'N/A',
      avgSessions: 0,
      activeUserCount: 0,
      avgDistinctFeatures: 0,
      eventCount: 0,
      clientNps: 'N/A',
    },
  };

  if (!client || !settings) return defaultResult;

  const clientProjects = projects.filter(
    (p) =>
      p.clientIds?.includes(client.clientId || client.id) ||
      p.clients?.includes(client.companyName || client.name)
  );
  const activeProjects = clientProjects.filter(
    (p) =>
      p.projectStatus !== 'Onboarding' &&
      p.projectStatus !== 'Closed' &&
      p.projectStatus !== 'Completed' &&
      p.projectStatus !== 'Cancelled' &&
      p.projectStatus !== 'Churned'
  );
  const hasSuspended = clientProjects.some((p) => p.projectStatus === 'Suspended');

  if (activeProjects.length === 0 && !hasSuspended) {
    return { ...defaultResult, hasSuspended };
  }

  // Gather project scores
  let totalOpActivity = 0;
  let totalUserVol = 0;
  let totalFeatAdoption = 0;
  let totalProjectCsat = 0;
  let totalProjectFinancial = 0;
  let projectCsatCount = 0;
  let totalActiveUserCount = 0;
  let totalAvgSessions = 0;
  let sessionProjectCount = 0;
  let totalEventCount = 0;
  let totalDistinctFeatures = 0;
  let opActivityProjectCount = 0;

  activeProjects.forEach((p) => {
    const pHealth = calculateProjectHealth(p, settings);
    totalOpActivity += pHealth.opActivity;
    totalUserVol += pHealth.userVol;
    totalFeatAdoption += pHealth.featAdoption;
    totalProjectFinancial += pHealth.financial;

    if (typeof p.activeUserCount === 'number') {
      totalActiveUserCount += p.activeUserCount;
    }
    if (typeof p.avgSessions === 'number') {
      totalAvgSessions += p.avgSessions;
      sessionProjectCount++;
    }
    if (typeof p.eventCount === 'number') {
      totalEventCount += p.eventCount;
    }
    if (typeof p.distinctFeatures === 'number') {
      totalDistinctFeatures += p.distinctFeatures;
      opActivityProjectCount++;
    }

    if (typeof pHealth.csat === 'number') {
      totalProjectCsat += pHealth.csat;
      projectCsatCount++;
    }
  });

  const activeCount = activeProjects.length > 0 ? activeProjects.length : 1; // Prevent div by 0

  const avgOpActivity = totalOpActivity / activeCount;
  const avgUserVol = totalUserVol / activeCount;
  const avgFeatAdoption = totalFeatAdoption / activeCount;
  let financial = Math.round(totalProjectFinancial / activeCount);
  if (hasSuspended) financial = 0;

  const avgProjectCsat = projectCsatCount > 0 ? totalProjectCsat / projectCsatCount : 'N/A';
  const supportCsatData = client.supportCsat;
  let supportCsat: number | 'N/A' = 'N/A';

  if (
    supportCsatData &&
    typeof supportCsatData === 'object' &&
    typeof supportCsatData.score === 'number'
  ) {
    supportCsat = supportCsatData.score;
  } else if (typeof supportCsatData === 'number') {
    supportCsat = supportCsatData;
  } else if (typeof client.clientCsat === 'number') {
    supportCsat = client.clientCsat;
  }

  let clientNps: number | 'N/A' = 'N/A';
  if (client.clientNps && typeof client.clientNps.score === 'number') {
    clientNps = client.clientNps.score;
  }

  const sentimentScores: number[] = [];
  if (avgProjectCsat !== 'N/A') sentimentScores.push(avgProjectCsat as number);
  if (supportCsat !== 'N/A') sentimentScores.push(supportCsat as number);
  if (clientNps !== 'N/A') sentimentScores.push(clientNps as number);

  let csat: number | 'N/A' = 'N/A';
  if (sentimentScores.length > 0) {
    csat = Math.round(sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length);
  }
  // Total Score Calculation uses the EXACT SAME weights as Projects
  const weights = {
    opActivity: settings.scoring?.weights?.opActivity ?? 35,
    featAdoption: settings.scoring?.weights?.featAdoption ?? 25,
    userVol: settings.scoring?.weights?.userVol ?? 15,
    financial: settings.scoring?.weights?.financial ?? 15,
    csat: settings.scoring?.weights?.csat ?? 10,
  };

  let totalScore: number | 'N/A' = 0;
  let totalWeight = 0;

  totalScore += avgOpActivity * (weights.opActivity / 100);
  totalWeight += weights.opActivity;

  totalScore += avgFeatAdoption * (weights.featAdoption / 100);
  totalWeight += weights.featAdoption;

  totalScore += avgUserVol * (weights.userVol / 100);
  totalWeight += weights.userVol;

  if (weights.financial !== undefined) {
    totalScore += financial * (weights.financial / 100);
    totalWeight += weights.financial;
  }

  if (csat !== 'N/A') {
    totalScore += csat * (weights.csat / 100);
    totalWeight += weights.csat;
  }

  if (totalWeight > 0) {
    totalScore = Math.round(((totalScore as number) / totalWeight) * 100);
  } else {
    totalScore = 'N/A';
  }

  const computedStatus = getClientComputedStatus(client, projects);
  if (computedStatus === 'Inactive' || computedStatus === 'Lost') {
    totalScore = 'N/A';
  }

  const avgSessionsFinal =
    sessionProjectCount > 0 ? Math.round((totalAvgSessions / sessionProjectCount) * 10) / 10 : 0;

  const avgDistinctFeaturesFinal =
    opActivityProjectCount > 0
      ? Math.round((totalDistinctFeatures / opActivityProjectCount) * 10) / 10
      : 0;

  return {
    totalScore,
    opActivity: Math.round(avgOpActivity),
    featAdoption: Math.round(avgFeatAdoption),
    userVol: Math.round(avgUserVol),
    financial,
    csat,
    hasSuspended,
    details: {
      invoiceStatus: client.invoiceStatus || 'Current',
      avgProjectCsat,
      supportCsat: supportCsatData !== undefined ? supportCsatData : supportCsat,
      activeUserCount: totalActiveUserCount,
      avgSessions: avgSessionsFinal,
      avgDistinctFeatures: avgDistinctFeaturesFinal,
      eventCount: totalEventCount,
      clientNps: client.clientNps || 'N/A',
    },
  };
}
