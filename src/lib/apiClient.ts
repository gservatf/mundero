import { auth } from "./firebase";

// Types for API responses and requests
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  requestId: string;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  maxRetries?: number;
  timeout?: number;
}

// Generate UUID for request tracking
const generateRequestId = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Format dates to ISO 8601 UTC
const formatDateISO = (date: Date = new Date()): string => {
  return date.toISOString();
};

// Exponential backoff delay calculation
const calculateBackoffDelay = (attempt: number): number => {
  return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
};

// Sleep utility for retries
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

class ApiClient {
  private baseUrl: string;
  private apiKey: string;
  private version: string;
  private mode: "mock" | "prod";

  constructor() {
    // Use environment variables with fallbacks
    this.baseUrl =
      (globalThis as any)?.process?.env?.VITE_MUNDERO_BASE_URL ||
      (window as any)?.__ENV__?.VITE_MUNDERO_BASE_URL ||
      "https://mundero.net";

    this.apiKey =
      (globalThis as any)?.process?.env?.VITE_MUNDERO_API_KEY ||
      (window as any)?.__ENV__?.VITE_MUNDERO_API_KEY ||
      import.meta.env.VITE_MUNDERO_API_KEY ||
      "";

    this.version = "v1";

    this.mode =
      (globalThis as any)?.process?.env?.VITE_API_MODE ||
      (window as any)?.__ENV__?.VITE_API_MODE ||
      "prod";

    if (!this.apiKey && this.mode === "prod") {
      console.warn("⚠️ VITE_MUNDERO_API_KEY not found in environment variables");
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-API-KEY": this.apiKey,
      "X-Request-ID": generateRequestId(),
      "X-Timestamp": formatDateISO(),
      "X-Client-Version": "1.0.0",
      "X-Platform": "web",
    };

    try {
      // Get Firebase user token if authenticated
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        headers["Authorization"] = `Bearer ${idToken}`;
      }
    } catch (error) {
      console.warn("Failed to get Firebase token:", error);
    }

    return headers;
  }

  private buildUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;

    // Build full URL with version
    if (cleanEndpoint.startsWith("api/mundero")) {
      return `${this.baseUrl}/${cleanEndpoint}`;
    }

    return `${this.baseUrl}/api/mundero/${this.version}/${cleanEndpoint}`;
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const {
      skipAuth = false,
      maxRetries = 3,
      timeout = 30000,
      ...requestInit
    } = config;

    const url = this.buildUrl(endpoint);
    let lastError: Error;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const headers = skipAuth
          ? {
              "Content-Type": "application/json",
              "X-Request-ID": generateRequestId(),
              "X-API-KEY": this.apiKey,
            }
          : await this.getAuthHeaders();

        const requestOptions: RequestInit = {
          method,
          headers,
          ...requestInit,
        };

        // Add body for non-GET requests
        if (body && method !== "GET") {
          requestOptions.body = JSON.stringify(body);
        }

        // Add timeout using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        requestOptions.signal = controller.signal;

        console.log(`🌐 API Request [${method}] ${url}`, {
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
          headers: this.sanitizeHeaders(headers),
          body: method !== "GET" ? body : undefined,
        });

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        // Handle different response statuses
        if (!response.ok) {
          if (response.status >= 500 && attempt < maxRetries) {
            // Server error - retry
            const delay = calculateBackoffDelay(attempt);
            console.warn(
              `⚠️ Server error ${response.status}, retrying in ${delay}ms...`,
            );
            await sleep(delay);
            continue;
          }

          // Client error or max retries reached
          const errorData = await response.json().catch(() => ({
            code: "UNKNOWN_ERROR",
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));

          throw new Error(
            `API Error ${response.status}: ${errorData.message || response.statusText}`,
          );
        }

        const data = await response.json();

        console.log(`✅ API Success [${method}] ${url}`, {
          status: response.status,
          data: this.sanitizeResponseData(data),
        });

        return data;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Error && error.name === "AbortError") {
          console.error(`⏱️ Request timeout after ${timeout}ms`);
          throw new Error(`Request timeout after ${timeout}ms`);
        }

        if (attempt < maxRetries) {
          const delay = calculateBackoffDelay(attempt);
          console.warn(`⚠️ Request failed, retrying in ${delay}ms...`, error);
          await sleep(delay);
          continue;
        }

        console.error(
          `❌ API Request failed after ${attempt + 1} attempts:`,
          error,
        );
        throw lastError;
      }
    }

    throw lastError!;
  }

  private sanitizeHeaders(
    headers: Record<string, string>,
  ): Record<string, string> {
    const sanitized = { ...headers };
    if (sanitized["Authorization"]) {
      sanitized["Authorization"] = "Bearer [REDACTED]";
    }
    if (sanitized["X-API-KEY"]) {
      sanitized["X-API-KEY"] = "[REDACTED]";
    }
    return sanitized;
  }

  private sanitizeResponseData(data: any): any {
    if (!data || typeof data !== "object") return data;

    const sanitized = { ...data };
    if (sanitized.token) sanitized.token = "[REDACTED]";
    if (sanitized.apiKey) sanitized.apiKey = "[REDACTED]";
    if (sanitized.password) sanitized.password = "[REDACTED]";

    return sanitized;
  }

  // Public API methods
  async get<T = any>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("GET", endpoint, undefined, config);
  }

  async post<T = any>(
    endpoint: string,
    body?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("POST", endpoint, body, config);
  }

  async put<T = any>(
    endpoint: string,
    body?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("PUT", endpoint, body, config);
  }

  async patch<T = any>(
    endpoint: string,
    body?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("PATCH", endpoint, body, config);
  }

  async del<T = any>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("DELETE", endpoint, undefined, config);
  }

  // Utility methods
  getBaseUrl(): string {
    return this.baseUrl;
  }

  getMode(): string {
    return this.mode;
  }

  isConfigured(): boolean {
    return !!(this.baseUrl && (this.apiKey || this.mode === "mock"));
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get("health", {
        skipAuth: true,
        maxRetries: 1,
      });
      return response.success;
    } catch (error) {
      console.warn("Health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export utility functions
export { generateRequestId, formatDateISO };

// Export types
export type { ApiResponse, ApiError, RequestConfig };
