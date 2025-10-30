import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { adminUserService, AdminUser } from '../services/adminFirebase';

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'analyst' | 'affiliate' | 'client';

export interface AdminPermissions {
  users: boolean;
  companies: boolean;
  analytics: boolean;
  settings: boolean;
  logs: boolean;
  system: boolean;
  messages: boolean;
  config: boolean;
  security: boolean;
  notifications: boolean;
  apps: boolean;
  referrals: boolean;
  leads: boolean;
  dashboard: boolean;
}

export interface AdminAuthState {
  isAdmin: boolean;
  role: AdminRole;
  permissions: AdminPermissions;
  adminProfile: AdminUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para gestión de autenticación y permisos administrativos
 */
export const useAdminAuth = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [adminState, setAdminState] = useState<AdminAuthState>({
    isAdmin: false,
    role: 'client',
    permissions: getPermissions('client'),
    adminProfile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadAdminProfile = async () => {
      if (!user || !isAuthenticated || authLoading) {
        setAdminState(prev => ({
          ...prev,
          isAdmin: false,
          role: 'client',
          permissions: getPermissions('client'),
          adminProfile: null,
          loading: authLoading,
          error: null
        }));
        return;
      }

      try {
        setAdminState(prev => ({ ...prev, loading: true, error: null }));

        // Cargar perfil administrativo del usuario
        const adminProfile = await adminUserService.getUser(user.id);
        
        if (!adminProfile) {
          // Si no existe perfil, crear uno básico con mapeo de campos
          const basicProfile: AdminUser = {
            uid: user.id,
            email: user.email || '',
            displayName: user.display_name || (user as any).full_name || (user as any).displayName || '',
            photoURL: user.photo_url || (user as any).avatar_url || (user as any).photoURL || '',
            role: 'client',
            status: 'active'
          };

          setAdminState({
            isAdmin: false,
            role: 'client',
            permissions: getPermissions('client'),
            adminProfile: basicProfile,
            loading: false,
            error: null
          });
          return;
        }

        const isAdmin = ['super_admin', 'admin', 'manager', 'analyst'].includes(adminProfile.role);
        const permissions = getPermissions(adminProfile.role);

        setAdminState({
          isAdmin,
          role: adminProfile.role,
          permissions,
          adminProfile,
          loading: false,
          error: null
        });

        console.log('👤 Admin profile loaded:', {
          role: adminProfile.role,
          isAdmin,
          permissions
        });

      } catch (error) {
        console.error('❌ Error loading admin profile:', error);
        setAdminState(prev => ({
          ...prev,
          isAdmin: false,
          role: 'client',
          permissions: getPermissions('client'),
          adminProfile: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Error al cargar perfil administrativo'
        }));
      }
    };

    loadAdminProfile();
  }, [user, isAuthenticated, authLoading]);

  /**
   * Verifica si el usuario actual puede acceder a una sección específica
   */
  const canAccess = (section: keyof AdminPermissions): boolean => {
    return adminState.permissions[section];
  };

  /**
   * Verifica si el usuario puede editar roles
   */
  const canEditRoles = (): boolean => {
    return adminState.role === 'super_admin';
  };

  /**
   * Verifica si el usuario puede suspender/activar usuarios
   */
  const canManageUserStatus = (): boolean => {
    return ['super_admin', 'admin'].includes(adminState.role);
  };

  /**
   * Verifica si el usuario puede acceder a logs del sistema
   */
  const canViewLogs = (): boolean => {
    return ['super_admin', 'admin'].includes(adminState.role);
  };

  /**
   * Verifica si el usuario puede gestionar empresas
   */
  const canManageCompanies = (): boolean => {
    return ['super_admin', 'admin', 'manager'].includes(adminState.role);
  };

  /**
   * Verifica permisos específicos (compatibilidad con versión anterior)
   */
  const hasPermission = (requiredRoles: string[]): boolean => {
    return requiredRoles.includes(adminState.role);
  };

  /**
   * Obtiene el nivel de acceso del usuario
   */
  const getAccessLevel = (): 'full' | 'limited' | 'readonly' | 'none' => {
    switch (adminState.role) {
      case 'super_admin':
        return 'full';
      case 'admin':
        return 'limited';
      case 'manager':
      case 'analyst':
        return 'readonly';
      default:
        return 'none';
    }
  };

  /**
   * Obtiene un mensaje descriptivo de las restricciones del usuario
   */
  const getRestrictionMessage = (action: string): string => {
    switch (adminState.role) {
      case 'admin':
        return `Como administrador, no puedes ${action}. Solo los super administradores tienen este permiso.`;
      case 'manager':
        return `Como manager, no puedes ${action}. Contacta a un administrador.`;
      case 'analyst':
        return `Como analista, solo tienes acceso de lectura. No puedes ${action}.`;
      default:
        return `No tienes permisos para ${action}.`;
    }
  };

  return {
    // Nuevas propiedades
    ...adminState,
    canAccess,
    canEditRoles,
    canManageUserStatus,
    canViewLogs,
    canManageCompanies,
    getAccessLevel,
    getRestrictionMessage,
    
    // Compatibilidad con versión anterior
    user,
    loading: adminState.loading || authLoading,
    adminRole: adminState.role,
    hasAccess: adminState.isAdmin,
    hasPermission,
    
    refresh: () => {
      // Trigger reload of admin profile
      if (user) {
        setAdminState(prev => ({ ...prev, loading: true }));
      }
    }
  };
};

/**
 * Define permisos por rol
 */
function getPermissions(role: AdminRole): AdminPermissions {
  const permissionMatrix: Record<AdminRole, AdminPermissions> = {
    super_admin: {
      dashboard: true,
      users: true,
      companies: true,
      analytics: true,
      settings: true,
      logs: true,
      system: true,
      messages: true,
      config: true,
      security: true,
      notifications: true,
      apps: true,
      referrals: true,
      leads: true
    },
    admin: {
      dashboard: true,
      users: true,
      companies: true,
      analytics: true,
      settings: false,
      logs: true,
      system: false,
      messages: true,
      config: false,
      security: false,
      notifications: true,
      apps: false,
      referrals: true,
      leads: true
    },
    manager: {
      dashboard: true,
      users: true,
      companies: true,
      analytics: true,
      settings: false,
      logs: false,
      system: false,
      messages: true,
      config: false,
      security: false,
      notifications: true,
      apps: false,
      referrals: true,
      leads: true
    },
    analyst: {
      dashboard: true,
      users: false,
      companies: false,
      analytics: true,
      settings: false,
      logs: false,
      system: false,
      messages: false,
      config: false,
      security: false,
      notifications: false,
      apps: false,
      referrals: false,
      leads: true
    },
    affiliate: {
      dashboard: true,
      users: false,
      companies: false,
      analytics: false,
      settings: false,
      logs: false,
      system: false,
      messages: false,
      config: false,
      security: false,
      notifications: false,
      apps: false,
      referrals: true,
      leads: false
    },
    client: {
      dashboard: true,
      users: false,
      companies: false,
      analytics: false,
      settings: false,
      logs: false,
      system: false,
      messages: false,
      config: false,
      security: false,
      notifications: false,
      apps: false,
      referrals: false,
      leads: false
    }
  };

  return permissionMatrix[role];
}

/**
 * Obtiene la descripción de un rol
 */
export function getRoleDescription(role: AdminRole): string {
  const descriptions: Record<AdminRole, string> = {
    super_admin: 'Acceso total al sistema, puede gestionar todo incluyendo roles',
    admin: 'Acceso completo excepto configuración del sistema y roles',
    manager: 'Puede gestionar usuarios y empresas, acceso a analíticas',
    analyst: 'Solo lectura de analíticas y reportes',
    affiliate: 'Acceso limitado como socio/afiliado',
    client: 'Usuario cliente sin permisos administrativos'
  };

  return descriptions[role];
}

/**
 * Obtiene el color del badge para un rol
 */
export function getRoleBadgeColor(role: AdminRole): string {
  const colors: Record<AdminRole, string> = {
    super_admin: 'bg-red-100 text-red-800 border-red-200',
    admin: 'bg-blue-100 text-blue-800 border-blue-200',
    manager: 'bg-purple-100 text-purple-800 border-purple-200',
    analyst: 'bg-green-100 text-green-800 border-green-200',
    affiliate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    client: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return colors[role];
}