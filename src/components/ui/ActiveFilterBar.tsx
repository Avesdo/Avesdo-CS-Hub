import React from 'react';
import { X, FilterX } from 'lucide-react';

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
  const activeItems = filters.flatMap(group => 
    group.values.map(val => ({
      groupLabel: group.label,
      value: val,
      onRemove: group.onRemove
    }))
  );

  if (activeItems.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-0.5 mb-1 animate-in fade-in slide-in-from-top-1 px-1">
      <span className="text-xs font-semibold text-slate-500 tracking-wider mr-1">Active Filters:</span>
      {onClearAll && activeItems.length > 1 && (
        <button 
          onClick={onClearAll} 
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-full border border-slate-200 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm mr-1"
        >
          <FilterX className="w-3 h-3" />
          Clear All
        </button>
      )}
      {activeItems.map((item, idx) => (
        <span key={`${item.groupLabel}-${item.value}-${idx}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {item.groupLabel}: <span className="text-foreground">{item.value}</span>
          <button 
            onClick={() => item.onRemove(item.value)} 
            className="hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
