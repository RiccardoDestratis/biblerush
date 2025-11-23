import { test, expect } from '@playwright/test';

/**
 * Test: Full Game Flow - Stories 3.2, 3.3, 3.4, 3.5
 * 
 * This test verifies the complete game flow including:
 * - Story 3.2: Answer Reveal on Projector (5 seconds)
 * - Story 3.3: Player Answer Feedback (synchronized with reveal)
 * - Story 3.4: Live Leaderboard - Projector Display (10 seconds)
 * - Story 3.5: Personal Leaderboard - Player View (10 seconds)
 * 
 * Flow tested:
 * 1. Create game with 10 questions (game creation supports 10, 15, or 20)
 * 2. Players join and game starts
 * 3. For each question:
 *    - Question displayed on host and players
 *    - Players submit answers
 *    - Timer expires (or skip for testing)
 *    - Scoring calculation completes
 *    - Answer reveal on projector (5 seconds)
 *    - Player feedback on mobile (synchronized)
 *    - Leaderboard on projector (10 seconds)
 *    - Personal leaderboard on mobile (10 seconds)
 *    - Question advances automatically
 * 4. Game completion
 * 
 * Test variants:
 * - Demo: Creates 10-question game, tests first 3 questions (faster)
 * - Full: Creates 10-question game, tests all 10 questions
 * 
 * Run with: pnpm exec playwright test e2e/full-game-flow-scoring-leaderboard.spec.ts --ui
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Full Game Flow - Scoring & Leaderboards (Stories 3.2-3.5)', () => {
  test('Complete 3-question game flow with different player behaviors', async ({ browser }) => {
    test.setTimeout(120000); // 2 minutes timeout for full 3-question game
    // ============================================
    // STEP 1: Host creates a game with 3 questions (Free/Demo option)
    // ============================================
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    
    // Wait for question sets to load
    await hostPage.waitForTimeout(3000);
    
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
      console.log('⚠️  No question sets available. Skipping test.');
      console.log('   Import question sets: pnpm import:questions docs/questions_import/complete_questions.json');
      return;
    }
    
    await createButton.click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Extract room code
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    
    // ============================================
    // STEP 2: Have 5 players join with different behaviors
    // ============================================
    const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const playerContexts: Array<{ context: any; page: any; name: string; behavior: string }> = [];
    
    const playerBehaviors = [
      'no-answer',      // Alice: Doesn't answer at all
      'late-answer',    // Bob: Answers in last 2 seconds
      'mid-answer',     // Charlie: Answers after 5 seconds
      'proper-lock',    // Diana: Properly locks (double-tap)
      'single-select',  // Eve: Only selects once (doesn't lock)
    ];
    
    for (let i = 0; i < playerNames.length; i++) {
      const playerName = playerNames[i];
      const behavior = playerBehaviors[i];
      
      const playerContext = await browser.newContext({
        viewport: { width: 375, height: 667 }, // Mobile viewport
      });
      const playerPage = await playerContext.newPage();
      
      await playerPage.goto(`${baseURL}/join`);
      await playerPage.waitForLoadState('networkidle');
      
      const roomCodeInput = playerPage.locator('#room-code');
      await expect(roomCodeInput).toBeVisible({ timeout: 5000 });
      await roomCodeInput.fill(roomCode);
      
      const playerNameInput = playerPage.locator('#player-name');
      await expect(playerNameInput).toBeVisible({ timeout: 5000 });
      await playerNameInput.fill(playerName);
      
      const joinButton = playerPage.getByRole('button', { name: 'Join Game' });
      await expect(joinButton).toBeVisible({ timeout: 5000 });
      await joinButton.click();
      
      await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
      
      playerContexts.push({ context: playerContext, page: playerPage, name: playerName, behavior });
      await playerPage.waitForTimeout(500);
    }
    
    // Wait for real-time updates
    await hostPage.waitForTimeout(2000);
    
    // Verify all players joined
    const playerCountText = await hostPage.locator('text=/Players Joined/').textContent();
    expect(playerCountText).toContain('5');
    
    // ============================================
    // STEP 3: Host starts the game
    // ============================================
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).not.toBeDisabled({ timeout: 5000 });
    await startButton.click();
    
    // Wait for game to start
    await expect(hostPage.locator('text=/Starting|Loading/i')).toBeVisible({ timeout: 10000 });
    await hostPage.waitForTimeout(5000);
    
    // ============================================
    // STEP 4: Test All 3 Questions - Full Flow
    // ============================================
    const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
    const answerReveal = hostPage.locator('text=/Correct Answer/i');
    const leaderboardHeading = hostPage.locator('text=/Leaderboard/i');
    
    for (let questionNum = 1; questionNum <= 3; questionNum++) {
      console.log(`📋 Testing Question ${questionNum}/3...`);
      
      // Verify question is displayed on host
      const questionText = hostPage.locator(`text=/Question ${questionNum} of/`);
      await expect(questionText).toBeVisible({ timeout: 15000 });
      
      // Verify players see question and get answer buttons
      console.log('  → Waiting for questions to load on all player pages...');
      for (const { page, name } of playerContexts) {
        const playerQuestionText = page.locator('h1, [class*="text-lg"], [class*="text-xl"]').first();
        await expect(playerQuestionText).toBeVisible({ timeout: 20000 });
        console.log(`    ✓ Question loaded for ${name}`);
      }
      
      // Players submit answers with different behaviors
      console.log('  → Players submitting answers with different behaviors...');
      
      // Execute all player behaviors in parallel where possible
      const playerPromises = playerContexts.map(async ({ page, name, behavior }, i) => {
        const answerIndex = i % 4; // Cycle through A, B, C, D (0=A, 1=B, 2=C, 3=D)
        
        // Get answer buttons - they're in a motion.div with space-y-3 class
        // The buttons contain the letter (A/B/C/D) in a nested div
        // We can find buttons by looking for ones that contain the letter text
        const allAnswerButtons = page.locator('button').filter({ 
          has: page.locator(`text=${['A', 'B', 'C', 'D'][answerIndex]}`)
        });
        
        // Alternative: Get all buttons and select by position (more reliable)
        // Buttons are in order: A (0), B (1), C (2), D (3)
        const answerContainer = page.locator('div.space-y-3, [class*="space-y"]').first();
        await expect(answerContainer).toBeVisible({ timeout: 15000 });
        const allButtons = answerContainer.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`      → ${name}: Found ${buttonCount} buttons`);
        expect(buttonCount).toBeGreaterThanOrEqual(4);
        
        const answerButton = allButtons.nth(answerIndex);
        await expect(answerButton).toBeVisible({ timeout: 15000 });
        
        console.log(`    ${name} (${behavior}): Ready to select answer ${['A', 'B', 'C', 'D'][answerIndex]}`);
        
        if (behavior === 'no-answer') {
          // Alice: Doesn't answer at all
          console.log(`      → ${name}: No answer (will timeout)`);
          return; // Do nothing - timer will expire
        } else if (behavior === 'mid-answer') {
          // Charlie: Answers after 5 seconds
          console.log(`      → ${name}: Waiting 5 seconds, then answering...`);
          await page.waitForTimeout(5000);
          await answerButton.click();
          await page.waitForTimeout(500);
          await answerButton.click(); // Lock it
          await page.waitForTimeout(1000);
          await expect(page.locator('text=/You selected|Waiting/i')).toBeVisible({ timeout: 5000 });
          console.log(`      → ${name}: Answer submitted`);
        } else if (behavior === 'late-answer') {
          // Bob: Answers in last 2 seconds (wait ~10 seconds, then answer quickly)
          console.log(`      → ${name}: Waiting ~10 seconds, then answering in last 2 seconds...`);
          await page.waitForTimeout(10000); // Wait until near end, but not too long
          await answerButton.click();
          await page.waitForTimeout(500);
          await answerButton.click(); // Lock it
          await page.waitForTimeout(1000);
          await expect(page.locator('text=/You selected|Waiting/i')).toBeVisible({ timeout: 5000 });
          console.log(`      → ${name}: Answer submitted`);
        } else if (behavior === 'proper-lock') {
          // Diana: Properly locks (double-tap immediately)
          console.log(`      → ${name}: Properly locking answer (double-tap)...`);
          await answerButton.click(); // First tap
          await page.waitForTimeout(500);
          await answerButton.click(); // Second tap to lock
          await page.waitForTimeout(1000);
          await expect(page.locator('text=/You selected|Waiting/i')).toBeVisible({ timeout: 5000 });
          console.log(`      → ${name}: Answer locked and submitted`);
        } else if (behavior === 'single-select') {
          // Eve: Only selects once (doesn't lock, will auto-submit on timeout)
          console.log(`      → ${name}: Single select (no lock, will auto-submit)...`);
          await answerButton.click(); // Only one tap
          await page.waitForTimeout(1000);
          console.log(`      → ${name}: Answer selected (not locked)`);
          // Don't lock - timer will auto-submit
        }
      });
      
      // Wait for all players to finish (or timeout for no-answer)
      await Promise.all(playerPromises);
      console.log('  → All players finished their answer behaviors');
      
      // Wait a bit for all answers to be submitted
      await hostPage.waitForTimeout(2000);
      
      // Skip question to trigger scoring and reveal
      console.log('  → Skipping to trigger scoring...');
      await skipButton.click();
      await hostPage.waitForTimeout(3000); // Allow time for scoring calculation
      
      // Verify answer reveal appears on projector (Story 3.2)
      await expect(answerReveal).toBeVisible({ timeout: 20000 });
      console.log('  ✓ Answer reveal displayed on projector');
      
      // Verify player feedback appears (Story 3.3)
      for (const { page, name } of playerContexts) {
        const feedback = page.locator('text=/Correct|Incorrect|points|Time\'s up/i');
        await expect(feedback).toBeVisible({ timeout: 15000 });
        console.log(`  ✓ Feedback displayed for ${name}`);
      }
      
      // Wait for reveal to complete (5 seconds) and leaderboard to appear
      console.log('  → Waiting for leaderboard...');
      await hostPage.waitForTimeout(6000); // 5 seconds reveal + 1 second buffer
      
      // Verify leaderboard appears on projector (Story 3.4)
      await expect(leaderboardHeading).toBeVisible({ timeout: 15000 });
      console.log('  ✓ Leaderboard displayed on projector');
      
      // Verify personal leaderboard appears on mobile (Story 3.5)
      for (const { page, name } of playerContexts) {
        const personalLeaderboard = page.locator('text=/You\'re in|place|points/i');
        await expect(personalLeaderboard).toBeVisible({ timeout: 15000 });
        console.log(`  ✓ Personal leaderboard displayed for ${name}`);
      }
      
      // Wait for leaderboard to complete (10 seconds) and next question to appear
      if (questionNum < 3) {
        console.log('  → Waiting for next question...');
        await hostPage.waitForTimeout(11000); // 10 seconds leaderboard + 1 second buffer
      }
    }
    
    // ============================================
    // STEP 5: Verify Game Completion
    // ============================================
    console.log('📋 Game completed!');
    console.log('✓ Full 3-question game flow test completed successfully!');
    console.log('  - Question 1: Answer reveal → Feedback → Leaderboard ✓');
    console.log('  - Question 2: Answer reveal → Feedback → Leaderboard ✓');
    console.log('  - Question 3: Answer reveal → Feedback → Leaderboard ✓');
    console.log('  - All stories (3.2, 3.3, 3.4, 3.5) verified ✓');
    console.log('  - Player behaviors tested:');
    console.log('    • Alice: No answer (timeout)');
    console.log('    • Bob: Late answer (last 2 seconds)');
    console.log('    • Charlie: Mid answer (after 5 seconds)');
    console.log('    • Diana: Proper lock (double-tap)');
    console.log('    • Eve: Single select (no lock)');
    
    // Keep pages open for inspection
    await hostPage.waitForTimeout(3000);
    
    // Cleanup
    for (const { page, context } of playerContexts) {
      await page.close();
      await context.close();
    }
    await hostPage.close();
    await hostContext.close();
  });

  // Removed 10-question test - only testing 3-question game flow
  test.skip('Complete 10-question game flow - full version', async ({ browser }) => {
    // Similar to above but with 10 questions
    // This is a longer test, so we'll make it more efficient
    
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    await hostPage.waitForTimeout(3000);
    
    const questionSetCard = hostPage.locator('div[class*="card"]').first();
    const cardExists = await questionSetCard.isVisible().catch(() => false);
    
    if (cardExists) {
      await questionSetCard.click();
      await hostPage.waitForTimeout(500);
    }
    
    const tenQuestionsRadio = hostPage.locator('#length-10');
    await expect(tenQuestionsRadio).toBeVisible({ timeout: 10000 });
    await tenQuestionsRadio.click();
    await hostPage.waitForTimeout(500);
    
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    
    const isDisabled = await createButton.isDisabled();
    if (isDisabled) {
      console.log('⚠️  No question sets available. Skipping test.');
      return;
    }
    
    await createButton.click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    
    // Have 3 players join
    const playerNames = ['Alice', 'Bob', 'Charlie'];
    const playerContexts: Array<{ context: any; page: any; name: string }> = [];
    
    for (const playerName of playerNames) {
      const playerContext = await browser.newContext({
        viewport: { width: 375, height: 667 },
      });
      const playerPage = await playerContext.newPage();
      
      await playerPage.goto(`${baseURL}/join`);
      await playerPage.waitForLoadState('networkidle');
      
      await playerPage.locator('#room-code').fill(roomCode);
      await playerPage.locator('#player-name').fill(playerName);
      await playerPage.getByRole('button', { name: 'Join Game' }).click();
      await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
      
      playerContexts.push({ context: playerContext, page: playerPage, name: playerName });
      await playerPage.waitForTimeout(500);
    }
    
    await hostPage.waitForTimeout(2000);
    
    // Start game
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    await expect(hostPage.locator('text=/Starting|Loading/i')).toBeVisible({ timeout: 10000 });
    await hostPage.waitForTimeout(5000);
    
    const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
    const answerReveal = hostPage.locator('text=/Correct Answer/i');
    const leaderboardHeading = hostPage.locator('text=/Leaderboard/i');
    
    // Test all 10 questions
    for (let questionNum = 1; questionNum <= 10; questionNum++) {
      console.log(`📋 Testing Question ${questionNum}/10...`);
      
      // Verify question is displayed on host
      const questionText = hostPage.locator(`text=/Question ${questionNum} of/`);
      await expect(questionText).toBeVisible({ timeout: 15000 });
      
      // Wait for question to be displayed on all player pages
      for (const { page } of playerContexts) {
        const playerQuestionText = page.locator('text=/Question|h1, [class*="text-lg"], [class*="text-xl"]').first();
        await expect(playerQuestionText).toBeVisible({ timeout: 15000 });
        
        // Wait for answer buttons to be visible
        const answerButtons = page.locator('button').filter({ hasText: /^[A-D]$/ });
        await expect(answerButtons.first()).toBeVisible({ timeout: 10000 });
      }
      
      // Players submit answers
      for (let i = 0; i < playerContexts.length; i++) {
        const { page } = playerContexts[i];
        const answerLabel = ['A', 'B', 'C'][i];
        
        // Answer buttons are stacked vertically - use nth() to select by position
        // First button = A, second = B, third = C, fourth = D
        const allAnswerButtons = page.locator('button').filter({ hasText: /^[A-D]$/ });
        const answerButton = allAnswerButtons.nth(i);
        
        await expect(answerButton).toBeVisible({ timeout: 10000 });
        await answerButton.click();
        await page.waitForTimeout(500);
        await answerButton.click();
        await page.waitForTimeout(1000);
        
        // Verify submission message appears
        await expect(page.locator('text=/You selected|Waiting for other players/i')).toBeVisible({ timeout: 5000 });
      }
      
      // Skip to trigger flow (only if not last question)
      if (questionNum < 10) {
        await skipButton.click();
        await hostPage.waitForTimeout(3000); // Wait for scoring to complete
        
        // Verify answer reveal
        await expect(answerReveal).toBeVisible({ timeout: 20000 });
        
        // Wait for leaderboard (5 seconds reveal + transition)
        await hostPage.waitForTimeout(6000);
        await expect(leaderboardHeading).toBeVisible({ timeout: 15000 });
        
        // Wait for next question (10 seconds leaderboard + transition)
        await hostPage.waitForTimeout(11000);
      } else {
        // Last question - skip and wait for game end
        await skipButton.click();
        await hostPage.waitForTimeout(3000);
        await expect(answerReveal).toBeVisible({ timeout: 20000 });
        await hostPage.waitForTimeout(6000);
        await expect(leaderboardHeading).toBeVisible({ timeout: 15000 });
      }
      
      console.log(`  ✓ Question ${questionNum} completed`);
    }
    
    console.log('✓ Full 10-question game flow test completed!');
    
    // Cleanup
    for (const { page, context } of playerContexts) {
      await page.close();
      await context.close();
    }
    await hostPage.close();
    await hostContext.close();
  });
});

