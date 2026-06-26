import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Project } from '../types';
import { ClientPortalSkeleton } from '../components/ui/Skeleton';
import { createNotification, sendEmailAlert } from '../utils/notificationUtils';
import { AlertCircle } from 'lucide-react';
import { useProjectQuery, useSettingsQuery } from '../hooks/useQueries';

// Subcomponents
import { PortalDashboard } from '../components/portal/PortalDashboard';
import { PortalFormView } from '../components/portal/PortalFormView';
import { CsatInterceptView } from '../components/portal/CsatInterceptView';
import { PortalSuccessView } from '../components/portal/PortalSuccessView';
import { useQueryClient } from '@tanstack/react-query';

type PortalState = 'dashboard' | 'form' | 'csat_intercept' | 'success';

export default function ClientPortal() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // View state
  const [viewState, setViewState] = useState<PortalState>('dashboard');
  const [activeFormType, setActiveFormType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TanStack Query Hooks
  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useProjectQuery(projectId);
  const { data: settings, isLoading: isSettingsLoading } = useSettingsQuery();

  const loading = isProjectLoading || isSettingsLoading;
  const error = projectError ? 'Project not found or link is invalid.' : null;

  // Support direct form linking via URL param ?form=survey
  useEffect(() => {
    const formParam = searchParams.get('form');
    if (formParam && ['deliverables', 'survey', 'clientQA', 'certification'].includes(formParam)) {
      setActiveFormType(formParam);
      setViewState('form');
    }
  }, [searchParams]);

  if (loading) {
    return <ClientPortalSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-center max-w-md w-full mx-4 border border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {error || 'Project not found.'}
          </p>
        </div>
      </div>
    );
  }

  const getTemplate = (formId: string) => {
    if (!settings?.templates) return null;
    if (formId === 'deliverables') {
      const tId =
        Object.keys(settings.templates).find(
          (k) => settings.templates[k].name === 'Deliverables Checklist'
        ) ||
        Object.keys(settings.templates).find((k) => settings.templates[k].type === 'checklist');
      return tId ? settings.templates[tId] : null;
    }
    if (formId === 'survey') {
      const tId = Object.keys(settings.templates).find(
        (k) => settings.templates[k].name === 'Onboarding Survey'
      );
      return tId ? settings.templates[tId] : null;
    }
    if (formId === 'clientQA') {
      const tId = Object.keys(settings.templates).find(
        (k) => settings.templates[k].name === 'Client QA'
      );
      return tId ? settings.templates[tId] : null;
    }
    if (formId === 'certification') {
      const tId = Object.keys(settings.templates).find(
        (k) => settings.templates[k].name === 'Project Certification'
      );
      return tId ? settings.templates[tId] : null;
    }
    if (formId === 'onboardingCsat') {
      return settings.templates['onboardingCsat'] || null;
    }
    return null;
  };

  const handleSaveForm = async (
    data: any,
    autoSave = false,
    overrideStatus?: string,
    overrideFormType?: string
  ) => {
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
            if (
              section.dependsOnFeature &&
              section.dependsOnFeature.length > 0 &&
              !section.dependsOnFeature.some((f: string) => activeFeatures.includes(f))
            )
              return;
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

      const projectRef = doc(db, 'projects', project.id);

      let updateObj: any = {};
      if (isCsat) {
        updateObj = { 'health.onboardingCsat': payload };
      } else if (isDeliverables) {
        updateObj = { deliverables: payload };
      } else {
        updateObj = { [`onboarding.${currentFormType}`]: payload };
        if (isFirstSubmission && currentFormType === 'survey') {
          updateObj['onboardingPhase'] = 'Onboarding Survey Received';
        }
      }

      await updateDoc(projectRef, updateObj);

      const actionType = isFirstSubmission ? 'submission' : 'update';
      const prettyFormName =
        currentFormType === 'onboardingCsat'
          ? 'Onboarding CSAT'
          : currentFormType === 'survey'
            ? 'Onboarding Survey'
            : currentFormType === 'clientQA'
              ? 'Client QA'
              : currentFormType === 'certification'
                ? 'Project Certification'
                : currentFormType
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());

      await createNotification(project.id, project.name, actionType, prettyFormName);

      if (
        isFirstSubmission &&
        ['survey', 'clientQA', 'certification', 'onboardingCsat'].includes(currentFormType)
      ) {
        await sendEmailAlert(project.id, project.name, prettyFormName, 'submitted');
      }

      // Invalidate the TanStack query to refetch fresh project data
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });

      if (!autoSave) {
        if (!isSaveProgress) {
          if (currentFormType === 'certification' && isFirstSubmission) {
            setViewState('csat_intercept');
          } else if (
            currentFormType === 'onboardingCsat' ||
            currentFormType === 'survey' ||
            currentFormType === 'clientQA' ||
            currentFormType === 'certification'
          ) {
            setViewState('success');
          } else {
            setViewState('dashboard');
            setActiveFormType(null);
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigate = (formId: string) => {
    setActiveFormType(formId);
    setViewState('form');
  };

  const handleCancelNavigation = (view: PortalState) => {
    setViewState(view);
    setActiveFormType(null);
    window.history.replaceState({}, '', window.location.pathname);
  };

  if (viewState === 'form' && activeFormType) {
    const template = getTemplate(activeFormType);
    const existingData =
      activeFormType === 'deliverables'
        ? project.deliverables
        : project.onboarding?.[activeFormType as keyof typeof project.onboarding];

    return (
      <PortalFormView
        project={project}
        template={template}
        activeFormType={activeFormType}
        isSubmitting={isSubmitting}
        onNavigate={handleCancelNavigation}
        onSaveForm={handleSaveForm}
        existingData={existingData}
      />
    );
  }

  if (viewState === 'csat_intercept') {
    return (
      <CsatInterceptView
        project={project}
        template={getTemplate('onboardingCsat')}
        isSubmitting={isSubmitting}
        onSaveForm={handleSaveForm}
        setActiveFormType={setActiveFormType}
      />
    );
  }

  if (viewState === 'success') {
    return (
      <PortalSuccessView activeFormType={activeFormType} onNavigate={handleCancelNavigation} />
    );
  }

  return (
    <PortalDashboard
      project={project}
      settings={settings!}
      onNavigate={handleNavigate}
      getTemplate={getTemplate}
    />
  );
}
