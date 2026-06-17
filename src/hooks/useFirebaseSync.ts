import { useEffect } from 'react';
import { setupRealtimeListeners } from '../api/dbService';
import { useAppStore } from '../store/useAppStore';
import { mapAppState } from '../store/mapAppState';
import { useAuth } from '../context/AuthContext';

export function useFirebaseSync() {
  const setAppState = useAppStore((state) => state.setAppState);
  const { user: authUser } = useAuth();

  useEffect(() => {
    const unsubscribe = setupRealtimeListeners((rawState) => {
      const mappedState = mapAppState(rawState, authUser);
      setAppState(mappedState);
    });

    return () => {
      unsubscribe();
    };
  }, [authUser, setAppState]);
}
