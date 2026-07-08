import React, { useState, useEffect } from 'react';
import { SettingsList } from './SettingsList';
import { usePermissions } from '../../hooks/usePermissions';

export function GlobalSettingsTab() {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('edit_org_settings');

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
      <div className="space-y-12">
        <SettingsList
          title="Client Types"
          desc="Classify your clients."
          fieldName="clientTypes"
          canEdit={canEdit}
        />
        <SettingsList
          title="Platform Features"
          desc="System features and modules."
          fieldName="features"
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
