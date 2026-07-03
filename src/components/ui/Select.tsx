import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, Search, Ghost } from 'lucide-react';
import { type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { formControlVariants } from './form-controls';

export interface SelectOption {
  label: React.ReactNode;
  value: string;
}

interface SelectProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof formControlVariants> {
  options: SelectOption[] | { label: string; value: string }[] | string[];
  value: string;
  onChange: (val: string) => void;
  trigger?: React.ReactNode;
  placeholder?: string;
  searchable?: boolean;
  creatable?: boolean;
  menuClassName?: string;
  dropdownWidth?: string;
  hideCheckmark?: boolean;
  align?: 'left' | 'right' | 'center';
  position?: 'top' | 'bottom';
  searchPlaceholder?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  trigger,
  placeholder = 'Select...',
  searchable = false,
  creatable = false,
  className,
  menuClassName,
  dropdownWidth = 'min-w-[160px]',
  hideCheckmark = false,
  align = 'left',
  position = 'bottom',
  searchPlaceholder = 'Search...',
  variant,
  disabled,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const radixAlign = align === 'left' ? 'start' : align === 'right' ? 'end' : 'center';

  const normalizedOptions: SelectOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  const filteredOptions = useMemo(() => {
    let result = normalizedOptions;
    if ((searchable || creatable) && searchTerm) {
      result = normalizedOptions.filter((opt) => {
        const text =
          typeof opt.label === 'string' ? opt.label.toLowerCase() : opt.value.toLowerCase();
        return text.includes(searchTerm.toLowerCase());
      });
    }

    result = [...result].sort((a, b) => {
      const aSelected = a.value === value;
      const bSelected = b.value === value;
      if (aSelected === bSelected) return 0;
      return aSelected ? -1 : 1;
    });

    return result;
  }, [normalizedOptions, searchable, creatable, searchTerm, value]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const showCreateOption =
    creatable &&
    searchTerm.trim() !== '' &&
    !normalizedOptions.some((o) => o.value.toLowerCase() === searchTerm.trim().toLowerCase());

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showCreateOption) {
      e.preventDefault();
      handleSelect(searchTerm.trim());
    }
  };

  return (
    <div className={twMerge('relative inline-block w-full', className)} {...props}>
      <Popover.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (disabled) return;
          setIsOpen(open);
          if (!open) setSearchTerm('');
          else if (creatable) setSearchTerm(value || '');
        }}
        modal={true}
      >
        <Popover.Trigger asChild>
          <div className="cursor-pointer outline-none w-full">
            {trigger || (
              <button
                type="button"
                disabled={disabled}
                className={twMerge(formControlVariants({ variant }), 'cursor-pointer')}
              >
                <span className={twMerge('truncate', !value && 'text-muted-foreground')}>
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                  className={twMerge(
                    'h-4 w-4 opacity-50 shrink-0 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
            )}
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align={radixAlign}
            side={position}
            onWheel={(e) => e.stopPropagation()}
            sideOffset={8}
            onOpenAutoFocus={(e) => {
              if (searchable || creatable) {
                e.preventDefault();
                inputRef.current?.focus();
              }
            }}
            className={twMerge(
              'bg-white/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-[var(--z-popover)] overflow-hidden flex flex-col max-h-[300px] pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-200',
              dropdownWidth,
              'max-w-[320px]',
              menuClassName
            )}
          >
            {(searchable || creatable) && (
              <div className="p-2 border-b border-border bg-slate-50 flex items-center gap-2">
                {!creatable && <Search className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />}
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm focus:ring-0 p-1"
                />
              </div>
            )}

            <div className="overflow-y-auto p-1 custom-thin-scroll pointer-events-auto flex flex-col overscroll-contain">
              {showCreateOption && (
                <button
                  type="button"
                  onClick={() => handleSelect(searchTerm.trim())}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center"
                >
                  <span className="mr-2 opacity-60 shrink-0">Create</span>
                  <span className="truncate">"{searchTerm.trim()}"</span>
                </button>
              )}

              {filteredOptions.length === 0 && !showCreateOption ? (
                <div className="px-3 py-6 flex flex-col items-center justify-center text-sm text-slate-400">
                  <Ghost className="w-8 h-8 text-slate-200 mb-2" />
                  <span className="font-medium text-slate-500">No options found</span>
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={twMerge(
                      'w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md transition-colors outline-none',
                      value === opt.value
                        ? 'bg-primary/5 text-primary'
                        : 'text-foreground hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary'
                    )}
                  >
                    <span
                      className={twMerge(
                        'font-medium truncate flex-1 pr-2',
                        value === opt.value ? 'font-semibold' : ''
                      )}
                    >
                      {opt.label}
                    </span>
                    {!hideCheckmark && value === opt.value && (
                      <Check className="w-4 h-4 text-primary shrink-0 ml-auto" />
                    )}
                  </button>
                ))
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
