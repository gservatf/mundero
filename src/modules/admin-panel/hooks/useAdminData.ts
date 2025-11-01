import { useState, useEffect, useCallback } from "react";
import {
  adminUserService,
  adminCompanyService,
  type AdminUser,
  type AdminCompany,
} from "../services/adminFirebase";
import { solutionsService } from "../../solutions/services/solutionsService";
import { apiClient } from "../../../lib/apiClient";
import { useAdminAuth } from "./useAdminAuth";

// Types for dashboard data
export interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  activeUsers: number;
  pendingCompanies: number;
  totalIntegrations: number;
  activeIntegrations: number;
}

export interface RecentActivity {
  id: string;
  type:
    | "user_registered"
    | "company_created"
    | "integration_activated"
    | "admin_action";
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  status: "active" | "inactive" | "error";
  lastSync?: Date;
  errorMessage?: string;
}

export interface AdminDataState {
  // Dashboard data
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  integrations: IntegrationStatus[];

  // Users and companies
  users: AdminUser[];
  companies: AdminCompany[];

  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingUsers: boolean;
  isLoadingCompanies: boolean;
  isLoadingIntegrations: boolean;

  // Error states
  error: string | null;
  statsError: string | null;
  usersError: string | null;
  companiesError: string | null;
  integrationsError: string | null;
}

const initialState: AdminDataState = {
  stats: null,
  recentActivity: [],
  integrations: [],
  users: [],
  companies: [],
  isLoading: false,
  isLoadingStats: false,
  isLoadingUsers: false,
  isLoadingCompanies: false,
  isLoadingIntegrations: false,
  error: null,
  statsError: null,
  usersError: null,
  companiesError: null,
  integrationsError: null,
};

export const useAdminData = () => {
  const [state, setState] = useState<AdminDataState>(initialState);
  const { user, isAdmin, adminProfile } = useAdminAuth();

  // Update loading state for a specific operation
  const setLoadingState = useCallback(
    (
      operation: keyof Pick<
        AdminDataState,
        | "isLoading"
        | "isLoadingStats"
        | "isLoadingUsers"
        | "isLoadingCompanies"
        | "isLoadingIntegrations"
      >,
      loading: boolean,
    ) => {
      setState((prev) => ({ ...prev, [operation]: loading }));
    },
    [],
  );

  // Update error state for a specific operation
  const setErrorState = useCallback(
    (
      operation: keyof Pick<
        AdminDataState,
        | "error"
        | "statsError"
        | "usersError"
        | "companiesError"
        | "integrationsError"
      >,
      error: string | null,
    ) => {
      setState((prev) => ({ ...prev, [operation]: error }));
    },
    [],
  );

  // Load dashboard statistics
  const loadDashboardStats =
    useCallback(async (): Promise<DashboardStats | null> => {
      if (!isAdmin || !adminProfile) {
        return null;
      }

      setLoadingState("isLoadingStats", true);
      setErrorState("statsError", null);

      try {
        // Load data from Firebase
        const [usersResult, companiesResult, solutionsResult] = await Promise.allSettled([
          adminUserService.getUsers(1000),
          adminCompanyService.getCompanies(1000),
          solutionsService.getAllSolutions(),
        ]);

        const users =
          usersResult.status === "fulfilled" ? usersResult.value.users : [];
        const companies =
          companiesResult.status === "fulfilled"
            ? companiesResult.value.companies
            : [];
        const solutions =
          solutionsResult.status === "fulfilled" ? solutionsResult.value : [];

        // Try to get integration stats from API
        let totalIntegrations = 0;
        let activeIntegrations = 0;

        try {
          const integrationsResponse = await apiClient.get(
            "integrations/status",
          );
          if (integrationsResponse.success && integrationsResponse.data) {
            const integrations = integrationsResponse.data.integrations || [];
            totalIntegrations = integrations.length;
            activeIntegrations = integrations.filter(
              (i: any) => i.status === "active",
            ).length;
          }
        } catch (error) {
          console.warn("Failed to load integration stats:", error);
          // Use solutions count as fallback for integrations
          totalIntegrations = solutions.length;
          activeIntegrations = solutions.filter(s => s.active === true).length;
        }

        const stats: DashboardStats = {
          totalUsers: users.length,
          totalCompanies: companies.length,
          activeUsers: users.filter((u) => u.status === "active").length,
          pendingCompanies: companies.filter((c) => c.status === "pending")
            .length,
          totalIntegrations,
          activeIntegrations,
        };

        setState((prev) => ({ ...prev, stats }));
        return stats;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load dashboard stats";
        console.error("Error loading dashboard stats:", error);
        setErrorState("statsError", errorMessage);
        return null;
      } finally {
        setLoadingState("isLoadingStats", false);
      }
    }, [isAdmin, adminProfile, setLoadingState, setErrorState]);

  // Load recent activity
  const loadRecentActivity = useCallback(async (): Promise<
    RecentActivity[]
  > => {
    if (!isAdmin || !adminProfile) {
      return [];
    }

    try {
      // Get recent user registrations - using search method instead of complex queries
      const recentUsers = await adminUserService.getUsers(5);

      // Get recent company creations
      const recentCompanies = await adminCompanyService.getCompanies(5);

      const activity: RecentActivity[] = [];

      // Add user registrations
      recentUsers.users.forEach((user) => {
        if (user.createdAt) {
          activity.push({
            id: `user_${user.uid}`,
            type: "user_registered",
            description: `New user registered: ${user.displayName || user.email}`,
            timestamp: user.createdAt.toDate(),
            userId: user.uid,
            userName: user.displayName || user.email,
          });
        }
      });

      // Add company creations
      recentCompanies.companies.forEach((company) => {
        if (company.createdAt) {
          activity.push({
            id: `company_${company.id}`,
            type: "company_created",
            description: `New company created: ${company.name}`,
            timestamp: company.createdAt.toDate(),
          });
        }
      });

      // Sort by timestamp (most recent first)
      activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Take only the most recent 10 items
      const recentActivity = activity.slice(0, 10);

      setState((prev) => ({ ...prev, recentActivity }));
      return recentActivity;
    } catch (error) {
      console.error("Error loading recent activity:", error);
      return [];
    }
  }, [isAdmin, adminProfile]);

  // Load users
  const loadUsers = useCallback(
    async (options?: {
      limit?: number;
      search?: string;
    }): Promise<AdminUser[]> => {
      if (!isAdmin || !adminProfile) {
        return [];
      }

      setLoadingState("isLoadingUsers", true);
      setErrorState("usersError", null);

      try {
        let result;
        if (options?.search) {
          // Use search method for searching
          const users = await adminUserService.searchUsers(options.search);
          result = { users, total: users.length };
        } else {
          // Use regular getUsers method with limit
          result = await adminUserService.getUsers(options?.limit || 100);
        }

        setState((prev) => ({ ...prev, users: result.users }));
        return result.users;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load users";
        console.error("Error loading users:", error);
        setErrorState("usersError", errorMessage);
        return [];
      } finally {
        setLoadingState("isLoadingUsers", false);
      }
    },
    [isAdmin, adminProfile, setLoadingState, setErrorState],
  );

  // Load companies
  const loadCompanies = useCallback(
    async (options?: {
      limit?: number;
      search?: string;
    }): Promise<AdminCompany[]> => {
      if (!isAdmin || !adminProfile) {
        return [];
      }

      setLoadingState("isLoadingCompanies", true);
      setErrorState("companiesError", null);

      try {
        let result;
        if (options?.search) {
          // Use search method for searching
          const companies = await adminCompanyService.searchCompanies(
            options.search,
            options.limit || 100,
          );
          result = { companies, total: companies.length };
        } else {
          // Use regular getCompanies method with limit
          result = await adminCompanyService.getCompanies(
            options?.limit || 100,
          );
        }

        setState((prev) => ({ ...prev, companies: result.companies }));
        return result.companies;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load companies";
        console.error("Error loading companies:", error);
        setErrorState("companiesError", errorMessage);
        return [];
      } finally {
        setLoadingState("isLoadingCompanies", false);
      }
    },
    [isAdmin, adminProfile, setLoadingState, setErrorState],
  );

  // Load integrations status
  const loadIntegrations = useCallback(async (): Promise<
    IntegrationStatus[]
  > => {
    if (!isAdmin || !adminProfile) {
      return [];
    }

    setLoadingState("isLoadingIntegrations", true);
    setErrorState("integrationsError", null);

    try {
      const response = await apiClient.get("integrations/status");

      if (response.success && response.data) {
        const integrations: IntegrationStatus[] =
          response.data.integrations || [];
        setState((prev) => ({ ...prev, integrations }));
        return integrations;
      } else {
        throw new Error(response.message || "Failed to load integrations");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load integrations";
      console.error("Error loading integrations:", error);
      setErrorState("integrationsError", errorMessage);
      return [];
    } finally {
      setLoadingState("isLoadingIntegrations", false);
    }
  }, [isAdmin, adminProfile, setLoadingState, setErrorState]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin || !adminProfile) {
      return;
    }

    setLoadingState("isLoading", true);
    setErrorState("error", null);

    try {
      await Promise.allSettled([
        loadDashboardStats(),
        loadRecentActivity(),
        loadIntegrations(),
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data";
      console.error("Error loading dashboard data:", error);
      setErrorState("error", errorMessage);
    } finally {
      setLoadingState("isLoading", false);
    }
  }, [
    isAdmin,
    adminProfile,
    loadDashboardStats,
    loadRecentActivity,
    loadIntegrations,
    setLoadingState,
    setErrorState,
  ]);

  // Sync integrations
  const syncIntegrations = useCallback(async (): Promise<boolean> => {
    if (!isAdmin || !adminProfile) {
      return false;
    }

    try {
      const response = await apiClient.post("integrations/sync");

      if (response.success) {
        // Reload integrations after sync
        await loadIntegrations();
        return true;
      } else {
        throw new Error(response.message || "Failed to sync integrations");
      }
    } catch (error) {
      console.error("Error syncing integrations:", error);
      setErrorState(
        "integrationsError",
        error instanceof Error ? error.message : "Failed to sync integrations",
      );
      return false;
    }
  }, [isAdmin, adminProfile, loadIntegrations, setErrorState]);

  // Update user
  const updateUser = useCallback(
    async (userId: string, updates: Partial<AdminUser>): Promise<boolean> => {
      if (!isAdmin || !adminProfile) {
        return false;
      }

      try {
        // Use the available update methods instead of non-existent updateUser
        if (updates.role) {
          await adminUserService.updateUserRole(userId, updates.role, {
            uid: adminProfile.uid,
            email: adminProfile.email,
          });
        }
        if (updates.status) {
          await adminUserService.updateUserStatus(userId, updates.status, {
            uid: adminProfile.uid,
            email: adminProfile.email,
          });
        }

        // Reload users after update
        await loadUsers();

        return true;
      } catch (error) {
        console.error("Error updating user:", error);
        setErrorState(
          "usersError",
          error instanceof Error ? error.message : "Failed to update user",
        );
        return false;
      }
    },
    [isAdmin, adminProfile, loadUsers, setErrorState],
  );

  // Update company
  const updateCompany = useCallback(
    async (
      companyId: string,
      updates: Partial<AdminCompany>,
    ): Promise<boolean> => {
      if (!isAdmin || !adminProfile) {
        return false;
      }

      try {
        await adminCompanyService.updateCompany(companyId, updates);

        // Reload companies after update
        await loadCompanies();

        return true;
      } catch (error) {
        console.error("Error updating company:", error);
        setErrorState(
          "companiesError",
          error instanceof Error ? error.message : "Failed to update company",
        );
        return false;
      }
    },
    [isAdmin, adminProfile, loadCompanies, setErrorState],
  );

  // Auto-load data when authenticated
  useEffect(() => {
    if (isAdmin && adminProfile) {
      loadDashboardData();
    }
  }, [isAdmin, adminProfile, loadDashboardData]);

  return {
    // State
    ...state,

    // Actions
    loadDashboardData,
    loadDashboardStats,
    loadRecentActivity,
    loadUsers,
    loadCompanies,
    loadIntegrations,
    syncIntegrations,
    updateUser,
    updateCompany,

    // Utilities
    refresh: loadDashboardData,
    isAuthenticated: isAdmin,
    adminUser: adminProfile,
  };
};
