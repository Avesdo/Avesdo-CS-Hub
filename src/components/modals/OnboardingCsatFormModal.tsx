import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Edit2, FileText, Copy, Check } from 'lucide-react';
import { updateProjectRecord } from '../../api/dbService';
import { useAppStore } from '../../store/useAppStore';
import { DynamicForm } from '../ui/DynamicForm';
import { exportFormToCSV } from '../../utils/exportUtils';

interface OnboardingCsatFormModalProps {
  project: any;
  onClose: () => void;
}

export default function OnboardingCsatFormModal({
  project,
  onClose,
}: OnboardingCsatFormModalProps) {
  const settings = useAppStore((state) => state.settings);
  const templateId = 'onboardingCsat';
  const template = settings?.templates?.[templateId];

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const portalUrl = `${window.location.origin}/portal/${project.slug || project.id}?form=feedback`;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const newCsat = project?.health?.onboardingCsat;
  const legacyCsat = project?.onboardingCsat;
  const isLegacy = !newCsat && !!legacyCsat;

  const existingData = newCsat || legacyCsat || null;

  const handleSave = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      const now = new Date().toISOString();
      const updatedHealth = {
        ...project.health,
        onboardingCsat: {
          ...cleanData,
          submittedAt: existingData?.submittedAt || now,
          updatedAt: now,
        },
      };

      // If we are recording the new dynamic CSAT, we can optionally clear out the legacy one
      // or leave it intact. We'll leave it intact to be safe, but the new logic will prioritize project.health.onboardingCsat.
      await updateProjectRecord(
        { ...project, health: updatedHealth },
        {
          successMsg: 'Onboarding CSAT submitted successfully.',
          errorMsg: 'Failed to save Onboarding CSAT.',
        }
      );
      onClose();
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
          {/* Header */}
          <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-wrap gap-4 shrink-0 sticky top-0 z-40">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Onboarding CSAT</h2>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <p className="text-sm text-slate-500">Project: {project?.name || 'Unknown'}</p>
                {(existingData?.submittedAt || existingData?.updatedAt) && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium px-3 py-0.5 bg-slate-100 rounded-full">
                    {existingData?.submittedAt && (
                      <span>
                        Submitted:{' '}
                        {new Date(existingData.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {existingData?.updatedAt &&
                      existingData?.updatedAt !== existingData?.submittedAt && (
                        <span>
                          Updated:{' '}
                          {new Date(existingData.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {!isEditing && existingData && !isLegacy && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 hover:-translate-y-0.5 px-4 py-2 h-9 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
                >
                  <Edit2 className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
                  Edit Form
                </button>
              )}

              {existingData && Object.keys(existingData).length > 0 && (
                <button
                  onClick={() =>
                    exportFormToCSV('Onboarding CSAT', project, existingData, template)
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
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 min-h-0 p-0 md:p-8 flex items-center justify-center custom-thin-scroll">
            <div className="w-full max-w-3xl h-full bg-white md:rounded-2xl md:shadow-lg md:border border-slate-200/60 overflow-hidden flex flex-col">
              {!template ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-slate-400 text-2xl font-bold">?</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No Template Found</h3>
                  <p className="text-slate-500 max-w-md">
                    The "Onboarding CSAT" template has not been created yet. Please configure it in
                    Settings &gt; Templates.
                  </p>
                </div>
              ) : isLegacy ? (
                <div className="flex flex-col h-full overflow-y-auto p-6 md:p-10">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-8">
                    <h3 className="font-bold text-amber-900 mb-1 flex items-center gap-2">
                      Legacy CSAT Response
                    </h3>
                    <p className="text-sm">
                      This is an older CSAT response submitted prior to the new CSAT template. It is
                      preserved here for historical records.
                    </p>
                  </div>
                  <div className="space-y-6">
                    {Object.entries(existingData || {}).map(([key, val]) => {
                      if (['status', 'createdAt', 'updatedAt', 'submittedAt'].includes(key))
                        return null;
                      return (
                        <div
                          key={key}
                          className="bg-slate-50 border border-slate-100 p-4 rounded-xl"
                        >
                          <h4 className="text-sm font-semibold text-slate-700 mb-2 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                            {String(val)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <DynamicForm
                  template={template}
                  initialValues={existingData || {}}
                  onSubmit={handleSave}
                  onCancel={onClose}
                  submitLabel={
                    isSaving
                      ? 'Saving...'
                      : existingData?.status === 'Submitted'
                        ? 'Update CSAT'
                        : 'Submit CSAT'
                  }
                  readOnly={!!existingData && !isEditing}
                  projectFeatures={project?.features || []}
                />
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
