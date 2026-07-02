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
  getDay,
  startOfDay,
} from 'date-fns';

interface DatePickerProps {
  value: number | null | undefined;
  onChange: (val: number | null, str: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  trigger?: React.ReactNode;
  variant?: 'default' | 'outline';
}

export function DatePicker({
  value,
  onChange,
  label = 'Select Date',
  placeholder = 'Select Date',
  className = '',
  trigger,
  variant = 'outline',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Local state
  const [localDate, setLocalDate] = useState<number | null>(value || null);
  const [calMonth, setCalMonth] = useState<Date>(
    startOfMonth(value ? new Date(value) : new Date())
  );
  const [dateInput, setDateInput] = useState(value ? format(new Date(value), 'MM-dd-yyyy') : '');

  // Sync input with local state
  useEffect(() => {
    setDateInput(localDate ? format(new Date(localDate), 'MM-dd-yyyy') : '');
  }, [localDate]);

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setLocalDate(value || null);
      setCalMonth(startOfMonth(value ? new Date(value) : new Date()));
    }
  }, [isOpen, value]);

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDisplayString = () => {
    if (!value) return placeholder;
    return format(new Date(value), 'MMM d, yyyy');
  };

  const applyDate = (time: number | null) => {
    if (time !== value) {
      onChange(time, time ? format(new Date(time), 'MM/dd/yyyy') : '');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateInput(val);

    if (val === '') {
      setLocalDate(null);
      applyDate(null);
      return;
    }

    const d = new Date(val.replace(/[-.]/g, '/'));
    if (!isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100) {
      const time = d.getTime();
      setLocalDate(time);
      setCalMonth(startOfMonth(d));
      applyDate(time);
    }
  };

  const handleDayClick = (day: Date) => {
    const time = day.getTime();
    setLocalDate(time);
    applyDate(time);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = startOfDay(new Date());
    const time = today.getTime();
    setLocalDate(time);
    setCalMonth(startOfMonth(today));
    applyDate(time);
    setIsOpen(false);
  };

  const renderCalendar = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfWeek = getDay(start);

    const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => (
      <div key={`blank-${i}`} className="w-8 h-8" />
    ));

    return (
      <div className="w-[260px]">
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            onClick={() => setCalMonth(subMonths(calMonth, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="font-semibold text-slate-800">{format(month, 'MMM yyyy')}</div>
          <button
            onClick={() => setCalMonth(addMonths(calMonth, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 gap-x-0">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 mb-2">
              {d}
            </div>
          ))}
          {blanks}
          {days.map((day, idx) => {
            const isSelected = localDate && isSameDay(day, new Date(localDate));

            let bgClass = 'bg-transparent';
            const roundedClass = 'rounded-md';
            let textClass = 'text-slate-700 hover:bg-slate-100';

            if (isSelected) {
              bgClass = 'bg-primary';
              textClass = 'text-white font-bold shadow-sm';
            }

            return (
              <div
                key={idx}
                className={`w-8 h-8 flex items-center justify-center relative ${bgClass} ${roundedClass}`}
              >
                <button
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`w-8 h-8 flex items-center justify-center text-sm transition-colors z-10 ${textClass} rounded-md`}
                >
                  {format(day, 'd')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isOutline = variant === 'outline';
  let buttonClass = '';

  if (!trigger) {
    buttonClass = isOutline
      ? `flex w-full items-center gap-2 justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 h-10 ${className}`
      : `group inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all duration-300 border border-transparent bg-slate-100 hover:bg-slate-200 active:scale-95 hover:-translate-y-0.5 text-slate-700 px-4 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-slate-400/20 ${className}`;
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        {trigger ? (
          <div className={`relative popover-container inline-block ${className}`}>{trigger}</div>
        ) : (
          <button className={buttonClass}>
            {isOutline ? (
              <>
                <span
                  className={`font-semibold whitespace-nowrap text-left ${value ? 'text-foreground' : 'text-muted-foreground'}`}
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
          </button>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl z-[var(--z-popover)] p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Manual Date Input */}
          <div className="mb-4">
            <input
              type="text"
              value={dateInput}
              placeholder="MM-DD-YYYY"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-center font-medium focus:outline-none focus:border-primary/50 text-slate-700 bg-white shadow-sm"
              onChange={handleInputChange}
            />
          </div>

          <div>{renderCalendar(calMonth)}</div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex">
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-md transition-colors w-full"
            >
              Select Today
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
