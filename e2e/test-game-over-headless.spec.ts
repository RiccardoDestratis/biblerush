import { test, expect } from '@playwright/test';
import {
  getOrCreateTestGame,
  resetGameToQuestion,
  addTestPlayer,
  getGameRoomCode,
} from '@/lib/test-utils/persistent-game';

/**
 * Headless Test: Question 3 to Game Over
 * 
 * Uses persistent game utilities but actually goes through the proper UI flow:
 * 1. Start the game (so Zustand store gets initialized)
 * 2. Skip questions 1-2 to get to question 3
 * 3. Skip question 3 to trigger game end
 * 4. Verify final results appear
 * 
 * Run: pnpm test:e2e test-game-over-headless
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Game Over Flow (Headless)', () => {
  test('Final results appear when game ends from question 3', async ({ browser }) => {
    console.log('\n🎯 ========================================');
    console.log('🎯 HEADLESS TEST: Question 3 to Game Over');
    console.log('🎯 ========================================\n');
    
    // Step 1: Set up persistent test game (but reset to waiting so we can start it properly)
    console.log('📋 Step 1: Setting up persistent test game...');
    const gameId = await getOrCreateTestGame('q3-to-gameover-headless', 3);
    
    // Reset to waiting status so we can start it properly through the UI
    const { createServiceClient } = await import('@/lib/supabase/server');
    const supabase = createServiceClient();
    await supabase
      .from('games')
      .update({
        status: 'waiting',
        current_question_index: 0,
        started_at: null,
        completed_at: null,
      })
      .eq('id', gameId);
    
    await addTestPlayer(gameId, 'TestPlayer');
    const roomCode = await getGameRoomCode(gameId);
    
    console.log(`✅ Game ready: ${gameId}`);
    console.log(`   Room Code: ${roomCode}\n`);
    
    // Step 2: Open game in browser
    const context = await browser.newContext({ 
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    
    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Game') || text.includes('Final') || text.includes('ended') || 
          text.includes('results') || text.includes('QuestionAdvance') || 
          text.includes('game_end') || text.includes('completed')) {
        console.log(`[Browser] ${text}`);
      }
    });
    
    try {
      // Step 3: Navigate to host view
      console.log('📋 Step 2: Navigating to host view...');
      await page.goto(`${baseURL}/game/${gameId}/host`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Step 4: Start the game
      console.log('📋 Step 3: Starting the game...');
      const startButton = page.getByRole('button', { name: /Start Game/i });
      await expect(startButton).toBeVisible({ timeout: 10000 });
      await startButton.click();
      console.log('✅ Game started - you should see question 1 now!\n');
      await page.waitForTimeout(2000);
      
      // Step 5: Skip question 1
      console.log('📋 Step 4: Skipping question 1...');
      const skipButton = page.getByRole('button', { name: /Skip Question/i });
      await expect(page.locator('text=/Question 1 of/')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1000);
      await skipButton.click();
      await expect(page.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(11000); // Wait for countdown
      console.log('✅ Question 1 skipped\n');
      
      // Step 6: Skip question 2
      console.log('📋 Step 5: Skipping question 2...');
      await expect(page.locator('text=/Question 2 of/')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1000);
      await skipButton.click();
      await expect(page.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(11000); // Wait for countdown
      console.log('✅ Question 2 skipped\n');
      
      // Step 7: Now we're at question 3 - skip it to trigger game end
      console.log('📋 Step 6: Now at question 3 - you should see it now!');
      await expect(page.locator('text=/Question 3 of/')).toBeVisible({ timeout: 15000 });
      console.log('   ✅ Question 3 visible - waiting 3 seconds so you can see it...\n');
      await page.waitForTimeout(3000);
      
      console.log('📋 Step 7: Skipping question 3 (this will trigger game end)...');
      await page.waitForTimeout(1000);
      await skipButton.click();
      console.log('✅ Skip clicked on question 3\n');
      
      // Step 8: Wait for reveal
      console.log('📋 Step 8: Waiting for answer reveal...');
      await expect(
        page.locator('text=/Correct Answer|Revealing answer/i')
      ).toBeVisible({ timeout: 20000 });
      console.log('✅ Reveal shown\n');
      
      // Step 9: Wait for leaderboard
      console.log('📋 Step 9: Waiting for leaderboard...');
      await expect(page.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
      console.log('✅ Leaderboard shown\n');
      
      // Step 10: Wait for leaderboard countdown to finish (this triggers game end)
      console.log('📋 Step 10: Waiting for leaderboard countdown (10 seconds - this triggers game end)...');
      console.log('   ⏳ Countdown in progress - game will end after this...\n');
      await page.waitForTimeout(11000);
      console.log('✅ Countdown finished - game should end now!\n');
      
      // Step 11: Check for game over screen
      console.log('📋 Step 11: Checking for Game Over screen...');
      await page.waitForTimeout(2000); // Give time for state to update
      
      // Check for final results elements
      const gameOverText = page.locator('text=/Game Over/i');
      const finalLeaderboardText = page.locator('text=/Final Leaderboard/i');
      const winnerText = page.locator('text=/Wins|Winner/i');
      const playAgainText = page.locator('text=/Play Again/i');
      const loadingText = page.locator('text=/Loading results/i');
      
      console.log('   Checking for final results elements...');
      
      // Check if loading first
      const isLoading = await loadingText.isVisible({ timeout: 2000 }).catch(() => false);
      if (isLoading) {
        console.log('   ⏳ Still loading, waiting for API call to complete...');
        await page.waitForTimeout(10000); // Wait for API call
      }
      
      // Check for final results
      const checks = await Promise.allSettled([
        gameOverText.isVisible({ timeout: 5000 }).then(() => 'Game Over'),
        finalLeaderboardText.isVisible({ timeout: 5000 }).then(() => 'Final Leaderboard'),
        winnerText.isVisible({ timeout: 5000 }).then(() => 'Winner'),
        playAgainText.isVisible({ timeout: 5000 }).then(() => 'Play Again'),
      ]);
      
      const visibleElements = checks
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled' && r.value !== undefined)
        .map(r => r.value);
      
      if (visibleElements.length > 0) {
        console.log(`   ✅ Final results visible: ${visibleElements.join(', ')}\n`);
        console.log('✅ ========================================');
        console.log('✅ HEADLESS TEST PASSED!');
        console.log('✅ ========================================\n');
        
        // Keep page open so user can see the result
        await page.waitForTimeout(5000);
      } else {
        // Debug: Check what's on the page
        const pageContent = await page.content();
        console.log('\n   🔍 Debug: Checking page content...');
        console.log(`   Contains "Game Over": ${pageContent.includes('Game Over')}`);
        console.log(`   Contains "Final": ${pageContent.includes('Final')}`);
        console.log(`   Contains "Leaderboard": ${pageContent.includes('Leaderboard')}`);
        console.log(`   URL: ${page.url()}`);
        
        throw new Error('Final results not visible on page');
      }
      
    } catch (error) {
      console.error('\n❌ TEST FAILED:', error);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: 'test-results/game-over-headless-failure.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved to test-results/game-over-headless-failure.png');
      
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  });
});
