import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { setupRealtimeListeners } from '../api/dbService';
import { AppState } from '../types';

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
    user: false,
    aliases: false,
  },
};

const AppStateContext = createContext<AppState>(defaultState);

export function useAppState() {
  return useContext(AppStateContext);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: state } = useQuery({
    queryKey: ['appState'],
    queryFn: async () => defaultState,
    enabled: false, // Let Firebase onSnapshot handle the data fetching natively
    initialData: defaultState,
  });

  useEffect(() => {
    const unsubscribe = setupRealtimeListeners((newState: AppState) => {
      // Push realtime Firebase updates directly into the TanStack Query cache
      queryClient.setQueryData(['appState'], newState);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const currentState = React.useMemo(() => {
    if (!state) return defaultState;

    // Dynamically resolve names from UUIDs so the database doesn't need to store duplicates!
    return {
      ...state,
      clients: state.clients.map((c) => {
        const cProjects = state.projects.filter((p) => {
          const resolvedIds = p.clientIds || (p.clientId ? [p.clientId] : []);
          return resolvedIds.includes(c.clientId) || resolvedIds.includes(c.id);
        });
        const activeProjectsCount = cProjects.filter(
          (p) => p.projectStatus === 'Active' || p.projectStatus === 'Suspended'
        ).length;
        const onboardingProjectsCount = cProjects.filter(
          (p) => p.projectStatus === 'Onboarding'
        ).length;
        const closedProjectsCount = cProjects.filter(
          (p) => p.projectStatus === 'Closed' || p.projectStatus === 'Completed'
        ).length;
        return {
          ...c,
          activeProjectsCount,
          onboardingProjectsCount,
          closedProjectsCount,
        };
      }),
      projects: state.projects.map((p) => {
        const resolvedIds = p.clientIds || (p.clientId ? [p.clientId] : []);
        return {
          ...p,
          clients: resolvedIds
            .map(
              (id: string) =>
                state.clients.find((c) => c.clientId === id || c.id === id)?.companyName
            )
            .filter(Boolean) as string[],
        };
      }),
      services: state.services.map((s) => {
        let resolvedIds = s.clientIds || (s.clientId ? [s.clientId] : []);

        // Inherit clients from project if service doesn't have any directly
        if (resolvedIds.length === 0 && s.projectId && s.projectId !== 'N/A') {
          const assignedProject = state.projects.find((p) => p.id === s.projectId);
          if (assignedProject) {
            resolvedIds =
              assignedProject.clientIds ||
              (assignedProject.clientId ? [assignedProject.clientId] : []);
          }
        }

        let resolvedManager = s.manager || s.assignee;
        if (
          (!resolvedManager ||
            resolvedManager === 'Unassigned' ||
            resolvedManager === 'Not Set' ||
            resolvedManager === 'Unknown') &&
          s.projectId &&
          s.projectId !== 'N/A'
        ) {
          const assignedProject = state.projects.find((p) => p.id === s.projectId);
          if (assignedProject) {
            resolvedManager =
              assignedProject.assignee || assignedProject.manager || resolvedManager;
          }
        }

        return {
          ...s,
          clientIds: resolvedIds,
          manager: resolvedManager,
          assignee: resolvedManager,
          clients: resolvedIds
            .map(
              (id: string) =>
                state.clients.find((c) => c.clientId === id || c.id === id)?.companyName
            )
            .filter(Boolean) as string[],
          clientName:
            resolvedIds
              .map(
                (id: string) =>
                  state.clients.find((c) => c.clientId === id || c.id === id)?.companyName
              )
              .filter(Boolean)[0] || 'Unknown Client',
        };
      }),
    };
  }, [state]);

  if (
    !currentState.ready.settings ||
    !currentState.ready.clients ||
    !currentState.ready.projects ||
    !currentState.ready.services ||
    !currentState.ready.user ||
    !currentState.ready.aliases
  ) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600 animate-pulse">
            Loading Application Data...
          </p>
        </div>
      </div>
    );
  }

  return <AppStateContext.Provider value={currentState}>{children}</AppStateContext.Provider>;
}
