import React from 'react';
import * as LucideIcons from 'lucide-react';
import { CircleDashed } from 'lucide-react';
import { TruncatedText } from '../components/ui/TruncatedText';
import { Tooltip } from '../components/ui/Tooltip';

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
  'Star',
  'StopCircle',
  'Target',
  'ThumbsUp',
  'TrendingUp',
  'Trophy',
  'User',
  'UserCheck',
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
  size: 'sm' | 'md' | 'lg' | boolean = false,
  truncateText: boolean = true
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
          className={`${sizeClasses} font-medium rounded-md bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap`}
        >
          <LucideIcons.UserX className={iconSize} /> Unassigned
        </span>
      );
    }
    return (
      <span
        className={`${sizeClasses} font-medium rounded-md bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap`}
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
          className={`${sizeClasses} font-medium rounded-md bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 inline-flex items-center gap-1.5 shrink-0`}
        >
          <LucideIcons.User className={iconSize} /> 
          <span className={truncateText ? "truncate max-w-[180px]" : "whitespace-nowrap"}>{value}</span>
        </span>
      );
    }
    return (
      <span
        className={`${sizeClasses} font-medium rounded-md bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 inline-flex items-center shrink-0`}
      >
        <span className={truncateText ? "truncate max-w-[180px]" : "whitespace-nowrap"}>{value}</span>
      </span>
    );
  }

  const hex = COLOR_MAP[item.color] || COLOR_MAP.slate;

  return (
    <span
      className={`${sizeClasses} font-medium rounded-md inline-flex items-center gap-1.5 shrink-0`}
      style={{ backgroundColor: hexToRgba(hex, 0.1), color: hex, boxShadow: `inset 0 0 0 1px ${hexToRgba(hex, 0.2)}` }}
    >
      {item.icon && renderIcon(item.icon, iconSize)}
      <span className={truncateText ? "truncate max-w-[180px]" : "whitespace-nowrap"}>{item.name}</span>
    </span>
  );
};

export const getTypeBadgeIconOnly = (value: string, settings: any) => {
  if (!value)
    return (
      <Tooltip content={value}>
        <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-400 border border-slate-200">
          <CircleDashed className="w-3.5 h-3.5" />
        </span>
      </Tooltip>
    );

  const list = settings?.serviceTypes || [];
  let item = list.find((i: any) => i.name === value);
  if (!item) {
    const archivedList = settings?.archivedData?.serviceTypes || [];
    item = archivedList.find((i: any) => i.name === value);
  }
  if (!item)
    return (
      <Tooltip content={value}>
        <span
          className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-400 border border-slate-200"
        >
          <CircleDashed className="w-3.5 h-3.5" />
        </span>
      </Tooltip>
    );

  const hex = COLOR_MAP[item.color] || COLOR_MAP.slate;

  return (
    <Tooltip content={item.name}>
      <span
        className="w-7 h-7 rounded flex items-center justify-center border shadow-sm shrink-0 transition-colors cursor-default"
        style={{ backgroundColor: hexToRgba(hex, 0.1), color: hex, borderColor: hexToRgba(hex, 0.2) }}
      >
        {item.icon && renderIcon(item.icon, 'w-4 h-4')}
      </span>
    </Tooltip>
  );
};

export const getHealthBadge = (score: number | string | undefined | null, settings: any) => {
  if (score === undefined || score === null || score === 'N/A' || typeof score !== 'number') {
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 shrink-0 whitespace-nowrap flex items-center gap-1">
        <LucideIcons.Heart className="w-3 h-3 text-slate-400" /> N/A
      </span>
    );
  }

  const healthyThresh = settings?.scoring?.thresholds?.healthy ?? 80;
  const warningThresh = settings?.scoring?.thresholds?.warning ?? 50;

  if (score >= healthyThresh) {
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-lime-50 text-lime-700 ring-1 ring-inset ring-lime-600/20 shrink-0 whitespace-nowrap flex items-center gap-1">
        <LucideIcons.Heart className="w-3 h-3 fill-lime-500/20 text-lime-600" /> {score}
      </span>
    );
  }
  if (score >= warningThresh) {
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20 shrink-0 whitespace-nowrap flex items-center gap-1">
        <LucideIcons.Heart className="w-3 h-3 fill-orange-500/20 text-orange-600" /> {score}
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 shrink-0 whitespace-nowrap flex items-center gap-1">
      <LucideIcons.HeartPulse className="w-3 h-3 text-red-600" /> {score}
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

export const formatRelativeDate = (dateVal: number | string | null | undefined, showYearInDate: boolean = false) => {
  if (!dateVal) return 'Not Set';
  const date = new Date(dateVal);
  const now = new Date();
  
  const dDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dDay.getTime() - nDay.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  
  if (diffDays > 1 && diffDays <= 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  if (diffDays < -1 && diffDays >= -7) {
    return `Last ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(showYearInDate ? { year: 'numeric' } : {}),
  });
};

export const formatRelativeDate = (dateVal: number | string | null | undefined, showYearInDate: boolean = false) => {
  if (!dateVal) return 'Not Set';
  const date = new Date(dateVal);
  const now = new Date();
  
  const dDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dDay.getTime() - nDay.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  
  if (diffDays > 1 && diffDays <= 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  if (diffDays < -1 && diffDays >= -7) {
    return `Last ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(showYearInDate ? { year: 'numeric' } : {}),
  });
};
