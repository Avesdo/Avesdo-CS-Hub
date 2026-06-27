import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Edit2, Copy, Check } from 'lucide-react';
import { updateProjectRecord } from '../../api/dbService';
import { useAppStore } from '../../store/useAppStore';
import { DynamicForm } from '../ui/DynamicForm';
import { exportFormToCSV } from '../../utils/exportUtils';

interface ClientQAModalProps {
  project: any;
  onClose: () => void;
}

export default function ClientQAModal({ project, onClose }: ClientQAModalProps) {
  const settings = useAppStore((state) => state.settings);
  const templateId =
    Object.keys(settings?.templates || {}).find(
      (k) => settings?.templates[k].name === 'Client QA'
    ) || Object.keys(settings?.templates || {}).find((k) => settings?.templates[k].type === 'form');
  const template = templateId ? settings?.templates[templateId] : null;

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const portalUrl = `${window.location.origin}/portal/${project.slug || project.id}?form=clientQA`;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      const now = new Date().toISOString();
      const updatedOnboarding = {
        ...project.onboarding,
        clientQA: {
          ...cleanData,
          submittedAt: project.onboarding?.clientQA?.submittedAt || now,
          updatedAt: now,
        },
      };
      await updateProjectRecord(
        { ...project, onboarding: updatedOnboarding },
        {
          successMsg: 'Client QA submitted successfully.',
          errorMsg: 'Failed to save Client QA.',
        }
      );
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProgress = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      const now = new Date().toISOString();
      const updatedOnboarding = {
        ...project.onboarding,
        clientQA: {
          ...project.onboarding?.clientQA,
          ...cleanData,
          status: 'In Progress',
          updatedAt: now,
        },
      };
      await updateProjectRecord(
        { ...project, onboarding: updatedOnboarding },
        {
          successMsg: 'Progress saved.',
          errorMsg: 'Failed to save progress.',
        }
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape, { capture: true });
    return () => window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [onClose]);

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-6xl h-[95vh] bg-slate-50 flex flex-col rounded-2xl shadow-2xl z-[130] overflow-hidden outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
          <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-wrap gap-4 shrink-0 sticky top-0 z-40">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Client QA</h2>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <p className="text-sm text-slate-500">Project: {project?.name || 'Unknown'}</p>
                {(project?.onboarding?.clientQA?.submittedAt ||
                  project?.onboarding?.clientQA?.updatedAt) && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium px-3 py-0.5 bg-slate-100 rounded-full">
                    {project?.onboarding?.clientQA?.submittedAt && (
                      <span>
                        Submitted:{' '}
                        {new Date(project?.onboarding?.clientQA.submittedAt).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                      </span>
                    )}
                    {project?.onboarding?.clientQA?.updatedAt &&
                      project?.onboarding?.clientQA?.updatedAt !==
                        project?.onboarding?.clientQA?.submittedAt && (
                        <span>
                          Updated:{' '}
                          {new Date(project?.onboarding?.clientQA.updatedAt).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 hover:-translate-y-0.5 px-4 py-2 h-9 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                >
                  <Edit2 className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
                  Edit Form
                </button>
              )}

              {project?.onboarding?.clientQA &&
                Object.keys(project.onboarding.clientQA).length > 0 && (
                  <button
                    onClick={() =>
                      exportFormToCSV('Client QA', project, project.onboarding.clientQA, template)
                    }
                    className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 hover:-translate-y-0.5 px-4 py-2 h-9 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                  >
                    <FileText className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    Download CSV
                  </button>
                )}
              <button
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
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-0 md:p-8 flex items-center justify-center custom-thin-scroll">
            <div className="w-full max-w-3xl h-full bg-white md:rounded-2xl md:shadow-lg md:border border-slate-200/60 overflow-hidden flex flex-col">
              {template ? (
                <DynamicForm
                  template={template}
                  readOnly={!isEditing}
                  initialValues={project?.onboarding?.clientQA || {}}
                  onSubmit={handleSave}
                  onSaveProgress={handleSaveProgress}
                  onCancel={onClose}
                  projectFeatures={project.features || []}
                  submitLabel={
                    project?.onboarding?.clientQA?.status === 'Submitted'
                      ? 'Update Response'
                      : 'Submit'
                  }
                />
              ) : (
                <div className="text-center text-slate-500 py-12">
                  No form template found. Please create one in Settings &gt; Templates named "Client
                  QA".
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
