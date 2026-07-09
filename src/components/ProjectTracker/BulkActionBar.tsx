import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Select } from '../ui/Select';
import { getSettingBadge } from '../../utils/uiUtils';
import { useAppStore } from '../../store/useAppStore';

interface BulkActionBarProps {
  selectedCount: number;
  settings: any;
  onClearSelection: () => void;
  onBulkUpdate: (updates: Record<string, any>) => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  settings,
  onClearSelection,
  onBulkUpdate,
}) => {
  const users = useAppStore((state) => state.users);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});

  const getUserName = (id: string) => {
    const u = users.find((user) => user.uid === id);
    return (u ? u.displayName || u.name || u.email || id : id).trim();
  };

  useEffect(() => {
    if (selectedCount === 0) {
      setPendingUpdates({});
    }
  }, [selectedCount]);

  const handleApply = () => {
    onBulkUpdate(pendingUpdates);
  };

  const hasUpdates = Object.keys(pendingUpdates).length > 0;

  if (selectedCount === 0) return null;

  return (
    <div
      id="pt-bulk-action-bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-2.5 flex items-center gap-4 z-[var(--z-popover)] animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300 ease-out pointer-events-auto border border-slate-200/60 whitespace-nowrap ring-1 ring-white/50"
    >
      <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shrink-0">
          {selectedCount}
        </span>
        <span className="text-[13px] font-bold text-slate-700">Projects Selected</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Manager Select */}
        <div className="relative">
          <Select
            value={pendingUpdates.assignee || 'Unassigned'}
            options={users
              .filter((u) => u.isAccountManager && !u.isDeactivated)
              .map((u) => ({
                label: getSettingBadge('managers', u.uid, settings),
                value: u.uid,
              }))}
            onChange={(val) => setPendingUpdates((prev) => ({ ...prev, assignee: val }))}
            hideCheckmark={false}
            position="top"
            trigger={
              <button
                className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus:outline-none ${pendingUpdates.assignee ? 'text-primary bg-primary/5 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {pendingUpdates.assignee
                  ? `Manager: ${getUserName(pendingUpdates.assignee)}`
                  : 'Manager...'}
              </button>
            }
          />
        </div>

        {/* Status Select */}
        <div className="relative">
          <Select
            value={pendingUpdates.projectStatus || ''}
            options={(settings?.statuses?.map((s: any) => s.name) || []).map((s: any) => ({
              label: getSettingBadge('statuses', s, settings),
              value: s,
            }))}
            onChange={(val) => setPendingUpdates({ ...pendingUpdates, projectStatus: val })}
            hideCheckmark={false}
            position="top"
            trigger={
              <button
                className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus:outline-none ${pendingUpdates.projectStatus ? 'text-primary bg-primary/5 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {pendingUpdates.projectStatus
                  ? `Status: ${pendingUpdates.projectStatus}`
                  : 'Status...'}
              </button>
            }
          />
        </div>

        {/* Schedule Status Select */}
        <div className="relative">
          <Select
            value={pendingUpdates.timelineStatus || ''}
            options={(settings?.timelines?.map((t: any) => t.name) || []).map((t: any) => ({
              label: getSettingBadge('timelines', t, settings),
              value: t,
            }))}
            onChange={(val) => setPendingUpdates({ ...pendingUpdates, timelineStatus: val })}
            hideCheckmark={false}
            position="top"
            trigger={
              <button
                className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus:outline-none ${pendingUpdates.timelineStatus ? 'text-primary bg-primary/5 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {pendingUpdates.timelineStatus
                  ? `Schedule: ${pendingUpdates.timelineStatus}`
                  : 'Schedule...'}
              </button>
            }
          />
        </div>

        {/* Phase Select */}
        <div className="relative">
          <Select
            value={pendingUpdates.onboardingPhase || ''}
            options={(settings?.phases?.map((p: any) => p.name) || []).map((p: any) => ({
              label: getSettingBadge('phases', p, settings),
              value: p,
            }))}
            onChange={(val) => setPendingUpdates({ ...pendingUpdates, onboardingPhase: val })}
            hideCheckmark={false}
            position="top"
            trigger={
              <button
                className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus:outline-none ${pendingUpdates.onboardingPhase ? 'text-primary bg-primary/5 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {pendingUpdates.onboardingPhase
                  ? `Implementation: ${pendingUpdates.onboardingPhase}`
                  : 'Implementation...'}
              </button>
            }
          />
        </div>

        {hasUpdates && (
          <button
            onClick={handleApply}
            className="ml-2 px-4 py-1.5 bg-primary text-primary-foreground text-[13px] font-bold rounded-full shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all hover:-translate-y-0.5 animate-in fade-in zoom-in"
          >
            Update
          </button>
        )}
      </div>

      <button
        onClick={onClearSelection}
        className="ml-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
