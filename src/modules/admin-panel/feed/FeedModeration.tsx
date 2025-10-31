import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Eye,
    EyeOff,
    Trash2,
    RotateCcw,
    AlertTriangle,
    Calendar,
    User,
    Building,
    ChevronDown,
    RefreshCw
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { FeedItemCard } from './FeedItemCard.tsx';
import { moderationService, type FeedStats } from './services/moderationService';
import { FeedPost } from '../../user-panel/services/feedService';
import { useAuth } from '../../../hooks/useAuth';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface FilterState {
    status: 'all' | 'visible' | 'hidden' | 'reported';
    appSource: string;
    dateRange: { start: Date | null; end: Date | null };
    searchText: string;
}

export const FeedModeration: React.FC = () => {
    const { user } = useAuth();
    const { isAdmin, adminProfile } = useAdminAuth();

    // State
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [stats, setStats] = useState<FeedStats | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        appSource: '',
        dateRange: { start: null, end: null },
        searchText: ''
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Access control
    useEffect(() => {
        if (!isAdmin || !adminProfile) {
            window.location.href = '/user-panel';
        }
    }, [isAdmin, adminProfile]);

    // Load posts based on filters
    const loadPosts = useCallback(async () => {
        if (!isAdmin) return;

        try {
            setLoading(true);
            const filterParams = {
                status: filters.status,
                appSource: filters.appSource || undefined,
                searchText: filters.searchText || undefined,
                dateRange: (filters.dateRange.start && filters.dateRange.end)
                    ? { start: filters.dateRange.start, end: filters.dateRange.end }
                    : undefined,
                limit: 50
            };

            const fetchedPosts = await moderationService.getPostsForModeration(filterParams);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error('❌ Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, isAdmin]);

    // Load statistics
    const loadStats = useCallback(async () => {
        if (!isAdmin) return;

        try {
            const feedStats = await moderationService.getFeedStats();
            setStats(feedStats);
        } catch (error) {
            console.error('❌ Error loading stats:', error);
        }
    }, [isAdmin]);

    // Refresh data
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadPosts(), loadStats()]);
        setRefreshing(false);
    };

    // Filter handlers
    const handleFilterChange = (newFilters: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            appSource: '',
            dateRange: { start: null, end: null },
            searchText: ''
        });
    };

    // Load data on component mount and filter changes
    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Real-time updates
    useEffect(() => {
        if (!isAdmin) return;

        const unsubscribe = moderationService.listenToPostsChanges(
            (updatedPosts) => {
                setPosts(updatedPosts);
                loadStats(); // Refresh stats when posts change
            },
            {
                status: filters.status,
                limit: 50
            }
        );

        return unsubscribe;
    }, [isAdmin, filters.status, loadStats]);

    if (!isAdmin || !adminProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
                    <p className="text-gray-600">No tienes permisos para acceder al panel de moderación.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Moderación del Feed</h1>
                            <p className="text-sm text-gray-600">
                                Gestiona y modera las publicaciones del feed social
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''
                                    }`} />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar - Stats */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            {stats && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <Card className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Posts</p>
                                                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                                            </div>
                                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Eye className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Posts Activos</p>
                                                <p className="text-2xl font-bold text-green-600">{stats.activePosts}</p>
                                            </div>
                                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Eye className="h-5 w-5 text-green-600" />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Posts Ocultos</p>
                                                <p className="text-2xl font-bold text-yellow-600">{stats.hiddenPosts}</p>
                                            </div>
                                            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                <EyeOff className="h-5 w-5 text-yellow-600" />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Posts Reportados</p>
                                                <p className="text-2xl font-bold text-red-600">{stats.reportedPosts}</p>
                                            </div>
                                            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Reportes Pendientes</p>
                                                <p className="text-2xl font-bold text-orange-600">{stats.pendingReports}</p>
                                            </div>
                                            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Engagement Promedio</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {stats.averageEngagement.toFixed(1)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Total: {stats.totalEngagement}
                                            </p>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-12 lg:col-span-9">
                        {/* Filters Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6"
                                >
                                    <Card className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {/* Search */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Buscar
                                                </label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        placeholder="Texto o autor..."
                                                        value={filters.searchText}
                                                        onChange={(e) => handleFilterChange({ searchText: e.target.value })}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>

                                            {/* Status Filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Estado
                                                </label>
                                                <select
                                                    value={filters.status}
                                                    onChange={(e) => handleFilterChange({
                                                        status: e.target.value as FilterState['status']
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="all">Todos</option>
                                                    <option value="visible">Visibles</option>
                                                    <option value="hidden">Ocultos</option>
                                                    <option value="reported">Reportados</option>
                                                </select>
                                            </div>

                                            {/* App Source Filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Origen
                                                </label>
                                                <select
                                                    value={filters.appSource}
                                                    onChange={(e) => handleFilterChange({ appSource: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Todas las apps</option>
                                                    <option value="mundero-web">Mundero Web</option>
                                                    <option value="mundero-mobile">Mundero Mobile</option>
                                                    <option value="mundero-admin">Admin Panel</option>
                                                </select>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-end">
                                                <Button
                                                    variant="outline"
                                                    onClick={clearFilters}
                                                    className="w-full"
                                                >
                                                    Limpiar Filtros
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Posts Grid */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Card key={i} className="p-6">
                                            <div className="animate-pulse">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                                    <div className="space-y-2">
                                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : posts.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <Search className="h-16 w-16 mx-auto" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No se encontraron publicaciones
                                    </h3>
                                    <p className="text-gray-600">
                                        Intenta ajustar los filtros para ver más resultados.
                                    </p>
                                </Card>
                            ) : (
                                <AnimatePresence>
                                    {posts.map((post, index) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <FeedItemCard
                                                post={post}
                                                onActionComplete={handleRefresh}
                                                adminInfo={{
                                                    uid: adminProfile.uid,
                                                    name: adminProfile.displayName || adminProfile.email,
                                                    email: adminProfile.email
                                                }}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Load More */}
                        {posts.length > 0 && posts.length >= 50 && (
                            <div className="mt-8 text-center">
                                <Button
                                    variant="outline"
                                    onClick={loadPosts}
                                    disabled={loading}
                                >
                                    Cargar más publicaciones
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};