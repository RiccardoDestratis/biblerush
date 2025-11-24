import { test, expect } from '@playwright/test';

/**
 * CONTINUOUS SYNC TEST: Runs in headed mode, shows everything
 * 
 * This test verifies complete host-player synchronization
 * Run with: pnpm exec playwright test e2e/continuous-sync-test.spec.ts --headed
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 300000;

test.describe('Continuous Sync Test (Headed Mode)', () => {
  test('Full game flow - Host and Player stay in sync', async ({ browser }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    console.log('\n🎮 ========================================');
    console.log('🎮 CONTINUOUS SYNC TEST (HEADED MODE)');
    console.log('🎮 ========================================\n');
    
    const errors: string[] = [];
    
    // Setup contexts
    const hostContext = await browser.newContext({ 
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: 'test-results/videos/' }
    });
    const hostPage = await hostContext.newPage();
    
    const playerContext = await browser.newContext({ 
      viewport: { width: 375, height: 667 },
      recordVideo: { dir: 'test-results/videos/' }
    });
    const playerPage = await playerContext.newPage();
    
    // Log all console messages
    hostPage.on('console', msg => {
      const text = msg.text();
      if (text.includes('[Host]') || text.includes('[GameStore]') || text.includes('[QuestionAdvance]')) {
        console.log(`[HOST] ${text}`);
      }
    });
    
    playerPage.on('console', msg => {
      const text = msg.text();
      if (text.includes('[Player]') || text.includes('[GameStore]')) {
        console.log(`[PLAYER] ${text}`);
      }
    });
    
    try {
      // ============================================
      // SETUP
      // ============================================
      console.log('📋 Setting up game...');
      
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
        throw new Error('No question sets available. Run: pnpm import:questions docs/questions_import/complete_questions.json');
      }
      
      await createButton.click();
      await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
      
      const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
      const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
      if (!roomCodeMatch) throw new Error('Could not extract room code');
      const roomCode = roomCodeMatch[1];
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
      console.log('✓ Game started\n');
      
      // ============================================
      // QUESTION 1
      // ============================================
      console.log('📚 QUESTION 1');
      console.log('─────────────────────────────────────────');
      
      await expect(hostPage.locator('text=/Question 1 of/')).toBeVisible({ timeout: 15000 });
      console.log('✓ Host: Question 1 displayed');
      
      await expect(playerPage.locator('h1, [class*="text-lg"], [class*="text-xl"]').first()).toBeVisible({ timeout: 15000 });
      const playerQ1 = await playerPage.locator('h1, [class*="text-lg"], [class*="text-xl"]').first().textContent();
      if (playerQ1?.includes('Leaderboard') || playerQ1?.includes('place')) {
        errors.push('Q1: Player showing leaderboard instead of question');
      }
      console.log('✓ Player: Question 1 displayed');
      
      await hostPage.waitForTimeout(2000);
      const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
      await skipButton.click();
      console.log('✓ Skip clicked');
      
      await expect(hostPage.locator('text=/Correct Answer|Revealing answer/i')).toBeVisible({ timeout: 20000 });
      await expect(playerPage.locator('text=/Correct Answer|Revealing answer|Waiting for other players/i')).toBeVisible({ timeout: 20000 });
      console.log('✓ Reveal synced');
      
      await expect(hostPage.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
      await expect(playerPage.locator('text=/Leaderboard|You\'re in|place|points/i')).toBeVisible({ timeout: 20000 });
      console.log('✓ Leaderboard synced');
      
      await hostPage.waitForTimeout(11000);
      console.log('');
      
      // ============================================
      // QUESTION 2 - CRITICAL
      // ============================================
      console.log('📚 QUESTION 2 (CRITICAL TEST)');
      console.log('─────────────────────────────────────────');
      
      await expect(hostPage.locator('text=/Question 2 of/')).toBeVisible({ timeout: 15000 });
      console.log('✓ Host: Question 2 displayed');
      
      await playerPage.waitForTimeout(2000);
      const playerQ2Text = playerPage.locator('h1, [class*="text-lg"], [class*="text-xl"]').first();
      await expect(playerQ2Text).toBeVisible({ timeout: 15000 });
      const playerQ2 = await playerQ2Text.textContent() || '';
      
      if (playerQ2.includes('Leaderboard') || playerQ2.includes('You\'re in') || playerQ2.includes('place')) {
        errors.push('Q2: Player stuck on leaderboard instead of question');
        console.log('❌ FAIL: Player showing:', playerQ2.substring(0, 100));
        throw new Error('QUESTION 2 SYNC FAILED: Player stuck on leaderboard');
      } else if (!playerQ2.includes('Who') && !playerQ2.includes('Jesus') && !playerQ2.includes('?')) {
        errors.push('Q2: Player not showing question text');
        console.log('❌ FAIL: Player showing:', playerQ2.substring(0, 100));
        throw new Error('QUESTION 2 SYNC FAILED: Player not showing question');
      }
      console.log('✓ Player: Question 2 displayed');
      
      await skipButton.click();
      console.log('✓ Skip clicked');
      
      await expect(hostPage.locator('text=/Correct Answer|Revealing answer/i')).toBeVisible({ timeout: 20000 });
      await expect(playerPage.locator('text=/Correct Answer|Revealing answer|Waiting for other players/i')).toBeVisible({ timeout: 20000 });
      console.log('✓ Reveal synced');
      
      await expect(hostPage.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
      await expect(playerPage.locator('text=/Leaderboard|You\'re in|place|points/i')).toBeVisible({ timeout: 20000 });
      console.log('✓ Leaderboard synced');
      
      await hostPage.waitForTimeout(11000);
      console.log('');
      
      // ============================================
      // QUESTION 3
      // ============================================
      console.log('📚 QUESTION 3');
      console.log('─────────────────────────────────────────');
      
      await expect(hostPage.locator('text=/Question 3 of/')).toBeVisible({ timeout: 15000 });
      console.log('✓ Host: Question 3 displayed');
      
      await playerPage.waitForTimeout(2000);
      const playerQ3Text = playerPage.locator('h1, [class*="text-lg"], [class*="text-xl"]').first();
      await expect(playerQ3Text).toBeVisible({ timeout: 15000 });
      const playerQ3 = await playerQ3Text.textContent() || '';
      
      if (playerQ3.includes('Leaderboard') || playerQ3.includes('You\'re in') || playerQ3.includes('place')) {
        errors.push('Q3: Player stuck on leaderboard instead of question');
        console.log('❌ FAIL: Player showing:', playerQ3.substring(0, 100));
        throw new Error('QUESTION 3 SYNC FAILED: Player stuck on leaderboard');
      }
      console.log('✓ Player: Question 3 displayed');
      
      await skipButton.click();
      console.log('✓ Skip clicked');
      
      // Last question - might go to reveal or straight to final
      const hostReveal = hostPage.locator('text=/Correct Answer|Revealing answer/i');
      const hostFinal = hostPage.locator('text=/Game Over|Final Leaderboard|Winner/i');
      const result = await Promise.race([
        hostReveal.isVisible({ timeout: 15000 }).then(() => 'reveal'),
        hostFinal.isVisible({ timeout: 15000 }).then(() => 'final'),
      ]).catch(() => 'none');
      
      if (result === 'reveal') {
        await expect(playerPage.locator('text=/Correct Answer|Revealing answer|Waiting for other players/i')).toBeVisible({ timeout: 20000 });
        console.log('✓ Reveal synced');
        
        await expect(hostPage.locator('text=/Leaderboard/i')).toBeVisible({ timeout: 20000 });
        await expect(playerPage.locator('text=/Leaderboard|You\'re in|place|points/i')).toBeVisible({ timeout: 20000 });
        console.log('✓ Leaderboard synced');
        
        await hostPage.waitForTimeout(11000);
      } else if (result === 'final') {
        console.log('✓ Game ended (went straight to final results)');
      }
      
      // Final results
      await hostPage.waitForTimeout(5000);
      const hostFinalResults = hostPage.locator('text=/Game Over|Final Leaderboard|Winner|Play Again/i');
      await expect(hostFinalResults.first()).toBeVisible({ timeout: 30000 });
      console.log('✓ Host: Final results');
      
      await playerPage.waitForTimeout(2000);
      const playerFinalResults = playerPage.locator('text=/finished in|Final Score|Accuracy|Play Again/i');
      await expect(playerFinalResults.first()).toBeVisible({ timeout: 30000 });
      console.log('✓ Player: Final results');
      console.log('');
      
      // ============================================
      // RESULTS
      // ============================================
      console.log('📊 ========================================');
      console.log('📊 TEST RESULTS');
      console.log('📊 ========================================');
      
      if (errors.length === 0) {
        console.log('✅ ALL TESTS PASSED - SYNC IS WORKING!');
        console.log('');
        console.log('✅ Question 1: Synced');
        console.log('✅ Question 2: Synced');
        console.log('✅ Question 3: Synced');
        console.log('✅ Reveal: Synced');
        console.log('✅ Leaderboard: Synced');
        console.log('✅ Final Results: Synced');
      } else {
        console.log(`❌ FOUND ${errors.length} ERRORS:`);
        errors.forEach((error, i) => {
          console.log(`  ${i + 1}. ${error}`);
        });
        throw new Error(`Sync test failed: ${errors.join('; ')}`);
      }
      
      // Keep pages open for 5 seconds so user can see
      await hostPage.waitForTimeout(5000);
      
    } finally {
      await hostPage.close().catch(() => {});
      await hostContext.close().catch(() => {});
      await playerPage.close().catch(() => {});
      await playerContext.close().catch(() => {});
    }
  });
});


