import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import {
  Building2,
  GitMerge,
  Package,
  Calculator,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  CircleDashed,
  User,
  Target,
  AlertCircle,
  AlertTriangle,
  Palette,
  LayoutTemplate,
  FileText,
  Home,
  Briefcase,
  ArchiveRestore,
  RotateCcw,
  History,
  Search,
  Settings as SettingsIcon,
  Users,
  FolderOpen,
  Grid,
  CheckCircle2,
  XCircle,
  Edit,
  Database,
  Pipette
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Tooltip as UITooltip } from '../components/ui/Tooltip';
import {
  saveSettings,
  bulkUpdateProjects,
  bulkUpdateClients,
  bulkUpdateServices,
  addGlobalLog,
} from '../api/dbService';

import { HexColorPicker } from 'react-colorful';

import { SearchableSelect } from '../components/ui/SearchableSelect';
import { DonutChart } from '../components/ui/DonutChart';
import { DualThumbSlider } from '../components/ui/DualThumbSlider';

import {
  getSystemLogs,
  restoreRecord,
  hardDeleteRecord,
  addAutoLog,
  addServiceAutoLog,
  addProjectAutoLog,
  getPendingAliases,
  resolveAlias,
  clearAuditTrail,
} from '../api/dbService';
import { DataUploader } from '../components/admin/DataUploader';
import { PageHeader } from '../components/PageHeader';
import MultiSelectCombobox from '../components/MultiSelectCombobox';
import { exportAllFormResponsesToCSV } from '../utils/exportUtils';
import { FileDown } from 'lucide-react';

import { toast } from '../utils/toast';
import TemplateDesigner from '../components/admin/TemplateDesigner';
import { DataIntakePipeline } from '../components/admin/DataIntakePipeline';
import { RecentUploadActivity } from '../components/admin/RecentUploadActivity';
import { AuditLogViewer } from '../components/admin/AuditLogViewer';
import { DataExportHub } from '../components/admin/DataExportHub';
import { AutoProcessedDrawer } from '../components/admin/AutoProcessedDrawer';

const ICONS = [
  'Activity', 'AlarmClock', 'AlertCircle', 'AlertTriangle', 'AlignLeft', 'Anchor', 'Aperture', 'Archive', 'Award',
  'Ban', 'BarChart', 'BarChart2', 'BarChart3', 'Battery', 'Bell', 'Blocks', 'Bluetooth', 'Book', 'BookOpen', 'Bookmark', 'Brain', 'Briefcase', 'Bug', 'Building', 'Building2',
  'Calculator', 'Calendar', 'CalendarCheck', 'CalendarClock', 'CalendarDays', 'CalendarX', 'Camera', 'Cast', 'CheckCircle2', 'CheckSquare', 'CircleCheckBig', 'CircleDashed', 'CircleEllipsis', 'CircleX', 'ClipboardCheck', 'ClipboardList', 'ClockAlert', 'Cloud', 'Code', 'Coffee', 'Command', 'Compass', 'Contact', 'Copy', 'CornerUpLeft', 'Cpu', 'CreditCard', 'Crop', 'Crosshair',
  'Database', 'Download', 'Droplet',
  'Edit3', 'Eye', 'EyeOff',
  'FastForward', 'Feather', 'File', 'FileText', 'Film', 'Filter', 'Fingerprint', 'Flag', 'Flame', 'FolderOpen',
  'Gauge', 'Gift', 'Globe',
  'Hammer', 'Hash', 'Headphones', 'Heart', 'History', 'Home', 'House', 'HousePlus',
  'Image', 'Inbox', 'Info',
  'Key',
  'Laptop', 'Layers', 'LifeBuoy', 'Lightbulb', 'LineChart', 'Link', 'List', 'Loader', 'Loader2', 'Lock', 'LogOut',
  'Mail', 'Map', 'MapPin', 'Maximize', 'MessageSquare', 'Mic', 'Minus', 'Monitor', 'Moon', 'Music',
  'Navigation',
  'Package', 'PackageCheck', 'Paperclip', 'Pause', 'PauseCircle', 'PenTool', 'Percent', 'Phone', 'PieChart', 'Play', 'PlayCircle', 'PlusCircle', 'Printer',
  'Rocket',
  'Save', 'Search', 'Send', 'Settings', 'Shield', 'ShieldAlert', 'ShieldCheck', 'ShoppingCart', 'Smartphone', 'Star', 'StarHalf', 'StopCircle',
  'Tag', 'Target', 'Terminal', 'ThumbsDown', 'ThumbsUp', 'Timer', 'TrendingUp', 'Trophy', 'Truck',
  'Unlock', 'User', 'UserCheck', 'Users',
  'Video',
  'Wifi', 'Wrench',
  'Zap'
];
const COLORS = [
  'rose', 'peach', 'lemon', 'chartreuse', 'mint', 'aqua', 'sky', 'indigo', 'blush', 'gray',
  'red', 'orange', 'yellow', 'lime', 'emerald', 'cyan', 'blue', 'violet', 'pink', 'stone',
  'crimson', 'amber', 'gold', 'apple', 'green', 'teal', 'ocean', 'purple', 'fuchsia', 'slate',
  'ruby', 'rust', 'mustard', 'olive', 'forest', 'jade', 'navy', 'plum', 'magenta', 'zinc',
  'maroon', 'bronze', 'brown', 'moss', 'pine', 'deepSea', 'midnight', 'grape', 'berry', 'slateDark',
];

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const hexToRgb = (hex: string) => {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

import { Tooltip } from '../components/ui/Tooltip';

const COLOR_MAP: Record<string, string> = {
  rose: '#f43f5e', red: '#ef4444', crimson: '#be123c', ruby: '#9f1239', maroon: '#800000',
  peach: '#fb923c', orange: '#f97316', amber: '#f59e0b', rust: '#b45309', bronze: '#9a3412',
  lemon: '#fef08a', yellow: '#eab308', gold: '#d4af37', mustard: '#ca8a04', brown: '#713f12',
  chartreuse: '#bef264', lime: '#84cc16', apple: '#65a30d', olive: '#4d7c0f', moss: '#3f6212',
  mint: '#34d399', emerald: '#10b981', green: '#22c55e', forest: '#15803d', pine: '#064e3b',
  aqua: '#67e8f9', cyan: '#06b6d4', teal: '#14b8a6', jade: '#0d9488', deepSea: '#0f766e',
  sky: '#0ea5e9', blue: '#3b82f6', ocean: '#0369a1', navy: '#1e3a8a', midnight: '#172554',
  indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7', plum: '#701a75', grape: '#581c87',
  blush: '#f472b6', pink: '#ec4899', fuchsia: '#d946ef', magenta: '#c026d3', berry: '#9d174d',
  gray: '#9ca3af', stone: '#78716c', slate: '#64748b', zinc: '#52525b', slateDark: '#334155',
};

const renderIcon = (iconName: string, className: string = 'w-4 h-4') => {
  const IconMatch = Object.entries(LucideIcons).find(
    ([key]) => key.toLowerCase() === iconName?.toLowerCase().replace(/-/g, '')
  )?.[1] as any;
  if (IconMatch) return <IconMatch className={className} />;
  return <CircleDashed className={className} />;
};

function CustomPicker({
  type,
  value,
  onChange,
}: {
  type: 'color' | 'icon';
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hex = type === 'color' ? (value?.startsWith('#') ? value : COLOR_MAP[value] || COLOR_MAP.slate) : '';

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 rounded-md border border-input bg-white px-2.5 text-sm outline-none hover:border-primary focus:border-primary flex items-center justify-center gap-2 shadow-sm transition-all"
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

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 bg-white/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-200"
          style={{ width: type === 'icon' ? '430px' : (showCustom ? '240px' : '400px') }}
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
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">#</span>
                      <input 
                        type="text" 
                        value={(value?.startsWith('#') ? value : COLOR_MAP[value] || '#64748b').replace('#', '').toUpperCase()}
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
                    style={{ backgroundColor: value?.startsWith('#') ? value : COLOR_MAP[value] || '#64748b' }}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(() => {
                    const rgb = hexToRgb(value?.startsWith('#') ? value : COLOR_MAP[value] || '#64748b');
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
                    <Tooltip key={c} content={c.charAt(0).toUpperCase() + c.slice(1)} position="top">
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
                {ICONS.filter(i => i.toLowerCase().includes(search.toLowerCase())).map((i) => (
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
                {ICONS.filter(i => i.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                  <div className="col-span-10 text-center py-8 text-xs font-medium text-muted-foreground">
                    No icons found for "{search}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SettingsDraft() {
  const settings = useAppStore(state => state.settings);
  const projects = useAppStore(state => state.projects);
  const clients = useAppStore(state => state.clients);
  const services = useAppStore(state => state.services);
  const user = useAppStore(state => state.user);
  const [activeTab, setActiveTab] = useState<'global' | 'projects' | 'services' | 'scoring' | 'templates' | 'pipeline' | 'exports' | 'archives' | 'audit'>('global');
  const archivedClients = useAppStore(state => state.archivedClients);
  const archivedProjects = useAppStore(state => state.archivedProjects);
  const archivedServices = useAppStore(state => state.archivedServices);

  const getTemplate = (formName: string) => {
    let templateId = Object.keys(settings?.templates || {}).find(k => settings?.templates?.[k]?.name === formName);
    if (!templateId) {
       templateId = Object.keys(settings?.templates || {}).find(k => settings?.templates?.[k]?.type === 'form');
    }
    return templateId ? settings?.templates?.[templateId] : null;
  };

  // --- AUDIT TRAIL STATE ---
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [viewingUploadLog, setViewingUploadLog] = useState<any | null>(null);

  // --- ARCHIVES STATE ---
  const [archiveTab, setArchiveTab] = useState<
    'all' | 'clients' | 'projects' | 'services' | 'settings'
  >('all');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [confirmArchiveDeleteId, setConfirmArchiveDeleteId] = useState<string | null>(null);

  // Move functions above useEffect to fix ReferenceError

  const loadLogs = async () => {
    setLoadingLogs(true);
    const data = await getSystemLogs();
    setLogs(data);
    setLoadingLogs(false);
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (activeTab === 'audit' || activeTab === 'pipeline') {
      loadLogs();
    }
  }, [activeTab]);

  // Functions moved up

  // --- ARCHIVES ACTIONS ---
  const handleRestoreRecordLocal = async (collectionName: string, item: any) => {
    const title = item.companyName || item.name || 'Record';
    toast.promise(
      restoreRecord(collectionName, item.clientId || item.id, title, { silent: true }, user?.name || user?.email || 'System').then(
        async () => {
          if (collectionName === 'projects') {
            await addProjectAutoLog(item.clientId || item.id, `Project "${item.name}" restored`, user?.name || 'System');
            if (item.clientIds) {
              for (const cid of item.clientIds) {
                await addAutoLog(cid, `Project "${item.name}" restored`, user?.name || 'System', true);
              }
            }
            const pServices =
              services?.filter(
                (s: any) =>
                  s.projectId === item.id || (s.projectIds && s.projectIds.includes(item.id))
              ) || [];
            const pArchivedServices =
              archivedServices?.filter(
                (s: any) =>
                  s.projectId === item.id || (s.projectIds && s.projectIds.includes(item.id))
              ) || [];
            for (const svc of [...pServices, ...pArchivedServices]) {
              await addServiceAutoLog(
                svc.id,
                `Attached Project "${item.name}" restored`,
                user?.name || 'System',
                true
              );
            }
          } else if (collectionName === 'clients') {
            const cProjects =
              projects?.filter((p: any) => p.clientIds?.includes(item.clientId || item.id)) || [];
            const cArchivedProjects =
              archivedProjects?.filter((p: any) =>
                p.clientIds?.includes(item.clientId || item.id)
              ) || [];
            for (const p of [...cProjects, ...cArchivedProjects]) {
              await addProjectAutoLog(
                p.id,
                `Client "${item.companyName || item.name}" restored`,
                user?.name || 'System',
                true
              );
            }
            const cServices =
              services?.filter((s: any) => s.clientIds?.includes(item.clientId || item.id)) || [];
            const cArchivedServices =
              archivedServices?.filter((s: any) =>
                s.clientIds?.includes(item.clientId || item.id)
              ) || [];
            for (const svc of [...cServices, ...cArchivedServices]) {
              await addServiceAutoLog(
                svc.id,
                `Attached Client "${item.companyName || item.name}" restored`,
                user?.name || 'System',
                true
              );
            }
          } else if (collectionName === 'services') {
            const pIds =
              item.projectIds ||
              (item.projectId && item.projectId !== 'N/A' ? [item.projectId] : []);
            for (const pId of pIds) {
              await addProjectAutoLog(pId, `Service "${item.name}" restored`, user?.name || 'System', true);
            }
            if (item.clientIds) {
              for (const cid of item.clientIds) {
                await addAutoLog(cid, `Service "${item.name}" restored`, user?.name || 'System', true);
              }
            }
          }
        }
      ),
      {
        loading: `Restoring ${title}...`,
        success: `${title} restored successfully`,
        error: `Failed to restore ${title}`,
      }
    );
  };

  const handleHardDeleteRecordLocal = async (collectionName: string, item: any) => {
    const title = item.companyName || item.name || 'Record';
    toast.promise(
      hardDeleteRecord(collectionName, item.clientId || item.id, title, { silent: true }).then(
        async () => {
          let entityType: any = 'System';
          if (collectionName === 'clients') entityType = 'Client';
          if (collectionName === 'projects') entityType = 'Project';
          if (collectionName === 'services') entityType = 'Service';
          const author = user?.name || user?.email || 'Admin';
          await addGlobalLog(
            `Permanently deleted archived record`,
            entityType,
            item.clientId || item.id,
            title,
            author
          );
          loadLogs();

          if (collectionName === 'projects') {
            if (item.clientIds) {
              for (const cid of item.clientIds) {
                await addAutoLog(cid, `Project "${item.name}" permanently deleted`, user?.name || 'System', true);
              }
            }
            const pServices =
              services?.filter(
                (s: any) =>
                  s.projectId === item.id || (s.projectIds && s.projectIds.includes(item.id))
              ) || [];
            const pArchivedServices =
              archivedServices?.filter(
                (s: any) =>
                  s.projectId === item.id || (s.projectIds && s.projectIds.includes(item.id))
              ) || [];
            for (const svc of [...pServices, ...pArchivedServices]) {
              await addServiceAutoLog(
                svc.id,
                `Attached Project "${item.name}" permanently deleted`,
                user?.name || 'System',
                true
              );
            }
          } else if (collectionName === 'clients') {
            const cProjects =
              projects?.filter((p: any) => p.clientIds?.includes(item.clientId || item.id)) || [];
            const cArchivedProjects =
              archivedProjects?.filter((p: any) =>
                p.clientIds?.includes(item.clientId || item.id)
              ) || [];
            for (const p of [...cProjects, ...cArchivedProjects]) {
              await addProjectAutoLog(
                p.id,
                `Client "${item.companyName || item.name}" permanently deleted`,
                user?.name || 'System',
                true
              );
            }
            const cServices =
              services?.filter((s: any) => s.clientIds?.includes(item.clientId || item.id)) || [];
            const cArchivedServices =
              archivedServices?.filter((s: any) =>
                s.clientIds?.includes(item.clientId || item.id)
              ) || [];
            for (const svc of [...cServices, ...cArchivedServices]) {
              await addServiceAutoLog(
                svc.id,
                `Attached Client "${item.companyName || item.name}" permanently deleted`,
                user?.name || 'System',
                true
              );
            }
          } else if (collectionName === 'services') {
            if (item.projectId && item.projectId !== 'N/A') {
              await addProjectAutoLog(
                item.projectId,
                `Service "${item.name}" permanently deleted`,
                user?.name || 'System',
                true
              );
            }
            if (item.clientIds) {
              for (const cid of item.clientIds) {
                await addAutoLog(cid, `Service "${item.name}" permanently deleted`, user?.name || 'System', true);
              }
            }
          }
        }
      ),
      {
        loading: `Permanently deleting ${title}...`,
        success: `${title} permanently deleted`,
        error: `Failed to delete ${title}`,
      }
    );
  };

  const fieldDisplayNames: Record<string, string> = {
    managers: 'Account manager',
    phases: 'Implementation Status',
    statuses: 'Status',
    timelines: 'Schedule Status',
    clientTypes: 'Client Type',
    features: 'Feature',
    services: 'Service',
    serviceTypes: 'Service Type',
    serviceOutcomes: 'Service Outcome',
    serviceStatuses: 'Fulfillment Status',
  };

  const handleRestoreSetting = async (category: string, index: number, isSettingsData: boolean) => {
    if (!settings || !settings.archivedData) return;
    const newSettings = { ...settings };
    let restoredItem: any;

    if (isSettingsData) {
      restoredItem = newSettings.archivedData.settingsData.splice(index, 1)[0];
      if (!newSettings.settingsData) newSettings.settingsData = [];
      newSettings.settingsData.push(restoredItem);
    } else {
      restoredItem = newSettings.archivedData[category].splice(index, 1)[0];
      if (!newSettings[category as keyof typeof newSettings]) (newSettings as any)[category] = [];
      (newSettings as any)[category].push(restoredItem);
    }
    await saveSettings(newSettings, { silent: true });

    const restoredName =
      typeof restoredItem === 'string' ? restoredItem : restoredItem?.name || 'Unknown';
    const displayField = fieldDisplayNames[category] || category;
    const msg = `${displayField} '${restoredName}' restored`;
    const author = user?.name || user?.email || 'Admin';

    addGlobalLog(msg, 'Setting', category, restoredName, author).then(() => loadLogs());
    toast.success(msg);
  };

  const handleHardDeleteSetting = async (
    category: string,
    index: number,
    isSettingsData: boolean
  ) => {
    if (!settings || !settings.archivedData) return;
    const newSettings = { ...settings };
    let deletedItem: any;
    if (isSettingsData) {
      deletedItem = newSettings.archivedData.settingsData.splice(index, 1)[0];
    } else {
      deletedItem = newSettings.archivedData[category].splice(index, 1)[0];
    }
    await saveSettings(newSettings, { silent: true });

    const deletedName =
      typeof deletedItem === 'string' ? deletedItem : deletedItem?.name || 'Unknown';
    const displayField = fieldDisplayNames[category] || category;
    const msg = `${displayField} '${deletedName}' permanently deleted`;
    const author = user?.name || user?.email || 'Admin';

    addGlobalLog(msg, 'Setting', category, deletedName, author).then(() => loadLogs());
    toast.success(msg);
  };

  // --- RENDER HELPERS ---
  

  const [editingItem, setEditingItem] = useState<{ field: string; idx: number; globalIdx?: number } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ field: string; idx: number; globalIdx?: number } | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [newForm, setNewForm] = useState<{ [key: string]: any }>({});
  const [addingNew, setAddingNew] = useState<{ [key: string]: boolean }>({});

  const [draggedItem, setDraggedItem] = useState<{
    field: string;
    idx: number;
    globalIdx?: number;
  } | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [localOrders, setLocalOrders] = useState<{ [key: string]: any[] }>({});

  const [projectWeights, setProjectWeights] = useState({
    opActivity: 35,
    featAdoption: 25,
    userVol: 15,
    financial: 15,
    csat: 10,
  });
  const [thresholds, setThresholds] = useState({ healthy: 80, warning: 50 });

  const saveTimeout = useRef<any>(null);

  useEffect(() => {
    if (settings?.scoring) {
      setProjectWeights(
        settings.scoring.weights || {
          opActivity: 35,
          featAdoption: 25,
          userVol: 15,
          financial: 15,
          csat: 10,
        }
      );
      setThresholds(settings.scoring.thresholds || { healthy: 80, warning: 50 });
    }
  }, [settings]);

  if (!settings) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <div className="animate-pulse text-muted-foreground text-sm font-medium">
          Loading settings...
        </div>
      </div>
    );
  }

  const totalProjectWeights = Object.values(projectWeights).reduce((a, b) => a + Number(b), 0);


  const debouncedSaveSettings = (newSettings: any, customMsg?: string) => {
    const sanitizedSettings = JSON.parse(JSON.stringify(newSettings));
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const savePromise = saveSettings(sanitizedSettings, { silent: true });
      toast.promise(savePromise, {
        loading: 'Saving changes...',
        success: customMsg || 'Settings updated successfully!',
        error: 'Failed to save settings',
      });
      try {
        await savePromise;
      } catch (e) {
        console.error('Save settings failed', e);
      }
    }, 800);
  };

  const cascadeSettingRename = async (field: string, oldName: string, newName: string) => {
    if (oldName === newName) return;

    const projIds: string[] = [];
    const projUpdates: any = {};
    const clientIds: string[] = [];
    const clientUpdates: any = {};
    const svcIds: string[] = [];
    const svcUpdates: any = {};

    if (field === 'managers') {
      projUpdates.assignee = newName;
      clientUpdates.accountManager = newName;
      svcUpdates.manager = newName;
      projects.forEach((p) => {
        if (p.assignee === oldName) projIds.push(p.id);
      });
      clients.forEach((c) => {
        if (c.accountManager === oldName) clientIds.push(c.clientId);
      });
      services.forEach((s) => {
        if (s.manager === oldName) svcIds.push(s.id);
      });
    } else if (field === 'statuses') {
      projUpdates.projectStatus = newName;
      projects.forEach((p) => {
        if (p.projectStatus === oldName) projIds.push(p.id);
      });
    } else if (field === 'timelines') {
      projUpdates.timelineStatus = newName;
      projects.forEach((p) => {
        if (p.timelineStatus === oldName) projIds.push(p.id);
      });
    } else if (field === 'phases') {
      projUpdates.onboardingPhase = newName;
      projects.forEach((p) => {
        if (p.onboardingPhase === oldName) projIds.push(p.id);
      });
    } else if (field === 'clientTypes') {
      clientUpdates.clientType = newName;
      clients.forEach((c) => {
        if (c.clientType === oldName) clientIds.push(c.clientId);
      });
    } else if (
      field === 'services' ||
      field === 'serviceTypes' ||
      field === 'serviceOutcomes' ||
      field === 'serviceStatuses'
    ) {
      if (field === 'services') svcUpdates.name = newName;
      if (field === 'serviceTypes') svcUpdates.type = newName;
      if (field === 'serviceOutcomes') svcUpdates.outcome = newName;
      if (field === 'serviceStatuses') svcUpdates.status = newName;

      services.forEach((s) => {
        if (field === 'services' && s.name === oldName) svcIds.push(s.id);
        if (field === 'serviceTypes' && s.type === oldName) svcIds.push(s.id);
        if (field === 'serviceOutcomes' && s.outcome === oldName) svcIds.push(s.id);
        if (field === 'serviceStatuses' && s.status === oldName) svcIds.push(s.id);
      });
    } else if (field === 'features') {
      const updates = projects
        .filter((p) => p.features?.includes(oldName))
        .map((p) => {
          const newFeats = p.features?.map((f: string) => (f === oldName ? newName : f)) || [];
          return bulkUpdateProjects([p.id], { features: newFeats }, { silent: true });
        });
      if (updates.length > 0) {
        await Promise.all(updates);
      }
      return updates.length;
    }

    const totalRecords = projIds.length + clientIds.length + svcIds.length;
    try {
      if (totalRecords > 0) {
        if (projIds.length > 0) await bulkUpdateProjects(projIds, projUpdates, { silent: true });
        if (clientIds.length > 0)
          await bulkUpdateClients(clientIds, clientUpdates, { silent: true });
        if (svcIds.length > 0) await bulkUpdateServices(svcIds, svcUpdates, { silent: true });
      }
    } catch (e) {
      console.error('Cascade failed', e);
      toast.error('Cascade Failed', 'Failed to cascade updates to active records.');
    }
    return totalRecords;
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const { field, idx, globalIdx } = editingItem;
    const newName = editForm.name;
    if (!newName?.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    let newSettings = { ...settings };
    let oldName = '';

    if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
      const currentData = [...(settings.settingsData || [])];
      oldName = currentData[globalIdx!].name;
      currentData[globalIdx!] = {
        ...currentData[globalIdx!],
        name: newName.trim(),
        color: editForm.color,
        icon: editForm.icon,
      };
      newSettings.settingsData = currentData;
    } else {
      const currentList = [...(settings[field as keyof typeof settings] as any[])];
      const oldItem = currentList[idx];
      oldName = typeof oldItem === 'string' ? oldItem : oldItem.name;

      let newItemData: any;
      if (typeof oldItem === 'string') {
        newItemData = newName.trim();
      } else if (field === 'services') {
        newItemData = { name: newName.trim(), price: Number(editForm.price) || 0 };
      } else {
        newItemData = { name: newName.trim(), color: editForm.color, icon: editForm.icon };
      }
      currentList[idx] = newItemData;
      newSettings = { ...newSettings, [field]: currentList };
    }

    try {
      const cascadedCount = await cascadeSettingRename(field, oldName, newName.trim());
      const displayField = fieldDisplayNames[field] || field;

      let customMsg = '';
      let logMsg = '';
      if (oldName !== newName.trim()) {
        logMsg = `${displayField} changed from ${oldName} to ${newName.trim()}`;
        customMsg = logMsg;
        if (cascadedCount && cascadedCount > 0)
          customMsg += ` (Cascaded to ${cascadedCount} records)`;
      } else {
        logMsg = `Updated styling properties for '${newName.trim()}'`;
        customMsg = logMsg;
      }

      debouncedSaveSettings(newSettings, customMsg);
      setEditingItem(null);

      const author = user?.name || user?.email || 'Admin';
      addGlobalLog(logMsg, 'Setting', field, newName.trim(), author);
    } catch (e) {}
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    const { field, idx, globalIdx } = deletingItem;
    let newSettings = { ...settings };
    if (!newSettings.archivedData) newSettings.archivedData = {};

    let deletedItem: any;

    if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
      const currentData = [...(settings.settingsData || [])];
      [deletedItem] = currentData.splice(globalIdx!, 1);
      newSettings.settingsData = currentData;

      if (!newSettings.archivedData.settingsData) newSettings.archivedData.settingsData = [];
      newSettings.archivedData.settingsData.push({
        ...deletedItem,
        archivedAt: new Date().toISOString(),
      });
    } else {
      const currentList = [...(settings[field as keyof typeof settings] as any[])];
      [deletedItem] = currentList.splice(idx, 1);
      newSettings = { ...newSettings, [field]: currentList };

      if (!newSettings.archivedData[field]) newSettings.archivedData[field] = [];
      newSettings.archivedData[field].push(
        typeof deletedItem === 'string'
          ? { name: deletedItem, archivedAt: new Date().toISOString() }
          : { ...deletedItem, archivedAt: new Date().toISOString() }
      );
    }

    const deletedName =
      typeof deletedItem === 'string' ? deletedItem : deletedItem?.name || 'Unknown';
    const displayField = fieldDisplayNames[field] || field;
    const msg = `${displayField} '${deletedName}' archived`;

    debouncedSaveSettings(newSettings, msg);
    setDeletingItem(null);

    const author = user?.name || user?.email || 'Admin';
    addGlobalLog(msg, 'Setting', field, deletedName, author);
  };

  const handleAdd = (field: string) => {
    const form = newForm[field] || {};
    const name = form.name?.trim();
    if (!name) return;

    let newSettings = { ...settings };

    if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
      const currentData = [...(settings.settingsData || [])];
      const cat = field === 'serviceOutcomes' ? 'ServiceOutcome' : 'ServiceStatus';
      currentData.push({
        category: cat,
        name: name,
        color: form.color || 'slate',
        icon: form.icon || 'CircleDashed',
      });
      newSettings.settingsData = currentData;
    } else {
      const currentList = [...((settings[field as keyof typeof settings] as any[]) || [])];
      let newItemData: any;
      if (field === 'features') {
        newItemData = name;
      } else if (field === 'services') {
        newItemData = { name: name, price: Number(form.price) || 0 };
      } else {
        newItemData = {
          name: name,
          color: form.color || 'slate',
          icon: form.icon || (field === 'managers' ? 'User' : 'CircleDashed'),
        };
      }
      currentList.push(newItemData);
      newSettings = { ...newSettings, [field]: currentList };
    }

    const displayField = fieldDisplayNames[field] || field;
    const msg = `New ${displayField}: ${name} added`;

    debouncedSaveSettings(newSettings, msg);
    setNewForm({ ...newForm, [field]: {} });

    const author = user?.name || user?.email || 'Admin';
    addGlobalLog(msg, 'Setting', field, name, author);
  };

  const moveItem = (field: string, idx: number, dir: number, items: any[]) => {
    if (idx + dir < 0 || idx + dir >= items.length) return;
    let newSettings = { ...settings };

    if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
      const cat = field === 'serviceOutcomes' ? 'ServiceOutcome' : 'ServiceStatus';
      const globalData = [...(settings.settingsData || [])];

      const item1 = items[idx];
      const item2 = items[idx + dir];
      const gIdx1 = globalData.findIndex((s) => s.category === cat && s.name === item1.name);
      const gIdx2 = globalData.findIndex((s) => s.category === cat && s.name === item2.name);

      if (gIdx1 !== -1 && gIdx2 !== -1) {
        const temp = globalData[gIdx1];
        globalData[gIdx1] = globalData[gIdx2];
        globalData[gIdx2] = temp;
      }
      newSettings.settingsData = globalData;
    } else {
      const currentList = [...(settings[field as keyof typeof settings] as any[])];
      const temp = currentList[idx];
      currentList[idx] = currentList[idx + dir];
      currentList[idx + dir] = temp;
      newSettings = { ...newSettings, [field]: currentList };
    }

    const msg = `Reordered ${fieldDisplayNames[field] || field}`;
    debouncedSaveSettings(newSettings, msg);

    const author = user?.name || user?.email || 'Admin';
    addGlobalLog(msg, 'Setting', field, 'Reorder', author);
  };

  const handleDragStart = (e: React.DragEvent, field: string, idx: number, globalIdx?: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ field, idx, globalIdx });
  };

  const handleDragOver = (e: React.DragEvent, field: string, idx: number) => {
    e.preventDefault();
    if (draggedItem?.field === field && draggedItem.idx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (e: React.DragEvent, field: string, idx: number, items: any[]) => {
    e.preventDefault();
    // Legacy drop handler removed, using Framer Motion Reorder instead
  };

  const handleReorder = (field: string, newOrder: any[]) => {
    setLocalOrders(prev => ({ ...prev, [field]: newOrder }));
  };

  const handleDragEnd = (field: string) => {
    const newOrder = localOrders[field];
    if (!newOrder) return;
    
    let newSettings = { ...settings };
    
    if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
      const cat = field === 'serviceOutcomes' ? 'ServiceOutcome' : 'ServiceStatus';
      const globalData = [...(settings.settingsData || [])];
      const otherItems = globalData.filter((s) => s.category !== cat);
      newSettings.settingsData = [...otherItems, ...newOrder];
    } else {
      newSettings = { ...newSettings, [field]: newOrder };
    }
    
    const msg = `Reordered ${fieldDisplayNames[field] || field}`;
    debouncedSaveSettings(newSettings, msg);
    
    const author = user?.name || user?.email || 'Admin';
    addGlobalLog(msg, 'Setting', field, 'Reorder', author);
    
    setLocalOrders(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSaveScoring = async () => {
    if (totalProjectWeights !== 100) {
      toast.error('Weights must equal exactly 100%');
      return;
    }
    if (thresholds.warning >= thresholds.healthy) {
      toast.error('Warning threshold must be strictly less than Healthy threshold');
      return;
    }

    const newSettings = {
      ...settings,
      scoring: {
        weights: projectWeights,
        thresholds: thresholds,
      },
    };
    toast.promise(saveSettings(newSettings), {
      loading: 'Saving Scoring Rules...',
      success: 'Scoring Rules Saved!',
      error: 'Failed to save Scoring Rules',
    });
  };

  const renderList = (title: string, desc: string, fieldName: string) => {
    let globalItems: any[] = [];
    if (fieldName === 'serviceOutcomes')
      globalItems = (settings.settingsData || []).filter((s: any) => s.category === 'ServiceOutcome');
    else if (fieldName === 'serviceStatuses')
      globalItems = (settings.settingsData || []).filter((s: any) => s.category === 'ServiceStatus');
    else globalItems = (settings[fieldName as keyof typeof settings] as any[]) || [];

    const items = localOrders[fieldName] || globalItems;

    const isStringList = fieldName === 'features';
    const isServices = fieldName === 'services';
    const form = newForm[fieldName] || {};

    const isAdding = addingNew[fieldName];

    return (
      <div className="mb-10 max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setAddingNew({ ...addingNew, [fieldName]: true })}
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add {title.replace(/s$/, '')}
            </button>
          )}
        </div>
        <div className="bg-white border border-border rounded-xl shadow-sm">
          <Reorder.Group axis="y" values={items} onReorder={(newOrder) => handleReorder(fieldName, newOrder)} className="divide-y divide-border relative list-none m-0 p-0">
            <AnimatePresence initial={false}>
            {items.map((item, i) => {
              let globalIdx: number | undefined;
              if (fieldName === 'serviceOutcomes' || fieldName === 'serviceStatuses') {
                globalIdx = settings.settingsData?.findIndex(
                  (s: any) => s.category === item.category && s.name === item.name
                );
              }

              const isEditing = editingItem?.field === fieldName && editingItem.idx === i;
              const isDeleting = deletingItem?.field === fieldName && deletingItem.idx === i;
              const name = typeof item === 'string' ? item : item.name;
              const isDragOver = dragOverIdx === i && draggedItem?.field === fieldName;

              const hex = item.color?.startsWith('#') ? item.color : COLOR_MAP[item.color] || COLOR_MAP.slate;

              if (isEditing) {
                return (
                  <Reorder.Item
                    value={item}
                    key={name}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/80 relative z-10 ${i === 0 ? 'rounded-t-xl' : ''} ${i === items.length - 1 && !isAdding ? 'rounded-b-xl' : ''}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <input
                        autoFocus
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="flex-1 min-w-0 rounded-md border border-input bg-white px-3 h-9 text-sm shadow-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      {isServices && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-muted-foreground font-medium text-sm">$</span>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            className="w-24 rounded-md border border-input bg-white px-2 h-9 text-sm shadow-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                        </div>
                      )}
                      {!isStringList && !isServices && (
                        <div className="flex items-center gap-2 shrink-0">
                          <CustomPicker
                            type="color"
                            value={editForm.color}
                            onChange={(color) => setEditForm({ ...editForm, color })}
                          />
                          {fieldName !== 'managers' && (
                            <CustomPicker
                              type="icon"
                              value={editForm.icon}
                              onChange={(icon) => setEditForm({ ...editForm, icon })}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingItem(null)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editForm.name || editForm.name.trim() === ''}
                        className="bg-primary text-primary-foreground rounded-md text-xs font-medium h-8 px-3 shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                    </div>
                  </Reorder.Item>
                );
              }

              if (isDeleting) {
                return (
                  <Reorder.Item
                    value={item}
                    key={name}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-red-50/50 border-l-4 border-l-destructive relative z-10 ${i === 0 ? 'rounded-t-xl' : ''} ${i === items.length - 1 && !isAdding ? 'rounded-b-xl' : ''}`}
                  >
                    <div className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Archive "{name}"? This removes it from
                      active dropdowns, but preserves historical records.
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setDeletingItem(null)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        className="bg-destructive text-destructive-foreground rounded-md text-xs font-medium h-8 px-3 shadow-sm hover:bg-destructive/90 transition-all active:scale-95"
                      >
                        Archive
                      </button>
                    </div>
                  </Reorder.Item>
                );
              }

              return (
                <Reorder.Item
                  value={item}
                  key={name}
                  onDragEnd={() => handleDragEnd(fieldName)}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group ${i === 0 ? 'rounded-t-xl' : ''} ${i === items.length - 1 && !isAdding ? 'rounded-b-xl' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {!isStringList && !isServices ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 text-xs shadow-sm tracking-wide font-semibold rounded-full border flex items-center gap-1.5"
                          style={{
                            backgroundColor: hexToRgba(hex, 0.1),
                            color: hex,
                            borderColor: hexToRgba(hex, 0.2),
                          }}
                        >
                          {(fieldName === 'managers' || item.icon) &&
                            renderIcon(fieldName === 'managers' ? 'User' : item.icon, 'w-3 h-3')}
                          {name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">{name}</span>
                        {isServices && (
                          <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border shadow-sm">
                            $
                            {parseFloat(item.price || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip content="Drag to reorder">
                      <div className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200 rounded-md transition-colors">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    </Tooltip>
                    <Tooltip content="Move Up">
                      <button
                        onClick={() => moveItem(fieldName, i, -1, items)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200 rounded-md transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Move Down">
                      <button
                        onClick={() => moveItem(fieldName, i, 1, items)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200 rounded-md transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Edit">
                      <button
                        onClick={() => {
                          setEditingItem({ field: fieldName, idx: i, globalIdx });
                          setEditForm(
                            isStringList
                              ? { name }
                              : isServices
                                ? { name, price: item.price }
                                : { name, color: item.color, icon: item.icon }
                          );
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Archive">
                      <button
                        onClick={() => setDeletingItem({ field: fieldName, idx: i, globalIdx })}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
            {items.length === 0 && !isAdding && (
              <li className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/30 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm">
                  <Plus className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">No {title.toLowerCase()} configured</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">Get started by adding your first {title.replace(/s$/, '').toLowerCase()} to the list.</p>
                <button
                  onClick={() => setAddingNew({ ...addingNew, [fieldName]: true })}
                  className="mt-4 text-sm font-medium bg-white border border-border text-slate-700 hover:text-primary hover:border-primary/30 hover:bg-primary/5 px-4 h-9 rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add {title.replace(/s$/, '')}
                </button>
              </li>
            )}
            
            <AnimatePresence>
              {isAdding && (
                <motion.li
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 bg-slate-50/80 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10 ${items.length === 0 ? 'rounded-xl' : 'rounded-b-xl'}`}
                >
                  <input
                    autoFocus
                    type="text"
                    className="flex-1 min-w-0 rounded-md border border-input bg-white px-3 h-9 text-sm shadow-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder={`New ${title.replace(/s$/, '')} name...`}
                    value={form.name || ''}
                    onChange={(e) =>
                      setNewForm({ ...newForm, [fieldName]: { ...form, name: e.target.value } })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && form.name) {
                        handleAdd(fieldName);
                        setAddingNew({ ...addingNew, [fieldName]: false });
                      }
                    }}
                  />
                  {isServices && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-muted-foreground font-medium text-sm">$</span>
                      <input
                        type="number"
                        className="w-24 rounded-md border border-input bg-white px-2 h-9 text-sm shadow-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="Price"
                        value={form.price || ''}
                        onChange={(e) =>
                          setNewForm({ ...newForm, [fieldName]: { ...form, price: e.target.value } })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && form.name) {
                            handleAdd(fieldName);
                            setAddingNew({ ...addingNew, [fieldName]: false });
                          }
                        }}
                      />
                    </div>
                  )}
                  {!isStringList && !isServices && (
                    <div className="flex items-center gap-2 shrink-0">
                      <CustomPicker
                        type="color"
                        value={form.color || 'slate'}
                        onChange={(color) => setNewForm({ ...newForm, [fieldName]: { ...form, color } })}
                      />
                      {fieldName !== 'managers' && (
                        <CustomPicker
                          type="icon"
                          value={form.icon || 'CircleDashed'}
                          onChange={(icon) => setNewForm({ ...newForm, [fieldName]: { ...form, icon } })}
                        />
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setAddingNew({ ...addingNew, [fieldName]: false })}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (form.name) {
                          handleAdd(fieldName);
                          setAddingNew({ ...addingNew, [fieldName]: false });
                        }
                      }}
                      disabled={!form.name || form.name.trim() === ''}
                      className="bg-primary text-primary-foreground rounded-md text-xs font-medium h-8 px-3 shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                </motion.li>
              )}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      </div>
    );
  };


  const renderArchiveRow = (item: any) => {
    const isConfirming = confirmArchiveDeleteId === item.id;
    const name = item.companyName || item.name || (typeof item === 'string' ? item : 'Unknown');
    const type = item._archiveType;
    const archivedAt = item.archivedAt ? new Date(item.archivedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;

    const isSetting = !!item._category;
    const onDelete = isSetting
      ? () => {
          handleHardDeleteSetting(item._category, item._idx, item._isSettingsData);
          setConfirmArchiveDeleteId(null);
        }
      : () => {
          handleHardDeleteRecordLocal(item._collection, item._originalItem);
          setConfirmArchiveDeleteId(null);
        };

    const onRestore = isSetting
      ? () => handleRestoreSetting(item._category, item._idx, item._isSettingsData)
      : () => handleRestoreRecordLocal(item._collection, item._originalItem);

    let iconContent = <ArchiveRestore className="w-4 h-4" />;
    let iconBg = 'bg-slate-100 text-slate-600 border-slate-200';
    let typeBadge = 'bg-slate-100 text-slate-600 border-slate-200';
    if (type === 'Client') {
      iconContent = <Building2 className="w-4 h-4" />;
      iconBg = 'bg-blue-50 text-blue-600 border-blue-100';
      typeBadge = 'bg-blue-50/50 text-blue-700 border-blue-200/60';
    } else if (type === 'Project') {
      iconContent = <Home className="w-4 h-4" />;
      iconBg = 'bg-indigo-50 text-indigo-600 border-indigo-100';
      typeBadge = 'bg-indigo-50/50 text-indigo-700 border-indigo-200/60';
    } else if (type === 'Service') {
      iconContent = <Briefcase className="w-4 h-4" />;
      iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-100';
      typeBadge = 'bg-emerald-50/50 text-emerald-700 border-emerald-200/60';
    } else if (isSetting) {
      iconContent = <SettingsIcon className="w-4 h-4" />;
      iconBg = 'bg-slate-50 text-slate-600 border-slate-100';
      typeBadge = 'bg-slate-50/50 text-slate-700 border-slate-200/60';
    }

    return (
      <div
        key={item.id}
        className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 hover:shadow-sm transition-all relative group flex flex-col"
      >
        {isConfirming ? (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 z-20 animate-in fade-in duration-200 border border-red-200 shadow-sm gap-4">
            <div className="flex items-center gap-3 text-sm font-bold text-red-700">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              Permanently delete "{name}"?
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setConfirmArchiveDeleteId(null)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-red-600/20"
              >
                Delete Forever
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          {/* Left Side: Icon & Details */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${iconBg}`}
            >
              {iconContent}
            </div>
            <div className="min-w-0 pt-0.5 pr-2">
              <h4 className="text-sm font-bold text-slate-900 truncate">{name}</h4>
              {(isSetting || type === 'Project' || type === 'Service') && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {isSetting && (
                    <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold capitalize tracking-wide ${typeBadge}`}>
                      {type.toLowerCase()}
                    </span>
                  )}
                  
                  {/* Metadata */}
                  {(type === 'Project' && item.clients?.length > 0) && (
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      Client: {item.clients.join(', ')}
                    </span>
                  )}
                  
                  {type === 'Service' && (
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      {item.clients?.length > 0 ? item.clients.join(', ') : 'No Client'}
                      {item.projectName && item.projectName !== 'N/A' && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          {item.projectName}
                        </>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Date & Actions */}
          <div className="flex items-center gap-3 shrink-0 h-10">
            {/* The Date (always visible) */}
            <div className="flex flex-col items-end transition-all">
               {archivedAt ? (
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                     <ArchiveRestore className="w-3.5 h-3.5 text-slate-400" />
                     {archivedAt}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    Legacy Record
                  </span>
                )}
            </div>

            {/* Actions (visible on hover but taking space) */}
            <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <UITooltip content="Restore Record">
                <button
                  onClick={onRestore}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 focus:outline-none"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </UITooltip>
              <UITooltip content="Permanently Delete">
                <button
                  onClick={() => setConfirmArchiveDeleteId(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 focus:outline-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </UITooltip>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderArchives = () => {
    let itemsToRender: any[] = [];

    const addItems = (source: any[], typeLabel: string, collection: string) => {
      return source.map((item) => ({
        ...item,
        id: item.clientId || item.id,
        _archiveType: typeLabel,
        _collection: collection,
        _originalItem: item,
      }));
    };

    if (archiveTab === 'all' || archiveTab === 'clients') {
      itemsToRender = [...itemsToRender, ...addItems(archivedClients, 'Client', 'clients')];
    }
    if (archiveTab === 'all' || archiveTab === 'projects') {
      itemsToRender = [...itemsToRender, ...addItems(archivedProjects, 'Project', 'projects')];
    }
    if (archiveTab === 'all' || archiveTab === 'services') {
      itemsToRender = [...itemsToRender, ...addItems(archivedServices, 'Service', 'services')];
    }
    if (archiveTab === 'all' || archiveTab === 'settings') {
      if (settings?.archivedData) {
        Object.entries(settings.archivedData).forEach(([category, items]) => {
          if (Array.isArray(items)) {
            const isSettingsData = category === 'settingsData';
            items.forEach((item: any, idx: number) => {
              const name = typeof item === 'string' ? item : item.name;
              const subCategory = isSettingsData ? item.category : category;
              itemsToRender.push({
                id: `setting-${category}-${idx}`,
                name,
                _archiveType: subCategory.replace(/([A-Z])/g, ' $1').trim(),
                _category: category,
                _idx: idx,
                _isSettingsData: isSettingsData,
                archivedAt: item.archivedAt || null,
              });
            });
          }
        });
      }
    }

    // Apply Search
    if (archiveSearch) {
      itemsToRender = itemsToRender.filter((item) => {
        const name = item.companyName || item.name || '';
        return name.toLowerCase().includes(archiveSearch.toLowerCase());
      });
    }

    return (
      <div className="animate-in fade-in duration-300 w-full max-w-5xl h-full flex flex-col relative z-10">
        <div className="space-y-4 mb-8 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Archives</h3>
            <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
              Manage deleted records and settings. Restoring an item will return it to active use.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
          <div className="relative flex items-center bg-slate-100/80 p-1 rounded-xl shadow-inner shrink-0">
            {[
              { id: 'all', label: 'All', icon: Grid },
              { id: 'clients', label: 'Clients', icon: Building2 },
              { id: 'projects', label: 'Projects', icon: Home },
              { id: 'services', label: 'Services', icon: Briefcase },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setArchiveTab(f.id as any)}
                className={`relative flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 z-10 whitespace-nowrap ${
                  archiveTab === f.id
                    ? 'text-primary'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {archiveTab === f.id && (
                  <motion.div
                    layoutId="archiveFilterIndicator"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <f.icon
                  className={`w-4 h-4 ${archiveTab === f.id ? 'text-primary' : 'text-slate-400'}`}
                />{' '}
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search archives..."
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
              className="w-full bg-slate-50/50 hover:bg-slate-50 border border-transparent focus:bg-white focus:border-primary/50 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-thin-scroll pb-8 -mx-2 px-2">
          {itemsToRender.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-16 text-center flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <ArchiveRestore className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">No archived records</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                There are currently no items matching your search criteria in the archives.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {itemsToRender.map((item) => renderArchiveRow(item))}
            </div>
          )}
        </div>
      </div>
    );
  };


  const tabTitleMap: Record<string, string> = {
    global: 'Organization Settings',
    projects: 'Project Workflows',
    services: 'Service Catalog',
    scoring: 'Health Scoring',
    templates: 'Form Templates',
    pipeline: 'Data Ingestion Pipeline',
    exports: 'Data Exports',
    audit: 'Audit Logs',
    archives: 'Archives'
  };

  const tabSubtitleMap: Record<string, string> = {
    global: 'Manage fundamental taxonomies, team members, and capabilities that power your workspace.',
    pipeline: 'A guided workflow to upload new CSV data, compile it into the system, and map any unmatched records.',
    exports: 'Export combined project form submissions. Each export aggregates data from all projects that have completed the specific form.',
    audit: 'A complete chronological record of all system modifications and data ingestion events.',
  };

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-white">
      <div className="flex w-full h-full">
        <div className="w-full md:w-[280px] bg-slate-50 border-r border-border shrink-0 p-4 flex flex-col gap-1 overflow-y-auto custom-thin-scroll">
          <div className="mb-4 px-2 mt-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h2>
            <div className="mt-4 relative hidden">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search settings..." 
                className="w-full bg-white/50 hover:bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="text-[13px] font-semibold text-slate-500 tracking-tight mb-2 px-2">Workspace</div>
          {[
            { id: 'global', label: 'Organization', icon: Building2 },
            { id: 'projects', label: 'Project Workflows', icon: Home },
            { id: 'services', label: 'Service Catalog', icon: Briefcase },
            { id: 'scoring', label: 'Health Scoring', icon: Calculator },
            { id: 'templates', label: 'Form Templates', icon: FileText },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out w-full text-left outline-none ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="settingsSidebarActive"
                    className="absolute inset-0 bg-white shadow-sm border border-slate-200/60 rounded-md z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <tab.icon className={`w-4 h-4 relative z-10 transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-0.5' : ''}`} /> 
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
          
          <div className="text-[13px] font-semibold text-slate-500 tracking-tight mb-2 mt-6 px-2">Operations & Data</div>
          {[
            { id: 'pipeline', label: 'Data Imports', icon: Database },
            { id: 'exports', label: 'Data Exports', icon: FileDown },
            { id: 'audit', label: 'Audit Logs', icon: History },
            { id: 'archives', label: 'Archives', icon: ArchiveRestore },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out active:scale-95 w-full text-left outline-none ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="settingsSidebarActive"
                    className="absolute inset-0 bg-white shadow-sm border border-slate-200/60 rounded-md z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <tab.icon className={`w-4 h-4 transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-0.5' : ''}`} /> 
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 bg-white overflow-y-auto custom-thin-scroll relative">
          {activeTab !== 'templates' && (
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-10 pt-8 pb-6 border-b border-transparent">
               <h1 className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">{tabTitleMap[activeTab]}</h1>
               {tabSubtitleMap[activeTab] && (
                 <p className="text-slate-500 text-[15px]">{tabSubtitleMap[activeTab]}</p>
               )}
            </div>
          )}
          <div className={activeTab === 'templates' ? '' : 'px-10 pb-10'}>
          {activeTab === 'global' && (
            <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
              <div className="space-y-12">
                {renderList('Account Managers', 'Manage the users who can be assigned to clients and projects.', 'managers')}
                {renderList('Client Types', 'Classify your clients.', 'clientTypes')}
                {renderList('Platform Features', 'System features and modules.', 'features')}
              </div>
            </div>
          )}
          {activeTab === 'projects' && (
            <div className="max-w-3xl animate-in fade-in duration-300">
              {renderList('Project Status', 'Workflow stages for projects.', 'statuses')}
              {renderList('Schedule Status', 'Schedule statuses for projects.', 'timelines')}
              {renderList('Implementation Status', 'Milestones for project execution.', 'phases')}
            </div>
          )}
          {activeTab === 'services' && (
            <div className="max-w-3xl animate-in fade-in duration-300">
              {renderList('Available Services', 'Available billable services.', 'services')}
              {renderList('Service Types', 'Categories of services.', 'serviceTypes')}
              {renderList('Service Outcomes', 'Outcome statuses for services.', 'serviceOutcomes')}
              {renderList('Fulfillment Status', 'Lifecycle stages for services.', 'serviceStatuses')}
            </div>
          )}
          {activeTab === 'scoring' && (
            <div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
              {/* Unified Health Pillar Weights */}
              <div className="bg-white border border-border rounded-xl shadow-sm p-6">
                <style>{`
                  .premium-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--slider-color);
                    cursor: grab;
                    transition: transform 0.15s;
                    margin-top: -4px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  }
                  .premium-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                  }
                  .premium-slider::-webkit-slider-thumb:active {
                    cursor: grabbing;
                    transform: scale(0.9);
                  }
                  .premium-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--slider-color);
                    cursor: grab;
                    transition: transform 0.15s;
                    border: none;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  }
                  .premium-slider::-moz-range-thumb:hover {
                    transform: scale(1.2);
                  }
                  .premium-slider::-moz-range-thumb:active {
                    cursor: grabbing;
                    transform: scale(0.9);
                  }
                  .premium-slider::-webkit-slider-runnable-track {
                    border-radius: 8px;
                    height: 8px;
                    background: #f1f5f9;
                  }
                  .premium-slider::-moz-range-track {
                    border-radius: 8px;
                    height: 8px;
                    background: #f1f5f9;
                  }
                `}</style>
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
                    Health Score Weights
                  </h3>
                  <p className="text-sm text-slate-500">
                    Adjust the weights for each pillar so they equal exactly 100%.
                  </p>
                </div>
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                  {/* Left: Sliders */}
                  <div className="flex-1 w-full space-y-5">
                    {[
                      {
                        label: 'Platform Engagement',
                        key: 'opActivity',
                        val: projectWeights.opActivity,
                        color: '#0ea5e9',
                        tooltip: 'Usage of core platform features.'
                      },
                      {
                        label: 'Feature Adoption',
                        key: 'featAdoption',
                        val: projectWeights.featAdoption,
                        color: '#0284c7',
                        tooltip: 'Breadth of features used across the account.'
                      },
                      {
                        label: 'Financial Standing',
                        key: 'financial',
                        val: projectWeights.financial || 0,
                        color: '#3b82f6',
                        tooltip: 'Invoice payment health and MRR trends.'
                      },
                      { 
                        label: 'Active Users', 
                        key: 'userVol', 
                        val: projectWeights.userVol,
                        color: '#6366f1',
                        tooltip: 'Ratio of daily active users vs provisioned licenses.'
                      },
                      { 
                        label: 'Client Sentiment', 
                        key: 'csat', 
                        val: projectWeights.csat,
                        color: '#8b5cf6',
                        tooltip: 'Recent CSAT scores and support ticket sentiment.'
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center gap-4">
                        <Tooltip content={item.tooltip} position="top">
                          <label className="text-sm font-semibold text-slate-600 w-44 flex items-center justify-between gap-1.5 shrink-0 cursor-help pr-2 border-r border-slate-100">
                            {item.label}
                            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                          </label>
                        </Tooltip>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="flex-1 appearance-none bg-transparent cursor-pointer premium-slider"
                          style={{ '--slider-color': item.color } as React.CSSProperties}
                          value={item.val}
                          onChange={(e) =>
                            setProjectWeights({
                              ...projectWeights,
                              [item.key]: Number(e.target.value) || 0,
                            })
                          }
                        />
                        <span className="text-sm font-bold text-slate-700 w-12 text-right">
                          {item.val}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Right: Donut Chart */}
                  <div className="w-full lg:w-64 h-64 shrink-0 flex flex-col items-center justify-center">
                    <DonutChart 
                      total={totalProjectWeights}
                      data={[
                        { name: 'Platform Engagement', value: projectWeights.opActivity, color: '#0ea5e9' },
                        { name: 'Feature Adoption', value: projectWeights.featAdoption, color: '#0284c7' },
                        { name: 'Financial Standing', value: projectWeights.financial || 0, color: '#3b82f6' },
                        { name: 'Active Users', value: projectWeights.userVol, color: '#6366f1' },
                        { name: 'Client Sentiment', value: projectWeights.csat, color: '#8b5cf6' }
                      ].filter(d => d.value > 0)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end items-center">
                  <div className="flex gap-4 items-center"> 
                    <button
                      onClick={handleSaveScoring}
                      disabled={totalProjectWeights !== 100}
                      className="bg-primary text-white px-5 h-9 rounded text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Weights
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Thresholds */}
              <div className="bg-white border border-border rounded-xl shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-1">KPI Thresholds</h3>
                  <p className="text-sm text-slate-500">
                    Drag the handles below to define the score boundaries for At-Risk, Warning, and Healthy states.
                  </p>
                </div>
                
                <div className="px-4 max-w-3xl">
                  <DualThumbSlider 
                    value={{ warning: thresholds.warning, healthy: thresholds.healthy }}
                    onChange={({ warning, healthy }) => setThresholds({ warning, healthy })}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-center w-24">
                      <span className="block text-sm font-semibold text-slate-500 mb-1">At Risk</span>
                      <span className="text-base font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">0 - {thresholds.warning - 1}</span>
                    </div>
                    <div className="text-center w-24">
                      <span className="block text-sm font-semibold text-slate-500 mb-1">Warning</span>
                      <span className="text-base font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">{thresholds.warning} - {thresholds.healthy - 1}</span>
                    </div>
                    <div className="text-center w-24">
                      <span className="block text-sm font-semibold text-slate-500 mb-1">Healthy</span>
                      <span className="text-base font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">{thresholds.healthy} - 100</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end items-center">
                  <button
                    onClick={handleSaveScoring}
                    className="bg-primary text-white px-5 h-9 rounded text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    Save Thresholds
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'templates' && (
            <div className="h-full w-full animate-in fade-in duration-300 flex flex-col">
              <TemplateDesigner />
            </div>
          )}
          
          {activeTab === 'pipeline' && (
            <div className="animate-in fade-in duration-300 space-y-8">
              {/* Top Hero Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upload & Compile Data</h3>
                  <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
                    Drop your CSV exports below, then run the compiler to detect new entries, update global metrics, and automatically align data based on your previous mappings.
                  </p>
                </div>
                <DataUploader />
              </div>

              {/* Two Column Layout for Action Required and History */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Left Column (col-span-2) */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">Action Required</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Review and manually map unrecognized incoming data.</p>
                    </div>
                  </div>
                  <DataIntakePipeline />
                </div>

                {/* Right Column (col-span-1) */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Upload Activity</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Your recent file uploads and auto-processed logs.</p>
                  </div>
                  
                  <RecentUploadActivity logs={logs} setViewingUploadLog={setViewingUploadLog} />

                </div>

              </div>
            </div>
          )}
          {activeTab === 'audit' && (
            <AuditLogViewer 
              logs={logs} 
              loadLogs={loadLogs} 
              setViewingUploadLog={setViewingUploadLog} 
              loadingLogs={loadingLogs}
            />
          )}
          
          <AutoProcessedDrawer
            isOpen={!!viewingUploadLog}
            onClose={() => setViewingUploadLog(null)}
            log={viewingUploadLog}
            onUpdate={loadLogs}
          />
          {activeTab === 'archives' && renderArchives()}
          {activeTab === 'exports' && (
            <DataExportHub projects={projects} getTemplate={getTemplate} />
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
