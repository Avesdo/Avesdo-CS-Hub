import { create } from 'zustand';
import { AppState } from '../types';

interface AppStore extends AppState {
  setAppState: (state: AppState) => void;
  setUser: (user: any) => void;
}

const defaultState: AppState = {
  settings: null,
  clients: [],
  projects: [],
  services: [],
  archivedClients: [],
  archivedProjects: [],
  archivedServices: [],
  user: null,
  timestamp: '',
  pendingAliasesCount: 0,
  ready: {
    settings: false,
    clients: false,
    projects: false,
    services: false,
    aliases: false,
  },
};

export const useAppStore = create<AppStore>((set) => ({
  ...defaultState,
  setAppState: (state) => set(state),
  setUser: (user) => set({ user }),
}));
