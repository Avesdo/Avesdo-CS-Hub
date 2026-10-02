import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import DeliverablesGrid from '../ui/DeliverablesGrid';
import { updateProjectRecord } from '../../api/dbService';
import { exportFormToCSV } from '../../utils/exportUtils';
import { useForm, FormProvider, useWatch, useFormContext } from 'react-hook-form';
import { useAppStore } from '../../store/useAppStore';
import { toast } from '../../utils/toast';

interface DeliverablesModalProps {
  project: any;
  template: any;
  onClose: () => void;
}

const HeaderProgress = ({ template, project }: { template: any; project: any }) => {
  const { control } = useFormContext();
  const values = useWatch({ control });

  let total = 0;
  let completed = 0;

  const hiddenItems = values._hiddenItems || [];

  // Count standard items
  const activeFeatures = project?.features || [];
  (template?.sections || []).forEach((sec: any) => {
    if (
      !sec.dependsOnFeature ||
      sec.dependsOnFeature.length === 0 ||
      sec.dependsOnFeature.some((f: any) => activeFeatures.includes(f))
    ) {
      sec.items.forEach((item: any) => {
        if (hiddenItems.includes(item.id)) return;
        const st = values[item.id]?.status;
        if (st === 'N/A') return;
        total++;
        if (['Completed', 'Setup Completed', 'Draft Complete'].includes(st)) completed++;
      });
    }
  });
  // Count custom items
  const customs = values._customItems || [];
  customs.forEach((c: any) => {
    if (c.status === 'N/A') return;
    total++;
    if (['Completed', 'Setup Completed', 'Draft Complete'].includes(c.status)) completed++;
  });

  const pct = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div className="w-full flex flex-col gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100 shadow-inner">
      <div className="flex justify-between items-center text-[13px] font-bold text-slate-600">
        <span>Deliverables Progress</span>
        <span className="text-primary">
          {completed} of {total} Completed
        </span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default function DeliverablesModal({ project, template, onClose }: DeliverablesModalProps) {
  const settings = useAppStore((state) => state.settings);

  const activeTemplate =
    template?.sections && template.sections.length > 0
      ? template
      : settings?.templates?.deliverables ||
        Object.values(settings?.templates || {}).find(
          (t: any) => t?.name === 'Deliverables Checklist' || t?.type === 'checklist'
        ) ||
        template;

  const methods = useForm({
    defaultValues: project?.deliverables || {},
  });

  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedState = useRef<string>(JSON.stringify(project?.deliverables || {}));

  // Auto-generate a draft on first open so the state changes to "View"
  useEffect(() => {
    if (!project?.deliverables || Object.keys(project.deliverables).length === 0) {
      const now = new Date().toISOString();
      const initialDraft = { updatedAt: now, status: 'Draft' };
      updateProjectRecord(
        { ...project, deliverables: initialDraft },
        { successMsg: 'Checklist generated.', errorMsg: 'Failed to generate checklist.' },
        'Deliverables Checklist Generated',
        'System'
      );
      methods.reset(initialDraft);
    }
  }, []);

  const handleCopyLink = () => {
    const portalUrl = `${window.location.origin}/portal/${project.slug || project.id}?form=deliverables`;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (silent = false, currentValues?: any) => {
    setIsSaving(true);
    const valuesToSave = currentValues || methods.getValues();
    const toastOptions = silent
      ? { silent: true }
      : {
          successMsg: 'Deliverables saved successfully!',
          errorMsg: 'Failed to save deliverables.',
        };

    try {
      const freshProject =
        useAppStore.getState().projects.find((p: any) => p.id === project.id) || project;
      const now = new Date().toISOString();
      let total = 0;
      let completed = 0;
      const hiddenItems = valuesToSave._hiddenItems || [];
      const activeFeatures = freshProject?.features || [];

      (activeTemplate?.sections || []).forEach((sec: any) => {
        if (
          !sec.dependsOnFeature ||
          sec.dependsOnFeature.length === 0 ||
          sec.dependsOnFeature.some((f: any) => activeFeatures.includes(f))
        ) {
          (sec.items || []).forEach((item: any) => {
            if (hiddenItems.includes(item.id)) return;
            const st = valuesToSave[item.id]?.status;
            if (st === 'N/A') return;
            total++;
            if (['Completed', 'Setup Completed', 'Draft Complete'].includes(st)) completed++;
          });
        }
      });

      const customs = valuesToSave._customItems || [];
      customs.forEach((c: any) => {
        if (c.status === 'N/A') return;
        total++;
        if (['Completed', 'Setup Completed', 'Draft Complete'].includes(c.status)) completed++;
      });

      const isComplete = total > 0 && completed === total;
      const wasComplete = freshProject?.deliverables?.status === 'Completed';

      const updatedDeliverables: any = {
        ...valuesToSave,
        submittedAt: isComplete ? (wasComplete ? valuesToSave.submittedAt || now : now) : null,
        updatedAt: now,
        status: isComplete ? 'Completed' : 'In Progress',
      };

      await updateProjectRecord(
        { ...freshProject, deliverables: updatedDeliverables },
        toastOptions
      );
      lastSavedState.current = JSON.stringify(updatedDeliverables);
    } catch (e: any) {
      console.error('Failed to save deliverables:', e);
      if (!silent) {
        toast.error(toastOptions.errorMsg || 'Failed to save deliverables.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  // Auto-save effect using RHF subscription
  useEffect(() => {
    const subscription = methods.watch(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const currentVal = methods.getValues();
        const currentStateString = JSON.stringify(currentVal);
        if (currentStateString !== lastSavedState.current) {
          handleSaveRef.current(true, currentVal);
        }
      }, 1000);
    });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      subscription.unsubscribe();
    };
  }, [methods.watch]);

  const handleClose = async () => {
    const currentVal = methods.getValues();
    if (JSON.stringify(currentVal) !== lastSavedState.current) {
      await handleSave(true, currentVal);
    }
    onClose();
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal-overlay)] bg-black/40 backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleClose();
          }}
          onInteractOutside={(e) => {
            if (e.detail.originalEvent.type === 'focusin') {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            handleClose();
          }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[var(--z-modal)] w-full max-w-6xl h-[95vh] outline-none flex flex-col"
        >
          <FormProvider {...methods}>
            {/* Modal Container */}
            <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
              {/* Header */}
              <div className="flex flex-col border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-semibold text-slate-900 tracking-tight">
                        Deliverables Checklist
                      </h2>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <p className="text-sm text-slate-500">
                          Project: {project?.name || 'Unknown'}
                        </p>
                        {isSaving && (
                          <span className="text-[11px] font-bold text-primary flex items-center gap-1.5 animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Saving...
                          </span>
                        )}
                        {(project?.deliverables?.submittedAt || project?.deliverables?.updatedAt) &&
                          !isSaving && (
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium px-3 py-0.5 bg-slate-100 rounded-full">
                              {project?.deliverables?.status === 'Completed' &&
                                project?.deliverables?.submittedAt && (
                                  <span>
                                    Completed:{' '}
                                    {new Date(project?.deliverables.submittedAt).toLocaleDateString(
                                      'en-US',
                                      { month: 'short', day: 'numeric', year: 'numeric' }
                                    )}
                                  </span>
                                )}
                              {project?.deliverables?.updatedAt &&
                                (project?.deliverables?.status !== 'Completed' ||
                                  project?.deliverables?.updatedAt !==
                                    project?.deliverables?.submittedAt) && (
                                  <span>
                                    Updated:{' '}
                                    {new Date(project?.deliverables.updatedAt).toLocaleDateString(
                                      'en-US',
                                      { month: 'short', day: 'numeric', year: 'numeric' }
                                    )}
                                  </span>
                                )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {project?.teamworkLink && (
                      <a
                        href={project.teamworkLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 hover:-translate-y-0.5 px-4 py-2 h-9 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                      >
                        <ExternalLink className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        Teamwork
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        exportFormToCSV('Deliverables Checklist', project, methods.getValues(), {
                          ...activeTemplate,
                          type: 'checklist',
                        })
                      }
                      className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 hover:-translate-y-0.5 px-4 py-2 h-9 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                    >
                      <FileText className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
                      Download CSV
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all duration-300 px-4 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 hover:-translate-y-0.5"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      )}
                      {copied ? 'Copied!' : 'Copy Client Link'}
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSave(false, methods.getValues())}
                      className="bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold px-4 py-2 h-9 rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 shrink-0" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <HeaderProgress template={activeTemplate} project={project} />
              </div>

              {/* Content Area */}
              <div className="flex-1 min-h-0 flex flex-col">
                <DeliverablesGrid template={activeTemplate} project={project} readOnly={false} />
              </div>
            </div>
          </FormProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
