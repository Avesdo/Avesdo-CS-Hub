import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Project, Settings } from '../types';
import { DynamicForm } from '../components/ui/DynamicForm';
import { createNotification, sendEmailAlert } from '../utils/notificationUtils';
import { ClipboardList, CheckCircle2, ShieldCheck, FileText, ChevronRight, Award, ChevronLeft } from 'lucide-react';

type PortalState = 'dashboard' | 'form' | 'csat_intercept' | 'csat_form' | 'success';

export default function ClientPortal() {
  const { projectId } = useParams<{ projectId: string }>();
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
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
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

      // Update project record securely without full context (since we just need to update one field)
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
      const prettyFormName = activeFormType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      await createNotification(project.id, project.name, actionType, prettyFormName);

      // Send email if first submission
      if (isFirstSubmission && ['onboardingSurvey', 'clientQA', 'certification'].includes(activeFormType)) {
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

  const getTemplate = (type: string) => {
    return settings?.templates?.find((t: any) => t.id === type && t.type === 'onboarding');
  };

  const forms = [
    { id: 'deliverables', title: 'Deliverables Checklist', icon: ClipboardList, desc: 'Provide requested project deliverables' },
    { id: 'onboardingSurvey', title: 'Onboarding Survey', icon: FileText, desc: 'Initial onboarding requirements' },
    { id: 'clientQA', title: 'Client QA', icon: ShieldCheck, desc: 'Sign off on client QA review' },
    { id: 'certification', title: 'Project Certification', icon: Award, desc: 'Final project completion sign-off' },
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
              <p className="text-sm text-slate-500">Project: {project.name}</p>
            </div>
          </div>
        </header>
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {!template ? (
              <div className="p-12 text-center text-slate-500">Form template not found.</div>
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

  // CSAT Intercept
  if (viewState === 'csat_intercept') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Project Certified!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Congratulations on successfully completing your Project Certification! We have a small favor to ask—could you leave us some quick feedback regarding your onboarding experience?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setActiveFormType('onboardingCsat');
                setViewState('csat_form');
              }}
              className="w-full bg-[#00bdd9] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#009bc2] transition-colors shadow-md"
            >
              Provide Feedback
            </button>
            <button
              onClick={() => { setViewState('dashboard'); setActiveFormType(null); }}
              className="w-full text-slate-500 font-medium py-3 px-6 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CSAT Form
  if (viewState === 'csat_form') {
    const template = getTemplate('onboardingCsat');
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
              <h1 className="text-xl font-bold text-slate-800">Onboarding Feedback</h1>
              <p className="text-sm text-slate-500">Project: {project.name}</p>
            </div>
          </div>
        </header>
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {!template ? (
              <div className="p-12 text-center text-slate-500">CSAT template not found.</div>
            ) : (
              <DynamicForm
                template={template}
                initialValues={project.health?.onboardingCsat || {}}
                onSubmit={handleSaveForm}
                onCancel={() => { setViewState('dashboard'); setActiveFormType(null); }}
                submitLabel={isSubmitting ? "Submitting..." : "Submit Feedback"}
                readOnly={false}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-slate-900 text-white pb-24">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-center gap-4 mb-4 opacity-80 text-sm font-medium">
            <span className="px-3 py-1 bg-white/10 rounded-full">Client Portal</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">{project.name}</h1>
          <p className="text-slate-400 text-lg">Onboarding & Certification Hub</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
          {forms.map(form => {
            const Icon = form.icon;
            // Determine status
            const dataNode = form.id === 'deliverables' 
              ? project.deliverables 
              : project.onboarding?.[form.id as keyof typeof project.onboarding];
            
            const isCompleted = !!dataNode?.submittedAt;

            return (
              <button
                key={form.id}
                onClick={() => {
                  setActiveFormType(form.id);
                  setViewState('form');
                }}
                className="flex items-center text-left p-5 bg-white border border-transparent rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all group"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4 transition-colors ${
                  isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    {form.title}
                  </h3>
                  <p className="text-sm text-slate-500">{form.desc}</p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  {isCompleted && (
                    <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-600 rounded-md">
                      Completed
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional: CSAT Link if they want to access it directly without certifying first */}
        {project.health?.onboardingCsat?.submittedAt && (
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => { setActiveFormType('onboardingCsat'); setViewState('csat_form'); }}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 underline"
            >
              Update your previous onboarding feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
