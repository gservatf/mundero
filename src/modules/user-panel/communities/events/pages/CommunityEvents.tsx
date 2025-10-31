// FASE 6.4 — CommunityEvents Page
import React, { useState, useEffect } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import { Card } from '../../../../../components/ui/card';
import { Plus, Calendar, Users, Settings } from 'lucide-react';
import { EventList } from '../components/EventList';
import { EventDetail } from '../components/EventDetail';
import { CreateEventModal } from '../components/CreateEventModal';
import { CommunityEvent, eventService } from '../services/eventService';
import { useAuth } from '../../../../../hooks/useAuth';

interface CommunityEventsProps {
    communityId: string;
    communityName: string;
    userRole?: 'owner' | 'admin' | 'moderator' | 'member';
    onBack?: () => void;
}

export function CommunityEvents({
    communityId,
    communityName,
    userRole = 'member',
    onBack
}: CommunityEventsProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('events');
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
    const [loading, setLoading] = useState(false);

    // Permisos
    const canCreateEvents = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator';
    const canEditEvents = userRole === 'owner' || userRole === 'admin';

    // Handlers
    const handleCreateEvent = async (eventData: any) => {
        if (!user || !canCreateEvents) return;

        try {
            setLoading(true);
            await eventService.createEvent(communityId, {
                ...eventData,
                createdBy: user.id,
                createdByName: user.display_name,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = async (eventData: any) => {
        if (!editingEvent || !canEditEvents) return;

        try {
            setLoading(true);
            await eventService.updateEvent(communityId, editingEvent.id, {
                ...eventData,
                updatedAt: Date.now()
            });
            setShowEditModal(false);
            setEditingEvent(null);
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!canEditEvents) return;

        try {
            setLoading(true);
            await eventService.deleteEvent(communityId, eventId);
            setSelectedEvent(null);
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleJoinEvent = async (eventId: string) => {
        if (!user) return;

        try {
            await eventService.joinEvent(communityId, eventId, user.id);
        } catch (error) {
            console.error('Error joining event:', error);
            throw error;
        }
    };

    const handleLeaveEvent = async (eventId: string) => {
        if (!user) return;

        try {
            await eventService.leaveEvent(communityId, eventId, user.id);
        } catch (error) {
            console.error('Error leaving event:', error);
            throw error;
        }
    };

    const handleViewEvent = (eventId: string) => {
        setSelectedEvent(eventId);
        setActiveTab('detail');
    };

    const handleEditEventFromDetail = (event: CommunityEvent) => {
        setEditingEvent(event);
        setShowEditModal(true);
    };

    const handleBackToList = () => {
        setSelectedEvent(null);
        setActiveTab('events');
    };

    // Si se está viendo un evento específico
    if (selectedEvent) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <EventDetail
                    eventId={selectedEvent}
                    communityId={communityId}
                    currentUserId={user?.id}
                    canEdit={canEditEvents}
                    onEdit={handleEditEventFromDetail}
                    onDelete={handleDeleteEvent}
                    onBack={handleBackToList}
                    onJoinEvent={handleJoinEvent}
                    onLeaveEvent={handleLeaveEvent}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Eventos de {communityName}
                    </h1>
                    <p className="text-gray-600">
                        Descubre y participa en eventos de la comunidad
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {canCreateEvents && (
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Evento
                        </Button>
                    )}

                    {onBack && (
                        <Button onClick={onBack} variant="outline">
                            Volver a la Comunidad
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-96">
                    <TabsTrigger value="events" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Eventos
                    </TabsTrigger>
                    <TabsTrigger value="my-events" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Mis Eventos
                    </TabsTrigger>
                    {canEditEvents && (
                        <TabsTrigger value="management" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Gestión
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Todos los eventos */}
                <TabsContent value="events" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Todos los Eventos</h2>
                        <div className="text-sm text-gray-500">
                            Mostrando eventos públicos y de miembros
                        </div>
                    </div>

                    <EventList
                        communityId={communityId}
                        currentUserId={user?.id}
                        onViewEvent={handleViewEvent}
                        onJoinEvent={handleJoinEvent}
                        onLeaveEvent={handleLeaveEvent}
                    />
                </TabsContent>

                {/* Mis eventos */}
                <TabsContent value="my-events" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Mis Eventos</h2>
                        <div className="text-sm text-gray-500">
                            Eventos a los que te has unido
                        </div>
                    </div>

                    {user ? (
                        <EventList
                            communityId={communityId}
                            currentUserId={user.id}
                            onViewEvent={handleViewEvent}
                            onJoinEvent={handleJoinEvent}
                            onLeaveEvent={handleLeaveEvent}
                        />
                    ) : (
                        <Card className="p-8 text-center">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Inicia sesión para ver tus eventos
                            </h3>
                            <p className="text-gray-500">
                                Necesitas estar autenticado para ver los eventos a los que te has unido
                            </p>
                        </Card>
                    )}
                </TabsContent>

                {/* Gestión de eventos (solo admins) */}
                {canEditEvents && (
                    <TabsContent value="management" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Gestión de Eventos</h2>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                variant="outline"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Evento
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <Card className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-2">∞</div>
                                <div className="text-sm text-gray-600">Total de Eventos</div>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 mb-2">∞</div>
                                <div className="text-sm text-gray-600">Eventos Activos</div>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600 mb-2">∞</div>
                                <div className="text-sm text-gray-600">Participantes Total</div>
                            </Card>
                        </div>

                        <EventList
                            communityId={communityId}
                            currentUserId={user?.id}
                            onViewEvent={handleViewEvent}
                            onJoinEvent={handleJoinEvent}
                            onLeaveEvent={handleLeaveEvent}
                        />
                    </TabsContent>
                )}
            </Tabs>

            {/* Create Event Modal */}
            {showCreateModal && (
                <CreateEventModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateEvent}
                    isLoading={loading}
                />
            )}

            {/* Edit Event Modal */}
            {showEditModal && editingEvent && (
                <CreateEventModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingEvent(null);
                    }}
                    onSubmit={handleEditEvent}
                    isLoading={loading}
                    initialData={editingEvent}
                    mode="edit"
                />
            )}
        </div>
    );
}