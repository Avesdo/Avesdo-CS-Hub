import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface DatePickerProps {
  value: number | null | undefined;
  onChange: (val: number | null, str: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  trigger?: React.ReactNode;
}

const parseLocalDate = (str: string) => {
  if (!str) return null;
  const d = new Date(str.replace(/-/g, '/'));
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export function DatePicker({
  value,
  onChange,
  label = 'Select Date',
  placeholder = 'Select Date',
  className = '',
  trigger,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dateStr = value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const [localDateStr, setLocalDateStr] = useState(dateStr);

  const [calMonth, setCalMonth] = useState<Date>(() => {
    if (value) {
      const d = new Date(value);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  useEffect(() => {
    if (isOpen) {
      setLocalDateStr(dateStr);
      if (value) {
        const d = new Date(value);
        setCalMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      } else {
        setCalMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
      }
    }
  }, [isOpen, dateStr, value]);

  const applyLocalDate = () => {
    const d = parseLocalDate(localDateStr);
    if (d) {
      if (d.getTime() !== value) {
        onChange(d.getTime(), localDateStr);
      }
    } else if (!localDateStr.trim()) {
      if (value !== null && value !== undefined) {
        onChange(null, '');
      }
    } else {
      setLocalDateStr(dateStr);
    }
  };

  const handleClear = () => {
    if (value !== null && value !== undefined) {
      onChange(null, '');
    }
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newVal = today.getTime();
    if (newVal !== value) {
      onChange(newVal, today.toLocaleDateString());
    }
    setIsOpen(false);
  };

  const handleDayClick = (day: number) => {
    const selected = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
    const newVal = selected.getTime();
    if (newVal !== value) {
      onChange(newVal, selected.toLocaleDateString());
    }
    setIsOpen(false);
  };

  const renderCalendarDays = () => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const currentSelectedDay = value ? new Date(value).getDate() : null;
    const currentSelectedMonth = value ? new Date(value).getMonth() : null;
    const currentSelectedYear = value ? new Date(value).getFullYear() : null;

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        currentSelectedDay === day &&
        currentSelectedMonth === month &&
        currentSelectedYear === year;

      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDayClick(day)}
          className={`p-1.5 text-sm rounded-md transition-colors hover:bg-slate-100 ${
            isSelected
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm'
              : isToday
              ? 'font-bold text-primary bg-primary/5'
              : 'text-foreground'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const displayStr = value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : placeholder;

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && isOpen) applyLocalDate();
        setIsOpen(open);
      }}
    >
      <Popover.Trigger asChild>
        <div className={`relative popover-container ${trigger ? 'inline-block' : 'block w-full'} ${className}`}>
          {trigger ? (
            <div className="w-fit">{trigger}</div>
          ) : (
            <div className="flex w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm hover:border-primary/50 cursor-pointer transition-all duration-200">
              <span className={`font-semibold ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
                {displayStr}
              </span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={5}
          className="w-72 bg-white border border-border rounded-xl shadow-xl z-[99999] p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="text-sm font-semibold text-muted-foreground mb-2">{label}</div>
          <input
            type="text"
            placeholder="e.g. Dec 25, 2026 or 12/25/2026"
            className="w-full mb-4 px-3 py-2 border border-input rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center"
            value={localDateStr}
            onChange={(e) => setLocalDateStr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyLocalDate();
                setIsOpen(false);
              }
            }}
          />
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-sm">
              {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() =>
                  setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))
                }
                className="p-1 hover:bg-slate-100 rounded text-foreground"
              >
                {'<'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))
                }
                className="p-1 hover:bg-slate-100 rounded text-foreground"
              >
                {'>'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">{renderCalendarDays()}</div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors w-full border border-red-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors w-full border border-primary/20"
            >
              Select Today
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
