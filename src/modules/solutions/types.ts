// Types for Solutions Enterprise Module
// FASE 7.0 - SOLUCIONES EMPRESARIALES

export interface Solution {
  id: string;
  key: string; // unique identifier like "ceps_reader", "work_travel"
  name: string;
  description: string;
  category: "assessment" | "hr" | "marketing" | "analytics" | "other";
  active: boolean;
  routeReader: string; // path like "/solutions/ceps/start"
  allowedOrgs: string[]; // organization IDs that can use this solution
  icon?: string;
  color?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface OrgSolution {
  id: string;
  orgId: string;
  solutionKey: string;
  enabled: boolean;
  grantedBy: string; // admin user ID who granted access
  grantedAt: Date;
  expiresAt?: Date;
  settings?: Record<string, any>; // organization-specific settings
  usage?: {
    totalViews: number;
    totalConversions: number;
    lastUsed?: Date;
  };
}

export interface SolutionManifest {
  key: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  entryPoint: string; // relative path to start component
  routes: SolutionRoute[];
  permissions: string[];
  dependencies?: string[];
  config?: Record<string, any>;
}

export interface SolutionRoute {
  path: string;
  component: string;
  name: string;
  protected?: boolean;
  roles?: string[];
}

export interface SolutionAccess {
  hasAccess: boolean;
  solution?: Solution;
  orgSolution?: OrgSolution;
  reason?: "not_found" | "not_enabled" | "expired" | "org_not_allowed";
}

export interface SolutionEvent {
  id: string;
  solutionKey: string;
  orgId: string;
  userId?: string;
  event:
    | "view"
    | "signup"
    | "redirect"
    | "conversion"
    | "error"
    | "access_granted"
    | "access_denied";
  metadata?: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  ipAddress?: string;
}

export interface CreateSolutionData {
  key: string;
  name: string;
  description: string;
  category: Solution["category"];
  routeReader: string;
  allowedOrgs: string[];
  icon?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface CreateOrgSolutionData {
  orgId: string;
  solutionKey: string;
  settings?: Record<string, any>;
  expiresAt?: Date;
}

// Store types
export interface SolutionsState {
  solutions: Solution[];
  orgSolutions: OrgSolution[];
  loading: boolean;
  error: string | null;
  selectedSolution: Solution | null;
}

export interface SolutionsActions {
  fetchSolutions: () => Promise<void>;
  fetchOrgSolutions: (orgId: string) => Promise<void>;
  createSolution: (data: CreateSolutionData) => Promise<Solution>;
  updateSolution: (id: string, data: Partial<Solution>) => Promise<void>;
  deleteSolution: (id: string) => Promise<void>;
  grantSolutionAccess: (data: CreateOrgSolutionData) => Promise<void>;
  revokeSolutionAccess: (orgId: string, solutionKey: string) => Promise<void>;
  validateAccess: (
    orgId: string,
    solutionKey: string,
  ) => Promise<SolutionAccess>;
  trackEvent: (event: Omit<SolutionEvent, "id" | "timestamp">) => Promise<void>;
  setSelectedSolution: (solution: Solution | null) => void;
  clearError: () => void;
}

export type SolutionsStore = SolutionsState & SolutionsActions;
