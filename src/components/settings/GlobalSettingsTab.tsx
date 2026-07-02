import React from 'react';
import { SettingsList } from './SettingsList';

export function GlobalSettingsTab() {
  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
      <div className="space-y-12">
        <SettingsList
          title="Account Managers"
          desc="Manage the users who can be assigned to clients and projects."
          fieldName="managers"
        />
        <SettingsList title="Client Types" desc="Classify your clients." fieldName="clientTypes" />
        <SettingsList
          title="Platform Features"
          desc="System features and modules."
          fieldName="features"
        />
      </div>
    </div>
  );
}
