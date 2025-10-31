// FASE 6.4 — EventList Component
import React, { useState, useEffect } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Calendar, Filter, Search, Clock } from 'lucide-react';
import { EventCard } from './EventCard';
import { CommunityEvent, eventService } from '../services/eventService';

interface EventListProps {
    communityId: string;
    currentUserId?: string;
    onViewEvent?: (eventId: string) => void;
    onJoinEvent?: (eventId: string) => Promise<void>;
    onLeaveEvent?: (eventId: string) => Promise<void>;
}

export function EventList({
    communityId,
    currentUserId,
    onViewEvent,
    onJoinEvent,
    onLeaveEvent
}: EventListProps) {
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<CommunityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [timeFilter, setTimeFilter] = useState<string>('all');
    const [eventsListener, setEventsListener] = useState<(() => void) | null>(null);

    // Cargar eventos en tiempo real
    useEffect(() => {
        if (!communityId) return;

        setLoading(true);

        // Configurar listener en tiempo real
        const unsubscribe = eventService.listenToEvents(communityId, (eventsData) => {
            setEvents(eventsData);
            setLoading(false);
        });

        setEventsListener(() => unsubscribe);

        // Cleanup
        return () => {
            if (eventsListener) {
                eventsListener();
            }
        };
    }, [communityId]);

    // Filtrar eventos cuando cambien los filtros
    useEffect(() => {
        let filtered = [...events];

        // Filtro por búsqueda
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchLower) ||
                event.description.toLowerCase().includes(searchLower) ||
                event.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
                event.location?.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por estado
        if (statusFilter !== 'all') {
            switch (statusFilter) {
                case 'upcoming':
                    filtered = filtered.filter(event => event.startAt > Date.now() && event.status === 'scheduled');
                    break;
                case 'live':
                    filtered = filtered.filter(event => eventService.isEventLive(event));
                    break;
                case 'past':
                    filtered = filtered.filter(event => event.startAt < Date.now() && event.status === 'ended');
                    break;
                case 'my-events':
                    filtered = filtered.filter(event =>
                        currentUserId && event.attendees?.includes(currentUserId)
                    );
                    break;
            }
        }

        // Filtro por tiempo
        if (timeFilter !== 'all') {
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            const oneWeek = 7 * oneDay;
            const oneMonth = 30 * oneDay;

            switch (timeFilter) {
                case 'today':
                    filtered = filtered.filter(event => {
                        const eventDate = new Date(event.startAt);
                        const today = new Date();
                        return eventDate.toDateString() === today.toDateString();
                    });
                    break;
                case 'this-week':
                    filtered = filtered.filter(event =>
                        event.startAt >= now && event.startAt <= now + oneWeek
                    );
                    break;
                case 'this-month':
                    filtered = filtered.filter(event =>
                        event.startAt >= now && event.startAt <= now + oneMonth
                    );
                    break;
            }
        }

        // Ordenar por fecha
        filtered.sort((a, b) => a.startAt - b.startAt);

        setFilteredEvents(filtered);
    }, [events, searchTerm, statusFilter, timeFilter, currentUserId]);

    const handleJoinEvent = async (eventId: string) => {
        if (!onJoinEvent) return;

        try {
            setActionLoading(eventId);
            await onJoinEvent(eventId);
        } catch (error) {
            console.error('Error joining event:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeaveEvent = async (eventId: string) => {
        if (!onLeaveEvent) return;

        try {
            setActionLoading(eventId);
            await onLeaveEvent(eventId);
        } catch (error) {
            console.error('Error leaving event:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getFilterStats = () => {
        const now = Date.now();
        const upcoming = events.filter(e => e.startAt > now && e.status === 'scheduled').length;
        const live = events.filter(e => eventService.isEventLive(e)).length;
        const past = events.filter(e => e.startAt < now && e.status === 'ended').length;
        const myEvents = currentUserId ? events.filter(e => e.attendees?.includes(currentUserId)).length : 0;

        return { upcoming, live, past, myEvents };
    };

    const stats = getFilterStats();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Buscar eventos por título, descripción, etiquetas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filtros:</span>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Todos ({events.length})</option>
                        <option value="upcoming">Próximos ({stats.upcoming})</option>
                        <option value="live">En Vivo ({stats.live})</option>
                        <option value="past">Pasados ({stats.past})</option>
                        {currentUserId && (
                            <option value="my-events">Mis Eventos ({stats.myEvents})</option>
                        )}
                    </select>

                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Cualquier fecha</option>
                        <option value="today">Hoy</option>
                        <option value="this-week">Esta semana</option>
                        <option value="this-month">Este mes</option>
                    </select>
                </div>
            </div>

            {/* Quick Stats */}
            {events.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{stats.upcoming}</div>
                        <div className="text-sm text-blue-700">Próximos</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xl font-bold text-red-600">{stats.live}</div>
                        <div className="text-sm text-red-700">En Vivo</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-gray-600">{stats.past}</div>
                        <div className="text-sm text-gray-700">Finalizados</div>
                    </div>
                    {currentUserId && (
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xl font-bold text-green-600">{stats.myEvents}</div>
                            <div className="text-sm text-green-700">Mis Eventos</div>
                        </div>
                    )}
                </div>
            )}

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {events.length === 0 ? 'No hay eventos' : 'No hay eventos que coincidan'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {events.length === 0
                            ? 'Esta comunidad aún no tiene eventos programados.'
                            : 'Intenta cambiar los filtros de búsqueda.'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            currentUserId={currentUserId}
                            onViewEvent={onViewEvent}
                            onJoinEvent={handleJoinEvent}
                            onLeaveEvent={handleLeaveEvent}
                            isLoading={actionLoading === event.id}
                        />
                    ))}
                </div>
            )}

            {/* Load More (if needed for future pagination) */}
            {filteredEvents.length > 0 && filteredEvents.length === events.length && events.length >= 20 && (
                <div className="text-center pt-6">
                    <Button variant="outline" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Todos los eventos cargados
                    </Button>
                </div>
            )}
        </div>
    );
}