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
} from 'lucide-react';

export interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingAliasCount: number;
}

const WORKSPACE_TABS = [
  { id: 'global', label: 'Organization', icon: Globe },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'projects', label: 'Project Workflows', icon: Briefcase },
  { id: 'services', label: 'Service Catalog', icon: Users },
  { id: 'scoring', label: 'Health Scoring', icon: SettingsIcon },
  { id: 'templates', label: 'Form Templates', icon: LayoutTemplate },
];

export function SettingsSidebar({
  activeTab,
  setActiveTab,
  pendingAliasCount,
}: SettingsSidebarProps) {
  const OPERATIONS_TABS = [
    {
      id: 'pipeline',
      label: 'Data Imports',
      icon: Database,
      badge: pendingAliasCount > 0 ? pendingAliasCount : undefined,
    },
    { id: 'exports', label: 'Data Exports', icon: FileText },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'archives', label: 'Archives', icon: ArchiveRestore },
  ];

  return (
    <div className="w-full md:w-56 bg-white shrink-0 p-4 flex flex-col gap-6 overflow-y-auto custom-thin-scroll">
      <div className="mt-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-5 px-2">Settings</h2>

        <div className="mb-2 px-2 text-[13px] font-semibold text-slate-500 tracking-tight">
          Workspace
        </div>
        <div className="flex flex-col">
          {WORKSPACE_TABS.map((tab) => {
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
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2">
        <div className="mb-2 px-2 text-[13px] font-semibold text-slate-500 tracking-tight">
          Operations & Data
        </div>
        <div className="flex flex-col">
          {OPERATIONS_TABS.map((tab) => {
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
                {tab.badge !== undefined && (
                  <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
