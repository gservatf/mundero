import { apiClient, type ApiResponse } from "../lib/apiClient";

// Types for integration responses
export interface AuthVerificationResponse {
  valid: boolean;
  userId: string;
  email: string;
  roles: string[];
  expiresAt: string;
}

export interface ProfileSyncResponse {
  userId: string;
  profile: {
    email: string;
    displayName: string;
    avatar?: string;
    company?: string;
    role: string;
    permissions: string[];
    integrations: string[];
  };
  lastSync: string;
  status: "active" | "inactive" | "suspended";
}

export interface ReferralData {
  referrerUserId: string;
  referredEmail: string;
  referredName?: string;
  integrationSource: "legality360" | "we-consulting" | "mundero-crm";
  campaignId?: string;
  metadata?: Record<string, any>;
}

export interface ReferralReportResponse {
  referralId: string;
  status: "pending" | "confirmed" | "rejected";
  trackingCode: string;
  estimatedCommission?: number;
  processedAt: string;
}

export interface CommissionData {
  userId: string;
  integrationSource: "legality360" | "we-consulting" | "mundero-crm";
  transactionId: string;
  amount: number;
  currency: "USD" | "EUR" | "PEN" | "COP";
  commissionType: "referral" | "subscription" | "usage" | "bonus";
  description?: string;
  metadata?: Record<string, any>;
}

export interface CommissionReportResponse {
  commissionId: string;
  status: "pending" | "approved" | "paid" | "rejected";
  calculatedAmount: number;
  commission: {
    rate: number;
    baseAmount: number;
    finalAmount: number;
  };
  payoutDate?: string;
  processedAt: string;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "down";
  services: {
    auth: boolean;
    sync: boolean;
    referrals: boolean;
    commissions: boolean;
  };
  timestamp: string;
  version: string;
}

/**
 * Mundero Integration Services
 * Implements the full Mundero Integration Blueprint v1.0
 */
export class MunderoIntegrationService {
  /**
   * Verify authentication token with Mundero
   * @param token Firebase ID token
   */
  async verifyAuth(
    token: string,
  ): Promise<ApiResponse<AuthVerificationResponse>> {
    try {
      console.log("🔐 Verifying authentication with Mundero...");

      const response = await apiClient.post<AuthVerificationResponse>(
        "auth/verify",
        {
          token,
          timestamp: new Date().toISOString(),
          source: "firebase",
        },
      );

      console.log("✅ Authentication verified successfully");
      return response;
    } catch (error) {
      console.error("❌ Authentication verification failed:", error);
      throw new Error(
        `Authentication verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Sync user profile with Mundero
   * @param userId User UUID from Firebase
   */
  async syncProfile(userId: string): Promise<ApiResponse<ProfileSyncResponse>> {
    try {
      console.log("🔄 Syncing profile with Mundero...", { userId });

      const response = await apiClient.get<ProfileSyncResponse>(
        `sync/profile`,
        {
          headers: {
            "X-User-ID": userId,
          },
        },
      );

      console.log("✅ Profile synced successfully");
      return response;
    } catch (error) {
      console.error("❌ Profile sync failed:", error);
      throw new Error(
        `Profile sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Report a new referral to Mundero
   * @param data Referral information
   */
  async reportReferral(
    data: ReferralData,
  ): Promise<ApiResponse<ReferralReportResponse>> {
    try {
      console.log("📈 Reporting referral to Mundero...", {
        referrerUserId: data.referrerUserId,
        referredEmail: data.referredEmail,
        source: data.integrationSource,
      });

      const payload = {
        ...data,
        timestamp: new Date().toISOString(),
        version: "1.0",
      };

      const response = await apiClient.post<ReferralReportResponse>(
        "referrals/report",
        payload,
      );

      console.log("✅ Referral reported successfully", {
        referralId: response.data.referralId,
        trackingCode: response.data.trackingCode,
      });

      return response;
    } catch (error) {
      console.error("❌ Referral report failed:", error);
      throw new Error(
        `Referral report failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Report commission to Mundero
   * @param data Commission information
   */
  async reportCommission(
    data: CommissionData,
  ): Promise<ApiResponse<CommissionReportResponse>> {
    try {
      console.log("💰 Reporting commission to Mundero...", {
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        type: data.commissionType,
        source: data.integrationSource,
      });

      const payload = {
        ...data,
        timestamp: new Date().toISOString(),
        version: "1.0",
      };

      const response = await apiClient.post<CommissionReportResponse>(
        "commissions/report",
        payload,
      );

      console.log("✅ Commission reported successfully", {
        commissionId: response.data.commissionId,
        calculatedAmount: response.data.calculatedAmount,
        status: response.data.status,
      });

      return response;
    } catch (error) {
      console.error("❌ Commission report failed:", error);
      throw new Error(
        `Commission report failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get integration health status
   */
  async getHealthStatus(): Promise<ApiResponse<HealthStatus>> {
    try {
      console.log("🏥 Checking Mundero integration health...");

      const response = await apiClient.get<HealthStatus>("health", {
        skipAuth: true,
        maxRetries: 2,
        timeout: 5000,
      });

      const healthStatus = response.data.status;
      console.log(
        `${healthStatus === "healthy" ? "✅" : "⚠️"} Integration health: ${healthStatus}`,
      );

      return response;
    } catch (error) {
      console.error("❌ Health check failed:", error);
      throw new Error(
        `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get user's referral statistics
   * @param userId User UUID
   */
  async getReferralStats(userId: string): Promise<ApiResponse<any>> {
    try {
      console.log("📊 Getting referral statistics...", { userId });

      const response = await apiClient.get(`referrals/stats`, {
        headers: {
          "X-User-ID": userId,
        },
      });

      console.log("✅ Referral stats retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Failed to get referral stats:", error);
      throw new Error(
        `Failed to get referral stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get user's commission history
   * @param userId User UUID
   * @param limit Number of records to return
   * @param offset Pagination offset
   */
  async getCommissionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ApiResponse<any>> {
    try {
      console.log("💰 Getting commission history...", {
        userId,
        limit,
        offset,
      });

      const response = await apiClient.get(
        `commissions/history?limit=${limit}&offset=${offset}`,
        {
          headers: {
            "X-User-ID": userId,
          },
        },
      );

      console.log("✅ Commission history retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Failed to get commission history:", error);
      throw new Error(
        `Failed to get commission history: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update user integration preferences
   * @param userId User UUID
   * @param preferences Integration preferences
   */
  async updateIntegrationPreferences(
    userId: string,
    preferences: Record<string, any>,
  ): Promise<ApiResponse<any>> {
    try {
      console.log("⚙️ Updating integration preferences...", { userId });

      const response = await apiClient.put(`users/${userId}/preferences`, {
        preferences,
        timestamp: new Date().toISOString(),
      });

      console.log("✅ Integration preferences updated successfully");
      return response;
    } catch (error) {
      console.error("❌ Failed to update integration preferences:", error);
      throw new Error(
        `Failed to update preferences: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Test integration connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("🔌 Testing Mundero integration connectivity...");

      const isHealthy = await apiClient.healthCheck();

      if (isHealthy) {
        console.log("✅ Integration connectivity test passed");
        return true;
      } else {
        console.warn(
          "⚠️ Integration connectivity test failed - unhealthy status",
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Integration connectivity test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const munderoIntegrationService = new MunderoIntegrationService();

// Export utility functions for integration management
export const MunderoIntegrationUtils = {
  /**
   * Format commission amount for display
   */
  formatCommissionAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Generate tracking code for referrals
   */
  generateTrackingCode(prefix: string = "REF"): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  },

  /**
   * Validate integration source
   */
  isValidIntegrationSource(source: string): boolean {
    return ["legality360", "we-consulting", "mundero-crm"].includes(source);
  },

  /**
   * Get integration display name
   */
  getIntegrationDisplayName(source: string): string {
    const names: Record<string, string> = {
      legality360: "Legality 360",
      "we-consulting": "WE Consulting",
      "mundero-crm": "Mundero CRM",
    };
    return names[source] || source;
  },
};
