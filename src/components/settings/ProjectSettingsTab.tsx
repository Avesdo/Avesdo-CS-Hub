import React from 'react';
import { SettingsList } from './SettingsList';
import { usePermissions } from '../../hooks/usePermissions';

export function ProjectSettingsTab() {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('edit_project_workflows');
  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
      <div className="space-y-12">
        <SettingsList
          title="Project Status"
          desc="Workflow stages for projects."
          fieldName="statuses"
          canEdit={canEdit}
        />
        <SettingsList
          title="Schedule Status"
          desc="Schedule statuses for projects."
          fieldName="timelines"
          canEdit={canEdit}
        />
        <SettingsList
          title="Implementation Status"
          desc="Milestones for project execution."
          fieldName="phases"
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
