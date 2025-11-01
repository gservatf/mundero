// Dashboard de Seguridad de Reputación
// Panel para administradores con monitoreo en tiempo real

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiClock,
  FiUsers,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiSettings,
} from "react-icons/fi";
import {
  reputationSecurityManager,
  useSecurityStatus,
} from "../security/ReputationSecurity";

interface SecurityAlert {
  id: string;
  type: "fraud" | "spam" | "quarantine" | "review";
  userId: string;
  action: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  issues: string[];
  timestamp: number;
  status: "pending" | "reviewed" | "resolved";
}

interface SecurityMetrics {
  totalValidations: number;
  blockedActions: number;
  quarantinedUsers: number;
  flaggedActions: number;
  successRate: number;
  avgResponseTime: number;
}

export const SecurityDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalValidations: 0,
    blockedActions: 0,
    quarantinedUsers: 0,
    flaggedActions: 0,
    successRate: 98.5,
    avgResponseTime: 45,
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1h" | "24h" | "7d" | "30d"
  >("24h");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const securityStatus = useSecurityStatus();

  // Simular datos de alertas (en un sistema real vendrían de la API)
  useEffect(() => {
    const mockAlerts: SecurityAlert[] = [
      {
        id: "1",
        type: "fraud",
        userId: "user123",
        action: "post_like",
        riskLevel: "high",
        issues: [
          'Demasiadas acciones del tipo "post_like" en la última hora (15)',
          "Velocidad de acciones sospechosamente alta",
        ],
        timestamp: Date.now() - 30 * 60 * 1000,
        status: "pending",
      },
      {
        id: "2",
        type: "spam",
        userId: "user456",
        action: "post_comment",
        riskLevel: "medium",
        issues: ["Metadatos idénticos repetidos múltiples veces"],
        timestamp: Date.now() - 45 * 60 * 1000,
        status: "reviewed",
      },
    ];
    setAlerts(mockAlerts);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular actualización de datos
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: "resolved" } : alert,
      ),
    );
  };

  const exportSecurityReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      timeframe: selectedTimeframe,
      metrics,
      alerts: alerts.filter((alert) => alert.status === "pending"),
      securityStatus,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <FiCheck className="w-4 h-4 text-green-600" />;
      case "reviewed":
        return <FiEye className="w-4 h-4 text-blue-600" />;
      default:
        return <FiClock className="w-4 h-4 text-orange-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiShield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard de Seguridad
            </h1>
            <p className="text-gray-600">
              Monitoreo en tiempo real del sistema de reputación
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Actualizar</span>
          </button>

          <button
            onClick={exportSecurityReport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <FiDownload className="w-4 h-4" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border-l-4 ${
          securityStatus.isRunning
            ? "bg-green-50 border-green-400"
            : "bg-red-50 border-red-400"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                securityStatus.isRunning ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="font-medium">
              Estado del Sistema:{" "}
              {securityStatus.isRunning ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Cola: {securityStatus.queueSize} | Usuarios en caché:{" "}
            {securityStatus.cachedUsers}
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Validaciones Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalValidations.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiShield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Acciones Bloqueadas</p>
              <p className="text-2xl font-bold text-red-600">
                {metrics.blockedActions}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-green-600">
                {metrics.successRate}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiempo Respuesta</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.avgResponseTime}ms
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <FiClock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Alertas de Seguridad
            </h2>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {alerts.filter((a) => a.status === "pending").length} pendientes
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <FiAlertTriangle
                        className={`w-5 h-5 ${
                          alert.riskLevel === "critical"
                            ? "text-red-600"
                            : alert.riskLevel === "high"
                              ? "text-orange-600"
                              : alert.riskLevel === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                        }`}
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">
                          Usuario: {alert.userId}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${getRiskColor(alert.riskLevel)}`}
                        >
                          {alert.riskLevel.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {alert.action}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {alert.issues.map((issue, i) => (
                          <p key={i} className="text-sm text-gray-600">
                            • {issue}
                          </p>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusIcon(alert.status)}

                    {alert.status === "pending" && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Resolver
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {alerts.length === 0 && (
            <div className="p-12 text-center">
              <FiCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">
                No hay alertas de seguridad pendientes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-sm border overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración de Seguridad
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. acciones por hora
                  </label>
                  <input
                    type="number"
                    defaultValue={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Umbral de riesgo alto
                  </label>
                  <input
                    type="number"
                    defaultValue={80}
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooldown (segundos)
                  </label>
                  <input
                    type="number"
                    defaultValue={30}
                    min={5}
                    max={300}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notificaciones automáticas
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="critical">Solo críticas</option>
                    <option value="high">Altas y críticas</option>
                    <option value="medium">Medias y superiores</option>
                    <option value="all">Todas</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityDashboard;
