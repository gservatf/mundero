// Extensión de MessageCard con indicadores de reputación simplificada
// Muestra nivel, insignias y efectos básicos basados en la reputación del usuario

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FiStar, FiAward, FiZap, FiShield, FiHeart } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";
import { useReputation } from "../../user-panel/reputation/useReputation";

interface MessageCardProps {
  messageId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  className?: string;
}

// Iconos de insignias básicos
const BADGE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  first_post: FiZap,
  social_butterfly: FiHeart,
  community_builder: FiShield,
  helpful: FiAward,
  expert: FaCrown,
  legend: FiStar,
};

export const MessageCard: React.FC<MessageCardProps> = ({
  messageId,
  senderId,
  senderName,
  senderAvatar,
  content,
  timestamp,
  isOwn,
  className = "",
}) => {
  const { data: userReputation, loading } = useReputation(senderId);

  const shouldShowReputationInfo = !loading && userReputation && !isOwn;
  const userLevel = userReputation?.level || 1;
  const userPoints = userReputation?.totalPoints || 0;

  // Color del borde basado en nivel
  const borderColor = useMemo(() => {
    return `hsl(${userLevel * 36}, 70%, 60%)`;
  }, [userLevel]);

  // Efecto de halo para niveles altos
  const hasHalo = userLevel >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative ${className}`}
    >
      {/* Mensaje base */}
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm relative ${
          isOwn
            ? "ml-auto bg-blue-600 text-white"
            : `mr-auto bg-gray-100 text-gray-900 ${shouldShowReputationInfo ? "border-l-4" : ""}`
        }`}
        style={{
          borderLeftColor: shouldShowReputationInfo ? borderColor : undefined,
        }}
      >
        {/* Halo animado para usuarios de alto nivel */}
        {shouldShowReputationInfo && hasHalo && (
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg blur-sm opacity-30"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.01, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Header con información de reputación */}
        {!isOwn && shouldShowReputationInfo && (
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center space-x-2">
              {/* Avatar con indicador de nivel */}
              <div className="relative">
                <img
                  src={senderAvatar || "/default-avatar.png"}
                  alt={senderName}
                  className="w-6 h-6 rounded-full"
                />
                {userLevel >= 5 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <FaCrown className="w-2 h-2 text-yellow-800" />
                  </div>
                )}
              </div>

              {/* Nombre y nivel */}
              <div className="flex items-center space-x-1">
                <span className="font-medium text-xs text-gray-600">
                  {senderName}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold"
                  style={{ backgroundColor: borderColor }}
                >
                  Nv.{userLevel}
                </span>
              </div>
            </div>

            {/* Indicador de puntos */}
            <div className="text-xs text-gray-500">{userPoints} pts</div>
          </div>
        )}

        {/* Contenido del mensaje */}
        <div className="relative z-10">{content}</div>

        {/* Timestamp */}
        <div
          className={`text-xs mt-1 relative z-10 ${
            isOwn ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {timestamp}
        </div>

        {/* Partículas para usuarios de muy alto nivel */}
        {shouldShowReputationInfo && userLevel >= 8 && (
          <>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full pointer-events-none"
                style={{
                  top: `${20 + i * 20}%`,
                  left: `${10 + i * 30}%`,
                }}
                animate={{
                  y: [-2, -8, -2],
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Tooltip expandido en hover */}
      {shouldShowReputationInfo && (
        <div className="absolute left-full ml-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]"
          >
            {/* Header del tooltip */}
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={senderAvatar || "/default-avatar.png"}
                alt={senderName}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {senderName}
                </p>
                <p className="text-xs text-gray-500">Nivel {userLevel}</p>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <p className="font-medium text-gray-900">{userPoints}</p>
                <p className="text-gray-500">Puntos</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  {userReputation?.badges?.length || 0}
                </p>
                <p className="text-gray-500">Insignias</p>
              </div>
            </div>

            {/* Progreso visual simple */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Progreso</span>
                <span className="text-gray-900">{userLevel}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(userLevel / 10) * 100}%`,
                    backgroundColor: borderColor,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
