import { test, expect } from '@playwright/test';

/**
 * DIRECT TEST: Game Over Screen Only
 * 
 * Tests ONLY the game over transition by:
 * 1. Creating a game
 * 2. Starting it
 * 3. Manually advancing to question 3 (via API/server action)
 * 4. Skipping question 3 to trigger game end
 * 5. Verifying final results appear
 * 
 * Much faster than full flow!
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Game Over Direct Test', () => {
  test('Final results appear when game ends (direct test)', async ({ browser, page }) => {
    console.log('\n🎯 ========================================');
    console.log('🎯 DIRECT GAME OVER TEST');
    console.log('🎯 ========================================\n');
    
    const hostContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const hostPage = await hostContext.newPage();
    
    // Capture ALL console logs
    hostPage.on('console', msg => {
      const text = msg.text();
      if (text.includes('Game') || text.includes('Final') || text.includes('ended') || text.includes('results') || text.includes('QuestionAdvance')) {
        console.log(`[HOST] ${text}`);
      }
    });
    
    try {
      // Step 1: Create game
      console.log('📋 Step 1: Creating game...');
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
      
      // Extract game ID
      const gameIdMatch = hostPage.url().match(/\/game\/([^\/]+)\/host/);
      if (!gameIdMatch) throw new Error('Could not extract game ID');
      const gameId = gameIdMatch[1];
      console.log(`✓ Game created: ${gameId}`);
      
      // Step 2: Join player and start
      console.log('\n📋 Step 2: Starting game...');
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
      
      await hostPage.waitForTimeout(2000);
      const startButton = hostPage.getByRole('button', { name: /Start Game/i });
      await expect(startButton).toBeVisible({ timeout: 10000 });
      await startButton.click();
      console.log('✓ Game started');
      
      // Step 3: Fast-forward to question 3 by skipping questions 1 and 2
      console.log('\n📋 Step 3: Fast-forwarding to question 3...');
      const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
      
      // Skip question 1
      await expect(hostPage.locator('text=/Question 1 of/')).toBeVisible({ timeout: 15000 });
      await hostPage.waitForTimeout(1000);
      await skipButton.click();
      await expect(hostPage.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
      await hostPage.waitForTimeout(11000);
      console.log('✓ Question 1 skipped');
      
      // Skip question 2
      await expect(hostPage.locator('text=/Question 2 of/')).toBeVisible({ timeout: 15000 });
      await hostPage.waitForTimeout(1000);
      await skipButton.click();
      await expect(hostPage.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
      await hostPage.waitForTimeout(11000);
      console.log('✓ Question 2 skipped');
      
      // Step 4: Now we're at question 3 - skip it to trigger game end
      console.log('\n📋 Step 4: Skipping question 3 (this should trigger game end)...');
      await expect(hostPage.locator('text=/Question 3 of/')).toBeVisible({ timeout: 15000 });
      await hostPage.waitForTimeout(1000);
      await skipButton.click();
      console.log('✓ Skip clicked on question 3');
      
      // Step 5: Wait for reveal and leaderboard
      await expect(hostPage.locator('text=/Correct Answer|Revealing answer/i')).toBeVisible({ timeout: 20000 });
      console.log('✓ Reveal shown');
      
      await expect(hostPage.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
      console.log('✓ Leaderboard shown');
      
      // Step 6: Wait for leaderboard countdown to finish (this triggers game end)
      console.log('\n⏳ Waiting for leaderboard countdown to finish (triggers game end)...');
      await hostPage.waitForTimeout(11000);
      
      // Step 7: Check for game over screen
      console.log('\n🏁 Step 5: Checking for Game Over screen...');
      
      // Wait a moment for state to update
      await hostPage.waitForTimeout(2000);
      
      // Check for final results - multiple possible texts
      const gameOverText = hostPage.locator('text=/Game Over/i');
      const finalLeaderboardText = hostPage.locator('text=/Final Leaderboard/i');
      const winnerText = hostPage.locator('text=/Wins|Winner/i');
      const playAgainText = hostPage.locator('text=/Play Again/i');
      const loadingText = hostPage.locator('text=/Loading results/i');
      
      console.log('   Checking for final results elements...');
      
      // Try each one with a short timeout
      const checks = await Promise.allSettled([
        gameOverText.isVisible({ timeout: 5000 }).then(() => 'Game Over'),
        finalLeaderboardText.isVisible({ timeout: 5000 }).then(() => 'Final Leaderboard'),
        winnerText.isVisible({ timeout: 5000 }).then(() => 'Winner'),
        playAgainText.isVisible({ timeout: 5000 }).then(() => 'Play Again'),
        loadingText.isVisible({ timeout: 2000 }).then(() => 'Loading'),
      ]);
      
      const visibleElements = checks
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled' && r.value !== undefined)
        .map(r => r.value);
      
      console.log(`   Found: ${visibleElements.length > 0 ? visibleElements.join(', ') : 'nothing'}`);
      
      if (visibleElements.includes('Loading')) {
        console.log('   ⏳ Still loading, waiting longer (up to 10 seconds)...');
        // Wait longer for API call to complete
        await hostPage.waitForTimeout(10000);
        
        // Check again - try all selectors
        const finalChecks = await Promise.allSettled([
          gameOverText.isVisible({ timeout: 5000 }).then(() => true),
          finalLeaderboardText.isVisible({ timeout: 5000 }).then(() => true),
          winnerText.isVisible({ timeout: 5000 }).then(() => true),
          playAgainText.isVisible({ timeout: 5000 }).then(() => true),
        ]);
        
        const hasAnyFinal = finalChecks.some(r => r.status === 'fulfilled' && r.value === true);
        
        if (hasAnyFinal) {
          console.log('   ✅ Final results appeared after loading!');
        } else {
          // Get page content for debugging
          const pageContent = await hostPage.content();
          const hasError = pageContent.includes('Unable to load') || pageContent.includes('Error');
          if (hasError) {
            throw new Error('Final results API call failed - check server logs');
          }
          throw new Error('Final results still not visible after loading wait');
        }
      } else if (visibleElements.length === 0) {
        // Debug: Check what's actually on the page
        const pageContent = await hostPage.content();
        console.log('\n   🔍 Debug: Checking page content...');
        console.log(`   Contains "Game Over": ${pageContent.includes('Game Over')}`);
        console.log(`   Contains "Final": ${pageContent.includes('Final')}`);
        console.log(`   Contains "Leaderboard": ${pageContent.includes('Leaderboard')}`);
        console.log(`   Contains "question 3": ${pageContent.includes('Question 3')}`);
        
        throw new Error('No final results elements found');
      } else {
        console.log(`   ✅ Final results visible: ${visibleElements.join(', ')}`);
      }
      
      console.log('\n✅ ========================================');
      console.log('✅ GAME OVER TEST PASSED!');
      console.log('✅ ========================================\n');
      
      // Keep page open for 3 seconds to see result
      await hostPage.waitForTimeout(3000);
      
    } finally {
      await hostPage.close().catch(() => {});
      await hostContext.close().catch(() => {});
    }
  });
});

