import React from 'react';
import { SettingsList } from './SettingsList';

export function ServiceSettingsTab() {
  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
      <div className="space-y-12">
        <SettingsList
          title="Available Services"
          desc="Available billable services."
          fieldName="services"
        />
        <SettingsList title="Service Types" desc="Categories of services." fieldName="serviceTypes" />
        <SettingsList
          title="Service Outcomes"
          desc="Outcome statuses for services."
          fieldName="serviceOutcomes"
        />
        <SettingsList
          title="Fulfillment Status"
          desc="Lifecycle stages for services."
          fieldName="serviceStatuses"
        />
      </div>
    </div>
  );
}
