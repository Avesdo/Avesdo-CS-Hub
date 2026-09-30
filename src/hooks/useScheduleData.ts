import { useAppStore } from '../store/useAppStore';

export interface DaySchedule {
  dateFull: Date;
  isStatHoliday: boolean;
  statHolidayName: string;
  peopleOff: string[];
  estManagers: string[];
  pstManagers: string[];
  pstWedSatManagers: string[];
  pstSunWedManagers: string[];
  isDstDay?: boolean;
  dstName?: string;
  dstDescription?: string;
}

export interface DstEvent {
  date: string; // YYYY-MM-DD
  name: string; // e.g. "Daylight Saving Time Starts"
  shortName: string; // e.g. "DST Starts (Spring Forward)"
  description: string; // e.g. "Clocks spring forward 1 hour at 2:00 AM."
  type: 'start' | 'end';
}

export function getDaylightSavingDates(year: number): { start: DstEvent; end: DstEvent } {
  // Second Sunday in March
  const marchFirst = new Date(year, 2, 1);
  const marchFirstSunday = 1 + ((7 - marchFirst.getDay()) % 7);
  const marchSecondSunday = marchFirstSunday + 7;
  const startDateStr = `${year}-03-${String(marchSecondSunday).padStart(2, '0')}`;

  // First Sunday in November
  const novFirst = new Date(year, 10, 1);
  const novFirstSunday = 1 + ((7 - novFirst.getDay()) % 7);
  const endDateStr = `${year}-11-${String(novFirstSunday).padStart(2, '0')}`;

  return {
    start: {
      date: startDateStr,
      name: 'Daylight Saving Time Starts',
      shortName: 'DST Starts (Spring Forward)',
      description: 'Clocks spring forward 1 hour at 2:00 AM.',
      type: 'start',
    },
    end: {
      date: endDateStr,
      name: 'Daylight Saving Time Ends',
      shortName: 'DST Ends (Fall Back)',
      description: 'Clocks fall back 1 hour at 2:00 AM.',
      type: 'end',
    },
  };
}

export function useScheduleData() {
  const settings = useAppStore((state) => state.settings);
  const timeOff = settings?.timeOff || [];
  const statHolidays = settings?.statHolidays || [];

  const getScheduleForDay = (date: Date): DaySchedule => {
    // reset time
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

    // Check holiday
    const holiday = statHolidays.find((h) => h.date === dStr);
    const isStatHoliday = !!holiday;
    const statHolidayName = holiday?.name || '';

    // Check Daylight Saving Time
    const dst = getDaylightSavingDates(d.getFullYear());
    const activeDst = dStr === dst.start.date ? dst.start : dStr === dst.end.date ? dst.end : null;
    const isDstDay = !!activeDst;
    const dstName = activeDst?.name;
    const dstDescription = activeDst?.description;

    // Check people off
    const peopleOffToday = timeOff
      .filter((t) => {
        const start = t.startDate || t.date;
        const end = t.endDate || t.date;
        return start && end && dStr >= start && dStr <= end;
      })
      .map((t) => t.manager);

    // Active managers
    const filterActive = (managers: string[], isActiveDay: boolean) => {
      if (!isActiveDay || isStatHoliday) return [];
      return managers.filter((m) => !peopleOffToday.includes(m));
    };

    const estManagersRaw = settings?.estManagers || [];
    const pstManagersRaw = settings?.pstManagers || [];
    const pstWedSatManagersRaw = settings?.pstWedSatManagers || [];
    const pstSunWedManagersRaw = settings?.pstSunWedManagers || [];

    // EST: Mon-Fri (1-5)
    const isEstDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    // PST: Mon-Fri (1-5)
    const isPstDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    // PST Wed-Sat: Wed(3) to Sat(6)
    const isPstWedSatDay = dayOfWeek >= 3 && dayOfWeek <= 6;
    // PST Sun-Wed: Sun(0) to Wed(3)
    const isPstSunWedDay = dayOfWeek >= 0 && dayOfWeek <= 3;

    return {
      dateFull: d,
      isStatHoliday,
      statHolidayName,
      peopleOff: Array.from(new Set(peopleOffToday)),
      estManagers: filterActive(estManagersRaw, isEstDay),
      pstManagers: filterActive(pstManagersRaw, isPstDay),
      pstWedSatManagers: filterActive(pstWedSatManagersRaw, isPstWedSatDay),
      pstSunWedManagers: filterActive(pstSunWedManagersRaw, isPstSunWedDay),
      isDstDay,
      dstName,
      dstDescription,
    };
  };

  const getTodaySchedule = () => {
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const schedule = getScheduleForDay(today);

    // Calculate upcoming holidays
    const upcomingHolidays = statHolidays
      .filter((h) => {
        const hDate = new Date(`${h.date}T00:00:00`);
        const diffDays = Math.round(
          (hDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays > 0 && diffDays <= 7;
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T00:00:00`).getTime() - new Date(`${b.date}T00:00:00`).getTime()
      );

    // Calculate upcoming DST
    const currentYear = today.getFullYear();
    const dstEvents = [
      getDaylightSavingDates(currentYear).start,
      getDaylightSavingDates(currentYear).end,
      getDaylightSavingDates(currentYear + 1).start,
    ];
    const upcomingDst = dstEvents.filter((event) => {
      const eDate = new Date(`${event.date}T00:00:00`);
      const diffDays = Math.round((eDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    });

    // Calculate upcoming time off
    const upcomingTimeOffRaw = timeOff
      .filter((t) => {
        const eDate = new Date(`${t.endDate || t.date}T00:00:00`);
        const sDate = new Date(`${t.startDate || t.date}T00:00:00`);
        const diffDaysEnd = Math.ceil((eDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const diffDaysStart = Math.ceil(
          (sDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isSingleDay = sDate.getTime() === eDate.getTime();
        if (isSingleDay && diffDaysStart === 0) return false;
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

    return {
      ...schedule,
      date: today,
      peopleOffToday: schedule.peopleOff,
      upcomingHolidays,
      upcomingTimeOff,
      upcomingDst,

      // Fallback aliases for existing consumers so they don't break immediately:
      pstThurSunManager: schedule.pstWedSatManagers[0] || schedule.pstSunWedManagers[0] || '',
      istMonFriManager: '',
      upcomingWeekendCoverage: '',
    };
  };

  return { scheduleData: [], loading: false, error: null, getTodaySchedule, getScheduleForDay };
}
