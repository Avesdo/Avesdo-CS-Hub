import React from 'react';
import { Database, History, Users, CheckCircle2, AlertCircle, Inbox } from 'lucide-react';

interface RecentUploadActivityProps {
  logs: any[];
  setViewingUploadLog: (log: any) => void;
}

export const RecentUploadActivity: React.FC<RecentUploadActivityProps> = ({
  logs,
  setViewingUploadLog,
}) => {
  const uploadLogs = logs.filter((l) => l.entityType === 'Upload');

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {uploadLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6 text-slate-300" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">No recent activity</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
            Your recent data imports and automated processing logs will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-y-auto custom-thin-scroll max-h-[600px]">
          {uploadLogs.slice(0, 30).map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-2 p-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Database className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 leading-none">{log.action}</p>
                    <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                      {log.entityName}
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <History className="w-3 h-3 shrink-0" />
                      {new Date(log.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      {new Date(log.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 shrink-0" /> {log.author}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 pl-8">
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="font-bold text-slate-700">
                      {log.updatedMetrics !== undefined ? log.updatedMetrics : log.autoProcessed?.length || 0}
                    </span>{' '}
                    updated
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span className="font-bold text-slate-700">{log.sentForReview || 0}</span>{' '}
                    review
                  </span>
                </div>
                {log.autoProcessed && log.autoProcessed.length > 0 && (
                  <button
                    onClick={() => setViewingUploadLog(log)}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 text-primary text-[10px] font-bold rounded-md transition-all shadow-sm"
                  >
                    View Log
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
