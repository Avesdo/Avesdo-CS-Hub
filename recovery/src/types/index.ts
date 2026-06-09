export interface Client {
  clientId: string;
  companyName: string;
  accountManager: string;
  activeProjectCount: number;
  healthScore: number | "N/A";
  [key: string]: any; // Allow other properties while migrating
}

export interface Project {
  id: string;
  name: string;
  assignee: string;
  clientIds: string[];
  clients: string[];
  projectStatus: string;
  releaseDateStr: string;
  releaseDateVal: number;
  [key: string]: any;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  manager: string;
  clientIds: string[];
  clients: string[];
  outcome: string;
  dateVal: number;
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
  projects: Project[];
  services: Service[];
  user: any;
  timestamp: string;
  ready: { settings: boolean; clients: boolean; projects: boolean; services: boolean; user: boolean };
}