"import React, { useState, useEffect } from 'react';\nimport { CheckCircle2, Circle } from 'lucide-react';\nimport { updateProjectRecord } from '../../../api/dbService';\nimport { useAppState } from '../../../context/AppStateContext';\n\ninterface ProjectFeaturesTabProps {\n  project: any;\n}\n\nexport default function ProjectFeaturesTab({ project }: ProjectFeaturesTabProps) {\n  const { settings, projects, setProjects } = useAppState();\n  \n  // Local state for optimistic UI feedback\n  const [localFeatures, setLocalFeatures] = useState<string[]>(project?.features || []);\n\n  // Sync local state if the external project prop changes\n  useEffect(() => {\n    setLocalFeatures(project?.features || []);\n  }, [project?.features]);\n\n  const handleToggle = async (feature: string) => {\n    if (!project) return;\n    \n    const isCurrentlyActive = localFeatures.includes(feature);\n    \n    // Optimistic evaluation\n    const newFeatures = isCurrentlyActive\n      ? localFeatures.filter((f: string) => f !== feature)\n      : [...localFeatures, feature];\n      \n    // Optimistic UI Update (local tab)\n    setLocalFeatures(newFeatures);\n\n    // Optimistic UI Update (global context so the Header gauge recalculates instantly)\n    if (setProjects && projects) {\n        setProjects(projects.map(p => p.id === project.id ? { ...p, features: newFeatures } : p));\n    }\n\n    try {\n      // Background Sync\n      await updateProjectRecord({ ...project, features: newFeatures });\n    } catch (err) {\n      console.error(\"Failed to sync feature toggle\", err);\n      // Rollback on error\n      setLocalFeatures(project?.features || []);\n      if (setProjects && projects) {\n        setProjects(projects.map(p => p.id === project.id ? { ...p, features: project.features } : p));\n      }\n    }\n  };\n\n  const featuresList = settings?.features?.length ? settings.features : ['Contracts', 'Inventory', 'Pricing', 'Deposits', 'Payments', 'Allocations', 'Workflows', 'Reporting'];\n  const activeCount = featuresList.filter(
<truncated 2532 bytes>
import { updateProjectRecord, addProjectAutoLog } from '../../../api/dbService';
  
  // Local state for optimistic UI feedback
  const [localFeatures, setLocalFeatures] = useState<string[]>(project?.features || []);

  // Sync local state if the external project prop changes
  useEffect(() => {
    setLocalFeatures(project?.features || []);
  const { settings, projects, user } = useAppState();

  const handleToggle = async (feature: string) => {
    if (!project) return;
    
    const isCurrentlyActive = localFeatures.includes(feature);
    
    // Optimistic evaluation
    const newFeatures = isCurrentlyActive
      ? localFeatures.filter((f: string) => f !== feature)
      : [...localFeatures, feature];
      
    // Optimistic UI Update (local tab)
    setLocalFeatures(newFeatures);

    try {
      // Background Sync
      await updateProjectRecord({ ...project, features: newFeatures });
    } catch (err) {
      console.error("Failed to sync feature toggle", err);
      // Rollback on error
    try {
      // Background Sync
      await updateProjectRecord({ ...project, features: newFeatures });
      
      await updateProjectRecord({ ...project, features: newFeatures }, {
        successMsg: `Active Features successfully updated for '${project.name}'.`,
        errorMsg: `Failed to update features for '${project.name}'.`
      });
          ? `Deactivated feature: ${feature}`
          : `Activated feature: ${feature}`;
      await addProjectAutoLog(project.id, logMsg, user?.name || 'System');
      
    } catch (err) {
      console.error("Failed to sync feature toggle", err);
      // Rollback on error
      setLocalFeatures(project?.features || []);
    }
  };