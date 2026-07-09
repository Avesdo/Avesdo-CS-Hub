import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText, ExternalLink, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { exportFormToCSV } from '../../utils/exportUtils';
import { Project, Settings } from '../../types';
import { DynamicForm } from '../ui/DynamicForm';
import DeliverablesGrid from '../ui/DeliverablesGrid';

interface PortalFormViewProps {
  project: Project;
  template: any;
  activeFormType: string;
  isSubmitting: boolean;
  onNavigate: (viewState: 'dashboard' | 'form' | 'csat_intercept' | 'success') => void;
  onSaveForm: (
    data: any,
    autoSave?: boolean,
    overrideStatus?: string,
    overrideFormType?: string
  ) => Promise<void>;
  existingData: any;
}

export function PortalFormView({
  project,
  template,
  activeFormType,
  isSubmitting,
  onNavigate,
  onSaveForm,
  existingData,
}: PortalFormViewProps) {
  const handleCancel = () => {
    onNavigate('dashboard');
  };

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden"
    >
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-2.5 flex items-center justify-between shrink-0 sticky top-0 z-[var(--z-header)] shadow-sm">
        <div className="flex items-center gap-6">
          <img
            alt="Avesdo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/d/1HgOfOymPbhh2hjSxeqiZmbe20o6uDlVk"
          />
          <div className="w-px h-6 bg-slate-200"></div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                {template?.name || activeFormType}
              </h1>
              <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                <p className="text-[13px] text-slate-500 font-medium">
                  Project: <span className="text-slate-800">{project.name}</span>
                </p>
                {isSubmitting && activeFormType === 'deliverables' && (
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1.5 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Auto-saving...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {activeFormType === 'deliverables' && (
          <div className="flex items-center gap-3">
            <a
              href={project?.teamworkLink || '#'}
              target={project?.teamworkLink ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className={`group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all duration-300 px-5 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none ${project?.teamworkLink ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] shadow-sm' : 'bg-slate-100 text-slate-400 pointer-events-none'}`}
            >
              <ExternalLink className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="hidden sm:inline">Open Teamwork</span>
            </a>
            <Button
              variant="secondary"
              className="gap-2 px-5 py-2 h-9 border-slate-200 hover:bg-slate-100 hidden sm:inline-flex"
              onClick={() =>
                exportFormToCSV('Deliverables Checklist', project, existingData, template)
              }
            >
              <Download className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        )}
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col min-h-0">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
          {!template ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-slate-100">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Template Unavailable</h3>
              <p className="text-sm text-slate-500 max-w-[250px]">
                The requested form template could not be found or is inactive.
              </p>
            </div>
          ) : activeFormType === 'deliverables' ? (
            <DeliverablesPortalView
              project={project}
              template={template}
              initialData={existingData || {}}
              onSave={onSaveForm}
              isSubmitting={isSubmitting}
            />
          ) : (
            <DynamicForm
              template={template}
              initialValues={existingData || {}}
              onSubmit={(data) => onSaveForm(data)}
              onSaveProgress={(data) => onSaveForm(data, false, 'In Progress')}
              onCancel={handleCancel}
              submitLabel={
                isSubmitting
                  ? 'Submitting...'
                  : existingData?.submittedAt
                    ? 'Update Answers'
                    : 'Submit'
              }
              readOnly={false}
              projectFeatures={project.features || []}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

import { useForm, FormProvider } from 'react-hook-form';

// Sub-component for handling Deliverables Grid natively in the Portal
function DeliverablesPortalView({ project, template, initialData, onSave, isSubmitting }: any) {
  const methods = useForm({
    defaultValues: initialData || {},
  });

  const lastSavedState = React.useRef<string>(JSON.stringify(initialData || {}));

  React.useEffect(() => {
    const subscription = methods.watch((value) => {
      const timer = setTimeout(() => {
        const currentString = JSON.stringify(value);
        if (currentString !== lastSavedState.current) {
          onSave(value, true); // true for autoSave
          lastSavedState.current = currentString;
        }
      }, 1500);
      return () => clearTimeout(timer);
    });
    return () => subscription.unsubscribe();
  }, [methods.watch, onSave]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 p-0 overflow-auto">
        <FormProvider {...methods}>
          <DeliverablesGrid template={template} project={project} isClientPortal={true} />
        </FormProvider>
      </div>
    </div>
  );
}
