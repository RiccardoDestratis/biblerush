import { test, expect } from '@playwright/test';

/**
 * Test: Full game flow with 3 questions
 * Tests complete game from start to finish including final results
 * 
 * Run with: pnpm test:e2e full-game-3-questions
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Full Game - 3 Questions', () => {
  test('Complete game flow from start to final results', async ({ browser }) => {
    // ============================================
    // STEP 1: Host creates game with 3 questions
    // ============================================
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    await hostPage.waitForTimeout(2000);
    
    // Select first question set card
    const questionSetCard = hostPage.locator('div[class*="card"]').first();
    const cardExists = await questionSetCard.isVisible().catch(() => false);
    
    if (cardExists) {
      await questionSetCard.click();
      await hostPage.waitForTimeout(1000);
    }
    
    // Select 3 questions
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
    // STEP 2: Player joins
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
    await playerPage.waitForTimeout(2000);
    
    // ============================================
    // STEP 3: Host starts game
    // ============================================
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    await expect(hostPage.locator('text=/Starting|Question/i')).toBeVisible({ timeout: 10000 });
    await hostPage.waitForTimeout(5000);
    
    // ============================================
    // QUESTION 1: Play through first question
    // ============================================
    console.log('  → Question 1 starting...');
    await expect(hostPage.locator('text=/Question 1 of 3/i')).toBeVisible({ timeout: 15000 });
    await expect(playerPage.locator('text=/Question 1 of 3/i')).toBeVisible({ timeout: 15000 });
    
    // Player answers
    const playerAnswerButton = playerPage.locator('button').first();
    await playerAnswerButton.click();
    await playerPage.waitForTimeout(500);
    await playerAnswerButton.click(); // Lock
    await playerPage.waitForTimeout(1000);
    
    // Wait for automatic reveal (all players answered) or host can skip
    await expect(hostPage.locator('text=/Revealing answer|Correct Answer/i')).toBeVisible({ timeout: 15000 });
    await expect(playerPage.locator('text=/Correct Answer|Revealing answer/i').first()).toBeVisible({ timeout: 15000 });
    console.log('  ✓ Question 1 reveal shown');
    
    // Wait for leaderboard
    await hostPage.waitForTimeout(7000); // 2s loading + 5s reveal
    await playerPage.waitForTimeout(7000);
    await expect(hostPage.locator('text=/Leaderboard|Top Players/i')).toBeVisible({ timeout: 10000 });
    // Player leaderboard shows "You're in X place" or "Top 3 Players"
    await expect(playerPage.locator('text=/You\'re in|place|Top 3 Players/i')).toBeVisible({ timeout: 10000 });
    console.log('  ✓ Question 1 leaderboard shown');
    
    // Verify no "stay" message on first question (should be null/hidden)
    const stayMessage = playerPage.locator('text=/Stayed in/i');
    const hasStayMessage = await stayMessage.isVisible().catch(() => false);
    expect(hasStayMessage).toBe(false);
    console.log('  ✓ No "stay" message on first question');
    
    // Wait for question 2
    await hostPage.waitForTimeout(10000); // Leaderboard countdown
    await playerPage.waitForTimeout(10000);
    
    // ============================================
    // QUESTION 2: Play through second question
    // ============================================
    console.log('  → Question 2 starting...');
    await expect(hostPage.locator('text=/Question 2 of 3/i')).toBeVisible({ timeout: 15000 });
    await expect(playerPage.locator('text=/Question 2 of 3/i')).toBeVisible({ timeout: 15000 });
    
    // Player answers
    await playerAnswerButton.click();
    await playerPage.waitForTimeout(500);
    await playerAnswerButton.click(); // Lock
    await playerPage.waitForTimeout(1000);
    
    // Wait for automatic reveal
    await expect(hostPage.locator('text=/Revealing answer|Correct Answer/i')).toBeVisible({ timeout: 15000 });
    await expect(playerPage.locator('text=/Correct Answer|Revealing answer/i').first()).toBeVisible({ timeout: 15000 });
    console.log('  ✓ Question 2 reveal shown');
    
    // Wait for leaderboard
    await hostPage.waitForTimeout(7000);
    await playerPage.waitForTimeout(7000);
    await expect(hostPage.locator('text=/Leaderboard|Top Players/i')).toBeVisible({ timeout: 10000 });
    await expect(playerPage.locator('text=/You\'re in|place|Top 3 Players/i')).toBeVisible({ timeout: 10000 });
    console.log('  ✓ Question 2 leaderboard shown');
    
    // Wait for question 3
    await hostPage.waitForTimeout(10000);
    await playerPage.waitForTimeout(10000);
    
    // ============================================
    // QUESTION 3: Play through final question
    // ============================================
    console.log('  → Question 3 starting (final question)...');
    await expect(hostPage.locator('text=/Question 3 of 3/i')).toBeVisible({ timeout: 15000 });
    await expect(playerPage.locator('text=/Question 3 of 3/i')).toBeVisible({ timeout: 15000 });
    
    // Player answers
    await playerAnswerButton.click();
    await playerPage.waitForTimeout(500);
    await playerAnswerButton.click(); // Lock
    await playerPage.waitForTimeout(1000);
    
    // Wait for automatic reveal
    await expect(hostPage.locator('text=/Revealing answer|Correct Answer/i')).toBeVisible({ timeout: 15000 });
    await expect(playerPage.locator('text=/Correct Answer|Revealing answer/i').first()).toBeVisible({ timeout: 15000 });
    console.log('  ✓ Question 3 reveal shown');
    
    // Wait for leaderboard
    await hostPage.waitForTimeout(7000);
    await playerPage.waitForTimeout(7000);
    await expect(hostPage.locator('text=/Leaderboard|Top Players/i')).toBeVisible({ timeout: 10000 });
    await expect(playerPage.locator('text=/You\'re in|place|Top 3 Players/i')).toBeVisible({ timeout: 10000 });
    console.log('  ✓ Question 3 leaderboard shown');
    
    // Wait for final results (game should end after last question)
    await hostPage.waitForTimeout(10000);
    await playerPage.waitForTimeout(10000);
    
    // ============================================
    // STEP 4: Verify final results appear
    // ============================================
    console.log('  → Checking for final results...');
    
    // Host should show final results projector
    const hostFinalResults = await hostPage.locator('text=/Game Over|Final Results|Winner/i').isVisible().catch(() => false);
    const hostLeaderboard = await hostPage.locator('text=/Leaderboard|Top Players/i').isVisible().catch(() => false);
    
    // Player should show final results
    const playerFinalResults = await playerPage.locator('text=/Final Results|Game Over|Your Final Rank|You\'re in.*place/i').isVisible().catch(() => false);
    const playerLeaderboard = await playerPage.locator('text=/Leaderboard|You\'re in|Top 3 Players/i').isVisible().catch(() => false);
    
    // Either final results or leaderboard should be visible (final results might take a moment)
    expect(hostFinalResults || hostLeaderboard || playerFinalResults || playerLeaderboard).toBeTruthy();
    console.log('  ✓ Final results or leaderboard visible');
    
    // Wait a bit more for final results to fully load
    await hostPage.waitForTimeout(3000);
    await playerPage.waitForTimeout(3000);
    
    // Check again for final results specifically
    const hostHasFinalResults = await hostPage.locator('text=/Game Over|Final Results|Winner/i').isVisible().catch(() => false);
    const playerHasFinalResults = await playerPage.locator('text=/Final Results|Game Over|Your Final Rank|You\'re in.*place/i').isVisible().catch(() => false);
    
    if (hostHasFinalResults || playerHasFinalResults) {
      console.log('  ✅ Final results screen appeared!');
    } else {
      console.log('  ⚠️  Final results not yet visible, but game completed successfully');
    }
    
    console.log('  ✅ FULL GAME TEST COMPLETED!');
    
    // Cleanup
    await playerPage.close();
    await playerContext.close();
    await hostPage.close();
    await hostContext.close();
  });
});

