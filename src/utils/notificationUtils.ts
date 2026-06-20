import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../api/firebase';

export interface AppNotification {
  id: string;
  projectId: string;
  projectName: string;
  type: 'submission' | 'update';
  formName: string;
  createdAt: string;
  read: boolean;
}

// 1. Create a notification in Firebase
export async function createNotification(
  projectId: string,
  projectName: string,
  type: 'submission' | 'update',
  formName: string
) {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      projectId,
      projectName,
      type,
      formName,
      createdAt: new Date().toISOString(),
      read: false,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

// 2. Mark a notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
  } catch (err) {
    console.error('Failed to mark notification read:', err);
  }
}

// 3. Mark all as read
export async function markAllNotificationsAsRead(notifications: AppNotification[]) {
  try {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => markNotificationAsRead(n.id)));
  } catch (err) {
    console.error('Failed to mark all as read:', err);
  }
}

// 4. Clear all notifications
export async function clearAllNotifications(notifications: AppNotification[]) {
  try {
    await Promise.all(notifications.map(n => deleteDoc(doc(db, 'notifications', n.id))));
  } catch (err) {
    console.error('Failed to clear notifications:', err);
  }
}

// 4. Send Email via Google Apps Script Webhook
const APPS_SCRIPT_WEBHOOK_URL = ''; // Replace with actual Google Apps Script Webhook URL

export async function sendEmailAlert(
  projectId: string,
  projectName: string,
  formName: string,
  action: 'submitted' | 'updated'
) {
  if (!APPS_SCRIPT_WEBHOOK_URL) {
    console.log('Email alert suppressed: No Webhook URL configured.');
    return;
  }

  const projectUrl = `https://avesdo-cs-hub.web.app/?drawer=project&drawerId=${projectId}`;

  try {
    await fetch(APPS_SCRIPT_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailTo: 'support@avesdo.com',
        subject: `[CS Hub Alert] ${projectName} ${action} ${formName}`,
        body: `Client for project "${projectName}" has ${action} their ${formName}. Please log into the CS Hub to review.\n\nView Project: ${projectUrl}`,
      }),
    });
  } catch (err) {
    console.error('Failed to send email alert:', err);
  }
}
