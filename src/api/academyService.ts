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
    const kbRef = collection(db, 'kb_articles');

    // Fetch existing articles to compare
    const snapshot = await getDocs(kbRef);
    const existingArticles = snapshot.docs.map((doc) => doc.data() as KBArticle);

    const existingByTitle = new Map(existingArticles.map((a) => [a.title.trim().toLowerCase(), a]));
    const incomingByTitle = new Map(articles.map((a) => [a.title.trim().toLowerCase(), a]));

    const toAdd = articles.filter((a) => !existingByTitle.has(a.title.trim().toLowerCase()));
    const toUpdate = articles
      .filter((a) => existingByTitle.has(a.title.trim().toLowerCase()))
      .map((a) => ({ id: existingByTitle.get(a.title.trim().toLowerCase())!.id, article: a }));
    const toDelete = existingArticles.filter(
      (a) => !incomingByTitle.has(a.title.trim().toLowerCase())
    );

    const CHUNK_SIZE = 450;
    const allOps = [
      ...toAdd.map((a) => ({ type: 'add' as const, data: a })),
      ...toUpdate.map((u) => ({ type: 'update' as const, data: u })),
      ...toDelete.map((d) => ({ type: 'delete' as const, data: d })),
    ];

    for (let i = 0; i < allOps.length; i += CHUNK_SIZE) {
      const chunk = allOps.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      chunk.forEach((op) => {
        if (op.type === 'add') {
          const docRef = doc(kbRef);
          const newArticle: KBArticle = {
            ...op.data,
            id: docRef.id,
            uploadDate: Date.now(),
          };
          batch.set(docRef, newArticle);
        } else if (op.type === 'update') {
          const docRef = doc(db, 'kb_articles', op.data.id);
          batch.set(
            docRef,
            {
              ...op.data.article,
              id: op.data.id,
              uploadDate: Date.now(), // update date when modified
            },
            { merge: true }
          );
        } else if (op.type === 'delete') {
          const docRef = doc(db, 'kb_articles', op.data.id);
          batch.delete(docRef);
        }
      });

      await batch.commit();
    }
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
    await setDoc(quizRef, { status }, { merge: true });
  },

  updateQuiz: async (quizId: string, updates: Partial<Quiz>): Promise<void> => {
    const quizRef = doc(db, 'quizzes', quizId);
    await setDoc(quizRef, updates, { merge: true });
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

  getAllQuizAttempts: async (): Promise<QuizAttempt[]> => {
    const attemptsRef = collection(db, 'quiz_attempts');
    const snapshot = await getDocs(attemptsRef);
    return snapshot.docs.map((doc) => doc.data() as QuizAttempt);
  },

  getAllUserQuizAttempts: async (userId: string): Promise<QuizAttempt[]> => {
    const attemptsRef = collection(db, 'quiz_attempts');
    const q = query(attemptsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as QuizAttempt);
  },

  saveQuizProgress: async (
    quizId: string,
    userId: string,
    answers: Record<string, string>
  ): Promise<void> => {
    const progressRef = doc(db, 'quiz_progress', `${quizId}_${userId}`);
    await setDoc(progressRef, { quizId, userId, answers, updatedAt: Date.now() }, { merge: true });
  },

  getQuizProgress: async (
    quizId: string,
    userId: string
  ): Promise<Record<string, string> | null> => {
    const progressRef = collection(db, 'quiz_progress');
    const q = query(progressRef, where('quizId', '==', quizId), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data().answers as Record<string, string>;
  },

  deleteQuizProgress: async (quizId: string, userId: string): Promise<void> => {
    const progressRef = doc(db, 'quiz_progress', `${quizId}_${userId}`);
    await deleteDoc(progressRef);
  },
};
