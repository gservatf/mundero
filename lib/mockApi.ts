// Mock API for MUNDERO development
// Simulates Firebase + Supabase integration responses

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    empresa: {
      id: string;
      nombre: string;
      ruc: string;
    };
    rol: string;
  };
  token: string;
  refreshToken: string;
}

export interface ExternalLoginRequest {
  token: string;
  appSource: string;
}

export interface WebhookPayload {
  event: string;
  user_uuid: string;
  empresa_id: string;
  app_source: string;
  data: any;
  timestamp: string;
}

export interface IntegrationManifest {
  app_name: string;
  version: string;
  base_url: string;
  webhooks: string[];
  api_key?: string;
}

class MockApi {
  private delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Authentication Endpoints
  async googleAuth(): Promise<ApiResponse<AuthResponse>> {
    await this.delay(1500);

    return {
      success: true,
      data: {
        user: {
          uid: "mock-uid-123",
          email: "usuario@ejemplo.com",
          displayName: "Usuario Demo",
          photoURL:
            "https://ui-avatars.com/api/?name=Usuario+Demo&background=6366f1&color=fff",
          empresa: {
            id: "empresa-123",
            nombre: "Empresa Demo S.A.C.",
            ruc: "20123456789",
          },
          rol: "analyst",
        },
        token: "mock-jwt-token-123",
        refreshToken: "mock-refresh-token-123",
      },
    };
  }

  async externalLogin(
    request: ExternalLoginRequest,
  ): Promise<ApiResponse<any>> {
    await this.delay(500);

    if (!request.token) {
      return {
        success: false,
        error: "Token requerido",
      };
    }

    return {
      success: true,
      data: {
        user_uuid: "mock-uuid-123",
        empresa_id: "empresa-123",
        rol_global: "analyst",
        permissions: ["read", "write"],
        app_access: true,
      },
    };
  }

  async validateToken(token: string): Promise<ApiResponse<boolean>> {
    await this.delay(200);

    return {
      success: true,
      data: token === "mock-jwt-token-123",
    };
  }

  // User Management Endpoints
  async getPendingUsers(): Promise<ApiResponse<any[]>> {
    await this.delay(800);

    return {
      success: true,
      data: [
        {
          id: "1",
          name: "Roberto Silva",
          email: "roberto@empresa.com",
          empresa: "Empresa Demo SAC",
          rol_solicitado: "analyst",
          fecha_solicitud: "2024-10-25",
        },
      ],
    };
  }

  async approveUser(userId: string): Promise<ApiResponse<string>> {
    await this.delay(1000);

    return {
      success: true,
      message: "Usuario aprobado correctamente",
    };
  }

  async rejectUser(
    userId: string,
    reason?: string,
  ): Promise<ApiResponse<string>> {
    await this.delay(1000);

    return {
      success: true,
      message: "Usuario rechazado",
    };
  }

  // Company Management Endpoints
  async createCompany(companyData: any): Promise<ApiResponse<any>> {
    await this.delay(1200);

    return {
      success: true,
      data: {
        id: "nueva-empresa-123",
        ...companyData,
        estado: "pendiente",
        fecha_creacion: new Date().toISOString(),
      },
    };
  }

  async updateCompany(
    companyId: string,
    updates: any,
  ): Promise<ApiResponse<any>> {
    await this.delay(800);

    return {
      success: true,
      data: {
        id: companyId,
        ...updates,
        fecha_actualizacion: new Date().toISOString(),
      },
    };
  }

  // Referral System Endpoints
  async createReferral(referralData: any): Promise<ApiResponse<any>> {
    await this.delay(1000);

    return {
      success: true,
      data: {
        id: "referido-" + Date.now(),
        ...referralData,
        status: "pending",
        fecha_registro: new Date().toISOString(),
        comision_potencial: this.calculateCommission(referralData.servicio),
      },
    };
  }

  async updateReferralStatus(
    referralId: string,
    status: string,
  ): Promise<ApiResponse<any>> {
    await this.delay(600);

    return {
      success: true,
      data: {
        id: referralId,
        status,
        fecha_actualizacion: new Date().toISOString(),
      },
    };
  }

  private calculateCommission(servicio: string): number {
    const commissions = {
      legalty: 500,
      we_consulting: 750,
      portales: 300,
      pitahaya: 400,
    };

    return commissions[servicio as keyof typeof commissions] || 250;
  }

  // Integration Endpoints
  async registerIntegration(
    manifest: IntegrationManifest,
  ): Promise<ApiResponse<any>> {
    await this.delay(1500);

    return {
      success: true,
      data: {
        integration_id: "int-" + Date.now(),
        status: "registered",
        manifest,
        fecha_registro: new Date().toISOString(),
      },
    };
  }

  async syncIntegration(integrationId: string): Promise<ApiResponse<any>> {
    await this.delay(2000);

    return {
      success: true,
      data: {
        integration_id: integrationId,
        sync_status: "completed",
        records_synced: Math.floor(Math.random() * 100) + 1,
        last_sync: new Date().toISOString(),
      },
    };
  }

  async sendWebhook(payload: WebhookPayload): Promise<ApiResponse<any>> {
    await this.delay(300);

    return {
      success: true,
      data: {
        webhook_id: "wh-" + Date.now(),
        status: "delivered",
        payload,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Audit and Monitoring Endpoints
  async getAuditLogs(filters?: any): Promise<ApiResponse<any[]>> {
    await this.delay(600);

    return {
      success: true,
      data: [
        {
          id: "1",
          action: "Usuario aprobado",
          user: "admin@mundero.com",
          timestamp: new Date().toISOString(),
          type: "success",
          details: filters,
        },
      ],
    };
  }

  async getIntegrationHealth(): Promise<ApiResponse<any>> {
    await this.delay(400);

    return {
      success: true,
      data: {
        total_integrations: 4,
        active: 2,
        warning: 1,
        error: 1,
        last_check: new Date().toISOString(),
      },
    };
  }

  // Commission System Endpoints
  async calculateCommissions(userId: string): Promise<ApiResponse<any>> {
    await this.delay(1000);

    return {
      success: true,
      data: {
        user_id: userId,
        total_earned: 2450,
        pending: 750,
        paid: 1700,
        referrals_converted: 3,
        commission_rate: 0.15,
      },
    };
  }

  async processCommissionPayment(
    commissionId: string,
  ): Promise<ApiResponse<any>> {
    await this.delay(2000);

    return {
      success: true,
      data: {
        commission_id: commissionId,
        status: "paid",
        amount: 500,
        payment_date: new Date().toISOString(),
        payment_method: "bank_transfer",
      },
    };
  }

  // Notification System
  async getNotifications(userId: string): Promise<ApiResponse<any[]>> {
    await this.delay(300);

    return {
      success: true,
      data: [
        {
          id: "1",
          title: "Nuevo referido convertido",
          message: "Tu referido Carlos Mendoza se ha convertido en cliente",
          type: "success",
          read: false,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  async markNotificationAsRead(
    notificationId: string,
  ): Promise<ApiResponse<any>> {
    await this.delay(200);

    return {
      success: true,
      message: "Notificación marcada como leída",
    };
  }
}

// Singleton instance
export const mockApi = new MockApi();

// Helper functions for common operations
export const simulateApiCall = async <T>(
  operation: () => Promise<ApiResponse<T>>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void,
): Promise<T | null> => {
  try {
    const response = await operation();

    if (response.success && response.data) {
      onSuccess?.(response.data);
      return response.data;
    } else {
      onError?.(response.error || "Error desconocido");
      return null;
    }
  } catch (error) {
    onError?.(error instanceof Error ? error.message : "Error de conexión");
    return null;
  }
};

// Mock webhook signature validation
export const validateWebhookSignature = (
  payload: string,
  signature: string,
  secret: string,
): boolean => {
  // In real implementation, this would use HMAC-SHA256
  const expectedSignature = `sha256=${btoa(payload + secret)}`;
  return signature === expectedSignature;
};

// Mock JWT token utilities
export const generateMockJWT = (payload: any): string => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa("mock-signature");

  return `${header}.${encodedPayload}.${signature}`;
};

export const decodeMockJWT = (token: string): any => {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};
