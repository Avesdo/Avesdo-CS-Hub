import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { updateProjectRecord } from '../../api/dbService';
import { useAppStore } from '../../store/useAppStore';
import { DynamicForm } from '../ui/DynamicForm';

interface ClientQAModalProps {
  project: any;
  onClose: () => void;
}

export default function ClientQAModal({ project, onClose }: ClientQAModalProps) {
  const settings = useAppStore(state => state.settings);
  const templateId = Object.keys(settings?.templates || {}).find(k => settings?.templates[k].name === 'Client QA') || Object.keys(settings?.templates || {}).find(k => settings?.templates[k].type === 'form');
  const template = templateId ? settings?.templates[templateId] : null;

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      const updatedOnboarding = {
        ...project.onboarding,
        clientQA: data,
      };
      await updateProjectRecord({ ...project, onboarding: updatedOnboarding }, {
        successMsg: 'Client QA submitted successfully.',
        errorMsg: 'Failed to save Client QA.',
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
        className="bg-slate-50 flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Client QA</h2>
            <p className="text-sm text-slate-500">Project: {project?.name || 'Unknown'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50 custom-thin-scroll">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200 mb-8 text-sm">
              <strong>Instructions:</strong> Please fill out the required QA checks below. Your progress will be saved to the project.
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              {template ? (
                <DynamicForm 
                  template={template} 
                  initialValues={project?.onboarding?.clientQA || {}} 
                  onSubmit={handleSave} 
                  onCancel={onClose}
                  submitLabel="Submit Client QA"
                />
              ) : (
                <div className="text-center text-slate-500 py-12">
                  No form template found. Please create one in Settings &gt; Templates named "Client QA".
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}