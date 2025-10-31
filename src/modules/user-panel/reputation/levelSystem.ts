// Sistema de niveles dinámicos con cálculo automático
// Incluye eventos de subida de nivel y gestión de milestones

import { reputationService } from './reputationService';
import { ReputationActionType } from './types';
import React from 'react';

export interface Level {
    level: number;
    pointsRequired: number;
    pointsToNext: number;
    title: string;
    description: string;
    icon: string;
    color: string;
    benefits: string[];
    unlocks: string[];
}

export interface LevelUpEvent {
    userId: string;
    oldLevel: number;
    newLevel: number;
    pointsEarned: number;
    totalPoints: number;
    unlockedFeatures: string[];
    timestamp: number;
}

// Configuración de niveles con títulos temáticos
const LEVEL_CONFIG = {
    titles: [
        { level: 0, title: "Novato", icon: "🌱", description: "Comenzando tu viaje en Mundero", color: "bg-gray-100 text-gray-700" },
        { level: 1, title: "Explorador", icon: "🔍", description: "Descubriendo nuevas oportunidades", color: "bg-green-100 text-green-700" },
        { level: 2, title: "Colaborador", icon: "🤝", description: "Construyendo conexiones valiosas", color: "bg-blue-100 text-blue-700" },
        { level: 3, title: "Contribuidor", icon: "💡", description: "Aportando valor a la comunidad", color: "bg-purple-100 text-purple-700" },
        { level: 4, title: "Especialista", icon: "⭐", description: "Reconocido por tu expertise", color: "bg-yellow-100 text-yellow-700" },
        { level: 5, title: "Mentor", icon: "🎓", description: "Guiando a otros en su crecimiento", color: "bg-indigo-100 text-indigo-700" },
        { level: 6, title: "Líder", icon: "👑", description: "Inspirando y liderando iniciativas", color: "bg-orange-100 text-orange-700" },
        { level: 7, title: "Innovador", icon: "🚀", description: "Impulsando el cambio y la innovación", color: "bg-pink-100 text-pink-700" },
        { level: 8, title: "Visionario", icon: "🔮", description: "Viendo más allá del horizonte", color: "bg-cyan-100 text-cyan-700" },
        { level: 9, title: "Maestro", icon: "🏆", description: "Maestría absoluta en tu campo", color: "bg-red-100 text-red-700" },
        { level: 10, title: "Leyenda", icon: "💎", description: "Tu legado trasciende Mundero", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" }
    ],

    benefits: {
        1: ["Acceso a chat básico", "Crear hasta 3 publicaciones diarias"],
        2: ["Reacciones avanzadas", "Participar en eventos comunitarios"],
        3: ["Crear eventos propios", "Acceso a grupos privados"],
        4: ["Menciones especiales", "Badge de Especialista"],
        5: ["Modalidad Mentor", "Crear retos colaborativos"],
        6: ["Dashboard de liderazgo", "Moderación comunitaria"],
        7: ["Laboratorio de innovación", "Acceso anticipado a features"],
        8: ["Consultoría premium", "Programa de embajadores"],
        9: ["Masterclasses exclusivas", "Networking VIP"],
        10: ["Legado permanente", "Acceso ilimitado de por vida"]
    } as Record<number, string[]>,

    unlocks: {
        1: ["Sistema de reputación", "Perfil básico"],
        2: ["Feed personalizado", "Notificaciones push"],
        3: ["Eventos y networking", "Grupos temáticos"],
        4: ["Duelos competitivos", "Estadísticas avanzadas"],
        5: ["Sistema de mentoring", "Retos colaborativos"],
        6: ["Herramientas de liderazgo", "Panel de moderación"],
        7: ["Labs de innovación", "Beta testing"],
        8: ["Consultoría 1:1", "Programa embajador"],
        9: ["Red VIP", "Masterclasses"],
        10: ["Todas las funciones", "Acceso vitalicio"]
    } as Record<number, string[]>
};

class LevelSystem {
    private levelUpListeners: Set<(event: LevelUpEvent) => void> = new Set();

    /**
     * Calcular nivel basado en puntos usando fórmula logarítmica
     * Formula: Level = floor(pow(points / 100, 0.6))
     */
    calculateLevel(points: number): number {
        if (points <= 0) return 0;

        // Fórmula ajustada para progresión equilibrada
        const level = Math.floor(Math.pow(points / 100, 0.6));

        // Límite máximo de nivel
        return Math.min(level, 10);
    }

    /**
     * Calcular puntos requeridos para un nivel específico
     */
    getPointsForLevel(level: number): number {
        if (level <= 0) return 0;
        if (level >= 10) return Math.pow(10 * 100, 1 / 0.6);

        // Inversa de la fórmula de nivel
        return Math.ceil(Math.pow(level, 1 / 0.6) * 100);
    }

    /**
     * Obtener información completa de un nivel
     */
    getLevelInfo(level: number): Level {
        const config = LEVEL_CONFIG.titles[Math.min(level, 10)];
        const currentPoints = this.getPointsForLevel(level);
        const nextPoints = this.getPointsForLevel(level + 1);

        return {
            level,
            pointsRequired: currentPoints,
            pointsToNext: nextPoints - currentPoints,
            title: config.title,
            description: config.description,
            icon: config.icon,
            color: config.color,
            benefits: LEVEL_CONFIG.benefits[level] || [],
            unlocks: LEVEL_CONFIG.unlocks[level] || []
        };
    }

    /**
     * Verificar si hubo subida de nivel y disparar eventos
     */
    async checkLevelUp(
        userId: string,
        oldPoints: number,
        newPoints: number,
        action: ReputationActionType,
        metadata?: Record<string, any>
    ): Promise<LevelUpEvent | null> {
        const oldLevel = this.calculateLevel(oldPoints);
        const newLevel = this.calculateLevel(newPoints);

        if (newLevel > oldLevel) {
            const levelUpEvent: LevelUpEvent = {
                userId,
                oldLevel,
                newLevel,
                pointsEarned: newPoints - oldPoints,
                totalPoints: newPoints,
                unlockedFeatures: this.getUnlockedFeatures(oldLevel, newLevel),
                timestamp: Date.now()
            };

            // Registrar evento de subida de nivel
            await reputationService.logAction(userId, 'profile_complete', {
                levelUp: true,
                oldLevel,
                newLevel,
                pointsEarned: levelUpEvent.pointsEarned,
                unlockedFeatures: levelUpEvent.unlockedFeatures,
                triggerAction: action,
                source: 'level_system',
                ...metadata
            });

            // Notificar a listeners
            this.notifyLevelUpListeners(levelUpEvent);

            console.log(`🎉 Level up! User ${userId}: ${oldLevel} → ${newLevel}`);

            return levelUpEvent;
        }

        return null;
    }

    /**
     * Obtener características desbloqueadas entre niveles
     */
    private getUnlockedFeatures(oldLevel: number, newLevel: number): string[] {
        const features: string[] = [];

        for (let level = oldLevel + 1; level <= newLevel; level++) {
            const unlocks = LEVEL_CONFIG.unlocks[level];
            if (unlocks) {
                features.push(...unlocks);
            }
        }

        return features;
    }

    /**
     * Obtener progreso hacia el siguiente nivel
     */
    getLevelProgress(currentPoints: number): {
        currentLevel: number;
        nextLevel: number;
        currentLevelPoints: number;
        nextLevelPoints: number;
        progressPoints: number;
        progressPercentage: number;
    } {
        const currentLevel = this.calculateLevel(currentPoints);
        const nextLevel = Math.min(currentLevel + 1, 10);

        const currentLevelPoints = this.getPointsForLevel(currentLevel);
        const nextLevelPoints = this.getPointsForLevel(nextLevel);

        const progressPoints = currentPoints - currentLevelPoints;
        const totalPointsNeeded = nextLevelPoints - currentLevelPoints;
        const progressPercentage = totalPointsNeeded > 0 ?
            Math.min((progressPoints / totalPointsNeeded) * 100, 100) : 100;

        return {
            currentLevel,
            nextLevel,
            currentLevelPoints,
            nextLevelPoints,
            progressPoints,
            progressPercentage
        };
    }

    /**
     * Obtener milestone de puntos especiales
     */
    getPointsMilestones(): number[] {
        return [
            100,    // Nivel 1
            316,    // Nivel 2
            630,    // Nivel 3
            1000,   // Nivel 4
            1449,   // Nivel 5
            1974,   // Nivel 6
            2570,   // Nivel 7
            3233,   // Nivel 8
            3959,   // Nivel 9
            4743    // Nivel 10
        ];
    }

    /**
     * Verificar si es un milestone especial
     */
    isSpecialMilestone(points: number): { isMilestone: boolean; milestone?: number; achievement?: string } {
        const milestones = this.getPointsMilestones();
        const milestone = milestones.find(m => Math.abs(points - m) <= 5);

        if (milestone) {
            const level = this.calculateLevel(milestone);
            const levelInfo = this.getLevelInfo(level);

            return {
                isMilestone: true,
                milestone,
                achievement: `¡Alcanzaste ${levelInfo.title}!`
            };
        }

        // Milestones especiales adicionales
        const specialMilestones = [
            { points: 500, achievement: "¡Primera Media Centena!" },
            { points: 1337, achievement: "¡Número Leet!" },
            { points: 2500, achievement: "¡Cuarto de Camino!" },
            { points: 5000, achievement: "¡Leyenda Definitiva!" }
        ];

        const special = specialMilestones.find(s => Math.abs(points - s.points) <= 5);
        if (special) {
            return {
                isMilestone: true,
                milestone: special.points,
                achievement: special.achievement
            };
        }

        return { isMilestone: false };
    }

    /**
     * Obtener ranking de nivel entre usuarios
     */
    getLevelRanking(userPoints: Record<string, number>): Array<{
        userId: string;
        points: number;
        level: number;
        levelInfo: Level;
        rank: number;
    }> {
        return Object.entries(userPoints)
            .map(([userId, points]) => ({
                userId,
                points,
                level: this.calculateLevel(points),
                levelInfo: this.getLevelInfo(this.calculateLevel(points)),
                rank: 0
            }))
            .sort((a, b) => b.points - a.points)
            .map((user, index) => ({ ...user, rank: index + 1 }));
    }

    /**
     * Simular proyección de nivel futuro
     */
    projectFutureLevel(
        currentPoints: number,
        dailyPointsRate: number,
        days: number
    ): {
        currentLevel: number;
        projectedPoints: number;
        projectedLevel: number;
        levelsToGain: number;
    } {
        const currentLevel = this.calculateLevel(currentPoints);
        const projectedPoints = currentPoints + (dailyPointsRate * days);
        const projectedLevel = this.calculateLevel(projectedPoints);

        return {
            currentLevel,
            projectedPoints,
            projectedLevel,
            levelsToGain: projectedLevel - currentLevel
        };
    }

    /**
     * Suscribirse a eventos de subida de nivel
     */
    onLevelUp(callback: (event: LevelUpEvent) => void): () => void {
        this.levelUpListeners.add(callback);
        return () => this.levelUpListeners.delete(callback);
    }

    /**
     * Disparar manualmente un evento de subida de nivel
     */
    triggerLevelUp(oldLevel: number, newLevel: number, totalPoints: number, userId?: string): void {
        const levelUpEvent: LevelUpEvent = {
            userId: userId || 'manual',
            oldLevel,
            newLevel,
            pointsEarned: totalPoints - this.getPointsForLevel(oldLevel),
            totalPoints,
            unlockedFeatures: this.getUnlockedFeatures(oldLevel, newLevel),
            timestamp: Date.now()
        };

        // Notificar a listeners
        this.notifyLevelUpListeners(levelUpEvent);

        // Disparar evento global para el hook useLevelUp
        const customEvent = new CustomEvent('levelUp', { detail: levelUpEvent });
        window.dispatchEvent(customEvent);

        console.log(`🎉 Level up triggered! ${oldLevel} → ${newLevel}`);
    }

    /**
     * Notificar listeners de subida de nivel
     */
    private notifyLevelUpListeners(event: LevelUpEvent): void {
        this.levelUpListeners.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('Error in level up listener:', error);
            }
        });
    }

    /**
     * Obtener estadísticas del sistema de niveles
     */
    getSystemStats(allUserPoints: Record<string, number>): {
        totalUsers: number;
        averageLevel: number;
        levelDistribution: Record<number, number>;
        topLevel: number;
        totalPointsInSystem: number;
    } {
        const users = Object.values(allUserPoints);
        const levels = users.map(points => this.calculateLevel(points));

        const levelDistribution: Record<number, number> = {};
        levels.forEach(level => {
            levelDistribution[level] = (levelDistribution[level] || 0) + 1;
        });

        return {
            totalUsers: users.length,
            averageLevel: users.length > 0 ? levels.reduce((sum, level) => sum + level, 0) / levels.length : 0,
            levelDistribution,
            topLevel: Math.max(...levels, 0),
            totalPointsInSystem: users.reduce((sum, points) => sum + points, 0)
        };
    }
}

// Instancia singleton del sistema de niveles
export const levelSystem = new LevelSystem();

// Hook integrado con el sistema de reputación
export const useLevelSystem = () => {
    return {
        calculateLevel: levelSystem.calculateLevel.bind(levelSystem),
        getLevelInfo: levelSystem.getLevelInfo.bind(levelSystem),
        getLevelProgress: levelSystem.getLevelProgress.bind(levelSystem),
        getPointsMilestones: levelSystem.getPointsMilestones.bind(levelSystem),
        isSpecialMilestone: levelSystem.isSpecialMilestone.bind(levelSystem),
        projectFutureLevel: levelSystem.projectFutureLevel.bind(levelSystem),
        onLevelUp: levelSystem.onLevelUp.bind(levelSystem)
    };
};

// Hook para gestionar eventos de subida de nivel
export const useLevelUp = () => {
    const [levelUpEvent, setLevelUpEvent] = React.useState<LevelUpEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Escuchar eventos de subida de nivel
    React.useEffect(() => {
        const handleLevelUp = (event: CustomEvent<LevelUpEvent>) => {
            setLevelUpEvent(event.detail);
            setIsModalOpen(true);
        };

        window.addEventListener('levelUp', handleLevelUp as EventListener);

        return () => {
            window.removeEventListener('levelUp', handleLevelUp as EventListener);
        };
    }, []);

    const clearLevelUpEvent = () => {
        setLevelUpEvent(null);
        setIsModalOpen(false);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return {
        levelUpEvent,
        isModalOpen,
        clearLevelUpEvent,
        openModal,
        closeModal
    };
};

export default levelSystem;