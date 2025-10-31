import React, { useState } from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import { Avatar } from '../../../../components/ui/avatar';
import { communityService, CreateCommunityData } from '../services/communityService';
import { useAuth } from '../../../../hooks/useAuth';
import {
    X,
    Globe,
    Lock,
    Users,
    CheckCircle,
    AlertCircle,
    Plus
} from 'lucide-react';

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (communityId: string) => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const { user } = useAuth();

    const [formData, setFormData] = useState<CreateCommunityData>({
        name: '',
        description: '',
        category: '',
        coverImage: '',
        avatar: '',
        isPrivate: false,
        tags: [],
        rules: [],
        location: {
            city: '',
            country: ''
        },
        settings: {
            allowInvites: true,
            requireApproval: false,
            allowMemberPosts: true,
            allowMemberEvents: true
        }
    });

    const [currentTag, setCurrentTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Community categories
    const categories = [
        'Tecnología', 'Negocios', 'Educación', 'Salud', 'Deportes',
        'Arte', 'Música', 'Viajes', 'Cocina', 'Gaming',
        'Ciencia', 'Literatura', 'Fotografía', 'Medio Ambiente', 'Voluntariado'
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const addTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 5) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag.trim()]
            }));
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Mínimo 3 caracteres';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es requerida';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Mínimo 10 caracteres';
        }

        if (!formData.category) {
            newErrors.category = 'Selecciona una categoría';
        }

        if (formData.tags.length === 0) {
            newErrors.tags = 'Agrega al menos una etiqueta';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id || !user?.display_name) {
            alert('Debes estar autenticado');
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            const communityId = await communityService.createCommunity(
                user.id,
                user.display_name,
                formData
            );

            onSuccess?.(communityId);
            onClose();
        } catch (error) {
            console.error('Error creating community:', error);
            alert('Error al crear la comunidad');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            coverImage: '',
            avatar: '',
            isPrivate: false,
            tags: [],
            rules: [],
            location: { city: '', country: '' },
            settings: {
                allowInvites: true,
                requireApproval: false,
                allowMemberPosts: true,
                allowMemberEvents: true
            }
        });
        setCurrentTag('');
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">Crear Nueva Comunidad</h2>
                    <Button variant="ghost" size="sm" onClick={handleClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-sm font-medium text-gray-700 mb-3">Vista Previa</p>
                        <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {formData.name.charAt(0).toUpperCase() || '?'}
                                </div>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold">
                                    {formData.name || 'Nombre de la comunidad'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    por {user?.display_name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    {formData.category && (
                                        <Badge variant="outline" className="text-xs">
                                            {formData.category}
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-xs">
                                        {formData.isPrivate ? (
                                            <>
                                                <Lock className="w-3 h-3 mr-1" />
                                                Privada
                                            </>
                                        ) : (
                                            <>
                                                <Globe className="w-3 h-3 mr-1" />
                                                Pública
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Información Básica
                        </h3>

                        {/* Name */}
                        <div>
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Ej: Desarrolladores React"
                                maxLength={100}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Descripción *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe tu comunidad..."
                                rows={3}
                                maxLength={300}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                                {formData.description.length}/300
                            </p>
                        </div>

                        {/* Category */}
                        <div>
                            <Label>Categoría *</Label>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {categories.slice(0, 9).map((category) => (
                                    <Button
                                        key={category}
                                        type="button"
                                        variant={formData.category === category ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleInputChange('category', category)}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                            {errors.category && (
                                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                            )}
                        </div>

                        {/* Privacy */}
                        <div>
                            <Label>Privacidad</Label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <Button
                                    type="button"
                                    variant={!formData.isPrivate ? 'default' : 'outline'}
                                    className="p-3 h-auto justify-start"
                                    onClick={() => handleInputChange('isPrivate', false)}
                                >
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            <span className="font-medium">Pública</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Cualquiera puede unirse
                                        </p>
                                    </div>
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.isPrivate ? 'default' : 'outline'}
                                    className="p-3 h-auto justify-start"
                                    onClick={() => handleInputChange('isPrivate', true)}
                                >
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            <span className="font-medium">Privada</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Solo miembros ven contenido
                                        </p>
                                    </div>
                                </Button>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <Label>Etiquetas * (máx 5)</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    placeholder="Ej: javascript, react..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    maxLength={20}
                                />
                                <Button
                                    type="button"
                                    onClick={addTag}
                                    disabled={!currentTag.trim() || formData.tags.length >= 5}
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                            #{tag}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-red-100"
                                                onClick={() => removeTag(tag)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            {errors.tags && (
                                <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[120px]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Crear Comunidad
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};