import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

interface CreatableSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
}

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  value,
  options,
  onChange,
  placeholder,
}) => {
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
      window.addEventListener('keydown', handleKeyDown, true); // Use capture phase to intercept before bubbles to generic listeners
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter((o) => o.toLowerCase().includes(value.toLowerCase()));
  }, [options, value]);

  return (
    <div className="relative w-full" ref={ref}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={(e) => {
            setIsOpen(true);
            e.target.select();
          }}
          onClick={(e) => {
            setIsOpen(true);
            e.currentTarget.select();
          }}
          placeholder={placeholder}
          className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm h-[38px] pr-8"
        />
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-xl shadow-xl z-[250] p-1 font-normal animate-in fade-in slide-in-from-top-1 duration-100 max-h-48 overflow-y-auto custom-thin-scroll">
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-md text-sm transition-colors text-foreground"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
