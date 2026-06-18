import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, ClipboardList, CheckCircle2, Award, CalendarClock, ExternalLink, Copy, Edit2, Link as LinkIcon, CheckSquare, ClipboardCheck, UserCheck, ShieldCheck, Pencil, Check, ChevronDown, Plus } from 'lucide-react';
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

interface ProjectOnboardingTabProps {
  project: any;
}

export default function ProjectOnboardingTab({ project }: ProjectOnboardingTabProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [openPop, setOpenPop] = useState<'timeline' | 'phase' | 'addForm' | null>(null);
  const popRef = React.useRef<HTMLDivElement>(null);
  const openPopRef = React.useRef(openPop);
  
  const [teamworkLink, setTeamworkLink] = useState(project?.teamworkLink || '');
  const [editingTeamworkLink, setEditingTeamworkLink] = useState(false);

  useEffect(() => {
    openPopRef.current = openPop;
  }, [openPop]);

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

  const settings = useAppStore(state => state.settings);
  const user = useAppStore(state => state.user);

  const handleUpdate = async (field: string, value: any, oldVal?: any) => {
    if (!project || project[field] === value) return;
    try {
      const updates: any = { [field]: value };
      
      if (field === 'timelineStatus' && value === 'Released') {
        updates.projectStatus = 'Active';
        updates.onboardingPhase = 'Released';
        const today = new Date();
        updates.releaseDateVal = today.toISOString();
      }
      
      await updateProjectRecord(
        { ...project, ...updates },
        {
          successMsg: `${field === 'timelineStatus' ? 'Schedule Status' : 'Implementation Status'} successfully updated.`,
          errorMsg: `Failed to update status.`,
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isKycEditing, setIsKycEditing] = useState(false);
  const [kycDraft, setKycDraft] = useState(project?.kycDetails || '');

  const handleSaveKyc = async () => {
    setIsKycEditing(false);
    await updateProjectRecord({ ...project, kycDetails: kycDraft }, {
      successMsg: 'KYC Details updated successfully.',
      errorMsg: 'Failed to update KYC Details.',
    });
  };

  const allActionCards = [
    {
      id: 'hasDeliverables',
      modalId: 'deliverables',
      title: 'Deliverables Checklist',
      icon: CheckSquare,
      status: project?.deliverables && Object.keys(project.deliverables).length > 0 ? 'Completed' : 'Pending',
      statusColor: project?.deliverables && Object.keys(project.deliverables).length > 0
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-blue-100 text-blue-700',
      dataRef: project?.deliverables
    },
    {
      id: 'hasSurvey',
      modalId: 'survey',
      title: 'Onboarding Survey',
      icon: FileText,
      status: project?.onboarding?.survey ? 'Completed' : 'Pending',
      statusColor: project?.onboarding?.survey
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
      dataRef: project?.onboarding?.survey
    },
    {
      id: 'hasPrimaryQA',
      modalId: 'primaryQA',
      title: 'Primary QA',
      icon: ClipboardCheck,
      status: project?.onboarding?.primaryQA ? 'Completed' : 'Pending',
      statusColor: project?.onboarding?.primaryQA
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
      dataRef: project?.onboarding?.primaryQA
    },
    {
      id: 'hasClientQA',
      modalId: 'clientQA',
      title: 'Client QA',
      icon: UserCheck,
      status: project?.onboarding?.clientQA ? 'Completed' : 'Pending',
      statusColor: project?.onboarding?.clientQA
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
      dataRef: project?.onboarding?.clientQA
    },
    {
      id: 'hasSecondaryQA',
      modalId: 'secondaryQA',
      title: 'Secondary QA',
      icon: ShieldCheck,
      status: project?.onboarding?.secondaryQA ? 'Completed' : 'Pending',
      statusColor: project?.onboarding?.secondaryQA
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
      dataRef: project?.onboarding?.secondaryQA
    },
    {
      id: 'hasCertification',
      modalId: 'certification',
      title: 'Project Certification',
      icon: Award,
      status: project?.onboarding?.certification ? 'Completed' : 'Pending',
      statusColor: project?.onboarding?.certification
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
      dataRef: project?.onboarding?.certification
    },
    {
      id: 'hasOnboardingCsat',
      modalId: 'onboardingCsat',
      title: 'Onboarding CSAT',
      icon: CheckCircle2,
      status: project?.health?.onboardingCsat ? 'Completed' : 'Pending',
      statusColor: project?.health?.onboardingCsat
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
      dataRef: project?.health?.onboardingCsat
    },
  ];

  const activeCards = allActionCards.filter(card => project?.[card.id === 'hasOnboardingCsat' ? 'health' : 'onboarding'] || project?.health?.onboardingCsat || project?.[card.id]);
  const availableToAdd = allActionCards.filter(card => !(project?.[card.id === 'hasOnboardingCsat' ? 'health' : 'onboarding'] || project?.health?.onboardingCsat || project?.[card.id]));

  return (
    <div className="space-y-8 pb-10" ref={popRef}>
      {/* Project Statuses */}
      <div className="flex flex-col gap-6 mt-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
          <div className="relative popover-container">
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Schedule Status
            </label>
            <div className="flex">
              <button
                onClick={() => setOpenPop(openPop === 'timeline' ? null : 'timeline')}
                className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-xl inline-flex [&>span]:whitespace-normal [&>span]:text-left [&>span]:h-auto [&>span]:rounded-xl"
              >
                {getSettingBadge('timelines', project?.timelineStatus || 'Not Set', settings, true)}
              </button>
            </div>
            {openPop === 'timeline' && (
              <div className="absolute top-full left-0 mt-2 min-w-[220px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
                {settings?.timelines?.map((t: any) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      handleUpdate('timelineStatus', t.name, project?.timelineStatus);
                      setOpenPop(null);
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap"
                  >
                    {getSettingBadge('timelines', t.name, settings, true)}
                  </button>
                ))}
              </div>
            )}
          </div>
  
          <div className="relative popover-container">
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Implementation Status
            </label>
            <div className="flex">
              <button
                onClick={() => setOpenPop(openPop === 'phase' ? null : 'phase')}
                className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-xl inline-flex [&>span]:whitespace-normal [&>span]:text-left [&>span]:h-auto [&>span]:rounded-xl"
              >
                {getSettingBadge('phases', project?.onboardingPhase || 'Not Set', settings, true)}
              </button>
            </div>
            {openPop === 'phase' && (
              <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
                {settings?.phases?.map((p: any) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      handleUpdate('onboardingPhase', p.name, project?.onboardingPhase);
                      setOpenPop(null);
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 whitespace-nowrap"
                  >
                    {getSettingBadge('phases', p.name, settings, true)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Teamwork Link */}
        <div className="relative">
            <label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              Teamwork Link
            </label>
            {editingTeamworkLink ? (
          <input
            type="url"
            autoFocus
            className="w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[38px] text-sm transition-all text-blue-600 hover:text-blue-800 underline"
            value={teamworkLink}
            onChange={(e) => setTeamworkLink(e.target.value)}
            onBlur={(e) => {
              if (teamworkLink !== (project?.teamworkLink || '')) {
                handleUpdate('teamworkLink', teamworkLink);
              }
              setEditingTeamworkLink(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.currentTarget.value !== (project?.teamworkLink || '')) {
                  handleUpdate('teamworkLink', e.currentTarget.value);
                }
                setEditingTeamworkLink(false);
              }
              if (e.key === 'Escape') {
                setTeamworkLink(project?.teamworkLink || '');
                setEditingTeamworkLink(false);
              }
            }}
            placeholder="https://"
          />
        ) : (
          <div className="flex items-center gap-3 w-full min-h-[38px] rounded-md border border-input bg-white px-3 py-2 shadow-sm text-sm transition-all group">
            <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            {project?.teamworkLink ? (
              <div className="flex-1 font-medium truncate">{project.teamworkLink}</div>
            ) : (
              <span className="flex-1 text-muted-foreground italic">None</span>
            )}
            <div className="flex items-center gap-2">
              {project?.teamworkLink && (
                <>
                  <a
                    href={
                      project.teamworkLink.match(/^https?:\/\//)
                        ? project.teamworkLink
                        : `https://${project.teamworkLink}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    Open Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(project.teamworkLink);
                      toast.success('Copied to clipboard');
                    }}
                    className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md transition-colors shadow-sm"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setEditingTeamworkLink(true)}
                className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md transition-colors shadow-sm"
                title="Edit URL"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Action Card Grid */}
      <div>
        <div className="flex flex-col gap-3">
          {activeCards.map((card) => {
            const Icon = card.icon;
            
            let dateSubmittedStr = '';
            let dateUpdatedStr = '';
            if (card.dataRef) {
              if (card.dataRef.submittedAt) {
                dateSubmittedStr = new Date(card.dataRef.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              }
              if (card.dataRef.updatedAt) {
                dateUpdatedStr = new Date(card.dataRef.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              }
            }

            return (
              <button
                key={card.id}
                onClick={() => setActiveModal(card.modalId)}
                className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all duration-200 text-left group gap-4"
              >
                <div className="p-2.5 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors shrink-0">
                  <Icon className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-semibold text-slate-800 text-[15px] truncate">{card.title}</h4>
                    {(dateSubmittedStr || dateUpdatedStr) && (
                      <div className="text-[12px] font-medium text-slate-500 truncate flex items-center gap-1.5">
                        {dateSubmittedStr && <span>Submitted: {dateSubmittedStr}</span>}
                        {dateSubmittedStr && dateUpdatedStr && <span>•</span>}
                        {dateUpdatedStr && <span>Updated: {dateUpdatedStr}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold ${card.statusColor}`}>
                  {card.status}
                </div>
              </button>
            );
          })}

          {availableToAdd.length > 0 && (
            <div className="relative popover-container flex mt-2">
              <button
                onClick={() => setOpenPop(openPop === 'addForm' ? null : 'addForm')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 text-slate-400" />
                Add Form
              </button>
              
              {openPop === 'addForm' && (
                <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-border rounded-lg shadow-xl z-50 p-1">
                  {availableToAdd.map((f: any) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        handleUpdate(f.id, true);
                        setOpenPop(null);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 whitespace-nowrap flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-slate-400" />
                      {f.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KYC Information Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
        <div className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-100">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsKycOpen(!isKycOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-slate-800">KYC Details</h4>
              <p className="text-xs text-slate-500">
                Foundational project knowledge and setup requirements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isKycOpen && !isKycEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsKycEditing(true);
                  setKycDraft(project?.kycDetails || '');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {isKycOpen && isKycEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveKyc();
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
            )}
            <button
              onClick={() => setIsKycOpen(!isKycOpen)}
              className="p-1.5 hover:bg-slate-200 rounded-md transition-colors ml-1"
            >
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isKycOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {isKycOpen && (
          <div className="p-0 border-t border-slate-200 bg-white">
            {isKycEditing ? (
              <div className="bg-slate-50 min-h-[400px]">
                <RichTextEditor
                  content={kycDraft}
                  onChange={setKycDraft}
                  placeholder="Paste KYC data here..."
                />
              </div>
            ) : (
              <div className="p-5 max-h-[500px] overflow-y-auto custom-thin-scroll bg-white">
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
                  <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                    <FileText className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No KYC details have been added yet.</p>
                    <button
                      onClick={() => setIsKycEditing(true)}
                      className="mt-3 text-sm text-blue-600 hover:underline font-semibold"
                    >
                      Add Details
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
