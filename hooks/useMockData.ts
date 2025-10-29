import { useState, useEffect } from 'react';
import { create } from 'zustand';

// Types
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  empresa: {
    id: string;
    nombre: string;
    ruc: string;
  };
  rol: string;
}

interface Application {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'pending';
  color: string;
  url: string;
}

interface Referral {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  servicio: string;
  status: 'pending' | 'converted' | 'rejected';
  comisionPotencial: number;
  fechaRegistro: string;
  notas?: string;
}

interface Integration {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'warning' | 'error';
  baseUrl: string;
  lastSync: string;
  color: string;
  webhooks: string[];
}

interface WebhookLog {
  id: string;
  event: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  app: string;
  timestamp: string;
  data?: any;
}

interface PendingUser {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  empresa: string;
  rolSolicitado: string;
  fechaSolicitud: string;
}

interface Company {
  id: string;
  nombre: string;
  ruc: string;
  usuarios: number;
  aplicaciones: number;
  estado: 'activa' | 'pendiente' | 'suspendida';
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

// Zustand Store for Auth
interface AuthStore {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  isAdmin: false,
  login: (user) => set({ 
    user, 
    loading: false, 
    isAdmin: user.rol === 'admin' || user.email === 'admin@mundero.com' 
  }),
  logout: () => set({ user: null, loading: false, isAdmin: false }),
  setLoading: (loading) => set({ loading }),
}));

// Mock Data
const mockApplications: Application[] = [
  {
    id: '1',
    name: 'Legalty',
    description: 'Plataforma legal integral para gestión de procesos jurídicos',
    category: 'Legal',
    status: 'active',
    color: 'bg-blue-500',
    url: 'https://legalty.app'
  },
  {
    id: '2',
    name: 'We Consulting',
    description: 'Consultoría empresarial y desarrollo organizacional',
    category: 'Consultoría',
    status: 'active',
    color: 'bg-green-500',
    url: 'https://weconsulting.app'
  },
  {
    id: '3',
    name: 'Portales',
    description: 'Gestión de portales web y contenido digital',
    category: 'Desarrollo',
    status: 'active',
    color: 'bg-purple-500',
    url: 'https://portales.app'
  },
  {
    id: '4',
    name: 'Pitahaya',
    description: 'Soluciones de marketing digital y automatización',
    category: 'Marketing',
    status: 'pending',
    color: 'bg-orange-500',
    url: 'https://pitahaya.app'
  }
];

const mockReferrals: Referral[] = [
  {
    id: '1',
    nombre: 'Carlos Mendoza',
    email: 'carlos@empresa.com',
    telefono: '+51 999 888 777',
    empresa: 'Constructora Lima SAC',
    servicio: 'legalty',
    status: 'converted',
    comisionPotencial: 500,
    fechaRegistro: '2024-10-15',
    notas: 'Interesado en servicios legales corporativos'
  },
  {
    id: '2',
    nombre: 'Ana Rodriguez',
    email: 'ana@startup.com',
    telefono: '+51 888 777 666',
    empresa: 'StartupTech',
    servicio: 'we_consulting',
    status: 'pending',
    comisionPotencial: 750,
    fechaRegistro: '2024-10-20',
    notas: 'Necesita consultoría para expansión internacional'
  },
  {
    id: '3',
    nombre: 'Miguel Torres',
    email: 'miguel@comercial.com',
    telefono: '+51 777 666 555',
    empresa: 'Comercial Torres',
    servicio: 'portales',
    status: 'pending',
    comisionPotencial: 300,
    fechaRegistro: '2024-10-22'
  },
  {
    id: '4',
    nombre: 'Sofia Vargas',
    email: 'sofia@marketing.com',
    telefono: '+51 666 555 444',
    empresa: 'Marketing Pro',
    servicio: 'pitahaya',
    status: 'rejected',
    comisionPotencial: 400,
    fechaRegistro: '2024-10-18',
    notas: 'No cumplía con los requisitos mínimos'
  }
];

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Legalty',
    version: '2.1.0',
    status: 'active',
    baseUrl: 'https://api.legalty.app',
    lastSync: 'Hace 5 minutos',
    color: 'bg-blue-500',
    webhooks: ['user.created', 'lead.converted', 'commission.calculated']
  },
  {
    id: '2',
    name: 'We Consulting',
    version: '1.8.2',
    status: 'active',
    baseUrl: 'https://api.weconsulting.app',
    lastSync: 'Hace 2 horas',
    color: 'bg-green-500',
    webhooks: ['profile.updated', 'project.created', 'invoice.generated']
  },
  {
    id: '3',
    name: 'Portales',
    version: '3.0.1',
    status: 'warning',
    baseUrl: 'https://api.portales.app',
    lastSync: 'Hace 1 día',
    color: 'bg-purple-500',
    webhooks: ['site.deployed', 'domain.configured']
  },
  {
    id: '4',
    name: 'Pitahaya',
    version: '1.5.0',
    status: 'error',
    baseUrl: 'https://api.pitahaya.app',
    lastSync: 'Error - Hace 3 días',
    color: 'bg-orange-500',
    webhooks: ['campaign.launched', 'analytics.updated']
  }
];

const mockWebhookLogs: WebhookLog[] = [
  {
    id: '1',
    event: 'user.profile.updated',
    type: 'success',
    message: 'Perfil de usuario sincronizado correctamente',
    app: 'Legalty',
    timestamp: 'Hace 5 minutos'
  },
  {
    id: '2',
    event: 'lead.converted',
    type: 'success',
    message: 'Lead convertido a cliente, comisión calculada',
    app: 'We Consulting',
    timestamp: 'Hace 1 hora'
  },
  {
    id: '3',
    event: 'sync.timeout',
    type: 'warning',
    message: 'Timeout en sincronización, reintentando automáticamente',
    app: 'Portales',
    timestamp: 'Hace 4 horas'
  },
  {
    id: '4',
    event: 'auth.failed',
    type: 'error',
    message: 'Error de autenticación, verificar API key',
    app: 'Pitahaya',
    timestamp: 'Hace 1 día'
  },
  {
    id: '5',
    event: 'commission.paid',
    type: 'success',
    message: 'Comisión procesada y pagada correctamente',
    app: 'Legalty',
    timestamp: 'Hace 2 días'
  }
];

const mockPendingUsers: PendingUser[] = [
  {
    id: '1',
    name: 'Roberto Silva',
    email: 'roberto@empresa.com',
    photoURL: 'https://ui-avatars.com/api/?name=Roberto+Silva&background=6366f1&color=fff',
    empresa: 'Empresa Demo SAC',
    rolSolicitado: 'analyst',
    fechaSolicitud: '2024-10-25'
  },
  {
    id: '2',
    name: 'Maria Gonzalez',
    email: 'maria@consulting.com',
    photoURL: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff',
    empresa: 'Consulting Pro',
    rolSolicitado: 'referrer',
    fechaSolicitud: '2024-10-24'
  },
  {
    id: '3',
    name: 'Luis Herrera',
    email: 'luis@startup.com',
    photoURL: 'https://ui-avatars.com/api/?name=Luis+Herrera&background=f59e0b&color=fff',
    empresa: 'Startup Innovation',
    rolSolicitado: 'owner',
    fechaSolicitud: '2024-10-23'
  }
];

const mockCompanies: Company[] = [
  {
    id: '1',
    nombre: 'Empresa Demo S.A.C.',
    ruc: '20123456789',
    usuarios: 15,
    aplicaciones: 4,
    estado: 'activa'
  },
  {
    id: '2',
    nombre: 'Consulting Pro EIRL',
    ruc: '20987654321',
    usuarios: 8,
    aplicaciones: 2,
    estado: 'activa'
  },
  {
    id: '3',
    nombre: 'Startup Innovation',
    ruc: '20555444333',
    usuarios: 3,
    aplicaciones: 1,
    estado: 'pendiente'
  },
  {
    id: '4',
    nombre: 'Constructora Lima SAC',
    ruc: '20111222333',
    usuarios: 25,
    aplicaciones: 3,
    estado: 'activa'
  }
];

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'Usuario Roberto Silva aprobado para Empresa Demo SAC',
    user: 'admin@mundero.com',
    timestamp: 'Hace 30 minutos',
    type: 'success'
  },
  {
    id: '2',
    action: 'Integración con Pitahaya pausada por errores',
    user: 'admin@mundero.com',
    timestamp: 'Hace 2 horas',
    type: 'warning'
  },
  {
    id: '3',
    action: 'Nueva empresa Startup Innovation registrada',
    user: 'luis@startup.com',
    timestamp: 'Hace 1 día',
    type: 'success'
  },
  {
    id: '4',
    action: 'Intento de acceso no autorizado detectado',
    user: 'sistema',
    timestamp: 'Hace 2 días',
    type: 'error'
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nuevo referido convertido',
    message: 'Carlos Mendoza se ha convertido en cliente de Legalty',
    type: 'success',
    timestamp: 'Hace 1 hora',
    read: false
  },
  {
    id: '2',
    title: 'Integración con advertencia',
    message: 'Portales presenta problemas de sincronización',
    type: 'warning',
    timestamp: 'Hace 4 horas',
    read: false
  },
  {
    id: '3',
    title: 'Comisión procesada',
    message: 'Se ha procesado tu comisión de $500',
    type: 'info',
    timestamp: 'Hace 1 día',
    read: true
  }
];

// Custom Hooks
export const useMockAuth = () => {
  const { user, loading, isAdmin, login, logout, setLoading } = useAuthStore();

  useEffect(() => {
    // Simulate initial auth check
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [setLoading]);

  return {
    user,
    loading,
    isAdmin,
    login,
    logout
  };
};

export const useMockData = () => {
  return {
    applications: mockApplications,
    referrals: mockReferrals,
    integrations: mockIntegrations,
    webhookLogs: mockWebhookLogs,
    pendingUsers: mockPendingUsers,
    companies: mockCompanies,
    auditLogs: mockAuditLogs,
    notifications: mockNotifications
  };
};