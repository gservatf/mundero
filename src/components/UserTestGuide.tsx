import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiShield, FiX, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface TestUser {
  id: string;
  name: string;
  email: string;
  role: string;
  empresa: string;
  description: string;
  features: string[];
}

const testUsers: TestUser[] = [
  {
    id: '1',
    name: 'Usuario Analista',
    email: 'analista@demo.com',
    role: 'analyst',
    empresa: 'Empresa Demo S.A.C.',
    description: 'Usuario estándar con acceso a aplicaciones y sistema de referidos',
    features: [
      'Ver dashboard principal',
      'Acceder a aplicaciones disponibles',
      'Gestionar referidos',
      'Ver integraciones básicas',
      'Recibir notificaciones'
    ]
  },
  {
    id: '2',
    name: 'Usuario Administrador',
    email: 'admin@mundero.com',
    role: 'admin',
    empresa: 'MUNDERO - Grupo Servat',
    description: 'Administrador con acceso completo al sistema',
    features: [
      'Panel administrativo completo',
      'Aprobar/rechazar usuarios',
      'Gestionar empresas',
      'Configurar integraciones',
      'Ver logs de auditoría',
      'Todas las funciones de usuario estándar'
    ]
  },
  {
    id: '3',
    name: 'Usuario Referidor',
    email: 'referidor@empresa.com',
    role: 'referrer',
    empresa: 'Consulting Pro EIRL',
    description: 'Especializado en sistema de referidos y comisiones',
    features: [
      'Sistema de referidos avanzado',
      'Seguimiento de comisiones',
      'Métricas de conversión',
      'Acceso a aplicaciones básicas'
    ]
  }
];

interface UserTestGuideProps {
  onSelectUser: (user: TestUser) => void;
  onClose: () => void;
}

const UserTestGuide: React.FC<UserTestGuideProps> = ({ onSelectUser, onClose }) => {
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null);

  const handleCopyCredentials = (user: TestUser) => {
    const credentials = `Email: ${user.email}\nRol: ${user.role}\nEmpresa: ${user.empresa}`;
    navigator.clipboard.writeText(credentials);
    toast.success('Credenciales copiadas al portapapeles');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Usuarios de Prueba - MUNDERO</h2>
            <p className="text-gray-600">Selecciona un usuario para explorar las funcionalidades</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Instrucciones de Navegación:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Haz clic en "Usar este Usuario" para iniciar sesión automáticamente</li>
            <li>• Cada usuario tiene diferentes permisos y vistas</li>
            <li>• Explora las pestañas del dashboard: Aplicaciones, Referidos, Integraciones</li>
            <li>• El usuario Admin tiene acceso al "Panel Administrativo"</li>
            <li>• Todos los datos son simulados para demostración</li>
          </ul>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testUsers.map((user) => (
            <motion.div
              key={user.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all cursor-pointer"
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  user.role === 'admin' ? 'bg-purple-100' :
                  user.role === 'referrer' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {user.role === 'admin' ? (
                    <FiShield className={`w-6 h-6 ${
                      user.role === 'admin' ? 'text-purple-600' : 'text-blue-600'
                    }`} />
                  ) : (
                    <FiUser className={`w-6 h-6 ${
                      user.role === 'referrer' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-mono text-gray-900">{user.email}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Empresa:</span>
                  <span className="ml-2 text-gray-900">{user.empresa}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{user.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Funcionalidades disponibles:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {user.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                  {user.features.length > 3 && (
                    <li className="text-gray-500">+ {user.features.length - 3} más...</li>
                  )}
                </ul>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUser(user);
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                    user.role === 'admin' 
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : user.role === 'referrer'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Usar este Usuario
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCredentials(user);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed View Modal */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="font-mono text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rol</label>
                    <p className="text-gray-900 capitalize">{selectedUser.role}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Empresa</label>
                  <p className="text-gray-900">{selectedUser.empresa}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-gray-600">{selectedUser.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Funcionalidades Completas
                  </label>
                  <ul className="space-y-2">
                    {selectedUser.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={() => {
                    onSelectUser(selectedUser);
                    setSelectedUser(null);
                  }}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                    selectedUser.role === 'admin' 
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : selectedUser.role === 'referrer'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Iniciar Sesión como {selectedUser.name}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UserTestGuide;