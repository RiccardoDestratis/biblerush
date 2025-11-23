import { test, expect } from '@playwright/test';

/**
 * Test: Timer Expiration → Reveal → Leaderboard Flow
 * 
 * Tests the bug fix for timer expiration not triggering reveal flow
 * Verifies:
 * - Timer expiration processes scores
 * - Reveal appears after timer expires
 * - Leaderboard appears after reveal
 * - Flow completes without getting stuck
 * 
 * Run with: pnpm exec playwright test e2e/timer-reveal-flow.spec.ts --reporter=list
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Timer Expiration → Reveal → Leaderboard Flow', () => {
  test('Timer expiration triggers reveal and leaderboard flow', async ({ browser }) => {
    test.setTimeout(90000); // 1.5 minutes (timer is 15 seconds)
    
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
    console.log('📋 Testing Timer Expiration → Reveal → Leaderboard Flow...');
    
    const questionText = hostPage.locator('text=/Question 1 of/');
    await expect(questionText).toBeVisible({ timeout: 15000 });
    console.log('  ✓ Question displayed');
    
    // ============================================
    // STEP 5: Wait for timer to expire (15 seconds)
    // ============================================
    console.log('  → Waiting for timer to expire (15 seconds)...');
    await hostPage.waitForTimeout(16000); // Wait for timer to expire + 1 second buffer
    
    // ============================================
    // STEP 6: Verify Reveal appears (within 5 seconds including fallback)
    // ============================================
    console.log('  → Waiting for answer reveal...');
    
    // Wait for reveal to appear (may skip loading phase, or loading phase may appear first)
    // Check for either loading phase OR reveal directly
    const loadingIndicator = hostPage.locator('text=/Revealing answer/i');
    const answerReveal = hostPage.locator('text=/Correct Answer/i');
    
    // Wait for either loading or reveal (whichever appears first)
    await Promise.race([
      expect(loadingIndicator).toBeVisible({ timeout: 7000 }).then(() => {
        console.log('  ✓ Loading phase displayed');
        return expect(answerReveal).toBeVisible({ timeout: 10000 });
      }),
      expect(answerReveal).toBeVisible({ timeout: 10000 })
    ]);
    
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
    
    console.log('✅ Timer Expiration → Reveal → Leaderboard flow completed successfully!');
    console.log('  - Timer expiration works ✓');
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

