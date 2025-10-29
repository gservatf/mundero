import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiSearch, 
  FiShield, 
  FiMail, 
  FiCalendar, 
  FiEye,
  FiBarChart,
  FiUserCheck
} from 'react-icons/fi';
import { useAuth, UserProfile } from '../hooks/useAuth';

const UserManagement: React.FC = () => {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo para mostrar la funcionalidad
  // En producción, estos datos vendrían de las aplicaciones integradas
  const mockUsers: UserProfile[] = [
    {
      id: '1',
      email: 'gservat@angloamericana.edu.pe',
      display_name: 'Gabriel Servat',
      photo_url: 'https://ui-avatars.com/api/?name=Gabriel+Servat&background=3b82f6&color=fff',
      role: 'SUPER_ADMIN',
      status: 'active',
      provider: 'google',
      email_verified: true,
      created_at: '2024-01-15T10:00:00Z',
      integrations_access: ['legalty', 'we-consulting']
    }
  ];

  const integrations = [
    {
      id: 'legalty',
      name: 'Legalty',
      description: 'Plataforma legal y de compliance',
      status: 'active'
    },
    {
      id: 'we-consulting',
      name: 'We Consulting',
      description: 'Servicios de consultoría empresarial',
      status: 'active'
    }
  ];

  const getRoleColor = (role: UserProfile['role']) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USER': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: UserProfile['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiShield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso Denegado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Solo los Super Administradores pueden acceder a la gestión de usuarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FiUsers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hub de Identidad</h2>
            <p className="text-gray-600">Centro de autenticación para el ecosistema Mundero</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FiShield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900">Hub de Identidad Firebase</h3>
            <p className="text-blue-700 mt-1">
              Mundero actúa como centro de autenticación principal. Los usuarios se autentican aquí 
              y su identidad se sincroniza automáticamente con las aplicaciones del ecosistema 
              (Legalty, We Consulting, Portales, Pitahaya) que manejan sus propios datos en Supabase.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuario Actual</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <p className="text-2xl font-bold text-green-600">Activo</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rol</p>
              <p className="text-2xl font-bold text-purple-600">Super Admin</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Integraciones</p>
              <p className="text-2xl font-bold text-orange-600">{integrations.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiBarChart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Current User Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Perfil de Usuario Actual</h3>
          <p className="text-sm text-gray-500">Información del usuario autenticado en Firebase</p>
        </div>
        
        <div className="p-6">
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <img
                src={currentUser.photo_url}
                alt={currentUser.display_name}
                className="h-16 w-16 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{currentUser.display_name}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(currentUser.role)}`}>
                    {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : currentUser.role}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(currentUser.status)}`}>
                    {currentUser.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FiMail className="mr-2" />
                  {currentUser.email}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <FiCalendar className="mr-2" />
                  Registrado: {new Date(currentUser.created_at).toLocaleDateString('es-ES')}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Acceso a Integraciones:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.integrations_access.map((integrationId) => {
                      const integration = integrations.find(i => i.id === integrationId);
                      return integration ? (
                        <span
                          key={integrationId}
                          className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {integration.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Aplicaciones del Ecosistema</h3>
          <p className="text-sm text-gray-500">Estado de las integraciones disponibles</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{integration.name}</h4>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Gestiona sus propios datos en Supabase</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Activo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;