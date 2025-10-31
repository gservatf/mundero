import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import {
    feedService,
    FeedPost
} from '../services/feedService';
import { useAuth } from '../../../hooks/useAuth';

type FeedMode = 'global' | 'personal' | 'public';

interface UseFeedState {
    posts: FeedPost[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    totalCount: number;
    isLoadingMore: boolean;
    isCreating: boolean;
}

interface CreatePostData {
    content: FeedPost['content'];
    visibility: FeedPost['visibility'];
    type: FeedPost['type'];
    metadata?: Partial<FeedPost['metadata']>;
    authorName: string;
    authorAvatar?: string;
    authorUsername?: string;
}

interface UseFeedFilters {
    mode?: FeedMode;
    limitCount?: number;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

interface UseFeedReturn extends UseFeedState {
    createPost: (postData: CreatePostData) => Promise<string>;
    refreshFeed: () => Promise<void>;
    loadMore: () => Promise<void>;
    updateFilters: (filters: UseFeedFilters) => void;
    deletePost: (postId: string) => Promise<void>;
    currentFilters: UseFeedFilters;
}

export const useFeed = (initialFilters?: UseFeedFilters): UseFeedReturn => {
    const { user } = useAuth();
    const [state, setState] = useState<UseFeedState>({
        posts: [],
        loading: false,
        error: null,
        hasMore: true,
        totalCount: 0,
        isLoadingMore: false,
        isCreating: false,
    });

    const [filters, setFilters] = useState<UseFeedFilters>({
        mode: 'global',
        limitCount: 20,
        ...initialFilters,
    });

    const lastDocRef = useRef<any>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Update state helper
    const updateState = useCallback((updates: Partial<UseFeedState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // Update loading state
    const setLoading = useCallback((loading: boolean) => {
        updateState({ loading });
    }, [updateState]);

    // Update error state
    const setError = useCallback((error: string | null) => {
        updateState({ error });
    }, [updateState]);

    // Create a new post
    const createPost = useCallback(async (postData: CreatePostData): Promise<string> => {
        if (!user?.id) {
            throw new Error('User not authenticated');
        }

        try {
            updateState({ isCreating: true, error: null });

            console.log('📝 Creating post via hook...', { uid: user.id, type: postData.type });

            const newPostId = await feedService.createPost(user.id, postData);

            console.log('✅ Post created successfully via hook');
            return newPostId;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
            console.error('❌ Error creating post via hook:', error);
            setError(errorMessage);
            throw error;
        } finally {
            updateState({ isCreating: false });
        }
    }, [user?.id, updateState, setError]);

    // Load feed data
    const loadFeed = useCallback(async (isLoadMore = false): Promise<void> => {
        if (!isLoadMore) {
            setLoading(true);
            lastDocRef.current = null;
        } else {
            updateState({ isLoadingMore: true });
        }

        try {
            setError(null);

            console.log('📡 Loading feed via hook...', {
                mode: filters.mode,
                isLoadMore,
                uid: user?.id
            });

            let feedResult: {
                posts: FeedPost[];
                lastDoc?: any;
                hasMore: boolean;
            };

            // Choose the appropriate feed method based on mode
            switch (filters.mode) {
                case 'personal':
                    if (!user?.id) {
                        throw new Error('User not authenticated for personal feed');
                    }
                    feedResult = await feedService.getUserFeed(user.id, {
                        limitCount: filters.limitCount,
                        lastDoc: isLoadMore ? lastDocRef.current : undefined,
                    });
                    break;

                case 'public':
                case 'global':
                default:
                    feedResult = await feedService.getGlobalFeed({
                        limitCount: filters.limitCount,
                        lastDoc: isLoadMore ? lastDocRef.current : undefined,
                    });
                    break;
            }

            const { posts: newPosts, lastDoc, hasMore } = feedResult;
            lastDocRef.current = lastDoc;

            if (isLoadMore) {
                setState(prev => ({
                    ...prev,
                    posts: [...prev.posts, ...newPosts],
                    hasMore,
                    totalCount: prev.totalCount + newPosts.length,
                    isLoadingMore: false,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    posts: newPosts,
                    hasMore,
                    totalCount: newPosts.length,
                    loading: false,
                }));
            }

            console.log('✅ Feed loaded successfully via hook', {
                postsCount: newPosts.length,
                hasMore
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load feed';
            console.error('❌ Error loading feed via hook:', error);
            setError(errorMessage);

            if (isLoadMore) {
                updateState({ isLoadingMore: false });
            } else {
                setLoading(false);
            }
        }
    }, [filters, user?.id, setLoading, setError, updateState]);

    // Refresh feed
    const refreshFeed = useCallback(async (): Promise<void> => {
        console.log('🔄 Refreshing feed via hook...');
        await loadFeed(false);
    }, [loadFeed]);

    // Load more posts
    const loadMore = useCallback(async (): Promise<void> => {
        if (state.hasMore && !state.isLoadingMore && !state.loading) {
            console.log('📄 Loading more posts via hook...');
            await loadFeed(true);
        }
    }, [loadFeed, state.hasMore, state.isLoadingMore, state.loading]);

    // Update filters
    const updateFilters = useCallback((newFilters: UseFeedFilters) => {
        console.log('🎛️ Updating feed filters via hook...', newFilters);
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Delete a post
    const deletePost = useCallback(async (postId: string): Promise<void> => {
        if (!user?.id) {
            throw new Error('User not authenticated');
        }

        try {
            console.log('🗑️ Deleting post via hook...', { postId, uid: user.id });
            await feedService.deletePost(postId, user.id);

            // Remove from local state
            setState(prev => ({
                ...prev,
                posts: prev.posts.filter(post => post.id !== postId),
                totalCount: Math.max(0, prev.totalCount - 1),
            }));

            console.log('✅ Post deleted successfully via hook');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
            console.error('❌ Error deleting post via hook:', error);
            setError(errorMessage);
            throw error;
        }
    }, [user?.id, setError]);

    // Load feed when filters change
    useEffect(() => {
        loadFeed(false);
    }, [filters]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                console.log('🧹 Cleaning up feed listener...');
                unsubscribeRef.current();
            }
        };
    }, []);

    return {
        posts: state.posts,
        loading: state.loading,
        error: state.error,
        hasMore: state.hasMore,
        totalCount: state.totalCount,
        isLoadingMore: state.isLoadingMore,
        isCreating: state.isCreating,
        createPost,
        refreshFeed,
        loadMore,
        updateFilters,
        deletePost,
        currentFilters: filters,
    };
};