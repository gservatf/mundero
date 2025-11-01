import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar } from "../../../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { Separator } from "../../../../components/ui/separator";
import { JoinButton } from "../components/JoinButton";
import { MemberList } from "../components/MemberList";
import { PostCard } from "../../components/PostCard";
import { PostFeed } from "../../components/PostFeed";
import {
  communityService,
  Community,
  CommunityMember,
  CommunityPost,
} from "../services/communityService";
import { useAuth } from "../../../../hooks/useAuth";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Globe,
  Lock,
  Settings,
  Pin,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Edit,
  Star,
  TrendingUp,
  Shield,
  Trash2,
  UserX,
} from "lucide-react";

export const CommunityDetail: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [userMembership, setUserMembership] = useState<CommunityMember | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isUserAdmin, setIsUserAdmin] = useState(false); // FASE 6.1: Verificar si es admin
  const [membersListener, setMembersListener] = useState<(() => void) | null>(
    null,
  ); // FASE 6.1: Listener tiempo real

  useEffect(() => {
    if (communityId) {
      loadCommunityData();
    }

    // FASE 6.1: Cleanup del listener de miembros al desmontar
    return () => {
      if (membersListener) {
        membersListener();
      }
    };
  }, [communityId, user]);

  const loadCommunityData = async () => {
    if (!communityId) return;

    try {
      setIsLoading(true);

      // Load community basic info
      const communityData = await communityService.getCommunity(communityId);
      if (!communityData) {
        navigate("/communities");
        return;
      }
      setCommunity(communityData);

      // Load members
      const membersData =
        await communityService.getCommunityMembers(communityId);
      setMembers(membersData);

      // Check user membership
      if (user?.id) {
        const membership = membersData.find((m) => m.userId === user.id);
        setUserMembership(membership || null);

        // FASE 6.1: Verificar si es administrador
        const adminStatus = await communityService.isCommunityAdmin(
          communityId,
          user.id,
        );
        setIsUserAdmin(adminStatus);

        // FASE 6.1: Configurar listener de miembros en tiempo real si es admin
        if (adminStatus) {
          const unsubscribe = communityService.onCommunityMembers(
            communityId,
            (updatedMembers) => {
              setMembers(updatedMembers);
              // Actualizar userMembership si cambió
              const updatedUserMembership = updatedMembers.find(
                (m) => m.userId === user.id,
              );
              setUserMembership(updatedUserMembership || null);
            },
          );
          setMembersListener(() => unsubscribe);
        }
      }

      // Load posts if user is a member or community is public
      const canViewPosts =
        !communityData.isPrivate ||
        (user?.id &&
          membersData.some(
            (m) => m.userId === user.id && m.status === "active",
          ));

      if (canViewPosts) {
        loadPosts();
      }
    } catch (error) {
      console.error("Error loading community data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async () => {
    if (!communityId) return;

    try {
      setPostsLoading(true);
      const { posts: postsData } =
        await communityService.getCommunityPosts(communityId);
      setPosts(postsData);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!communityId || !user?.id || !user?.display_name) return;

    try {
      setActionLoading(true);
      await communityService.joinCommunity(
        communityId,
        user.id,
        user.display_name,
      );
      await loadCommunityData();
    } catch (error) {
      console.error("Error joining community:", error);
      alert("Error al unirse a la comunidad");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!communityId || !user?.id) return;

    if (confirm("¿Estás seguro de que quieres abandonar esta comunidad?")) {
      try {
        setActionLoading(true);
        await communityService.leaveCommunity(communityId, user.id);
        await loadCommunityData();
      } catch (error) {
        console.error("Error leaving community:", error);
        alert("Error al abandonar la comunidad");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // FASE 6.1: Funciones de administración
  const handleDeleteCommunity = async () => {
    if (!communityId || !user?.id || !community) return;

    const confirmMessage = `¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la comunidad "${community.name}"? Esta acción no se puede deshacer y eliminará todos los posts, miembros y datos asociados.`;

    if (confirm(confirmMessage)) {
      try {
        setActionLoading(true);
        await communityService.deleteCommunity(communityId, user.id);
        alert("Comunidad eliminada exitosamente");
        navigate("/communities");
      } catch (error) {
        console.error("Error deleting community:", error);
        alert("Error al eliminar la comunidad: " + (error as Error).message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handlePromoteMember = async (memberId: string, newRole: string) => {
    if (!communityId || !user?.id) return;

    try {
      const member = members.find((m) => m.id === memberId);
      if (!member) return;

      if (newRole === "admin") {
        await communityService.promoteToAdmin(
          communityId,
          member.userId,
          user.id,
        );
        alert(`${member.userName} ha sido promovido a administrador`);
      }
      // La actualización se maneja automáticamente por el listener
    } catch (error) {
      console.error("Error promoting member:", error);
      alert("Error al promover miembro: " + (error as Error).message);
    }
  };

  const handleKickMember = async (memberId: string) => {
    if (!communityId || !user?.id) return;

    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    if (
      confirm(
        `¿Estás seguro de que quieres expulsar a ${member.userName} de la comunidad?`,
      )
    ) {
      try {
        await communityService.kickMember(communityId, member.userId, user.id);
        alert(`${member.userName} ha sido expulsado de la comunidad`);
        // La actualización se maneja automáticamente por el listener
      } catch (error) {
        console.error("Error kicking member:", error);
        alert("Error al expulsar miembro: " + (error as Error).message);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      let date: Date;
      if (timestamp && typeof timestamp.toDate === "function") {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const canManageCommunity = () => {
    // FASE 6.1: Usar isUserAdmin que verifica tanto owner como admin
    return isUserAdmin;
  };

  const canPost = () => {
    return (
      userMembership &&
      userMembership.status === "active" &&
      (userMembership.permissions.canPost ||
        ["owner", "admin"].includes(userMembership.role))
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <Card className="p-6 animate-pulse">
          <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-600">
          Comunidad no encontrada
        </h2>
        <Button onClick={() => navigate("/communities")} className="mt-4">
          Volver a Comunidades
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/communities")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Community Header */}
      <Card className="overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {community.coverImage && (
            <img
              src={community.coverImage}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />

          {/* Privacy indicator */}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {community.isPrivate ? (
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

          {/* Management actions */}
          {canManageCommunity() && (
            <div className="absolute top-4 left-4 flex gap-2">
              <Button variant="secondary" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>

              {/* FASE 6.1: Botón de eliminar solo para owner */}
              {community.createdBy === user?.id && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteCommunity}
                  disabled={actionLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Community Info */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and basic info */}
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg -mt-10">
                {community.avatar ? (
                  <img src={community.avatar} alt={community.name} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {community.name}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-gray-600">
                    Creada por {community.creatorName}
                  </p>
                  {/* FASE 6.1: Insignia 🛡️ "Administrador" para el creador */}
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 border-purple-300"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    🛡️ Propietario
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{community.category}</Badge>
                  {community.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="flex flex-col items-end gap-4">
              {user && (
                <JoinButton
                  communityId={community.id}
                  isJoined={
                    !!userMembership && userMembership.status === "active"
                  }
                  isPrivate={community.isPrivate}
                  requiresApproval={community.settings.requireApproval}
                  isPending={userMembership?.status === "pending"}
                  onJoin={handleJoinCommunity}
                  onLeave={handleLeaveCommunity}
                  isLoading={actionLoading}
                />
              )}

              {/* Stats */}
              <div className="flex gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{community.memberCount} miembros</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{community.postCount} posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(community.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <p className="text-gray-700 leading-relaxed">
              {community.description}
            </p>
          </div>

          {/* Location */}
          {community.location && (
            <div className="mt-4 flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>
                {community.location.city && community.location.country
                  ? `${community.location.city}, ${community.location.country}`
                  : community.location.city || community.location.country}
              </span>
            </div>
          )}

          {/* Community Rules */}
          {community.rules && community.rules.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                Reglas de la Comunidad
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
                {community.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-medium">{index + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts ({community.postCount})</TabsTrigger>
          <TabsTrigger value="members">
            Miembros ({community.memberCount})
          </TabsTrigger>
          <TabsTrigger value="about">Acerca de</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {userMembership && userMembership.status === "active" ? (
            <>
              {canPost() && (
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {user?.photo_url ? (
                        <img src={user.photo_url} alt={user.display_name} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user?.display_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-gray-500"
                      onClick={() => {
                        /* Open create post modal */
                      }}
                    >
                      ¿Qué quieres compartir con la comunidad?
                    </Button>
                  </div>
                </Card>
              )}

              <div className="space-y-4">
                {postsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6 animate-pulse">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No hay posts aún
                    </h3>
                    <p className="text-gray-500">
                      {canPost()
                        ? "Sé el primero en publicar algo en esta comunidad"
                        : "Los miembros comenzarán a publicar pronto"}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : community.isPrivate ? (
            <div className="text-center py-12">
              <Lock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Comunidad Privada
              </h3>
              <p className="text-gray-500">
                Únete a la comunidad para ver y participar en las conversaciones
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <MemberList
            members={members}
            currentUserId={user?.id}
            currentUserRole={userMembership?.role}
            onPromote={isUserAdmin ? handlePromoteMember : undefined}
            onRemove={isUserAdmin ? handleKickMember : undefined}
            isLoading={actionLoading}
          />
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">
                  {community.description}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Información General</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Categoría: {community.category}</div>
                    <div>Creada: {formatDate(community.createdAt)}</div>
                    <div>Creador: {community.creatorName}</div>
                    {community.location && (
                      <div>
                        Ubicación:{" "}
                        {community.location.city || community.location.country}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Estadísticas</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Miembros: {community.memberCount}</div>
                    <div>Posts: {community.postCount}</div>
                    <div>Miembros activos: {community.stats.activeMembers}</div>
                    <div>
                      Total de comentarios: {community.stats.totalComments}
                    </div>
                    <div>Total de likes: {community.stats.totalLikes}</div>
                  </div>
                </div>
              </div>

              {community.tags && community.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                      {community.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Configuración</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    Invitaciones:{" "}
                    {community.settings.allowInvites
                      ? "Permitidas"
                      : "No permitidas"}
                  </div>
                  <div>
                    Aprobación requerida:{" "}
                    {community.settings.requireApproval ? "Sí" : "No"}
                  </div>
                  <div>
                    Publicaciones de miembros:{" "}
                    {community.settings.allowMemberPosts
                      ? "Permitidas"
                      : "Solo administradores"}
                  </div>
                  <div>
                    Eventos de miembros:{" "}
                    {community.settings.allowMemberEvents
                      ? "Permitidos"
                      : "Solo administradores"}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
