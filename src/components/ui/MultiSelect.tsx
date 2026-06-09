import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { Check, Search } from 'lucide-react';
import { SelectOption } from './Select';

interface MultiSelectProps {
  options: SelectOption[];
  values: string[];
  onChange: (vals: string[]) => void;
  trigger: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
  dropdownWidth?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function MultiSelect({
  options,
  values,
  onChange,
  trigger,
  align = 'left',
  className = '',
  menuClassName = '',
  dropdownWidth = 'min-w-[240px]',
  searchable = false,
  searchPlaceholder = 'Search...',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    ref,
    () => {
      setIsOpen(false);
      setSearchTerm(''); // Reset search on close
    },
    isOpen
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
    }
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options;
    return options.filter((opt) => {
      // Basic text search. If label is complex, we just check value or try stringifying label.
      const text =
        typeof opt.label === 'string' ? opt.label.toLowerCase() : opt.value.toLowerCase();
      return text.includes(searchTerm.toLowerCase());
    });
  }, [options, searchable, searchTerm]);

  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 bg-white border border-border rounded-xl shadow-xl z-[250] overflow-hidden flex flex-col max-h-[300px] animate-in fade-in zoom-in-95 duration-100 ${dropdownWidth} ${align === 'right' ? 'right-0' : 'left-0'} ${menuClassName}`}
        >
          {searchable && (
            <div className="p-2 border-b border-border bg-slate-50 flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground ml-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent border-none outline-none text-sm focus:ring-0"
                autoFocus
              />
            </div>
          )}

          <div className="overflow-y-auto p-1 custom-thin-scroll">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                No results found.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = values.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-md transition-colors ${isSelected ? 'bg-primary/5 text-primary' : 'text-foreground'}`}
                    onClick={() => toggleValue(opt.value)}
                  >
                    <span className="font-medium">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
