// Componente de Sección de Reputación - Contenedor Animado Premium
import React from "react";
import { motion } from "framer-motion";
import { ReputationBar } from "./ReputationBar";
import { BadgesList } from "./BadgesList";
import { LevelChip } from "./LevelChip";
import { DEFAULT_LEVELS } from "../types";

interface ReputationSectionProps {
  level: number;
  points: number;
  nextLevelPoints?: number;
  currentLevelPoints?: number;
  badges: string[];
  className?: string;
}

export const ReputationSection: React.FC<ReputationSectionProps> = ({
  level,
  points,
  nextLevelPoints,
  currentLevelPoints,
  badges,
  className = "",
}) => {
  const levelName =
    DEFAULT_LEVELS.find((l) => l.id === level)?.name || "Explorador";

  return (
    <motion.div
      className={`w-full bg-white dark:bg-neutral-900 shadow-md rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 ${className}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header con nivel y puntos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <motion.div
          className="flex items-center space-x-3 mb-2 sm:mb-0"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LevelChip level={level} name={levelName} size="medium" />
        </motion.div>

        <motion.span
          className="text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {points.toLocaleString()} puntos totales
        </motion.span>
      </div>

      {/* Barra de progreso */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <ReputationBar
          level={level}
          points={points}
          nextLevelPoints={nextLevelPoints}
          currentLevelPoints={currentLevelPoints}
        />
      </motion.div>

      {/* Lista de badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <BadgesList badges={badges} size="medium" />
      </motion.div>
    </motion.div>
  );
};
