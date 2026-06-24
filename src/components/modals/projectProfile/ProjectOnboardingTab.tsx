import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, ClipboardList, CheckCircle2, Award, CalendarClock, ExternalLink, Copy, CheckSquare, ClipboardCheck, UserCheck, ShieldCheck, Pencil, Check, ChevronDown, Plus, ChevronRight, X, Play } from 'lucide-react';
import { toast } from '../../../utils/toast';
import PrimaryQAModal from '../../modals/PrimaryQAModal';
import SecondaryQAModal from '../../modals/SecondaryQAModal';
import DeliverablesModal from '../../modals/DeliverablesModal';
import OnboardingSurveyModal from '../../modals/OnboardingSurveyModal';
import ClientQAModal from '../../modals/ClientQAModal';
import ProjectCertificationModal from '../../modals/ProjectCertificationModal';
import OnboardingCsatFormModal from '../../modals/OnboardingCsatFormModal';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { updateProjectRecord } from '../../../api/dbService';
import { useAppStore } from '../../../store/useAppStore';
import { getSettingBadge } from '../../../utils/uiUtils';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';

interface ProjectOnboardingTabProps {
  project: any;
}

const MILESTONES = [
  { 
    id: 'Not Started', 
    ids: ['Not Started'],
    label: 'Not Started', 
    getDescription: (phase: string, isCompleted: boolean, isPending: boolean, hasData: boolean) => {
      if (isCompleted) return 'Project has officially commenced.';
      return 'Internal project setup has not yet begun.';
    }, 
    modal: null, 
    getActionLabel: (hasData: boolean) => '', 
    badge: '' 
  },
  { 
    id: 'Onboarding Survey', 
    ids: ['Onboarding Survey Sent', 'Onboarding Survey Received'],
    label: 'Onboarding Survey', 
    getDescription: (phase: string, isCompleted: boolean, isPending: boolean, hasData: boolean, isSubmitted: boolean) => {
      if (isSubmitted || isCompleted || phase === 'Onboarding Survey Received') return 'Client questionnaire successfully received and recorded.';
      if (hasData) return 'Survey dispatched. Awaiting client submission.';
      if (phase === 'Not Started') return 'Change status to Onboarding Survey Sent to begin.';
      return 'Please generate the survey and send the link to the client.';
    }, 
    modal: 'survey', 
    getActionLabel: (hasData: boolean, phase: string) => {
      if (phase === 'Not Started' && !hasData) return '';
      return hasData ? 'View Survey' : 'Generate Survey';
    },
    badge: '' 
  },
  { 
    id: 'Project Setup', 
    ids: ['Setup In Progress', 'Awaiting Inputs'],
    label: 'Project Setup', 
    getDescription: (phase: string, isCompleted: boolean, isPending: boolean, hasData: boolean, isSubmitted: boolean) => {
      if (isCompleted) {
        if (phase === 'Released') return 'Project configuration and deliverables are finalized.';
        return 'Configuration is continuously refined based on QA and client feedback.';
      }
      if (phase === 'Awaiting Inputs') return 'Setup paused. Awaiting required deliverables from the client.';
      if (isPending) {
        if (hasData) return 'Deliverables checklist created. Awaiting configuration to begin.';
        return 'Awaiting client questionnaire before configuration begins.';
      }
      if (!hasData) return 'Please generate the Deliverables Checklist to begin configuration.';
      return 'Actively gathering deliverables and configuring the platform.';
    }, 
    modal: 'deliverables', 
    getActionLabel: (hasData: boolean, phase: string) => hasData ? 'View Checklist' : 'Generate Checklist', 
    badge: '' 
  },
  { 
    id: 'Primary QA', 
    ids: ['Primary QA'], 
    label: 'Primary QA', 
    getDescription: (phase: string, isCompleted: boolean, isPending: boolean, hasData: boolean, isSubmitted: boolean) => {
      if (isCompleted || isSubmitted) return 'Initial internal quality assurance passed.';
      if (hasData) return 'First round of internal quality assurance in progress.';
      if (isPending) return 'Awaiting initial project configuration.';
      return 'Primary QA not started yet.';
    }, 
    modal: 'primaryQA', getActionLabel: (hasData: boolean, phase: string) => hasData ? 'View Primary QA' : 'Start Primary QA', badge: 'Internal' 
  },
  { 
    id: 'Client QA', 
    ids: ['Client QA'], 
    label: 'Client QA', 
    getDescription: (phase: string, isCompleted: boolean, isPending: boolean, hasData: boolean, isSubmitted: boolean) => {
      if (isCompleted || isSubmitted) return 'Client review completed and feedback collected.';
      if (hasData) return 'Client QA form generated. Client is reviewing the configured platform.';
      if (isPending) return 'Awaiting completion of internal Primary QA.';
      return 'Awaiting generation of Client QA form.';
    }, 
    modal: 'clientQA', getActionLabel: (hasData: boolean, phase: string) => hasData ? 'View Client QA' : 'Generate Client QA', badge: 'Client' 
  },
  { 
    id: 'Secondary QA', 
    ids: ['Secondary QA'], 
    label: 'Secondary QA', 
    getDescription: (phase: string, isCompleted: boolean, isPending: boolean, hasData: boolean, isSubmitted: boolean) => {
      if (isCompleted || isSubmitted) return 'Final internal quality assurance passed.';
      if (hasData) return 'Final internal review and adjustments in progress.';
      if (isPending) return 'Awaiting completion of Client QA and subsequent updates.';
      return 'Secondary QA not started yet.';
    }, 
    modal: 'secondaryQA', getActionLabel: (hasData: boolean, phase: string) => hasData ? 'View Secondary QA' : 'Start Secondary QA', badge: 'Internal' 
  },
  { 
    id: 'Project Certification', 
    ids: ['Project Certification'], 
    label: 'Project Certification', 
    getDescription: (phase: string, isCompleted: boolean, isPending: boolean, hasData: boolean, isSubmitted: boolean) => {
      if (isCompleted || isSubmitted) return 'Project officially certified by the client.';
      if (hasData) return 'Certification form generated. Awaiting official client sign-off.';
      if (isPending) return 'Awaiting final internal QA sign-off.';
      return 'Project Certification not generated yet.';
    }, 
    modal: 'certification', getActionLabel: (hasData: boolean, phase: string) => hasData ? 'View Certification' : 'Generate Certification', badge: 'Client' 
  },
  { 
    id: 'Released', 
    ids: ['Released'], 
    label: 'Released', 
    getDescription: (phase: string, isCompleted: boolean, isPending: boolean, hasData: boolean, isSubmitted: boolean) => {
      if (isPending) return 'Project is in progress towards release.';
      return 'Project is live and fully handed over.';
    }, 
    modal: null, getActionLabel: (hasData: boolean, phase: string) => '', badge: '' 
  }
];

export default function ProjectOnboardingTab({ project }: ProjectOnboardingTabProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [openPop, setOpenPop] = useState<'timeline' | 'phase' | null>(null);
  const popRef = React.useRef<HTMLDivElement>(null);
  const openPopRef = React.useRef(openPop);

  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isKycEditing, setIsKycEditing] = useState(false);
  const [kycDraft, setKycDraft] = useState(project?.kycDetails || '');

  const settings = useAppStore(state => state.settings);
  const user = useAppStore(state => state.user);

  useEffect(() => {
    openPopRef.current = openPop;
  }, [openPop]);

  useEffect(() => {
    setKycDraft(project?.kycDetails || '');
  }, [project?.kycDetails]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (activeModal && e.key === 'Escape') {
        e.stopPropagation();
        setActiveModal(null);
      } else if (openPopRef.current && e.key === 'Escape') {
        e.stopPropagation();
        setOpenPop(null);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (openPopRef.current && !target.closest('.popover-container')) {
        setOpenPop(null);
      }
    };

    window.addEventListener('keydown', handleEscape, { capture: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleEscape, { capture: true });
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeModal]);

  const handleUpdate = async (field: string, value: any, oldVal?: any) => {
    if (!project || project[field] === value) return;
    try {
      const updates: any = { [field]: value };
      
      if (field === 'timelineStatus' && value === 'Released') {
        updates.projectStatus = 'Active';
        updates.onboardingPhase = 'Released';
        const today = new Date();
        updates.releaseDateVal = today.toISOString();
      } else if (field === 'onboardingPhase' && value === 'Released') {
        updates.projectStatus = 'Active';
        updates.timelineStatus = 'Released';
        const today = new Date();
        updates.releaseDateVal = today.toISOString();
      }
      
      await updateProjectRecord(
        { ...project, ...updates },
        {
          successMsg: `${field === 'timelineStatus' ? 'Schedule Status' : 'Implementation Status'} successfully updated`,
          errorMsg: `Failed to update status`,
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveKyc = async () => {
    setIsKycEditing(false);
    await updateProjectRecord(
      { ...project, kycDetails: kycDraft },
      {
        successMsg: 'KYC Details updated successfully',
        errorMsg: 'Failed to update KYC Details',
      },
      'KYC Details updated',
      user?.name
    );
  };

  useEffect(() => {
    // Automatically advance phase if survey is received but phase is lagging
    if (project?.onboarding?.survey?.status === 'Submitted' && (project.onboardingPhase === 'Not Started' || project.onboardingPhase === 'Onboarding Survey Sent')) {
      handleUpdate('onboardingPhase', 'Onboarding Survey Received');
    }
  }, [project?.onboarding?.survey?.status, project?.onboardingPhase]);

  const currentPhaseIndex = MILESTONES.findIndex(m => m.ids.includes(project?.onboardingPhase));
  const activeIndex = currentPhaseIndex === -1 ? 0 : currentPhaseIndex;

  const isReleased = project?.onboardingPhase === 'Released';
  const completedCount = isReleased ? MILESTONES.length : activeIndex;
  const progressPercentage = Math.round((completedCount / MILESTONES.length) * 100);

  const getDaysInPhase = (lastUpdated: number) => {
    if (!lastUpdated) return 0;
    const diffTime = Math.abs(new Date().getTime() - lastUpdated);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isFormSubmitted = (modalId: string | null) => {
    if (!modalId) return false;
    if (modalId === 'survey') return project?.onboarding?.survey?.status === 'Submitted';
    if (modalId === 'deliverables') return false; // Deliverables don't have a specific submit status
    if (modalId === 'primaryQA') return project?.onboarding?.primaryQA?.status === 'Submitted';
    if (modalId === 'clientQA') return project?.onboarding?.clientQA?.status === 'Submitted';
    if (modalId === 'secondaryQA') return project?.onboarding?.secondaryQA?.status === 'Submitted';
    if (modalId === 'certification') return project?.onboarding?.certification?.status === 'Submitted';
    return false;
  };

  const getFormSubmitDate = (modalId: string | null) => {
    if (!modalId) return null;
    if (modalId === 'survey') return project?.onboarding?.survey?.submittedAt;
    if (modalId === 'deliverables') return project?.deliverables?.status === 'Completed';
    if (modalId === 'primaryQA') return project?.onboarding?.primaryQA?.submittedAt;
    if (modalId === 'clientQA') return project?.onboarding?.clientQA?.submittedAt;
    if (modalId === 'secondaryQA') return project?.onboarding?.secondaryQA?.submittedAt;
    if (modalId === 'certification') return project?.onboarding?.certification?.submittedAt;
    return null;
  };

  const getFormUpdateDate = (modalId: string | null) => {
    if (!modalId) return null;
    if (modalId === 'survey') return project?.onboarding?.survey?.updatedAt;
    if (modalId === 'deliverables') return project?.deliverables?.updatedAt;
    if (modalId === 'primaryQA') return project?.onboarding?.primaryQA?.updatedAt;
    if (modalId === 'clientQA') return project?.onboarding?.clientQA?.updatedAt;
    if (modalId === 'secondaryQA') return project?.onboarding?.secondaryQA?.updatedAt;
    if (modalId === 'certification') return project?.onboarding?.certification?.updatedAt;
    return null;
  };

  const hasFormData = (modalId: string | null) => {
    if (!modalId) return false;
    if (modalId === 'survey') return !!project?.onboarding?.survey;
    if (modalId === 'deliverables') return project?.deliverables && Object.keys(project.deliverables).length > 0;
    if (modalId === 'primaryQA') return !!project?.onboarding?.primaryQA;
    if (modalId === 'clientQA') return !!project?.onboarding?.clientQA;
    if (modalId === 'secondaryQA') return !!project?.onboarding?.secondaryQA;
    if (modalId === 'certification') return !!project?.onboarding?.certification;
    return false;
  };

  return (
    <div className="space-y-8 pb-10" ref={popRef}>
      
      {/* 1. Top Section: Global Setup & Links */}
      <div className="flex flex-col gap-3 mt-2">
        {/* Client Portal Link */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shrink-0 shadow-sm">
              <ExternalLink className="w-4 h-4 text-[#00bdd9]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-800">Client Portal Link</span>
              <span className="text-[12px] font-medium text-slate-500 truncate">{window.location.origin}/portal/{project?.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/portal/${project?.id}`);
                toast.success('Portal Link copied to clipboard');
              }}
              className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-md transition-colors"
              title="Copy Link"
            >
              <Copy className="w-4 h-4" />
            </button>
            <a
              href={`${window.location.origin}/portal/${project?.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-[12px] transition-colors shadow-sm"
            >
              Preview Portal
            </a>
          </div>
        </div>

        {/* KYC Details Access */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors">KYC Details</span>
              <span className="text-[12px] font-medium text-slate-500">Foundational project knowledge and requirements</span>
            </div>
          </div>
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-lg font-semibold text-[12px] transition-all shadow-sm flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> View KYC
          </button>
        </div>
      </div>

      {/* 2. Middle Section: The Implementation Timeline */}
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 mb-8">
          <h3 className="text-lg font-bold text-slate-900">Implementation Timeline</h3>
          
          {/* Funnel Progress Bar */}
          <div className="flex flex-col gap-2 mb-2 px-1">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-slate-700">Overall Progress</span>
              <span className="font-bold text-primary">{completedCount} of {MILESTONES.length} Phases ({progressPercentage}%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
              <motion.div 
                layout
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Phase Overrides & Schedule Status */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="relative popover-container flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-500">Schedule:</span>
              <button
                onClick={() => setOpenPop(openPop === 'timeline' ? null : 'timeline')}
                className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-xl inline-flex [&>span]:whitespace-normal [&>span]:text-left [&>span]:h-auto [&>span]:rounded-xl"
              >
                {getSettingBadge('timelines', project?.timelineStatus || 'Not Set', settings, true, false)}
              </button>
              <AnimatePresence>
                {openPop === 'timeline' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-2 min-w-[220px] bg-white border border-border rounded-lg shadow-xl z-50 p-1"
                  >
                    {settings?.timelines?.map((t: any) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          handleUpdate('timelineStatus', t.name, project?.timelineStatus);
                          setOpenPop(null);
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-primary/5 transition-colors whitespace-nowrap group"
                      >
                        {getSettingBadge('timelines', t.name, settings, true, false)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative popover-container flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-500">Phase:</span>
              <button
                onClick={() => setOpenPop(openPop === 'phase' ? null : 'phase')}
                className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-xl inline-flex [&>span]:whitespace-normal [&>span]:text-left [&>span]:h-auto [&>span]:rounded-xl"
              >
                {getSettingBadge('phases', project?.onboardingPhase || 'Not Set', settings, true, false)}
              </button>
              <AnimatePresence>
                {openPop === 'phase' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1"
                  >
                    {settings?.phases?.map((p: any) => (
                      <button
                        key={p.name}
                        onClick={() => {
                          handleUpdate('onboardingPhase', p.name, project?.onboardingPhase);
                          setOpenPop(null);
                        }}
                        className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-primary/5 transition-colors whitespace-nowrap group"
                      >
                        {getSettingBadge('phases', p.name, settings, true, false)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative ml-4 border-l-2 border-slate-200 space-y-8 pl-8 py-2">
          {MILESTONES.map((milestone, index) => {
            const isProjectSetup = milestone.id === 'Project Setup';
            const isReleased = activeIndex >= MILESTONES.length - 1; // Released is the last index

            const isCompleted = isProjectSetup 
              ? isReleased 
              : index < activeIndex;
              
            const isActive = isProjectSetup 
              ? (index === activeIndex || (activeIndex > index && !isReleased))
              : index === activeIndex;
              
            const isPending = index > activeIndex;

            const hasData = hasFormData(milestone.modal);
            const isSubmitted = isFormSubmitted(milestone.modal);
            const submitDate = getFormSubmitDate(milestone.modal);
            const updateDate = getFormUpdateDate(milestone.modal);
            const status = milestone.modal ? project?.onboarding?.[milestone.modal as keyof typeof project.onboarding]?.status : undefined;

            return (
              <div key={milestone.id} className={`relative flex items-start group transition-all duration-300 ${isPending ? 'grayscale' : ''}`}>
                {/* Node Symbol */}
                <div className="absolute -left-[49px] top-1 bg-white p-1 rounded-full">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full bg-primary ring-4 ring-primary/20 flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white" />
                  )}
                </div>

                {/* Node Content */}
                <div className={`flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-1 bg-white border border-transparent hover:border-slate-200 rounded-2xl p-3 hover:shadow-sm transition-all -ml-3 ${isPending ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-[15px] font-bold ${isActive ? 'text-primary' : 'text-slate-800'}`}>{milestone.label}</h4>
                      {milestone.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${milestone.badge === 'Internal' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                          {milestone.badge}
                        </span>
                      )}
                      {isActive && !isReleased && project?.lastUpdated && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-sm ${
                          getDaysInPhase(project.lastUpdated) > 14 
                            ? 'bg-red-50 text-red-600 border border-red-200' 
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          ⏱ {getDaysInPhase(project.lastUpdated)} {getDaysInPhase(project.lastUpdated) === 1 ? 'day' : 'days'} in phase
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-slate-500">{milestone.getDescription(project?.onboardingPhase, isCompleted, isPending, hasData, isSubmitted)}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {submitDate && (
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Completed: {new Date(submitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {status !== 'Draft' && updateDate && updateDate !== submitDate && (!submitDate || new Date(updateDate) > new Date(submitDate)) && (
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          Updated: {new Date(updateDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contextual Action */}
                  {milestone.modal && milestone.getActionLabel(hasData, project?.onboardingPhase) && (
                    <div className="shrink-0">
                      <button
                        onClick={async () => {
                          const actionLabel = milestone.getActionLabel(hasData, project?.onboardingPhase);
                          if (!hasData && (actionLabel.startsWith('Generate') || actionLabel.startsWith('Start'))) {
                            let updates = {};
                            if (milestone.modal === 'deliverables') {
                              updates = { deliverables: {} };
                            } else {
                              updates = {
                                onboarding: {
                                  ...(project?.onboarding || {}),
                                  [milestone.modal]: {
                                    answers: {},
                                    status: 'Draft',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                  }
                                }
                              };
                            }
                            await updateProjectRecord(
                              { ...project, ...updates },
                              { successMsg: `${milestone.label} generated successfully.` }
                            );
                          }
                          setActiveModal(milestone.modal);
                        }}
                        disabled={isPending && !hasData}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm ${
                          hasData || (!isPending && !isActive)
                            ? 'bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary/30 hover:bg-slate-50' 
                            : 'bg-primary text-white hover:bg-primary/90 border border-transparent'
                        } ${isPending && !hasData ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' : ''}`}
                      >
                        {hasData ? <FileText className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                        {milestone.getActionLabel(hasData, project?.onboardingPhase)}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KYC Modal */}
      <Dialog.Root open={isKycModalOpen} onOpenChange={setIsKycModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-[10000] overflow-hidden flex flex-col max-h-[85vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-bold text-slate-900">KYC Details</Dialog.Title>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Foundational project knowledge</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isKycEditing && (
                  <button
                    onClick={() => setIsKycEditing(true)}
                    className="px-3 py-1.5 text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                )}
                {isKycEditing && (
                  <button
                    onClick={handleSaveKyc}
                    className="px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                )}
                <Dialog.Close asChild>
                  <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors ml-1">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-thin-scroll bg-white">
              {isKycEditing ? (
                <div className="p-0 h-full min-h-[400px]">
                  <RichTextEditor
                    content={kycDraft}
                    onChange={setKycDraft}
                    placeholder="Paste KYC data here..."
                  />
                </div>
              ) : (
                <div className="p-6">
                  {project?.kycDetails ? (
                    project.kycDetails.includes('<p>') ? (
                      <div
                        className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: project.kycDetails }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium">
                        {project.kycDetails}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                      <FileText className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No KYC details have been added yet.</p>
                      <button
                        onClick={() => setIsKycEditing(true)}
                        className="mt-4 px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg font-semibold transition-colors shadow-sm"
                      >
                        Add Details Now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dedicated Modals */}
      {activeModal === 'primaryQA' && (
        <PrimaryQAModal
          project={project}
          onClose={() => setActiveModal(null)}
        />
      )}
      
      {activeModal === 'secondaryQA' && (
        <SecondaryQAModal
          project={project}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'deliverables' && (
        <DeliverablesModal
          project={project}
          template={settings?.templates?.deliverables || {}}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'survey' && (
        <OnboardingSurveyModal
          project={project}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'clientQA' && (
        <ClientQAModal
          project={project}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'certification' && (
        <ProjectCertificationModal
          project={project}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'onboardingCsat' && (
        <OnboardingCsatFormModal
          project={project}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
