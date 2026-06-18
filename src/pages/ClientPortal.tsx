import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Project, Settings } from '../types';
import { DynamicForm } from '../components/ui/DynamicForm';
import DeliverablesGrid from '../components/ui/DeliverablesGrid';
import { createNotification, sendEmailAlert } from '../utils/notificationUtils';
import { ClipboardList, CheckCircle2, ShieldCheck, FileText, ChevronRight, Award, ChevronLeft } from 'lucide-react';

type PortalState = 'dashboard' | 'form' | 'csat_intercept' | 'success';

export default function ClientPortal() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [viewState, setViewState] = useState<PortalState>('dashboard');
  const [activeFormType, setActiveFormType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!projectId) return;
      try {
        const [projSnap, settingsSnap] = await Promise.all([
          getDoc(doc(db, 'projects', projectId)),
          getDoc(doc(db, 'settings', 'global_config'))
        ]);

        if (projSnap.exists()) {
          setProject({ id: projSnap.id, ...projSnap.data() } as Project);
        } else {
          setError('Project not found or link is invalid.');
        }

        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as Settings);
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred loading the portal.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  // Support direct form linking via URL param ?form=survey
  useEffect(() => {
    const formParam = searchParams.get('form');
    if (formParam && ['deliverables', 'survey', 'clientQA', 'certification'].includes(formParam)) {
      setActiveFormType(formParam);
      setViewState('form');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#00bdd9]/20 border-t-[#00bdd9] rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600 animate-pulse">Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4 border border-slate-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 text-sm mb-6">{error || 'Project not found.'}</p>
        </div>
      </div>
    );
  }

  const handleSaveForm = async (data: any) => {
    if (!project || !activeFormType) return;
    setIsSubmitting(true);
    
    try {
      const isCsat = activeFormType === 'onboardingCsat';
      const isDeliverables = activeFormType === 'deliverables';
      
      const formNode = isCsat 
        ? { ...project.health?.onboardingCsat } 
        : isDeliverables 
          ? { ...project.deliverables }
          : { ...project.onboarding?.[activeFormType as any] };

      const isFirstSubmission = !formNode?.submittedAt;
      const payload = {
        ...formNode,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      if (isFirstSubmission) {
        payload.submittedAt = new Date().toISOString();
      }

      // Update project record securely without full context
      const projectRef = doc(db, 'projects', project.id);
      
      let updateObj: any = {};
      if (isCsat) {
        updateObj = {
          'health.onboardingCsat': payload
        };
      } else if (isDeliverables) {
        updateObj = {
          'deliverables': payload
        };
      } else {
        updateObj = {
          [`onboarding.${activeFormType}`]: payload
        };
      }

      await updateDoc(projectRef, updateObj);

      // Trigger notifications
      const actionType = isFirstSubmission ? 'submission' : 'update';
      const prettyFormName = activeFormType === 'onboardingCsat' ? 'Onboarding CSAT' : activeFormType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      await createNotification(project.id, project.name, actionType, prettyFormName);

      // Send email if first submission
      if (isFirstSubmission && ['survey', 'clientQA', 'certification'].includes(activeFormType)) {
        await sendEmailAlert(project.name, prettyFormName, 'submitted');
      }

      // Update local state
      const updatedProject = { ...project };
      if (isCsat) {
        if (!updatedProject.health) updatedProject.health = {};
        updatedProject.health.onboardingCsat = payload;
      } else if (isDeliverables) {
        updatedProject.deliverables = payload;
      } else {
        if (!updatedProject.onboarding) updatedProject.onboarding = {};
        (updatedProject.onboarding as any)[activeFormType] = payload;
      }
      setProject(updatedProject);

      // Routing logic after submission
      if (activeFormType === 'certification' && isFirstSubmission) {
        setViewState('csat_intercept');
      } else if (activeFormType === 'onboardingCsat') {
        setViewState('success');
      } else {
        setViewState('dashboard');
        setActiveFormType(null);
      }

    } catch (err) {
      console.error(err);
      alert("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTemplate = (formId: string) => {
    if (!settings?.templates) return null;
    
    // Find by Name based on the formId
    if (formId === 'deliverables') {
      const tId = Object.keys(settings.templates).find(k => settings.templates[k].name === 'Deliverables Checklist') || Object.keys(settings.templates).find(k => settings.templates[k].type === 'checklist');
      return tId ? settings.templates[tId] : null;
    }
    if (formId === 'survey') {
      const tId = Object.keys(settings.templates).find(k => settings.templates[k].name === 'Onboarding Survey');
      return tId ? settings.templates[tId] : null;
    }
    if (formId === 'clientQA') {
      const tId = Object.keys(settings.templates).find(k => settings.templates[k].name === 'Client QA');
      return tId ? settings.templates[tId] : null;
    }
    if (formId === 'certification') {
      const tId = Object.keys(settings.templates).find(k => settings.templates[k].name === 'Project Certification');
      return tId ? settings.templates[tId] : null;
    }
    if (formId === 'onboardingCsat') {
      const tId = Object.keys(settings.templates).find(k => settings.templates[k].type === 'onboarding');
      return tId ? settings.templates[tId] : null;
    }
    return null;
  };

  const forms = [
    { id: 'deliverables', flag: 'hasDeliverables', title: 'Deliverables Checklist', icon: ClipboardList, desc: 'Provide requested project deliverables' },
    { id: 'survey', flag: 'hasSurvey', title: 'Onboarding Survey', icon: FileText, desc: 'Initial onboarding requirements' },
    { id: 'clientQA', flag: 'hasPrimaryQA', title: 'Client QA', icon: ShieldCheck, desc: 'Sign off on client QA review' },
    { id: 'certification', flag: 'hasCertification', title: 'Project Certification', icon: Award, desc: 'Final project completion sign-off' },
  ];

  // If viewing a specific form
  if (viewState === 'form' && activeFormType) {
    const template = getTemplate(activeFormType);
    const existingData = activeFormType === 'deliverables' 
      ? project.deliverables 
      : project.onboarding?.[activeFormType as keyof typeof project.onboarding];

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setViewState('dashboard'); setActiveFormType(null); }}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{template?.name || activeFormType}</h1>
              <p className="text-sm text-slate-500 font-medium">Project: <span className="text-slate-800">{project.name}</span></p>
            </div>
          </div>
        </header>
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {!template ? (
              <div className="p-12 text-center text-slate-500">Form template not found.</div>
            ) : activeFormType === 'deliverables' ? (
              <DeliverablesPortalView 
                project={project} 
                template={template} 
                initialData={existingData || {}} 
                onSave={handleSaveForm} 
                onCancel={() => { setViewState('dashboard'); setActiveFormType(null); }} 
                isSubmitting={isSubmitting} 
              />
            ) : (
              <DynamicForm
                template={template}
                initialValues={existingData || {}}
                onSubmit={handleSaveForm}
                onCancel={() => { setViewState('dashboard'); setActiveFormType(null); }}
                submitLabel={isSubmitting ? "Submitting..." : (existingData?.submittedAt ? "Update Answers" : "Submit")}
                readOnly={false}
                projectFeatures={project.features || []}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // CSAT Intercept - Directly rendering the CSAT questions under congratulations
  if (viewState === 'csat_intercept') {
    const template = getTemplate('onboardingCsat');
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col">
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="bg-gradient-to-r from-[#009bc2] to-[#00bdd9] p-10 text-center text-white">
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
                <div className="p-12 text-center text-slate-500">CSAT form not configured.</div>
              ) : (
                <DynamicForm
                  template={template}
                  initialValues={project.health?.onboardingCsat || {}}
                  onSubmit={(data) => {
                    setActiveFormType('onboardingCsat');
                    handleSaveForm(data);
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

  if (viewState === 'success') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full mx-4 border border-slate-200">
          <div className="w-20 h-20 bg-[#00bdd9]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#00bdd9]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Thank You!</h2>
          <p className="text-slate-600 mb-8">Your feedback has been successfully submitted. We appreciate your partnership!</p>
          <button
            onClick={() => setViewState('dashboard')}
            className="w-full bg-slate-100 text-slate-700 font-bold py-3 px-6 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 text-slate-900 pb-20 pt-10 px-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-40">
          <div className="absolute -top-[100%] -left-[10%] w-[50%] h-[200%] bg-gradient-to-r from-[#00bdd9]/10 to-transparent transform rotate-12 blur-3xl"></div>
          <div className="absolute top-[20%] right-[0%] w-[30%] h-[100%] bg-gradient-to-l from-blue-500/5 to-transparent transform -rotate-12 blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 shadow-sm">
              Client Portal
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight">{project.name}</h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl">Manage your project onboarding requirements and track certification progress securely.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {forms.map(form => {
            // Check if the form is assigned/active
            // Using the flags from project, or fallback to data presence
            const dataNode = form.id === 'deliverables' 
              ? project.deliverables 
              : project.onboarding?.[form.id as keyof typeof project.onboarding];
            
            // Render only if the project flag is true OR if it already has submitted data
            const isAssigned = project[form.flag as keyof Project] === true || (dataNode && Object.keys(dataNode).length > 0);
            
            if (!isAssigned) return null;

            const Icon = form.icon;
            const isCompleted = !!dataNode?.submittedAt;

            return (
              <button
                key={form.id}
                onClick={() => {
                  setActiveFormType(form.id);
                  setViewState('form');
                }}
                className="flex items-center text-left p-6 bg-white border border-slate-200 rounded-2xl hover:border-[#00bdd9]/40 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                {isCompleted && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#00bdd9]/10 to-transparent pointer-events-none rounded-tr-2xl"></div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mr-6 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-[#00bdd9]/10 text-[#00bdd9] shadow-inner border border-[#00bdd9]/20' 
                    : 'bg-slate-50 text-slate-400 group-hover:bg-[#00bdd9]/10 group-hover:text-[#00bdd9]'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Icon className="w-7 h-7" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-1.5 flex items-center gap-2 group-hover:text-[#00bdd9] transition-colors">
                    {form.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1">{form.desc}</p>
                </div>
                <div className="shrink-0 flex items-center gap-4 ml-2">
                  {isCompleted ? (
                    <span className="text-xs font-bold px-3 py-1.5 bg-[#00bdd9]/10 text-[#009bc2] rounded-lg border border-[#00bdd9]/20 shadow-sm">
                      Completed
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-[#00bdd9]/10 group-hover:text-[#00bdd9] transition-colors border border-slate-200 group-hover:border-[#00bdd9]/20">
                      Pending
                    </span>
                  )}
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#00bdd9] transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Sub-component for handling Deliverables Grid natively in the Portal
function DeliverablesPortalView({ project, template, initialData, onSave, onCancel, isSubmitting }: any) {
  const [localData, setLocalData] = useState<Record<string, any>>(initialData || {});

  const handleChange = (itemId: string, field: string, value: any) => {
    if (field === 'replace') {
      setLocalData(prev => ({ ...prev, [itemId]: value }));
    } else {
      setLocalData(prev => ({
        ...prev,
        [itemId]: { ...(prev[itemId] || {}), [field]: value }
      }));
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 p-6 overflow-auto">
        <DeliverablesGrid 
          template={template} 
          project={project} 
          values={localData} 
          onChange={handleChange} 
        />
      </div>
      <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 items-center">
        <button 
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave(localData)}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl font-semibold bg-[#00bdd9] text-white hover:bg-[#009bc2] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Submitting...</>
          ) : localData?.submittedAt ? "Update Deliverables" : "Submit Deliverables"}
        </button>
      </div>
    </div>
  );
}
