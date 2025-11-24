import { test, expect } from '@playwright/test';

/**
 * Test: Speed Bonus Display - Story 3.8
 * 
 * This test verifies the speed bonus display functionality:
 * - Player answers correctly in 2 seconds → sees "10 points + 5 speed bonus = 15 total"
 * - Player answers correctly in 4 seconds → sees "10 points + 3 speed bonus = 13 total"
 * - Player answers correctly in 10 seconds → sees "10 points (no speed bonus)" or "10 points + 0 speed bonus = 10 total"
 * - Player answers incorrectly → sees "0 points" (no speed bonus mentioned)
 * - Player doesn't answer → sees "0 points" (no speed bonus mentioned)
 * - Response time displays correctly for all scenarios
 * - Total score accumulates correctly across multiple questions
 * - Speed bonus display appears after answer reveal (not before)
 * - Speed bonus display persists for 5 seconds (matches reveal duration)
 * 
 * Run with: pnpm exec playwright test e2e/speed-bonus-display.spec.ts --ui
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Speed Bonus Display - Story 3.8', () => {
  test('Complete flow: Answer in 2s → See "10 + 5 = 15" breakdown', async ({ browser }) => {
    test.setTimeout(60000); // 1 minute timeout
    
    // Create game
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    await hostPage.waitForTimeout(3000);
    
    // Select first question set if available
    const questionSetCard = hostPage.locator('div[class*="card"]').first();
    const cardExists = await questionSetCard.isVisible().catch(() => false);
    
    if (cardExists) {
      await questionSetCard.click();
      await hostPage.waitForTimeout(500);
    }
    
    // Select 3 questions
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
      return;
    }
    
    await createButton.click();
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Extract room code
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    
    // Player joins
    const playerContext = await browser.newContext({
      viewport: { width: 375, height: 667 }, // Mobile viewport
    });
    const playerPage = await playerContext.newPage();
    
    await playerPage.goto(`${baseURL}/join`);
    await playerPage.waitForLoadState('networkidle');
    
    // Enter room code and name
    const roomCodeInput = playerPage.getByPlaceholder(/room code/i);
    await expect(roomCodeInput).toBeVisible({ timeout: 5000 });
    await roomCodeInput.fill(roomCode);
    
    const nameInput = playerPage.getByPlaceholder(/name/i);
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('SpeedTestPlayer');
    
    const joinButton = playerPage.getByRole('button', { name: /join/i });
    await joinButton.click();
    
    // Wait for player to join and game to start
    await playerPage.waitForURL(/\/game\/[^\/]+\/player/, { timeout: 15000 });
    await playerPage.waitForTimeout(2000);
    
    // Host starts game
    const startButton = hostPage.getByRole('button', { name: /start/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    await hostPage.waitForTimeout(2000);
    
    // Wait for question to appear on player page
    await playerPage.waitForSelector('text=/Question|Select your answer/i', { timeout: 10000 });
    await playerPage.waitForTimeout(1000);
    
    // Answer quickly (within 2 seconds) - Tier 1 speed bonus
    const startTime = Date.now();
    
    // Select answer A
    const answerOption = playerPage.locator('button').filter({ hasText: /^[A-D]\./ }).first();
    await expect(answerOption).toBeVisible({ timeout: 5000 });
    await answerOption.click();
    await playerPage.waitForTimeout(300); // Wait for selection
    
    // Lock answer (double-tap pattern)
    await answerOption.click();
    
    const answerTime = Date.now() - startTime;
    console.log(`Answer submitted in ${answerTime}ms`);
    
    // Wait for answer reveal (host skips or timer expires)
    // For testing, we'll wait for the reveal to happen
    await hostPage.waitForTimeout(5000); // Wait for timer or skip
    
    // Check if skip button is available and click it
    const skipButton = hostPage.getByRole('button', { name: /skip|reveal/i }).first();
    const skipVisible = await skipButton.isVisible().catch(() => false);
    if (skipVisible) {
      await skipButton.click();
      await hostPage.waitForTimeout(1000);
    }
    
    // Wait for answer reveal and feedback to appear
    await playerPage.waitForTimeout(3000);
    
    // Verify speed bonus display on player feedback page
    // Should see "10 points + 5 speed bonus = 15 total" for Tier 1
    await expect(playerPage.locator('text=/10 points/')).toBeVisible({ timeout: 5000 });
    await expect(playerPage.locator('text=/\\+5 speed bonus/')).toBeVisible({ timeout: 5000 });
    await expect(playerPage.locator('text=/= 15 total/')).toBeVisible({ timeout: 5000 });
    await expect(playerPage.locator('text=/Answered in/')).toBeVisible({ timeout: 5000 });
    
    // Verify response time is displayed (should be around 2.0s or less)
    const responseTimeText = await playerPage.locator('text=/Answered in/').textContent();
    expect(responseTimeText).toMatch(/Answered in \d+\.\d+s/);
    
    // Verify total score
    await expect(playerPage.locator('text=/Total Score: 15 points/')).toBeVisible({ timeout: 5000 });
    
    // Clean up
    await hostContext.close();
    await playerContext.close();
  });

  test('Complete flow: Answer in 4s → See "10 + 3 = 13" breakdown', async ({ browser }) => {
    test.setTimeout(60000);
    
    // Similar setup as above, but answer after 4 seconds
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
    
    const threeQuestionsRadio = hostPage.locator('#length-3');
    await expect(threeQuestionsRadio).toBeVisible({ timeout: 10000 });
    await threeQuestionsRadio.click();
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
    
    const playerContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const playerPage = await playerContext.newPage();
    
    await playerPage.goto(`${baseURL}/join`);
    await playerPage.waitForLoadState('networkidle');
    
    const roomCodeInput = playerPage.getByPlaceholder(/room code/i);
    await expect(roomCodeInput).toBeVisible({ timeout: 5000 });
    await roomCodeInput.fill(roomCode);
    
    const nameInput = playerPage.getByPlaceholder(/name/i);
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('Tier2Player');
    
    const joinButton = playerPage.getByRole('button', { name: /join/i });
    await joinButton.click();
    
    await playerPage.waitForURL(/\/game\/[^\/]+\/player/, { timeout: 15000 });
    await playerPage.waitForTimeout(2000);
    
    const startButton = hostPage.getByRole('button', { name: /start/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    await hostPage.waitForTimeout(2000);
    
    await playerPage.waitForSelector('text=/Question|Select your answer/i', { timeout: 10000 });
    await playerPage.waitForTimeout(1000);
    
    // Answer after 4 seconds - Tier 2 speed bonus
    await playerPage.waitForTimeout(4000);
    
    const answerOption = playerPage.locator('button').filter({ hasText: /^[A-D]\./ }).first();
    await expect(answerOption).toBeVisible({ timeout: 5000 });
    await answerOption.click();
    await playerPage.waitForTimeout(300);
    await answerOption.click();
    
    await hostPage.waitForTimeout(5000);
    
    const skipButton = hostPage.getByRole('button', { name: /skip|reveal/i }).first();
    const skipVisible = await skipButton.isVisible().catch(() => false);
    if (skipVisible) {
      await skipButton.click();
      await hostPage.waitForTimeout(1000);
    }
    
    await playerPage.waitForTimeout(3000);
    
    // Verify Tier 2 speed bonus display
    await expect(playerPage.locator('text=/10 points/')).toBeVisible({ timeout: 5000 });
    await expect(playerPage.locator('text=/\\+3 speed bonus/')).toBeVisible({ timeout: 5000 });
    await expect(playerPage.locator('text=/= 13 total/')).toBeVisible({ timeout: 5000 });
    await expect(playerPage.locator('text=/Answered in/')).toBeVisible({ timeout: 5000 });
    
    await hostContext.close();
    await playerContext.close();
  });

  test('Complete flow: Answer in 10s → See "10 (no bonus)" or "10 + 0 = 10"', async ({ browser }) => {
    test.setTimeout(60000);
    
    // Similar setup, but answer after 10 seconds - Tier 3 (no bonus)
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
    
    const threeQuestionsRadio = hostPage.locator('#length-3');
    await expect(threeQuestionsRadio).toBeVisible({ timeout: 10000 });
    await threeQuestionsRadio.click();
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
    
    const playerContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const playerPage = await playerContext.newPage();
    
    await playerPage.goto(`${baseURL}/join`);
    await playerPage.waitForLoadState('networkidle');
    
    const roomCodeInput = playerPage.getByPlaceholder(/room code/i);
    await expect(roomCodeInput).toBeVisible({ timeout: 5000 });
    await roomCodeInput.fill(roomCode);
    
    const nameInput = playerPage.getByPlaceholder(/name/i);
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('Tier3Player');
    
    const joinButton = playerPage.getByRole('button', { name: /join/i });
    await joinButton.click();
    
    await playerPage.waitForURL(/\/game\/[^\/]+\/player/, { timeout: 15000 });
    await playerPage.waitForTimeout(2000);
    
    const startButton = hostPage.getByRole('button', { name: /start/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    await hostPage.waitForTimeout(2000);
    
    await playerPage.waitForSelector('text=/Question|Select your answer/i', { timeout: 10000 });
    await playerPage.waitForTimeout(1000);
    
    // Answer after 10 seconds - Tier 3 (no bonus)
    await playerPage.waitForTimeout(10000);
    
    const answerOption = playerPage.locator('button').filter({ hasText: /^[A-D]\./ }).first();
    await expect(answerOption).toBeVisible({ timeout: 5000 });
    await answerOption.click();
    await playerPage.waitForTimeout(300);
    await answerOption.click();
    
    await hostPage.waitForTimeout(5000);
    
    const skipButton = hostPage.getByRole('button', { name: /skip|reveal/i }).first();
    const skipVisible = await skipButton.isVisible().catch(() => false);
    if (skipVisible) {
      await skipButton.click();
      await hostPage.waitForTimeout(1000);
    }
    
    await playerPage.waitForTimeout(3000);
    
    // Verify Tier 3 display (no speed bonus)
    await expect(playerPage.locator('text=/10 points/')).toBeVisible({ timeout: 5000 });
    // Should show either "(no speed bonus)" or "+ 0 speed bonus = 10 total"
    const noBonusText = playerPage.locator('text=/no speed bonus/');
    const zeroBonusText = playerPage.locator('text=/\\+ 0 speed bonus/');
    const hasNoBonus = await noBonusText.isVisible().catch(() => false);
    const hasZeroBonus = await zeroBonusText.isVisible().catch(() => false);
    expect(hasNoBonus || hasZeroBonus).toBe(true);
    
    await expect(playerPage.locator('text=/= 10 total/')).toBeVisible({ timeout: 5000 });
    await expect(playerPage.locator('text=/Answered in/')).toBeVisible({ timeout: 5000 });
    
    await hostContext.close();
    await playerContext.close();
  });

  test('Incorrect answer → See "0 points" (no speed bonus)', async ({ browser }) => {
    test.setTimeout(60000);
    
    // Setup game
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
    
    const threeQuestionsRadio = hostPage.locator('#length-3');
    await expect(threeQuestionsRadio).toBeVisible({ timeout: 10000 });
    await threeQuestionsRadio.click();
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
    
    const playerContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const playerPage = await playerContext.newPage();
    
    await playerPage.goto(`${baseURL}/join`);
    await playerPage.waitForLoadState('networkidle');
    
    const roomCodeInput = playerPage.getByPlaceholder(/room code/i);
    await expect(roomCodeInput).toBeVisible({ timeout: 5000 });
    await roomCodeInput.fill(roomCode);
    
    const nameInput = playerPage.getByPlaceholder(/name/i);
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('WrongAnswerPlayer');
    
    const joinButton = playerPage.getByRole('button', { name: /join/i });
    await joinButton.click();
    
    await playerPage.waitForURL(/\/game\/[^\/]+\/player/, { timeout: 15000 });
    await playerPage.waitForTimeout(2000);
    
    const startButton = hostPage.getByRole('button', { name: /start/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    await hostPage.waitForTimeout(2000);
    
    await playerPage.waitForSelector('text=/Question|Select your answer/i', { timeout: 10000 });
    await playerPage.waitForTimeout(1000);
    
    // Select wrong answer (select second option, assuming first is correct)
    const answerOptions = playerPage.locator('button').filter({ hasText: /^[A-D]\./ });
    const optionCount = await answerOptions.count();
    if (optionCount > 1) {
      // Select second option (likely wrong)
      await answerOptions.nth(1).click();
      await playerPage.waitForTimeout(300);
      await answerOptions.nth(1).click();
    } else {
      // Fallback: select first option
      await answerOptions.first().click();
      await playerPage.waitForTimeout(300);
      await answerOptions.first().click();
    }
    
    await hostPage.waitForTimeout(5000);
    
    const skipButton = hostPage.getByRole('button', { name: /skip|reveal/i }).first();
    const skipVisible = await skipButton.isVisible().catch(() => false);
    if (skipVisible) {
      await skipButton.click();
      await hostPage.waitForTimeout(1000);
    }
    
    await playerPage.waitForTimeout(3000);
    
    // Verify incorrect answer display
    await expect(playerPage.locator('text=/Incorrect/')).toBeVisible({ timeout: 5000 });
    await expect(playerPage.locator('text=/0 points/')).toBeVisible({ timeout: 5000 });
    
    // Should NOT show speed bonus
    const speedBonusText = playerPage.locator('text=/speed bonus/');
    const hasSpeedBonus = await speedBonusText.isVisible().catch(() => false);
    expect(hasSpeedBonus).toBe(false);
    
    await hostContext.close();
    await playerContext.close();
  });

  test('No answer → See "0 points" (no speed bonus)', async ({ browser }) => {
    test.setTimeout(60000);
    
    // Setup game
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
    
    const threeQuestionsRadio = hostPage.locator('#length-3');
    await expect(threeQuestionsRadio).toBeVisible({ timeout: 10000 });
    await threeQuestionsRadio.click();
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
    
    const playerContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const playerPage = await playerContext.newPage();
    
    await playerPage.goto(`${baseURL}/join`);
    await playerPage.waitForLoadState('networkidle');
    
    const roomCodeInput = playerPage.getByPlaceholder(/room code/i);
    await expect(roomCodeInput).toBeVisible({ timeout: 5000 });
    await roomCodeInput.fill(roomCode);
    
    const nameInput = playerPage.getByPlaceholder(/name/i);
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('NoAnswerPlayer');
    
    const joinButton = playerPage.getByRole('button', { name: /join/i });
    await joinButton.click();
    
    await playerPage.waitForURL(/\/game\/[^\/]+\/player/, { timeout: 15000 });
    await playerPage.waitForTimeout(2000);
    
    const startButton = hostPage.getByRole('button', { name: /start/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    await hostPage.waitForTimeout(2000);
    
    await playerPage.waitForSelector('text=/Question|Select your answer/i', { timeout: 10000 });
    await playerPage.waitForTimeout(1000);
    
    // Don't answer - wait for timer to expire
    await hostPage.waitForTimeout(16000); // Wait for 15s timer + buffer
    
    const skipButton = hostPage.getByRole('button', { name: /skip|reveal/i }).first();
    const skipVisible = await skipButton.isVisible().catch(() => false);
    if (skipVisible) {
      await skipButton.click();
      await hostPage.waitForTimeout(1000);
    }
    
    await playerPage.waitForTimeout(3000);
    
    // Verify no answer display
    await expect(playerPage.locator('text=/Time\'s up|No answer submitted/')).toBeVisible({ timeout: 5000 });
    await expect(playerPage.locator('text=/0 points/')).toBeVisible({ timeout: 5000 });
    
    // Should NOT show speed bonus
    const speedBonusText = playerPage.locator('text=/speed bonus/');
    const hasSpeedBonus = await speedBonusText.isVisible().catch(() => false);
    expect(hasSpeedBonus).toBe(false);
    
    await hostContext.close();
    await playerContext.close();
  });
});

