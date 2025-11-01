// Solutions Module - Main Index
// FASE 7.0 - SOLUCIONES EMPRESARIALES

// Types
export * from "./types";

// Services
export { solutionsService } from "./services/solutionsService";
export {
  emailTemplates,
  EmailTemplateRenderer,
} from "./services/emailTemplates";

// Components
export { SolutionList } from "./components/SolutionList";
export { SolutionDetail } from "./components/SolutionDetail";
export { OrgSolutionsManager } from "./components/OrgSolutionsManager";
export { SolutionGuard } from "./components/SolutionGuard";

// Store
export { default as useSolutionsStore } from "./store/useSolutionsStore";

// Utils
export {
  SecurityValidator,
  RateLimiter,
  PerformanceOptimizer,
  rateLimitConfigs,
} from "./utils/security";

// Re-export commonly used types for convenience
export type {
  Solution,
  OrgSolution,
  SolutionAccess,
  SolutionEvent,
  SolutionManifest,
  CreateSolutionData,
  CreateOrgSolutionData,
} from "./types";
