// Sistema de Sincronización y Seguridad de Reputación
// Validación de integridad, detección de fraudes y sincronización global

import { reputationService } from "../reputationService";
import { ReputationLog, UserReputation, ReputationActionType } from "../types";

interface SecurityValidation {
  isValid: boolean;
  issues: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  actionTaken?: string;
}

interface SyncStatus {
  lastSync: number;
  pendingActions: number;
  syncErrors: string[];
  isHealthy: boolean;
}

interface FraudDetectionResult {
  isSuspicious: boolean;
  reasons: string[];
  confidence: number; // 0-100
  recommendedAction: "allow" | "review" | "block";
}

class ReputationSecurityManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private validationQueue: Map<string, ReputationLog> = new Map();
  private userActionHistory: Map<string, ReputationLog[]> = new Map();
  private securityConfig = {
    maxActionsPerHour: 50,
    maxPointsPerHour: 200,
    suspiciousActionThreshold: 10, // acciones idénticas consecutivas
    cooldownViolationThreshold: 5, // violaciones de cooldown por hora
    maxConsecutiveDuplicates: 3,
  };

  constructor() {
    this.startSecurityMonitoring();
  }

  /**
   * Iniciar monitoreo de seguridad en background
   */
  private startSecurityMonitoring(): void {
    // Ejecutar validación cada 5 minutos
    this.syncInterval = setInterval(
      () => {
        this.performSecuritySync();
      },
      5 * 60 * 1000,
    );

    console.log("🛡️ Sistema de seguridad de reputación iniciado");
  }

  /**
   * Validar integridad de un log de reputación antes de procesarlo
   */
  async validateReputationAction(
    userId: string,
    action: ReputationActionType,
    metadata?: Record<string, any>,
  ): Promise<SecurityValidation> {
    const issues: string[] = [];
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";

    try {
      // 1. Validar estructura básica
      if (!userId || typeof userId !== "string") {
        issues.push("ID de usuario inválido");
        riskLevel = "high";
      }

      if (!action || !this.isValidActionType(action)) {
        issues.push("Tipo de acción inválido");
        riskLevel = "high";
      }

      // 2. Obtener historial reciente del usuario
      const userHistory = await this.getUserRecentHistory(userId);

      // 3. Detectar patrones sospechosos
      const fraudResult = this.detectFraudPatterns(
        userId,
        action,
        userHistory,
        metadata,
      );
      if (fraudResult.isSuspicious) {
        issues.push(...fraudResult.reasons);
        riskLevel =
          fraudResult.confidence > 80
            ? "critical"
            : fraudResult.confidence > 60
              ? "high"
              : "medium";
      }

      // 4. Validar límites por hora
      const hourlyValidation = this.validateHourlyLimits(
        userId,
        action,
        userHistory,
      );
      if (!hourlyValidation.isValid) {
        issues.push(...hourlyValidation.issues);
        riskLevel = "high";
      }

      // 5. Verificar integridad de metadatos
      const metadataValidation = this.validateMetadata(action, metadata);
      if (!metadataValidation.isValid) {
        issues.push(...metadataValidation.issues);
        riskLevel =
          Math.max(
            riskLevel === "low"
              ? 0
              : riskLevel === "medium"
                ? 1
                : riskLevel === "high"
                  ? 2
                  : 3,
            metadataValidation.riskLevel === "low"
              ? 0
              : metadataValidation.riskLevel === "medium"
                ? 1
                : 2,
          ) === 0
            ? "low"
            : Math.max(
                  riskLevel === "low"
                    ? 0
                    : riskLevel === "medium"
                      ? 1
                      : riskLevel === "high"
                        ? 2
                        : 3,
                  metadataValidation.riskLevel === "low"
                    ? 0
                    : metadataValidation.riskLevel === "medium"
                      ? 1
                      : 2,
                ) === 1
              ? "medium"
              : "high";
      }

      const isValid = issues.length === 0;

      // 6. Tomar acción si es necesario
      let actionTaken: string | undefined;
      if (!isValid && riskLevel === "critical") {
        await this.quarantineUser(userId, "Actividad sospechosa detectada");
        actionTaken = "Usuario puesto en cuarentena";
      } else if (!isValid && riskLevel === "high") {
        await this.flagForReview(userId, action, issues);
        actionTaken = "Marcado para revisión manual";
      }

      return {
        isValid,
        issues,
        riskLevel,
        actionTaken,
      };
    } catch (error) {
      console.error("Error validating reputation action:", error);
      return {
        isValid: false,
        issues: ["Error interno de validación"],
        riskLevel: "critical",
        actionTaken: "Acción bloqueada por error de seguridad",
      };
    }
  }

  /**
   * Detectar patrones de fraude en acciones de usuario
   */
  private detectFraudPatterns(
    userId: string,
    action: ReputationActionType,
    history: ReputationLog[],
    metadata?: Record<string, any>,
  ): FraudDetectionResult {
    const reasons: string[] = [];
    let confidence = 0;

    // Analizar última hora de actividad
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentActions = history.filter((log) => log.createdAt >= oneHourAgo);

    // 1. Detectar spam de acciones idénticas
    const sameActionCount = recentActions.filter(
      (log) => log.action === action,
    ).length;
    if (sameActionCount >= this.securityConfig.suspiciousActionThreshold) {
      reasons.push(
        `Demasiadas acciones del tipo "${action}" en la última hora (${sameActionCount})`,
      );
      confidence += 30;
    }

    // 2. Detectar acciones demasiado rápidas (velocidad no humana)
    if (recentActions.length >= 20) {
      const intervals = recentActions
        .slice(0, -1)
        .map((log, i) => recentActions[i + 1].createdAt - log.createdAt);

      const avgInterval =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length;

      if (avgInterval < 5000) {
        // menos de 5 segundos entre acciones
        reasons.push("Velocidad de acciones sospechosamente alta");
        confidence += 40;
      }
    }

    // 3. Detectar patrones de metadatos sospechosos
    if (metadata) {
      const metadataPattern = this.analyzeMetadataPattern(
        userId,
        action,
        metadata,
        history,
      );
      if (metadataPattern.isSuspicious) {
        reasons.push(...metadataPattern.reasons);
        confidence += metadataPattern.confidence;
      }
    }

    // 4. Detectar acciones fuera de horario normal (bot behavior)
    const hour = new Date().getHours();
    if (recentActions.length > 10 && (hour < 6 || hour > 23)) {
      reasons.push("Actividad intensa en horario inusual");
      confidence += 20;
    }

    // 5. Verificar consistencia de IP y ubicación (si está disponible)
    // En un sistema real, esto requeriría integración con servicios de geolocalización

    confidence = Math.min(confidence, 100);

    const recommendedAction: "allow" | "review" | "block" =
      confidence >= 80 ? "block" : confidence >= 50 ? "review" : "allow";

    return {
      isSuspicious: confidence >= 50,
      reasons,
      confidence,
      recommendedAction,
    };
  }

  /**
   * Validar límites por hora para un usuario
   */
  private validateHourlyLimits(
    userId: string,
    action: ReputationActionType,
    history: ReputationLog[],
  ): SecurityValidation {
    const issues: string[] = [];
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentActions = history.filter((log) => log.createdAt >= oneHourAgo);

    // Contar acciones en la última hora
    const actionCount = recentActions.length;
    if (actionCount >= this.securityConfig.maxActionsPerHour) {
      issues.push(
        `Límite de acciones por hora excedido (${actionCount}/${this.securityConfig.maxActionsPerHour})`,
      );
    }

    // Contar puntos ganados en la última hora
    const pointsGained = recentActions.reduce(
      (sum, log) => sum + log.points,
      0,
    );
    if (pointsGained >= this.securityConfig.maxPointsPerHour) {
      issues.push(
        `Límite de puntos por hora excedido (${pointsGained}/${this.securityConfig.maxPointsPerHour})`,
      );
    }

    return {
      isValid: issues.length === 0,
      issues,
      riskLevel: issues.length > 0 ? "high" : "low",
    };
  }

  /**
   * Validar metadatos de una acción
   */
  private validateMetadata(
    action: ReputationActionType,
    metadata?: Record<string, any>,
  ): SecurityValidation {
    const issues: string[] = [];
    let riskLevel: "low" | "medium" | "high" = "low";

    if (!metadata) {
      return { isValid: true, issues: [], riskLevel: "low" };
    }

    // Validaciones específicas por tipo de acción
    switch (action) {
      case "post_create":
        if (!metadata.postId) {
          issues.push("ID de publicación requerido para post_create");
          riskLevel = "medium";
        }
        break;

      case "post_like":
        if (!metadata.postId || !metadata.authorId) {
          issues.push("ID de publicación y autor requeridos para post_like");
          riskLevel = "medium";
        }
        break;

      case "community_join":
        if (!metadata.communityId) {
          issues.push("ID de comunidad requerido para community_join");
          riskLevel = "medium";
        }
        break;

      case "event_attend":
        if (!metadata.eventId) {
          issues.push("ID de evento requerido para event_attend");
          riskLevel = "medium";
        }
        break;
    }

    // Validar formato de IDs
    Object.entries(metadata).forEach(([key, value]) => {
      if (
        key.endsWith("Id") &&
        (typeof value !== "string" || value.length === 0)
      ) {
        issues.push(`Formato de ID inválido: ${key}`);
        riskLevel = "medium";
      }
    });

    return {
      isValid: issues.length === 0,
      issues,
      riskLevel,
    };
  }

  /**
   * Analizar patrones en metadatos para detectar comportamiento bot
   */
  private analyzeMetadataPattern(
    userId: string,
    action: ReputationActionType,
    metadata: Record<string, any>,
    history: ReputationLog[],
  ): { isSuspicious: boolean; reasons: string[]; confidence: number } {
    const reasons: string[] = [];
    let confidence = 0;

    // Buscar metadatos duplicados en acciones recientes
    const recentSameAction = history
      .filter(
        (log) =>
          log.action === action && log.createdAt >= Date.now() - 30 * 60 * 1000,
      )
      .slice(0, 10);

    let duplicateCount = 0;
    recentSameAction.forEach((log) => {
      if (log.meta && JSON.stringify(log.meta) === JSON.stringify(metadata)) {
        duplicateCount++;
      }
    });

    if (duplicateCount >= this.securityConfig.maxConsecutiveDuplicates) {
      reasons.push("Metadatos idénticos repetidos múltiples veces");
      confidence += 35;
    }

    return {
      isSuspicious: confidence >= 30,
      reasons,
      confidence,
    };
  }

  /**
   * Obtener historial reciente de un usuario
   */
  private async getUserRecentHistory(userId: string): Promise<ReputationLog[]> {
    try {
      // En un sistema real, esto sería una consulta a la base de datos
      // Por ahora retornamos datos mock
      const cached = this.userActionHistory.get(userId);
      if (cached) {
        return cached.filter(
          (log) => log.createdAt >= Date.now() - 24 * 60 * 60 * 1000,
        );
      }
      return [];
    } catch (error) {
      console.error("Error fetching user history:", error);
      return [];
    }
  }

  /**
   * Verificar si un tipo de acción es válido
   */
  private isValidActionType(action: string): action is ReputationActionType {
    const validActions: ReputationActionType[] = [
      "post_create",
      "post_like",
      "post_comment",
      "post_share",
      "community_join",
      "community_create",
      "event_attend",
      "profile_complete",
      "referral_approved",
    ];
    return validActions.includes(action as ReputationActionType);
  }

  /**
   * Poner usuario en cuarentena por actividad sospechosa
   */
  private async quarantineUser(userId: string, reason: string): Promise<void> {
    try {
      console.warn(`🚨 Usuario ${userId} puesto en cuarentena: ${reason}`);

      // En un sistema real, esto actualizaría el estado del usuario en la base de datos
      // await db.collection('users').doc(userId).update({
      //   isQuarantined: true,
      //   quarantineReason: reason,
      //   quarantineDate: new Date()
      // });

      // Notificar a administradores
      await this.notifyAdministrators("USER_QUARANTINED", {
        userId,
        reason,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error quarantining user:", error);
    }
  }

  /**
   * Marcar acción para revisión manual
   */
  private async flagForReview(
    userId: string,
    action: ReputationActionType,
    issues: string[],
  ): Promise<void> {
    try {
      console.warn(
        `⚠️ Acción marcada para revisión - Usuario: ${userId}, Acción: ${action}`,
      );

      // En un sistema real, esto crearía un ticket de revisión
      // await db.collection('review_queue').add({
      //   userId,
      //   action,
      //   issues,
      //   status: 'pending',
      //   createdAt: new Date(),
      //   priority: 'medium'
      // });

      await this.notifyAdministrators("ACTION_FLAGGED", {
        userId,
        action,
        issues,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error flagging for review:", error);
    }
  }

  /**
   * Notificar administradores sobre eventos de seguridad
   */
  private async notifyAdministrators(
    eventType: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      // En un sistema real, esto enviaría notificaciones por email, Slack, etc.
      console.log(`📢 Admin notification: ${eventType}`, data);

      // Ejemplo de integración con sistema de notificaciones
      // await notificationService.sendToAdmins({
      //   type: eventType,
      //   data,
      //   priority: eventType.includes('QUARANTINE') ? 'high' : 'medium'
      // });
    } catch (error) {
      console.error("Error notifying administrators:", error);
    }
  }

  /**
   * Sincronización periódica de seguridad
   */
  private async performSecuritySync(): Promise<SyncStatus> {
    const syncStart = Date.now();
    const errors: string[] = [];
    let pendingActions = 0;

    try {
      console.log("🔄 Iniciando sincronización de seguridad...");

      // 1. Validar integridad de datos en batch
      const integrityResult = await this.validateDataIntegrity();
      if (!integrityResult.isValid) {
        errors.push(...integrityResult.issues);
      }

      // 2. Procesar cola de validación
      pendingActions = await this.processValidationQueue();

      // 3. Limpiar cache de historial antiguo
      await this.cleanupHistoryCache();

      // 4. Generar reporte de seguridad
      await this.generateSecurityReport();

      console.log(
        `✅ Sincronización completada en ${Date.now() - syncStart}ms`,
      );
    } catch (error) {
      console.error("Error during security sync:", error);
      errors.push("Error durante sincronización de seguridad");
    }

    return {
      lastSync: Date.now(),
      pendingActions,
      syncErrors: errors,
      isHealthy: errors.length === 0,
    };
  }

  /**
   * Validar integridad general de datos de reputación
   */
  private async validateDataIntegrity(): Promise<SecurityValidation> {
    const issues: string[] = [];

    try {
      // 1. Verificar consistencia de puntos totales vs logs
      // 2. Detectar duplicados en logs
      // 3. Validar timestamps
      // 4. Verificar referencias a entidades (posts, eventos, etc.)

      // Por ahora, implementación mock
      console.log("🔍 Validando integridad de datos...");
    } catch (error) {
      issues.push("Error validando integridad de datos");
    }

    return {
      isValid: issues.length === 0,
      issues,
      riskLevel: issues.length > 0 ? "medium" : "low",
    };
  }

  /**
   * Procesar cola de validación pendiente
   */
  private async processValidationQueue(): Promise<number> {
    const queueSize = this.validationQueue.size;

    for (const [key, log] of this.validationQueue.entries()) {
      try {
        const validation = await this.validateReputationAction(
          log.userId,
          log.action,
          log.meta,
        );

        if (validation.isValid) {
          this.validationQueue.delete(key);
        }
      } catch (error) {
        console.error(`Error processing validation queue item ${key}:`, error);
      }
    }

    return this.validationQueue.size;
  }

  /**
   * Limpiar cache de historial antiguo
   */
  private async cleanupHistoryCache(): Promise<void> {
    const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 días

    for (const [userId, history] of this.userActionHistory.entries()) {
      const recentHistory = history.filter(
        (log) => log.createdAt >= cutoffTime,
      );

      if (recentHistory.length === 0) {
        this.userActionHistory.delete(userId);
      } else {
        this.userActionHistory.set(userId, recentHistory);
      }
    }
  }

  /**
   * Generar reporte de seguridad
   */
  private async generateSecurityReport(): Promise<void> {
    const report = {
      timestamp: Date.now(),
      validationQueueSize: this.validationQueue.size,
      cachedUsersCount: this.userActionHistory.size,
      systemHealth: "healthy",
      threats: {
        quarantinedUsers: 0,
        flaggedActions: 0,
        suspiciousPatterns: 0,
      },
    };

    console.log("📊 Reporte de seguridad generado:", report);
  }

  /**
   * Detener sistema de seguridad
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log("🛡️ Sistema de seguridad detenido");
  }

  /**
   * Obtener estado actual del sistema de seguridad
   */
  getSecurityStatus(): {
    isRunning: boolean;
    queueSize: number;
    cachedUsers: number;
    lastValidation?: number;
  } {
    return {
      isRunning: this.syncInterval !== null,
      queueSize: this.validationQueue.size,
      cachedUsers: this.userActionHistory.size,
      lastValidation: Date.now(),
    };
  }

  /**
   * Forzar validación de un usuario específico
   */
  async forceUserValidation(userId: string): Promise<SecurityValidation> {
    const history = await this.getUserRecentHistory(userId);

    if (history.length === 0) {
      return {
        isValid: true,
        issues: [],
        riskLevel: "low",
      };
    }

    // Analizar patrones generales del usuario
    const lastAction = history[0];
    return this.validateReputationAction(
      userId,
      lastAction.action,
      lastAction.meta,
    );
  }
}

// Instancia singleton del gestor de seguridad
export const reputationSecurityManager = new ReputationSecurityManager();

// Función wrapper para validar acciones de reputación
export const validateReputationAction = (
  userId: string,
  action: ReputationActionType,
  metadata?: Record<string, any>,
): Promise<SecurityValidation> => {
  return reputationSecurityManager.validateReputationAction(
    userId,
    action,
    metadata,
  );
};

// Hook para verificar el estado de seguridad
export const useSecurityStatus = () => {
  return reputationSecurityManager.getSecurityStatus();
};

export default reputationSecurityManager;
