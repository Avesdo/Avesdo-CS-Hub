import React, { useState, useEffect } from 'react';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebase';
import { useAppStore } from '../store/useAppStore';
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
  AlertTriangle,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { getPendingAliases } from '../api/dbService';

import TemplateDesigner from '../components/admin/TemplateDesigner';
import { RecentUploadActivity } from '../components/admin/RecentUploadActivity';
import { AuditLogViewer } from '../components/admin/AuditLogViewer';
import { DataExportHub } from '../components/admin/DataExportHub';
import { AutoProcessedModal } from '../components/admin/AutoProcessedModal';
import { DataUploadModal } from '../components/admin/DataUploadModal';
import { DataIntakePipelineModal } from '../components/admin/DataIntakePipelineModal';

// Tab components
import { GlobalSettingsTab } from '../components/settings/GlobalSettingsTab';
import { ScheduleSettingsTab } from '../components/settings/ScheduleSettingsTab';
import { ProjectSettingsTab } from '../components/settings/ProjectSettingsTab';
import { ServiceSettingsTab } from '../components/settings/ServiceSettingsTab';
import { ScoringSettingsTab } from '../components/settings/ScoringSettingsTab';
import { ArchivesTab } from '../components/settings/ArchivesTab';
import { SettingsSidebar } from '../components/settings/SettingsSidebar';

export default function Settings() {
  const settings = useAppStore((state) => state.settings);
  const projects = useAppStore((state) => state.projects);

  const [activeTab, setActiveTab] = useState<
    | 'global'
    | 'schedule'
    | 'projects'
    | 'services'
    | 'scoring'
    | 'templates'
    | 'pipeline'
    | 'exports'
    | 'archives'
    | 'audit'
  >('global');

  // --- AUDIT TRAIL STATE ---
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [viewingUploadLog, setViewingUploadLog] = useState<any | null>(null);
  const [pendingAliasCount, setPendingAliasCount] = useState(0);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const aliases = await getPendingAliases();
        setPendingAliasCount(aliases.length);
      } catch (err) {
        console.error('Failed to fetch pending aliases count', err);
      }
    };

    fetchPendingCount();

    window.addEventListener('pipeline-updated', fetchPendingCount);
    return () => window.removeEventListener('pipeline-updated', fetchPendingCount);
  }, []);

  const loadLogs = async () => {
    // Deprecated: handled by onSnapshot
  };

  useEffect(() => {
    setLoadingLogs(true);
    const oneYearAgo = new Date().getTime() - 365 * 24 * 60 * 60 * 1000;
    const q = query(collection(db, 'system_logs'), where('timestamp', '>=', oneYearAgo));
    const unsub = onSnapshot(q, (snap) => {
      const validLogs = snap.docs.map((doc) => doc.data());
      validLogs.sort((a: any, b: any) => b.timestamp - a.timestamp);
      setLogs(validLogs);
      setLoadingLogs(false);
    });
    return () => unsub();
  }, []);

  const getTemplate = (formName: string) => {
    let templateId = Object.keys(settings?.templates || {}).find(
      (k) => settings?.templates?.[k]?.name === formName
    );
    if (!templateId) {
      templateId = Object.keys(settings?.templates || {}).find(
        (k) => settings?.templates?.[k]?.type === 'form'
      );
    }
    return templateId ? settings?.templates?.[templateId] : null;
  };

  if (!settings) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <div className="animate-pulse text-muted-foreground text-sm font-medium">
          Loading settings...
        </div>
      </div>
    );
  }

  const tabTitleMap: Record<string, string> = {
    global: 'Organization Settings',
    schedule: 'Team Schedule',
    projects: 'Project Workflows',
    services: 'Service Catalog',
    scoring: 'Health Scoring',
    templates: 'Form Templates',
    pipeline: 'Data Ingestion Pipeline',
    exports: 'Data Exports',
    audit: 'Audit Logs',
    archives: 'Archives',
  };

  const tabSubtitleMap: Record<string, string> = {
    global:
      'Manage fundamental taxonomies, team members, and capabilities that power your workspace.',
    schedule: 'Configure fixed EST/PST shifts, time off, and statutory holidays for the team.',
    projects: 'Configure project stages, schedule statuses, and implementation phases.',
    services: 'Manage the available services, types, and fulfillment statuses.',
    scoring: 'Configure how client health scores are calculated and their threshold indicators.',
    templates: 'Build and manage all dynamic checklist and form templates used across projects.',
    pipeline:
      'A guided workflow to upload new CSV data, compile it into the system, and map any unmatched records.',
    exports:
      'Export combined project form submissions. Each export aggregates data from all projects that have completed the specific form.',
  };

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-white">
      <div className="flex w-full h-full">
        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab as any}
          pendingAliasCount={pendingAliasCount}
        />

        {/* MAIN CONTENT AREA */}
        <div
          className={`flex-1 bg-white relative ${activeTab !== 'templates' ? 'overflow-y-auto custom-thin-scroll' : 'flex flex-col overflow-hidden'}`}
        >
          {activeTab !== 'templates' && (
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-10 pt-8 pb-6 border-b border-transparent">
              <h1 className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">
                {tabTitleMap[activeTab]}
              </h1>
              {tabSubtitleMap[activeTab] && (
                <p className="text-slate-500 text-[15px]">{tabSubtitleMap[activeTab]}</p>
              )}
            </div>
          )}
          <div
            className={
              activeTab === 'templates'
                ? 'flex-1 flex flex-col overflow-hidden min-h-0'
                : 'px-10 pb-10'
            }
          >
            {activeTab === 'global' && <GlobalSettingsTab />}
            {activeTab === 'schedule' && <ScheduleSettingsTab />}
            {activeTab === 'projects' && <ProjectSettingsTab />}
            {activeTab === 'services' && <ServiceSettingsTab />}
            {activeTab === 'scoring' && <ScoringSettingsTab />}
            {activeTab === 'templates' && (
              <div className="flex-1 flex flex-col h-full w-full animate-in fade-in duration-300 overflow-hidden min-h-0">
                <TemplateDesigner />
              </div>
            )}
            {activeTab === 'pipeline' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      Data Imports
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
                      Upload CSV exports to update global metrics and map new data automatically.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 h-10 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                  >
                    <LucideIcons.UploadCloud className="w-4 h-4" />
                    New Import
                  </button>
                </div>
                {pendingAliasCount > 0 && (
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Mapping Resolution Required
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          There {pendingAliasCount === 1 ? 'is' : 'are'} {pendingAliasCount} recent
                          upload{pendingAliasCount === 1 ? '' : 's'} with unrecognized aliases that
                          require your attention.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPipelineModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 h-9 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors shadow-sm whitespace-nowrap"
                    >
                      Resolve Mapping
                    </button>
                  </div>
                )}
                <div className="w-full">
                  <RecentUploadActivity logs={logs} setViewingUploadLog={setViewingUploadLog} />
                </div>
                <DataUploadModal
                  isOpen={isUploadModalOpen}
                  onClose={() => setIsUploadModalOpen(false)}
                />
                <DataIntakePipelineModal
                  isOpen={isPipelineModalOpen}
                  onClose={() => setIsPipelineModalOpen(false)}
                  onPendingCountChange={setPendingAliasCount}
                  pendingCount={pendingAliasCount}
                />
              </div>
            )}
            {activeTab === 'audit' && (
              <AuditLogViewer
                logs={logs}
                loadLogs={loadLogs}
                setViewingUploadLog={setViewingUploadLog}
                loadingLogs={loadingLogs}
              />
            )}
            {activeTab === 'archives' && <ArchivesTab loadLogs={loadLogs} />}
            {activeTab === 'exports' && (
              <DataExportHub projects={projects} getTemplate={getTemplate} />
            )}
            <AutoProcessedModal
              isOpen={!!viewingUploadLog}
              onClose={() => setViewingUploadLog(null)}
              log={viewingUploadLog}
              onUpdate={loadLogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
