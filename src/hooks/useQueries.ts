import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Project, Settings } from '../types';

export function useProjectQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('No project ID provided');
      const snap = await getDoc(doc(db, 'projects', projectId));
      if (!snap.exists()) throw new Error('Project not found');
      return { id: snap.id, ...snap.data() } as Project;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: ['settings', 'global_config'],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'settings', 'global_config'));
      if (!snap.exists()) throw new Error('Settings not found');
      return snap.data() as Settings;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
