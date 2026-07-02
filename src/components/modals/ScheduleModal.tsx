import React, { useMemo, useState } from 'react';
import {
  X,
  CalendarDays,
  Sun,
  UserX,
  Moon,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useScheduleData } from '../../hooks/useScheduleData';
import {
  format,
  isSameDay,
  isBefore,
  startOfDay,
  addDays,
  startOfWeek,
  addMonths,
  subMonths,
  startOfMonth,
  isSameMonth,
} from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { Tooltip } from '../ui/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScheduleModal() {
  const { isModalOpen, closeModal } = useUI();
  const isOpen = isModalOpen('scheduleModal');

  const { scheduleData, loading, error } = useScheduleData();
  const settings = useAppStore((state) => state.settings);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    // If we are in the last week of the month, auto-advance to next month
    return today.getDate() >= 25 ? startOfMonth(addMonths(today, 1)) : startOfMonth(today);
  });

  const [direction, setDirection] = useState(0);

  const nextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  const prevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  const goToday = () => {
    const today = startOfMonth(new Date());
    setDirection(today > currentMonth ? 1 : today < currentMonth ? -1 : 0);
    setCurrentMonth(today);
  };

  const calendarDays = useMemo(() => {
    if (!scheduleData.length) return [];

    const today = startOfDay(new Date());
    // Find the Sunday of the first week of the current month
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });

    // We want exactly 6 weeks (42 days) to guarantee we cover any month fully
    return Array.from({ length: 42 }).map((_, i) => {
      const dTime = addDays(startDate, i);

      // Match with schedule data
      const sData = scheduleData.find((s) => {
        const sD = startOfDay(new Date(s.dateFull));
        return sD.getTime() === dTime.getTime();
      });

      // Settings holiday override
      const settingsHoliday = (settings?.statHolidays || []).find((h) => {
        return new Date(h.date + 'T00:00:00').getTime() === dTime.getTime();
      });

      // People off
      const peopleOff = (settings?.timeOff || [])
        .filter((t) => {
          const sDate = new Date(`${t.startDate || t.date}T00:00:00`).getTime();
          const eDate = new Date(`${t.endDate || t.date}T00:00:00`).getTime();
          return dTime.getTime() >= sDate && dTime.getTime() <= eDate;
        })
        .map((t) => t.manager);

      return {
        date: dTime,
        isPast: isBefore(dTime, today),
        isToday: isSameDay(dTime, today),
        isCurrentMonth: isSameMonth(dTime, currentMonth),
        isHoliday: sData?.isHoliday || !!settingsHoliday,
        holidayName: settingsHoliday?.name || sData?.holidayName || '',
        pstThurSunShift: sData?.pstThurSunShift || '',
        istMonFriShift: sData?.istMonFriShift || '',
        peopleOff: Array.from(new Set(peopleOff)), // unique
      };
    });
  }, [scheduleData, settings, currentMonth]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-800">Team Schedule</h2>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Upcoming After Hours, Weekends, Holidays & Time Off
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-white pl-1.5 pr-1.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                <button
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={goToday}
                  className="text-lg font-bold text-slate-800 w-[180px] text-center hover:text-primary transition-colors cursor-pointer"
                  title="Go to Today"
                >
                  {format(currentMonth, 'MMMM yyyy')}
                </button>

                <button
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-5 text-[11px] font-bold text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Today
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" /> PST Extended / Weekend
                </div>
                <div className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-violet-500" /> After Hours
                </div>
                <div className="flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-red-500" /> Away
                </div>
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Holiday
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8 font-medium">
                Failed to load schedule data from Google Sheet.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-200 shadow-sm">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentMonth.toISOString()}
                    custom={direction}
                    variants={{
                      enter: (d: number) => ({ opacity: 0, x: d > 0 ? 30 : -30 }),
                      center: { opacity: 1, x: 0 },
                      exit: (d: number) => ({ opacity: 0, x: d > 0 ? -30 : 30 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.15, ease: 'easeInOut' }}
                    className="grid grid-cols-7 gap-px"
                  >
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div
                        key={day}
                        className="bg-slate-50 py-2.5 text-center text-xs font-bold text-slate-500 tracking-wider"
                      >
                        {day}
                      </div>
                    ))}

                    {calendarDays.map((d, i) => {
                      const isWeekend = d.date.getDay() === 0 || d.date.getDay() === 6;
                      const hasAnomalies =
                        d.isHoliday ||
                        d.peopleOff.length > 0 ||
                        d.pstThurSunShift ||
                        d.istMonFriShift;

                      return (
                        <Tooltip
                          key={i}
                          className="!p-0 !border-0 !shadow-none bg-transparent"
                          containerClassName="block h-full"
                          content={
                            hasAnomalies ? (
                              <div className="flex flex-col min-w-[240px] bg-white whitespace-normal rounded-xl overflow-hidden shadow-xl border border-slate-200">
                                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                  <span className="font-bold text-slate-700">
                                    {format(d.date, 'EEEE, MMM d')}
                                  </span>
                                  {d.isToday && (
                                    <span className="text-[10px] tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                      Today
                                    </span>
                                  )}
                                </div>
                                <div className="p-4 flex flex-col gap-3">
                                  {d.isHoliday && (
                                    <div className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-2">
                                      <Sun className="w-4 h-4" /> {d.holidayName || 'Stat Holiday'}
                                    </div>
                                  )}

                                  {d.peopleOff.length > 0 && (
                                    <div className="flex flex-col gap-1.5">
                                      <span className="text-[10px] tracking-wider font-bold text-slate-400">
                                        Away
                                      </span>
                                      {d.peopleOff.map((m) => (
                                        <div
                                          key={m}
                                          className="px-2 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-bold flex items-center gap-2"
                                        >
                                          <UserX className="w-3.5 h-3.5" /> {m}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {(d.pstThurSunShift || d.istMonFriShift) && (
                                    <div className="flex flex-col gap-1.5">
                                      <span className="text-[10px] tracking-wider font-bold text-slate-400">
                                        Shifts
                                      </span>
                                      {d.pstThurSunShift && (
                                        <div className="px-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold flex items-center gap-2">
                                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                                          <span>
                                            <span className="text-indigo-400 mr-1">
                                              {isWeekend ? 'Weekend:' : 'PST Extended:'}
                                            </span>
                                            {d.pstThurSunShift}
                                          </span>
                                        </div>
                                      )}
                                      {d.istMonFriShift && (
                                        <div className="px-2 py-1.5 bg-violet-50 text-violet-700 rounded-md text-xs font-semibold flex items-center gap-2">
                                          <Moon className="w-3.5 h-3.5 text-violet-400" />
                                          <span>
                                            <span className="text-violet-400 mr-1">
                                              After Hours:
                                            </span>
                                            {d.istMonFriShift}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null
                          }
                        >
                          <div
                            className={`h-full bg-white min-h-[110px] p-2 relative flex flex-col gap-1.5 transition-colors hover:bg-slate-50/80 cursor-default
                        ${d.isPast ? 'opacity-60 bg-slate-50/50' : ''}
                        ${isWeekend && !d.isHoliday ? 'bg-slate-50/40' : ''}
                        ${d.isToday ? 'ring-[3px] ring-inset ring-primary/80 bg-primary/5 z-10 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' : ''}
                      `}
                          >
                            {/* Header Row: Time Off Badges (Left) & Date (Right) */}
                            <div className="flex items-start justify-between min-h-[24px] w-full">
                              <div className="flex -space-x-0.5 pt-0.5 pl-0.5">
                                {d.peopleOff.slice(0, 3).map((m) => {
                                  const parts = m.trim().split(' ');
                                  const initials =
                                    parts.length > 1
                                      ? `${parts[0][0]}${parts[1][0]}`
                                      : m.substring(0, 2);
                                  return (
                                    <div
                                      key={m}
                                      className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-[9px] font-bold text-red-700 shadow-sm z-10"
                                      title={`${m} Off`}
                                    >
                                      {initials}
                                    </div>
                                  );
                                })}
                                {d.peopleOff.length > 3 && (
                                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm z-10">
                                    +{d.peopleOff.length - 3}
                                  </div>
                                )}
                              </div>

                              <div
                                className={`text-right text-xs font-bold ${d.isToday ? 'text-white bg-primary w-6 h-6 rounded-full flex items-center justify-center shadow-sm' : 'text-slate-400'}`}
                              >
                                {format(d.date, 'd')}
                              </div>
                            </div>

                            {/* Cell Content (Shifts and Holidays) */}
                            <div className="space-y-1.5 mt-1 w-full">
                              {d.isHoliday && (
                                <div className="w-full truncate text-[10px] font-bold text-amber-700 bg-amber-100/50 border border-amber-200/50 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                                  <Sun className="w-2.5 h-2.5 shrink-0 opacity-70" />{' '}
                                  {d.holidayName || 'Holiday'}
                                </div>
                              )}
                              {d.pstThurSunShift && (
                                <div className="w-full truncate text-[10px] font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-100/50 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                                  <CalendarIcon className="w-2.5 h-2.5 shrink-0 opacity-70" />{' '}
                                  {d.pstThurSunShift.split(' ')[0]}
                                </div>
                              )}
                              {d.istMonFriShift && (
                                <div className="w-full truncate text-[9px] font-bold text-violet-700 bg-violet-50/80 border border-violet-100/50 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                                  <Moon className="w-2.5 h-2.5 shrink-0 opacity-70" />{' '}
                                  {d.istMonFriShift.split(' ')[0]}
                                </div>
                              )}
                            </div>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
