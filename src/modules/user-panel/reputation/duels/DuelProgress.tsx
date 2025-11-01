// Componente de progreso detallado para duelos activos
// Incluye gráficos en tiempo real, milestones y estadísticas

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiAward,
  FiBarChart,
  FiActivity,
  FiZap,
  FiTrendingDown,
} from "react-icons/fi";
import { Duel, METRIC_CONFIG } from "./types";
import { useDuels } from "./useDuels";

interface DuelProgressProps {
  duel: Duel;
  userId?: string;
  showDetailedStats?: boolean;
}

export const DuelProgress: React.FC<DuelProgressProps> = ({
  duel,
  userId,
  showDetailedStats = false,
}) => {
  const { getDuelProgress, getTimeRemaining } = useDuels();
  const [animationKey, setAnimationKey] = useState(0);

  const challenger = duel.progress[duel.challengerId];
  const opponent = duel.progress[duel.opponentId];
  const timeRemaining = getTimeRemaining(duel);
  const metric = METRIC_CONFIG[duel.metric];

  // Trigger re-animation when progress changes
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [challenger?.current, opponent?.current]);

  const getProgressPercentage = (progress: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((progress / total) * 100, 100);
  };

  const maxProgress = Math.max(
    challenger?.current || 0,
    opponent?.current || 0,
    1,
  );
  const challengerPercentage = getProgressPercentage(
    challenger?.current || 0,
    maxProgress,
  );
  const opponentPercentage = getProgressPercentage(
    opponent?.current || 0,
    maxProgress,
  );

  const getLeadIndicator = () => {
    const challengerScore = challenger?.current || 0;
    const opponentScore = opponent?.current || 0;

    if (challengerScore === opponentScore) {
      return {
        type: "tie",
        message: "⚖️ Empate perfecto",
        color: "text-gray-600",
      };
    }

    const leader = challengerScore > opponentScore ? "challenger" : "opponent";
    const difference = Math.abs(challengerScore - opponentScore);

    if (difference === 1) {
      return {
        type: leader,
        message: `🔥 Liderazgo por 1 ${metric.name.toLowerCase()}`,
        color: leader === "challenger" ? "text-blue-600" : "text-purple-600",
      };
    }

    if (difference >= 5) {
      return {
        type: leader,
        message: `🚀 Dominando con +${difference}`,
        color: leader === "challenger" ? "text-blue-600" : "text-purple-600",
      };
    }

    return {
      type: leader,
      message: `💪 Adelante por ${difference}`,
      color: leader === "challenger" ? "text-blue-600" : "text-purple-600",
    };
  };

  const getVelocityIndicator = (milestones: number[]) => {
    if (milestones.length < 2) return null;

    const recent = milestones.slice(-3); // Últimos 3 puntos
    const velocity =
      recent.length > 1 ? recent[recent.length - 1] - recent[0] : 0;

    if (velocity > 5)
      return { icon: "🚀", text: "Acelerando", color: "text-green-600" };
    if (velocity > 2)
      return { icon: "⚡", text: "Ritmo alto", color: "text-yellow-600" };
    if (velocity > 0)
      return { icon: "📈", text: "Progreso", color: "text-blue-600" };
    if (velocity === 0)
      return { icon: "⏸️", text: "Sin cambios", color: "text-gray-600" };
    return { icon: "📉", text: "Desacelerando", color: "text-red-600" };
  };

  const getPredictedWinner = () => {
    if (!challenger?.milestones || !opponent?.milestones) return null;

    const challengerVelocity =
      challenger.milestones.length > 1
        ? (challenger.current - challenger.milestones[0]) /
          challenger.milestones.length
        : 0;
    const opponentVelocity =
      opponent.milestones.length > 1
        ? (opponent.current - opponent.milestones[0]) /
          opponent.milestones.length
        : 0;

    if (Math.abs(challengerVelocity - opponentVelocity) < 0.1) {
      return { prediction: "tie", confidence: 50 };
    }

    const winner =
      challengerVelocity > opponentVelocity ? "challenger" : "opponent";
    const velocityDiff = Math.abs(challengerVelocity - opponentVelocity);
    const confidence = Math.min(50 + velocityDiff * 10, 95);

    return { prediction: winner, confidence: Math.round(confidence) };
  };

  const leadIndicator = getLeadIndicator();
  const challengerVelocity = getVelocityIndicator(challenger?.milestones || []);
  const opponentVelocity = getVelocityIndicator(opponent?.milestones || []);
  const prediction = getPredictedWinner();

  if (duel.status !== "active") {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiBarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>El duelo no está activo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de progreso */}
      <div className="text-center">
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full ${leadIndicator.color} bg-opacity-10 border border-current border-opacity-20`}
        >
          <span className="font-medium">{leadIndicator.message}</span>
        </div>
      </div>

      {/* Tiempo restante */}
      <div className="text-center">
        <div
          className={`text-2xl font-bold ${
            timeRemaining.hours < 1
              ? "text-red-600"
              : timeRemaining.hours < 6
                ? "text-yellow-600"
                : "text-green-600"
          }`}
        >
          {timeRemaining.hours}h {timeRemaining.minutes}m
        </div>
        <div className="text-sm text-gray-600">restantes</div>

        {/* Barra de tiempo */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${timeRemaining.percentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-2 rounded-full ${
              timeRemaining.percentage > 75
                ? "bg-red-500"
                : timeRemaining.percentage > 50
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
          />
        </div>
      </div>

      {/* Progreso principal */}
      <div className="space-y-4">
        {/* Challenger */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {duel.challengerId.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {duel.challengerId}
                </div>
                {challengerVelocity && (
                  <div
                    className={`text-xs flex items-center ${challengerVelocity.color}`}
                  >
                    <span className="mr-1">{challengerVelocity.icon}</span>
                    {challengerVelocity.text}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {challenger?.current || 0}
              </div>
              <div className="text-xs text-gray-500">
                {metric.name.toLowerCase()}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <motion.div
              key={`challenger-${animationKey}`}
              initial={{ width: 0 }}
              animate={{ width: `${challengerPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full relative overflow-hidden"
            >
              {/* Efecto de brillo */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        {/* VS indicator */}
        <div className="text-center text-gray-400 font-bold">VS</div>

        {/* Opponent */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {duel.opponentId.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {duel.opponentId}
                </div>
                {opponentVelocity && (
                  <div
                    className={`text-xs flex items-center ${opponentVelocity.color}`}
                  >
                    <span className="mr-1">{opponentVelocity.icon}</span>
                    {opponentVelocity.text}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {opponent?.current || 0}
              </div>
              <div className="text-xs text-gray-500">
                {metric.name.toLowerCase()}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <motion.div
              key={`opponent-${animationKey}`}
              initial={{ width: 0 }}
              animate={{ width: `${opponentPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-4 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full relative overflow-hidden"
            >
              {/* Efecto de brillo */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1, delay: 0.7 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Predicción */}
      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔮</span>
              <div>
                <div className="font-medium text-gray-900">Predicción</div>
                <div className="text-sm text-gray-600">
                  Basada en velocidad actual
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">
                {prediction.prediction === "tie"
                  ? "Empate"
                  : prediction.prediction === "challenger"
                    ? "Retador"
                    : "Oponente"}
              </div>
              <div className="text-sm text-gray-600">
                {prediction.confidence}% confianza
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Estadísticas detalladas */}
      {showDetailedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-900 font-medium mb-2">
              📊 Estadísticas del Retador
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Progreso actual:</span>
                <span className="font-medium">{challenger?.current || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Última actualización:</span>
                <span className="text-gray-600">
                  {challenger?.lastUpdated
                    ? new Date(challenger.lastUpdated).toLocaleTimeString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Milestones:</span>
                <span className="text-gray-600">
                  {challenger?.milestones?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-900 font-medium mb-2">
              📊 Estadísticas del Oponente
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Progreso actual:</span>
                <span className="font-medium">{opponent?.current || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Última actualización:</span>
                <span className="text-gray-600">
                  {opponent?.lastUpdated
                    ? new Date(opponent.lastUpdated).toLocaleTimeString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Milestones:</span>
                <span className="text-gray-600">
                  {opponent?.milestones?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone charts (simple visualization) */}
      {showDetailedStats &&
        (challenger?.milestones || opponent?.milestones) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-900 font-medium mb-4 flex items-center">
              <FiActivity className="w-5 h-5 mr-2" />
              Progreso en el Tiempo
            </div>

            <div className="h-32 relative bg-white rounded border">
              <div className="absolute inset-4">
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 opacity-10">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="border border-gray-300" />
                  ))}
                </div>

                {/* Challenger line */}
                {challenger?.milestones && challenger.milestones.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full">
                    <polyline
                      fill="none"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="2"
                      points={challenger.milestones
                        .map((value, index) => {
                          const x =
                            (index / (challenger.milestones.length - 1)) * 100;
                          const y = 100 - (value / maxProgress) * 100;
                          return `${x}%,${y}%`;
                        })
                        .join(" ")}
                    />
                  </svg>
                )}

                {/* Opponent line */}
                {opponent?.milestones && opponent.milestones.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full">
                    <polyline
                      fill="none"
                      stroke="rgb(147, 51, 234)"
                      strokeWidth="2"
                      points={opponent.milestones
                        .map((value, index) => {
                          const x =
                            (index / (opponent.milestones.length - 1)) * 100;
                          const y = 100 - (value / maxProgress) * 100;
                          return `${x}%,${y}%`;
                        })
                        .join(" ")}
                    />
                  </svg>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center mt-2 space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                Retador
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
                Oponente
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default DuelProgress;
