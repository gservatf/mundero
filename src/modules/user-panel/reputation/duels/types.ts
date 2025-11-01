// Tipos y estructura de datos para duelos 1v1
// Sistema de desafíos en tiempo real entre usuarios

export type DuelStatus = "pending" | "active" | "finished" | "cancelled";

export type DuelMetric =
  | "feed_likes" // Likes recibidos en publicaciones
  | "feed_posts" // Publicaciones creadas
  | "chat_messages" // Mensajes enviados
  | "event_attendance" // Eventos a los que asistió
  | "connections_made" // Nuevas conexiones
  | "comments_made" // Comentarios realizados
  | "reactions_given"; // Reacciones dadas

export interface Duel {
  id: string;
  challengerId: string;
  opponentId: string;
  objective: string; // Descripción del objetivo
  metric: DuelMetric;
  durationHours: number; // Duración en horas
  status: DuelStatus;
  createdAt: number;
  startedAt?: number; // Cuando ambos aceptaron
  finishedAt?: number;

  // Progreso en tiempo real
  progress: {
    [userId: string]: {
      current: number;
      lastUpdated: number;
      milestones: number[]; // Progreso histórico
    };
  };

  // Resultado
  winnerId?: string;
  isDraw?: boolean;

  // Configuración
  targetValue?: number; // Meta específica (opcional)
  rewards: {
    winner: number; // Puntos para el ganador
    participant: number; // Puntos por participar
  };

  // Metadatos
  category: "social" | "content" | "engagement" | "networking";
  difficulty: "easy" | "medium" | "hard";
  isPublic: boolean; // Si otros pueden ver el duelo
  spectators?: string[]; // IDs de usuarios observando
}

export interface DuelInvitation {
  id: string;
  duelId: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: number;
  expiresAt: number;
  message?: string;
}

export interface DuelTemplate {
  objective: string;
  metric: DuelMetric;
  durationHours: number;
  category: Duel["category"];
  difficulty: Duel["difficulty"];
  rewards: Duel["rewards"];
  description: string;
}

// Plantillas predefinidas de duelos
export const DUEL_TEMPLATES: DuelTemplate[] = [
  {
    objective: "Más likes recibidos en 24h",
    metric: "feed_likes",
    durationHours: 24,
    category: "social",
    difficulty: "easy",
    rewards: { winner: 150, participant: 50 },
    description:
      "Compite por recibir más likes en tus publicaciones durante 24 horas",
  },
  {
    objective: "Más publicaciones de calidad en 48h",
    metric: "feed_posts",
    durationHours: 48,
    category: "content",
    difficulty: "medium",
    rewards: { winner: 200, participant: 75 },
    description: "Crea más contenido de valor en 48 horas",
  },
  {
    objective: "Más mensajes enviados en 12h",
    metric: "chat_messages",
    durationHours: 12,
    category: "engagement",
    difficulty: "easy",
    rewards: { winner: 100, participant: 30 },
    description: "Mantén más conversaciones activas durante 12 horas",
  },
  {
    objective: "Más conexiones nuevas en 72h",
    metric: "connections_made",
    durationHours: 72,
    category: "networking",
    difficulty: "hard",
    rewards: { winner: 300, participant: 100 },
    description: "Expande tu red profesional durante 3 días",
  },
  {
    objective: "Más comentarios constructivos en 6h",
    metric: "comments_made",
    durationHours: 6,
    category: "engagement",
    difficulty: "medium",
    rewards: { winner: 120, participant: 40 },
    description:
      "Sprint de engagement: comenta de forma constructiva durante 6 horas",
  },
];

// Configuración de métricas
export const METRIC_CONFIG = {
  feed_likes: {
    name: "Likes Recibidos",
    icon: "❤️",
    color: "text-red-500 bg-red-50",
    description: "Likes recibidos en publicaciones",
  },
  feed_posts: {
    name: "Publicaciones",
    icon: "📝",
    color: "text-blue-500 bg-blue-50",
    description: "Publicaciones creadas",
  },
  chat_messages: {
    name: "Mensajes",
    icon: "💬",
    color: "text-green-500 bg-green-50",
    description: "Mensajes de chat enviados",
  },
  event_attendance: {
    name: "Eventos",
    icon: "🎉",
    color: "text-purple-500 bg-purple-50",
    description: "Eventos a los que asistió",
  },
  connections_made: {
    name: "Conexiones",
    icon: "🤝",
    color: "text-indigo-500 bg-indigo-50",
    description: "Nuevas conexiones establecidas",
  },
  comments_made: {
    name: "Comentarios",
    icon: "💭",
    color: "text-orange-500 bg-orange-50",
    description: "Comentarios realizados",
  },
  reactions_given: {
    name: "Reacciones",
    icon: "👍",
    color: "text-yellow-500 bg-yellow-50",
    description: "Reacciones dadas a contenido",
  },
};

// Configuración de dificultad
export const DUEL_DIFFICULTY_CONFIG = {
  easy: {
    color: "text-green-600 bg-green-50 border-green-200",
    icon: "🟢",
    multiplier: 1.0,
    name: "Fácil",
  },
  medium: {
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: "🟡",
    multiplier: 1.5,
    name: "Medio",
  },
  hard: {
    color: "text-red-600 bg-red-50 border-red-200",
    icon: "🔴",
    multiplier: 2.0,
    name: "Difícil",
  },
};

// Configuración de categorías
export const DUEL_CATEGORY_CONFIG = {
  social: {
    color: "text-blue-600 bg-blue-50",
    icon: "👥",
    name: "Social",
  },
  content: {
    color: "text-purple-600 bg-purple-50",
    icon: "✍️",
    name: "Contenido",
  },
  engagement: {
    color: "text-pink-600 bg-pink-50",
    icon: "💬",
    name: "Participación",
  },
  networking: {
    color: "text-indigo-600 bg-indigo-50",
    icon: "🤝",
    name: "Networking",
  },
};

export default Duel;
