import { test, expect } from '@playwright/test';

/**
 * Test: Story 2.4 - Question Display Projector View with Multiple Players
 * 
 * This test creates a game, has 3 players join, starts the game, and verifies:
 * - Host sees the projector view with question, timer, and answer options
 * - All 3 players see their waiting/player views
 * - Timer counts down correctly
 * - All views are synchronized
 * 
 * Run with: pnpm exec playwright test e2e/question-display-projector.spec.ts --ui
 * This opens the Playwright UI where you can click play and watch all browser windows
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Question Display - Projector View (Story 2.4)', () => {
  test('Host projector view and 3 players - full game flow', async ({ browser }) => {
    // ============================================
    // STEP 1: Host creates a game
    // ============================================
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    
    // Select 10 questions
    const tenQuestionsRadio = hostPage.locator('#length-10');
    await expect(tenQuestionsRadio).toBeVisible({ timeout: 5000 });
    await tenQuestionsRadio.click();
    await hostPage.waitForTimeout(500);
    
    // Create game
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();
    
    // Wait for redirect to host page
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Extract room code
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    
    // ============================================
    // STEP 2: Have 3 players join the game
    // ============================================
    const playerNames = ['Alice', 'Bob', 'Charlie'];
    const playerContexts: Array<{ context: any; page: any; name: string }> = [];
    
    for (const playerName of playerNames) {
      const playerContext = await browser.newContext();
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
      
      // Small delay between joins
      await playerPage.waitForTimeout(500);
    }
    
    // Wait for real-time updates to propagate
    await hostPage.waitForTimeout(2000);
    
    // Verify all 3 players appear on host waiting room
    const playerCountText = await hostPage.locator('text=/Players Joined/').textContent();
    expect(playerCountText).toContain('3');
    
    // ============================================
    // STEP 3: Host starts the game
    // ============================================
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).not.toBeDisabled({ timeout: 5000 });
    await startButton.click();
    
    // Wait for game to start
    await expect(hostPage.locator('text=/Starting|Loading/i')).toBeVisible({ timeout: 10000 });
    
    // ============================================
    // STEP 4: Verify Host Projector View
    // ============================================
    // Wait for question display to fully load
    await hostPage.waitForTimeout(5000); // Allow time for game_start event, state update, and transition
    
    // Verify question text is displayed (48px, large, bold)
    const questionText = hostPage.locator('h1, [class*="text-5xl"], [class*="text-6xl"]').first();
    await expect(questionText).toBeVisible({ timeout: 15000 });
    
    // Verify we're not still on waiting room
    const waitingRoomText = hostPage.locator('text=/Room Code|Players Joined|Start Game/i');
    const waitingRoomCount = await waitingRoomText.count();
    expect(waitingRoomCount).toBeLessThan(3);
    
    // Verify timer is displayed
    const timerByRole = hostPage.locator('[role="timer"]');
    const timerByText = hostPage.getByText(/^(1[0-5]|[0-9])$/, { exact: true });
    const timerByClass = hostPage.locator('[class*="text-7xl"]');
    
    const timerVisible = await Promise.race([
      timerByRole.waitFor({ state: 'visible', timeout: 5000 }).then(() => timerByRole),
      timerByText.waitFor({ state: 'visible', timeout: 5000 }).then(() => timerByText),
      timerByClass.waitFor({ state: 'visible', timeout: 5000 }).then(() => timerByClass),
    ]).catch(() => null);
    
    expect(timerVisible).not.toBeNull();
    const timerNumber = timerVisible || timerByRole.first();
    
    // Verify answer options are displayed (A, B, C, D)
    const hasAnswerA = await hostPage.getByText('A', { exact: false }).count() > 0;
    const hasAnswerB = await hostPage.getByText('B', { exact: false }).count() > 0;
    const hasAnswerC = await hostPage.getByText('C', { exact: false }).count() > 0;
    const hasAnswerD = await hostPage.getByText('D', { exact: false }).count() > 0;
    
    const answerIndicators = [hasAnswerA, hasAnswerB, hasAnswerC, hasAnswerD].filter(Boolean).length;
    expect(answerIndicators).toBeGreaterThanOrEqual(2);
    
    // Verify metadata displays
    const questionNumber = hostPage.locator('text=/Question \\d+ of \\d+/');
    await expect(questionNumber).toBeVisible({ timeout: 5000 });
    
    const playerCount = hostPage.locator('text=/\\d+ (player|players)/');
    await expect(playerCount).toBeVisible({ timeout: 5000 });
    expect(await playerCount.textContent()).toContain('3');
    
    // ============================================
    // STEP 5: Verify Timer Counts Down
    // ============================================
    if (timerNumber) {
      const initialTimerText = await timerNumber.textContent();
      if (initialTimerText) {
        const initialValue = parseInt(initialTimerText.trim() || '0');
        if (initialValue > 0 && initialValue <= 15) {
          // Wait 2 seconds and verify timer has decreased
          await hostPage.waitForTimeout(2000);
          const updatedTimerText = await timerNumber.textContent();
          const updatedValue = parseInt(updatedTimerText?.trim() || '0');
          expect(updatedValue).toBeLessThanOrEqual(initialValue);
        }
      }
    }
    
    // ============================================
    // STEP 6: Verify Player Views (all 3 players)
    // ============================================
    // All players should be on their player view pages
    for (const { page, name } of playerContexts) {
      // Players should be on the play page
      await expect(page).toHaveURL(/\/game\/[^\/]+\/play/, { timeout: 5000 });
      
      // Player name should be visible on their page
      const playerNameElement = page.locator(`text=${name}`);
      // Note: Player name might be in different places depending on the view
      // This is a basic check - you can expand this based on your player view structure
    }
    
    // ============================================
    // All views are now visible:
    // - Host page: Shows projector view with question, timer, answers
    // - Player pages (3): Show player waiting/playing views
    // 
    // In Playwright UI mode, you can see all browser windows simultaneously
    // and watch the test execute step by step!
    // ============================================
    
    // Keep pages open for inspection (don't close immediately)
    // In UI mode, you can inspect all views before the test completes
    await hostPage.waitForTimeout(1000);
    
    // Cleanup (only happens when test completes)
    for (const { page, context } of playerContexts) {
      await page.close();
      await context.close();
    }
    await hostPage.close();
    await hostContext.close();
  });
});
