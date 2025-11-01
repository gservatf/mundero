// Componente de Estadísticas de Reputación
// Visualización de datos agregados globales con gráficos

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { statsService, ReputationStats } from "./statsService";
import { REPUTATION_ENABLED } from "./reputationService";
import {
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiActivity,
  FiRefreshCw,
  FiBarChart,
  FiPieChart,
  FiTarget,
} from "react-icons/fi";

export const ReputationStatsComponent: React.FC = () => {
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Cargar estadísticas
  const loadStats = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const newStats = await statsService.getGlobalStats(forceRefresh);
      setStats(newStats);
    } catch (err) {
      console.error("Error loading stats:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    loadStats();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(
        () => {
          loadStats(true);
        },
        5 * 60 * 1000,
      ); // 5 minutos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Formatear números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Obtener color para nivel
  const getLevelColor = (level: number): string => {
    switch (level) {
      case 1:
        return "text-gray-600";
      case 2:
        return "text-green-600";
      case 3:
        return "text-blue-600";
      case 4:
        return "text-purple-600";
      case 5:
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  // Obtener nombre del nivel
  const getLevelName = (level: number): string => {
    const names = [
      "",
      "Explorador",
      "Colaborador",
      "Pro",
      "Embajador",
      "Líder",
    ];
    return names[level] || "Supremo";
  };

  if (!REPUTATION_ENABLED) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
          <FiBarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Estadísticas No Disponibles
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Las estadísticas estarán disponibles cuando se active el sistema de
            reputación.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => loadStats(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <FiBarChart className="w-8 h-8 text-blue-600" />
            <span>Estadísticas de Reputación</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Datos globales del sistema • Actualizado:{" "}
            {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-600 dark:text-gray-400">
              Auto-actualizar
            </span>
          </label>
          <button
            onClick={() => loadStats(true)}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="Actualizar ahora"
          >
            <FiRefreshCw
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </motion.div>

      {/* Métricas principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total de usuarios */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Usuarios
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalUsers)}
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.activeUsersWithReputation} activos
            </span>
          </div>
        </div>

        {/* Nivel promedio */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nivel Promedio
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageLevel}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              De 5 niveles máximo
            </span>
          </div>
        </div>

        {/* Puntos totales */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Puntos Totales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalPointsInSystem)}
              </p>
            </div>
            <FiTarget className="w-8 h-8 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              En todo el sistema
            </span>
          </div>
        </div>

        {/* Insignias otorgadas */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Insignias
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalBadgesAwarded)}
              </p>
            </div>
            <FiAward className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total otorgadas
            </span>
          </div>
        </div>
      </motion.div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de niveles */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-gray-200 dark:border-neutral-700"
        >
          <div className="flex items-center space-x-2 mb-4">
            <FiPieChart className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribución por Niveles
            </h3>
          </div>

          <div className="space-y-3">
            {stats.topLevelDistribution.map((item) => (
              <div
                key={item.level}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                      item.level === 1
                        ? "from-gray-400 to-gray-500"
                        : item.level === 2
                          ? "from-green-400 to-green-500"
                          : item.level === 3
                            ? "from-blue-400 to-blue-500"
                            : item.level === 4
                              ? "from-purple-400 to-purple-500"
                              : "from-yellow-400 to-yellow-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nivel {item.level} - {getLevelName(item.level)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actividad reciente */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-gray-200 dark:border-neutral-700"
        >
          <div className="flex items-center space-x-2 mb-4">
            <FiActivity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Actividad Reciente
            </h3>
          </div>

          <div className="text-center py-8">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats.recentActivityCount}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Acciones en las últimas 24 horas
            </p>
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
                style={{
                  width: `${Math.min((stats.recentActivityCount / Math.max(stats.totalUsers * 0.1, 1)) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Nivel de actividad del sistema
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer con información adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-6 border border-gray-200 dark:border-neutral-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Participación
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.totalUsers > 0
                ? Math.round(
                    (stats.activeUsersWithReputation / stats.totalUsers) * 100,
                  )
                : 0}
              %
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Usuarios con reputación
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Promedio de Insignias
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.activeUsersWithReputation > 0
                ? Math.round(
                    (stats.totalBadgesAwarded /
                      stats.activeUsersWithReputation) *
                      10,
                  ) / 10
                : 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Por usuario activo
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Promedio de Puntos
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.activeUsersWithReputation > 0
                ? Math.round(
                    stats.totalPointsInSystem / stats.activeUsersWithReputation,
                  )
                : 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Por usuario activo
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
