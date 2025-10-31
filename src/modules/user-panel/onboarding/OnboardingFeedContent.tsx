// Contenido destacado para usuarios en onboarding
// Publicaciones guiadas y tutoriales

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
    BookOpen,
    Video,
    Users,
    Lightbulb,
    TrendingUp,
    MessageCircle,
    Heart,
    Share2,
    Play,
    Star,
    Clock,
    ExternalLink
} from 'lucide-react';

interface FeaturedPost {
    id: string;
    type: 'tutorial' | 'tip' | 'welcome' | 'community_highlight';
    title: string;
    content: string;
    author: {
        name: string;
        avatar: string;
        role: string;
        verified?: boolean;
    };
    media?: {
        type: 'image' | 'video' | 'link';
        url: string;
        thumbnail?: string;
    };
    stats: {
        likes: number;
        comments: number;
        shares: number;
    };
    tags: string[];
    timeAgo: string;
    featured: boolean;
}

interface OnboardingFeedContentProps {
    className?: string;
}

export const OnboardingFeedContent: React.FC<OnboardingFeedContentProps> = ({
    className = ''
}) => {
    // Contenido destacado para nuevos usuarios
    const featuredPosts: FeaturedPost[] = [
        {
            id: '1',
            type: 'welcome',
            title: '🎉 Bienvenido a la comunidad Mundero',
            content: 'Nos emociona tenerte aquí. Mundero es más que una plataforma: es un ecosistema donde profesionales como tú conectan, colaboran y crecen juntos. Aquí encontrarás oportunidades únicas, una red de empresas confiables y herramientas que potenciarán tu carrera profesional.',
            author: {
                name: 'Equipo Mundero',
                avatar: '/images/team-avatar.jpg',
                role: 'Equipo Oficial',
                verified: true
            },
            media: {
                type: 'image',
                url: '/images/welcome-mundero.jpg',
                thumbnail: '/images/welcome-mundero-thumb.jpg'
            },
            stats: { likes: 127, comments: 23, shares: 15 },
            tags: ['bienvenida', 'comunidad', 'networking'],
            timeAgo: 'Fijado',
            featured: true
        },
        {
            id: '2',
            type: 'tutorial',
            title: '📝 Cómo completar tu perfil profesional en 5 minutos',
            content: 'Tu perfil es tu carta de presentación digital. Te mostramos paso a paso cómo optimizarlo para atraer las mejores oportunidades. Incluye consejos sobre cómo redactar una descripción impactante y qué información es clave para destacar.',
            author: {
                name: 'María González',
                avatar: '/images/maria-avatar.jpg',
                role: 'Community Manager',
                verified: true
            },
            media: {
                type: 'video',
                url: '/videos/complete-profile-tutorial.mp4',
                thumbnail: '/images/tutorial-thumb.jpg'
            },
            stats: { likes: 89, comments: 12, shares: 8 },
            tags: ['tutorial', 'perfil', 'consejos'],
            timeAgo: 'hace 2 días',
            featured: true
        },
        {
            id: '3',
            type: 'tip',
            title: '💡 5 formas de encontrar tu primera comunidad ideal',
            content: 'Las comunidades son el corazón de Mundero. Descubre cómo identificar y unirte a grupos que realmente aporten valor a tu desarrollo profesional. Desde comunidades por industria hasta grupos de networking local.',
            author: {
                name: 'Carlos Ruiz',
                avatar: '/images/carlos-avatar.jpg',
                role: 'Especialista en Networking',
                verified: false
            },
            stats: { likes: 64, comments: 18, shares: 12 },
            tags: ['networking', 'comunidades', 'tips'],
            timeAgo: 'hace 1 día',
            featured: false
        },
        {
            id: '4',
            type: 'community_highlight',
            title: '🏢 Comunidad destacada: "Emprendedores Tech Lima"',
            content: 'Una comunidad vibrante de más de 500 profesionales de tecnología que se reúnen semanalmente para compartir conocimientos, oportunidades y crear sinergias. ¡Perfecta para desarrolladores, diseñadores y product managers!',
            author: {
                name: 'Ana Torres',
                avatar: '/images/ana-avatar.jpg',
                role: 'Community Leader',
                verified: true
            },
            media: {
                type: 'link',
                url: '/communities/emprendedores-tech-lima',
                thumbnail: '/images/community-tech-lima.jpg'
            },
            stats: { likes: 156, comments: 45, shares: 28 },
            tags: ['comunidad', 'tech', 'lima', 'emprendimiento'],
            timeAgo: 'hace 3 horas',
            featured: true
        }
    ];

    const getTypeIcon = (type: FeaturedPost['type']) => {
        switch (type) {
            case 'tutorial': return <BookOpen className="h-4 w-4" />;
            case 'tip': return <Lightbulb className="h-4 w-4" />;
            case 'welcome': return <Star className="h-4 w-4" />;
            case 'community_highlight': return <Users className="h-4 w-4" />;
            default: return <MessageCircle className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: FeaturedPost['type']) => {
        switch (type) {
            case 'tutorial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'tip': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'welcome': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'community_highlight': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const getTypeLabel = (type: FeaturedPost['type']) => {
        switch (type) {
            case 'tutorial': return 'Tutorial';
            case 'tip': return 'Consejo';
            case 'welcome': return 'Bienvenida';
            case 'community_highlight': return 'Comunidad destacada';
            default: return 'Post';
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header de contenido destacado */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Contenido destacado para ti
                    </h3>
                </div>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Curado especialmente
                </Badge>
            </div>

            {/* Posts destacados */}
            <div className="space-y-4">
                {featuredPosts.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`overflow-hidden ${post.featured ? 'ring-2 ring-purple-200 dark:ring-purple-800' : ''}`}>
                            {/* Header del post */}
                            <div className="p-4 pb-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/images/default-avatar.jpg';
                                            }}
                                        />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {post.author.name}
                                                </h4>
                                                {post.author.verified && (
                                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {post.author.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Badge className={getTypeColor(post.type)}>
                                            {getTypeIcon(post.type)}
                                            <span className="ml-1">{getTypeLabel(post.type)}</span>
                                        </Badge>
                                        {post.featured && (
                                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                                <Star className="h-3 w-3 mr-1" />
                                                Destacado
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Título y contenido */}
                                <div className="mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {post.content}
                                    </p>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {post.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Media */}
                            {post.media && (
                                <div className="px-4 mb-3">
                                    {post.media.type === 'video' && (
                                        <div className="relative group cursor-pointer rounded-lg overflow-hidden">
                                            <img
                                                src={post.media.thumbnail}
                                                alt="Video thumbnail"
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/default-video-thumb.jpg';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                                                    <Play className="h-6 w-6 text-gray-900 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {post.media.type === 'image' && (
                                        <img
                                            src={post.media.url}
                                            alt="Post image"
                                            className="w-full h-48 object-cover rounded-lg"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/images/default-post-image.jpg';
                                            }}
                                        />
                                    )}

                                    {post.media.type === 'link' && (
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={post.media.thumbnail}
                                                    alt="Link preview"
                                                    className="w-12 h-12 rounded object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/images/default-link-thumb.jpg';
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        Ver comunidad
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {post.media.url}
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Acciones y stats */}
                            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                                            <Heart className="h-4 w-4" />
                                            <span className="text-sm">{post.stats.likes}</span>
                                        </button>
                                        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                                            <MessageCircle className="h-4 w-4" />
                                            <span className="text-sm">{post.stats.comments}</span>
                                        </button>
                                        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                                            <Share2 className="h-4 w-4" />
                                            <span className="text-sm">{post.stats.shares}</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        <span>{post.timeAgo}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* CTA final */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        ¿Listo para comenzar a publicar?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Comparte tu experiencia, conecta con otros profesionales y construye tu red.
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Crear mi primera publicación
                    </Button>
                </div>
            </Card>
        </div>
    );
};