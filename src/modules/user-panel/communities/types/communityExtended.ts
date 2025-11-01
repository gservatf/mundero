// FASE 6.2 — Tipos Extendidos para Comunidades Premium & Roles Internos
export type CommunityRole = "owner" | "admin" | "moderator" | "member";

export type MembershipTier = "free" | "pro" | "elite"; // sin pagos, solo clasificación

// Tipos de estado de reportes de moderación
export type ReportStatus = "pending" | "in_review" | "resolved" | "dismissed";

// Tipos de razones de reporte
export type ReportReason =
  | "harassment"
  | "hate_speech"
  | "spam"
  | "fake_news"
  | "inappropriate_content"
  | "doxxing"
  | "off_topic"
  | "duplicate"
  | "other";

// Tipos de acciones de moderación
export interface ModerationAction {
  type: "warning" | "mute" | "kick" | "ban";
  duration?: number; // en segundos
  permanent?: boolean;
  reason?: string;
}

export interface CommunityRules {
  markdown: string;
  updatedBy: string;
  updatedAt: number;
}

export interface ExtendedCommunityMember {
  uid: string;
  role: CommunityRole;
  tier: MembershipTier;
  joinedAt: number;
  lastActiveAt?: number;
  isBanned?: boolean;
  banReason?: string;
  // Heredar campos existentes de CommunityMember
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  communityId: string;
  status: "active" | "banned" | "pending";
  permissions: {
    canPost: boolean;
    canComment: boolean;
    canInvite: boolean;
    canModerate: boolean;
  };
}

export interface CommunityInvite {
  id: string;
  communityId: string;
  email?: string;
  role: CommunityRole;
  tier?: MembershipTier;
  createdBy: string;
  createdAt: number;
  expiresAt?: number;
  status: "pending" | "accepted" | "expired" | "revoked";
}

export interface ModerationReport {
  id: string;
  communityId: string;
  reportedUserId: string;
  reporterId: string;
  reason: ReportReason;
  description: string;
  evidence?: string[];
  status: ReportStatus;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: number;
  updatedAt: number;
  assignedModerator?: string | null;
  resolutionNotes?: string | null;
  actionTaken?: ModerationAction | null;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface CommunityPermissions {
  canEdit: boolean;
  canBan: boolean;
  canInvite: boolean;
  canPost: boolean;
  canModerate: boolean;
}

export interface CommunityAnalytics {
  totalMembers: number;
  membersByTier: {
    free: number;
    pro: number;
    elite: number;
  };
  membersByRole: {
    owner: number;
    admin: number;
    moderator: number;
    member: number;
  };
  moderationStats: {
    totalReports: number;
    resolvedReports: number;
    bannedMembers: number;
  };
  activityStats: {
    postsThisWeek: number;
    commentsThisWeek: number;
    newMembersThisWeek: number;
  };
}
