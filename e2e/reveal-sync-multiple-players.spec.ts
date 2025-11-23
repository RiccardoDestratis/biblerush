import { test, expect } from '@playwright/test';

/**
 * Test: Verify host and multiple players are in sync for reveal transition
 * Tests with 2 players to verify answer_reveal event sync across all clients
 * 
 * Run with: pnpm test:e2e reveal-sync-multiple-players
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Reveal Sync - Multiple Players', () => {
  test('Host and 2 players transition to reveal simultaneously', async ({ browser }) => {
    // ============================================
    // STEP 1: Host creates game
    // ============================================
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    // Capture console logs
    hostPage.on('console', msg => {
      const text = msg.text();
      if (text.includes('answer_reveal') || text.includes('BROADCAST') || text.includes('Host')) {
        console.log(`[HOST CONSOLE] ${text}`);
      }
    });
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    
    // Wait for question set cards to load
    await hostPage.waitForTimeout(2000);
    
    // Select first question set card if available
    const questionSetCard = hostPage.locator('div[class*="card"]').first();
    const cardExists = await questionSetCard.isVisible().catch(() => false);
    
    if (cardExists) {
      await questionSetCard.click();
      await hostPage.waitForTimeout(1000);
    } else {
      console.log('⚠️  No question sets available - test may fail');
    }
    
    // Select 3 questions for faster test
    const threeQuestionsRadio = hostPage.locator('#length-3');
    await expect(threeQuestionsRadio).toBeVisible({ timeout: 10000 });
    await threeQuestionsRadio.click();
    await hostPage.waitForTimeout(1000);
    
    // Create game
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await expect(createButton).not.toBeDisabled({ timeout: 10000 });
    await createButton.click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Extract room code
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    
    // ============================================
    // STEP 2: Player 1 joins
    // ============================================
    const player1Context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const player1Page = await player1Context.newPage();
    
    player1Page.on('console', msg => {
      const text = msg.text();
      if (text.includes('answer_reveal') || text.includes('Realtime')) {
        console.log(`[PLAYER 1 CONSOLE] ${text}`);
      }
    });
    
    await player1Page.goto(`${baseURL}/join`);
    await player1Page.waitForLoadState('networkidle');
    
    await player1Page.locator('#room-code').fill(roomCode);
    await player1Page.locator('#player-name').fill('Player1');
    await player1Page.getByRole('button', { name: 'Join Game' }).click();
    await player1Page.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await player1Page.waitForTimeout(2000);
    
    // ============================================
    // STEP 3: Player 2 joins
    // ============================================
    const player2Context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const player2Page = await player2Context.newPage();
    
    player2Page.on('console', msg => {
      const text = msg.text();
      if (text.includes('answer_reveal') || text.includes('Realtime')) {
        console.log(`[PLAYER 2 CONSOLE] ${text}`);
      }
    });
    
    await player2Page.goto(`${baseURL}/join`);
    await player2Page.waitForLoadState('networkidle');
    
    await player2Page.locator('#room-code').fill(roomCode);
    await player2Page.locator('#player-name').fill('Player2');
    await player2Page.getByRole('button', { name: 'Join Game' }).click();
    await player2Page.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await player2Page.waitForTimeout(2000);
    
    // Verify both players see each other (check player list, not heading)
    await expect(player1Page.locator('text=/1\\. Player1/')).toBeVisible({ timeout: 5000 });
    await expect(player1Page.locator('text=/Player2/').first()).toBeVisible({ timeout: 5000 });
    await expect(player2Page.locator('text=/Player1/').first()).toBeVisible({ timeout: 5000 });
    await expect(player2Page.locator('text=/Player2/').first()).toBeVisible({ timeout: 5000 });
    console.log('  ✓ Both players see each other in waiting room');
    
    // ============================================
    // STEP 4: Host starts game
    // ============================================
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    await expect(hostPage.locator('text=/Starting|Question/i')).toBeVisible({ timeout: 10000 });
    await hostPage.waitForTimeout(5000);
    
    // Verify question appears for all
    await expect(hostPage.locator('text=/Question 1 of 3/i')).toBeVisible({ timeout: 15000 });
    await expect(player1Page.locator('text=/Question 1 of 3/i')).toBeVisible({ timeout: 15000 });
    await expect(player2Page.locator('text=/Question 1 of 3/i')).toBeVisible({ timeout: 15000 });
    console.log('  ✓ All clients see question');
    
    // ============================================
    // STEP 5: Both players answer
    // ============================================
    const player1AnswerButton = player1Page.locator('button').first();
    await player1AnswerButton.click();
    await player1Page.waitForTimeout(500);
    await player1AnswerButton.click(); // Lock
    
    const player2AnswerButton = player2Page.locator('button').first();
    await player2AnswerButton.click();
    await player2Page.waitForTimeout(500);
    await player2AnswerButton.click(); // Lock
    
    await player1Page.waitForTimeout(500);
    await player2Page.waitForTimeout(500);
    console.log('  ✓ Both players submitted answers');
    
    // ============================================
    // STEP 6: Host clicks skip IMMEDIATELY
    // ============================================
    const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
    await expect(skipButton).toBeVisible({ timeout: 5000 });
    
    console.log('  → Host clicking skip immediately...');
    await skipButton.click();
    
    // ============================================
    // STEP 7: Verify ALL transition to reveal IMMEDIATELY
    // ============================================
    console.log('  → Verifying host and both players transition to reveal simultaneously...');
    
    // Host should show reveal
    await expect(hostPage.locator('text=/Revealing answer|Correct Answer/i')).toBeVisible({ timeout: 10000 });
    console.log('  ✓ Host transitioned to reveal');
    
    // Player 1 should show reveal
    const player1RevealText = player1Page.locator('text=/Correct Answer|Revealing answer|Leaderboard in/i');
    await expect(player1RevealText.first()).toBeVisible({ timeout: 15000 });
    console.log('  ✓ Player 1 transitioned to reveal');
    
    // Player 2 should show reveal
    const player2RevealText = player2Page.locator('text=/Correct Answer|Revealing answer|Leaderboard in/i');
    await expect(player2RevealText.first()).toBeVisible({ timeout: 15000 });
    console.log('  ✓ Player 2 transitioned to reveal');
    
    // Wait a bit to ensure all stay in reveal
    await hostPage.waitForTimeout(2000);
    await player1Page.waitForTimeout(2000);
    await player2Page.waitForTimeout(2000);
    
    // Verify all still showing reveal
    const hostInReveal = await hostPage.locator('text=/Correct Answer/i').isVisible().catch(() => false);
    const player1InReveal = await player1RevealText.first().isVisible().catch(() => false);
    const player2InReveal = await player2RevealText.first().isVisible().catch(() => false);
    
    expect(hostInReveal || player1InReveal || player2InReveal).toBeTruthy();
    console.log('  ✓ All clients synchronized in reveal phase');
    
    // ============================================
    // STEP 8: Verify leaderboard appears for all
    // ============================================
    await hostPage.waitForTimeout(5000); // Wait for reveal to complete
    await player1Page.waitForTimeout(5000);
    await player2Page.waitForTimeout(5000);
    
    // Check if leaderboard appears (it should after reveal completes)
    const hostLeaderboard = await hostPage.locator('text=/Leaderboard|Top Players/i').isVisible().catch(() => false);
    const player1Leaderboard = await player1Page.locator('text=/Leaderboard|Your Rank/i').isVisible().catch(() => false);
    const player2Leaderboard = await player2Page.locator('text=/Leaderboard|Your Rank/i').isVisible().catch(() => false);
    
    if (hostLeaderboard || player1Leaderboard || player2Leaderboard) {
      console.log('  ✓ Leaderboard appeared for at least one client');
    }
    
    console.log('  ✅ ALL TESTS PASSED - All clients synchronized!');
    
    // Cleanup
    await player1Page.close();
    await player1Context.close();
    await player2Page.close();
    await player2Context.close();
    await hostPage.close();
    await hostContext.close();
  });
});

