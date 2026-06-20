import React, { useState, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, Search } from 'lucide-react';
import { SelectOption } from './Select';

interface MultiSelectProps {
  options: SelectOption[];
  values: string[];
  onChange: (vals: string[]) => void;
  trigger: React.ReactNode;
  align?: 'left' | 'right' | 'center';
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
  dropdownWidth = 'min-w-[160px]',
  searchable = false,
  searchPlaceholder = 'Search...',
}: MultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const radixAlign = align === 'left' ? 'start' : align === 'right' ? 'end' : 'center';

  const filteredOptions = useMemo(() => {
    let result = options;
    if (searchable && searchTerm) {
      result = options.filter((opt) => {
        const text = typeof opt.label === 'string' ? opt.label.toLowerCase() : opt.value.toLowerCase();
        return text.includes(searchTerm.toLowerCase());
      });
    }

    result = [...result].sort((a, b) => {
      const aSelected = values.includes(a.value);
      const bSelected = values.includes(b.value);
      if (aSelected === bSelected) return 0;
      return aSelected ? -1 : 1;
    });

    return result;
  }, [options, searchable, searchTerm, values]);

  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Popover.Root modal={false} onOpenChange={(open) => { if (!open) setSearchTerm(''); }}>
        <Popover.Trigger asChild>
          <div className="cursor-pointer outline-none">
            {trigger}
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            // @ts-ignore: Prevent Radix UI auto-focus on open
            onOpenAutoFocus={(e: Event) => e.preventDefault()}
            align={radixAlign}
            sideOffset={8}
            className={`bg-white/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-[99999] overflow-hidden flex flex-col max-h-[300px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-200 ${dropdownWidth} ${menuClassName}`}
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
                      className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md transition-colors outline-none ${isSelected ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary'}`}
                      onClick={() => toggleValue(opt.value)}
                    >
                      <span className="font-medium">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
