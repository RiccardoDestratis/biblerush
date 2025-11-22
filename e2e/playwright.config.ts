import { defineConfig, devices } from '@playwright/test';

/**
 * Minimal Playwright configuration for BibleRush E2E tests
 */
export default defineConfig({
  testDir: './',
  testMatch: /.*\.spec\.ts$/, // Only match .spec.ts files (Playwright convention)
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 60000, // Global test timeout: 60 seconds (default is 30s)
  
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000, // Timeout for actions like click, fill, etc.
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
