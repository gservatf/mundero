import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  FiUsers,
  FiGrid,
  FiDollarSign,
  FiAlertTriangle,
  FiActivity,
  FiTrendingUp,
  FiRefreshCw,
  FiZap,
  FiLink
} from 'react-icons/fi';
import { useAdminData } from '../hooks/useAdminData';

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeCompanies: number;
  pendingCompanies: number;
  totalCompanies: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'error';
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const {
    stats,
    recentActivity,
    integrations,
    isLoading,
    isLoadingStats,
    isLoadingIntegrations,
    error,
    statsError,
    integrationsError,
    loadDashboardData,
    syncIntegrations,
    isAuthenticated,
    adminUser,
  } = useAdminData();

  const handleRefresh = async () => {
    await loadDashboardData();
  };

  const handleSyncIntegrations = async () => {
    await syncIntegrations();
  };

  if (!isAuthenticated || !adminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiAlertTriangle className="mx-auto text-4xl text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = (now.getTime() - timestamp.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <FiUsers className="h-4 w-4 text-blue-600" />;
      case 'company_created':
        return <FiGrid className="h-4 w-4 text-green-600" />;
      case 'integration_activated':
        return <FiZap className="h-4 w-4 text-purple-600" />;
      default:
        return <FiActivity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || statsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiAlertTriangle className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error || statsError}</p>
          <Button onClick={handleRefresh}>
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Panel de control administrativo - {adminUser?.displayName || adminUser?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
            <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleSyncIntegrations} disabled={isLoadingIntegrations} variant="outline">
            <FiLink className={`mr-2 h-4 w-4 ${isLoadingIntegrations ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiUsers className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-green-600">Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiGrid className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Empresas Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCompanies || 0}</p>
                <p className="text-xs text-yellow-600">{stats?.pendingCompanies || 0} pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiUsers className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeUsers || 0}</p>
                <p className="text-xs text-blue-600">En línea</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiZap className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Integraciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeIntegrations || 0}</p>
                <p className="text-xs text-green-600">de {stats?.totalIntegrations || 0} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiActivity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sistema</p>
                <p className="text-2xl font-bold text-green-600">Activo</p>
                <p className="text-xs text-green-600">Operativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FiActivity className="mr-2 h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiActivity className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No hay actividad reciente
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Integrations Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FiLink className="mr-2 h-5 w-5" />
                Estado de Integraciones
              </div>
              {integrationsError && (
                <Badge variant="destructive" className="text-xs">
                  Error
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingIntegrations ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : integrations.length > 0 ? (
                integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{integration.name}</p>
                      {integration.lastSync && (
                        <p className="text-xs text-gray-500">
                          Última sync: {formatTimeAgo(integration.lastSync)}
                        </p>
                      )}
                    </div>
                    <Badge className={getIntegrationStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiLink className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No hay integraciones configuradas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Firebase Auth</p>
                <p className="text-xs text-green-600 dark:text-green-400">Operativo</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Firestore</p>
                <p className="text-xs text-green-600 dark:text-green-400">Operativo</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Storage</p>
                <p className="text-xs text-green-600 dark:text-green-400">Operativo</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">API Integraciones</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {stats?.totalIntegrations ? 'Operativo' : 'Sin configurar'}
                </p>
              </div>
              <div className={`h-3 w-3 rounded-full ${stats?.totalIntegrations ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};