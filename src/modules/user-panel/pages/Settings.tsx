import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAgreement } from '../hooks/useAgreement';
import AgreementModal from '../components/AgreementModal';
import {
  FiUser,
  FiGlobe,
  FiShield,
  FiLogOut,
  FiDownload,
  FiTrash2,
  FiCheck,
  FiX
} from 'react-icons/fi';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { requiresAgreement } = useAgreement();

  // Hooks siempre al nivel superior
  const [settings, setSettings] = useState({
    language: 'es',
    region: 'PE',
    notifications: {
      commissions: true,
      leads: true,
      companies: true,
      messages: true
    }
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Control de acceso - bloquear si requiere acuerdo
  if (requiresAgreement) {
    return <AgreementModal isOpen={true} onClose={() => { }} />;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleDownloadData = () => {
    // TODO: Implement GDPR data download
    console.log('Downloading user data...');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Deleting account...');
    setShowDeleteConfirm(false);
  };

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' }
  ];

  const regions = [
    { code: 'PE', name: 'Perú' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CL', name: 'Chile' },
    { code: 'MX', name: 'México' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Cuenta</h1>
        <p className="text-gray-600 mt-2">Gestiona tus preferencias y configuración</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <FiUser className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Información de Cuenta</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={user?.photo_url || '/default-avatar.png'}
                  alt={user?.display_name || 'Usuario'}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{user?.display_name}</h4>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-green-600 flex items-center space-x-1 mt-1">
                    <FiCheck className="w-4 h-4" />
                    <span>Cuenta verificada</span>
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Nota:</strong> Tu información de perfil se sincroniza automáticamente
                  con tu cuenta de Google. Los cambios deben realizarse desde tu cuenta de Google.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Language & Region */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <FiGlobe className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Idioma y Región</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Región
                </label>
                <select
                  value={settings.region}
                  onChange={(e) => setSettings(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {regions.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <FiShield className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            </div>

            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key === 'commissions' && 'Comisiones pagadas'}
                      {key === 'leads' && 'Nuevos leads'}
                      {key === 'companies' && 'Actividad de empresas'}
                      {key === 'messages' && 'Mensajes'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {key === 'commissions' && 'Notificaciones cuando recibas comisiones'}
                      {key === 'leads' && 'Alertas de nuevas oportunidades'}
                      {key === 'companies' && 'Actualizaciones de tus empresas'}
                      {key === 'messages' && 'Nuevos mensajes y menciones'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [key]: !value
                      }
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Connected Apps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Apps Conectadas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">⚖️</span>
                  <span className="text-sm">LEGALTY</span>
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💼</span>
                  <span className="text-sm">WE CONSULTING</span>
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🌐</span>
                  <span className="text-sm">PORTALES</span>
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
            </div>
            <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm">
              Ver todas las aplicaciones
            </button>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadData}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiDownload className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-900">Descargar mis datos</span>
                  <p className="text-xs text-gray-500">Exportar información personal</p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiLogOut className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-900">Cerrar sesión</span>
                  <p className="text-xs text-gray-500">Salir de tu cuenta</p>
                </div>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-red-50 transition-colors"
              >
                <FiTrash2 className="w-5 h-5 text-red-600" />
                <div>
                  <span className="font-medium text-red-900">Eliminar cuenta</span>
                  <p className="text-xs text-red-500">Acción irreversible</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="text-center">
              <FiTrash2 className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Eliminar cuenta?
              </h3>
              <p className="text-gray-600 mb-6">
                Esta acción es irreversible. Se eliminarán todos tus datos,
                empresas, referidos y configuraciones.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};