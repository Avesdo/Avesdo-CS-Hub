import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CheckCircle, Edit2, FileText } from 'lucide-react';
import { updateProjectRecord } from '../../api/dbService';
import { useAppStore } from '../../store/useAppStore';
import { DynamicForm } from '../ui/DynamicForm';
import { exportFormToCSV } from '../../utils/exportUtils';

interface SecondaryQAModalProps {
  project: any;
  onClose: () => void;
}

export default function SecondaryQAModal({ project, onClose }: SecondaryQAModalProps) {
  const settings = useAppStore(state => state.settings);
  // Find the secondary QA template (e.g., named "Secondary QA")
  const templateId = Object.keys(settings?.templates || {}).find(k => settings?.templates[k].name === 'Secondary QA') || Object.keys(settings?.templates || {}).find(k => settings?.templates[k].type === 'form');
  const template = templateId ? settings?.templates[templateId] : null;

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const now = new Date().toISOString();
      const updatedOnboarding = {
        ...project.onboarding,
        secondaryQA: {
          ...cleanData,
          submittedAt: project.onboarding?.secondaryQA?.submittedAt || now,
          updatedAt: now
        },
      };
      await updateProjectRecord({ ...project, onboarding: updatedOnboarding }, {
        successMsg: 'Secondary QA submitted successfully.',
        errorMsg: 'Failed to save Secondary QA.',
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
        className="bg-slate-50 flex flex-col w-full max-w-6xl h-[95vh] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between flex-wrap gap-4 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Secondary QA</h2>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <p className="text-sm text-slate-500">Project: {project?.name || 'Unknown'}</p>
              {(project?.onboarding?.secondaryQA?.submittedAt || project?.onboarding?.secondaryQA?.updatedAt) && (
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium px-3 py-0.5 bg-slate-100 rounded-full">
                  {project?.onboarding?.secondaryQA?.submittedAt && <span>Submitted: {new Date(project?.onboarding?.secondaryQA.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  {project?.onboarding?.secondaryQA?.updatedAt && <span>Updated: {new Date(project?.onboarding?.secondaryQA.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Form
              </button>
            )}

            {project?.onboarding?.secondaryQA && Object.keys(project.onboarding.secondaryQA).length > 0 && (
              <button
                onClick={() => exportFormToCSV('Secondary QA', project, project.onboarding.secondaryQA, template)}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm mr-2"
              >
                <FileText className="w-4 h-4" />
                Download CSV
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 p-0 md:p-6 flex items-center justify-center custom-thin-scroll">
          <div className="w-full max-w-3xl h-full bg-white md:rounded-xl md:shadow-sm md:border border-slate-200 overflow-hidden">
            {template ? (
              <DynamicForm 
                template={template} 
                readOnly={!isEditing} 
                initialValues={project?.onboarding?.secondaryQA || {}} 
                onSubmit={handleSave} 
                onCancel={onClose}
                projectFeatures={project.features || []}
                submitLabel={project?.onboarding?.secondaryQA && Object.keys(project.onboarding.secondaryQA).length > 0 ? "Update Response" : "Submit"}
              />
            ) : (
              <div className="text-center text-slate-500 py-12">
                No form template found. Please create one in Settings &gt; Templates named "Secondary QA".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
