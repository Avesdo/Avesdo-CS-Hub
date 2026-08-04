import { runTransaction, doc } from 'firebase/firestore';
import { db } from './firebase';
import { Quiz } from '../types';
import { useAcademyStore } from '../store/useAcademyStore';

// Extracts the exact fetch call for the webhook
export const triggerAssignQuizWebhook = async (quiz: Quiz, enrolledEmails: string) => {
  const webhookUrl = import.meta.env.VITE_APPS_SCRIPT_WEBHOOK_URL;
  if (!webhookUrl) return;

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthName = monthNames[quiz.targetMonth - 1] || '';

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'assign_quiz',
        emailTo: enrolledEmails || 'support@avesdo.com',
        projectName: 'Avesdo Academy',
        formName: 'Knowledge Check',
        projectUrl: 'https://avesdo-cs-hub.web.app/?drawer=academy',
        payload: {
          email: enrolledEmails || 'support@avesdo.com',
          subject: '[Avesdo Academy] Your Knowledge Check is Ready',
          quizMonthYear: `${monthName} ${quiz.targetYear}`,
        },
      }),
    });
  } catch (err) {
    console.error('Failed to trigger assign_quiz webhook', err);
  }
};

export const checkScheduledQuizzes = async () => {
  // To avoid spamming firestore on every single page load for every user, we check at most once a day per client
  const todayStr = new Date().toDateString();
  const lastCheck = localStorage.getItem('academy_cron_last_check');
  if (lastCheck === todayStr) return;

  const { activeQuizzes } = useAcademyStore.getState();
  const scheduledQuizzes = activeQuizzes.filter((q) => q.status === 'scheduled');

  if (scheduledQuizzes.length === 0) {
    localStorage.setItem('academy_cron_last_check', todayStr);
    return;
  }

  const today = new Date();

  for (const quiz of scheduledQuizzes) {
    // Check if we are past the target month/year
    const targetDateObj = new Date(quiz.targetYear, quiz.targetMonth - 1, 1);
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    let shouldPublish = false;

    if (todayMonthStart.getTime() > targetDateObj.getTime()) {
      shouldPublish = true;
    } else if (todayMonthStart.getTime() === targetDateObj.getTime()) {
      // Find first Monday
      let firstMondayDate = 1;
      while (new Date(quiz.targetYear, quiz.targetMonth - 1, firstMondayDate).getDay() !== 1) {
        firstMondayDate++;
      }
      if (today.getDate() >= firstMondayDate) {
        shouldPublish = true;
      }
    }

    if (shouldPublish) {
      try {
        // Use a transaction to ensure this only publishes ONCE even if multiple users log in simultaneously
        const quizRef = doc(db, 'quizzes', quiz.id);
        const wasPublishedByUs = await runTransaction(db, async (transaction) => {
          const quizDoc = await transaction.get(quizRef);
          if (!quizDoc.exists()) return false;

          const data = quizDoc.data() as Quiz;
          if (data.status !== 'scheduled') return false;

          transaction.update(quizRef, { status: 'published' });
          return true;
        });

        if (wasPublishedByUs) {
          // If we successfully updated it, fire the email!
          const { useAppStore } = await import('../store/useAppStore');
          const users = useAppStore.getState().users;
          const targetUsers = users.filter((u) => quiz.enrolledUserIds?.includes(u.uid));
          const enrolledEmails = targetUsers
            .map((u) => u.email)
            .filter(Boolean)
            .join(',');

          await triggerAssignQuizWebhook(quiz, enrolledEmails);
        }
      } catch (err) {
        console.error('Failed to run scheduled quiz publisher transaction', err);
      }
    }
  }

  localStorage.setItem('academy_cron_last_check', todayStr);
};
