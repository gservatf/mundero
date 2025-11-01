import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { FeedPost } from "../../services/feedService";
// Integración de reputación (opcional, no intrusiva)
import {
  reputationService,
  REPUTATION_ENABLED,
} from "../../reputation/reputationService";

// Types for community system
export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  coverImage?: string;
  avatar?: string;
  isPrivate: boolean;
  createdBy: string;
  creatorName: string;
  admins: string[]; // FASE 6.1: Array de UIDs con permisos de administración
  createdAt: Timestamp;
  updatedAt: Timestamp;
  memberCount: number;
  postCount: number;
  tags: string[];
  rules?: string[];
  location?: {
    city?: string;
    country?: string;
  };
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    allowMemberPosts: boolean;
    allowMemberEvents: boolean;
  };
  stats: {
    activeMembers: number;
    totalPosts: number;
    totalComments: number;
    totalLikes: number;
  };
}

export interface CommunityMember {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  communityId: string;
  role: "owner" | "admin" | "moderator" | "member";
  joinedAt: Timestamp;
  status: "active" | "banned" | "pending";
  permissions: {
    canPost: boolean;
    canComment: boolean;
    canInvite: boolean;
    canModerate: boolean;
  };
}

export interface CommunityPost extends FeedPost {
  communityId: string;
  communityName: string;
  isPinned?: boolean;
  isAnnouncement?: boolean;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  category: string;
  coverImage?: string;
  avatar?: string;
  isPrivate: boolean;
  tags: string[];
  rules?: string[];
  location?: {
    city?: string;
    country?: string;
  };
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    allowMemberPosts: boolean;
    allowMemberEvents: boolean;
  };
}

export interface CreateCommunityPostData {
  content: {
    text?: string;
    media?: Array<{
      type: "image" | "video" | "document" | "youtube" | "drive" | "vimeo";
      url: string;
      name?: string;
      thumbnail?: string;
    }>;
    tags?: string[];
    mentions?: string[];
  };
  visibility: "public" | "followers" | "private";
  type: "text" | "media" | "shared" | "event";
  isPinned?: boolean;
  isAnnouncement?: boolean;
}

class CommunityService {
  private communitiesCollection = "communities";
  private membersCollection = "communityMembers";
  private postsCollection = "posts";

  // Helper function to safely convert timestamps
  private safeTimestampToDate(timestamp: any): Date {
    if (!timestamp) return new Date();

    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }

    if (timestamp instanceof Date) {
      return timestamp;
    }

    if (typeof timestamp === "number") {
      return new Date(timestamp);
    }

    if (typeof timestamp === "string") {
      return new Date(timestamp);
    }

    return new Date();
  }

  // Create a new community
  async createCommunity(
    userId: string,
    userName: string,
    data: CreateCommunityData,
  ): Promise<string> {
    try {
      const communityData: Omit<Community, "id"> = {
        ...data,
        createdBy: userId,
        creatorName: userName,
        admins: [userId], // FASE 6.1: Creador es automáticamente admin
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        memberCount: 1,
        postCount: 0,
        stats: {
          activeMembers: 1,
          totalPosts: 0,
          totalComments: 0,
          totalLikes: 0,
        },
      };

      const docRef = await addDoc(
        collection(db, this.communitiesCollection),
        communityData,
      );

      // Add creator as owner
      await this.addMember(docRef.id, userId, userName, "owner");

      // Hook de reputación opcional (no bloquea la creación de comunidad)
      if (REPUTATION_ENABLED) {
        try {
          await reputationService.logAction(userId, "community_create", {
            communityId: docRef.id,
            communityName: data.name,
            isPrivate: data.isPrivate,
          });
        } catch (error) {
          console.log("Reputation tracking failed (non-blocking):", error);
        }
      }

      return docRef.id;
    } catch (error) {
      console.error("Error creating community:", error);
      throw error;
    }
  }

  // Get all communities (public + user's private communities)
  async getCommunities(
    userId?: string,
    filters?: {
      category?: string;
      search?: string;
      location?: string;
      limit?: number;
    },
  ): Promise<Community[]> {
    try {
      let q = query(
        collection(db, this.communitiesCollection),
        orderBy("memberCount", "desc"),
      );

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      let communities: Community[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const community: Community = {
          id: doc.id,
          name: data.name,
          description: data.description,
          category: data.category,
          coverImage: data.coverImage,
          avatar: data.avatar,
          isPrivate: data.isPrivate,
          createdBy: data.createdBy,
          creatorName: data.creatorName,
          admins: data.admins || [data.createdBy], // FASE 6.1: Compatibilidad con comunidades existentes
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          memberCount: data.memberCount || 0,
          postCount: data.postCount || 0,
          tags: data.tags || [],
          rules: data.rules,
          location: data.location,
          settings: data.settings,
          stats: data.stats || {
            activeMembers: 0,
            totalPosts: 0,
            totalComments: 0,
            totalLikes: 0,
          },
        };
        communities.push(community);
      });

      // Filter by user access (show public + user's private communities)
      if (userId) {
        const userMemberships = await this.getUserMemberships(userId);
        const userCommunityIds = userMemberships.map((m) => m.communityId);

        communities = communities.filter(
          (c) => !c.isPrivate || userCommunityIds.includes(c.id),
        );
      } else {
        communities = communities.filter((c) => !c.isPrivate);
      }

      // Apply additional filters
      if (filters?.category) {
        communities = communities.filter(
          (c) => c.category.toLowerCase() === filters.category?.toLowerCase(),
        );
      }

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        communities = communities.filter(
          (c) =>
            c.name.toLowerCase().includes(searchTerm) ||
            c.description.toLowerCase().includes(searchTerm) ||
            c.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
        );
      }

      if (filters?.location) {
        communities = communities.filter(
          (c) =>
            c.location?.city
              ?.toLowerCase()
              .includes(filters.location!.toLowerCase()) ||
            c.location?.country
              ?.toLowerCase()
              .includes(filters.location!.toLowerCase()),
        );
      }

      return communities;
    } catch (error) {
      console.error("Error getting communities:", error);
      return [];
    }
  }

  // Get community by ID
  async getCommunity(communityId: string): Promise<Community | null> {
    try {
      const docRef = doc(db, this.communitiesCollection, communityId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          description: data.description,
          category: data.category,
          coverImage: data.coverImage,
          avatar: data.avatar,
          isPrivate: data.isPrivate,
          createdBy: data.createdBy,
          creatorName: data.creatorName,
          admins: data.admins || [data.createdBy], // FASE 6.1: Compatibilidad con comunidades existentes
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          memberCount: data.memberCount || 0,
          postCount: data.postCount || 0,
          tags: data.tags || [],
          rules: data.rules,
          location: data.location,
          settings: data.settings,
          stats: data.stats || {
            activeMembers: 0,
            totalPosts: 0,
            totalComments: 0,
            totalLikes: 0,
          },
        } as Community;
      }

      return null;
    } catch (error) {
      console.error("Error getting community:", error);
      return null;
    }
  }

  // Join a community
  async joinCommunity(
    communityId: string,
    userId: string,
    userName: string,
  ): Promise<void> {
    try {
      const community = await this.getCommunity(communityId);
      if (!community) {
        throw new Error("Community not found");
      }

      // Check if already a member
      const existingMember = await this.getMember(communityId, userId);
      if (existingMember) {
        throw new Error("Already a member of this community");
      }

      const status = community.settings.requireApproval ? "pending" : "active";
      await this.addMember(communityId, userId, userName, "member", status);

      // Update community member count if active
      if (status === "active") {
        await this.updateCommunityStats(communityId, {
          memberCount: increment(1),
        });
      }

      // Hook de reputación opcional (no bloquea unirse a la comunidad)
      if (REPUTATION_ENABLED && status === "active") {
        try {
          await reputationService.logAction(userId, "community_join", {
            communityId,
            communityName: community.name,
            isPrivate: community.isPrivate,
          });
        } catch (error) {
          console.log("Reputation tracking failed (non-blocking):", error);
        }
      }
    } catch (error) {
      console.error("Error joining community:", error);
      throw error;
    }
  }

  // Leave a community
  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const member = await this.getMember(communityId, userId);
      if (!member) {
        throw new Error("Not a member of this community");
      }

      if (member.role === "owner") {
        throw new Error(
          "Owner cannot leave community. Transfer ownership first.",
        );
      }

      await this.removeMember(communityId, userId);

      if (member.status === "active") {
        await this.updateCommunityStats(communityId, {
          memberCount: increment(-1),
        });
      }
    } catch (error) {
      console.error("Error leaving community:", error);
      throw error;
    }
  }

  // Get community posts
  async getCommunityPosts(
    communityId: string,
    lastDoc?: any,
    limitCount: number = 20,
  ): Promise<{
    posts: CommunityPost[];
    lastDoc: any;
    hasMore: boolean;
  }> {
    try {
      let q = query(
        collection(db, this.postsCollection),
        where("communityId", "==", communityId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const posts: CommunityPost[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const post: CommunityPost = {
          id: doc.id,
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatar: data.authorAvatar,
          authorUsername: data.authorUsername,
          companyId: data.companyId,
          companyName: data.companyName,
          communityId: data.communityId,
          communityName: data.communityName,
          appSource: data.appSource,
          content: data.content,
          visibility: data.visibility,
          type: data.type,
          engagement: data.engagement || {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
          },
          metadata: data.metadata || { isEdited: false },
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isPinned: data.isPinned,
          isAnnouncement: data.isAnnouncement,
        };
        posts.push(post);
      });

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      const hasMore = querySnapshot.docs.length === limitCount;

      return {
        posts,
        lastDoc: lastVisible,
        hasMore,
      };
    } catch (error) {
      console.error("Error getting community posts:", error);
      return { posts: [], lastDoc: null, hasMore: false };
    }
  }

  // Create community post
  async createCommunityPost(
    communityId: string,
    authorId: string,
    authorName: string,
    data: CreateCommunityPostData,
  ): Promise<string> {
    try {
      const community = await this.getCommunity(communityId);
      if (!community) {
        throw new Error("Community not found");
      }

      const member = await this.getMember(communityId, authorId);
      if (!member || member.status !== "active") {
        throw new Error("Not an active member of this community");
      }

      if (
        !member.permissions.canPost &&
        member.role !== "owner" &&
        member.role !== "admin"
      ) {
        throw new Error("No permission to post in this community");
      }

      const postData: Omit<FeedPost, "id"> & {
        communityId: string;
        communityName: string;
        isPinned?: boolean;
        isAnnouncement?: boolean;
      } = {
        authorId,
        authorName,
        authorAvatar: member.userAvatar,
        communityId,
        communityName: community.name,
        content: data.content,
        visibility: data.visibility || "public",
        type: data.type,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
        },
        metadata: {
          isEdited: false,
        },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        isPinned: data.isPinned || false,
        isAnnouncement: data.isAnnouncement || false,
      };

      const docRef = await addDoc(
        collection(db, this.postsCollection),
        postData,
      );

      // Update community post count
      await this.updateCommunityStats(communityId, {
        postCount: increment(1),
        "stats.totalPosts": increment(1),
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating community post:", error);
      throw error;
    }
  }

  // Get community members
  async getCommunityMembers(
    communityId: string,
    role?: string,
  ): Promise<CommunityMember[]> {
    try {
      let q = query(
        collection(db, this.membersCollection),
        where("communityId", "==", communityId),
        orderBy("joinedAt", "desc"),
      );

      if (role) {
        q = query(q, where("role", "==", role));
      }

      const querySnapshot = await getDocs(q);
      const members: CommunityMember[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        members.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          communityId: data.communityId,
          role: data.role,
          joinedAt: data.joinedAt,
          status: data.status,
          permissions: data.permissions,
        });
      });

      return members;
    } catch (error) {
      console.error("Error getting community members:", error);
      return [];
    }
  }

  // Get user's community memberships
  async getUserMemberships(userId: string): Promise<CommunityMember[]> {
    try {
      const q = query(
        collection(db, this.membersCollection),
        where("userId", "==", userId),
        where("status", "==", "active"),
      );

      const querySnapshot = await getDocs(q);
      const memberships: CommunityMember[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        memberships.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          communityId: data.communityId,
          role: data.role,
          joinedAt: data.joinedAt,
          status: data.status,
          permissions: data.permissions,
        });
      });

      return memberships;
    } catch (error) {
      console.error("Error getting user memberships:", error);
      return [];
    }
  }

  // Check if user is member of community
  async isMember(communityId: string, userId: string): Promise<boolean> {
    try {
      const member = await this.getMember(communityId, userId);
      return member !== null && member.status === "active";
    } catch (error) {
      console.error("Error checking membership:", error);
      return false;
    }
  }

  // Private helper methods
  private async addMember(
    communityId: string,
    userId: string,
    userName: string,
    role: "owner" | "admin" | "moderator" | "member",
    status: "active" | "pending" = "active",
  ): Promise<void> {
    const memberData: Omit<CommunityMember, "id"> = {
      userId,
      userName,
      communityId,
      role,
      joinedAt: serverTimestamp() as Timestamp,
      status,
      permissions: {
        canPost: true,
        canComment: true,
        canInvite: role !== "member",
        canModerate: ["owner", "admin", "moderator"].includes(role),
      },
    };

    await addDoc(collection(db, this.membersCollection), memberData);
  }

  private async removeMember(
    communityId: string,
    userId: string,
  ): Promise<void> {
    const q = query(
      collection(db, this.membersCollection),
      where("communityId", "==", communityId),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, this.membersCollection, document.id));
    });
  }

  private async getMember(
    communityId: string,
    userId: string,
  ): Promise<CommunityMember | null> {
    try {
      const q = query(
        collection(db, this.membersCollection),
        where("communityId", "==", communityId),
        where("userId", "==", userId),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          communityId: data.communityId,
          role: data.role,
          joinedAt: data.joinedAt,
          status: data.status,
          permissions: data.permissions,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting member:", error);
      return null;
    }
  }

  private async updateCommunityStats(
    communityId: string,
    updates: any,
  ): Promise<void> {
    try {
      const docRef = doc(db, this.communitiesCollection, communityId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating community stats:", error);
    }
  }

  // Real-time listeners
  onCommunityUpdates(
    communityId: string,
    callback: (community: Community) => void,
  ): () => void {
    const docRef = doc(db, this.communitiesCollection, communityId);

    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const community: Community = {
          id: doc.id,
          ...data,
        } as Community;
        callback(community);
      }
    });
  }

  onCommunityMembers(
    communityId: string,
    callback: (members: CommunityMember[]) => void,
  ): () => void {
    const q = query(
      collection(db, this.membersCollection),
      where("communityId", "==", communityId),
      orderBy("joinedAt", "desc"),
    );

    return onSnapshot(q, (querySnapshot) => {
      const members: CommunityMember[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        members.push({
          id: doc.id,
          ...data,
        } as CommunityMember);
      });
      callback(members);
    });
  }

  // ===== FASE 6.1: Funciones de Comunidades Libres y Autoadministradas =====

  // Verificar si un usuario es administrador de la comunidad
  async isCommunityAdmin(communityId: string, uid: string): Promise<boolean> {
    try {
      const community = await this.getCommunity(communityId);
      if (!community) return false;

      // Verificar si es owner o está en la lista de admins
      return community.createdBy === uid || community.admins.includes(uid);
    } catch (error) {
      console.error("Error checking community admin status:", error);
      return false;
    }
  }

  // Actualizar comunidad (solo admins)
  async updateCommunity(
    communityId: string,
    uid: string,
    data: Partial<CreateCommunityData>,
  ): Promise<void> {
    try {
      // Verificar permisos de administración
      const isAdmin = await this.isCommunityAdmin(communityId, uid);
      if (!isAdmin) {
        throw new Error("No tienes permisos para editar esta comunidad");
      }

      const docRef = doc(db, this.communitiesCollection, communityId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating community:", error);
      throw error;
    }
  }

  // Eliminar comunidad (solo owner)
  async deleteCommunity(communityId: string, uid: string): Promise<void> {
    try {
      const community = await this.getCommunity(communityId);
      if (!community) {
        throw new Error("Comunidad no encontrada");
      }

      // Solo el owner puede eliminar la comunidad
      if (community.createdBy !== uid) {
        throw new Error("Solo el propietario puede eliminar la comunidad");
      }

      // Eliminar todos los miembros primero
      const membersQuery = query(
        collection(db, this.membersCollection),
        where("communityId", "==", communityId),
      );
      const membersSnapshot = await getDocs(membersQuery);

      const deletePromises = membersSnapshot.docs.map((memberDoc) =>
        deleteDoc(doc(db, this.membersCollection, memberDoc.id)),
      );
      await Promise.all(deletePromises);

      // Eliminar todos los posts de la comunidad
      const postsQuery = query(
        collection(db, this.postsCollection),
        where("communityId", "==", communityId),
      );
      const postsSnapshot = await getDocs(postsQuery);

      const deletePostsPromises = postsSnapshot.docs.map((postDoc) =>
        deleteDoc(doc(db, this.postsCollection, postDoc.id)),
      );
      await Promise.all(deletePostsPromises);

      // Finalmente eliminar la comunidad
      await deleteDoc(doc(db, this.communitiesCollection, communityId));
    } catch (error) {
      console.error("Error deleting community:", error);
      throw error;
    }
  }

  // Promover usuario a administrador
  async promoteToAdmin(
    communityId: string,
    targetUserId: string,
    promoterUid: string,
  ): Promise<void> {
    try {
      // Verificar permisos del promotor
      const isAdmin = await this.isCommunityAdmin(communityId, promoterUid);
      if (!isAdmin) {
        throw new Error("No tienes permisos para promover administradores");
      }

      // Agregar al array de admins
      const docRef = doc(db, this.communitiesCollection, communityId);
      await updateDoc(docRef, {
        admins: arrayUnion(targetUserId),
        updatedAt: serverTimestamp(),
      });

      // Actualizar el rol del miembro a admin
      const memberQuery = query(
        collection(db, this.membersCollection),
        where("communityId", "==", communityId),
        where("userId", "==", targetUserId),
      );
      const memberSnapshot = await getDocs(memberQuery);

      if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0];
        await updateDoc(doc(db, this.membersCollection, memberDoc.id), {
          role: "admin",
          permissions: {
            canPost: true,
            canComment: true,
            canInvite: true,
            canModerate: true,
          },
        });
      }
    } catch (error) {
      console.error("Error promoting to admin:", error);
      throw error;
    }
  }

  // Remover administrador
  async removeAdmin(
    communityId: string,
    targetUserId: string,
    removerUid: string,
  ): Promise<void> {
    try {
      const community = await this.getCommunity(communityId);
      if (!community) {
        throw new Error("Comunidad no encontrada");
      }

      // Solo el owner puede remover admins
      if (community.createdBy !== removerUid) {
        throw new Error("Solo el propietario puede remover administradores");
      }

      // No se puede remover al owner
      if (targetUserId === community.createdBy) {
        throw new Error("No se puede remover al propietario");
      }

      // Remover del array de admins
      const docRef = doc(db, this.communitiesCollection, communityId);
      await updateDoc(docRef, {
        admins: arrayRemove(targetUserId),
        updatedAt: serverTimestamp(),
      });

      // Degradar el rol del miembro
      const memberQuery = query(
        collection(db, this.membersCollection),
        where("communityId", "==", communityId),
        where("userId", "==", targetUserId),
      );
      const memberSnapshot = await getDocs(memberQuery);

      if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0];
        await updateDoc(doc(db, this.membersCollection, memberDoc.id), {
          role: "member",
          permissions: {
            canPost: true,
            canComment: true,
            canInvite: false,
            canModerate: false,
          },
        });
      }
    } catch (error) {
      console.error("Error removing admin:", error);
      throw error;
    }
  }

  // Expulsar miembro (solo admins)
  async kickMember(
    communityId: string,
    targetUserId: string,
    kickerUid: string,
  ): Promise<void> {
    try {
      const community = await this.getCommunity(communityId);
      if (!community) {
        throw new Error("Comunidad no encontrada");
      }

      // Verificar permisos del que expulsa
      const isAdmin = await this.isCommunityAdmin(communityId, kickerUid);
      if (!isAdmin) {
        throw new Error("No tienes permisos para expulsar miembros");
      }

      // No se puede expulsar al owner
      if (targetUserId === community.createdBy) {
        throw new Error("No se puede expulsar al propietario");
      }

      // No se puede expulsar a otro admin (solo el owner puede)
      if (
        community.admins.includes(targetUserId) &&
        community.createdBy !== kickerUid
      ) {
        throw new Error("Solo el propietario puede expulsar administradores");
      }

      // Remover del array de admins si es admin
      if (community.admins.includes(targetUserId)) {
        const docRef = doc(db, this.communitiesCollection, communityId);
        await updateDoc(docRef, {
          admins: arrayRemove(targetUserId),
          updatedAt: serverTimestamp(),
        });
      }

      // Remover membresía
      await this.removeMember(communityId, targetUserId);

      // Actualizar contador de miembros
      await this.updateCommunityStats(communityId, {
        memberCount: increment(-1),
      });
    } catch (error) {
      console.error("Error kicking member:", error);
      throw error;
    }
  }

  // Obtener comunidades administradas por el usuario
  async getUserAdminCommunities(userId: string): Promise<Community[]> {
    try {
      const q = query(
        collection(db, this.communitiesCollection),
        where("admins", "array-contains", userId),
        orderBy("updatedAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const communities: Community[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const community: Community = {
          id: doc.id,
          name: data.name,
          description: data.description,
          category: data.category,
          coverImage: data.coverImage,
          avatar: data.avatar,
          isPrivate: data.isPrivate,
          createdBy: data.createdBy,
          creatorName: data.creatorName,
          admins: data.admins || [data.createdBy],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          memberCount: data.memberCount || 0,
          postCount: data.postCount || 0,
          tags: data.tags || [],
          rules: data.rules,
          location: data.location,
          settings: data.settings,
          stats: data.stats || {
            activeMembers: 0,
            totalPosts: 0,
            totalComments: 0,
            totalLikes: 0,
          },
        };
        communities.push(community);
      });

      return communities;
    } catch (error) {
      console.error("Error getting user admin communities:", error);
      return [];
    }
  }
}

// Export singleton instance
export const communityService = new CommunityService();
