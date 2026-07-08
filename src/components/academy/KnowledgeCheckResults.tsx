import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { QuizAttempt } from '../../types';
import { useAcademyStore } from '../../store/useAcademyStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppStore } from '../../store/useAppStore';

export default function KnowledgeCheckResults() {
  const { activeQuizzes, selectedQuizId, fetchQuizAttempts, quizAttempts, isLoading } =
    useAcademyStore();
  const { user: authUser } = useAuth();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('manage_academy');
  const quiz = activeQuizzes.find((q) => q.id === selectedQuizId);

  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const userResults = enrolledIds.map((userId) => {
    const user = users.find((u) => u.uid === userId);
    const attempt = quizAttempts.find((a) => a.userId === userId);
    return {
      user: {
        id: userId,
        name: user?.displayName || `Unknown User`,
        email: user?.email || '',
      },
      attempt,
    };
  });

  userResults.sort((a, b) => {
    if (authUser && a.user.id === authUser.uid) return -1;
    if (authUser && b.user.id === authUser.uid) return 1;

    if (!a.attempt && b.attempt) return -1;
    if (a.attempt && !b.attempt) return 1;

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

  return (
    <div className="flex flex-col h-full bg-white p-6 gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Results</h2>
          <p className="text-sm text-slate-500">{assessmentName}</p>
        </div>
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

      <div className="flex-1 overflow-auto custom-thin-scroll bg-slate-50/50 rounded-xl border border-slate-200/60 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            Loading attempts...
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredResults.map(({ user, attempt }) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{user.name}</h3>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {attempt ? (
                    <>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-slate-500">Score</span>
                        <span
                          className={`text-sm font-bold ${attempt.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}
                        >
                          {Math.round(attempt.score)}%
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-slate-500">Submitted</span>
                        <span className="text-sm font-medium text-slate-700">
                          {attempt.completedAt
                            ? new Date(attempt.completedAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedAttempt(attempt)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-end justify-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      </div>
                      <div className="w-[114px]"></div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
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
                <p
                  className={`text-2xl font-bold ${(selectedAttempt?.score || 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  {Math.round(selectedAttempt?.score || 0)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 font-medium">Completed At</p>
                <p className="text-sm font-medium text-slate-800">
                  {selectedAttempt?.completedAt
                    ? new Date(selectedAttempt.completedAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {quiz?.questions.map((q, idx) => {
              const userAnswer = selectedAttempt?.answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border shadow-sm ${
                    isCorrect
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-red-50/30 border-red-200'
                  }`}
                >
                  <p className="font-medium text-slate-800 mb-4">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-slate-500 w-24 shrink-0 pt-0.5">
                        User Answer:
                      </span>
                      <span
                        className={`text-sm ${
                          isCorrect
                            ? 'text-emerald-700 font-semibold'
                            : 'text-red-700 font-semibold'
                        }`}
                      >
                        {userAnswer || 'Not answered'}
                      </span>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                    </div>
                    {!isCorrect && (
                      <div className="flex items-start gap-3 mt-2">
                        <span className="text-sm font-semibold text-slate-500 w-24 shrink-0 pt-0.5">
                          Correct:
                        </span>
                        <span className="text-sm text-emerald-700 font-semibold">
                          {q.correctAnswer}
                        </span>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="mt-4 p-4 bg-white/60 rounded-lg text-sm text-slate-600 border border-slate-100">
                        <span className="font-semibold block mb-1 text-slate-700">
                          Explanation:
                        </span>
                        {q.explanation}
                      </div>
                    )}
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
