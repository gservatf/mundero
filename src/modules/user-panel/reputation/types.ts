// Sistema de Gamificación y Reputación - Tipos TypeScript
// Solo exporta tipos, sin lógica

export type ReputationActionType =
  | "post_create"
  | "post_like"
  | "post_comment"
  | "post_share"
  | "community_join"
  | "community_create"
  | "event_attend"
  | "profile_complete"
  | "referral_approved"
  // Onboarding actions
  | "onboarding_started"
  | "onboarding_step_completed"
  | "step_completed"
  | "quest_completed"
  | "reward_claimed"
  | "step_skipped"
  | "onboarding_abandoned";

export interface ReputationLog {
  id: string;
  userId: string;
  action: ReputationActionType;
  points: number;
  createdAt: number;
  meta?: Record<string, any>;
}

export interface UserReputation {
  userId: string;
  totalPoints: number;
  level: number;
  badges: string[];
  lastUpdatedAt: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  minPoints: number;
  description?: string;
}

export interface Level {
  id: number;
  name: string;
  minPoints: number;
}

// Constantes por defecto
export const DEFAULT_LEVELS: Level[] = [
  { id: 1, name: "Explorador", minPoints: 0 },
  { id: 2, name: "Colaborador", minPoints: 100 },
  { id: 3, name: "Pro", minPoints: 300 },
  { id: 4, name: "Embajador", minPoints: 800 },
  { id: 5, name: "Líder", minPoints: 1500 },
];

export const DEFAULT_BADGES: Badge[] = [
  {
    id: "top_voice",
    name: "Voz Principal",
    icon: "🎤",
    minPoints: 500,
    description: "Usuario con alta participación en discusiones",
  },
  {
    id: "community_builder",
    name: "Constructor de Comunidades",
    icon: "🏗️",
    minPoints: 300,
    description: "Ha creado y gestionado comunidades exitosas",
  },
  {
    id: "event_runner",
    name: "Organizador de Eventos",
    icon: "🎯",
    minPoints: 200,
    description: "Participa activamente en eventos de la plataforma",
  },
  {
    id: "helpful_commenter",
    name: "Comentarista Útil",
    icon: "💬",
    minPoints: 150,
    description: "Proporciona comentarios valiosos y constructivos",
  },
  {
    id: "content_creator",
    name: "Creador de Contenido",
    icon: "✨",
    minPoints: 250,
    description: "Crea contenido valioso para la comunidad",
  },
  {
    id: "referral_master",
    name: "Maestro de Referencias",
    icon: "🔗",
    minPoints: 400,
    description: "Ha traído múltiples usuarios valiosos a la plataforma",
  },
];
