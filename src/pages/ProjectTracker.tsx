import React, {
  startTransition,
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useDeferredValue,
} from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUrlState } from '../hooks/useUrlState';
import { useAppStore } from '../store/useAppStore';
import { ColumnFilter, DateFilter, StatusDropdown } from '../components/TableFilters';
import { PageTabs } from '../components/ui/PageTabs';
import { ActiveFilterBar } from '../components/ui/ActiveFilterBar';
import { TableFooter } from '../components/ui/TableFooter';
import { TrendIndicator } from '../components/TrendIndicator';
import { calculateProjectHealth } from '../utils/scoringUtils';
import { getHealthBadge, getSettingBadge } from '../utils/uiUtils';
import { useUI } from '../context/UIContext';
import { Tooltip as UITooltip } from '../components/ui/Tooltip';
import { universalExportCSV } from '../utils/exportUtils';
import {
  Download,
  Database,
  Filter,
  Target,
  AlertOctagon,
  Building,
  Zap,
  Calendar,
  Plus,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Search,
  PlayCircle,
  PauseCircle,
  ListTodo,
  List,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getHealthHistory } from '../api/dbService';
import { ProjectTrackerTable } from '../components/ProjectTracker/ProjectTrackerTable';
import { ProjectTrackerCalendar } from '../components/ProjectTracker/ProjectTrackerCalendar';
import { BulkActionBar } from '../components/ProjectTracker/BulkActionBar';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { updateProjectRecord, addProjectAutoLog, addAutoLog } from '../api/dbService';
import toast from 'react-hot-toast';

export default function ProjectTracker() {
  const location = useLocation();
  const projects = useAppStore((state) => state.projects);
  const settings = useAppStore((state) => state.settings);
  const user = useAppStore((state) => state.user);
  const { openModal, openDrawer } = useUI();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(exportMenuRef, () => setShowExportMenu(false), showExportMenu);

  const { data: healthHistory = {} } = useQuery({
    queryKey: ['healthHistory'],
    queryFn: () => getHealthHistory(),
  });

  const [activeTab, setActiveTab] = useState<string>(
    location.state?.ptTab || 'Actively Onboarding'
  );
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(searchTerm);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // sorting
  const [sortCol, setSortCol] = useState<string>(() => {
    if (location.state?.ptTab === 'No Due Date' || location.state?.ptTab === 'Suspended')
      return 'name';
    return 'releaseDateVal';
  });
  const [sortAsc, setSortAsc] = useState<boolean>(() => {
    if (location.state?.ptTab === 'All Released' || location.state?.ptTab === 'All Projects')
      return false;
    return true;
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>(() => {
    if (location.state?.statusFilter) return [location.state.statusFilter];
    if (location.state?.kpiFilter === 'units') return ['Active', 'Suspended'];
    if (location.state?.kpiFilter === 'onboarding') return ['Onboarding'];
    return [];
  });
  const [healthFilter, setHealthFilter] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [clientFilter, setClientFilter] = useState<string[]>([]);
  const [managerFilter, setManagerFilter] = useState<string[]>(() => {
    return location.state?.managerFilter ? [location.state.managerFilter] : [];
  });
  const [timelineFilter, setTimelineFilter] = useState<string[]>(() => {
    return location.state?.timelineFilter ? [location.state.timelineFilter] : [];
  });
  const [phaseFilter, setPhaseFilter] = useState<string[]>(() => {
    return location.state?.phaseFilter ? [location.state.phaseFilter] : [];
  });
  const [featuresFilter, setFeaturesFilter] = useState<string[]>(() => {
    return location.state?.featuresFilter ? [location.state.featuresFilter] : [];
  });
  const [releaseDateFilter, setReleaseDateFilter] = useState<
    { start: string; end: string } | 'no-date' | null
  >(null);

  const removeFilterItem = (filterSetter: any, filterArray: string[], item: string) => {
    filterSetter(filterArray.filter((i: string) => i !== item));
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
    setHealthFilter([]);
    setNameFilter([]);
    setClientFilter([]);
    setManagerFilter([]);
    setTimelineFilter([]);
    setPhaseFilter([]);
    setFeaturesFilter([]);
    setReleaseDateFilter(null);
    setSearchTerm('');
  };

  const setPtFilter = (tabLabel: string) => {
    startTransition(() => {
      setActiveTab(tabLabel);
    });

    if (
      tabLabel === 'Actively Onboarding' ||
      tabLabel === 'Upcoming (> 45 Days)' ||
      tabLabel === 'All Onboarding'
    ) {
      setSortCol('releaseDateVal');
      setSortAsc(true);
    } else if (tabLabel === 'All Released') {
      setSortCol('releaseDateVal');
      setSortAsc(false);
    } else if (tabLabel === 'All Projects') {
      setSortCol('releaseDateVal');
      setSortAsc(false);
    } else if (tabLabel === 'No Due Date' || tabLabel === 'Suspended') {
      setSortCol('name');
      setSortAsc(true);
    }
  };

  const getDefaultSort = useCallback((tab: string) => {
    if (tab === 'No Due Date' || tab === 'Suspended') return { col: 'name', asc: true };
    if (tab === 'All Released' || tab === 'All Projects')
      return { col: 'releaseDateVal', asc: false };
    return { col: 'releaseDateVal', asc: true };
  }, []);

  const handleSort = useCallback(
    (col: string) => {
      const defSort = getDefaultSort(activeTab);

      if (sortCol === col) {
        if (col === defSort.col) {
          // If clicking the default column, just endlessly toggle ASC/DESC
          setSortAsc(!sortAsc);
        } else {
          // For a custom column: ASC -> DESC -> DEFAULT
          if (sortAsc) {
            setSortAsc(false); // Go DESC
          } else {
            // Go back to DEFAULT
            setSortCol(defSort.col);
            setSortAsc(defSort.asc);
          }
        }
      } else {
        // First click on a new column: sort ASC
        setSortCol(col);
        setSortAsc(true);
      }
    },
    [sortCol, sortAsc, activeTab, getDefaultSort]
  );

  // 1. Pre-calculate Health Scores and Trend Data
  const mappedProjects = useMemo(() => {
    const today = new Date().getTime();
    const thirtyDaysAgo = today - 30 * 24 * 60 * 60 * 1000;

    return projects.map((p) => {
      const healthCalc = calculateProjectHealth(p, settings);
      const finalScore = healthCalc.totalScore;

      const hist = healthHistory[p.id] || [];
      const sortedHist = [...hist]
        .filter((x: any) => x.timeVal >= thirtyDaysAgo)
        .sort((a: any, b: any) => a.timeVal - b.timeVal);
      const trendData = sortedHist.map((h: any) => h.score);
      if (typeof finalScore === 'number') trendData.push(finalScore);
      if (trendData.length === 1 && typeof finalScore === 'number') trendData.unshift(finalScore);
      return { ...p, healthScore: finalScore, trendData };
    });
  }, [projects, settings, healthHistory]);

  // 2. KPI Calculations
  const {
    onboardingCount,
    prevOnboardingCount,
    pipelineCount,
    prevPipelineCount,
    riskCount,
    prevRiskCount,
    liveUnits,
    prevLiveUnits,
  } = useMemo(() => {
    let ob = 0,
      prevOb = 0;
    let pipe = 0,
      prevPipe = 0;
    let r = 0,
      prevR = 0;
    let units = 0,
      prevU = 0;

    const thirtyDaysAgo = new Date().getTime() - 30 * 86400000;
    const fortyFiveDays = new Date().getTime() + 45 * 86400000;
    const fifteenDays = new Date().getTime() + 15 * 86400000;

    mappedProjects.forEach((p) => {
      const currentUnits = parseInt(p.units as any) || 0;
      const finalScore = p.healthScore;

      // Current State
      if (p.projectStatus === 'Onboarding') {
        ob++;
        if (p.releaseDateVal && p.releaseDateVal <= fortyFiveDays) pipe++;
      }
      if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') {
        units += currentUnits;
        if (finalScore !== 'N/A' && typeof finalScore === 'number' && finalScore < 50) r++;
      }

      // Previous State
      const hist = p.history || [];
      const olderThan30 = hist
        .filter((x: any) => x.timeVal <= thirtyDaysAgo)
        .sort((a: any, b: any) => b.timeVal - a.timeVal);

      if (olderThan30.length > 0) {
        const snapshot = olderThan30[0];
        if (snapshot.status === 'Onboarding') {
          prevOb++;
          if (p.releaseDateVal && p.releaseDateVal <= fifteenDays) prevPipe++;
        }
        if (snapshot.status === 'Active' || snapshot.status === 'Suspended') {
          prevU += snapshot.units || 0;
          if (snapshot.healthScore < 50) prevR++;
        }
      } else {
        // Fallback: If no history > 30 days, deduce past state based on releaseDateVal
        if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') {
          if (p.releaseDateVal && p.releaseDateVal <= thirtyDaysAgo) {
            prevU += currentUnits;
          } else if (p.releaseDateVal && p.releaseDateVal > thirtyDaysAgo) {
            prevOb++;
            if (p.releaseDateVal <= fifteenDays) prevPipe++;
          }
        } else if (p.projectStatus === 'Onboarding') {
          prevOb++;
          if (p.releaseDateVal && p.releaseDateVal <= fifteenDays) prevPipe++;
        }
      }
    });

    return {
      onboardingCount: ob,
      prevOnboardingCount: prevOb,
      pipelineCount: pipe,
      prevPipelineCount: prevPipe,
      riskCount: r,
      prevRiskCount: prevR,
      liveUnits: units,
      prevLiveUnits: prevU,
    };
  }, [mappedProjects]);

  // 3. Tab filtering logic
  const baseProjects = useMemo(() => {
    const today = new Date().getTime();
    const fortyFiveDays = today + 45 * 86400000;

    // Tab Filter
    return mappedProjects.filter((p) => {
      if (activeTab === 'Actively Onboarding') {
        return (
          p.projectStatus === 'Onboarding' &&
          !!p.releaseDateVal &&
          p.releaseDateVal <= fortyFiveDays
        );
      }
      if (activeTab === 'Upcoming (> 45 Days)') {
        return (
          p.projectStatus === 'Onboarding' && p.releaseDateVal && p.releaseDateVal > fortyFiveDays
        );
      }
      if (activeTab === 'No Due Date') {
        return p.projectStatus === 'Onboarding' && !p.releaseDateVal;
      }
      if (activeTab === 'All Onboarding') {
        return p.projectStatus === 'Onboarding';
      }
      if (activeTab === 'All Released') {
        return p.projectStatus === 'Active' || p.projectStatus === 'Closed';
      }
      if (activeTab === 'Suspended') {
        return p.projectStatus === 'Suspended';
      }
      // All Projects
      return true;
    });
  }, [mappedProjects, activeTab]);

  const filteredProjects = useMemo(() => {
    let filtered = [...baseProjects];

    // Column Filters
    if (statusFilter.length > 0) {
      filtered = filtered.filter((p) => statusFilter.includes(p.projectStatus || 'Not Set'));
    }
    if (nameFilter.length > 0) {
      filtered = filtered.filter((p) => nameFilter.includes(p.name || 'Unnamed Project'));
    }
    if (clientFilter.length > 0) {
      filtered = filtered.filter((p) => p.clients?.some((c: string) => clientFilter.includes(c)));
    }
    if (managerFilter.length > 0) {
      filtered = filtered.filter((p) => managerFilter.includes(p.assignee || 'Unassigned'));
    }
    if (timelineFilter.length > 0) {
      filtered = filtered.filter((p) => timelineFilter.includes(p.timelineStatus || 'Not Set'));
    }
    if (phaseFilter.length > 0) {
      filtered = filtered.filter((p) => phaseFilter.includes(p.onboardingPhase || 'Not Set'));
    }

    if (healthFilter.length > 0) {
      const thresholds = settings?.scoring?.thresholds || { healthy: 80, warning: 50 };
      filtered = filtered.filter((p) => {
        const score = p.healthScore;
        const isHealthy = typeof score === 'number' && score >= thresholds.healthy;
        const isWarning =
          typeof score === 'number' && score >= thresholds.warning && score < thresholds.healthy;
        const isAtRisk = typeof score === 'number' && score < thresholds.warning;
        return healthFilter.some((hf) => {
          if (hf === 'Healthy') return isHealthy;
          if (hf === 'Warning') return isWarning;
          if (hf === 'At Risk') return isAtRisk;
          return false;
        });
      });
    }

    if (featuresFilter.length > 0) {
      filtered = filtered.filter(
        (p) => p.features && p.features.some((f: string) => featuresFilter.includes(f))
      );
    }

    if (releaseDateFilter) {
      if (releaseDateFilter === 'no-date') {
        filtered = filtered.filter((p) => !p.releaseDateVal);
      } else {
        const startStr = releaseDateFilter.start;
        const endStr = releaseDateFilter.end;

        // To compare dates simply, since releaseDateVal is a timestamp and start/end are "YYYY-MM"
        let startMs = 0;
        let endMs = Infinity;
        if (startStr) {
          const d = new Date(startStr + '-01T00:00:00');
          startMs = d.getTime();
        }
        if (endStr) {
          // To get end of month, go to next month day 0
          const [y, m] = endStr.split('-');
          const d = new Date(Number(y), Number(m), 0, 23, 59, 59, 999);
          endMs = d.getTime();
        }

        filtered = filtered.filter((p) => {
          if (!p.releaseDateVal) return false;
          return p.releaseDateVal >= startMs && p.releaseDateVal <= endMs;
        });
      }
    }

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(lower) ||
          (p.assignee || '').toLowerCase().includes(lower) ||
          (p.clients?.join(', ') || '').toLowerCase().includes(lower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let valA = a[sortCol as keyof typeof a];
      let valB = b[sortCol as keyof typeof b];

      if (sortCol === 'clients') {
        valA = a.clients?.join(', ') || '';
        valB = b.clients?.join(', ') || '';
      }
      if (sortCol === 'developers') {
        valA = a.developers?.join(', ') || '';
        valB = b.developers?.join(', ') || '';
      }
      if (sortCol === 'salesMarketingClients') {
        valA = a.salesMarketingClients?.join(', ') || '';
        valB = b.salesMarketingClients?.join(', ') || '';
      }

      // Normalize missing dates to 0 for consistent falsy checks
      if (sortCol === 'releaseDateVal') {
        valA = valA || 0;
        valB = valB || 0;
      }

      if (valA === valB) {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
      }

      if (sortCol === 'releaseDateVal') {
        if (!valA) return 1;
        if (!valB) return -1;
      } else {
        if (valA === null || valA === undefined || valA === '') return 1;
        if (valB === null || valB === undefined || valB === '') return -1;
      }

      if (typeof valA === 'string') {
        if (sortAsc) {
          return valA > (valB as string) ? 1 : valA < (valB as string) ? -1 : 0;
        } else {
          return (valB as string) > valA ? 1 : (valB as string) < valA ? -1 : 0;
        }
      }
      return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });

    return filtered;
  }, [
    baseProjects,
    searchTerm,
    sortCol,
    sortAsc,
    statusFilter,
    healthFilter,
    nameFilter,
    clientFilter,
    managerFilter,
    timelineFilter,
    phaseFilter,
    featuresFilter,
    releaseDateFilter,
  ]);

  // 4. Update Project (Inline)
  const handleUpdateProject = useCallback(
    async (id: string, field: string, value: any) => {
      const p = projects.find((x) => x.id === id);
      if (p) {
        let fieldName = field;
        if (field === 'projectStatus') fieldName = 'Status';
        else if (field === 'assignee') fieldName = 'Account Manager';
        else if (field === 'onboardingPhase') fieldName = 'Implementation Status';
        else if (field === 'timelineStatus') fieldName = 'Schedule Status';
        else if (field === 'releaseDateVal') fieldName = 'Release Date';
        else {
          fieldName =
            field.charAt(0).toUpperCase() +
            field
              .replace(/([A-Z])/g, ' $1')
              .slice(1)
              .trim();
        }

        const updates: any = { [field]: value };

        if (field === 'releaseDateVal') {
          if (value) {
            updates.releaseDateStr = new Date(value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          } else {
            updates.releaseDateStr = '';
          }
        }

        // Automation Rules
        if (field === 'timelineStatus') {
          if (value === 'Released') {
            updates.projectStatus = 'Active';
            updates.onboardingPhase = 'Released';
            const today = new Date();
            const localMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            updates.releaseDateVal = localMidnight.getTime();
            updates.releaseDateStr = localMidnight.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          } else if (value === 'Indefinitely Delayed') {
            updates.releaseDateVal = null;
            updates.releaseDateStr = '';
          }
        } else if (field === 'onboardingPhase' && value === 'Released') {
          updates.projectStatus = 'Active';
          updates.timelineStatus = 'Released';
          const today = new Date();
          const localMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          updates.releaseDateVal = localMidnight.getTime();
          updates.releaseDateStr = localMidnight.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }

        const oldVal = p[field as keyof typeof p];
        const displayOld =
          oldVal === undefined || oldVal === null || oldVal === '' ? 'None' : oldVal;
        const displayNew = value === undefined || value === null || value === '' ? 'None' : value;
        const logMsg =
          field === 'releaseDateVal'
            ? `Changed Release Date to ${updates.releaseDateStr || 'None'}`
            : `Changed ${fieldName} from ${displayOld} to ${displayNew}`;

        await updateProjectRecord(
          { ...p, ...updates },
          {
            successMsg: `${fieldName} successfully updated for '${p.name}'.`,
            errorMsg: `Failed to update ${fieldName} for '${p.name}'.`,
          },
          logMsg,
          user?.name
        );

        if (p.clientIds && (field === 'projectStatus' || updates.projectStatus === 'Active')) {
          const statusOld = p.projectStatus || 'Not Set';
          const statusNew = updates.projectStatus || value;
          if (statusOld !== statusNew) {
            for (const cid of p.clientIds) {
              addAutoLog(
                cid,
                `Project "${p.name}" Status changed from ${statusOld} to ${statusNew}`,
                user?.name || 'System',
                true
              ).catch(console.error);
            }
          }
        }
      }
    },
    [projects, user]
  );

  const handleBulkUpdate = async (updates: Record<string, any>) => {
    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) return;

    const projs = projects.filter((p) => selectedRows.includes(p.id));
    if (projs.length === 0) return;

    const loadingToast = toast.loading(`Updating ${projs.length} projects...`);

    try {
      const updatePromises = projs.map(async (p) => {
        const pUpdates: any = { ...updates };

        // Automation Rules
        if (pUpdates.timelineStatus) {
          if (pUpdates.timelineStatus === 'Released') {
            pUpdates.projectStatus = 'Active';
            pUpdates.onboardingPhase = 'Released';
            const today = new Date();
            const localMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            pUpdates.releaseDateVal = localMidnight.getTime();
            pUpdates.releaseDateStr = localMidnight.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          } else if (pUpdates.timelineStatus === 'Indefinitely Delayed') {
            pUpdates.releaseDateVal = null;
            pUpdates.releaseDateStr = '';
          }
        } else if (pUpdates.onboardingPhase === 'Released') {
          pUpdates.projectStatus = 'Active';
          pUpdates.timelineStatus = 'Released';
          const today = new Date();
          const localMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          pUpdates.releaseDateVal = localMidnight.getTime();
          pUpdates.releaseDateStr = localMidnight.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }

        if (pUpdates.projectStatus === 'Active' && p.projectStatus === 'Onboarding') {
          pUpdates.timelineStatus = 'Released';
          pUpdates.onboardingPhase = 'Released';
          const today = new Date();
          const localMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          pUpdates.releaseDateVal = localMidnight.getTime();
          pUpdates.releaseDateStr = localMidnight.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }

        await updateProjectRecord({ ...p, ...pUpdates }, { silent: true });

        const updatedFields = [];
        for (const field of Object.keys(pUpdates)) {
          let fieldName = field;
          if (field === 'projectStatus') fieldName = 'Project Status';
          else if (field === 'assignee') fieldName = 'Manager';
          else if (field === 'onboardingPhase') fieldName = 'Implementation Status';
          else if (field === 'timelineStatus') fieldName = 'Schedule Status';
          updatedFields.push(`${fieldName} to ${pUpdates[field]}`);
        }

        if (updatedFields.length > 0) {
          const logMsg = `Bulk updated: ${updatedFields.join(', ')}`;
          // Fire and forget logging
          addProjectAutoLog(p.id, logMsg, user?.name || 'System').catch(console.error);

          const shouldLogClient =
            p.clientIds && ('projectStatus' in pUpdates || p.projectStatus === 'Active');
          if (shouldLogClient) {
            for (const cid of p.clientIds) {
              addAutoLog(
                cid,
                `Project "${p.name}": Bulk updated ${updatedFields.join(', ')}`,
                user?.name || 'System',
                true
              ).catch(console.error);
            }
          }
        }
      });

      await Promise.all(updatePromises);

      toast.dismiss(loadingToast);
      toast.success(`Successfully updated ${projs.length} projects`, { duration: 5000 });
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to update projects: ${err.message}`, { duration: 5000 });
    }

    setSelectedRows([]);
  };

  const handleOpenDrawer = useCallback(
    (type: string, id: string, data?: any) => {
      openDrawer(type as any, id, data);
    },
    [openDrawer]
  );

  return (
    <div className="flex h-full flex-col min-h-0 bg-white relative overflow-hidden">
      {/* FIXED HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 shrink-0 px-4 md:px-6 pt-4 pb-2 bg-white z-40">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Projects
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Comprehensive tracker and reporting for all projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto mt-2 md:mt-0">
          <button
            onClick={() => openModal('addProject')}
            className="group inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] shadow-sm px-4 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <Plus className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Project</span>
          </button>
          <div className="relative rounded-lg" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="group inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 hover:-translate-y-0.5 px-4 py-2 h-9 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
            >
              <Download className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span>Export</span>
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
                      universalExportCSV('Projects', projects, 'All_Projects');
                    }}
                  >
                    <Database className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />{' '}
                    Export All
                  </div>
                  <div
                    className="group px-2 py-2 rounded-md hover:bg-primary/5 cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary mt-0.5"
                    onClick={() => {
                      setShowExportMenu(false);
                      universalExportCSV('Projects', filteredProjects, 'Filtered_Projects');
                    }}
                  >
                    <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />{' '}
                    Export Filtered View
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 px-4 md:px-6 py-2">
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => {
              clearAllFilters();
              setPtFilter('All Onboarding');
            }}
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '50ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-full blur-xl transition-colors duration-200"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <Target className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  Onboarding
                  <UITooltip content="Projects currently in onboarding">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </UITooltip>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </div>
            <TrendIndicator
              current={onboardingCount}
              previous={prevOnboardingCount}
              neutral={true}
            />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => {
              clearAllFilters();
              setPtFilter('Actively Onboarding');
            }}
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:border-purple-500/40 transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '150ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 group-hover:bg-purple-500/10 rounded-full blur-xl transition-colors duration-200"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  Launch Pipeline
                  <UITooltip content="Target launch &le; 45 days">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </UITooltip>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </div>
            <TrendIndicator current={pipelineCount} previous={prevPipelineCount} neutral={true} />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => {
              clearAllFilters();
              setPtFilter('All Projects');
              setHealthFilter(['At Risk']);
            }}
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:border-red-500/40 transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '250ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/5 group-hover:bg-red-500/10 rounded-full blur-xl transition-colors duration-200"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-red-500/10 text-red-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  At-Risk Projects
                  <UITooltip content="Live projects scoring under 50">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </UITooltip>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </div>
            <TrendIndicator current={riskCount} previous={prevRiskCount} inverted={true} />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => {
              clearAllFilters();
              setPtFilter('All Released');
              setStatusFilter(['Active', 'Suspended']);
            }}
            className="cursor-pointer flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-colors duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]"
            style={{ animationDelay: '350ms' }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 group-hover:bg-blue-500/10 rounded-full blur-xl transition-colors duration-200"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <Building className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  Total Live Units
                  <UITooltip content="Scale of actively supported product">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </UITooltip>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </div>
            <TrendIndicator current={liveUnits} previous={prevLiveUnits} />
          </motion.div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 md:px-6 lg:px-8 pb-6 relative z-20 w-full">
        {(() => {
          const toolbarContent = (
            <div className="flex flex-col gap-0 pb-2 pt-2 shrink-0 w-full sticky top-0 z-30 bg-white/95 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative">
                <div className="flex items-center gap-2 overflow-x-auto custom-thin-scroll">
                  <div className="relative flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 shadow-inner mr-2 shrink-0">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`relative flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 z-10 ${viewMode === 'list' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {viewMode === 'list' && (
                        <motion.div
                          layoutId="viewModeIndicator"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <List className="w-4 h-4" />
                      <span>List View</span>
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`relative flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 z-10 ${viewMode === 'calendar' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {viewMode === 'calendar' && (
                        <motion.div
                          layoutId="viewModeIndicator"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Calendar className="w-4 h-4" />
                      <span>Calendar</span>
                    </button>
                  </div>
                  {viewMode === 'list' &&
                    (() => {
                      const hasSuspendedProjects = projects.some(
                        (p) => p.projectStatus === 'Suspended'
                      );
                      const tabs = [
                        { label: 'Actively Onboarding', icon: PlayCircle },
                        { label: 'Upcoming (> 45 Days)', icon: Calendar },
                        { label: 'No Due Date', icon: Clock },
                        { label: 'All Onboarding', icon: ListTodo },
                        { label: 'All Released', icon: CheckCircle2 },
                        { label: 'All Projects', icon: Database },
                      ];
                      if (hasSuspendedProjects) {
                        tabs.push({ label: 'Suspended', icon: PauseCircle });
                      }
                      return (
                        <PageTabs
                          tabs={tabs}
                          activeTab={activeTab}
                          onTabChange={(t) => setPtFilter(t)}
                        />
                      );
                    })()}
                </div>

                {viewMode === 'list' && (
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm h-9"
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
                )}
              </div>

              {(nameFilter.length > 0 ||
                clientFilter.length > 0 ||
                managerFilter.length > 0 ||
                timelineFilter.length > 0 ||
                phaseFilter.length > 0 ||
                statusFilter.length > 0 ||
                healthFilter.length > 0 ||
                featuresFilter.length > 0 ||
                releaseDateFilter !== null) && (
                <ActiveFilterBar
                  filters={[
                    {
                      label: 'Project Name',
                      values: nameFilter,
                      onRemove: (v) => removeFilterItem(setNameFilter, nameFilter, v),
                    },
                    {
                      label: 'Client',
                      values: clientFilter,
                      onRemove: (v) => removeFilterItem(setClientFilter, clientFilter, v),
                    },
                    {
                      label: 'Manager',
                      values: managerFilter,
                      onRemove: (v) => removeFilterItem(setManagerFilter, managerFilter, v),
                    },
                    {
                      label: 'Project Status',
                      values: statusFilter,
                      onRemove: (v) => removeFilterItem(setStatusFilter, statusFilter, v),
                    },
                    {
                      label: 'Schedule Status',
                      values: timelineFilter,
                      onRemove: (v) => removeFilterItem(setTimelineFilter, timelineFilter, v),
                    },
                    {
                      label: 'Implementation Status',
                      values: phaseFilter,
                      onRemove: (v) => removeFilterItem(setPhaseFilter, phaseFilter, v),
                    },
                    {
                      label: 'Health',
                      values: healthFilter,
                      onRemove: (v) => removeFilterItem(setHealthFilter, healthFilter, v),
                    },
                    {
                      label: 'Feature',
                      values: featuresFilter,
                      onRemove: (v) => removeFilterItem(setFeaturesFilter, featuresFilter, v),
                    },
                    {
                      label: 'Release',
                      values: releaseDateFilter
                        ? releaseDateFilter === 'no-date'
                          ? ['No Date']
                          : [
                              releaseDateFilter.start === releaseDateFilter.end
                                ? releaseDateFilter.start
                                : `${releaseDateFilter.start} to ${releaseDateFilter.end}`,
                            ]
                        : [],
                      onRemove: () => setReleaseDateFilter(null),
                    },
                  ]}
                  onClearAll={clearAllFilters}
                />
              )}
            </div>
          );

          const footerContent =
            viewMode === 'list' ? (
              <TableFooter
                totalItems={filteredProjects.length}
                label="Total Projects"
                rightContent={
                  <span className="text-[11px] capitalize tracking-wider text-muted-foreground font-bold">
                    Total Units Displayed:{' '}
                    <span className="text-foreground text-[13px] font-bold ml-1">
                      {filteredProjects
                        .reduce((sum, p) => sum + (Number(p.units) || 0), 0)
                        .toLocaleString()}
                    </span>
                  </span>
                }
              />
            ) : null;

          return viewMode === 'list' ? (
            <>
              {toolbarContent}
              <div className="flex-1 border border-border rounded-xl shadow-sm bg-white relative flex flex-col overflow-hidden">
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
                  <div className="w-full">
                    <ProjectTrackerTable
                      parentRef={tableScrollRef}
                      projects={filteredProjects}
                      baseProjects={baseProjects}
                      activeTab={activeTab}
                      settings={settings}
                      selectedRows={selectedRows}
                      setSelectedRows={setSelectedRows}
                      sortCol={sortCol}
                      sortAsc={sortAsc}
                      onSort={handleSort}
                      onUpdateProject={handleUpdateProject}
                      openDrawer={handleOpenDrawer}
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      healthFilter={healthFilter}
                      setHealthFilter={setHealthFilter}
                      nameFilter={nameFilter}
                      setNameFilter={setNameFilter}
                      clientFilter={clientFilter}
                      setClientFilter={setClientFilter}
                      managerFilter={managerFilter}
                      setManagerFilter={setManagerFilter}
                      timelineFilter={timelineFilter}
                      setTimelineFilter={setTimelineFilter}
                      phaseFilter={phaseFilter}
                      setPhaseFilter={setPhaseFilter}
                      featuresFilter={featuresFilter}
                      setFeaturesFilter={setFeaturesFilter}
                      releaseDateFilter={releaseDateFilter}
                      setReleaseDateFilter={setReleaseDateFilter}
                    />
                  </div>
                </div>
                {footerContent}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 w-full relative">
              {toolbarContent}
              <div
                ref={tableScrollRef}
                className="flex-1 overflow-auto custom-thin-scroll border border-border rounded-xl shadow-sm bg-white relative flex flex-col"
                onScroll={handleScroll}
                onWheel={(e) => {
                  const target = e.currentTarget;
                  if (e.deltaY < -10 && target.scrollTop <= 10) {
                    setIsScrolled(false);
                  }
                }}
              >
                <ProjectTrackerCalendar openDrawer={handleOpenDrawer} />
              </div>
            </div>
          );
        })()}
      </div>

      <BulkActionBar
        selectedCount={selectedRows.length}
        settings={settings}
        onClearSelection={() => setSelectedRows([])}
        onBulkUpdate={handleBulkUpdate}
      />
    </div>
  );
}
