import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Trash2,
  Flag,
  Clock,
  Users,
  Eye,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { FeedPost } from "../services/feedService";
import { feedService } from "../services/feedService";
import { useAuth } from "../../../../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { CommentList, CommentInput, ShareMenu } from "./social";
import { Button } from "../../../../components/ui/button";
import { Avatar } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";

interface PostCardProps {
  post: FeedPost;
  onPostUpdate?: (postId: string, updates: Partial<FeedPost>) => void;
  onPostDelete?: (postId: string) => void;
  className?: string;
  showComments?: boolean;
  autoExpandComments?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostUpdate,
  onPostDelete,
  className = "",
  showComments = true,
  autoExpandComments = false,
}) => {
  const { user } = useAuth();
  const { userProfile } = useProfile();

  // State for social interactions
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.engagement.likes);
  const [commentsExpanded, setCommentsExpanded] = useState(autoExpandComments);
  const [commentsCount, setCommentsCount] = useState(post.engagement.comments);
  const [sharesCount, setSharesCount] = useState(post.engagement.shares);
  const [viewsCount, setViewsCount] = useState(post.engagement.views);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Check user permissions
  const isAuthenticated = !!user && !!userProfile;
  const isAdmin = false; // TODO: Implement admin role detection
  const isOwner = post.authorId === user?.id;
  const canDelete = isAdmin || isOwner;
  const canInteract = isAuthenticated;

  // Load user's like status
  useEffect(() => {
    if (!user?.id) return;

    const checkLikeStatus = async () => {
      try {
        const hasLiked = await feedService.hasUserLikedPost(post.id, user.id);
        setLiked(hasLiked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [post.id, user?.id]);

  // Handle like toggle
  const handleLike = async () => {
    if (!canInteract || !user?.id || !userProfile) return;

    try {
      const userData = {
        userName: userProfile.displayName || userProfile.email || "Usuario",
        userAvatar: userProfile.photoURL,
      };

      const result = await feedService.togglePostLike(
        post.id,
        user.id,
        userData,
      );

      setLiked(result.liked);
      setLikesCount(result.likesCount);

      // Update parent component
      if (onPostUpdate) {
        onPostUpdate(post.id, {
          ...post,
          engagement: {
            ...post.engagement,
            likes: result.likesCount,
          },
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Handle delete post
  const handleDelete = async () => {
    if (!canDelete || !user?.id) return;

    setIsDeleting(true);
    try {
      await feedService.deletePostEnhanced(post.id, user.id, isAdmin);

      if (onPostDelete) {
        onPostDelete(post.id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setIsDeleting(false);
    }
  };

  // Handle comment count updates
  const handleCommentCountUpdate = (count: number) => {
    setCommentsCount(count);

    if (onPostUpdate) {
      onPostUpdate(post.id, {
        ...post,
        engagement: {
          ...post.engagement,
          comments: count,
        },
      });
    }
  };

  // Handle share count increment
  const handleShare = () => {
    const newSharesCount = sharesCount + 1;
    setSharesCount(newSharesCount);

    if (onPostUpdate) {
      onPostUpdate(post.id, {
        ...post,
        engagement: {
          ...post.engagement,
          shares: newSharesCount,
        },
      });
    }
  };

  // Format timestamp
  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return "";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "hace un momento";
      if (diffInSeconds < 3600)
        return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
      if (diffInSeconds < 86400)
        return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
      if (diffInSeconds < 2592000)
        return `hace ${Math.floor(diffInSeconds / 86400)} días`;

      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }; // Get post visibility badge
  const getVisibilityBadge = () => {
    switch (post.visibility) {
      case "private":
        return (
          <Badge variant="secondary" className="text-xs">
            Privado
          </Badge>
        );
      case "followers":
        return (
          <Badge variant="outline" className="text-xs">
            Seguidores
          </Badge>
        );
      case "public":
      default:
        return (
          <Badge variant="default" className="text-xs">
            Público
          </Badge>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white text-lg font-medium rounded-full">
                  {(post.authorName || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">
                  {post.authorName}
                </h3>
                {post.authorUsername && (
                  <span className="text-sm text-gray-500">
                    @{post.authorUsername}
                  </span>
                )}
                {getVisibilityBadge()}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{getTimeAgo(post.createdAt)}</span>
                {post.metadata.isEdited && (
                  <>
                    <span>•</span>
                    <span>editado</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="py-2">
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{isDeleting ? "Eliminando..." : "Eliminar"}</span>
                      </button>
                    )}
                    {isAuthenticated && !isOwner && (
                      <button
                        onClick={() => setShowActions(false)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        <Flag className="h-4 w-4" />
                        <span>Reportar</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Background overlay for actions menu */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowActions(false)}
                  className="fixed inset-0 bg-transparent z-40"
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <div className="prose max-w-none">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content.text}
          </p>

          {/* Post Tags */}
          {post.content.tags && post.content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.content.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Media Content */}
          {post.content.mediaUrls && post.content.mediaUrls.length > 0 && (
            <div className="mt-4 space-y-2">
              {post.content.mediaUrls.map((url, index) => {
                const mediaType = post.content.mediaTypes?.[index] || "image";

                if (mediaType === "image") {
                  return (
                    <img
                      key={index}
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  );
                } else if (mediaType === "video") {
                  return (
                    <video
                      key={index}
                      src={url}
                      controls
                      className="w-full max-h-96 rounded-lg"
                    />
                  );
                } else {
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          DOC
                        </span>
                      </div>
                      <span className="text-blue-600 hover:underline">
                        Documento adjunto
                      </span>
                    </a>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {likesCount > 0 && (
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                <span>{likesCount}</span>
              </div>
            )}
            {commentsCount > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{commentsCount} comentarios</span>
              </div>
            )}
            {sharesCount > 0 && (
              <div className="flex items-center space-x-1">
                <Share2 className="h-4 w-4" />
                <span>{sharesCount} compartidos</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{viewsCount} vistas</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              disabled={!canInteract}
              className={`
                                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                                ${
                                  liked
                                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-red-500"
                                }
                                ${!canInteract ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                            `}
            >
              <motion.div
                animate={liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              </motion.div>
              <span className="font-medium">Me gusta</span>
            </motion.button>

            {showComments && (
              <button
                onClick={() => setCommentsExpanded(!commentsExpanded)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">Comentar</span>
                {commentsExpanded ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          <ShareMenu
            post={post}
            variant="icon"
            size="md"
            className="text-gray-600 hover:text-green-500"
          />
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && commentsExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100 bg-gray-50"
          >
            <div className="p-6 space-y-4">
              {/* Comment Input */}
              {canInteract && (
                <CommentInput
                  postId={post.id}
                  onCommentAdded={() => {
                    // Comment count will be updated by CommentList listener
                  }}
                  placeholder="Escribe un comentario..."
                />
              )}

              {/* Comments List */}
              <CommentList
                postId={post.id}
                onCommentCountUpdate={handleCommentCountUpdate}
                className="max-h-96 overflow-y-auto"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
