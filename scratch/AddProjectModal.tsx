import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, ChevronDown, Link as LinkIcon, Check, Calendar, Building, Target, Hash, User, Layers, FileText, AlignLeft, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    units: z.string().min(1, 'Units are required.'),
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

const AVATAR_COLORS = ['#0ea5e9', '#f43f5e', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const TokenTrigger = ({ label, value, icon: Icon, error, onClick, avatars }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex items-center h-10 px-4 rounded-full border bg-white shadow-sm transition-all duration-200 active:scale-95 hover:border-primary/50 hover:shadow-md focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-destructive' : 'border-slate-200'}`}
  >
    {avatars && avatars.length > 0 ? (
      <div className="flex -space-x-1.5 mr-2 shrink-0">
        {avatars.slice(0, 3).map((av: string, i: number) => (
          <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white" style={{ backgroundColor: stringToColor(av) }}>
            {av.charAt(0).toUpperCase()}
          </div>
        ))}
        {avatars.length > 3 && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-600 bg-slate-100 ring-2 ring-white z-10">
            +{avatars.length - 3}
          </div>
        )}
      </div>
    ) : (
      Icon && <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors mr-2 shrink-0" />
    )}
    <span className="text-[13px] font-medium text-slate-500 mr-2">{label}:</span>
    <span className={`text-[13px] font-semibold truncate max-w-[160px] ${value ? 'text-slate-900' : 'text-slate-400'}`}>
      {value || 'Select'}
    </span>
    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

export default function AddProjectModal() {
  const { activeModal, isModalOpen, closeModal, openModal, openDrawer } = useUI();
  const clients = useAppStore(state => state.clients);
  const settings = useAppStore(state => state.settings);
  const projects = useAppStore(state => state.projects);
  const user = useAppStore(state => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [showKYC, setShowKYC] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const isOpen = isModalOpen('addProject');
  const isAddClientOpen = isModalOpen('addClient');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty },
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
    setShowKYC(false);
    setShowNote(false);
    setShowSuccess(false);
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
        onboardingPhase: 'Not Started',
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

      setShowSuccess(true);

      // Seamless Routing Handoff (wait for bloom to finish)
      setTimeout(() => {
        handleClose(true);
        setTimeout(() => {
          openDrawer('project', newProject.id);
        }, 350);
      }, 1000);
    } catch (err) {
      console.error(err);
      setGlobalError('An error occurred while creating the project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose(false)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content 
          onInteractOutside={(e) => {
            e.preventDefault();
            handleClose(false);
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleClose(false);
          }}
          className={`fixed left-[50%] top-[50%] z-[10000] flex max-h-[90vh] w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] flex-col rounded-2xl bg-white shadow-2xl outline-none overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] transition-all duration-300 ${isAddClientOpen ? 'blur-[2px] scale-[0.98] brightness-95 pointer-events-none' : ''}`}>
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
              <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="text-destructive text-sm font-semibold bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20 mb-5">
                {globalError}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full text-4xl font-bold text-slate-800 placeholder:text-slate-300 border-none bg-transparent outline-none focus:ring-0 p-0 mb-2"
                    placeholder="Project Name"
                    autoFocus
                  />
                )}
              />
              {errors.name && (
                <p className="text-destructive text-xs font-medium ml-1 mb-4">{errors.name.message}</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-start gap-3 mb-10">
              
              <div className="flex flex-col gap-1">
                <Controller
                  name="selectedDevelopers"
                  control={control}
                  render={({ field }) => {
                    const displayValue = field.value.length
                      ? field.value.map((id) => clients.find((c) => c.clientId === id || c.id === id)?.companyName || id).join(', ')
                      : '';
                    return (
                      <MultiSelect
                        values={field.value}
                        options={[...clients].filter((c) => c.clientType === 'Developer' || !c.clientType).sort((a, b) => (a.companyName || a.name || '').localeCompare(b.companyName || b.name || '')).map((c) => ({ label: c.companyName || c.name, value: c.clientId || c.id }))}
                        onChange={field.onChange}
                        searchable={true}
                        searchPlaceholder="Search developers..."
                        trigger={<TokenTrigger label="Developer" value={displayValue} icon={Building} error={errors.selectedDevelopers} />}
                      />
                    );
                  }}
                />
                <AnimatePresence>
                  {errors.selectedDevelopers && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-destructive text-[11px] font-medium ml-2">{errors.selectedDevelopers.message}</motion.span>}
                </AnimatePresence>
              </div>

              <Controller
                name="selectedSalesMarketing"
                control={control}
                render={({ field }) => {
                  const displayValue = field.value.length
                    ? field.value.map((id) => clients.find((c) => c.clientId === id || c.id === id)?.companyName || id).join(', ')
                    : '';
                  return (
                    <MultiSelect
                      values={field.value}
                      options={[...clients].filter((c) => c.clientType === 'Sales & Marketing').sort((a, b) => (a.companyName || a.name || '').localeCompare(b.companyName || b.name || '')).map((c) => ({ label: c.companyName || c.name, value: c.clientId || c.id }))}
                      onChange={field.onChange}
                      searchable={true}
                      searchPlaceholder="Search sales & marketing..."
                      trigger={<TokenTrigger label="Sales & Mktg" value={displayValue} icon={Target} />}
                    />
                  );
                }}
              />

              <div className="w-full m-0 p-0 h-0" /> {/* Force Break to move New Client down */}

              <button
                type="button"
                onClick={() => openModal('addClient')}
                className="group flex items-center px-2 py-0.5 rounded hover:bg-slate-50 transition-all duration-200 active:scale-95 focus:outline-none -mt-5 ml-1"
              >
                <span className="text-[12px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors">+ New Client</span>
              </button>

              <div className="w-full" /> {/* Force Break for next row */}

              <Controller
                name="releaseDateVal"
                control={control}
                render={({ field }) => {
                  const dateStr = field.value ? new Date(field.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  return (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      trigger={<TokenTrigger label="Release Date" value={dateStr} icon={Calendar} />}
                    />
                  );
                }}
              />

              <Controller
                name="assignee"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    options={(settings?.managers?.map((m) => m.name) || []).map((m) => ({ label: m, value: m }))}
                    onChange={field.onChange}
                    trigger={<TokenTrigger label="Manager" value={field.value} icon={User} />}
                  />
                )}
              />

              <div className="w-full" /> {/* Force Break */}

              <div className="flex flex-col gap-1">
                <Controller
                  name="units"
                  control={control}
                  render={({ field }) => (
                    <div className={`relative group flex items-center h-10 rounded-full border bg-white shadow-sm transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/50 hover:shadow-md px-4 overflow-hidden w-[160px] ${errors.units ? 'border-destructive' : 'border-slate-200'}`}>
                      <Hash className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors mr-2 shrink-0" />
                      <span className="text-[13px] font-medium text-slate-500 mr-2">Units:</span>
                      <input
                        {...field}
                        type="number"
                        placeholder="0"
                        className="w-full text-[13px] font-semibold text-slate-900 border-none bg-transparent outline-none p-0 focus:ring-0 placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  )}
                />
                <AnimatePresence>
                  {errors.units && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-destructive text-[11px] font-medium ml-2">{errors.units.message}</motion.span>}
                </AnimatePresence>
              </div>

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
                    trigger={<TokenTrigger label="Features" value={field.value.length ? field.value.join(', ') : ''} icon={Layers} />}
                  />
                )}
              />
            </motion.div>


            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {!showKYC && (
                  <motion.div key="kyc-btn" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <button type="button" onClick={() => setShowKYC(true)} className="group flex items-center px-2 py-1 rounded hover:bg-slate-50 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 outline-none w-fit">
                      <span className="text-[13px] font-semibold text-slate-500 group-hover:text-primary transition-colors">+ Add KYC Details</span>
                    </button>
                  </motion.div>
                )}
                {showKYC && (
                  <motion.div key="kyc-editor" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                    <label className="flex items-center text-[13px] font-semibold text-slate-600 ml-1">
                      <FileText className="w-3.5 h-3.5 mr-1.5" /> KYC Details
                    </label>
                    <Controller
                      name="kycDetails"
                      control={control}
                      render={({ field }) => (
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/50 overflow-hidden">
                          <RichTextEditor
                            content={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Enter KYC details here..."
                          />
                        </div>
                      )}
                    />
                  </motion.div>
                )}

                {!showNote && (
                  <motion.div key="note-btn" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <button type="button" onClick={() => setShowNote(true)} className="group flex items-center px-2 py-1 rounded hover:bg-slate-50 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 outline-none w-fit">
                      <span className="text-[13px] font-semibold text-slate-500 group-hover:text-primary transition-colors">+ Add Initial Note</span>
                    </button>
                  </motion.div>
                )}
                {showNote && (
                  <motion.div key="note-editor" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
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
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 active:scale-95 hover:bg-slate-100 text-slate-600 h-10 px-5 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="group inline-flex items-center justify-center rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showDiscardConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl"
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
                  <p className="text-sm text-slate-500 mb-6">You have unsaved changes. If you close this now, your data will be lost.</p>
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
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
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
                  Project Created
                </motion.h2>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
