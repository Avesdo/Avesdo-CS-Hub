import React, { useState, useRef, useEffect } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
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
  align?: 'left' | 'right';
  className?: string;
  dropdownWidth?: string;
  hideCheckmark?: boolean;
  position?: 'top' | 'bottom';
}

export function Select({ options, value, onChange, trigger, align = 'left', className = '', menuClassName = '', dropdownWidth = 'min-w-[240px]', hideCheckmark = false, position = 'bottom' }: SelectProps & { menuClassName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => setIsOpen(false), isOpen);

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

  const positionClasses = position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`absolute ${positionClasses} bg-white border border-border rounded-xl shadow-xl z-[250] overflow-hidden flex flex-col max-h-[300px] animate-in fade-in zoom-in-95 duration-100 ${dropdownWidth} ${align === 'right' ? 'right-0' : 'left-0'} ${menuClassName}`}>
          <div className="overflow-y-auto p-1 custom-thin-scroll">
            {options.map((opt) => (
              <button 
                key={opt.value} 
                type="button"
                className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-md transition-colors ${value === opt.value ? 'bg-primary/5 text-primary' : 'text-foreground'}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span className="font-medium">{opt.label}</span>
                {!hideCheckmark && value === opt.value && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
