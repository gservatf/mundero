import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiHome, FiSettings, FiBarChart, FiShield, FiAlertCircle,
  FiTrendingUp, FiUserCheck, FiDollarSign, FiActivity, FiGrid, FiLock
} from 'react-icons/fi';
import { useMockAuth, useMockData } from '../hooks/useMockData';
import CompanyManagement from '../components/CompanyManagement';
import ApplicationManagement from '../components/ApplicationManagement';
import UserManagement from '../components/UserManagement';
import UserRoleManagement from '../components/UserRoleManagement';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useMockAuth();
  const { users, applications } = useMockData();
  const [activeTab, setActiveTab] = useState('users');

  const [adminStats] = useState({
    totalUsers: 2847,
    activeUsers: 2456,
    totalCompanies: 156,
    pendingApprovals: 23,
    totalRevenue: 125000,
    monthlyGrowth: 12.5,
    systemHealth: 98.5,
    securityAlerts: 3
  });

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: FiUsers },
    { id: 'overview', label: 'Resumen General', icon: FiBarChart },
    { id: 'companies', label: 'Empresas y Roles', icon: FiHome },
    { id: 'applications', label: 'Aplicaciones y APIs', icon: FiGrid },
    { id: 'security', label: 'Seguridad', icon: FiShield },
    { id: 'system', label: 'Sistema', icon: FiSettings }
  ];

  const handleUserAction = (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    switch (action) {
      case 'activate':
        toast.success('Usuario activado correctamente');
        break;
      case 'deactivate':
        toast.warning('Usuario desactivado');
        break;
      case 'delete':
        toast.error('Usuario eliminado');
        break;
    }
  };

  const handleApplicationAction = (appId: string, action: 'approve' | 'reject' | 'suspend') => {
    switch (action) {
      case 'approve':
        toast.success('Aplicación aprobada');
        break;
      case 'reject':
        toast.error('Aplicación rechazada');
        break;
      case 'suspend':
        toast.warning('Aplicación suspendida');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-xs text-gray-500">MUNDERO - Administrador: {user?.displayName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Sistema Operativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">
                Panel de Control Administrativo 🛡️
              </h2>
              <p className="text-red-100 text-lg">
                Gestiona usuarios, empresas, aplicaciones y mantén la seguridad del sistema MUNDERO.
              </p>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Usuarios Totales</p>
                <p className="text-3xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 font-medium">{adminStats.activeUsers} activos</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Empresas Registradas</p>
                <p className="text-3xl font-bold text-gray-900">{adminStats.totalCompanies}</p>
                <p className="text-sm text-yellow-600 font-medium">{adminStats.pendingApprovals} pendientes</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FiHome className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Salud del Sistema</p>
                <p className="text-3xl font-bold text-gray-900">{adminStats.systemHealth}%</p>
                <p className="text-sm text-green-600 font-medium">Excelente rendimiento</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Alertas de Seguridad</p>
                <p className="text-3xl font-bold text-gray-900">{adminStats.securityAlerts}</p>
                <p className="text-sm text-orange-600 font-medium">Requieren atención</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
            <nav className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-3 px-6 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Enhanced Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50"
        >
          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Resumen General del Sistema</h3>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <FiUserCheck className="w-8 h-8 text-blue-600" />
                    <h4 className="font-bold text-blue-900">Aprobaciones Pendientes</h4>
                  </div>
                  <p className="text-blue-700 mb-4">
                    {adminStats.pendingApprovals} empresas esperan aprobación
                  </p>
                  <button 
                    onClick={() => setActiveTab('companies')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Revisar Ahora
                  </button>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <FiTrendingUp className="w-8 h-8 text-green-600" />
                    <h4 className="font-bold text-green-900">Crecimiento Mensual</h4>
                  </div>
                  <p className="text-green-700 mb-4">
                    +{adminStats.monthlyGrowth}% en usuarios activos
                  </p>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Ver Detalles
                  </button>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <FiGrid className="w-8 h-8 text-purple-600" />
                    <h4 className="font-bold text-purple-900">Aplicaciones Integradas</h4>
                  </div>
                  <p className="text-purple-700 mb-4">
                    Registra nuevas apps y genera API Keys
                  </p>
                  <button 
                    onClick={() => setActiveTab('applications')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Gestionar Apps
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h4 className="font-bold text-gray-900 mb-4">Actividad Reciente</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <FiHome className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Nueva empresa registrada</p>
                      <p className="text-sm text-gray-600">TechSolutions SAC - RUC: 20987654321</p>
                    </div>
                    <span className="text-xs text-gray-500">Hace 2 horas</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <FiUserCheck className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Solicitud de rol aprobada</p>
                      <p className="text-sm text-gray-600">María González - Manager en Constructora Lima</p>
                    </div>
                    <span className="text-xs text-gray-500">Hace 4 horas</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <FiGrid className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Nueva aplicación registrada</p>
                      <p className="text-sm text-gray-600">Legalty - API Key generada automáticamente</p>
                    </div>
                    <span className="text-xs text-gray-500">Hace 6 horas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && <CompanyManagement />}

          {activeTab === 'applications' && <ApplicationManagement />}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Centro de Seguridad</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center space-x-3 mb-4">
                    <FiLock className="w-6 h-6 text-blue-600" />
                    <h4 className="font-bold text-gray-900">Autenticación</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">2FA Habilitado</span>
                      <span className="text-green-600 font-medium">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sesiones Activas</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Intentos Fallidos (24h)</span>
                      <span className="text-orange-600 font-medium">23</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center space-x-3 mb-4">
                    <FiAlertCircle className="w-6 h-6 text-orange-600" />
                    <h4 className="font-bold text-gray-900">Alertas Recientes</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="font-medium text-red-900">Intento de acceso sospechoso</p>
                      <p className="text-sm text-red-700">IP: 192.168.1.100 - Bloqueado</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="font-medium text-yellow-900">Múltiples intentos fallidos</p>
                      <p className="text-sm text-yellow-700">Usuario: admin@empresa.com</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">Nueva IP detectada</p>
                      <p className="text-sm text-blue-700">Usuario: user@mundero.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <h4 className="font-bold text-gray-900 mb-4">Rendimiento del Sistema</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">CPU</span>
                        <span className="font-medium">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Memoria</span>
                        <span className="font-medium">67%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Almacenamiento</span>
                        <span className="font-medium">23%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <h4 className="font-bold text-gray-900 mb-4">Configuraciones Generales</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Registro de Empresas</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Validación RUC Automática</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Notificaciones Email</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Modo Mantenimiento</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminPanel;