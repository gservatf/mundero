import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export const useAdminAuth = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      const userRole = user.role; // Use only role field
      const adminRoles = ['super_admin', 'admin', 'auditor', 'soporte', 'dev'];
      
      setAdminRole(userRole);
      setIsAdmin(adminRoles.includes(userRole));
      setHasAccess(adminRoles.includes(userRole));
    } else {
      setIsAdmin(false);
      setAdminRole(null);
      setHasAccess(false);
    }
  }, [user, loading]);

  const hasPermission = (requiredRoles: string[]) => {
    if (!adminRole) return false;
    return requiredRoles.includes(adminRole);
  };

  const canAccess = (section: string) => {
    if (!adminRole) return false;

    const permissions: Record<string, string[]> = {
      dashboard: ['super_admin', 'admin', 'auditor', 'soporte', 'dev'],
      messages: ['super_admin', 'admin', 'auditor', 'soporte', 'dev'], // Added messages permission
      users: ['super_admin', 'admin', 'soporte'],
      companies: ['super_admin', 'admin'],
      apps: ['super_admin', 'admin', 'dev'],
      referrals: ['super_admin', 'admin'],
      leads: ['super_admin', 'admin'],
      security: ['super_admin', 'auditor'],
      config: ['super_admin'],
      notifications: ['super_admin', 'admin', 'soporte'],
      analytics: ['super_admin', 'admin', 'auditor']
    };

    return permissions[section]?.includes(adminRole) || false;
  };

  return {
    user,
    loading,
    isAdmin,
    adminRole,
    hasAccess,
    hasPermission,
    canAccess
  };
};