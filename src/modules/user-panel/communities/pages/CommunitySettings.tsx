// FASE 6.3 — CommunitySettings Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { ArrowLeft, Settings, Crown, Users, Shield } from 'lucide-react';
import { PAYMENT_ENABLED } from '../payments/paymentConfig';
import { SubscriptionPreview } from '../payments/SubscriptionPreview';
import { UpgradePlanModal } from '../payments/UpgradePlanModal';
import { communityService, Community } from '../services/communityService';
import { useAuth } from '../../../../hooks/useAuth';

export const CommunitySettings: React.FC = () => {
    const { communityId } = useParams<{ communityId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [community, setCommunity] = useState<Community | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        loadCommunityData();
    }, [communityId, user?.id]);

    const loadCommunityData = async () => {
        if (!communityId || !user?.id) return;

        try {
            setLoading(true);
            const communityData = await communityService.getCommunity(communityId);

            if (!communityData) {
                navigate('/communities');
                return;
            }

            setCommunity(communityData);

            // Verificar si el usuario es admin/owner
            const adminStatus = await communityService.isCommunityAdmin(communityId, user.id);
            setIsAdmin(adminStatus);

            if (!adminStatus) {
                // Si no es admin, redirigir a la página de la comunidad
                navigate(`/communities/${communityId}`);
                return;
            }

        } catch (error) {
            console.error('Error loading community data:', error);
            navigate('/communities');
        } finally {
            setLoading(false);
        }
    };

    const handleUpgradeClick = (planId?: string) => {
        setShowUpgradeModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!community || !isAdmin) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/communities/${communityId}`)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Configuración de {community.name}
                    </h1>
                    <p className="text-gray-600">
                        Gestiona la configuración y características de tu comunidad
                    </p>
                </div>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="members" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Miembros
                    </TabsTrigger>
                    <TabsTrigger value="moderation" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Moderación
                    </TabsTrigger>
                    {PAYMENT_ENABLED && (
                        <TabsTrigger value="membership" className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Membresías
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nombre de la Comunidad</label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        {community.name}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Descripción</label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        {community.description}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Categoría</label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        {community.category}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button disabled>
                                        Editar Información
                                        <span className="ml-2 text-xs">(Próximamente)</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="members" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión de Miembros</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {community.memberCount}
                                        </div>
                                        <div className="text-sm text-blue-700">Total Miembros</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {community.admins?.length || 1}
                                        </div>
                                        <div className="text-sm text-green-700">Administradores</div>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {community.postCount || 0}
                                        </div>
                                        <div className="text-sm text-yellow-700">Posts Totales</div>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button
                                        onClick={() => navigate(`/communities/${communityId}`)}
                                        variant="outline"
                                    >
                                        Ver Lista de Miembros
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="moderation" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Herramientas de Moderación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-900 mb-2">
                                        Moderación Avanzada (FASE 6.2)
                                    </h4>
                                    <p className="text-sm text-blue-700 mb-3">
                                        Las herramientas avanzadas de moderación están en desarrollo.
                                    </p>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Sistema de reportes automatizado</li>
                                        <li>• Roles de moderadores</li>
                                        <li>• Historial de acciones</li>
                                        <li>• Filtros de contenido</li>
                                    </ul>
                                </div>
                                <div className="pt-4">
                                    <Button disabled>
                                        Configurar Moderación
                                        <span className="ml-2 text-xs">(Próximamente)</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {PAYMENT_ENABLED && (
                    <TabsContent value="membership" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                    Planes de Membresía
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user?.id && (
                                    <SubscriptionPreview
                                        userId={user.id}
                                        onUpgradeClick={handleUpgradeClick}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            {/* Upgrade Modal */}
            {user?.id && (
                <UpgradePlanModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    userId={user.id}
                />
            )}
        </div>
    );
};