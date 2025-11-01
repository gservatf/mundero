// Componente de estadísticas de recompensas del usuario
// Análisis detallado de patrones de canje y preferencias

import React from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiAward,
  FiPieChart,
  FiCalendar,
  FiTarget,
  FiStar,
  FiGift,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import {
  type UserRewardStats as UserStatsType,
  Reward,
  RewardCategory,
} from "./types";

interface UserRewardStatsComponentProps {
  userId: string;
  stats: UserStatsType | null;
  rewards: Reward[];
}

export const UserRewardStatsComponent: React.FC<
  UserRewardStatsComponentProps
> = ({ userId, stats, rewards }) => {
  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FiPieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Sin datos estadísticos</h3>
        <p>Canjea algunas recompensas para ver tus estadísticas</p>
      </div>
    );
  }

  // Calcular estadísticas por categoría
  const categoryStats = stats.recentRedemptions.reduce(
    (acc, redemption) => {
      const reward = rewards.find((r) => r.id === redemption.rewardId);
      if (reward) {
        if (!acc[reward.category]) {
          acc[reward.category] = { count: 0, points: 0 };
        }
        acc[reward.category].count++;
        acc[reward.category].points += redemption.pointsSpent;
      }
      return acc;
    },
    {} as Record<RewardCategory, { count: number; points: number }>,
  );

  const totalRedemptions = Object.values(categoryStats).reduce(
    (sum, cat) => sum + cat.count,
    0,
  );
  const averagePointsPerRedemption =
    stats.totalPointsSpent / stats.totalRedemptions;

  // Calcular tendencias (simulado)
  const monthlyTrend = [
    { month: "Ene", points: 1200 },
    { month: "Feb", points: 1800 },
    { month: "Mar", points: 2400 },
    { month: "Abr", points: 1900 },
    { month: "May", points: 3200 },
    { month: "Jun", points: 2800 },
  ];

  const maxMonthlyPoints = Math.max(...monthlyTrend.map((m) => m.points));

  // Recompensas recomendadas basadas en historial
  const recommendedRewards = rewards
    .filter((reward) => reward.category === stats.favoriteCategory)
    .filter((reward) => reward.pointsCost <= stats.availablePoints)
    .slice(0, 3);

  const getCategoryIcon = (category: RewardCategory) => {
    const icons = {
      premium: "👑",
      discounts: "🎟️",
      physical: "📦",
      digital: "💻",
      experiences: "🎯",
      badges: "🏅",
      features: "⚡",
    };
    return icons[category] || "🎁";
  };

  const getCategoryColor = (category: RewardCategory) => {
    const colors = {
      premium: "from-yellow-400 to-orange-400",
      discounts: "from-green-400 to-blue-400",
      physical: "from-purple-400 to-pink-400",
      digital: "from-blue-400 to-indigo-400",
      experiences: "from-red-400 to-pink-400",
      badges: "from-indigo-400 to-purple-400",
      features: "from-teal-400 to-cyan-400",
    };
    return colors[category] || "from-gray-400 to-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Canjes</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalRedemptions}
              </p>
            </div>
            <FiGift className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">
                Puntos Gastados
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.totalPointsSpent.toLocaleString()}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                Promedio por Canje
              </p>
              <p className="text-2xl font-bold text-green-900">
                {Math.round(averagePointsPerRedemption).toLocaleString()}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Disponibles</p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.availablePoints.toLocaleString()}
              </p>
            </div>
            <FiAward className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiPieChart className="w-5 h-5 mr-2 text-purple-600" />
            Distribución por Categoría
          </h3>

          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, data]) => {
              const percentage =
                totalRedemptions > 0
                  ? (data.count / totalRedemptions) * 100
                  : 0;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {getCategoryIcon(category as RewardCategory)}
                      </span>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {data.count} canjes
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.points.toLocaleString()} pts
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-2 bg-gradient-to-r ${getCategoryColor(category as RewardCategory)} rounded-full`}
                    />
                  </div>

                  <div className="text-xs text-gray-600 text-right">
                    {percentage.toFixed(1)}% del total
                  </div>
                </div>
              );
            })}

            {Object.keys(categoryStats).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Sin datos de categorías aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiCalendar className="w-5 h-5 mr-2 text-purple-600" />
            Tendencia Mensual
          </h3>

          <div className="space-y-4">
            <div className="flex items-end space-x-2 h-32">
              {monthlyTrend.map((month, index) => (
                <div
                  key={month.month}
                  className="flex-1 flex flex-col items-center"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(month.points / maxMonthlyPoints) * 100}%`,
                    }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t min-h-[8px] flex items-end justify-center"
                  >
                    <span className="text-xs text-white font-medium mb-1">
                      {month.points > maxMonthlyPoints * 0.7
                        ? month.points.toLocaleString()
                        : ""}
                    </span>
                  </motion.div>
                  <span className="text-xs text-gray-600 mt-2">
                    {month.month}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>Enero</span>
              <span>Junio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FiTarget className="w-5 h-5 mr-2 text-purple-600" />
          Recomendaciones Personalizadas
        </h3>

        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">
              {getCategoryIcon(stats.favoriteCategory)}
            </span>
            <span className="text-sm font-medium text-purple-800">
              Tu categoría favorita:{" "}
              <span className="capitalize">{stats.favoriteCategory}</span>
            </span>
          </div>
          <p className="text-sm text-purple-700">
            Basado en tu historial, te recomendamos estas recompensas similares
          </p>
        </div>

        {recommendedRewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(reward.category)} rounded-lg flex items-center justify-center`}
                  >
                    {reward.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {reward.title}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {reward.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-purple-600">
                    {reward.pointsCost.toLocaleString()}
                  </div>
                  <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors">
                    Ver
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiTarget className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No hay recompensas disponibles en tu rango de puntos</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FiClock className="w-5 h-5 mr-2 text-purple-600" />
          Actividad Reciente
        </h3>

        <div className="space-y-3">
          {stats.recentRedemptions.slice(0, 5).map((redemption, index) => {
            const reward = rewards.find((r) => r.id === redemption.rewardId);

            return (
              <motion.div
                key={redemption.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center text-sm">
                  {reward?.icon || "🎁"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {reward?.title || "Recompensa"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(redemption.redeemedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-purple-600">
                    -{redemption.pointsSpent.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">puntos</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { UserRewardStatsComponent as UserRewardStats };
export default UserRewardStatsComponent;
