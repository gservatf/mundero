// FASE 6.2 — Moderation Service para Reports y Acciones
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    getDoc,
    arrayUnion
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import {
    ModerationReport,
    ModerationAction,
    ReportStatus,
    ReportReason,
    CommunityRole
} from '../types/communityExtended';

class ModerationService {
    private reportsCollection = 'moderationReports';
    private actionsCollection = 'moderationActions';
    private bannedUsersCollection = 'bannedUsers';
    private communitiesCollection = 'communities';

    // Crear reporte de moderación
    async createReport(
        communityId: string,
        reportedUserId: string,
        reporterId: string,
        reason: ReportReason,
        description: string,
        evidence?: string[]
    ): Promise<string> {
        try {
            // Verificar que el reporter es miembro de la comunidad
            const canReport = await this.canUserReport(communityId, reporterId);
            if (!canReport) {
                throw new Error('No tienes permisos para reportar en esta comunidad');
            }

            const report: Omit<ModerationReport, 'id'> = {
                communityId,
                reportedUserId,
                reporterId,
                reason,
                description,
                evidence: evidence || [],
                status: 'pending',
                priority: this.calculatePriority(reason),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                assignedModerator: null,
                resolutionNotes: null,
                actionTaken: null
            };

            const docRef = await addDoc(collection(db, this.reportsCollection), report);

            // Emitir evento para analytics
            this.emitAnalyticsEvent('moderation_report_created', {
                communityId,
                reportId: docRef.id,
                reason,
                priority: report.priority,
                timestamp: Date.now()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error creating moderation report:', error);
            throw error;
        }
    }

    // Asignar reporte a moderador
    async assignReport(reportId: string, moderatorId: string, assignedBy: string): Promise<void> {
        try {
            // Verificar permisos del asignador
            const report = await this.getReport(reportId);
            if (!report) {
                throw new Error('Reporte no encontrado');
            }

            const canAssign = await this.canUserModerate(report.communityId, assignedBy);
            if (!canAssign) {
                throw new Error('No tienes permisos para asignar reportes');
            }

            await updateDoc(doc(db, this.reportsCollection, reportId), {
                assignedModerator: moderatorId,
                status: 'in_review' as ReportStatus,
                updatedAt: serverTimestamp()
            });

            // Registrar acción
            await this.logModerationAction(
                report.communityId,
                assignedBy,
                'report_assigned',
                `Reporte asignado a moderador`,
                { reportId, assignedTo: moderatorId }
            );

        } catch (error) {
            console.error('Error assigning report:', error);
            throw error;
        }
    }

    // Resolver reporte
    async resolveReport(
        reportId: string,
        moderatorId: string,
        status: ReportStatus,
        resolutionNotes: string,
        actionTaken?: ModerationAction
    ): Promise<void> {
        try {
            const report = await this.getReport(reportId);
            if (!report) {
                throw new Error('Reporte no encontrado');
            }

            const canModerate = await this.canUserModerate(report.communityId, moderatorId);
            if (!canModerate) {
                throw new Error('No tienes permisos para resolver este reporte');
            }

            await updateDoc(doc(db, this.reportsCollection, reportId), {
                status,
                resolutionNotes,
                actionTaken: actionTaken || null,
                resolvedAt: serverTimestamp(),
                resolvedBy: moderatorId,
                updatedAt: serverTimestamp()
            });

            // Si se tomó una acción, ejecutarla
            if (actionTaken) {
                await this.executeModerationAction(
                    report.communityId,
                    report.reportedUserId,
                    actionTaken,
                    moderatorId,
                    resolutionNotes
                );
            }

            // Registrar resolución
            await this.logModerationAction(
                report.communityId,
                moderatorId,
                'report_resolved',
                `Reporte ${status}: ${resolutionNotes}`,
                { reportId, actionTaken }
            );

        } catch (error) {
            console.error('Error resolving report:', error);
            throw error;
        }
    }

    // Ejecutar acción de moderación
    private async executeModerationAction(
        communityId: string,
        userId: string,
        action: ModerationAction,
        moderatorId: string,
        reason: string
    ): Promise<void> {
        try {
            switch (action.type) {
                case 'warning':
                    await this.issueWarning(communityId, userId, moderatorId, reason);
                    break;
                case 'mute':
                    await this.muteUser(communityId, userId, moderatorId, action.duration, reason);
                    break;
                case 'kick':
                    await this.kickUser(communityId, userId, moderatorId, reason);
                    break;
                case 'ban':
                    await this.banUser(communityId, userId, moderatorId, action.permanent, action.duration, reason);
                    break;
                default:
                    console.warn('Unknown moderation action type:', action.type);
            }
        } catch (error) {
            console.error('Error executing moderation action:', error);
            throw error;
        }
    }

    // Advertir usuario
    private async issueWarning(communityId: string, userId: string, moderatorId: string, reason: string): Promise<void> {
        // Implementar sistema de advertencias
        await this.logModerationAction(
            communityId,
            moderatorId,
            'warning_issued',
            `Advertencia emitida: ${reason}`,
            { targetUserId: userId }
        );
    }

    // Silenciar usuario
    private async muteUser(
        communityId: string,
        userId: string,
        moderatorId: string,
        duration?: number,
        reason?: string
    ): Promise<void> {
        const muteUntil = duration ? new Date(Date.now() + duration * 1000) : null;

        // Implementar lógica de silenciado
        await this.logModerationAction(
            communityId,
            moderatorId,
            'user_muted',
            `Usuario silenciado${duration ? ` por ${duration} segundos` : ' permanentemente'}: ${reason}`,
            { targetUserId: userId, muteUntil: muteUntil?.toISOString() }
        );
    }

    // Expulsar usuario
    private async kickUser(communityId: string, userId: string, moderatorId: string, reason: string): Promise<void> {
        // Remover de la comunidad (usar communityService existente)
        await this.logModerationAction(
            communityId,
            moderatorId,
            'user_kicked',
            `Usuario expulsado: ${reason}`,
            { targetUserId: userId }
        );
    }

    // Banear usuario
    private async banUser(
        communityId: string,
        userId: string,
        moderatorId: string,
        permanent: boolean = false,
        duration?: number,
        reason?: string
    ): Promise<void> {
        const banUntil = !permanent && duration ? new Date(Date.now() + duration * 1000) : null;

        const banData = {
            communityId,
            userId,
            bannedBy: moderatorId,
            reason: reason || 'Violación de normas de la comunidad',
            permanent,
            banUntil: banUntil ? Timestamp.fromDate(banUntil) : null,
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, this.bannedUsersCollection), banData);

        await this.logModerationAction(
            communityId,
            moderatorId,
            'user_banned',
            `Usuario baneado${permanent ? ' permanentemente' : ` hasta ${banUntil?.toLocaleString()}`}: ${reason}`,
            { targetUserId: userId, permanent, banUntil: banUntil?.toISOString() }
        );
    }

    // Registrar acción de moderación
    private async logModerationAction(
        communityId: string,
        moderatorId: string,
        actionType: string,
        description: string,
        metadata?: any
    ): Promise<void> {
        try {
            const actionData = {
                communityId,
                moderatorId,
                actionType,
                description,
                metadata: metadata || {},
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, this.actionsCollection), actionData);
        } catch (error) {
            console.error('Error logging moderation action:', error);
        }
    }

    // Obtener reporte por ID
    private async getReport(reportId: string): Promise<ModerationReport | null> {
        try {
            const reportDoc = await getDoc(doc(db, this.reportsCollection, reportId));
            if (reportDoc.exists()) {
                return { id: reportDoc.id, ...reportDoc.data() } as ModerationReport;
            }
            return null;
        } catch (error) {
            console.error('Error getting report:', error);
            return null;
        }
    }

    // Verificar si un usuario puede reportar
    private async canUserReport(communityId: string, userId: string): Promise<boolean> {
        // Verificar que es miembro de la comunidad
        // Implementación pendiente - necesita integración con communityService
        return true;
    }

    // Verificar si un usuario puede moderar
    private async canUserModerate(communityId: string, userId: string): Promise<boolean> {
        // Verificar que tiene rol de moderador, admin u owner
        // Implementación pendiente - necesita integración con membershipService
        return true;
    }

    // Calcular prioridad del reporte
    private calculatePriority(reason: ReportReason): 'low' | 'medium' | 'high' | 'urgent' {
        switch (reason) {
            case 'harassment':
            case 'hate_speech':
            case 'doxxing':
                return 'urgent';
            case 'spam':
            case 'fake_news':
            case 'inappropriate_content':
                return 'high';
            case 'off_topic':
            case 'duplicate':
                return 'medium';
            case 'other':
                return 'low';
            default:
                return 'medium';
        }
    }

    // Obtener reportes pendientes de una comunidad
    async getPendingReports(communityId: string, limitCount: number = 20): Promise<ModerationReport[]> {
        try {
            const q = query(
                collection(db, this.reportsCollection),
                where('communityId', '==', communityId),
                where('status', 'in', ['pending', 'in_review']),
                orderBy('priority', 'desc'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ModerationReport));
        } catch (error) {
            console.error('Error getting pending reports:', error);
            return [];
        }
    }

    // Obtener historial de acciones de moderación
    async getModerationHistory(communityId: string, limitCount: number = 50): Promise<any[]> {
        try {
            const q = query(
                collection(db, this.actionsCollection),
                where('communityId', '==', communityId),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting moderation history:', error);
            return [];
        }
    }

    // Emitir evento para analytics
    private emitAnalyticsEvent(eventType: string, data: any): void {
        try {
            // Integración con sistema de analytics
            console.log('Analytics event:', eventType, data);
        } catch (error) {
            console.error('Error emitting analytics event:', error);
        }
    }

    // Obtener información de razón de reporte para UI
    getReportReasonInfo(reason: ReportReason): { name: string; color: string; icon: string } {
        switch (reason) {
            case 'harassment':
                return { name: 'Acoso', color: 'bg-red-100 text-red-800', icon: '🚫' };
            case 'hate_speech':
                return { name: 'Discurso de odio', color: 'bg-red-100 text-red-800', icon: '🔥' };
            case 'spam':
                return { name: 'Spam', color: 'bg-yellow-100 text-yellow-800', icon: '📧' };
            case 'fake_news':
                return { name: 'Noticias falsas', color: 'bg-orange-100 text-orange-800', icon: '📰' };
            case 'inappropriate_content':
                return { name: 'Contenido inapropiado', color: 'bg-purple-100 text-purple-800', icon: '🔞' };
            case 'doxxing':
                return { name: 'Doxxing', color: 'bg-red-100 text-red-800', icon: '🎯' };
            case 'off_topic':
                return { name: 'Fuera de tema', color: 'bg-blue-100 text-blue-800', icon: '📍' };
            case 'duplicate':
                return { name: 'Duplicado', color: 'bg-gray-100 text-gray-800', icon: '📑' };
            case 'other':
                return { name: 'Otro', color: 'bg-gray-100 text-gray-800', icon: '❓' };
            default:
                return { name: 'Desconocido', color: 'bg-gray-100 text-gray-800', icon: '❓' };
        }
    }
}

// Export singleton instance
export const moderationService = new ModerationService();