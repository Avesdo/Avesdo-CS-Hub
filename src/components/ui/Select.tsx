import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';

export interface SelectOption {
  label: React.ReactNode;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  trigger: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  menuClassName?: string;
  dropdownWidth?: string;
  hideCheckmark?: boolean;
  position?: 'top' | 'bottom';
}

export function Select({
  options,
  value,
  onChange,
  trigger,
  align = 'left',
  className = '',
  menuClassName = '',
  dropdownWidth = 'min-w-[240px]',
  hideCheckmark = false,
  position = 'bottom',
}: SelectProps) {
  const radixAlign = align === 'left' ? 'start' : align === 'right' ? 'end' : 'center';

  return (
    <div className={`relative inline-block ${className}`}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <div className="cursor-pointer outline-none">
            {trigger}
          </div>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align={radixAlign}
            side={position}
            sideOffset={8}
            className={`bg-white border border-border rounded-xl shadow-xl z-[99999] overflow-hidden flex flex-col max-h-[300px] animate-in fade-in zoom-in-95 duration-100 ${dropdownWidth} ${menuClassName}`}
          >
            <div className="overflow-y-auto p-1 custom-thin-scroll">
              <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
                {options.map((opt) => (
                  <DropdownMenu.RadioItem
                    key={opt.value}
                    value={opt.value}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-md transition-colors cursor-pointer outline-none focus:bg-slate-50 ${
                      value === opt.value ? 'bg-primary/5 text-primary' : 'text-foreground'
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    {!hideCheckmark && value === opt.value && (
                      <DropdownMenu.ItemIndicator>
                        <Check className="w-4 h-4 text-primary" />
                      </DropdownMenu.ItemIndicator>
                    )}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
