// FASE 6.3 — Payment Configuration (Inactivo)
// Flag principal para activar/desactivar todo el sistema de pagos
export const PAYMENT_ENABLED = false;

// Configuración de planes disponibles
export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  badge?: string;
}

export const AVAILABLE_PLANS: PaymentPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "Acceso básico a comunidades",
      "Crear hasta 3 comunidades",
      "Miembros ilimitados",
      "Funciones básicas de moderación",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    currency: "USD",
    interval: "month",
    popular: true,
    badge: "Más Popular",
    features: [
      "Comunidades ilimitadas",
      "Gestión avanzada de roles",
      "Estadísticas detalladas",
      "Moderación automatizada",
      "Temas personalizados",
      "Soporte prioritario",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 49,
    currency: "USD",
    interval: "month",
    badge: "Premium",
    features: [
      "Todas las funciones Pro",
      "API de integración",
      "Branding personalizado",
      "Análisis avanzados",
      "Acceso anticipado a funciones",
      "Soporte 24/7 dedicado",
      "Consultoría estratégica",
    ],
  },
];

// Configuración de proveedores de pago (preparado para futuro)
export const PAYMENT_PROVIDERS = {
  STRIPE: {
    enabled: false,
    publicKey: "",
    webhookSecret: "",
  },
  MERCADO_PAGO: {
    enabled: false,
    publicKey: "",
    accessToken: "",
  },
  PAYPAL: {
    enabled: false,
    clientId: "",
    clientSecret: "",
  },
};

// Configuración de funciones premium por plan
export const PLAN_FEATURES = {
  free: {
    maxCommunities: 3,
    maxMembersPerCommunity: 1000,
    analyticsRetention: 30, // días
    customThemes: false,
    apiAccess: false,
    prioritySupport: false,
  },
  pro: {
    maxCommunities: -1, // ilimitado
    maxMembersPerCommunity: 10000,
    analyticsRetention: 365,
    customThemes: true,
    apiAccess: false,
    prioritySupport: true,
  },
  elite: {
    maxCommunities: -1,
    maxMembersPerCommunity: -1, // ilimitado
    analyticsRetention: -1, // ilimitado
    customThemes: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

// Helper functions
export function getPlanById(planId: string): PaymentPlan | undefined {
  return AVAILABLE_PLANS.find((plan) => plan.id === planId);
}

export function canUpgradeTo(currentPlan: string, targetPlan: string): boolean {
  const plans = ["free", "pro", "elite"];
  const currentIndex = plans.indexOf(currentPlan);
  const targetIndex = plans.indexOf(targetPlan);
  return targetIndex > currentIndex;
}

export function formatPrice(price: number, currency: string = "USD"): string {
  if (price === 0) return "Gratis";

  const formatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  });

  return formatter.format(price);
}
