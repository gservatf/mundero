// ActivityLog - Panel completo de historial de reputación y actividad
// Muestra logs detallados, filtros avanzados, estadísticas y exportación

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiFilter,
    FiDownload,
    FiCalendar,
    FiTrendingUp,
    FiUser,
    FiActivity,
    FiBarChart,
    FiClock,
    FiZap,
    FiHeart,
    FiMessageSquare,
    FiUsers,
    FiStar,
    FiAward,
    FiRefreshCw,
    FiChevronDown,
    FiChevronUp
} from 'react-icons/fi';
import { ReputationLog, ReputationActionType } from '../types';
import { reputationService } from '../reputationService';

interface ActivityLogProps {
    userId?: string;
    showUserFilter?: boolean;
    showStats?: boolean;
    maxItems?: number;
    className?: string;
}

interface FilterOptions {
    dateRange: 'today' | 'week' | 'month' | 'all';
    actionType: ReputationActionType | 'all';
    sortBy: 'date' | 'points' | 'action';
    sortOrder: 'asc' | 'desc';
    minPoints?: number;
    maxPoints?: number;
}

interface ActivityStats {
    totalActions: number;
    totalPoints: number;
    topAction: ReputationActionType | null;
    averagePerDay: number;
    streakDays: number;
    weeklyTrend: number;
}

// Iconos por tipo de acción
const ACTION_ICONS: Record<ReputationActionType, React.ComponentType<{ className?: string }>> = {
    'post_create': FiMessageSquare,
    'post_like': FiHeart,
    'post_comment': FiMessageSquare,
    'post_share': FiZap,
    'community_join': FiUsers,
    'community_create': FiUsers,
    'event_attend': FiCalendar,
    'profile_complete': FiUser,
    'referral_approved': FiStar,
    // Onboarding actions
    'onboarding_started': FiActivity,
    'onboarding_step_completed': FiAward,
    'step_completed': FiAward,
    'quest_completed': FiTrendingUp,
    'reward_claimed': FiStar,
    'step_skipped': FiRefreshCw,
    'onboarding_abandoned': FiClock
};

// Colores por tipo de acción
const ACTION_COLORS: Record<ReputationActionType, string> = {
    'post_create': '#3B82F6',
    'post_like': '#EF4444',
    'post_comment': '#8B5CF6',
    'post_share': '#F59E0B',
    'community_join': '#10B981',
    'community_create': '#059669',
    'event_attend': '#6366F1',
    'profile_complete': '#EC4899',
    'referral_approved': '#F97316',
    // Onboarding actions
    'onboarding_started': '#22D3EE',
    'onboarding_step_completed': '#34D399',
    'step_completed': '#34D399',
    'quest_completed': '#FBBF24',
    'reward_claimed': '#F472B6',
    'step_skipped': '#94A3B8',
    'onboarding_abandoned': '#EF4444'
};

// Textos descriptivos por acción
const ACTION_DESCRIPTIONS: Record<ReputationActionType, string> = {
    'post_create': 'Publicación creada',
    'post_like': 'Me gusta dado',
    'post_comment': 'Comentario realizado',
    'post_share': 'Contenido compartido',
    'community_join': 'Se unió a comunidad',
    'community_create': 'Comunidad creada',
    'event_attend': 'Asistió a evento',
    'profile_complete': 'Perfil completado',
    'referral_approved': 'Referido aprobado',
    // Onboarding actions
    'onboarding_started': 'Onboarding iniciado',
    'onboarding_step_completed': 'Paso de onboarding completado',
    'step_completed': 'Paso completado',
    'quest_completed': 'Quest completado',
    'reward_claimed': 'Recompensa reclamada',
    'step_skipped': 'Paso omitido',
    'onboarding_abandoned': 'Onboarding abandonado'
};

export const ActivityLog: React.FC<ActivityLogProps> = ({
    userId,
    showUserFilter = false,
    showStats = true,
    maxItems = 50,
    className = ''
}) => {
    const [logs, setLogs] = useState<ReputationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const [filters, setFilters] = useState<FilterOptions>({
        dateRange: 'week',
        actionType: 'all',
        sortBy: 'date',
        sortOrder: 'desc'
    });

    // Cargar logs
    useEffect(() => {
        loadLogs();
    }, [userId, filters]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            setError(null);

            // Simular carga de logs - en producción usar reputationService
            const mockLogs: ReputationLog[] = [
                {
                    id: '1',
                    userId: userId || 'current-user',
                    action: 'post_create',
                    points: 10,
                    createdAt: Date.now() - 1000 * 60 * 30, // 30 min ago
                    meta: { postId: 'post-123', title: 'Mi primera publicación' }
                },
                {
                    id: '2',
                    userId: userId || 'current-user',
                    action: 'post_like',
                    points: 2,
                    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
                    meta: { postId: 'post-456', authorId: 'user-789' }
                },
                {
                    id: '3',
                    userId: userId || 'current-user',
                    action: 'community_join',
                    points: 15,
                    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
                    meta: { communityId: 'tech-community', communityName: 'Tecnología' }
                },
                {
                    id: '4',
                    userId: userId || 'current-user',
                    action: 'event_attend',
                    points: 25,
                    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
                    meta: { eventId: 'webinar-123', eventTitle: 'Webinar de React' }
                },
                {
                    id: '5',
                    userId: userId || 'current-user',
                    action: 'referral_approved',
                    points: 50,
                    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
                    meta: { referredUserId: 'new-user-456', referredUserName: 'María García' }
                }
            ];

            // Aplicar filtros
            let filteredLogs = mockLogs;

            // Filtro por fecha
            const now = Date.now();
            const dateFilters = {
                today: now - 24 * 60 * 60 * 1000,
                week: now - 7 * 24 * 60 * 60 * 1000,
                month: now - 30 * 24 * 60 * 60 * 1000,
                all: 0
            };

            if (filters.dateRange !== 'all') {
                filteredLogs = filteredLogs.filter(log => log.createdAt >= dateFilters[filters.dateRange]);
            }

            // Filtro por tipo de acción
            if (filters.actionType !== 'all') {
                filteredLogs = filteredLogs.filter(log => log.action === filters.actionType);
            }

            // Filtro por puntos
            if (filters.minPoints) {
                filteredLogs = filteredLogs.filter(log => log.points >= filters.minPoints!);
            }
            if (filters.maxPoints) {
                filteredLogs = filteredLogs.filter(log => log.points <= filters.maxPoints!);
            }

            // Ordenamiento
            filteredLogs.sort((a, b) => {
                let comparison = 0;

                switch (filters.sortBy) {
                    case 'date':
                        comparison = a.createdAt - b.createdAt;
                        break;
                    case 'points':
                        comparison = a.points - b.points;
                        break;
                    case 'action':
                        comparison = a.action.localeCompare(b.action);
                        break;
                }

                return filters.sortOrder === 'desc' ? -comparison : comparison;
            });

            // Limitar resultados
            filteredLogs = filteredLogs.slice(0, maxItems);

            setLogs(filteredLogs);
        } catch (err) {
            console.error('Error loading activity logs:', err);
            setError('Error al cargar el historial de actividad');
        } finally {
            setLoading(false);
        }
    };

    // Calcular estadísticas
    const stats = useMemo((): ActivityStats => {
        const totalActions = logs.length;
        const totalPoints = logs.reduce((sum, log) => sum + log.points, 0);

        const actionCounts: Record<string, number> = {};
        logs.forEach(log => {
            actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
        });

        const topAction = Object.keys(actionCounts).reduce((a, b) =>
            actionCounts[a] > actionCounts[b] ? a : b,
            Object.keys(actionCounts)[0]
        ) as ReputationActionType || null;

        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentLogs = logs.filter(log => log.createdAt >= oneWeekAgo);
        const averagePerDay = recentLogs.length / 7;

        // Calcular racha (días consecutivos con actividad)
        const today = new Date();
        let streakDays = 0;
        const currentDate = new Date(today);

        while (streakDays < 30) { // Máximo 30 días
            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);

            const hasActivity = logs.some(log =>
                log.createdAt >= dayStart.getTime() && log.createdAt <= dayEnd.getTime()
            );

            if (hasActivity) {
                streakDays++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Tendencia semanal (comparar esta semana vs semana anterior)
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const lastWeekLogs = logs.filter(log =>
            log.createdAt >= twoWeeksAgo && log.createdAt < oneWeekAgo
        );
        const thisWeekLogs = logs.filter(log => log.createdAt >= oneWeekAgo);

        const weeklyTrend = lastWeekLogs.length > 0
            ? ((thisWeekLogs.length - lastWeekLogs.length) / lastWeekLogs.length) * 100
            : 0;

        return {
            totalActions,
            totalPoints,
            topAction,
            averagePerDay,
            streakDays,
            weeklyTrend
        };
    }, [logs]);

    // Exportar a CSV
    const exportToCSV = () => {
        const headers = ['Fecha', 'Hora', 'Acción', 'Puntos', 'Detalles'];
        const csvData = logs.map(log => [
            new Date(log.createdAt).toLocaleDateString(),
            new Date(log.createdAt).toLocaleTimeString(),
            ACTION_DESCRIPTIONS[log.action],
            log.points.toString(),
            JSON.stringify(log.meta || {})
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `actividad_reputacion_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - timestamp;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) {
            return `Hace ${diffMins} minutos`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours} horas`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} días`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getMetaDescription = (log: ReputationLog) => {
        if (!log.meta) return '';

        switch (log.action) {
            case 'post_create':
                return log.meta.title || 'Nueva publicación';
            case 'community_join':
                return `Comunidad: ${log.meta.communityName || 'Sin nombre'}`;
            case 'event_attend':
                return log.meta.eventTitle || 'Evento';
            case 'referral_approved':
                return `Referido: ${log.meta.referredUserName || 'Usuario'}`;
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <FiRefreshCw className="w-8 h-8 text-blue-500" />
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <p className="text-red-800">{error}</p>
                <button
                    onClick={loadLogs}
                    className="mt-2 text-red-600 hover:text-red-800 font-medium"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Actividad de Reputación</h2>
                        <p className="text-gray-600">Historial completo de acciones y puntos ganados</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Botón de filtros */}
                        <motion.button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showFilters
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiFilter className="w-4 h-4" />
                            <span>Filtros</span>
                            {showFilters ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                        </motion.button>

                        {/* Botón de exportar */}
                        <motion.button
                            onClick={exportToCSV}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiDownload className="w-4 h-4" />
                            <span>Exportar CSV</span>
                        </motion.button>
                    </div>
                </div>

                {/* Estadísticas */}
                {showStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-50 rounded-lg p-4"
                        >
                            <div className="flex items-center space-x-2">
                                <FiActivity className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold text-blue-900">{stats.totalActions}</p>
                                    <p className="text-blue-600 text-sm">Acciones totales</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-green-50 rounded-lg p-4"
                        >
                            <div className="flex items-center space-x-2">
                                <FiZap className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-green-900">{stats.totalPoints}</p>
                                    <p className="text-green-600 text-sm">Puntos ganados</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-purple-50 rounded-lg p-4"
                        >
                            <div className="flex items-center space-x-2">
                                <FiTrendingUp className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="text-2xl font-bold text-purple-900">{stats.streakDays}</p>
                                    <p className="text-purple-600 text-sm">Días de racha</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-orange-50 rounded-lg p-4"
                        >
                            <div className="flex items-center space-x-2">
                                <FiBarChart className="w-5 h-5 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold text-orange-900">
                                        {stats.weeklyTrend > 0 ? '+' : ''}{stats.weeklyTrend.toFixed(0)}%
                                    </p>
                                    <p className="text-orange-600 text-sm">Tendencia semanal</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Panel de filtros */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50 rounded-lg p-4 mt-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Rango de fechas */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Período
                                    </label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                    >
                                        <option value="today">Hoy</option>
                                        <option value="week">Esta semana</option>
                                        <option value="month">Este mes</option>
                                        <option value="all">Todo el tiempo</option>
                                    </select>
                                </div>

                                {/* Tipo de acción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de acción
                                    </label>
                                    <select
                                        value={filters.actionType}
                                        onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value as any }))}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                    >
                                        <option value="all">Todas</option>
                                        {Object.entries(ACTION_DESCRIPTIONS).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ordenamiento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ordenar por
                                    </label>
                                    <select
                                        value={`${filters.sortBy}_${filters.sortOrder}`}
                                        onChange={(e) => {
                                            const [sortBy, sortOrder] = e.target.value.split('_');
                                            setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
                                        }}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                    >
                                        <option value="date_desc">Fecha (más reciente)</option>
                                        <option value="date_asc">Fecha (más antiguo)</option>
                                        <option value="points_desc">Puntos (mayor)</option>
                                        <option value="points_asc">Puntos (menor)</option>
                                        <option value="action_asc">Acción (A-Z)</option>
                                    </select>
                                </div>

                                {/* Botón reset */}
                                <div className="flex items-end">
                                    <button
                                        onClick={() => setFilters({
                                            dateRange: 'week',
                                            actionType: 'all',
                                            sortBy: 'date',
                                            sortOrder: 'desc'
                                        })}
                                        className="w-full p-2 text-gray-600 hover:text-gray-800 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Lista de actividades */}
            <div className="p-6">
                {logs.length === 0 ? (
                    <div className="text-center py-8">
                        <FiActivity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No se encontraron actividades para los filtros seleccionados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log, index) => {
                            const IconComponent = ACTION_ICONS[log.action];
                            const isExpanded = expandedItem === log.id;

                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setExpandedItem(isExpanded ? null : log.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: `${ACTION_COLORS[log.action]}20` }}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                            </div>                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {ACTION_DESCRIPTIONS[log.action]}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {getMetaDescription(log)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">+{log.points} pts</p>
                                                <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                                            </div>

                                            {isExpanded ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
                                        </div>
                                    </div>

                                    {/* Detalles expandidos */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-gray-100"
                                            >
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">ID de actividad:</p>
                                                        <p className="font-mono text-gray-700">{log.id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Fecha completa:</p>
                                                        <p className="text-gray-700">{new Date(log.createdAt).toLocaleString()}</p>
                                                    </div>
                                                    {log.meta && Object.keys(log.meta).length > 0 && (
                                                        <div className="col-span-2">
                                                            <p className="text-gray-500 mb-2">Detalles adicionales:</p>
                                                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                                                {JSON.stringify(log.meta, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};