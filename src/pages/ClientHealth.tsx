import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useUI } from '../context/UIContext';
import { useLocation } from 'react-router-dom';
import { getHealthBadge, getSettingBadge, getSafeHex, hexToRgba } from '../utils/uiUtils';
import { universalExportCSV } from '../utils/exportUtils';
import { PageHeader } from '../components/PageHeader';
import { TrendIndicator } from '../components/TrendIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip as UITooltip } from '../components/ui/Tooltip';
import {
  Users,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ChevronRight,
  Filter,
  Search,
  Minus,
  Download,
  Plus,
  ArrowRight,
  X,
  Database,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { getHealthHistory, updateClientRecord } from '../api/dbService';
import { ColumnFilter } from '../components/TableFilters';
import { PageTabs } from '../components/ui/PageTabs';
import { ActiveFilterBar } from '../components/ui/ActiveFilterBar';
import { TableFooter } from '../components/ui/TableFooter';
import { Select } from '../components/ui/Select';
import { toast } from '../utils/toast';
import EmptyState from '../components/EmptyState';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { TruncatedText } from '../components/ui/TruncatedText';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useVirtualizer } from '@tanstack/react-virtual';

type SortCol = 'companyName' | 'type' | 'healthScore' | 'projectCount' | 'manager' | 'trend';

// --- Sparkline Component ---
const Sparkline = React.memo(({ data }: { data: number[] }) => {
  if (!data || data.length < 2) return <div className="w-[60px] h-[24px]" />;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const startVal = data[0];
  const endVal = data[data.length - 1];
  let strokeColor = '#94a3b8'; // gray for no change
  if (endVal > startVal)
    strokeColor = '#10b981'; // green for increase
  else if (endVal < startVal) strokeColor = '#ef4444'; // red for decrease

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

export default function ClientHealth() {
  const clients = useAppStore(state => state.clients);
  const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);
  const { openDrawer, openModal } = useUI();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(exportMenuRef, () => setShowExportMenu(false), showExportMenu);

  const [globalSearch, setGlobalSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const delay = setTimeout(() => {
      setGlobalSearch(searchInput);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchInput]);

  const location = useLocation();
  const [healthHistory, setHealthHistory] = useState<any>({});
  


  
const ClientRow = React.memo(({
  c,
  index,
  openDrawer,
  getSettingBadge,
  settings,
  getHealthBadge,
  activeHex,
  onboardingHex,
  
  hexToRgba,
  StopProp,
  Sparkline
}: any) => {
  return (
    <tr
                          key={c.clientId}
                          data-index={index}
                          className="hover:bg-slate-50 transition-colors cursor-pointer group bg-white hover:relative hover:z-[100]"
                          onClick={() => openDrawer('client', c.clientId)} // default to overview
                        >
                          <td className="sticky left-0 z-20 group-hover:z-[110] bg-white group-hover:bg-slate-50 transition-colors px-6 py-2 font-semibold text-slate-800 border-r-0">
                            <TruncatedText
                              text={c.companyName || 'Unnamed Client'}
                              className="w-full group-hover:text-primary transition-colors"
                            />
                          </td>
                          <td className="px-6 py-2 text-muted-foreground border-l-0 hidden md:table-cell">
                            {(c as any).clientType ? (
                              getSettingBadge('clientTypes', (c as any).clientType, settings)
                            ) : (
                              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td
                            className="px-6 py-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrawer('client', c.clientId, { targetTab: 'health' });
                            }}
                          >
                            <div className="flex items-center gap-4 cursor-pointer group/trend p-1 -m-1 rounded hover:bg-slate-100 transition-colors">
                              {getHealthBadge(c.healthScore, settings)}
                              <div className="opacity-80 group-hover/trend:opacity-100 transition-opacity">
                                <Sparkline data={c.trendData} />
                              </div>
                            </div>
                          </td>
                          <td
                            className="px-6 py-2 relative group/projects hidden sm:table-cell"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrawer('client', c.clientId, { targetTab: 'projects' });
                            }}
                          >
                            <div className="flex items-center gap-2 p-1 -m-1 rounded hover:bg-slate-50 transition-colors w-fit cursor-pointer">
                              <div
                                style={
                                  c.activeProjectsCount > 0
                                    ? {
                                        backgroundColor: hexToRgba(activeHex, 0.1),
                                        color: activeHex,
                                        borderColor: hexToRgba(activeHex, 0.3),
                                      }
                                    : undefined
                                }
                                className={`group/active relative flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                                  c.activeProjectsCount > 0
                                    ? 'shadow-sm'
                                    : 'bg-slate-50 text-slate-400 border-transparent'
                                }`}
                              >
                                <div
                                  style={
                                    c.activeProjectsCount > 0
                                      ? { backgroundColor: activeHex }
                                      : undefined
                                  }
                                  className={`w-1.5 h-1.5 rounded-full ${c.activeProjectsCount > 0 ? '' : 'bg-slate-300'}`}
                                />
                                {c.activeProjectsCount}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-100 text-slate-800 border border-slate-200 shadow-lg text-sm px-3 py-2 rounded-md whitespace-nowrap z-[100] pointer-events-none font-medium opacity-0 group-hover/active:opacity-100 transition-opacity">
                                  Active Projects
                                </div>
                              </div>

                              <div
                                style={
                                  c.onboardingProjectsCount > 0
                                    ? {
                                        backgroundColor: hexToRgba(onboardingHex, 0.1),
                                        color: onboardingHex,
                                        borderColor: hexToRgba(onboardingHex, 0.3),
                                      }
                                    : undefined
                                }
                                className={`group/onboarding relative flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                                  c.onboardingProjectsCount > 0
                                    ? 'shadow-sm'
                                    : 'bg-slate-50 text-slate-400 border-transparent'
                                }`}
                              >
                                <div
                                  style={
                                    c.onboardingProjectsCount > 0
                                      ? { backgroundColor: onboardingHex }
                                      : undefined
                                  }
                                  className={`w-1.5 h-1.5 rounded-full ${c.onboardingProjectsCount > 0 ? '' : 'bg-slate-300'}`}
                                />
                                {c.onboardingProjectsCount}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-100 text-slate-800 border border-slate-200 shadow-lg text-sm px-3 py-2 rounded-md whitespace-nowrap z-[100] pointer-events-none font-medium opacity-0 group-hover/onboarding:opacity-100 transition-opacity">
                                  Onboarding Projects
                                </div>
                              </div>

                              <div
                                style={
                                  c.closedProjectsCount > 0
                                    ? {
                                        backgroundColor: hexToRgba(closedHex, 0.1),
                                        color: closedHex,
                                        borderColor: hexToRgba(closedHex, 0.3),
                                      }
                                    : undefined
                                }
                                className={`group/closed relative flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                                  c.closedProjectsCount > 0
                                    ? 'shadow-sm'
                                    : 'bg-slate-50 text-slate-400 border-transparent'
                                }`}
                              >
                                <div
                                  style={
                                    c.closedProjectsCount > 0
                                      ? { backgroundColor: closedHex }
                                      : undefined
                                  }
                                  className={`w-1.5 h-1.5 rounded-full ${c.closedProjectsCount > 0 ? '' : 'bg-slate-300'}`}
                                />
                                {c.closedProjectsCount}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-100 text-slate-800 border border-slate-200 shadow-lg text-sm px-3 py-2 rounded-md whitespace-nowrap z-[100] pointer-events-none font-medium opacity-0 group-hover/closed:opacity-100 transition-opacity">
                                  Closed Projects
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            className="px-6 py-2 text-muted-foreground hidden lg:table-cell"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-block relative">
                              <Select
                                value={c.accountManager || 'Unassigned'}
                                options={(settings?.managers?.map((m: any) => m.name) || []).map(
                                  (m: any) => ({
                                    label: getSettingBadge('managers', m, settings),
                                    value: m,
                                  })
                                )}
                                onChange={(val) => handleUpdateManager(c.clientId, val)}
                                hideCheckmark={true}
                                trigger={
                                  <div className="cursor-pointer hover:-translate-y-0.5 hover:shadow-sm transition-all rounded-full inline-block">
                                    {getSettingBadge('managers', c.accountManager, settings)}
                                  </div>
                                }
                              />
                            </div>
                          </td>
                        </tr>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.c === nextProps.c &&
      prevProps.index === nextProps.index &&
      prevProps.activeHex === nextProps.activeHex &&
      prevProps.onboardingHex === nextProps.onboardingHex &&
      prevProps.settings === nextProps.settings
    );
  }
);


  // Mapping routing state to local tabs
  const getInitialTab = () => {
    if (location.state?.kpiFilter) {
      switch (location.state.kpiFilter) {
        case 'healthy':
          return 'Healthy';
        case 'warning':
          return 'Warning';
        case 'risk':
          return 'At Risk';
        case 'active':
          return 'Active';
        default:
          return 'All Clients';
      }
    }
    return 'All Clients';
  };

  const [activeTab, setActiveTab] = useState<
    'All Clients' | 'Active' | 'Healthy' | 'Warning' | 'At Risk'
  >(getInitialTab());

  // Column Filters
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [healthFilter, setHealthFilter] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState<string[]>([]);
  const [managerFilter, setManagerFilter] = useState<string[]>([]);

  // Sorting
  const [sortCol, setSortCol] = useState<SortCol>('healthScore');
  const [sortAsc, setSortAsc] = useState(true); // Default ascending (lowest score at top)

  useEffect(() => {
    getHealthHistory()
      .then((data) => {
        setHealthHistory(data);
      })
      .catch((err) => {
        console.error('Failed to load history', err);
      });
  }, []);

  const handleUpdateManager = useCallback(
    async (clientId: string, managerName: string) => {
      const client = clients.find((c) => c.clientId === clientId);
      if (!client) return;
      try {
        const oldManager = client.accountManager || 'Unassigned';
        await updateClientRecord(
          { ...client, accountManager: managerName },
          { silent: true },
          `Manager changed from ${oldManager} to ${managerName || 'Unassigned'}`
        );
        toast.success(`Updated manager for ${client.companyName}`);
      } catch (err) {
        toast.error('Failed to update manager');
      }
    },
    [clients]
  );

  const activeFilterCount =
    nameFilter.length +
    typeFilter.length +
    healthFilter.length +
    projectFilter.length +
    managerFilter.length;

  const removeFilterItem = (filterSetter: any, filterArray: string[], item: string) => {
    filterSetter(filterArray.filter((i: string) => i !== item));
  };

  const clearAllFilters = () => {
    setNameFilter([]);
    setTypeFilter([]);
    setHealthFilter([]);
    setProjectFilter([]);
    setManagerFilter([]);
  };

  // Filter Options
  const allCompanyNames = useMemo(
    () => Array.from(new Set(clients.map((c) => c.companyName || 'Unnamed'))).sort(),
    [clients]
  );
  const allTypes = useMemo(() => {
    const types = new Set<string>();
    clients?.forEach((c) => {
      if ((c as any).clientType) types.add((c as any).clientType);
    });
    const typeOrder = settings?.clientTypes?.map((t) => t.name) || [];
    return Array.from(types).sort((a, b) => {
      const idxA = typeOrder.indexOf(a);
      const idxB = typeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [clients, settings]);
  const allManagers = useMemo(() => {
    const managers = new Set<string>();
    clients?.forEach((c) => {
      if (c.accountManager) managers.add(c.accountManager);
    });
    const managerOrder = settings?.managers?.map((m) => m.name) || [];
    return Array.from(managers).sort((a, b) => {
      const idxA = managerOrder.indexOf(a);
      const idxB = managerOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [clients, settings]);



  // Calculate Client Enhancements
  const enhancedClients = useMemo(() => {
    const thirtyDaysAgo = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    return clients.map((c) => {
      const cProjects = projects.filter((p) => (p.clients || []).includes(c.companyName || ''));
      const activeProjectsCount = cProjects.filter(
        (p) => p.projectStatus === 'Active' || p.projectStatus === 'Suspended'
      ).length;
      const onboardingProjectsCount = cProjects.filter(
        (p) => p.projectStatus === 'Onboarding'
      ).length;
      const closedProjectsCount = cProjects.filter(
        (p) => p.projectStatus === 'Closed' || p.projectStatus === 'Completed'
      ).length;

      // Extract last 30 days of history for sparkline
      const hist = healthHistory[c.clientId] || [];
      // Sort ascending by timeVal to render left-to-right
      const sortedHist = [...hist]
        .filter((x: any) => x.timeVal >= thirtyDaysAgo)
        .sort((a: any, b: any) => a.timeVal - b.timeVal);

      // Collect score values for the sparkline
      const trendData = sortedHist.map((h: any) => h.score);
      // Append the current score to the end of the line
      if (typeof c.healthScore === 'number') {
        trendData.push(c.healthScore);
      }
      if (trendData.length === 1 && typeof c.healthScore === 'number') {
        trendData.unshift(c.healthScore);
      }

      return {
        ...c,
        cProjects,
        activeProjectsCount,
        onboardingProjectsCount,
        closedProjectsCount,
        trendData,
      };
    });
  }, [clients, projects, healthHistory]);

  // Calculate Top KPIs on Unfiltered array
  const kpis = useMemo(() => {
    const thresholds = settings?.scoring?.thresholds || { healthy: 80, warning: 50 };
    let atRisk = 0,
      warning = 0,
      healthy = 0,
      active = 0;
    let prevAtRisk = 0,
      prevWarning = 0,
      prevHealthy = 0,
      prevActive = 0;
    const thirtyDaysAgo = new Date().getTime() - 30 * 86400000;

    enhancedClients.forEach((c) => {
      if (c.activeProjectsCount > 0) {
        active++;
      }

      let clientWasActive = false;
      for (const p of c.cProjects) {
        const hist = p.history || [];
        const olderThan30 = hist
          .filter((x: any) => x.timeVal <= thirtyDaysAgo)
          .sort((a: any, b: any) => b.timeVal - a.timeVal);
        if (olderThan30.length > 0) {
          const snap = olderThan30[0];
          if (snap.status === 'Active' || snap.status === 'Suspended') {
            clientWasActive = true;
            break;
          }
        } else {
          if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') {
            if (p.releaseDateVal && p.releaseDateVal <= thirtyDaysAgo) {
              clientWasActive = true;
              break;
            }
          }
        }
      }
      if (clientWasActive) prevActive++;

      if (typeof c.healthScore === 'number') {
        if (c.healthScore >= thresholds.healthy) healthy++;
        else if (c.healthScore >= thresholds.warning) warning++;
        else atRisk++;

        const hist = healthHistory[c.clientId] || [];
        const olderThan30 = hist
          .filter((x: any) => x.timeVal <= thirtyDaysAgo)
          .sort((a: any, b: any) => b.timeVal - a.timeVal);
        let pastScore = c.healthScore;

        if (olderThan30.length > 0) {
          pastScore = olderThan30[0].score;
        } else if (hist.length > 0) {
          // Fall back to the earliest data point we have if history is < 30 days
          const earliest = [...hist].sort((a: any, b: any) => a.timeVal - b.timeVal);
          pastScore = earliest[0].score;
        }

        if (pastScore >= thresholds.healthy) prevHealthy++;
        else if (pastScore >= thresholds.warning) prevWarning++;
        else prevAtRisk++;
      }
    });

    return {
      atRisk,
      warning,
      healthy,
      active,
      prevAtRisk,
      prevWarning,
      prevHealthy,
      prevActive,
    };
  }, [enhancedClients, settings, healthHistory]);

  // Apply Filters
  const filteredClients = useMemo(() => {
    const thresholds = settings?.scoring?.thresholds || { healthy: 80, warning: 50 };

    return enhancedClients.filter((c) => {
      // Global Search Filter
      if (globalSearch) {
        const term = globalSearch.toLowerCase();
        const matchesName = c.companyName?.toLowerCase().includes(term);
        const matchesType = ((c as any).clientType || '').toLowerCase().includes(term);
        const matchesManager = (c.accountManager || '').toLowerCase().includes(term);
        if (!matchesName && !matchesType && !matchesManager) return false;
      }

      // Tab Filter
      const score = c.healthScore;
      const isHealthy = typeof score === 'number' && score >= thresholds.healthy;
      const isWarning =
        typeof score === 'number' && score >= thresholds.warning && score < thresholds.healthy;
      const isAtRisk = typeof score === 'number' && score < thresholds.warning;

      if (activeTab === 'Active' && c.activeProjectsCount === 0) return false;
      if (activeTab === 'Healthy' && !isHealthy) return false;
      if (activeTab === 'Warning' && !isWarning) return false;
      if (activeTab === 'At Risk' && !isAtRisk) return false;

      // Column Multi-select Filters (OR within column, AND across columns)
      if (nameFilter.length > 0 && !nameFilter.includes(c.companyName || 'Unnamed')) return false;

      const cType = (c as any).clientType || 'Unassigned';
      if (typeFilter.length > 0 && !typeFilter.includes(cType)) return false;

      const cManager = c.accountManager || 'Unassigned';
      if (managerFilter.length > 0 && !managerFilter.includes(cManager)) return false;

      if (healthFilter.length > 0) {
        const score = c.healthScore;
        const isHealthy = typeof score === 'number' && score >= thresholds.healthy;
        const isWarning =
          typeof score === 'number' && score >= thresholds.warning && score < thresholds.healthy;
        const isAtRisk = typeof score === 'number' && score < thresholds.warning;

        const matchesHealth = healthFilter.some((hf) => {
          if (hf === 'Healthy') return isHealthy;
          if (hf === 'Warning') return isWarning;
          if (hf === 'At Risk') return isAtRisk;
          return false;
        });
        if (!matchesHealth) return false;
      }

      if (projectFilter.length > 0) {
        const hasActive = c.activeProjectsCount > 0;
        const hasOnboarding = c.onboardingProjectsCount > 0;
        const hasClosed = c.closedProjectsCount > 0;

        const matchesProjectFilter = projectFilter.some((pf) => {
          if (pf === 'Active') return hasActive;
          if (pf === 'Onboarding') return hasOnboarding;
          if (pf === 'Closed') return hasClosed;
          return false;
        });
        if (!matchesProjectFilter) return false;
      }

      return true;
    });
  }, [
    enhancedClients,
    nameFilter,
    typeFilter,
    healthFilter,
    managerFilter,
    projectFilter,
    settings,
    activeTab,
    globalSearch,
  ]);

  // Sorting
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortCol === 'companyName') {
        valA = (a.companyName || '').toLowerCase();
        valB = (b.companyName || '').toLowerCase();
      } else if (sortCol === 'type') {
        valA = ((a as any).clientType || '').toLowerCase();
        valB = ((b as any).clientType || '').toLowerCase();
      } else if (sortCol === 'healthScore') {
        valA = typeof a.healthScore === 'number' ? a.healthScore : 999; // Push N/A to bottom
        valB = typeof b.healthScore === 'number' ? b.healthScore : 999;
      } else if (sortCol === 'projectCount') {
        valA = a.activeProjectsCount || 0;
        valB = b.activeProjectsCount || 0;
      } else if (sortCol === 'manager') {
        valA = (a.accountManager || '').toLowerCase();
        valB = (b.accountManager || '').toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      // Secondary tie-breaker by companyName
      const nameA = (a.companyName || '').toLowerCase();
      const nameB = (b.companyName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [filteredClients, sortCol, sortAsc]);

  const handleSort = useCallback(
    (col: SortCol) => {
      if (sortCol === col) {
        if (sortAsc) {
          setSortAsc(false); // Go DESC
        } else {
          // Go DEFAULT
          setSortCol('healthScore');
          setSortAsc(true);
        }
      } else {
        setSortCol(col);
        setSortAsc(true); // new column default is ascending
      }
    },
    [sortCol, sortAsc]
  );

  const [isScrolled, setIsScrolled] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const scrollContainer = tableScrollRef.current;
    if (!scrollContainer) return;
    const scrollTop = scrollContainer.scrollTop;

    setIsScrolled(prev => {
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
    count: sortedClients.length,
    getScrollElement: () => tableScrollRef.current,
    estimateSize: () => 53,
    overscan: 30,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end : 0;

  const activeStatus = settings?.statuses?.find((s: any) => s.name === 'Active');
  const onboardingStatus = settings?.statuses?.find((s: any) => s.name === 'Onboarding');
  const closedStatus = settings?.statuses?.find((s: any) => s.name === 'Closed');

  const activeHex = getSafeHex(activeStatus?.color, 'emerald');
  const onboardingHex = getSafeHex(onboardingStatus?.color, 'blue');
  const closedHex = getSafeHex(closedStatus?.color, 'slate');

  const renderSortArrow = (colName: string) => {
    const isActive = sortCol === colName;
    const isDefault = colName === 'healthScore' && sortAsc === true; // healthScore ASC is default

    if (isActive && !isDefault) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-primary" />;
    }
    return <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover/th:opacity-50 transition-opacity" />;
  };

  return (
    <div className="flex h-full flex-col min-h-0 bg-white relative overflow-hidden"
      onWheel={(e) => {
        if (tableScrollRef.current && !tableScrollRef.current.contains(e.target as Node)) {
          tableScrollRef.current.scrollTop += e.deltaY;
        }
      }}
    >
      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 shrink-0 px-4 md:px-6 pt-4 pb-2 bg-white z-40">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              Clients
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Live overview of client sentiment, billing, and system usage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto mt-2 md:mt-0">
            <button
              onClick={() => openModal('addClient')}
              className="group inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] shadow-sm px-4 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <Plus className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:rotate-90" />
              <span>Add Client</span>
            </button>
            <div className="relative shadow-sm rounded-md" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="group inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 active:scale-95 hover:-translate-y-0.5 px-4 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <Download className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 shrink-0 opacity-70" />
              </button>
              <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md p-1.5 shadow-xl border border-slate-200/60 rounded-xl min-w-[220px] whitespace-nowrap z-[90]"
                >
                  <div
                    className="group px-2 py-2 rounded-md hover:bg-primary/5 cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => {
                      setShowExportMenu(false);
                      universalExportCSV('Clients', clients, 'All_Clients');
                    }}
                  >
                    <Database className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> Export All
                  </div>
                  <div
                    className="group px-2 py-2 rounded-md hover:bg-primary/5 cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary mt-0.5"
                    onClick={() => {
                      setShowExportMenu(false);
                      universalExportCSV('Clients', sortedClients, 'Filtered_Clients');
                    }}
                  >
                    <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> Export Filtered View
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* KPI CARDS - COLLAPSIBLE ON SCROLL */}
        <div
          className={`transition-all duration-200 ease-in-out transform origin-top overflow-hidden shrink-0 ${isScrolled ? 'max-h-0 opacity-0 mb-0 scale-y-95' : 'max-h-[800px] opacity-100 mb-2 scale-y-100'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-6 py-2">
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => setActiveTab('At Risk')}
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-primary transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '50ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors duration-500"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-red-500/10 text-red-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  At Risk
                  <UITooltip content={`Health score under ${settings?.scoring?.thresholds?.warning || 50}`}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </UITooltip>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </div>
            <TrendIndicator current={kpis.atRisk} previous={kpis.prevAtRisk} inverted={true} />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => setActiveTab('Warning')}
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-primary transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '150ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-colors duration-500"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-orange-500/10 text-orange-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  Warning
                  <UITooltip content={`Health score between ${settings?.scoring?.thresholds?.warning || 50} and ${settings?.scoring?.thresholds?.healthy || 80}`}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </UITooltip>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </div>
            <TrendIndicator current={kpis.warning} previous={kpis.prevWarning} inverted={true} />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => setActiveTab('Healthy')}
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-primary transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '250ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  Healthy
                  <UITooltip content={`Health score over ${settings?.scoring?.thresholds?.healthy || 80}`}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </UITooltip>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </div>
            <TrendIndicator current={kpis.healthy} previous={kpis.prevHealthy} />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => setActiveTab('Active')}
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-primary transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '350ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  Active Clients
                  <UITooltip content="Clients with active projects">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </UITooltip>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </div>
            <TrendIndicator current={kpis.active} previous={kpis.prevActive} />
          </motion.div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 md:px-6 lg:px-8 pb-6 relative z-20 w-full">
        <div className="flex flex-col gap-0 pb-2 pt-2 shrink-0 w-full sticky top-0 z-30 bg-white/95 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative">
            <PageTabs
              tabs={[
                { label: 'All Clients', icon: Users },
                { label: 'Active', icon: Activity },
                { label: 'Healthy', icon: CheckCircle2 },
                { label: 'Warning', icon: AlertTriangle },
                { label: 'At Risk', icon: AlertCircle },
              ]}
              activeTab={activeTab}
              onTabChange={(t) => setActiveTab(t as any)}
            />

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full pl-9 pr-9 py-2 text-sm border border-input rounded-lg outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 bg-slate-50/50 hover:bg-slate-50 transition-colors h-9 shadow-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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

          {activeFilterCount > 0 && (
            <ActiveFilterBar
              filters={[
                {
                  label: 'Company',
                  values: nameFilter,
                  onRemove: (v) => removeFilterItem(setNameFilter, nameFilter, v),
                },
                {
                  label: 'Type',
                  values: typeFilter,
                  onRemove: (v) => removeFilterItem(setTypeFilter, typeFilter, v),
                },
                {
                  label: 'Health',
                  values: healthFilter,
                  onRemove: (v) => removeFilterItem(setHealthFilter, healthFilter, v),
                },
                {
                  label: 'Projects',
                  values: projectFilter,
                  onRemove: (v) => removeFilterItem(setProjectFilter, projectFilter, v),
                },
                {
                  label: 'Manager',
                  values: managerFilter,
                  onRemove: (v) => removeFilterItem(setManagerFilter, managerFilter, v),
                },
              ]}
              onClearAll={clearAllFilters}
            />
          )}
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
                <table className="w-full text-left bg-white border-separate border-spacing-0">
                  <thead className="sticky top-0 z-[80] bg-white/90 backdrop-blur-md shadow-sm">
                    <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold tracking-wider h-[45px]">
                      <th className="w-[30%] sticky left-0 z-[90] bg-slate-50/90 backdrop-blur-md border-b border-border px-6 py-2 border-r-0 group/th">
                        <div className="flex items-center">
                          <div
                            className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors whitespace-nowrap mr-2"
                            onClick={() => handleSort('companyName')}
                          >
                            Client Name
                            {renderSortArrow('companyName')}
                          </div>
                          <ColumnFilter
                            options={allCompanyNames}
                            selected={nameFilter}
                            onChange={setNameFilter}
                            searchable={true}
                          />
                        </div>
                      </th>
                      <th className="w-[15%] border-b border-border px-6 py-2 hidden md:table-cell group/th">
                        <div className="flex items-center">
                          <div
                            className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleSort('type')}
                          >
                            Type
                            {renderSortArrow('type')}
                          </div>
                          <ColumnFilter
                            options={allTypes}
                            selected={typeFilter}
                            onChange={setTypeFilter}
                          />
                        </div>
                      </th>
                      <th className="w-[20%] border-b border-border px-6 py-2 group/th">
                        <div className="flex items-center">
                          <div
                            className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleSort('healthScore')}
                          >
                            Health
                            {renderSortArrow('healthScore')}
                          </div>
                          <ColumnFilter
                            options={['Healthy', 'Warning', 'At Risk']}
                            selected={healthFilter}
                            onChange={setHealthFilter}
                          />
                        </div>
                      </th>
                      <th className="w-[20%] border-b border-border px-6 py-2 hidden sm:table-cell group/th">
                        <div className="flex items-center">
                          <div
                            className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleSort('projectCount')}
                          >
                            Projects
                            {renderSortArrow('projectCount')}
                          </div>
                          <ColumnFilter
                            options={['Active', 'Onboarding', 'Closed']}
                            selected={projectFilter}
                            onChange={setProjectFilter}
                          />
                        </div>
                      </th>
                      <th className="w-[15%] border-b border-border px-6 py-2 hidden lg:table-cell group/th">
                        <div className="flex items-center">
                          <div
                            className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleSort('manager')}
                          >
                            Manager
                            {renderSortArrow('manager')}
                          </div>
                          <ColumnFilter
                            options={allManagers}
                            selected={managerFilter}
                            onChange={setManagerFilter}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm relative">
                    {paddingTop > 0 && (
                      <tr>
                        <td colSpan={5} style={{ height: paddingTop, border: 0, padding: 0 }} />
                      </tr>
                    )}
                    {virtualItems.map((virtualRow) => {
                      const c = sortedClients[virtualRow.index] as any;
                      if (!c) return null;
                      return (
                        <ClientRow
                          key={c.clientId}
                          c={c}
                          index={virtualRow.index}
                          openDrawer={openDrawer}
                          getSettingBadge={getSettingBadge}
                          settings={settings}
                          getHealthBadge={getHealthBadge}
                          activeHex={activeHex}
                          onboardingHex={onboardingHex}
                          
                          hexToRgba={hexToRgba}
                          Sparkline={Sparkline}
                        />
                      );
                    })}

                    {paddingBottom > 0 && (
                      <tr>
                        <td colSpan={5} style={{ height: paddingBottom, border: 0, padding: 0 }} />
                      </tr>
                    )}
                    {sortedClients.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4">
                          <EmptyState
                            icon={Users}
                            title="No clients found"
                            subtitle="Try adjusting your filters or search term."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
          </div>

          <TableFooter totalItems={sortedClients.length} label="Total Clients Displayed" />
        </div>
      </div>
    </div>
  );
}
