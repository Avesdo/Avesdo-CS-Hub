import React, { useState } from 'react';
import { useAcademyStore } from '../../store/useAcademyStore';
import { useAppStore } from '../../store/useAppStore';
import { academyService } from '../../api/academyService';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle2, ChevronRight, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

export default function KnowledgeCheckTaker() {
  const { activeQuizzes, selectedQuizId } = useAcademyStore();
  const draftQuiz = activeQuizzes.find((q) => q.id === selectedQuizId) || activeQuizzes[0];
  const user = useAppStore((s) => s.user);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      try {
        let scoreCount = 0;
        questions.forEach((q) => {
          if (selectedAnswers[q.id] === q.correctAnswer) scoreCount++;
        });
        const score = (scoreCount / questions.length) * 100;

        await academyService.saveQuizAttempt({
          id: uuidv4(),
          quizId: draftQuiz.id,
          userId: user?.uid || 'unknown-user',
          score,
          answers: selectedAnswers,
          completedAt: Date.now(),
        });
      } catch (err) {
        console.error('Failed to save quiz attempt', err);
      } finally {
        setIsSubmitting(false);
        setShowResults(true);
      }
    }
  };

  if (showResults) {
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) score++;
    });

    return (
      <div className="flex flex-col h-full bg-white p-6 max-w-3xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Knowledge Check Complete!</h2>
          <p className="text-slate-600 mb-6">
            You scored {score} out of {questions.length} (
            {Math.round((score / questions.length) * 100)}%).
          </p>
          <Button onClick={() => window.location.reload()}>Return to Dashboard</Button>
        </div>

        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Review Answers</h3>
          {questions.map((q, idx) => {
            const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
            return (
              <div
                key={q.id}
                className={`p-4 rounded-lg border ${
                  isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <p className="font-medium text-slate-800 mb-3">
                  {idx + 1}. {q.text}
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-slate-500 w-24 shrink-0">
                      Your Answer:
                    </span>
                    <span
                      className={`text-sm ${
                        isCorrect ? 'text-emerald-700 font-medium' : 'text-red-700'
                      }`}
                    >
                      {selectedAnswers[q.id] || 'Not answered'}
                    </span>
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {!isCorrect && (
                    <div className="flex items-start gap-2 mt-1">
                      <span className="text-sm font-semibold text-slate-500 w-24 shrink-0">
                        Correct:
                      </span>
                      <span className="text-sm text-emerald-700 font-medium">
                        {q.correctAnswer}
                      </span>
                    </div>
                  )}
                  {q.explanation && (
                    <div className="mt-3 p-3 bg-white/60 rounded text-sm text-slate-600">
                      <span className="font-semibold block mb-1">Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const hasAnsweredCurrent = !!selectedAnswers[currentQuestion.id];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Knowledge Check</h2>
            <p className="text-slate-500 mt-1">Please complete the following assessment.</p>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            Question {currentStep + 1} of {questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-8 overflow-hidden">
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

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent || isSubmitting}
              className="gap-2 px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : currentStep < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Submit Answers
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
