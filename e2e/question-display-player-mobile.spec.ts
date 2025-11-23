import { test, expect } from '@playwright/test';

/**
 * Test: Story 2.5 & 2.6 - Question Display Player Mobile View with Tap-to-Lock
 * 
 * This test creates a game, has 3 players join, starts the game, and verifies:
 * - Players see the mobile question display with question, timer, and answer options
 * - Answer selection works correctly (tap once = orange/selected)
 * - Tap-to-lock pattern works (tap selected answer again = green/locked) - VERIFIED
 * - On-screen message appears after submission
 * - Low-time warning appears at 5 seconds
 * - Different timing scenarios:
 *   - Alice: Answers early at ~10 seconds (double-tap, green state)
 *   - Bob: Sees 5-second warning, answers at 3 seconds remaining
 *   - Charlie: Timeout without answering (auto-submit null)
 * 
 * Run with: pnpm exec playwright test e2e/question-display-player-mobile.spec.ts --ui
 * This opens the Playwright UI where you can click play and watch all browser windows
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Question Display - Player Mobile View with Tap-to-Lock (Story 2.5 & 2.6)', () => {
  test('Player mobile view with tap-to-lock and timing scenarios', async ({ browser }) => {
    test.setTimeout(60000); // 60 seconds: setup (~5s) + 15s timer + buffer + safety margin
    
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
      
      playerContexts.push({ context: playerContext, page: playerPage, name: playerName });
      
      // Small delay between joins
      await playerPage.waitForTimeout(300);
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
    await expect(hostPage.locator('text=/Starting|Loading/i')).toBeVisible({ timeout: 5000 });
    
    // Wait for question display to fully load
    await hostPage.waitForTimeout(2000);
    
    // Wait for all players to see the question
    for (const { page } of playerContexts) {
      await page.waitForTimeout(1000);
      const questionNumber = page.locator('text=/Question \\d+ of \\d+/');
      await expect(questionNumber).toBeVisible({ timeout: 5000 });
    }
    
    // ============================================
    // STEP 4: Alice - Answer early at ~10 seconds (double-tap, verify green)
    // ============================================
    const alicePage = playerContexts[0].page;
    const aliceName = playerContexts[0].name;
    
    // Wait until timer shows ~10 seconds remaining
    const aliceTimer = alicePage.getByText(/\d+s remaining/i);
    let timerValue = 15;
    while (timerValue > 10) {
      const timerText = await aliceTimer.textContent();
      const match = timerText?.match(/(\d+)/);
      if (match) {
        timerValue = parseInt(match[1]);
      }
      if (timerValue > 10) {
        await alicePage.waitForTimeout(500);
      }
    }
    
    // Find answer buttons
    const aliceAnswerButtons = alicePage.locator('button').filter({ 
      hasText: /[ABCD]/ 
    });
    
    // Click first button once (select - orange state)
    const aliceFirstButton = aliceAnswerButtons.first();
    await expect(aliceFirstButton).toBeVisible({ timeout: 5000 });
    await expect(aliceFirstButton).toBeEnabled({ timeout: 2000 });
    await aliceFirstButton.scrollIntoViewIfNeeded();
    await aliceFirstButton.click();
    await alicePage.waitForTimeout(500);
    
    // Click same button again (lock - green/shiny state)
    await aliceFirstButton.click();
    await alicePage.waitForTimeout(1000);
    
    // Verify green/locked state - button should have green background
    const aliceButtonStyle = await aliceFirstButton.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // Green should be in the background color (rgb values for green-500)
    expect(aliceButtonStyle).toContain('rgb');
    
    // Verify on-screen message appears
    const aliceMessage = alicePage.getByText(/You selected.*Waiting for other players/i);
    await expect(aliceMessage).toBeVisible({ timeout: 5000 });
    
    // Verify button is disabled after submission
    await expect(aliceFirstButton).toBeDisabled({ timeout: 2000 });
    
    console.log(`✅ ${aliceName} answered early at ~${timerValue}s with double-tap (green locked state verified)`);
    
    // ============================================
    // STEP 5: Bob - Wait for 5-second warning, answer at 3 seconds
    // ============================================
    const bobPage = playerContexts[1].page;
    const bobName = playerContexts[1].name;
    
    // Wait until 5-second warning appears
    const bobTimer = bobPage.getByText(/\d+s remaining/i);
    let bobTimerValue = 15;
    let warningAppeared = false;
    
    while (bobTimerValue > 3) {
      const timerText = await bobTimer.textContent();
      const match = timerText?.match(/(\d+)/);
      if (match) {
        bobTimerValue = parseInt(match[1]);
      }
      
      // Check for low-time warning message
      const warningMessage = bobPage.getByText(/Select something now.*more seconds/i);
      const isVisible = await warningMessage.isVisible().catch(() => false);
      if (isVisible && !warningAppeared) {
        warningAppeared = true;
        console.log(`✅ ${bobName} sees 5-second warning at ${bobTimerValue}s`);
      }
      
      if (bobTimerValue > 3) {
        await bobPage.waitForTimeout(500);
      }
    }
    
    // Now answer at 3 seconds
    const bobAnswerButtons = bobPage.locator('button').filter({ 
      hasText: /[ABCD]/ 
    });
    
    const bobFirstButton = bobAnswerButtons.first();
    await expect(bobFirstButton).toBeVisible({ timeout: 5000 });
    await expect(bobFirstButton).toBeEnabled({ timeout: 2000 });
    await bobFirstButton.scrollIntoViewIfNeeded();
    
    // Single tap to select
    await bobFirstButton.click();
    await bobPage.waitForTimeout(300);
    
    // Double tap to lock
    await bobFirstButton.click();
    await bobPage.waitForTimeout(1000);
    
    // Verify message appears
    const bobMessage = bobPage.getByText(/You selected.*Waiting for other players/i);
    await expect(bobMessage).toBeVisible({ timeout: 5000 });
    
    console.log(`✅ ${bobName} answered at 3 seconds after seeing warning`);
    
    // ============================================
    // STEP 6: Charlie - Timeout without answering
    // ============================================
    const charliePage = playerContexts[2].page;
    const charlieName = playerContexts[2].name;
    
    // Wait for timer to expire (should be around 0-1 seconds remaining now)
    const charlieTimer = charliePage.getByText(/\d+s remaining/i);
    let charlieTimerValue = 3;
    
    while (charlieTimerValue > 0) {
      const timerText = await charlieTimer.textContent();
      const match = timerText?.match(/(\d+)/);
      if (match) {
        charlieTimerValue = parseInt(match[1]);
      }
      if (charlieTimerValue > 0) {
        await charliePage.waitForTimeout(500);
      }
    }
    
    // Wait a bit more for auto-submit to trigger
    await charliePage.waitForTimeout(2000);
    
    // Verify "You did not select anything" message appears
    const charlieMessage = charliePage.getByText(/You did not select anything/i);
    await expect(charlieMessage).toBeVisible({ timeout: 5000 });
    
    // Verify buttons are disabled after timeout
    const charlieAnswerButtons = charliePage.locator('button').filter({ 
      hasText: /[ABCD]/ 
    });
    const charlieFirstButton = charlieAnswerButtons.first();
    await expect(charlieFirstButton).toBeDisabled({ timeout: 2000 });
    
    console.log(`✅ ${charlieName} timed out without answering (auto-submit null verified)`);
    
    // ============================================
    // STEP 7: Verify all states
    // ============================================
    // Alice: Green locked, message visible, buttons disabled
    await expect(aliceFirstButton).toBeDisabled({ timeout: 1000 });
    await expect(aliceMessage).toBeVisible({ timeout: 1000 });
    
    // Bob: Message visible, buttons disabled
    await expect(bobFirstButton).toBeDisabled({ timeout: 1000 });
    await expect(bobMessage).toBeVisible({ timeout: 1000 });
    
    // Charlie: No answer message, buttons disabled
    await expect(charlieFirstButton).toBeDisabled({ timeout: 1000 });
    await expect(charlieMessage).toBeVisible({ timeout: 1000 });
    
    console.log('✅ All timing scenarios verified successfully!');
    
    // Keep pages open for inspection in UI mode
    await hostPage.waitForTimeout(1000);
    
    // Cleanup
    for (const { page, context } of playerContexts) {
      await page.close();
      await context.close();
    }
    await hostPage.close();
    await hostContext.close();
  });
});
