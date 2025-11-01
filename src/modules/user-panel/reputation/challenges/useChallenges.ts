// Hook para gestión de retos (challenges)
// Integrado con Firebase y sistema de reputación

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Challenge,
  ChallengeTemplate,
  ChallengeStatus,
  CHALLENGE_TEMPLATES,
} from "./types";
import { reputationService } from "../reputationService";

// Mock service para simulación (en producción sería Firebase)
class ChallengeService {
  private challenges: Challenge[] = [];
  private listeners: Set<() => void> = new Set();

  // Simular datos iniciales
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    this.challenges = [
      {
        id: "challenge_1",
        title: "Conecta con 3 nuevos miembros",
        description:
          "Expande tu red profesional conectando con 3 personas nuevas en la plataforma",
        type: "individual",
        points: 100,
        creatorId: "system",
        participants: ["user1", "user2", "user3"],
        deadline: now + oneWeek,
        status: "active",
        createdAt: now - 24 * 60 * 60 * 1000,
        updatedAt: now,
        objective: {
          type: "connections_make",
          target: 3,
          timeframe: "total",
        },
        progress: {
          user1: { current: 2, completed: false },
          user2: {
            current: 3,
            completed: true,
            completedAt: now - 60 * 60 * 1000,
          },
          user3: { current: 1, completed: false },
        },
        difficulty: "easy",
        category: "networking",
        tags: ["networking", "social", "conexiones"],
      },
      {
        id: "challenge_2",
        title: "Reto Colaborativo: 1000 Likes",
        description:
          "Entre todos los participantes, alcanzar 1000 likes en publicaciones nuevas",
        type: "collaborative",
        points: 150,
        creatorId: "user1",
        participants: ["user1", "user2", "user3", "user4", "user5"],
        maxParticipants: 10,
        deadline: now + oneWeek * 2,
        status: "active",
        createdAt: now - 3 * 24 * 60 * 60 * 1000,
        updatedAt: now,
        objective: {
          type: "likes_receive",
          target: 1000,
          timeframe: "total",
        },
        progress: {
          user1: { current: 156, completed: false },
          user2: { current: 89, completed: false },
          user3: { current: 203, completed: false },
          user4: { current: 124, completed: false },
          user5: { current: 78, completed: false },
        },
        difficulty: "hard",
        category: "social",
        tags: ["colaborativo", "likes", "equipo"],
      },
    ];
  }

  async getChallenges(status?: ChallengeStatus): Promise<Challenge[]> {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simular latencia

    return this.challenges.filter(
      (challenge) => !status || challenge.status === status,
    );
  }

  async getChallengeById(id: string): Promise<Challenge | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.challenges.find((challenge) => challenge.id === id) || null;
  }

  async createChallenge(
    template: ChallengeTemplate,
    creatorId: string,
  ): Promise<Challenge> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const now = Date.now();
    const challenge: Challenge = {
      id: `challenge_${Date.now()}`,
      ...template,
      creatorId,
      participants: [creatorId],
      deadline: now + template.duration * 24 * 60 * 60 * 1000,
      status: "active",
      createdAt: now,
      updatedAt: now,
      progress: {
        [creatorId]: { current: 0, completed: false },
      },
    };

    this.challenges.push(challenge);
    this.notifyListeners();

    return challenge;
  }

  async joinChallenge(challengeId: string, userId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const challenge = this.challenges.find((c) => c.id === challengeId);
    if (!challenge || challenge.status !== "active") {
      return false;
    }

    if (challenge.participants.includes(userId)) {
      return false; // Ya está participando
    }

    if (
      challenge.maxParticipants &&
      challenge.participants.length >= challenge.maxParticipants
    ) {
      return false; // Límite alcanzado
    }

    challenge.participants.push(userId);
    challenge.progress[userId] = { current: 0, completed: false };
    challenge.updatedAt = Date.now();

    this.notifyListeners();
    return true;
  }

  async updateProgress(
    challengeId: string,
    userId: string,
    newProgress: number,
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const challenge = this.challenges.find((c) => c.id === challengeId);
    if (!challenge || !challenge.progress[userId]) {
      return;
    }

    const userProgress = challenge.progress[userId];
    userProgress.current = newProgress;

    // Verificar si completó el reto
    if (!userProgress.completed && newProgress >= challenge.objective.target) {
      userProgress.completed = true;
      userProgress.completedAt = Date.now();

      // Otorgar puntos de reputación
      await reputationService.logAction(userId, "post_create", {
        challengeId,
        challengeCompleted: true,
        pointsEarned: challenge.points,
        source: "challenge_completion",
      });
    }

    challenge.updatedAt = Date.now();
    this.notifyListeners();
  }

  async leaveChallenge(challengeId: string, userId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const challenge = this.challenges.find((c) => c.id === challengeId);
    if (!challenge) {
      return false;
    }

    const index = challenge.participants.indexOf(userId);
    if (index === -1) {
      return false;
    }

    challenge.participants.splice(index, 1);
    delete challenge.progress[userId];
    challenge.updatedAt = Date.now();

    this.notifyListeners();
    return true;
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback());
  }

  // Método para auto-expirar retos vencidos
  async checkExpiredChallenges(): Promise<void> {
    const now = Date.now();
    let hasChanges = false;

    for (const challenge of this.challenges) {
      if (challenge.status === "active" && challenge.deadline < now) {
        challenge.status = "expired";
        challenge.updatedAt = now;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.notifyListeners();
    }
  }
}

const challengeService = new ChallengeService();

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar retos disponibles
  const loadChallenges = useCallback(
    async (status?: ChallengeStatus) => {
      try {
        setLoading(true);
        setError(null);

        const data = await challengeService.getChallenges(status);
        setChallenges(data);

        // Filtrar retos del usuario actual
        if (user) {
          const userParticipating = data.filter((challenge) =>
            challenge.participants.includes(user.id),
          );
          setUserChallenges(userParticipating);
        }
      } catch (err) {
        setError("Error loading challenges");
        console.error("Error loading challenges:", err);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // Crear nuevo reto
  const createChallenge = useCallback(
    async (template: ChallengeTemplate): Promise<Challenge | null> => {
      if (!user) {
        setError("User not authenticated");
        return null;
      }

      try {
        const challenge = await challengeService.createChallenge(
          template,
          user.id,
        );

        // Recargar lista
        await loadChallenges();

        return challenge;
      } catch (err) {
        setError("Error creating challenge");
        console.error("Error creating challenge:", err);
        return null;
      }
    },
    [user, loadChallenges],
  );

  // Unirse a un reto
  const joinChallenge = useCallback(
    async (challengeId: string): Promise<boolean> => {
      if (!user) {
        setError("User not authenticated");
        return false;
      }

      try {
        const success = await challengeService.joinChallenge(
          challengeId,
          user.id,
        );

        if (success) {
          // Recargar lista
          await loadChallenges();
        } else {
          setError("Could not join challenge");
        }

        return success;
      } catch (err) {
        setError("Error joining challenge");
        console.error("Error joining challenge:", err);
        return false;
      }
    },
    [user, loadChallenges],
  );

  // Abandonar un reto
  const leaveChallenge = useCallback(
    async (challengeId: string): Promise<boolean> => {
      if (!user) {
        setError("User not authenticated");
        return false;
      }

      try {
        const success = await challengeService.leaveChallenge(
          challengeId,
          user.id,
        );

        if (success) {
          await loadChallenges();
        }

        return success;
      } catch (err) {
        setError("Error leaving challenge");
        console.error("Error leaving challenge:", err);
        return false;
      }
    },
    [user, loadChallenges],
  );

  // Actualizar progreso (normalmente llamado automáticamente)
  const updateProgress = useCallback(
    async (challengeId: string, newProgress: number): Promise<void> => {
      if (!user) return;

      try {
        await challengeService.updateProgress(
          challengeId,
          user.id,
          newProgress,
        );
      } catch (err) {
        console.error("Error updating progress:", err);
      }
    },
    [user],
  );

  // Obtener plantillas disponibles
  const getTemplates = useCallback((): ChallengeTemplate[] => {
    return CHALLENGE_TEMPLATES;
  }, []);

  // Obtener progreso del usuario en un reto específico
  const getUserProgress = useCallback(
    (
      challengeId: string,
    ): {
      current: number;
      target: number;
      percentage: number;
      completed: boolean;
    } => {
      if (!user) {
        return { current: 0, target: 0, percentage: 0, completed: false };
      }

      const challenge = challenges.find((c) => c.id === challengeId);
      if (!challenge || !challenge.progress[user.id]) {
        return { current: 0, target: 0, percentage: 0, completed: false };
      }

      const userProgress = challenge.progress[user.id];
      const target = challenge.objective.target;
      const percentage = Math.min((userProgress.current / target) * 100, 100);

      return {
        current: userProgress.current,
        target,
        percentage,
        completed: userProgress.completed,
      };
    },
    [challenges, user],
  );

  // Obtener estadísticas del usuario
  const getUserStats = useCallback(() => {
    if (!user) {
      return {
        totalChallenges: 0,
        activeChallenges: 0,
        completedChallenges: 0,
        totalPoints: 0,
      };
    }

    const totalChallenges = userChallenges.length;
    const activeChallenges = userChallenges.filter(
      (c) => c.status === "active",
    ).length;
    const completedChallenges = userChallenges.filter(
      (c) => c.progress[user.id]?.completed,
    ).length;
    const totalPoints = userChallenges
      .filter((c) => c.progress[user.id]?.completed)
      .reduce((sum, c) => sum + c.points, 0);

    return {
      totalChallenges,
      activeChallenges,
      completedChallenges,
      totalPoints,
    };
  }, [userChallenges, user]);

  // Efectos
  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  useEffect(() => {
    // Suscribirse a cambios en tiempo real
    const unsubscribe = challengeService.subscribe(() => {
      loadChallenges();
    });

    // Verificar retos expirados cada minuto
    const expirationCheck = setInterval(() => {
      challengeService.checkExpiredChallenges();
    }, 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(expirationCheck);
    };
  }, [loadChallenges]);

  return {
    // Estado
    challenges,
    userChallenges,
    loading,
    error,

    // Acciones
    loadChallenges,
    createChallenge,
    joinChallenge,
    leaveChallenge,
    updateProgress,

    // Utilidades
    getTemplates,
    getUserProgress,
    getUserStats,

    // Limpieza de errores
    clearError: () => setError(null),
  };
};

export default useChallenges;
