import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, ChevronDown, Link as LinkIcon, Check, Calendar } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import {
  updateProjectRecord,
  updateClientRecord,
  addAutoLog,
  addProjectAutoLog,
} from '../../api/dbService';
import { calculateProjectHealth, calculateClientHealth } from '../../utils/scoringUtils';
import { Project } from '../../types';

import { Select } from '../ui/Select';
import { MultiSelect } from '../ui/MultiSelect';
import { DatePicker } from '../ui/DatePicker';
import { RichTextEditor } from '../ui/RichTextEditor';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const projectSchema = z
  .object({
    name: z.string().min(1, 'Project Name is required.'),
    selectedDevelopers: z.array(z.string()),
    selectedSalesMarketing: z.array(z.string()),
    activeFeatures: z.array(z.string()),
    releaseDateVal: z.number().nullable(),
    units: z.string(),
    assignee: z.string().optional(),
    kycDetails: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.selectedDevelopers.length === 0 && data.selectedSalesMarketing.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one Attached Client (Developer or Sales & Marketing) is required.',
        path: ['selectedDevelopers'], // Assign to selectedDevelopers to show under it or use globally
      });
    }
  });

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function AddProjectModal() {
  const { activeModal, isModalOpen, closeModal, openModal, openDrawer } = useUI();
  const clients = useAppStore(state => state.clients);
  const settings = useAppStore(state => state.settings);
  const projects = useAppStore(state => state.projects);
  const user = useAppStore(state => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

    
  const isOpen = isModalOpen('addProject');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      selectedDevelopers: [],
      selectedSalesMarketing: [],
      activeFeatures: [],
      releaseDateVal: null,
      units: '',
      assignee: '',
      kycDetails: '',
      note: '',
    },
  });

  
  useEffect(() => {
    const handleClientCreated = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newClient = customEvent.detail;
      const newClientId = newClient.clientId || newClient.id;
      if (newClient.clientType === 'Developer') {
        const prev = getValues('selectedDevelopers') || [];
        setValue('selectedDevelopers', Array.from(new Set([...prev, newClientId])), { shouldValidate: true });
      } else if (newClient.clientType === 'Sales & Marketing') {
        const prev = getValues('selectedSalesMarketing') || [];
        setValue('selectedSalesMarketing', Array.from(new Set([...prev, newClientId])), { shouldValidate: true });
      } else {
        // Fallback for uncategorized
        const prev = getValues('selectedDevelopers') || [];
        setValue('selectedDevelopers', Array.from(new Set([...prev, newClientId])), { shouldValidate: true });
      }
    };
    window.addEventListener('clientCreated', handleClientCreated);
    return () => window.removeEventListener('clientCreated', handleClientCreated);
  }, [getValues, setValue]);

  
  const handleClose = () => {
    closeModal();
    reset();
    setGlobalError('');
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setGlobalError('');

    const nameExists = projects.some(
      (p) => (p.name || '').toLowerCase() === data.name.trim().toLowerCase()
    );
    if (nameExists) {
      setGlobalError('A project with this exact name already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      const allSelectedIds = [...data.selectedDevelopers, ...data.selectedSalesMarketing];
      const matchedClients = clients.filter((c) => allSelectedIds.includes(c.clientId || c.id));
      const matchedDevs = clients.filter((c) => data.selectedDevelopers.includes(c.clientId || c.id));
      const matchedSMs = clients.filter((c) => data.selectedSalesMarketing.includes(c.clientId || c.id));

      let finalReleaseDateStr = '';
      const finalReleaseDateVal = data.releaseDateVal || 0;
      if (data.releaseDateVal) {
        finalReleaseDateStr = new Date(data.releaseDateVal).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }

      const newProject: Project = {
        id: `P-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`,
        name: data.name.trim(),
        developerIds: matchedDevs.map((c) => c.clientId || c.id),
        developers: matchedDevs.map((c) => c.companyName || c.name),
        salesMarketingIds: matchedSMs.map((c) => c.clientId || c.id),
        salesMarketingClients: matchedSMs.map((c) => c.companyName || c.name),
        clientIds: matchedClients.map((c) => c.clientId || c.id),
        clients: matchedClients.map((c) => c.companyName || c.name),
        features: data.activeFeatures,
        projectStatus: 'Onboarding',
        timelineStatus: 'Not Started',
        onboardingMilestone: 'Not Started',
        assignee: data.assignee || 'Unassigned',
        units: data.units.toString(),
        releaseDateStr: finalReleaseDateStr,
        releaseDateVal: finalReleaseDateVal,
        kycDetails: data.kycDetails || '',
        dateAdded: new Date().getTime(),
        lastUpdated: new Date().getTime(),
        healthScore: 'N/A',
        scoreTrajectory: [],
      };

      // Calculate initial project score
      const pHealth = calculateProjectHealth(newProject, settings);
      newProject.healthScore = pHealth.totalScore;

      // Prepare database promises
      const dbPromises: Promise<any>[] = [];
      dbPromises.push(
        updateProjectRecord(newProject, {
          successMsg: `Project '${newProject.name}' successfully created.`,
          errorMsg: `Failed to create project '${newProject.name}'.`,
        })
      );
      dbPromises.push(addProjectAutoLog(newProject.id, `Project created.`, user?.name || 'System'));

      // Iteratively update attached clients
      for (const client of matchedClients) {
        dbPromises.push(
          addAutoLog(
            client.clientId || client.id,
            `New project added: ${newProject.name}`,
            user?.name || 'System',
            true
          )
        );

        // Recalculate client health locally to sync to DB
        // (Create a copy of projects array adding the new project for math)
        const updatedProjectsForMath = [...projects, newProject];
        const cHealth = calculateClientHealth(client, updatedProjectsForMath, settings);

        const updatedClient = {
          ...client,
          activeProjectCount: (client.activeProjectCount || 0) + 1,
          healthScore: cHealth.totalScore,
          lastUpdated: new Date().getTime(),
        };
        dbPromises.push(updateClientRecord(updatedClient, { silent: true }));
      }

      await Promise.all(dbPromises);

      handleClose();

      // Seamless Routing Handoff (350ms delay to let Modal animate out)
      setTimeout(() => {
        openDrawer('project', newProject.id, { targetTab: 'overview' });
      }, 350);
    } catch (err) {
      console.error(err);
      setGlobalError('An error occurred while creating the project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content onPointerDownOutside={(e) => e.preventDefault()} className="fixed left-[50%] top-[50%] z-[10000] flex max-h-[90vh] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] flex-col rounded-xl bg-white shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20 rounded-t-xl shrink-0">
            <h3 className="font-semibold text-lg tracking-tight text-foreground">
              Add New Project
            </h3>
            <button
              onClick={handleClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto custom-thin-scroll min-h-0">
            {globalError && (
              <div className="text-destructive text-sm font-semibold bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20 mb-5">
                {globalError}
              </div>
            )}
            {/* REQUIRED METADATA */}
            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Project Name <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full min-w-0 rounded-md border ${errors.name ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} bg-white px-3 py-2 shadow-sm outline-none transition-all hover:border-primary/50 text-sm`}
                      placeholder="Enter project name..."
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-semibold text-muted-foreground">
                    Developer Client(s) <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openModal('addClient')}
                    className="text-[10px] font-bold text-primary hover:underline transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none rounded-sm px-1"
                  >
                    + Add Client
                  </button>
                </div>
                <Controller
                  name="selectedDevelopers"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      values={field.value}
                      options={[...clients]
                        .filter((c) => c.clientType === 'Developer' || !c.clientType)
                        .sort((a, b) =>
                          (a.companyName || a.name || '').localeCompare(b.companyName || b.name || '')
                        )
                        .map((c) => ({ label: c.companyName || c.name, value: c.clientId || c.id }))}
                      onChange={field.onChange}
                      searchable={true}
                      searchPlaceholder="Search developer clients..."
                      className="w-full block mb-1"
                      trigger={
                        <button
                          type="button"
                          className={`w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border ${errors.selectedDevelopers ? 'border-destructive' : 'border-input'} rounded-md px-3 text-left flex justify-between items-center text-sm`}
                        >
                          <span
                            className={`truncate ${field.value.length ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {field.value.length
                              ? field.value
                                  .map(
                                    (id) =>
                                      clients.find((c) => c.clientId === id || c.id === id)
                                        ?.companyName || id
                                  )
                                  .join(', ')
                              : 'Select Developer Clients...'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      }
                    />
                  )}
                />
                {errors.selectedDevelopers && (
                  <p className="text-destructive text-xs mt-1 font-medium mb-3">{errors.selectedDevelopers.message}</p>
                )}

                <div className="flex justify-between items-center mb-2 mt-4">
                  <label className="block text-[11px] font-semibold text-muted-foreground">
                    Sales & Marketing Client(s)
                  </label>
                </div>
                <Controller
                  name="selectedSalesMarketing"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      values={field.value}
                      options={[...clients]
                        .filter((c) => c.clientType === 'Sales & Marketing')
                        .sort((a, b) =>
                          (a.companyName || a.name || '').localeCompare(b.companyName || b.name || '')
                        )
                        .map((c) => ({ label: c.companyName || c.name, value: c.clientId || c.id }))}
                      onChange={field.onChange}
                      searchable={true}
                      searchPlaceholder="Search sales & marketing clients..."
                      className="w-full block"
                      trigger={
                        <button
                          type="button"
                          className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm"
                        >
                          <span
                            className={`truncate ${field.value.length ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {field.value.length
                              ? field.value
                                  .map(
                                    (id) =>
                                      clients.find((c) => c.clientId === id || c.id === id)
                                        ?.companyName || id
                                  )
                                  .join(', ')
                              : 'Select Sales & Marketing Clients...'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      }
                    />
                  )}
                />
              </div>
            </div>

            {/* LOGISTICS */}
            <div className="bg-muted/40 border border-border rounded-lg p-5 mb-5 grid grid-cols-2 gap-5 items-start">
              <div className="mt-0">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Release Date
                </label>
                <Controller
                  name="releaseDateVal"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Date"
                      label="Set Release Date"
                    />
                  )}
                />
              </div>
              <div className="mt-0 !space-y-0">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Live Units <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="units"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className={`w-full min-w-0 rounded-md border ${errors.units ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} bg-white px-3 py-2 shadow-sm outline-none transition-all hover:border-primary/50 text-sm h-[38px]`}
                      placeholder="0"
                    />
                  )}
                />
                {errors.units && (
                  <p className="text-destructive text-xs mt-1 font-medium">{errors.units.message}</p>
                )}
              </div>
            </div>

            {/* CLASSIFICATION */}
            <div className="bg-muted/40 border border-border rounded-lg p-5 mb-5 grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Manager
                </label>
                <Controller
                  name="assignee"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      options={(settings?.managers?.map((m) => m.name) || []).map((m) => ({
                        label: m,
                        value: m,
                      }))}
                      onChange={field.onChange}
                      className="w-full block"
                      trigger={
                        <button
                          type="button"
                          className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm"
                        >
                          <span
                            className={`truncate ${field.value ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {field.value || 'Select Manager'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      }
                    />
                  )}
                />
              </div>
              <div className="mt-0">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Active Features
                </label>
                <Controller
                  name="activeFeatures"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      values={field.value}
                      options={settings?.features?.map((f) => ({ label: f, value: f })) || []}
                      onChange={field.onChange}
                      searchable={true}
                      searchPlaceholder="Search features..."
                      className="w-full block"
                      trigger={
                        <button
                          type="button"
                          className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm"
                        >
                          <span
                            className={`truncate ${field.value.length ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {field.value.length
                              ? `${field.value.length} Selected`
                              : 'Select Active Features...'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      }
                    />
                  )}
                />
              </div>
            </div>

            {/* CONTEXT */}
            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  KYC Details <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Controller
                  name="kycDetails"
                  control={control}
                  render={({ field }) => (
                    <div className="rounded-md border border-input bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/50 overflow-hidden">
                      <RichTextEditor
                        content={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Enter KYC details here..."
                      />
                    </div>
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
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
                </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
