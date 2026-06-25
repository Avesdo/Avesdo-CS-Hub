export interface Client {
  clientId: string;
  companyName: string;
  accountManager: string;
  activeProjectCount: number;
  healthScore: number | 'N/A';
  isArchived?: boolean;
  [key: string]: any; // Allow other properties while migrating
}

export interface OnboardingData {
  kyc?: any;
  primaryQA?: any;
  secondaryQA?: any;
  [key: string]: any;
}

export interface Project {
  id: string;
  name: string;
  assignee: string;
  clientIds: string[];
  clients?: string[];
  developerIds?: string[];
  developers?: string[];
  salesMarketingIds?: string[];
  salesMarketingClients?: string[];
  projectStatus: string;
  releaseDateStr: string;
  releaseDateVal: number;
  isArchived?: boolean;
  timelineStatus?: string;
  onboardingPhase?: string;
  teamworkLink?: string;
  features?: string[];
  units?: number | string;
  history?: any[];
  invoiceStatus?: string;
  daysOutstanding?: number;
  totalOutstanding?: number;
  outstandingInvoiceCount?: number;
  healthScore?: number | 'N/A';
  trendData?: any[];
  onboardingCsat?: {
    quality: string;
    planning: string;
    communication: string;
    knowledge: string;
    recommendation: string;
    comments: string;
    score: number;
    submittedAt: string;
  };
  onboarding?: OnboardingData;
  [key: string]: any;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  manager?: string;
  managers?: string[];
  clientIds: string[];
  projectId?: string;
  projectIds?: string[];
  outcome: string;
  dateVal: number;
  isArchived?: boolean;
  serviceValue?: number;
  [key: string]: any;
}

export interface Settings {
  managers: { name: string; color: string; icon?: string }[];
  clientTypes: { name: string; color: string; icon?: string }[];
  features: string[];
  services: { name: string; price: number }[];
  statuses: { name: string; color: string; icon?: string }[];
  timelines: { name: string; color: string; icon?: string }[];
  phases: { name: string; color: string; icon?: string }[];
  scoring: {
    weights: {
      opActivity: number;
      featAdoption: number;
      userVol: number;
      csat: number;
      financial: number;
    };
    thresholds: { healthy: number; warning: number };
  };
  [key: string]: any;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'rich-text';
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  dependsOn?: {
    fieldId: string;
    value: any;
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  createdAt?: number;
  updatedAt?: number;
}

export interface AppState {
  settings: Settings | null;
  clients: Client[];
  archivedClients: Client[];
  projects: Project[];
  archivedProjects: Project[];
  services: Service[];
  archivedServices: Service[];
  formTemplates: FormTemplate[];
  user: any;
  timestamp: string;
  pendingAliasesCount: number;
  ready: {
    settings: boolean;
    clients: boolean;
    projects: boolean;
    services: boolean;
    aliases: boolean;
    formTemplates: boolean;
  };
}
