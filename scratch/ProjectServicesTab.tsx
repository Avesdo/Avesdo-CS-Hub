import React, { useState, useMemo } from 'react';
import { Briefcase, Plus, DollarSign, Target, Clock, AlertCircle, User, Search } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useUI } from '../../../context/UIContext';
import { getSafeHex, hexToRgba, renderIcon } from '../../../utils/uiUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectServicesTabProps {
  project: any;
}

export default function ProjectServicesTab({ project }: ProjectServicesTabProps) {
  const services = useAppStore(state => state.services);
  const settings = useAppStore(state => state.settings);
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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  // --- Derived Metrics ---
  const { totalAdditionalValue, wonCount, pendingCount } = useMemo(() => {
    let val = 0;
    let won = 0;
    let pending = 0;

    projectServices.forEach(s => {
      // Calculate Total Value of non-included services
      if (s.type !== 'Included') {
        val += parseCurrency(s.price || s.cost || s.value || 0);
      }

      // Calculate Statuses
      const status = s.outcome || s.status || '';
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes('won') || lowerStatus.includes('closed') || lowerStatus.includes('active')) won++;
      if (lowerStatus.includes('pending') || lowerStatus.includes('progress') || lowerStatus.includes('discovery')) pending++;
    });

    return { totalAdditionalValue: val, wonCount: won, pendingCount: pending };
  }, [projectServices]);

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Header & Quick Actions */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Service Portfolio
          </h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Manage all active and historical services attached to this project.
          </p>
        </div>
        <button
          onClick={() => openModal('addService')}
          className="group flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg font-semibold text-sm transition-all duration-200"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Add Service
        </button>
      </div>

      {/* Top-Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Value Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-60 pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Service Value</span>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(totalAdditionalValue)}</span>
            <span className="text-xs text-slate-500 font-medium">Total active additional revenue</span>
          </div>
        </motion.div>

        {/* Total Services Count */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="relative overflow-hidden bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-60 pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Attachments</span>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{projectServices.length}</span>
            <span className="text-xs text-slate-500 font-medium">Combined included & additional</span>
          </div>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="relative overflow-hidden bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group"
        >
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-60 pointer-events-none transition-transform group-hover:scale-110"></div>
           <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 text-indigo-600 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Status Overview</span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-slate-900">{wonCount}</span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Won</span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-slate-900">{pendingCount}</span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Pending</span>
              </div>
            </div>
           </div>
        </motion.div>
      </div>

      {/* Glassmorphic Filter Tabs */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md pt-2 pb-4">
        <div className="inline-flex bg-slate-100/80 p-1 rounded-xl shadow-inner overflow-x-auto custom-thin-scroll max-w-full">
          {filterTabs.map((t) => {
            const isActive = filter === t;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`relative flex items-center justify-center px-5 py-2 text-[13px] font-bold transition-all duration-300 whitespace-nowrap rounded-lg z-10 outline-none ${
                  isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="serviceFilterTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] pointer-events-none"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-20">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div className="flex flex-col space-y-3" id="pd-services-list">
        <AnimatePresence mode="popLayout">
          {displayedServices.length === 0 ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 px-6 py-16 flex flex-col items-center justify-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                <Briefcase className="w-7 h-7 text-slate-300" />
              </div>
              <h4 className="text-[15px] font-bold text-slate-700 tracking-tight">No Services Found</h4>
              <p className="text-[13px] text-slate-500 mt-1 max-w-[280px]">
                There are no {filter !== 'All' ? filter.toLowerCase() : ''} services attached to this project. Click 'Add Service' to log one.
              </p>
            </motion.div>
          ) : (
            displayedServices.map((s: any, idx: number) => {
              // Resolve dynamic color and icon based on settings.serviceTypes definition
              const serviceTypeDef = settings?.serviceTypes?.find((item: any) => item.name === s.type) || {};
              const hex = getSafeHex(serviceTypeDef.color, 'slate');
              const IconElement = serviceTypeDef.icon ? renderIcon(serviceTypeDef.icon, 'w-5 h-5') : <Briefcase className="w-5 h-5" />;

              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  whileHover={{ y: -2 }}
                  onClick={() => openDrawer('service', s.id, { targetTab: 'details' })}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer group gap-4"
                >
                  {/* Left Side: Icon & Details */}
                  <div className="flex items-center gap-4">
                    <div
                      className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: hexToRgba(hex, 0.08),
                        color: hex,
                      }}
                    >
                      {IconElement}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-[15px] tracking-tight group-hover:text-primary transition-colors duration-200">
                          {s.name}
                        </span>
                        
                        {/* Status Badge */}
                        {s.type === 'Additional' && (() => {
                          const displayStatus = s.outcome && s.outcome !== 'Pending' ? s.outcome : s.status || s.outcome;
                          if (!displayStatus) return null;

                          const statusDef = settings?.settingsData?.find(
                            (item: any) => (item.category === 'ServiceOutcome' || item.category === 'ServiceStatus') && item.name === displayStatus
                          );

                          if (statusDef) {
                            const statusHex = getSafeHex(statusDef.color, 'slate');
                            return (
                              <span
                                className="px-2 py-0.5 rounded-md flex items-center gap-1.5 shrink-0 transition-colors"
                                style={{ backgroundColor: hexToRgba(statusHex, 0.08), color: statusHex }}
                              >
                                {renderIcon(statusDef.icon, 'w-3 h-3')}
                                <span className="text-[11px] font-bold tracking-wide">{displayStatus}</span>
                              </span>
                            );
                          }
                          return (
                            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wide rounded-md bg-slate-100 text-slate-600">
                              {displayStatus}
                            </span>
                          );
                        })()}
                      </div>
                      
                      {/* Sub-details */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                          {s.clientName || s.clients?.[0] || 'Unknown Client'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Financials & Dates */}
                  <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                    {s.type !== 'Included' ? (
                      <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                        {formatCurrency(s.price || s.cost || s.value || 0)}
                      </span>
                    ) : (
                      <span className="font-bold text-slate-400 text-sm tracking-wide uppercase">Included</span>
                    )}
                    <span className="text-[12px] font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {s.dateStr || 'TBD'}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
