import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Activity,
  Users,
  Award,
  Eye,
} from 'lucide-react';
import { QuizAttempt } from '../../types';
import { useAcademyStore } from '../../store/useAcademyStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../store/useAppStore';

import KnowledgeCheckTaker from './KnowledgeCheckTaker';

export default function KnowledgeCheckResults() {
  const { activeQuizzes, selectedQuizId, fetchQuizAttempts, quizAttempts, isLoading } =
    useAcademyStore();
  const { user: authUser } = useAuth();
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
  const userAttempt = authUser?.uid
    ? quizAttempts.find((a) => a.userId === authUser.uid && a.quizId === quiz?.id)
    : undefined;
  const hasTaken = !!userAttempt;

  const userResults = enrolledIds.map((userId) => {
    const user = users.find((u) => u.uid === userId);
    const attempt = quizAttempts.find((a) => a.userId === userId && a.quizId === quiz?.id);
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
      if (b.attempt.score !== a.attempt.score) {
        return b.attempt.score - a.attempt.score;
      }
      return (b.attempt.completedAt || 0) - (a.attempt.completedAt || 0);
    }
    return 0;
  });

  const filteredResults = userResults.filter(
    (r) =>
      r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentQuizAttempts = quizAttempts.filter((a) => a.quizId === quiz?.id);
  const completedCount = currentQuizAttempts.length;
  const enrolledCount = enrolledIds.length;
  const pendingCount = enrolledCount - completedCount;
  const perfectCount = currentQuizAttempts.filter(a => a.score === 100).length;
  const averageScore =
    completedCount > 0
      ? currentQuizAttempts.reduce((acc, curr) => acc + curr.score, 0) / completedCount
      : 0;

  if (isTakingQuiz) {
    return (
      <div className="h-full">
        <KnowledgeCheckTaker
          onCancel={() => setIsTakingQuiz(false)}
          existingAttempt={userAttempt}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Results</h2>
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
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-thin-scroll">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            Loading attempts...
          </div>
        ) : (
          <div className="pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Average Score</p>
                  <h3
                    className={`text-2xl font-bold ${completedCount > 0 ? (averageScore >= 80 ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-700'}`}
                  >
                    {completedCount > 0 ? `${Math.round(averageScore)}%` : '0%'}
                  </h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Completion</p>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {completedCount}{' '}
                    <span className="text-lg text-slate-400 font-medium">/ {enrolledCount}</span>
                  </h3>
                </div>
              </div>
              {/* Perfect Scores */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Perfect Scores</p>
                    <h3 className="text-2xl font-bold text-slate-800">{perfectCount}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 tracking-wider">
                          Agent
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 tracking-wider">
                          Date Taken
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 tracking-wider">
                          Actions
                        </th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredResults.length > 0 ? (
                      filteredResults.map(({ user, attempt }) => {
                        const isPassing = attempt && attempt.score >= 80;
                        return (
                          <tr
                            key={user.id}
                            className={`transition-colors group ${
                              authUser && user.id === authUser.uid
                                ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary'
                                : 'bg-white hover:bg-slate-50/50'
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {user.photoURL ? (
                                  <img
                                    src={user.photoURL}
                                    alt={user.name}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200">
                                    {user.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-slate-900">
                                    {user.name}
                                  </div>
                                  <div className="text-sm text-slate-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {attempt ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                  Completed
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {attempt ? (
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-sm font-bold ${isPassing ? 'text-emerald-600' : 'text-amber-600'}`}
                                    >
                                      {Math.round(attempt.score)}%
                                    </span>
                                    {isPassing ? (
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </span>
                                    ) : null}
                                  </div>
                                  {attempt.originalScore !== undefined && (
                                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                      <RotateCcw className="w-2.5 h-2.5" />
                                      1st: {Math.round(attempt.originalScore)}%
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="block text-center text-sm text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">
                              {attempt?.completedAt
                                ? new Date(attempt.completedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                              {attempt ? (
                                <button
                                  onClick={() => setSelectedAttempt(attempt)}
                                  className="text-slate-400 group-hover:text-primary transition-colors flex items-center justify-center gap-1.5 mx-auto"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                          No results found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
              <div>
                <p className="text-sm text-slate-500 font-medium">Final Score</p>
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-2xl font-bold ${(selectedAttempt?.score || 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}
                  >
                    {Math.round(selectedAttempt?.score || 0)}%
                  </p>
                  {selectedAttempt?.originalScore !== undefined && (
                    <div className="flex items-center gap-1.5 ml-3 px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200/60 self-center">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>1st Attempt: {Math.round(selectedAttempt.originalScore)}%</span>
                    </div>
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
