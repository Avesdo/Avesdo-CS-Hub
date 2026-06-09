import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, subtitle, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-48 text-center px-4 ${className}`}>
      <Icon className="w-10 h-10 text-slate-400 mb-3 opacity-20" />
      <p className="font-semibold text-slate-600">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1 max-w-sm">{subtitle}</p>}
    </div>
  );
}
