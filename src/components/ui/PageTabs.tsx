import React from 'react';
import { LucideIcon } from 'lucide-react';

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
    <div className="flex items-center gap-2 overflow-x-auto custom-thin-scroll py-2 px-2 -mx-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.label;
        const isSuspended = tab.isDestructive;

        return (
          <button
            key={tab.label}
            onClick={() => onTabChange(tab.label)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition-all duration-300 ease-in-out transform-gpu active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              isActive
                ? 'bg-white text-foreground border-border'
                : `bg-muted border-transparent hover:bg-accent hover:border-border ${
                    isSuspended
                      ? 'text-destructive/70 hover:text-destructive'
                      : 'text-muted-foreground hover:text-foreground'
                  }`
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isActive && isSuspended
                  ? 'text-destructive'
                  : isActive
                    ? 'text-primary'
                    : 'opacity-70'
              }`}
            />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
