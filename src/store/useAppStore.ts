import { create } from 'zustand';
import { AppState } from '../types';

interface AppStore extends AppState {
  setAppState: (state: AppState) => void;
  setUser: (user: any) => void;
  setSimulatedRoleId: (id: string | null) => void;
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
  users: [],
  timestamp: '',
  pendingAliasesCount: 0,
  ready: {
    settings: false,
    clients: false,
    projects: false,
    services: false,
    aliases: false,
    users: false,
  },
  simulatedRoleId: null,
};

export const useAppStore = create<AppStore>((set) => ({
  ...defaultState,
  setAppState: (state) => set(state),
  setUser: (user) => set({ user }),
  setSimulatedRoleId: (id) => set({ simulatedRoleId: id }),
}));
