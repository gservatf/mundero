// Servicio de Estadísticas de Reputación
// Maneja datos agregados globales del sistema

import {
    collection,
    query,
    getDocs,
    where,
    orderBy,
    limit,
    getAggregateFromServer,
    count,
    average,
    sum
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { REPUTATION_ENABLED } from './reputationService';

export interface ReputationStats {
    totalUsers: number;
    averageLevel: number;
    totalPointsInSystem: number;
    totalBadgesAwarded: number;
    activeUsersWithReputation: number;
    topLevelDistribution: { level: number; count: number; percentage: number }[];
    recentActivityCount: number;
    lastUpdated: number;
}

export interface ActivityTrend {
    date: string;
    actions: number;
    points: number;
}

class StatsService {
    private static instance: StatsService;
    private cache: { stats: ReputationStats | null; lastFetch: number } = {
        stats: null,
        lastFetch: 0
    };
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

    public static getInstance(): StatsService {
        if (!StatsService.instance) {
            StatsService.instance = new StatsService();
        }
        return StatsService.instance;
    }

    /**
     * Obtener estadísticas globales con cache
     */
    async getGlobalStats(forceRefresh: boolean = false): Promise<ReputationStats> {
        if (!REPUTATION_ENABLED) {
            return this.getEmptyStats();
        }

        const now = Date.now();
        if (!forceRefresh && this.cache.stats && (now - this.cache.lastFetch) < this.CACHE_DURATION) {
            return this.cache.stats;
        }

        try {
            const stats = await this.calculateGlobalStats();
            this.cache = { stats, lastFetch: now };
            return stats;
        } catch (error) {
            console.error('Error fetching global stats:', error);
            return this.cache.stats || this.getEmptyStats();
        }
    }

    /**
     * Calcular estadísticas desde Firestore
     */
    private async calculateGlobalStats(): Promise<ReputationStats> {
        const reputationRef = collection(db, 'user_reputation');
        const logsRef = collection(db, 'user_reputation_logs');

        // Consultas paralelas para optimizar
        const [
            totalUsersSnapshot,
            averageSnapshot,
            sumSnapshot,
            recentLogsSnapshot,
            allReputationSnapshot
        ] = await Promise.all([
            // Total de usuarios con reputación
            getAggregateFromServer(reputationRef, { count: count() }),

            // Promedio de niveles
            getAggregateFromServer(reputationRef, { avgLevel: average('level') }),

            // Suma total de puntos
            getAggregateFromServer(reputationRef, { totalPoints: sum('totalPoints') }),

            // Actividad reciente (últimas 24 horas)
            getDocs(query(
                logsRef,
                where('createdAt', '>', Date.now() - 24 * 60 * 60 * 1000),
                orderBy('createdAt', 'desc')
            )),

            // Todos los datos de reputación para distribución
            getDocs(query(reputationRef, orderBy('totalPoints', 'desc')))
        ]);

        // Procesar resultados
        const totalUsers = totalUsersSnapshot.data().count;
        const averageLevel = averageSnapshot.data().avgLevel || 1;
        const totalPointsInSystem = sumSnapshot.data().totalPoints || 0;
        const recentActivityCount = recentLogsSnapshot.size;

        // Calcular distribución de niveles
        const levelDistribution = this.calculateLevelDistribution(allReputationSnapshot.docs);

        // Calcular total de badges
        let totalBadgesAwarded = 0;
        allReputationSnapshot.docs.forEach(doc => {
            const data = doc.data();
            totalBadgesAwarded += (data.badges?.length || 0);
        });

        // Usuarios activos (con puntos > 0)
        const activeUsersWithReputation = allReputationSnapshot.docs.filter(doc =>
            doc.data().totalPoints > 0
        ).length;

        return {
            totalUsers,
            averageLevel: Math.round(averageLevel * 100) / 100,
            totalPointsInSystem,
            totalBadgesAwarded,
            activeUsersWithReputation,
            topLevelDistribution: levelDistribution,
            recentActivityCount,
            lastUpdated: Date.now()
        };
    }

    /**
     * Calcular distribución de niveles
     */
    private calculateLevelDistribution(docs: any[]): { level: number; count: number; percentage: number }[] {
        const levelCounts: Record<number, number> = {};
        const totalUsers = docs.length;

        // Contar por nivel
        docs.forEach(doc => {
            const level = doc.data().level || 1;
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        });

        // Convertir a array con porcentajes
        return Object.entries(levelCounts)
            .map(([level, count]) => ({
                level: parseInt(level),
                count,
                percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
            }))
            .sort((a, b) => a.level - b.level);
    }

    /**
     * Obtener tendencias de actividad (últimos 7 días)
     */
    async getActivityTrends(): Promise<ActivityTrend[]> {
        if (!REPUTATION_ENABLED) {
            return [];
        }

        try {
            const logsRef = collection(db, 'user_reputation_logs');
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

            const snapshot = await getDocs(query(
                logsRef,
                where('createdAt', '>', sevenDaysAgo),
                orderBy('createdAt', 'asc')
            ));

            // Agrupar por día
            const dayGroups: Record<string, { actions: number; points: number }> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const date = new Date(data.createdAt).toISOString().split('T')[0];

                if (!dayGroups[date]) {
                    dayGroups[date] = { actions: 0, points: 0 };
                }

                dayGroups[date].actions++;
                dayGroups[date].points += data.points || 0;
            });

            // Convertir a array
            return Object.entries(dayGroups)
                .map(([date, data]) => ({
                    date,
                    actions: data.actions,
                    points: data.points
                }))
                .sort((a, b) => a.date.localeCompare(b.date));

        } catch (error) {
            console.error('Error fetching activity trends:', error);
            return [];
        }
    }

    /**
     * Obtener top usuarios por categoría
     */
    async getTopUsersByCategory(category: 'points' | 'level' | 'badges' = 'points', limitCount: number = 10) {
        if (!REPUTATION_ENABLED) {
            return [];
        }

        try {
            const reputationRef = collection(db, 'user_reputation');
            let orderField = 'totalPoints';

            if (category === 'level') {
                orderField = 'level';
            }

            const snapshot = await getDocs(query(
                reputationRef,
                orderBy(orderField, 'desc'),
                limit(limitCount)
            ));

            return snapshot.docs.map(doc => ({
                userId: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Error fetching top users:', error);
            return [];
        }
    }

    /**
     * Estadísticas vacías para cuando el sistema está deshabilitado
     */
    private getEmptyStats(): ReputationStats {
        return {
            totalUsers: 0,
            averageLevel: 0,
            totalPointsInSystem: 0,
            totalBadgesAwarded: 0,
            activeUsersWithReputation: 0,
            topLevelDistribution: [],
            recentActivityCount: 0,
            lastUpdated: Date.now()
        };
    }

    /**
     * Limpiar cache
     */
    clearCache(): void {
        this.cache = { stats: null, lastFetch: 0 };
    }
}

export const statsService = StatsService.getInstance();