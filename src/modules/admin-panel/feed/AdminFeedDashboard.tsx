import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  AlertTriangle,
  MessageCircle,
  Heart,
  Share2,
  Calendar,
  Users,
  BarChart3,
  Activity,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import {
  moderationService,
  type FeedStats,
} from "./services/moderationService";

interface DashboardMetric {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period: string;
  };
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

interface EngagementData {
  date: string;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
}

export const AdminFeedDashboard: React.FC = () => {
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load basic stats
      const feedStats = await moderationService.getFeedStats();
      setStats(feedStats);

      // Simulate engagement data (in a real app, this would come from analytics)
      const mockEngagementData: EngagementData[] = [];
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        mockEngagementData.push({
          date: date.toISOString().split("T")[0],
          posts: Math.floor(Math.random() * 10) + 1,
          likes: Math.floor(Math.random() * 100) + 20,
          comments: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 20) + 2,
        });
      }

      setEngagementData(mockEngagementData);
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Calculate metrics
  const getMetrics = useCallback((): DashboardMetric[] => {
    if (!stats) return [];

    const engagementRate =
      stats.totalPosts > 0
        ? ((stats.totalEngagement / stats.totalPosts) * 100).toFixed(1)
        : "0";

    const visibilityRate =
      stats.totalPosts > 0
        ? ((stats.activePosts / stats.totalPosts) * 100).toFixed(1)
        : "0";

    const reportRate =
      stats.totalPosts > 0
        ? ((stats.reportedPosts / stats.totalPosts) * 100).toFixed(1)
        : "0";

    return [
      {
        title: "Total de Publicaciones",
        value: stats.totalPosts.toLocaleString(),
        change: { value: 12, type: "increase", period: "vs. mes anterior" },
        icon: BarChart3,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Publicaciones Activas",
        value: stats.activePosts.toLocaleString(),
        change: { value: 8, type: "increase", period: "vs. mes anterior" },
        icon: Eye,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "Publicaciones Ocultas",
        value: stats.hiddenPosts.toLocaleString(),
        change: { value: 5, type: "decrease", period: "vs. mes anterior" },
        icon: EyeOff,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      {
        title: "Reportes Pendientes",
        value: stats.pendingReports.toLocaleString(),
        change: { value: 3, type: "decrease", period: "vs. semana anterior" },
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      {
        title: "Engagement Total",
        value: stats.totalEngagement.toLocaleString(),
        change: { value: 18, type: "increase", period: "vs. mes anterior" },
        icon: Heart,
        color: "text-pink-600",
        bgColor: "bg-pink-100",
      },
      {
        title: "Engagement Promedio",
        value: stats.averageEngagement.toFixed(1),
        change: { value: 7, type: "increase", period: "vs. mes anterior" },
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      {
        title: "Tasa de Visibilidad",
        value: `${visibilityRate}%`,
        change: { value: 2, type: "increase", period: "vs. mes anterior" },
        icon: Activity,
        color: "text-teal-600",
        bgColor: "bg-teal-100",
      },
      {
        title: "Tasa de Reportes",
        value: `${reportRate}%`,
        change: { value: 1, type: "decrease", period: "vs. mes anterior" },
        icon: AlertTriangle,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
    ];
  }, [stats]);

  // Get engagement summary
  const getEngagementSummary = useCallback(() => {
    if (engagementData.length === 0) return null;

    const totalLikes = engagementData.reduce((sum, day) => sum + day.likes, 0);
    const totalComments = engagementData.reduce(
      (sum, day) => sum + day.comments,
      0,
    );
    const totalShares = engagementData.reduce(
      (sum, day) => sum + day.shares,
      0,
    );
    const totalPosts = engagementData.reduce((sum, day) => sum + day.posts, 0);

    const avgLikesPerPost =
      totalPosts > 0 ? (totalLikes / totalPosts).toFixed(1) : "0";
    const avgCommentsPerPost =
      totalPosts > 0 ? (totalComments / totalPosts).toFixed(1) : "0";
    const avgSharesPerPost =
      totalPosts > 0 ? (totalShares / totalPosts).toFixed(1) : "0";

    return {
      totalLikes,
      totalComments,
      totalShares,
      totalPosts,
      avgLikesPerPost,
      avgCommentsPerPost,
      avgSharesPerPost,
    };
  }, [engagementData]);

  // Load data on mount and time range change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const metrics = getMetrics();
  const engagementSummary = getEngagementSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard del Feed
          </h2>
          <p className="text-gray-600">
            Métricas y estadísticas del feed social
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {[
              { value: "7d", label: "7 días" },
              { value: "30d", label: "30 días" },
              { value: "90d", label: "90 días" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === option.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {metric.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {metric.value}
                        </p>
                      </div>
                      <div
                        className={`h-12 w-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}
                      >
                        <IconComponent className={`h-6 w-6 ${metric.color}`} />
                      </div>
                    </div>

                    {metric.change && (
                      <div className="flex items-center">
                        {metric.change.type === "increase" ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : metric.change.type === "decrease" ? (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <div className="h-4 w-4 mr-1" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            metric.change.type === "increase"
                              ? "text-green-600"
                              : metric.change.type === "decrease"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {metric.change.value}%
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {metric.change.period}
                        </span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Engagement Overview */}
          {engagementSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Resumen de Engagement ({timeRange})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="h-8 w-8 text-pink-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {engagementSummary.totalLikes.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Likes</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {engagementSummary.avgLikesPerPost} promedio/post
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {engagementSummary.totalComments.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Comentarios</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {engagementSummary.avgCommentsPerPost} promedio/post
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Share2 className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {engagementSummary.totalShares.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Shares</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {engagementSummary.avgSharesPerPost} promedio/post
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {engagementSummary.totalPosts.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Posts</p>
                    <p className="text-xs text-gray-500 mt-1">en {timeRange}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Actividad Reciente
              </h3>

              <div className="space-y-4">
                {engagementData.slice(-7).map((day, index) => {
                  const date = new Date(day.date);
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  const dayName = isToday
                    ? "Hoy"
                    : date.toLocaleDateString("es-ES", { weekday: "long" });
                  const totalEngagement = day.likes + day.comments + day.shares;

                  return (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isToday ? "bg-blue-100" : "bg-gray-200"
                          }`}
                        >
                          <Calendar
                            className={`h-5 w-5 ${
                              isToday ? "text-blue-600" : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {dayName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {date.toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">
                            {day.posts}
                          </p>
                          <p className="text-gray-500">Posts</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">
                            {totalEngagement}
                          </p>
                          <p className="text-gray-500">Engagement</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">
                            {day.posts > 0
                              ? (totalEngagement / day.posts).toFixed(1)
                              : "0"}
                          </p>
                          <p className="text-gray-500">Promedio</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="flex items-center justify-center p-4 h-auto"
                  onClick={() =>
                    (window.location.href = "/admin-panel/feed/moderation")
                  }
                >
                  <Eye className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Ver Moderación</p>
                    <p className="text-xs text-gray-500">
                      Revisar publicaciones
                    </p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center justify-center p-4 h-auto"
                  onClick={() =>
                    (window.location.href = "/admin-panel/feed/reports")
                  }
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Ver Reportes</p>
                    <p className="text-xs text-gray-500">
                      {stats?.pendingReports} pendientes
                    </p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center justify-center p-4 h-auto"
                  onClick={handleRefresh}
                >
                  <Activity className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Actualizar Datos</p>
                    <p className="text-xs text-gray-500">
                      Sincronizar métricas
                    </p>
                  </div>
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
};
