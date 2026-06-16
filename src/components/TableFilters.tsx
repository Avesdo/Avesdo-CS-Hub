import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { MultiSelect } from './ui/MultiSelect';
import { Select } from './ui/Select';
import { getSettingBadge } from '../utils/uiUtils';

export const ColumnFilter = ({
  options,
  selected,
  onChange,
  searchable = false,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  searchable?: boolean;
}) => {
  return (
    <MultiSelect
      options={options.map((opt) => ({ label: opt, value: opt }))}
      values={selected}
      onChange={onChange}
      searchable={searchable}
      dropdownWidth="w-[260px]"
      trigger={
        <button
          className={`p-1 rounded transition-opacity ${selected.length > 0 ? 'opacity-100 text-primary bg-primary/10' : 'opacity-0 group-hover/th:opacity-100 text-slate-400 hover:bg-slate-200'}`}
        >
          <Filter className="w-3.5 h-3.5" />
        </button>
      }
    />
  );
};

export const DateFilter = ({ dateRange, setDateRange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [localStartMonth, setLocalStartMonth] = useState('');
  const [localStartYear, setLocalStartYear] = useState('');
  const [localEndMonth, setLocalEndMonth] = useState('');
  const [localEndYear, setLocalEndYear] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (dateRange?.start) {
        const [y, m] = dateRange.start.split('-');
        setLocalStartYear(y);
        setLocalStartMonth(m);
      } else {
        setLocalStartYear('');
        setLocalStartMonth('');
      }
      if (dateRange?.end) {
        const [y, m] = dateRange.end.split('-');
        setLocalEndYear(y);
        setLocalEndMonth(m);
      } else {
        setLocalEndYear('');
        setLocalEndMonth('');
      }
    }
  }, [isOpen, dateRange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString());

  const handleApply = () => {
    const start = localStartYear && localStartMonth ? `${localStartYear}-${localStartMonth}` : '';
    const end = localEndYear && localEndMonth ? `${localEndYear}-${localEndMonth}` : '';

    if (!start && !end) {
      setDateRange(null);
    } else {
      setDateRange({ start, end });
    }
    setIsOpen(false);
  };

  const handlePresetSelect = (preset: string) => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth(); // 0-11
    const q = Math.floor(m / 3); // 0-3

    let start = '';
    let end = '';

    const formatMonth = (year: number, month: number) => {
      return `${year}-${(month + 1).toString().padStart(2, '0')}`;
    };

    if (preset === 'This Month') {
      start = formatMonth(y, m);
      end = formatMonth(y, m);
    } else if (preset === 'Last Month') {
      const lastM = m === 0 ? 11 : m - 1;
      const lastY = m === 0 ? y - 1 : y;
      start = formatMonth(lastY, lastM);
      end = formatMonth(lastY, lastM);
    } else if (preset === 'This Quarter') {
      const startM = q * 3;
      const endM = startM + 2;
      start = formatMonth(y, startM);
      end = formatMonth(y, endM);
    } else if (preset === 'Last Quarter') {
      const lastQ = q === 0 ? 3 : q - 1;
      const lastY = q === 0 ? y - 1 : y;
      const startM = lastQ * 3;
      const endM = startM + 2;
      start = formatMonth(lastY, startM);
      end = formatMonth(lastY, endM);
    } else if (preset === 'Last 6 Months') {
      let startM = m - 5;
      let startY = y;
      if (startM < 0) {
        startM += 12;
        startY -= 1;
      }
      start = formatMonth(startY, startM);
      end = formatMonth(y, m);
    } else if (preset === 'This Year') {
      start = formatMonth(y, 0);
      end = formatMonth(y, 11);
    } else if (preset === 'Last Year') {
      start = formatMonth(y - 1, 0);
      end = formatMonth(y - 1, 11);
    } else if (preset === 'No Date') {
      setDateRange('no-date');
      setIsOpen(false);
      return;
    } else if (preset === 'All Time') {
      handleClear();
      return;
    }

    setDateRange({ start, end });
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalStartMonth('');
    setLocalStartYear('');
    setLocalEndMonth('');
    setLocalEndYear('');
    setDateRange(null);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block ml-1" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1 rounded opacity-0 group-hover/th:opacity-100 transition-opacity ${dateRange ? 'opacity-100 text-primary bg-primary/10' : 'text-slate-400 hover:bg-slate-200'}`}
      >
        <Filter className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-[440px] flex bg-white border border-border rounded-xl shadow-xl z-50 font-normal cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-[140px] bg-slate-50 border-r border-border p-2 flex flex-col gap-1 shrink-0 rounded-l-xl">
            <div className="text-[11px] font-bold text-muted-foreground px-2 py-1 mb-1">
              Quick Select
            </div>
            {[
              'This Month',
              'Last Month',
              'This Quarter',
              'Last Quarter',
              'Last 6 Months',
              'This Year',
              'Last Year',
              'No Date',
              'All Time',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetSelect(preset)}
                className="text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200/50 hover:text-slate-900 rounded-md transition-colors font-medium whitespace-nowrap"
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <div className="text-sm font-bold text-foreground mb-4">Custom Range</div>

            <div className="flex gap-3 mb-5 flex-1">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">From</label>
                <Select
                  className="w-full"
                  options={months}
                  value={localStartMonth}
                  onChange={setLocalStartMonth}
                  dropdownWidth="w-full min-w-[120px]"
                  menuClassName="!max-h-[180px]"
                  trigger={
                    <button
                      type="button"
                      className="w-full flex items-center justify-between border border-input rounded-md px-3 py-2 text-sm bg-white hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all h-[38px]"
                    >
                      <span
                        className={
                          localStartMonth ? 'text-foreground' : 'text-muted-foreground truncate'
                        }
                      >
                        {localStartMonth
                          ? months.find((m) => m.value === localStartMonth)?.label
                          : 'Select Month'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 opacity-50" />
                    </button>
                  }
                />
                <Select
                  className="w-full"
                  options={years.map((y) => ({ label: y, value: y }))}
                  value={localStartYear}
                  onChange={setLocalStartYear}
                  dropdownWidth="w-full min-w-[120px]"
                  menuClassName="!max-h-[180px]"
                  trigger={
                    <button
                      type="button"
                      className="w-full flex items-center justify-between border border-input rounded-md px-3 py-2 text-sm bg-white hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all h-[38px]"
                    >
                      <span
                        className={
                          localStartYear ? 'text-foreground' : 'text-muted-foreground truncate'
                        }
                      >
                        {localStartYear || 'Select Year'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 opacity-50" />
                    </button>
                  }
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">To</label>
                <Select
                  className="w-full"
                  options={months}
                  value={localEndMonth}
                  onChange={setLocalEndMonth}
                  dropdownWidth="w-full min-w-[120px]"
                  menuClassName="!max-h-[180px]"
                  trigger={
                    <button
                      type="button"
                      className="w-full flex items-center justify-between border border-input rounded-md px-3 py-2 text-sm bg-white hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all h-[38px]"
                    >
                      <span
                        className={
                          localEndMonth ? 'text-foreground' : 'text-muted-foreground truncate'
                        }
                      >
                        {localEndMonth
                          ? months.find((m) => m.value === localEndMonth)?.label
                          : 'Select Month'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 opacity-50" />
                    </button>
                  }
                />
                <Select
                  className="w-full"
                  options={years.map((y) => ({ label: y, value: y }))}
                  value={localEndYear}
                  onChange={setLocalEndYear}
                  dropdownWidth="w-full min-w-[120px]"
                  menuClassName="!max-h-[180px]"
                  trigger={
                    <button
                      type="button"
                      className="w-full flex items-center justify-between border border-input rounded-md px-3 py-2 text-sm bg-white hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all h-[38px]"
                    >
                      <span
                        className={
                          localEndYear ? 'text-foreground' : 'text-muted-foreground truncate'
                        }
                      >
                        {localEndYear || 'Select Year'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 opacity-50" />
                    </button>
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              <button
                onClick={handleClear}
                className="text-sm font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Clear Date
              </button>
              <button
                onClick={handleApply}
                className="h-9 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const StatusDropdown = ({ value, options, onChange, settings }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className="relative inline-block"
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer hover:opacity-80 transition-all active:scale-95 flex items-center"
      >
        {getSettingBadge('serviceStatuses', value, settings)}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[140px] bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px] animate-in fade-in zoom-in-95 duration-100">
          <div className="overflow-y-auto p-1 custom-thin-scroll">
            {options.map((opt: string) => (
              <button
                key={opt}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-md transition-colors ${value === opt ? 'bg-primary/5 text-primary' : 'text-foreground'}`}
              >
                <span className="font-medium">
                  {getSettingBadge('serviceStatuses', opt, settings)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
