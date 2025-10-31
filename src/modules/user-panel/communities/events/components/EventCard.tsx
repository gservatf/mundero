// FASE 6.4 — EventCard Component
import React from 'react';
import { Card, CardContent, CardHeader } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Avatar } from '../../../../../components/ui/avatar';
import { Calendar, Clock, MapPin, Users, Video, Eye } from 'lucide-react';
import { CommunityEvent, eventService } from '../services/eventService';

interface EventCardProps {
    event: CommunityEvent;
    onViewEvent?: (eventId: string) => void;
    onJoinEvent?: (eventId: string) => void;
    onLeaveEvent?: (eventId: string) => void;
    currentUserId?: string;
    isLoading?: boolean;
}

export function EventCard({
    event,
    onViewEvent,
    onJoinEvent,
    onLeaveEvent,
    currentUserId,
    isLoading = false
}: EventCardProps) {
    const isUserAttending = currentUserId && event.attendees?.includes(currentUserId);
    const isEventLive = eventService.isEventLive(event);
    const isPastEvent = event.startAt < Date.now() && event.status === 'ended';
    const duration = eventService.getEventDuration(event);

    const formatEventDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return `Hoy ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return `Mañana ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getStatusBadge = () => {
        if (isEventLive) {
            return (
                <Badge className="bg-red-500 text-white animate-pulse">
                    🔴 En Vivo
                </Badge>
            );
        }

        switch (event.status) {
            case 'scheduled':
                return <Badge variant="secondary">Programado</Badge>;
            case 'ended':
                return <Badge className="bg-gray-500 text-white">Finalizado</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
            default:
                return null;
        }
    };

    const handleJoinLeave = () => {
        if (isUserAttending && onLeaveEvent) {
            onLeaveEvent(event.id);
        } else if (!isUserAttending && onJoinEvent) {
            onJoinEvent(event.id);
        }
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-200">
            {/* Cover Image */}
            {event.coverImage && (
                <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
                    <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2">
                        {getStatusBadge()}
                    </div>
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
                            {event.title}
                        </h3>

                        {/* Event Date and Time */}
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatEventDate(event.startAt)}</span>
                        </div>

                        {/* Duration */}
                        {duration && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                <Clock className="h-4 w-4" />
                                <span>{duration} minutos</span>
                            </div>
                        )}

                        {/* Location */}
                        {event.location && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{event.location}</span>
                            </div>
                        )}

                        {/* Has Video/Embed */}
                        {event.embedUrl && (
                            <div className="flex items-center gap-1 text-sm text-blue-600 mb-2">
                                <Video className="h-4 w-4" />
                                <span>Transmisión disponible</span>
                            </div>
                        )}
                    </div>

                    {!event.coverImage && (
                        <div className="ml-2">
                            {getStatusBadge()}
                        </div>
                    )}
                </div>

                {/* Creator */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Avatar className="w-6 h-6">
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {event.createdByName.charAt(0).toUpperCase()}
                        </div>
                    </Avatar>
                    <span>Por {event.createdByName}</span>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Description */}
                {event.description && (
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {event.description}
                    </p>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {event.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                            </Badge>
                        ))}
                        {event.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                                +{event.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Attendees */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                            {event.attendees?.length || 0}
                            {event.maxAttendees && ` / ${event.maxAttendees}`} asistentes
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewEvent?.(event.id)}
                        className="flex-1"
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalle
                    </Button>

                    {currentUserId && !isPastEvent && event.status !== 'cancelled' && (
                        <Button
                            size="sm"
                            onClick={handleJoinLeave}
                            disabled={isLoading}
                            variant={isUserAttending ? "outline" : "default"}
                            className={isUserAttending ? "text-red-600 hover:text-red-700" : ""}
                        >
                            {isLoading ? '...' : isUserAttending ? 'Salir' : 'Unirse'}
                        </Button>
                    )}

                    {isEventLive && (
                        <Button
                            size="sm"
                            onClick={() => onViewEvent?.(event.id)}
                            className="bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        >
                            Ver Live
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}