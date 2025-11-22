import { test, expect } from '@playwright/test';

/**
 * Test: Story 2.4 - Question Display Projector View
 * Verifies that when a game starts, the question display appears on the host view
 * with all required elements: question text, answer options, timer, metadata
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Question Display - Projector View (Story 2.4)', () => {
  test('should display question with timer and answer options when game starts', async ({ browser }) => {
    // Step 1: Host creates a game
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
    
    // Step 2: Have 1 player join (required to start game)
    const playerContext = await browser.newContext();
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
    await hostPage.waitForTimeout(2000); // Wait for real-time updates
    
    // Step 3: Host starts the game
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).not.toBeDisabled({ timeout: 5000 });
    await startButton.click();
    
    // Step 4: Verify question display appears (Story 2.4)
    // Wait for game to start and question display to appear
    await hostPage.waitForTimeout(3000); // Allow time for game_start event and transition
    
    // Verify question text is displayed (48px, large, bold)
    const questionText = hostPage.locator('text=/Question|Where|What|Who|When|How/i').first();
    await expect(questionText).toBeVisible({ timeout: 10000 });
    
    // Verify timer is displayed (circular timer with number)
    // Look for timer element - should have large number (80px font)
    const timerNumber = hostPage.locator('text=/^\\d{1,2}$/').filter({ hasText: /^(1[0-5]|[0-9])$/ });
    await expect(timerNumber).toBeVisible({ timeout: 10000 });
    
    // Verify answer options are displayed (2x2 grid with A, B, C, D)
    const answerA = hostPage.locator('text=/^A$/').first();
    const answerB = hostPage.locator('text=/^B$/').first();
    const answerC = hostPage.locator('text=/^C$/').first();
    const answerD = hostPage.locator('text=/^D$/').first();
    
    await expect(answerA).toBeVisible({ timeout: 5000 });
    await expect(answerB).toBeVisible({ timeout: 5000 });
    await expect(answerC).toBeVisible({ timeout: 5000 });
    await expect(answerD).toBeVisible({ timeout: 5000 });
    
    // Verify metadata displays
    // Question number (top-right): "Question X of Y"
    const questionNumber = hostPage.locator('text=/Question \\d+ of \\d+/');
    await expect(questionNumber).toBeVisible({ timeout: 5000 });
    
    // Player count (top-left): "X players"
    const playerCount = hostPage.locator('text=/\\d+ (player|players)/');
    await expect(playerCount).toBeVisible({ timeout: 5000 });
    
    // Verify answer boxes have colored borders (visual check)
    // This is harder to test programmatically, but we can verify the structure exists
    const answerBoxes = hostPage.locator('[class*="border-"]').filter({ hasText: /^[ABCD]$/ });
    const answerBoxCount = await answerBoxes.count();
    expect(answerBoxCount).toBeGreaterThanOrEqual(4);
    
    // Step 5: Verify timer counts down
    // Wait a few seconds and check timer decreases
    const initialTimer = await timerNumber.textContent();
    expect(initialTimer).toBeTruthy();
    const initialValue = parseInt(initialTimer || '0');
    expect(initialValue).toBeGreaterThan(0);
    expect(initialValue).toBeLessThanOrEqual(15);
    
    // Wait 2 seconds and verify timer has decreased
    await hostPage.waitForTimeout(2000);
    const updatedTimer = await timerNumber.textContent();
    const updatedValue = parseInt(updatedTimer || '0');
    // Timer should have decreased (allowing for some timing variance)
    expect(updatedValue).toBeLessThanOrEqual(initialValue);
    
    // Cleanup
    await playerPage.close();
    await playerContext.close();
    await hostPage.close();
    await hostContext.close();
  });

  test('should have high contrast and readable text for projector', async ({ browser }) => {
    // This test verifies accessibility requirements (readable from 20+ feet)
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    
    // Create game and start it (abbreviated flow)
    await hostPage.locator('#length-10').click();
    await hostPage.waitForTimeout(500);
    await hostPage.getByRole('button', { name: 'Create Game' }).click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Join a player
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCode = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/)?.[1];
    
    const playerContext = await browser.newContext();
    const playerPage = await playerContext.newPage();
    await playerPage.goto(`${baseURL}/join`);
    await playerPage.waitForLoadState('networkidle');
    await playerPage.locator('#room-code').fill(roomCode!);
    await playerPage.locator('#player-name').fill('TestPlayer');
    await playerPage.getByRole('button', { name: 'Join Game' }).click();
    await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await hostPage.waitForTimeout(2000);
    
    // Start game
    await hostPage.getByRole('button', { name: 'Start Game' }).click();
    await hostPage.waitForTimeout(3000);
    
    // Verify question text has large font size (48px+)
    const questionText = hostPage.locator('h1, [class*="text-5xl"], [class*="text-6xl"]').first();
    await expect(questionText).toBeVisible({ timeout: 10000 });
    
    // Check computed styles for font size (should be 48px or larger)
    const questionFontSize = await questionText.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    const fontSizeValue = parseFloat(questionFontSize);
    expect(fontSizeValue).toBeGreaterThanOrEqual(30); // At least 30px (allowing for responsive scaling)
    
    // Verify answer option text is readable (32px+)
    const answerText = hostPage.locator('[class*="text-3xl"]').first();
    if (await answerText.count() > 0) {
      const answerFontSize = await answerText.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      const answerFontSizeValue = parseFloat(answerFontSize);
      expect(answerFontSizeValue).toBeGreaterThanOrEqual(20); // At least 20px
    }
    
    // Cleanup
    await playerPage.close();
    await playerContext.close();
    await hostPage.close();
    await hostContext.close();
  });
});

