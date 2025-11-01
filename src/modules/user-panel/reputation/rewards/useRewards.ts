// Hook para gestionar el sistema de recompensas
// Maneja la lógica de canjes, disponibilidad y historial

import { useState, useEffect, useCallback } from "react";
import {
  Reward,
  RewardRedemption,
  UserRewardStats,
  RewardCategory,
  RedemptionStatus,
  REWARD_TEMPLATES,
} from "./types";

interface UseRewardsReturn {
  rewards: Reward[];
  userStats: UserRewardStats | null;
  userRedemptions: RewardRedemption[];
  loading: boolean;
  error: string | null;
  redeemReward: (rewardId: string) => Promise<boolean>;
  checkRedemptionStatus: (redemptionId: string) => Promise<RedemptionStatus>;
  getUserRedemptionHistory: () => Promise<RewardRedemption[]>;
  getRewardsByCategory: (category: RewardCategory) => Reward[];
  canUserRedeem: (rewardId: string) => { canRedeem: boolean; reason?: string };
  refreshRewards: () => Promise<void>;
}

export const useRewards = (userId: string): UseRewardsReturn => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userStats, setUserStats] = useState<UserRewardStats | null>(null);
  const [userRedemptions, setUserRedemptions] = useState<RewardRedemption[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular datos de recompensas
  useEffect(() => {
    const loadRewards = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simular delay de carga
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Generar recompensas basadas en templates
        const mockRewards: Reward[] = Object.entries(REWARD_TEMPLATES).map(
          ([key, template], index) => ({
            ...template,
            id: `reward_${key}`,
            createdAt: Date.now() - index * 86400000, // Diferentes fechas
            updatedAt: Date.now() - index * 3600000,
            redemptionCount: Math.floor(Math.random() * 50) + 10,
          }),
        );

        // Simular algunas recompensas agotadas
        mockRewards[1].availability.stock = 0;
        mockRewards[1].isActive = false;

        setRewards(mockRewards);

        // Simular estadísticas del usuario
        const mockUserStats: UserRewardStats = {
          totalRedemptions: 8,
          totalPointsSpent: 15750,
          favoriteCategory: "premium",
          availablePoints: 12500, // Puntos disponibles del usuario
          recentRedemptions: [
            {
              id: "redemption_1",
              userId,
              rewardId: "reward_premium_month",
              pointsSpent: 5000,
              status: "delivered",
              redemptionCode: "PREMIUM_ABC123",
              redeemedAt: Date.now() - 86400000 * 2,
              deliveredAt: Date.now() - 86400000 * 1,
              deliveryInfo: {
                method: "instant",
                email: "user@example.com",
              },
            },
            {
              id: "redemption_2",
              userId,
              rewardId: "reward_coffee_voucher",
              pointsSpent: 800,
              status: "pending",
              redeemedAt: Date.now() - 3600000,
              deliveryInfo: {
                method: "email",
                email: "user@example.com",
              },
            },
          ],
        };

        setUserStats(mockUserStats);
        setUserRedemptions(mockUserStats.recentRedemptions);
      } catch (err) {
        setError("Error al cargar las recompensas");
        console.error("Error loading rewards:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadRewards();
    }
  }, [userId]);

  // Canjear una recompensa
  const redeemReward = useCallback(
    async (rewardId: string): Promise<boolean> => {
      try {
        const reward = rewards.find((r) => r.id === rewardId);
        if (!reward) {
          throw new Error("Recompensa no encontrada");
        }

        const { canRedeem, reason } = canUserRedeem(rewardId);
        if (!canRedeem) {
          throw new Error(reason || "No se puede canjear esta recompensa");
        }

        // Simular API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Crear nueva redención
        const newRedemption: RewardRedemption = {
          id: `redemption_${Date.now()}`,
          userId,
          rewardId,
          pointsSpent: reward.pointsCost,
          status: "processing",
          redemptionCode: `CODE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          redeemedAt: Date.now(),
          deliveryInfo: {
            method: reward.type === "premium_features" ? "instant" : "email",
            email: "user@example.com",
          },
        };

        // Actualizar estado local
        setUserRedemptions((prev) => [newRedemption, ...prev]);

        // Actualizar estadísticas del usuario
        setUserStats((prev) =>
          prev
            ? {
                ...prev,
                totalRedemptions: prev.totalRedemptions + 1,
                totalPointsSpent: prev.totalPointsSpent + reward.pointsCost,
                availablePoints: prev.availablePoints - reward.pointsCost,
                recentRedemptions: [
                  newRedemption,
                  ...prev.recentRedemptions.slice(0, 4),
                ],
              }
            : null,
        );

        // Actualizar stock si es limitado
        setRewards((prev) =>
          prev.map((r) =>
            r.id === rewardId && !r.availability.unlimited
              ? {
                  ...r,
                  availability: {
                    ...r.availability,
                    stock: Math.max(0, r.availability.stock - 1),
                  },
                  redemptionCount: r.redemptionCount + 1,
                }
              : r,
          ),
        );

        // Simular entrega instantánea para algunas recompensas
        if (reward.type === "premium_features" || reward.type === "badge") {
          setTimeout(() => {
            setUserRedemptions((prev) =>
              prev.map((redemption) =>
                redemption.id === newRedemption.id
                  ? {
                      ...redemption,
                      status: "delivered",
                      deliveredAt: Date.now(),
                    }
                  : redemption,
              ),
            );
          }, 2000);
        }

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al canjear recompensa",
        );
        return false;
      }
    },
    [rewards, userStats, userId],
  );

  // Verificar estado de canje
  const checkRedemptionStatus = useCallback(
    async (redemptionId: string): Promise<RedemptionStatus> => {
      const redemption = userRedemptions.find((r) => r.id === redemptionId);
      return redemption?.status || "pending";
    },
    [userRedemptions],
  );

  // Obtener historial de canjes
  const getUserRedemptionHistory = useCallback(async (): Promise<
    RewardRedemption[]
  > => {
    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 500));
    return userRedemptions;
  }, [userRedemptions]);

  // Filtrar recompensas por categoría
  const getRewardsByCategory = useCallback(
    (category: RewardCategory): Reward[] => {
      return rewards.filter((reward) => reward.category === category);
    },
    [rewards],
  );

  // Verificar si el usuario puede canjear una recompensa
  const canUserRedeem = useCallback(
    (rewardId: string): { canRedeem: boolean; reason?: string } => {
      const reward = rewards.find((r) => r.id === rewardId);
      if (!reward) {
        return { canRedeem: false, reason: "Recompensa no encontrada" };
      }

      if (!reward.isActive) {
        return { canRedeem: false, reason: "Recompensa no disponible" };
      }

      if (!reward.availability.unlimited && reward.availability.stock <= 0) {
        return { canRedeem: false, reason: "Sin stock disponible" };
      }

      if (!userStats) {
        return { canRedeem: false, reason: "Datos de usuario no disponibles" };
      }

      if (userStats.availablePoints < reward.pointsCost) {
        return { canRedeem: false, reason: "Puntos insuficientes" };
      }

      // Verificar requisitos
      if (reward.requirements) {
        if (reward.requirements.minimumLevel) {
          // Aquí se verificaría el nivel del usuario
          // Por ahora asumimos que cumple
        }

        if (reward.requirements.badges) {
          // Aquí se verificarían los badges del usuario
        }

        if (reward.requirements.achievements) {
          // Aquí se verificarían los logros del usuario
        }
      }

      // Verificar expiración
      if (
        reward.availability.expiresAt &&
        reward.availability.expiresAt < Date.now()
      ) {
        return { canRedeem: false, reason: "Recompensa expirada" };
      }

      return { canRedeem: true };
    },
    [rewards, userStats],
  );

  // Refrescar datos de recompensas
  const refreshRewards = useCallback(async (): Promise<void> => {
    setLoading(true);
    // Simular recarga
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  }, []);

  return {
    rewards,
    userStats,
    userRedemptions,
    loading,
    error,
    redeemReward,
    checkRedemptionStatus,
    getUserRedemptionHistory,
    getRewardsByCategory,
    canUserRedeem,
    refreshRewards,
  };
};

export default useRewards;
