import React, { useState } from 'react';
import { FileText, CheckSquare, ClipboardCheck, UserCheck, ShieldCheck, Award } from 'lucide-react';
import PrimaryQAModal from '../../modals/PrimaryQAModal';
import SecondaryQAModal from '../../modals/SecondaryQAModal';

interface ProjectOnboardingTabProps {
  project: any;
}

export default function ProjectOnboardingTab({ project }: ProjectOnboardingTabProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const kycData = project?.onboarding?.kyc || {};

  const actionCards = [
    {
      id: 'survey',
      title: 'Onboarding Survey',
      description: 'Review the initial project setup survey submitted by the client.',
      icon: FileText,
      status: 'Pending',
      statusColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'deliverables',
      title: 'Deliverables Checklist',
      description: 'Track the status of all requested features and implementations.',
      icon: CheckSquare,
      status: 'In Progress',
      statusColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'primaryQA',
      title: 'Primary QA',
      description: 'Internal manager review of the initial project setup.',
      icon: ClipboardCheck,
      status: project?.onboarding?.primaryQA ? 'Completed' : 'Pending',
      statusColor: project?.onboarding?.primaryQA
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
    },
    {
      id: 'clientQA',
      title: 'Client QA',
      description: 'Client review of the primary setup and configuration.',
      icon: UserCheck,
      status: 'Pending',
      statusColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'secondaryQA',
      title: 'Secondary QA',
      description: 'Final internal review before project certification.',
      icon: ShieldCheck,
      status: project?.onboarding?.secondaryQA ? 'Completed' : 'Pending',
      statusColor: project?.onboarding?.secondaryQA
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
    },
    {
      id: 'certification',
      title: 'Project Certification',
      description: 'Final client sign-off to officially release the project.',
      icon: Award,
      status: 'Pending',
      statusColor: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* KYC Information Header */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
          KYC / Sales Brief
        </h3>
        {Object.keys(kycData).length === 0 ? (
          <div className="text-sm text-slate-500 italic">No KYC data available for this project.</div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {Object.entries(kycData).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm font-medium text-slate-900">{String(value) || '-'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Card Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
          Onboarding Checkpoints
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => setActiveModal(card.id)}
                className="flex flex-col items-start p-5 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${card.statusColor}`}
                  >
                    {card.status}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">{card.description}</p>
              </button>
            );
          })}
        </div>
      </div>

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

      {/* Placeholders for unbuilt modals */}
      {['survey', 'deliverables', 'clientQA', 'certification'].includes(activeModal || '') && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Coming in Stage 2</h3>
            <p className="text-sm text-slate-600 mb-6">
              This feature requires the Template Engine and will be built in the next development stage.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
