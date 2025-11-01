import React from "react";
import { motion } from "framer-motion";
import {
  FiExternalLink,
  FiShield,
  FiUsers,
  FiSettings,
  FiCheck,
  FiX,
} from "react-icons/fi";

export const Applications: React.FC = () => {
  const applications = [
    {
      id: 1,
      name: "LEGALTY",
      description: "Plataforma legal integral para empresas",
      logo: "⚖️",
      connected: true,
      role: "Usuario Premium",
      lastAccess: "2024-01-20",
      permissions: ["Documentos", "Consultas", "Reportes"],
    },
    {
      id: 2,
      name: "WE CONSULTING",
      description: "Consultoría empresarial especializada",
      logo: "💼",
      connected: true,
      role: "Consultor",
      lastAccess: "2024-01-18",
      permissions: ["Proyectos", "Clientes", "Facturación"],
    },
    {
      id: 3,
      name: "STUDIO41",
      description: "Estudio de diseño y marketing digital",
      logo: "🎨",
      connected: false,
      role: null,
      lastAccess: null,
      permissions: [],
    },
    {
      id: 4,
      name: "PORTALES",
      description: "Desarrollo de portales web corporativos",
      logo: "🌐",
      connected: true,
      role: "Desarrollador",
      lastAccess: "2024-01-19",
      permissions: ["Desarrollo", "Deploy", "Monitoreo"],
    },
    {
      id: 5,
      name: "PITAHAYA",
      description: "Soluciones de e-commerce y retail",
      logo: "🛒",
      connected: false,
      role: null,
      lastAccess: null,
      permissions: [],
    },
    {
      id: 6,
      name: "ARKADIAM",
      description: "Plataforma de gaming y entretenimiento",
      logo: "🎮",
      connected: false,
      role: null,
      lastAccess: null,
      permissions: [],
    },
    {
      id: 7,
      name: "SERVAT LIFE",
      description: "Plataforma de bienestar y salud corporativa",
      logo: "🏥",
      connected: true,
      role: "Empleado",
      lastAccess: "2024-01-21",
      permissions: ["Salud", "Beneficios", "Reportes"],
    },
  ];

  const handleConnect = (appId: number) => {
    // TODO: Implement SSO connection
    console.log("Connecting to app:", appId);
  };

  const handleDisconnect = (appId: number) => {
    // TODO: Implement disconnection
    console.log("Disconnecting from app:", appId);
  };

  const handleLaunchApp = (appName: string) => {
    // TODO: Implement SSO launch
    console.log("Launching app:", appName);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Aplicaciones</h1>
        <p className="text-gray-600 mt-2">
          Conecta y gestiona tus aplicaciones del ecosistema Grupo Servat
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Apps Conectadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter((app) => app.connected).length}
              </p>
            </div>
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Apps Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.length}
              </p>
            </div>
            <FiShield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Roles Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter((app) => app.role).length}
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* App Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{app.logo}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{app.name}</h3>
                  <p className="text-sm text-gray-500">{app.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {app.connected ? (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                )}
              </div>
            </div>

            {/* App Status */}
            <div className="space-y-3 mb-6">
              {app.connected ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Conectado
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mi rol:</span>
                    <span className="font-medium">{app.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Último acceso:</span>
                    <span className="font-medium">{app.lastAccess}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estado:</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                    No conectado
                  </span>
                </div>
              )}
            </div>

            {/* Permissions */}
            {app.connected && app.permissions.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Permisos:</p>
                <div className="flex flex-wrap gap-1">
                  {app.permissions.map((permission, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              {app.connected ? (
                <>
                  <button
                    onClick={() => handleLaunchApp(app.name)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span>Abrir</span>
                  </button>
                  <button
                    onClick={() => handleDisconnect(app.id)}
                    className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Desconectar"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  <button
                    className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Configurar"
                  >
                    <FiSettings className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleConnect(app.id)}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiShield className="w-4 h-4" />
                  <span>Conectar con SSO</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <FiShield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Seguridad y Privacidad
            </h3>
            <p className="text-blue-800 text-sm">
              Todas las conexiones utilizan autenticación segura (SSO) a través
              de tu cuenta de Google. Puedes revocar el acceso a cualquier
              aplicación en cualquier momento desde esta página.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
