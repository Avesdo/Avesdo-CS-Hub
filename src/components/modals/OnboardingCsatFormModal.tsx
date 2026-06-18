import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit2 } from 'lucide-react';
import { updateProjectRecord } from '../../api/dbService';
import { useAppStore } from '../../store/useAppStore';
import { DynamicForm } from '../ui/DynamicForm';

interface OnboardingCsatFormModalProps {
  project: any;
  onClose: () => void;
}

export default function OnboardingCsatFormModal({ project, onClose }: OnboardingCsatFormModalProps) {
  const settings = useAppStore(state => state.settings);
  const templateId = 'onboardingCsat';
  const template = settings?.templates?.[templateId];

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const existingData = project?.health?.onboardingCsat || null;

  const handleSave = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const now = new Date().toISOString();
      const updatedHealth = {
        ...project.health,
        onboardingCsat: {
          ...cleanData,
          submittedAt: existingData?.submittedAt || now,
          updatedAt: now
        },
      };
      
      // If we are recording the new dynamic CSAT, we can optionally clear out the legacy one
      // or leave it intact. We'll leave it intact to be safe, but the new logic will prioritize project.health.onboardingCsat.
      await updateProjectRecord({ ...project, health: updatedHealth }, {
        successMsg: 'Onboarding CSAT submitted successfully.',
        errorMsg: 'Failed to save Onboarding CSAT.',
      });
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

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div 
        className="bg-slate-50 flex flex-col w-full max-w-4xl h-[95vh] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Onboarding CSAT</h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-slate-500">Project: {project?.name || 'Unknown'}</p>
              {(existingData?.submittedAt || existingData?.updatedAt) && (
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium px-3 py-0.5 bg-slate-100 rounded-full">
                  {existingData?.submittedAt && <span>Submitted: {new Date(existingData.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  {existingData?.updatedAt && <span>Updated: {new Date(existingData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing && existingData && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Form
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-hidden relative">
          {!template ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-slate-400 text-2xl font-bold">?</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Template Found</h3>
              <p className="text-slate-500 max-w-md">
                The "Onboarding CSAT" template has not been created yet. Please configure it in Settings &gt; Templates.
              </p>
            </div>
          ) : (
            <DynamicForm 
              template={template} 
              initialValues={existingData || {}} 
              onSubmit={handleSave} 
              onCancel={onClose}
              submitLabel={isSaving ? "Saving..." : (existingData ? "Update CSAT" : "Submit CSAT")}
              readOnly={!!existingData && !isEditing}
              projectFeatures={project?.features || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
