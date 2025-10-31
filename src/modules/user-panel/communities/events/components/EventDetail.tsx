// FASE 6.4 — EventDetail Component
import React, { useState, useEffect } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Card } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    ExternalLink,
    Edit,
    Trash2,
    Share2,
    Bell,
    BellOff,
    Play,
    Eye,
    ArrowLeft
} from 'lucide-react';
import { CommunityEvent, eventService } from '../services/eventService';

interface EventDetailProps {
    eventId: string;
    communityId: string;
    currentUserId?: string;
    canEdit?: boolean;
    onEdit?: (event: CommunityEvent) => void;
    onDelete?: (eventId: string) => Promise<void>;
    onBack?: () => void;
    onJoinEvent?: (eventId: string) => Promise<void>;
    onLeaveEvent?: (eventId: string) => Promise<void>;
}

export function EventDetail({
    eventId,
    communityId,
    currentUserId,
    canEdit = false,
    onEdit,
    onDelete,
    onBack,
    onJoinEvent,
    onLeaveEvent
}: EventDetailProps) {
    const [event, setEvent] = useState<CommunityEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showEmbed, setShowEmbed] = useState(false);
    const [reminderEnabled, setReminderEnabled] = useState(false);

    // Cargar evento
    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                const events = await eventService.getEventsByCommunity(communityId);
                const foundEvent = events.find(e => e.id === eventId);
                setEvent(foundEvent || null);
            } catch (error) {
                console.error('Error loading event:', error);
            } finally {
                setLoading(false);
            }
        };

        if (eventId && communityId) {
            loadEvent();
        }
    }, [eventId, communityId]);

    // Listener en tiempo real para el evento
    useEffect(() => {
        if (!communityId) return;

        const unsubscribe = eventService.listenToEvents(communityId, (events: CommunityEvent[]) => {
            const updatedEvent = events.find(e => e.id === eventId);
            if (updatedEvent) {
                setEvent(updatedEvent);
            }
        });

        return () => unsubscribe();
    }, [communityId, eventId]);

    const handleJoin = async () => {
        if (!onJoinEvent || !event) return;

        try {
            setActionLoading('join');
            await onJoinEvent(event.id);
        } catch (error) {
            console.error('Error joining event:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeave = async () => {
        if (!onLeaveEvent || !event) return;

        try {
            setActionLoading('leave');
            await onLeaveEvent(event.id);
        } catch (error) {
            console.error('Error leaving event:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!onDelete || !event) return;

        const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este evento?');
        if (!confirmed) return;

        try {
            setActionLoading('delete');
            await onDelete(event.id);
        } catch (error) {
            console.error('Error deleting event:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: event?.title || 'Evento',
            text: event?.description || '',
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copiar al portapapeles
            await navigator.clipboard.writeText(window.location.href);
            alert('Enlace copiado al portapapeles');
        }
    };

    const toggleReminder = () => {
        // TODO: Implementar sistema de recordatorios con Firebase Cloud Messaging
        setReminderEnabled(!reminderEnabled);
    };

    const formatDateTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const getDuration = () => {
        if (!event || !event.endAt) return '';
        const duration = event.endAt - event.startAt;
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`;
        }
        return `${minutes}min`;
    };

    const isUserAttending = () => {
        return currentUserId && event?.attendees?.includes(currentUserId);
    };

    const isEventLive = () => {
        return event ? eventService.isEventLive(event) : false;
    };

    const canJoinLiveEvent = () => {
        return isEventLive() && event?.embedUrl && isUserAttending();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Evento no encontrado</h3>
                <p className="text-gray-500 mb-4">
                    El evento que buscas no existe o ha sido eliminado.
                </p>
                {onBack && (
                    <Button onClick={onBack} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                )}
            </div>
        );
    }

    const startDateTime = formatDateTime(event.startAt);
    const endDateTime = event.endAt ? formatDateTime(event.endAt) : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                {onBack && (
                    <Button onClick={onBack} variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                )}

                <div className="flex items-center gap-2">
                    <Button onClick={handleShare} variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir
                    </Button>

                    <Button
                        onClick={toggleReminder}
                        variant={reminderEnabled ? "default" : "outline"}
                        size="sm"
                    >
                        {reminderEnabled ? (
                            <Bell className="h-4 w-4 mr-2" />
                        ) : (
                            <BellOff className="h-4 w-4 mr-2" />
                        )}
                        Recordatorio
                    </Button>

                    {canEdit && (
                        <>
                            <Button onClick={() => onEdit?.(event)} variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                size="sm"
                                disabled={actionLoading === 'delete'}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Event Header */}
            <Card className="p-6">
                <div className="space-y-4">
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {isEventLive() && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                                🔴 EN VIVO
                            </Badge>
                        )}

                        <Badge variant={event.status === 'scheduled' ? 'default' : 'secondary'}>
                            {event.status === 'scheduled' ? 'Programado' :
                                event.status === 'live' ? 'En Vivo' :
                                    event.status === 'ended' ? 'Finalizado' : 'Cancelado'}
                        </Badge>

                        <Badge variant="outline">Evento</Badge>

                        {event.maxAttendees && (
                            <Badge variant="outline">
                                Limitado ({event.attendees?.length || 0}/{event.maxAttendees})
                            </Badge>
                        )}
                    </div>

                    {/* Title and Description */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                        {event.description && (
                            <p className="text-gray-600 text-lg leading-relaxed">{event.description}</p>
                        )}
                    </div>

                    {/* Event Meta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-3" />
                                <div>
                                    <div className="font-medium">{startDateTime.date}</div>
                                    {endDateTime && startDateTime.date !== endDateTime.date && (
                                        <div className="text-sm">hasta {endDateTime.date}</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                                <Clock className="h-5 w-5 mr-3" />
                                <div>
                                    <div>{startDateTime.time}{endDateTime ? ` - ${endDateTime.time}` : ''}</div>
                                    <div className="text-sm text-gray-500">Duración: {getDuration()}</div>
                                </div>
                            </div>

                            {event.location && (
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="h-5 w-5 mr-3" />
                                    <span>{event.location}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                                <Users className="h-5 w-5 mr-3" />
                                <div>
                                    <div className="font-medium">
                                        {event.attendees?.length || 0} asistentes
                                    </div>
                                    {event.maxAttendees && (
                                        <div className="text-sm text-gray-500">
                                            de {event.maxAttendees} máximo
                                        </div>
                                    )}
                                </div>
                            </div>

                            {event.embedUrl && (
                                <div className="flex items-center text-gray-600">
                                    <ExternalLink className="h-5 w-5 mr-3" />
                                    <div>
                                        <div className="font-medium">Enlace disponible</div>
                                        <div className="text-sm text-gray-500">
                                            Contenido externo
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
                {currentUserId && !isUserAttending() && event.status === 'scheduled' && (
                    <Button
                        onClick={handleJoin}
                        disabled={actionLoading === 'join' || (event.maxAttendees ? (event.attendees?.length || 0) >= event.maxAttendees : false)}
                        className="px-6"
                    >
                        {actionLoading === 'join' ? 'Uniéndose...' : 'Unirse al Evento'}
                    </Button>
                )}

                {currentUserId && isUserAttending() && event.status === 'scheduled' && (
                    <Button
                        onClick={handleLeave}
                        disabled={actionLoading === 'leave'}
                        variant="outline"
                        className="px-6"
                    >
                        {actionLoading === 'leave' ? 'Saliendo...' : 'Salir del Evento'}
                    </Button>
                )}

                {canJoinLiveEvent() && (
                    <Button
                        onClick={() => window.open(event.embedUrl, '_blank')}
                        className="px-6 bg-red-600 hover:bg-red-700"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Unirse al Evento en Vivo
                    </Button>
                )}                {event.embedUrl && !canJoinLiveEvent() && (
                    <Button
                        onClick={() => window.open(event.embedUrl, '_blank')}
                        variant="outline"
                        className="px-6"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Contenido
                    </Button>
                )}
            </div>

            {/* Cover Image */}
            {event.coverImage && (
                <Card className="overflow-hidden">
                    <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-64 object-cover"
                    />
                </Card>
            )}
        </div>
    );
}