import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, ChevronRight, FileText, ExternalLink, Mail, Phone, ClipboardList, ShieldCheck, Award } from 'lucide-react';
import { Project, Settings } from '../../types';

interface PortalDashboardProps {
  project: Project;
  settings: Settings | null;
  onNavigate: (formId: string) => void;
  getTemplate: (formId: string) => any;
}

const forms = [
  { id: 'survey', flag: 'hasSurvey', title: 'Onboarding Survey', icon: FileText, desc: 'Initial onboarding requirements' },
  { id: 'deliverables', flag: 'hasDeliverables', title: 'Deliverables Checklist', icon: ClipboardList, desc: 'Provide requested project deliverables' },
  { id: 'clientQA', flag: 'hasPrimaryQA', title: 'Client QA', icon: ShieldCheck, desc: 'Sign off on client QA review' },
  { id: 'certification', flag: 'hasCertification', title: 'Project Certification', icon: Award, desc: 'Final project completion sign-off' },
  { id: 'released', flag: 'hasReleased', title: 'Released', icon: ExternalLink, desc: 'Project released to live environment' },
];

export function PortalDashboard({ project, settings, onNavigate, getTemplate }: PortalDashboardProps) {
  const assignedForms = forms.filter(form => {
    if (form.id === 'released') return true;
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
        <div className="absolute inset-0 bg-white/50 z-0 pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[10%] w-[50%] h-[150%] bg-primary/5 blur-[100px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] right-[10%] w-[40%] h-[120%] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

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
              <span className="text-primary">{project.name}</span> Workspace
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
              Manage your implementation requirements and track QA and certification progress.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col space-y-8">
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
              <div className="absolute top-8 bottom-8 left-[51px] border-l-2 border-dashed border-slate-200 z-0"></div>

              {forms.map(form => {
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
                      onNavigate(form.id);
                    }}
                    disabled={isLocked}
                    className={`flex items-center text-left p-6 bg-white border rounded-2xl transition-all duration-300 relative overflow-hidden shadow-sm ${
                      isLocked ? 'opacity-70 grayscale cursor-not-allowed border-slate-200' : 'border-slate-200 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 group'
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
          
          <div className="lg:col-span-1 space-y-6">
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
