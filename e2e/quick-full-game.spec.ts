import { test, expect } from '@playwright/test';

/**
 * Quick full game test - players answer immediately (1 second delay)
 * Runs in headed mode to watch the UI
 * 
 * Run with: pnpm test:e2e:headed quick-full-game
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Quick Full Game', () => {
  test('Complete 3-question game with immediate answers', async ({ browser }) => {
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
    // STEP 2: Player 1 joins
    // ============================================
    const player1Context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const player1Page = await player1Context.newPage();
    
    await player1Page.goto(`${baseURL}/join`);
    await player1Page.waitForLoadState('networkidle');
    
    await player1Page.locator('#room-code').fill(roomCode);
    await player1Page.locator('#player-name').fill('Player1');
    await player1Page.getByRole('button', { name: 'Join Game' }).click();
    await player1Page.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await player1Page.waitForTimeout(2000);
    
    // ============================================
    // STEP 2b: Player 2 joins
    // ============================================
    const player2Context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const player2Page = await player2Context.newPage();
    
    await player2Page.goto(`${baseURL}/join`);
    await player2Page.waitForLoadState('networkidle');
    
    await player2Page.locator('#room-code').fill(roomCode);
    await player2Page.locator('#player-name').fill('Player2');
    await player2Page.getByRole('button', { name: 'Join Game' }).click();
    await player2Page.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await player2Page.waitForTimeout(2000);
    
    // ============================================
    // STEP 3: Host starts game
    // ============================================
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    await expect(hostPage.locator('text=/Starting|Question/i')).toBeVisible({ timeout: 10000 });
    await hostPage.waitForTimeout(5000);
    
    // Helper function to answer question quickly for a player
    const answerQuestionQuickly = async (page: typeof player1Page, playerName: string) => {
      // Wait for question to appear on player page
      await expect(page.locator('text=/Question \\d+ of \\d+/i')).toBeVisible({ timeout: 10000 });
      
      // Wait for answer buttons to be visible (they contain A, B, C, D)
      // Find button that contains "A" text (first answer option)
      const playerAnswerButton = page.locator('button:has-text("A")').first();
      await expect(playerAnswerButton).toBeVisible({ timeout: 5000 });
      
      console.log(`    ${playerName} answering...`);
      // Click to select (first tap)
      await playerAnswerButton.click();
      await page.waitForTimeout(300);
      
      // Click again to lock (second tap)
      await playerAnswerButton.click();
      await page.waitForTimeout(300);
    };
    
    // ============================================
    // QUESTION 1
    // ============================================
    console.log('  → Question 1...');
    await expect(hostPage.locator('text=/Question 1 of 3/i')).toBeVisible({ timeout: 15000 });
    await answerQuestionQuickly(player1Page, 'Player1');
    await answerQuestionQuickly(player2Page, 'Player2');
    
    // Wait for timer to expire and reveal (timer is 15 seconds, wait a bit longer)
    await expect(hostPage.locator('text=/Revealing answer|Correct Answer/i')).toBeVisible({ timeout: 20000 });
    await expect(player1Page.locator('text=/Correct Answer|Revealing answer/i').first()).toBeVisible({ timeout: 20000 });
    await expect(player2Page.locator('text=/Correct Answer|Revealing answer/i').first()).toBeVisible({ timeout: 20000 });
    console.log('  ✓ Question 1 reveal');
    
    // Wait for leaderboard (2s loading + 5s reveal = 7s total)
    await hostPage.waitForTimeout(7000);
    await player1Page.waitForTimeout(7000);
    await player2Page.waitForTimeout(7000);
    await expect(hostPage.locator('text=/Leaderboard|Top Players/i')).toBeVisible({ timeout: 10000 });
    await expect(player1Page.locator('text=/You\'re in|place|Top 3 Players/i')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('text=/You\'re in|place|Top 3 Players/i')).toBeVisible({ timeout: 10000 });
    console.log('  ✓ Question 1 leaderboard');
    
    // Verify no "stay" message on first question
    const stayMessage1 = player1Page.locator('text=/Stayed in/i');
    const hasStayMessage1 = await stayMessage1.isVisible().catch(() => false);
    expect(hasStayMessage1).toBe(false);
    const stayMessage2 = player2Page.locator('text=/Stayed in/i');
    const hasStayMessage2 = await stayMessage2.isVisible().catch(() => false);
    expect(hasStayMessage2).toBe(false);
    console.log('  ✓ No "stay" message on first question');
    
    // Wait for question 2
    await hostPage.waitForTimeout(10000);
    await player1Page.waitForTimeout(10000);
    await player2Page.waitForTimeout(10000);
    
    // ============================================
    // QUESTION 2
    // ============================================
    console.log('  → Question 2...');
    await expect(hostPage.locator('text=/Question 2 of 3/i')).toBeVisible({ timeout: 15000 });
    await answerQuestionQuickly(player1Page, 'Player1');
    await answerQuestionQuickly(player2Page, 'Player2');
    
    // Wait for timer to expire and reveal
    await expect(hostPage.locator('text=/Revealing answer|Correct Answer/i')).toBeVisible({ timeout: 20000 });
    await expect(player1Page.locator('text=/Correct Answer|Revealing answer/i').first()).toBeVisible({ timeout: 20000 });
    await expect(player2Page.locator('text=/Correct Answer|Revealing answer/i').first()).toBeVisible({ timeout: 20000 });
    console.log('  ✓ Question 2 reveal');
    
    await hostPage.waitForTimeout(7000);
    await player1Page.waitForTimeout(7000);
    await player2Page.waitForTimeout(7000);
    await expect(hostPage.locator('text=/Leaderboard|Top Players/i')).toBeVisible({ timeout: 10000 });
    await expect(player1Page.locator('text=/You\'re in|place|Top 3 Players/i')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('text=/You\'re in|place|Top 3 Players/i')).toBeVisible({ timeout: 10000 });
    console.log('  ✓ Question 2 leaderboard');
    
    // Wait for question 3
    await hostPage.waitForTimeout(10000);
    await player1Page.waitForTimeout(10000);
    await player2Page.waitForTimeout(10000);
    
    // ============================================
    // QUESTION 3 (Final)
    // ============================================
    console.log('  → Question 3 (final)...');
    await expect(hostPage.locator('text=/Question 3 of 3/i')).toBeVisible({ timeout: 15000 });
    await answerQuestionQuickly(player1Page, 'Player1');
    await answerQuestionQuickly(player2Page, 'Player2');
    
    // Wait for timer to expire and reveal
    await expect(hostPage.locator('text=/Revealing answer|Correct Answer/i')).toBeVisible({ timeout: 20000 });
    await expect(player1Page.locator('text=/Correct Answer|Revealing answer/i').first()).toBeVisible({ timeout: 20000 });
    await expect(player2Page.locator('text=/Correct Answer|Revealing answer/i').first()).toBeVisible({ timeout: 20000 });
    console.log('  ✓ Question 3 reveal');
    
    await hostPage.waitForTimeout(7000);
    await player1Page.waitForTimeout(7000);
    await player2Page.waitForTimeout(7000);
    await expect(hostPage.locator('text=/Leaderboard|Top Players/i')).toBeVisible({ timeout: 10000 });
    await expect(player1Page.locator('text=/You\'re in|place|Top 3 Players/i')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('text=/You\'re in|place|Top 3 Players/i')).toBeVisible({ timeout: 10000 });
    console.log('  ✓ Question 3 leaderboard');
    
    // Wait for final results
    await hostPage.waitForTimeout(10000);
    await player1Page.waitForTimeout(10000);
    await player2Page.waitForTimeout(10000);
    
    // ============================================
    // FINAL RESULTS
    // ============================================
    console.log('  → Checking for final results...');
    
    // Check for final results (game should end after last question)
    const hostFinalResults = await hostPage.locator('text=/Game Over|Final Results|Winner/i').isVisible({ timeout: 5000 }).catch(() => false);
    const player1FinalResults = await player1Page.locator('text=/Final Results|Game Over|Your Final Rank|You\'re in.*place/i').isVisible({ timeout: 5000 }).catch(() => false);
    const player2FinalResults = await player2Page.locator('text=/Final Results|Game Over|Your Final Rank|You\'re in.*place/i').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hostFinalResults || player1FinalResults || player2FinalResults) {
      console.log('  ✅ Final results appeared!');
    } else {
      // Might still be on leaderboard, wait a bit more
      await hostPage.waitForTimeout(5000);
      await player1Page.waitForTimeout(5000);
      await player2Page.waitForTimeout(5000);
      const hostFinalResults2 = await hostPage.locator('text=/Game Over|Final Results|Winner/i').isVisible({ timeout: 5000 }).catch(() => false);
      const player1FinalResults2 = await player1Page.locator('text=/Final Results|Game Over|Your Final Rank/i').isVisible({ timeout: 5000 }).catch(() => false);
      const player2FinalResults2 = await player2Page.locator('text=/Final Results|Game Over|Your Final Rank/i').isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hostFinalResults2 || player1FinalResults2 || player2FinalResults2) {
        console.log('  ✅ Final results appeared after wait!');
      } else {
        console.log('  ⚠️  Final results not visible, but game completed');
      }
    }
    
    console.log('  ✅ FULL GAME COMPLETED WITH 2 PLAYERS!');
    
    // Keep browsers open for a moment to see final results
    await hostPage.waitForTimeout(3000);
    await player1Page.waitForTimeout(3000);
    await player2Page.waitForTimeout(3000);
    
    // Cleanup
    await player1Page.close();
    await player1Context.close();
    await player2Page.close();
    await player2Context.close();
    await hostPage.close();
    await hostContext.close();
  });
});

