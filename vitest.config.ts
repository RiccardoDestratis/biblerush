import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"], // Only match .test.ts files (Vitest convention)
    exclude: ["node_modules", "e2e/**", "test-results", ".next", "**/*.spec.ts"], // Exclude Playwright .spec.ts files
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

