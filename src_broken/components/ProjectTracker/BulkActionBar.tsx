import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Select } from '../ui/Select';
import { getSettingBadge } from '../../utils/uiUtils';

interface BulkActionBarProps {
  selectedCount: number;
  settings: any;
  onClearSelection: () => void;
  onBulkUpdate: (field: string, value: string) => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  settings,
  onClearSelection,
  onBulkUpdate
}) => {
  if (selectedCount === 0) return null;

  return (
    <div id="pt-bulk-action-bar" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-2xl px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300 pointer-events-auto">
      <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
          {selectedCount}
        </span>
        <span className="text-sm font-medium whitespace-nowrap text-slate-700">Projects Selected</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Manager Select */}
        <div className="relative">
          <Select
            value=""
            options={(settings?.managers?.map((m: any) => m.name) || []).map((m: any) => ({ label: getSettingBadge('managers', m, settings), value: m }))}
            onChange={(val) => onBulkUpdate('assignee', val)}
            hideCheckmark={true}
            position="top"
            trigger={
              <button className="text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                Update Manager...
              </button>
            }
          />
        </div>

        {/* Status Select */}
        <div className="relative">
          <Select
            value=""
            options={(settings?.statuses?.map((s: any) => s.name) || []).map((s: any) => ({ label: getSettingBadge('statuses', s, settings), value: s }))}
            onChange={(val) => onBulkUpdate('projectStatus', val)}
            hideCheckmark={true}
            position="top"
            trigger={
              <button className="text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                Update Status...
              </button>
            }
          />
        </div>

        {/* Timeline Select */}
        <div className="relative">
          <Select
            value=""
            options={(settings?.timelines?.map((t: any) => t.name) || []).map((t: any) => ({ label: getSettingBadge('timelines', t, settings), value: t }))}
            onChange={(val) => onBulkUpdate('timelineStatus', val)}
            hideCheckmark={true}
            position="top"
            trigger={
              <button className="text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                Update Timeline...
              </button>
            }
          />
        </div>

        {/* Phase Select */}
        <div className="relative">
          <Select
            value=""
            options={(settings?.phases?.map((p: any) => p.name) || []).map((p: any) => ({ label: getSettingBadge('phases', p, settings), value: p }))}
            onChange={(val) => onBulkUpdate('onboardingPhase', val)}
            hideCheckmark={true}
            position="top"
            trigger={
              <button className="text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                Update Phase...
              </button>
            }
          />
        </div>
      </div>

      <button onClick={onClearSelection} className="ml-2 p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
