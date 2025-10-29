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
  FiRefreshCw
} from 'react-icons/fi';
import { 
  adminUserService, 
  adminCompanyService
} from '../services/adminFirebase';
import { useAdminAuth } from '../hooks/useAdminAuth';

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
  const { adminRole, canAccess } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    activeCompanies: 0,
    pendingCompanies: 0,
    totalCompanies: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Mock recent activity
    const mockActivities: RecentActivity[] = [
      {
        id: '1',
        type: 'user_login',
        message: 'Usuario admin@mundero.com inició sesión',
        timestamp: Date.now(),
        severity: 'info'
      },
      {
        id: '2',
        type: 'company_created',
        message: 'Nueva empresa registrada: Tech Solutions SAC',
        timestamp: Date.now() - 300000,
        severity: 'info'
      },
      {
        id: '3',
        type: 'system_update',
        message: 'Sistema actualizado correctamente',
        timestamp: Date.now() - 600000,
        severity: 'info'
      }
    ];
    setRecentActivity(mockActivities);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas básicas
      const [users, companies] = await Promise.all([
        adminUserService.getUsers(100),
        adminCompanyService.getCompanies()
      ]);

      const today = new Date().setHours(0, 0, 0, 0);
      const newUsersToday = users.users.filter((user: any) => 
        user.createdAt?.toDate?.()?.getTime() >= today
      ).length;

      const activeCompanies = companies.companies.filter((company: any) => company.status === 'active').length;
      const pendingCompanies = companies.companies.filter((company: any) => company.status === 'pending').length;

      setStats({
        totalUsers: users.users.length,
        newUsersToday,
        activeCompanies,
        pendingCompanies,
        totalCompanies: companies.companies.length
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = (now - timestamp) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Panel de control administrativo - Rol: <Badge className="ml-1">{adminRole}</Badge>
          </p>
        </div>
        <Button onClick={loadDashboardData} disabled={loading}>
          <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiUsers className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">+{stats.newUsersToday} hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiGrid className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Empresas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeCompanies}</p>
                <p className="text-xs text-yellow-600">{stats.pendingCompanies} pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiGrid className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Empresas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCompanies}</p>
                <p className="text-xs text-blue-600">Registradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiActivity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sistema</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Activo</p>
                <p className="text-xs text-green-600">Operativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Alerts */}
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
                    <Badge className={`text-xs ${getSeverityColor(activity.severity)}`}>
                      {activity.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FiTrendingUp className="mr-2 h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {canAccess('users') && (
                <Button variant="outline" className="w-full justify-start">
                  <FiUsers className="mr-2 h-4 w-4" />
                  Gestionar Usuarios
                </Button>
              )}
              
              {canAccess('companies') && stats.pendingCompanies > 0 && (
                <Button variant="outline" className="w-full justify-start">
                  <FiGrid className="mr-2 h-4 w-4" />
                  Revisar Empresas Pendientes ({stats.pendingCompanies})
                </Button>
              )}
              
              {canAccess('messages') && (
                <Button variant="outline" className="w-full justify-start">
                  <FiActivity className="mr-2 h-4 w-4" />
                  Ver Mensajes
                </Button>
              )}
              
              {canAccess('config') && (
                <Button variant="outline" className="w-full justify-start">
                  <FiGrid className="mr-2 h-4 w-4" />
                  Configuración Global
                </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};