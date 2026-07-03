import React from 'react';
import { SettingsList } from './SettingsList';

export function ProjectSettingsTab() {
  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
      <div className="space-y-12">
        <SettingsList
          title="Project Status"
          desc="Workflow stages for projects."
          fieldName="statuses"
        />
        <SettingsList
          title="Schedule Status"
          desc="Schedule statuses for projects."
          fieldName="timelines"
        />
        <SettingsList
          title="Implementation Status"
          desc="Milestones for project execution."
          fieldName="phases"
        />
      </div>
    </div>
  );
}
