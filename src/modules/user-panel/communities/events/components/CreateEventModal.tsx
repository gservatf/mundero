// FASE 6.4 — CreateEventModal Component
import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Textarea } from '../../../../../components/ui/textarea';
import { Calendar, Clock, MapPin, Video, Users, X, Plus } from 'lucide-react';
import { eventService, CreateEventData } from '../services/eventService';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (eventData: CreateEventData) => Promise<void>;
    isLoading?: boolean;
    initialData?: any;
    mode?: 'create' | 'edit';
}

export function CreateEventModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    initialData,
    mode = 'create'
}: CreateEventModalProps) {
    const [formData, setFormData] = useState<CreateEventData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        startAt: initialData?.startAt || Date.now() + (24 * 60 * 60 * 1000), // Mañana por defecto
        endAt: initialData?.endAt,
        location: initialData?.location || '',
        embedUrl: initialData?.embedUrl || '',
        tags: initialData?.tags || [],
        maxAttendees: initialData?.maxAttendees,
        coverImage: initialData?.coverImage,
        isRecurring: initialData?.isRecurring || false
    });
    const [newTag, setNewTag] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('El título es requerido');
            return;
        }

        if (formData.startAt <= Date.now()) {
            setError('La fecha del evento debe ser en el futuro');
            return;
        }

        try {
            setError(null);
            await onSubmit(formData);
            onClose();
        } catch (err) {
            console.error('Error submitting event:', err);
            setError(err instanceof Error ? err.message : 'Error al procesar el evento');
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
        }));
    };

    const formatDateForInput = (timestamp: number): string => {
        return new Date(timestamp).toISOString().slice(0, 16);
    };

    const handleDateTimeChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            startAt: new Date(value).getTime()
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <Card className="border-0">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                Crear Nuevo Evento
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={onClose} type="button">
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Error Display */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Título del Evento *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Ej: Conferencia sobre React"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe de qué trata el evento..."
                                    className="min-h-[100px]"
                                />
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Fecha y Hora de Inicio *
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="datetime-local"
                                        value={formatDateForInput(formData.startAt)}
                                        onChange={(e) => handleDateTimeChange(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Fecha y Hora de Fin
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="datetime-local"
                                        value={formData.endAt ? formatDateForInput(formData.endAt) : ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            endAt: e.target.value ? new Date(e.target.value).getTime() : undefined
                                        }))}
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <Label htmlFor="location" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Ubicación
                                </Label>
                                <Input
                                    id="location"
                                    value={formData.location || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="Ej: Auditorio Principal, Online, etc."
                                />
                            </div>

                            {/* Embed URL */}
                            <div className="space-y-2">
                                <Label htmlFor="embedUrl" className="flex items-center gap-2">
                                    <Video className="h-4 w-4" />
                                    URL de Transmisión/Documento
                                </Label>
                                <Input
                                    id="embedUrl"
                                    value={formData.embedUrl || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, embedUrl: e.target.value }))}
                                    placeholder="YouTube, Google Meet, Drive, Zoom, etc."
                                />
                                <p className="text-xs text-gray-500">
                                    Soporta: YouTube, Google Meet, Google Drive, Zoom, Twitch
                                </p>
                            </div>

                            {/* Max Attendees */}
                            <div className="space-y-2">
                                <Label htmlFor="maxAttendees" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Límite de Asistentes
                                </Label>
                                <Input
                                    id="maxAttendees"
                                    type="number"
                                    min="1"
                                    value={formData.maxAttendees || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        maxAttendees: e.target.value ? parseInt(e.target.value) : undefined
                                    }))}
                                    placeholder="Dejar vacío para sin límite"
                                />
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label>Etiquetas</Label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Agregar etiqueta"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={handleAddTag} size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {formData.tags && formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="hover:text-blue-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" type="button" onClick={onClose}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (mode === 'edit' ? 'Guardando...' : 'Creando...') : (mode === 'edit' ? 'Guardar Cambios' : 'Crear Evento')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}