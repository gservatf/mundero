// Leaderboard avanzado con categorías múltiples y estadísticas detalladas
// Incluye filtros dinámicos, animaciones de posiciones y sistema de medallas

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiFilter,
  FiStar,
  FiCalendar,
  FiBarChart,
  FiEye,
  FiChevronDown,
} from "react-icons/fi";
import { levelSystem } from "./levelSystem";
import { UserLevelDisplay } from "./UserLevelDisplay";

export type LeaderboardCategory =
  | "global"
  | "empresa"
  | "comunidad"
  | "semanal"
  | "challenges"
  | "duels";
export type LeaderboardPeriod = "all-time" | "monthly" | "weekly" | "daily";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  level: number;
  weeklyPoints: number;
  monthlyPoints: number;
  dailyPoints: number;
  challengesWon: number;
  duelsWon: number;
  companyId?: string;
  communityId?: string;
  badges: string[];
  streak: number;
  rank: number;
  previousRank: number;
  trend: "up" | "down" | "same";
}

interface LeaderboardExtendedProps {
  currentUserId: string;
  companyId?: string;
  communityId?: string;
  onUserClick?: (userId: string) => void;
}

export const LeaderboardExtended: React.FC<LeaderboardExtendedProps> = ({
  currentUserId,
  companyId,
  communityId,
  onUserClick,
}) => {
  const [activeCategory, setActiveCategory] =
    useState<LeaderboardCategory>("global");
  const [activePeriod, setActivePeriod] =
    useState<LeaderboardPeriod>("all-time");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("detailed");

  // Simular datos del leaderboard
  useEffect(() => {
    const generateMockUsers = (): LeaderboardUser[] => {
      const mockUsers: LeaderboardUser[] = [
        {
          id: "user1",
          name: "Ana García",
          avatar: "👩‍💼",
          totalPoints: 15420,
          level: levelSystem.calculateLevel(15420),
          weeklyPoints: 2340,
          monthlyPoints: 8920,
          dailyPoints: 480,
          challengesWon: 23,
          duelsWon: 41,
          companyId: "company1",
          communityId: "community1",
          badges: ["🏆", "🎯", "🔥"],
          streak: 12,
          rank: 1,
          previousRank: 2,
          trend: "up",
        },
        {
          id: "user2",
          name: "Carlos Mendoza",
          avatar: "👨‍💻",
          totalPoints: 14890,
          level: levelSystem.calculateLevel(14890),
          weeklyPoints: 1980,
          monthlyPoints: 7560,
          dailyPoints: 320,
          challengesWon: 19,
          duelsWon: 38,
          companyId: "company1",
          communityId: "community2",
          badges: ["🚀", "⭐", "💎"],
          streak: 8,
          rank: 2,
          previousRank: 1,
          trend: "down",
        },
        {
          id: "user3",
          name: "María López",
          avatar: "👩‍🎨",
          totalPoints: 13650,
          level: levelSystem.calculateLevel(13650),
          weeklyPoints: 2100,
          monthlyPoints: 6800,
          dailyPoints: 420,
          challengesWon: 31,
          duelsWon: 29,
          companyId: "company2",
          communityId: "community1",
          badges: ["🎨", "🌟", "🏅"],
          streak: 15,
          rank: 3,
          previousRank: 3,
          trend: "same",
        },
        {
          id: currentUserId,
          name: "Usuario Actual",
          avatar: "😊",
          totalPoints: 8920,
          level: levelSystem.calculateLevel(8920),
          weeklyPoints: 1240,
          monthlyPoints: 4560,
          dailyPoints: 180,
          challengesWon: 12,
          duelsWon: 18,
          companyId: companyId,
          communityId: communityId,
          badges: ["🌱", "💪"],
          streak: 5,
          rank: 7,
          previousRank: 9,
          trend: "up",
        },
      ];

      // Agregar más usuarios de ejemplo
      for (let i = 4; i <= 20; i++) {
        if (i === 7) continue; // Skip position 7 for current user
        mockUsers.push({
          id: `user${i + 1}`,
          name: `Usuario ${i}`,
          avatar: ["👤", "👨", "👩", "🧑"][i % 4],
          totalPoints: Math.max(0, 12000 - i * 800 + Math.random() * 400),
          level: levelSystem.calculateLevel(Math.max(0, 12000 - i * 800)),
          weeklyPoints: Math.floor(Math.random() * 1000) + 200,
          monthlyPoints: Math.floor(Math.random() * 4000) + 1000,
          dailyPoints: Math.floor(Math.random() * 200) + 50,
          challengesWon: Math.floor(Math.random() * 20) + 5,
          duelsWon: Math.floor(Math.random() * 30) + 10,
          companyId: ["company1", "company2", "company3"][i % 3],
          communityId: ["community1", "community2", "community3"][i % 3],
          badges: [["🏆"], ["🎯"], ["🔥"], ["🚀"], ["⭐"]][i % 5],
          streak: Math.floor(Math.random() * 10) + 1,
          rank: i > 7 ? i : i + 1,
          previousRank:
            i > 7
              ? i + Math.floor(Math.random() * 3) - 1
              : i + 1 + Math.floor(Math.random() * 3) - 1,
          trend: ["up", "down", "same"][Math.floor(Math.random() * 3)] as
            | "up"
            | "down"
            | "same",
        });
      }

      return mockUsers.sort((a, b) => b.totalPoints - a.totalPoints);
    };

    setLoading(true);
    const timer = setTimeout(() => {
      setUsers(generateMockUsers());
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [activeCategory, activePeriod, currentUserId, companyId, communityId]);

  const filteredUsers = users.filter((user) => {
    switch (activeCategory) {
      case "empresa":
        return user.companyId === companyId;
      case "comunidad":
        return user.communityId === communityId;
      default:
        return true;
    }
  });

  const getPointsForPeriod = (user: LeaderboardUser): number => {
    switch (activePeriod) {
      case "daily":
        return user.dailyPoints;
      case "weekly":
        return user.weeklyPoints;
      case "monthly":
        return user.monthlyPoints;
      default:
        return user.totalPoints;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <FiTrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <FiTrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const categories = [
    { id: "global", name: "Global", icon: FiAward },
    { id: "empresa", name: "Empresa", icon: FiUsers, disabled: !companyId },
    {
      id: "comunidad",
      name: "Comunidad",
      icon: FiStar,
      disabled: !communityId,
    },
    { id: "semanal", name: "Semanal", icon: FiCalendar },
    { id: "challenges", name: "Challenges", icon: FiAward },
    { id: "duels", name: "Duelos", icon: FiAward },
  ];

  const periods = [
    { id: "all-time", name: "Todo el tiempo" },
    { id: "monthly", name: "Este mes" },
    { id: "weekly", name: "Esta semana" },
    { id: "daily", name: "Hoy" },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FiAward className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <p className="text-purple-100">Rankings y estadísticas</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filtros</span>
              <FiChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            <button
              onClick={() =>
                setViewMode(viewMode === "compact" ? "detailed" : "compact")
              }
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <FiEye className="w-4 h-4" />
              <span>{viewMode === "compact" ? "Detallado" : "Compacto"}</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() =>
                  !category.disabled &&
                  setActiveCategory(category.id as LeaderboardCategory)
                }
                disabled={category.disabled}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    activeCategory === category.id
                      ? "bg-white text-purple-600"
                      : category.disabled
                        ? "bg-white/10 text-white/50 cursor-not-allowed"
                        : "bg-white/20 text-white hover:bg-white/30"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 px-6 py-4 bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Período:
              </span>
              <div className="flex flex-wrap gap-2">
                {periods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() =>
                      setActivePeriod(period.id as LeaderboardPeriod)
                    }
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${
                        activePeriod === period.id
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }
                    `}
                  >
                    {period.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence mode="wait">
          {filteredUsers.slice(0, 20).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onUserClick?.(user.id)}
              className={`
                p-4 hover:bg-gray-50 transition-colors cursor-pointer
                ${user.id === currentUserId ? "bg-purple-50 border-l-4 border-purple-500" : ""}
                ${viewMode === "compact" ? "py-3" : "py-4"}
              `}
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex items-center space-x-2 w-16">
                  {getRankMedal(user.rank)}
                  {getTrendIcon(user.trend)}
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user.avatar || user.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`font-semibold text-gray-900 truncate ${user.id === currentUserId ? "text-purple-700" : ""}`}
                      >
                        {user.name}
                        {user.id === currentUserId && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            Tú
                          </span>
                        )}
                      </h3>
                      {user.badges.map((badge, i) => (
                        <span key={i} className="text-sm">
                          {badge}
                        </span>
                      ))}
                    </div>

                    {viewMode === "detailed" && (
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600 flex items-center space-x-1">
                          <FiStar className="w-3 h-3" />
                          <span>Nivel {user.level}</span>
                        </span>
                        <span className="text-sm text-gray-600 flex items-center space-x-1">
                          <FiAward className="w-3 h-3" />
                          <span>{user.challengesWon} challenges</span>
                        </span>
                        <span className="text-sm text-gray-600 flex items-center space-x-1">
                          <FiAward className="w-3 h-3" />
                          <span>{user.duelsWon} duelos</span>
                        </span>
                        {user.streak > 0 && (
                          <span className="text-sm text-orange-600 flex items-center space-x-1">
                            <span>🔥</span>
                            <span>{user.streak} días</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {getPointsForPeriod(user).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">puntos</div>

                  {viewMode === "detailed" && activePeriod === "all-time" && (
                    <div className="text-xs text-gray-500 mt-1">
                      +{user.weeklyPoints} esta semana
                    </div>
                  )}
                </div>

                {/* Level Display for detailed view */}
                {viewMode === "detailed" && (
                  <div className="w-24">
                    <UserLevelDisplay
                      totalPoints={user.totalPoints}
                      size="small"
                      showProgress={false}
                      animated={false}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {filteredUsers.length}
            </div>
            <div className="text-sm text-gray-600">Participantes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                filteredUsers.reduce((sum, user) => sum + user.totalPoints, 0) /
                  filteredUsers.length,
              ).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Promedio</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.max(
                ...filteredUsers.map((user) => user.totalPoints),
              ).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Más alto</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {filteredUsers
                .reduce((sum, user) => sum + user.weeklyPoints, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Esta semana</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardExtended;
