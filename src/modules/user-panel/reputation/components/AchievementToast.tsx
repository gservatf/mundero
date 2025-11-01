// AchievementToast - Notificaciones animadas para logros de reputación
// Muestra toasts elegantes con animaciones tipo NFT cuando se obtienen nuevos logros

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiStar,
  FiAward,
  FiZap,
  FiShield,
  FiHeart,
  FiX,
  FiTrendingUp,
} from "react-icons/fi";
import { FaCrown, FaGem } from "react-icons/fa";
import { Badge, ReputationActionType } from "../types";

interface Achievement {
  id: string;
  type: "level_up" | "badge_earned" | "milestone" | "streak";
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points?: number;
  level?: number;
  badge?: Badge;
  action?: ReputationActionType;
  timestamp: number;
}

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

// Iconos por tipo de logro
const ACHIEVEMENT_ICONS = {
  level_up: FiTrendingUp,
  badge_earned: FiAward,
  milestone: FiStar,
  streak: FiZap,
};

// Iconos por rareza
const RARITY_ICONS = {
  common: FiStar,
  rare: FiAward,
  epic: FaCrown,
  legendary: FaGem,
};

// Colores por rareza
const RARITY_COLORS = {
  common: {
    bg: "from-gray-400 to-gray-600",
    text: "text-gray-800",
    border: "border-gray-400",
    glow: "shadow-gray-400/30",
  },
  rare: {
    bg: "from-blue-400 to-blue-600",
    text: "text-blue-800",
    border: "border-blue-400",
    glow: "shadow-blue-400/30",
  },
  epic: {
    bg: "from-purple-400 to-purple-600",
    text: "text-purple-800",
    border: "border-purple-400",
    glow: "shadow-purple-400/30",
  },
  legendary: {
    bg: "from-yellow-400 via-orange-500 to-red-600",
    text: "text-yellow-800",
    border: "border-yellow-400",
    glow: "shadow-yellow-400/50",
  },
};

// Partículas por rareza
const PARTICLE_COUNTS = {
  common: 3,
  rare: 5,
  epic: 8,
  legendary: 12,
};

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showParticles, setShowParticles] = useState(true);

  const colors = RARITY_COLORS[achievement.rarity];
  const particleCount = PARTICLE_COUNTS[achievement.rarity];
  const IconComponent =
    achievement.icon || ACHIEVEMENT_ICONS[achievement.type] || FiStar;
  const RarityIcon = RARITY_ICONS[achievement.rarity];

  // Auto-close
  useEffect(() => {
    if (!autoClose) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoClose, duration]);

  // Ocultar partículas después de la animación inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowParticles(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getMotivationalText = () => {
    switch (achievement.rarity) {
      case "legendary":
        return "¡Increíble logro! 🎆";
      case "epic":
        return "¡Excelente trabajo! ⭐";
      case "rare":
        return "¡Bien hecho! 🎉";
      default:
        return "¡Logro desbloqueado! 🎯";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.6,
          }}
          className="fixed top-4 right-4 z-[9999] max-w-sm"
        >
          {/* Container principal con efectos */}
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className={`absolute -inset-2 bg-gradient-to-r ${colors.bg} rounded-xl blur-lg ${colors.glow}`}
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Toast principal */}
            <motion.div
              className={`relative bg-white rounded-xl shadow-2xl border-2 ${colors.border} overflow-hidden`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Header con fondo degradado */}
              <div
                className={`bg-gradient-to-r ${colors.bg} p-4 text-white relative overflow-hidden`}
              >
                {/* Partículas de celebración */}
                {showParticles && (
                  <>
                    {[...Array(particleCount)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [-10, -30, -10],
                          x: [0, Math.random() * 20 - 10, 0],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.5, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.1,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </>
                )}

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    {/* Icono principal animado */}
                    <motion.div
                      className="relative"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: 2,
                        ease: "easeInOut",
                      }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />

                      {/* Brillo en el icono */}
                      <motion.div
                        className="absolute inset-0 bg-white rounded-full opacity-30"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>

                    <div>
                      <h3 className="font-bold text-lg">{achievement.title}</h3>
                      <p className="text-sm opacity-90">
                        {getMotivationalText()}
                      </p>
                    </div>
                  </div>

                  {/* Botón cerrar */}
                  <motion.button
                    onClick={handleClose}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiX className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <p className="text-gray-700 text-sm mb-3">
                  {achievement.description}
                </p>

                {/* Información adicional */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Puntos ganados */}
                    {achievement.points && (
                      <div className="flex items-center space-x-1">
                        <FiZap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-800">
                          +{achievement.points} pts
                        </span>
                      </div>
                    )}

                    {/* Nuevo nivel */}
                    {achievement.level && (
                      <div className="flex items-center space-x-1">
                        <FiTrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-800">
                          Nivel {achievement.level}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Indicador de rareza */}
                  <div className="flex items-center space-x-1">
                    <RarityIcon className={`w-4 h-4 ${colors.text}`} />
                    <span
                      className={`text-xs font-medium capitalize ${colors.text}`}
                    >
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de progreso para auto-close */}
              {autoClose && (
                <motion.div
                  className={`h-1 bg-gradient-to-r ${colors.bg}`}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                  style={{ transformOrigin: "left" }}
                />
              )}
            </motion.div>

            {/* Efectos adicionales para logros legendarios */}
            {achievement.rarity === "legendary" && showParticles && (
              <motion.div
                className="absolute -inset-4 pointer-events-none"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      top: "50%",
                      left: "50%",
                      transformOrigin: `${Math.cos((i * 45 * Math.PI) / 180) * 80}px ${Math.sin((i * 45 * Math.PI) / 180) * 80}px`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para gestionar múltiples toasts de logros
export const useAchievementToasts = () => {
  const [toasts, setToasts] = useState<Achievement[]>([]);

  const showAchievement = (achievement: Achievement) => {
    setToasts((prev) => [
      ...prev,
      { ...achievement, id: Date.now().toString() },
    ]);
  };

  const hideAchievement = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    showAchievement,
    hideAchievement,
    clearAll,
  };
};

// Contenedor para renderizar todos los toasts
export const AchievementToastContainer: React.FC<{
  toasts: Achievement[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{
              opacity: 1,
              y: index * 10, // Stack toasts
            }}
            exit={{ opacity: 0, y: -50 }}
            className="pointer-events-auto"
          >
            <AchievementToast
              achievement={achievement}
              onClose={() => onClose(achievement.id)}
              autoClose={true}
              duration={5000}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Funciones utilitarias para crear logros comunes
export const createLevelUpAchievement = (
  newLevel: number,
  points: number,
): Achievement => ({
  id: `level_up_${newLevel}_${Date.now()}`,
  type: "level_up",
  title: `¡Nivel ${newLevel} Alcanzado!`,
  description: `Has alcanzado el nivel ${newLevel}. ¡Sigue así para desbloquear más beneficios!`,
  color: `hsl(${newLevel * 36}, 70%, 60%)`,
  rarity:
    newLevel >= 8
      ? "legendary"
      : newLevel >= 5
        ? "epic"
        : newLevel >= 3
          ? "rare"
          : "common",
  points,
  level: newLevel,
  timestamp: Date.now(),
});

export const createBadgeAchievement = (badge: Badge): Achievement => ({
  id: `badge_${badge.id}_${Date.now()}`,
  type: "badge_earned",
  title: `¡Nueva Insignia: ${badge.name}!`,
  description: badge.description || "Has desbloqueado una nueva insignia",
  color: "#8B5CF6",
  rarity: "rare",
  badge,
  timestamp: Date.now(),
});

export const createMilestoneAchievement = (
  milestone: string,
  description: string,
): Achievement => ({
  id: `milestone_${milestone}_${Date.now()}`,
  type: "milestone",
  title: `¡Hito Alcanzado!`,
  description,
  color: "#10B981",
  rarity: "epic",
  timestamp: Date.now(),
});
