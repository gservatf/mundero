import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiSettings,
  FiActivity,
  FiCheck,
  FiAlertTriangle,
  FiX,
  FiRefreshCw,
  FiEye,
} from "react-icons/fi";
import { useMockData } from "../hooks/useMockData";
import toast from "react-hot-toast";

const IntegrationHub = () => {
  const { integrations, webhookLogs } = useMockData();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null,
  );
  const [showLogs, setShowLogs] = useState(false);

  const handleSync = (integrationId: string) => {
    toast.success("Sincronización iniciada");
  };

  const handleToggleStatus = (integrationId: string) => {
    toast.success("Estado de integración actualizado");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case "warning":
        return <FiAlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <FiX className="w-4 h-4 text-red-500" />;
      default:
        return <FiActivity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Hub de Integraciones
          </h3>
          <p className="text-sm text-gray-600">
            Monitorea y gestiona las conexiones con aplicaciones externas
          </p>
        </div>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FiEye className="w-4 h-4" />
          <span>{showLogs ? "Ocultar Logs" : "Ver Logs"}</span>
        </button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${integration.color}`}
                >
                  <span className="text-white font-bold text-lg">
                    {integration.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {integration.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    v{integration.version}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {getStatusIcon(integration.status)}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}
                >
                  {integration.status === "active"
                    ? "Activo"
                    : integration.status === "warning"
                      ? "Advertencia"
                      : "Error"}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">URL Base:</span>
                <span className="text-gray-900 font-mono text-xs">
                  {integration.baseUrl}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Última sincronización:</span>
                <span className="text-gray-900">{integration.lastSync}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Webhooks activos:</span>
                <span className="text-gray-900">
                  {integration.webhooks.length}
                </span>
              </div>
            </div>

            {/* Webhooks List */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Webhooks configurados:
              </p>
              <div className="flex flex-wrap gap-1">
                {integration.webhooks.map((webhook, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                  >
                    {webhook}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleSync(integration.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Sincronizar</span>
              </button>

              <button
                onClick={() => setSelectedIntegration(integration.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <FiSettings className="w-4 h-4" />
                <span>Configurar</span>
              </button>

              <button
                onClick={() => handleToggleStatus(integration.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  integration.status === "active"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {integration.status === "active" ? "Pausar" : "Activar"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Webhook Logs */}
      {showLogs && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white rounded-lg border"
        >
          <div className="p-4 border-b">
            <h4 className="font-medium text-gray-900">Logs de Webhooks</h4>
            <p className="text-sm text-gray-600">
              Historial de eventos y sincronizaciones
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y">
              {webhookLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          log.type === "success"
                            ? "bg-green-100"
                            : log.type === "warning"
                              ? "bg-yellow-100"
                              : log.type === "error"
                                ? "bg-red-100"
                                : "bg-blue-100"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.type === "success"
                              ? "bg-green-500"
                              : log.type === "warning"
                                ? "bg-yellow-500"
                                : log.type === "error"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                          }`}
                        ></span>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {log.event}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getLogTypeColor(log.type)}`}
                          >
                            {log.type}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">{log.message}</p>

                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>App: {log.app}</span>
                          <span>•</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {log.data && (
                      <button className="text-gray-400 hover:text-gray-600">
                        <FiEye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Configuration Modal */}
      {selectedIntegration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Configuración de Integración
              </h3>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Integration Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Detalles de la Integración
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">
                      {
                        integrations.find((i) => i.id === selectedIntegration)
                          ?.name
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versión:</span>
                    <span className="font-medium">
                      v
                      {
                        integrations.find((i) => i.id === selectedIntegration)
                          ?.version
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        integrations.find((i) => i.id === selectedIntegration)
                          ?.status || "",
                      )}`}
                    >
                      {
                        integrations.find((i) => i.id === selectedIntegration)
                          ?.status
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* API Configuration */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Configuración API
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Base
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={
                        integrations.find((i) => i.id === selectedIntegration)
                          ?.baseUrl || ""
                      }
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timeout (segundos)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="30"
                    />
                  </div>
                </div>
              </div>

              {/* Webhook Configuration */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Configuración de Webhooks
                </h4>
                <div className="space-y-3">
                  {integrations
                    .find((i) => i.id === selectedIntegration)
                    ?.webhooks.map((webhook, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {webhook}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            Activo
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <FiSettings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t">
              <button
                onClick={() => setSelectedIntegration(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  toast.success("Configuración guardada");
                  setSelectedIntegration(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default IntegrationHub;
