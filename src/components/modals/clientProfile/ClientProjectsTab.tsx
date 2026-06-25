import React, { useState, useMemo } from 'react';
import { Layers, Plus, DollarSign, Target, Clock, AlertCircle, User, Calendar, Briefcase, Building2, Search } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useUI } from '../../../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip as UITooltip } from '../../ui/Tooltip';
import { getSafeHex, hexToRgba, getSettingBadge, renderIcon } from '../../../utils/uiUtils';

interface ClientProjectsTabProps {
  client: any;
}

export default function ClientProjectsTab({ client }: ClientProjectsTabProps) {
  const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);
  const { openDrawer, openModal } = useUI();
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const clientProjects = useMemo(() => {
    const cId = client?.clientId || client?.id;
    return projects
      .filter((p) => p.clientIds?.includes(cId))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [projects, client]);

  const { totalProjects, onboardingCount, activeCount, closedCount, hasSuspended, totalUnits } = useMemo(() => {
    let ob = 0;
    let act = 0;
    let cls = 0;
    let suspended = false;
    let units = 0;
    let totalProj = 0;

    clientProjects.forEach(p => {
      const status = p.status || p.projectStatus;
      units += parseInt(p.units as any) || 0;
      
      if (status === 'Cancelled') return;
      
      totalProj++;
      if (status === 'Onboarding') ob++;
      else if (status === 'Active' || status === 'Suspended') {
        act++;
        if (status === 'Suspended') suspended = true;
      }
      else if (['Closed', 'Completed', 'Lost', 'Churned'].includes(status)) cls++;
    });

    return { totalProjects: totalProj, onboardingCount: ob, activeCount: act, closedCount: cls, hasSuspended: suspended, totalUnits: units };
  }, [clientProjects]);

  const filterTabs = useMemo(() => {
    const tabs = ['All', 'Onboarding', 'Active', 'Closed'];
    if (hasSuspended) tabs.splice(3, 0, 'Suspended');
    return tabs;
  }, [hasSuspended]);

  const displayedProjects = useMemo(() => {
    let result = clientProjects;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name?.toLowerCase().includes(q));
    }

    return result.filter((p) => {
      const status = p.status || p.projectStatus;
      
      if (filter === 'All') return true;
      if (filter === 'Closed') return ['Closed', 'Completed', 'Lost', 'Churned'].includes(status);
      if (filter === 'Active') return status === 'Active';
      if (filter === 'Onboarding') return status === 'Onboarding';
      if (filter === 'Suspended') return status === 'Suspended';
      return status === filter;
    });
  }, [clientProjects, filter, searchQuery]);

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

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Header & Quick Actions */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            Project Portfolio
          </h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Manage all projects attached to this client.
          </p>
        </div>
        <button
          onClick={() => openModal('addProject')}
          className="group flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Add Project
        </button>
      </div>

      {/* Top-Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Projects Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="relative overflow-hidden bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col justify-between"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Building2 className="w-5 h-5" />
            </div>
            <UITooltip content={<span className="text-xs">Total number of projects for this client across all statuses.</span>}>
              <AlertCircle className="w-4 h-4 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
            </UITooltip>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-medium">Total Projects</h3>
            <div className="flex items-end gap-3 mt-1">
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{totalProjects}</p>
              <p className="text-xs text-slate-500 font-medium pb-1.5">{onboardingCount} Onboarding • {activeCount} Active • {closedCount} Closed</p>
            </div>
          </div>
        </motion.div>

        {/* Total Units Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="relative overflow-hidden bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group flex flex-col justify-between"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <UITooltip content={<span className="text-xs">Total volume of units across all projects.</span>}>
              <AlertCircle className="w-4 h-4 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
            </UITooltip>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-medium">Total Units</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{new Intl.NumberFormat('en-US').format(totalUnits)}</p>
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
                    layoutId="clientProjectFilter"
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
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="flex flex-col space-y-3 pb-8">
        <AnimatePresence mode="popLayout">
          {displayedProjects.length === 0 ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 px-6 py-16 flex flex-col items-center justify-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                <Layers className="w-7 h-7 text-slate-300" />
              </div>
              <h4 className="text-[15px] font-bold text-slate-700 tracking-tight">No Projects Found</h4>
              <p className="text-[13px] text-slate-500 mt-1 max-w-[280px]">
                There are no {filter !== 'All' ? filter.toLowerCase() : ''} projects attached to this client. Click 'Add Project' to create one.
              </p>
            </motion.div>
          ) : (
            displayedProjects.map((proj, idx) => {
              const statusDef = settings?.statuses?.find((s: any) => s.name === (proj.status || proj.projectStatus)) || {};
              const hex = getSafeHex(statusDef.color, 'slate');

              return (
                <motion.div
                  key={proj.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  whileHover={{ y: -2 }}
                  onClick={() => openDrawer('project', proj.id)}
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
                      {statusDef.icon ? renderIcon(statusDef.icon, 'w-5 h-5') : <Layers className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-[15px] tracking-tight group-hover:text-primary transition-colors duration-200">
                          {proj.name}
                        </span>
                        
                        {/* Implementation Status Badge */}
                        {getSettingBadge('phases', proj.onboardingPhase || 'Phase 1', settings)}
                      </div>
                      
                      {/* Sub-details */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                          {client?.companyName || client?.name || 'Unknown Client'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <span className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {proj.manager || proj.owner || proj.assignee || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Release Date & Schedule Status */}
                  <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                    <span className="font-bold text-slate-800 text-[14px] tracking-tight flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {(() => {
                        const dateVal = proj.releaseDateVal || (proj.releaseDate ? new Date(proj.releaseDate).getTime() : 0);
                        return dateVal ? new Date(dateVal).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unscheduled';
                      })()}
                    </span>
                    
                    {(proj.status === 'Onboarding' || proj.projectStatus === 'Onboarding') && (
                      <div className="mt-1.5">
                        {getSettingBadge('timelines', proj.timelineStatus || 'Not Started', settings)}
                      </div>
                    )}
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

