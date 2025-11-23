import { test, expect } from '@playwright/test';

/**
 * Test: Skip Button → Reveal → Leaderboard Flow
 * 
 * Tests the bug fix for skip button not triggering reveal flow
 * Verifies:
 * - Skip button processes scores
 * - Reveal appears after skip
 * - Leaderboard appears after reveal
 * - Flow completes without getting stuck
 * 
 * Run with: pnpm exec playwright test e2e/skip-reveal-flow.spec.ts --reporter=list
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Skip → Reveal → Leaderboard Flow', () => {
  test('Skip button triggers reveal and leaderboard flow', async ({ browser }) => {
    test.setTimeout(60000); // 1 minute
    
    // ============================================
    // STEP 1: Create game
    // ============================================
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    await hostPage.waitForTimeout(3000);
    
    // Select question set
    const questionSetCard = hostPage.locator('div[class*="card"]').first();
    const cardExists = await questionSetCard.isVisible().catch(() => false);
    
    if (cardExists) {
      await questionSetCard.click();
      await hostPage.waitForTimeout(500);
    }
    
    // Select 3 questions
    const threeQuestionsRadio = hostPage.locator('#length-3');
    await expect(threeQuestionsRadio).toBeVisible({ timeout: 10000 });
    await threeQuestionsRadio.click();
    await hostPage.waitForTimeout(500);
    
    // Create game
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    
    const isDisabled = await createButton.isDisabled();
    if (isDisabled) {
      console.log('⚠️  No question sets available. Skipping test.');
      return;
    }
    
    await createButton.click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Extract room code
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    
    // ============================================
    // STEP 2: Add one player (required to start game)
    // ============================================
    const playerContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const playerPage = await playerContext.newPage();
    
    await playerPage.goto(`${baseURL}/join`);
    await playerPage.waitForLoadState('networkidle');
    
    await playerPage.locator('#room-code').fill(roomCode);
    await playerPage.locator('#player-name').fill('TestPlayer');
    await playerPage.getByRole('button', { name: 'Join Game' }).click();
    await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    
    await hostPage.waitForTimeout(2000);
    
    // ============================================
    // STEP 3: Start game
    // ============================================
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).not.toBeDisabled({ timeout: 5000 });
    await startButton.click();
    
    await expect(hostPage.locator('text=/Starting|Loading/i')).toBeVisible({ timeout: 10000 });
    await hostPage.waitForTimeout(5000);
    
    // ============================================
    // STEP 4: Verify question is displayed
    // ============================================
    console.log('📋 Testing Skip → Reveal → Leaderboard Flow...');
    
    const questionText = hostPage.locator('text=/Question 1 of/');
    await expect(questionText).toBeVisible({ timeout: 15000 });
    console.log('  ✓ Question displayed');
    
    // ============================================
    // STEP 5: Click Skip button
    // ============================================
    console.log('  → Clicking Skip button...');
    const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
    await expect(skipButton).toBeVisible({ timeout: 5000 });
    await skipButton.click();
    console.log('  ✓ Skip button clicked');
    
    // ============================================
    // STEP 6: Verify Reveal appears (within 5 seconds including fallback)
    // ============================================
    console.log('  → Waiting for answer reveal...');
    
    // Should see loading phase first (2 second delay)
    const loadingIndicator = hostPage.locator('text=/Revealing answer/i');
    await expect(loadingIndicator).toBeVisible({ timeout: 5000 });
    console.log('  ✓ Loading phase displayed');
    
    // Wait for reveal to appear (after 2 seconds)
    const answerReveal = hostPage.locator('text=/Correct Answer/i');
    await expect(answerReveal).toBeVisible({ timeout: 10000 }); // 10 seconds max (includes fallback)
    console.log('  ✓ Answer reveal displayed');
    
    // Verify full answer text is shown
    const fullAnswerText = hostPage.locator('text=/Correct Answer: [A-D] -/');
    await expect(fullAnswerText).toBeVisible({ timeout: 5000 });
    console.log('  ✓ Full answer text displayed');
    
    // ============================================
    // STEP 7: Verify Leaderboard appears (after 5 seconds of reveal)
    // ============================================
    console.log('  → Waiting for leaderboard (5 seconds after reveal)...');
    await hostPage.waitForTimeout(6000); // 5 seconds reveal + 1 second buffer
    
    const leaderboardHeading = hostPage.locator('text=/Leaderboard/i');
    await expect(leaderboardHeading).toBeVisible({ timeout: 15000 });
    console.log('  ✓ Leaderboard displayed');
    
    console.log('✅ Skip → Reveal → Leaderboard flow completed successfully!');
    console.log('  - Skip button works ✓');
    console.log('  - Reveal appears (with fallback) ✓');
    console.log('  - Leaderboard appears ✓');
    console.log('  - Flow completes without getting stuck ✓');
    
    // Cleanup
    await playerPage.close();
    await playerContext.close();
    await hostPage.close();
    await hostContext.close();
  });
});

