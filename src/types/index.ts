export interface Client {
  clientId: string;
  slug?: string;
  companyName: string;
  accountManager: string;
  activeProjectCount: number;
  healthScore: number | 'N/A';
  isArchived?: boolean;
  supportCsat?: {
    score: number;
    totalUsers: number;
    promoters: number;
    passives: number;
    detractors: number;
    users: any[];
  };
  supportCsatHistory?: {
    score: number;
    totalUsers: number;
    promoters: number;
    passives: number;
    detractors: number;
    submittedAt: string;
  }[];
  clientNpsHistory?: {
    score: number;
    submittedAt: string;
  }[];
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
  slug?: string;
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
  slug?: string;
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
  estManagers?: string[];
  pstManagers?: string[];
  statHolidays?: { date: string; name: string; location: string }[];
  timeOff?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    manager: string;
    type?: string;
  }[];
  roles?: CustomRole[];
  rolePermissions?: Record<string, Record<string, boolean>>;
  geminiApiKey?: string;
  academyEnrollments?: string[];
  [key: string]: any;
}

export interface CustomRole {
  id: string;
  name: string;
  permissions: string[];
  isDefault?: boolean;
}

export interface Invitation {
  email: string;
  roleId: string;
  invitedAt: number;
  invitedBy: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  roleId: string;
  createdAt: number;
  lastLogin: number;
  name?: string;
  initials?: string;
  isDeactivated?: boolean;
  isAccountManager?: boolean;
  color?: string;
}

export interface AppState {
  settings: Settings | null;
  clients: Client[];
  archivedClients: Client[];
  projects: Project[];
  archivedProjects: Project[];
  services: Service[];
  archivedServices: Service[];
  user: AppUser | null;
  users: AppUser[];
  timestamp: string;
  pendingAliasesCount: number;
  ready: {
    settings: boolean;
    clients: boolean;
    projects: boolean;
    services: boolean;
    aliases: boolean;
    users: boolean;
  };
  simulatedRoleId: string | null;
}

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  category: string;
  uploadDate: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceArticleId?: string;
  rejectedOptions?: string[];
}

export interface Quiz {
  id: string;
  targetMonth: number;
  targetYear: number;
  status: 'draft' | 'reviewing' | 'scheduled' | 'published';
  questions: QuizQuestion[];
  createdAt: number;
  publishedAt?: number;
  createdBy: string;
  enrolledUserIds?: string[];
  rejectedQuestions?: string[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  answers: Record<string, string>;
  completedAt: number;
}
