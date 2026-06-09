"import { Client, Project, Settings } from '../types';\n\nexport interface ProjectHealthResult {\n  totalScore: number | \"N/A\";\n  opActivity: number;\n  featAdoption: number;\n  userVol: number;\n  csat: number | \"N/A\";\n}\n\nexport interface ClientHealthResult {\n  totalScore: number | \"N/A\";\n  financial: number;\n  engagement: number;\n  utilization: number;\n  experience: number;\n  hasSuspended: boolean;\n}\n\nexport function calculateProjectHealth(project: any, settings: Settings | null): ProjectHealthResult {\n  const defaultResult: ProjectHealthResult = {\n    totalScore: \"N/A\",\n    opActivity: 0,\n    featAdoption: 0,\n    userVol: 0,\n    csat: \"N/A\"\n  };\n\n  if (!project || !settings) return defaultResult;\n\n  if (project.projectStatus === 'Onboarding' || project.projectStatus === 'Closed') {\n    return defaultResult;\n  }\n\n  // Calculate raw sub-pillars\n  const opActivity = typeof project.score_op === 'number' ? project.score_op : 0;\n  const userVol = typeof project.score_usr === 'number' ? project.score_usr : 0;\n  \n  // Feature Adoption\n  const activeFeatures = Array.isArray(project.features) ? project.features.length : 0;\n  const totalFeatures = Array.isArray(settings.features) && settings.features.length > 0 ? settings.features.length : 1;\n  const featAdoption = Math.round((activeFeatures / totalFeatures) * 100);\n\n  // CSAT\n  let csat: number | \"N/A\" = \"N/A\";\n  if (project.csat === 'Satisfied') csat = 100;\n  else if (project.csat === 'Neutral') csat = 50;\n  else if (project.csat === 'Dissatisfied') csat = 0;\n\n  if (project.projectStatus === 'Suspended') {\n    return {\n      totalScore: 0,\n      opActivity,\n      featAdoption,\n      userVol,\n      csat\n    };\n  }\n\n  // Math - Weights\n  const weights = settings.scoring?.weights || { opActivity: 40, featAdoption: 30, userVol: 20, csat: 10 };\n  \n  let totalScore = 0;\n  let totalWeight = 0;\n\n  totalScore += opActivity * (weights.opActivity / 100);\n  totalWeight += weights.opActivity;\n\n  totalScore 
<truncated 4320 bytes>
  // Dynamic Re-weighting
  if (totalWeight > 0) {
    totalScore = Math.round((totalScore as number / totalWeight) * 100);
  } else {
    totalScore = "N/A";
  }

  if (project.projectStatus === 'Onboarding' || project.projectStatus === 'Closed') {
    totalScore = "N/A";
  }
  if (!project || !settings) return defaultResult;
  const activeProjects = clientProjects.filter(p => p.projectStatus !== 'Onboarding' && p.projectStatus !== 'Closed');
  // Math - Weights