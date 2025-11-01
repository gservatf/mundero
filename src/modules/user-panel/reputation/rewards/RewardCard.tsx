// Componente de tarjeta de recompensa
// Muestra información detallada y permite el canje

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiAward,
  FiClock,
  FiStar,
  FiShoppingCart,
  FiCheck,
  FiX,
  FiInfo,
  FiPackage,
  FiZap,
} from "react-icons/fi";
import { Reward, UserRewardStats } from "./types";

interface RewardCardProps {
  reward: Reward;
  userStats: UserRewardStats | null;
  canRedeem: boolean;
  redemptionReason?: string;
  onRedeem: () => void;
  viewMode: "grid" | "list";
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  userStats,
  canRedeem,
  redemptionReason,
  onRedeem,
  viewMode,
}) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleRedeem = async () => {
    if (!canRedeem || isRedeeming) return;

    setIsRedeeming(true);
    try {
      await onRedeem();
    } finally {
      setIsRedeeming(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      premium: "from-yellow-400 to-orange-400",
      discounts: "from-green-400 to-blue-400",
      physical: "from-purple-400 to-pink-400",
      digital: "from-blue-400 to-indigo-400",
      experiences: "from-red-400 to-pink-400",
      badges: "from-indigo-400 to-purple-400",
      features: "from-teal-400 to-cyan-400",
    };
    return (
      colors[category as keyof typeof colors] || "from-gray-400 to-gray-500"
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "premium_features":
        return <FiZap className="w-4 h-4" />;
      case "discount_code":
        return <FiShoppingCart className="w-4 h-4" />;
      case "physical_item":
        return <FiPackage className="w-4 h-4" />;
      case "badge":
        return <FiAward className="w-4 h-4" />;
      default:
        return <FiAward className="w-4 h-4" />;
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div
            className={`w-16 h-16 bg-gradient-to-br ${getCategoryColor(reward.category)} rounded-xl flex items-center justify-center text-2xl shadow-lg`}
          >
            {reward.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {reward.title}
              </h3>
              {reward.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                  Destacado
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {reward.description}
            </p>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                {getTypeIcon(reward.type)}
                <span className="capitalize">{reward.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiStar className="w-3 h-3" />
                <span>{reward.redemptionCount} canjes</span>
              </div>
              {!reward.availability.unlimited && (
                <div className="flex items-center space-x-1">
                  <FiPackage className="w-3 h-3" />
                  <span>{reward.availability.stock} disponibles</span>
                </div>
              )}
            </div>
          </div>

          {/* Price and Action */}
          <div className="text-right space-y-3">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {reward.pointsCost.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">puntos</div>
            </div>

            <button
              onClick={handleRedeem}
              disabled={!canRedeem || isRedeeming}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${
                  canRedeem
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
              `}
              title={redemptionReason}
            >
              {isRedeeming
                ? "Canjeando..."
                : canRedeem
                  ? "Canjear"
                  : "No disponible"}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div
        className={`h-32 bg-gradient-to-br ${getCategoryColor(reward.category)} relative`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-6xl drop-shadow-lg">{reward.icon}</div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3">
          {reward.isFeatured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              ⭐ Destacado
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <div className="flex items-center space-x-1 bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded-full">
            {getTypeIcon(reward.type)}
            <span className="capitalize">{reward.category}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {reward.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {reward.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <FiStar className="w-3 h-3" />
            <span>{reward.redemptionCount} canjes</span>
          </div>
          {!reward.availability.unlimited && (
            <div className="flex items-center space-x-1">
              <FiPackage className="w-3 h-3" />
              <span>{reward.availability.stock} disponibles</span>
            </div>
          )}
        </div>

        {/* Requirements */}
        {reward.requirements && (
          <div className="space-y-2">
            {reward.requirements.minimumLevel && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <FiStar className="w-3 h-3" />
                <span>Nivel {reward.requirements.minimumLevel} requerido</span>
              </div>
            )}
          </div>
        )}

        {/* Price and Action */}
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {reward.pointsCost.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">puntos</div>
            {reward.value?.cashValue && (
              <div className="text-xs text-green-600 font-medium">
                Valor: ${reward.value.cashValue}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleRedeem}
              disabled={!canRedeem || isRedeeming}
              className={`
                w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors
                ${
                  canRedeem
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {isRedeeming ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Canjeando...</span>
                </div>
              ) : canRedeem ? (
                <div className="flex items-center justify-center space-x-2">
                  <FiShoppingCart className="w-4 h-4" />
                  <span>Canjear</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <FiX className="w-4 h-4" />
                  <span>No disponible</span>
                </div>
              )}
            </button>

            {!canRedeem && redemptionReason && (
              <div className="text-xs text-red-600 text-center flex items-center justify-center space-x-1">
                <FiInfo className="w-3 h-3" />
                <span>{redemptionReason}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Availability indicator */}
      {!reward.availability.unlimited && reward.availability.stock <= 10 && (
        <div className="px-4 pb-3">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
            <div className="text-xs text-orange-800 font-medium">
              ⚠️ Pocas unidades disponibles ({reward.availability.stock})
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RewardCard;
