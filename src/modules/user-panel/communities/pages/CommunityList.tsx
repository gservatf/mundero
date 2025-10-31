import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { CommunityCard } from '../components/CommunityCard';
import { CreateCommunityModal } from '../components/CreateCommunityModal';
import { communityService, Community, CommunityMember } from '../services/communityService';
import { useAuth } from '../../../../hooks/useAuth';
import {
    Search,
    Plus,
    Filter,
    Grid,
    List,
    MapPin,
    Users,
    TrendingUp,
    Star,
    Shield
} from 'lucide-react';

export const CommunityList: React.FC = () => {
    const { user } = useAuth();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [myCommunities, setMyCommunities] = useState<Community[]>([]);
    const [adminCommunities, setAdminCommunities] = useState<Community[]>([]); // FASE 6.1: Comunidades administradas
    const [userMemberships, setUserMemberships] = useState<CommunityMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false); // FASE 6.1: Modal de creación

    // Community categories
    const categories = [
        'Tecnología',
        'Negocios',
        'Educación',
        'Salud',
        'Deportes',
        'Arte',
        'Música',
        'Viajes',
        'Cocina',
        'Gaming',
        'Ciencia',
        'Literatura',
        'Fotografía',
        'Medio Ambiente',
        'Voluntariado'
    ];

    useEffect(() => {
        loadCommunities();
        if (user?.id) {
            loadUserMemberships();
            loadAdminCommunities(); // FASE 6.1: Cargar comunidades administradas
        }
    }, [user]);

    const loadCommunities = async () => {
        try {
            setIsLoading(true);
            const data = await communityService.getCommunities(user?.id, {
                search: searchTerm,
                category: selectedCategory,
                limit: 50
            });
            setCommunities(data);
        } catch (error) {
            console.error('Error loading communities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUserMemberships = async () => {
        if (!user?.id) return;

        try {
            const memberships = await communityService.getUserMemberships(user.id);
            setUserMemberships(memberships);

            // Get full community data for user's communities
            const userCommunitiesData = await Promise.all(
                memberships.map(async (membership) => {
                    const community = await communityService.getCommunity(membership.communityId);
                    return community;
                })
            );

            setMyCommunities(userCommunitiesData.filter(Boolean) as Community[]);
        } catch (error) {
            console.error('Error loading user memberships:', error);
        }
    };

    // FASE 6.1: Cargar comunidades administradas por el usuario
    const loadAdminCommunities = async () => {
        if (!user?.id) return;

        try {
            const adminComms = await communityService.getUserAdminCommunities(user.id);
            setAdminCommunities(adminComms);
        } catch (error) {
            console.error('Error loading admin communities:', error);
        }
    };

    // FASE 6.1: Manejar éxito de creación de comunidad
    const handleCreateSuccess = async (communityId: string) => {
        await loadCommunities();
        await loadUserMemberships();
        await loadAdminCommunities();
        // Opcional: navegar a la nueva comunidad
        // navigate(`/communities/${communityId}`);
    };

    const handleJoinCommunity = async (communityId: string) => {
        if (!user?.id || !user?.display_name) return;

        try {
            setActionLoading(communityId);
            await communityService.joinCommunity(communityId, user.id, user.display_name);
            await loadCommunities();
            await loadUserMemberships();
        } catch (error) {
            console.error('Error joining community:', error);
            alert('Error al unirse a la comunidad');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeaveCommunity = async (communityId: string) => {
        if (!user?.id) return;

        if (confirm('¿Estás seguro de que quieres abandonar esta comunidad?')) {
            try {
                setActionLoading(communityId);
                await communityService.leaveCommunity(communityId, user.id);
                await loadCommunities();
                await loadUserMemberships();
            } catch (error) {
                console.error('Error leaving community:', error);
                alert('Error al abandonar la comunidad');
            } finally {
                setActionLoading(null);
            }
        }
    };

    const handleViewCommunity = (communityId: string) => {
        // Navigate to community detail page
        window.location.href = `/communities/${communityId}`;
    };

    const isUserMember = (communityId: string) => {
        return userMemberships.some(m => m.communityId === communityId);
    };

    const filteredCommunities = communities.filter(community => {
        const matchesSearch = !searchTerm ||
            community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = !selectedCategory || community.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const renderCommunities = (communitiesToRender: Community[]) => {
        if (communitiesToRender.length === 0) {
            return (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No se encontraron comunidades
                    </h3>
                    <p className="text-gray-500">
                        {activeTab === 'my'
                            ? 'Aún no eres miembro de ninguna comunidad'
                            : 'Intenta cambiar los filtros de búsqueda'
                        }
                    </p>
                </div>
            );
        }

        const gridClass = viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4';

        return (
            <div className={gridClass}>
                {communitiesToRender.map((community) => (
                    <CommunityCard
                        key={community.id}
                        community={community}
                        isJoined={isUserMember(community.id)}
                        onJoin={handleJoinCommunity}
                        onLeave={handleLeaveCommunity}
                        onView={handleViewCommunity}
                        isLoading={actionLoading === community.id}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Comunidades</h1>
                    <p className="text-gray-600 mt-1">
                        Descubre y únete a comunidades que comparten tus intereses
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Comunidad
                </Button>
            </div>

            {/* Search and Filters */}
            <Card className="p-6">
                <div className="space-y-4">
                    {/* Search bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar comunidades..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filters and view controls */}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        {/* Category filter */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={selectedCategory === '' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory('')}
                            >
                                Todas
                            </Button>
                            {categories.slice(0, 8).map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>

                        {/* View mode toggle */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Community tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">
                        Todas ({filteredCommunities.length})
                    </TabsTrigger>
                    <TabsTrigger value="my">
                        Mis Comunidades ({myCommunities.length})
                    </TabsTrigger>
                    <TabsTrigger value="admin">
                        <Shield className="w-4 h-4 mr-1" />
                        Administradas ({adminCommunities.length})
                    </TabsTrigger>
                    <TabsTrigger value="popular">
                        Populares
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i} className="p-6 animate-pulse">
                                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        renderCommunities(filteredCommunities)
                    )}
                </TabsContent>

                <TabsContent value="my" className="space-y-6">
                    {renderCommunities(myCommunities)}
                </TabsContent>

                <TabsContent value="admin" className="space-y-6">
                    {adminCommunities.length > 0 ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-blue-800 mb-2">
                                    <Shield className="w-5 h-5" />
                                    <h3 className="font-semibold">Comunidades que Administras</h3>
                                </div>
                                <p className="text-blue-700 text-sm">
                                    Tienes permisos de administración en estas comunidades.
                                    Puedes gestionar miembros, moderar contenido y configurar la comunidad.
                                </p>
                            </div>
                            {renderCommunities(adminCommunities)}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">
                                No administras ninguna comunidad
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Crea tu primera comunidad o conviértete en administrador de una existente
                            </p>
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Mi Primera Comunidad
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="popular" className="space-y-6">
                    {renderCommunities(
                        [...filteredCommunities]
                            .sort((a, b) => b.memberCount - a.memberCount)
                            .slice(0, 12)
                    )}
                </TabsContent>
            </Tabs>

            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <h3 className="font-semibold">Comunidades Activas</h3>
                    <p className="text-2xl font-bold text-blue-600">{communities.length}</p>
                </Card>
                <Card className="p-6 text-center">
                    <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <h3 className="font-semibold">Miembros Totales</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {communities.reduce((total, c) => total + c.memberCount, 0)}
                    </p>
                </Card>
                <Card className="p-6 text-center">
                    <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                    <h3 className="font-semibold">Mis Membresías</h3>
                    <p className="text-2xl font-bold text-yellow-600">{myCommunities.length}</p>
                </Card>
                <Card className="p-6 text-center">
                    <Shield className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                    <h3 className="font-semibold">Administradas</h3>
                    <p className="text-2xl font-bold text-purple-600">{adminCommunities.length}</p>
                </Card>
            </div>

            {/* FASE 6.1: Modal de Creación de Comunidad */}
            <CreateCommunityModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};