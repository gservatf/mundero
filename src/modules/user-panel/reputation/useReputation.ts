// Sistema de Gamificación y Reputación - Hooks React
// Hook reactivo para UI

import { useState, useEffect } from 'react';
import { UserReputation } from './types';
import { reputationService } from './reputationService';

interface UseReputationReturn {
    loading: boolean;
    data: UserReputation | null;
    error: string | null;
    refresh: () => Promise<void>;
}

interface UseLeaderboardReturn {
    loading: boolean;
    items: UserReputation[];
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Hook para obtener la reputación de un usuario en tiempo real
 */
export function useReputation(userId?: string): UseReputationReturn {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<UserReputation | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            const reputation = await reputationService.getUserReputation(userId);
            setData(reputation);
        } catch (err) {
            console.error('Error refreshing reputation:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) {
            setData(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        // Suscripción en tiempo real
        const unsubscribe = reputationService.subscribeToUserReputation(
            userId,
            (reputation) => {
                setData(reputation);
                setLoading(false);
                setError(null);
            }
        );

        // Cleanup
        return () => {
            unsubscribe();
        };
    }, [userId]);

    return { loading, data, error, refresh };
}

/**
 * Hook para obtener el leaderboard en tiempo real
 */
export function useLeaderboard(limit: number = 20): UseLeaderboardReturn {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<UserReputation[]>([]);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        try {
            setLoading(true);
            setError(null);
            const leaderboard = await reputationService.getUserLeaderboard(limit);
            setItems(leaderboard);
        } catch (err) {
            console.error('Error refreshing leaderboard:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        setError(null);

        // Suscripción en tiempo real al leaderboard
        const unsubscribe = reputationService.subscribeToLeaderboard(
            (leaderboard) => {
                setItems(leaderboard);
                setLoading(false);
                setError(null);
            },
            limit
        );

        // Cleanup
        return () => {
            unsubscribe();
        };
    }, [limit]);

    return { loading, items, error, refresh };
}

/**
 * Hook para obtener logs de actividad de un usuario
 */
export function useReputationLogs(userId?: string, limit: number = 50) {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            const userLogs = await reputationService.getUserLogs(userId, limit);
            setLogs(userLogs);
        } catch (err) {
            console.error('Error refreshing logs:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) {
            setLogs([]);
            setLoading(false);
            setError(null);
            return;
        }

        refresh();
    }, [userId, limit]);

    return { loading, logs, error, refresh };
}

/**
 * Hook utilitario para helpers de reputación
 */
export function useReputationHelpers() {
    const getLevelName = (level: number) => reputationService.getLevelName(level);

    const getNextLevelPoints = (currentLevel: number) => reputationService.getNextLevelPoints(currentLevel);

    const getBadgeInfo = (badgeId: string) => reputationService.getBadgeInfo(badgeId);

    const getProgressToNextLevel = (currentPoints: number, currentLevel: number) => {
        const nextLevelPoints = getNextLevelPoints(currentLevel);
        if (!nextLevelPoints) return { progress: 100, pointsNeeded: 0 };

        const currentLevelData = reputationService.getNextLevelPoints(currentLevel - 1) || 0;
        const totalPointsForNextLevel = nextLevelPoints - currentLevelData;
        const currentProgress = currentPoints - currentLevelData;
        const progressPercentage = Math.min((currentProgress / totalPointsForNextLevel) * 100, 100);
        const pointsNeeded = Math.max(nextLevelPoints - currentPoints, 0);

        return {
            progress: progressPercentage,
            pointsNeeded,
            nextLevelPoints,
            currentLevelPoints: currentLevelData
        };
    };

    return {
        getLevelName,
        getNextLevelPoints,
        getBadgeInfo,
        getProgressToNextLevel
    };
}