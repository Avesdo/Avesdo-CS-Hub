import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';
import { calculateClientHealth, calculateProjectHealth } from '../utils/scoringUtils';
import { Client, Project, Settings } from '../types';

export async function generateDailyHealthSnapshots() {
  try {
    // 1. Fetch all necessary data
    const clientsSnap = await getDocs(collection(db, 'clients'));
    const projectsSnap = await getDocs(collection(db, 'projects'));
    const settingsSnap = await getDoc(doc(db, 'settings', 'global_config'));

    const clients: Client[] = clientsSnap.docs
      .map((d) => d.data() as Client)
      .filter((c) => !c.isArchived);
    const projects: Project[] = projectsSnap.docs
      .map((d) => d.data() as Project)
      .filter((p) => !p.isArchived);
    const settings: Settings = settingsSnap.exists()
      ? (settingsSnap.data() as Settings)
      : ({} as Settings);

    // 2. Fetch the existing health_history document
    const historyRef = doc(db, 'settings', 'health_history');
    const historyDoc = await getDoc(historyRef);
    const historyMap =
      historyDoc.exists() && historyDoc.data().historyMap ? historyDoc.data().historyMap : {};

    const now = new Date();
    const todayStr = now.toDateString();
    const timeVal = now.getTime();

    // 3. Iterate over clients and capture current score
    let hasUpdates = false;

    clients.forEach((client) => {
      const clientId = client.clientId || (client as any).id;
      if (!clientId) return;

      const healthResult = calculateClientHealth(client, projects, settings);
      const score = typeof healthResult.totalScore === 'number' ? healthResult.totalScore : 0;

      if (!historyMap[clientId]) {
        historyMap[clientId] = [];
      }

      const clientHistory = historyMap[clientId];

      // Check if we already have a snapshot for today
      if (clientHistory.length > 0) {
        const lastSnapshot = clientHistory[clientHistory.length - 1];
        if (new Date(lastSnapshot.timeVal).toDateString() === todayStr) {
          // Overwrite today's snapshot
          lastSnapshot.score = score;
          lastSnapshot.timeVal = timeVal; // Optional: update time to latest
        } else {
          // Append new daily snapshot
          clientHistory.push({ timeVal, score });
        }
      } else {
        // First snapshot ever
        clientHistory.push({ timeVal, score });
      }

      hasUpdates = true;
    });

    // 4. Iterate over projects and capture current score
    projects.forEach((project) => {
      const projectId = project.projectId || (project as any).id;
      if (!projectId) return;

      const healthResult = calculateProjectHealth(project, settings);
      const score = typeof healthResult.totalScore === 'number' ? healthResult.totalScore : 0;

      if (!historyMap[projectId]) {
        historyMap[projectId] = [];
      }

      const projectHistory = historyMap[projectId];

      // Check if we already have a snapshot for today
      if (projectHistory.length > 0) {
        const lastSnapshot = projectHistory[projectHistory.length - 1];
        if (new Date(lastSnapshot.timeVal).toDateString() === todayStr) {
          // Overwrite today's snapshot
          lastSnapshot.score = score;
          lastSnapshot.timeVal = timeVal;
        } else {
          // Append new daily snapshot
          projectHistory.push({ timeVal, score });
        }
      } else {
        // First snapshot ever
        projectHistory.push({ timeVal, score });
      }

      hasUpdates = true;
    });

    // 5. Save history Map
    if (hasUpdates) {
      await setDoc(historyRef, { historyMap }, { merge: true });
    }

    // 5. Update lastSnapshotDate so this doesn't run again today
    await setDoc(
      doc(db, 'settings', 'global_config'),
      { lastSnapshotDate: todayStr },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to generate daily health snapshots:', error);
    throw error;
  }
}
