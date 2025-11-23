import { test, expect } from '@playwright/test';

/**
 * Test: Realtime synchronization - verify that all players see each other
 * and status updates propagate correctly using broadcast events only
 * 
 * This test specifically verifies the fixes for:
 * - First player sees themselves
 * - Second player sees both players
 * - Third player sees all three players
 * - Status updates propagate to all players
 * - Game start works for all players
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Realtime Synchronization', () => {
  test('All players should see each other and receive status updates via broadcast', async ({ browser }) => {
    // Step 1: Host creates a game
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    await hostPage.goto(`${baseURL}/create`);
    await hostPage.waitForLoadState('networkidle');
    
    // Wait for question set cards to load (they should auto-select the first one)
    // Look for any question set card title to ensure they're loaded
    await hostPage.waitForSelector('text=/questions/', { timeout: 10000 });
    await hostPage.waitForTimeout(1000); // Give time for auto-selection
    
    // Select 10 questions for faster testing (3 is too short, 10 is reasonable)
    const tenQuestionsRadio = hostPage.locator('#length-10');
    await expect(tenQuestionsRadio).toBeVisible({ timeout: 5000 });
    await tenQuestionsRadio.click();
    await hostPage.waitForTimeout(500);
    
    // Create game - button should be enabled after question set is selected
    const createButton = hostPage.getByRole('button', { name: 'Create Game' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await expect(createButton).not.toBeDisabled({ timeout: 10000 });
    await createButton.click();
    
    // Wait for redirect to host page
    await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
    
    // Extract room code
    const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
    expect(roomCodeText).toBeTruthy();
    const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
    expect(roomCodeMatch).toBeTruthy();
    const roomCode = roomCodeMatch![1];
    
    // Step 2: First player joins
    const player1Context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // Mobile viewport
    });
    const player1Page = await player1Context.newPage();
    
    await player1Page.goto(`${baseURL}/join`);
    await player1Page.waitForLoadState('networkidle');
    
    await player1Page.locator('#room-code').fill(roomCode);
    await player1Page.locator('#player-name').fill('Player 1');
    
    const joinButton1 = player1Page.getByRole('button', { name: 'Join Game' });
    await expect(joinButton1).toBeVisible({ timeout: 5000 });
    await joinButton1.click();
    
    await player1Page.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await player1Page.waitForTimeout(2000); // Wait for realtime subscription
    
    // Verify Player 1 sees themselves (check for player list item, not heading)
    await expect(player1Page.locator('text=/1\\. Player 1/')).toBeVisible({ timeout: 5000 });
    const player1Count = await player1Page.locator('text=/player/').first().textContent();
    expect(player1Count).toContain('1');
    
    // Step 3: Second player joins
    const player2Context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const player2Page = await player2Context.newPage();
    
    await player2Page.goto(`${baseURL}/join`);
    await player2Page.waitForLoadState('networkidle');
    
    await player2Page.locator('#room-code').fill(roomCode);
    await player2Page.locator('#player-name').fill('Player 2');
    
    const joinButton2 = player2Page.getByRole('button', { name: 'Join Game' });
    await expect(joinButton2).toBeVisible({ timeout: 5000 });
    await joinButton2.click();
    
    await player2Page.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await player2Page.waitForTimeout(2000); // Wait for realtime subscription
    
    // Verify Player 2 sees both players (check for player list items)
    await expect(player2Page.locator('text=/Player 1/').first()).toBeVisible({ timeout: 5000 });
    await expect(player2Page.locator('text=/Player 2/').first()).toBeVisible({ timeout: 5000 });
    const player2Count = await player2Page.locator('text=/player/').first().textContent();
    expect(player2Count).toContain('2');
    
    // Verify Player 1 also sees Player 2 (realtime update)
    await expect(player1Page.locator('text=/Player 2/').first()).toBeVisible({ timeout: 5000 });
    const player1CountUpdated = await player1Page.locator('text=/player/').first().textContent();
    expect(player1CountUpdated).toContain('2');
    
    // Step 4: Third player joins
    const player3Context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const player3Page = await player3Context.newPage();
    
    await player3Page.goto(`${baseURL}/join`);
    await player3Page.waitForLoadState('networkidle');
    
    await player3Page.locator('#room-code').fill(roomCode);
    await player3Page.locator('#player-name').fill('Player 3');
    
    const joinButton3 = player3Page.getByRole('button', { name: 'Join Game' });
    await expect(joinButton3).toBeVisible({ timeout: 5000 });
    await joinButton3.click();
    
    await player3Page.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 10000 });
    await player3Page.waitForTimeout(2000); // Wait for realtime subscription
    
    // Verify Player 3 sees all three players
    await expect(player3Page.locator('text=/Player 1/').first()).toBeVisible({ timeout: 5000 });
    await expect(player3Page.locator('text=/Player 2/').first()).toBeVisible({ timeout: 5000 });
    await expect(player3Page.locator('text=/Player 3/').first()).toBeVisible({ timeout: 5000 });
    const player3Count = await player3Page.locator('text=/player/').first().textContent();
    expect(player3Count).toContain('3');
    
    // Verify Player 1 and Player 2 also see Player 3 (realtime updates)
    await expect(player1Page.locator('text=/Player 3/').first()).toBeVisible({ timeout: 5000 });
    await expect(player2Page.locator('text=/Player 3/').first()).toBeVisible({ timeout: 5000 });
    
    // Step 5: Verify host sees all players
    await hostPage.waitForTimeout(2000); // Wait for realtime updates
    const hostPlayerCount = await hostPage.locator('text=/Players Joined/').textContent();
    expect(hostPlayerCount).toContain('3');
    
    await expect(hostPage.locator('text=Player 1')).toBeVisible({ timeout: 5000 });
    await expect(hostPage.locator('text=Player 2')).toBeVisible({ timeout: 5000 });
    await expect(hostPage.locator('text=Player 3')).toBeVisible({ timeout: 5000 });
    
    // Step 6: Host starts the game - verify all players receive game_start event
    const startButton = hostPage.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await expect(startButton).not.toBeDisabled({ timeout: 5000 });
    await startButton.click();
    
    // Verify game is starting on host
    await expect(hostPage.locator('text=/Starting/i')).toBeVisible({ timeout: 10000 });
    
    // Verify all players receive game_start event (they should see "Starting game..." or question)
    // This verifies the broadcast event is received by all subscribed clients
    await expect(player1Page.locator('text=/Starting|Question/i')).toBeVisible({ timeout: 10000 });
    await expect(player2Page.locator('text=/Starting|Question/i')).toBeVisible({ timeout: 10000 });
    await expect(player3Page.locator('text=/Starting|Question/i')).toBeVisible({ timeout: 10000 });
    
    // Cleanup
    await player1Page.close();
    await player1Context.close();
    await player2Page.close();
    await player2Context.close();
    await player3Page.close();
    await player3Context.close();
    await hostPage.close();
    await hostContext.close();
  });
});

