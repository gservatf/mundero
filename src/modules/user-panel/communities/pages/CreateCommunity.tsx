import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import { Avatar } from '../../../../components/ui/avatar';
import { Separator } from '../../../../components/ui/separator';
import { communityService, CreateCommunityData } from '../services/communityService';
import { useAuth } from '../../../../hooks/useAuth';
import {
    ArrowLeft,
    Upload,
    X,
    Globe,
    Lock,
    Users,
    CheckCircle,
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react';

export const CreateCommunity: React.FC = () => {
    const navigate = useNavigate();
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
    const [currentRule, setCurrentRule] = useState('');
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

    const handleLocationChange = (field: 'city' | 'country', value: string) => {
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [field]: value
            }
        }));
    };

    const handleSettingsChange = (setting: keyof typeof formData.settings, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [setting]: value
            }
        }));
    };

    const addTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
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

    const addRule = () => {
        if (currentRule.trim() && !formData.rules?.includes(currentRule.trim()) && (formData.rules?.length || 0) < 10) {
            setFormData(prev => ({
                ...prev,
                rules: [...(prev.rules || []), currentRule.trim()]
            }));
            setCurrentRule('');
        }
    };

    const removeRule = (ruleToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules?.filter(rule => rule !== ruleToRemove) || []
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre de la comunidad es requerido';
        } else if (formData.name.length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es requerida';
        } else if (formData.description.length < 10) {
            newErrors.description = 'La descripción debe tener al menos 10 caracteres';
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
            alert('Debes estar autenticado para crear una comunidad');
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

            // Navigate to the new community
            navigate(`/communities/${communityId}`);
        } catch (error) {
            console.error('Error creating community:', error);
            alert('Error al crear la comunidad. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Navigation */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/communities')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </Button>
            </div>

            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Comunidad</h1>
                <p className="text-gray-600 mt-2">
                    Crea un espacio para conectar con personas que comparten tus intereses
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Información Básica
                    </h2>

                    <div className="space-y-6">
                        {/* Community Preview */}
                        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Vista Previa</h3>
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                            {formData.name.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    )}
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-lg">
                                        {formData.name || 'Nombre de la comunidad'}
                                    </h4>
                                    <p className="text-gray-600 text-sm">
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
                            {formData.description && (
                                <p className="mt-4 text-gray-700 text-sm">
                                    {formData.description}
                                </p>
                            )}
                        </div>

                        {/* Name */}
                        <div>
                            <Label htmlFor="name">Nombre de la Comunidad *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Ej: Desarrolladores Full Stack"
                                maxLength={100}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.name}
                                </p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                                {formData.name.length}/100 caracteres
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Descripción *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe de qué trata tu comunidad, qué tipo de contenido se compartirá y qué pueden esperar los miembros..."
                                rows={4}
                                maxLength={500}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.description}
                                </p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                                {formData.description.length}/500 caracteres
                            </p>
                        </div>

                        {/* Category */}
                        <div>
                            <Label>Categoría *</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        type="button"
                                        variant={formData.category === category ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleInputChange('category', category)}
                                        className="justify-start"
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                            {errors.category && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        {/* Privacy */}
                        <div>
                            <Label>Privacidad</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <Button
                                    type="button"
                                    variant={!formData.isPrivate ? 'default' : 'outline'}
                                    className="p-4 h-auto justify-start"
                                    onClick={() => handleInputChange('isPrivate', false)}
                                >
                                    <div className="text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Globe className="w-4 h-4" />
                                            <span className="font-medium">Pública</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Cualquiera puede ver la comunidad y unirse
                                        </p>
                                    </div>
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.isPrivate ? 'default' : 'outline'}
                                    className="p-4 h-auto justify-start"
                                    onClick={() => handleInputChange('isPrivate', true)}
                                >
                                    <div className="text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Lock className="w-4 h-4" />
                                            <span className="font-medium">Privada</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Solo los miembros pueden ver el contenido
                                        </p>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tags and Rules */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Etiquetas y Reglas</h2>

                    <div className="space-y-6">
                        {/* Tags */}
                        <div>
                            <Label>Etiquetas * (máximo 10)</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    placeholder="Ej: javascript, react, desarrollo..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    maxLength={20}
                                />
                                <Button type="button" onClick={addTag} disabled={!currentTag.trim() || formData.tags.length >= 10}>
                                    Agregar
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
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.tags}
                                </p>
                            )}
                        </div>

                        {/* Rules */}
                        <div>
                            <Label>Reglas de la Comunidad (opcional, máximo 10)</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={currentRule}
                                    onChange={(e) => setCurrentRule(e.target.value)}
                                    placeholder="Ej: Mantén las discusiones respetuosas..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                                    maxLength={200}
                                />
                                <Button type="button" onClick={addRule} disabled={!currentRule.trim() || (formData.rules?.length || 0) >= 10}>
                                    Agregar
                                </Button>
                            </div>
                            {formData.rules && formData.rules.length > 0 && (
                                <div className="space-y-2 mt-3">
                                    {formData.rules.map((rule, index) => (
                                        <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-sm">{index + 1}.</span>
                                            <span className="flex-1 text-sm">{rule}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-red-100"
                                                onClick={() => removeRule(rule)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Location and Settings */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Ubicación y Configuración</h2>

                    <div className="space-y-6">
                        {/* Location */}
                        <div>
                            <Label>Ubicación (opcional)</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <Input
                                        value={formData.location?.city || ''}
                                        onChange={(e) => handleLocationChange('city', e.target.value)}
                                        placeholder="Ciudad"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={formData.location?.country || ''}
                                        onChange={(e) => handleLocationChange('country', e.target.value)}
                                        placeholder="País"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Settings */}
                        <div>
                            <Label className="text-base font-medium">Configuración de la Comunidad</Label>
                            <div className="space-y-4 mt-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium">Permitir invitaciones</div>
                                        <div className="text-sm text-gray-600">Los miembros pueden invitar a otros usuarios</div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant={formData.settings.allowInvites ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSettingsChange('allowInvites', !formData.settings.allowInvites)}
                                    >
                                        {formData.settings.allowInvites ? 'Activado' : 'Desactivado'}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium">Requerir aprobación</div>
                                        <div className="text-sm text-gray-600">Las solicitudes de membresía deben ser aprobadas</div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant={formData.settings.requireApproval ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSettingsChange('requireApproval', !formData.settings.requireApproval)}
                                    >
                                        {formData.settings.requireApproval ? 'Activado' : 'Desactivado'}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium">Publicaciones de miembros</div>
                                        <div className="text-sm text-gray-600">Los miembros pueden crear publicaciones</div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant={formData.settings.allowMemberPosts ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSettingsChange('allowMemberPosts', !formData.settings.allowMemberPosts)}
                                    >
                                        {formData.settings.allowMemberPosts ? 'Permitido' : 'Solo Admins'}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium">Eventos de miembros</div>
                                        <div className="text-sm text-gray-600">Los miembros pueden crear eventos</div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant={formData.settings.allowMemberEvents ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSettingsChange('allowMemberEvents', !formData.settings.allowMemberEvents)}
                                    >
                                        {formData.settings.allowMemberEvents ? 'Permitido' : 'Solo Admins'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/communities')}
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
    );
};