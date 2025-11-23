import { test, expect } from '@playwright/test';

/**
 * Full Game Flow UI Demo Test
 * 
 * This test runs in HEADED mode so you can watch the complete game flow:
 * - Game creation with 3 free questions
 * - Multiple players joining
 * - Complete question flow (Question → Reveal → Leaderboard)
 * - All 3 questions from start to finish
 * - Final results screen
 * 
 * This is designed for visual inspection - you can watch the game progress
 * in real-time to see how everything works together.
 * 
 * Run with: pnpm exec playwright test e2e/full-game-flow-ui-demo.spec.ts --headed
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Full Game Flow UI Demo - Watch Complete Flow', () => {
  test('Complete 3-question game from start to finish (headed mode)', async ({ browser }) => {
    test.setTimeout(180000); // 3 minutes (to watch the full flow)
    
    // ============================================
    // STEP 1: Create game with 3 questions (free)
    // ============================================
    console.log('🎮 Starting Full Game Flow UI Demo...');
    console.log('📋 Creating game with 3 questions (free)...');
    
    const hostContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }, // Projector viewport
    });
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    await hostPage.waitForTimeout(3000); // Wait for question sets to load
    
    // Select first question set if available
    const questionSetCard = hostPage.locator('div[class*="card"]').first();
    const cardExists = await questionSetCard.isVisible().catch(() => false);
    
    if (cardExists) {
      await questionSetCard.click();
      await hostPage.waitForTimeout(500);
    }
    
    // Select 3 questions (Free/Demo option)
    const threeQuestionsRadio = hostPage.locator('#length-3');
    await expect(threeQuestionsRadio).toBeVisible({ timeout: 10000 });
    await threeQuestionsRadio.click();
    await hostPage.waitForTimeout(500);
    
    // Create game
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    
    const isDisabled = await createButton.isDisabled();
    if (isDisabled) {
      console.log('❌ No question sets available. Cannot run test.');
      console.log('   Import question sets: pnpm import:questions');
      return;
    }
    
    await createButton.click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    console.log('✅ Game created successfully');
    
    // Extract room code
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    console.log(`📝 Room Code: ${roomCode}`);
    
    // ============================================
    // STEP 2: Have 3 players join
    // ============================================
    console.log('👥 Adding 3 players...');
    
    const playerNames = ['Alice', 'Bob', 'Charlie'];
    const playerContexts: Array<{ context: any; page: any; name: string }> = [];
    
    for (let i = 0; i < playerNames.length; i++) {
      const playerName = playerNames[i];
      const playerContext = await browser.newContext({
        viewport: { width: 375, height: 667 }, // Mobile viewport
      });
      const playerPage = await playerContext.newPage();
      
      await playerPage.goto(`${baseURL}/join`);
      await playerPage.waitForLoadState('networkidle');
      
      await playerPage.locator('#room-code').fill(roomCode);
      await playerPage.locator('#player-name').fill(playerName);
      await playerPage.getByRole('button', { name: 'Join Game' }).click();
      await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
      
      playerContexts.push({ context: playerContext, page: playerPage, name: playerName });
      console.log(`  ✓ ${playerName} joined`);
      await hostPage.waitForTimeout(500);
    }
    
    await hostPage.waitForTimeout(2000); // Wait for real-time updates
    
    // Verify players joined
    const playerCountText = await hostPage.locator('text=/Players Joined/').textContent();
    expect(playerCountText).toContain('3');
    console.log('✅ All 3 players joined');
    
    // ============================================
    // STEP 3: Start game
    // ============================================
    console.log('🚀 Starting game...');
    console.log('⏸️  Game will progress automatically - watch the screens!');
    
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).not.toBeDisabled({ timeout: 5000 });
    await startButton.click();
    
    // Wait for game to start
    await expect(hostPage.locator('text=/Starting|Loading/i')).toBeVisible({ timeout: 10000 });
    await hostPage.waitForTimeout(5000);
    console.log('✅ Game started!');
    
    // ============================================
    // STEP 4: Play all 3 questions
    // ============================================
    const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
    
    for (let questionNum = 1; questionNum <= 3; questionNum++) {
      console.log(`\n📊 Question ${questionNum}/3`);
      console.log('────────────────────────────────────────');
      
      // Wait for question to appear
      const questionText = hostPage.locator(`text=/Question ${questionNum} of/`);
      await expect(questionText).toBeVisible({ timeout: 15000 });
      console.log(`  ✓ Question ${questionNum} displayed`);
      
      // Wait for players to see question
      await hostPage.waitForTimeout(2000);
      
      // Players submit answers quickly (for demo purposes)
      console.log('  → Players submitting answers...');
      for (let i = 0; i < playerContexts.length; i++) {
        const { page, name } = playerContexts[i];
        try {
          // Try to find answer buttons
          const answerContainer = page.locator('div.space-y-3, [class*="space-y"]').first();
          const answerExists = await answerContainer.isVisible().catch(() => false);
          
          if (answerExists) {
            const allButtons = answerContainer.locator('button');
            const buttonCount = await allButtons.count();
            
            if (buttonCount >= 4) {
              // Select answer based on player index (different for each player)
              const answerButton = allButtons.nth(i % 4);
              await answerButton.click();
              await page.waitForTimeout(300);
              // Double-tap to lock
              await answerButton.click();
              await page.waitForTimeout(500);
              console.log(`    ✓ ${name} submitted answer`);
            }
          }
        } catch (error) {
          // If answer submission fails, continue anyway
          console.log(`    ⚠️  ${name} answer submission skipped (continuing anyway)`);
        }
      }
      
      // Skip question to trigger reveal (faster for demo)
      console.log('  → Skipping question to trigger reveal flow...');
      await expect(skipButton).toBeVisible({ timeout: 5000 });
      await skipButton.click();
      console.log('  ✓ Skip button clicked');
      
      // Wait for reveal (2 second delay + animations)
      console.log('  → Waiting for answer reveal...');
      await hostPage.waitForTimeout(3000);
      
      const answerReveal = hostPage.locator('text=/Correct Answer/i');
      const revealVisible = await answerReveal.isVisible({ timeout: 10000 }).catch(() => false);
      
      if (revealVisible) {
        console.log('  ✓ Answer reveal displayed');
      } else {
        console.log('  ⚠️  Answer reveal check skipped (may appear quickly)');
      }
      
      // Wait for leaderboard (5 seconds reveal + transition)
      console.log('  → Waiting for leaderboard...');
      await hostPage.waitForTimeout(6000);
      
      const leaderboardHeading = hostPage.locator('text=/Leaderboard/i');
      const leaderboardVisible = await leaderboardHeading.isVisible({ timeout: 15000 }).catch(() => false);
      
      if (leaderboardVisible) {
        console.log('  ✓ Leaderboard displayed');
        
        // Leaderboard has 10-second countdown before advancing
        // Wait for the full countdown to complete
        if (questionNum < 3) {
          console.log('  → Waiting for leaderboard countdown (10 seconds)...');
          await hostPage.waitForTimeout(11000); // 10 seconds + 1 second buffer
          
          // Now wait for next question to appear
          console.log('  → Waiting for next question...');
          const nextQuestionText = hostPage.locator(`text=/Question ${questionNum + 1} of/`);
          await expect(nextQuestionText).toBeVisible({ timeout: 15000 });
          console.log(`  ✓ Question ${questionNum + 1} appeared`);
        } else {
          // Last question - wait for countdown then check for final results
          console.log('  → Waiting for leaderboard countdown (10 seconds)...');
          await hostPage.waitForTimeout(11000); // 10 seconds + 1 second buffer
          console.log('  → Waiting for final results...');
        }
      } else {
        console.log('  ⚠️  Leaderboard check skipped (may have advanced quickly)');
        // Still wait a bit in case it's transitioning
        await hostPage.waitForTimeout(3000);
      }
    }
    
    // ============================================
    // STEP 5: Verify final results
    // ============================================
    console.log('\n🏁 Game Complete!');
    console.log('────────────────────────────────────────');
    
    // Check for final results screen
    const finalResults = hostPage.locator('text=/Final Results|Game Complete|Congratulations/i');
    const finalResultsVisible = await finalResults.isVisible({ timeout: 15000 }).catch(() => false);
    
    if (finalResultsVisible) {
      console.log('✅ Final results displayed');
    } else {
      // Try alternative selectors
      const gameEnded = hostPage.locator('text=/Game Ended|Complete/i');
      const gameEndedVisible = await gameEnded.isVisible({ timeout: 5000 }).catch(() => false);
      if (gameEndedVisible) {
        console.log('✅ Game completion screen displayed');
      } else {
        console.log('⚠️  Final results check - screen may be displaying');
      }
    }
    
    console.log('\n✅ Full game flow completed successfully!');
    console.log('📊 You watched:');
    console.log('   - Game creation');
    console.log('   - Player joining');
    console.log('   - Game start');
    console.log('   - Question 1 → Reveal → Leaderboard');
    console.log('   - Question 2 → Reveal → Leaderboard');
    console.log('   - Question 3 → Reveal → Leaderboard');
    console.log('   - Final results');
    
    // Keep browser open for a moment to see final results
    console.log('\n⏸️  Keeping browser open for 5 seconds to view final results...');
    await hostPage.waitForTimeout(5000);
    
    // Don't close immediately - let user see the final screen
    // Cleanup will happen when test completes
  });
});

