export interface Client {
  clientId: string;
  companyName: string;
  accountManager: string;
  activeProjectCount: number;
  healthScore: number | "N/A";
  isArchived?: boolean;
  [key: string]: any; // Allow other properties while migrating
}

export interface Project {
  id: string;
  name: string;
  assignee: string;
  clientIds: string[];
  clients?: string[];
  projectStatus: string;
  releaseDateStr: string;
  releaseDateVal: number;
  isArchived?: boolean;
  timelineStatus?: string;
  onboardingPhase?: string;
  features?: string[];
  units?: number | string;
  history?: any[];
  healthScore?: number | "N/A";
  trendData?: any[];
  [key: string]: any;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  manager: string;
  clientIds: string[];
  outcome: string;
  dateVal: number;
  isArchived?: boolean;
  [key: string]: any;
}

export interface Settings {
  managers: { name: string; color: string }[];
  clientTypes: { name: string; color: string }[];
  features: string[];
  services: { name: string; price: number }[];
  statuses: { name: string; color: string }[];
  timelines: { name: string; color: string }[];
  phases: { name: string; color: string }[];
  scoring: {
    weights: { opActivity: number; featAdoption: number; userVol: number; csat: number };
    clientWeights: { billing: number; engagement: number; utilization: number; experience: number };
    thresholds: { healthy: number; warning: number };
  };
  [key: string]: any;
}

export interface AppState {
  settings: Settings | null;
  clients: Client[];
  archivedClients: Client[];
  projects: Project[];
  archivedProjects: Project[];
  services: Service[];
  archivedServices: Service[];
  user: any;
  timestamp: string;
  pendingAliasesCount: number;
  ready: { settings: boolean; clients: boolean; projects: boolean; services: boolean; user: boolean; aliases: boolean };
}
