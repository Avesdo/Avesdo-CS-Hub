import React from 'react';
import {
  Globe,
  Briefcase,
  Users,
  Settings as SettingsIcon,
  ArchiveRestore,
  History,
  LayoutTemplate,
  Database,
  FileText,
  Calendar,
  ShieldAlert,
  UserCog,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

export interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingAliasCount: number;
}

export function SettingsSidebar({
  activeTab,
  setActiveTab,
  pendingAliasCount,
}: SettingsSidebarProps) {
  const { hasPermission } = usePermissions();

  const WORKSPACE_TABS = [
    { id: 'global', label: 'Organization', icon: Globe, permission: 'view_org_settings' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, permission: 'view_schedule' },
    {
      id: 'projects',
      label: 'Project Workflows',
      icon: Briefcase,
      permission: 'view_project_workflows',
    },
    { id: 'services', label: 'Service Catalog', icon: Users, permission: 'view_service_catalog' },
    {
      id: 'scoring',
      label: 'Health Scoring',
      icon: SettingsIcon,
      permission: 'view_health_scoring',
    },
    {
      id: 'templates',
      label: 'Form Templates',
      icon: LayoutTemplate,
      permission: 'view_form_templates',
    },
  ];

  const OPERATIONS_TABS = [
    {
      id: 'pipeline',
      label: 'Data Imports',
      icon: Database,
      permission: 'view_upload_log',
      badge: pendingAliasCount > 0 ? pendingAliasCount : undefined,
    },
    { id: 'exports', label: 'Data Exports', icon: FileText, permission: 'run_exports' },
    { id: 'audit', label: 'Audit Logs', icon: History, permission: 'view_audit_logs' },
    { id: 'archives', label: 'Archives', icon: ArchiveRestore, permission: 'view_archives' },
  ];

  const ADMIN_TABS = [
    { id: 'user_access', label: 'User Access', icon: Users, permission: 'view_user_access' },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldAlert, permission: 'view_roles' },
  ];

  const renderTabs = (tabs: typeof WORKSPACE_TABS) => {
    const visibleTabs = tabs.filter((tab) => hasPermission(tab.permission));
    if (visibleTabs.length === 0) return null;

    return (
      <div className="flex flex-col">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                isActive
                  ? 'bg-slate-50 text-primary shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              {tab.label}
              {(tab as any).badge !== undefined && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {(tab as any).badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const hasWorkspaceTabs = WORKSPACE_TABS.some((t) => hasPermission(t.permission));
  const hasOperationsTabs = OPERATIONS_TABS.some((t) => hasPermission(t.permission));
  const hasAdminTabs = ADMIN_TABS.some((t) => hasPermission(t.permission));

  return (
    <div className="w-full md:w-56 bg-white shrink-0 p-4 flex flex-col gap-6 overflow-y-auto custom-thin-scroll">
      <div className="mt-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-5 px-2">Settings</h2>

        {hasWorkspaceTabs && (
          <div className="mb-6">
            <div className="mb-2 px-2 text-[13px] font-semibold text-slate-500 tracking-tight">
              Workspace
            </div>
            {renderTabs(WORKSPACE_TABS)}
          </div>
        )}

        {hasOperationsTabs && (
          <div className="mb-6">
            <div className="mb-2 px-2 text-[13px] font-semibold text-slate-500 tracking-tight">
              Operations & Data
            </div>
            {renderTabs(OPERATIONS_TABS)}
          </div>
        )}

        {hasAdminTabs && (
          <div className="mb-6">
            <div className="mb-2 px-2 text-[13px] font-semibold text-slate-500 tracking-tight">
              System Administration
            </div>
            {renderTabs(ADMIN_TABS)}
          </div>
        )}
      </div>
    </div>
  );
}
