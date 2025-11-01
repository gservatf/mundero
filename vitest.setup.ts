// vitest.setup.ts - Test environment setup
import { vi } from "vitest";

// Mock browser APIs that might be missing in test environment
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(window, "navigator", {
  value: {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    language: "en-US",
    languages: ["en-US", "en"],
    platform: "Win32",
    cookieEnabled: true,
    onLine: true,
    clipboard: {
      writeText: vi.fn(),
      readText: vi.fn(),
    },
    geolocation: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL constructor for environments that don't support it
if (!global.URL) {
  global.URL = class URL {
    constructor(public href: string, base?: string) {
      if (base) {
        this.href = new URL(href, base).href;
      }
    }
    toString() {
      return this.href;
    }
  } as any;
}

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = vi.fn();
}

// Suppress console warnings in tests unless explicitly needed
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = vi.fn((message, ...args) => {
  // Only show warnings that are actually important for tests
  if (
    !message?.includes?.("React Hook") &&
    !message?.includes?.("validateDOMNesting") &&
    !message?.includes?.("Warning: ")
  ) {
    originalConsoleWarn(message, ...args);
  }
});

console.error = vi.fn((message, ...args) => {
  // Only show errors that are actually important for tests
  if (
    !message?.includes?.("Warning: ") &&
    !message?.includes?.("The above error occurred")
  ) {
    originalConsoleError(message, ...args);
  }
});