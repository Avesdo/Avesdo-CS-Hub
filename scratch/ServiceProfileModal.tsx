import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Pencil,
  Check,
  ChevronDown,
  Trash2,
  AlertTriangle,
  FileText,
  Activity,
  User,
import { DatePicker } from '../ui/DatePicker';  Layers,
  Target,
  Briefcase,
  Calendar
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import { getSettingBadge, COLOR_MAP, hexToRgba, renderIcon } from '../../utils/uiUtils';
import {
  updateServiceRecord,
  addAutoLog,
  addProjectAutoLog,
  deleteServiceRecord,
  addServiceAutoLog,
} from '../../api/dbService';

import ServiceDetailsTab from './service/ServiceDetailsTab';
import { TimelineTab } from '../ui/TimelineTab';
import { Select } from '../ui/Select';
import { MultiSelect } from '../ui/MultiSelect';
import { Tooltip } from '../ui/Tooltip';
import { DatePicker } from '../ui/DatePicker';

const TokenTrigger = ({ label, value, icon: Icon, error, onClick, className = '' }: any) => {
  const isSuspended = value === 'Lost' || value === 'Not Accepted';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center h-10 px-4 rounded-full border shadow-sm transition-all duration-200 active:scale-95 hover:shadow-md focus:ring-2 w-full justify-between ${
        error ? 'border-destructive bg-white focus:border-destructive focus:ring-destructive/20' : 
        isSuspended ? 'bg-red-50/80 border-red-200 hover:border-red-300 focus:border-red-400 focus:ring-red-500/20' : 
        'bg-white border-slate-200 hover:border-primary/50 focus:border-primary focus:ring-primary/20'
      } ${className}`}
    >
      <div className="flex items-center truncate">
        {Icon && <Icon className={`w-4 h-4 transition-colors mr-2 shrink-0 ${isSuspended ? 'text-red-500 group-hover:text-red-600' : 'text-slate-400 group-hover:text-primary'}`} />}
        <span className={`text-[13px] font-medium mr-2 ${isSuspended ? 'text-red-600/80' : 'text-slate-500'}`}>{label}:</span>
        <span className={`text-[13px] font-semibold truncate ${
          isSuspended ? 'text-red-700' :
          value ? 'text-slate-900' : 'text-slate-400'
        }`}>
          {value || 'Select'}
        </span>
      </div>
      <ChevronDown className={`w-3.5 h-3.5 ml-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isSuspended ? 'text-red-400' : 'text-slate-400'}`} />
    </button>
  );
};

export default function ServiceProfileModal() {
  const { isDrawerOpen, getDrawerData, closeDrawer } = useUI();
  const services = useAppStore(state => state.services);
  const settings = useAppStore(state => state.settings);
  const user = useAppStore(state => state.user);

  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isConfirmingDelete) {
      const timer = setTimeout(() => setIsConfirmingDelete(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingDelete]);

  const isOpen = isDrawerOpen('service');
  const drawerData = getDrawerData('service');
  const service = services.find((s) => s.id === drawerData?.entityId);

  const clientNames =
    service?.clientName || (service?.clients?.length ? service.clients.join(', ') : null);
  const projectName =
    service?.projectName && service.projectName !== 'N/A' ? service.projectName : null;

  const relationalContext = clientNames
    ? projectName
      ? `${clientNames} • ${projectName}`
      : `${clientNames} • Client Level Service`
    : 'Orphaned Service';

  useEffect(() => {
    if (service) {
      setEditNameValue(service.name || '');
      setIsConfirmingDelete(false);
    }
  }, [service]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
    }
  }, [isOpen, drawerData?.entityId]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditingName(false);
    }
  }, [isOpen]);

  const handleUpdateName = async () => {
    if (!service || !editNameValue.trim() || editNameValue === service.name) {
      setIsEditingName(false);
      return;
    }
    setIsEditingName(false);
    try {
      const oldName = service.name || 'Unnamed Service';
      const newName = editNameValue.trim();
      await updateServiceRecord(
        { ...service, name: newName },
        {
          successMsg: `Service Name successfully updated to '${newName}'.`,
          errorMsg: `Failed to update Service Name to '${newName}'.`,
        },
        `Service name updated from "${oldName}" to "${newName}"`,
        user?.name
      );

      if (service.clientIds) {
        for (const cid of service.clientIds) {
          await addAutoLog(
            cid,
            `Service name updated from "${oldName}" to "${newName}"`,
            user?.name || 'System',
            true
          );
        }
      }
      const pIds1 =
        service.projectIds ||
        (service.projectId && service.projectId !== 'N/A' ? [service.projectId] : []);
      for (const pId of pIds1) {
        await addProjectAutoLog(
          pId,
          `Service name updated from "${oldName}" to "${newName}"`,
          user?.name || 'System',
          true
        );
      }
    } catch (err) {
      setEditNameValue(service.name || '');
    }
  };

  const handleUpdateManager = async (manager: string) => {
    if (!service || service.manager === manager) return;
    const oldManager = service.manager || 'Unassigned';
    await updateServiceRecord(
      { ...service, manager },
      {
        successMsg: `Manager successfully updated for '${service.name}'.`,
        errorMsg: `Failed to update manager for '${service.name}'.`,
      },
      `Manager changed from ${oldManager} to ${manager}`,
      user?.name
    );
  };

  const handleUpdateStatus = async (status: string) => {
    if (!service || service.status === status) return;
    const oldStatus = service.status || 'Unknown';
    const updates: any = { status };

    if (status === 'Accepted') {
      updates.outcome = 'Won';
    } else if (status === 'Not Accepted') {
      updates.outcome = 'Lost';
    } else if (status === 'Completed') {
      updates.dateVal = new Date().getTime();
      updates.dateStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    await updateServiceRecord(
      { ...service, ...updates },
      {
        successMsg: `Status successfully updated for '${service.name}'.`,
        errorMsg: `Failed to update status for '${service.name}'.`,
      },
      `Status changed from ${oldStatus} to ${status}`,
      user?.name
    );

    if (status === 'Completed') {
      if (service.clientIds) {
        for (const cid of service.clientIds) {
          await addAutoLog(
            cid,
            `Service "${service.name}" status changed from ${oldStatus} to ${status}`,
            user?.name || 'System',
            true
          );
        }
      }
      const pIds2 =
        service.projectIds ||
        (service.projectId && service.projectId !== 'N/A' ? [service.projectId] : []);
      for (const pId of pIds2) {
        await addProjectAutoLog(
          pId,
          `Service "${service.name}" status changed from ${oldStatus} to ${status}`,
          user?.name || 'System',
          true
        );
      }
    }
  };

  const handleUpdateOutcome = async (outcome: string) => {
    if (!service || service.outcome === outcome) return;
    const oldOutcome = service.outcome || 'Unknown';
    const updates: any = { outcome };

    if (outcome === 'Won') updates.status = 'Accepted';
    if (outcome === 'Lost') updates.status = 'Not Accepted';

    await updateServiceRecord(
      { ...service, ...updates },
      {
        successMsg: `Outcome successfully updated for '${service.name}'.`,
        errorMsg: `Failed to update outcome for '${service.name}'.`,
      },
      `Outcome changed from ${oldOutcome} to ${outcome}`,
      user?.name
    );
  };

  const handleUpdateType = async (type: string) => {
    if (!service || service.type === type) return;
    const oldType = service.type || 'Unknown';
    const updates: any = { type };

    if (type === 'Included') {
      updates.price = 0;
      updates.outcome = 'Included';
      updates.status = 'Awaiting Inputs';
      updates.invoicePaid = false;
      updates.invoiceSent = false;
      updates.invoiceNum = 'N/A';
      updates.commission = 0;
      updates.commPaid = false;
    } else {
      updates.status = 'Proposal Sent';
      updates.outcome = 'Proposal Sent';
    }

    await updateServiceRecord(
      { ...service, ...updates },
      {
        successMsg: `Type successfully updated for '${service.name}'.`,
        errorMsg: `Failed to update type for '${service.name}'.`,
      },
      `Service Type changed from ${oldType} to ${type}`,
      user?.name
    );
  };

  const handleConfirmDelete = async () => {
    if (!service) return;
    setIsConfirmingDelete(false);
    try {
      await deleteServiceRecord(service.id, service.name || 'Record', user?.name || 'System');

      if (service.clientIds) {
        for (const cid of service.clientIds) {
          await addAutoLog(cid, `Service "${service.name}" archived`, user?.name || 'System', true);
        }
      }
      const pIds3 =
        service.projectIds ||
        (service.projectId && service.projectId !== 'N/A' ? [service.projectId] : []);
      for (const pId of pIds3) {
        await addProjectAutoLog(
          pId,
          `Service "${service.name}" archived`,
          user?.name || 'System',
          true
        );
      }
      await addServiceAutoLog(service.id, `Service archived`, user?.name || 'System');
      closeDrawer();
    } catch (err) {
      console.error('Failed to archive service', err);
    }
  };

  if (!service && isOpen) return null;

  const getStatusIcon = (statusName: string) => {
    const s = settings?.settingsData?.find((x: any) => x.category === 'ServiceStatus' && x.name === statusName);
    const iconName = s?.icon;
    if (!iconName) return Activity;
    const IconMatch = Object.entries(LucideIcons).find(
      ([key]) => key.toLowerCase() === iconName.toLowerCase().replace(/-/g, '')
    )?.[1] as any;
    return IconMatch || Activity;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeDrawer()} modal={true}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999]"
              />
            </Dialog.Overlay>
            <Dialog.Content
              onEscapeKeyDown={(e) => {
                e.preventDefault();
                closeDrawer();
              }}
              onInteractOutside={(e) => {
                e.preventDefault();
                closeDrawer();
              }}
              asChild
            >
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[95vw] max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 flex"
              >
                {/* LEFT SIDEBAR */}
                <div className="w-[320px] bg-slate-50/80 border-r border-slate-200/60 flex flex-col shrink-0">
                  <div className="p-6 pb-4">
                    {isEditingName ? (
                      <div className="flex items-start justify-between rounded-xl -mx-3 px-3 py-2 bg-slate-100/50">
                        <textarea
                          ref={(el) => {
                            if (el) {
                              el.style.height = 'auto';
                              el.style.height = el.scrollHeight + 'px';
                            }
                          }}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                          }}
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleUpdateName();
                            }
                            if (e.key === 'Escape') {
                              setEditNameValue(service?.name || '');
                              setIsEditingName(false);
                            }
                          }}
                          autoFocus
                          className="w-full bg-transparent text-2xl font-extrabold text-slate-900 tracking-tight leading-tight outline-none resize-none overflow-hidden"
                          rows={1}
                        />
                        <div className="flex items-center gap-1 shrink-0 ml-2 mt-1">
                          <button
                            onClick={handleUpdateName}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors shadow-sm"
                            title="Save"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditNameValue(service?.name || '');
                              setIsEditingName(false);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors shadow-sm"
                            title="Cancel"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="group flex items-start justify-between cursor-pointer rounded-xl -mx-3 px-3 py-2 hover:bg-slate-200/50 transition-colors"
                        onClick={() => setIsEditingName(true)}
                      >
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance break-words">
                          {service?.name || 'Unnamed Service'}
                        </h2>
                        <Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-500 mt-2 block break-words">
                      {relationalContext}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-thin-scroll px-6 pb-6 flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <div>
                        <Select
                          options={(settings?.settingsData || [])
                            .filter((s: any) => s.category === 'ServiceStatus')
                            .map((s: any) => ({ label: s.name, value: s.name }))}
                          value={service?.status || 'Unknown'}
                          onChange={(val) => handleUpdateStatus(val)}
                          trigger={
                            <TokenTrigger
                              label="Status"
                              value={service?.status || 'Unknown'}
                              icon={getStatusIcon(service?.status || 'Unknown')}
                            />
                          }
                        />
                      </div>
                      <div>
                        <Select
                          options={(settings?.managers?.map((m: any) => m.name) || []).map((o: string) => ({ label: o, value: o }))}
                          value={service?.manager || ''}
                          onChange={(val) => handleUpdateManager(val)}
                          trigger={
                            <TokenTrigger
                              label="Manager"
                              value={service?.manager || 'Unassigned'}
                              icon={User}
                            />
                          }
                        />
                      </div>
                      <div>
                        <Select
                          options={(settings?.settingsData || [])
                            .filter((s: any) => s.category === 'ServiceOutcome')
                            .map((s: any) => ({ label: s.name, value: s.name }))}
                          value={service?.outcome || 'Unknown'}
                          onChange={(val) => handleUpdateOutcome(val)}
                          trigger={
                            <TokenTrigger
                              label="Outcome"
                              value={service?.outcome || 'Unknown'}
                              icon={Target}
                            />
                          }
                        />
                      </div>
                      <div>
                        <Select
                          options={(settings?.serviceTypes || []).map((s: any) => ({ label: s.name, value: s.name }))}
                          value={service?.type || 'Unknown'}
                          onChange={(val) => handleUpdateType(val)}
                          trigger={
                            <TokenTrigger
                              label="Type"
                              value={service?.type || 'Unknown'}
                              icon={Briefcase}
                            />
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 mt-auto border-t border-slate-200/60 bg-slate-50/50">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={handleConfirmDelete}
                          className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all focus:ring-2 focus:ring-red-500/20 active:scale-95"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setIsConfirmingDelete(false)}
                          className="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm focus:ring-2 focus:ring-slate-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsConfirmingDelete(true)}
                        className="group flex flex-col items-center justify-center w-full h-10 px-4 rounded-xl border border-transparent hover:bg-red-50 hover:border-red-100 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                          <span className="text-[13px] font-medium">Archive Service</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT PANE */}
                <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                  {/* Decorative Aura */}
                  <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-primary/[0.03] blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                  <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200/60 relative z-10 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`relative pb-1 text-sm font-semibold transition-colors outline-none ${
                          activeTab === 'details' ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Overview
                        {activeTab === 'details' && (
                          <motion.div
                            layoutId="activeTabIndicatorService"
                            className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary rounded-t-full"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className={`relative pb-1 text-sm font-semibold transition-colors outline-none flex items-center gap-2 ${
                          activeTab === 'notes' ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Timeline
                        {activeTab === 'notes' && (
                          <motion.div
                            layoutId="activeTabIndicatorService"
                            className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary rounded-t-full"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={closeDrawer}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        title="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-thin-scroll bg-slate-50/30 p-8 relative z-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        {activeTab === 'details' && <ServiceDetailsTab service={service} />}
                        {activeTab === 'notes' && service && (
                          <TimelineTab
                            notes={service.notes || []}
                            onSaveNotes={async (updatedNotes) => {
                              await updateServiceRecord({ ...service, notes: updatedNotes } as any, {
                                successMsg: `Timeline updated for '${service.name}'.`,
                                errorMsg: `Failed to update timeline for '${service.name}'.`,
                              });
                            }}
                            emptyStateMessage="Be the first to add a note or make changes to generate system logs."
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}