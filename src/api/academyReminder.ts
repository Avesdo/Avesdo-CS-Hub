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
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();

  // Check if a quiz exists for this month
  const hasCurrentMonthQuiz = activeQuizzes.some(
    (q) => q.targetMonth === currentMonth && q.targetYear === currentYear
  );

  if (!hasCurrentMonthQuiz) {
    // Create a local or firestore reminder.
    // To avoid spamming firestore on every reload, we can check localStorage
    const reminderKey = `academy_reminder_this_month_${currentYear}_${currentMonth}`;
    if (!localStorage.getItem(reminderKey)) {
      await createNotification(
        'system',
        'Academy System',
        'academy',
        "Reminder: It's time to generate this month's Knowledge Check!"
      );
      localStorage.setItem(reminderKey, 'true');
    }
  }
};
