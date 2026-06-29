import React from 'react';
import { X, ExternalLink, Calendar as CalendarIcon, UserX, Sun } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useScheduleData } from '../../hooks/useScheduleData';
import { format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';

export default function ScheduleModal() {
  const { isModalOpen, closeModal } = useUI();
  const isOpen = isModalOpen('scheduleModal');

  const { scheduleData, loading, error, getTodaySchedule } = useScheduleData();
  const settings = useAppStore((state) => state.settings);

  if (!isOpen) return null;

  const todayData = getTodaySchedule();

  const handleClose = () => {
    closeModal();
  };

  const getUpcomingHolidays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hols = [...(settings?.statHolidays || [])];

    // Sort and filter future holidays
    return hols
      .map((h) => ({ ...h, dateObj: new Date(h.date + 'T00:00:00') }))
      .filter((h) => h.dateObj >= today)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .slice(0, 5); // next 5
  };

  const upcomingHolidays = getUpcomingHolidays();

  // Future schedule
  const futureSchedule = scheduleData
    .filter((d) => {
      const dObj = new Date(d.dateFull);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dObj > today;
    })
    .slice(0, 7); // next 7 days

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Team Schedule</h2>
              <p className="text-sm text-slate-500 font-medium">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-thin-scroll bg-slate-50/30">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8 font-medium">
              Failed to load schedule data from Google Sheet.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Today's Overview */}
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" /> Today's Coverage
                </h3>

                {todayData.isStatHoliday ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <h4 className="text-amber-800 font-bold text-lg mb-1">
                      {todayData.statHolidayName}
                    </h4>
                    <p className="text-amber-600 font-medium text-sm">
                      Reduced schedule in effect for statutory holiday.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        EST Ongoing (9am - 5pm)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {todayData.estManagers.length > 0 ? (
                          todayData.estManagers.map((m) => (
                            <div
                              key={m}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200"
                            >
                              {m}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500 italic">No scheduled managers</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        PST Ongoing (10am - 6pm)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {todayData.pstManagers.length > 0 ? (
                          todayData.pstManagers.map((m) => (
                            <div
                              key={m}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200"
                            >
                              {m}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500 italic">No scheduled managers</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        PST After Hours (9am - 7pm Thur-Sun)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {todayData.pstThurSunManager ? (
                          <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-sm font-semibold border border-indigo-100">
                            {todayData.pstThurSunManager}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500 italic">No shift today</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        IST After Hours (5pm - 1am Mon-Fri)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {todayData.istMonFriManager ? (
                          <div className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-md text-sm font-semibold border border-violet-100">
                            {todayData.istMonFriManager}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500 italic">No shift today</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* People Off Today */}
              {todayData.peopleOffToday.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-red-500" /> Away Today
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {todayData.peopleOffToday.map((m) => (
                      <div
                        key={m}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100"
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upcoming Holidays */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Upcoming Holidays</h3>
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    {upcomingHolidays.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {upcomingHolidays.map((h, i) => (
                          <div
                            key={i}
                            className="p-3 flex justify-between items-center text-sm hover:bg-slate-50 transition-colors"
                          >
                            <span className="font-semibold text-slate-700">
                              {format(h.dateObj, 'MMM d, yyyy')}
                            </span>
                            <span className="font-medium text-slate-600">{h.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-slate-500 text-center italic">
                        No upcoming holidays scheduled.
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming After Hours Shifts */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center justify-between">
                    <span>Upcoming After Hours</span>
                    <a
                      href={todayData.rawSheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline text-xs flex items-center gap-1 font-medium"
                    >
                      Open Sheet <ExternalLink className="w-3 h-3" />
                    </a>
                  </h3>
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-100">
                      {futureSchedule.map((d, i) => (
                        <div key={i} className="p-3 text-sm hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-700">
                              {d.dateStr} ({d.dayOfWeek})
                            </span>
                            {d.isHoliday && (
                              <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                                {d.holidayName}
                              </span>
                            )}
                          </div>
                          {!d.isHoliday && (d.pstThurSunShift || d.istMonFriShift) && (
                            <div className="flex gap-4 text-xs font-medium text-slate-600 mt-1.5">
                              {d.pstThurSunShift && (
                                <div>
                                  <span className="text-slate-400">PST:</span> {d.pstThurSunShift}
                                </div>
                              )}
                              {d.istMonFriShift && (
                                <div>
                                  <span className="text-slate-400">IST:</span> {d.istMonFriShift}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
