import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Project, Settings } from '../types';

export function useProjectQuery(projectIdOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['project', projectIdOrSlug],
    queryFn: async () => {
      if (!projectIdOrSlug) throw new Error('No project ID or slug provided');

      // 1. Try by document ID first
      let snap: any = await getDoc(doc(db, 'projects', projectIdOrSlug));

      // 2. If not found, try by slug
      if (!snap.exists()) {
        const { limit } = await import('firebase/firestore');
        const q = query(collection(db, 'projects'), where('slug', '==', projectIdOrSlug), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          snap = querySnapshot.docs[0];
        } else {
          // 3. If still not found, try searching in pastSlugs
          const pastQ = query(
            collection(db, 'projects'),
            where('pastSlugs', 'array-contains', projectIdOrSlug),
            limit(1)
          );
          const pastSnapshot = await getDocs(pastQ);
          if (pastSnapshot.empty) {
            throw new Error('Project not found');
          }
          snap = pastSnapshot.docs[0];
        }
      }
      return { id: snap.id, ...snap.data() } as Project;
    },
    enabled: !!projectIdOrSlug,
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
