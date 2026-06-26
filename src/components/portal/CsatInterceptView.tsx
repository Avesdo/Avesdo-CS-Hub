import React from 'react';
import { CheckCircle2, FileText } from 'lucide-react';
import { Project } from '../../types';
import { DynamicForm } from '../ui/DynamicForm';

interface CsatInterceptViewProps {
  project: Project;
  template: any;
  isSubmitting: boolean;
  onSaveForm: (data: any, autoSave?: boolean, overrideStatus?: string, overrideFormType?: string) => Promise<void>;
  setActiveFormType: (type: string) => void;
}

export function CsatInterceptView({
  project,
  template,
  isSubmitting,
  onSaveForm,
  setActiveFormType
}: CsatInterceptViewProps) {
  return (
    <div className="min-h-screen bg-white py-12 px-4 flex flex-col">
      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="bg-primary p-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3 drop-shadow-sm">Project Certified!</h2>
            <p className="text-white/90 max-w-xl mx-auto text-lg opacity-90">
              Congratulations on successfully completing your Project Certification. Please take a moment to provide feedback on your onboarding experience.
            </p>
          </div>
          
          <div className="p-2 md:p-8">
            {!template ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-slate-100">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Template Unavailable</h3>
                <p className="text-sm text-slate-500 max-w-[250px]">The requested form template could not be found or is inactive.</p>
              </div>
            ) : (
              <DynamicForm
                template={template}
                initialValues={project.health?.onboardingCsat || {}}
                onSubmit={(data) => {
                  setActiveFormType('onboardingCsat');
                  onSaveForm(data, false, undefined, 'onboardingCsat');
                }}
                onSaveProgress={(data) => {
                  setActiveFormType('onboardingCsat');
                  onSaveForm(data, false, 'In Progress', 'onboardingCsat');
                }}
                submitLabel={isSubmitting ? "Submitting Feedback..." : "Submit Feedback"}
                readOnly={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
