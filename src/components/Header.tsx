import React, { useState, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, limit } from 'firebase/firestore';
import { db } from '../api/firebase';
import {
  AppNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from '../utils/notificationUtils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { useUIStore } from '../store/useUIStore';
import { useAppStore } from '../store/useAppStore';
import { Tooltip } from './ui/Tooltip';
import { useScheduleData } from '../hooks/useScheduleData';
import {
  Calendar as CalendarIcon,
  Sun,
  AlertTriangle,
  CalendarDays,
  Users,
  User,
  CheckCheck,
  Clock,
} from 'lucide-react';

export function NotificationBell({
  side = 'bottom',
  sideOffset = 16,
}: {
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
} = {}) {
  const { openDrawer } = useUIStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AppNotification[];
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="relative group bg-white hover:bg-slate-50 border-slate-200/60 text-slate-500 hover:text-primary hover:border-primary/20 shadow-sm transition-all duration-300 rounded-full h-10 px-3 flex items-center gap-2"
        >
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="flex h-[24px] min-w-[24px] px-2 items-center justify-center text-sm font-black shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-full animate-in zoom-in"
            >
              {unreadCount}
            </Badge>
          )}
          <Bell className="w-[1.25rem] h-[1.25rem] transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[324px] p-0 bg-white/95 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=right]:slide-in-from-left-2"
        side={side}
        align="end"
        sideOffset={sideOffset}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-slate-50/50">
          <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Tooltip content="Mark all as read" position="bottom-right">
                <button
                  onClick={() => markAllNotificationsAsRead(notifications)}
                  className="p-1.5 rounded-full hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              </Tooltip>
            )}
            {notifications.length > 0 && (
              <Tooltip content="Clear all notifications" position="bottom-right">
                <button
                  onClick={() => clearAllNotifications(notifications)}
                  className="p-1.5 rounded-full hover:bg-destructive/10 text-slate-400 hover:text-destructive transition-colors focus:outline-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-thin-scroll">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No new notifications at this time.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group relative px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer flex items-start gap-3 ${!n.read ? 'bg-primary/[0.03]' : ''}`}
                  onClick={() => {
                    markNotificationAsRead(n.id);
                    if (n.projectId) {
                      openDrawer('project', n.projectId);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-sm ${!n.read ? 'bg-primary shadow-primary/40' : 'bg-transparent shadow-none'}`}
                  />
                  <div className="flex-1 pr-16">
                    <p className="text-sm text-foreground leading-tight">
                      {n.type === 'academy' ? (
                        <span className="font-semibold">{n.title || n.formName}</span>
                      ) : (
                        <>
                          <span className="font-semibold">{n.projectName}</span>{' '}
                          {n.type === 'submission' ? 'submitted' : 'updated'}{' '}
                          <span className="font-medium">{n.formName}</span>.
                        </>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
                      {format(new Date(n.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                    {!n.read && (
                      <Tooltip content="Mark as read" position="bottom-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(n.id);
                          }}
                          className="p-1.5 rounded-full hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip content="Clear notification" position="bottom-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllNotifications([n]);
                        }}
                        className="p-1.5 rounded-full hover:bg-destructive/10 text-slate-400 hover:text-destructive transition-colors focus:outline-none"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TeamScheduleWidget({
  side = 'bottom',
  sideOffset = 16,
}: {
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
} = {}) {
  const { openModal } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const { scheduleData, loading, getTodaySchedule } = useScheduleData();
  const users = useAppStore((state) => state.users);

  const todayData = getTodaySchedule();

  const formatShortName = (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
    }
    return name;
  };

  const getUserName = (id: string) => {
    const u = users.find((user) => user.uid === id);
    const fullName = u ? u.displayName || u.name || u.email || id : id;
    return formatShortName(fullName);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      );
    }

    const now = new Date();
    const getHourInTZ = (tz: string) => {
      try {
        return parseInt(
          new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric',
            hourCycle: 'h23',
          }).format(now),
          10
        );
      } catch (e) {
        return now.getHours(); // fallback
      }
    };

    const estHour = getHourInTZ('America/New_York');
    const pstHour = getHourInTZ('America/Los_Angeles');
    const currentDay = now.getDay();
    const isWeekend = currentDay === 0 || currentDay === 6;
    const isThurFri = currentDay === 4 || currentDay === 5;

    interface Shift {
      id: string;
      name: string;
      timeRange: string;
      managers: string[];
      isActive: boolean;
      color: 'sky' | 'indigo' | 'purple';
    }

    const colorThemes: Record<
      'sky' | 'indigo' | 'purple',
      { card: string; title: string; icon: string; names: string }
    > = {
      sky: {
        card: 'bg-sky-50/40 border-sky-200/80',
        title: 'text-sky-800',
        icon: 'text-sky-500',
        names: 'text-sky-900',
      },
      indigo: {
        card: 'bg-indigo-50/40 border-indigo-200/80',
        title: 'text-indigo-800',
        icon: 'text-indigo-500',
        names: 'text-indigo-900',
      },
      purple: {
        card: 'bg-purple-50/40 border-purple-200/80',
        title: 'text-purple-800',
        icon: 'text-purple-500',
        names: 'text-purple-900',
      },
    };

    const shifts: Shift[] = [];

    // 1. EST: Mon - Fri 9-5 EST
    if (!isWeekend) {
      const isActive = estHour >= 9 && estHour < 17;
      shifts.push({
        id: 'est',
        name: '9-5 EST',
        timeRange: '9:00 AM - 5:00 PM EST',
        managers: todayData.estManagers || [],
        isActive,
        color: 'sky',
      });
    }

    // 2. PST: Mon - Fri 9-5 PST
    if (!isWeekend) {
      const isActive = pstHour >= 9 && pstHour < 17;
      shifts.push({
        id: 'pst',
        name: '9-5 PST',
        timeRange: '9:00 AM - 5:00 PM PST',
        managers: todayData.pstManagers || [],
        isActive,
        color: 'indigo',
      });
    }

    // 3. PST 8-6: 8-6 PST
    const combinedPstManagers = Array.from(
      new Set([...(todayData.pstWedSatManagers || []), ...(todayData.pstSunWedManagers || [])])
    );

    if (combinedPstManagers.length > 0) {
      const isActive = pstHour >= 8 && pstHour < 18;
      shifts.push({
        id: 'pst-extended',
        name: '8-6 PST',
        timeRange: '8:00 AM - 6:00 PM PST',
        managers: combinedPstManagers,
        isActive,
        color: 'purple',
      });
    }

    const hasUpcoming =
      todayData.upcomingHolidays?.length ||
      todayData.upcomingTimeOff?.length ||
      todayData.upcomingDst?.length ||
      (isThurFri && todayData.upcomingWeekendCoverage);

    const formatDates = (dates: string[]) => {
      return dates
        .map((dateStr) => {
          if (dateStr.includes(' to ')) {
            const [start, end] = dateStr.split(' to ');
            const startDate = new Date(`${start}T12:00:00`);
            const endDate = new Date(`${end}T12:00:00`);
            return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
          }
          return new Date(`${dateStr}T12:00:00`).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });
        })
        .join(', ');
    };

    return (
      <div className="flex flex-col max-h-[80vh] overflow-y-auto custom-thin-scroll">
        {todayData.isStatHoliday && (
          <div className="bg-amber-50 border-b border-amber-100 p-3 text-center">
            <h4 className="text-amber-800 font-bold text-sm mb-0.5 flex justify-center items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> {todayData.statHolidayName}
            </h4>
            <p className="text-amber-600 font-medium text-xs">Reduced schedule in effect.</p>
          </div>
        )}

        {todayData.isDstDay && (
          <div className="bg-sky-50 border-b border-sky-100 p-3 text-center">
            <h4 className="text-sky-800 font-bold text-sm mb-0.5 flex justify-center items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" /> {todayData.dstName}
            </h4>
            <p className="text-sky-600 font-medium text-xs">{todayData.dstDescription}</p>
          </div>
        )}

        <div className="p-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 mb-2 px-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" /> Today's Coverage
          </div>

          {shifts.map((shift) => {
            const theme = colorThemes[shift.color];
            const cardClasses = shift.isActive
              ? `${theme.card} opacity-100`
              : 'bg-slate-50/60 border-slate-200/60 opacity-60';
            const titleClasses = shift.isActive ? theme.title : 'text-slate-500';
            const iconClasses = shift.isActive ? theme.icon : 'text-slate-400';
            const namesClasses = shift.isActive ? theme.names : 'text-slate-500';

            return (
              <div
                key={shift.id}
                className={`flex flex-col px-3 py-2 rounded-lg border transition-colors ${cardClasses}`}
              >
                <div className="mb-0.5">
                  <h4 className={`font-semibold text-sm ${titleClasses}`}>{shift.name}</h4>
                </div>
                <div className="flex items-center gap-1.5 mt-0">
                  {shift.managers.length > 1 ? (
                    <Users className={`w-3.5 h-3.5 shrink-0 ${iconClasses}`} />
                  ) : (
                    <User className={`w-3.5 h-3.5 shrink-0 ${iconClasses}`} />
                  )}
                  <span
                    className={`text-sm font-medium ${shift.managers.length > 0 ? namesClasses : 'text-slate-400 italic'}`}
                  >
                    {shift.managers.length > 0
                      ? shift.managers
                          .map((m: any) => getUserName(typeof m === 'object' ? m.name : m))
                          .join(', ')
                      : 'Unassigned'}
                  </span>
                </div>
              </div>
            );
          })}

          {shifts.length === 0 && !todayData.isStatHoliday && (
            <div className="text-center text-sm text-slate-500 py-4 italic">
              No coverage scheduled today.
            </div>
          )}
          {/* Time Off Today */}
          {todayData.peopleOffToday.length > 0 && (
            <div className="flex flex-col px-3 py-2 rounded-lg border transition-colors bg-red-50/40 border-red-200 shadow-sm">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-red-800">Away Today</h4>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-0">
                {todayData.peopleOffToday.length > 1 ? (
                  <Users className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <User className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className="text-sm font-medium text-red-700">
                  {todayData.peopleOffToday.map((m: string, i: number) => (
                    <React.Fragment key={m}>
                      {getUserName(m)}
                      {i < todayData.peopleOffToday.length - 1 ? ', ' : ''}
                    </React.Fragment>
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 7-Day Lookahead */}
        {hasUpcoming && (
          <div className="bg-slate-50 border-t border-slate-200/60 p-4 space-y-4">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 mb-2">
              <CalendarDays className="w-3.5 h-3.5" /> Upcoming
            </div>

            <div className="space-y-4">
              {isThurFri && todayData.upcomingWeekendCoverage && (
                <div>
                  <div className="text-[11px] font-semibold text-indigo-500 mb-1.5">
                    Weekend Coverage
                  </div>
                  <div className="text-xs font-medium text-slate-700">
                    {todayData.upcomingWeekendCoverage}
                  </div>
                </div>
              )}

              {todayData.upcomingTimeOff && todayData.upcomingTimeOff.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-red-500 mb-1.5">Time Off</div>
                  <div className="space-y-2">
                    {todayData.upcomingTimeOff.map((t: any, i: number) => (
                      <div key={i} className="text-xs flex justify-between items-center gap-2">
                        <span className="font-medium text-slate-700">{getUserName(t.manager)}</span>
                        <span className="text-slate-500 text-[10.5px] bg-slate-100/50 px-1.5 py-0.5 rounded">
                          {formatDates(t.dates)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {todayData.upcomingHolidays && todayData.upcomingHolidays.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-amber-600 mb-1.5">
                    Stat Holidays
                  </div>
                  <div className="space-y-2">
                    {todayData.upcomingHolidays.map((h: any, i: number) => (
                      <div key={i} className="text-xs flex justify-between items-center gap-2">
                        <span className="font-medium text-slate-700">{h.name}</span>
                        <span className="text-slate-500 text-[10.5px] bg-slate-100/50 px-1.5 py-0.5 rounded">
                          {new Date(`${h.date}T12:00:00`).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {todayData.upcomingDst && todayData.upcomingDst.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-sky-600 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Daylight Saving Time
                  </div>
                  <div className="space-y-2">
                    {todayData.upcomingDst.map((d: any, i: number) => (
                      <div key={i} className="text-xs flex justify-between items-start gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-slate-700 leading-tight">
                            {d.shortName || d.name}
                          </span>
                          <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {d.description}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10.5px] bg-slate-100/50 px-1.5 py-0.5 rounded shrink-0">
                          {new Date(`${d.date}T12:00:00`).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="relative group bg-white hover:bg-slate-50 border-slate-200/60 text-slate-500 hover:text-primary hover:border-primary/20 shadow-sm transition-all duration-300 rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          <CalendarIcon className="w-[1.25rem] h-[1.25rem] transition-all duration-300 group-hover:scale-110" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[275px] p-0 bg-white/95 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=right]:slide-in-from-left-2"
        side={side}
        align="end"
        sideOffset={sideOffset}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-white">
          <div className="flex items-center gap-2 text-slate-800">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Team Schedule</h3>
          </div>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-thin-scroll">
          {renderContent()}
        </div>

        <div className="p-1 border-t border-slate-200/60 bg-slate-50/50">
          <Button
            variant="ghost"
            className="w-full text-xs text-primary font-medium hover:text-primary hover:bg-primary/10 h-8 transition-colors"
            onClick={() => {
              setIsOpen(false);
              openModal('scheduleModal');
            }}
          >
            View Full Schedule
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function Header() {
  return (
    <header
      className="w-full bg-white/70 backdrop-blur-xl shrink-0 relative z-[var(--z-header)]"
      id="global-header-bar"
    >
      <div className="h-[60px] flex items-center px-4 md:px-6 gap-2 md:gap-4">
        <GlobalSearch />
        <div className="flex-1"></div>
        <TeamScheduleWidget />
        <NotificationBell />
      </div>
    </header>
  );
}
