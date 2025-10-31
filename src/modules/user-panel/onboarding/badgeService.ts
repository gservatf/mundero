// Sistema de badges para onboarding
// Define los badges disponibles y su gestión

import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface OnboardingBadge {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt: number;
    requirements: string[];
}

export interface UserBadges {
    userId: string;
    badges: OnboardingBadge[];
    totalBadges: number;
    lastUpdatedAt: number;
}

// Definición de badges disponibles
export const ONBOARDING_BADGES: Record<string, Omit<OnboardingBadge, 'unlockedAt'>> = {
    'starter': {
        id: 'starter',
        title: 'Primer Paso',
        description: 'Completaste tu perfil inicial',
        icon: '🚀',
        rarity: 'common',
        requirements: ['Completar perfil al 100%']
    },
    'connector': {
        id: 'connector',
        title: 'Conector',
        description: 'Te uniste a tu primera comunidad',
        icon: '🤝',
        rarity: 'common',
        requirements: ['Unirse a una comunidad']
    },
    'first_voice': {
        id: 'first_voice',
        title: 'Primera Voz',
        description: 'Creaste tu primera publicación',
        icon: '🎤',
        rarity: 'rare',
        requirements: ['Crear primera publicación']
    },
    'explorer': {
        id: 'explorer',
        title: 'Explorador',
        description: 'Completaste toda la aventura inicial',
        icon: '🗺️',
        rarity: 'epic',
        requirements: ['Completar todo el onboarding']
    }
};

class BadgeService {
    private readonly COLLECTION = 'user_badges';

    // Otorgar badge a usuario
    async unlockBadge(userId: string, badgeId: string): Promise<boolean> {
        try {
            if (!ONBOARDING_BADGES[badgeId]) {
                console.error(`Badge ${badgeId} not found`);
                return false;
            }

            const badgeData = ONBOARDING_BADGES[badgeId];
            const unlockedBadge: OnboardingBadge = {
                ...badgeData,
                unlockedAt: Date.now()
            };

            // Obtener badges actuales del usuario
            const userBadgesRef = doc(db, this.COLLECTION, userId);
            const userBadgesDoc = await getDoc(userBadgesRef);

            if (userBadgesDoc.exists()) {
                const currentBadges = userBadgesDoc.data() as UserBadges;

                // Verificar si ya tiene el badge
                const hasBadge = currentBadges.badges.some(b => b.id === badgeId);
                if (hasBadge) {
                    console.log(`User ${userId} already has badge ${badgeId}`);
                    return false;
                }

                // Agregar nuevo badge
                await updateDoc(userBadgesRef, {
                    badges: arrayUnion(unlockedBadge),
                    totalBadges: currentBadges.totalBadges + 1,
                    lastUpdatedAt: Date.now()
                });
            } else {
                // Crear registro inicial de badges
                const newUserBadges: UserBadges = {
                    userId,
                    badges: [unlockedBadge],
                    totalBadges: 1,
                    lastUpdatedAt: Date.now()
                };

                await setDoc(userBadgesRef, newUserBadges);
            }

            console.log(`Badge ${badgeId} unlocked for user ${userId}`);
            return true;
        } catch (error) {
            console.error('Error unlocking badge:', error);
            return false;
        }
    }

    // Obtener badges del usuario
    async getUserBadges(userId: string): Promise<OnboardingBadge[]> {
        try {
            const userBadgesRef = doc(db, this.COLLECTION, userId);
            const userBadgesDoc = await getDoc(userBadgesRef);

            if (userBadgesDoc.exists()) {
                const data = userBadgesDoc.data() as UserBadges;
                return data.badges;
            }

            return [];
        } catch (error) {
            console.error('Error getting user badges:', error);
            return [];
        }
    }

    // Verificar si el usuario tiene un badge específico
    async hasBadge(userId: string, badgeId: string): Promise<boolean> {
        const badges = await this.getUserBadges(userId);
        return badges.some(badge => badge.id === badgeId);
    }

    // Obtener todos los badges disponibles
    getAvailableBadges(): Record<string, Omit<OnboardingBadge, 'unlockedAt'>> {
        return ONBOARDING_BADGES;
    }
}

export const badgeService = new BadgeService();