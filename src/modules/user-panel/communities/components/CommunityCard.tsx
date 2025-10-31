import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Avatar } from '../../../../components/ui/avatar';
import { Community } from '../services/communityService';
import { Users, MapPin, Lock, Globe, Calendar } from 'lucide-react';

interface CommunityCardProps {
    community: Community;
    isJoined?: boolean;
    onJoin?: (communityId: string) => void;
    onLeave?: (communityId: string) => void;
    onView?: (communityId: string) => void;
    isLoading?: boolean;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
    community,
    isJoined = false,
    onJoin,
    onLeave,
    onView,
    isLoading = false
}) => {
    const handleAction = () => {
        if (isJoined && onLeave) {
            onLeave(community.id);
        } else if (!isJoined && onJoin) {
            onJoin(community.id);
        }
    };

    const formatDate = (timestamp: any) => {
        try {
            let date: Date;
            if (timestamp && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            } else if (timestamp instanceof Date) {
                date = timestamp;
            } else {
                date = new Date(timestamp);
            }
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            {/* Header with cover image */}
            <div className="relative h-32 mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
                {community.coverImage && (
                    <img
                        src={community.coverImage}
                        alt={community.name}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                    {community.isPrivate ? (
                        <Badge variant="secondary" className="bg-black/50 text-white border-0">
                            <Lock className="w-3 h-3 mr-1" />
                            Privada
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-black/50 text-white border-0">
                            <Globe className="w-3 h-3 mr-1" />
                            Pública
                        </Badge>
                    )}
                </div>
            </div>

            {/* Community info */}
            <div className="space-y-4">
                {/* Avatar and title */}
                <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                        {community.avatar ? (
                            <img src={community.avatar} alt={community.name} />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                {community.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate" title={community.name}>
                            {community.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                            por {community.creatorName}
                        </p>
                        <Badge variant="outline" className="text-xs">
                            {community.category}
                        </Badge>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm line-clamp-2" title={community.description}>
                    {community.description}
                </p>

                {/* Tags */}
                {community.tags && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {community.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                            </Badge>
                        ))}
                        {community.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                                +{community.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{community.memberCount} miembros</span>
                        </div>
                        {community.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{community.location.city || community.location.country}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(community.createdAt)}</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView?.(community.id)}
                        className="flex-1"
                    >
                        Ver detalles
                    </Button>
                    {(onJoin || onLeave) && (
                        <Button
                            variant={isJoined ? "secondary" : "default"}
                            size="sm"
                            onClick={handleAction}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? 'Cargando...' : isJoined ? 'Abandonar' : 'Unirse'}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};