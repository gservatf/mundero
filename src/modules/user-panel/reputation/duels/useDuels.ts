// Hook para gestión de duelos 1v1
// Incluye invitaciones, progreso en tiempo real y estadísticas

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Duel,
  DuelInvitation,
  DuelTemplate,
  DuelStatus,
  DUEL_TEMPLATES,
} from "./types";
import { duelService } from "./DuelService";

export const useDuels = () => {
  const { user } = useAuth();
  const [duels, setDuels] = useState<Duel[]>([]);
  const [userDuels, setUserDuels] = useState<Duel[]>([]);
  const [invitations, setInvitations] = useState<DuelInvitation[]>([]);
  const [userStats, setUserStats] = useState({
    totalDuels: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    totalPointsEarned: 0,
    activeDuels: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar duelos disponibles
  const loadDuels = useCallback(
    async (status?: DuelStatus) => {
      try {
        setLoading(true);
        setError(null);

        const allDuels = await duelService.getDuels(undefined, status);
        setDuels(allDuels);

        // Filtrar duelos del usuario actual
        if (user) {
          const userParticipating = await duelService.getDuels(user.id, status);
          setUserDuels(userParticipating);
        }
      } catch (err) {
        setError("Error loading duels");
        console.error("Error loading duels:", err);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // Cargar invitaciones
  const loadInvitations = useCallback(async () => {
    if (!user) return;

    try {
      const userInvitations = await duelService.getUserInvitations(user.id);
      setInvitations(userInvitations);
    } catch (err) {
      console.error("Error loading invitations:", err);
    }
  }, [user]);

  // Cargar estadísticas del usuario
  const loadUserStats = useCallback(async () => {
    if (!user) return;

    try {
      const stats = await duelService.getUserDuelStats(user.id);
      setUserStats(stats);
    } catch (err) {
      console.error("Error loading user stats:", err);
    }
  }, [user]);

  // Crear nuevo duelo
  const createDuel = useCallback(
    async (
      template: DuelTemplate,
      opponentId: string,
      customMessage?: string,
    ): Promise<{ duel: Duel; invitation: DuelInvitation } | null> => {
      if (!user) {
        setError("User not authenticated");
        return null;
      }

      try {
        const result = await duelService.createDuel(
          template,
          user.id,
          opponentId,
          customMessage,
        );

        // Recargar datos
        await Promise.all([loadDuels(), loadInvitations(), loadUserStats()]);

        return result;
      } catch (err) {
        setError("Error creating duel");
        console.error("Error creating duel:", err);
        return null;
      }
    },
    [user, loadDuels, loadInvitations, loadUserStats],
  );

  // Aceptar invitación de duelo
  const acceptInvitation = useCallback(
    async (invitationId: string): Promise<boolean> => {
      try {
        const success = await duelService.acceptDuelInvitation(invitationId);

        if (success) {
          await Promise.all([loadDuels(), loadInvitations(), loadUserStats()]);
        } else {
          setError("Could not accept invitation");
        }

        return success;
      } catch (err) {
        setError("Error accepting invitation");
        console.error("Error accepting invitation:", err);
        return false;
      }
    },
    [loadDuels, loadInvitations, loadUserStats],
  );

  // Rechazar invitación de duelo
  const declineInvitation = useCallback(
    async (invitationId: string): Promise<boolean> => {
      try {
        const success = await duelService.declineDuelInvitation(invitationId);

        if (success) {
          await Promise.all([loadInvitations(), loadUserStats()]);
        }

        return success;
      } catch (err) {
        setError("Error declining invitation");
        console.error("Error declining invitation:", err);
        return false;
      }
    },
    [loadInvitations, loadUserStats],
  );

  // Cancelar duelo
  const cancelDuel = useCallback(
    async (duelId: string): Promise<boolean> => {
      if (!user) {
        setError("User not authenticated");
        return false;
      }

      try {
        const success = await duelService.cancelDuel(duelId, user.id);

        if (success) {
          await Promise.all([loadDuels(), loadUserStats()]);
        }

        return success;
      } catch (err) {
        setError("Error canceling duel");
        console.error("Error canceling duel:", err);
        return false;
      }
    },
    [user, loadDuels, loadUserStats],
  );

  // Unirse como espectador
  const joinAsSpectator = useCallback(
    async (duelId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const success = await duelService.addSpectator(duelId, user.id);

        if (success) {
          await loadDuels();
        }

        return success;
      } catch (err) {
        console.error("Error joining as spectator:", err);
        return false;
      }
    },
    [user, loadDuels],
  );

  // Dejar de ser espectador
  const leaveAsSpectator = useCallback(
    async (duelId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const success = await duelService.removeSpectator(duelId, user.id);

        if (success) {
          await loadDuels();
        }

        return success;
      } catch (err) {
        console.error("Error leaving as spectator:", err);
        return false;
      }
    },
    [user, loadDuels],
  );

  // Obtener progreso de un duelo
  const getDuelProgress = useCallback(
    (duel: Duel, userId?: string) => {
      const targetUserId = userId || user?.id;
      if (!targetUserId || !duel.progress[targetUserId]) {
        return { current: 0, opponent: 0, isWinning: false, difference: 0 };
      }

      const opponentId =
        duel.challengerId === targetUserId
          ? duel.opponentId
          : duel.challengerId;
      const userProgress = duel.progress[targetUserId].current;
      const opponentProgress = duel.progress[opponentId]?.current || 0;

      return {
        current: userProgress,
        opponent: opponentProgress,
        isWinning: userProgress > opponentProgress,
        difference: Math.abs(userProgress - opponentProgress),
      };
    },
    [user],
  );

  // Obtener tiempo restante de un duelo
  const getTimeRemaining = useCallback(
    (
      duel: Duel,
    ): {
      hours: number;
      minutes: number;
      isExpired: boolean;
      percentage: number;
    } => {
      if (!duel.startedAt || duel.status !== "active") {
        return { hours: 0, minutes: 0, isExpired: true, percentage: 0 };
      }

      const now = Date.now();
      const endTime = duel.startedAt + duel.durationHours * 60 * 60 * 1000;
      const remaining = endTime - now;

      if (remaining <= 0) {
        return { hours: 0, minutes: 0, isExpired: true, percentage: 100 };
      }

      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

      const totalDuration = duel.durationHours * 60 * 60 * 1000;
      const elapsed = now - duel.startedAt;
      const percentage = Math.min((elapsed / totalDuration) * 100, 100);

      return { hours, minutes, isExpired: false, percentage };
    },
    [],
  );

  // Obtener plantillas disponibles
  const getTemplates = useCallback((): DuelTemplate[] => {
    return DUEL_TEMPLATES;
  }, []);

  // Verificar si el usuario está participando en un duelo
  const isUserParticipating = useCallback(
    (duel: Duel): boolean => {
      return user
        ? duel.challengerId === user.id || duel.opponentId === user.id
        : false;
    },
    [user],
  );

  // Verificar si el usuario es espectador
  const isUserSpectator = useCallback(
    (duel: Duel): boolean => {
      return user && duel.spectators
        ? duel.spectators.includes(user.id)
        : false;
    },
    [user],
  );

  // Obtener invitaciones pendientes
  const getPendingInvitations = useCallback((): DuelInvitation[] => {
    return invitations.filter(
      (inv) => inv.status === "pending" && inv.toUserId === user?.id,
    );
  }, [invitations, user]);

  // Obtener duelos activos del usuario
  const getActiveDuels = useCallback((): Duel[] => {
    return userDuels.filter((duel) => duel.status === "active");
  }, [userDuels]);

  // Obtener historial de duelos
  const getDuelHistory = useCallback((): Duel[] => {
    return userDuels.filter((duel) => duel.status === "finished");
  }, [userDuels]);

  // Efectos
  useEffect(() => {
    loadDuels();
    loadInvitations();
    loadUserStats();
  }, [loadDuels, loadInvitations, loadUserStats]);

  useEffect(() => {
    // Suscribirse a cambios en tiempo real
    const unsubscribe = duelService.subscribe(() => {
      loadDuels();
      loadInvitations();
      loadUserStats();
    });

    return unsubscribe;
  }, [loadDuels, loadInvitations, loadUserStats]);

  return {
    // Estado
    duels,
    userDuels,
    invitations,
    userStats,
    loading,
    error,

    // Acciones
    loadDuels,
    createDuel,
    acceptInvitation,
    declineInvitation,
    cancelDuel,
    joinAsSpectator,
    leaveAsSpectator,

    // Utilidades
    getTemplates,
    getDuelProgress,
    getTimeRemaining,
    isUserParticipating,
    isUserSpectator,
    getPendingInvitations,
    getActiveDuels,
    getDuelHistory,

    // Limpieza
    clearError: () => setError(null),
  };
};

export default useDuels;
