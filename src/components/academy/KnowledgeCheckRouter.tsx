import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useAcademyStore } from '../../store/useAcademyStore';
import { useAppStore } from '../../store/useAppStore';
import QuizListDashboard from './QuizListDashboard';
import KnowledgeCheckGenerator from './KnowledgeCheckGenerator';
import KnowledgeCheckResults from './KnowledgeCheckResults';
import KnowledgeCheckTaker from './KnowledgeCheckTaker';

export default function KnowledgeCheckRouter() {
  const { hasPermission } = usePermissions();
  const { selectedQuizId, activeQuizzes, setSelectedQuizId } = useAcademyStore();
  const canManage = hasPermission('manage_academy');

  if (!selectedQuizId) {
    return <QuizListDashboard />;
  }

  const quiz = activeQuizzes.find((q) => q.id === selectedQuizId);

  if (!quiz) {
    return <QuizListDashboard />;
  }

  const renderContent = () => {
    if (canManage) {
      if (quiz.status === 'draft' || quiz.status === 'reviewing') {
        return <KnowledgeCheckGenerator />;
      } else {
        return <KnowledgeCheckResults />;
      }
    } else {
      const currentUserId = useAppStore.getState().user?.uid;
      const attempt = useAcademyStore
        .getState()
        .quizAttempts.find((a) => a.quizId === quiz.id && a.userId === currentUserId);

      const isOldMonth = (targetYear: number, targetMonth: number) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        if (targetYear < currentYear) return true;
        if (targetYear === currentYear && targetMonth < currentMonth) return true;
        return false;
      };

      const isPast = attempt || isOldMonth(quiz.targetYear, quiz.targetMonth);

      if (isPast) {
        return <KnowledgeCheckResults />;
      }

      if (quiz.status === 'published' || quiz.status === 'scheduled') {
        return <KnowledgeCheckTaker onCancel={() => setSelectedQuizId(null)} />;
      } else {
        return null;
      }
    }
  };

  const content = renderContent();

  if (!content) return <QuizListDashboard />;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="mb-4">
        <button
          onClick={() => setSelectedQuizId(null)}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{content}</div>
    </div>
  );
}
