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
  dropdownWidth = 'min-w-[160px]',
  hideCheckmark = false,
  position = 'bottom',
}: SelectProps) {
  const radixAlign = align === 'left' ? 'start' : align === 'right' ? 'end' : 'center';

  return (
    <div className={`relative inline-block ${className}`}>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <div className="cursor-pointer outline-none">
            {trigger}
          </div>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          // @ts-ignore: Radix UI Types missing onOpenAutoFocus for DropdownMenu in this version, but it works at runtime
          onOpenAutoFocus={(e: Event) => e.preventDefault()}
          align={radixAlign}
          side={position}
          sideOffset={8}
          className={`bg-white/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-[99999] overflow-hidden flex flex-col max-h-[300px] pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-200 ${dropdownWidth} ${menuClassName}`}
        >
          <div className="overflow-y-auto p-1 custom-thin-scroll pointer-events-auto">
            <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
              {options.map((opt) => (
                <DropdownMenu.RadioItem
                  key={opt.value}
                  value={opt.value}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer outline-none ${
                    value === opt.value ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary'
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
      </DropdownMenu.Root>
    </div>
  );
}
