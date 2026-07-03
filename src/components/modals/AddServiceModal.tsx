import React, { useState, useMemo, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  ChevronDown,
  Check,
  Tag,
  User,
  AlignLeft,
  Building,
  Layers,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
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

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TruncatedText } from '../../components/ui/TruncatedText';

const serviceSchema = z
  .object({
    serviceNames: z.array(z.string()).min(1, 'At least one service is required'),
    type: z.string().min(1, 'Service Type is required.'),
    price: z.string().optional(),
    serviceValue: z.string().optional(),
    selectedClient: z.string().min(1, 'Client is required.'),
    selectedProjects: z.array(z.string()).min(1, 'Project is required.'),
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

const TokenTrigger = ({ label, value, icon: Icon, error, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex items-center h-10 px-4 rounded-full border bg-white shadow-sm transition-all duration-200 active:scale-95 hover:border-primary/50 hover:shadow-md focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-destructive' : 'border-slate-200'}`}
  >
    {Icon && (
      <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors mr-2 shrink-0" />
    )}
    <span className="text-[13px] font-medium text-slate-500 mr-2">{label}:</span>
    <TruncatedText
      text={String('' + value || 'Select' + '')}
      containerClassName={`text-[13px] font-semibold max-w-[160px] ${value ? 'text-slate-900' : 'text-slate-400'}`}
    >
      {value || 'Select'}
    </TruncatedText>
    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

export default function AddServiceModal() {
  const { activeModals, isModalOpen, closeModal, activeDrawer, openDrawer } = useUIStore();
  const clients = useAppStore((state) => state.clients);
  const projects = useAppStore((state) => state.projects);
  const settings = useAppStore((state) => state.settings);
  const user = useAppStore((state) => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const isOpen = isModalOpen('addService');
  const isAddClientOpen = isModalOpen('addClient');
  const isAddProjectOpen = isModalOpen('addProject');
  const modalIndex = activeModals.indexOf('addService');
  const overlayZ = 120 + (modalIndex >= 0 ? modalIndex * 20 : 0);
  const contentZ = 130 + (modalIndex >= 0 ? modalIndex * 20 : 0);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceNames: [],
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
  const watchSelectedClient = watch('selectedClient');
  const watchSelectedProjects = watch('selectedProjects');
  const watchServiceNames = watch('serviceNames');

  // Pre-fill context if opened from a specific drawer

  useEffect(() => {
    if (watchType === 'Included') {
      setValue('price', '0', { shouldValidate: true });
    }
  }, [watchType, setValue]);

  // Auto-populate Service Value based on selected services
  useEffect(() => {
    if (!settings?.services || !watchServiceNames || watchServiceNames.length === 0) {
      return;
    }

    let totalValue = 0;
    watchServiceNames.forEach((name: string) => {
      const s = settings.services.find((x: any) => x.name === name);
      if (s && s.price) {
        totalValue += Number(s.price) || 0;
      }
    });

    if (totalValue > 0) {
      const formattedTotal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(totalValue);
      setValue('serviceValue', formattedTotal, { shouldValidate: true, shouldDirty: true });
    }
  }, [watchServiceNames, settings?.services, setValue]);

  const availableProjects = useMemo(() => {
    const defaultOption = { id: 'none', name: 'None (Client Level)' };
    if (!watchSelectedClient) return [defaultOption];
    const client = clients.find((c) => (c.clientId || c.id) === watchSelectedClient);
    if (!client) return [defaultOption];
    const filtered = projects
      .filter(
        (p) =>
          p.clientIds?.includes(client.clientId || client.id) ||
          p.clients?.includes(client.companyName || client.name)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
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
    () =>
      clients
        .map((c) => ({ value: c.clientId || c.id, label: c.companyName || c.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [clients]
  );
  const managerOptions = useMemo(
    () =>
      (settings?.managers?.map((m: any) => m.name) || []).map((m: any) => ({ label: m, value: m })),
    [settings?.managers]
  );

  const handleClose = (force?: boolean | any) => {
    const isForced = force === true;
    if (!isForced && isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    setShowDiscardConfirm(false);
    closeModal();
    reset();
    setGlobalError('');
    setShowNote(false);
    setShowContact(false);
    setShowSuccess(false);
  };

  const onSubmit = async (data: ServiceFormValues) => {
    setGlobalError('');
    setIsSubmitting(true);
    try {
      const clientObj = clients.find((c) => (c.clientId || c.id) === data.selectedClient);
      const actualProjectIds = data.selectedProjects.filter((id) => id !== 'none');
      const projectObjs = projects.filter((p) => actualProjectIds.includes(p.id));

      const logPromises = [];
      let lastServiceId = '';

      for (const sName of data.serviceNames) {
        const serviceId = crypto.randomUUID();
        lastServiceId = serviceId;
        const today = new Date();
        const newService: Service = {
          id: serviceId,
          serviceId: serviceId.substring(0, 8).toLowerCase(),
          serviceName: sName.trim(),
          name: sName.trim(),
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
          successMsg: `Service '${sName.trim()}' successfully added.`,
          errorMsg: `Failed to add service '${sName.trim()}'.`,
        });

        const baseLogMsg = `New service added: ${sName.trim()}`;
        const logMessage = data.note ? `${baseLogMsg}. Initial Note: ${data.note}` : baseLogMsg;

        logPromises.push(addServiceAutoLog(serviceId, logMessage, user?.name || 'System'));
        if (clientObj) {
          logPromises.push(
            addAutoLog(clientObj.clientId || clientObj.id, logMessage, user?.name || 'System', true)
          );
        }
        for (const p of projectObjs) {
          logPromises.push(addProjectAutoLog(p.id, logMessage, user?.name || 'System', true));
        }
      }

      await Promise.all(logPromises);

      setShowSuccess(true);
      setTimeout(() => {
        handleClose(true);
        setTimeout(() => {
          openDrawer('service', lastServiceId);
        }, 350);
      }, 1000);
    } catch (err) {
      console.error(err);
      setGlobalError('Failed to create service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose(false)}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ zIndex: overlayZ }}
        />
        <Dialog.Content
          onInteractOutside={(e) => {
            e.preventDefault();
            if (activeModals[activeModals.length - 1] === 'addService') {
              handleClose(false);
            }
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            if (activeModals[activeModals.length - 1] === 'addService') {
              handleClose(false);
            }
          }}
          style={{ zIndex: contentZ }}
          className={`fixed left-[50%] top-[50%] flex max-h-[90vh] w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] flex-col rounded-2xl bg-white shadow-2xl outline-none overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] transition-all duration-300 ${isAddClientOpen || isAddProjectOpen ? 'blur-[2px] scale-[0.98] brightness-95 pointer-events-none' : ''}`}
        >
          <div className="flex justify-end p-4 absolute top-0 right-0 z-10">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 active:scale-95 duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-thin-scroll min-h-0 pt-16 pb-8 px-10">
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-[13px] font-semibold bg-destructive/5 px-4 py-3 rounded-xl border border-destructive/20 mb-6"
              >
                {globalError}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Controller
                name="serviceNames"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    creatable
                    values={field.value}
                    onChange={field.onChange}
                    options={serviceOptions}
                    placeholder="Service Name..."
                  />
                )}
              />
              <AnimatePresence>
                {errors.serviceNames && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-destructive text-sm mt-2 font-medium ml-2"
                  >
                    {errors.serviceNames.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-4 mb-10"
            >
              {/* Row 1: Type, Invoice Value, Service Value */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        options={typeOptions}
                        onChange={field.onChange}
                        trigger={
                          <TokenTrigger
                            label="Type"
                            value={field.value}
                            icon={Tag}
                            error={errors.type}
                          />
                        }
                      />
                    )}
                  />
                  <AnimatePresence>
                    {errors.type && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-destructive text-[11px] font-medium ml-2"
                      >
                        {errors.type.message}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {watchType !== 'Included' && (
                  <div className="flex flex-col gap-1">
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <div
                          className={`group flex items-center h-10 px-4 rounded-full border bg-white shadow-sm transition-all duration-200 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${errors.price ? 'border-destructive' : 'border-slate-200'}`}
                        >
                          <DollarSign className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors mr-2 shrink-0" />
                          <span className="text-[13px] font-medium text-slate-500 mr-2 whitespace-nowrap">
                            Invoice Value:
                          </span>
                          <input
                            type="text"
                            value={field.value || ''}
                            onChange={field.onChange}
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
                            placeholder="0.00"
                            className="bg-transparent border-none outline-none focus:ring-0 p-0 text-[13px] font-semibold text-slate-900 w-20"
                          />
                        </div>
                      )}
                    />
                    <AnimatePresence>
                      {errors.price && (
                        <motion.span
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-destructive text-[11px] font-medium ml-2"
                        >
                          {errors.price.message}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <Controller
                    name="serviceValue"
                    control={control}
                    render={({ field }) => (
                      <div
                        className={`group flex items-center h-10 px-4 rounded-full border bg-white shadow-sm transition-all duration-200 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${errors.serviceValue ? 'border-destructive' : 'border-slate-200'}`}
                      >
                        <DollarSign className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors mr-2 shrink-0" />
                        <span className="text-[13px] font-medium text-slate-500 mr-2 whitespace-nowrap">
                          Service Value:
                        </span>
                        <input
                          type="text"
                          value={field.value || ''}
                          onChange={field.onChange}
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
                          placeholder="0.00"
                          className="bg-transparent border-none outline-none focus:ring-0 p-0 text-[13px] font-semibold text-slate-900 w-20"
                        />
                      </div>
                    )}
                  />
                  <AnimatePresence>
                    {errors.serviceValue && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-destructive text-[11px] font-medium ml-2"
                      >
                        {errors.serviceValue.message}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Row 2: Client, Project */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1">
                  <Controller
                    name="selectedClient"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        values={field.value ? [field.value] : []}
                        options={clientOptions}
                        onChange={(vals) => {
                          const newVal = vals[vals.length - 1] || '';
                          field.onChange(newVal);
                          setValue('selectedProjects', []);
                        }}
                        searchable
                        searchPlaceholder="Search Clients..."
                        trigger={
                          <TokenTrigger
                            label="Client"
                            value={clientOptions.find((o) => o.value === field.value)?.label}
                            icon={Building}
                            error={errors.selectedClient}
                          />
                        }
                      />
                    )}
                  />
                  <AnimatePresence>
                    {errors.selectedClient && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-destructive text-[11px] font-medium ml-2"
                      >
                        {errors.selectedClient.message}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-1">
                  <Controller
                    name="selectedProjects"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        values={field.value}
                        options={availableProjects.map((p) => ({ value: p.id, label: p.name }))}
                        onChange={field.onChange}
                        searchable
                        searchPlaceholder="Search Projects..."
                        trigger={
                          <TokenTrigger
                            label="Project"
                            value={
                              field.value.length === 1
                                ? availableProjects.find((p) => p.id === field.value[0])?.name || ''
                                : field.value.length > 1
                                  ? `${field.value.length} Projects`
                                  : ''
                            }
                            icon={Layers}
                            error={errors.selectedProjects}
                          />
                        }
                      />
                    )}
                  />
                  <AnimatePresence>
                    {errors.selectedProjects && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-destructive text-[11px] font-medium ml-2"
                      >
                        {errors.selectedProjects.message}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Row 3: Manager */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1">
                  <Controller
                    name="assignees"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        values={field.value}
                        options={managerOptions}
                        onChange={field.onChange}
                        trigger={
                          <TokenTrigger
                            label="Manager"
                            value={field.value.length ? field.value.join(', ') : ''}
                            icon={User}
                            error={errors.assignees}
                          />
                        }
                      />
                    )}
                  />
                  <AnimatePresence>
                    {errors.assignees && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-destructive text-[11px] font-medium ml-2"
                      >
                        {errors.assignees.message}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-3"
            >
              <AnimatePresence mode="popLayout">
                {!showContact ? (
                  <motion.div
                    key="contact-btn"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setShowContact(true)}
                      className="group flex items-center px-2 py-1 rounded hover:bg-slate-50 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 outline-none whitespace-nowrap"
                    >
                      <span className="text-[13px] font-semibold text-slate-500 group-hover:text-primary transition-colors">
                        + Add Contact
                      </span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="contact-editor"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden pt-1 pb-2"
                  >
                    <label className="flex items-center text-[13px] font-semibold text-slate-600 ml-1">
                      <User className="w-3.5 h-3.5 mr-1.5" /> Client Contact Name
                    </label>
                    <Controller
                      name="contactName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter primary contact name..."
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 outline-none"
                        />
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {!showNote ? (
                  <motion.div
                    key="note-btn"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setShowNote(true)}
                      className="group flex items-center px-2 py-1 rounded hover:bg-slate-50 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 outline-none whitespace-nowrap"
                    >
                      <span className="text-[13px] font-semibold text-slate-500 group-hover:text-primary transition-colors">
                        + Add Initial Note
                      </span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="note-editor"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden pb-2"
                  >
                    <label className="flex items-center text-[13px] font-semibold text-slate-600 ml-1">
                      <AlignLeft className="w-3.5 h-3.5 mr-1.5" /> Initial Note
                    </label>
                    <Controller
                      name="note"
                      control={control}
                      render={({ field }) => (
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/50 overflow-hidden">
                          <RichTextEditor
                            content={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Enter an optional note..."
                          />
                        </div>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end items-center shrink-0 rounded-b-2xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg text-[13px] font-semibold transition-all duration-200 active:scale-95 hover:-translate-y-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 h-10 px-5 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="group inline-flex items-center justify-center rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Service'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showDiscardConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[var(--z-popover)] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 flex flex-col items-center text-center max-w-sm mx-4"
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Discard changes?</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    You have unsaved changes. If you close this now, your data will be lost.
                  </p>
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => setShowDiscardConfirm(false)}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Keep Editing
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClose(true)}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                key="success-bloom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[var(--z-popover)] flex flex-col items-center justify-center bg-white rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                  <Check className="w-12 h-12 text-green-600 stroke-[3]" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-slate-800"
                >
                  Service Created
                </motion.h2>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
