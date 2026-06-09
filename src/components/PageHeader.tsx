import React from 'react';
import { Search } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  actionButton?: React.ReactNode;
}

export function PageHeader({ title, subtitle, searchTerm, onSearchChange, placeholder = "Search...", actionButton }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 shrink-0">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {onSearchChange && (
            <div className="relative w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={placeholder} 
                value={searchTerm || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
        )}
        {actionButton && (
          <div className="shrink-0">{actionButton}</div>
        )}
      </div>
    </div>
  );
}
