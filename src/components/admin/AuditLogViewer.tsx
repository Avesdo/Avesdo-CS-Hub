import React, { useState } from 'react';
import { Search, Grid, Building2, Home, Briefcase, Settings as SettingsIcon, Trash2, Database, History, Users, CheckCircle2, ChevronDown, AlertTriangle } from 'lucide-react';
import { Tooltip as UITooltip } from '../ui/Tooltip';
import { motion } from 'framer-motion';

interface AuditLogViewerProps {
  logs: any[];
  loadLogs: () => Promise<void>;
  setViewingUploadLog: (log: any) => void;
  loadingLogs: boolean;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs, loadLogs, setViewingUploadLog, loadingLogs }) => {
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<'All' | 'Client' | 'Project' | 'Service' | 'Setting' | 'Upload'>('All');
  const [auditLimit, setAuditLimit] = useState(50);

  const filteredLogs = logs.filter((log) => {
    if (
      auditFilter !== 'All' &&
      log.entityType !== auditFilter &&
      log.entityType !== auditFilter.slice(0, -1)
    ) {
      return false;
    }
    if (auditSearch) {
      const term = auditSearch.toLowerCase();
      return (
        (log.action || '').toLowerCase().includes(term) ||
        (log.entityName || '').toLowerCase().includes(term) ||
        (log.author || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  const displayedLogs = filteredLogs.slice(0, auditLimit);

  // Group by Date
  const groupedLogs: { [key: string]: any[] } = {};
  displayedLogs.forEach((log) => {
    const d = new Date(log.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupName = '';
    if (d.toDateString() === today.toDateString()) {
      groupName = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      groupName = 'Yesterday';
    } else {
      groupName = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    if (!groupedLogs[groupName]) groupedLogs[groupName] = [];
    groupedLogs[groupName].push(log);
  });

  return (
    <div className="w-full animate-in fade-in duration-300 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto py-2 px-2 -mx-2 sm:px-2 sm:-mx-2 custom-thin-scroll shrink-0">
          <div className="relative flex items-center bg-slate-100/80 p-1 rounded-xl shadow-inner shrink-0">
            {[
              { id: 'All', label: 'All', icon: Grid },
              { id: 'Client', label: 'Clients', icon: Building2 },
              { id: 'Project', label: 'Projects', icon: Home },
              { id: 'Service', label: 'Services', icon: Briefcase },
              { id: 'Upload', label: 'Uploads', icon: Database },
              { id: 'Setting', label: 'Settings', icon: SettingsIcon },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAuditFilter(f.id as any)}
                className={`relative flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 z-10 whitespace-nowrap ${
                  auditFilter === f.id
                    ? 'text-primary'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {auditFilter === f.id && (
                  <motion.div
                    layoutId="auditFilterIndicator"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <f.icon
                  className={`w-4 h-4 ${auditFilter === f.id ? 'text-primary' : 'text-slate-400'}`}
                />{' '}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 hover:bg-slate-50 transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        {loadingLogs ? (
          <div className="py-20 text-center text-sm font-medium text-slate-500 animate-pulse flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
             Loading audit trail...
          </div>
        ) : displayedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mt-6">
             <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
               <Search className="w-8 h-8 text-slate-300" />
             </div>
             <h4 className="text-base font-bold text-slate-700 mb-1">No logs found</h4>
             <p className="text-[13px] text-slate-500">Try adjusting your search criteria or filter.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100/80 ml-[19px] space-y-10 pb-8 mt-8">
            {Object.entries(groupedLogs).map(([dateLabel, group]) => (
              <div key={dateLabel} className="relative">
                {/* Date Group Header */}
                <div className="sticky top-[120px] z-30 -ml-[19px] mb-6 flex items-center pt-2">
                  <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 shadow-sm text-[12px] font-semibold text-slate-600 tracking-wide relative -left-[19px]">
                    {dateLabel}
                  </div>
                </div>

                <div className="space-y-6">
                  {group.map((log) => {
                    // Determine Icon
                    const Icon = log.entityType === 'Client' ? Building2 
                               : log.entityType === 'Project' ? Home 
                               : log.entityType === 'Service' ? Briefcase 
                               : log.entityType === 'Upload' ? Database 
                               : SettingsIcon;

                    // Determine Colors
                    const colorClass = log.entityType === 'Client' ? 'bg-blue-50 text-blue-500'
                                     : log.entityType === 'Project' ? 'bg-indigo-50 text-indigo-500'
                                     : log.entityType === 'Service' ? 'bg-emerald-50 text-emerald-500'
                                     : log.entityType === 'Upload' ? 'bg-amber-50 text-amber-500'
                                     : 'bg-slate-50 text-slate-500';

                    return (
                      <div key={log.id} className="relative group pl-8">
                        {/* Timeline Node Icon */}
                        <div
                          className={`absolute -left-[15px] top-4 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 transition-colors ${colorClass}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        {/* Elevated Card */}
                        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-medium text-slate-800 leading-snug">
                                {log.action}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                                <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                  {log.entityName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <History className="w-3.5 h-3.5 text-slate-400" />{' '}
                                  {new Date(log.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-slate-400" /> {log.author}
                                </span>
                              </div>
                            </div>
                            
                            {log.entityType === 'Upload' && log.autoProcessed && log.autoProcessed.length > 0 && (
                              <div className="shrink-0 sm:mt-0 mt-2">
                                <button
                                  onClick={() => setViewingUploadLog(log)}
                                  className="group w-full sm:w-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                  View {log.autoProcessed.length} Auto-Processed
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {filteredLogs.length > displayedLogs.length && (
        <div className="mt-6 text-center pb-6">
          <button
            onClick={() => setAuditLimit((prev) => prev + 50)}
            className="group inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all active:scale-95"
          >
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /> Load More Logs
          </button>
        </div>
      )}

    </div>
  );
};
