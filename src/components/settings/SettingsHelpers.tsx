import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { CircleDashed, ChevronDown, Pipette, Search } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Tooltip } from '../ui/Tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export const ICONS = [
  'Activity',
  'AlarmClock',
  'AlertCircle',
  'AlertTriangle',
  'AlignLeft',
  'Anchor',
  'Aperture',
  'Archive',
  'Award',
  'Ban',
  'BarChart',
  'BarChart2',
  'BarChart3',
  'Battery',
  'Bell',
  'Blocks',
  'Bluetooth',
  'Book',
  'BookOpen',
  'Bookmark',
  'Brain',
  'Briefcase',
  'Bug',
  'Building',
  'Building2',
  'Calculator',
  'Calendar',
  'CalendarCheck',
  'CalendarClock',
  'CalendarDays',
  'CalendarX',
  'Camera',
  'Cast',
  'CheckCircle2',
  'CheckSquare',
  'CircleCheckBig',
  'CircleDashed',
  'CircleEllipsis',
  'CircleX',
  'ClipboardCheck',
  'ClipboardList',
  'ClockAlert',
  'Cloud',
  'Code',
  'Coffee',
  'Command',
  'Compass',
  'Contact',
  'Copy',
  'CornerUpLeft',
  'Cpu',
  'CreditCard',
  'Crop',
  'Crosshair',
  'Database',
  'Download',
  'Droplet',
  'Edit3',
  'Eye',
  'EyeOff',
  'FastForward',
  'Feather',
  'File',
  'FileText',
  'Film',
  'Filter',
  'Fingerprint',
  'Flag',
  'Flame',
  'FolderOpen',
  'Gauge',
  'Gift',
  'Globe',
  'Hammer',
  'Hash',
  'Headphones',
  'Heart',
  'History',
  'Home',
  'House',
  'HousePlus',
  'Image',
  'Inbox',
  'Info',
  'Key',
  'Laptop',
  'Layers',
  'LifeBuoy',
  'Lightbulb',
  'LineChart',
  'Link',
  'List',
  'Loader',
  'Loader2',
  'Lock',
  'LogOut',
  'Mail',
  'Map',
  'MapPin',
  'Maximize',
  'MessageSquare',
  'Mic',
  'Minus',
  'Monitor',
  'Moon',
  'Music',
  'Navigation',
  'Package',
  'PackageCheck',
  'Paperclip',
  'Pause',
  'PauseCircle',
  'PenTool',
  'Percent',
  'Phone',
  'PieChart',
  'Play',
  'PlayCircle',
  'PlusCircle',
  'Printer',
  'Rocket',
  'Save',
  'Search',
  'Send',
  'Settings',
  'Shield',
  'ShieldAlert',
  'ShieldCheck',
  'ShoppingCart',
  'Smartphone',
  'Star',
  'StarHalf',
  'StopCircle',
  'Tag',
  'Target',
  'Terminal',
  'ThumbsDown',
  'ThumbsUp',
  'Timer',
  'TrendingUp',
  'Trophy',
  'Truck',
  'Unlock',
  'User',
  'UserCheck',
  'Users',
  'Video',
  'Wifi',
  'Wrench',
  'Zap',
];

export const CODES = [
  'CA',
  'US',
  'GB',
  'AU',
  'NZ',
  'FR',
  'DE',
  'IE',
  'MX',
  'JP',
  'CN',
  'IN',
  'BR',
  'ZA',
  'IT',
  'ES',
  'NL',
  'SE',
  'CH',
  'AE',
  'SG',
  'HK',
  'PH',
  'KR',
];

export const COLORS = [
  'rose',
  'peach',
  'lemon',
  'chartreuse',
  'mint',
  'aqua',
  'sky',
  'indigo',
  'blush',
  'gray',
  'red',
  'orange',
  'yellow',
  'lime',
  'emerald',
  'cyan',
  'blue',
  'violet',
  'pink',
  'stone',
  'crimson',
  'amber',
  'gold',
  'apple',
  'green',
  'teal',
  'ocean',
  'purple',
  'fuchsia',
  'slate',
  'ruby',
  'rust',
  'mustard',
  'olive',
  'forest',
  'jade',
  'navy',
  'plum',
  'magenta',
  'zinc',
  'maroon',
  'bronze',
  'brown',
  'moss',
  'pine',
  'deepSea',
  'midnight',
  'grape',
  'berry',
  'slateDark',
];

export const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const hexToRgb = (hex: string) => {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
};

export const rgbToHex = (r: number, g: number, b: number) => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

export const COLOR_MAP: Record<string, string> = {
  rose: '#f43f5e',
  red: '#ef4444',
  crimson: '#be123c',
  ruby: '#9f1239',
  maroon: '#800000',
  peach: '#fb923c',
  orange: '#f97316',
  amber: '#f59e0b',
  rust: '#b45309',
  bronze: '#9a3412',
  lemon: '#fef08a',
  yellow: '#eab308',
  gold: '#d4af37',
  mustard: '#ca8a04',
  brown: '#713f12',
  chartreuse: '#bef264',
  lime: '#84cc16',
  apple: '#65a30d',
  olive: '#4d7c0f',
  moss: '#3f6212',
  mint: '#34d399',
  emerald: '#10b981',
  green: '#22c55e',
  forest: '#15803d',
  pine: '#064e3b',
  aqua: '#67e8f9',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  jade: '#0d9488',
  deepSea: '#0f766e',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  ocean: '#0369a1',
  navy: '#1e3a8a',
  midnight: '#172554',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  plum: '#701a75',
  grape: '#581c87',
  blush: '#f472b6',
  pink: '#ec4899',
  fuchsia: '#d946ef',
  magenta: '#c026d3',
  berry: '#9d174d',
  gray: '#9ca3af',
  stone: '#78716c',
  slate: '#64748b',
  zinc: '#52525b',
  slateDark: '#334155',
};

export const renderIcon = (iconName: string, className: string = 'w-4 h-4') => {
  if (!iconName) return <CircleDashed className={className} />;

  if (iconName.startsWith('code-')) {
    const code = iconName.replace('code-', '');
    return (
      <span
        className={`inline-flex items-center justify-center font-bold text-[10px] tracking-tight ${className}`}
      >
        {code}
      </span>
    );
  }

  const IconMatch = Object.entries(LucideIcons).find(
    ([key]) => key.toLowerCase() === iconName?.toLowerCase().replace(/-/g, '')
  )?.[1] as any;
  if (IconMatch) return <IconMatch className={className} />;
  return <CircleDashed className={className} />;
};

export function CustomPicker({
  type,
  value,
  onChange,
  fieldName,
}: {
  type: 'color' | 'icon';
  value: string;
  onChange: (val: string) => void;
  fieldName?: string;
}) {
  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const hex =
    type === 'color' ? (value?.startsWith('#') ? value : COLOR_MAP[value] || COLOR_MAP.slate) : '';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-9 rounded-md border border-input bg-white px-2.5 text-sm outline-none hover:border-primary focus:border-primary flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
        >
          {type === 'color' ? (
            <span
              className="w-4 h-4 rounded-full shadow-sm border border-black/10"
              style={{ backgroundColor: hex }}
            ></span>
          ) : (
            <span className="text-slate-600">{renderIcon(value, 'w-4 h-4')}</span>
          )}
          <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="p-1 z-[150]"
        style={{ width: type === 'icon' ? '430px' : showCustom ? '240px' : '400px' }}
      >
        {type === 'color' ? (
          showCustom ? (
            <div className="flex flex-col p-2 w-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">Custom Color</span>
                <button
                  onClick={() => setShowCustom(false)}
                  className="text-[10px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                >
                  Back to Palette
                </button>
              </div>

              <div className="custom-color-picker-wrapper mb-4">
                <HexColorPicker
                  color={value?.startsWith('#') ? value : COLOR_MAP[value] || '#64748b'}
                  onChange={onChange}
                  style={{ width: '100%', height: '160px' }}
                />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Hex</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                      #
                    </span>
                    <input
                      type="text"
                      value={(value?.startsWith('#') ? value : COLOR_MAP[value] || '#64748b')
                        .replace('#', '')
                        .toUpperCase()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                          if (val.length === 6) onChange('#' + val);
                        }
                      }}
                      className="w-full pl-5 pr-2 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-md border border-slate-200 shadow-sm shrink-0 mt-4"
                  style={{
                    backgroundColor: value?.startsWith('#') ? value : COLOR_MAP[value] || '#64748b',
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {(() => {
                  const rgb = hexToRgb(
                    value?.startsWith('#') ? value : COLOR_MAP[value] || '#64748b'
                  );
                  return ['r', 'g', 'b'].map((channel) => (
                    <div key={channel} className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-slate-400">{channel}</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgb[channel as keyof typeof rgb]}
                        onChange={(e) => {
                          let val = parseInt(e.target.value) || 0;
                          if (val > 255) val = 255;
                          if (val < 0) val = 0;
                          const newRgb = { ...rgb, [channel]: val };
                          onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                        }}
                        className="w-full px-2 py-1.5 text-xs font-medium text-center text-slate-700 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  ));
                })()}
              </div>

              <style>{`
                  .custom-color-picker-wrapper .react-colorful {
                    width: 100%;
                  }
                  .custom-color-picker-wrapper .react-colorful__pointer {
                    width: 16px;
                    height: 16px;
                  }
                  .custom-color-picker-wrapper .react-colorful__hue {
                    height: 12px;
                    border-radius: 6px;
                    margin-top: 12px;
                  }
                  .custom-color-picker-wrapper .react-colorful__saturation {
                    border-radius: 8px;
                    border-bottom: none;
                  }
                `}</style>
            </div>
          ) : (
            <div className="flex flex-col p-2">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2 px-1">
                <span className="text-xs font-medium text-slate-700">Palette</span>
                <button
                  type="button"
                  onClick={() => setShowCustom(true)}
                  className="text-xs font-medium text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 border border-slate-200/60 shadow-sm active:scale-95"
                >
                  <Pipette className="w-3.5 h-3.5 text-slate-500" />
                  Custom
                </button>
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {COLORS.map((c) => {
                  const cHex = COLOR_MAP[c];
                  return (
                    <Tooltip
                      key={c}
                      content={c.charAt(0).toUpperCase() + c.slice(1)}
                      position="top"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onChange(c);
                          setIsOpen(false);
                        }}
                        className={`w-8 h-8 rounded-md flex items-center justify-center border transition-all hover:scale-110 ${value === c ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-transparent hover:shadow-sm'}`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shadow-sm border border-black/10"
                          style={{ backgroundColor: cHex }}
                        ></span>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2">
            <div className="px-2 pt-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-input bg-slate-50/50 hover:bg-slate-50 focus:bg-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-10 gap-1 p-2 max-h-[220px] overflow-y-auto custom-thin-scroll">
              {fieldName === 'regions' ? (
                CODES.filter((c) => c.toLowerCase().includes(search.toLowerCase())).map((code) => (
                  <Tooltip key={code} content={code} position="top">
                    <button
                      type="button"
                      onClick={() => {
                        onChange(`code-${code}`);
                        setIsOpen(false);
                      }}
                      className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold hover:bg-slate-100 transition-all active:scale-95 ${value === `code-${code}` ? 'bg-primary/10 border border-primary/20 shadow-sm text-primary' : 'border border-transparent text-slate-600'}`}
                    >
                      {code}
                    </button>
                  </Tooltip>
                ))
              ) : (
                <>
                  {ICONS.filter((i) => i.toLowerCase().includes(search.toLowerCase())).map((i) => (
                    <Tooltip key={i} content={i} position="top">
                      <button
                        type="button"
                        onClick={() => {
                          onChange(i);
                          setIsOpen(false);
                        }}
                        className={`w-9 h-9 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-primary transition-all active:scale-95 ${value === i ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'border border-transparent'}`}
                      >
                        {renderIcon(i, 'w-4 h-4')}
                      </button>
                    </Tooltip>
                  ))}
                  {ICONS.filter((i) => i.toLowerCase().includes(search.toLowerCase())).length ===
                    0 && (
                    <div className="col-span-10 text-center py-8 text-xs font-medium text-muted-foreground">
                      No icons found for "{search}"
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
