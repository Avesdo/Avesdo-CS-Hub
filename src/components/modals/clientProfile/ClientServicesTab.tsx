import React, { useState, useMemo } from 'react';
import { Briefcase, Plus, DollarSign, Target, Clock, AlertCircle, User, Search } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useUI } from '../../../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip as UITooltip } from '../../ui/Tooltip';
import { getSafeHex, hexToRgba, renderIcon } from '../../../utils/uiUtils';

interface ClientServicesTabProps {
  client: any;
}

export default function ClientServicesTab({ client }: ClientServicesTabProps) {
  const services = useAppStore(state => state.services);
  const settings = useAppStore(state => state.settings);
  const { openDrawer, openModal } = useUI();
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

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
    let result = sortedServices;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.name?.toLowerCase().includes(q) || s.project?.toLowerCase().includes(q));
    }
    return result.filter((s) => filter === 'All' || s.type === filter);
  }, [sortedServices, filter, searchQuery]);

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
            <h3 className="text-slate-500 text-sm font-medium">Total Value</h3>
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

      {/* Glassmorphic Filter Tabs & Search */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md pt-2 pb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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
        
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
          />
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
                There are no {filter !== 'All' ? filter.toLowerCase() : ''} services attached to this client. Click 'Add Service' to log one.
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
                          {s.projectName || 'Client Level Service'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <span className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {s.manager || s.owner || s.assignedTo || 'Unassigned'}
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
                      <span className="font-semibold text-slate-400 text-sm tracking-wide">Included</span>
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
