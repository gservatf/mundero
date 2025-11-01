import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { TrendingUp, Users, Activity, BarChart3 } from "lucide-react";
import { type FeedAnalytics, type AnalyticsPeriod } from "./analyticsService";

interface EngagementChartsProps {
  analytics: FeedAnalytics;
  period: AnalyticsPeriod;
}

export const EngagementCharts: React.FC<EngagementChartsProps> = ({
  analytics,
  period,
}) => {
  // Color palette for charts
  const colors = {
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
    purple: "#8B5CF6",
    pink: "#EC4899",
  };

  // Prepare daily activity data for line chart
  const dailyActivityData = analytics.dailyActivity.map((day) => ({
    date: new Date(day.date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    }),
    posts: day.posts,
    likes: day.likes,
    comments: day.comments,
    shares: day.shares,
    total: day.totalEngagement,
  }));

  // Prepare top users data for bar chart
  const topUsersData = analytics.topUsers.slice(0, 5).map((user) => ({
    name:
      user.name.length > 15 ? user.name.substring(0, 15) + "..." : user.name,
    likes: user.likes,
    comments: user.comments,
    posts: user.posts,
    total: user.totalEngagement,
  }));

  // Prepare engagement distribution data for pie chart
  const totalEngagement =
    analytics.totalLikes + analytics.totalComments + analytics.totalShares;
  const engagementDistribution = [
    {
      name: "Likes",
      value: analytics.totalLikes,
      percentage:
        totalEngagement > 0
          ? Math.round((analytics.totalLikes / totalEngagement) * 100)
          : 0,
      color: colors.danger,
    },
    {
      name: "Comentarios",
      value: analytics.totalComments,
      percentage:
        totalEngagement > 0
          ? Math.round((analytics.totalComments / totalEngagement) * 100)
          : 0,
      color: colors.primary,
    },
    {
      name: "Compartidos",
      value: analytics.totalShares,
      percentage:
        totalEngagement > 0
          ? Math.round((analytics.totalShares / totalEngagement) * 100)
          : 0,
      color: colors.secondary,
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString("es-ES")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format period label
  const getPeriodLabel = (period: AnalyticsPeriod): string => {
    switch (period) {
      case "daily":
        return "Últimas 24 horas";
      case "weekly":
        return "Última semana";
      case "monthly":
        return "Último mes";
      default:
        return "Período actual";
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Timeline Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Actividad del Feed
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getPeriodLabel(period)}
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Activity className="h-3 w-3 mr-1" />
            {analytics.dailyActivity.length} días
          </Badge>
        </div>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={dailyActivityData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.primary}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stroke={colors.primary}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total Engagement"
              />
              <Line
                type="monotone"
                dataKey="posts"
                stroke={colors.secondary}
                strokeWidth={2}
                name="Publicaciones"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Users Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top 5 Usuarios Más Activos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Por total de engagement generado
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {analytics.topUsers.length} usuarios
          </Badge>
        </div>

        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={topUsersData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="likes" fill={colors.danger} name="Likes" />
              <Bar
                dataKey="comments"
                fill={colors.primary}
                name="Comentarios"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Engagement Distribution */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribución de Engagement
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tipos de interacción más comunes
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center">
            <BarChart3 className="h-3 w-3 mr-1" />
            {totalEngagement.toLocaleString("es-ES")} total
          </Badge>
        </div>

        <div className="flex items-center">
          <div style={{ width: "50%", height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={engagementDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {engagementDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    value.toLocaleString("es-ES"),
                    "",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 pl-6">
            <div className="space-y-3">
              {engagementDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.value.toLocaleString("es-ES")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Engagement Rate Trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tendencia de Engagement
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Likes, comentarios y compartidos por día
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {analytics.engagementRate.toFixed(1)} promedio
          </Badge>
        </div>

        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <LineChart data={dailyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="likes"
                stroke={colors.danger}
                strokeWidth={2}
                name="Likes"
                dot={{ fill: colors.danger, strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke={colors.primary}
                strokeWidth={2}
                name="Comentarios"
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="shares"
                stroke={colors.secondary}
                strokeWidth={2}
                name="Compartidos"
                dot={{ fill: colors.secondary, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
