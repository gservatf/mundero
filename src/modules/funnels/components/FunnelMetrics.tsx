// Funnel Metrics Component
// Analytics and metrics dashboard for funnel performance

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    Eye,
    Target,
    Calendar,
    Download,
    Filter,
    RefreshCw
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Funnel, FunnelSubmission, FunnelMetrics as FunnelMetricsType, FunnelEvent } from '../types';
import { funnelsService } from '../../../services/funnelsService';
import { solutionsService } from '../../solutions/services/solutionsService';
import type { SolutionEvent } from '../../solutions/types';

interface FunnelMetricsProps {
    funnel: Funnel;
    onBack: () => void;
}

export const FunnelMetrics: React.FC<FunnelMetricsProps> = ({
    funnel,
    onBack
}) => {
    const [metrics, setMetrics] = useState<FunnelMetricsType | null>(null);
    const [submissions, setSubmissions] = useState<FunnelSubmission[]>([]);
    const [solutionEvents, setSolutionEvents] = useState<SolutionEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        loadMetrics();
        loadSubmissions();
        loadSolutionEvents();
    }, [funnel.id, timeRange]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const metricsData = await funnelsService.getFunnelMetrics(funnel.id, 'current-user-id');
            setMetrics(metricsData);
        } catch (error) {
            console.error('Error loading metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSubmissions = async () => {
        try {
            const submissionsData = await funnelsService.getFunnelSubmissions(
                funnel.id,
                'current-user-id',
                100
            );
            setSubmissions(submissionsData);
        } catch (error) {
            console.error('Error loading submissions:', error);
        }
    };

    const loadSolutionEvents = async () => {
        try {
            if (funnel.settings?.destination === 'solution' && funnel.settings?.solutionKey) {
                const events = await solutionsService.getSolutionEvents(
                    funnel.settings.solutionKey,
                    funnel.organizationId,
                    100
                );
                setSolutionEvents(events);
            }
        } catch (error) {
            console.error('Error loading solution events:', error);
        }
    };

    // Sample data for charts (in production, this would come from the metrics)
    const dailyData = [
        { date: '2024-01-01', views: 120, submissions: 12 },
        { date: '2024-01-02', views: 98, submissions: 8 },
        { date: '2024-01-03', views: 145, submissions: 18 },
        { date: '2024-01-04', views: 162, submissions: 22 },
        { date: '2024-01-05', views: 134, submissions: 15 },
        { date: '2024-01-06', views: 189, submissions: 28 },
        { date: '2024-01-07', views: 156, submissions: 19 },
    ];

    const sourceData = [
        { name: 'Directo', value: 45, color: '#3B82F6' },
        { name: 'Redes Sociales', value: 25, color: '#10B981' },
        { name: 'Referencias', value: 20, color: '#F59E0B' },
        { name: 'Orgánico', value: 10, color: '#EF4444' },
    ];

    const stepAnalysis = funnel.steps.map((step, index) => ({
        step: step.title,
        views: Math.max(100 - index * 15, 20),
        completions: Math.max(85 - index * 12, 15),
        dropOff: ((Math.max(100 - index * 15, 20) - Math.max(85 - index * 12, 15)) / Math.max(100 - index * 15, 20)) * 100
    }));

    const generateSolutionChartData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];

            const dayEvents = solutionEvents.filter(event =>
                event.timestamp.toISOString().split('T')[0] === dateStr
            );

            return {
                date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                redirects: dayEvents.filter(e => e.event === 'redirect').length,
                conversions: dayEvents.filter(e => e.event === 'conversion').length
            };
        });

        return last7Days;
    };

    if (loading && !metrics) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
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
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={onBack}>
                        ← Volver
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics: {funnel.name}</h1>
                        <p className="text-gray-600">Análisis de rendimiento y conversión</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                    >
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="90d">Últimos 90 días</option>
                    </select>
                    <Button variant="outline" onClick={loadMetrics}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Vistas Totales</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {metrics?.views?.toLocaleString() || funnel.analytics.views.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600">+12% vs período anterior</p>
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
                            <p className="text-2xl font-bold text-gray-900">
                                {metrics?.submissions?.toLocaleString() || funnel.analytics.submissions.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600">+8% vs período anterior</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Target className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tasa de Conversión</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(metrics?.conversionRate || funnel.analytics.conversionRate).toFixed(1)}%
                            </p>
                            <p className="text-xs text-red-600">-2% vs período anterior</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tiempo Promedio</p>
                            <p className="text-2xl font-bold text-gray-900">3:42</p>
                            <p className="text-xs text-gray-600">minutos en funnel</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Solution Integration Metrics */}
            {funnel.settings?.destination === 'solution' && funnel.settings?.solutionKey && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Métricas de Solución Empresarial</h3>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            {funnel.settings.solutionKey}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                                {solutionEvents.filter(e => e.event === 'redirect').length}
                            </p>
                            <p className="text-sm text-gray-600">Redireccionado a Solución</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                                {solutionEvents.filter(e => e.event === 'access_granted').length}
                            </p>
                            <p className="text-sm text-gray-600">Acceso Otorgado</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">
                                {solutionEvents.filter(e => e.event === 'conversion').length}
                            </p>
                            <p className="text-sm text-gray-600">Conversiones en Solución</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">
                                {solutionEvents.length > 0 ?
                                    ((solutionEvents.filter(e => e.event === 'conversion').length /
                                        solutionEvents.filter(e => e.event === 'redirect').length) * 100).toFixed(1)
                                    : '0.0'
                                }%
                            </p>
                            <p className="text-sm text-gray-600">Tasa de Conversión Solución</p>
                        </div>
                    </div>

                    {/* Solution Performance Chart */}
                    {solutionEvents.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-md font-medium text-gray-900 mb-3">Actividad en Solución (Últimos 7 días)</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={generateSolutionChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="redirects"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        name="Redirecciones"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="conversions"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        name="Conversiones"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
            )}

            {/* Charts */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="funnel">Análisis de Funnel</TabsTrigger>
                    <TabsTrigger value="sources">Fuentes de Tráfico</TabsTrigger>
                    {funnel.settings?.destination === 'solution' && (
                        <TabsTrigger value="solutions">Soluciones Empresariales</TabsTrigger>
                    )}
                    <TabsTrigger value="submissions">Conversiones</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Views vs Submissions */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Vistas vs Conversiones</h3>
                                <Badge variant="outline">Últimos 7 días</Badge>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="views" fill="#3B82F6" name="Vistas" />
                                    <Bar dataKey="submissions" fill="#10B981" name="Conversiones" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Conversion Trend */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Tendencia de Conversión</h3>
                                <Badge variant="outline">% de conversión</Badge>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value}%`, 'Conversión']} />
                                    <Line
                                        type="monotone"
                                        dataKey={(data) => ((data.submissions / data.views) * 100).toFixed(1)}
                                        stroke="#F59E0B"
                                        strokeWidth={2}
                                        name="Tasa de Conversión"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="funnel" className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Análisis por Pasos</h3>
                            <p className="text-sm text-gray-600">Identifica dónde pierdes más usuarios</p>
                        </div>

                        <div className="space-y-4">
                            {stepAnalysis.map((step, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">
                                            Paso {index + 1}: {step.step}
                                        </h4>
                                        <Badge variant={step.dropOff > 30 ? 'destructive' : 'default'}>
                                            {step.dropOff.toFixed(1)}% abandono
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Vistas</p>
                                            <p className="text-xl font-bold text-gray-900">{step.views}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Completado</p>
                                            <p className="text-xl font-bold text-gray-900">{step.completions}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(step.completions / step.views) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="sources" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuentes de Tráfico</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle por Fuente</h3>
                            <div className="space-y-3">
                                {sourceData.map((source, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: source.color }}
                                            ></div>
                                            <span className="font-medium text-gray-900">{source.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{source.value}%</p>
                                            <p className="text-xs text-gray-600">
                                                {Math.round((funnel.analytics.views * source.value) / 100)} vistas
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                {funnel.settings?.destination === 'solution' && (
                    <TabsContent value="solutions" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Solution Performance Overview */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Rendimiento de Solución: {funnel.settings.solutionKey}
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm text-gray-700">Total de Redirecciones</span>
                                        <span className="font-bold text-blue-600">
                                            {solutionEvents.filter(e => e.event === 'redirect').length}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm text-gray-700">Accesos Otorgados</span>
                                        <span className="font-bold text-green-600">
                                            {solutionEvents.filter(e => e.event === 'access_granted').length}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="text-sm text-gray-700">Conversiones en Solución</span>
                                        <span className="font-bold text-purple-600">
                                            {solutionEvents.filter(e => e.event === 'conversion').length}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="text-sm text-gray-700">Tasa de Conversión</span>
                                        <span className="font-bold text-orange-600">
                                            {solutionEvents.filter(e => e.event === 'redirect').length > 0 ?
                                                ((solutionEvents.filter(e => e.event === 'conversion').length /
                                                    solutionEvents.filter(e => e.event === 'redirect').length) * 100).toFixed(1)
                                                : '0.0'
                                            }%
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Solution Events Timeline */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Temporal</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={generateSolutionChartData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="redirects"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            name="Redirecciones"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="conversions"
                                            stroke="#10B981"
                                            strokeWidth={2}
                                            name="Conversiones"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>

                        {/* Recent Solution Events */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Eventos Recientes de Solución</h3>
                                <Badge variant="outline">
                                    {solutionEvents.length} eventos registrados
                                </Badge>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Evento</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Usuario</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Detalles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solutionEvents.slice(0, 10).map((event) => (
                                            <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {new Date(event.timestamp).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant={
                                                            event.event === 'conversion' ? 'default' :
                                                                event.event === 'access_granted' ? 'secondary' :
                                                                    event.event === 'redirect' ? 'outline' :
                                                                        'destructive'
                                                        }
                                                    >
                                                        {event.event}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {event.userId || 'Anónimo'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {event.metadata && typeof event.metadata === 'object' ?
                                                        Object.entries(event.metadata)
                                                            .slice(0, 2)
                                                            .map(([key, value]) => `${key}: ${value}`)
                                                            .join(', ') || '-'
                                                        : '-'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {solutionEvents.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No hay eventos de solución registrados</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                )}

                <TabsContent value="submissions" className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Conversiones Recientes</h3>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar Leads
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Teléfono</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Fuente</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.slice(0, 10).map((submission) => (
                                        <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                {new Date(submission.submittedAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                {submission.email || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                {submission.phone || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {submission.source}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    variant={
                                                        submission.status === 'converted' ? 'default' :
                                                            submission.status === 'contacted' ? 'secondary' :
                                                                'outline'
                                                    }
                                                >
                                                    {submission.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {submissions.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No hay conversiones aún</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};