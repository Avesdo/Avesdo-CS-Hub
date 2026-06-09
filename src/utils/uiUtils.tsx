import React from 'react';
import * as LucideIcons from 'lucide-react';
import { CircleDashed } from 'lucide-react';

export const ICONS = [
  'Activity',
  'AlarmClock',
  'AlertCircle',
  'AlertTriangle',
  'Archive',
  'Award',
  'Ban',
  'BarChart',
  'Bell',
  'Blocks',
  'BookOpen',
  'Bookmark',
  'Briefcase',
  'Building',
  'Building2',
  'Calendar',
  'CalendarCheck',
  'CalendarClock',
  'CalendarX',
  'Camera',
  'CheckCircle2',
  'CheckSquare',
  'CircleCheckBig',
  'CircleDashed',
  'CircleEllipsis',
  'CircleX',
  'ClipboardCheck',
  'ClockAlert',
  'Cloud',
  'Contact',
  'Download',
  'FileText',
  'Flag',
  'Hammer',
  'Heart',
  'House',
  'HousePlus',
  'Inbox',
  'Key',
  'Layers',
  'Loader',
  'Loader2',
  'Mail',
  'Map',
  'Monitor',
  'Package',
  'PackageCheck',
  'Pause',
  'PauseCircle',
  'PieChart',
  'Play',
  'PlayCircle',
  'PlusCircle',
  'Rocket',
  'Search',
  'Send',
  'Settings',
  'Shield',
  'ShieldCheck',
  'Smartphone',
  'Star',
  'StopCircle',
  'Target',
  'ThumbsUp',
  'TrendingUp',
  'Trophy',
  'User',
  'Users',
  'Wrench',
  'Zap',
];
export const COLORS = [
  'red',
  'crimson',
  'rose',
  'pink',
  'fuchsia',
  'purple',
  'violet',
  'indigo',
  'blue',
  'ocean',
  'sky',
  'cyan',
  'teal',
  'emerald',
  'green',
  'forest',
  'lime',
  'yellow',
  'gold',
  'amber',
  'orange',
  'stone',
  'slate',
  'slateDark',
  'navy',
];

export const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  crimson: '#be123c',
  rose: '#f43f5e',
  pink: '#ec4899',
  fuchsia: '#d946ef',
  purple: '#a855f7',
  violet: '#8b5cf6',
  indigo: '#6366f1',
  blue: '#3b82f6',
  ocean: '#0369a1',
  sky: '#0ea5e9',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  emerald: '#10b981',
  green: '#22c55e',
  forest: '#15803d',
  lime: '#84cc16',
  yellow: '#eab308',
  gold: '#d4af37',
  amber: '#f59e0b',
  orange: '#f97316',
  stone: '#78716c',
  slate: '#64748b',
  slateDark: '#334155',
  navy: '#1e3a8a',
};

export const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getSafeHex = (colorName: string | undefined, fallback: string = 'slate') => {
  if (!colorName) return COLOR_MAP[fallback];
  const normalized = colorName.trim().toLowerCase();
  return COLOR_MAP[normalized] || COLOR_MAP[fallback];
};

export const renderIcon = (iconName: string | undefined | null, className: string = 'w-4 h-4') => {
  if (!iconName) return <CircleDashed className={className} />;
  const IconMatch = Object.entries(LucideIcons).find(
    ([key]) => key.toLowerCase() === iconName.toLowerCase().replace(/-/g, '')
  )?.[1] as any;
  if (IconMatch) return <IconMatch className={className} />;
  return <CircleDashed className={className} />;
};

/**
 * Returns a semantic badge for a specific string value by looking it up in the settings context.
 */
export const getSettingBadge = (
  listName: string,
  value: string,
  settings: any,
  size: 'sm' | 'md' | 'lg' | boolean = false
) => {
  let sizeClasses = 'px-2.5 py-1 text-[11px]';
  let iconSize = 'w-3 h-3';
  if (size === true || size === 'lg') {
    sizeClasses = 'px-3 py-1.5 text-sm';
    iconSize = 'w-4 h-4';
  } else if (size === 'md') {
    sizeClasses = 'px-2.5 py-1 text-[13px]';
    iconSize = 'w-3.5 h-3.5';
  }

  if (!value || ['Not Set', 'Unassigned', 'None', 'Unknown', 'N/A'].includes(value)) {
    if (listName === 'managers' || listName === 'accountManager' || listName === 'assignee') {
      return (
        <span
          className={`${sizeClasses} shadow-sm tracking-wide font-semibold rounded-full border bg-slate-100 text-slate-500 border-slate-200 inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap`}
        >
          <LucideIcons.UserX className={iconSize} /> Unassigned
        </span>
      );
    }
    return (
      <span
        className={`${sizeClasses} shadow-sm tracking-wide font-semibold rounded-full border bg-slate-100 text-slate-500 border-slate-200 inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap`}
      >
        <LucideIcons.HelpCircle className={iconSize} /> Not Set
      </span>
    );
  }

  let item: any = null;

  // settingsData contains Outcomes and Statuses
  if (listName === 'serviceOutcomes') {
    item = (settings?.settingsData || []).find(
      (s: any) => s.category === 'ServiceOutcome' && s.name === value
    );
    if (!item)
      item = (settings?.archivedData?.settingsData || []).find(
        (s: any) => s.category === 'ServiceOutcome' && s.name === value
      );
  } else if (listName === 'serviceStatuses') {
    item = (settings?.settingsData || []).find(
      (s: any) => s.category === 'ServiceStatus' && s.name === value
    );
    if (!item)
      item = (settings?.archivedData?.settingsData || []).find(
        (s: any) => s.category === 'ServiceStatus' && s.name === value
      );
  } else {
    const list = settings?.[listName] || [];
    item = list.find((i: any) => (typeof i === 'string' ? i === value : i.name === value));
    if (!item) {
      const archivedList = settings?.archivedData?.[listName] || [];
      item = archivedList.find((i: any) =>
        typeof i === 'string' ? i === value : i.name === value
      );
    }
  }

  if (!item || typeof item === 'string') {
    // Fallback badge if not found or if it's just a string array (e.g. features)
    if (listName === 'managers' || listName === 'accountManager' || listName === 'assignee') {
      return (
        <span
          className={`${sizeClasses} shadow-sm tracking-wide font-semibold rounded-full border bg-slate-100 text-slate-600 border-slate-200 inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap`}
        >
          <LucideIcons.User className={iconSize} /> {value}
        </span>
      );
    }
    return (
      <span
        className={`${sizeClasses} shadow-sm tracking-wide font-semibold rounded-full border bg-slate-100 text-slate-600 border-slate-200`}
      >
        {value}
      </span>
    );
  }

  const hex = COLOR_MAP[item.color] || COLOR_MAP.slate;

  return (
    <span
      className={`${sizeClasses} shadow-sm tracking-wide font-semibold rounded-full border inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap`}
      style={{ backgroundColor: hexToRgba(hex, 0.1), color: hex, borderColor: hexToRgba(hex, 0.2) }}
    >
      {item.icon && renderIcon(item.icon, iconSize)}
      {item.name}
    </span>
  );
};

export const getTypeBadgeIconOnly = (value: string, settings: any) => {
  if (!value)
    return (
      <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-400 border border-slate-200">
        <CircleDashed className="w-3.5 h-3.5" />
      </span>
    );

  const list = settings?.serviceTypes || [];
  let item = list.find((i: any) => i.name === value);
  if (!item) {
    const archivedList = settings?.archivedData?.serviceTypes || [];
    item = archivedList.find((i: any) => i.name === value);
  }
  if (!item)
    return (
      <span
        className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-400 border border-slate-200"
        title={value}
      >
        <CircleDashed className="w-3.5 h-3.5" />
      </span>
    );

  const hex = COLOR_MAP[item.color] || COLOR_MAP.slate;

  return (
    <span
      className="w-7 h-7 rounded flex items-center justify-center border shadow-sm shrink-0 transition-colors"
      style={{ backgroundColor: hexToRgba(hex, 0.1), color: hex, borderColor: hexToRgba(hex, 0.2) }}
      title={item.name}
    >
      {item.icon && renderIcon(item.icon, 'w-4 h-4')}
    </span>
  );
};

export const getHealthBadge = (score: number | string | undefined | null, settings: any) => {
  if (score === undefined || score === null || score === 'N/A' || typeof score !== 'number') {
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 shadow-sm shrink-0 whitespace-nowrap">
        N/A
      </span>
    );
  }

  const healthyThresh = settings?.scoring?.thresholds?.healthy ?? 80;
  const warningThresh = settings?.scoring?.thresholds?.warning ?? 50;

  if (score >= healthyThresh) {
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-lime-100 text-lime-700 border border-lime-200 shadow-sm shrink-0 whitespace-nowrap">
        {score}
      </span>
    );
  }
  if (score >= warningThresh) {
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm shrink-0 whitespace-nowrap">
        {score}
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm shrink-0 whitespace-nowrap flex items-center gap-1">
      <LucideIcons.AlertCircle className="w-3.5 h-3.5" /> {score}
    </span>
  );
};

export const getFeatureBadgeProps = (pct: number, settings: any) => {
  const healthyThresh = settings?.scoring?.thresholds?.healthy ?? 80;
  const warningThresh = settings?.scoring?.thresholds?.warning ?? 50;

  if (pct >= healthyThresh) {
    return { bg: 'bg-lime-100', fill: 'bg-lime-500', text: 'text-foreground' };
  }
  if (pct >= warningThresh) {
    return { bg: 'bg-orange-100', fill: 'bg-orange-500', text: 'text-foreground' };
  }
  return { bg: 'bg-red-100', fill: 'bg-red-500', text: 'text-foreground' };
};
