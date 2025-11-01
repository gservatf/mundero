import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Calendar,
  Building,
  Activity,
  BarChart3,
  Filter,
  RefreshCw,
  Download,
  ChevronDown,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { EngagementCharts } from "./EngagementCharts.tsx";
import { ActivityTable } from "./ActivityTable.tsx";
import { CompanyInsights } from "./CompanyInsights.tsx";
import ActivityHeatmap from "./ActivityHeatmap.tsx";
import EngagementAlerts from "./EngagementAlerts.tsx";
import {
  analyticsService,
  type FeedAnalytics,
  type AnalyticsPeriod,
} from "./analyticsService.ts";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { formatTimeAgo } from "../../../../lib/utils";

interface FilterState {
  period: AnalyticsPeriod;
  company: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export const FeedAnalyticsDashboard: React.FC = () => {
  const { user, isAdmin } = useAdminAuth();
  const [analytics, setAnalytics] = useState<FeedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    period: "weekly",
    company: "all",
    dateRange: {
      start: "",
      end: "",
    },
  });

  // Check admin access
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = "/user-panel";
      return;
    }
  }, [isAdmin]);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await analyticsService.getFeedAnalytics(filters.period);
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error loading analytics:", err);
      setError("Error al cargar las analíticas del feed");
    } finally {
      setIsLoading(false);
    }
  }, [filters.period]);

  // Auto-refresh analytics
  useEffect(() => {
    loadAnalytics();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  // Handle filter changes
  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setFilters((prev) => ({ ...prev, period }));
  };

  const handleCompanyFilter = (company: string) => {
    setFilters((prev) => ({ ...prev, company }));
  };

  // Format numbers with Spanish locale
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("es-ES").format(num);
  };

  // Calculate percentage change (mock for now)
  const getPercentageChange = (
    current: number,
  ): { value: number; isPositive: boolean } => {
    // Mock percentage change calculation
    const change = Math.random() * 20 - 10; // Random between -10 and +10
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  if (!isAdmin) {
    return null;
  }

  if (isLoading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando analíticas del feed...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Activity className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar analíticas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Feed Analytics & Social Intelligence
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Analítica ejecutiva del feed social, inteligencia de
                comportamiento y alertas automáticas
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                Actualizado {formatTimeAgo(lastUpdated)}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>

              <Button
                size="sm"
                onClick={loadAnalytics}
                disabled={isLoading}
                className="flex items-center"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Período
                    </label>
                    <div className="flex space-x-2">
                      {(
                        ["daily", "weekly", "monthly"] as AnalyticsPeriod[]
                      ).map((period) => (
                        <Button
                          key={period}
                          variant={
                            filters.period === period ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePeriodChange(period)}
                        >
                          {period === "daily" && "Diario"}
                          {period === "weekly" && "Semanal"}
                          {period === "monthly" && "Mensual"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Empresa
                    </label>
                    <select
                      value={filters.company}
                      onChange={(e) => handleCompanyFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">Todas las empresas</option>
                      {analytics?.companyStats.map((company) => (
                        <option
                          key={company.companyId}
                          value={company.companyId}
                        >
                          {company.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* KPI Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Publicaciones
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.postCount)}
                    </p>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const change = getPercentageChange(analytics.postCount);
                        return (
                          <span
                            className={`text-xs flex items-center ${
                              change.isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            <TrendingUp
                              className={`h-3 w-3 mr-1 ${
                                !change.isPositive ? "rotate-180" : ""
                              }`}
                            />
                            {change.value.toFixed(1)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Total Likes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Likes
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.totalLikes)}
                    </p>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const change = getPercentageChange(
                          analytics.totalLikes,
                        );
                        return (
                          <span
                            className={`text-xs flex items-center ${
                              change.isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            <TrendingUp
                              className={`h-3 w-3 mr-1 ${
                                !change.isPositive ? "rotate-180" : ""
                              }`}
                            />
                            {change.value.toFixed(1)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Total Comments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Comentarios
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analytics.totalComments)}
                    </p>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const change = getPercentageChange(
                          analytics.totalComments,
                        );
                        return (
                          <span
                            className={`text-xs flex items-center ${
                              change.isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            <TrendingUp
                              className={`h-3 w-3 mr-1 ${
                                !change.isPositive ? "rotate-180" : ""
                              }`}
                            />
                            {change.value.toFixed(1)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Engagement Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Engagement Promedio
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.engagementRate.toFixed(1)}
                    </p>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const change = getPercentageChange(
                          analytics.engagementRate,
                        );
                        return (
                          <span
                            className={`text-xs flex items-center ${
                              change.isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            <TrendingUp
                              className={`h-3 w-3 mr-1 ${
                                !change.isPositive ? "rotate-180" : ""
                              }`}
                            />
                            {change.value.toFixed(1)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Charts Section */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <EngagementCharts analytics={analytics} period={filters.period} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CompanyInsights
                analytics={analytics}
                selectedCompany={filters.company}
              />
            </motion.div>
          </div>
        )}

        {/* Social Intelligence Section - FASE 5.5 */}
        {analytics && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="xl:col-span-2"
            >
              <ActivityHeatmap
                companyId={
                  filters.company !== "all" ? filters.company : undefined
                }
                className="h-full"
              />
            </motion.div>

            {/* Engagement Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <EngagementAlerts
                companyId={
                  filters.company !== "all" ? filters.company : undefined
                }
                maxAlerts={8}
                autoRefresh={true}
                className="h-full"
              />
            </motion.div>
          </div>
        )}

        {/* Activity Table */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <ActivityTable
              analytics={analytics}
              onPostClick={(postId: string) => {
                // Navigate to post or open modal
                console.log("Open post:", postId);
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};
