import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useState, useRef, useCallback , useMemo } from 'react';
import {
  ArrowUpDown,
  Calendar,
  ChevronRight,
  CheckSquare,
  ExternalLink,
  Activity,
  Info,
  MoreHorizontal,
  Plus,
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
  showChecklist,
  showFeatures,
  getFeatureBadgeProps,
  Sparkline,
  virtualRow
}: any) => {
  return (
    <tr
              key={virtualRow.index}
              className={`hover:bg-slate-50 transition-colors cursor-pointer group hover:relative hover:z-[100] ${selectedRows.includes(p.id) ? 'bg-primary/5' : 'bg-white'}`}
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
              <td className="sticky left-12 z-20 group-hover:z-[110] bg-inherit border-r-0 px-4 py-2 font-semibold text-foreground">
                <TruncatedText
                  text={p.name || 'Unnamed Project'}
                  className="max-w-[250px] 2xl:max-w-[400px] group-hover:text-primary transition-colors"
                />
              </td>
              <td className="px-4 py-2 text-muted-foreground">
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
                    <div className="flex items-center gap-2 hover:text-primary transition-colors hover:bg-slate-100 px-2 py-1 -ml-2 rounded-md group">
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
                      <div className="cursor-pointer hover:-translate-y-0.5 hover:shadow-sm transition-all rounded-full inline-block">
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
                      <div className="cursor-pointer hover:-translate-y-0.5 hover:shadow-sm transition-all rounded-full inline-block">
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
                        <div className="cursor-pointer hover:-translate-y-0.5 hover:shadow-sm transition-all rounded-full inline-block">
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
                        <div className="cursor-pointer hover:-translate-y-0.5 hover:shadow-sm transition-all rounded-full inline-block">
                          {getSettingBadge('phases', p.onboardingPhase, settings)}
                        </div>
                      }
                    />
                  </div>
                </td>
              )}
              <td className="px-4 py-2 text-right font-medium text-foreground">
                {p.units ? parseInt(p.units).toLocaleString() : '0'}
              </td>
              {showChecklist && (
                <td
                  className="px-4 py-2 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (p.checklistUrl) {
                      const url = p.checklistUrl.match(/^https?:\/\//)
                        ? p.checklistUrl
                        : `https://${p.checklistUrl}`;
                      window.open(url, '_blank');
                    } else openDrawer('project', p.id, { targetTab: 'overview' });
                  }}
                >
                  {p.checklistUrl ? (
                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-input shadow-sm text-xs font-medium hover:bg-slate-50 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <ExternalLink className="w-3.5 h-3.5" /> Link
                    </button>
                  ) : (
                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-transparent text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-50">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  )}
                </td>
              )}
              {showFeatures && (
                <td
                  className="px-4 py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDrawer('project', p.id, { targetTab: 'features' });
                  }}
                >
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
                    return (
                      <div className="flex items-center justify-center gap-2.5 group/feature cursor-pointer">
                        <div className="w-[50px] shrink-0 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors.fill} transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-[11px] font-bold tabular-nums w-8 text-right transition-colors ${colors.text} group-hover/feature:text-primary`}
                        >
                          {pct}%
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
    const showChecklist = groupA;
    const showHealthScore = groupB || groupC;
    const showFeatures = groupB || groupC;

    const columnCount =
        4 + // Checkbox, Name, Client, Release Date
        (showHealthScore ? 1 : 0) +
        2 + // Manager, Status
        (showTimeline ? 1 : 0) +
        (showPhase ? 1 : 0) +
        1 + // Live Units
        (showChecklist ? 1 : 0) +
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
            <th className="sticky left-12 z-[160] bg-slate-50/90 backdrop-blur-md border-b border-border border-r-0 px-4 py-2 group/th">
              <div className="flex items-center">
                <div
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2"
                  onClick={() => onSort('name')}
                >
                  Project Name
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
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2"
                  onClick={() => onSort('clients')}
                >
                  Client(s)
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
                    className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2"
                    onClick={() => onSort('healthScore')}
                  >
                    Health Score
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
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2"
                  onClick={() => onSort('releaseDateVal')}
                >
                  Release Date
                </div>
                {setReleaseDateFilter && (
                  <DateFilter dateRange={releaseDateFilter} setDateRange={setReleaseDateFilter} />
                )}
              </div>
            </th>
            <th className="border-b border-border px-4 py-2 min-w-[120px] group/th">
              <div className="flex items-center">
                <div
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2"
                  onClick={() => onSort('assignee')}
                >
                  Manager
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
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2"
                  onClick={() => onSort('projectStatus')}
                >
                  Project Status
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
                    className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2"
                    onClick={() => onSort('timelineStatus')}
                  >
                    Delivery Status
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
                    className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap mr-2"
                    onClick={() => onSort('onboardingPhase')}
                  >
                    Implementation Status
                  </div>
                  {setPhaseFilter && (
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
              <div className="flex items-center justify-end">
                <div
                  className="cursor-pointer hover:text-slate-800 transition-colors whitespace-nowrap"
                  onClick={() => onSort('units')}
                >
                  Live Units
                </div>
              </div>
            </th>
            {showChecklist && (
              <th className="border-b border-border px-4 py-2 min-w-[130px] group/th">
                <div className="flex items-center justify-center whitespace-nowrap">Checklist</div>
              </th>
            )}
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
          onSort, setNameFilter, nameFilter, allNames,
          setClientFilter, clientFilter, allClients,
          showHealthScore, setHealthFilter, healthFilter,
          setReleaseDateFilter, releaseDateFilter,
          setManagerFilter, managerFilter, allManagers,
          setStatusFilter, statusFilter,
          showTimeline, setTimelineFilter, timelineFilter, allTimelines,
          showPhase, setPhaseFilter, phaseFilter, allPhases,
          showChecklist,
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
                showChecklist={showChecklist}
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
            <tr>
              <td colSpan={12} className="px-6 py-12">
                <EmptyState
                  icon={CheckSquare}
                  title="No projects found"
                  subtitle="Try adjusting your filters or tab selection."
                />
              </td>
            </tr>
          )}
        </tbody>
        {footerContent && (
          <tfoot className="sticky bottom-0 z-40 bg-slate-50">
            <tr>
              <td
                colSpan={100}
                className="px-[128px] py-[12px] h-[45px] border-t border-border shadow-[0_-1px_2px_rgba(0,0,0,0.02)] rounded-b-xl"
              >
                {footerContent}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    );
  }
);
