import { test, expect } from '@playwright/test';

/**
 * FOCUSED TEST: Game Over Screen Only
 * 
 * Tests ONLY the final results screen after game ends
 * Quick test - doesn't require full game flow
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Game Over Screen Test', () => {
  test('Final results screen appears when game ends', async ({ browser }) => {
    console.log('\n🎯 ========================================');
    console.log('🎯 TESTING GAME OVER SCREEN ONLY');
    console.log('🎯 ========================================\n');
    
    const hostContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const hostPage = await hostContext.newPage();
    
    // Capture ALL console logs
    hostPage.on('console', msg => {
      const text = msg.text();
      if (text.includes('Game') || text.includes('Final') || text.includes('ended') || text.includes('results')) {
        console.log(`[HOST] ${text}`);
      }
    });
    
    try {
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
      if (await createButton.isDisabled()) {
        throw new Error('No question sets available');
      }
      
      await createButton.click();
      await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
      
      // Get room code and join player
      const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
      const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
      if (!roomCodeMatch) throw new Error('Could not extract room code');
      const roomCode = roomCodeMatch[1];
      
      const playerContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
      const playerPage = await playerContext.newPage();
      
      await playerPage.goto(`${baseURL}/join`);
      await playerPage.waitForLoadState('networkidle');
      await playerPage.locator('#room-code').fill(roomCode);
      await playerPage.locator('#player-name').fill('TestPlayer');
      await playerPage.getByRole('button', { name: /Join/i }).click();
      await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
      
      // Start game
      await hostPage.waitForTimeout(2000);
      const startButton = hostPage.getByRole('button', { name: /Start Game/i });
      await expect(startButton).toBeVisible({ timeout: 10000 });
      await startButton.click();
      
      // Skip through all 3 questions quickly
      const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
      
      for (let q = 1; q <= 3; q++) {
        console.log(`\n⏭️  Skipping Question ${q}...`);
        await expect(hostPage.locator(`text=/Question ${q} of/`)).toBeVisible({ timeout: 15000 });
        await hostPage.waitForTimeout(1000);
        await skipButton.click();
        
        // Wait for reveal
        await expect(hostPage.locator('text=/Correct Answer|Revealing answer/i')).toBeVisible({ timeout: 20000 });
        await hostPage.waitForTimeout(2000);
        
        // Wait for leaderboard
        await expect(hostPage.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
        
        if (q < 3) {
          // Wait for countdown and next question
          await hostPage.waitForTimeout(11000);
        } else {
          // Last question - wait for leaderboard countdown
          console.log('⏳ Waiting for final leaderboard countdown...');
          await hostPage.waitForTimeout(11000);
        }
      }
      
      // Now check for game over screen
      console.log('\n🏁 Checking for Game Over screen...');
      console.log('   Looking for: "Game Over", "Final Leaderboard", "Winner", or "Play Again"');
      
      // Check multiple possible texts
      const gameOverText = hostPage.locator('text=/Game Over/i');
      const finalLeaderboardText = hostPage.locator('text=/Final Leaderboard/i');
      const winnerText = hostPage.locator('text=/Wins|Winner/i');
      const playAgainText = hostPage.locator('text=/Play Again/i');
      const loadingText = hostPage.locator('text=/Loading results/i');
      
      // Wait a bit for state to update
      await hostPage.waitForTimeout(3000);
      
      // Check what's actually showing
      const hasGameOver = await gameOverText.isVisible({ timeout: 5000 }).catch(() => false);
      const hasFinalLeaderboard = await finalLeaderboardText.isVisible({ timeout: 5000 }).catch(() => false);
      const hasWinner = await winnerText.isVisible({ timeout: 5000 }).catch(() => false);
      const hasPlayAgain = await playAgainText.isVisible({ timeout: 5000 }).catch(() => false);
      const hasLoading = await loadingText.isVisible({ timeout: 2000 }).catch(() => false);
      
      console.log(`\n📊 Screen State Check:`);
      console.log(`   "Game Over" visible: ${hasGameOver ? '✅' : '❌'}`);
      console.log(`   "Final Leaderboard" visible: ${hasFinalLeaderboard ? '✅' : '❌'}`);
      console.log(`   "Winner/Wins" visible: ${hasWinner ? '✅' : '❌'}`);
      console.log(`   "Play Again" visible: ${hasPlayAgain ? '✅' : '❌'}`);
      console.log(`   "Loading results" visible: ${hasLoading ? '⚠️  (still loading)' : '✅ (not loading)'}`);
      
      // Get page content for debugging
      const pageContent = await hostPage.content();
      const hasGameOverInContent = pageContent.includes('Game Over') || pageContent.includes('game-over');
      const hasFinalInContent = pageContent.includes('Final Leaderboard') || pageContent.includes('final-leaderboard');
      
      console.log(`\n📄 Page Content Check:`);
      console.log(`   Contains "Game Over": ${hasGameOverInContent ? '✅' : '❌'}`);
      console.log(`   Contains "Final Leaderboard": ${hasFinalInContent ? '✅' : '❌'}`);
      
      // Check store state via console logs
      console.log(`\n🔍 Check console logs above for:`);
      console.log(`   - "[GameStore] 📝 setRevealState: \\"results\\""`);
      console.log(`   - "[GameStore] setGameStatus: \\"ended\\""`);
      console.log(`   - "[Host] 🏁 Game ended"`);
      
      // Final assertion - at least one of these should be visible
      const anyFinalResultsVisible = hasGameOver || hasFinalLeaderboard || hasWinner || hasPlayAgain;
      
      if (!anyFinalResultsVisible && !hasLoading) {
        // Get current URL to see where we are
        const currentUrl = hostPage.url();
        console.log(`\n❌ Current URL: ${currentUrl}`);
        console.log(`❌ No final results screen found!`);
        throw new Error('Game Over screen not visible after game ended');
      }
      
      if (hasLoading) {
        console.log(`\n⏳ Still loading... waiting longer...`);
        await hostPage.waitForTimeout(5000);
        
        // Check again
        const hasGameOverAfter = await gameOverText.isVisible({ timeout: 10000 }).catch(() => false);
        const hasFinalAfter = await finalLeaderboardText.isVisible({ timeout: 10000 }).catch(() => false);
        
        if (!hasGameOverAfter && !hasFinalAfter) {
          throw new Error('Game Over screen still not visible after additional wait');
        }
      }
      
      console.log(`\n✅ Game Over screen test completed!`);
      console.log(`   Final results are showing (or were loading)`);
      
      // Keep page open for 5 seconds to see result
      await hostPage.waitForTimeout(5000);
      
    } finally {
      await hostPage.close().catch(() => {});
      await hostContext.close().catch(() => {});
    }
  });
});


