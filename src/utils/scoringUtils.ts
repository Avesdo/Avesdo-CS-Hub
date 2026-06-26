import { Settings } from '../types';

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
    supportCsat: number | 'N/A';
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
    const csatValues = Object.values(project.health.onboardingCsat);
    let totalScore = 0;
    let count = 0;

    csatValues.forEach((val) => {
      if (typeof val === 'string') {
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
  } else if (project.onboardingCsat && typeof project.onboardingCsat.score === 'number') {
    csat = project.onboardingCsat.score;
  } else if (project.csat === 'Satisfied') {
    csat = 100;
  } else if (project.csat === 'Neutral') {
    csat = 50;
  } else if (project.csat === 'Dissatisfied') {
    csat = 0;
  }

  // Financial Standing
  let financial = 100; // Default to Current
  const invoiceStatus = project.invoiceStatus || '';
  if (
    project.projectStatus === 'Suspended' ||
    invoiceStatus === 'Suspend' ||
    invoiceStatus === 'Suspended'
  ) {
    financial = 0;
  } else if (
    project.daysOutstanding >= 60 ||
    invoiceStatus === 'Overdue 60+ Days' ||
    invoiceStatus === 'Overdue 60+'
  ) {
    financial = 0;
  } else if (
    project.daysOutstanding >= 30 ||
    invoiceStatus === 'Overdue 30 Days' ||
    invoiceStatus === 'Overdue 30'
  ) {
    financial = 50;
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

  activeProjects.forEach((p) => {
    const pHealth = calculateProjectHealth(p, settings);
    totalOpActivity += pHealth.opActivity;
    totalUserVol += pHealth.userVol;
    totalFeatAdoption += pHealth.featAdoption;
    totalProjectFinancial += pHealth.financial;
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
  const supportCsat = typeof client.supportCsat === 'number' ? client.supportCsat : 'N/A';

  let csat: number | 'N/A' = 'N/A';
  if (avgProjectCsat !== 'N/A' && supportCsat !== 'N/A') {
    csat = Math.round(((avgProjectCsat as number) + (supportCsat as number)) / 2);
  } else if (avgProjectCsat !== 'N/A') {
    csat = Math.round(avgProjectCsat as number);
  } else if (supportCsat !== 'N/A') {
    csat = Math.round(supportCsat as number);
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
      supportCsat,
    },
  };
}
