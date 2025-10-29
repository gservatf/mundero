import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiUserCheck, FiUserPlus, FiCheck, FiX, FiSearch, 
  FiFilter, FiMail, FiUser, FiShield, FiEye
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  currentRole: 'user' | 'admin' | 'manager' | 'employee';
  requestedRole?: 'user' | 'admin' | 'manager' | 'employee';
  company?: {
    id: string;
    name: string;
    ruc: string;
  };
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  lastActivity: string;
  permissions: string[];
}

interface RoleRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: string;
  requestedRole: string;
  companyId?: string;
  companyName?: string;
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
}

const UserRoleManagement = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAssignRoleModal, setShowAssignRoleModal] = useState<User | null>(null);

  const [users] = useState<User[]>([
    {
      id: '1',
      displayName: 'María González',
      email: 'maria@constructoralima.com',
      photoURL: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff',
      currentRole: 'employee',
      company: {
        id: '1',
        name: 'Constructora Lima SAC',
        ruc: '20123456789'
      },
      status: 'active',
      joinDate: '2024-01-15',
      lastActivity: '2024-01-30',
      permissions: ['read:company', 'write:reports']
    },
    {
      id: '2',
      displayName: 'Diego Morales',
      email: 'diego@techsolutions.pe',
      photoURL: 'https://ui-avatars.com/api/?name=Diego+Morales&background=3b82f6&color=fff',
      currentRole: 'user',
      requestedRole: 'manager',
      company: {
        id: '2',
        name: 'TechSolutions SAC',
        ruc: '20987654321'
      },
      status: 'pending',
      joinDate: '2024-01-20',
      lastActivity: '2024-01-29',
      permissions: ['read:basic']
    },
    {
      id: '3',
      displayName: 'Carmen Vega',
      email: 'carmen@consultingpro.pe',
      photoURL: 'https://ui-avatars.com/api/?name=Carmen+Vega&background=8b5cf6&color=fff',
      currentRole: 'manager',
      company: {
        id: '3',
        name: 'Consulting Pro EIRL',
        ruc: '20456789123'
      },
      status: 'active',
      joinDate: '2024-01-10',
      lastActivity: '2024-01-30',
      permissions: ['read:company', 'write:reports', 'manage:team']
    },
    {
      id: '4',
      displayName: 'Roberto Silva',
      email: 'roberto@mundero.com',
      currentRole: 'admin',
      status: 'active',
      joinDate: '2024-01-01',
      lastActivity: '2024-01-30',
      permissions: ['admin:all']
    }
  ]);

  const [roleRequests] = useState<RoleRequest[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Diego Morales',
      userEmail: 'diego@techsolutions.pe',
      currentRole: 'user',
      requestedRole: 'manager',
      companyId: '2',
      companyName: 'TechSolutions SAC',
      reason: 'He sido promovido a Gerente de Desarrollo y necesito permisos adicionales para gestionar el equipo y proyectos.',
      requestDate: '2024-01-28',
      status: 'pending'
    },
    {
      id: '2',
      userId: '5',
      userName: 'Ana Rodriguez',
      userEmail: 'ana@startup.pe',
      currentRole: 'user',
      requestedRole: 'admin',
      reason: 'Como fundadora de la empresa, requiero acceso administrativo completo para configurar la plataforma.',
      requestDate: '2024-01-29',
      status: 'pending'
    },
    {
      id: '3',
      userId: '1',
      userName: 'María González',
      userEmail: 'maria@constructoralima.com',
      currentRole: 'employee',
      requestedRole: 'manager',
      companyId: '1',
      companyName: 'Constructora Lima SAC',
      reason: 'Solicito promoción a Manager para liderar el nuevo departamento de calidad.',
      requestDate: '2024-01-25',
      status: 'approved',
      reviewedBy: 'Admin Sistema',
      reviewDate: '2024-01-27'
    }
  ]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'manager':
        return 'bg-purple-100 text-purple-700';
      case 'employee':
        return 'bg-blue-100 text-blue-700';
      case 'user':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'employee':
        return 'Empleado';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAssignRole = (userId: string, newRole: string) => {
    toast.success(`Rol ${getRoleLabel(newRole)} asignado correctamente`);
    setShowAssignRoleModal(null);
  };

  const handleApproveRequest = (requestId: string) => {
    toast.success('Solicitud de rol aprobada');
  };

  const handleRejectRequest = (requestId: string) => {
    toast.error('Solicitud de rol rechazada');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.currentRole === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredRequests = roleRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Gestión de Usuarios y Roles</h3>
          <p className="text-gray-600">Administra usuarios, asigna roles y aprueba solicitudes</p>
        </div>
        <button
          onClick={() => setShowAssignRoleModal({} as User)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          <FiUserPlus className="w-5 h-5" />
          <span className="font-medium">Asignar Rol</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium">Usuarios Activos</p>
              <p className="text-3xl font-bold text-blue-900">{users.filter(u => u.status === 'active').length}</p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-medium">Administradores</p>
              <p className="text-3xl font-bold text-purple-900">{users.filter(u => u.currentRole === 'admin').length}</p>
            </div>
            <FiShield className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 font-medium">Solicitudes Pendientes</p>
              <p className="text-3xl font-bold text-yellow-900">{roleRequests.filter(r => r.status === 'pending').length}</p>
            </div>
            <FiUserCheck className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Gerentes</p>
              <p className="text-3xl font-bold text-green-900">{users.filter(u => u.currentRole === 'manager').length}</p>
            </div>
            <FiUser className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Usuarios ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Solicitudes de Rol ({roleRequests.filter(r => r.status === 'pending').length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={activeTab === 'users' ? "Buscar usuarios, email, empresa..." : "Buscar solicitudes..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="flex items-center space-x-3">
              {activeTab === 'users' && (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="employee">Empleado</option>
                  <option value="user">Usuario</option>
                </select>
              )}
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
                {activeTab === 'users' && <option value="suspended">Suspendido</option>}
                {activeTab === 'requests' && <option value="approved">Aprobado</option>}
                {activeTab === 'requests' && <option value="rejected">Rechazado</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=6366f1&color=fff`}
                        alt={user.displayName}
                        className="w-14 h-14 rounded-full ring-2 ring-gray-200"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">{user.displayName}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.currentRole)}`}>
                            {getRoleLabel(user.currentRole)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'Activo' : user.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{user.email}</p>
                        
                        {user.company && (
                          <p className="text-gray-600 mb-3">
                            <strong>Empresa:</strong> {user.company.name} (RUC: {user.company.ruc})
                          </p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>Registro:</strong> {new Date(user.joinDate).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Última actividad:</strong> {new Date(user.lastActivity).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Permisos:</strong> {user.permissions.length}
                          </div>
                        </div>

                        {user.requestedRole && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-yellow-800 text-sm">
                              <strong>Solicitud pendiente:</strong> Promoción a {getRoleLabel(user.requestedRole)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowAssignRoleModal(user)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiUserCheck className="w-4 h-4" />
                        <span>Cambiar Rol</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{request.userName}</h4>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{request.userEmail}</span>
                      </div>
                      
                      {request.companyName && (
                        <p className="text-gray-600 mb-3">
                          <strong>Empresa:</strong> {request.companyName}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-6 mb-3 text-sm">
                        <div>
                          <strong>Rol actual:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRoleColor(request.currentRole)}`}>
                            {getRoleLabel(request.currentRole)}
                          </span>
                        </div>
                        <div>
                          <strong>Rol solicitado:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRoleColor(request.requestedRole)}`}>
                            {getRoleLabel(request.requestedRole)}
                          </span>
                        </div>
                        <div>
                          <strong>Fecha:</strong> {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <strong className="text-gray-700">Justificación:</strong>
                        <p className="text-gray-600 mt-1 leading-relaxed">{request.reason}</p>
                      </div>

                      {request.status === 'approved' && request.reviewedBy && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-green-800 text-sm">
                            <strong>Aprobado por:</strong> {request.reviewedBy} el {new Date(request.reviewDate!).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status === 'pending' ? 'Pendiente' : 
                         request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </span>
                      
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Role Modal */}
      {showAssignRoleModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Asignar Rol</h3>
              <button
                onClick={() => setShowAssignRoleModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={showAssignRoleModal.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(showAssignRoleModal.displayName || 'Usuario')}&background=6366f1&color=fff`}
                    alt={showAssignRoleModal.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{showAssignRoleModal.displayName}</p>
                    <p className="text-sm text-gray-600">{showAssignRoleModal.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Rol
                </label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
                  <option value="user">Usuario</option>
                  <option value="employee">Empleado</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificación (Opcional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Motivo del cambio de rol..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssignRoleModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAssignRole(showAssignRoleModal.id, 'manager')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Asignar Rol
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UserRoleManagement;