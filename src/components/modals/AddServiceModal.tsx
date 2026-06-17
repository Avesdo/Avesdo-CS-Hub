import React, { useState, useMemo, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronDown } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import {
  updateServiceRecord,
  addAutoLog,
  addProjectAutoLog,
  addServiceAutoLog,
} from '../../api/dbService';
import { Service } from '../../types';

import { Select } from '../ui/Select';
import { MultiSelect } from '../ui/MultiSelect';
import { RichTextEditor } from '../ui/RichTextEditor';
import { CreatableSelect } from '../ui/CreatableSelect';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const serviceSchema = z
  .object({
    serviceName: z.string().min(1, 'Service Name is required.'),
    type: z.string().min(1, 'Service Type is required.'),
    price: z.string().optional(),
    serviceValue: z.string().optional(),
    selectedClient: z.string().min(1, 'Client is required.'),
    selectedProjects: z.array(z.string()),
    assignees: z.array(z.string()),
    contactName: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'Included') {
      if (!data.price || !data.price.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Price is required.',
          path: ['price'],
        });
      } else {
        const num = parseFloat(data.price.replace(/,/g, ''));
        if (isNaN(num)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Price must be a valid number.',
            path: ['price'],
          });
        }
      }
    }
  });

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function AddServiceModal() {
  const { isModalOpen, closeModal, activeDrawer, openDrawer } = useUI();
  const clients = useAppStore(state => state.clients);
  const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);
  const user = useAppStore(state => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

    
  const isOpen = isModalOpen('addService');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceName: '',
      type: '',
      price: '',
      serviceValue: '',
      selectedClient: '',
      selectedProjects: [],
      assignees: [],
      contactName: '',
      note: '',
    },
  });

  const watchType = watch('type');
  const watchServiceName = watch('serviceName');
  const watchSelectedClient = watch('selectedClient');
  const watchSelectedProjects = watch('selectedProjects');

  // Pre-fill context if opened from a specific drawer
  
    useEffect(() => {
    if (watchType === 'Included') {
      setValue('price', '0', { shouldValidate: true });
    }
  }, [watchType, setValue]);

  useEffect(() => {
    const predefinedService = settings?.services?.find((s: any) => s.name === watchServiceName);
    if (predefinedService) {
      setValue(
        'serviceValue',
        new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(predefinedService.price),
        { shouldValidate: true }
      );
    }
  }, [watchServiceName, settings, setValue]);

  const availableProjects = useMemo(() => {
    const defaultOption = { id: 'none', name: 'None (Client Level)' };
    if (!watchSelectedClient) return [defaultOption];
    const client = clients.find((c) => (c.clientId || c.id) === watchSelectedClient);
    if (!client) return [defaultOption];
    const filtered = projects.filter(
      (p) =>
        p.clientIds?.includes(client.clientId || client.id) ||
        p.clients?.includes(client.companyName || client.name)
    );
    return [defaultOption, ...filtered];
  }, [watchSelectedClient, clients, projects]);

  const serviceOptions = useMemo(
    () => settings?.services?.map((s: any) => s.name) || [],
    [settings?.services]
  );
  const typeOptions = useMemo(
    () =>
      (settings?.serviceTypes?.map((t: any) => t.name) || []).map((t: any) => ({
        label: t,
        value: t,
      })),
    [settings?.serviceTypes]
  );
  const clientOptions = useMemo(
    () => clients.map((c) => ({ value: c.clientId || c.id, label: c.companyName || c.name })),
    [clients]
  );
  const managerOptions = useMemo(
    () =>
      (settings?.managers?.map((m: any) => m.name) || []).map((m: any) => ({ label: m, value: m })),
    [settings?.managers]
  );

  
  const handleClose = () => {
    closeModal();
    reset();
    setGlobalError('');
  };

  const onSubmit = async (data: ServiceFormValues) => {
    setGlobalError('');
    setIsSubmitting(true);
    try {
      const clientObj = clients.find((c) => (c.clientId || c.id) === data.selectedClient);
      const actualProjectIds = data.selectedProjects.filter((id) => id !== 'none');
      const projectObjs = projects.filter((p) => actualProjectIds.includes(p.id));

      const serviceId = crypto.randomUUID();
      const today = new Date();
      const newService: Service = {
        id: serviceId,
        serviceId: serviceId.substring(0, 8).toLowerCase(),
        serviceName: data.serviceName.trim(),
        name: data.serviceName.trim(),
        type: data.type,
        status: 'Proposal Sent',
        clientName: clientObj?.companyName || clientObj?.name || 'Unknown',
        clientIds: clientObj ? [clientObj.clientId || clientObj.id] : [],
        clients: clientObj ? [clientObj.companyName || clientObj.name] : [],
        projectName: projectObjs.length > 0 ? projectObjs.map((p) => p.name).join(', ') : 'N/A',
        projectId: projectObjs.length > 0 ? projectObjs[0].id : 'N/A', // Legacy field
        projectIds: actualProjectIds,
        assignee: data.assignees.length > 0 ? data.assignees[0] : 'Unassigned', // Legacy field
        manager: data.assignees.length > 0 ? data.assignees[0] : 'Unassigned', // Legacy field
        managers: data.assignees.length > 0 ? data.assignees : ['Unassigned'],
        price: data.price ? parseFloat(data.price.replace(/,/g, '')) : 0,
        serviceValue: data.serviceValue ? parseFloat(data.serviceValue.replace(/,/g, '')) : 0,
        contactName: data.contactName || '',
        outcome: 'Proposal Sent',
        invoiceSent: false,
        commissionPaid: false,
        dateVal: today.getTime(),
        dateStr: today.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        dateAdded: today.getTime(),
        lastUpdated: today.getTime(),
      };

      await updateServiceRecord(newService, {
        successMsg: `Service '${data.serviceName.trim()}' successfully added.`,
        errorMsg: `Failed to add service '${data.serviceName.trim()}'.`,
      });

      const baseLogMsg = `New service added: ${data.serviceName.trim()}`;
      const logMessage = data.note ? `${baseLogMsg}. Initial Note: ${data.note}` : baseLogMsg;

      const logPromises = [addServiceAutoLog(serviceId, logMessage, user?.name || 'System')];
      if (clientObj) {
        logPromises.push(
          addAutoLog(clientObj.clientId || clientObj.id, logMessage, user?.name || 'System', true)
        );
      }
      for (const p of projectObjs) {
        logPromises.push(addProjectAutoLog(p.id, logMessage, user?.name || 'System', true));
      }
      await Promise.all(logPromises);

      setTimeout(() => {
        openDrawer('service', serviceId);
      }, 350);

      handleClose();
    } catch (err) {
      console.error(err);
      setGlobalError('Failed to create service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[10000] flex max-h-[90vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col rounded-xl bg-white shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20 rounded-t-xl shrink-0">
            <h3 className="font-semibold text-lg tracking-tight text-foreground">
              Add New Service
            </h3>
            <button
              onClick={handleClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto custom-thin-scroll">
            {globalError && (
              <div className="text-destructive text-sm font-semibold bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20 mb-5">
                {globalError}
              </div>
            )}

            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Service Name <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="serviceName"
                  control={control}
                  render={({ field }) => (
                    <CreatableSelect
                      value={field.value}
                      options={serviceOptions}
                      onChange={field.onChange}
                      placeholder="Select or enter a service name..."
                    />
                  )}
                />
                {errors.serviceName && (
                  <p className="text-destructive text-xs mt-1 font-medium">{errors.serviceName.message}</p>
                )}
              </div>

              <div className={`grid gap-5 pt-2 ${watchType === 'Included' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                    Service Type <span className="text-destructive">*</span>
                  </label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        options={typeOptions}
                        onChange={field.onChange}
                        className="w-full block"
                        trigger={
                          <button
                            type="button"
                            className={`w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border ${errors.type ? 'border-destructive focus:border-destructive' : 'border-input'} rounded-md px-3 text-left flex justify-between items-center text-sm`}
                          >
                            <span
                              className={`truncate ${field.value ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                              {field.value || 'Select Service Type'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        }
                      />
                    )}
                  />
                  {errors.type && (
                    <p className="text-destructive text-xs mt-1 font-medium">{errors.type.message}</p>
                  )}
                </div>
                {watchType !== 'Included' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                        Invoice Value <span className="text-destructive">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-muted-foreground font-semibold text-sm">
                          $
                        </span>
                        <Controller
                          name="price"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              onBlur={() => {
                                const num = parseFloat((field.value || '').replace(/,/g, ''));
                                if (!isNaN(num)) {
                                  field.onChange(
                                    new Intl.NumberFormat('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(num)
                                  );
                                }
                              }}
                              className={`w-full min-w-0 rounded-md border ${errors.price ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} bg-white pl-7 pr-3 py-2 shadow-sm outline-none transition-all hover:border-primary/50 h-[38px] text-sm`}
                              placeholder="0.00"
                            />
                          )}
                        />
                      </div>
                      {errors.price && (
                        <p className="text-destructive text-xs mt-1 font-medium">{errors.price.message}</p>
                      )}
                    </div>
                  )}
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                        Service Value
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-muted-foreground font-semibold text-sm">
                          $
                        </span>
                        <Controller
                          name="serviceValue"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              onBlur={() => {
                                const num = parseFloat((field.value || '').replace(/,/g, ''));
                                if (!isNaN(num)) {
                                  field.onChange(
                                    new Intl.NumberFormat('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(num)
                                  );
                                }
                              }}
                              className={`w-full min-w-0 rounded-md border ${errors.serviceValue ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} bg-white pl-7 pr-3 py-2 shadow-sm outline-none transition-all hover:border-primary/50 h-[38px] text-sm`}
                              placeholder="0.00"
                            />
                          )}
                        />
                      </div>
                      {errors.serviceValue && (
                        <p className="text-destructive text-xs mt-1 font-medium">{errors.serviceValue.message}</p>
                      )}
                    </div>
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5 mb-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                    Client Name <span className="text-destructive">*</span>
                  </label>
                  <Controller
                    name="selectedClient"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        options={clientOptions}
                        onChange={(val) => {
                          field.onChange(val);
                          setValue('selectedProjects', []);
                        }}
                        className="w-full block"
                        trigger={
                          <button
                            type="button"
                            className={`w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border ${errors.selectedClient ? 'border-destructive focus:border-destructive' : 'border-input'} rounded-md px-3 text-left flex justify-between items-center text-sm`}
                          >
                            <span
                              className={`truncate ${field.value ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                              {clientOptions.find((c) => c.value === field.value)?.label ||
                                'Select Client'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        }
                      />
                    )}
                  />
                  {errors.selectedClient && (
                    <p className="text-destructive text-xs mt-1 font-medium">{errors.selectedClient.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                    Project Name
                  </label>
                  <Controller
                    name="selectedProjects"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        values={field.value}
                        options={availableProjects.map((p) => ({ value: p.id, label: p.name }))}
                        onChange={(vals) => {
                          if (vals.includes('none') && !field.value.includes('none')) {
                            field.onChange(['none']);
                          } else if (vals.includes('none') && vals.length > 1) {
                            field.onChange(vals.filter((v) => v !== 'none'));
                          } else {
                            field.onChange(vals);
                          }
                        }}
                        className="w-full"
                        trigger={
                          <button
                            type="button"
                            disabled={!watchSelectedClient}
                            className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm disabled:opacity-50 disabled:bg-slate-50 disabled:pointer-events-none"
                          >
                            <span
                              className={`truncate ${field.value.length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                              {field.value.length > 0
                                ? field.value
                                    .map((id) => availableProjects.find((p) => p.id === id)?.name)
                                    .join(', ')
                                : 'Select Projects'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        }
                      />
                    )}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Manager
                </label>
                <Controller
                  name="assignees"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      values={field.value}
                      options={managerOptions}
                      onChange={field.onChange}
                      className="w-full"
                      trigger={
                        <button
                          type="button"
                          className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm"
                        >
                          <span
                            className={`truncate ${field.value.length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {field.value.length > 0 ? field.value.join(', ') : 'Select Managers'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      }
                    />
                  )}
                />
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Client Contact Name{' '}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Controller
                  name="contactName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm h-[38px]"
                      placeholder="Enter primary contact name..."
                    />
                  )}
                />
              </div>
              <div className="pt-3 border-t border-border/50">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Initial Note <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => (
                    <div className="rounded-md border border-input bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/50 overflow-hidden">
                      <RichTextEditor
                        content={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Enter an optional note..."
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0 rounded-b-xl mt-auto">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm border border-input bg-white hover:bg-accent hover:text-accent-foreground h-10 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Service'}
            </button>
          </div>
                </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
