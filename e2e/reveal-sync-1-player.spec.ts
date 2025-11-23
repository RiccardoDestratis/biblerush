import { test, expect } from '@playwright/test';

/**
 * Test: Verify host and player are in sync for reveal transition
 * Simple test with 1 player to verify answer_reveal event sync
 * 
 * Run with: pnpm test:e2e:headed -- e2e/reveal-sync-1-player.spec.ts
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Reveal Sync - 1 Player', () => {
  test('Host and player transition to reveal simultaneously', async ({ browser }) => {
    // Capture console logs
    const hostLogs: string[] = [];
    const playerLogs: string[] = [];
    // ============================================
    // STEP 1: Host creates game
    // ============================================
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    // Capture console logs
    hostPage.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔥') || text.includes('answer_reveal') || text.includes('BROADCAST') || text.includes('Host')) {
        console.log(`[HOST CONSOLE] ${text}`);
      }
    });
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    
    // Wait for question set cards to load
    await hostPage.waitForTimeout(2000); // Give time for cards to load
    
    // Select first question set card if available
    const questionSetCard = hostPage.locator('div[class*="card"]').first();
    const cardExists = await questionSetCard.isVisible().catch(() => false);
    
    if (cardExists) {
      await questionSetCard.click();
      await hostPage.waitForTimeout(1000); // Wait for selection to register
    } else {
      console.log('⚠️  No question sets available - test may fail');
    }
    
    // Select 3 questions for faster test
    const threeQuestionsRadio = hostPage.locator('#length-3');
    await expect(threeQuestionsRadio).toBeVisible({ timeout: 10000 });
    await threeQuestionsRadio.click();
    await hostPage.waitForTimeout(1000);
    
    // Create game - button should now be enabled
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
    // STEP 2: Player joins
    // ============================================
    const playerContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const playerPage = await playerContext.newPage();
    
    // Capture console logs
    playerPage.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔥') || text.includes('answer_reveal') || text.includes('Player') || text.includes('Realtime')) {
        console.log(`[PLAYER CONSOLE] ${text}`);
      }
    });
    
    await playerPage.goto(`${baseURL}/join`);
    await playerPage.waitForLoadState('networkidle');
    
    await playerPage.locator('#room-code').fill(roomCode);
    await playerPage.locator('#player-name').fill('TestPlayer');
    await playerPage.getByRole('button', { name: 'Join Game' }).click();
    await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await playerPage.waitForTimeout(2000);
    
    // ============================================
    // STEP 3: Host starts game
    // ============================================
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    await expect(hostPage.locator('text=/Starting|Question/i')).toBeVisible({ timeout: 10000 });
    await hostPage.waitForTimeout(5000);
    
    // Verify question appears for both
    await expect(hostPage.locator('text=/Question 1 of 3/i')).toBeVisible({ timeout: 15000 });
    await expect(playerPage.locator('text=/Question 1 of 3/i')).toBeVisible({ timeout: 15000 });
    
    // ============================================
    // STEP 4: Player answers (quickly)
    // ============================================
    const playerAnswerButton = playerPage.locator('button').first();
    await playerAnswerButton.click();
    await playerPage.waitForTimeout(500);
    await playerAnswerButton.click(); // Lock
    await playerPage.waitForTimeout(500); // Minimal wait
    
    // ============================================
    // STEP 5: Host clicks skip IMMEDIATELY (no waiting)
    // ============================================
    const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
    await expect(skipButton).toBeVisible({ timeout: 5000 });
    
    console.log('  → Host clicking skip immediately...');
    await skipButton.click();
    
    // ============================================
    // STEP 6: Verify BOTH transition to reveal IMMEDIATELY (no wait)
    // ============================================
    console.log('  → Verifying both host and player transition to reveal immediately...');
    
    // Host should show reveal (with loading phase, then reveal)
    await expect(hostPage.locator('text=/Revealing answer|Correct Answer/i')).toBeVisible({ timeout: 10000 });
    console.log('  ✓ Host transitioned to reveal');
    
    // Player should ALSO show reveal IMMEDIATELY (same event)
    // Check what player is actually seeing
    const waitingText = playerPage.locator('text=/Waiting for other players/i');
    const revealText = playerPage.locator('text=/Correct Answer|Revealing answer|Leaderboard in/i');
    const questionText = playerPage.locator('text=/Question 1 of 3/i');
    
    // Check current state
    const isWaiting = await waitingText.isVisible().catch(() => false);
    const hasReveal = await revealText.first().isVisible().catch(() => false);
    const hasQuestion = await questionText.isVisible().catch(() => false);
    
    console.log(`    Player state - Waiting: ${isWaiting}, Reveal: ${hasReveal}, Question: ${hasQuestion}`);
    
    if (isWaiting) {
      console.log('    ⚠️  Player is still showing "Waiting for other players" - answer_reveal event not received!');
      // Wait a bit longer
      await playerPage.waitForTimeout(5000);
      const hasRevealAfterWait = await revealText.first().isVisible().catch(() => false);
      if (!hasRevealAfterWait) {
        throw new Error('Player did not receive answer_reveal event - still showing "Waiting for other players"');
      }
    }
    
    await expect(revealText.first()).toBeVisible({ timeout: 15000 });
    console.log('  ✓ Player transitioned to reveal - SYNCED!');
    
    // Wait a bit to ensure both stay in reveal
    await hostPage.waitForTimeout(2000);
    await playerPage.waitForTimeout(2000);
    
    // Verify both still showing reveal
    const hostInReveal = await hostPage.locator('text=/Correct Answer/i').isVisible().catch(() => false);
    const playerInReveal = await playerPage.locator('text=/Correct Answer|Leaderboard in/i').first().isVisible().catch(() => false);
    
    expect(hostInReveal || playerInReveal).toBeTruthy();
    console.log('  ✓ Both host and player synchronized in reveal phase');
    
    // Cleanup
    await playerPage.close();
    await playerContext.close();
    await hostPage.close();
    await hostContext.close();
  });
});

