import { useAppStore } from '../store/useAppStore';

export const PERMISSION_NODES = [
  // Settings: Workspace
  'view_org_settings',
  'edit_org_settings',
  'view_schedule',
  'edit_schedule',
  'view_project_workflows',
  'edit_project_workflows',
  'view_service_catalog',
  'edit_service_catalog',
  'view_health_scoring',
  'edit_health_scoring',
  'view_form_templates',
  'edit_form_templates',

  // Settings: Operations & Data
  'view_upload_log',
  'upload_csv',
  'resolve_imports',
  'run_exports',
  'view_audit_logs',
  'view_archives',
  'restore_archives',
  'hard_delete_archives',

  // System Administration
  'view_user_access',
  'manage_user_access',
  'view_roles',
  'manage_roles',

  // Academy
  'view_academy',
  'manage_academy',

  // Client Management
  'client_create',
  'client_edit_profile',
  'client_add_notes',
  'client_archive',
  'client_export',

  // Project Management
  'project_create',
  'project_edit_details',
  'project_add_notes',
  'project_archive',
  'project_export',

  // Service Management
  'service_create',
  'service_edit_details',
  'service_edit_financials',
  'service_add_notes',
  'service_archive',
  'service_export',
];

export function usePermissions() {
  const { user, settings, simulatedRoleId } = useAppStore();

  const hasPermission = (permission: string) => {
    if (!user) return false;

    const activeRoleId = simulatedRoleId || user.roleId;

    if (activeRoleId === 'super_admin') return true;

    if (!settings || !settings.roles) return false;

    const userRole = settings.roles.find((r: any) => r.id === activeRoleId);
    if (!userRole) return false;

    return userRole.permissions.includes(permission);
  };

  const hasAnySettingsPermission = () => {
    const settingsPermissions = [
      'view_org_settings',
      'view_schedule',
      'view_project_workflows',
      'view_service_catalog',
      'view_health_scoring',
      'view_form_templates',
      'view_upload_log',
      'run_exports',
      'view_audit_logs',
      'view_archives',
      'view_user_access',
      'view_roles',
    ];
    return settingsPermissions.some((p) => hasPermission(p));
  };

  return { hasPermission, hasAnySettingsPermission };
}
