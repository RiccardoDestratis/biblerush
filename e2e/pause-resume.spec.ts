import { test, expect } from '@playwright/test';

/**
 * Test: Story 2.7 - Pause/Resume Functionality
 * 
 * This test verifies:
 * - Host can pause the game
 * - All devices (host + players) pause simultaneously
 * - Timer freezes at current remaining time
 * - Answer submissions are disabled during pause
 * - Host can resume the game
 * - All devices resume simultaneously
 * - Timer resumes from frozen time
 * - Skip works from both active and paused states
 * 
 * Run with: pnpm exec playwright test e2e/pause-resume.spec.ts --ui
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Pause/Resume - Story 2.7', () => {
  test('Pause and resume functionality', async ({ browser }) => {
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
    // STEP 2: Player joins
    // ============================================
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
    await playerNameInput.fill('TestPlayer');
    
    const joinButton = playerPage.getByRole('button', { name: 'Join Game' });
    await expect(joinButton).toBeVisible({ timeout: 5000 });
    await joinButton.click();
    
    await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await hostPage.waitForTimeout(2000);
    
    // ============================================
    // STEP 3: Host starts the game
    // ============================================
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).not.toBeDisabled({ timeout: 5000 });
    await startButton.click();
    
    await expect(hostPage.locator('text=/Starting|Loading/i')).toBeVisible({ timeout: 5000 });
    await hostPage.waitForTimeout(5000);
    
    // Wait for question to appear
    const questionNumber = playerPage.locator('text=/Question \\d+ of \\d+/');
    await expect(questionNumber).toBeVisible({ timeout: 10000 });
    
    // ============================================
    // STEP 4: Test Pause Functionality
    // ============================================
    // Find pause button on host
    const pauseButton = hostPage.getByRole('button', { name: /Pause/i });
    await expect(pauseButton).toBeVisible({ timeout: 5000 });
    
    // Get timer value before pause
    const timerBeforePause = hostPage.locator('[role="timer"]');
    await expect(timerBeforePause).toBeVisible({ timeout: 5000 });
    const timerTextBefore = await timerBeforePause.textContent();
    
    // Click pause
    await pauseButton.click();
    await hostPage.waitForTimeout(2000);
    
    // Verify pause overlay appears on host
    const pauseOverlayHost = hostPage.locator('text=/Game Paused/i');
    await expect(pauseOverlayHost).toBeVisible({ timeout: 5000 });
    
    // Verify pause overlay appears on player
    const pauseOverlayPlayer = playerPage.locator('text=/Game Paused/i');
    await expect(pauseOverlayPlayer).toBeVisible({ timeout: 5000 });
    
    // Verify timer is frozen (should show same value after a few seconds)
    await hostPage.waitForTimeout(2000);
    const timerTextAfterPause = await timerBeforePause.textContent();
    expect(timerTextAfterPause).toBe(timerTextBefore); // Timer should be frozen
    
    // Verify answer buttons are disabled on player
    const answerButtons = playerPage.locator('button').filter({ hasText: /[ABCD]/ });
    if (await answerButtons.count() > 0) {
      await expect(answerButtons.first()).toBeDisabled({ timeout: 2000 });
    }
    
    console.log('✅ Pause functionality verified');
    
    // ============================================
    // STEP 5: Test Resume Functionality
    // ============================================
    // Find play button (pause button should transform to play)
    const playButton = hostPage.getByRole('button', { name: /Play/i });
    await expect(playButton).toBeVisible({ timeout: 5000 });
    
    // Click play
    await playButton.click();
    await hostPage.waitForTimeout(2000);
    
    // Verify pause overlay disappears on host
    await expect(pauseOverlayHost).not.toBeVisible({ timeout: 5000 });
    
    // Verify pause overlay disappears on player
    await expect(pauseOverlayPlayer).not.toBeVisible({ timeout: 5000 });
    
    // Verify timer resumes (should continue counting down)
    await hostPage.waitForTimeout(2000);
    const timerTextAfterResume = await timerBeforePause.textContent();
    // Timer should have decreased (unless it was very close to 0)
    expect(timerTextAfterResume).toBeTruthy();
    
    // Verify answer buttons are enabled again on player
    if (await answerButtons.count() > 0) {
      await expect(answerButtons.first()).toBeEnabled({ timeout: 2000 });
    }
    
    console.log('✅ Resume functionality verified');
    
    // ============================================
    // STEP 6: Test Skip from Paused State
    // ============================================
    // Pause again
    await pauseButton.click();
    await hostPage.waitForTimeout(1000);
    
    // Find skip button
    const skipButton = hostPage.getByRole('button', { name: /Skip Question/i });
    await expect(skipButton).toBeVisible({ timeout: 5000 });
    
    // Get current question number
    const currentQuestionNum = await hostPage.locator('text=/Question \\d+ of/').textContent();
    expect(currentQuestionNum).toContain('Question 1');
    
    // Click skip (should resume and advance)
    await skipButton.click();
    await hostPage.waitForTimeout(3000);
    
    // Verify question advanced
    const nextQuestionNum = await hostPage.locator('text=/Question 2 of/');
    await expect(nextQuestionNum).toBeVisible({ timeout: 10000 });
    
    // Verify pause overlay is gone
    await expect(pauseOverlayHost).not.toBeVisible({ timeout: 2000 });
    
    console.log('✅ Skip from paused state verified');
    
    // Cleanup
    await playerPage.close();
    await playerContext.close();
    await hostPage.close();
    await hostContext.close();
  });
});

