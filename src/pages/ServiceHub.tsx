import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

import {
  ArrowUpDown,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  X,
  Download,
  Plus,
  Database,
  DollarSign,
  Calendar,
  BarChart2,
  ArrowRight,
  TrendingUp,
  Clock,
  TrendingDown,
  PlusCircle,
  Package,
} from 'lucide-react';
import { TrendIndicator } from '../components/TrendIndicator';
import { PageHeader } from '../components/PageHeader';
import { useTableFilter } from '../hooks/useTableFilter';
import { universalExportCSV } from '../utils/exportUtils';
import { useUI } from '../context/UIContext';
import {
  getSettingBadge,
  hexToRgba,
  COLOR_MAP,
  renderIcon,
  getTypeBadgeIconOnly,
} from '../utils/uiUtils';
import { updateServiceRecord, addProjectAutoLog, addAutoLog } from '../api/dbService';
import { ColumnFilter, DateFilter, StatusDropdown } from '../components/TableFilters';
import { PageTabs } from '../components/ui/PageTabs';
import { ActiveFilterBar } from '../components/ui/ActiveFilterBar';
import { TableFooter } from '../components/ui/TableFooter';
import EmptyState from '../components/EmptyState';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { TruncatedText } from '../components/ui/TruncatedText';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
// import { useVirtualizer } from '@tanstack/react-virtual';

// --- Column Filter Popover Component ---

const ServiceRow = React.memo(({
  s,
  openDrawer,
  getSettingBadge,
  settings,
  activeTab,
  getTypeBadgeIconOnly,
  allStatuses,
  handleStatusChange,
  formatCurrency,
  StatusDropdown,
  TruncatedText
}: any) => {
  const sDate = s.dateVal
    ? new Date(s.dateVal).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No Date';

  return (
                        <tr
                          key={s.id}
                          className="hover:bg-slate-50 transition-colors group cursor-pointer bg-white hover:relative hover:z-[100]"
                          onClick={() => openDrawer('service', s.id)}
                        >
                          <td className="sticky left-0 z-20 group-hover:z-[110] bg-white group-hover:bg-slate-50 transition-colors border-r-0 px-6 py-2">
                            <TruncatedText
                              text={s.name || 'Unnamed Service'}
                              className="font-bold text-[13px] text-foreground max-w-[180px] group-hover:text-primary transition-colors"
                            />
                          </td>
                          <td className="px-6 py-2 text-[13px] text-muted-foreground font-medium border-l-0">
                            <TruncatedText
                              text={s.projectName || 'No Project'}
                              className="max-w-[150px]"
                            />
                          </td>
                          <td className="px-6 py-2 text-[13px] text-muted-foreground font-medium">
                            <TruncatedText
                              text={s.clientName || s.clients?.join(', ') || 'No Client'}
                              className="max-w-[150px]"
                            />
                          </td>
                          <td className="px-6 py-2">{getTypeBadgeIconOnly(s.type, settings)}</td>
                          <td className="px-6 py-2">
                            <div className="flex gap-1 flex-wrap">
                              {s.managers && s.managers.length > 0 ? (
                                s.managers.map((m: string, idx: number) => (
                                  <div key={idx}>{getSettingBadge('managers', m, settings)}</div>
                                ))
                              ) : s.manager ? (
                                getSettingBadge('managers', s.manager, settings)
                              ) : (
                                <span className="text-xs text-muted-foreground">Unassigned</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-2">
                            <StatusDropdown
                              value={s.status || ''}
                              options={allStatuses}
                              onChange={(newStatus: string) => handleStatusChange(s, newStatus)}
                              settings={settings}
                            />
                          </td>
                          <td className="px-6 py-2 text-[13px] text-muted-foreground font-medium whitespace-nowrap">
                            {sDate}
                          </td>
                          {activeTab !== 'Included' && (
                            <>
                              <td className="px-6 py-2 text-[13px] font-bold text-foreground text-right whitespace-nowrap">
                                {formatCurrency(Number(s.price) || 0)}
                              </td>
                              <td className="px-6 py-2 text-[13px] font-bold text-foreground text-right whitespace-nowrap">
                                {formatCurrency(Number(s.serviceValue) || 0)}
                              </td>
                            </>
                          )}
                        </tr>
  );
}, (prevProps, nextProps) => {
  return prevProps.s === nextProps.s && prevProps.activeTab === nextProps.activeTab && prevProps.settings === nextProps.settings;
});

export default function ServiceHub() {
  const location = useLocation();
  const { services, settings, user } = useAppStore();
  const { openModal, openDrawer } = useUI();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(exportMenuRef, () => setShowExportMenu(false), showExportMenu);

    // One-time migrations
  useEffect(() => {
    services.forEach((s) => {
      let needsUpdate = false;
      let updates: any = { ...s };

      if (s.outcome === 'Pending' || s.outcome === 'Unknown' || s.outcome === 'Unknow') {
        updates.outcome = '';
        updates.status = 'Proposal Sent';
        needsUpdate = true;
      }

      if (s.price != null && s.serviceValue == null) {
        updates.serviceValue = Number(s.price) || 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updateServiceRecord(updates, { silent: true }).catch(console.error);
      }
    });
  }, [services]);

  // Tab State
  const getInitialTab = () => {
    if (location.state?.svTab) return location.state.svTab as string;
    return 'All Services';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Filter Logic
  const [displayLimit, setDisplayLimit] = useState(50);

  const loadMoreCallback = React.useCallback(() => {
    setDisplayLimit((prev) => prev + 50);
  }, []);

  const loadMoreRef = useIntersectionObserver(loadMoreCallback, '200px');

  // Filter State
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState<string[]>([]);
  const [clientFilter, setClientFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [managerFilter, setManagerFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(
    location.state?.dateRange || null
  );

  const activeFilterCount =
    nameFilter.length +
    projectFilter.length +
    clientFilter.length +
    typeFilter.length +
    managerFilter.length +
    statusFilter.length +
    (dateRange ? 1 : 0);

  const removeFilterItem = (filterSetter: any, filterArray: string[], item: string) => {
    filterSetter(filterArray.filter((i: string) => i !== item));
  };

  const clearAllFilters = () => {
    setNameFilter([]);
    setProjectFilter([]);
    setClientFilter([]);
    setTypeFilter([]);
    setManagerFilter([]);
    setStatusFilter([]);
    setDateRange(null);
  };

  // Filter Options
  const allNames = useMemo(
    () => Array.from(new Set(services.map((s) => s.name || 'Unnamed'))).sort(),
    [services]
  );
  const allProjects = useMemo(
    () => Array.from(new Set(services.map((s) => s.projectName || 'None'))).sort(),
    [services]
  );
  const allClients = useMemo(
    () => Array.from(new Set(services.map((s) => s.clientName || s.clients?.[0] || 'None'))).sort(),
    [services]
  );
  const allTypes = useMemo(() => settings?.serviceTypes?.map((t: any) => t.name) || [], [settings]);
  const allManagers = useMemo(() => {
    const managers = new Set<string>();
    services?.forEach((s) => {
      if (s.managers && s.managers.length > 0) {
        s.managers.forEach((m: string) => managers.add(m));
      } else if (s.manager) {
        managers.add(s.manager);
      }
    });
    const managerOrder = settings?.managers?.map((m: any) => m.name) || [];
    return Array.from(managers).sort((a, b) => {
      const idxA = managerOrder.indexOf(a);
      const idxB = managerOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [services, settings]);
  const allStatuses = useMemo(
    () =>
      settings?.serviceStatuses?.map((s: any) => s.name) || [
        'Proposal Sent',
        'Accepted',
        'Awaiting Inputs',
        'In Progress',
        'Completed',
        'Not Accepted',
      ],
    [settings]
  );

  const handleStatusChange = useCallback(
    async (s: any, newStatus: string) => {
      const updates: any = { status: newStatus };
      if (newStatus === 'Accepted') {
        updates.outcome = 'Won';
      } else if (newStatus === 'Not Accepted') {
        updates.outcome = 'Lost';
      } else if (newStatus === 'Completed') {
        updates.dateVal = new Date().getTime();
        updates.dateStr = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      try {
        const oldStatus = s.status || 'Draft';
        await updateServiceRecord(
          { ...s, ...updates },
          {
            successMsg: `Status successfully updated for '${s.name}'.`,
            errorMsg: `Failed to update status for '${s.name}'.`,
          },
          `Status changed from ${oldStatus} to ${newStatus}`,
          user?.name
        );

        if (newStatus === 'Completed') {
          const pIds = s.projectIds || (s.projectId && s.projectId !== 'N/A' ? [s.projectId] : []);
          for (const pId of pIds) {
            await addProjectAutoLog(
              pId,
              `Service "${s.name}" status changed from ${oldStatus} to ${newStatus}`,
              user?.name || 'System',
              true
            );
          }
          if (s.clientIds) {
            for (const cid of s.clientIds) {
              await addAutoLog(
                cid,
                `Service "${s.name}" status changed from ${oldStatus} to ${newStatus}`,
                user?.name || 'System',
                true
              );
            }
          }
        }
      } catch (err) {
        console.error('Failed to update status', err);
      }
    },
    [user]
  );

  // Filter Logic
  const baseFiltered = useMemo(() => {
    return services.filter((s) => {
      // Tab filtering
      if (activeTab === 'Pending' && s.status !== 'Proposal Sent') return false;
      if (activeTab === 'Won' && s.outcome !== 'Won') return false;
      if (activeTab === 'Lost' && s.outcome !== 'Lost') return false;
      if (activeTab === 'Additional' && s.type !== 'Additional') return false;
      if (activeTab === 'Included' && s.type !== 'Included') return false;

      // Multi-select filtering
      if (nameFilter.length > 0 && !nameFilter.includes(s.name || 'Unnamed')) return false;
      if (projectFilter.length > 0) {
        const pNames = s.projectName?.split(', ').filter(Boolean) || ['None'];
        if (!pNames.some((n: string) => projectFilter.includes(n))) return false;
      }
      if (
        clientFilter.length > 0 &&
        !clientFilter.includes(s.clientName || s.clients?.[0] || 'None')
      )
        return false;
      if (typeFilter.length > 0 && !typeFilter.includes(s.type || 'None')) return false;
      if (managerFilter.length > 0) {
        const mNames = s.managers?.length ? s.managers : [s.manager || 'Unassigned'];
        if (!mNames.some((m: string) => managerFilter.includes(m))) return false;
      }
      if (statusFilter.length > 0 && !statusFilter.includes(s.status || 'None')) return false;

      // Custom Date Filter
      if (dateRange && s.dateVal) {
        const sDate = new Date(s.dateVal);
        if (dateRange.start) {
          const start = new Date(dateRange.start);
          if (sDate < start) return false;
        }
        if (dateRange.end) {
          const end = new Date(dateRange.end);
          end.setMonth(end.getMonth() + 1); // include the end month
          if (sDate >= end) return false;
        }
      } else if (dateRange && !s.dateVal) {
        return false;
      }

      return true;
    });
  }, [
    services,
    activeTab,
    nameFilter,
    projectFilter,
    clientFilter,
    typeFilter,
    managerFilter,
    statusFilter,
    dateRange,
  ]);

  // Sorting and Searching (from existing hook)
  const {
    searchTerm,
    setSearchTerm,
    sortCol,
    sortAsc,
    handleSort,
    filteredData: tableData,
  } = useTableFilter({
    data: baseFiltered,
    defaultSortCol: 'dateVal',
    defaultSortDir: 'desc',
    searchFields: ['name', 'clientName', 'projectName', 'assignee', 'manager', 'status'],
  });

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchInput, setSearchTerm]);

  // KPI Math
  const kpiData = useMemo(() => {
    let revWonThisYear = 0;
    let revWonLastYear = 0;
    let revWonThisQuarter = 0;
    let revWonLastQuarter = 0;
    let totalServicesRev = 0;
    let totalCommissionThisYear = 0;
    let totalCommissionLastYear = 0;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
    const lastQuarterYear = currentQuarter === 0 ? currentYear - 1 : currentYear;

    const pytdLimit = new Date(
      currentYear - 1,
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    ).getTime();

    // Calculate the equivalent date in the previous quarter
    const monthInQuarter = today.getMonth() % 3;
    const pqtdLimit = new Date(
      lastQuarterYear,
      lastQuarter * 3 + monthInQuarter,
      today.getDate(),
      23,
      59,
      59
    ).getTime();

    services.forEach((s) => {
      if (s.outcome === 'Won') {
        const p = parseFloat(s.price?.toString().replace(/[^0-9.-]+/g, '')) || 0;
        const c = parseFloat(s.commission?.toString().replace(/[^0-9.-]+/g, '')) || 0;

        totalServicesRev += p;

        const timestamp = s.dateVal || (s.dateInput ? new Date(s.dateInput).getTime() : 0);

        if (timestamp) {
          const sDate = new Date(timestamp);
          const sYear = sDate.getFullYear();
          const sQuarter = Math.floor(sDate.getMonth() / 3);

          if (sYear === currentYear) {
            revWonThisYear += p;
            totalCommissionThisYear += c;
          } else if (sYear === currentYear - 1 && timestamp <= pytdLimit) {
            revWonLastYear += p;
            totalCommissionLastYear += c;
          }

          if (sYear === currentYear && sQuarter === currentQuarter) {
            revWonThisQuarter += p;
          } else if (
            sYear === lastQuarterYear &&
            sQuarter === lastQuarter &&
            timestamp <= pqtdLimit
          ) {
            revWonLastQuarter += p;
          }
        }
      }
    });

    return {
      revWonThisYear,
      revWonLastYear,
      revWonThisQuarter,
      revWonLastQuarter,
      totalServicesRev,
      totalCommissionThisYear,
      totalCommissionLastYear,
    };
  }, [services]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const tabs = [
    { label: 'All Services', icon: Briefcase },
    { label: 'Pending', icon: Clock },
    { label: 'Won', icon: TrendingUp },
    { label: 'Lost', icon: TrendingDown },
    { label: 'Additional', icon: PlusCircle },
    { label: 'Included', icon: Package },
  ];

  const tableScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden bg-white"
      onWheel={(e) => {
        if (tableScrollRef.current && !tableScrollRef.current.contains(e.target as Node)) {
          tableScrollRef.current.scrollTop += e.deltaY;
        }
      }}
    >
      <div
        className={`transition-all duration-500 ease-in-out transform origin-top overflow-hidden shrink-0 ${isScrolled ? 'max-h-0 opacity-0 mb-0 scale-y-95' : 'max-h-[800px] opacity-100 mb-4 scale-y-100'}`}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 shrink-0 px-4 md:px-6 pt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              Service Hub
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Track additional services, invoices, and commissions.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap self-start md:self-auto mt-2 md:mt-0">
            <button
              onClick={() => openModal('addService')}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Plus className="w-4 h-4 shrink-0" /> <span className="shrink-0">Add Service</span>
            </button>
            <div className="relative shadow-sm rounded-md" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-200 border border-input bg-white hover:bg-accent hover:text-accent-foreground active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm h-9 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <Download className="w-4 h-4 shrink-0" /> <span className="shrink-0">Export</span>
                <ChevronDown className="w-3 h-3 shrink-0 opacity-70" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white p-1.5 shadow-xl border border-border rounded-xl min-w-[220px] whitespace-nowrap z-[90]">
                  <div
                    className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-sm font-medium"
                    onClick={() => {
                      setShowExportMenu(false);
                      universalExportCSV('Services', services, 'All_Services');
                    }}
                  >
                    <Database className="w-4 h-4 text-muted-foreground" /> Export All
                  </div>
                  <div
                    className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-sm font-medium"
                    onClick={() => {
                      setShowExportMenu(false);
                      universalExportCSV('Services', tableData, 'Filtered_Services');
                    }}
                  >
                    <Filter className="w-4 h-4 text-muted-foreground" /> Export Filtered View
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 shrink-0 px-4 md:px-6">
          {/* Revenue Won This Year */}
          <div
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '50ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-full blur-xl transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex flex-col pr-2">
                <h3 className="text-foreground text-sm font-bold tracking-tight flex items-center gap-1.5">
                  Revenue Won This Year
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Total value of won services
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <TrendIndicator
              current={kpiData.revWonThisYear}
              previous={kpiData.revWonLastYear}
              prefix="$"
              periodText="vs last year"
            />
          </div>

          {/* Revenue Won This Quarter */}
          <div
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '150ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-lime-500/5 group-hover:bg-lime-500/10 rounded-full blur-xl transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex flex-col pr-2">
                <h3 className="text-foreground text-sm font-bold tracking-tight flex items-center gap-1.5">
                  Revenue Won This Quarter
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Total value of won services
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-lime-500/10 text-lime-600 flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110">
                <BarChart2 className="w-5 h-5" />
              </div>
            </div>
            <TrendIndicator
              current={kpiData.revWonThisQuarter}
              previous={kpiData.revWonLastQuarter}
              prefix="$"
              periodText="vs last quarter"
            />
          </div>

          {/* Total Services Revenue */}
          <div
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '250ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-full blur-xl transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex flex-col pr-2">
                <h3 className="text-foreground text-sm font-bold tracking-tight flex items-center gap-1.5">
                  Total Services Revenue
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Historical total of won services
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10 mt-auto pt-2">
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {formatCurrency(kpiData.totalServicesRev)}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                Historical lifetime metric
              </p>
            </div>
          </div>

          {/* Total Commission */}
          <div
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '350ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-full blur-xl transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex flex-col pr-2">
                <h3 className="text-foreground text-sm font-bold tracking-tight flex items-center gap-1.5">
                  Total Commission This Year
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Value of won commissions
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <TrendIndicator
              current={kpiData.totalCommissionThisYear}
              previous={kpiData.totalCommissionLastYear}
              prefix="$"
              periodText="vs last year"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 md:px-6 lg:px-8 pb-6 relative z-20 w-full">
        <div className="flex flex-col gap-3 pb-3 pt-2 shrink-0 w-full sticky top-0 z-30 bg-white/90 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative">
            <PageTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(t) => setActiveTab(t as any)}
            />

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-sm border border-input rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white shadow-sm h-9"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <ActiveFilterBar
            filters={[
              {
                label: 'Name',
                values: nameFilter,
                onRemove: (v) => removeFilterItem(setNameFilter, nameFilter, v),
              },
              {
                label: 'Project',
                values: projectFilter,
                onRemove: (v) => removeFilterItem(setProjectFilter, projectFilter, v),
              },
              {
                label: 'Client',
                values: clientFilter,
                onRemove: (v) => removeFilterItem(setClientFilter, clientFilter, v),
              },
              {
                label: 'Type',
                values: typeFilter,
                onRemove: (v) => removeFilterItem(setTypeFilter, typeFilter, v),
              },
              {
                label: 'Manager',
                values: managerFilter,
                onRemove: (v) => removeFilterItem(setManagerFilter, managerFilter, v),
              },
              {
                label: 'Status',
                values: statusFilter,
                onRemove: (v) => removeFilterItem(setStatusFilter, statusFilter, v),
              },
              {
                label: 'Completion Date',
                values: dateRange
                  ? [`${dateRange.start || '...'} to ${dateRange.end || '...'}`]
                  : [],
                onRemove: () => setDateRange(null),
              },
            ]}
            onClearAll={clearAllFilters}
          />
        </div>

        <div className="flex-1 overflow-auto custom-thin-scroll border border-border rounded-xl shadow-sm bg-white relative flex flex-col">
          <div
            ref={tableScrollRef}
            className="flex-1 overflow-auto custom-thin-scroll w-full relative"
            onScroll={(e) => {
              if (e.currentTarget.scrollTop > 40 && !isScrolled) setIsScrolled(true);
              else if (e.currentTarget.scrollTop <= 10 && isScrolled) setIsScrolled(false);
            }}
          >
            {useMemo(
              () => (
                <table className="w-full text-left bg-white border-separate border-spacing-0 table-fixed min-w-[1200px]">
                  <thead className="sticky top-0 z-[80] bg-white/90 backdrop-blur-md">
                    <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold tracking-wider h-[45px]">
                      <th className="group/th sticky left-0 z-[90] bg-slate-50/90 backdrop-blur-md border-b border-border border-r-0 px-6 py-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                            onClick={() => handleSort('name')}
                          >
                            Service Name
                          </span>
                          <ColumnFilter
                            options={allNames}
                            selected={nameFilter}
                            onChange={setNameFilter}
                            searchable
                          />
                        </div>
                      </th>
                      <th className="group/th px-6 py-2 border-l-0 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                            onClick={() => handleSort('projectName')}
                          >
                            Project Name
                          </span>
                          <ColumnFilter
                            options={allProjects}
                            selected={projectFilter}
                            onChange={setProjectFilter}
                            searchable
                          />
                        </div>
                      </th>
                      <th className="group/th px-6 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                            onClick={() => handleSort('clientName')}
                          >
                            Client
                          </span>
                          <ColumnFilter
                            options={allClients}
                            selected={clientFilter}
                            onChange={setClientFilter}
                            searchable
                          />
                        </div>
                      </th>
                      <th className="group/th px-6 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                            onClick={() => handleSort('type')}
                          >
                            Service Type
                          </span>
                          <ColumnFilter
                            options={allTypes}
                            selected={typeFilter}
                            onChange={setTypeFilter}
                          />
                        </div>
                      </th>
                      <th className="group/th px-6 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                            onClick={() => handleSort('manager')}
                          >
                            Manager
                          </span>
                          <ColumnFilter
                            options={allManagers}
                            selected={managerFilter}
                            onChange={setManagerFilter}
                          />
                        </div>
                      </th>
                      <th className="group/th px-6 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                            onClick={() => handleSort('status')}
                          >
                            Fulfillment Status
                          </span>
                          <ColumnFilter
                            options={allStatuses}
                            selected={statusFilter}
                            onChange={setStatusFilter}
                          />
                        </div>
                      </th>
                      <th className="group/th px-6 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                            onClick={() => handleSort('dateVal')}
                          >
                            Completion Date
                          </span>
                          <DateFilter dateRange={dateRange} setDateRange={setDateRange} />
                        </div>
                      </th>
                      {activeTab !== 'Included' && (
                        <>
                          <th
                            className="px-6 py-2 border-b border-border cursor-pointer hover:text-primary transition-colors text-right"
                            onClick={() => handleSort('price')}
                          >
                            <div className="flex items-center justify-end gap-1.5">Invoice Value</div>
                          </th>
                          <th
                            className="px-6 py-2 border-b border-border cursor-pointer hover:text-primary transition-colors text-right"
                            onClick={() => handleSort('serviceValue')}
                          >
                            <div className="flex items-center justify-end gap-1.5">Service Value</div>
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {tableData.map((s: any) => {
                      return (
                        <ServiceRow
                          key={s.id}
                          s={s}
                          openDrawer={openDrawer}
                          getSettingBadge={getSettingBadge}
                          settings={settings}
                          activeTab={activeTab}
                          getTypeBadgeIconOnly={getTypeBadgeIconOnly}
                          allStatuses={allStatuses}
                          handleStatusChange={handleStatusChange}
                          formatCurrency={formatCurrency}
                          StatusDropdown={StatusDropdown}
                          TruncatedText={TruncatedText}
                        />
                      );
                    })}

                    {tableData.length === 0 && (
                      <tr>
                        <td colSpan={activeTab === 'Included' ? 7 : 8} className="px-6 py-4">
                          <EmptyState
                            icon={Briefcase}
                            title="No services found"
                            subtitle="Try adjusting your filters or search term."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ),
              [
                tableData,
                activeTab,
                displayLimit,
                nameFilter,
                projectFilter,
                clientFilter,
                typeFilter,
                managerFilter,
                statusFilter,
                dateRange,
                sortCol,
                sortAsc,
                settings,
                openDrawer,
                handleSort,
                handleStatusChange,
                allNames,
                allProjects,
                allClients,
                allTypes,
                allManagers,
                allStatuses,
              ]
            )}
            {tableData.length > displayLimit && (
              <div ref={loadMoreRef} className="flex justify-center p-4 h-24 items-center">
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 50)}
                  className="text-cyan-600 hover:text-cyan-700 font-medium text-sm hover:underline transition-colors"
                >
                  Load More ({tableData.length - displayLimit} remaining)
                </button>
              </div>
            )}
          </div>

          <TableFooter
            totalItems={tableData.length}
            label="Total Services Displayed"
            rightContent={
              activeTab !== 'Included' ? (
                <span className="text-[11px] capitalize tracking-wider text-muted-foreground font-bold">
                  Combined Value:{' '}
                  <span className="text-foreground text-[13px] ml-1">
                    {formatCurrency(
                      tableData.reduce((acc, curr) => {
                        if (activeTab === 'All Services') {
                          return acc + (curr.outcome === 'Won' ? Number(curr.price) || 0 : 0);
                        }
                        return acc + (Number(curr.price) || 0);
                      }, 0)
                    )}
                  </span>
                </span>
              ) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
