import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Demo Test: Speed Bonus Display with Multiple Players
 * 
 * This test demonstrates the speed bonus display with 3 players:
 * 1. Player 1: Answers quickly (Tier 1: 0-3s = +5 speed bonus) → "10 points + 5 speed bonus = 15 total"
 * 2. Player 2: Answers slowly (Tier 3: 5-15s = +0 speed bonus) → "10 points (no speed bonus)" or "10 points + 0 speed bonus = 10 total"
 * 3. Player 3: Doesn't answer at all → "0 points" (no speed bonus mentioned)
 * 
 * Run with: pnpm exec playwright test e2e/speed-bonus-display-demo.spec.ts --headed
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test('Speed Bonus Display Demo - 3 Players with Different Behaviors', async ({ browser }) => {
  test.setTimeout(120000); // 2 minutes timeout
  
  // ============================================
  // STEP 1: Host creates a game
  // ============================================
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  
  await hostPage.goto(`${baseURL}/create`);
  await hostPage.waitForLoadState('networkidle');
  await hostPage.waitForTimeout(2000);
  
  // Select first question set if available
  const questionSetCard = hostPage.locator('div[class*="card"]').first();
  const cardExists = await questionSetCard.isVisible().catch(() => false);
  
  if (!cardExists) {
    console.log('❌ ERROR: No question sets available. Skipping test.');
    console.log('   Import question sets: pnpm import:questions docs/questions_import/complete_questions.json');
    await hostPage.close();
    await hostContext.close();
    return;
  }
  
  await questionSetCard.click();
  await hostPage.waitForTimeout(500);
  console.log('✓ Question set selected');
  
  // Select 3 questions (use button approach like full-game-fast-2-players)
  const threeButton = hostPage.getByRole('button', { name: '3' });
  const isSelected = await threeButton.evaluate((el) => {
    return el.classList.contains('bg-primary') || el.classList.contains('scale-105');
  }).catch(() => false);
  
  if (!isSelected) {
    await expect(threeButton).toBeVisible({ timeout: 10000 });
    await threeButton.click();
    await hostPage.waitForTimeout(500);
    console.log('✓ 3 questions selected');
  } else {
    console.log('✓ 3 questions already selected (default)');
  }
  
  // Create game - wait for button to be ready
  await hostPage.waitForTimeout(1000); // Give page time to fully load
  const createButton = hostPage.getByRole('button', { name: /Start|Create Game|Creating/i });
  await expect(createButton).toBeVisible({ timeout: 15000 });
  await expect(createButton).not.toBeDisabled({ timeout: 5000 });
  await createButton.click();
  await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
  
  // Extract room code and game ID
  const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
  const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
  expect(roomCodeMatch).toBeTruthy();
  const roomCode = roomCodeMatch![1];
  
  // Extract game ID from URL
  const gameUrl = hostPage.url();
  const gameIdMatch = gameUrl.match(/\/game\/([^\/]+)\/host/);
  expect(gameIdMatch).toBeTruthy();
  const gameId = gameIdMatch![1];
  
  console.log(`✅ Game created with room code: ${roomCode}, game ID: ${gameId}`);
  
  // ============================================
  // STEP 2: Create 3 players with different behaviors
  // ============================================
  const players = [
    { name: 'FastPlayer', behavior: 'fast', viewport: { width: 375, height: 667 } },
    { name: 'SlowPlayer', behavior: 'slow', viewport: { width: 375, height: 667 } },
    { name: 'NoAnswerPlayer', behavior: 'no-answer', viewport: { width: 375, height: 667 } },
  ];
  
  const playerContexts: Array<{ context: any; page: any; name: string; behavior: string }> = [];
  
  for (const player of players) {
    const context = await browser.newContext({
      viewport: player.viewport,
    });
    const page = await context.newPage();
    
    await page.goto(`${baseURL}/join`);
    await page.waitForLoadState('networkidle');
    
    // Enter room code and name (use ID selectors like quick-full-game)
    const roomCodeInput = page.locator('#room-code');
    await expect(roomCodeInput).toBeVisible({ timeout: 10000 });
    await roomCodeInput.fill(roomCode);
    
    const nameInput = page.locator('#player-name');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill(player.name);
    
    const joinButton = page.getByRole('button', { name: /Join Game|Join/i });
    await joinButton.click();
    
    await page.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    
    playerContexts.push({
      context,
      page,
      name: player.name,
      behavior: player.behavior,
    });
    
    console.log(`✅ ${player.name} joined (behavior: ${player.behavior})`);
  }
  
  // ============================================
  // STEP 3: Host starts the game
  // ============================================
  await hostPage.waitForTimeout(2000); // Wait for all players to join
  
  const startButton = hostPage.getByRole('button', { name: /start/i });
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();
  await hostPage.waitForTimeout(2000);
  
  console.log('✅ Game started');
  
  // ============================================
  // STEP 4: Players answer with different timings
  // ============================================
  
  // Wait for question to appear on all player pages
  for (const player of playerContexts) {
    await player.page.waitForSelector('text=/Question|Select your answer/i', { timeout: 10000 });
    await player.page.waitForTimeout(500);
  }
  
  console.log('✅ Question displayed to all players');
  
  // ============================================
  // Get the correct answer from Supabase
  // ============================================
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  let correctAnswer = 'A'; // Default fallback
  
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Get current question index and question set ID for this game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('current_question_index, question_set_id')
        .eq('id', gameId)
        .single();
      
      if (!gameError && gameData?.question_set_id !== null && gameData?.current_question_index !== null) {
        const currentQuestionIndex = gameData.current_question_index ?? 0;
        const questionSetId = gameData.question_set_id;
        const orderIndex = currentQuestionIndex + 1; // Convert 0-based to 1-based
        
        // Get the question using question_set_id and order_index
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('correct_answer')
          .eq('question_set_id', questionSetId)
          .eq('order_index', orderIndex)
          .single();
        
        if (!questionError && questionData?.correct_answer) {
          correctAnswer = questionData.correct_answer;
          console.log(`✅ Correct answer for question ${orderIndex}: ${correctAnswer}`);
        } else {
          console.log(`⚠️  Could not fetch correct answer: ${questionError?.message}, using default "A"`);
        }
      } else {
        console.log(`⚠️  Could not fetch game data: ${gameError?.message}, using default answer "A"`);
      }
    } catch (error) {
      console.log(`⚠️  Error connecting to Supabase: ${error}, using default answer "A"`);
    }
  } else {
    console.log('⚠️  Supabase credentials not found in env, using default answer "A"');
  }
  
  // Helper function to select the correct answer
  const selectCorrectAnswer = async (page: typeof fastPlayer.page, answer: string) => {
    // Wait for question to be fully loaded and answer buttons to be visible
    await expect(page.locator('text=/Question|Select your answer/i')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000); // Wait for buttons to render
    
    // Find button that contains the correct answer letter
    // Try multiple approaches: button with text containing the letter, or button with text starting with letter
    let answerButton = page.locator(`button`).filter({ hasText: new RegExp(`${answer}`, 'i') }).first();
    
    // If not found, try finding by the answer option text pattern
    const isVisible = await answerButton.isVisible({ timeout: 3000 }).catch(() => false);
    if (!isVisible) {
      // Try all buttons and find one that contains the answer letter
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const text = await button.textContent();
        if (text && text.includes(answer)) {
          answerButton = button;
          break;
        }
      }
    }
    
    await expect(answerButton).toBeVisible({ timeout: 10000 });
    await answerButton.click();
    await page.waitForTimeout(500); // Wait for selection to register
    await answerButton.click(); // Lock answer (double-tap)
    await page.waitForTimeout(1000); // Wait for submission to complete
  };
  
  // All players wait for question to appear
  for (const player of playerContexts) {
    await expect(player.page.locator('text=/Question|Select your answer/i')).toBeVisible({ timeout: 15000 });
    await player.page.waitForTimeout(500);
  }
  
  // FastPlayer: Answer quickly (within 2 seconds) - Tier 1 speed bonus
  const fastPlayer = playerContexts.find(p => p.behavior === 'fast')!;
  const fastStartTime = Date.now();
  
  // Select the correct answer immediately
  const fastAnswerButton = fastPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer, 'i') }).first();
  await expect(fastAnswerButton).toBeVisible({ timeout: 10000 });
  await fastAnswerButton.click();
  await fastPlayer.page.waitForTimeout(300);
  await fastAnswerButton.click(); // Lock answer
  await fastPlayer.page.waitForTimeout(1000);
  
  const fastAnswerTime = Date.now() - fastStartTime;
  console.log(`✅ FastPlayer answered correctly (${correctAnswer}) in ${fastAnswerTime}ms (should get +5 speed bonus)`);
  
  // SlowPlayer: Answer after 10 seconds - Tier 3 (no speed bonus)
  const slowPlayer = playerContexts.find(p => p.behavior === 'slow')!;
  await slowPlayer.page.waitForTimeout(10000); // Wait 10 seconds
  
  // Select the correct answer
  const slowAnswerButton = slowPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer, 'i') }).first();
  await expect(slowAnswerButton).toBeVisible({ timeout: 10000 });
  await slowAnswerButton.click();
  await slowPlayer.page.waitForTimeout(300);
  await slowAnswerButton.click(); // Lock answer
  await slowPlayer.page.waitForTimeout(1000);
  
  console.log(`✅ SlowPlayer answered correctly (${correctAnswer}) after 10 seconds (should get no speed bonus)`);
  
  // NoAnswerPlayer: Don't answer at all
  const noAnswerPlayer = playerContexts.find(p => p.behavior === 'no-answer')!;
  console.log(`✅ NoAnswerPlayer did not answer (should get 0 points)`);
  
  // ============================================
  // STEP 5: Host reveals answers (skip timer or wait)
  // ============================================
  await hostPage.waitForTimeout(3000); // Wait a bit more for slow player to submit
  
  // Check if skip button is available
  const skipButton = hostPage.getByRole('button', { name: /skip|reveal/i }).first();
  const skipVisible = await skipButton.isVisible().catch(() => false);
  if (skipVisible) {
    await skipButton.click();
    await hostPage.waitForTimeout(2000); // Wait for scoring to process
    console.log('✅ Host skipped timer to reveal answers');
  } else {
    // Wait for timer to expire
    await hostPage.waitForTimeout(10000);
    console.log('✅ Timer expired, answers revealed');
  }
  
  // Wait for scoring to complete (processQuestionScores needs time)
  await hostPage.waitForTimeout(3000);
  
  // ============================================
  // STEP 6: Verify speed bonus displays on player pages
  // ============================================
  // Wait longer for reveal and feedback to appear (scoring calculation + reveal animation)
  // Scoring needs time: processQuestionScores -> answer_reveal event -> getPlayerAnswerResult -> render feedback
  await hostPage.waitForTimeout(5000); // Wait for scoring + reveal event
  await fastPlayer.page.waitForTimeout(5000); // Wait for answer_reveal event + data fetch + render
  await slowPlayer.page.waitForTimeout(5000);
  await noAnswerPlayer.page.waitForTimeout(5000);
  
  // Debug: Check what's actually on the page
  const fastPlayerContent = await fastPlayer.page.content();
  console.log('\n📄 FastPlayer page content snippet:', fastPlayerContent.substring(0, 500));
  
  // FastPlayer: Should see "10 points + 5 speed bonus = 15 total"
  console.log('\n📊 Checking FastPlayer feedback...');
  // Wait for any feedback text to appear first
  await expect(fastPlayer.page.locator('text=/Correct|Incorrect|points|Total Score/i').first()).toBeVisible({ timeout: 15000 });
  // Then check for specific message
  const correctMessage = fastPlayer.page.getByText('Correct! Well done!');
  const hasCorrectMessage = await correctMessage.isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasCorrectMessage) {
    // Check what message is actually there
    const pageText = await fastPlayer.page.textContent('body');
    console.log('⚠️  FastPlayer page text:', pageText?.substring(0, 500));
  }
  await expect(correctMessage).toBeVisible({ timeout: 10000 });
  // Check for base points (should be "10 points" in large text)
  await expect(fastPlayer.page.locator('.text-3xl.font-bold').filter({ hasText: /10 points/ })).toBeVisible({ timeout: 10000 });
  // Check for speed bonus
  await expect(fastPlayer.page.getByText(/\+5 speed bonus/)).toBeVisible({ timeout: 10000 });
  // Check for total breakdown
  await expect(fastPlayer.page.getByText(/= 15 total/)).toBeVisible({ timeout: 10000 });
  // Check for response time
  await expect(fastPlayer.page.getByText(/Answered in/)).toBeVisible({ timeout: 10000 });
  console.log('✅ FastPlayer sees: "10 points + 5 speed bonus = 15 total"');
  
  // SlowPlayer: Should see "10 points (no speed bonus)" or "10 points + 0 speed bonus = 10 total"
  console.log('\n📊 Checking SlowPlayer feedback...');
  await expect(slowPlayer.page.getByText('Correct! Well done!')).toBeVisible({ timeout: 15000 });
  await expect(slowPlayer.page.locator('.text-3xl.font-bold').filter({ hasText: /10 points/ })).toBeVisible({ timeout: 10000 });
  const noBonusText = slowPlayer.page.getByText(/no speed bonus/i);
  const zeroBonusText = slowPlayer.page.getByText(/\+ 0 speed bonus|0 speed bonus/i);
  const hasNoBonus = await noBonusText.isVisible({ timeout: 5000 }).catch(() => false);
  const hasZeroBonus = await zeroBonusText.isVisible({ timeout: 5000 }).catch(() => false);
  expect(hasNoBonus || hasZeroBonus).toBe(true);
  await expect(slowPlayer.page.getByText(/= 10 total/)).toBeVisible({ timeout: 10000 });
  await expect(slowPlayer.page.getByText(/Answered in/)).toBeVisible({ timeout: 10000 });
  console.log('✅ SlowPlayer sees: "10 points (no speed bonus)" or "10 points + 0 speed bonus = 10 total"');
  
  // NoAnswerPlayer: Should see "0 points" (no speed bonus mentioned)
  console.log('\n📊 Checking NoAnswerPlayer feedback...');
  await expect(noAnswerPlayer.page.getByText(/Time's up|No answer submitted/i)).toBeVisible({ timeout: 15000 });
  await expect(noAnswerPlayer.page.getByText('0 points')).toBeVisible({ timeout: 10000 });
  const speedBonusText = noAnswerPlayer.page.getByText(/speed bonus/i);
  const hasSpeedBonus = await speedBonusText.isVisible({ timeout: 2000 }).catch(() => false);
  expect(hasSpeedBonus).toBe(false);
  console.log('✅ NoAnswerPlayer sees: "0 points" (no speed bonus mentioned)');
  
  // ============================================
  // STEP 7: Keep browser open for viewing (wait 10 seconds)
  // ============================================
  console.log('\n⏳ Keeping browser open for 10 seconds so you can see the results...');
  await hostPage.waitForTimeout(10000);
  
  // Clean up
  await hostContext.close();
  for (const player of playerContexts) {
    await player.context.close();
  }
  
  console.log('\n✅ Demo test completed!');
});

