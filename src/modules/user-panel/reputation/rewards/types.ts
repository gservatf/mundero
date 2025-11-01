// Tipos y interfaces para el sistema de recompensas
// Define las estructuras de datos para recompensas y canjes

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: RewardCategory;
  type: RewardType;
  icon: string;
  image?: string;
  availability: {
    stock: number;
    unlimited: boolean;
    expiresAt?: number;
  };
  requirements?: {
    minimumLevel?: number;
    badges?: string[];
    achievements?: string[];
  };
  value?: {
    discountPercentage?: number;
    cashValue?: number;
    items?: string[];
  };
  metadata?: Record<string, any>;
  isActive: boolean;
  isFeatured: boolean;
  redemptionCount: number;
  createdAt: number;
  updatedAt: number;
}

export type RewardCategory =
  | "premium"
  | "discounts"
  | "physical"
  | "digital"
  | "experiences"
  | "badges"
  | "features";

export type RewardType =
  | "discount_code"
  | "premium_features"
  | "physical_item"
  | "digital_content"
  | "experience"
  | "badge"
  | "custom";

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: RedemptionStatus;
  redemptionCode?: string;
  deliveryInfo?: {
    method: "email" | "physical" | "digital" | "instant";
    address?: string;
    email?: string;
    trackingNumber?: string;
  };
  expiresAt?: number;
  redeemedAt: number;
  deliveredAt?: number;
  metadata?: Record<string, any>;
}

export type RedemptionStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "expired"
  | "cancelled";

export interface UserRewardStats {
  totalRedemptions: number;
  totalPointsSpent: number;
  favoriteCategory: RewardCategory;
  recentRedemptions: RewardRedemption[];
  availablePoints: number;
}

// Templates de recompensas predefinidas
export const REWARD_TEMPLATES: Record<
  string,
  Omit<Reward, "id" | "createdAt" | "updatedAt" | "redemptionCount">
> = {
  premium_month: {
    title: "Premium 1 Mes",
    description: "Acceso completo a funciones premium durante 30 días",
    pointsCost: 5000,
    category: "premium",
    type: "premium_features",
    icon: "👑",
    availability: { stock: 0, unlimited: true },
    requirements: { minimumLevel: 3 },
    value: { cashValue: 9.99 },
    isActive: true,
    isFeatured: true,
    metadata: {
      duration: 30,
      features: ["advanced_analytics", "priority_support", "custom_themes"],
    },
  },

  discount_10: {
    title: "10% Descuento",
    description: "Descuento del 10% en tu próxima compra",
    pointsCost: 1000,
    category: "discounts",
    type: "discount_code",
    icon: "🎟️",
    availability: { stock: 100, unlimited: false },
    value: { discountPercentage: 10 },
    isActive: true,
    isFeatured: false,
    metadata: { validDays: 30, minPurchase: 20 },
  },

  coffee_voucher: {
    title: "Voucher Café",
    description: "Voucher para un café gratis en cafeterías asociadas",
    pointsCost: 800,
    category: "physical",
    type: "discount_code",
    icon: "☕",
    availability: { stock: 50, unlimited: false },
    requirements: { minimumLevel: 1 },
    value: { cashValue: 4.5 },
    isActive: true,
    isFeatured: true,
    metadata: { partners: ["Starbucks", "Costa Coffee"], validDays: 60 },
  },

  exclusive_badge: {
    title: "Badge Exclusivo",
    description: "Badge especial para mostrar en tu perfil",
    pointsCost: 2500,
    category: "badges",
    type: "badge",
    icon: "🏅",
    availability: { stock: 0, unlimited: true },
    requirements: { minimumLevel: 5 },
    isActive: true,
    isFeatured: false,
    metadata: { badgeId: "collector", rarity: "rare" },
  },

  ebook_collection: {
    title: "Colección eBooks",
    description: "Acceso a biblioteca digital de 100+ libros de negocios",
    pointsCost: 3500,
    category: "digital",
    type: "digital_content",
    icon: "📚",
    availability: { stock: 0, unlimited: true },
    requirements: { minimumLevel: 4 },
    value: { items: ["Business Strategy", "Leadership", "Innovation"] },
    isActive: true,
    isFeatured: true,
    metadata: { accessDays: 365, bookCount: 120 },
  },

  mentoring_session: {
    title: "Sesión de Mentoría",
    description: "Sesión 1:1 con mentor experto (60 minutos)",
    pointsCost: 8000,
    category: "experiences",
    type: "experience",
    icon: "🎯",
    availability: { stock: 10, unlimited: false },
    requirements: { minimumLevel: 6, badges: ["🏆"] },
    value: { cashValue: 150 },
    isActive: true,
    isFeatured: true,
    metadata: { duration: 60, topics: ["career", "business", "leadership"] },
  },

  custom_theme: {
    title: "Tema Personalizado",
    description: "Tema exclusivo para personalizar tu interfaz",
    pointsCost: 1500,
    category: "features",
    type: "premium_features",
    icon: "🎨",
    availability: { stock: 0, unlimited: true },
    requirements: { minimumLevel: 2 },
    isActive: true,
    isFeatured: false,
    metadata: { themes: ["dark_pro", "ocean_blue", "sunset_orange"] },
  },

  gift_card_25: {
    title: "Gift Card $25",
    description: "Tarjeta regalo de $25 para tiendas online",
    pointsCost: 12000,
    category: "physical",
    type: "discount_code",
    icon: "💳",
    availability: { stock: 20, unlimited: false },
    requirements: { minimumLevel: 7 },
    value: { cashValue: 25 },
    isActive: true,
    isFeatured: true,
    metadata: { stores: ["Amazon", "Target", "Best Buy"], validDays: 365 },
  },
};

export default REWARD_TEMPLATES;
