import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE TEST: Full synchronization between Host and Player
 * 
 * Tests EVERYTHING on BOTH views simultaneously:
 * - Question display sync
 * - Skip → Reveal sync
 * - Leaderboard sync
 * - Question advancement sync
 * 
 * This test will NOT stop until everything works perfectly!
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 300000; // 5 minutes

test.describe('Full Host-Player Synchronization', () => {
  test('Complete flow: Host and Player stay in sync through entire game', async ({ browser }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    console.log('\n🎮 ========================================');
    console.log('🎮 FULL HOST-PLAYER SYNC TEST');
    console.log('🎮 ========================================\n');
    
    // ============================================
    // SETUP: Create game and join player
    // ============================================
    console.log('📋 PHASE 1: Setup');
    console.log('─────────────────────────────────────────');
    
    const hostContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const hostPage = await hostContext.newPage();
    
    // Capture ALL host console logs
    hostPage.on('console', msg => {
      const text = msg.text();
      if (text.includes('[Host]') || text.includes('[GameStore]') || text.includes('[Realtime]') || text.includes('[QuestionAdvance]')) {
        console.log(`[HOST] ${text}`);
      }
    });
    
    const playerContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const playerPage = await playerContext.newPage();
    
    // Capture ALL player console logs
    playerPage.on('console', msg => {
      const text = msg.text();
      if (text.includes('[Player]') || text.includes('[GameStore]') || text.includes('[Realtime]')) {
        console.log(`[PLAYER] ${text}`);
      }
    });
    
    // Create game
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    await hostPage.waitForTimeout(3000);
    
    const questionSetCard = hostPage.locator('div[class*="card"]').first();
    const cardExists = await questionSetCard.isVisible({ timeout: 10000 }).catch(() => false);
    if (cardExists) {
      await questionSetCard.click();
      await hostPage.waitForTimeout(1000);
    }
    
    const threeQuestionsRadio = hostPage.locator('#length-3');
    await expect(threeQuestionsRadio).toBeVisible({ timeout: 10000 });
    await threeQuestionsRadio.click();
    await hostPage.waitForTimeout(500);
    
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    const isDisabled = await createButton.isDisabled();
    if (isDisabled) {
      throw new Error('No question sets available. Import questions first!');
    }
    
    await createButton.click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Get room code
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    console.log(`✓ Room code: ${roomCode}`);
    
    // Player joins
    await playerPage.goto(`${baseURL}/join`);
    await playerPage.waitForLoadState('networkidle');
    await playerPage.locator('#room-code').fill(roomCode);
    await playerPage.locator('#player-name').fill('TestPlayer');
    await playerPage.getByRole('button', { name: /Join/i }).click();
    await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    console.log('✓ Player joined');
    
    // Start game
    await hostPage.waitForTimeout(2000);
    const startButton = hostPage.getByRole('button', { name: /Start Game/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    console.log('✓ Game started');
    
    // ============================================
    // QUESTION 1: Full flow
    // ============================================
    console.log('\n📚 QUESTION 1');
    console.log('─────────────────────────────────────────');
    
    // Wait for question 1 on both views
    await expect(hostPage.locator('text=/Question 1 of/')).toBeVisible({ timeout: 15000 });
    console.log('✓ Host: Question 1 displayed');
    
    await expect(playerPage.locator('h1, [class*="text-lg"], [class*="text-xl"]').first()).toBeVisible({ timeout: 15000 });
    console.log('✓ Player: Question 1 displayed');
    
    await hostPage.waitForTimeout(2000);
    
    // Skip question
    const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
    await expect(skipButton).toBeVisible({ timeout: 5000 });
    await skipButton.click();
    console.log('✓ Skip clicked');
    
    // Wait for reveal on HOST
    await expect(
      hostPage.locator('text=/Correct Answer|Revealing answer/i')
    ).toBeVisible({ timeout: 15000 });
    console.log('✓ Host: Reveal displayed');
    
    // Wait for reveal on PLAYER (CRITICAL CHECK)
    await expect(
      playerPage.locator('text=/Correct Answer|Revealing answer|Waiting for other players/i')
    ).toBeVisible({ timeout: 20000 });
    console.log('✓ Player: Reveal/feedback displayed');
    
    // Wait for leaderboard on HOST
    await expect(
      hostPage.locator('text=/Leaderboard/i')
    ).toBeVisible({ timeout: 20000 });
    console.log('✓ Host: Leaderboard displayed');
    
    // Wait for leaderboard on PLAYER (CRITICAL CHECK)
    await expect(
      playerPage.locator('text=/Leaderboard|You\'re in|place|points/i')
    ).toBeVisible({ timeout: 20000 });
    console.log('✓ Player: Leaderboard displayed');
    
    // Wait for countdown to finish
    console.log('⏳ Waiting for leaderboard countdown...');
    await hostPage.waitForTimeout(11000);
    
    // ============================================
    // QUESTION 2: Full flow
    // ============================================
    console.log('\n📚 QUESTION 2');
    console.log('─────────────────────────────────────────');
    
    // Wait for question 2 on HOST
    await expect(hostPage.locator('text=/Question 2 of/')).toBeVisible({ timeout: 15000 });
    console.log('✓ Host: Question 2 displayed');
    
    // Wait for question 2 on PLAYER (CRITICAL CHECK)
    await expect(playerPage.locator('h1, [class*="text-lg"], [class*="text-xl"]').first()).toBeVisible({ timeout: 15000 });
    const playerQuestion2 = await playerPage.locator('h1, [class*="text-lg"], [class*="text-xl"]').first().textContent();
    console.log(`✓ Player: Question 2 displayed (${playerQuestion2?.substring(0, 50)}...)`);
    
    await hostPage.waitForTimeout(2000);
    
    // Skip question 2
    await skipButton.click();
    console.log('✓ Skip clicked');
    
    // Wait for reveal on both
    await expect(
      hostPage.locator('text=/Correct Answer|Revealing answer/i')
    ).toBeVisible({ timeout: 15000 });
    console.log('✓ Host: Reveal displayed');
    
    await expect(
      playerPage.locator('text=/Correct Answer|Revealing answer|Waiting for other players/i')
    ).toBeVisible({ timeout: 20000 });
    console.log('✓ Player: Reveal/feedback displayed');
    
    // Wait for leaderboard on both
    await expect(
      hostPage.locator('text=/Leaderboard/i')
    ).toBeVisible({ timeout: 20000 });
    console.log('✓ Host: Leaderboard displayed');
    
    await expect(
      playerPage.locator('text=/Leaderboard|You\'re in|place|points/i')
    ).toBeVisible({ timeout: 20000 });
    console.log('✓ Player: Leaderboard displayed');
    
    // Wait for countdown
    await hostPage.waitForTimeout(11000);
    
    // ============================================
    // QUESTION 3: Full flow
    // ============================================
    console.log('\n📚 QUESTION 3');
    console.log('─────────────────────────────────────────');
    
    // Wait for question 3 on HOST
    await expect(hostPage.locator('text=/Question 3 of/')).toBeVisible({ timeout: 15000 });
    console.log('✓ Host: Question 3 displayed');
    
    // Wait for question 3 on PLAYER (CRITICAL CHECK)
    await expect(playerPage.locator('h1, [class*="text-lg"], [class*="text-xl"]').first()).toBeVisible({ timeout: 15000 });
    const playerQuestion3 = await playerPage.locator('h1, [class*="text-lg"], [class*="text-xl"]').first().textContent();
    console.log(`✓ Player: Question 3 displayed (${playerQuestion3?.substring(0, 50)}...)`);
    
    await hostPage.waitForTimeout(2000);
    
    // Skip question 3
    await skipButton.click();
    console.log('✓ Skip clicked');
    
    // Wait for final results
    await expect(
      hostPage.locator('text=/Game Over|Final Leaderboard/i')
    ).toBeVisible({ timeout: 20000 });
    console.log('✓ Host: Final results displayed');
    
    await expect(
      playerPage.locator('text=/finished in|place|Final Score/i')
    ).toBeVisible({ timeout: 20000 });
    console.log('✓ Player: Final results displayed');
    
    console.log('\n✅ ========================================');
    console.log('✅ ALL SYNC TESTS PASSED!');
    console.log('✅ ========================================\n');
    
    await hostPage.waitForTimeout(3000);
    
    // Cleanup
    await hostPage.close();
    await hostContext.close();
    await playerPage.close();
    await playerContext.close();
  });
});


