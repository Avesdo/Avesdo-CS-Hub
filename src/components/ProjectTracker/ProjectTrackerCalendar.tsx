import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getSafeHex, hexToRgba } from '../../utils/uiUtils';
import { Select } from '../ui/Select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface ProjectTrackerCalendarProps {
  openDrawer: (type: string, id: string, data?: any) => void;
}

export const ProjectTrackerCalendar: React.FC<ProjectTrackerCalendarProps> = React.memo(
  ({ openDrawer }) => {
    const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);
    const currentDateState = useState(new Date());
    const currentDate = currentDateState[0];
    const setCurrentDate = currentDateState[1];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const handleToday = () => setCurrentDate(new Date());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const isToday = (d: number, m: number, y: number) => {
      const today = new Date();
      return d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
    };

    const unscheduledProjects = projects.filter(
      (p) => p.projectStatus === 'Onboarding' && (!p.releaseDateVal || p.releaseDateVal === 0)
    );

    const getTimelineHex = (timelineStatus: string) => {
      let item = (settings?.timelines || settings?.timelineStatuses)?.find(
        (s: any) => s.name === timelineStatus
      );
      if (!item) {
        item = (
          settings?.archivedData?.timelines || settings?.archivedData?.timelineStatuses
        )?.find((s: any) => s.name === timelineStatus);
      }
      return getSafeHex(item?.color, 'slate');
    };

    const renderProjectBlock = (p: any) => {
      const borderHex = getTimelineHex(p.timelineStatus);
      const pName = p.name || 'Not Set';
      const mgr = p.assignee || 'Unassigned';
      const pPhase = p.onboardingPhase || 'Not Set';

      return (
        <div
          key={p.id}
          onClick={() => openDrawer('project', p.id)}
          className="p-2 mb-1.5 rounded-lg border border-transparent shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all group"
          style={{
            borderLeft: `4px solid ${borderHex}`,
            backgroundColor: hexToRgba(borderHex, 0.08),
          }}
        >
          <div className="font-bold truncate text-slate-800 leading-tight mb-1 text-[11px]">
            {pName}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium leading-normal overflow-hidden">
            <User className="w-3 h-3 shrink-0 opacity-70" />
            <span className="truncate">{mgr}</span>
            <span className="mx-0.5 opacity-50 shrink-0">•</span>
            <span className="truncate">{pPhase}</span>
          </div>
        </div>
      );
    };

    const renderCalendarCells = () => {
      const cells = [];

      // Previous month trailing cells
      for (let i = firstDay - 1; i >= 0; i--) {
        cells.push(
          <div key={`prev-${i}`} className="bg-slate-100 p-2 min-h-[120px]">
            <div className="text-xs font-medium mb-2 text-slate-300">{daysInPrevMonth - i}</div>
          </div>
        );
      }

      // Current month cells
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayProjects = projects.filter((p) => {
          if (p.projectStatus === 'Closed') return false;
          if (p.releaseDateVal) {
            return new Date(p.releaseDateVal).toISOString().split('T')[0] === dateStr;
          }
          return p.releaseDate === dateStr;
        });
        dayProjects.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        const isWknd = (firstDay + day - 1) % 7 === 0 || (firstDay + day - 1) % 7 === 6;
        let dayBgClass = 'bg-white';
        if (isToday(day, month, year)) dayBgClass = 'bg-primary/5';
        else if (isWknd) dayBgClass = 'bg-slate-50';

        const maxVisible = 3;
        const visibleProjs = dayProjects.slice(0, maxVisible);
        const hiddenCount = dayProjects.length - maxVisible;

        cells.push(
          <div
            key={`day-${day}`}
            className={`${dayBgClass} p-2 min-h-[120px] flex flex-col relative`}
          >
            <div
              className={`text-xs font-bold mb-2 flex items-center justify-center w-7 h-7 rounded-full ${
                isToday(day, month, year) ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              {day}
            </div>

            <div className="space-y-1 w-full flex-1 flex flex-col">
              {visibleProjs.map((p) => renderProjectBlock(p))}
              {hiddenCount > 0 && (
                <div className="relative w-full text-center mt-1">
                  <Popover modal={false}>
                    <PopoverTrigger asChild>
                      <button className="text-[11px] font-bold text-slate-500 hover:text-primary transition-colors bg-transparent hover:bg-slate-50 w-full py-1 rounded-md active:scale-95 duration-200">
                        +{hiddenCount} More
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 shadow-xl border-slate-200 rounded-xl" align="center" side="bottom">
                      <div className="text-xs font-bold text-slate-500 mb-2 pb-2 border-b border-slate-100 text-center">
                        {monthNames[month]} {day}, {year}
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-1 text-left flex flex-col custom-thin-scroll">
                        {dayProjects.map((p) => renderProjectBlock(p))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
        );
      }

      // Next month trailing cells
      const totalCells = firstDay + daysInMonth;
      const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (let i = 1; i <= trailingCells; i++) {
        cells.push(
          <div key={`next-${i}`} className="bg-slate-100 p-2 min-h-[120px]">
            <div className="text-xs font-medium mb-2 text-slate-300">{i}</div>
          </div>
        );
      }

      return cells;
    };

    // Find min and max years from project release dates
    let minYear = new Date().getFullYear() - 1;
    let maxYear = new Date().getFullYear() + 2;

    if (projects && projects.length > 0) {
      const years = projects
        .map((p) => {
          if (p.releaseDateVal) {
            return new Date(p.releaseDateVal).getFullYear();
          }
          if (p.releaseDate) {
            const date = new Date(p.releaseDate);
            if (!isNaN(date.getTime())) return date.getFullYear();
          }
          return null;
        })
        .filter((y): y is number => y !== null);

      if (years.length > 0) {
        minYear = Math.min(...years, minYear);
        maxYear = Math.max(...years, maxYear);
      }
    }

    // Ensure currently selected year is always included
    minYear = Math.min(minYear, year);
    maxYear = Math.max(maxYear, year);

    const availableYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

    return (
      <div className="flex-1 bg-white sm:rounded-b-xl border-x border-b border-border flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-md sm:rounded-b-none sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white rounded-lg border border-border shadow-sm p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Select
                options={monthNames.map((m, i) => ({ label: m, value: i.toString() }))}
                value={month.toString()}
                onChange={(val) => setCurrentDate(new Date(year, parseInt(val), 1))}
                dropdownWidth="min-w-[140px]"
                trigger={
                  <div className="text-xl font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer">
                    {monthNames[month]}
                  </div>
                }
              />
              <Select
                options={availableYears.map((y) => ({ label: y.toString(), value: y.toString() }))}
                value={year.toString()}
                onChange={(val) => setCurrentDate(new Date(parseInt(val), month, 1))}
                dropdownWidth="min-w-[100px]"
                trigger={
                  <div className="text-xl font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer">
                    {year}
                  </div>
                }
              />
            </div>
          </div>

          <button
            onClick={() => openDrawer('unscheduledProjects', '')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all group ${
              unscheduledProjects.length > 0 
                ? 'bg-orange-50/50 border-orange-200 hover:bg-orange-50 hover:border-orange-300 shadow-sm'
                : 'bg-transparent border-transparent hover:bg-slate-100 text-slate-600'
            }`}
          >
            <AlertCircle className={`w-4 h-4 transition-colors ${unscheduledProjects.length > 0 ? 'text-orange-500 group-hover:scale-110 duration-300' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className={`font-semibold text-sm ${unscheduledProjects.length > 0 ? 'text-orange-900' : ''}`}>Unscheduled</span>
            {unscheduledProjects.length > 0 && (
              <span className="ml-1 bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-600/20 px-2 py-0.5 rounded-full text-xs font-bold group-hover:bg-orange-200 transition-colors">
                {unscheduledProjects.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-[72px] z-10 shadow-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => {
                const isCurrentMonth = month === new Date().getMonth() && year === new Date().getFullYear();
                const isTodayCol = isCurrentMonth && i === new Date().getDay();
                return (
                  <div
                    key={d}
                    className={`py-3 text-center text-sm font-semibold ${isTodayCol ? 'text-primary' : 'text-slate-500'} ${i < 6 ? 'border-r border-slate-100/50' : ''}`}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 bg-border gap-[1px]">{renderCalendarCells()}</div>
          </div>
        </div>
      </div>
    );
  }
);
