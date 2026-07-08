import React from 'react';
import { ChevronRight, FileText, Calendar, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { useAcademyStore } from '../../store/useAcademyStore';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppStore } from '../../store/useAppStore';
import { format } from 'date-fns';
import SmartPasteModal from '../modals/SmartPasteModal';
import { useState } from 'react';

export default function QuizListDashboard() {
  const { activeQuizzes, quizAttempts, setSelectedQuizId } = useAcademyStore();
  const { hasPermission } = usePermissions();
  const { user } = useAppStore();

  const canManage = hasPermission('manage_academy');
  const currentUserId = user?.uid;
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const isOldMonth = (targetYear: number, targetMonth: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (targetYear < currentYear) return true;
    if (targetYear === currentYear && targetMonth < currentMonth) return true;
    return false;
  };

  let drafts: any[] = [];
  let active: any[] = [];
  let past: any[] = [];

  if (canManage) {
    drafts = activeQuizzes.filter((q) => q.status === 'draft' || q.status === 'reviewing');
    active = activeQuizzes.filter(
      (q) =>
        !isOldMonth(q.targetYear, q.targetMonth) &&
        (q.status === 'published' || q.status === 'scheduled')
    );
    past = activeQuizzes.filter(
      (q) =>
        isOldMonth(q.targetYear, q.targetMonth) &&
        (q.status === 'published' || q.status === 'scheduled')
    );
  } else {
    activeQuizzes.forEach((q) => {
      const isEnrolled =
        (currentUserId && q.enrolledUserIds?.includes(currentUserId)) || q.id.startsWith('mock');
      if (!currentUserId || !isEnrolled) return;

      const attempt = quizAttempts.find((a) => a.quizId === q.id && a.userId === currentUserId);

      if (attempt || isOldMonth(q.targetYear, q.targetMonth)) {
        if (q.status === 'published' || attempt) {
          past.push(q);
        }
      } else {
        if (q.status === 'published') {
          active.push(q);
        }
      }
    });
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'reviewing':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderHeroCard = (quiz: any) => {
    const attempt = quizAttempts.find(
      (a) => a.quizId === quiz.id && (a.userId === currentUserId || quiz.id.startsWith('mock'))
    );
    const scorePercentage =
      attempt && quiz.questions?.length > 0
        ? Math.round((attempt.score / quiz.questions.length) * 100)
        : null;

    const quizAttemptsList = quizAttempts.filter((a) => a.quizId === quiz.id);
    const answeredCount = quizAttemptsList.length;
    const enrolledCount = quiz.enrolledUserIds?.length || 0;
    const pendingCount = Math.max(0, enrolledCount - answeredCount);
    const averageScore = answeredCount > 0
      ? Math.round(quizAttemptsList.reduce((acc, curr) => acc + curr.score, 0) / answeredCount)
      : null;
    const isDraft = quiz.status === 'draft' || quiz.status === 'reviewing';

    return (
      <div
        key={quiz.id}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedQuizId(quiz.id);
          }
        }}
        onClick={() => setSelectedQuizId(quiz.id)}
        className="group relative flex flex-row items-center justify-between p-6 bg-white border border-slate-200 shadow-sm rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-200 text-left w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3.5 rounded-xl shrink-0 bg-primary/10 text-primary">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-slate-900 tracking-tight text-lg">
                {getMonthName(quiz.targetMonth)} {quiz.targetYear}
              </h3>
              {canManage && isDraft && (
                <span
                  className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md"
                  title={getStatusText(quiz.status)}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {getStatusText(quiz.status)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10 text-sm">
          <div className="flex flex-col items-end gap-2.5">
            {!canManage && (
              <span className="bg-amber-100 text-amber-700 py-1 px-3 rounded-lg text-xs font-bold tracking-wide">
                Pending action
              </span>
            )}

            {canManage && !isDraft && (
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  {answeredCount} Answered
                </span>
                {pendingCount > 0 && (
                  <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                    {pendingCount} Pending
                  </span>
                )}
                {averageScore !== null && (
                  <span className={`px-2.5 py-1 rounded-lg border font-semibold ${averageScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-amber-700 bg-amber-50 border-amber-100'}`}>
                    Avg: {averageScore}%
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-slate-400 group-hover:text-primary transition-colors bg-slate-50 p-2.5 rounded-full group-hover:bg-primary/10 shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryRow = (quiz: any) => {
    const attempt = quizAttempts.find(
      (a) => a.quizId === quiz.id && (a.userId === currentUserId || quiz.id.startsWith('mock'))
    );
    const scorePercentage =
      attempt && quiz.questions?.length > 0
        ? Math.round(attempt.score)
        : null;

    const quizAttemptsList = quizAttempts.filter((a) => a.quizId === quiz.id);
    const answeredCount = quizAttemptsList.length;
    const averageAdminScore = answeredCount > 0
      ? Math.round(quizAttemptsList.reduce((acc, curr) => acc + curr.score, 0) / answeredCount)
      : null;

    const statusColor = attempt 
      ? (scorePercentage! >= 80 ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-white' : 'border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-white')
      : 'border-slate-200 bg-gradient-to-br from-slate-50/80 via-white to-white';

    return (
      <div
        key={quiz.id}
        onClick={() => setSelectedQuizId(quiz.id)}
        className={`group flex flex-col p-5 rounded-2xl border ${statusColor} hover:shadow-md transition-all cursor-pointer relative overflow-hidden`}
      >
        <div className="flex items-center justify-between mb-6 mt-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-lg shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {getMonthName(quiz.targetMonth)} {quiz.targetYear}
              </h3>
              {!canManage && (
                <p className="text-xs text-slate-500 font-medium">
                  {attempt
                    ? `Submitted ${format(new Date(attempt.completedAt), 'MMM d, yyyy')}`
                    : 'Expired'}
                </p>
              )}
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-auto">
          {canManage ? (
            <div className="flex items-end gap-3 h-8">
              <span className="text-lg font-bold tracking-tight text-slate-800">{answeredCount} <span className="text-sm font-medium text-slate-500">Ans.</span></span>
              {averageAdminScore !== null && (
                <span className={`text-lg font-bold tracking-tight ${averageAdminScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {averageAdminScore}% <span className="text-sm font-medium text-slate-500">Avg.</span>
                </span>
              )}
            </div>
          ) : attempt ? (
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-black tracking-tight leading-none ${scorePercentage! >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {scorePercentage}%
              </span>
              <span className={`text-sm font-medium mb-0.5 ${scorePercentage! >= 80 ? 'text-emerald-600/80' : 'text-amber-600/80'}`}>
                Score
              </span>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-8">
              <span className="text-lg font-bold tracking-tight text-slate-400">Missed</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">All Caught Up</h3>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 overflow-y-auto pr-2 pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Checks</h2>
          <p className="text-slate-500 mt-1 max-w-2xl">
            {canManage
              ? 'Manage drafts, active assignments, and review past performance.'
              : 'Complete your assigned knowledge checks and review past results.'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsImporterOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
          >
            Create Knowledge Check
          </button>
        )}
      </div>

      <div className="space-y-12 max-w-4xl">
        {/* HERO SECTION */}
        <section>
          {canManage ? (
            drafts.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Action Required
                </h3>
                {drafts.map((q) => renderHeroCard(q))}
                {active.length > 0 && active.map((q) => renderHeroCard(q))}
              </div>
            ) : active.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Currently Active
                </h3>
                {active.map((q) => renderHeroCard(q))}
              </div>
            ) : past.length === 0 ? (
              renderEmptyState("You're all caught up for the month.")
            ) : null
          ) : active.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Current Assignment
              </h3>
              {active.map((q) => renderHeroCard(q))}
            </div>
          ) : past.length === 0 ? (
            renderEmptyState("You're all caught up for the month.")
          ) : null}
        </section>

        {/* HISTORY SECTION */}
        {past.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                History
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{past.map((q) => renderHistoryRow(q))}</div>
          </section>
        )}
      </div>

      <SmartPasteModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onSuccess={() => {
          useAcademyStore.getState().fetchQuizzes();
        }}
      />
    </div>
  );
}
