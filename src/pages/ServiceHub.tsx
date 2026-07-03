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
  AlertCircle,
} from 'lucide-react';
import { TrendIndicator } from '../components/TrendIndicator';
import { PageHeader } from '../components/PageHeader';
import { useTableFilter } from '../hooks/useTableFilter';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

import { Tooltip as UITooltip } from '../components/ui/Tooltip';
import { universalExportCSV } from '../utils/exportUtils';
import { useUIStore } from '../store/useUIStore';
import {
  getSettingBadge,
  hexToRgba,
  COLOR_MAP,
  renderIcon,
  getTypeBadgeIconOnly,
} from '../utils/uiUtils';
import { updateServiceRecord, addProjectAutoLog, addAutoLog } from '../api/dbService';
import { ColumnFilter, StatusDropdown } from '../components/TableFilters';
import { MonthRangePicker } from '../components/ui/MonthRangePicker';
import { PageTabs } from '../components/ui/PageTabs';
import { ActiveFilterBar } from '../components/ui/ActiveFilterBar';
import { TableFooter } from '../components/ui/TableFooter';
import EmptyState from '../components/EmptyState';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { TruncatedText } from '../components/ui/TruncatedText';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  getFilteredServices,
  getServiceKpiData,
  getAllServiceNames,
  getAllServiceProjects,
  getAllServiceClients,
  getAllServiceTypes,
  getAllServiceManagers,
  getAllServiceStatuses,
} from '../utils/serviceUtils';
import { usePermissions } from '../hooks/usePermissions';

// --- Column Filter Popover Component ---

const ServiceRow = React.memo(
  ({
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
    TruncatedText,
    virtualRow,
    index,
  }: any) => {
    const { hasPermission } = usePermissions();
    const sDate = s.dateVal
      ? new Date(s.dateVal).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'No Date';

    return (
      <motion.tr
        variants={itemVariants}
        key={virtualRow?.index || s.id}
        className="hover:bg-slate-50 transition-colors group cursor-pointer bg-white hover:relative hover:z-[100]"
        onClick={() => openDrawer('service', s.id)}
      >
        <td className="sticky left-0 z-20 group-hover:z-[110] bg-white group-hover:bg-slate-50 transition-colors border-r-0 px-6 py-2 w-[35%] sm:w-[30%] lg:w-[25%]">
          <TruncatedText
            text={s.name || 'Unnamed Service'}
            className="font-bold text-[13px] text-foreground w-full min-w-[180px] group-hover:text-primary transition-colors"
          />
        </td>
        <td className="px-6 py-2 text-[13px] text-muted-foreground font-medium border-l-0 hidden md:table-cell max-w-0 w-[15%]">
          <TruncatedText text={s.projectName || 'No Project'} className="w-full" />
        </td>
        <td className="px-6 py-2 text-[13px] text-muted-foreground font-medium max-w-0 w-[15%]">
          <TruncatedText
            text={s.clientName || s.clients?.join(', ') || 'No Client'}
            className="w-full"
          />
        </td>
        <td className="px-6 py-2 hidden lg:table-cell">
          <div className="flex justify-center">{getTypeBadgeIconOnly(s.type, settings)}</div>
        </td>
        <td className="px-6 py-2 hidden xl:table-cell">
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
            disabled={!hasPermission('service_edit_details')}
          />
        </td>
        <td className="px-6 py-2 text-[13px] text-muted-foreground font-medium whitespace-nowrap">
          {sDate}
        </td>
        {activeTab !== 'Included' && (
          <td className="px-6 py-2 text-[13px] font-bold text-foreground text-right whitespace-nowrap">
            {formatCurrency(Number(s.price) || 0)}
          </td>
        )}
      </motion.tr>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.s === nextProps.s &&
      prevProps.activeTab === nextProps.activeTab &&
      prevProps.settings === nextProps.settings &&
      prevProps.virtualRow?.index === nextProps.virtualRow?.index
    );
  }
);

export default function ServiceHub() {
  const location = useLocation();
  const services = useAppStore((state) => state.services);
  const settings = useAppStore((state) => state.settings);
  const user = useAppStore((state) => state.user);
  const { openModal, openDrawer } = useUIStore();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const { hasPermission } = usePermissions();

  useOnClickOutside(exportMenuRef, () => setShowExportMenu(false), showExportMenu);

  // One-time migrations
  useEffect(() => {
    services.forEach((s) => {
      let needsUpdate = false;
      const updates: any = { ...s };

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
  const allNames = useMemo(() => getAllServiceNames(services), [services]);
  const allProjects = useMemo(() => getAllServiceProjects(services), [services]);
  const allClients = useMemo(() => getAllServiceClients(services), [services]);
  const allTypes = useMemo(() => getAllServiceTypes(settings), [settings]);
  const allManagers = useMemo(
    () => getAllServiceManagers(services, settings),
    [services, settings]
  );
  const allStatuses = useMemo(() => getAllServiceStatuses(settings), [settings]);

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
    return getFilteredServices(
      services,
      activeTab,
      nameFilter,
      projectFilter,
      clientFilter,
      typeFilter,
      managerFilter,
      statusFilter,
      dateRange
    );
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
    return getServiceKpiData(services);
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

  const [isScrolled, setIsScrolled] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const scrollContainer = tableScrollRef.current;
    if (!scrollContainer) return;
    const scrollTop = scrollContainer.scrollTop;

    setIsScrolled((prev) => {
      if (scrollTop > 40 && !prev) {
        if (scrollContainer.scrollHeight - scrollContainer.clientHeight > 250) {
          return true;
        }
      }
      if (scrollTop <= 10 && prev) return false;
      return prev;
    });
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: tableData.length,
    getScrollElement: () => tableScrollRef.current,
    estimateSize: () => 53,
    overscan: 30,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  const renderSortArrow = (colName: string) => {
    const isActive = sortCol === colName;
    const isDefault = colName === 'dateVal' && !sortAsc; // dateVal DESC is default

    if (isActive && !isDefault) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-primary" />;
    }
    return (
      <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover/th:opacity-50 transition-opacity" />
    );
  };

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden bg-white"
      onWheel={(e) => {
        const target = e.target as Element;
        if (
          tableScrollRef.current &&
          !tableScrollRef.current.contains(target) &&
          !target.closest('[data-radix-popper-content-wrapper]') &&
          !target.closest('[data-radix-portal]') &&
          !target.closest('[role="dialog"]')
        ) {
          tableScrollRef.current.scrollTop += e.deltaY;
        }
      }}
    >
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 shrink-0 px-4 md:px-6 pt-4 pb-2 bg-white z-30">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              Services
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Track additional services, invoices, and commissions.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap self-start md:self-auto mt-2 md:mt-0">
            {hasPermission('service_create') && (
              <button
                onClick={() => openModal('addService')}
                className="group inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] shadow-sm px-4 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <Plus className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:rotate-90" />{' '}
                <span className="shrink-0">Add Service</span>
              </button>
            )}
            {hasPermission('service_export') && (
              <div className="relative shadow-sm rounded-md" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 active:scale-95 hover:-translate-y-0.5 px-4 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <Download className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5" />{' '}
                  <span className="shrink-0">Export</span>
                  <ChevronDown className="w-3 h-3 shrink-0 opacity-70" />
                </button>
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md p-1.5 shadow-xl border border-slate-200/60 rounded-xl min-w-[220px] whitespace-nowrap z-[90]"
                    >
                      <div
                        className="group px-2 py-2 rounded-md hover:bg-primary/5 cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                        onClick={() => {
                          setShowExportMenu(false);
                          universalExportCSV('Services', services, 'All_Services');
                        }}
                      >
                        <Database className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />{' '}
                        Export All
                      </div>
                      <div
                        className="group px-2 py-2 rounded-md hover:bg-primary/5 cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary mt-0.5"
                        onClick={() => {
                          setShowExportMenu(false);
                          universalExportCSV('Services', tableData, 'Filtered_Services');
                        }}
                      >
                        <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />{' '}
                        Export Filtered View
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* KPI Section - COLLAPSIBLE ON SCROLL */}
        <div
          className={`transition-all duration-200 ease-in-out transform origin-top overflow-hidden shrink-0 ${isScrolled ? 'max-h-0 opacity-0 mb-0 scale-y-95' : 'max-h-[800px] opacity-100 mb-2 scale-y-100'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-6 py-2">
            {/* Revenue Won This Year */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-primary transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
              style={{ animationDelay: '50ms' }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-full blur-xl transition-colors duration-500"></div>
              <div className="flex justify-between items-center mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    Revenue Won This Year
                    <UITooltip content="Total value of won services this year">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </UITooltip>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </div>
              <TrendIndicator
                current={kpiData.revWonThisYear}
                previous={kpiData.revWonLastYear}
                prefix="$"
                periodText="vs last year"
              />
            </motion.div>

            {/* Revenue Won This Quarter */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-primary transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
              style={{ animationDelay: '150ms' }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-lime-500/5 group-hover:bg-lime-500/10 rounded-full blur-xl transition-colors duration-500"></div>
              <div className="flex justify-between items-center mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-lime-500/10 text-lime-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    Revenue Won This Quarter
                    <UITooltip content="Total value of won services this quarter">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </UITooltip>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </div>
              <TrendIndicator
                current={kpiData.revWonThisQuarter}
                previous={kpiData.revWonLastQuarter}
                prefix="$"
                periodText="vs last quarter"
              />
            </motion.div>

            {/* Total Services Revenue */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-primary transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
              style={{ animationDelay: '250ms' }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-full blur-xl transition-colors duration-500"></div>
              <div className="flex justify-between items-center mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    Total Services Revenue
                    <UITooltip content="Historical lifetime total of won services">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </UITooltip>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </div>
              <div className="relative z-10 mt-auto pt-2">
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {formatCurrency(kpiData.totalServicesRev)}
                </div>
              </div>
            </motion.div>

            {/* Total Commission */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-primary transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
              style={{ animationDelay: '350ms' }}
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-full blur-xl transition-colors duration-500"></div>
              <div className="flex justify-between items-center mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    Total Commission This Year
                    <UITooltip content="Value of won commissions this year">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </UITooltip>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
              </div>
              <TrendIndicator
                current={kpiData.totalCommissionThisYear}
                previous={kpiData.totalCommissionLastYear}
                prefix="$"
                periodText="vs last year"
              />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 md:px-6 lg:px-8 pb-6 relative z-20 w-full">
        <div className="flex flex-col gap-0 pb-2 pt-2 shrink-0 w-full sticky top-0 z-30 bg-white/95 backdrop-blur-md">
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
                className="w-full pl-9 pr-9 py-2 text-sm border border-input rounded-lg outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 bg-slate-50/50 hover:bg-slate-50 transition-colors h-9 shadow-sm"
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
            onScroll={handleScroll}
            onWheel={(e) => {
              const target = e.currentTarget;
              if (e.deltaY < -10 && target.scrollTop <= 10) {
                setIsScrolled(false);
              }
            }}
          >
            {useMemo(
              () => (
                <table className="w-full text-left bg-white border-separate border-spacing-0">
                  <thead className="sticky top-0 z-[80] bg-slate-50/90 backdrop-blur-md shadow-sm">
                    <tr className="bg-slate-50/95 backdrop-blur-md text-slate-500 text-[11px] font-bold tracking-wider h-[45px]">
                      <th className="w-[35%] sm:w-[30%] lg:w-[25%] group/th sticky left-0 z-[90] bg-slate-50/95 backdrop-blur-md border-b border-border border-r-0 px-6 py-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap"
                            onClick={() => handleSort('name')}
                          >
                            Service Name
                            {renderSortArrow('name')}
                          </span>
                          <ColumnFilter
                            options={allNames}
                            selected={nameFilter}
                            onChange={setNameFilter}
                            searchable
                          />
                        </div>
                      </th>
                      <th className="w-[15%] group/th px-6 py-2 border-b border-border border-l-0 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap"
                            onClick={() => handleSort('projectName')}
                          >
                            Project Name
                            {renderSortArrow('projectName')}
                          </span>
                          <ColumnFilter
                            options={allProjects}
                            selected={projectFilter}
                            onChange={setProjectFilter}
                            searchable
                          />
                        </div>
                      </th>
                      <th className="w-[15%] group/th px-6 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap"
                            onClick={() => handleSort('clientName')}
                          >
                            Client
                            {renderSortArrow('clientName')}
                          </span>
                          <ColumnFilter
                            options={allClients}
                            selected={clientFilter}
                            onChange={setClientFilter}
                            searchable
                          />
                        </div>
                      </th>
                      <th className="w-[10%] group/th px-6 py-2 border-b border-border hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap"
                            onClick={() => handleSort('type')}
                          >
                            Service Type
                            {renderSortArrow('type')}
                          </span>
                          <ColumnFilter
                            options={allTypes}
                            selected={typeFilter}
                            onChange={setTypeFilter}
                          />
                        </div>
                      </th>
                      <th className="w-[12%] group/th px-6 py-2 border-b border-border hidden xl:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap"
                            onClick={() => handleSort('manager')}
                          >
                            Manager
                            {renderSortArrow('manager')}
                          </span>
                          <ColumnFilter
                            options={allManagers}
                            selected={managerFilter}
                            onChange={setManagerFilter}
                          />
                        </div>
                      </th>
                      <th className="w-[12%] group/th px-6 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap"
                            onClick={() => handleSort('status')}
                          >
                            Fulfillment Status
                            {renderSortArrow('status')}
                          </span>
                          <ColumnFilter
                            options={allStatuses}
                            selected={statusFilter}
                            onChange={setStatusFilter}
                          />
                        </div>
                      </th>
                      <th className="w-[12%] group/th px-6 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap"
                            onClick={() => handleSort('dateVal')}
                          >
                            Completion Date
                            {renderSortArrow('dateVal')}
                          </span>
                          <MonthRangePicker dateRange={dateRange} setDateRange={setDateRange} />
                        </div>
                      </th>
                      {activeTab !== 'Included' && (
                        <>
                          <th
                            className="w-[10%] group/th px-6 py-2 border-b border-border cursor-pointer hover:text-primary transition-colors text-right"
                            onClick={() => handleSort('price')}
                          >
                            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                              {renderSortArrow('price')}
                              Invoice Value
                            </div>
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-border text-sm relative"
                  >
                    {paddingTop > 0 && (
                      <tr>
                        <td
                          colSpan={activeTab === 'Included' ? 7 : 8}
                          style={{ height: paddingTop, border: 0, padding: 0 }}
                        />
                      </tr>
                    )}
                    {virtualItems.map((virtualRow) => {
                      const s = tableData[virtualRow.index];
                      if (!s) return null;
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
                          virtualRow={virtualRow}
                        />
                      );
                    })}

                    {paddingBottom > 0 && (
                      <tr>
                        <td
                          colSpan={activeTab === 'Included' ? 7 : 8}
                          style={{ height: paddingBottom, border: 0, padding: 0 }}
                        />
                      </tr>
                    )}
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
                  </motion.tbody>
                </table>
              ),
              [
                tableData,
                virtualItems,
                paddingTop,
                paddingBottom,
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
