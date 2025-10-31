// Servicio para gestión de duelos 1v1
// Incluye creación, progreso en tiempo real y resolución automática

import { Duel, DuelInvitation, DuelTemplate, DuelStatus, DuelMetric } from './types';
import { reputationService } from '../reputationService';

class DuelService {
    private duels: Duel[] = [];
    private invitations: DuelInvitation[] = [];
    private listeners: Set<() => void> = new Set();
    private progressInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.initializeMockData();
        this.startProgressMonitoring();
    }

    private initializeMockData() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const twentyFourHours = 24 * oneHour;

        // Duelo activo de ejemplo
        this.duels = [
            {
                id: 'duel_1',
                challengerId: 'user1',
                opponentId: 'user2',
                objective: 'Más likes recibidos en 24h',
                metric: 'feed_likes',
                durationHours: 24,
                status: 'active',
                createdAt: now - 2 * oneHour,
                startedAt: now - oneHour,
                progress: {
                    user1: {
                        current: 35,
                        lastUpdated: now - 10 * 60 * 1000,
                        milestones: [0, 5, 12, 18, 25, 31, 35]
                    },
                    user2: {
                        current: 22,
                        lastUpdated: now - 5 * 60 * 1000,
                        milestones: [0, 3, 8, 15, 19, 22]
                    }
                },
                rewards: {
                    winner: 150,
                    participant: 50
                },
                category: 'social',
                difficulty: 'easy',
                isPublic: true,
                spectators: ['user3', 'user4']
            },
            {
                id: 'duel_2',
                challengerId: 'user3',
                opponentId: 'user1',
                objective: 'Más publicaciones de calidad en 48h',
                metric: 'feed_posts',
                durationHours: 48,
                status: 'finished',
                createdAt: now - 3 * twentyFourHours,
                startedAt: now - 3 * twentyFourHours + oneHour,
                finishedAt: now - twentyFourHours,
                progress: {
                    user3: {
                        current: 8,
                        lastUpdated: now - twentyFourHours,
                        milestones: [0, 1, 3, 4, 6, 7, 8]
                    },
                    user1: {
                        current: 12,
                        lastUpdated: now - twentyFourHours,
                        milestones: [0, 2, 4, 6, 8, 10, 11, 12]
                    }
                },
                winnerId: 'user1',
                rewards: {
                    winner: 200,
                    participant: 75
                },
                category: 'content',
                difficulty: 'medium',
                isPublic: true
            }
        ];

        // Invitación pendiente
        this.invitations = [
            {
                id: 'invitation_1',
                duelId: 'pending_duel_1',
                fromUserId: 'user4',
                toUserId: 'user1',
                status: 'pending',
                createdAt: now - oneHour,
                expiresAt: now + 23 * oneHour,
                message: '¿Te atreves a un duelo de networking? 🤝'
            }
        ];
    }

    private startProgressMonitoring() {
        // Simular actualizaciones de progreso cada 30 segundos
        this.progressInterval = setInterval(() => {
            this.simulateProgressUpdates();
        }, 30 * 1000);
    }

    private simulateProgressUpdates() {
        const activeDuels = this.duels.filter(duel => duel.status === 'active');
        let hasUpdates = false;

        activeDuels.forEach(duel => {
            // Simular progreso aleatorio
            Object.keys(duel.progress).forEach(userId => {
                if (Math.random() < 0.3) { // 30% chance de actualización
                    const progress = duel.progress[userId];
                    const increment = Math.floor(Math.random() * 3) + 1;

                    progress.current += increment;
                    progress.lastUpdated = Date.now();
                    progress.milestones.push(progress.current);

                    hasUpdates = true;
                }
            });

            // Verificar si el duelo debe terminar
            const now = Date.now();
            const endTime = (duel.startedAt || duel.createdAt) + (duel.durationHours * 60 * 60 * 1000);

            if (now >= endTime && duel.status === 'active') {
                this.finishDuel(duel.id);
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            this.notifyListeners();
        }
    }

    async createDuel(
        template: DuelTemplate,
        challengerId: string,
        opponentId: string,
        customMessage?: string
    ): Promise<{ duel: Duel; invitation: DuelInvitation }> {
        const now = Date.now();
        const duelId = `duel_${Date.now()}`;
        const invitationId = `invitation_${Date.now()}`;

        const duel: Duel = {
            id: duelId,
            challengerId,
            opponentId,
            objective: template.objective,
            metric: template.metric,
            durationHours: template.durationHours,
            status: 'pending',
            createdAt: now,
            progress: {
                [challengerId]: { current: 0, lastUpdated: now, milestones: [0] },
                [opponentId]: { current: 0, lastUpdated: now, milestones: [0] }
            },
            rewards: template.rewards,
            category: template.category,
            difficulty: template.difficulty,
            isPublic: true
        };

        const invitation: DuelInvitation = {
            id: invitationId,
            duelId,
            fromUserId: challengerId,
            toUserId: opponentId,
            status: 'pending',
            createdAt: now,
            expiresAt: now + (24 * 60 * 60 * 1000), // 24 horas para responder
            message: customMessage
        };

        this.duels.push(duel);
        this.invitations.push(invitation);
        this.notifyListeners();

        return { duel, invitation };
    }

    async acceptDuelInvitation(invitationId: string): Promise<boolean> {
        const invitation = this.invitations.find(inv => inv.id === invitationId);
        if (!invitation || invitation.status !== 'pending') {
            return false;
        }

        const duel = this.duels.find(d => d.id === invitation.duelId);
        if (!duel) {
            return false;
        }

        // Actualizar invitación
        invitation.status = 'accepted';

        // Activar duelo
        duel.status = 'active';
        duel.startedAt = Date.now();

        this.notifyListeners();
        return true;
    }

    async declineDuelInvitation(invitationId: string): Promise<boolean> {
        const invitation = this.invitations.find(inv => inv.id === invitationId);
        if (!invitation || invitation.status !== 'pending') {
            return false;
        }

        const duel = this.duels.find(d => d.id === invitation.duelId);
        if (!duel) {
            return false;
        }

        // Actualizar invitación
        invitation.status = 'declined';

        // Cancelar duelo
        duel.status = 'cancelled';

        this.notifyListeners();
        return true;
    }

    async updateDuelProgress(
        duelId: string,
        userId: string,
        newValue: number
    ): Promise<void> {
        const duel = this.duels.find(d => d.id === duelId);
        if (!duel || duel.status !== 'active' || !duel.progress[userId]) {
            return;
        }

        const progress = duel.progress[userId];
        progress.current = newValue;
        progress.lastUpdated = Date.now();
        progress.milestones.push(newValue);

        this.notifyListeners();
    }

    private async finishDuel(duelId: string): Promise<void> {
        const duel = this.duels.find(d => d.id === duelId);
        if (!duel || duel.status !== 'active') {
            return;
        }

        const challengerProgress = duel.progress[duel.challengerId];
        const opponentProgress = duel.progress[duel.opponentId];

        // Determinar ganador
        if (challengerProgress.current > opponentProgress.current) {
            duel.winnerId = duel.challengerId;
        } else if (opponentProgress.current > challengerProgress.current) {
            duel.winnerId = duel.opponentId;
        } else {
            duel.isDraw = true;
        }

        duel.status = 'finished';
        duel.finishedAt = Date.now();

        // Otorgar recompensas
        if (duel.winnerId) {
            await reputationService.logAction(duel.winnerId, 'post_create', {
                duelId,
                duelWon: true,
                pointsEarned: duel.rewards.winner,
                source: 'duel_victory'
            });

            const loserId = duel.winnerId === duel.challengerId ? duel.opponentId : duel.challengerId;
            await reputationService.logAction(loserId, 'post_create', {
                duelId,
                duelParticipated: true,
                pointsEarned: duel.rewards.participant,
                source: 'duel_participation'
            });
        } else if (duel.isDraw) {
            // En caso de empate, ambos reciben puntos de participación
            await reputationService.logAction(duel.challengerId, 'post_create', {
                duelId,
                duelDraw: true,
                pointsEarned: duel.rewards.participant,
                source: 'duel_draw'
            });

            await reputationService.logAction(duel.opponentId, 'post_create', {
                duelId,
                duelDraw: true,
                pointsEarned: duel.rewards.participant,
                source: 'duel_draw'
            });
        }
    }

    async getDuels(userId?: string, status?: DuelStatus): Promise<Duel[]> {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simular latencia

        let filtered = this.duels;

        if (userId) {
            filtered = filtered.filter(duel =>
                duel.challengerId === userId || duel.opponentId === userId
            );
        }

        if (status) {
            filtered = filtered.filter(duel => duel.status === status);
        }

        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    async getDuelById(duelId: string): Promise<Duel | null> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return this.duels.find(duel => duel.id === duelId) || null;
    }

    async getUserInvitations(userId: string, status?: DuelInvitation['status']): Promise<DuelInvitation[]> {
        await new Promise(resolve => setTimeout(resolve, 50));

        let filtered = this.invitations.filter(inv =>
            inv.toUserId === userId || inv.fromUserId === userId
        );

        if (status) {
            filtered = filtered.filter(inv => inv.status === status);
        }

        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    async cancelDuel(duelId: string, userId: string): Promise<boolean> {
        const duel = this.duels.find(d => d.id === duelId);
        if (!duel || (duel.challengerId !== userId && duel.opponentId !== userId)) {
            return false;
        }

        if (duel.status === 'active' || duel.status === 'pending') {
            duel.status = 'cancelled';
            this.notifyListeners();
            return true;
        }

        return false;
    }

    async addSpectator(duelId: string, userId: string): Promise<boolean> {
        const duel = this.duels.find(d => d.id === duelId);
        if (!duel || !duel.isPublic || duel.status !== 'active') {
            return false;
        }

        if (!duel.spectators) {
            duel.spectators = [];
        }

        if (!duel.spectators.includes(userId)) {
            duel.spectators.push(userId);
            this.notifyListeners();
        }

        return true;
    }

    async removeSpectator(duelId: string, userId: string): Promise<boolean> {
        const duel = this.duels.find(d => d.id === duelId);
        if (!duel || !duel.spectators) {
            return false;
        }

        const index = duel.spectators.indexOf(userId);
        if (index !== -1) {
            duel.spectators.splice(index, 1);
            this.notifyListeners();
        }

        return true;
    }

    // Estadísticas de usuario
    async getUserDuelStats(userId: string): Promise<{
        totalDuels: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;
        totalPointsEarned: number;
        activeDuels: number;
    }> {
        const userDuels = await this.getDuels(userId);
        const finishedDuels = userDuels.filter(d => d.status === 'finished');

        const wins = finishedDuels.filter(d => d.winnerId === userId).length;
        const losses = finishedDuels.filter(d => d.winnerId && d.winnerId !== userId).length;
        const draws = finishedDuels.filter(d => d.isDraw).length;
        const activeDuels = userDuels.filter(d => d.status === 'active').length;

        const winRate = finishedDuels.length > 0 ? (wins / finishedDuels.length) * 100 : 0;

        const totalPointsEarned = finishedDuels.reduce((sum, duel) => {
            if (duel.winnerId === userId) {
                return sum + duel.rewards.winner;
            } else {
                return sum + duel.rewards.participant;
            }
        }, 0);

        return {
            totalDuels: userDuels.length,
            wins,
            losses,
            draws,
            winRate: Math.round(winRate),
            totalPointsEarned,
            activeDuels
        };
    }

    subscribe(callback: () => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private notifyListeners() {
        this.listeners.forEach(callback => callback());
    }

    stop() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
}

export const duelService = new DuelService();
export default duelService;