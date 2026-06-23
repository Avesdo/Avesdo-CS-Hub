import React, { useState, useMemo } from 'react';
import { Folder } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useUI } from '../../../context/UIContext';
import {
  getHealthBadge,
  getSettingBadge,
  getSafeHex,
  hexToRgba,
  renderIcon,
} from '../../../utils/uiUtils';
import { calculateProjectHealth } from '../../../utils/scoringUtils';

interface ClientProjectsTabProps {
  client: any;
}

type FilterType = 'All' | 'Active' | 'Onboarding' | 'Closed';

export default function ClientProjectsTab({ client }: ClientProjectsTabProps) {
  const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);
  const { openDrawer } = useUI();

  const [filter, setFilter] = useState<FilterType>('Active');

  const clientProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.clientIds?.includes(client?.clientId || client?.id) ||
        p.clients?.includes(client?.companyName || client?.name)
    );
  }, [projects, client]);

  const activeProjects = useMemo(() => {
    return clientProjects
      .filter((p) => p.projectStatus === 'Active' || p.projectStatus === 'Suspended')
      .sort((a: any, b: any) => (b.releaseDateVal || 0) - (a.releaseDateVal || 0));
  }, [clientProjects]);

  const onboardingProjects = useMemo(() => {
    return clientProjects
      .filter((p) => p.projectStatus === 'Onboarding')
      .sort((a: any, b: any) => {
        const valA = a.releaseDateVal || Infinity;
        const valB = b.releaseDateVal || Infinity;
        return valA - valB;
      });
  }, [clientProjects]);

  const closedProjects = useMemo(() => {
    return clientProjects
      .filter(
        (p) =>
          p.projectStatus === 'Closed' ||
          p.projectStatus === 'Completed' ||
          p.projectStatus === 'Cancelled' ||
          p.projectStatus === 'Churned'
      )
      .sort((a: any, b: any) => (b.releaseDateVal || 0) - (a.releaseDateVal || 0));
  }, [clientProjects]);

  const getDisplayedProjects = () => {
    if (filter === 'All')
      return [...clientProjects].sort(
        (a: any, b: any) => (b.releaseDateVal || 0) - (a.releaseDateVal || 0)
      );
    if (filter === 'Active') return activeProjects;
    if (filter === 'Onboarding') return onboardingProjects;
    return closedProjects;
  };

  const displayedProjects = getDisplayedProjects();

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-end mb-1">
        <div>
          <h3 className="font-semibold text-foreground text-sm">Client Projects</h3>
          <p className="text-xs text-muted-foreground mt-1">
            All projects associated with this client.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-border mt-2">
        <div role="tablist" className="flex overflow-x-auto custom-thin-scroll -mb-px">
          {(['All', 'Active', 'Onboarding', 'Closed'] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all active:scale-95 whitespace-nowrap outline-none ${filter === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-3 pt-2" id="drawerProjectList">
        {displayedProjects.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl bg-slate-50/50 px-6 py-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-3">
              <Folder className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-medium">
              No {filter === 'All' ? '' : filter.toLowerCase()} projects found.
            </p>
          </div>
        ) : (
          displayedProjects.map((p: any) => {
            const isSuspended = p.projectStatus === 'Suspended';
            const isActive = p.projectStatus === 'Active' || isSuspended;
            const isOnboarding = p.projectStatus === 'Onboarding';

            // Resolve dynamic color and icon based on settings.statuses definition
            const statusDef: any =
              settings?.statuses?.find((item: any) => item.name === p.projectStatus) || {};
            const hex = getSafeHex(statusDef.color, 'slate');
            const IconElement = statusDef.icon ? (
              renderIcon(statusDef.icon, 'w-4 h-4')
            ) : (
              <Folder className="w-4 h-4" />
            );

            return (
              <div
                key={p.id}
                onClick={() => openDrawer('project', p.id)}
                className="flex items-center justify-between px-4 py-3 bg-white border border-border rounded-lg shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-colors group-hover:border-primary/30"
                    style={{
                      backgroundColor: hexToRgba(hex, 0.1),
                      color: hex,
                      borderColor: hexToRgba(hex, 0.2),
                    }}
                  >
                    {IconElement}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-slate-800 text-sm leading-tight tracking-tight group-hover:text-primary transition-colors duration-200">
                      {p.name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  {isActive && (
                    <div className="mb-1">
                      {getHealthBadge(calculateProjectHealth(p, settings).totalScore, settings)}
                    </div>
                  )}
                  {isOnboarding && (
                    <div className="mb-1 flex items-center gap-1 scale-90 origin-right justify-end">
                      {getSettingBadge('phases', p.onboardingPhase, settings)}
                      {getSettingBadge('timelines', p.timelineStatus, settings)}
                    </div>
                  )}
                  <span className="text-xs text-slate-500 font-medium mt-0.5">
                    {p.releaseDateStr || 'TBD'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
