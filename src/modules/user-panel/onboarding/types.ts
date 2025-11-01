// Tipos unificados para el sistema de onboarding gamificado
// Compatible con Firestore y sistema de reputación

// Tipos de acción para el sistema de reputación
export type ActionType =
  | "profile_completion"
  | "tutorial_view"
  | "community_join"
  | "first_post"
  | "first_connection"
  | "explore_features"
  | "complete_profile"
  | "join_community"
  | "create_post"
  | "add_photo"
  | "make_connection";

export interface OnboardingStep {
  id: string | number;
  title: string;
  description: string;
  icon?: string;
  type: ActionType;
  order: number;
  points: number;
  isRequired: boolean;
  validationRules: Record<string, any>;
  motivationalMessage?: string;
  category: "setup" | "exploration" | "networking" | "content" | "mastery";

  // Estado del paso (para progreso del usuario)
  isCompleted?: boolean;
  isSkipped?: boolean;
  completedAt?: Date | number | null;
  progress?: number; // 0-100

  // Compatibilidad con versión antigua
  done?: boolean;
  badge?: string;
  actionType?: ActionType;
  targetValue?: number;
  currentValue?: number;
}

export interface OnboardingProgress {
  userId: string;
  questId: string;
  steps: OnboardingStep[];

  // Progreso general
  completionPercentage: number; // 0-100
  progress?: number; // Alias para completionPercentage

  // Timing
  startedAt: Date | number;
  completedAt?: Date | number | null;

  // Estado actual
  currentStepIndex?: number;
  currentStepId?: string | number;

  // Puntuación
  totalSteps: number;
  totalPointsEarned?: number;
  totalPointsPossible?: number;
  totalPoints?: number; // Alias para totalPointsEarned

  // Badges y logros
  badgesEarned?: string[];

  // Estado de finalización
  isCompleted: boolean;

  // Template usado
  templateId?: string;
}

export interface QuestTemplate {
  id: string;
  name?: string; // Para compatibilidad con admin
  title?: string; // Para compatibilidad con versión antigua
  description: string;
  isActive: boolean;
  steps: OnboardingStep[];

  // Metadata
  totalPoints?: number;
  estimatedTimeMinutes?: number;
  category?: "standard" | "advanced" | "community_focused" | "content_creator";

  // Timestamps (flexibles para compatibilidad)
  createdAt: Date | number;
  updatedAt: Date | number;
  createdBy?: string;
}

export interface OnboardingReward {
  type: "points" | "badge" | "title" | "unlock_feature";
  value: string | number;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface OnboardingStats {
  totalUsers: number;
  completedUsers: number;
  inProgressUsers?: number;
  completionRate?: number;
  averageCompletionRate?: number;
  averageCompletionTime: number; // en horas
  mostSkippedStep?: string;
  mostDropOffStep?: string;
  averagePointsEarned?: number;
  popularTemplate?: string;
  stepCompletionRates?: Record<string, number>;
  completionsByDay?: Array<{ date: string; completions: number }>;
  lastUpdated?: Date;
}

export type OnboardingEvent =
  | "onboarding_started"
  | "step_completed"
  | "quest_completed"
  | "reward_claimed"
  | "step_skipped"
  | "onboarding_abandoned";
