import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, MoreVertical, Reply, Trash2, Flag } from 'lucide-react';
import { FeedComment } from '../../services/feedService';
import { feedService } from '../../services/feedService';
import { useAuth } from '../../../../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { Button } from '../../../../../components/ui/button';
import { Avatar } from '../../../../../components/ui/avatar';
import { Badge } from '../../../../../components/ui/badge';
// Note: DropdownMenu component will be implemented when needed
// import { 
//     DropdownMenu, 
//     DropdownMenuContent, 
//     DropdownMenuItem, 
//     DropdownMenuTrigger 
// } from '../../../../../components/ui/dropdown-menu';

interface CommentListProps {
    postId: string;
    initialComments?: FeedComment[];
    onCommentCountUpdate?: (count: number) => void;
    className?: string;
}

interface CommentItemProps {
    comment: FeedComment;
    postId: string;
    isAdmin: boolean;
    currentUserId?: string;
    onReply?: (commentId: string, authorName: string) => void;
    onDelete?: (commentId: string) => void;
    level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    postId,
    isAdmin,
    currentUserId,
    onReply,
    onDelete,
    level = 0
}) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(comment.likes || 0);
    const [isDeleting, setIsDeleting] = useState(false);

    const canDelete = isAdmin || comment.authorId === currentUserId;
    const isNested = level > 0;
    const maxNestingLevel = 3;

    useEffect(() => {
        if (currentUserId && comment.likedBy) {
            setLiked(comment.likedBy.includes(currentUserId));
        }
    }, [currentUserId, comment.likedBy]);

    const handleLike = async () => {
        if (!currentUserId) return;

        try {
            const newLiked = !liked;
            const newCount = newLiked ? likesCount + 1 : likesCount - 1;

            // Optimistic update
            setLiked(newLiked);
            setLikesCount(newCount);

            // TODO: Implement comment like functionality in feedService
            // await feedService.toggleCommentLike(postId, comment.id, currentUserId);
        } catch (error) {
            // Revert optimistic update on error
            setLiked(!liked);
            setLikesCount(likesCount);
            console.error('Error liking comment:', error);
        }
    };

    const handleDelete = async () => {
        if (!canDelete || !onDelete) return;

        setIsDeleting(true);
        try {
            await feedService.deleteComment(postId, comment.id, currentUserId!, isAdmin);
            onDelete(comment.id);
        } catch (error) {
            console.error('Error deleting comment:', error);
            setIsDeleting(false);
        }
    };

    const handleReply = () => {
        if (onReply && level < maxNestingLevel) {
            onReply(comment.id, comment.authorName);
        }
    };

    const getTimeAgo = (timestamp: any) => {
        if (!timestamp) return '';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) return 'hace un momento';
            if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
            if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
            return `hace ${Math.floor(diffInSeconds / 86400)} días`;
        } catch {
            return '';
        }
    }; return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`
                ${isNested ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}
                py-3 ${level === 0 ? 'border-b border-gray-100' : ''}
            `}
        >
            <div className="flex space-x-3">
                {/* Avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                    {comment.authorAvatar ? (
                        <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            className="h-full w-full object-cover rounded-full"
                        />
                    ) : (
                        <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium rounded-full">
                            {comment.authorName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </Avatar>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 text-sm">
                                {comment.authorName}
                            </span>
                            <span className="text-xs text-gray-500">
                                {getTimeAgo(comment.createdAt)}
                            </span>
                            {comment.parentCommentId && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                    Respuesta
                                </Badge>
                            )}
                        </div>

                        {/* Actions Menu - Temporarily disabled until DropdownMenu is available */}
                        {(canDelete || isAdmin) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                title={isDeleting ? 'Eliminando...' : 'Eliminar comentario'}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                            // TODO: Replace with proper DropdownMenu when available
                            // <DropdownMenu>
                            //     <DropdownMenuTrigger asChild>
                            //         <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            //             <MoreVertical className="h-3 w-3" />
                            //         </Button>
                            //     </DropdownMenuTrigger>
                            //     <DropdownMenuContent align="end" className="w-40">
                            //         {canDelete && (
                            //             <DropdownMenuItem 
                            //                 onClick={handleDelete}
                            //                 disabled={isDeleting}
                            //                 className="text-red-600 focus:text-red-600"
                            //             >
                            //                 <Trash2 className="h-4 w-4 mr-2" />
                            //                 {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            //             </DropdownMenuItem>
                            //         )}
                            //         {isAdmin && comment.authorId !== currentUserId && (
                            //             <DropdownMenuItem className="text-orange-600 focus:text-orange-600">
                            //                 <Flag className="h-4 w-4 mr-2" />
                            //                 Reportar
                            //             </DropdownMenuItem>
                            //         )}
                            //     </DropdownMenuContent>
                            // </DropdownMenu>
                        )}
                    </div>

                    {/* Comment Text */}
                    <div className="mt-1">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                        </p>
                    </div>

                    {/* Interaction Buttons */}
                    <div className="flex items-center space-x-4 mt-2">
                        {/* Like Button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLike}
                            disabled={!currentUserId}
                            className={`
                                flex items-center space-x-1 text-xs transition-colors
                                ${liked
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-gray-500 hover:text-red-500'
                                }
                                ${!currentUserId ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                            `}
                        >
                            <motion.div
                                animate={liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Heart
                                    className={`h-4 w-4 ${liked ? 'fill-current' : ''}`}
                                />
                            </motion.div>
                            {likesCount > 0 && (
                                <span className="font-medium">{likesCount}</span>
                            )}
                        </motion.button>

                        {/* Reply Button */}
                        {onReply && level < maxNestingLevel && (
                            <button
                                onClick={handleReply}
                                disabled={!currentUserId}
                                className={`
                                    flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors
                                    ${!currentUserId ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                `}
                            >
                                <Reply className="h-4 w-4" />
                                <span>Responder</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const CommentList: React.FC<CommentListProps> = ({
    postId,
    initialComments = [],
    onCommentCountUpdate,
    className = ''
}) => {
    const { user } = useAuth();
    const { userProfile } = useProfile();
    const [comments, setComments] = useState<FeedComment[]>(initialComments);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{
        commentId: string;
        authorName: string;
    } | null>(null);

    const isAdmin = false; // TODO: Implement admin role detection

    useEffect(() => {
        if (!postId) return;

        console.log('🔄 Setting up comments listener for post:', postId);
        setLoading(true);

        const unsubscribe = feedService.listenToPostComments(postId, (newComments) => {
            setComments(newComments);
            setLoading(false);

            if (onCommentCountUpdate) {
                onCommentCountUpdate(newComments.length);
            }
        });

        return () => {
            console.log('🔇 Cleaning up comments listener');
            unsubscribe();
        };
    }, [postId, onCommentCountUpdate]);

    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo({ commentId, authorName });
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const handleCommentDelete = (commentId: string) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
    };

    // Group comments by parent/child relationship
    const organizedComments = React.useMemo(() => {
        const topLevel = comments.filter(comment => !comment.parentCommentId);
        const replies = comments.filter(comment => comment.parentCommentId);

        return topLevel.map(parent => ({
            parent,
            replies: replies
                .filter(reply => reply.parentCommentId === parent.id)
                .sort((a, b) => {
                    try {
                        const aTime = a.createdAt && typeof a.createdAt === 'object' && 'toDate' in a.createdAt
                            ? a.createdAt.toDate()
                            : new Date();
                        const bTime = b.createdAt && typeof b.createdAt === 'object' && 'toDate' in b.createdAt
                            ? b.createdAt.toDate()
                            : new Date();
                        return aTime.getTime() - bTime.getTime();
                    } catch {
                        return 0;
                    }
                })
        }));
    }, [comments]);

    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                            <div className="flex space-x-4">
                                <div className="h-3 bg-gray-300 rounded w-12"></div>
                                <div className="h-3 bg-gray-300 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                    No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
            </div>
        );
    }

    return (
        <div className={`space-y-1 ${className}`}>
            <AnimatePresence mode="popLayout">
                {organizedComments.map(({ parent, replies }) => (
                    <motion.div key={parent.id}>
                        {/* Parent Comment */}
                        <CommentItem
                            comment={parent}
                            postId={postId}
                            isAdmin={isAdmin}
                            currentUserId={user?.id}
                            onReply={handleReply}
                            onDelete={handleCommentDelete}
                            level={0}
                        />

                        {/* Nested Replies */}
                        <AnimatePresence>
                            {replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    postId={postId}
                                    isAdmin={isAdmin}
                                    currentUserId={user?.id}
                                    onReply={handleReply}
                                    onDelete={handleCommentDelete}
                                    level={1}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && (
                <div className="text-center pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Cargar más comentarios
                    </Button>
                </div>
            )}

            {/* Reply Context Banner */}
            <AnimatePresence>
                {replyingTo && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4 rounded-r"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Reply className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-800">
                                    Respondiendo a <strong>{replyingTo.authorName}</strong>
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelReply}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};