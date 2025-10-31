import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Filter, Search, Plus, AlertCircle } from 'lucide-react';
import { PostCard } from './PostCard';
import { useFeed } from '../hooks/useFeed';
import { useAuth } from '../../../../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { FeedPost } from '../services/feedService';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';

interface PostFeedProps {
    mode?: 'global' | 'personal' | 'public';
    className?: string;
    showCreatePost?: boolean;
    enableSearch?: boolean;
    enableFilters?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

type FeedFilter = 'all' | 'text' | 'media' | 'shared' | 'event';

export const PostFeed: React.FC<PostFeedProps> = ({
    mode = 'global',
    className = '',
    showCreatePost = true,
    enableSearch = true,
    enableFilters = true,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
}) => {
    const { user } = useAuth();
    const { userProfile } = useProfile();

    // Feed hook
    const {
        posts,
        loading,
        error,
        hasMore,
        totalCount,
        isLoadingMore,
        isCreating,
        createPost,
        refreshFeed,
        loadMore,
        updateFilters,
        deletePost: deleteFeedPost,
        currentFilters
    } = useFeed({ mode, limitCount: 20 });

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<FeedFilter>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filteredPosts, setFilteredPosts] = useState<FeedPost[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');

    // Refs
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Check user permissions
    const isAuthenticated = !!user && !!userProfile;
    const canCreatePost = isAuthenticated;

    // Auto-refresh setup
    useEffect(() => {
        if (autoRefresh && refreshInterval > 0) {
            refreshIntervalRef.current = setInterval(() => {
                console.log('🔄 Auto-refreshing feed...');
                handleRefresh();
            }, refreshInterval);

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [autoRefresh, refreshInterval]);

    // Filter and search posts
    useEffect(() => {
        let filtered = [...posts];

        // Apply type filter
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(post => post.type === selectedFilter);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(post => {
                const content = post.content.text?.toLowerCase() || '';
                const authorName = post.authorName.toLowerCase();
                const tags = post.content.tags?.join(' ').toLowerCase() || '';

                return content.includes(query) ||
                    authorName.includes(query) ||
                    tags.includes(query);
            });
        }

        setFilteredPosts(filtered);
    }, [posts, selectedFilter, searchQuery]);

    // Infinite scroll setup
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !isLoadingMore && !loading) {
                    console.log('📄 Loading more posts due to intersection...');
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [hasMore, isLoadingMore, loading, loadMore]);

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {
            await refreshFeed();
        } catch (error) {
            console.error('Error refreshing feed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [refreshFeed, isRefreshing]);

    // Handle create post
    const handleCreatePost = useCallback(async () => {
        if (!canCreatePost || !newPostContent.trim() || !userProfile) return;

        try {
            const postData = {
                content: {
                    text: newPostContent.trim(),
                    mediaUrls: [],
                    mediaTypes: [],
                    tags: [],
                    mentions: []
                },
                visibility: 'public' as const,
                type: 'text' as const,
                authorName: userProfile.displayName || userProfile.email || 'Usuario',
                authorAvatar: userProfile.photoURL,
                authorUsername: userProfile.email?.split('@')[0],
                metadata: {
                    isEdited: false
                }
            };

            await createPost(postData);
            setNewPostContent('');
            setShowCreateDialog(false);
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }, [canCreatePost, newPostContent, userProfile, createPost]);

    // Handle post update
    const handlePostUpdate = useCallback((postId: string, updates: Partial<FeedPost>) => {
        // Updates are handled by the useFeed hook automatically
        console.log('📝 Post updated:', postId);
    }, []);

    // Handle post delete
    const handlePostDelete = useCallback(async (postId: string) => {
        try {
            await deleteFeedPost(postId);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }, [deleteFeedPost]);

    // Filter options
    const filterOptions: { value: FeedFilter; label: string; count?: number }[] = [
        { value: 'all', label: 'Todos', count: posts.length },
        { value: 'text', label: 'Texto', count: posts.filter(p => p.type === 'text').length },
        { value: 'media', label: 'Media', count: posts.filter(p => p.type === 'media').length },
        { value: 'shared', label: 'Compartidos', count: posts.filter(p => p.type === 'shared').length },
        { value: 'event', label: 'Eventos', count: posts.filter(p => p.type === 'event').length },
    ];

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200">
                        <div className="h-8 bg-gray-300 rounded w-20"></div>
                        <div className="h-8 bg-gray-300 rounded w-24"></div>
                        <div className="h-8 bg-gray-300 rounded w-20"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Feed Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'personal' ? 'Mi Feed' : mode === 'public' ? 'Feed Público' : 'Feed Global'}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {totalCount} {totalCount === 1 ? 'publicación' : 'publicaciones'}
                        {searchQuery && ` · Filtrando por "${searchQuery}"`}
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing || loading}
                        className="flex items-center space-x-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Actualizar</span>
                    </Button>

                    {showCreatePost && canCreatePost && (
                        <Button
                            size="sm"
                            onClick={() => setShowCreateDialog(true)}
                            disabled={isCreating}
                            className="flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Crear Post</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            {(enableSearch || enableFilters) && (
                <div className="flex flex-col sm:flex-row gap-4">
                    {enableSearch && (
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Buscar en el feed..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    )}

                    {enableFilters && (
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.map((option) => (
                                    <Button
                                        key={option.value}
                                        variant={selectedFilter === option.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedFilter(option.value)}
                                        className="flex items-center space-x-1"
                                    >
                                        <span>{option.label}</span>
                                        {option.count !== undefined && (
                                            <Badge variant="secondary" className="ml-1 text-xs">
                                                {option.count}
                                            </Badge>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error State */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                            <h3 className="font-medium text-red-800">Error al cargar el feed</h3>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="mt-3"
                    >
                        Intentar de nuevo
                    </Button>
                </motion.div>
            )}

            {/* Posts Feed */}
            {loading && posts.length === 0 ? (
                <LoadingSkeleton />
            ) : (
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {filteredPosts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1,
                                    ease: "easeOut"
                                }}
                                layout
                            >
                                <PostCard
                                    post={post}
                                    onPostUpdate={handlePostUpdate}
                                    onPostDelete={handlePostDelete}
                                    showComments={true}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* No Posts Message */}
                    {!loading && filteredPosts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchQuery ? 'No se encontraron publicaciones' : 'No hay publicaciones'}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {searchQuery
                                        ? 'Intenta cambiar tu búsqueda o filtros'
                                        : 'Sé el primero en compartir algo con la comunidad'
                                    }
                                </p>
                                {showCreatePost && canCreatePost && !searchQuery && (
                                    <Button onClick={() => setShowCreateDialog(true)}>
                                        Crear primera publicación
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Load More Trigger */}
                    {hasMore && (
                        <div ref={loadMoreRef} className="flex justify-center py-8">
                            {isLoadingMore && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Cargando más publicaciones...</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* End of Feed */}
                    {!hasMore && filteredPosts.length > 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                Has llegado al final del feed
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreateDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Crear nueva publicación
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCreateDialog(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                        {(userProfile?.displayName || userProfile?.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {userProfile?.displayName || userProfile?.email || 'Usuario'}
                                        </p>
                                        <p className="text-sm text-gray-500">Publicación pública</p>
                                    </div>
                                </div>

                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="¿Qué quieres compartir?"
                                    rows={6}
                                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        {newPostContent.length}/500 caracteres
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowCreateDialog(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={handleCreatePost}
                                            disabled={!newPostContent.trim() || isCreating || newPostContent.length > 500}
                                        >
                                            {isCreating ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            Publicar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};