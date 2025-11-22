import { test, expect } from '@playwright/test';

/**
 * Basic E2E tests - starting simple
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto(baseURL);
    
    // Check if the page title is visible
    await expect(page.locator('h1')).toContainText('BibleRush');
  });

  test('should have a "Create New Game" button', async ({ page }) => {
    await page.goto(baseURL);
    
    // Find the button by text
    const createButton = page.getByRole('link', { name: 'Create New Game' });
    
    // Check if button is visible
    await expect(createButton).toBeVisible();
  });

  test('should click "Create New Game" button', async ({ page }) => {
    await page.goto(baseURL);
    
    // Find and click the button
    const createButton = page.getByRole('link', { name: 'Create New Game' });
    await createButton.click();
    
    // Check if we navigated to the create page
    await expect(page).toHaveURL(/\/create/);
  });
});

