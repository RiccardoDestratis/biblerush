import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Question Set Card Sizes', () => {
  test('All question set cards should have the same height', async ({ page }) => {
    await page.goto(`${baseURL}/create`);
    
    // Wait for page to load and question sets to be visible
    await page.waitForLoadState('networkidle');
    
    // Wait for cards to be visible (they might be loading)
    const firstCard = page.locator('[data-testid="question-set-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    
    // Get all question set cards
    const cards = page.locator('[data-testid="question-set-card"]');
    const cardCount = await cards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    // Get heights of all cards
    const heights: number[] = [];
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const boundingBox = await card.boundingBox();
      if (boundingBox) {
        heights.push(boundingBox.height);
        console.log(`Card ${i + 1} height: ${boundingBox.height}px`);
      }
    }
    
    // All heights should be the same (within 3px tolerance for rounding/transform differences)
    if (heights.length > 1) {
      const firstHeight = heights[0];
      for (let i = 1; i < heights.length; i++) {
        const heightDiff = Math.abs(heights[i] - firstHeight);
        expect(heightDiff).toBeLessThanOrEqual(3);
      }
    }
    
    // Log all heights for debugging
    console.log('All card heights:', heights);
  });
});

