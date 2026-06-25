import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, CheckSquare } from 'lucide-react';
import { updateProjectRecord } from '../../../api/dbService';
import { useAppStore } from '../../../store/useAppStore';
import ProjectFeaturesTab from './ProjectFeaturesTab';

interface ProjectOverviewTabProps {
  project: any;
}

export default React.memo(function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  const user = useAppStore(state => state.user);

  const handleUpdate = async (field: string, value: any) => {
    if (!project || project[field] === value) return;
    try {
      const updates: any = { [field]: value };
      const fieldName = field === 'avesdoId' ? 'Avesdo ID' : field === 'teamworkLink' ? 'Teamwork Link' : field;
      const actionLog = `${fieldName} updated to ${value}`;
      await updateProjectRecord(
        { ...project, ...updates },
        { successMsg: `Updates to '${project.name}' saved successfully`, errorMsg: `Failed to save updates` },
        actionLog,
        user?.name
      );
    } catch (err) {
      console.error(err);
    }
  };

  return <ProjectFeaturesTab project={project} />;
});
