import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { QuizAttempt } from '../../types';
import { useAcademyStore } from '../../store/useAcademyStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tooltip } from '../ui/Tooltip';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppStore } from '../../store/useAppStore';

import KnowledgeCheckTaker from './KnowledgeCheckTaker';

export default function KnowledgeCheckResults() {
  const { activeQuizzes, selectedQuizId, fetchQuizAttempts, quizAttempts, isLoading } =
    useAcademyStore();
  const { user: authUser } = useAuth();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('manage_academy');
  const quiz = activeQuizzes.find((q) => q.id === selectedQuizId);

  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);

  useEffect(() => {
    if (selectedQuizId) {
      fetchQuizAttempts(selectedQuizId);
    }
  }, [selectedQuizId, fetchQuizAttempts]);

  const getMonthName = (monthNumber?: number) => {
    if (!monthNumber) return '';
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const assessmentName = quiz
    ? `${getMonthName(quiz.targetMonth)} ${quiz.targetYear} Knowledge Check`
    : 'Phase 1 Basics';

  const users = useAppStore((state) => state.users);

  const enrolledIds =
    quiz?.enrolledUserIds ||
    users.filter((u) => !u.isDeactivated && u.isAccountManager).map((u) => u.uid);

  const isEnrolled = authUser?.uid ? enrolledIds.includes(authUser.uid) : false;
  const userAttempt = authUser?.uid ? quizAttempts.find((a) => a.userId === authUser.uid) : undefined;
  const hasTaken = !!userAttempt;

  const userResults = enrolledIds.map((userId) => {
    const user = users.find((u) => u.uid === userId);
    const attempt = quizAttempts.find((a) => a.userId === userId);
    return {
      user: {
        id: userId,
        name: user?.displayName || `Unknown User`,
        email: user?.email || '',
        photoURL: user?.photoURL || '',
      },
      attempt,
    };
  });

  userResults.sort((a, b) => {
    if (authUser && a.user.id === authUser.uid) return -1;
    if (authUser && b.user.id === authUser.uid) return 1;

    // Completed attempts first
    if (a.attempt && !b.attempt) return -1;
    if (!a.attempt && b.attempt) return 1;

    if (a.attempt && b.attempt) {
      return (b.attempt.completedAt || 0) - (a.attempt.completedAt || 0);
    }
    return 0;
  });

  const filteredResults = userResults.filter(
    (r) =>
      r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedCount = quizAttempts.length;
  const enrolledCount = enrolledIds.length;
  const pendingCount = enrolledCount - completedCount;
  const averageScore =
    completedCount > 0
      ? quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / completedCount
      : 0;

  if (isTakingQuiz) {
    return (
      <div className="h-full">
        <KnowledgeCheckTaker onCancel={() => setIsTakingQuiz(false)} existingAttempt={userAttempt} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white p-6 gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Results</h2>
          <p className="text-sm text-slate-500">{assessmentName}</p>
        </div>
        <div className="flex items-center gap-4">
          {isEnrolled && !hasTaken && (
            <button
              onClick={() => setIsTakingQuiz(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Take Knowledge Check
            </button>
          )}
          {isEnrolled && hasTaken && (
            <button
              onClick={() => setIsTakingQuiz(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              Edit Answers
            </button>
          )}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-4xl font-black tracking-tight ${completedCount > 0 ? (averageScore >= 80 ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-300'}`}
          >
            {completedCount > 0 ? Math.round(averageScore) : 0}%
          </span>
          <span className="text-lg font-medium text-slate-500">Average Score</span>
        </div>
        {completedCount < enrolledCount && (
          <p className="text-sm font-medium text-slate-500 mt-1">
            {completedCount} of {enrolledCount} completed
          </p>
        )}
      </div>

      <div className="flex-1 overflow-auto custom-thin-scroll">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            Loading attempts...
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="pb-20">
            {/* Completed Section */}
            {filteredResults.filter((r) => r.attempt).length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredResults
                    .filter((r) => r.attempt)
                    .map(({ user, attempt }) => {
                      const isPassing = attempt && attempt.score >= 80;
                      const statusColor = isPassing
                        ? 'bg-gradient-to-br from-emerald-50/80 via-white to-white border-emerald-200/50 hover:border-emerald-300/50'
                        : 'bg-gradient-to-br from-amber-50/80 via-white to-white border-amber-200/50 hover:border-amber-300/50';
                      const correctCount = attempt
                        ? Math.round((attempt.score / 100) * (quiz?.questions.length || 0))
                        : 0;

                      return (
                        <div
                          key={user.id}
                          onClick={() => setSelectedAttempt(attempt!)}
                          className={`group flex flex-col p-5 rounded-2xl border ${statusColor} hover:shadow-md transition-all cursor-pointer relative overflow-hidden`}
                        >
                          <div className="flex items-center justify-between mb-6 mt-1">
                            <div className="flex items-center gap-3">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-700 font-semibold border border-slate-200 shadow-sm">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h3 className="text-sm font-bold text-slate-800">{user.name}</h3>
                                <p className="text-xs text-slate-500 font-medium">
                                  {new Date(attempt!.completedAt!).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                              <Eye className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="mt-auto">
                            <div className="flex items-end gap-2">
                              <span
                                className={`text-3xl font-black tracking-tight leading-none ${isPassing ? 'text-emerald-700' : 'text-amber-700'}`}
                              >
                                {Math.round(attempt!.score)}%
                              </span>
                              <div className="flex flex-col">
                                <span
                                  className={`text-sm font-medium mb-0.5 ${isPassing ? 'text-emerald-600/80' : 'text-amber-600/80'}`}
                                >
                                  ({correctCount} of {quiz?.questions.length} correct)
                                </span>
                                {attempt!.originalScore !== undefined && (
                                  <span className="text-[11px] font-medium text-slate-500">
                                    Original: {Math.round(attempt!.originalScore)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Pending Section */}
            {filteredResults.filter((r) => !r.attempt).length > 0 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredResults
                    .filter((r) => !r.attempt)
                    .map(({ user }) => (
                      <div
                        key={user.id}
                        className="group flex flex-col p-5 rounded-2xl border bg-gradient-to-br from-slate-50/80 via-white to-white border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all cursor-default relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-6 mt-1">
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-700 font-semibold border border-slate-200 shadow-sm">
                                {user.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">{user.name}</h3>
                              <p className="text-xs text-slate-500 font-medium">Not started</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-end gap-2 h-8">
                            <span className="text-lg font-bold tracking-tight text-slate-400">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-slate-500">
            No results found.
          </div>
        )}
      </div>

      <Dialog open={!!selectedAttempt} onOpenChange={(open) => !open && setSelectedAttempt(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-xl font-bold text-slate-800">
              Quiz Attempt Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-thin-scroll">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 mb-6">
              <div>
                <p className="text-sm text-slate-500 font-medium">Final Score</p>
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-2xl font-bold ${(selectedAttempt?.score || 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}
                  >
                    {Math.round(selectedAttempt?.score || 0)}%
                  </p>
                  {selectedAttempt?.originalScore !== undefined && (
                    <span className="text-sm font-medium text-slate-400">
                      (Original: {Math.round(selectedAttempt.originalScore)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 font-medium">Completed</p>
                <p className="text-sm font-medium text-slate-800">
                  {selectedAttempt?.completedAt
                    ? new Date(selectedAttempt.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>

            {quiz?.questions.map((q, idx) => {
              const userAnswer = selectedAttempt?.answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={q.id} className="py-6 border-b border-slate-100 last:border-0">
                  <div className="flex gap-4">
                    <div className="mt-0.5 shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 text-base mb-4">
                        {idx + 1}. {q.text}
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-slate-400 shrink-0 mt-0.5">
                            User Answer:
                          </span>
                          <span
                            className={`text-sm font-medium leading-relaxed ${isCorrect ? 'text-slate-800' : 'text-slate-400 line-through'}`}
                          >
                            {userAnswer || 'Not answered'}
                          </span>
                        </div>

                        {!isCorrect && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-semibold text-slate-400 shrink-0 mt-0.5">
                              Correct Answer:
                            </span>
                            <span className="text-sm font-medium text-emerald-700 leading-relaxed bg-emerald-50 px-2 py-0.5 rounded">
                              {q.correctAnswer}
                            </span>
                          </div>
                        )}

                        {q.explanation && (
                          <div className="mt-5 flex gap-3 p-4 bg-slate-50/80 rounded-xl text-sm text-slate-600 border border-slate-100">
                            <div className="font-semibold text-slate-700 shrink-0">
                              Explanation:
                            </div>
                            <div className="leading-relaxed">
                              {q.explanation.split(/(?=\(Source)/).map((part, i) => (
                                <span
                                  key={i}
                                  className={
                                    part.startsWith('(Source')
                                      ? 'block mt-1.5 text-slate-500 italic text-xs'
                                      : ''
                                  }
                                >
                                  {part}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
