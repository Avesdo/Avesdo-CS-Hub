import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { TruncatedText } from './TruncatedText';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  getDay,
  startOfDay,
} from 'date-fns';
import { Button } from './button';

type PresetRange =
  | '7d'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'ytd'
  | 'all'
  | 'custom';

interface DateRangePickerProps {
  preset: PresetRange;
  startDate: number | null;
  endDate: number | null;
  onChange: (preset: PresetRange, start: number | null, end: number | null) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  hidePresets?: boolean;
  placeholder?: string;
  variant?: 'default' | 'outline';
}

const PRESETS: { label: string; value: PresetRange }[] = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Quarter', value: 'thisQuarter' },
  { label: 'Last Quarter', value: 'lastQuarter' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'All Time', value: 'all' },
  { label: 'Custom Range', value: 'custom' },
];

export function DateRangePicker({
  preset,
  startDate,
  endDate,
  onChange,
  className = '',
  minDate,
  maxDate,
  hidePresets = false,
  placeholder,
  variant = 'default',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [leftMonth, setLeftMonth] = useState<Date>(startOfMonth(new Date()));
  const [rightMonth, setRightMonth] = useState<Date>(addMonths(startOfMonth(new Date()), 1));

  // Local state for custom selections before applying
  const [localPreset, setLocalPreset] = useState<PresetRange>(preset);
  const [localStart, setLocalStart] = useState<number | null>(startDate);
  const [localEnd, setLocalEnd] = useState<number | null>(endDate);

  const [startInput, setStartInput] = useState(
    startDate ? format(new Date(startDate), 'MM-dd-yyyy') : ''
  );
  const [endInput, setEndInput] = useState(endDate ? format(new Date(endDate), 'MM-dd-yyyy') : '');

  // Sync inputs with local state
  useEffect(() => {
    setStartInput(localStart ? format(new Date(localStart), 'MM-dd-yyyy') : '');
  }, [localStart]);

  useEffect(() => {
    setEndInput(localEnd ? format(new Date(localEnd), 'MM-dd-yyyy') : '');
  }, [localEnd]);

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setLocalPreset(preset);
      setLocalStart(startDate);
      setLocalEnd(endDate);

      const startM = startDate ? startOfMonth(new Date(startDate)) : startOfMonth(new Date());
      setLeftMonth(startM);

      if (endDate) {
        const endM = startOfMonth(new Date(endDate));
        if (startM.getTime() === endM.getTime()) {
          setRightMonth(addMonths(startM, 1));
        } else {
          setRightMonth(endM);
        }
      } else {
        setRightMonth(addMonths(startM, 1));
      }
    }
  }, [isOpen, preset, startDate, endDate]);

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDisplayString = () => {
    if (preset !== 'custom' && !hidePresets) {
      return PRESETS.find((p) => p.value === preset)?.label || placeholder || 'Select Date Range';
    }
    if (startDate && endDate) {
      return `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`;
    }
    return placeholder || 'Custom Range';
  };

  const handlePresetClick = (p: PresetRange) => {
    setLocalPreset(p);
    if (p !== 'custom') {
      onChange(p, null, null);
      setIsOpen(false);
    }
  };

  const handleDayClick = (date: Date) => {
    setLocalPreset('custom');
    const time = date.getTime();

    // If no start date, or both are selected, start a new selection
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(time);
      setLocalEnd(null);
    }
    // If start date exists but no end date
    else if (localStart && !localEnd) {
      if (time < localStart) {
        setLocalStart(time); // Restart if clicking before
      } else {
        setLocalEnd(time);
        onChange('custom', localStart, time);
        setIsOpen(false); // Auto close on finish
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isStart: boolean) => {
    const val = e.target.value;
    if (isStart) setStartInput(val);
    else setEndInput(val);

    const d = new Date(val.replace(/[-.]/g, '/'));
    if (!isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100) {
      if ((minDate && d < minDate) || (maxDate && d > maxDate)) return;

      setLocalPreset('custom');
      if (isStart) {
        const time = d.getTime();
        setLocalStart(time);
        setLeftMonth(startOfMonth(d));
        if (localEnd) onChange('custom', time, localEnd);
      } else {
        const time = d.getTime();
        setLocalEnd(time);
        setRightMonth(startOfMonth(d));
        if (localStart) onChange('custom', localStart, time);
      }
    }
  };

  const renderCalendar = (month: Date, isLeft: boolean) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfWeek = getDay(start);

    // Padding for first row
    const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => (
      <div key={`blank-${i}`} className="w-8 h-8" />
    ));

    return (
      <div className="flex-1 w-[260px]">
        <div className="flex items-center justify-between mb-4 px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              isLeft
                ? setLeftMonth(subMonths(leftMonth, 1))
                : setRightMonth(subMonths(rightMonth, 1))
            }
            className="w-8 h-8 rounded-full text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="font-semibold text-slate-800">{format(month, 'MMM yyyy')}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              isLeft
                ? setLeftMonth(addMonths(leftMonth, 1))
                : setRightMonth(addMonths(rightMonth, 1))
            }
            className="w-8 h-8 rounded-full text-slate-600"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 gap-x-0">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 mb-2">
              {d}
            </div>
          ))}
          {blanks}
          {days.map((day, idx) => {
            const isStart = localStart && isSameDay(day, new Date(localStart));
            const isEnd = localEnd && isSameDay(day, new Date(localEnd));
            const isSelected = isStart || isEnd;
            const isBetween =
              localStart &&
              localEnd &&
              isWithinInterval(day, { start: new Date(localStart), end: new Date(localEnd) });
            const isDisabled = (minDate && day < minDate) || (maxDate && day > maxDate);

            let bgClass = 'bg-transparent';
            let roundedClass = 'rounded-md';
            let textClass = isDisabled
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-100';

            if (isSelected) {
              bgClass = 'bg-primary';
              textClass = 'text-white font-bold shadow-sm';
              if (isStart && localEnd) roundedClass = 'rounded-l-md rounded-r-none';
              if (isEnd && localStart) roundedClass = 'rounded-r-md rounded-l-none';
              if (isStart && isEnd) roundedClass = 'rounded-md'; // Same day
            } else if (isBetween) {
              bgClass = 'bg-primary/10';
              roundedClass = 'rounded-none';
              textClass = 'text-slate-800';
            }

            return (
              <div
                key={idx}
                className={`w-8 h-8 flex items-center justify-center relative ${bgClass} ${roundedClass}`}
              >
                <Button
                  variant="ghost"
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(day)}
                  className={`w-8 h-8 p-0 flex items-center justify-center text-sm z-10 ${textClass} ${!isSelected && !isBetween ? 'rounded-md' : roundedClass} hover:bg-transparent`}
                >
                  {format(day, 'd')}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isOutline = variant === 'outline';
  const buttonClass = isOutline
    ? `flex w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 gap-2 h-10 ${className}`
    : `group inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all duration-300 border border-transparent bg-slate-100 hover:bg-slate-200 active:scale-95 hover:-translate-y-0.5 text-slate-700 px-4 py-2 h-9 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-slate-400/20 ${className}`;

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant={isOutline ? 'outline' : 'secondary'} className={buttonClass}>
          {isOutline ? (
            <>
              <span
                className={`font-semibold whitespace-nowrap text-left ${startDate && endDate ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {getDisplayString()}
              </span>
              <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 flex-1 text-left">
                <TruncatedText text={getDisplayString()} className="text-foreground font-bold" />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </>
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="end"
          onWheel={(e) => e.stopPropagation()}
          className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl z-[var(--z-popover)] flex overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Calendars Section */}
          {localPreset === 'custom' && (
            <div className="flex flex-col p-4 bg-transparent">
              {/* Manual Date Inputs */}
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  value={startInput}
                  placeholder="MM-DD-YYYY"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-center font-medium focus:outline-none focus:border-primary/50 text-slate-700 bg-white shadow-sm"
                  onChange={(e) => handleInputChange(e, true)}
                />
                <input
                  type="text"
                  value={endInput}
                  placeholder="MM-DD-YYYY"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-center font-medium focus:outline-none focus:border-primary/50 text-slate-700 bg-white shadow-sm"
                  onChange={(e) => handleInputChange(e, false)}
                />
              </div>

              <div className="flex gap-6 mt-2">
                {renderCalendar(leftMonth, true)}
                {renderCalendar(rightMonth, false)}
              </div>
            </div>
          )}

          {/* Presets Section */}
          {!hidePresets && (
            <div className="w-48 bg-transparent border-l border-slate-200/60 p-2 flex flex-col gap-1">
              {PRESETS.map((p) => (
                <Button
                  variant="ghost"
                  key={p.value}
                  onClick={() => handlePresetClick(p.value)}
                  className={`justify-start w-full px-2 py-2 h-auto text-sm font-medium ${
                    localPreset === p.value
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : ''
                  }`}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
