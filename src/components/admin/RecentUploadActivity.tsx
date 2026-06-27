import React from 'react';
import {
  Database,
  Users,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Smile,
  Activity,
  ChevronRight,
  ThumbsUp,
} from 'lucide-react';

interface RecentUploadActivityProps {
  logs: any[];
  setViewingUploadLog: (log: any) => void;
}

export const RecentUploadActivity: React.FC<RecentUploadActivityProps> = ({
  logs,
  setViewingUploadLog,
}) => {
  const uploadLogs = logs
    .filter((l) => l.entityType === 'Upload')
    .sort((a, b) => b.timestamp - a.timestamp);

  const groupedLogs: Record<string, any[]> = {};
  uploadLogs.forEach((log) => {
    const date = new Date(log.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateLabel = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (date.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateLabel = 'Yesterday';
    }

    if (!groupedLogs[dateLabel]) {
      groupedLogs[dateLabel] = [];
    }
    groupedLogs[dateLabel].push(log);
  });

  return (
    <div className="bg-transparent">
      {uploadLogs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-base font-bold text-slate-700">No recent activity</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Your recent data imports and automated processing logs will appear here.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-100 ml-[19px] space-y-8 pb-4 mt-4">
          {Object.entries(groupedLogs).map(([dateLabel, groupLogs]) => (
            <div key={dateLabel} className="relative">
              {/* Date Header Badge */}
              <div className="sticky top-[120px] z-30 -ml-[19px] mb-6 flex items-center pt-2">
                <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60 shadow-sm text-[11px] font-bold text-slate-600 tracking-wide relative -left-[19px]">
                  {dateLabel}
                </div>
              </div>

              <div className="space-y-6">
                {groupLogs.map((log) => {
                  const rawEntityName = log.entityName?.startsWith('Files: ')
                    ? log.entityName.replace('Files: ', '')
                    : log.entityName;
                  const entityNameLower = rawEntityName?.toLowerCase() || '';

                  let Icon = Database;
                  let colorClass = 'bg-slate-50 text-slate-500 border-slate-100';

                  if (
                    entityNameLower.includes('csat') ||
                    entityNameLower.includes('satisfaction')
                  ) {
                    Icon = Smile;
                    colorClass = 'bg-amber-50 text-amber-500 border-amber-100';
                  } else if (entityNameLower.includes('session')) {
                    Icon = Users;
                    colorClass = 'bg-indigo-50 text-indigo-500 border-indigo-100';
                  } else if (
                    entityNameLower.includes('view') ||
                    entityNameLower.includes('activity')
                  ) {
                    Icon = Activity;
                    colorClass = 'bg-emerald-50 text-emerald-500 border-emerald-100';
                  } else if (entityNameLower.includes('nps')) {
                    Icon = ThumbsUp;
                    colorClass = 'bg-blue-50 text-blue-500 border-blue-100';
                  }

                  const timeString = new Date(log.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <div key={log.id} className="relative group pl-8 flex items-start">
                      {/* Timeline Node */}
                      <div
                        className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-[3px] border-white flex items-center justify-center shadow-sm z-10 transition-colors ${colorClass}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Compact Content Feed Item */}
                      <div className="flex-1 min-w-0">
                        {/* Title and Time */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4
                            className="text-[14px] font-bold text-slate-900 truncate max-w-sm"
                            title={rawEntityName}
                          >
                            {rawEntityName}
                          </h4>
                          <span className="text-[12px] font-medium text-slate-400">
                            {timeString}
                          </span>
                        </div>

                        {/* Author */}
                        <div className="text-[12px] text-slate-500 mb-2.5">
                          Uploaded by{' '}
                          <span className="font-semibold text-slate-700">{log.author}</span>
                        </div>

                        {/* Compact Stats Row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-slate-50/80 border border-slate-200/80 rounded-lg p-2 px-3 w-fit">
                          <div className="flex items-center gap-1.5 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-bold text-slate-700">
                              {log.totalParsed !== undefined
                                ? log.totalParsed
                                : log.updatedMetrics !== undefined
                                  ? log.updatedMetrics
                                  : log.autoProcessed?.length || 0}
                            </span>
                            <span className="text-slate-500 font-medium">
                              {log.totalParsed !== undefined ? 'processed' : 'updated'}
                            </span>
                          </div>

                          {log.totalParsed !== undefined && (
                            <>
                              <div className="w-px h-3.5 bg-slate-300"></div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <Database className="w-3.5 h-3.5 text-blue-500" />
                                <span className="font-bold text-slate-700">
                                  {log.updatedMetrics}
                                </span>
                                <span className="text-slate-500 font-medium">targets</span>
                              </div>
                            </>
                          )}

                          <div className="w-px h-3.5 bg-slate-300"></div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-bold text-slate-700">
                              {log.sentForReview || 0}
                            </span>
                            <span className="text-slate-500 font-medium">review</span>
                          </div>

                          {log.autoProcessed && log.autoProcessed.length > 0 && (
                            <>
                              <div className="w-px h-3.5 bg-slate-300"></div>
                              <button
                                onClick={() => setViewingUploadLog(log)}
                                className="group flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary-focus transition-colors"
                              >
                                View Log{' '}
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </>
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
  );
};
