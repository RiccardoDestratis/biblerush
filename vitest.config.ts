import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom", // Use jsdom for React component tests
    include: ["**/*.test.ts", "**/*.test.tsx"], // Only match .test.ts files (Vitest convention)
    exclude: ["node_modules", "e2e/**", "test-results", ".next", "**/*.spec.ts"], // Exclude Playwright .spec.ts files
    setupFiles: ["./vitest.setup.ts"], // Setup file for test configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test-results/",
        ".next/",
        "e2e/",
        "**/*.config.*",
        "**/types/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});

