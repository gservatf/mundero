import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../lib/mockApi';
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiMoreHorizontal,
  FiTrendingUp,
  FiUsers,
  FiActivity
} from 'react-icons/fi';
import { Post } from '../lib/types';
// Integración de reputación (opcional, no intrusiva)
import { reputationService, REPUTATION_ENABLED } from '../modules/user-panel/reputation/reputationService';

export const FeedSystem: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Simular carga de posts
      const mockPosts: Post[] = [
        {
          id: '1',
          userId: 'user1',
          content: 'Excelente reunión con el equipo de desarrollo. Los nuevos features están tomando forma.',
          timestamp: Date.now() - 1000 * 60 * 30, // 30 minutos atrás
          likes: 12,
          comments: 3,
          shares: 1
        },
        {
          id: '2',
          userId: 'user2',
          content: 'Implementamos la nueva integración con Legalty. Los resultados son prometedores.',
          mediaUrl: 'https://via.placeholder.com/400x200',
          timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 horas atrás
          likes: 24,
          comments: 8,
          shares: 5
        },
        {
          id: '3',
          userId: 'user3',
          content: 'Celebrando otro hito en nuestro crecimiento empresarial. ¡Gracias al equipo!',
          timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 horas atrás
          likes: 45,
          comments: 12,
          shares: 8
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (_postId: string) => {
    // Implementar lógica de like
    console.log('Like post:', _postId);

    // Hook de reputación opcional (no bloquea el feed)
    if (REPUTATION_ENABLED && user?.id) {
      try {
        await reputationService.logAction(user.id, 'post_like', { postId: _postId });
      } catch (error) {
        console.log('Reputation tracking failed (non-blocking):', error);
      }
    }
  };

  const handleComment = async (_postId: string) => {
    // Implementar lógica de comentario
    console.log('Comment on post:', _postId);

    // Hook de reputación opcional (no bloquea el feed)
    if (REPUTATION_ENABLED && user?.id) {
      try {
        await reputationService.logAction(user.id, 'post_comment', { postId: _postId });
      } catch (error) {
        console.log('Reputation tracking failed (non-blocking):', error);
      }
    }
  };

  const handleShare = async (_postId: string) => {
    // Implementar lógica de compartir
    console.log('Share post:', _postId);

    // Hook de reputación opcional (no bloquea el feed)
    if (REPUTATION_ENABLED && user?.id) {
      try {
        await reputationService.logAction(user.id, 'post_share', { postId: _postId });
      } catch (error) {
        console.log('Reputation tracking failed (non-blocking):', error);
      }
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = (now - timestamp) / (1000 * 60);

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FiTrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">142</p>
            <p className="text-sm text-gray-600">Posts Activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <FiUsers className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">1.2K</p>
            <p className="text-sm text-gray-600">Interacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <FiActivity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600">89%</p>
            <p className="text-sm text-gray-600">Engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=Usuario${post.userId}&background=3b82f6&color=fff`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">Usuario {post.userId}</p>
                    <p className="text-sm text-gray-500">{formatTimeAgo(post.timestamp)}</p>
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <FiMoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-800 mb-3">{post.content}</p>

                {post.mediaUrl && (
                  <img
                    src={post.mediaUrl}
                    alt="Post media"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
                  >
                    <FiHeart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleComment(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                  >
                    <FiShare2 className="w-4 h-4" />
                    <span>{post.shares}</span>
                  </Button>
                </div>

                <Badge variant="secondary">
                  Empresarial
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="w-full sm:w-auto">
          Cargar más posts
        </Button>
      </div>
    </div>
  );
};