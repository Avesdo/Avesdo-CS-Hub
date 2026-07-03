import React from 'react';
import { hexToRgba, getSafeHex, renderIcon } from '../../utils/uiUtils';
import { TruncatedText } from '../ui/TruncatedText';

export interface UpcomingActivityWidgetProps {
  upcomingActivity: any[];
  getServiceIcon: (type: string) => { iconName: string; color: string };
  settings: any;
  openDrawer: (type: any, id?: string, data?: any) => void;
}

export function UpcomingActivityWidget({
  upcomingActivity,
  getServiceIcon,
  settings,
  openDrawer,
}: UpcomingActivityWidgetProps) {
  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md min-h-[300px] lg:min-h-0 lg:flex-1 overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-3 border-b border-border bg-white/95 backdrop-blur-md shrink-0">
        <div className="flex flex-col">
          <div className="text-base font-semibold tracking-tight text-foreground">
            Upcoming Activity
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Projects & services scheduled for the next 45 days
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>{' '}
            {upcomingActivity.filter((a) => a.type === 'service').length} Services
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>{' '}
            {upcomingActivity.filter((a) => a.type === 'launch').length} Projects
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-thin-scroll bg-white">
        <div className="p-5 flex flex-col relative min-h-full z-0">
          {/* vertical timeline line */}
          {upcomingActivity.length > 0 && (
            <div className="absolute left-[96px] top-6 bottom-6 w-0.5 bg-slate-200 -z-10"></div>
          )}

          {upcomingActivity.length === 0 && (
            <div className="text-sm text-muted-foreground text-center mt-4 pb-4">
              No upcoming activity.
            </div>
          )}

          {upcomingActivity.map((act) => {
            const d = new Date(act.dateVal);
            const dateStr = d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            const isService = act.type === 'service';
            const iconObj = isService
              ? getServiceIcon(act.originalItem.serviceType || act.originalItem.type)
              : null;

            const hexColor = isService
              ? getSafeHex(iconObj?.color, 'blue')
              : getSafeHex('violet', 'violet');
            const IconName = isService ? iconObj?.iconName || 'Briefcase' : 'Rocket';

            const isOverdue = act.diffDays < 0;
            const isSoon = act.diffDays >= 0 && act.diffDays <= 14;

            let badgeClass = 'bg-slate-100 text-slate-600';
            let badgeText = `${act.diffDays} days`;
            if (isOverdue) {
              badgeClass = 'bg-red-50 text-red-600 border border-red-200/50';
              badgeText = 'Overdue';
            } else if (isSoon) {
              badgeClass = 'bg-orange-50 text-orange-600 border border-orange-200/50';
              badgeText = act.diffDays === 0 ? 'Today' : `${act.diffDays} days`;
            } else {
              badgeClass = 'bg-slate-50 text-slate-600 border border-slate-200/50';
            }

            const initials =
              act.manager !== 'Unassigned'
                ? act.manager
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : '?';

            const mHex = getSafeHex(
              settings?.managers?.find((m: any) => m.name === act.manager)?.color,
              'slate'
            );

            return (
              <div key={act.id} className="flex items-center gap-4 relative py-2 group">
                <div className="w-[45px] shrink-0 text-right">
                  <span className="text-[11px] font-bold text-slate-400">{dateStr}</span>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm shrink-0 transition-transform group-hover:scale-110">
                    <div
                      className="w-full h-full rounded-full border flex items-center justify-center"
                      style={{
                        backgroundColor: hexToRgba(hexColor, 0.1),
                        color: hexColor,
                        borderColor: hexToRgba(hexColor, 0.2),
                      }}
                      title={isService ? act.serviceType : 'Launch'}
                    >
                      {renderIcon(IconName, 'w-4 h-4')}
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl p-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  onClick={() =>
                    isService
                      ? openDrawer('service', act.originalItem.id)
                      : openDrawer('project', act.originalItem.id, {
                          targetTab: 'overview',
                        })
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <TruncatedText
                          text={act.title}
                          className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors"
                          containerClassName="flex-shrink min-w-0"
                        />
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${badgeClass}`}
                        >
                          {badgeText}
                        </span>
                      </div>
                      {isService ? (
                        <TruncatedText
                          text={String('' + act.projectName + '&bull;' + act.clientName + '')}
                          containerClassName="text-[11px] text-muted-foreground font-medium mt-0.5"
                        >
                          {act.projectName}&bull; {act.clientName}
                        </TruncatedText>
                      ) : (
                        <TruncatedText
                          text={String('' + act.clientName + '')}
                          containerClassName="text-[11px] text-muted-foreground font-medium mt-0.5"
                        >
                          {act.clientName}
                        </TruncatedText>
                      )}
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md"
                        title={act.manager}
                        style={{
                          backgroundColor: hexToRgba(mHex, 0.1),
                          color: mHex,
                          borderColor: hexToRgba(mHex, 0.25),
                          borderWidth: '1px',
                        }}
                      >
                        {initials}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
