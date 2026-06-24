import React, { useState, useMemo } from 'react';
import { Briefcase, Plus, DollarSign, Target, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useUI } from '../../../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip as UITooltip } from '../../ui/Tooltip';
import { getSettingBadge } from '../../../utils/uiUtils';

interface ClientServicesTabProps {
  client: any;
}

export default function ClientServicesTab({ client }: ClientServicesTabProps) {
  const services = useAppStore(state => state.services);
  const settings = useAppStore(state => state.settings);
  const { openDrawer, openModal } = useUI();
  const [filter, setFilter] = useState<string>('All');

  const clientServicesRaw = useMemo(() => {
    return services.filter((s: any) => {
      const cId = client?.clientId || client?.id;
      const cName = client?.companyName || client?.name;
      const hasClientId = s.clientId === cId || (Array.isArray(s.clientIds) && s.clientIds.includes(cId));
      const hasClientName = s.clientName === cName || (Array.isArray(s.clients) && s.clients.includes(cName));
      return hasClientId || hasClientName;
    });
  }, [services, client]);

  const sortedServices = useMemo(() => {
    return [...clientServicesRaw].sort((a: any, b: any) => {
      const valA = a.dateVal || 0;
      const valB = b.dateVal || 0;
      return valB - valA;
    });
  }, [clientServicesRaw]);

  const displayedServices = useMemo(() => {
    return sortedServices.filter((s) => filter === 'All' || s.type === filter);
  }, [sortedServices, filter]);

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

  const { totalAdditionalValue, includedCount, additionalCount } = useMemo(() => {
    let val = 0;
    let inc = 0;
    let add = 0;

    sortedServices.forEach(s => {
      if (s.type === 'Included') {
        inc++;
      } else {
        add++;
        val += parseCurrency(s.price || s.cost || s.value || 0);
      }
    });

    return { totalAdditionalValue: val, includedCount: inc, additionalCount: add };
  }, [sortedServices]);

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
            Manage all active and historical services attached to this client.
          </p>
        </div>
        <button
          onClick={() => openModal('addService')}
          className="group flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Add Service
        </button>
      </div>

      {/* Top-Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Value Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="relative overflow-hidden bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col justify-between"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <UITooltip content={<span className="text-xs">Total revenue generated from additional services.</span>}>
              <AlertCircle className="w-4 h-4 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
            </UITooltip>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-medium">Additional Value</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{formatCurrency(totalAdditionalValue)}</p>
          </div>
        </motion.div>

        {/* Total Services Count Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="relative overflow-hidden bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group flex flex-col justify-between"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Target className="w-5 h-5" />
            </div>
            <UITooltip content={<span className="text-xs">Total volume of services attached to this client.</span>}>
              <AlertCircle className="w-4 h-4 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
            </UITooltip>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-medium">Total Services</h3>
            <div className="flex items-end gap-3 mt-1">
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{sortedServices.length}</p>
              <p className="text-xs text-slate-500 font-medium pb-1.5">{includedCount} Included • {additionalCount} Additional</p>
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
                className={`relative flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap outline-none ${
                  isActive
                    ? 'text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="clientServiceTypeFilter"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
        <AnimatePresence mode="popLayout">
          {displayedServices.length > 0 ? (
            displayedServices.map((svc, idx) => {
              const val = parseCurrency(svc.price || svc.cost || svc.value || 0);
              return (
                <motion.div
                  key={svc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="group relative bg-white border border-slate-200/60 rounded-xl p-5 hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                  onClick={() => openDrawer('service', svc.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="text-[15px] font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                        {svc.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{svc.projectName || 'Client Level Service'}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {getSettingBadge('serviceTypes', svc.type || 'Additional', settings)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4 bg-slate-50/80 rounded-lg p-2 px-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-[100px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{svc.date || 'No Date'}</span>
                    </div>
                    {val > 0 && (
                      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{formatCurrency(val)} <span className="text-slate-400 font-normal">Value</span></span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-primary">View Details</span>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-20 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-700 font-semibold mb-1">No Services Found</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm">
                We couldn't find any services matching your current filter.
              </p>
              <button
                onClick={() => openModal('addService')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:border-primary/50 hover:text-primary rounded-lg font-semibold text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ChevronRight = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"></polyline></svg>
);
