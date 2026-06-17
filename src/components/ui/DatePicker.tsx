import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

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
  const ref = useRef<HTMLDivElement>(null);

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
      }
    }
  }, [isOpen, value, dateStr]);

  useEffect(() => {
    if (isOpen && localDateStr) {
      const d = parseLocalDate(localDateStr);
      if (d) {
        setCalMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [localDateStr, isOpen]);

  const applyLocalDate = () => {
    if (!localDateStr) {
      onChange(null, '');
    } else {
      const localDate = parseLocalDate(localDateStr);
      if (localDate) {
        const val = localDate.getTime();
        const str = localDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        onChange(val, str);
      } else {
        setLocalDateStr(dateStr);
      }
    }
  };

  useOnClickOutside(
    ref,
    () => {
      if (isOpen) {
        applyLocalDate();
        setIsOpen(false);
      }
    },
    isOpen
  );

  const handleDateSelect = (d: Date) => {
    const val = d.getTime();
    const str = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    onChange(val, str);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null, '');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    handleDateSelect(today);
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
    const days = [];

    let activeDateVal = value;
    if (localDateStr) {
      const d = parseLocalDate(localDateStr);
      if (d) activeDateVal = d.getTime();
    } else {
      activeDateVal = null;
    }

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), i);
      const isSelected = activeDateVal === d.getTime();

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => handleDateSelect(d)}
          className={`p-1.5 rounded-full text-sm hover:bg-slate-100 font-medium ${isSelected ? 'bg-primary text-white hover:bg-primary' : 'text-foreground'}`}
        >
          {i}
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
    <div className={`relative block popover-container w-full ${className}`} ref={ref}>
      {trigger ? (
        <div
          onClick={() => {
            if (isOpen) applyLocalDate();
            setIsOpen(!isOpen);
          }}
          className="w-fit"
        >
          {trigger}
        </div>
      ) : (
        <div
          className="flex w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm hover:border-primary/50 cursor-pointer transition-all duration-200"
          onClick={() => {
            if (isOpen) applyLocalDate();
            setIsOpen(!isOpen);
          }}
        >
          <span className={`font-semibold ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
            {displayStr}
          </span>
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-border rounded-xl shadow-xl z-[99999] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
        </div>
      )}
    </div>
  );
}
