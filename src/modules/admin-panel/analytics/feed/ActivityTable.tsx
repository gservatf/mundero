import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    Search,
    ExternalLink,
    Heart,
    MessageCircle,
    Share2,
    Calendar,
    User,
    Building,
    TrendingUp,
    SortAsc,
    SortDesc
} from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { type FeedAnalytics, type TopPost } from './analyticsService';
import { formatTimeAgo } from '../../../../lib/utils';

interface ActivityTableProps {
    analytics: FeedAnalytics;
    onPostClick: (postId: string) => void;
}

type SortField = 'likes' | 'comments' | 'shares' | 'totalEngagement' | 'createdAt' | 'authorName';
type SortDirection = 'asc' | 'desc';

interface SortState {
    field: SortField;
    direction: SortDirection;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
    analytics,
    onPostClick
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortState, setSortState] = useState<SortState>({
        field: 'totalEngagement',
        direction: 'desc'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [showAllPosts, setShowAllPosts] = useState(false);

    const postsPerPage = 10;

    // Filter and sort posts
    const filteredAndSortedPosts = useMemo(() => {
        let posts = [...analytics.topPosts];

        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            posts = posts.filter(post =>
                post.authorName.toLowerCase().includes(term) ||
                post.content.toLowerCase().includes(term) ||
                (post.companyName && post.companyName.toLowerCase().includes(term))
            );
        }

        // Apply sorting
        posts.sort((a, b) => {
            let aValue: any = a[sortState.field];
            let bValue: any = b[sortState.field];

            // Handle date sorting
            if (sortState.field === 'createdAt') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            // Handle string sorting
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortState.direction === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return posts;
    }, [analytics.topPosts, searchTerm, sortState]);

    // Paginate posts
    const paginatedPosts = useMemo(() => {
        if (showAllPosts) {
            return filteredAndSortedPosts;
        }

        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        return filteredAndSortedPosts.slice(startIndex, endIndex);
    }, [filteredAndSortedPosts, currentPage, showAllPosts]);

    const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);

    // Handle sorting
    const handleSort = (field: SortField) => {
        setSortState(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    // Get sort icon
    const getSortIcon = (field: SortField) => {
        if (sortState.field !== field) {
            return <SortAsc className="h-4 w-4 text-gray-400" />;
        }
        return sortState.direction === 'desc'
            ? <SortDesc className="h-4 w-4 text-blue-600" />
            : <SortAsc className="h-4 w-4 text-blue-600" />;
    };

    // Format engagement score
    const getEngagementScore = (post: TopPost): string => {
        return post.totalEngagement.toLocaleString('es-ES');
    };

    // Get engagement level badge
    const getEngagementBadge = (engagement: number) => {
        if (engagement >= 50) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Alto</Badge>;
        } else if (engagement >= 20) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medio</Badge>;
        } else {
            return <Badge variant="outline" className="bg-gray-100 text-gray-600">Bajo</Badge>;
        }
    };

    return (
        <Card className="p-6">
            <div className="mb-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Publicaciones Más Activas
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredAndSortedPosts.length} publicaciones encontradas
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAllPosts(!showAllPosts)}
                        >
                            {showAllPosts ? 'Mostrar paginado' : 'Mostrar todas'}
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por autor, contenido o empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSort('authorName')}
                                    className="flex items-center font-medium text-gray-700 dark:text-gray-300"
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Autor
                                    {getSortIcon('authorName')}
                                </Button>
                            </th>
                            <th className="text-left py-3 px-4">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Contenido</span>
                            </th>
                            <th className="text-left py-3 px-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSort('likes')}
                                    className="flex items-center font-medium text-gray-700 dark:text-gray-300"
                                >
                                    <Heart className="h-4 w-4 mr-2" />
                                    Likes
                                    {getSortIcon('likes')}
                                </Button>
                            </th>
                            <th className="text-left py-3 px-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSort('comments')}
                                    className="flex items-center font-medium text-gray-700 dark:text-gray-300"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Comentarios
                                    {getSortIcon('comments')}
                                </Button>
                            </th>
                            <th className="text-left py-3 px-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSort('shares')}
                                    className="flex items-center font-medium text-gray-700 dark:text-gray-300"
                                >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Compartidos
                                    {getSortIcon('shares')}
                                </Button>
                            </th>
                            <th className="text-left py-3 px-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSort('totalEngagement')}
                                    className="flex items-center font-medium text-gray-700 dark:text-gray-300"
                                >
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Total
                                    {getSortIcon('totalEngagement')}
                                </Button>
                            </th>
                            <th className="text-left py-3 px-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSort('createdAt')}
                                    className="flex items-center font-medium text-gray-700 dark:text-gray-300"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Fecha
                                    {getSortIcon('createdAt')}
                                </Button>
                            </th>
                            <th className="text-left py-3 px-4">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPosts.map((post, index) => (
                            <motion.tr
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                                <td className="py-4 px-4">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {post.authorName}
                                        </div>
                                        {post.companyName && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                <Building className="h-3 w-3 mr-1" />
                                                {post.companyName}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="max-w-xs">
                                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                            {post.content}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center text-red-600">
                                        <Heart className="h-4 w-4 mr-1" />
                                        <span className="font-medium">{post.likes}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center text-blue-600">
                                        <MessageCircle className="h-4 w-4 mr-1" />
                                        <span className="font-medium">{post.comments}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center text-green-600">
                                        <Share2 className="h-4 w-4 mr-1" />
                                        <span className="font-medium">{post.shares}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {getEngagementScore(post)}
                                        </span>
                                        {getEngagementBadge(post.totalEngagement)}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatTimeAgo(post.createdAt)}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onPostClick(post.id)}
                                        className="flex items-center text-blue-600 hover:text-blue-700"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        Ver
                                    </Button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {paginatedPosts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                            <Search className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            No se encontraron publicaciones
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Intenta cambiar los filtros de búsqueda
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!showAllPosts && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {((currentPage - 1) * postsPerPage) + 1} a {Math.min(currentPage * postsPerPage, filteredAndSortedPosts.length)} de {filteredAndSortedPosts.length} publicaciones
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {page}
                                    </Button>
                                );
                            })}

                            {totalPages > 5 && (
                                <>
                                    <span className="text-gray-500">...</span>
                                    <Button
                                        variant={currentPage === totalPages ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {totalPages}
                                    </Button>
                                </>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};