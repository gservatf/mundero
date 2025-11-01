// Hook para gestión del progreso de onboarding
// Incluye estado en tiempo real y acciones del usuario

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { onboardingService } from "./onboardingService";
import { OnboardingProgress, OnboardingStep, QuestTemplate } from "./types";

interface UseOnboardingProgressReturn {
  progress: OnboardingProgress | null;
  loading: boolean;
  error: string | null;
  needsOnboarding: boolean;
  currentStep: OnboardingStep | null;
  completionPercentage: number;

  // Actions
  initializeOnboarding: (templateId?: string) => Promise<boolean>;
  completeStep: (stepId: string | number) => Promise<boolean>;
  skipStep: (stepId: string | number) => Promise<boolean>;
  updateStepProgress: (
    stepId: string | number,
    value: number,
  ) => Promise<boolean>;
  refreshProgress: () => Promise<void>;
}

export const useOnboardingProgress = (): UseOnboardingProgressReturn => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar progreso inicial
  const loadProgress = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userProgress = await onboardingService.getOnboardingProgress(
        user.id,
      );
      setProgress(userProgress);
    } catch (err) {
      console.error("Error loading onboarding progress:", err);
      setError("Error al cargar el progreso de onboarding");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Inicializar onboarding
  const initializeOnboarding = useCallback(
    async (templateId?: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        setLoading(true);
        setError(null);

        const newProgress = await onboardingService.initializeOnboarding(
          user.id,
          templateId,
        );
        setProgress(newProgress);
        return true;
      } catch (err) {
        console.error("Error initializing onboarding:", err);
        setError("Error al inicializar el onboarding");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  // Completar paso
  const completeStep = useCallback(
    async (stepId: string | number): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const success = await onboardingService.completeStep(
          user.id,
          String(stepId),
        );
        if (success) {
          // El progreso se actualizará automáticamente por el listener
        } else {
          setError("No se pudo completar el paso");
        }
        return success !== null;
      } catch (err) {
        console.error("Error completing step:", err);
        setError("Error al completar el paso");
        return false;
      }
    },
    [user?.id],
  );

  // Saltar paso
  const skipStep = useCallback(
    async (stepId: string | number): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const success = await onboardingService.skipStep(
          user.id,
          String(stepId),
        );
        if (success) {
          // El progreso se actualizará automáticamente por el listener
        } else {
          setError("No se pudo saltar el paso");
        }
        return success !== null;
      } catch (err) {
        console.error("Error skipping step:", err);
        setError("Error al saltar el paso");
        return false;
      }
    },
    [user?.id],
  );

  // Actualizar progreso de paso
  const updateStepProgress = useCallback(
    async (stepId: string | number, value: number): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        // For now, just return true as this method is not critical
        // TODO: Implement updateStepProgress in OnboardingService if needed
        return true;
      } catch (err) {
        console.error("Error updating step progress:", err);
        setError("Error al actualizar el progreso");
        return false;
      }
    },
    [user?.id],
  );

  // Refrescar progreso manualmente
  const refreshProgress = useCallback(async () => {
    await loadProgress();
  }, [loadProgress]);

  // Listener en tiempo real
  useEffect(() => {
    if (!user?.id) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onboardingService.listenToOnboardingProgress(
      user.id,
      (newProgress) => {
        setProgress(newProgress);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Computed values
  const needsOnboarding = progress ? !progress.isCompleted : true;
  const currentStep =
    progress?.steps.find((step) => step.id === progress.currentStepId) || null;
  const completionPercentage = progress?.progress || 0;

  return {
    progress,
    loading,
    error,
    needsOnboarding,
    currentStep,
    completionPercentage,
    initializeOnboarding,
    completeStep,
    skipStep,
    updateStepProgress,
    refreshProgress,
  };
};

// Hook adicional para gestión de templates (admin)
interface UseQuestTemplatesReturn {
  questTemplates: QuestTemplate[];
  templates: QuestTemplate[];
  loading: boolean;
  error: string | null;

  // Actions
  loadTemplates: () => Promise<void>;
  createTemplate: (
    template: Omit<QuestTemplate, "id" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  updateTemplate: (
    templateId: string,
    updates: Partial<QuestTemplate>,
  ) => Promise<boolean>;
}

export const useQuestTemplates = (): UseQuestTemplatesReturn => {
  const [templates, setTemplates] = useState<QuestTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const templatesData = await onboardingService.getQuestTemplates();
      setTemplates(templatesData);
    } catch (err) {
      console.error("Error loading quest templates:", err);
      setError("Error al cargar las plantillas");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(
    async (
      template: Omit<QuestTemplate, "id" | "createdAt" | "updatedAt">,
    ): Promise<string> => {
      try {
        setError(null);
        const templateId =
          await onboardingService.createQuestTemplate(template);
        await loadTemplates(); // Refrescar lista
        return templateId;
      } catch (err) {
        console.error("Error creating quest template:", err);
        setError("Error al crear la plantilla");
        throw err;
      }
    },
    [loadTemplates],
  );

  const updateTemplate = useCallback(
    async (
      templateId: string,
      updates: Partial<QuestTemplate>,
    ): Promise<boolean> => {
      try {
        setError(null);
        await onboardingService.updateQuestTemplate(templateId, updates);
        await loadTemplates(); // Refrescar lista
        return true;
      } catch (err) {
        console.error("Error updating quest template:", err);
        setError("Error al actualizar la plantilla");
        return false;
      }
    },
    [loadTemplates],
  );

  // Cargar templates al montar
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    questTemplates: templates,
    templates,
    loading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
  };
};

// Hook para estadísticas (admin)
export const useOnboardingStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const statsData = await onboardingService.getDetailedStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error loading onboarding stats:", err);
      setError("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: loadStats,
  };
};
