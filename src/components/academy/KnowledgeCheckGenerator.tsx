import React, { useState } from 'react';
import { MultiSelect } from '../ui/MultiSelect';
import { ChevronDown, Check, Trash2 } from 'lucide-react';
import { useAcademyStore } from '../../store/useAcademyStore';
import { useAppStore } from '../../store/useAppStore';
import { academyService } from '../../api/academyService';
import toast from 'react-hot-toast';
import { QuizQuestion } from '../../types';

export default function KnowledgeCheckGenerator() {
  const { activeQuizzes, selectedQuizId, kbArticles, setActiveQuizzes, setSelectedQuizId } =
    useAcademyStore();
  const { settings, users } = useAppStore();
  const draftQuiz = activeQuizzes.find((q) => q.id === selectedQuizId);
  const isReadOnly = draftQuiz ? !['draft', 'reviewing'].includes(draftQuiz.status) : false;

  const handleDiscard = async () => {
    if (!draftQuiz || !window.confirm('Are you sure you want to discard this draft?')) return;
    try {
      await academyService.deleteQuiz(draftQuiz.id);
      setActiveQuizzes(activeQuizzes.filter((q) => q.id !== draftQuiz.id));
      setSelectedQuizId(null);
      toast.success('Draft discarded');
    } catch (e: unknown) {
      console.error(e);
      alert('Failed to discard draft');
    }
  };

  const handleUpdateQuestion = async (qId: string, updates: Partial<QuizQuestion>) => {
    if (!draftQuiz) return;
    const newQuestions = draftQuiz.questions.map((q) => (q.id === qId ? { ...q, ...updates } : q));

    setActiveQuizzes(
      activeQuizzes.map((q) => (q.id === draftQuiz.id ? { ...q, questions: newQuestions } : q))
    );

    try {
      await academyService.updateQuiz(draftQuiz.id, { questions: newQuestions });
    } catch (e) {
      console.error(e);
      toast.error('Failed to save changes');
    }
  };

  const activeAccountManagers = users.filter((u) => !u.isDeactivated && u.isAccountManager);
  const enrollments = draftQuiz?.enrolledUserIds || activeAccountManagers.map((u) => u.uid);

  const toggleEnrollment = async (id: string) => {
    if (!draftQuiz) return;
    const newIds = enrollments.includes(id)
      ? enrollments.filter((e) => e !== id)
      : [...enrollments, id];

    try {
      await academyService.updateQuiz(draftQuiz.id, { enrolledUserIds: newIds });
      setActiveQuizzes(
        activeQuizzes.map((q) => (q.id === draftQuiz.id ? { ...q, enrolledUserIds: newIds } : q))
      );
    } catch (e: unknown) {
      console.error(e);
      alert('Failed to update enrollments');
    }
  };

  const handleApproveAndSchedule = async () => {
    if (!draftQuiz) return;
    try {
      await academyService.updateQuizStatus(draftQuiz.id, 'scheduled');
      setActiveQuizzes(
        activeQuizzes.map((q) => (q.id === draftQuiz.id ? { ...q, status: 'scheduled' } : q))
      );

      toast.success(
        'Knowledge Check scheduled! Emails will be sent on the first Monday of the month.'
      );
      setSelectedQuizId(null);
    } catch (e: unknown) {
      console.error(e);
      toast.error('Failed to approve and schedule');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Review Knowledge Check</h2>
          <p className="text-sm text-slate-500 mt-1">Review, edit, and schedule the assessment.</p>
        </div>
        <div className="flex items-center gap-3">
          <MultiSelect
            options={activeAccountManagers.map((u) => ({
              label: u.displayName || u.name || u.email,
              value: u.uid,
            }))}
            values={enrollments}
            onChange={async (newVals) => {
              if (!draftQuiz) return;
              try {
                await academyService.updateQuiz(draftQuiz.id, { enrolledUserIds: newVals });
                setActiveQuizzes(
                  activeQuizzes.map((q) =>
                    q.id === draftQuiz.id ? { ...q, enrolledUserIds: newVals } : q
                  )
                );
              } catch (e: unknown) {
                console.error(e);
                alert('Failed to update enrollments');
              }
            }}
            disabled={isReadOnly}
            dropdownWidth="w-auto min-w-[240px] max-w-[400px]"
            trigger={
              <button
                disabled={isReadOnly}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  isReadOnly
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Enrollment ({enrollments.length})
                <ChevronDown className="w-4 h-4" />
              </button>
            }
          />

          <button
            onClick={handleDiscard}
            disabled={isReadOnly || !draftQuiz}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm whitespace-nowrap shrink-0 ${
              isReadOnly || !draftQuiz
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed hidden'
                : 'bg-white text-red-500 border border-red-200 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Discard Draft
          </button>


          <button
            disabled={isReadOnly || !draftQuiz}
            onClick={async () => {
              if (!draftQuiz) return;
              try {
                const { useAppStore } = await import('../../store/useAppStore');
                const users = useAppStore.getState().users;
                
                // Use the enrolled users the user manually selected, or fallback to all active account managers if none
                const activeAccountManagers = users.filter((u) => !u.isDeactivated && u.isAccountManager);
                const targetUserIds = draftQuiz.enrolledUserIds?.length ? draftQuiz.enrolledUserIds : activeAccountManagers.map((u) => u.uid);
                
                const targetUsers = users.filter(u => targetUserIds.includes(u.uid));
                const enrolledEmails = targetUsers.map(u => u.email).filter(Boolean).join(',');

                const updatedQuiz = { 
                  ...draftQuiz, 
                  status: 'published' as const,
                  enrolledUserIds: targetUserIds,
                  targetMonth: new Date().getMonth() + 1,
                  targetYear: new Date().getFullYear()
                };
                
                await academyService.createDraftQuiz(updatedQuiz);
                setActiveQuizzes(
                  activeQuizzes.map((q) =>
                    q.id === draftQuiz.id ? updatedQuiz : q
                  )
                );

                // Trigger Email Webhook
                if (import.meta.env.VITE_APPS_SCRIPT_WEBHOOK_URL) {
                  try {
                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const monthName = monthNames[updatedQuiz.targetMonth - 1] || "";

                    await fetch(import.meta.env.VITE_APPS_SCRIPT_WEBHOOK_URL, {
                      method: 'POST',
                      mode: 'no-cors',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'assign_quiz',
                        emailTo: enrolledEmails || 'support@avesdo.com', // Added here for old script compatibility
                        projectName: `Avesdo Academy`, // For old script compatibility
                        formName: `Knowledge Check`, // For old script compatibility
                        projectUrl: `https://avesdo-cs-hub.web.app/?drawer=academy`, // For old script compatibility
                        payload: {
                          email: enrolledEmails || 'support@avesdo.com',
                          subject: `[Avesdo Academy] Your Knowledge Check is Ready`,
                          quizMonthYear: `${monthName} ${updatedQuiz.targetYear}`
                        }
                      })
                    });
                  } catch (err) {
                    console.error('Failed to trigger email webhook', err);
                  }
                }
                
                // Add in-app notification
                import('../../utils/notificationUtils').then(({ createNotification }) => {
                  createNotification('system', 'Academy', 'academy', 'New Knowledge Check available!');
                });
                setSelectedQuizId(null);
              } catch (error) {
                console.error('Failed to publish quiz:', error);
                alert('Failed to publish quiz instantly.');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 group whitespace-nowrap shrink-0 ${
              isReadOnly || !draftQuiz
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed hidden'
                : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 shadow-sm'
            }`}
          >
            Publish Now
          </button>

          <button
            disabled={isReadOnly || !draftQuiz}
            onClick={async () => {
              if (!draftQuiz) return;
              try {
                const { useAppStore } = await import('../../store/useAppStore');
                const users = useAppStore.getState().users;
                
                // Use the enrolled users the user manually selected, or fallback to all active account managers if none
                const activeAccountManagers = users.filter((u) => !u.isDeactivated && u.isAccountManager);
                const targetUserIds = draftQuiz.enrolledUserIds?.length ? draftQuiz.enrolledUserIds : activeAccountManagers.map((u) => u.uid);

                const updatedQuiz = { 
                  ...draftQuiz, 
                  status: 'scheduled' as const,
                  enrolledUserIds: targetUserIds
                };
                await academyService.createDraftQuiz(updatedQuiz);
                setActiveQuizzes([...activeQuizzes, updatedQuiz]);
                setSelectedQuizId(null);
              } catch (error) {
                console.error('Failed to schedule quiz:', error);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 group whitespace-nowrap shrink-0 ${
              isReadOnly || !draftQuiz
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]'
            }`}
          >
            <Check className="w-4 h-4" />
            Approve & Schedule
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-thin-scroll pr-4">
        {draftQuiz && draftQuiz.questions.length > 0 ? (
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Draft Questions ({draftQuiz.questions.length})
            </h3>
            {draftQuiz.questions.map((q, i) => (
              <div key={q.id || i} className="py-6 border-b border-slate-100 last:border-0 group">
                <div className="flex justify-between items-start mb-3 group/qtitle relative">
                  <div className="flex items-start w-full pr-4">
                    <span className="font-medium text-slate-800 mr-2 mt-1">{i + 1}.</span>
                    {isReadOnly ? (
                      <p className="font-medium text-slate-800 mt-1">{q.text}</p>
                    ) : (
                      <textarea
                        defaultValue={q.text}
                        onBlur={(e) => {
                          if (e.target.value !== q.text) {
                            handleUpdateQuestion(q.id, { text: e.target.value });
                          }
                        }}
                        className="w-full font-medium text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md p-1 -ml-1 resize-none overflow-hidden min-h-[3rem] transition-colors"
                        rows={2}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(q.options || []).map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`relative flex items-center justify-between px-3 py-2 rounded-md text-sm border group/opt ${
                        opt === q.correctAnswer
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                          : 'bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      {isReadOnly ? (
                        <span className="pr-6">{opt}</span>
                      ) : (
                        <input
                          type="text"
                          defaultValue={opt}
                          onBlur={(e) => {
                            if (e.target.value !== opt) {
                              const newOptions = [...q.options];
                              newOptions[optIdx] = e.target.value;

                              // If this option was the correct answer, update the correctAnswer string too
                              const updates: Partial<QuizQuestion> = { options: newOptions };
                              if (opt === q.correctAnswer) {
                                updates.correctAnswer = e.target.value;
                              }

                              handleUpdateQuestion(q.id, updates);
                            }
                          }}
                          className={`w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded p-1 -ml-1 transition-colors ${
                            opt === q.correctAnswer
                              ? 'text-emerald-900 placeholder-emerald-700'
                              : 'text-slate-800'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="mt-4 text-sm text-slate-500 italic pl-4 border-l-2 border-slate-200">
                    <span className="font-medium not-italic block mb-1">Explanation:</span>
                    {isReadOnly ? (
                      <p className="whitespace-pre-wrap">
                        {q.explanation
                          .replace(/\s*\(Source Article:/g, '\n(Source Article:')
                          .trim()}
                      </p>
                    ) : (
                      <textarea
                        defaultValue={q.explanation
                          .replace(/\s*\(Source Article:/g, '\n(Source Article:')
                          .trim()}
                        onBlur={(e) => {
                          if (e.target.value !== q.explanation) {
                            handleUpdateQuestion(q.id, { explanation: e.target.value });
                          }
                        }}
                        className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded p-1 -ml-1 resize-none min-h-[4rem] transition-colors whitespace-pre-wrap"
                        rows={3}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
            <div className="text-center">
              <p className="text-slate-500 font-medium">No Draft Questions</p>
              <p className="text-sm text-slate-400 mt-1">
                Wait for the knowledge check to be generated.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
