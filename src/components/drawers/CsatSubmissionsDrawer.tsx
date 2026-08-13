import React, { useState, useMemo } from 'react';
import { X, Star, MessageSquare, ExternalLink, Calendar, User } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAppStore } from '../../store/useAppStore';
import { TruncatedText } from '../../components/ui/TruncatedText';
import { Select } from '../../components/ui/Select';
import OnboardingCsatFormModal from '../modals/OnboardingCsatFormModal';

export default function CsatSubmissionsDrawer() {
  const { isDrawerOpen, closeDrawer, activeDrawers, getDrawerData, openDrawer } = useUIStore();
  const projects = useAppStore((state) => state.projects);
  const isOpen = isDrawerOpen('csatSubmissions');

  const { submissions = [], type = 'onboardingCsat' } =
    getDrawerData('csatSubmissions')?.data || {};

  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hasCommentsOnly, setHasCommentsOnly] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const { quarters, months } = useMemo(() => {
    const qSet = new Set<string>();
    const mSet = new Set<string>();
    submissions.forEach((sub: any) => {
      if (sub.submittedAt) {
        const d = new Date(sub.submittedAt);
        qSet.add(`Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`);
        mSet.add(new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(d));
      } else if (sub.group) {
        // Fallback for legacy or missing timestamps if group is provided
        if (sub.group.startsWith('Q')) qSet.add(sub.group);
        else mSet.add(sub.group);
      }
    });

    // Sort chronologically (rough sort via string is fine for YYYY or standard Q1/Jan formats,
    // but typically we'd parse. For now alphabetical works reasonably well for Q1, Q2 and Jan/Feb within same year).
    // Actually, sorting properly is better, but alphabetical works ok if they are mostly the same year.
    return {
      quarters: Array.from(qSet).sort(),
      months: Array.from(mSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    let result = submissions;
    if (selectedGroup !== 'All') {
      result = result.filter((sub: any) => {
        if (sub.submittedAt) {
          const d = new Date(sub.submittedAt);
          const qStr = `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
          const mStr = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
            d
          );
          return qStr === selectedGroup || mStr === selectedGroup;
        }
        return sub.group === selectedGroup;
      });
    }

    if (selectedCategory !== 'All') {
      result = result.filter((sub: any) => {
        if (type === 'nps') {
          if (selectedCategory === 'Promoters') return sub.score >= 9;
          if (selectedCategory === 'Passives') return sub.score >= 7 && sub.score <= 8;
          if (selectedCategory === 'Detractors') return sub.score <= 6;
        }
        if (type === 'supportCsat') {
          if (selectedCategory === 'Promoters') return sub.happy > 0;
          if (selectedCategory === 'Passives') return sub.neutral > 0;
          if (selectedCategory === 'Detractors') return sub.unhappy > 0;
        }
        if (type === 'onboardingCsat') {
          if (selectedCategory === 'Promoters') return sub.score >= 90;
          if (selectedCategory === 'Passives') return sub.score >= 70 && sub.score < 90;
          if (selectedCategory === 'Detractors') return sub.score < 70;
        }
        return true;
      });
    }

    if (hasCommentsOnly) {
      result = result.filter((sub: any) => {
        if (type === 'nps') return !!sub.feedback && sub.feedback.trim().length > 0;
        if (type === 'onboardingCsat') return !!sub.comments && sub.comments.trim().length > 0;
        return true; // if supportCsat, ignore this filter since there are no comments usually
      });
    }

    return [...result].sort((a: any, b: any) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [submissions, selectedGroup, selectedCategory, type, hasCommentsOnly]);

  if (!isOpen) return null;

  const drawerIndex = activeDrawers.findIndex((d: any) => d.type === 'csatSubmissions');
  const zIndexOverlay = 100 + Math.max(0, drawerIndex) * 20;
  const zIndexDrawer = 110 + Math.max(0, drawerIndex) * 20;

  const handleOpenProject = (projectId: string) => {
    openDrawer('project', projectId);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown Date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300 ease-in-out transform-gpu"
        style={{ zIndex: zIndexOverlay }}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-slate-50 flex flex-col border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 ease-in-out transform-gpu"
        style={{ zIndex: zIndexDrawer, fontFamily: 'Inter, sans-serif' }}
      >
        <div className="px-6 py-6 border-b border-border bg-white flex flex-col shrink-0 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0"></div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner bg-yellow-50 text-yellow-600 border-yellow-500/20">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col min-w-0">
                <TruncatedText
                  text={
                    type === 'onboardingCsat'
                      ? 'Onboarding CSAT'
                      : type === 'supportCsat'
                        ? 'Support CSAT'
                        : 'NPS Submissions'
                  }
                  containerClassName="text-xl font-bold text-foreground tracking-tight"
                >
                  {type === 'onboardingCsat'
                    ? 'Onboarding CSAT'
                    : type === 'supportCsat'
                      ? 'Support CSAT'
                      : 'NPS Submissions'}
                </TruncatedText>
                <TruncatedText
                  text={
                    type === 'onboardingCsat'
                      ? 'Review project satisfaction scores'
                      : type === 'supportCsat'
                        ? 'Review support satisfaction ratings'
                        : 'Review Net Promoter Scores'
                  }
                  containerClassName="text-sm text-muted-foreground mt-0.5 font-medium"
                >
                  {type === 'onboardingCsat'
                    ? 'Review project satisfaction scores'
                    : type === 'supportCsat'
                      ? 'Review support satisfaction ratings'
                      : 'Review Net Promoter Scores'}
                </TruncatedText>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-full transition-all duration-200 active:scale-95 shrink-0 bg-white shadow-sm border border-slate-200 z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-[13px] font-semibold text-slate-500 shrink-0">
                {filteredSubmissions.length} Submission{filteredSubmissions.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(quarters.length > 0 || months.length > 0) && (
                <Select
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  dropdownWidth="min-w-[150px]"
                  align="left"
                  className="w-[150px]"
                  options={[
                    { label: 'All Time', value: 'All' },
                    ...quarters.map((q) => ({ label: `Quarter: ${q}`, value: q })),
                    ...months.map((m) => ({ label: `Month: ${m}`, value: m })),
                  ]}
                />
              )}

              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                dropdownWidth="min-w-[140px]"
                align="left"
                className="w-[140px]"
                options={[
                  { label: 'All Ratings', value: 'All' },
                  { label: 'Promoters', value: 'Promoters' },
                  { label: 'Passives', value: 'Passives' },
                  { label: 'Detractors', value: 'Detractors' },
                ]}
              />

              {(type === 'nps' || type === 'onboardingCsat') && (
                <div className="flex items-center gap-2 px-3 h-9 bg-slate-50 border border-slate-200 rounded-md">
                  <input
                    type="checkbox"
                    id="hasCommentsOnly"
                    checked={hasCommentsOnly}
                    onChange={(e) => setHasCommentsOnly(e.target.checked)}
                    className="w-4 h-4 text-primary bg-white border-slate-300 rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="hasCommentsOnly" className="text-[13px] font-medium text-slate-600 cursor-pointer select-none">
                    With comments
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-thin-scroll">
          <div className="flex flex-col gap-4">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub: any, idx: number) => {
                if (type === 'nps') {
                  let categoryLabel = 'Detractor';
                  let colorClass = 'text-rose-600';
                  let badgeClass = 'bg-rose-50 text-rose-600 border-rose-100';
                  
                  if (sub.score >= 9) {
                    categoryLabel = 'Promoter';
                    colorClass = 'text-emerald-600';
                    badgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                  } else if (sub.score >= 7) {
                    categoryLabel = 'Passive';
                    colorClass = 'text-amber-500';
                    badgeClass = 'bg-amber-50 text-amber-600 border-amber-100';
                  }

                  return (
                    <div
                      key={sub.id || idx}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col text-left w-full"
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="flex flex-col min-w-0 gap-1.5">
                          <div className="flex flex-col gap-0.5">
                            <TruncatedText
                              text={sub.name || 'Unknown User'}
                              containerClassName="font-bold text-[15px] text-slate-900 leading-tight"
                            >
                              {sub.name || 'Unknown User'}
                            </TruncatedText>
                            {sub.email && (
                              <TruncatedText
                                text={sub.email}
                                containerClassName="text-[13px] text-slate-500 font-normal mt-0.5"
                              >
                                {sub.email}
                              </TruncatedText>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(sub.submittedAt)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 pl-4 gap-1.5">
                          <div className={`text-lg font-bold leading-none tracking-tight ${colorClass}`}>
                            {sub.score}
                          </div>
                          <div className={`text-[10px] font-bold px-1.5 py-0.5 mt-1 rounded text-center border ${badgeClass}`}>
                            {categoryLabel}
                          </div>
                        </div>
                      </div>
                      
                      {sub.feedback && (
                        <div className="mt-4 pt-3 border-t border-slate-100 w-full">
                          <div className="flex gap-2">
                            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[13px] text-slate-600 leading-relaxed italic line-clamp-4">
                              "{sub.feedback}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (type === 'supportCsat') {
                  const score = Math.round((sub.happy / sub.total) * 100) || 0;
                  return (
                    <div
                      key={sub.id || idx}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col text-left w-full"
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="flex flex-col min-w-0 gap-1.5">
                          <TruncatedText
                            text={sub.name || 'Unknown User'}
                            containerClassName="font-bold text-[15px] text-slate-900 leading-tight"
                          >
                            {sub.name || 'Unknown User'}
                          </TruncatedText>
                          
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {sub.submittedAt
                                ? new Intl.DateTimeFormat('en-US', {
                                    month: 'short',
                                    year: 'numeric',
                                  }).format(new Date(sub.submittedAt))
                                : 'Unknown Date'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 pl-4 gap-1.5">
                          <div
                            className={`text-lg font-bold leading-none tracking-tight ${
                              score >= 90
                                ? 'text-emerald-600'
                                : score >= 70
                                  ? 'text-amber-500'
                                  : 'text-rose-600'
                            }`}
                          >
                            {score}%
                          </div>
                          
                          <div className="flex flex-col items-end gap-1 mt-1">
                            {sub.happy > 0 && (
                              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[11px] font-bold">
                                {sub.happy} Promoter{sub.happy !== 1 ? 's' : ''}
                              </span>
                            )}
                            {sub.neutral > 0 && (
                              <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded text-[11px] font-bold">
                                {sub.neutral} Passive{sub.neutral !== 1 ? 's' : ''}
                              </span>
                            )}
                            {sub.unhappy > 0 && (
                              <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded text-[11px] font-bold">
                                {sub.unhappy} Detractor{sub.unhappy !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const scoreOut5 = ((sub.score / 100) * 5).toFixed(1);
                return (
                  <button
                    key={sub.id || idx}
                    onClick={() => {
                      const p = projects.find((proj) => proj.id === sub.projectId);
                      if (p) setSelectedProject(p);
                    }}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 hover:bg-slate-50/50 transition-all duration-300 relative group flex flex-col text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="flex flex-col min-w-0 gap-1">
                        <div className="flex items-center gap-2">
                          <TruncatedText
                            text={sub.projectName || 'Unknown Project'}
                            containerClassName="font-bold text-[15px] text-slate-900"
                          >
                            {sub.projectName || 'Unknown Project'}
                          </TruncatedText>
                          <ExternalLink className="w-3.5 h-3.5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(sub.submittedAt)}</span>
                        </div>

                        {sub.clientName && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                            <User className="w-3.5 h-3.5" />
                            <TruncatedText text={sub.clientName}>{sub.clientName}</TruncatedText>
                          </div>
                        )}
                      </div>

                      {/* Score Block */}
                      <div className="flex flex-col items-end shrink-0 pl-4">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-slate-900 leading-none tracking-tight">
                            {scoreOut5}
                          </span>
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <div
                          className={`text-[10px] font-bold px-1.5 py-0.5 mt-1 rounded text-center ${
                            sub.score >= 90
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : sub.score >= 70
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}
                        >
                          {sub.score}%
                        </div>
                      </div>
                    </div>

                    {sub.comments && (
                      <div className="mt-4 pt-3 border-t border-slate-100 group-hover:border-primary/10 transition-colors w-full">
                        <div className="flex gap-2">
                          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-[13px] text-slate-600 leading-relaxed italic line-clamp-4">
                            "{sub.comments}"
                          </p>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="bg-slate-50/50 rounded-xl p-8 flex flex-col items-center justify-center text-center border border-dashed border-border mt-4 mx-2">
                <p className="text-sm font-medium text-muted-foreground">No submissions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProject && (
        <OnboardingCsatFormModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
