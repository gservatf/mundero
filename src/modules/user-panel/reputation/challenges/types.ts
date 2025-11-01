// Tipos y estructura de datos para el sistema de retos
// Compatible con Firestore y sistema de reputación existente

export type ChallengeType = "collaborative" | "individual" | "weekly";

export type ChallengeStatus = "active" | "completed" | "expired" | "draft";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  points: number;
  creatorId: string;
  participants: string[];
  maxParticipants?: number;
  deadline: number; // timestamp
  status: ChallengeStatus;
  createdAt: number;
  updatedAt: number;

  // Criterios de completitud
  objective: {
    type:
      | "posts_create"
      | "likes_receive"
      | "comments_make"
      | "events_attend"
      | "connections_make";
    target: number; // cantidad objetivo
    timeframe?: "daily" | "weekly" | "total"; // periodo de medición
  };

  // Progreso de participantes
  progress: {
    [userId: string]: {
      current: number;
      completed: boolean;
      completedAt?: number;
    };
  };

  // Metadatos adicionales
  difficulty: "easy" | "medium" | "hard" | "extreme";
  category: "social" | "content" | "engagement" | "networking" | "learning";
  imageUrl?: string;
  tags: string[];

  // Recompensas adicionales
  rewards?: {
    type: "badge" | "access" | "bonus_points";
    value: string | number;
  }[];
}

export interface ChallengeParticipation {
  challengeId: string;
  userId: string;
  joinedAt: number;
  progress: number;
  completed: boolean;
  completedAt?: number;
  rank?: number; // posición en retos colaborativos
}

export interface ChallengeTemplate {
  title: string;
  description: string;
  type: ChallengeType;
  points: number;
  objective: Challenge["objective"];
  difficulty: Challenge["difficulty"];
  category: Challenge["category"];
  duration: number; // días
  tags: string[];
}

// Plantillas predefinidas de retos
export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    title: "Conecta con 3 nuevos miembros",
    description:
      "Expande tu red profesional conectando con 3 personas nuevas en la plataforma",
    type: "individual",
    points: 100,
    objective: {
      type: "connections_make",
      target: 3,
      timeframe: "total",
    },
    difficulty: "easy",
    category: "networking",
    duration: 7,
    tags: ["networking", "social", "conexiones"],
  },
  {
    title: "Maestro del Contenido Semanal",
    description:
      "Crea 5 publicaciones de alta calidad que reciban al menos 10 likes cada una",
    type: "individual",
    points: 250,
    objective: {
      type: "posts_create",
      target: 5,
      timeframe: "weekly",
    },
    difficulty: "medium",
    category: "content",
    duration: 7,
    tags: ["contenido", "creatividad", "engagement"],
  },
  {
    title: "Comunidad Activa",
    description: "Participa en 10 eventos comunitarios durante el mes",
    type: "individual",
    points: 200,
    objective: {
      type: "events_attend",
      target: 10,
      timeframe: "total",
    },
    difficulty: "medium",
    category: "engagement",
    duration: 30,
    tags: ["comunidad", "eventos", "participación"],
  },
  {
    title: "Reto Colaborativo: 1000 Likes",
    description:
      "Entre todos los participantes, alcanzar 1000 likes en publicaciones nuevas",
    type: "collaborative",
    points: 150,
    objective: {
      type: "likes_receive",
      target: 1000,
      timeframe: "total",
    },
    difficulty: "hard",
    category: "social",
    duration: 14,
    tags: ["colaborativo", "likes", "equipo"],
  },
  {
    title: "Comentarista Experto",
    description:
      "Realiza 20 comentarios constructivos en publicaciones de otros miembros",
    type: "individual",
    points: 120,
    objective: {
      type: "comments_make",
      target: 20,
      timeframe: "total",
    },
    difficulty: "easy",
    category: "engagement",
    duration: 7,
    tags: ["comentarios", "engagement", "social"],
  },
];

// Configuración de dificultad
export const DIFFICULTY_CONFIG = {
  easy: {
    color: "text-green-600 bg-green-50 border-green-200",
    icon: "🟢",
    multiplier: 1.0,
  },
  medium: {
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: "🟡",
    multiplier: 1.5,
  },
  hard: {
    color: "text-orange-600 bg-orange-50 border-orange-200",
    icon: "🟠",
    multiplier: 2.0,
  },
  extreme: {
    color: "text-red-600 bg-red-50 border-red-200",
    icon: "🔴",
    multiplier: 3.0,
  },
};

// Configuración de categorías
export const CATEGORY_CONFIG = {
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
  learning: {
    color: "text-emerald-600 bg-emerald-50",
    icon: "📚",
    name: "Aprendizaje",
  },
};

export default Challenge;
