import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiEdit, 
  FiUserX, 
  FiUserCheck,
  FiRefreshCw,
  FiMoreVertical,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import { adminUserService, AdminUser, PaginatedUsers } from '../services/adminFirebase';
import { useAdminAuth, getRoleDescription, getRoleBadgeColor } from '../hooks/useAdminAuth';

// Tooltip Component
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 whitespace-nowrap">
          {content}
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      )}
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
}> = ({ isOpen, onClose, onConfirm, title, message, type }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning': return <FiAlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'danger': return <FiUserX className="w-6 h-6 text-red-600" />;
      default: return <FiInfo className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          {getIcon()}
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            className={type === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AdminUsers: React.FC = () => {
  const { canAccess, canEditRoles, canManageUserStatus, getRestrictionMessage, adminProfile } = useAdminAuth();
  
  // State management
  const [paginatedData, setPaginatedData] = useState<PaginatedUsers>({
    users: [],
    hasMore: false,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'role' | 'status';
    userId: string;
    userEmail: string;
    newValue: string;
    oldValue: string;
  } | null>(null);

  // Load initial users
  useEffect(() => {
    if (canAccess('users')) {
      loadUsers();
    }
  }, [canAccess]);

  const loadUsers = async (reset = true) => {
    try {
      setLoading(reset);
      const lastDoc = reset ? undefined : paginatedData.lastDoc;
      const result = await adminUserService.getUsers(25, lastDoc);
      
      if (reset) {
        setPaginatedData(result);
      } else {
        setPaginatedData(prev => ({
          ...result,
          users: [...prev.users, ...result.users]
        }));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreUsers = useCallback(async () => {
    if (loadingMore || !paginatedData.hasMore || isSearching) return;
    
    setLoadingMore(true);
    await loadUsers(false);
  }, [loadingMore, paginatedData.hasMore, isSearching]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        setIsSearching(true);
        const searchResults = await adminUserService.searchUsers(searchTerm);
        setPaginatedData({
          users: searchResults,
          hasMore: false,
          total: searchResults.length
        });
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setIsSearching(false);
      loadUsers();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    loadUsers();
  };

  const requestRoleChange = (userId: string, userEmail: string, currentRole: string, newRole: string) => {
    if (!canEditRoles()) {
      alert(getRestrictionMessage('cambiar roles de usuario'));
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'role',
      userId,
      userEmail,
      newValue: newRole,
      oldValue: currentRole
    });
  };

  const requestStatusChange = (userId: string, userEmail: string, currentStatus: string, newStatus: string) => {
    if (!canManageUserStatus()) {
      alert(getRestrictionMessage('cambiar el estado de usuario'));
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'status',
      userId,
      userEmail,
      newValue: newStatus,
      oldValue: currentStatus
    });
  };

  const handleConfirmChange = async () => {
    if (!confirmModal || !adminProfile) return;

    try {
      if (confirmModal.type === 'role') {
        await adminUserService.updateUserRole(
          confirmModal.userId, 
          confirmModal.newValue,
          { uid: adminProfile.uid, email: adminProfile.email }
        );
      } else {
        await adminUserService.updateUserStatus(
          confirmModal.userId, 
          confirmModal.newValue,
          { uid: adminProfile.uid, email: adminProfile.email }
        );
      }
      
      // Reload users to reflect changes
      if (isSearching) {
        handleSearch();
      } else {
        loadUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario. Inténtalo de nuevo.');
    } finally {
      setConfirmModal(null);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['UID', 'Email', 'Nombre', 'Rol', 'Estado', 'Empresa', 'País', 'Fecha Registro'].join(','),
      ...paginatedData.users.map((user: AdminUser) => [
        user.uid,
        user.email,
        user.displayName || '',
        user.role,
        user.status,
        user.companyName || user.companyId || '',
        user.country || '',
        user.createdAt?.toDate?.()?.toLocaleDateString() || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_mundero_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = paginatedData.users.filter((user: AdminUser) => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      manager: 'bg-purple-100 text-purple-800',
      analyst: 'bg-green-100 text-green-800',
      affiliate: 'bg-yellow-100 text-yellow-800',
      client: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!canAccess('users')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuarios y Roles</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona usuarios, roles y permisos del sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportUsers} variant="outline">
            <FiDownload className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={() => loadUsers()} disabled={loading}>
            <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Buscar por email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="sm">
                <FiSearch className="h-4 w-4" />
              </Button>
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="analyst">Analyst</option>
              <option value="affiliate">Affiliate</option>
              <option value="client">Client</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="suspended">Suspendido</option>
              <option value="pending">Pendiente</option>
            </select>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 flex items-center space-x-4">
                <span>{filteredUsers.length} de {paginatedData.users.length} usuarios</span>
                {isSearching && (
                  <Button variant="outline" size="sm" onClick={clearSearch}>
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
              {!isSearching && paginatedData.hasMore && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadMoreUsers}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Cargando...' : 'Cargar más'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>
                              {user.displayName?.charAt(0) || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.displayName || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">UID: {user.uid.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Tooltip content={getRoleDescription(user.role)}>
                          <select
                            value={user.role}
                            onChange={(e) => requestRoleChange(user.uid, user.email, user.role, e.target.value)}
                            disabled={!canEditRoles()}
                            className={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeColor(user.role)} ${
                              canEditRoles() ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed opacity-60'
                            }`}
                          >
                            <option value="client">Client</option>
                            <option value="affiliate">Affiliate</option>
                            <option value="analyst">Analyst</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </Tooltip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Tooltip content={`Estado: ${user.status === 'active' ? 'Usuario activo' : user.status === 'suspended' ? 'Usuario suspendido' : 'Pendiente de activación'}`}>
                          <select
                            value={user.status}
                            onChange={(e) => requestStatusChange(user.uid, user.email, user.status, e.target.value)}
                            disabled={!canManageUserStatus()}
                            className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeColor(user.status)} ${
                              canManageUserStatus() ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed opacity-60'
                            }`}
                          >
                            <option value="active">Activo</option>
                            <option value="suspended">Suspendido</option>
                            <option value="pending">Pendiente</option>
                          </select>
                        </Tooltip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.companyName || user.companyId || 'Sin empresa'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <FiMoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No se encontraron usuarios</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal?.isOpen || false}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmChange}
        title={
          confirmModal?.type === 'role' 
            ? 'Confirmar cambio de rol' 
            : 'Confirmar cambio de estado'
        }
        message={
          confirmModal 
            ? `¿Estás seguro que deseas cambiar ${confirmModal.type === 'role' ? 'el rol' : 'el estado'} de ${confirmModal.userEmail} de "${confirmModal.oldValue}" a "${confirmModal.newValue}"?`
            : ''
        }
        type={confirmModal?.type === 'status' && confirmModal?.newValue === 'suspended' ? 'danger' : 'warning'}
      />
    </div>
  );
};