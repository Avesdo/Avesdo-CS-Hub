import React, { useState, useMemo } from 'react';
import { Briefcase } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useUI } from '../../../context/UIContext';
import { getSafeHex, hexToRgba, renderIcon } from '../../../utils/uiUtils';

interface ProjectServicesTabProps {
  project: any;
}

export default function ProjectServicesTab({ project }: ProjectServicesTabProps) {
  const { services, settings } = useAppStore();
  const { openDrawer, openModal } = useUI();
  const [filter, setFilter] = useState<string>('All');

  const projectServices = useMemo(() => {
    return services
      .filter((s) => {
        const pId = project?.id || project?.projectId;
        return s.projectId === pId || (Array.isArray(s.projectIds) && s.projectIds.includes(pId));
      })
      .sort((a: any, b: any) => {
        const valA = a.dateVal || 0;
        const valB = b.dateVal || 0;
        return valB - valA;
      });
  }, [services, project]);

  const displayedServices = useMemo(() => {
    return projectServices.filter((s) => filter === 'All' || s.type === filter);
  }, [projectServices, filter]);

  const filterTabs = useMemo(() => {
    const types = settings?.serviceTypes?.map((t: any) => t.name) || ['Included', 'Additional'];
    return ['All', ...types];
  }, [settings?.serviceTypes]);

  const parseCurrency = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const formatCurrency = (val: any) => {
    const num = parseCurrency(val);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="font-semibold text-foreground text-sm">Project Services</h3>
          <p className="text-xs text-muted-foreground mt-1">
            All service history logged specifically to this project.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-border mt-2">
        <div role="tablist" className="flex overflow-x-auto custom-thin-scroll -mb-px">
          {filterTabs.map((t) => (
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

      <div className="flex flex-col space-y-3 pt-2" id="pd-services-list">
        {displayedServices.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl bg-slate-50/50 px-6 py-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-medium">
              No services found for this project.
            </p>
          </div>
        ) : (
          displayedServices.map((s: any) => {
            // Resolve dynamic color and icon based on settings.serviceTypes definition
            const serviceTypeDef =
              settings?.serviceTypes?.find((item: any) => item.name === s.type) || {};
            const hex = getSafeHex(serviceTypeDef.color, 'slate');
            const IconElement = serviceTypeDef.icon ? (
              renderIcon(serviceTypeDef.icon, 'w-4 h-4')
            ) : (
              <Briefcase className="w-4 h-4" />
            );

            return (
              <div
                key={s.id}
                onClick={() => openDrawer('service', s.id, { targetTab: 'details' })}
                className="flex items-center justify-between px-4 py-3 bg-white border border-border rounded-lg shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: hexToRgba(hex, 0.1),
                      color: hex,
                      borderColor: hexToRgba(hex, 0.2),
                    }}
                  >
                    {IconElement}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm leading-tight tracking-tight group-hover:text-primary transition-colors duration-200">
                        {s.name}
                      </span>
                      {s.type === 'Additional' &&
                        (() => {
                          const displayStatus =
                            s.outcome && s.outcome !== 'Pending'
                              ? s.outcome
                              : s.status || s.outcome;
                          if (!displayStatus) return null;

                          const statusDef = settings?.settingsData?.find(
                            (item: any) =>
                              (item.category === 'ServiceOutcome' ||
                                item.category === 'ServiceStatus') &&
                              item.name === displayStatus
                          );

                          if (statusDef) {
                            const hex = getSafeHex(statusDef.color, 'slate');
                            return (
                              <span
                                className="p-1 rounded-md border shadow-sm flex items-center justify-center shrink-0 transition-colors"
                                style={{
                                  backgroundColor: hexToRgba(hex, 0.1),
                                  color: hex,
                                  borderColor: hexToRgba(hex, 0.2),
                                }}
                                title={displayStatus}
                              >
                                {renderIcon(statusDef.icon, 'w-3.5 h-3.5')}
                              </span>
                            );
                          }
                          return (
                            <span
                              className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded-sm bg-slate-100 text-slate-600"
                              title={displayStatus}
                            >
                              {displayStatus}
                            </span>
                          );
                        })()}
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-0.5">
                      {s.clientName || s.clients?.[0] || 'Unknown Client'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  {s.type !== 'Included' && (
                    <span className="font-bold text-slate-800 text-sm leading-tight">
                      {formatCurrency(s.price || s.cost || s.value || 0)}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium mt-0.5">
                    {s.dateStr || 'TBD'}
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
