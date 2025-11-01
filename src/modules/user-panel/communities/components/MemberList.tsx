import React from "react";
import { Avatar } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { CommunityMember } from "../services/communityService";
import {
  Crown,
  Shield,
  UserCheck,
  User,
  MoreHorizontal,
  Users,
} from "lucide-react";

interface MemberListProps {
  members: CommunityMember[];
  currentUserId?: string;
  currentUserRole?: string;
  onPromote?: (memberId: string, newRole: string) => void;
  onRemove?: (memberId: string) => void;
  isLoading?: boolean;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  currentUserId,
  currentUserRole,
  onPromote,
  onRemove,
  isLoading = false,
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "moderator":
        return <UserCheck className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "moderator":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const canManageMember = (memberRole: string, memberUserId: string) => {
    if (!currentUserId || !currentUserRole) return false;
    if (memberUserId === currentUserId) return false;

    const roleHierarchy = { owner: 4, admin: 3, moderator: 2, member: 1 };
    const currentLevel =
      roleHierarchy[currentUserRole as keyof typeof roleHierarchy] || 0;
    const memberLevel =
      roleHierarchy[memberRole as keyof typeof roleHierarchy] || 0;

    return currentLevel > memberLevel;
  };

  const formatJoinDate = (timestamp: any) => {
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
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  // Group and sort members by role
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3 };
    const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 4;
    const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 4;

    if (aOrder !== bOrder) return aOrder - bOrder;

    // Sort by join date within same role
    const aDate =
      a.joinedAt && typeof a.joinedAt.toDate === "function"
        ? a.joinedAt.toDate()
        : a.joinedAt instanceof Date
          ? a.joinedAt
          : new Date();
    const bDate =
      b.joinedAt && typeof b.joinedAt.toDate === "function"
        ? b.joinedAt.toDate()
        : b.joinedAt instanceof Date
          ? b.joinedAt
          : new Date();

    return aDate.getTime() - bDate.getTime();
  });

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No hay miembros para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Miembros ({members.length})</h3>
      </div>

      <div className="space-y-3">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                {member.userAvatar ? (
                  <img src={member.userAvatar} alt={member.userName} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {member.userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium truncate">{member.userName}</h4>
                  {member.userId === currentUserId && (
                    <Badge variant="outline" className="text-xs">
                      Tú
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getRoleColor(member.role)}`}
                  >
                    <span className="mr-1">{getRoleIcon(member.role)}</span>
                    {member.role === "owner"
                      ? "Propietario"
                      : member.role === "admin"
                        ? "Administrador"
                        : member.role === "moderator"
                          ? "Moderador"
                          : "Miembro"}
                  </Badge>
                  {member.status === "pending" && (
                    <Badge variant="secondary" className="text-xs">
                      Pendiente
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Se unió el {formatJoinDate(member.joinedAt)}
                </p>
              </div>
            </div>

            {/* Actions */}
            {canManageMember(member.role, member.userId) && (
              <div className="flex items-center gap-2">
                {member.role === "member" && onPromote && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPromote(member.id, "moderator")}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Promover
                  </Button>
                )}
                {member.role === "moderator" &&
                  onPromote &&
                  currentUserRole === "owner" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPromote(member.id, "admin")}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      Hacer Admin
                    </Button>
                  )}
                {onRemove && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemove(member.id)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Expulsar
                  </Button>
                )}
              </div>
            )}

            {/* Member permissions info */}
            <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
              {member.permissions.canPost && (
                <span title="Puede publicar">📝</span>
              )}
              {member.permissions.canComment && (
                <span title="Puede comentar">💬</span>
              )}
              {member.permissions.canInvite && (
                <span title="Puede invitar">👥</span>
              )}
              {member.permissions.canModerate && (
                <span title="Puede moderar">🛡️</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Permissions legend */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Permisos por rol:
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <div>
            <strong>Propietario:</strong> Control total
          </div>
          <div>
            <strong>Administrador:</strong> Gestión de miembros y contenido
          </div>
          <div>
            <strong>Moderador:</strong> Moderar contenido
          </div>
          <div>
            <strong>Miembro:</strong> Participar en la comunidad
          </div>
        </div>
      </div>
    </div>
  );
};
