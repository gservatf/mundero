// FASE 6.2 — Membership Service para Roles y Tiers
import {
    collection,
    doc,
    updateDoc,
    getDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { CommunityRole, MembershipTier, CommunityPermissions } from '../types/communityExtended';

class MembershipService {
    private membersCollection = 'communityMembers';
    private communitiesCollection = 'communities';

    // Asignar rol a un miembro
    async assignRole(communityId: string, userId: string, newRole: CommunityRole, assignedBy: string): Promise<void> {
        try {
            // Verificar permisos del asignador
            const canAssign = await this.canAssignRole(communityId, assignedBy, newRole);
            if (!canAssign) {
                throw new Error('No tienes permisos para asignar este rol');
            }

            // Buscar el miembro en la comunidad
            const memberQuery = await this.findMemberDocument(communityId, userId);
            if (!memberQuery) {
                throw new Error('Miembro no encontrado en la comunidad');
            }

            // Actualizar rol y permisos
            const permissions = this.getMemberPermissions(newRole);
            await updateDoc(doc(db, this.membersCollection, memberQuery.id), {
                role: newRole,
                permissions,
                updatedAt: serverTimestamp(),
                updatedBy: assignedBy
            });

            // Emitir evento para analytics
            this.emitAnalyticsEvent('role_assigned', {
                communityId,
                userId,
                newRole,
                assignedBy,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('Error assigning role:', error);
            throw error;
        }
    }

    // Asignar tier a un miembro
    async assignTier(communityId: string, userId: string, newTier: MembershipTier, assignedBy: string): Promise<void> {
        try {
            // Verificar permisos (solo admin y owner pueden cambiar tiers)
            const canAssignTier = await this.canManageTiers(communityId, assignedBy);
            if (!canAssignTier) {
                throw new Error('No tienes permisos para asignar tiers');
            }

            // Buscar el miembro
            const memberQuery = await this.findMemberDocument(communityId, userId);
            if (!memberQuery) {
                throw new Error('Miembro no encontrado en la comunidad');
            }

            // Actualizar tier
            await updateDoc(doc(db, this.membersCollection, memberQuery.id), {
                tier: newTier,
                updatedAt: serverTimestamp(),
                updatedBy: assignedBy
            });

            // Emitir evento para analytics
            this.emitAnalyticsEvent('tier_assigned', {
                communityId,
                userId,
                newTier,
                assignedBy,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('Error assigning tier:', error);
            throw error;
        }
    }

    // Obtener permisos basados en el rol
    getMemberPermissions(role: CommunityRole): CommunityPermissions {
        switch (role) {
            case 'owner':
                return {
                    canEdit: true,
                    canBan: true,
                    canInvite: true,
                    canPost: true,
                    canModerate: true
                };
            case 'admin':
                return {
                    canEdit: true,
                    canBan: true,
                    canInvite: true,
                    canPost: true,
                    canModerate: true
                };
            case 'moderator':
                return {
                    canEdit: false,
                    canBan: true,
                    canInvite: false,
                    canPost: true,
                    canModerate: true
                };
            case 'member':
                return {
                    canEdit: false,
                    canBan: false,
                    canInvite: false,
                    canPost: true,
                    canModerate: false
                };
            default:
                return {
                    canEdit: false,
                    canBan: false,
                    canInvite: false,
                    canPost: false,
                    canModerate: false
                };
        }
    }

    // Verificar si un usuario puede asignar un rol específico
    private async canAssignRole(communityId: string, assignerId: string, targetRole: CommunityRole): Promise<boolean> {
        try {
            const assignerMember = await this.findMemberDocument(communityId, assignerId);
            if (!assignerMember) return false;

            const assignerRole = assignerMember.data.role;

            // Solo owner puede asignar owner
            if (targetRole === 'owner') {
                return assignerRole === 'owner';
            }

            // Owner y admin pueden asignar admin, moderator, member
            if (targetRole === 'admin') {
                return ['owner', 'admin'].includes(assignerRole);
            }

            // Owner, admin pueden asignar moderator, member
            if (targetRole === 'moderator') {
                return ['owner', 'admin'].includes(assignerRole);
            }

            // Owner, admin, moderator pueden asignar member
            if (targetRole === 'member') {
                return ['owner', 'admin', 'moderator'].includes(assignerRole);
            }

            return false;
        } catch (error) {
            console.error('Error checking role assignment permissions:', error);
            return false;
        }
    }

    // Verificar si un usuario puede gestionar tiers
    private async canManageTiers(communityId: string, userId: string): Promise<boolean> {
        try {
            const member = await this.findMemberDocument(communityId, userId);
            if (!member) return false;

            // Solo owner y admin pueden gestionar tiers
            return ['owner', 'admin'].includes(member.data.role);
        } catch (error) {
            console.error('Error checking tier management permissions:', error);
            return false;
        }
    }

    // Buscar documento de miembro en la comunidad
    private async findMemberDocument(communityId: string, userId: string): Promise<{ id: string; data: any } | null> {
        try {
            // Esta función necesitaría implementarse con una query
            // Por simplicidad, asumo que existe un método en communityService
            // que puede ser utilizado aquí
            return null; // Implementación pendiente - necesita query
        } catch (error) {
            console.error('Error finding member document:', error);
            return null;
        }
    }

    // Emitir evento para analytics
    private emitAnalyticsEvent(eventType: string, data: any): void {
        try {
            // Integración con sistema de analytics (seguro para SSR y tipado TS)
            // Si existe un analytics global lo usamos, si no, lo logeamos localmente.
            // Evitamos `window.analytics` directamente para no romper la compilación TS en entornos sin el tipo.
            // Preferible: conectar a analyticsService central cuando exista.
            // eslint-disable-next-line no-console
            console.log('Analytics event:', eventType, data);
        } catch (error) {
            console.error('Error emitting analytics event:', error);
        }
    }

    // Obtener descripción de tier para UI
    getTierInfo(tier: MembershipTier): { name: string; color: string; icon: string } {
        switch (tier) {
            case 'free':
                return {
                    name: 'Free',
                    color: 'bg-gray-100 text-gray-800 border-gray-300',
                    icon: '👤'
                };
            case 'pro':
                return {
                    name: 'Pro',
                    color: 'bg-blue-100 text-blue-800 border-blue-300',
                    icon: '⭐'
                };
            case 'elite':
                return {
                    name: 'Elite',
                    color: 'bg-purple-100 text-purple-800 border-purple-300',
                    icon: '👑'
                };
            default:
                return {
                    name: 'Unknown',
                    color: 'bg-gray-100 text-gray-800 border-gray-300',
                    icon: '❓'
                };
        }
    }

    // Obtener descripción de rol para UI
    getRoleInfo(role: CommunityRole): { name: string; color: string; icon: string } {
        switch (role) {
            case 'owner':
                return {
                    name: 'Propietario',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    icon: '👑'
                };
            case 'admin':
                return {
                    name: 'Administrador',
                    color: 'bg-red-100 text-red-800 border-red-300',
                    icon: '🛡️'
                };
            case 'moderator':
                return {
                    name: 'Moderador',
                    color: 'bg-green-100 text-green-800 border-green-300',
                    icon: '⚔️'
                };
            case 'member':
                return {
                    name: 'Miembro',
                    color: 'bg-blue-100 text-blue-800 border-blue-300',
                    icon: '👥'
                };
            default:
                return {
                    name: 'Desconocido',
                    color: 'bg-gray-100 text-gray-800 border-gray-300',
                    icon: '❓'
                };
        }
    }
}

// Export singleton instance
export const membershipService = new MembershipService();