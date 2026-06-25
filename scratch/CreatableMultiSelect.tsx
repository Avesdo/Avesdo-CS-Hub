import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Check, Ghost } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatableMultiSelectProps {
  values: string[];
  options: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const CreatableMultiSelect: React.FC<CreatableMultiSelectProps> = ({
  values,
  options,
  onChange,
  placeholder = 'Select or type to create...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !values.includes(val)) {
        onChange([...values, val]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const removeValue = (valToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== valToRemove));
  };

  const toggleOption = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
    setInputValue('');
    inputRef.current?.focus();
  };

  const filteredOptions = useMemo(() => {
    let result = options.filter(
      (o) => o.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    result = [...result].sort((a, b) => {
      const aSelected = values.includes(a);
      const bSelected = values.includes(b);
      if (aSelected === bSelected) return 0;
      return aSelected ? -1 : 1;
    });

    return result;
  }, [options, inputValue, values]);

  const showCreateOption =
    inputValue.trim() !== '' &&
    !options.some((o) => o.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !values.includes(inputValue.trim());

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <div
        className="min-h-[50px] w-full rounded-2xl bg-white transition-all flex flex-wrap items-center gap-2 py-1 cursor-text"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <AnimatePresence>
          {values.map((val) => (
            <motion.div
              key={val}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white hover:bg-primary/90 transition-colors font-bold text-2xl rounded-md shadow-sm"
            >
              <span className="truncate max-w-[300px]">{val}</span>
              <button
                type="button"
                onClick={(e) => removeValue(val, e)}
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
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[200px] w-full text-4xl font-bold text-slate-800 placeholder:text-slate-300 border-none bg-transparent focus:outline-none focus:ring-0 p-0"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 z-[99999] w-[320px] rounded-lg border bg-white/95 backdrop-blur-md border-slate-200/60 text-slate-900 shadow-md outline-none overflow-hidden flex flex-col max-h-[300px]"
          >
            <div className="overflow-y-auto p-1 custom-thin-scroll flex flex-col gap-0.5">
              {showCreateOption && (
                <button
                  type="button"
                  onClick={() => {
                    onChange([...values, inputValue.trim()]);
                    setInputValue('');
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center"
                >
                  <span className="mr-2 opacity-60">Create</span> "{inputValue.trim()}"
                </button>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = values.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleOption(opt)}
                      className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md transition-colors outline-none ${
                        isSelected
                          ? 'bg-primary/5 text-primary'
                          : 'text-slate-900 hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary'
                      }`}
                    >
                      <span className="font-medium">{opt}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })
              ) : !showCreateOption ? (
                <div className="px-4 py-6 text-sm text-slate-400 italic text-center font-medium">
                  No matching services found. Type to create one.
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
