// Funnel Dashboard Component
// Main dashboard for managing organization funnels

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    BarChart3,
    Users,
    TrendingUp,
    Calendar
} from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Funnel, Organization } from '../types';
import { funnelsService } from '../../../services/funnelsService';

interface FunnelDashboardProps {
    organization: Organization;
    onCreateFunnel: () => void;
    onEditFunnel: (funnel: Funnel) => void;
    onViewAnalytics: (funnel: Funnel) => void;
}

export const FunnelDashboard: React.FC<FunnelDashboardProps> = ({
    organization,
    onCreateFunnel,
    onEditFunnel,
    onViewAnalytics
}) => {
    const [funnels, setFunnels] = useState<Funnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadFunnels();
    }, [organization.id]);

    const loadFunnels = async () => {
        try {
            setLoading(true);
            const orgFunnels = await funnelsService.getOrganizationFunnels(organization.id);
            setFunnels(orgFunnels);
        } catch (error) {
            console.error('Error loading funnels:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFunnels = funnels.filter(funnel => {
        const matchesSearch = funnel.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || funnel.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: Funnel['status']) => {
        switch (status) {
            case 'published': return 'bg-green-500';
            case 'draft': return 'bg-yellow-500';
            case 'paused': return 'bg-orange-500';
            case 'archived': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: Funnel['status']) => {
        switch (status) {
            case 'published': return 'Publicado';
            case 'draft': return 'Borrador';
            case 'paused': return 'Pausado';
            case 'archived': return 'Archivado';
            default: return status;
        }
    };

    const totalViews = funnels.reduce((sum, funnel) => sum + funnel.analytics.views, 0);
    const totalSubmissions = funnels.reduce((sum, funnel) => sum + funnel.analytics.submissions, 0);
    const avgConversionRate = funnels.length > 0
        ? funnels.reduce((sum, funnel) => sum + funnel.analytics.conversionRate, 0) / funnels.length
        : 0;

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Funnels</h1>
                    <p className="text-gray-600">Gestiona los embudos de conversión de {organization.name}</p>
                </div>
                <Button onClick={onCreateFunnel} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Funnel
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Vistas Totales</p>
                            <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Conversiones</p>
                            <p className="text-2xl font-bold text-gray-900">{totalSubmissions.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Conversión Promedio</p>
                            <p className="text-2xl font-bold text-gray-900">{avgConversionRate.toFixed(1)}%</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar funnels..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Todos los estados</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Borradores</option>
                    <option value="paused">Pausados</option>
                    <option value="archived">Archivados</option>
                </select>
            </div>

            {/* Funnels Grid */}
            {filteredFunnels.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <BarChart3 className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchTerm || statusFilter !== 'all' ? 'No se encontraron funnels' : 'No hay funnels aún'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Intenta ajustar los filtros para encontrar lo que buscas.'
                                : 'Crea tu primer funnel para comenzar a capturar leads y convertir visitantes.'
                            }
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                            <Button onClick={onCreateFunnel}>
                                Crear mi primer funnel
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFunnels.map((funnel) => (
                        <motion.div
                            key={funnel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {funnel.name}
                                        </h3>
                                        {funnel.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {funnel.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={`${getStatusColor(funnel.status)} text-white text-xs`}>
                                            {getStatusText(funnel.status)}
                                        </Badge>
                                        <div className="relative">
                                            <button className="p-1 hover:bg-gray-100 rounded">
                                                <MoreVertical className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {funnel.analytics.views.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-600">Vistas</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {funnel.analytics.submissions.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-600">Conversiones</p>
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <p className="text-lg font-semibold text-green-600">
                                        {funnel.analytics.conversionRate.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-600">Tasa de conversión</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => onViewAnalytics(funnel)}
                                    >
                                        <BarChart3 className="h-4 w-4 mr-1" />
                                        Analytics
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => onEditFunnel(funnel)}
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                    </Button>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(funnel.createdAt).toLocaleDateString()}
                                    </span>
                                    <span>{funnel.steps.length} pasos</span>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};