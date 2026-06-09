import React from 'react';
import * as lucide from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  iconName: keyof typeof lucide;
  iconColorClass: string;
  badgeText?: string;
  badgeColorClass?: string;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  iconName,
  iconColorClass,
  badgeText,
  badgeColorClass,
  onClick,
}: KpiCardProps) {
  const IconComponent = lucide[iconName] as React.ElementType;

  return (
    <div
      className={`bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between ${onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${iconColorClass}`}>
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </div>
        {badgeText && badgeColorClass && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColorClass}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
      </div>
    </div>
  );
}
