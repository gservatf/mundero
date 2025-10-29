import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { 
  FiGrid, 
  FiCheck, 
  FiX, 
  FiUpload, 
  FiRefreshCw,
  FiEye,
  FiEdit
} from 'react-icons/fi';
import { adminCompanyService, AdminCompany } from '../services/adminFirebase';
import { useAdminAuth } from '../hooks/useAdminAuth';

export const AdminCompanies: React.FC = () => {
  const { canAccess, user } = useAdminAuth();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (canAccess('companies')) {
      loadCompanies();
    }
  }, [canAccess]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companiesData = await adminCompanyService.getCompanies();
      setCompanies(companiesData.companies);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    return selectedStatus === 'all' || company.status === selectedStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      approved: 'Aprobada',
      pending: 'Pendiente',
      rejected: 'Rechazada',
      active: 'Activa'
    };
    return texts[status] || status;
  };

  if (!canAccess('companies')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Empresas y Perfiles</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona empresas registradas y sus perfiles corporativos
          </p>
        </div>
        <Button onClick={loadCompanies} disabled={loading}>
          <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiGrid className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{companies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactivas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.filter(c => c.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por estado:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="pending">Pendientes</option>
              <option value="inactive">Inactivas</option>
            </select>
            <div className="text-sm text-gray-500">
              {filteredCompanies.length} empresas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        <FiGrid className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {company.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <Badge className={getStatusBadgeColor(company.status)}>
                    {getStatusText(company.status)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="text-gray-900 dark:text-white">{company.type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">País:</span>
                    <span className="text-gray-900 dark:text-white">{company.country}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Usuarios:</span>
                    <span className="text-gray-900 dark:text-white">{company.usersCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Registro:</span>
                    <span className="text-gray-900 dark:text-white">
                      {company.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <FiEye className="mr-1 h-4 w-4" />
                    Ver
                  </Button>
                  <Button size="sm" variant="ghost">
                    <FiEdit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredCompanies.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FiGrid className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No se encontraron empresas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};