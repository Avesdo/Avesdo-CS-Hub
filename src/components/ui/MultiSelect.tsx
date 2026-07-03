import React, { useState, useMemo, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, Search, Ghost, X, ChevronDown, Edit2 } from 'lucide-react';
import { SelectOption } from './Select';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence, motion } from 'framer-motion';
import { formControlVariants } from './form-controls';
import { TruncatedText } from '../../components/ui/TruncatedText';

const multiSelectTriggerVariants = cva(
  twMerge(formControlVariants(), 'cursor-pointer min-h-[38px]'),
  {
    variants: {
      variant: {
        default: '',
        inline: 'border-slate-100 bg-slate-50/50 shadow-none hover:bg-slate-50',
        creatable:
          'min-h-[50px] !border-transparent !bg-transparent !shadow-none focus:!ring-0 flex flex-wrap items-center gap-2 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface MultiSelectProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof multiSelectTriggerVariants> {
  options: SelectOption[] | { label: string; value: string }[] | { name: string }[] | string[];
  values: string[];
  onChange: (vals: string[]) => void;
  trigger?: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  menuClassName?: string;
  dropdownWidth?: string;
  searchable?: boolean;
  creatable?: boolean;
  searchPlaceholder?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  values,
  onChange,
  trigger,
  align = 'left',
  className,
  menuClassName,
  dropdownWidth = 'min-w-[160px]',
  searchable = false,
  creatable = false,
  searchPlaceholder = 'Search...',
  placeholder = 'Select...',
  variant,
  disabled,
  ...props
}: MultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const radixAlign = align === 'left' ? 'start' : align === 'right' ? 'end' : 'center';

  const normalizedOptions: SelectOption[] = useMemo(() => {
    return options.map((opt: any) => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      if ('name' in opt) {
        return { label: opt.name, value: opt.name };
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
      const aSelected = values.includes(a.value);
      const bSelected = values.includes(b.value);
      if (aSelected === bSelected) return 0;
      return aSelected ? -1 : 1;
    });

    return result;
  }, [normalizedOptions, searchable, creatable, searchTerm, values]);

  const showCreateOption =
    creatable &&
    searchTerm.trim() !== '' &&
    !normalizedOptions.some((o) => o.value.toLowerCase() === searchTerm.trim().toLowerCase()) &&
    !values.includes(searchTerm.trim());

  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
    if (creatable) {
      setSearchTerm('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showCreateOption) {
        toggleValue(searchTerm.trim());
      } else if (filteredOptions.length > 0 && searchTerm.trim()) {
        toggleValue(filteredOptions[0].value);
        setSearchTerm('');
      }
    } else if (e.key === 'Backspace' && searchTerm === '' && values.length > 0 && creatable) {
      onChange(values.slice(0, -1));
    }
  };

  const removeValue = (valToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== valToRemove));
  };

  const renderCreatableTrigger = () => (
    <div className={twMerge(multiSelectTriggerVariants({ variant: 'creatable' }))}>
      <AnimatePresence>
        {values.map((val) => (
          <motion.div
            key={val}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white hover:bg-primary/90 transition-colors font-bold text-2xl rounded-md shadow-sm"
          >
            <TruncatedText text={val} containerClassName="max-w-[300px]">
              {val}
            </TruncatedText>
            <button
              type="button"
              onClick={(e) => removeValue(val, e)}
              onPointerDown={(e) => e.stopPropagation()}
              className="hover:bg-slate-700 rounded-full p-0.5 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (searchTerm.trim() && !values.includes(searchTerm.trim())) {
              toggleValue(searchTerm.trim());
              setIsOpen(true);
            }
          } else if (e.key === 'Backspace' && searchTerm === '' && values.length > 0) {
            onChange(values.slice(0, -1));
          }
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={values.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[200px] w-full text-4xl font-bold text-slate-800 placeholder:text-slate-300 border-none bg-transparent focus:outline-none focus:ring-0 p-0"
      />
    </div>
  );

  const renderInlineTrigger = () => (
    <div className={multiSelectTriggerVariants({ variant: 'inline' })}>
      <div className="flex flex-wrap gap-1.5 items-center flex-1">
        {values.length > 0 ? (
          values.map((val) => (
            <span
              key={val}
              className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1"
            >
              {val}
              <button
                type="button"
                onClick={(e) => removeValue(val, e)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400 font-medium">{placeholder}</span>
        )}
      </div>
      <div className="text-slate-400 hover:text-primary transition-colors shrink-0 p-1">
        <Edit2 className="w-4 h-4" />
      </div>
    </div>
  );

  const renderDefaultTrigger = () => (
    <button
      type="button"
      disabled={disabled}
      className={multiSelectTriggerVariants({ variant: 'default' })}
    >
      <TruncatedText
        text={String(values.length > 0 ? `${values.length} Selected` : placeholder)}
        containerClassName={twMerge('', values.length === 0 && 'text-muted-foreground')}
      >
        {values.length > 0 ? `${values.length} Selected` : placeholder}
      </TruncatedText>
      <ChevronDown
        className={twMerge(
          'h-4 w-4 opacity-50 shrink-0 transition-transform',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  );

  return (
    <div className={twMerge('relative inline-block w-full', className)} {...props}>
      <Popover.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (disabled) return;
          setIsOpen(open);
          if (!open) setSearchTerm('');
        }}
        modal={true}
      >
        <Popover.Trigger asChild>
          <div className="cursor-pointer outline-none w-full">
            {trigger
              ? trigger
              : creatable
                ? renderCreatableTrigger()
                : variant === 'inline'
                  ? renderInlineTrigger()
                  : renderDefaultTrigger()}
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align={radixAlign}
            sideOffset={8}
            onWheel={(e) => e.stopPropagation()}
            onOpenAutoFocus={(e) => {
              if (searchable && !creatable) {
                e.preventDefault();
                inputRef.current?.focus();
              }
            }}
            className={twMerge(
              'bg-white/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-[var(--z-popover)] overflow-hidden flex flex-col max-h-[300px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-200 pointer-events-auto',
              dropdownWidth,
              'max-w-[320px]',
              menuClassName
            )}
          >
            {searchable && !creatable && (
              <div className="p-2 border-b border-border bg-slate-50 flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm focus:ring-0 p-1"
                />
              </div>
            )}

            <div className="overflow-y-auto p-1 custom-thin-scroll flex flex-col overscroll-contain pointer-events-auto">
              {showCreateOption && (
                <button
                  type="button"
                  onClick={() => toggleValue(searchTerm.trim())}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center outline-none"
                >
                  <span className="mr-2 opacity-60 shrink-0">Create</span>
                  <TruncatedText text={String('"' + searchTerm.trim() + '"')}>
                    "{searchTerm.trim()}"
                  </TruncatedText>
                </button>
              )}

              {filteredOptions.length === 0 && !showCreateOption ? (
                <div className="px-3 py-6 flex flex-col items-center justify-center text-sm text-slate-400">
                  <Ghost className="w-8 h-8 text-slate-200 mb-2" />
                  <span className="font-medium text-slate-500">No results found</span>
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = values.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleValue(opt.value)}
                      className={twMerge(
                        'w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md transition-colors outline-none',
                        isSelected
                          ? 'bg-primary/5 text-primary'
                          : 'text-foreground hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary'
                      )}
                    >
                      <TruncatedText
                        text={String('' + opt.label + '')}
                        containerClassName={twMerge(
                          'font-medium flex-1 pr-2',
                          isSelected && 'font-semibold'
                        )}
                      >
                        {opt.label}
                      </TruncatedText>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-auto" />}
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
