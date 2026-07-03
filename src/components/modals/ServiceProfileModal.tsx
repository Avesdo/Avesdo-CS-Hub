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
  Layers,
  Target,
  Briefcase,
  Calendar,
  Building,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
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
import { usePermissions } from '../../hooks/usePermissions';
import { TruncatedText } from '../../components/ui/TruncatedText';

const TokenTrigger = ({
  label,
  value,
  icon: Icon,
  error,
  onClick,
  className = '',
  disabled,
}: any) => {
  const isSuspended = value === 'Lost' || value === 'Not Accepted';
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`group flex items-center h-10 px-4 rounded-full border shadow-sm transition-all duration-200 w-full justify-between ${
        disabled
          ? 'opacity-80 bg-slate-50 cursor-not-allowed border-slate-200'
          : error
            ? 'border-destructive bg-white focus:border-destructive focus:ring-destructive/20 active:scale-95'
            : isSuspended
              ? 'bg-red-50/80 border-red-200 hover:border-red-300 focus:border-red-400 focus:ring-red-500/20 active:scale-95'
              : 'bg-white border-slate-200 hover:border-primary/50 hover:shadow-md focus:border-primary focus:ring-2 focus:ring-primary/20 active:scale-95'
      } ${className}`}
    >
      <div className="flex items-center truncate">
        {Icon && (
          <Icon
            className={`w-4 h-4 transition-colors mr-2 shrink-0 ${isSuspended ? 'text-red-500 group-hover:text-red-600' : 'text-slate-400 group-hover:text-primary'}`}
          />
        )}
        <span
          className={`text-[13px] font-medium mr-2 ${isSuspended ? 'text-red-600/80' : 'text-slate-500'}`}
        >
          {label}:
        </span>
        <TruncatedText
          text={String('' + value || 'Select' + '')}
          containerClassName={`text-[13px] font-semibold ${isSuspended ? 'text-red-700' : value ? 'text-slate-900' : 'text-slate-400'}`}
        >
          {value || 'Select'}
        </TruncatedText>
      </div>
      <ChevronDown
        className={`w-3.5 h-3.5 ml-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isSuspended ? 'text-red-400' : 'text-slate-400'}`}
      />
    </button>
  );
};

const ReadOnlyPill = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-center h-10 px-4 rounded-full border border-slate-200 bg-slate-100/50 shadow-sm w-full">
    <div className="flex items-center w-full">
      {Icon && <Icon className="w-4 h-4 text-slate-400 mr-2 shrink-0" />}
      <span className="text-[13px] font-medium mr-2 text-slate-500 shrink-0">{label}:</span>
      <TruncatedText
        text={String('' + value || 'N/A' + '')}
        containerClassName="text-[13px] font-semibold text-slate-700 flex-1 min-w-0"
      >
        {value || 'N/A'}
      </TruncatedText>
    </div>
  </div>
);

const ContactInputPill = ({ value, onChange, onBlur, disabled }: any) => (
  <div
    className={`flex items-center h-10 px-4 rounded-full border border-slate-200 bg-white shadow-sm w-full transition-all ${disabled ? 'opacity-80 bg-slate-50 cursor-not-allowed' : 'hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 cursor-text'}`}
    onClick={(e) =>
      !disabled && (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()
    }
  >
    <div className="flex items-center w-full">
      <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
      <span className="text-[13px] font-medium mr-2 text-slate-500 shrink-0">Contact:</span>
      <input
        type="text"
        className="flex-1 w-full min-w-0 text-[13px] font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400 font-sans truncate disabled:opacity-80"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="Enter name..."
        disabled={disabled}
      />
    </div>
  </div>
);

export default function ServiceProfileModal() {
  const { isDrawerOpen, getDrawerData, closeDrawer, activeDrawer, activeDrawers } = useUIStore();
  const stackIndex = activeDrawers.findIndex((d) => d.type === 'service');
  const zIndexBase = 100 + Math.max(0, stackIndex) * 20;
  const services = useAppStore((state) => state.services);
  const settings = useAppStore((state) => state.settings);
  const user = useAppStore((state) => state.user);
  const clients = useAppStore((state) => state.clients);
  const projects = useAppStore((state) => state.projects);

  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [contactNameDraft, setContactNameDraft] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (isConfirmingDelete) {
      const timer = setTimeout(() => setIsConfirmingDelete(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingDelete]);

  const isOpen = isDrawerOpen('service');
  const drawerData = getDrawerData('service');
  const service = services.find(
    (s) => s.id === drawerData?.entityId || s.slug === drawerData?.entityId
  );

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
      setContactNameDraft(service.contactName || '');
      setIsConfirmingDelete(false);
    }
  }, [service]);

  const clientOptions = useMemo(() => {
    return clients
      .map((c) => ({ value: c.clientId || c.id, label: c.companyName || c.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [clients]);

  const availableProjects = useMemo(() => {
    const defaultOption = { id: 'none', name: 'None (Client Level)' };
    const clientId = service?.clientIds?.[0];
    if (!clientId) return [defaultOption];

    const client = clients.find((c) => c.clientId === clientId || c.id === clientId);
    if (!client) return [defaultOption];

    const filtered = projects
      .filter(
        (p) =>
          p.clientIds?.includes(clientId) || p.clients?.includes(client.companyName || client.name)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return [defaultOption, ...filtered];
  }, [service?.clientIds, clients, projects]);

  const projectOptions = useMemo(() => {
    return availableProjects.map((p) => ({ value: p.id, label: p.name }));
  }, [availableProjects]);

  const handleUpdateClient = async (vals: string[]) => {
    if (!service) return;
    const clientId = vals[vals.length - 1] || '';
    const currentClientId = service.clientIds?.[0] || '';
    if (clientId === currentClientId) return;

    const client = clients.find((c) => c.clientId === clientId || c.id === clientId);
    const clientName = client?.companyName || client?.name || '';
    const oldClientName = service.clientName || 'None';

    await updateServiceRecord(
      {
        ...service,
        clientIds: client ? [clientId] : [],
        clients: client ? [clientName] : [],
        clientName: clientName,
        projectIds: [],
        projectId: 'N/A',
        projectName: 'N/A',
      },
      { successMsg: 'Client successfully updated.', errorMsg: 'Failed to update client.' },
      `Service Client changed from ${oldClientName} to ${clientName || 'None'}`,
      user?.name
    );
  };

  const handleUpdateProject = async (vals: string[]) => {
    if (!service) return;
    const projectIds = vals.filter((id) => id !== 'none');

    const projectObjs = projects.filter((p) => projectIds.includes(p.id));
    const projectNames = projectObjs.length > 0 ? projectObjs.map((p) => p.name).join(', ') : 'N/A';
    const oldProjectName = service.projectName || 'None';

    await updateServiceRecord(
      {
        ...service,
        projectIds: projectIds,
        projectId: projectObjs.length > 0 ? projectObjs[0].id : 'N/A',
        projectName: projectNames,
      },
      { successMsg: 'Project successfully updated.', errorMsg: 'Failed to update project.' },
      `Service Project changed from ${oldProjectName} to ${projectNames || 'None'}`,
      user?.name
    );
  };

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
    const s = settings?.settingsData?.find(
      (x: any) => x.category === 'ServiceStatus' && x.name === statusName
    );
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
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                style={{ zIndex: zIndexBase - 1 }}
              />
            </Dialog.Overlay>
            <div
              className="fixed inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: zIndexBase }}
            >
              <Dialog.Content
                onOpenAutoFocus={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => {
                  e.preventDefault();
                  if (activeDrawer?.type === 'service') closeDrawer();
                }}
                onInteractOutside={(e) => {
                  e.preventDefault();
                  if (activeDrawer?.type === 'service') closeDrawer();
                }}
                asChild
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                  className="w-[95vw] max-w-5xl min-h-[760px] max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 flex pointer-events-auto"
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
                            rows={1}
                            className="flex-1 w-full min-w-0 bg-transparent border-none p-0 text-2xl font-extrabold text-slate-900 tracking-tight leading-tight resize-none focus:outline-none focus:ring-0 overflow-hidden"
                          />
                          <div className="flex flex-col gap-1 shrink-0 ml-4 mt-1">
                            <Tooltip content="Save">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateName();
                                }}
                                className="p-1.5 text-primary/80 hover:text-primary hover:bg-primary/10 rounded-md transition-colors shadow-sm"
                              >
                                <Check className="w-5 h-5 stroke-[2.5]" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Cancel">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditNameValue(service?.name || '');
                                  setIsEditingName(false);
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors shadow-sm"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`group flex items-start justify-between rounded-xl -mx-3 px-3 py-2 transition-colors ${hasPermission('service_edit_details') ? 'cursor-pointer hover:bg-slate-200/50' : ''}`}
                          onClick={() => {
                            if (hasPermission('service_edit_details')) {
                              setIsEditingName(true);
                            }
                          }}
                        >
                          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance break-words">
                            {service?.name || 'Unnamed Service'}
                          </h2>
                          {hasPermission('service_edit_details') && (
                            <Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-thin-scroll px-6 pb-6 flex flex-col gap-5">
                      <div className="flex flex-col gap-3">
                        <div>
                          <Select
                            options={(settings?.serviceTypes || []).map((s: any) => ({
                              label: s.name,
                              value: s.name,
                            }))}
                            value={service?.type || 'Unknown'}
                            onChange={(val) => handleUpdateType(val)}
                            disabled={!hasPermission('service_edit_details')}
                            trigger={
                              <TokenTrigger
                                label="Type"
                                value={service?.type || 'Unknown'}
                                icon={Briefcase}
                                disabled={!hasPermission('service_edit_details')}
                              />
                            }
                          />
                        </div>
                        <div>
                          <Select
                            options={(settings?.managers?.map((m: any) => m.name) || []).map(
                              (o: string) => ({ label: o, value: o })
                            )}
                            value={service?.manager || ''}
                            onChange={(val) => handleUpdateManager(val)}
                            disabled={!hasPermission('service_edit_details')}
                            trigger={
                              <TokenTrigger
                                label="Manager"
                                value={service?.manager || 'Unassigned'}
                                icon={User}
                                disabled={!hasPermission('service_edit_details')}
                              />
                            }
                          />
                        </div>
                        <div>
                          <Select
                            options={(settings?.settingsData || [])
                              .filter((s: any) => s.category === 'ServiceStatus')
                              .map((s: any) => ({ label: s.name, value: s.name }))}
                            value={service?.status || 'Unknown'}
                            onChange={(val) => handleUpdateStatus(val)}
                            disabled={!hasPermission('service_edit_details')}
                            trigger={
                              <TokenTrigger
                                label="Status"
                                value={service?.status || 'Unknown'}
                                icon={getStatusIcon(service?.status || 'Unknown')}
                                disabled={!hasPermission('service_edit_details')}
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
                            disabled={!hasPermission('service_edit_details')}
                            trigger={
                              <TokenTrigger
                                label="Outcome"
                                value={service?.outcome || 'Unknown'}
                                icon={Target}
                                disabled={!hasPermission('service_edit_details')}
                              />
                            }
                          />
                        </div>
                        <div className="w-full">
                          <DatePicker
                            value={service?.dateVal}
                            onChange={async (val, str) => {
                              if (!service) return;
                              await updateServiceRecord(
                                { ...service, dateVal: val as any, dateStr: str },
                                {
                                  successMsg: 'Completion date updated.',
                                  errorMsg: 'Failed to update date.',
                                },
                                `Completion Date updated to ${str}`,
                                user?.name
                              );
                            }}
                            disabled={!hasPermission('service_edit_details')}
                            trigger={
                              <TokenTrigger
                                label="Completion"
                                value={
                                  service?.dateVal
                                    ? new Date(service.dateVal).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })
                                    : 'No Date'
                                }
                                icon={Calendar}
                                disabled={!hasPermission('service_edit_details')}
                              />
                            }
                          />
                        </div>
                      </div>

                      <div className="h-px bg-slate-200/60 w-full" />

                      <div className="flex flex-col gap-3">
                        <MultiSelect
                          values={service?.clientIds?.[0] ? [service.clientIds[0]] : []}
                          options={clientOptions}
                          onChange={handleUpdateClient}
                          searchable
                          searchPlaceholder="Search Clients..."
                          disabled={!hasPermission('service_edit_details')}
                          trigger={
                            <TokenTrigger
                              label="Client"
                              value={clientNames}
                              icon={Building}
                              disabled={!hasPermission('service_edit_details')}
                            />
                          }
                        />
                        <MultiSelect
                          values={
                            service?.projectIds ||
                            (service?.projectId && service.projectId !== 'N/A'
                              ? [service.projectId]
                              : [])
                          }
                          options={projectOptions}
                          onChange={handleUpdateProject}
                          searchable
                          searchPlaceholder="Search Projects..."
                          disabled={!hasPermission('service_edit_details')}
                          trigger={
                            <TokenTrigger
                              label="Project"
                              value={projectName}
                              icon={FileText}
                              disabled={!hasPermission('service_edit_details')}
                            />
                          }
                        />
                        <ContactInputPill
                          value={contactNameDraft}
                          disabled={!hasPermission('service_edit_details')}
                          onChange={(e: any) => setContactNameDraft(e.target.value)}
                          onBlur={async () => {
                            if (!service || contactNameDraft === service.contactName) return;
                            await updateServiceRecord(
                              { ...service, contactName: contactNameDraft },
                              {
                                successMsg: 'Client Contact Name updated.',
                                errorMsg: 'Failed to update contact.',
                              },
                              `Contact Name updated to ${contactNameDraft}`,
                              user?.name
                            );
                          }}
                        />
                      </div>

                      {/* Danger Zone */}
                      {hasPermission('service_archive') && (
                        <div className="pt-4 mt-auto border-t border-slate-200/60">
                          {isConfirmingDelete ? (
                            <div className="flex flex-col gap-2 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                              <p className="text-[11px] font-medium text-red-600 text-center">
                                Archive this service?
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setIsConfirmingDelete(false)}
                                  className="flex-1 px-3 py-1.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleConfirmDelete}
                                  className="flex-1 px-3 py-1.5 text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors"
                                >
                                  Archive
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsConfirmingDelete(true)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium text-slate-400 hover:bg-red-50/50 hover:text-red-500 rounded-lg transition-colors"
                            >
                              <LucideIcons.Archive className="w-4 h-4" />
                              Archive Service
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANE: Main Content */}
                  <div className="flex-1 flex flex-col bg-white overflow-hidden relative rounded-r-3xl">
                    {/* Decorative Aura */}

                    {/* Close Button overlay */}
                    <div className="absolute top-4 right-4 z-10">
                      <Tooltip content="Close">
                        <button
                          onClick={closeDrawer}
                          className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>

                    {/* Horizontal Tabs Header */}
                    <div className="flex px-8 pt-4 pb-0 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-40 pr-16 overflow-x-auto custom-thin-scroll">
                      <div className="flex gap-6">
                        {[
                          {
                            id: 'details',
                            label: 'Financials',
                            icon: LucideIcons.CircleDollarSign,
                          },
                          { id: 'notes', label: 'Timeline', icon: LucideIcons.FileText },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setActiveTab(item.id as any)}
                              className={`relative flex items-center gap-2 pb-4 pt-2 transition-colors ${
                                isActive
                                  ? 'text-primary font-bold'
                                  : 'text-slate-500 hover:text-slate-700 font-medium'
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`}
                              />
                              <span className="text-[13px] whitespace-nowrap tracking-wide">
                                {item.label}
                              </span>
                              {isActive && (
                                <motion.div
                                  layoutId="activeHorizontalTabService"
                                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                                  initial={false}
                                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto custom-thin-scroll p-10 relative z-0">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={activeTab}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="w-full"
                        >
                          {activeTab === 'details' && <ServiceDetailsTab service={service} />}
                          {activeTab === 'notes' && service && (
                            <TimelineTab
                              notes={service.notes || []}
                              disabled={!hasPermission('service_add_notes')}
                              onSaveNotes={async (updatedNotes) => {
                                await updateServiceRecord(
                                  { ...service, notes: updatedNotes } as any,
                                  {
                                    successMsg: `Timeline updated for '${service.name}'.`,
                                    errorMsg: `Failed to update timeline for '${service.name}'.`,
                                  }
                                );
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
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
