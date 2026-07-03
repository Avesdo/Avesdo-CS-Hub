import { AppState } from '../types';
import { calculateProjectHealth, calculateClientHealth } from '../utils/scoringUtils';

export function mapAppState(state: AppState, authUser: any | null): AppState {
  const mappedUser = authUser
    ? {
        ...authUser,
        name:
          authUser.displayName || authUser.name || authUser.email?.split('@')[0] || 'Unknown User',
        email: authUser.email || '',
        initials: (authUser.displayName || authUser.name || authUser.email?.split('@')[0] || 'U')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase(),
      }
    : null;

  return {
    ...state,
    user: mappedUser,
    clients: state.clients.map((c) => {
      const cProjects = state.projects.filter((p) => {
        const resolvedIds = p.clientIds || (p.clientId ? [p.clientId] : []);
        return resolvedIds.includes(c.clientId) || resolvedIds.includes(c.id);
      });
      const activeProjectCount = cProjects.filter(
        (p) => p.projectStatus === 'Active' || p.projectStatus === 'Suspended'
      ).length;
      const onboardingProjectCount = cProjects.filter(
        (p) => p.projectStatus === 'Onboarding'
      ).length;
      const closedProjectCount = cProjects.filter(
        (p) => p.projectStatus === 'Closed' || p.projectStatus === 'Completed'
      ).length;

      const healthResult = calculateClientHealth(c, state.projects, state.settings);
      const healthScore =
        activeProjectCount === 0 && !healthResult.hasSuspended ? 'N/A' : healthResult.totalScore;

      return {
        ...c,
        activeProjectCount,
        onboardingProjectCount,
        closedProjectCount,
        healthScore,
      };
    }),
    projects: state.projects.map((p) => {
      const resolvedIds = p.clientIds || (p.clientId ? [p.clientId] : []);

      let devIds = p.developerIds || [];
      let smIds = p.salesMarketingIds || [];

      if (devIds.length === 0 && smIds.length === 0 && resolvedIds.length > 0) {
        const resolvedClients = resolvedIds
          .map((id) => state.clients.find((c) => c.clientId === id || c.id === id))
          .filter(Boolean) as any[];
        devIds = resolvedClients
          .filter((c) => c.clientType === 'Developer' || !c.clientType)
          .map((c) => c.clientId || c.id);
        smIds = resolvedClients
          .filter((c) => c.clientType === 'Sales & Marketing')
          .map((c) => c.clientId || c.id);
      }

      const clients = resolvedIds
        .map(
          (id: string) => state.clients.find((c) => c.clientId === id || c.id === id)?.companyName
        )
        .filter(Boolean) as string[];

      const developers = devIds
        .map(
          (id: string) => state.clients.find((c) => c.clientId === id || c.id === id)?.companyName
        )
        .filter(Boolean) as string[];

      const salesMarketingClients = smIds
        .map(
          (id: string) => state.clients.find((c) => c.clientId === id || c.id === id)?.companyName
        )
        .filter(Boolean) as string[];

      const pHealth = calculateProjectHealth(p, state.settings);
      const healthScore = pHealth.totalScore;

      return {
        ...p,
        clients,
        developerIds: devIds,
        developers,
        salesMarketingIds: smIds,
        salesMarketingClients,
        healthScore,
      };
    }),
    services: state.services.map((s) => {
      let resolvedIds = s.clientIds || (s.clientId ? [s.clientId] : []);

      if (resolvedIds.length === 0) {
        const pIds = s.projectIds || (s.projectId && s.projectId !== 'N/A' ? [s.projectId] : []);
        for (const pId of pIds) {
          const assignedProject = state.projects.find((p) => p.id === pId);
          if (assignedProject) {
            const pClientIds =
              assignedProject.clientIds ||
              (assignedProject.clientId ? [assignedProject.clientId] : []);
            resolvedIds = Array.from(new Set([...resolvedIds, ...pClientIds]));
          }
        }
      }

      let resolvedManagers =
        s.managers || (s.manager || s.assignee ? [s.manager || s.assignee] : []);
      if (
        resolvedManagers.length === 0 ||
        resolvedManagers.every(
          (m) => !m || m === 'Unassigned' || m === 'Not Set' || m === 'Unknown'
        )
      ) {
        const pIds = s.projectIds || (s.projectId && s.projectId !== 'N/A' ? [s.projectId] : []);
        for (const pId of pIds) {
          const assignedProject = state.projects.find((p) => p.id === pId);
          if (assignedProject && (assignedProject.assignee || assignedProject.manager)) {
            resolvedManagers = [
              assignedProject.assignee || assignedProject.manager || 'Unassigned',
            ];
            break;
          }
        }
      }

      const primaryManager = resolvedManagers.length > 0 ? resolvedManagers[0] : 'Unassigned';

      return {
        ...s,
        clientIds: resolvedIds,
        manager: primaryManager,
        managers: resolvedManagers,
        assignee: primaryManager,
        clients: resolvedIds
          .map(
            (id: string) => state.clients.find((c) => c.clientId === id || c.id === id)?.companyName
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
}
