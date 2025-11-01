import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  Building,
  Users,
  TrendingUp,
  Activity,
  Award,
  Target,
  BarChart3,
} from "lucide-react";
import { type FeedAnalytics, type CompanyStats } from "./analyticsService";

interface CompanyInsightsProps {
  analytics: FeedAnalytics;
  selectedCompany?: string;
}

export const CompanyInsights: React.FC<CompanyInsightsProps> = ({
  analytics,
  selectedCompany = "all",
}) => {
  // Color palette for charts
  const colors = {
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
    purple: "#8B5CF6",
    pink: "#EC4899",
    indigo: "#6366F1",
    teal: "#14B8A6",
  };

  // Prepare company engagement data for bar chart
  const companyEngagementData = useMemo(() => {
    let companies = analytics.companyStats.slice(0, 8); // Top 8 companies

    if (selectedCompany !== "all") {
      companies = companies.filter((c) => c.companyId === selectedCompany);
    }

    return companies.map((company, index) => ({
      name:
        company.companyName.length > 15
          ? company.companyName.substring(0, 15) + "..."
          : company.companyName,
      fullName: company.companyName,
      engagement: company.engagementRate,
      posts: company.postCount,
      users: company.activeUsers,
      avgPerPost: company.avgEngagementPerPost,
      likes: company.totalLikes,
      comments: company.totalComments,
      color: Object.values(colors)[index % Object.values(colors).length],
    }));
  }, [analytics.companyStats, selectedCompany]);

  // Get top performing company
  const topCompany = useMemo(() => {
    if (analytics.companyStats.length === 0) return null;
    return analytics.companyStats[0];
  }, [analytics.companyStats]);

  // Calculate company insights metrics
  const insights = useMemo(() => {
    const totalCompanies = analytics.companyStats.length;
    const avgEngagementRate =
      analytics.companyStats.reduce((sum, c) => sum + c.engagementRate, 0) /
        totalCompanies || 0;
    const totalActiveUsers = analytics.companyStats.reduce(
      (sum, c) => sum + c.activeUsers,
      0,
    );
    const avgPostsPerCompany =
      analytics.companyStats.reduce((sum, c) => sum + c.postCount, 0) /
        totalCompanies || 0;

    return {
      totalCompanies,
      avgEngagementRate,
      totalActiveUsers,
      avgPostsPerCompany,
    };
  }, [analytics.companyStats]);

  // Prepare engagement distribution by company
  const engagementDistribution = useMemo(() => {
    const topCompanies = analytics.companyStats.slice(0, 5);
    const others = analytics.companyStats.slice(5);

    const data = topCompanies.map((company, index) => ({
      name: company.companyName,
      value: company.totalLikes + company.totalComments + company.totalShares,
      color: Object.values(colors)[index % Object.values(colors).length],
    }));

    if (others.length > 0) {
      const othersTotal = others.reduce(
        (sum, c) => sum + c.totalLikes + c.totalComments + c.totalShares,
        0,
      );
      data.push({
        name: "Otras empresas",
        value: othersTotal,
        color: "#9CA3AF",
      });
    }

    return data;
  }, [analytics.companyStats]);

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

  // Format numbers
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("es-ES").format(num);
  };

  return (
    <div className="space-y-6">
      {/* Company Insights Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Insights Empresariales
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Métricas comparativas de engagement por empresa
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Building className="h-3 w-3 mr-1" />
            {insights.totalCompanies} empresas
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2">
              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {insights.totalCompanies}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Empresas Activas
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {insights.avgEngagementRate.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Engagement Promedio
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {insights.totalActiveUsers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Usuarios Activos
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg mx-auto mb-2">
              <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {insights.avgPostsPerCompany.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Posts por Empresa
            </div>
          </div>
        </div>
      </Card>

      {/* Top Performing Company */}
      {topCompany && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Empresa Líder en Engagement
              </h3>
            </div>
            <Badge
              variant="default"
              className="flex items-center bg-green-100 text-green-800"
            >
              <Award className="h-3 w-3 mr-1" />
              #1 Ranking
            </Badge>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {topCompany.companyName}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Engagement Rate
                    </span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {topCompany.engagementRate.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Posts
                    </span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(topCompany.postCount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Usuarios Activos
                    </span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(topCompany.activeUsers)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Promedio por Post
                    </span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {topCompany.avgEngagementPerPost.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Company Engagement Comparison */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Comparativa de Engagement por Empresa
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tasa de engagement promedio por empresa
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Target className="h-3 w-3 mr-1" />
            Top {companyEngagementData.length}
          </Badge>
        </div>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={companyEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="engagement"
                fill={colors.primary}
                name="Engagement Rate"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Posts vs Users per Company */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Actividad vs Participación
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Relación entre posts publicados y usuarios activos
            </p>
          </div>
        </div>

        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={companyEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="posts" fill={colors.secondary} name="Posts" />
              <Bar
                dataKey="users"
                fill={colors.accent}
                name="Usuarios Activos"
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
              Distribución de Engagement por Empresa
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Participación total en el engagement del feed
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <div style={{ width: "60%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={engagementDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
                    "Engagement",
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
                      {item.name.length > 20
                        ? item.name.substring(0, 20) + "..."
                        : item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(item.value)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(
                        (item.value /
                          engagementDistribution.reduce(
                            (sum, d) => sum + d.value,
                            0,
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
