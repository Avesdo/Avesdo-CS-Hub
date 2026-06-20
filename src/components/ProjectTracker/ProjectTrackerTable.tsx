import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  ChevronRight,
  CheckSquare,
  ExternalLink,
  Activity,
  Info,
  MoreHorizontal,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { getSettingBadge, getHealthBadge, getFeatureBadgeProps } from '../../utils/uiUtils';
import { TruncatedText } from '../ui/TruncatedText';
import { Select } from '../ui/Select';
import EmptyState from '../EmptyState';
import { ColumnFilter, DateFilter } from '../TableFilters';
import { DatePicker } from '../ui/DatePicker';

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

interface ProjectTrackerTableProps {
  projects: any[];
  baseProjects: any[];
  activeTab: string;
  settings: any;
  selectedRows: string[];
  setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>;
  sortCol: string | null;
  sortAsc: boolean;
  onSort: (col: string) => void;
  onUpdateProject: (projectId: string, field: string, value: any) => Promise<void>;
  openDrawer: (type: string, id: string, data?: any) => void;
  statusFilter?: string[];
  setStatusFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  healthFilter?: string[];
  setHealthFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  nameFilter?: string[];
  setNameFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  clientFilter?: string[];
  setClientFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  managerFilter?: string[];
  setManagerFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  timelineFilter?: string[];
  setTimelineFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  phaseFilter?: string[];
  setPhaseFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  featuresFilter?: string[];
  setFeaturesFilter?: React.Dispatch<React.SetStateAction<string[]>>;
  releaseDateFilter?: { start: string; end: string } | 'no-date' | null;
  setReleaseDateFilter?: React.Dispatch<
    React.SetStateAction<{ start: string; end: string } | 'no-date' | null>
  >;
  footerContent?: React.ReactNode;
  parentRef?: React.RefObject<HTMLDivElement | null>;
}


const arePropsEqual = (prevProps: any, nextProps: any) => {
  return (
    prevProps.p === nextProps.p &&
    prevProps.showYearInDate === nextProps.showYearInDate &&
    prevProps.selectedRows.includes(prevProps.p.id) === nextProps.selectedRows.includes(nextProps.p.id) &&
    prevProps.settings === nextProps.settings
  );
};

const ProjectRow = React.memo(({
  p,
  selectedRows,
  toggleRow,
  openDrawer,
  stopProp,
  settings,
  showHealthScore,
  getHealthBadge,
  showYearInDate,
  onUpdateProject,
  getSettingBadge,
  showTimeline,
  showPhase,
  showFeatures,
  getFeatureBadgeProps,
  Sparkline,
  virtualRow
}: any) => {
  return (
    <tr
      key={virtualRow.index}
      className={`transition-colors cursor-pointer group hover:relative hover:z-[100] ${selectedRows.includes(p.id) ? 'bg-primary/5' : 'bg-white hover:bg-primary/[0.02]'}`}
      onClick={() => openDrawer('project', p.id, { targetTab: 'overview' })}
    >
              <td
                className="sticky left-0 z-20 group-hover:z-[110] bg-inherit border-r-0 px-4 py-2"
                onClick={stopProp}
              >
                <input
                  type="checkbox"
                  checked={selectedRows.includes(p.id)}
                  onChange={(e) => toggleRow(p.id, e as any)}
                  className="rounded border-slate-300 text-primary focus:ring-0 focus-visible:ring-2 focus-visible:ring-primary/20 focus:ring-offset-0 outline-none cursor-pointer"
                />
              </td>
      <td className="sticky left-12 z-20 group-hover:z-[110] bg-inherit border-r-0 px-4 py-2 font-medium text-foreground w-[280px] min-w-[280px]">
        <TruncatedText
          text={p.name || 'Unnamed Project'}
          className="max-w-[280px] 2xl:max-w-[450px] group-hover:text-primary transition-colors"
        />
      </td>
      <td className="px-4 py-2 text-slate-500">
        <TruncatedText
          text={p.clients?.join(', ') || 'None'}
          className="max-w-[200px]"
        />
      </td>
              {showHealthScore && (
                <td
                  className="px-4 py-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDrawer('project', p.id, { targetTab: 'health' });
                  }}
                >
                  <div className="flex items-center gap-4 group/trend p-1 -m-1 rounded hover:bg-slate-100 transition-colors w-fit">
                    {getHealthBadge(p.healthScore, settings)}
                    {p.trendData && (
                      <div
                        className="opacity-80 group-hover/trend:opacity-100 transition-opacity hidden xl:block cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer('project', p.id, { targetTab: 'health' });
                        }}
                      >
                        <Sparkline data={p.trendData} />
                      </div>
                    )}
                  </div>
                </td>
              )}
              <td className="px-4 py-2 text-muted-foreground" onClick={stopProp}>
                <DatePicker
                  value={p.releaseDateVal}
                  onChange={(val, str) => {
                    onUpdateProject(p.id, 'releaseDateVal', val);
                  }}
          className="w-auto"
          trigger={
            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 active:scale-95 px-2 py-1 -ml-2 rounded-md group">
              <Calendar className="w-4 h-4 opacity-50" />
                      <span className="whitespace-nowrap">
                        {p.releaseDateVal
                          ? new Date(p.releaseDateVal).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              ...(!showYearInDate
                                ? {}
                                : { year: 'numeric' }),
                            })
                          : 'Not Set'}
                      </span>
                    </div>
                  }
                />
              </td>
              <td className="px-4 py-2" onClick={stopProp}>
                <div className="inline-block relative">
                  <Select
                    value={p.assignee || 'Unassigned'}
                    options={(settings?.managers?.map((m: any) => m.name) || []).map((m: any) => ({
                      label: getSettingBadge('managers', m, settings),
                      value: m,
                    }))}
                    onChange={(val) => onUpdateProject(p.id, 'assignee', val)}
            hideCheckmark={true}
            trigger={
              <div className="cursor-pointer hover:bg-primary/5 active:scale-95 px-2 py-1 -ml-2 rounded-md transition-all inline-block group-hover:text-primary">
                {getSettingBadge('managers', p.assignee, settings)}
              </div>
            }
          />
                </div>
              </td>
              <td className="px-4 py-2" onClick={stopProp}>
                <div className="inline-block relative">
                  <Select
                    value={p.projectStatus || 'Not Set'}
                    options={(settings?.statuses?.map((s: any) => s.name) || []).map((s: any) => ({
                      label: getSettingBadge('statuses', s, settings),
                      value: s,
                    }))}
                    onChange={(val) => onUpdateProject(p.id, 'projectStatus', val)}
            hideCheckmark={true}
            trigger={
              <div className="cursor-pointer hover:bg-primary/5 active:scale-95 px-2 py-1 -ml-2 rounded-md transition-all inline-block group-hover:text-primary">
                {getSettingBadge('statuses', p.projectStatus, settings)}
              </div>
            }
          />
                </div>
              </td>
              {showTimeline && (
                <td className="px-4 py-2" onClick={stopProp}>
                  <div className="inline-block relative">
                    <Select
                      value={p.timelineStatus || 'Not Set'}
                      options={(settings?.timelines?.map((t: any) => t.name) || []).map(
                        (t: any) => ({
                          label: getSettingBadge('timelines', t, settings),
                          value: t,
                        })
                      )}
                      onChange={(val) => onUpdateProject(p.id, 'timelineStatus', val)}
              hideCheckmark={true}
              trigger={
                <div className="cursor-pointer hover:bg-primary/5 active:scale-95 px-2 py-1 -ml-2 rounded-md transition-all inline-block group-hover:text-primary">
                  {getSettingBadge('timelines', p.timelineStatus, settings)}
                </div>
              }
            />
                  </div>
                </td>
              )}
              {showPhase && (
                <td className="px-4 py-2" onClick={stopProp}>
                  <div className="inline-block relative">
                    <Select
                      value={p.onboardingPhase || 'Not Set'}
                      options={(settings?.phases?.map((ph: any) => ph.name) || []).map(
                        (ph: any) => ({
                          label: getSettingBadge('phases', ph, settings),
                          value: ph,
                        })
                      )}
                      onChange={(val) => onUpdateProject(p.id, 'onboardingPhase', val)}
              hideCheckmark={true}
              trigger={
                <div className="cursor-pointer hover:bg-primary/5 active:scale-95 px-2 py-1 -ml-2 rounded-md transition-all inline-block group-hover:text-primary">
                  {getSettingBadge('phases', p.onboardingPhase, settings)}
                </div>
              }
            />
                  </div>
                </td>
              )}
              <td className="px-4 py-2 text-center font-medium text-foreground">
                {p.units ? parseInt(p.units).toLocaleString() : '0'}
              </td>
              {showFeatures && (
                <td className="px-4 py-2">
                  {(() => {
                    const pt_features = [
                      'Contracts',
                      'Inventory',
                      'Pricing',
                      'Deposits',
                      'Payments',
                      'Allocations',
                      'Workflows',
                      'Reporting',
                    ];
                    const fTotal =
                      Array.isArray(settings?.features) && settings?.features.length > 0
                        ? settings.features.length
                        : pt_features.length;
                    const fCount = Array.isArray(p.features) ? p.features.length : 0;
                    const pct = Math.round((fCount / fTotal) * 100);
                    const colors = getFeatureBadgeProps(pct, settings);
                    
                    const colorMap: Record<string, string> = {
                      'bg-lime-500': 'text-lime-500',
                      'bg-orange-500': 'text-orange-500',
                      'bg-red-500': 'text-red-500'
                    };
                    const textColor = colorMap[colors.fill] || 'text-primary';
                    const radius = 6.5;
                    const circumference = 2 * Math.PI * radius;
                    const dasharray = `${(pct / 100) * circumference} ${circumference}`;

                    return (
                      <div className="flex items-center justify-center gap-2.5 px-2 py-1 -ml-2">
                        <div className="relative w-4 h-4 flex items-center justify-center -rotate-90">
                          <svg className="w-full h-full" viewBox="0 0 16 16">
                            <circle cx="8" cy="8" r={radius} fill="none" className="stroke-slate-200" strokeWidth="2.5" />
                            <circle 
                              cx="8" 
                              cy="8" 
                              r={radius} 
                              fill="none" 
                              className={`transition-all duration-500 ${textColor}`} 
                              strokeWidth="2.5" 
                              strokeDasharray={dasharray} 
                              strokeLinecap="round" 
                              stroke="currentColor" 
                            />
                          </svg>
                        </div>
                        <span className="text-[11px] font-bold tabular-nums w-6 text-left text-slate-500">
                          {fCount}/{fTotal}
                        </span>
                      </div>
                    );
                  })()}
                </td>
              )}
            </tr>
  );
}, arePropsEqual);

export const ProjectTrackerTable: React.FC<ProjectTrackerTableProps> = React.memo(
  ({
    projects,
    baseProjects,
    activeTab,
    settings,
    selectedRows,
    setSelectedRows,
    sortCol,
    sortAsc,
    onSort,
    onUpdateProject,
    openDrawer,
    statusFilter,
    setStatusFilter,
    healthFilter,
    setHealthFilter,
    nameFilter,
    setNameFilter,
    clientFilter,
    setClientFilter,
    managerFilter,
    setManagerFilter,
    timelineFilter,
    setTimelineFilter,
    phaseFilter,
    setPhaseFilter,
    featuresFilter,
    setFeaturesFilter,
    releaseDateFilter,
    setReleaseDateFilter,
    footerContent,
    parentRef,
  }) => {
    const groupA = [
      'Actively Onboarding',
      'Upcoming (> 45 Days)',
      'No Due Date',
      'All Onboarding',
    ].includes(activeTab);
    const groupB = ['All Released', 'Suspended'].includes(activeTab);
    const groupC = activeTab === 'All Projects';

    const showTimeline = groupA;
    const showPhase = groupA;
    const showHealthScore = groupB || groupC;
    const showFeatures = groupB || groupC;

    const columnCount =
        4 + // Checkbox, Name, Client, Release Date
        (showHealthScore ? 1 : 0) +
        2 + // Manager, Status
        (showTimeline ? 1 : 0) +
        (showPhase ? 1 : 0) +
        1 + // Live Units
        (showFeatures ? 1 : 0);



    const { allNames, allClients, allManagers, allTimelines, allPhases, allFeatures } = useMemo(() => {
      const names = Array.from(new Set(baseProjects.map((p) => p.name || 'Not Set'))).sort();
      const clients = Array.from(new Set(baseProjects.flatMap((p) => p.clients || []))).sort();
      const managers = Array.from(new Set(baseProjects.map((p) => p.assignee || 'Unassigned'))).sort();
      const timelines = Array.from(new Set(baseProjects.map((p) => p.timelineStatus || 'Not Set'))).sort();
      const phases = Array.from(new Set(baseProjects.map((p) => p.onboardingPhase || 'Not Set'))).sort();
      
      const pt_features_fallback = [
        'Contracts', 'Inventory', 'Pricing', 'Deposits', 'Payments', 'Allocations', 'Workflows', 'Reporting'
      ];
      const features = Array.isArray(settings?.features) && settings?.features.length > 0
        ? settings.features
        : pt_features_fallback;
        
      return {
        allNames: names,
        allClients: clients,
        allManagers: managers,
        allTimelines: timelines,
        allPhases: phases,
        allFeatures: features
      };
    }, [baseProjects, settings]);


    const toggleAll = useCallback(() => {
      if (selectedRows.length === projects.length && projects.length > 0) {
        setSelectedRows([]);
      } else {
        setSelectedRows(projects.map((p) => p.id));
      }
    }, [selectedRows.length, projects, setSelectedRows]);

    
  const virtualizer = useVirtualizer({
    count: projects.length,
    getScrollElement: () => parentRef?.current || null,
    estimateSize: () => 55,
    overscan: 35,
  });

  // Force a re-render after the initial mount so the virtualizer 
  // can correctly read the parentRef's dimensions now that it is attached to the DOM.
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, []);

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 
    ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end 
    : 0;

  const toggleRow = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRows((prev: any) =>
      prev.includes(id) ? prev.filter((rId: any) => rId !== id) : [...prev, id]
    );
  }, [setSelectedRows]);

    const stopProp = (e: React.MouseEvent) => e.stopPropagation();

    const getDefaultSort = (tab: string) => {
      if (tab === 'No Due Date' || tab === 'Suspended') return { col: 'name', asc: true };
      if (tab === 'All Released' || tab === 'All Projects') return { col: 'releaseDateVal', asc: false };
      return { col: 'releaseDateVal', asc: true };
    };

    const renderSortIcon = (colName: string) => {
      const isCurrentlySorted = sortCol === colName;
      const defSort = getDefaultSort(activeTab);
      const isDefaultState = isCurrentlySorted && sortCol === defSort.col && sortAsc === defSort.asc;
    
      if (isDefaultState) {
        return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/th:opacity-100 ml-1 transition-opacity shrink-0" />;
      }
    
      if (isCurrentlySorted) {
        return sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-primary ml-1 shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 text-primary ml-1 shrink-0" />;
      }
      
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/th:opacity-100 ml-1 transition-opacity shrink-0" />;
    };

    return (
      <table className="w-full text-left bg-white border-separate border-spacing-0 min-w-[1600px] table-fixed">

        {useMemo(() => (
        <thead className="sticky top-0 z-[150] bg-white/90 backdrop-blur-md">
          <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold tracking-wider h-[45px]">
            <th className="sticky left-0 z-[160] bg-slate-50/90 backdrop-blur-md border-b border-border border-r-0 px-4 py-2 w-12 group/th">
              <input
                type="checkbox"
                checked={selectedRows.length === projects.length && projects.length > 0}
                onChange={toggleAll}
                className="rounded border-slate-300 text-primary focus:ring-0 focus-visible:ring-2 focus-visible:ring-primary/20 focus:ring-offset-0 outline-none cursor-pointer"
              />
            </th>
            <th className="sticky left-12 z-[160] bg-slate-50/90 backdrop-blur-md border-b border-border border-r-0 px-4 py-2 w-[280px] min-w-[280px] group/th">
              <div className="flex items-center">
                <div
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2 flex items-center"
                  onClick={() => onSort('name')}
                >
                  Project Name
                  {renderSortIcon('name')}
                </div>
                {setNameFilter && (
                  <ColumnFilter
                    options={allNames}
                    selected={nameFilter || []}
                    onChange={setNameFilter}
                    searchable
                  />
                )}
              </div>
            </th>
            <th className="border-b border-border px-4 py-2 w-[250px] max-w-[250px] group/th">
              <div className="flex items-center">
                <div
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2 flex items-center"
                  onClick={() => onSort('clients')}
                >
                  Client(s)
                  {renderSortIcon('clients')}
                </div>
                {setClientFilter && (
                  <ColumnFilter
                    options={allClients}
                    selected={clientFilter || []}
                    onChange={setClientFilter}
                    searchable
                  />
                )}
              </div>
            </th>
            {showHealthScore && (
              <th className="border-b border-border px-4 py-2 min-w-[160px] group/th">
                <div className="flex items-center justify-center">
                  <div
                    className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2 flex items-center"
                    onClick={() => onSort('healthScore')}
                  >
                    Health Score
                    {renderSortIcon('healthScore')}
                  </div>
                  {setHealthFilter && (
                    <ColumnFilter
                      options={['Healthy', 'Warning', 'At Risk']}
                      selected={healthFilter || []}
                      onChange={setHealthFilter}
                    />
                  )}
                </div>
              </th>
            )}
            <th className="border-b border-border px-4 py-2 min-w-[110px] group/th">
              <div className="flex items-center">
                <div
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2 flex items-center"
                  onClick={() => onSort('releaseDateVal')}
                >
                  Release Date
                  {renderSortIcon('releaseDateVal')}
                </div>
                {setReleaseDateFilter && (
                  <DateFilter dateRange={releaseDateFilter} setDateRange={setReleaseDateFilter} />
                )}
              </div>
            </th>
            <th className="border-b border-border px-4 py-2 min-w-[120px] group/th">
              <div className="flex items-center">
                <div
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2 flex items-center"
                  onClick={() => onSort('assignee')}
                >
                  Manager
                  {renderSortIcon('assignee')}
                </div>
                {setManagerFilter && (
                  <ColumnFilter
                    options={allManagers}
                    selected={managerFilter || []}
                    onChange={setManagerFilter}
                  />
                )}
              </div>
            </th>
            <th className="border-b border-border px-4 py-2 min-w-[170px] group/th">
              <div className="flex items-center">
                <div
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2 flex items-center"
                  onClick={() => onSort('projectStatus')}
                >
                  Project Status
                  {renderSortIcon('projectStatus')}
                </div>
                {setStatusFilter && (
                  <ColumnFilter
                    options={['Onboarding', 'Active', 'Suspended', 'Closed']}
                    selected={statusFilter || []}
                    onChange={setStatusFilter}
                  />
                )}
              </div>
            </th>
            {showTimeline && (
              <th className="border-b border-border px-4 py-2 min-w-[170px] group/th">
                <div className="flex items-center">
                  <div
                    className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2 flex items-center"
                    onClick={() => onSort('timelineStatus')}
                  >
                    Schedule Status
                    {renderSortIcon('timelineStatus')}
                  </div>
                  {setTimelineFilter && (
                    <ColumnFilter
                      options={allTimelines}
                      selected={timelineFilter || []}
                      onChange={setTimelineFilter}
                    />
                  )}
                </div>
              </th>
            )}
            {showPhase && (
              <th className="border-b border-border px-4 py-2 min-w-[190px] group/th">
                <div className="flex items-center">
                  <div
                    className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2 flex items-center"
                    onClick={() => onSort('onboardingPhase')}
                  >
                    Implementation Status
                    {renderSortIcon('onboardingPhase')}
                  </div>    {setPhaseFilter && (
                    <ColumnFilter
                      options={allPhases}
                      selected={phaseFilter || []}
                      onChange={setPhaseFilter}
                    />
                  )}
                </div>
              </th>
            )}
            <th className="border-b border-border px-4 py-2 w-[80px] group/th">
              <div className="flex items-center justify-center">
                <div
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap flex items-center"
                  onClick={() => onSort('units')}
                >
                  Units
                  {renderSortIcon('units')}
                </div>
              </div>
            </th>
            {showFeatures && (
              <th className="border-b border-border px-4 py-2 min-w-[120px] group/th">
                <div className="flex items-center justify-center">
                  <div className="whitespace-nowrap mr-2">Features</div>
                  {setFeaturesFilter && (
                    <ColumnFilter
                      options={allFeatures}
                      selected={featuresFilter || []}
                      onChange={setFeaturesFilter}
                      searchable
                    />
                  )}
                </div>
              </th>
            )}
          </tr>
        </thead>
        ), [
          selectedRows.length, projects.length, toggleAll,
          onSort, sortCol, sortAsc, activeTab,
          setNameFilter, nameFilter, allNames,
          setClientFilter, clientFilter, allClients,
          showHealthScore, setHealthFilter, healthFilter,
          setReleaseDateFilter, releaseDateFilter,
          setManagerFilter, managerFilter, allManagers,
          setStatusFilter, statusFilter,
          showTimeline, setTimelineFilter, timelineFilter, allTimelines,
          showPhase, setPhaseFilter, phaseFilter, allPhases,
          showFeatures, setFeaturesFilter, featuresFilter, allFeatures
        ])}

        <tbody className="divide-y divide-border text-sm">
          {paddingTop > 0 && (
            <tr>
              <td colSpan={columnCount} style={{ height: paddingTop, border: 0, padding: 0 }} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const p = projects[virtualRow.index];
            if (!p) return null;
            return (
              <ProjectRow
                key={virtualRow.index}
                p={p}
                virtualRow={virtualRow}
                selectedRows={selectedRows}
                toggleRow={toggleRow}
                openDrawer={openDrawer}
                stopProp={stopProp}
                settings={settings}
                showHealthScore={showHealthScore}
                getHealthBadge={getHealthBadge}
                showYearInDate={!(groupA && activeTab !== 'All Onboarding')}
                onUpdateProject={onUpdateProject}
                getSettingBadge={getSettingBadge}
                showTimeline={showTimeline}
                showPhase={showPhase}
                showFeatures={showFeatures}
                getFeatureBadgeProps={getFeatureBadgeProps}
                Sparkline={Sparkline}
              />
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td colSpan={columnCount} style={{ height: paddingBottom, border: 0, padding: 0 }} />
            </tr>
          )}
          {projects.length === 0 && (
            <tr className="bg-white">
              <td className="sticky left-0 z-20 bg-white border-r-0" />
              <td className="sticky left-12 z-20 bg-white border-r-0" />
              <td colSpan={columnCount > 2 ? columnCount - 2 : 10} className="px-6 py-24">
                <div className="flex justify-center -ml-[328px]">
                  <EmptyState
                    icon={CheckSquare}
                    title="No projects found"
                    subtitle="Try adjusting your filters or tab selection."
                  />
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
);
