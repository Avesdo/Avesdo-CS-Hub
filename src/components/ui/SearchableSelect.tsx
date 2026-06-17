import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

interface SearchableSelectProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    ref,
    () => {
      setIsOpen(false);
      setSearchTerm('');
    },
    isOpen
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  const selectedLabel = useMemo(() => {
    return options.find((o) => o.value === value)?.label || '';
  }, [options, value]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div className="relative cursor-text" onClick={() => setIsOpen(true)}>
        <input
          type="text"
          value={isOpen ? searchTerm : selectedLabel}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedLabel || placeholder}
          className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-slate-400 transition-all text-sm pr-8 truncate"
        />
        <ChevronDown
          className={`w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-lg shadow-lg z-[99999] p-1 font-normal max-h-48 overflow-y-auto custom-thin-scroll animate-in fade-in slide-in-from-top-1 duration-200">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`px-3 py-2 flex items-center hover:bg-slate-50 cursor-pointer rounded-md text-sm transition-colors text-slate-700 ${value === opt.value ? 'bg-primary/5 text-primary font-medium' : ''}`}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400 italic">No matches found.</div>
          )}
        </div>
      )}
    </div>
  );
};
