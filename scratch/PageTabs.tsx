import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface TabConfig {
  label: string;
  icon: LucideIcon;
  isDestructive?: boolean;
}

interface PageTabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PageTabs({ tabs, activeTab, onTabChange }: PageTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto custom-thin-scroll bg-slate-100/50 p-1.5 rounded-xl border border-border/50 shadow-inner w-max">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.label;
        const isSuspended = tab.isDestructive;

        return (
          <button
            key={tab.label}
            onClick={() => onTabChange(tab.label)}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 whitespace-nowrap z-0 group ${
              isActive
                ? isSuspended
                  ? 'text-destructive'
                  : 'text-primary'
                : `hover:text-slate-700 ${isSuspended ? 'text-destructive/60 hover:text-destructive' : 'text-slate-500'}`
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/50 -z-10"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                isActive && isSuspended
                  ? 'text-destructive'
                  : isActive
                    ? 'text-primary'
                    : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
