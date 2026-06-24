import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Project, Settings } from '../types';
import { DynamicForm } from '../components/ui/DynamicForm';
import DeliverablesGrid from '../components/ui/DeliverablesGrid';
import { createNotification, sendEmailAlert } from '../utils/notificationUtils';
import { ClipboardList, CheckCircle2, ShieldCheck, FileText, ChevronRight, Award, ChevronLeft, ExternalLink, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { toast } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

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
        const projSnap = await getDoc(doc(db, 'projects', projectId));

        if (projSnap.exists()) {
          setProject({ id: projSnap.id, ...projSnap.data() } as Project);
        } else {
          setError('Project not found or link is invalid.');
        }

        try {
          const settingsSnap = await getDoc(doc(db, 'settings', 'global_config'));
          if (settingsSnap.exists()) {
            setSettings(settingsSnap.data() as Settings);
          }
        } catch (settingsErr) {
          console.warn('Failed to load global settings:', settingsErr);
          // Non-fatal, we can still show the portal
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
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-center max-w-md w-full mx-4 border border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{error || 'Project not found.'}</p>
        </div>
      </div>
    );
  }

  const handleSaveForm = async (data: any, autoSave = false, overrideStatus?: string, overrideFormType?: string) => {
    const currentFormType = overrideFormType || activeFormType;
    if (!project || !currentFormType) return;
    setIsSubmitting(true);
    
    const isSaveProgress = overrideStatus === 'In Progress';
    
    try {
      const isCsat = currentFormType === 'onboardingCsat';
      const isDeliverables = currentFormType === 'deliverables';
      
      const formNode = isCsat 
        ? { ...project.health?.onboardingCsat } 
        : isDeliverables 
          ? { ...project.deliverables }
          : { ...project.onboarding?.[currentFormType as any] };

      const cleanData = Object.fromEntries(
        Object.entries(data || {}).filter(([_, v]) => v !== undefined)
      );

      const isFirstSubmission = overrideStatus === 'In Progress' ? false : !formNode?.submittedAt;
      const payload = {
        ...formNode,
        ...cleanData,
        status: overrideStatus || formNode.status || 'Submitted',
        updatedAt: new Date().toISOString(),
      };

      // Check deliverables completion
      let isDeliverablesComplete = false;
      if (isDeliverables) {
        const dTemplate = getTemplate('deliverables');
        if (dTemplate?.sections) {
          let total = 0;
          let completed = 0;
          const activeFeatures = project?.features || [];
          dTemplate.sections.forEach((section: any) => {
            if ((cleanData as any)._hiddenSections?.includes(section.id)) return;
            if (section.dependsOnFeature && section.dependsOnFeature.length > 0 && !section.dependsOnFeature.some((f: string) => activeFeatures.includes(f))) return;
            
            section.items.forEach((item: any) => {
              if ((cleanData as any)._hiddenItems?.includes(item.id)) return;
              total++;
              const status = (cleanData as any)[item.id]?.status || item.status || 'Pending';
              if (status === 'Completed') completed++;
            });
          });
          ((cleanData as any)._customItems || []).forEach((cItem: any) => {
            if ((cleanData as any)._hiddenItems?.includes(cItem.id)) return;
            total++;
            if (cItem.status === 'Completed') completed++;
          });
          isDeliverablesComplete = total > 0 && completed === total;
        }
      }

      if (isDeliverablesComplete && !formNode?.submittedAt) {
        payload.submittedAt = new Date().toISOString();
        payload.status = 'Completed';
      } else if (!autoSave && !overrideStatus && isFirstSubmission) {
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
          [`onboarding.${currentFormType}`]: payload
        };
        if (isFirstSubmission && currentFormType === 'survey') {
          updateObj['onboardingPhase'] = 'Onboarding Survey Received';
        }
      }

      await updateDoc(projectRef, updateObj);

      // Trigger notifications
      const actionType = isFirstSubmission ? 'submission' : 'update';
      const prettyFormName = currentFormType === 'onboardingCsat' ? 'Onboarding CSAT' : currentFormType === 'survey' ? 'Onboarding Survey' : currentFormType === 'clientQA' ? 'Client QA' : currentFormType === 'certification' ? 'Project Certification' : currentFormType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      await createNotification(project.id, project.name, actionType, prettyFormName);

      // Send email if first submission
      if (isFirstSubmission && ['survey', 'clientQA', 'certification', 'onboardingCsat'].includes(currentFormType)) {
        await sendEmailAlert(project.id, project.name, prettyFormName, 'submitted');
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
        (updatedProject.onboarding as any)[currentFormType] = payload;
        if (isFirstSubmission && currentFormType === 'survey') {
          updatedProject.onboardingPhase = 'Onboarding Survey Received';
        }
      }
      setProject(updatedProject);

      if (!autoSave) {
        if (isSaveProgress) {
          // Feedback handled locally in the form component
        } else {
          // Routing logic after submission
          if (currentFormType === 'certification' && isFirstSubmission) {
            setViewState('csat_intercept');
          } else if (currentFormType === 'onboardingCsat' || currentFormType === 'survey' || currentFormType === 'clientQA' || currentFormType === 'certification') {
            setViewState('success');
          } else {
            setViewState('dashboard');
            setActiveFormType(null);
          }
        }
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
      return settings.templates['onboardingCsat'] || null;
    }
    return null;
  };

  const forms = [
    { id: 'survey', flag: 'hasSurvey', title: 'Onboarding Survey', icon: FileText, desc: 'Initial onboarding requirements' },
    { id: 'deliverables', flag: 'hasDeliverables', title: 'Deliverables Checklist', icon: ClipboardList, desc: 'Provide requested project deliverables' },
    { id: 'clientQA', flag: 'hasPrimaryQA', title: 'Client QA', icon: ShieldCheck, desc: 'Sign off on client QA review' },
    { id: 'certification', flag: 'hasCertification', title: 'Project Certification', icon: Award, desc: 'Final project completion sign-off' },
    { id: 'released', flag: 'hasReleased', title: 'Released', icon: ExternalLink, desc: 'Project released to live environment' },
  ];

  const assignedForms = forms.filter(form => {
    if (form.id === 'released') return true; // Always show released node if we want 5 nodes, or based on a flag if needed. The user wanted 5 nodes, so let's keep it.
    const dataNode = form.id === 'deliverables' ? project.deliverables : project.onboarding?.[form.id as keyof typeof project.onboarding];
    return project[form.flag as keyof Project] === true || (dataNode && Object.keys(dataNode).length > 0);
  });

  const completedCount = forms.filter(form => {
    const dataNode = form.id === 'deliverables' ? project.deliverables : project.onboarding?.[form.id as keyof typeof project.onboarding];
    if (form.id === 'deliverables') {
      const dTemplate = getTemplate('deliverables');
      if (dTemplate?.sections && dataNode) {
        let total = 0; let completed = 0;
        const activeFeatures = project?.features || [];
        dTemplate.sections.forEach((section: any) => {
          if (dataNode._hiddenSections?.includes(section.id)) return;
          if (section.dependsOnFeature && section.dependsOnFeature.length > 0 && !section.dependsOnFeature.some((f: string) => activeFeatures.includes(f))) return;
          section.items.forEach((item: any) => {
            if (dataNode._hiddenItems?.includes(item.id)) return;
            total++;
            if ((dataNode[item.id]?.status || item.status || 'Pending') === 'Completed') completed++;
          });
        });
        (dataNode._customItems || []).forEach((cItem: any) => {
          if (dataNode._hiddenItems?.includes(cItem.id)) return;
          total++;
          if (cItem.status === 'Completed') completed++;
        });
        return total > 0 && completed === total;
      }
      return false;
    }
    if (form.id === 'released') {
      return project.onboardingPhase === 'Released';
    }
    return !!dataNode?.submittedAt || dataNode?.status === 'Submitted';
  }).length;

  const progressPercentage = forms.length > 0 ? Math.round((completedCount / forms.length) * 100) : 0;


  // If viewing a specific form
  if (viewState === 'form' && activeFormType) {
    const template = getTemplate(activeFormType);
    const existingData = activeFormType === 'deliverables' 
      ? project.deliverables 
      : project.onboarding?.[activeFormType as keyof typeof project.onboarding];

    return (
      <motion.div 
        key="form"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden"
      >
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-[100] shadow-sm">
          <div className="flex items-center gap-6">
            <img
              alt="Avesdo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/d/1HgOfOymPbhh2hjSxeqiZmbe20o6uDlVk"
            />
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { 
                  setViewState('dashboard'); 
                  setActiveFormType(null); 
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{template?.name || activeFormType}</h1>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  <p className="text-sm text-slate-500 font-medium">Project: <span className="text-slate-800">{project.name}</span></p>
                  {isSubmitting && activeFormType === 'deliverables' && (
                    <span className="text-[11px] font-bold text-[#00bdd9] flex items-center gap-1.5 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00bdd9]" /> Auto-saving...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col min-h-0">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
            {!template ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-slate-100">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Template Unavailable</h3>
                <p className="text-sm text-slate-500 max-w-[250px]">The requested form template could not be found or is inactive.</p>
              </div>
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
                onSaveProgress={(data) => handleSaveForm(data, false, 'In Progress')}
                onCancel={() => { setViewState('dashboard'); setActiveFormType(null); }}
                submitLabel={isSubmitting ? "Submitting..." : (existingData?.submittedAt ? "Update Answers" : "Submit")}
                readOnly={false}
                projectFeatures={project.features || []}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // CSAT Intercept - Directly rendering the CSAT questions under congratulations
  if (viewState === 'csat_intercept') {
    const template = getTemplate('onboardingCsat');
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex flex-col">
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
                    handleSaveForm(data, false, undefined, 'onboardingCsat');
                  }}
                  onSaveProgress={(data) => {
                    setActiveFormType('onboardingCsat');
                    handleSaveForm(data, false, 'In Progress', 'onboardingCsat');
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
    let successTitle = "Thank You!";
    let successMsg = "Your submission has been received. We appreciate your partnership!";
    
    if (activeFormType === 'onboardingCsat') {
      successMsg = "Thank you for your valuable feedback. We truly appreciate your partnership!";
    } else if (activeFormType === 'survey') {
      successMsg = "Your onboarding survey has been successfully submitted. We will review the details shortly to begin configuration.";
    } else if (activeFormType === 'clientQA') {
      successMsg = "Your quality assurance review has been submitted. Our team will review your feedback and reach out shortly.";
    } else if (activeFormType === 'certification') {
      successMsg = "Your project certification has been successfully updated.";
    }

    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full mx-4 border border-slate-200 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-[#00bdd9]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-[#00bdd9]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">{successTitle}</h2>
          <p className="text-slate-600 mb-8">{successMsg}</p>
          <button
            onClick={() => { 
              setViewState('dashboard'); 
              setActiveFormType(null); 
              window.history.replaceState({}, '', window.location.pathname);
            }}
            className="w-full bg-[#00bdd9] hover:bg-[#00a7c2] text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white font-sans"
    >
      <div className="relative overflow-hidden bg-slate-50 border-b border-slate-200">
        {/* Soft Mesh Gradient Background */}
        <div className="absolute inset-0 bg-white/50 z-0 pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[10%] w-[50%] h-[150%] bg-[#00bdd9]/5 blur-[100px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] right-[10%] w-[40%] h-[120%] bg-[#00bdd9]/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

        {/* Header Bar */}
        <div className="relative z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                alt="Avesdo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/d/1HgOfOymPbhh2hjSxeqiZmbe20o6uDlVk"
              />
              <div className="w-px h-6 bg-slate-200"></div>
              <div className="text-[15px] font-semibold text-slate-500">
                Client Portal
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 pb-16 pt-14">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009bc2] to-[#00bdd9]">{project.name}</span> Workspace
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
              Manage your implementation requirements and track QA and certification progress.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Tasks */}
          <div className="lg:col-span-2 flex flex-col space-y-8">
            {/* Horizontal Progress Tracker */}
            {forms.length > 0 && (
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-slate-600">Onboarding Progress</span>
                      <span className="block text-lg font-bold text-slate-900">{completedCount} of {forms.length} Tasks Completed</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{progressPercentage}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
            )}

            <motion.div 
              className="flex flex-col space-y-6 relative ml-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {/* Vertical Dashed Line */}
              <div className="absolute top-8 bottom-8 left-[51px] border-l-2 border-dashed border-slate-200 z-0"></div>

              {forms.map(form => {
            // Check if the form is assigned/active
            // Using the flags from project, or fallback to data presence
            const dataNode = form.id === 'deliverables' 
              ? project.deliverables 
              : project.onboarding?.[form.id as keyof typeof project.onboarding];

            const Icon = form.icon;
            let isCompleted = false;
            
            if (form.id === 'deliverables') {
              const dTemplate = getTemplate('deliverables');
              if (dTemplate?.sections && dataNode) {
                let total = 0;
                let completed = 0;
                const activeFeatures = project?.features || [];
                
                dTemplate.sections.forEach((section: any) => {
                  if (dataNode._hiddenSections?.includes(section.id)) return;
                  if (section.dependsOnFeature && section.dependsOnFeature.length > 0 && !section.dependsOnFeature.some((f: string) => activeFeatures.includes(f))) return;
                  
                  section.items.forEach((item: any) => {
                    if (dataNode._hiddenItems?.includes(item.id)) return;
                    total++;
                    const status = dataNode[item.id]?.status || item.status || 'Pending';
                    if (status === 'Completed') completed++;
                  });
                });
                
                (dataNode._customItems || []).forEach((cItem: any) => {
                  if (dataNode._hiddenItems?.includes(cItem.id)) return;
                  total++;
                  if (cItem.status === 'Completed') completed++;
                });

                isCompleted = total > 0 && completed === total;
              }
            } else if (form.id === 'released') {
              isCompleted = project.onboardingPhase === 'Released';
            } else {
              isCompleted = !!dataNode?.submittedAt || dataNode?.status === 'Submitted';
            }
            
            let isInProgress = false;
            if (form.id === 'deliverables') {
              isInProgress = dataNode && Object.keys(dataNode).length > 0 && !isCompleted;
            } else {
              isInProgress = dataNode?.status === 'In Progress';
            }

            let isGenerated = false;
            let isLocked = false;
            if (form.id === 'released') {
              isGenerated = true;
              isLocked = !isCompleted;
            } else {
              isGenerated = dataNode && Object.keys(dataNode).length > 0;
              isLocked = !isGenerated;
            }

            return (
              <motion.button
                whileHover={isLocked ? {} : { y: -4, scale: 1.01 }}
                key={form.id}
                onClick={() => {
                  if (isLocked) return;
                  setActiveFormType(form.id);
                  setViewState('form');
                }}
                disabled={isLocked}
                className={`flex items-center text-left p-6 bg-white border border-slate-200 rounded-2xl transition-all duration-300 relative overflow-hidden shadow-sm ${
                  isLocked ? 'opacity-70 grayscale cursor-not-allowed' : 'hover:border-primary/40 hover:shadow-xl group'
                }`}
              >
                {isCompleted && !isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/10 via-emerald-500/5 to-transparent pointer-events-none"></div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mr-6 transition-all duration-300 ${
                  isLocked
                    ? 'bg-slate-100 text-slate-400 border border-slate-200'
                    : isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-500 shadow-inner border border-emerald-500/20' 
                      : isInProgress
                        ? 'bg-blue-500/10 text-blue-600 shadow-inner border border-blue-500/20'
                        : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                }`}>
                  {isLocked ? <Lock className="w-7 h-7" /> : isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Icon className="w-7 h-7" />}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-1.5 flex items-center gap-2 transition-colors ${isLocked ? 'text-slate-500' : 'text-slate-800 group-hover:text-primary'}`}>
                    {form.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1">{form.desc}</p>
                  
                  {(dataNode?.submittedAt || (dataNode?.updatedAt && (form.id === 'deliverables' || dataNode?.status !== 'Draft'))) && (
                    <div className="flex flex-row items-center flex-wrap gap-2 mt-2.5">
                      {isCompleted ? (
                        <>
                          <span className="inline-block text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 w-fit">
                            Completed: {new Date(dataNode.submittedAt || dataNode.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {dataNode?.updatedAt && dataNode.updatedAt !== dataNode.submittedAt && (!dataNode?.submittedAt || new Date(dataNode.updatedAt) > new Date(dataNode.submittedAt)) && (
                            <span className="inline-block text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 w-fit">
                              Updated: {new Date(dataNode.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="inline-block text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 w-fit">
                          Updated: {new Date(dataNode.updatedAt || dataNode.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-4 ml-2">
                  {isLocked ? (
                    <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  ) : isCompleted ? (
                    <span className="text-xs font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20 shadow-sm">
                      Completed
                    </span>
                  ) : isInProgress ? (
                    <span className="text-xs font-bold px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg border border-blue-500/20 shadow-sm">
                      In Progress
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-slate-200 group-hover:border-primary/20">
                      Pending
                    </span>
                  )}
                  {!isLocked && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
            </motion.div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Resource Center Widget */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/60 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Resource Center
              </h3>
              <div className="space-y-4">
                <a href="https://avesdo.net" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                    <ExternalLink className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Avesdo Platform</div>
                    <div className="text-xs text-slate-500">Login to Avesdo</div>
                  </div>
                </a>
                {project.teamworkLink && (
                  <a href={project.teamworkLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                      <ExternalLink className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Teamwork</div>
                      <div className="text-xs text-slate-500">Document sharing</div>
                    </div>
                  </a>
                )}
                
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
                  <a href="https://support.avesdo.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                      <ExternalLink className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Knowledge Base</div>
                      <div className="text-xs text-slate-500">support.avesdo.com</div>
                    </div>
                  </a>
                  
                  <a href="mailto:support@avesdo.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                      <Mail className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Email Support</div>
                      <div className="text-xs text-slate-500">support@avesdo.com</div>
                    </div>
                  </a>
                  
                  <a href="tel:18882787980" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200">
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
      </div>
    </motion.div>
  );
}

// Sub-component for handling Deliverables Grid natively in the Portal
function DeliverablesPortalView({ project, template, initialData, onSave, onCancel, isSubmitting }: any) {
  const [localData, setLocalData] = useState<Record<string, any>>(initialData || {});
  const lastSavedState = React.useRef<string>(JSON.stringify(initialData || {}));

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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const currentString = JSON.stringify(localData);
      if (currentString !== lastSavedState.current) {
        onSave(localData, true); // true for autoSave
        lastSavedState.current = currentString;
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [localData, onSave]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 p-0 overflow-auto">
        <DeliverablesGrid 
          template={template} 
          project={project} 
          values={localData} 
          onChange={handleChange} 
          isClientPortal={true}
        />
      </div>
    </div>
  );
}
