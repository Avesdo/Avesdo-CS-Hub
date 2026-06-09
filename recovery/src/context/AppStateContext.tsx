import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setupRealtimeListeners } from '../api/dbService';
import { AppState } from '../types';

const defaultState: AppState = {
  settings: null,
  clients: [],
  projects: [],
  services: [],
  user: null,
  timestamp: '',
  ready: { settings: false, clients: false, projects: false, services: false, user: false }
};

const AppStateContext = createContext<AppState>(defaultState);

export function useAppState() {
  return useContext(AppStateContext);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    setupRealtimeListeners((newState: AppState) => {
      setState({ ...newState });
    });
  }, []);

  if (!state.ready.settings || !state.ready.clients || !state.ready.projects || !state.ready.services || !state.ready.user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600 animate-pulse">Loading Application Data...</p>
        </div>
      </div>
    );
  }

  return (
    <AppStateContext.Provider value={state}>
      {children}
    </AppStateContext.Provider>
  );
}