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
  fetchQuizzes: (canManage?: boolean, userId?: string) => Promise<void>;
  fetchQuizAttempts: (quizId: string) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

let fetchQuizzesId = 0;

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
  fetchQuizzes: async (canManage?: boolean, userId?: string) => {
    fetchQuizzesId++;
    const currentFetchId = fetchQuizzesId;

    try {
      set({ isLoading: true, error: null });
      const quizzes = await academyService.getQuizzes();
      if (fetchQuizzesId !== currentFetchId) return;
      set({ activeQuizzes: quizzes, isLoading: false });

      if (canManage) {
        const attempts = await academyService.getAllQuizAttempts();
        if (fetchQuizzesId !== currentFetchId) return;

        const activeQuizIds = quizzes.map((q) => q.id);
        const filteredAttempts = attempts.filter((a) => activeQuizIds.includes(a.quizId));

        const deduped = Object.values(
          filteredAttempts.reduce(
            (acc, curr) => {
              const key = `${curr.quizId}_${curr.userId}`;
              const currDate = curr.updatedAt || curr.completedAt;
              if (!acc[key]) {
                acc[key] = curr;
              } else {
                const accDate = acc[key].updatedAt || acc[key].completedAt;
                if (accDate < currDate) acc[key] = curr;
              }
              return acc;
            },
            {} as Record<string, any>
          )
        );
        set({ quizAttempts: deduped });
      } else if (userId) {
        const attempts = await academyService.getAllUserQuizAttempts(userId);
        if (fetchQuizzesId !== currentFetchId) return;

        const activeQuizIds = quizzes.map((q) => q.id);
        const filteredAttempts = attempts.filter((a) => activeQuizIds.includes(a.quizId));

        const deduped = Object.values(
          filteredAttempts.reduce(
            (acc, curr) => {
              const key = `${curr.quizId}_${curr.userId}`;
              const currDate = curr.updatedAt || curr.completedAt;
              if (!acc[key]) {
                acc[key] = curr;
              } else {
                const accDate = acc[key].updatedAt || acc[key].completedAt;
                if (accDate < currDate) acc[key] = curr;
              }
              return acc;
            },
            {} as Record<string, any>
          )
        );
        set({ quizAttempts: deduped });
      }
    } catch (error: any) {
      if (fetchQuizzesId !== currentFetchId) return;
      set({ error: error.message, isLoading: false });
    }
  },
  fetchQuizAttempts: async (quizId: string) => {
    try {
      set({ isLoading: true, error: null });
      const attempts = await academyService.getQuizAttempts(quizId);
      const deduped = Object.values(
        attempts.reduce(
          (acc, curr) => {
            const key = `${curr.quizId}_${curr.userId}`;
            const currDate = curr.updatedAt || curr.completedAt;
            if (!acc[key]) {
              acc[key] = curr;
            } else {
              const accDate = acc[key].updatedAt || acc[key].completedAt;
              if (accDate < currDate) acc[key] = curr;
            }
            return acc;
          },
          {} as Record<string, any>
        )
      );
      set({ quizAttempts: deduped, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export const selectPendingAction = (state: AcademyState) =>
  state.activeQuizzes.some((q) => q.status === 'draft' || q.status === 'published');
