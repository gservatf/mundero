// Sistema de Gamificación y Reputación - Servicio
// Lógica pura + Firestore

import {
    collection,
    doc,
    addDoc,
    getDoc,
    setDoc,
    query,
    orderBy,
    limit,
    getDocs,
    onSnapshot,
    where
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
    ReputationActionType,
    ReputationLog,
    UserReputation,
    DEFAULT_LEVELS,
    DEFAULT_BADGES
} from './types';

// Configuración de puntos por acción (editable)
export const POINTS_MAP: Record<ReputationActionType, number> = {
    post_create: 20,
    post_like: 1,
    post_comment: 3,
    post_share: 5,
    community_join: 5,
    community_create: 25,
    event_attend: 15,
    profile_complete: 20,
    referral_approved: 30,
    // Onboarding actions
    onboarding_started: 0,
    onboarding_step_completed: 0, // Puntos variables según el paso
    step_completed: 0, // Puntos variables según el paso
    quest_completed: 50, // Bonus por completar todo
    reward_claimed: 0,
    step_skipped: 0,
    onboarding_abandoned: 0
};

// Feature flag centralizado
export const REPUTATION_ENABLED = true;
export const REPUTATION_SILENT_FAIL = true;

class ReputationService {
    private logsCollection = 'user_reputation_logs';
    private reputationCollection = 'user_reputation';

    /**
     * Registra una acción de usuario y actualiza su reputación
     */
    async logAction(
        userId: string,
        action: ReputationActionType,
        meta?: Record<string, any>,
        customPoints?: number // Permitir puntos personalizados para onboarding
    ): Promise<void> {
        if (!REPUTATION_ENABLED) {
            console.log('Reputation system disabled');
            return;
        }

        try {
            // Usar puntos personalizados o del mapa
            const points = customPoints !== undefined ? customPoints : POINTS_MAP[action];

            // 1. Escribir log de la acción
            const logData: Omit<ReputationLog, 'id'> = {
                userId,
                action,
                points,
                createdAt: Date.now(),
                meta: meta || {}
            };

            await addDoc(collection(db, this.logsCollection), logData);

            // 2. Actualizar reputación del usuario
            await this.updateUserReputation(userId, points, action);

        } catch (error) {
            console.error('Error logging reputation action:', error);
            if (!REPUTATION_SILENT_FAIL) {
                throw error;
            }
        }
    }

    /**
     * Actualiza la reputación acumulada de un usuario
     */
    private async updateUserReputation(
        userId: string,
        pointsToAdd: number,
        action: ReputationActionType
    ): Promise<void> {
        const userReputationRef = doc(db, this.reputationCollection, userId);

        try {
            const currentDoc = await getDoc(userReputationRef);
            let currentReputation: UserReputation;

            if (currentDoc.exists()) {
                currentReputation = currentDoc.data() as UserReputation;
            } else {
                // Crear nuevo registro de reputación
                currentReputation = {
                    userId,
                    totalPoints: 0,
                    level: 1,
                    badges: [],
                    lastUpdatedAt: Date.now()
                };
            }

            // Actualizar puntos totales
            const newTotalPoints = currentReputation.totalPoints + pointsToAdd;

            // Recalcular nivel
            const newLevel = this.calculateLevel(newTotalPoints);

            // Recalcular badges
            const newBadges = this.calculateBadges(newTotalPoints, action);

            // Combinar badges existentes con nuevos (sin duplicados)
            const uniqueBadges = Array.from(new Set([...currentReputation.badges, ...newBadges]));

            // Actualizar documento
            const updatedReputation: UserReputation = {
                userId,
                totalPoints: newTotalPoints,
                level: newLevel,
                badges: uniqueBadges,
                lastUpdatedAt: Date.now()
            };

            await setDoc(userReputationRef, updatedReputation);

        } catch (error) {
            console.error('Error updating user reputation:', error);
            throw error;
        }
    }

    /**
     * Calcula el nivel basado en puntos totales
     */
    private calculateLevel(totalPoints: number): number {
        let currentLevel = 1;

        for (const level of DEFAULT_LEVELS) {
            if (totalPoints >= level.minPoints) {
                currentLevel = level.id;
            } else {
                break;
            }
        }

        return currentLevel;
    }

    /**
     * Calcula qué badges debería tener el usuario
     */
    private calculateBadges(totalPoints: number, latestAction: ReputationActionType): string[] {
        const earnedBadges: string[] = [];

        // Badges basados en puntos totales
        for (const badge of DEFAULT_BADGES) {
            if (totalPoints >= badge.minPoints) {
                earnedBadges.push(badge.id);
            }
        }

        // Badges especiales basados en acciones específicas
        if (latestAction === 'community_create') {
            earnedBadges.push('community_builder');
        }

        if (latestAction === 'event_attend') {
            earnedBadges.push('event_runner');
        }

        if (latestAction === 'post_comment') {
            earnedBadges.push('helpful_commenter');
        }

        if (latestAction === 'post_create') {
            earnedBadges.push('content_creator');
        }

        if (latestAction === 'referral_approved') {
            earnedBadges.push('referral_master');
        }

        return earnedBadges;
    }

    /**
     * Obtiene la reputación de un usuario
     */
    async getUserReputation(userId: string): Promise<UserReputation | null> {
        if (!REPUTATION_ENABLED) {
            return null;
        }

        try {
            const userReputationRef = doc(db, this.reputationCollection, userId);
            const docSnap = await getDoc(userReputationRef);

            if (docSnap.exists()) {
                return docSnap.data() as UserReputation;
            }

            return null;
        } catch (error) {
            console.error('Error getting user reputation:', error);
            if (REPUTATION_SILENT_FAIL) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Obtiene el leaderboard de usuarios por puntos
     */
    async getUserLeaderboard(limitCount: number = 20): Promise<UserReputation[]> {
        if (!REPUTATION_ENABLED) {
            return [];
        }

        try {
            const q = query(
                collection(db, this.reputationCollection),
                orderBy('totalPoints', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const leaderboard: UserReputation[] = [];

            querySnapshot.forEach((doc) => {
                leaderboard.push(doc.data() as UserReputation);
            });

            return leaderboard;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            if (REPUTATION_SILENT_FAIL) {
                return [];
            }
            throw error;
        }
    }

    /**
     * Obtiene logs de reputación de un usuario
     */
    async getUserLogs(userId: string, limitCount: number = 50): Promise<ReputationLog[]> {
        if (!REPUTATION_ENABLED) {
            return [];
        }

        try {
            const q = query(
                collection(db, this.logsCollection),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const logs: ReputationLog[] = [];

            querySnapshot.forEach((doc) => {
                logs.push({ id: doc.id, ...doc.data() } as ReputationLog);
            });

            return logs;
        } catch (error) {
            console.error('Error getting user logs:', error);
            if (REPUTATION_SILENT_FAIL) {
                return [];
            }
            throw error;
        }
    }

    /**
     * Suscripción en tiempo real a la reputación de un usuario
     */
    subscribeToUserReputation(
        userId: string,
        callback: (reputation: UserReputation | null) => void
    ): () => void {
        if (!REPUTATION_ENABLED) {
            callback(null);
            return () => { };
        }

        const userReputationRef = doc(db, this.reputationCollection, userId);

        return onSnapshot(userReputationRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data() as UserReputation);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Error in reputation subscription:', error);
            if (REPUTATION_SILENT_FAIL) {
                callback(null);
            }
        });
    }

    /**
     * Suscripción en tiempo real al leaderboard
     */
    subscribeToLeaderboard(
        callback: (leaderboard: UserReputation[]) => void,
        limitCount: number = 20
    ): () => void {
        if (!REPUTATION_ENABLED) {
            callback([]);
            return () => { };
        }

        const q = query(
            collection(db, this.reputationCollection),
            orderBy('totalPoints', 'desc'),
            limit(limitCount)
        );

        return onSnapshot(q, (querySnapshot) => {
            const leaderboard: UserReputation[] = [];
            querySnapshot.forEach((doc) => {
                leaderboard.push(doc.data() as UserReputation);
            });
            callback(leaderboard);
        }, (error) => {
            console.error('Error in leaderboard subscription:', error);
            if (REPUTATION_SILENT_FAIL) {
                callback([]);
            }
        });
    }

    /**
     * Helpers para obtener información de niveles y badges
     */
    getLevelName(level: number): string {
        const levelData = DEFAULT_LEVELS.find(l => l.id === level);
        return levelData?.name || 'Desconocido';
    }

    getNextLevelPoints(currentLevel: number): number | null {
        const nextLevel = DEFAULT_LEVELS.find(l => l.id === currentLevel + 1);
        return nextLevel?.minPoints || null;
    }

    getBadgeInfo(badgeId: string) {
        return DEFAULT_BADGES.find(b => b.id === badgeId);
    }
}

// Exportar instancia singleton
export const reputationService = new ReputationService();