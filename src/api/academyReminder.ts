import { useAcademyStore } from '../store/useAcademyStore';
import { useAppStore } from '../store/useAppStore';
import { createNotification } from '../utils/notificationUtils';

export const checkAcademyReminders = async () => {
  const { user } = useAppStore.getState();
  const { activeQuizzes } = useAcademyStore.getState();

  // Only admins get this reminder
  const isAdmin = user?.roleId === 'system_admin' || user?.roleId === 'manager';
  if (!isAdmin) return;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Determine next month
  let nextMonth = currentMonth + 2; // JS months are 0-indexed, we want 1-12. So next month is +2.
  let nextYear = currentYear;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }

  // Check if it's the last 7 days of the month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const isLastWeek = today.getDate() >= lastDayOfMonth - 6;

  if (isLastWeek) {
    // Check if a quiz exists for next month
    const hasNextMonthQuiz = activeQuizzes.some(
      (q) => q.targetMonth === nextMonth && q.targetYear === nextYear
    );

    if (!hasNextMonthQuiz) {
      // Create a local or firestore reminder.
      // To avoid spamming firestore on every reload, we can check localStorage
      const reminderKey = `academy_reminder_${nextYear}_${nextMonth}`;
      if (!localStorage.getItem(reminderKey)) {
        await createNotification(
          'system',
          'Academy System',
          'academy',
          "Reminder: It's time to generate next month's Knowledge Check!"
        );
        localStorage.setItem(reminderKey, 'true');
      }
    }
  }
};
