import { doc, getDoc, setDoc, getDocs, collection, deleteField } from 'firebase/firestore';
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
      .map((d) => ({ id: d.id, clientId: d.id, ...d.data() } as unknown as Client))
      .filter((c) => !c.isArchived);
    const projects: Project[] = projectsSnap.docs
      .map((d) => ({ id: d.id, projectId: d.id, ...d.data() } as unknown as Project))
      .filter((p) => !p.isArchived);
    const settings: Settings = settingsSnap.exists()
      ? (settingsSnap.data() as Settings)
      : ({} as Settings);

    // 2. Fetch the existing health_history document
    const historyRef = doc(db, 'settings', 'health_history');
    const historyDoc = await getDoc(historyRef);
    let historyMap: Record<string, any[]> = {};
    if (historyDoc.exists()) {
      const data = historyDoc.data();
      if (data.historyMapJSON) {
        try {
          historyMap = JSON.parse(data.historyMapJSON);
        } catch (e) {
          console.error('Failed to parse historyMapJSON', e);
        }
      } else if (data.historyMap) {
        historyMap = data.historyMap;
      }
      
      // Clean up corrupted 0 scores from history
      Object.keys(historyMap).forEach(key => {
        historyMap[key] = historyMap[key].filter((s: any) => s.score !== 0 && s.score !== 'N/A');
      });
    }

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

      console.log(`Snapshot for client ${client.companyName} (${clientId}):`, {
        healthResult,
        score,
        clientProjects: projects.filter(
          (p) =>
            p.clientIds?.includes(clientId) ||
            p.clients?.includes(client.companyName || client.name)
        ).map(p => p.name)
      });

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
      await setDoc(
        historyRef,
        {
          historyMapJSON: JSON.stringify(historyMap),
          historyMap: deleteField(),
        },
        { merge: true }
      );
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
