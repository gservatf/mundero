import React from "react";
import { motion } from "framer-motion";
import { Zap, Star } from "lucide-react";

interface StreakBarProps {
  streak: number;
  maxStreak?: number;
  showAnimation?: boolean;
  className?: string;
}

export const StreakBar: React.FC<StreakBarProps> = ({
  streak,
  maxStreak = 10,
  showAnimation = true,
  className = "",
}) => {
  const percentage = Math.min((streak / maxStreak) * 100, 100);
  const isMaxStreak = streak >= maxStreak;

  const getStreakMessage = () => {
    if (streak === 0) return "¡Comienza tu racha!";
    if (streak < 3) return "¡Buen comienzo!";
    if (streak < 5) return "¡Excelente ritmo!";
    if (streak < 8) return "¡Increíble progreso!";
    if (streak < maxStreak) return "¡Casi en la zona!";
    return "¡RACHA PERFECTA!";
  };

  const getStreakColor = () => {
    if (streak < 3) return "from-blue-400 to-blue-600";
    if (streak < 5) return "from-purple-400 to-purple-600";
    if (streak < 8) return "from-orange-400 to-orange-600";
    return "from-yellow-400 to-yellow-600";
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={
              showAnimation && streak > 0
                ? {
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            {isMaxStreak ? (
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            ) : (
              <Zap className="w-5 h-5 text-blue-500" />
            )}
          </motion.div>

          <span className="text-sm font-medium text-gray-700">
            Racha de respuestas
          </span>
        </div>

        <div className="flex items-center gap-1">
          <motion.span
            className={`text-lg font-bold ${
              isMaxStreak ? "text-yellow-600" : "text-blue-600"
            }`}
            animate={showAnimation && streak > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {streak}
          </motion.span>
          <span className="text-sm text-gray-500">/ {maxStreak}</span>
        </div>
      </div>

      {/* Streak Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${getStreakColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Streak Indicators */}
        <div className="absolute top-0 w-full h-2 flex items-center">
          {Array.from({ length: maxStreak - 1 }).map((_, index) => (
            <div
              key={index}
              className="absolute w-px h-full bg-white/30"
              style={{ left: `${((index + 1) / maxStreak) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Streak Message */}
      <motion.div
        className="mt-2 text-center"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        key={streak} // Re-animate when streak changes
      >
        <span
          className={`text-sm font-medium ${
            isMaxStreak ? "text-yellow-600" : "text-blue-600"
          }`}
        >
          {getStreakMessage()}
        </span>

        {isMaxStreak && (
          <motion.div
            className="flex items-center justify-center gap-1 mt-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -3, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Streak Bonus */}
      {streak > 0 && streak % 5 === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-800 font-medium">
              ¡Bonus de racha! +{Math.floor(streak / 5)} puntos extra
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
