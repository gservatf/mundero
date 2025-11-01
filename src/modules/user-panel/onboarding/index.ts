// Índice del módulo de onboarding gamificado
// Exporta todos los componentes, hooks y servicios

// Componentes principales
export { OnboardingQuest } from "./OnboardingQuest";
export { QuestStepCard } from "./QuestStepCard";
export { WelcomeRewardModal } from "./WelcomeRewardModal";

// Componentes de feed
export {
  OnboardingFeedBanner,
  OnboardingTasksCard,
} from "./OnboardingFeedBanner";
export { OnboardingFeedContent } from "./OnboardingFeedContent";

// Componentes de perfil
export { OnboardingProfileSection } from "./OnboardingProfileSection";

// Componentes administrativos
export { OnboardingAdmin } from "./OnboardingAdmin";
export { QuestEditorModal } from "./QuestEditorModal";

// Hooks
export {
  useOnboardingProgress,
  useQuestTemplates,
  useOnboardingStats,
} from "./useOnboardingProgress";

// Servicios
export { onboardingService } from "./onboardingService";
export { badgeService, ONBOARDING_BADGES } from "./badgeService";
export type { OnboardingBadge, UserBadges } from "./badgeService";

// Tipos
export type {
  OnboardingStep,
  OnboardingProgress,
  QuestTemplate,
  OnboardingReward,
  OnboardingStats,
  OnboardingEvent,
} from "./types";

// Configuración y utilidades
export const ONBOARDING_CONFIG = {
  // Configuración general
  autoStart: true,
  showWelcomeModal: true,
  enableNotifications: true,

  // Puntuaciones
  defaultStepPoints: 50,
  bonusCompletionPoints: 100,

  // Timing
  stepTimeoutMinutes: 30,
  reminderIntervalHours: 24,

  // UI
  showProgressInHeader: true,
  showFeedBanner: true,
  enableAnimations: true,

  // Badges
  enableBadges: true,
  showBadgeNotifications: true,
};

// Constantes útiles
export const ONBOARDING_CONSTANTS = {
  COLLECTIONS: {
    PROGRESS: "onboarding_progress",
    TEMPLATES: "quest_templates",
    BADGES: "user_badges",
    STATS: "onboarding_stats",
  },

  STEP_TYPES: {
    PROFILE_COMPLETION: "profile_completion",
    TUTORIAL_VIEW: "tutorial_view",
    COMMUNITY_JOIN: "community_join",
    FIRST_POST: "first_post",
    FIRST_CONNECTION: "first_connection",
    EXPLORE_FEATURES: "explore_features",
  },

  BADGE_IDS: {
    PROFILE_COMPLETE: "profile_complete",
    COMMUNITY_JOINER: "community_joiner",
    FIRST_POST: "first_post",
    NETWORKER: "networker",
    KNOWLEDGE_SEEKER: "knowledge_seeker",
    EXPLORER: "explorer",
    ONBOARDING_MASTER: "onboarding_master",
  },
};

// Validaciones y testing
export {
  onboardingValidator,
  runQuickValidation,
  MANUAL_TESTING_CHECKLIST,
  PERFORMANCE_TARGETS,
} from "./validation";
