/**
 * Backend port of the frontend scoringUtils.ts logic.
 * Calculates health scores for Projects and Clients identically to the React frontend.
 */

function calculateProjectHealth(project, settings) {
  const defaultResult = {
    totalScore: "N/A",
    opActivity: 0,
    featAdoption: 0,
    userVol: 0,
    csat: "N/A"
  };

  if (!project || !settings) return defaultResult;

  // Calculate raw sub-pillars (clamped to 100 max)
  const rawOp = typeof project.opActivity === 'number' ? project.opActivity : (typeof project.score_op === 'number' ? project.score_op : 0);
  const rawUsr = typeof project.userVol === 'number' ? project.userVol : (typeof project.score_usr === 'number' ? project.score_usr : 0);
  
  const opActivity = Math.min(rawOp, 100);
  const userVol = Math.min(rawUsr, 100);
  
  // Feature Adoption
  const activeFeatures = Array.isArray(project.features) ? project.features.length : 0;
  const totalFeatures = Array.isArray(settings.features) && settings.features.length > 0 ? settings.features.length : 1;
  const featAdoption = Math.round((activeFeatures / totalFeatures) * 100);

  // CSAT
  let csat = "N/A";
  if (project.csat === 'Satisfied') csat = 100;
  else if (project.csat === 'Neutral') csat = 50;
  else if (project.csat === 'Dissatisfied') csat = 0;

  // Math - Weights
  const weights = settings.scoring?.weights || { opActivity: 40, featAdoption: 30, userVol: 20, csat: 10 };
  
  let totalScore = 0;
  let totalWeight = 0;

  totalScore += opActivity * (weights.opActivity / 100);
  totalWeight += weights.opActivity;

  totalScore += featAdoption * (weights.featAdoption / 100);
  totalWeight += weights.featAdoption;

  totalScore += userVol * (weights.userVol / 100);
  totalWeight += weights.userVol;

  if (csat !== "N/A") {
    totalScore += csat * (weights.csat / 100);
    totalWeight += weights.csat;
  }

  // Dynamic Re-weighting
  if (totalWeight > 0) {
    totalScore = Math.round((totalScore / totalWeight) * 100);
  } else {
    totalScore = "N/A";
  }

  if (project.projectStatus === 'Onboarding' || project.projectStatus === 'Closed') {
    totalScore = "N/A";
  }

  return {
    totalScore,
    opActivity,
    featAdoption,
    userVol,
    csat
  };
}

function calculateClientHealth(client, projects, settings) {
  const defaultResult = {
    totalScore: "N/A",
    financial: 0,
    engagement: 0,
    utilization: 0,
    experience: 0,
    hasSuspended: false,
    details: {
      invoiceStatus: "Current",
      avgOpActivity: 0,
      avgUserVol: 0,
      avgProjectCsat: "N/A",
      supportCsat: "N/A"
    }
  };

  if (!client || !settings) return defaultResult;

  const clientProjects = projects.filter(p => p.clientIds?.includes(client.clientId || client.id) || p.clients?.includes(client.companyName || client.name));
  const activeProjects = clientProjects.filter(p => p.projectStatus !== 'Onboarding' && p.projectStatus !== 'Closed');
  const hasSuspended = clientProjects.some(p => p.projectStatus === 'Suspended');

  // Financial Standing
  let financial = 100; // Default to Current
  const invoiceStatus = client.invoiceStatus || '';
  if (hasSuspended || invoiceStatus === 'Suspended') {
    financial = 0;
  } else if (invoiceStatus === 'Overdue 60+ Days' || invoiceStatus === 'Overdue 60+') {
    financial = 0;
  } else if (invoiceStatus === 'Overdue 30 Days' || invoiceStatus === 'Overdue 30') {
    financial = 50;
  }

  if (activeProjects.length === 0 && !hasSuspended) {
    return { ...defaultResult, financial, hasSuspended };
  }

  // Gather project scores
  let totalOpActivity = 0;
  let totalUserVol = 0;
  let totalFeatAdoption = 0;
  let totalProjectCsat = 0;
  let projectCsatCount = 0;

  activeProjects.forEach(p => {
    const pHealth = calculateProjectHealth(p, settings);
    totalOpActivity += pHealth.opActivity;
    totalUserVol += pHealth.userVol;
    totalFeatAdoption += pHealth.featAdoption;
    if (typeof pHealth.csat === 'number') {
      totalProjectCsat += pHealth.csat;
      projectCsatCount++;
    }
  });

  const activeCount = activeProjects.length > 0 ? activeProjects.length : 1; // Prevent div by 0

  const avgOpActivity = totalOpActivity / activeCount;
  const avgUserVol = totalUserVol / activeCount;
  
  // Engagement
  const engagement = Math.round((avgOpActivity + avgUserVol) / 2);

  // Utilization
  const utilization = Math.round(totalFeatAdoption / activeCount);

  // Client Experience
  const avgProjectCsat = projectCsatCount > 0 ? totalProjectCsat / projectCsatCount : "N/A";
  const supportCsat = typeof client.supportCsat === 'number' ? client.supportCsat : "N/A";

  let experience = 0;
  let hasExperience = false;

  if (avgProjectCsat !== "N/A" && supportCsat !== "N/A") {
    experience = Math.round((avgProjectCsat + supportCsat) / 2);
    hasExperience = true;
  } else if (avgProjectCsat !== "N/A") {
    experience = Math.round(avgProjectCsat);
    hasExperience = true;
  } else if (supportCsat !== "N/A") {
    experience = Math.round(supportCsat);
    hasExperience = true;
  }

  // Total Score Calculation
  const weights = settings.scoring?.clientWeights || { billing: 15, engagement: 50, utilization: 25, experience: 10 };
  
  let totalScore = 0;
  let totalWeight = 0;

  totalScore += financial * (weights.billing / 100);
  totalWeight += weights.billing;

  totalScore += engagement * (weights.engagement / 100);
  totalWeight += weights.engagement;

  totalScore += utilization * (weights.utilization / 100);
  totalWeight += weights.utilization;

  if (hasExperience) {
    totalScore += experience * (weights.experience / 100);
    totalWeight += weights.experience;
  }

  if (totalWeight > 0) {
    totalScore = Math.round((totalScore / totalWeight) * 100);
  } else {
    totalScore = "N/A";
  }

  return {
    totalScore,
    financial,
    engagement,
    utilization,
    experience: hasExperience ? experience : 0, // Fallback purely for display
    hasSuspended,
    details: {
      invoiceStatus,
      avgOpActivity: Math.round(avgOpActivity),
      avgUserVol: Math.round(avgUserVol),
      avgProjectCsat,
      supportCsat
    }
  };
}
