import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

export default function MultiSelectCombobox({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select or type...',
}: {
  options: { name: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          e.stopPropagation();
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('pointerdown', handleClickOutside, true);
    return () => window.removeEventListener('pointerdown', handleClickOutside, true);
  }, [isOpen]);

  const filteredOptions = options.filter((opt) => {
    const safeName = opt?.name || '';
    return (
      safeName.toLowerCase().includes(query.toLowerCase()) && !selectedValues.includes(safeName)
    );
  });

  const handleSelect = (name: string) => {
    if (!selectedValues.includes(name)) {
      onChange([...selectedValues, name]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (nameToRemove: string) => {
    onChange(selectedValues.filter((n) => n !== nameToRemove));
  };

  const handleEdit = (nameToEdit: string) => {
    handleRemove(nameToEdit);
    setQuery(nameToEdit);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      e.preventDefault();
      handleSelect(query.trim());
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap gap-1 border border-slate-300 rounded-md p-1 min-h-[38px] bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
        {selectedValues.map((val) => (
          <Tooltip key={val} content="Click to edit" position="top">
            <span
              onClick={() => handleEdit(val)}
              className="flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:bg-slate-200 transition-colors"
            >
              {val}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(val);
                }}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </Tooltip>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedValues.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-1 py-0.5"
        />
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-slate-400 p-1">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-[99999] w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200 custom-thin-scroll">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-slate-500 text-center">
              {query ? `Press Enter to add "${query}"` : 'No options left.'}
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <button
                key={opt.name}
                type="button"
                onClick={() => handleSelect(opt.name)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700 transition-colors"
              >
                {opt.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
