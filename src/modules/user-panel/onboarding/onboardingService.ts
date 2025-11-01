// Servicio de onboarding gamificado
// Gestiona misiones, progreso y recompensas

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { reputationService } from "../reputation/reputationService";
import { badgeService } from "./badgeService";
import {
  OnboardingProgress,
  OnboardingStep,
  QuestTemplate,
  OnboardingStats,
  OnboardingEvent,
} from "./types";

class OnboardingService {
  private readonly COLLECTION = "onboarding_progress";
  private readonly TEMPLATES_COLLECTION = "quest_templates";
  private readonly STATS_COLLECTION = "onboarding_stats";

  // Plantilla por defecto para nuevos usuarios
  private readonly DEFAULT_TEMPLATE: Omit<
    QuestTemplate,
    "id" | "createdAt" | "updatedAt" | "createdBy"
  > = {
    name: "Bienvenido a Mundero",
    description:
      "Completa estas misiones para comenzar tu aventura en la plataforma",
    isActive: true,
    category: "standard",
    estimatedTimeMinutes: 15,
    totalPoints: 225,
    steps: [
      {
        id: "1",
        title: "Completa tu perfil",
        description: "Agrega tu información personal y foto de perfil",
        type: "profile_completion",
        order: 1,
        points: 50,
        isRequired: true,
        validationRules: {},
        category: "setup",
        icon: "👤",
        badge: "starter",
        actionType: "complete_profile",
        targetValue: 100,
      },
      {
        id: "2",
        title: "Únete a tu primera comunidad",
        description: "Explora y únete a una comunidad que te interese",
        type: "community_join",
        order: 2,
        points: 75,
        isRequired: true,
        validationRules: {},
        category: "networking",
        icon: "🏘️",
        badge: "connector",
        actionType: "join_community",
        targetValue: 1,
      },
      {
        id: "3",
        title: "Publica tu primer post",
        description: "Comparte algo interesante con la comunidad",
        type: "first_post",
        order: 3,
        points: 100,
        isRequired: true,
        validationRules: {},
        category: "content",
        icon: "📝",
        badge: "first_voice",
        actionType: "create_post",
        targetValue: 1,
      },
    ],
  };

  // Inicializar onboarding para nuevo usuario
  async initializeOnboarding(
    userId: string,
    templateId?: string,
  ): Promise<OnboardingProgress> {
    try {
      // Verificar si ya existe
      const existing = await this.getOnboardingProgress(userId);
      if (existing) {
        return existing;
      }

      // Obtener template o usar el por defecto
      const template = templateId
        ? await this.getQuestTemplate(templateId)
        : null;
      const questData = template || this.DEFAULT_TEMPLATE;

      // Crear progreso inicial
      const progress: OnboardingProgress = {
        userId,
        questId: template?.id || "default",
        steps: questData.steps.map((step) => ({
          ...step,
          isCompleted: false,
          done: false,
          currentValue: 0,
        })),
        completionPercentage: 0,
        totalSteps: questData.steps.length,
        completedAt: undefined,
        startedAt: new Date(),
        currentStepId: questData.steps[0]?.id || "1",
        totalPoints: 0,
        badgesEarned: [],
        isCompleted: false,
        templateId: template?.id || "default",
      };

      // Guardar en Firestore
      await setDoc(doc(db, this.COLLECTION, userId), progress);

      // Log del evento
      await this.logOnboardingEvent(userId, "onboarding_started", {
        templateId: progress.templateId,
        totalSteps: progress.steps.length,
      });

      return progress;
    } catch (error) {
      console.error("Error initializing onboarding:", error);
      throw error;
    }
  }

  // Obtener progreso de onboarding
  async getOnboardingProgress(
    userId: string,
  ): Promise<OnboardingProgress | null> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as OnboardingProgress;
        // Asegurar que badgesEarned existe
        if (!data.badgesEarned) {
          data.badgesEarned = [];
        }
        return data;
      }

      return null;
    } catch (error) {
      console.error("Error getting onboarding progress:", error);
      return null;
    }
  }

  // Completar un paso del onboarding
  async completeStep(
    userId: string,
    stepId: string,
  ): Promise<OnboardingProgress | null> {
    try {
      const progress = await this.getOnboardingProgress(userId);
      if (!progress) {
        throw new Error("Onboarding progress not found");
      }

      // Encontrar el paso
      const stepIndex = progress.steps.findIndex((s) => s.id === stepId);
      if (stepIndex === -1) {
        throw new Error("Step not found");
      }

      const step = progress.steps[stepIndex];
      if (step.isCompleted || step.done) {
        return progress; // Ya completado
      }

      // Marcar como completado
      progress.steps[stepIndex] = {
        ...step,
        isCompleted: true,
        done: true,
        currentValue: step.targetValue || 100,
        completedAt: new Date(),
      };

      // Actualizar progreso general
      const completedSteps = progress.steps.filter(
        (s) => s.isCompleted || s.done,
      ).length;
      progress.completionPercentage = Math.round(
        (completedSteps / progress.totalSteps) * 100,
      );

      // Sumar puntos
      const currentPoints = progress.totalPoints || 0;
      progress.totalPoints = currentPoints + step.points;

      // Agregar badge si corresponde
      const currentBadges = progress.badgesEarned || [];
      const newBadges = step.badge
        ? [...currentBadges, step.badge]
        : currentBadges;
      progress.badgesEarned = newBadges;

      // Verificar si está completo
      if (progress.completionPercentage >= 100) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
      }

      // Actualizar paso siguiente
      const nextStep = progress.steps.find((s) => !(s.isCompleted || s.done));
      if (nextStep) {
        progress.currentStepId = nextStep.id;
      }

      // Guardar en Firestore
      await setDoc(doc(db, this.COLLECTION, userId), progress);

      // Desbloquear badge si existe
      if (step.badge) {
        await badgeService.unlockBadge(userId, step.badge);
      }

      // Agregar puntos de reputación
      if (
        reputationService &&
        typeof reputationService.logAction === "function"
      ) {
        await reputationService.logAction(
          userId,
          "onboarding_step_completed",
          {
            stepId: stepId,
            stepTitle: step.title,
          },
          step.points,
        );
      }

      // Log del evento
      await this.logOnboardingEvent(userId, "step_completed", {
        stepId,
        stepTitle: step.title,
        points: step.points,
        badge: step.badge,
      });

      // Si está completo, log del quest completo
      if (progress.isCompleted) {
        await this.logOnboardingEvent(userId, "quest_completed", {
          templateId: progress.templateId,
          totalPoints: progress.totalPoints,
          badgesEarned: newBadges.length,
          completionTimeMs: progress.completedAt
            ? new Date(progress.completedAt).getTime() -
              new Date(progress.startedAt).getTime()
            : 0,
        });
      }

      return progress;
    } catch (error) {
      console.error("Error completing step:", error);
      throw error;
    }
  }

  // Omitir un paso (si es opcional)
  async skipStep(
    userId: string,
    stepId: string,
  ): Promise<OnboardingProgress | null> {
    try {
      const progress = await this.getOnboardingProgress(userId);
      if (!progress) return null;

      const stepIndex = progress.steps.findIndex((s) => s.id === stepId);
      if (stepIndex === -1) return progress;

      const step = progress.steps[stepIndex];
      if (step.isRequired) {
        throw new Error("Cannot skip required step");
      }

      // Marcar como omitido
      progress.steps[stepIndex] = {
        ...step,
        isCompleted: false,
        done: true,
        isSkipped: true,
      };

      // Actualizar paso siguiente
      const nextStep = progress.steps.find((s) => !(s.isCompleted || s.done));
      if (nextStep) {
        progress.currentStepId = nextStep.id;
      }

      // Actualizar progreso
      const completedSteps = progress.steps.filter(
        (s) => s.isCompleted || s.done,
      ).length;
      progress.completionPercentage = Math.round(
        (completedSteps / progress.totalSteps) * 100,
      );

      await setDoc(doc(db, this.COLLECTION, userId), progress);

      await this.logOnboardingEvent(userId, "step_skipped", {
        stepId,
        stepTitle: step.title,
      });

      return progress;
    } catch (error) {
      console.error("Error skipping step:", error);
      throw error;
    }
  }

  // Listener para cambios en tiempo real
  listenToOnboardingProgress(
    userId: string,
    callback: (progress: OnboardingProgress | null) => void,
  ) {
    const docRef = doc(db, this.COLLECTION, userId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as OnboardingProgress;
        if (!data.badgesEarned) {
          data.badgesEarned = [];
        }
        callback(data);
      } else {
        callback(null);
      }
    });
  }

  // ==================== QUEST TEMPLATES ====================

  async getQuestTemplates(): Promise<QuestTemplate[]> {
    try {
      const q = query(
        collection(db, this.TEMPLATES_COLLECTION),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as QuestTemplate,
      );
    } catch (error) {
      console.error("Error getting quest templates:", error);
      return [];
    }
  }

  async getQuestTemplate(templateId: string): Promise<QuestTemplate | null> {
    try {
      const docRef = doc(db, this.TEMPLATES_COLLECTION, templateId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as QuestTemplate;
      }

      return null;
    } catch (error) {
      console.error("Error getting quest template:", error);
      return null;
    }
  }

  async createQuestTemplate(
    template: Omit<QuestTemplate, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    try {
      const docRef = doc(collection(db, this.TEMPLATES_COLLECTION));
      const newTemplate = {
        ...template,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(docRef, newTemplate);
      return docRef.id;
    } catch (error) {
      console.error("Error creating quest template:", error);
      throw error;
    }
  }

  async updateQuestTemplate(
    templateId: string,
    updates: Partial<QuestTemplate>,
  ): Promise<void> {
    try {
      const docRef = doc(db, this.TEMPLATES_COLLECTION, templateId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating quest template:", error);
      throw error;
    }
  }

  async deleteQuestTemplate(templateId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.TEMPLATES_COLLECTION, templateId));
    } catch (error) {
      console.error("Error deleting quest template:", error);
      throw error;
    }
  }

  // Listener para templates
  listenToQuestTemplates(callback: (templates: QuestTemplate[]) => void) {
    const q = query(
      collection(db, this.TEMPLATES_COLLECTION),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(q, (snapshot) => {
      const templates = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as QuestTemplate,
      );
      callback(templates);
    });
  }

  // ==================== ESTADÍSTICAS ====================

  async getDetailedStats(): Promise<OnboardingStats> {
    try {
      const progressSnapshot = await getDocs(collection(db, this.COLLECTION));
      const allProgress = progressSnapshot.docs.map(
        (doc) => doc.data() as OnboardingProgress,
      );

      const totalUsers = allProgress.length;
      const completedUsers = allProgress.filter((p) => p.isCompleted).length;
      const averageProgress =
        totalUsers > 0
          ? allProgress.reduce(
              (sum, p) => sum + (p.completionPercentage || 0),
              0,
            ) / totalUsers
          : 0;

      const completionTimes = allProgress
        .filter((p) => p.isCompleted && p.completedAt && p.startedAt)
        .map((p) => {
          const endTime =
            p.completedAt instanceof Date
              ? p.completedAt.getTime()
              : new Date(p.completedAt!).getTime();
          const startTime =
            p.startedAt instanceof Date
              ? p.startedAt.getTime()
              : new Date(p.startedAt).getTime();
          return endTime - startTime;
        });

      const averageCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) /
            completionTimes.length
          : 0;

      const averagePoints =
        totalUsers > 0
          ? allProgress.reduce((sum, p) => sum + (p.totalPoints || 0), 0) /
            totalUsers
          : 0;

      const templateCounts: Record<string, number> = {};
      allProgress.forEach((p) => {
        const templateId = p.templateId || "default";
        templateCounts[templateId] = (templateCounts[templateId] || 0) + 1;
      });

      const popularTemplates = Object.entries(templateCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([templateId, count]) => ({ templateId, count }));

      return {
        totalUsers,
        completedUsers,
        completionRate:
          totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0,
        averageCompletionRate: averageProgress,
        averageCompletionTime,
        averagePointsEarned: averagePoints,
        popularTemplate: popularTemplates[0]?.templateId,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Error getting detailed stats:", error);
      throw error;
    }
  }

  // ==================== EVENTOS ====================

  private async logOnboardingEvent(
    userId: string,
    eventType: OnboardingEvent,
    data: any,
  ): Promise<void> {
    try {
      const event = {
        userId,
        eventType,
        data,
        timestamp: new Date(),
      };

      // Guardar evento (opcional - para analytics)
      const docRef = doc(collection(db, "onboarding_events"));
      await setDoc(docRef, event);
    } catch (error) {
      console.error("Error logging onboarding event:", error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  // ==================== UTILIDADES ====================

  // Verificar si un usuario puede iniciar onboarding
  canStartOnboarding(userId: string): boolean {
    return Boolean(userId && userId.length > 0);
  }

  // Obtener siguiente paso recomendado
  getNextRecommendedStep(progress: OnboardingProgress): OnboardingStep | null {
    if (!progress || progress.isCompleted) return null;

    return (
      progress.steps.find((step) => !(step.isCompleted || step.done)) || null
    );
  }

  // Calcular progreso de completitud
  calculateCompletionPercentage(progress: OnboardingProgress): number {
    if (!progress || !progress.steps.length) return 0;

    const completedSteps = progress.steps.filter(
      (step) => step.isCompleted || step.done,
    ).length;
    return Math.round((completedSteps / progress.steps.length) * 100);
  }
}

export const onboardingService = new OnboardingService();
