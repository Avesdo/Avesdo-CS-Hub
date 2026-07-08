import {
  collection,
  doc,
  writeBatch,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { KBArticle, Quiz, QuizAttempt } from '../types';

export const academyService = {
  uploadKBArticles: async (articles: Omit<KBArticle, 'id' | 'uploadDate'>[]) => {
    const batch = writeBatch(db);
    const kbRef = collection(db, 'kb_articles');

    articles.forEach((article) => {
      const docRef = doc(kbRef);
      const newArticle: KBArticle = {
        ...article,
        id: docRef.id,
        uploadDate: Date.now(),
      };
      batch.set(docRef, newArticle);
    });

    await batch.commit();
  },

  getKBArticles: async (): Promise<KBArticle[]> => {
    const kbRef = collection(db, 'kb_articles');
    const snapshot = await getDocs(kbRef);
    return snapshot.docs.map((doc) => doc.data() as KBArticle);
  },

  getQuizzes: async (): Promise<Quiz[]> => {
    const quizzesRef = collection(db, 'quizzes');
    const snapshot = await getDocs(quizzesRef);
    return snapshot.docs.map((doc) => doc.data() as Quiz);
  },

  createDraftQuiz: async (quiz: Quiz): Promise<void> => {
    const quizRef = doc(db, 'quizzes', quiz.id);
    await setDoc(quizRef, quiz);
  },

  updateQuizStatus: async (
    quizId: string,
    status: 'draft' | 'reviewing' | 'scheduled' | 'published'
  ): Promise<void> => {
    const quizRef = doc(db, 'quizzes', quizId);
    await updateDoc(quizRef, { status });
  },

  updateQuiz: async (quizId: string, updates: Partial<Quiz>): Promise<void> => {
    const quizRef = doc(db, 'quizzes', quizId);
    await updateDoc(quizRef, updates);
  },

  deleteQuiz: async (quizId: string): Promise<void> => {
    const quizRef = doc(db, 'quizzes', quizId);
    await deleteDoc(quizRef);
  },

  saveQuizAttempt: async (attempt: QuizAttempt): Promise<void> => {
    const attemptRef = doc(db, 'quiz_attempts', attempt.id);
    await setDoc(attemptRef, attempt);
  },

  getQuizAttempts: async (quizId: string): Promise<QuizAttempt[]> => {
    const attemptsRef = collection(db, 'quiz_attempts');
    const q = query(attemptsRef, where('quizId', '==', quizId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as QuizAttempt);
  },
};
