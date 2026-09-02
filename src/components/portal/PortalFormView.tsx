import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, FileText, AppWindow, Briefcase, BookOpen, Download, Mail, Phone, X } from 'lucide-react';
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
      className="h-screen bg-white flex flex-col font-sans overflow-hidden"
    >
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 sticky top-0 z-[var(--z-header)] shadow-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={handleCancel} 
            className="flex items-center gap-4 group outline-none shrink-0"
            title="Return to Dashboard"
          >
            <img
              alt="Avesdo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/d/1HgOfOymPbhh2hjSxeqiZmbe20o6uDlVk"
            />
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <span className="text-[15px] font-semibold text-slate-500 hidden sm:inline-block transition-colors group-hover:text-slate-700">
              Client Portal
            </span>
          </button>
          
          <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                    <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-slate-500 font-medium mb-0.5">
                <button 
                  onClick={handleCancel} 
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <button 
                  onClick={handleCancel} 
                  className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                  title={`Return to ${project.name} Dashboard`}
                >
                  {project.name}
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate max-w-[200px] sm:max-w-none">
                  {template?.name || activeFormType}
                </h1>
                {isSubmitting && activeFormType === 'deliverables' && (
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1.5 animate-pulse shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> 
                    <span className="hidden sm:inline">Auto-saving...</span>
                    <span className="sm:hidden">Saving...</span>
                  </span>
                )}
              </div>
            </div>
        </div>

      </header>

      <div className="flex flex-1 overflow-hidden min-h-0 w-full relative">
        <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${activeFormType === 'deliverables' ? 'px-2 md:px-6' : 'max-w-4xl mx-auto w-full px-4 md:px-6 pt-0 pb-0'}`}>
          <div className="bg-white overflow-hidden flex-1 flex flex-col min-h-0">
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

        {/* Right Sidebar - Resource Center */}
        <div className="w-[320px] shrink-0 border-l border-slate-200 bg-slate-50/50 overflow-y-auto custom-thin-scroll hidden lg:block">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              Resource Center
            </h3>

            <div className="space-y-4">
              <a
                href="https://avesdo.net"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-transparent hover:border-slate-200 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                  <AppWindow className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Avesdo Platform</div>
                  <div className="text-xs text-slate-500">Login to Avesdo</div>
                </div>
              </a>

              {project?.teamworkLink && (
                <a
                  href={project.teamworkLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-transparent hover:border-slate-200 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                    <Briefcase className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Teamwork</div>
                    <div className="text-xs text-slate-500">Document sharing</div>
                  </div>
                </a>
              )}
              
              {activeFormType === 'deliverables' && (
                <button
                  onClick={() => exportFormToCSV('Deliverables Checklist', project, existingData, template)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-transparent hover:border-slate-200 transition-all duration-300 group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 group-hover:scale-110 transition-all duration-300">
                    <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Export CSV</div>
                    <div className="text-xs text-slate-500">Download checklist data</div>
                  </div>
                </button>
              )}

              <div className="pt-4 mt-4 border-t border-slate-200 space-y-4">
                <a
                  href="https://support.avesdo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-transparent hover:border-slate-200 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                    <BookOpen className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Knowledge Base</div>
                    <div className="text-xs text-slate-500">support.avesdo.com</div>
                  </div>
                </a>

                <a
                  href="mailto:support@avesdo.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-transparent hover:border-slate-200 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                    <Mail className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Email Support</div>
                    <div className="text-xs text-slate-500">support@avesdo.com</div>
                  </div>
                </a>

                <a
                  href="tel:18882787980"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-transparent hover:border-slate-200 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                    <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Phone Support</div>
                    <div className="text-xs text-slate-500">1-888-278-7980</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
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
