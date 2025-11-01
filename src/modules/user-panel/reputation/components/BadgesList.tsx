// Componente de Lista de Insignias - Versión Animada Premium
import React from "react";
import { motion } from "framer-motion";
import { DEFAULT_BADGES } from "../types";

interface BadgesListProps {
  badges: string[];
  maxVisible?: number;
  size?: "small" | "medium" | "large";
  className?: string;
}

export function BadgesList({
  badges,
  maxVisible = 6,
  size = "medium",
  className = "",
}: BadgesListProps) {
  const visibleBadges = badges.slice(0, maxVisible);
  const hiddenCount = Math.max(badges.length - maxVisible, 0);

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-6 h-6 text-xs";
      case "large":
        return "w-10 h-10 text-lg";
      default:
        return "w-8 h-8 text-sm";
    }
  };

  const getBadgeInfo = (badgeId: string) => {
    return (
      DEFAULT_BADGES.find((b) => b.id === badgeId) || {
        id: badgeId,
        name: badgeId,
        icon: "🏆",
        minPoints: 0,
        description: "Insignia especial",
      }
    );
  };

  if (badges.length === 0) {
    return (
      <motion.div
        className={`text-gray-500 dark:text-gray-400 text-sm italic ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Sin insignias aún
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex flex-wrap gap-2 items-center ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { staggerChildren: 0.1, delayChildren: 0.3 },
        },
      }}
    >
      {visibleBadges.map((badgeId, index) => {
        const badgeInfo = getBadgeInfo(badgeId);

        return (
          <motion.div
            key={badgeId}
            className={`
                            ${getSizeClasses()}
                            bg-gradient-to-r from-yellow-400 to-orange-500 
                            rounded-full flex items-center justify-center 
                            text-white font-bold shadow-md hover:shadow-lg 
                            transition-all duration-200 cursor-help
                            border-2 border-white dark:border-neutral-700
                            relative overflow-hidden
                        `}
            title={`${badgeInfo.name} - ${badgeInfo.description || "Insignia ganada"}`}
            variants={{
              hidden: { opacity: 0, scale: 0, rotate: -180 },
              visible: {
                opacity: 1,
                scale: 1,
                rotate: 0,
                transition: {
                  duration: 0.6,
                  type: "spring",
                  stiffness: 200,
                  delay: index * 0.05,
                },
              },
            }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Brillo rotativo sutil */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300/30 via-transparent to-orange-300/30"
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 8,
                ease: "linear",
                delay: index * 0.5,
              }}
            />

            <motion.span
              className="drop-shadow-sm relative z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2 + index * 0.05,
                type: "spring",
                stiffness: 300,
              }}
            >
              {badgeInfo.icon}
            </motion.span>
          </motion.div>
        );
      })}

      {/* Contador de insignias ocultas animado */}
      {hiddenCount > 0 && (
        <motion.div
          className={`
                        ${getSizeClasses()}
                        bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center 
                        text-white font-bold text-xs border-2 border-white dark:border-neutral-700
                    `}
          title={`${hiddenCount} insignias más`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: visibleBadges.length * 0.05 + 0.2,
            type: "spring",
            stiffness: 200,
          }}
          whileHover={{ scale: 1.1 }}
        >
          +{hiddenCount}
        </motion.div>
      )}

      {/* Mensaje motivacional animado */}
      {badges.length === 1 && (
        <motion.span
          className="text-xs text-gray-500 dark:text-gray-400 ml-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          ¡Primera insignia! 🎉
        </motion.span>
      )}
    </motion.div>
  );
}
