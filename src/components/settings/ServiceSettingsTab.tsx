import React from 'react';
import { SettingsList } from './SettingsList';
import { usePermissions } from '../../hooks/usePermissions';

export function ServiceSettingsTab() {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('edit_service_catalog');
  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
      <div className="space-y-12">
        <SettingsList
          title="Available Services"
          desc="Available billable services."
          fieldName="services"
          canEdit={canEdit}
        />
        <SettingsList
          title="Service Types"
          desc="Categories of services."
          fieldName="serviceTypes"
          canEdit={canEdit}
        />
        <SettingsList
          title="Service Outcomes"
          desc="Outcome statuses for services."
          fieldName="serviceOutcomes"
          canEdit={canEdit}
        />
        <SettingsList
          title="Fulfillment Status"
          desc="Lifecycle stages for services."
          fieldName="serviceStatuses"
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
