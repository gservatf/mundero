import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts", "./src/test/setup.ts"],
    include: [
      "src/**/*.test.ts",
      "src/**/*.spec.ts",
      "src/**/*.test.tsx",
      "src/**/*.spec.tsx",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    // Allow tests to pass even if no test files are found
    passWithNoTests: true,
    // Increase timeout for CI environments
    testTimeout: 10000,
    // Disable console output during tests to reduce noise
    silent: false,
    // Handle test failures gracefully - 0 means don't bail
    bail: 0,
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
