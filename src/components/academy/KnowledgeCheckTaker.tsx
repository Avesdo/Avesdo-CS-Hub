import React, { useState, useEffect } from 'react';
import { useAcademyStore } from '../../store/useAcademyStore';
import { useAppStore } from '../../store/useAppStore';
import { academyService } from '../../api/academyService';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle2, ChevronRight, ChevronLeft, XCircle, Loader2, Edit3 } from 'lucide-react';
import { Button } from '../ui/button';
import { QuizAttempt } from '../../types';

interface KnowledgeCheckTakerProps {
  onCancel?: () => void;
  existingAttempt?: QuizAttempt;
}

export default function KnowledgeCheckTaker({ onCancel, existingAttempt }: KnowledgeCheckTakerProps) {
  const { activeQuizzes, selectedQuizId, fetchQuizAttempts } = useAcademyStore();
  const draftQuiz = activeQuizzes.find((q) => q.id === selectedQuizId) || activeQuizzes[0];
  const user = useAppStore((s) => s.user);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSeenReview, setHasSeenReview] = useState(false);

  // Hydrate progress on mount
  useEffect(() => {
    let isMounted = true;
    async function loadProgress() {
      if (!draftQuiz || !user) {
        setIsLoading(false);
        return;
      }
      try {
        const savedAnswers = await academyService.getQuizProgress(draftQuiz.id, user.uid);
        if (savedAnswers && Object.keys(savedAnswers).length > 0 && isMounted) {
          setSelectedAnswers(savedAnswers);
          // Auto-advance to the first unanswered question
          const firstUnansweredIndex = draftQuiz.questions?.findIndex((q) => !savedAnswers[q.id]);
          if (firstUnansweredIndex !== undefined && firstUnansweredIndex !== -1) {
            setCurrentStep(firstUnansweredIndex);
          } else if (firstUnansweredIndex === -1 && draftQuiz.questions?.length > 0) {
            // All answered, jump to review
            setHasSeenReview(true);
            setShowReview(true);
          }
        } else if (existingAttempt && isMounted) {
          setSelectedAnswers(existingAttempt.answers);
          setHasSeenReview(true);
          setShowReview(true);
        }
      } catch (err) {
        console.error('Failed to load progress', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [draftQuiz, user]);

  // Auto-save when answers change
  useEffect(() => {
    if (isLoading || !draftQuiz || !user || Object.keys(selectedAnswers).length === 0) return;

    setIsSaving(true);
    const handler = setTimeout(() => {
      academyService
        .saveQuizProgress(draftQuiz.id, user.uid, selectedAnswers)
        .catch(console.error)
        .finally(() => setIsSaving(false));
    }, 1000);

    return () => clearTimeout(handler);
  }, [selectedAnswers, draftQuiz, user, isLoading]);

  if (!draftQuiz || !draftQuiz.questions || draftQuiz.questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-700">No Active Knowledge Checks</h3>
          <p className="text-sm text-slate-500 mt-2">
            You have no pending assignments right now. Check back later!
          </p>
        </div>
      </div>
    );
  }

  const questions = draftQuiz.questions;
  const currentQuestion = questions[currentStep];

  const handleSelect = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: option,
    });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setHasSeenReview(true);
      setShowReview(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let scoreCount = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctAnswer) scoreCount++;
      });
      const score = (scoreCount / questions.length) * 100;

      await academyService.saveQuizAttempt({
        id: existingAttempt ? existingAttempt.id : uuidv4(),
        quizId: draftQuiz.id,
        userId: user?.uid || 'unknown-user',
        score,
        answers: selectedAnswers,
        completedAt: existingAttempt ? existingAttempt.completedAt : Date.now(),
        updatedAt: existingAttempt ? Date.now() : undefined,
        originalScore: existingAttempt ? (existingAttempt.originalScore ?? existingAttempt.score) : undefined,
        originalAnswers: existingAttempt ? (existingAttempt.originalAnswers ?? existingAttempt.answers) : undefined,
      });

      await academyService.deleteQuizProgress(draftQuiz.id, user?.uid || 'unknown-user');
      await fetchQuizAttempts(draftQuiz.id);
    } catch (err) {
      console.error('Failed to save quiz attempt', err);
    } finally {
      setIsSubmitting(false);
      setShowReview(false);
      setShowResults(true);
      if (onCancel) onCancel();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6 bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-medium">Restoring progress...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) score++;
    });

    return (
      <div className="flex flex-col h-full bg-white overflow-auto relative">
        <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 px-6 pt-12 pb-20">
          <div className="flex flex-col items-center justify-center py-8 text-center mb-4">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-5 shadow-inner border border-primary/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
              Knowledge Check Complete!
            </h2>
            <p className="text-base text-slate-500 mb-6">
              You scored <span className="font-semibold text-slate-800">{score}</span> out of{' '}
              {questions.length} (
              <span className="font-semibold text-slate-800">
                {Math.round((score / questions.length) * 100)}%
              </span>
              )
            </p>
            <Button onClick={() => window.location.reload()} size="lg" className="px-8 shadow-md">
              Return to Dashboard
            </Button>
          </div>

          <div className="border-b border-slate-200 pb-4 mb-2">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Results Breakdown</h3>
          </div>

          <div className="flex-1">
            {questions.map((q, idx) => {
              const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
              return (
                <div key={q.id} className="py-8 border-b border-slate-100 last:border-0">
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
                            Your Answer:
                          </span>
                          <span
                            className={`text-sm font-medium leading-relaxed ${isCorrect ? 'text-slate-800' : 'text-slate-400 line-through'}`}
                          >
                            {selectedAnswers[q.id] || 'No answer selected'}
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
        </div>
      </div>
    );
  }

  if (showReview) {
    const unansweredCount = questions.filter((q) => !selectedAnswers[q.id]).length;
    return (
      <div className="flex flex-col h-full bg-white overflow-auto relative">
        <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 px-6 pt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Review Answers</h2>
            <p className="text-slate-500 mt-1">
              Please review your selections before submitting.
              {unansweredCount > 0 && (
                <span className="text-amber-600 font-medium ml-2">
                  You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}.
                </span>
              )}
            </p>
          </div>

          <div className="flex-1 pb-10">
            {questions.map((q, idx) => (
              <div key={q.id} className="py-5 border-b border-slate-100 last:border-0">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800 text-base mb-2">
                      {idx + 1}. {q.text}
                    </h4>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-slate-500">Your Answer:</span>
                      <span
                        className={`text-sm font-medium ${selectedAnswers[q.id] ? 'text-primary' : 'text-slate-400 italic'}`}
                      >
                        {selectedAnswers[q.id] || 'No answer selected'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentStep(idx);
                      setShowReview(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors shrink-0 mt-0.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm py-4 px-6 z-10 w-full shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] mt-auto">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(questions.length - 1);
                setShowReview(false);
              }}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Last Question
            </Button>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 px-8">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Knowledge Check
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasAnsweredCurrent = !!selectedAnswers[currentQuestion.id];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pt-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Knowledge Check</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1.5">
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span className="text-slate-500 text-sm">
                  {isSaving ? 'Saving progress...' : 'Progress automatically saved'}
                </span>
              </div>

              {onCancel && (
                <>
                  <span className="text-slate-300 text-sm">•</span>
                  <button
                    onClick={onCancel}
                    className="text-sm font-medium text-slate-500 hover:text-primary hover:underline underline-offset-2 transition-all"
                  >
                    Save & Exit
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm whitespace-nowrap">
            Question {currentStep + 1} of {questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-6 overflow-hidden shadow-inner">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-slate-800 mb-6">{currentQuestion.text}</h3>

          <div className="space-y-3 flex-1">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary-900 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="font-medium text-sm md:text-base">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={handleBack} className="gap-2 px-6">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div /> // Placeholder to maintain flex-between layout
            )}

            <div className="flex items-center gap-3">
              {hasSeenReview && currentStep < questions.length - 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setShowReview(true)}
                  className="gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-0"
                >
                  Return to Review
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={handleNext} className="gap-2 px-8">
                {currentStep < questions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Review Answers
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
