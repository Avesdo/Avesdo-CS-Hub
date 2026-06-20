import React from 'react';
import { X, FilterX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterGroup {
  label: string;
  values: string[];
  onRemove: (value: string) => void;
}

interface ActiveFilterBarProps {
  filters: FilterGroup[];
  onClearAll?: () => void;
}

export function ActiveFilterBar({ filters, onClearAll }: ActiveFilterBarProps) {
  const activeItems = filters.flatMap((group) =>
    group.values.map((val) => ({
      groupLabel: group.label,
      value: val,
      onRemove: group.onRemove,
    }))
  );

  if (activeItems.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 mb-0 animate-in fade-in slide-in-from-top-1 px-1">
      <span className="text-xs font-semibold text-slate-500 tracking-wider mr-1">
        Active Filters:
      </span>
      {onClearAll && activeItems.length > 1 && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-red-600 bg-transparent hover:bg-red-50 hover:text-red-700 transition-colors rounded-full border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500/20 mr-1"
        >
          <FilterX className="w-3 h-3" />
          Clear All
        </button>
      )}
      <AnimatePresence>
        {activeItems.map((item, idx) => (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            key={`${item.groupLabel}-${item.value}-${idx}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/5 text-primary border border-primary/10 shadow-sm"
          >
            {item.groupLabel}: <span className="text-primary font-bold">{item.value}</span>
            <button
              onClick={() => item.onRemove(item.value)}
              className="hover:bg-primary/20 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
