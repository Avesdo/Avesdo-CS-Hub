import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  RotateCcw,
  ClipboardCheck,
  Target,
  BookOpen,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useAcademyStore } from '../../store/useAcademyStore';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppStore } from '../../store/useAppStore';
import { format } from 'date-fns';
import SmartPasteModal from '../modals/SmartPasteModal';

export default function QuizListDashboard() {
  const { activeQuizzes, quizAttempts, setSelectedQuizId, fetchQuizzes, isLoading } =
    useAcademyStore();
  const { hasPermission } = usePermissions();
  const { user } = useAppStore();

  const canManage = hasPermission('manage_academy');
  const currentUserId = user?.uid;
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    fetchQuizzes(canManage, currentUserId);
  }, [fetchQuizzes, canManage, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
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
    const totalAssigned = enrolledCount || answeredCount || 1;
    const completionRate = Math.round((answeredCount / totalAssigned) * 100);
    const averageScore =
      answeredCount > 0
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
        className={`group relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white border border-slate-200 shadow-sm rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300 text-left w-full overflow-hidden gap-6 ${
          !canManage ? 'bg-gradient-to-br from-primary/5 via-white to-white border-primary/20' : ''
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-start md:items-center gap-5 relative z-10 w-full md:w-auto">
          <div
            className={`p-4 rounded-2xl shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
              !canManage ? 'bg-primary text-white shadow-primary/20' : 'bg-primary/10 text-primary'
            }`}
          >
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-slate-900 tracking-tight text-xl">
                {getMonthName(quiz.targetMonth)} {quiz.targetYear}
              </h3>
              {canManage && isDraft && (
                <span
                  className="flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md"
                  title={getStatusText(quiz.status)}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {getStatusText(quiz.status)}
                </span>
              )}
            </div>
            {!canManage && (
              <p className="text-sm font-medium text-slate-600">
                You have a pending knowledge check ready for you!
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col items-start md:items-end gap-2.5 w-full md:w-auto">
            {!canManage && (
              <div className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors py-2 px-5 rounded-xl text-sm font-bold tracking-wide w-full md:w-auto justify-center">
                <Target className="w-4 h-4" /> Start Knowledge Check
              </div>
            )}

            {canManage && !isDraft && (
              <div className="flex items-center gap-6 w-full md:w-[22rem]">
                <div className="flex flex-col gap-2.5 flex-1">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span
                      className={
                        completionRate >= 100
                          ? 'text-emerald-600 flex items-center gap-1'
                          : 'text-slate-600'
                      }
                    >
                      {completionRate >= 100 && <Award className="w-4 h-4" />}
                      {completionRate >= 100 ? 'Team Complete!' : 'Team Progress'}
                    </span>
                    <span className={completionRate >= 100 ? 'text-emerald-700' : 'text-slate-900'}>
                      {answeredCount} / {enrolledCount} Done
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${completionRate >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                {averageScore !== null && (
                  <div className="flex flex-col items-center justify-center pl-6 border-l border-slate-100 shrink-0">
                    <span className="text-[11px] font-bold text-slate-400 mb-0.5 tracking-wider">
                      Avg Score
                    </span>
                    <span
                      className={`text-2xl font-black ${averageScore >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}
                    >
                      {averageScore}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-slate-400 group-hover:text-primary transition-colors bg-slate-50 p-3 rounded-full group-hover:bg-primary/10 shrink-0 hidden md:block">
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
      attempt && quiz.questions?.length > 0 ? Math.round(attempt.score) : null;

    const quizAttemptsList = quizAttempts.filter((a) => a.quizId === quiz.id);
    const answeredCount = quizAttemptsList.length;
    const averageAdminScore =
      answeredCount > 0
        ? Math.round(quizAttemptsList.reduce((acc, curr) => acc + curr.score, 0) / answeredCount)
        : null;

    const isSuccess = attempt ? scorePercentage! >= 80 : false;

    const adminSuccess = averageAdminScore !== null ? averageAdminScore >= 80 : false;

    const statusColor = canManage
      ? averageAdminScore !== null
        ? adminSuccess
          ? 'border-emerald-200 bg-emerald-50/30'
          : 'border-amber-200 bg-amber-50/30'
        : 'border-slate-200 bg-slate-50/50'
      : attempt
        ? isSuccess
          ? 'border-emerald-200 bg-emerald-50/30'
          : 'border-amber-200 bg-amber-50/30'
        : 'border-slate-200 bg-slate-50/50';

    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const score = canManage ? averageAdminScore : scorePercentage;
    const strokeDashoffset =
      score !== null ? circumference - (score / 100) * circumference : circumference;

    const headerColor = canManage
      ? 'bg-primary/15 text-slate-700'
      : attempt
        ? isSuccess
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-amber-50 text-amber-700'
        : 'bg-slate-50 text-slate-600';

    return (
      <div
        key={quiz.id}
        onClick={() => setSelectedQuizId(quiz.id)}
        className="group flex flex-col rounded-2xl border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden bg-white"
      >
        {/* Calendar Header (Tear-off Top) */}
        <div className={`py-3 px-5 flex items-center justify-center gap-1.5 ${headerColor}`}>
          <span className="font-bold text-lg tracking-wider">{getMonthName(quiz.targetMonth)}</span>
          <span className="font-medium opacity-90 text-lg">{quiz.targetYear}</span>
          {!canManage && attempt && (
            <span className="bg-slate-900/10 px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-sm ml-2">
              {format(new Date(attempt.completedAt), 'MMM d')}
            </span>
          )}
        </div>

        {/* Calendar Body */}
        <div className="p-6 flex items-center justify-center gap-12 flex-1 bg-gradient-to-b from-white to-slate-50/50">
          {canManage ? (
            <>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-500 mb-1">Participants</span>
                <span className="text-3xl font-black tracking-tight text-slate-800 flex items-baseline gap-1.5">
                  {answeredCount}
                  <span className="text-sm font-bold text-slate-400">done</span>
                </span>
              </div>

              {averageAdminScore !== null && (
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-500 mb-1">Avg Score</span>
                  <span
                    className={`text-3xl font-black tracking-tight flex items-baseline gap-1 ${adminSuccess ? 'text-emerald-600' : 'text-amber-600'}`}
                  >
                    {averageAdminScore}
                    <span
                      className={`text-sm font-bold ${adminSuccess ? 'text-emerald-500/70' : 'text-amber-500/70'}`}
                    >
                      %
                    </span>
                  </span>
                </div>
              )}
            </>
          ) : attempt ? (
            <>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-500 mb-1">Your Score</span>
                <span
                  className={`text-3xl font-black tracking-tight flex items-baseline gap-1 ${isSuccess ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  {scorePercentage}
                  <span
                    className={`text-sm font-bold ${isSuccess ? 'text-emerald-500/70' : 'text-amber-500/70'}`}
                  >
                    %
                  </span>
                </span>
              </div>

              {attempt.originalScore !== undefined && (
                <div className="flex flex-col items-end justify-center">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5 mt-2 w-fit shadow-sm">
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>1st: {Math.round(attempt.originalScore)}%</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 text-slate-400 py-2 w-full justify-center">
              <AlertCircle className="w-5 h-5" />
              <span className="text-base font-bold tracking-tight">Missed</span>
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
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Knowledge Checks
          </h1>
          <p className="text-base text-muted-foreground mt-1 max-w-2xl">
            {canManage
              ? 'Manage and review knowledge checks across your portfolio.'
              : 'Complete your monthly knowledge checks to maintain a high team readiness score.'}
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Current
                </h3>
                {active.map((q) => renderHeroCard(q))}
              </div>
            ) : past.length === 0 ? (
              renderEmptyState("You're all caught up for the month.")
            ) : null
          ) : active.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Current
              </h3>
              {active.map((q) => renderHeroCard(q))}
            </div>
          ) : past.length === 0 ? (
            renderEmptyState("You're all caught up for the month.")
          ) : null}
        </section>

        {/* HISTORY SECTION */}
        {past.length > 0 && (
          <section className="space-y-8">
            {Object.entries(
              past.reduce(
                (acc, quiz) => {
                  const year = quiz.targetYear;
                  if (!acc[year]) acc[year] = [];
                  acc[year].push(quiz);
                  return acc;
                },
                {} as Record<number, typeof past>
              )
            )
              .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
              .map(([year, quizzes]) => (
                <div key={year}>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      {year} Completed
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(quizzes as any[]).map((q: any) => renderHistoryRow(q))}
                  </div>
                </div>
              ))}
          </section>
        )}
      </div>

      <SmartPasteModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onSuccess={() => {
          useAcademyStore.getState().fetchQuizzes(canManage, currentUserId);
        }}
      />
    </div>
  );
}
