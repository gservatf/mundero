// Componente de Barra de Progreso de Reputación - Versión Animada
import React from "react";
import { motion } from "framer-motion";

interface ReputationBarProps {
  points: number;
  level: number;
  nextLevelPoints?: number;
  currentLevelPoints?: number;
  className?: string;
}

export function ReputationBar({
  points,
  level,
  nextLevelPoints,
  currentLevelPoints = 0,
  className = "",
}: ReputationBarProps) {
  // Calcular progreso al siguiente nivel
  const calculateProgress = () => {
    if (!nextLevelPoints) {
      return { percentage: 100, pointsNeeded: 0 };
    }

    const pointsInCurrentLevel = points - currentLevelPoints;
    const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;
    const percentage = Math.min(
      (pointsInCurrentLevel / pointsNeededForNextLevel) * 100,
      100,
    );
    const pointsNeeded = Math.max(nextLevelPoints - points, 0);

    return { percentage, pointsNeeded };
  };

  const { percentage, pointsNeeded } = calculateProgress();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header con puntos actuales */}
      <div className="flex justify-between items-center text-sm">
        <motion.span
          className="font-medium text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {points.toLocaleString()} puntos
        </motion.span>
        {nextLevelPoints && (
          <motion.span
            className="text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {pointsNeeded > 0
              ? `${pointsNeeded.toLocaleString()} para siguiente nivel`
              : "¡Nivel máximo alcanzado!"}
          </motion.span>
        )}
      </div>

      {/* Barra de progreso animada */}
      <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-3 relative overflow-hidden">
        <motion.div
          className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.span
          className="absolute inset-0 text-[10px] text-white text-center font-medium flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {Math.round(percentage)}%
        </motion.span>
      </div>

      {/* Etiquetas de nivel */}
      {nextLevelPoints && (
        <motion.div
          className="flex justify-between text-xs text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span>Nivel {level}</span>
          <span>Nivel {level + 1}</span>
        </motion.div>
      )}
    </div>
  );
}
