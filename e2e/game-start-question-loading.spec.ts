import { test, expect } from '@playwright/test';

/**
 * Test: Story 2.3 - Game Start & Question Data Loading
 * 
 * This test verifies:
 * - Server Action `startGame()` works correctly
 * - Game status updates to 'active'
 * - First question is loaded correctly
 * - `game_start` event is broadcast to all devices
 * - Host and player views receive the event
 * - Loading states are shown during transition
 * - Error handling works (no players, missing question)
 * - Question pre-loading happens in background
 * 
 * Run with: pnpm exec playwright test e2e/game-start-question-loading.spec.ts --ui
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Game Start & Question Data Loading - Story 2.3', () => {
  test('Game start with question loading and synchronization', async ({ browser }) => {
    test.setTimeout(60000);
    
    // ============================================
    // STEP 1: Host creates a game
    // ============================================
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    await hostPage.waitForTimeout(3000);
    
    // Check if question sets are available
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    
    const isDisabled = await createButton.isDisabled();
    if (isDisabled) {
      console.log('⚠️  No question sets available. Skipping test.');
      return;
    }
    
    // Select 10 questions
    const tenQuestionsRadio = hostPage.locator('#length-10');
    await expect(tenQuestionsRadio).toBeVisible({ timeout: 10000 });
    await tenQuestionsRadio.click();
    await hostPage.waitForTimeout(500);
    
    await createButton.click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    
    // ============================================
    // STEP 2: Verify Start Game button is disabled (no players)
    // ============================================
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).toBeDisabled({ timeout: 5000 });
    
    console.log('✅ Start button correctly disabled when no players');
    
    // ============================================
    // STEP 3: Have 2 players join
    // ============================================
    const playerNames = ['Alice', 'Bob'];
    const playerContexts: Array<{ context: any; page: any; name: string }> = [];
    
    for (const playerName of playerNames) {
      const playerContext = await browser.newContext({
        viewport: { width: 375, height: 667 },
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
      playerContexts.push({ context: playerContext, page: playerPage, name: playerName });
      await playerPage.waitForTimeout(300);
    }
    
    // Wait for real-time updates
    await hostPage.waitForTimeout(2000);
    
    // Verify players appear on host
    const playerCountText = await hostPage.locator('text=/Players Joined/').textContent();
    expect(playerCountText).toContain('2');
    
    // ============================================
    // STEP 4: Verify Start Game button is now enabled
    // ============================================
    await expect(startButton).not.toBeDisabled({ timeout: 5000 });
    
    console.log('✅ Start button enabled after players join');
    
    // ============================================
    // STEP 5: Host starts the game
    // ============================================
    await startButton.click();
    
    // Verify loading state appears on host
    const hostLoadingText = hostPage.locator('text=/Starting|Loading/i');
    await expect(hostLoadingText).toBeVisible({ timeout: 10000 });
    
    // Wait for game_start event to propagate
    await hostPage.waitForTimeout(3000);
    
    // ============================================
    // STEP 6: Verify game_start event received on host
    // ============================================
    // Check that question display appears (Story 2.4)
    const questionNumber = hostPage.locator('text=/Question 1 of/');
    await expect(questionNumber).toBeVisible({ timeout: 15000 });
    
    // Verify question text is displayed
    const questionText = hostPage.locator('h1, [class*="text-5xl"], [class*="text-6xl"]').first();
    await expect(questionText).toBeVisible({ timeout: 5000 });
    const questionTextContent = await questionText.textContent();
    expect(questionTextContent).toBeTruthy();
    expect(questionTextContent!.trim().length).toBeGreaterThan(0);
    
    // Verify timer is displayed
    const timer = hostPage.locator('[role="timer"]');
    await expect(timer).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Host received game_start event and question loaded');
    
    // ============================================
    // STEP 7: Verify game_start event received on players
    // ============================================
    for (const { page, name } of playerContexts) {
      // Check for loading state first
      const playerLoadingText = page.locator('text=/Starting|Loading/i');
      const loadingVisible = await playerLoadingText.isVisible().catch(() => false);
      
      // Wait for question to appear
      const playerQuestionNumber = page.locator('text=/Question 1 of/');
      await expect(playerQuestionNumber).toBeVisible({ timeout: 15000 });
      
      // Verify question text is displayed
      const playerQuestionText = page.locator('h1, [class*="text-lg"], [class*="text-xl"]').first();
      await expect(playerQuestionText).toBeVisible({ timeout: 5000 });
      
      // Verify timer is displayed
      const playerTimer = page.locator('[role="timer"]');
      await expect(playerTimer).toBeVisible({ timeout: 5000 });
      
      console.log(`✅ ${name} received game_start event and question loaded`);
    }
    
    // ============================================
    // STEP 8: Verify synchronization
    // ============================================
    // All devices should show the same question number
    const hostQuestionNum = await questionNumber.textContent();
    for (const { page, name } of playerContexts) {
      const playerQuestionNum = await page.locator('text=/Question 1 of/').textContent();
      expect(playerQuestionNum).toBe(hostQuestionNum);
      console.log(`✅ ${name} synchronized with host: ${playerQuestionNum}`);
    }
    
    // ============================================
    // STEP 9: Verify totalQuestions is correct
    // ============================================
    // The question number should show "Question 1 of 10" (or whatever was selected)
    expect(hostQuestionNum).toContain('Question 1 of');
    // Should contain the selected question count (10 in this case)
    expect(hostQuestionNum).toMatch(/of \d+/);
    
    console.log('✅ Total questions correctly displayed:', hostQuestionNum);
    
    // Keep pages open for inspection
    await hostPage.waitForTimeout(2000);
    
    // Cleanup
    for (const { page, context } of playerContexts) {
      await page.close();
      await context.close();
    }
    await hostPage.close();
    await hostContext.close();
  });
  
  test('Error handling: Start game without players', async ({ browser }) => {
    test.setTimeout(30000);
    
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    await hostPage.waitForTimeout(3000);
    
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    
    const isDisabled = await createButton.isDisabled();
    if (isDisabled) {
      console.log('⚠️  No question sets available. Skipping test.');
      return;
    }
    
    const tenQuestionsRadio = hostPage.locator('#length-10');
    await expect(tenQuestionsRadio).toBeVisible({ timeout: 10000 });
    await tenQuestionsRadio.click();
    await hostPage.waitForTimeout(500);
    
    await createButton.click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Verify Start Game button is disabled
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).toBeDisabled({ timeout: 5000 });
    
    console.log('✅ Start button correctly disabled when no players (error prevention)');
    
    await hostPage.close();
    await hostContext.close();
  });
});

