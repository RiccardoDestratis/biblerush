import { test, expect } from '@playwright/test';

/**
 * Test: Create game, start with 10 questions, and have 5 players join
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Create Game and Join Flow', () => {
  test('Create game with 10 questions, start it, and have 5 players join', async ({ browser }) => {
    // Step 1: Host creates a game
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    
    // Wait for page to load
    await hostPage.waitForLoadState('networkidle');
    
    // Select 10 questions
    const tenQuestionsRadio = hostPage.locator('#length-10');
    await expect(tenQuestionsRadio).toBeVisible({ timeout: 5000 });
    await tenQuestionsRadio.click();
    
    // Wait a bit for selection to register
    await hostPage.waitForTimeout(500);
    
    // Click "Create Game" button
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await expect(createButton).not.toBeDisabled({ timeout: 5000 });
    await createButton.click();
    
    // Wait for redirect to host page
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Extract room code from the page
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    expect(roomCodeText).toBeTruthy();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    
    // Step 2: Have 5 players join
    const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const playerPages: Array<{ page: any; name: string }> = [];
    
    for (const playerName of playerNames) {
      const playerContext = await browser.newContext();
      const playerPage = await playerContext.newPage();
      
      // Navigate to join page
      await playerPage.goto(`${baseURL}/join`);
      await playerPage.waitForLoadState('networkidle');
      
      // Fill in room code
      const roomCodeInput = playerPage.locator('#room-code');
      await expect(roomCodeInput).toBeVisible({ timeout: 5000 });
      await roomCodeInput.fill(roomCode);
      
      // Fill in player name
      const playerNameInput = playerPage.locator('#player-name');
      await expect(playerNameInput).toBeVisible({ timeout: 5000 });
      await playerNameInput.fill(playerName);
      
      // Click join button
      const joinButton = playerPage.getByRole('button', { name: 'Join Game' });
      await expect(joinButton).toBeVisible({ timeout: 5000 });
      await joinButton.click();
      
      // Wait for redirect to player view
      await playerPage.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
      
      playerPages.push({ page: playerPage, name: playerName });
      
      // Small delay between joins
      await playerPage.waitForTimeout(500);
    }
    
    // Step 3: Verify all players appear on host page
    await hostPage.waitForTimeout(2000); // Wait for real-time updates
    
    // Check player count
    const playerCountText = await hostPage.locator('text=/Players Joined/').textContent();
    expect(playerCountText).toContain('5');
    
    // Verify all player names appear
    for (const playerName of playerNames) {
      await expect(hostPage.locator(`text=${playerName}`)).toBeVisible({ timeout: 5000 });
    }
    
    // Step 4: Host starts the game
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).not.toBeDisabled({ timeout: 5000 });
    await startButton.click();
    
    // Verify game is starting - check for loading state or "Starting" text
    await expect(hostPage.locator('text=/Starting/i')).toBeVisible({ timeout: 10000 });
    
    // Cleanup
    for (const { page } of playerPages) {
      await page.close();
    }
    await hostPage.close();
    await hostContext.close();
  });
});

