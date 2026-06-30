import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1sBG1AyGHvyNPkGVLfgcQwdIiz0GxXV4rM2wltZ_7msA/export?format=csv';

const knownNonNames = [
  'Canada Day',
  'Civic Holiday',
  'Labour Day',
  'Thanksgiving',
  'Christmas Eve',
  'Christmas Day',
  'Boxing Day',
  "New Year's Eve",
  "New Year's Day",
  'Family Day',
  'Good Friday',
  'Victoria Day',
];

export interface ScheduleDay {
  dateStr: string; // e.g. "Jun 28"
  dateFull: Date;
  dayOfWeek: string;
  pstThurSunShift: string; // 9am - 7pm PST
  istMonFriShift: string; // 5pm - 1am PST
  isHoliday: boolean;
  holidayName?: string;
}

export function useScheduleData() {
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const urlWithCacheBust = `${SHEET_CSV_URL}&t=${new Date().getTime()}`;
        const res = await fetch(urlWithCacheBust);
        if (!res.ok) throw new Error('Failed to fetch schedule data');
        const text = await res.text();

        // Very basic CSV parsing assuming no complex quoting/commas inside fields
        const lines = text.split('\n');
        const parsedData: ScheduleDay[] = [];

        const currentYear = new Date().getFullYear();

        for (let i = 2; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(',');
          // Columns: 0: Date, 1: Day, 2: 9am-7pm PST, 3: 5pm-1am PST

          const rawDate = cols[0]?.trim();
          if (!rawDate || rawDate === 'Daylight Savings Ends' || rawDate === 'Date') continue;

          const dayOfWeek = cols[1]?.trim() || '';
          const shift1 = cols[2]?.trim() || '';
          const shift2 = cols[3]?.trim() || '';

          // Check if it's a holiday (often marked in both shift columns or one)
          // Simple heuristic: if the shift name is not a typical agent name but something like "Canada Day"
          // We'll trust the "statHolidays" from settings more, but we can also parse the sheet's holidays
          let isHoliday = false;
          let holidayName = '';

          // List of known names (could be dynamic, but this is a heuristic for the sheet)
          if (knownNonNames.includes(shift1)) {
            isHoliday = true;
            holidayName = shift1;
          } else if (knownNonNames.includes(shift2)) {
            isHoliday = true;
            holidayName = shift2;
          }

          // Create full date
          const dateFull = new Date(`${rawDate}, ${currentYear}`);
          if (isNaN(dateFull.getTime())) continue; // Invalid date

          parsedData.push({
            dateStr: rawDate,
            dateFull,
            dayOfWeek,
            pstThurSunShift: isHoliday ? '' : shift1,
            istMonFriShift: isHoliday ? '' : shift2,
            isHoliday,
            holidayName,
          });
        }

        setScheduleData(parsedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getTodaySchedule = () => {
    const today = new Date();
    // Reset time for accurate comparison
    today.setHours(0, 0, 0, 0);

    const dayData = scheduleData.find((d) => {
      const cmpDate = new Date(d.dateFull);
      cmpDate.setHours(0, 0, 0, 0);
      return cmpDate.getTime() === today.getTime();
    });

    // Check settings for stat holidays overrides
    let isStatHoliday = dayData?.isHoliday || false;
    let statHolidayName = dayData?.holidayName || '';

    if (settings?.statHolidays) {
      // Create local YYYY-MM-DD
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const override = settings.statHolidays.find((h) => h.date === todayStr);
      if (override) {
        isStatHoliday = true;
        statHolidayName = override.name;
      }
    }

    const estManagers = settings?.estManagers || [];
    const pstManagers = settings?.pstManagers || [];
    const timeOff = settings?.timeOff || [];

    // Filter out people on time off today
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const peopleOffToday = timeOff
      .filter((t) => {
        const start = t.startDate || t.date;
        const end = t.endDate || t.date;
        return start && end && todayStr >= start && todayStr <= end;
      })
      .map((t) => t.manager);

    const activeEstManagers = estManagers.filter((m) => !peopleOffToday.includes(m));
    const activePstManagers = pstManagers.filter((m) => !peopleOffToday.includes(m));

    let activePstThurSun = dayData?.pstThurSunShift || '';
    if (peopleOffToday.includes(activePstThurSun)) activePstThurSun = '';

    let activeIstMonFri = dayData?.istMonFriShift || '';
    if (peopleOffToday.includes(activeIstMonFri)) activeIstMonFri = '';

    const isWeekend = today.getDay() === 0 || today.getDay() === 6;

    // According to reqs:
    // EST is Mon-Fri 9-5
    // PST is Mon-Fri 10-6
    // If it's weekend, EST/PST fixed shifts are not working.

    // Calculate Upcoming 7-day lookaheads
    const upcomingHolidays = (settings?.statHolidays || [])
      .filter((h) => {
        const hDate = new Date(`${h.date}T00:00:00`);
        const diffTime = hDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 7;
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T00:00:00`).getTime() - new Date(`${b.date}T00:00:00`).getTime()
      );

    const upcomingTimeOffRaw = timeOff
      .filter((t) => {
        const eDate = new Date(`${t.endDate || t.date}T00:00:00`);
        const sDate = new Date(`${t.startDate || t.date}T00:00:00`);
        const diffDaysEnd = Math.ceil((eDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const diffDaysStart = Math.ceil(
          (sDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        // It's upcoming if it starts within 7 days, or is currently ongoing (ends >= today)
        return diffDaysEnd >= 0 && diffDaysStart <= 7;
      })
      .map((t) => ({
        ...t,
        startDate: t.startDate || t.date,
        endDate: t.endDate || t.date,
      }))
      .sort(
        (a, b) =>
          new Date(`${a.startDate}T00:00:00`).getTime() -
          new Date(`${b.startDate}T00:00:00`).getTime()
      );

    const upcomingTimeOffGrouped = upcomingTimeOffRaw.reduce((acc: any, curr: any) => {
      if (!acc[curr.manager]) {
        acc[curr.manager] = { ranges: [] };
      }
      const rangeStr =
        curr.startDate === curr.endDate ? curr.startDate : `${curr.startDate} to ${curr.endDate}`;

      if (!acc[curr.manager].ranges.includes(rangeStr)) {
        acc[curr.manager].ranges.push(rangeStr);
      }
      return acc;
    }, {});

    const upcomingTimeOff = Object.keys(upcomingTimeOffGrouped).map((manager) => ({
      manager,
      dates: upcomingTimeOffGrouped[manager].ranges,
    }));

    let upcomingWeekendCoverage = '';
    // If today is Thursday (4) or Friday (5), grab Saturday's (6) coverage
    if (today.getDay() === 4 || today.getDay() === 5) {
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + (6 - today.getDay()));
      const satData = scheduleData.find((d) => {
        const cmpDate = new Date(d.dateFull);
        cmpDate.setHours(0, 0, 0, 0);
        return cmpDate.getTime() === saturday.getTime();
      });
      if (satData?.pstThurSunShift && !knownNonNames.includes(satData.pstThurSunShift)) {
        upcomingWeekendCoverage = satData.pstThurSunShift;
      }
    }

    return {
      date: today,
      dayData,
      isStatHoliday,
      statHolidayName,
      estManagers: isWeekend ? [] : activeEstManagers,
      pstManagers: isWeekend ? [] : activePstManagers,
      pstThurSunManager: activePstThurSun,
      istMonFriManager: activeIstMonFri,
      peopleOffToday,
      upcomingHolidays,
      upcomingTimeOff,
      upcomingWeekendCoverage,
      rawSheetUrl: SHEET_CSV_URL.replace('/export?format=csv', '/edit'),
    };
  };

  return { scheduleData, loading, error, getTodaySchedule };
}
