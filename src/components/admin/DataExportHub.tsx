import React, { useState } from 'react';
import { FileDown, FileSpreadsheet, Loader2, Database } from 'lucide-react';
import { exportAllFormResponsesToCSV } from '../../utils/exportUtils';

interface DataExportHubProps {
  projects: any[];
  getTemplate: (formName: string) => any;
}

const EXPORT_FORMS = [
  { title: 'Onboarding Survey', key: 'survey', isDeliverables: false, desc: 'Client survey responses', category: 'Surveys' },
  { title: 'Primary QA', key: 'primaryQA', isDeliverables: false, desc: 'Internal Primary QA form responses', category: 'Quality Assurance' },
  { title: 'Client QA', key: 'clientQA', isDeliverables: false, desc: 'Client QA review feedback', category: 'Quality Assurance' },
  { title: 'Secondary QA', key: 'secondaryQA', isDeliverables: false, desc: 'Internal Secondary QA sign-offs', category: 'Quality Assurance' },
  { title: 'Project Certification', key: 'certification', isDeliverables: false, desc: 'Final Project Certification responses', category: 'Milestones' },
  { title: 'Onboarding CSAT', key: 'onboardingCsat', isDeliverables: false, desc: 'Client Onboarding CSAT Responses', category: 'Surveys' },
];

export const DataExportHub: React.FC<DataExportHubProps> = ({ projects, getTemplate }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = (form: any, template: any) => {
    setDownloading(form.key);
    // Add a slight delay to allow the UI to render the active state, feeling more premium
    setTimeout(() => {
      exportAllFormResponsesToCSV(form.title, form.key, projects, form.isDeliverables, template);
      setDownloading(null);
    }, 400);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {EXPORT_FORMS.map((form) => {
          const template = getTemplate(form.title);
          
          // Calculate Entry Count (Rows) based on the exact same logic the exporter uses
          let entryCount = 0;
          projects.forEach(p => {
            const flag = 'has' + form.key.charAt(0).toUpperCase() + form.key.slice(1);
            const data = form.isDeliverables ? p.deliverables : (form.key === 'onboardingCsat' ? p.health?.onboardingCsat : p.onboarding?.[form.key]);
            if (p[flag] || (data && Object.keys(data).length > 0)) {
              entryCount++;
            }
          });

          const isDownloading = downloading === form.key;

          return (
            <div key={form.key} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col hover:border-slate-300 hover:shadow-sm transition-all group">
              <div className="flex items-start gap-3.5 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800 text-sm">{form.title}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md shadow-sm shrink-0">
                      <Database className="w-2.5 h-2.5 text-slate-400" />
                      {entryCount} {entryCount === 1 ? 'Entry' : 'Entries'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{form.desc}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleExport(form, template)}
                  disabled={isDownloading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
                    ${isDownloading 
                      ? 'bg-primary/10 text-primary border border-transparent cursor-wait' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 active:scale-95'
                    }`}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      Download CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
