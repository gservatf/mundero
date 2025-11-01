import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  MunderoIntegrationService,
  munderoIntegrationService,
  MunderoIntegrationUtils,
  type ReferralData,
  type CommissionData,
} from "./integrations";
import { apiClient } from "../lib/apiClient";

// Mock the API client
vi.mock("../lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

const mockApiClient = apiClient as any;

describe("MunderoIntegrationService", () => {
  let service: MunderoIntegrationService;

  beforeEach(() => {
    service = new MunderoIntegrationService();
    vi.clearAllMocks();

    // Console spy to check logging
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("verifyAuth", () => {
    it("should verify authentication successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          valid: true,
          userId: "user123",
          email: "test@example.com",
          roles: ["user"],
          expiresAt: "2024-12-31T23:59:59Z",
        },
        timestamp: "2024-01-01T00:00:00Z",
        requestId: "req-123",
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await service.verifyAuth("test-token");

      expect(mockApiClient.post).toHaveBeenCalledWith("auth/verify", {
        token: "test-token",
        timestamp: expect.any(String),
        source: "firebase",
      });

      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith(
        "🔐 Verifying authentication with Mundero...",
      );
      expect(console.log).toHaveBeenCalledWith(
        "✅ Authentication verified successfully",
      );
    });

    it("should handle authentication failure", async () => {
      mockApiClient.post.mockRejectedValue(new Error("Invalid token"));

      await expect(service.verifyAuth("invalid-token")).rejects.toThrow(
        "Authentication verification failed: Invalid token",
      );

      expect(console.error).toHaveBeenCalledWith(
        "❌ Authentication verification failed:",
        expect.any(Error),
      );
    });
  });

  describe("syncProfile", () => {
    it("should sync profile successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          userId: "user123",
          profile: {
            email: "test@example.com",
            displayName: "Test User",
            role: "user",
            permissions: ["read"],
            integrations: ["mundero-crm"],
          },
          lastSync: "2024-01-01T00:00:00Z",
          status: "active" as const,
        },
        timestamp: "2024-01-01T00:00:00Z",
        requestId: "req-123",
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.syncProfile("user123");

      expect(mockApiClient.get).toHaveBeenCalledWith("sync/profile", {
        headers: {
          "X-User-ID": "user123",
        },
      });

      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith(
        "🔄 Syncing profile with Mundero...",
        { userId: "user123" },
      );
      expect(console.log).toHaveBeenCalledWith(
        "✅ Profile synced successfully",
      );
    });

    it("should handle sync failure", async () => {
      mockApiClient.get.mockRejectedValue(new Error("User not found"));

      await expect(service.syncProfile("nonexistent-user")).rejects.toThrow(
        "Profile sync failed: User not found",
      );

      expect(console.error).toHaveBeenCalledWith(
        "❌ Profile sync failed:",
        expect.any(Error),
      );
    });
  });

  describe("reportReferral", () => {
    it("should report referral successfully", async () => {
      const referralData: ReferralData = {
        referrerUserId: "user123",
        referredEmail: "referred@example.com",
        referredName: "Referred User",
        integrationSource: "legality360",
        campaignId: "campaign123",
      };

      const mockResponse = {
        success: true,
        data: {
          referralId: "ref-123",
          status: "pending" as const,
          trackingCode: "TRK-ABC123",
          estimatedCommission: 50.0,
          processedAt: "2024-01-01T00:00:00Z",
        },
        timestamp: "2024-01-01T00:00:00Z",
        requestId: "req-123",
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await service.reportReferral(referralData);

      expect(mockApiClient.post).toHaveBeenCalledWith("referrals/report", {
        ...referralData,
        timestamp: expect.any(String),
        version: "1.0",
      });

      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith(
        "📈 Reporting referral to Mundero...",
        {
          referrerUserId: "user123",
          referredEmail: "referred@example.com",
          source: "legality360",
        },
      );
    });

    it("should handle referral report failure", async () => {
      const referralData: ReferralData = {
        referrerUserId: "user123",
        referredEmail: "invalid-email",
        integrationSource: "legality360",
      };

      mockApiClient.post.mockRejectedValue(new Error("Invalid email format"));

      await expect(service.reportReferral(referralData)).rejects.toThrow(
        "Referral report failed: Invalid email format",
      );

      expect(console.error).toHaveBeenCalledWith(
        "❌ Referral report failed:",
        expect.any(Error),
      );
    });
  });

  describe("reportCommission", () => {
    it("should report commission successfully", async () => {
      const commissionData: CommissionData = {
        userId: "user123",
        integrationSource: "we-consulting",
        transactionId: "txn-456",
        amount: 100.0,
        currency: "USD",
        commissionType: "referral",
        description: "Referral commission",
      };

      const mockResponse = {
        success: true,
        data: {
          commissionId: "comm-123",
          status: "approved" as const,
          calculatedAmount: 100.0,
          commission: {
            rate: 0.1,
            baseAmount: 1000.0,
            finalAmount: 100.0,
          },
          processedAt: "2024-01-01T00:00:00Z",
        },
        timestamp: "2024-01-01T00:00:00Z",
        requestId: "req-123",
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await service.reportCommission(commissionData);

      expect(mockApiClient.post).toHaveBeenCalledWith("commissions/report", {
        ...commissionData,
        timestamp: expect.any(String),
        version: "1.0",
      });

      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith(
        "💰 Reporting commission to Mundero...",
        {
          userId: "user123",
          amount: 100.0,
          currency: "USD",
          type: "referral",
          source: "we-consulting",
        },
      );
    });

    it("should handle commission report failure", async () => {
      const commissionData: CommissionData = {
        userId: "user123",
        integrationSource: "mundero-crm",
        transactionId: "invalid-txn",
        amount: -50.0, // Invalid negative amount
        currency: "USD",
        commissionType: "referral",
      };

      mockApiClient.post.mockRejectedValue(
        new Error("Invalid commission amount"),
      );

      await expect(service.reportCommission(commissionData)).rejects.toThrow(
        "Commission report failed: Invalid commission amount",
      );

      expect(console.error).toHaveBeenCalledWith(
        "❌ Commission report failed:",
        expect.any(Error),
      );
    });
  });

  describe("getHealthStatus", () => {
    it("should get health status successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          status: "healthy" as const,
          services: {
            auth: true,
            sync: true,
            referrals: true,
            commissions: true,
          },
          timestamp: "2024-01-01T00:00:00Z",
          version: "1.0",
        },
        timestamp: "2024-01-01T00:00:00Z",
        requestId: "req-123",
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.getHealthStatus();

      expect(mockApiClient.get).toHaveBeenCalledWith("health", {
        skipAuth: true,
        maxRetries: 2,
        timeout: 5000,
      });

      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith(
        "🏥 Checking Mundero integration health...",
      );
      expect(console.log).toHaveBeenCalledWith(
        "✅ Integration health: healthy",
      );
    });

    it("should handle degraded health status", async () => {
      const mockResponse = {
        success: true,
        data: {
          status: "degraded" as const,
          services: {
            auth: true,
            sync: false,
            referrals: true,
            commissions: true,
          },
          timestamp: "2024-01-01T00:00:00Z",
          version: "1.0",
        },
        timestamp: "2024-01-01T00:00:00Z",
        requestId: "req-123",
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.getHealthStatus();

      expect(result.data.status).toBe("degraded");
      expect(console.log).toHaveBeenCalledWith(
        "⚠️ Integration health: degraded",
      );
    });
  });

  describe("getReferralStats", () => {
    it("should get referral statistics successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          totalReferrals: 10,
          pendingReferrals: 2,
          confirmedReferrals: 7,
          rejectedReferrals: 1,
          totalCommissions: 500.0,
          pendingCommissions: 100.0,
        },
        timestamp: "2024-01-01T00:00:00Z",
        requestId: "req-123",
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.getReferralStats("user123");

      expect(mockApiClient.get).toHaveBeenCalledWith("referrals/stats", {
        headers: {
          "X-User-ID": "user123",
        },
      });

      expect(result).toEqual(mockResponse);
      expect(console.log).toHaveBeenCalledWith(
        "📊 Getting referral statistics...",
        { userId: "user123" },
      );
    });
  });

  describe("testConnection", () => {
    it("should return true for healthy connection", async () => {
      mockApiClient.healthCheck.mockResolvedValue(true);

      const result = await service.testConnection();

      expect(result).toBe(true);
      expect(mockApiClient.healthCheck).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "🔌 Testing Mundero integration connectivity...",
      );
      expect(console.log).toHaveBeenCalledWith(
        "✅ Integration connectivity test passed",
      );
    });

    it("should return false for unhealthy connection", async () => {
      mockApiClient.healthCheck.mockResolvedValue(false);

      const result = await service.testConnection();

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        "⚠️ Integration connectivity test failed - unhealthy status",
      );
    });

    it("should return false when health check throws error", async () => {
      mockApiClient.healthCheck.mockRejectedValue(new Error("Network error"));

      const result = await service.testConnection();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "❌ Integration connectivity test failed:",
        expect.any(Error),
      );
    });
  });
});

describe("MunderoIntegrationUtils", () => {
  describe("formatCommissionAmount", () => {
    it("should format USD amounts correctly", () => {
      expect(MunderoIntegrationUtils.formatCommissionAmount(100.5, "USD")).toBe(
        "$100.50",
      );
      expect(MunderoIntegrationUtils.formatCommissionAmount(1000, "USD")).toBe(
        "$1,000.00",
      );
    });

    it("should format EUR amounts correctly", () => {
      expect(MunderoIntegrationUtils.formatCommissionAmount(100.5, "EUR")).toBe(
        "€100.50",
      );
    });

    it("should handle different currencies", () => {
      expect(
        MunderoIntegrationUtils.formatCommissionAmount(100, "PEN"),
      ).toContain("100.00");
      expect(
        MunderoIntegrationUtils.formatCommissionAmount(100, "COP"),
      ).toContain("100.00");
    });
  });

  describe("generateTrackingCode", () => {
    it("should generate tracking codes with default prefix", () => {
      const code = MunderoIntegrationUtils.generateTrackingCode();
      expect(code).toMatch(/^REF-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it("should generate tracking codes with custom prefix", () => {
      const code = MunderoIntegrationUtils.generateTrackingCode("COMM");
      expect(code).toMatch(/^COMM-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it("should generate unique codes", () => {
      const code1 = MunderoIntegrationUtils.generateTrackingCode();
      const code2 = MunderoIntegrationUtils.generateTrackingCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe("isValidIntegrationSource", () => {
    it("should validate correct integration sources", () => {
      expect(
        MunderoIntegrationUtils.isValidIntegrationSource("legality360"),
      ).toBe(true);
      expect(
        MunderoIntegrationUtils.isValidIntegrationSource("we-consulting"),
      ).toBe(true);
      expect(
        MunderoIntegrationUtils.isValidIntegrationSource("mundero-crm"),
      ).toBe(true);
    });

    it("should reject invalid integration sources", () => {
      expect(
        MunderoIntegrationUtils.isValidIntegrationSource("invalid-source"),
      ).toBe(false);
      expect(MunderoIntegrationUtils.isValidIntegrationSource("")).toBe(false);
      expect(
        MunderoIntegrationUtils.isValidIntegrationSource("LEGALITY360"),
      ).toBe(false);
    });
  });

  describe("getIntegrationDisplayName", () => {
    it("should return correct display names", () => {
      expect(
        MunderoIntegrationUtils.getIntegrationDisplayName("legality360"),
      ).toBe("Legality 360");
      expect(
        MunderoIntegrationUtils.getIntegrationDisplayName("we-consulting"),
      ).toBe("WE Consulting");
      expect(
        MunderoIntegrationUtils.getIntegrationDisplayName("mundero-crm"),
      ).toBe("Mundero CRM");
    });

    it("should return source as-is for unknown sources", () => {
      expect(
        MunderoIntegrationUtils.getIntegrationDisplayName("unknown-source"),
      ).toBe("unknown-source");
    });
  });
});

describe("munderoIntegrationService singleton", () => {
  it("should export a singleton instance", () => {
    expect(munderoIntegrationService).toBeInstanceOf(MunderoIntegrationService);
  });

  it("should be the same instance when imported multiple times", async () => {
    const mod1 = await import("./integrations");
    const mod2 = await import("./integrations");
    expect(mod1.munderoIntegrationService).toBe(mod2.munderoIntegrationService);
  });
});

describe("Integration workflows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should handle complete referral workflow", async () => {
    // Mock successful auth verification
    mockApiClient.post
      .mockResolvedValueOnce({
        success: true,
        data: {
          valid: true,
          userId: "user123",
          email: "test@example.com",
          roles: ["user"],
          expiresAt: "2024-12-31T23:59:59Z",
        },
      })
      // Mock successful referral report
      .mockResolvedValueOnce({
        success: true,
        data: {
          referralId: "ref-123",
          status: "pending",
          trackingCode: "TRK-ABC123",
          processedAt: "2024-01-01T00:00:00Z",
        },
      });

    // Step 1: Verify auth
    const authResult = await munderoIntegrationService.verifyAuth("test-token");
    expect(authResult.data.valid).toBe(true);

    // Step 2: Report referral
    const referralData: ReferralData = {
      referrerUserId: "user123",
      referredEmail: "referred@example.com",
      integrationSource: "legality360",
    };

    const referralResult =
      await munderoIntegrationService.reportReferral(referralData);
    expect(referralResult.data.referralId).toBe("ref-123");
    expect(referralResult.data.trackingCode).toBe("TRK-ABC123");
  });

  it("should handle complete commission workflow", async () => {
    // Mock successful commission report
    mockApiClient.post.mockResolvedValue({
      success: true,
      data: {
        commissionId: "comm-123",
        status: "approved",
        calculatedAmount: 100.0,
        commission: { rate: 0.1, baseAmount: 1000.0, finalAmount: 100.0 },
        processedAt: "2024-01-01T00:00:00Z",
      },
    });

    const commissionData: CommissionData = {
      userId: "user123",
      integrationSource: "we-consulting",
      transactionId: "txn-456",
      amount: 100.0,
      currency: "USD",
      commissionType: "referral",
    };

    const result =
      await munderoIntegrationService.reportCommission(commissionData);
    expect(result.data.commissionId).toBe("comm-123");
    expect(result.data.status).toBe("approved");
    expect(result.data.calculatedAmount).toBe(100.0);
  });
});
