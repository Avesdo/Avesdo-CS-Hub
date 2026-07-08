import { create } from 'zustand';
import { Quiz, KBArticle, QuizAttempt } from '../types';
import { academyService } from '../api/academyService';

interface AcademyState {
  activeQuizzes: Quiz[];
  draftQuiz: Quiz | null;
  selectedQuizId: string | null;
  kbArticles: KBArticle[];
  quizAttempts: QuizAttempt[];
  isLoading: boolean;
  error: string | null;

  setActiveQuizzes: (quizzes: Quiz[]) => void;
  setDraftQuiz: (quiz: Quiz | null) => void;
  setSelectedQuizId: (id: string | null) => void;
  setKBArticles: (articles: KBArticle[]) => void;
  fetchQuizzes: () => Promise<void>;
  fetchQuizAttempts: (quizId: string) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAcademyStore = create<AcademyState>((set) => ({
  activeQuizzes: [],
  draftQuiz: null,
  selectedQuizId: null,
  kbArticles: [],
  quizAttempts: [],
  isLoading: false,
  error: null,

  setActiveQuizzes: (activeQuizzes) => set({ activeQuizzes }),
  setDraftQuiz: (draftQuiz) => set({ draftQuiz }),
  setSelectedQuizId: (selectedQuizId) => set({ selectedQuizId }),
  setKBArticles: (kbArticles) => set({ kbArticles }),
  fetchQuizzes: async () => {
    try {
      set({ isLoading: true, error: null });
      const quizzes = await academyService.getQuizzes();
      set({ activeQuizzes: quizzes, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  fetchQuizAttempts: async (quizId: string) => {
    try {
      set({ isLoading: true, error: null });
      const attempts = await academyService.getQuizAttempts(quizId);
      set({ quizAttempts: attempts, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export const selectPendingAction = (state: AcademyState) =>
  state.activeQuizzes.some((q) => q.status === 'draft' || q.status === 'published');
