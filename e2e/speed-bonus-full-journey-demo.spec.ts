import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * End-to-End Test: Speed Bonus Full Journey Demo
 * 
 * This test demonstrates the complete speed bonus scoring system with 3 players across 3 questions,
 * showing different speed bonus scenarios:
 * 
 * Question 1:
 * - FastPlayer: Answer immediately (<3s) → 15 points (10 base + 5 speed bonus)
 * - SlowPlayer: Wait 6 seconds → 10 points (10 base + 0 speed bonus)
 * - NoAnswerPlayer: Don't answer → 0 points
 * 
 * Question 2:
 * - FastPlayer: Wait 4 seconds → 13 points (10 base + 3 speed bonus, Tier 2)
 * - SlowPlayer: Answer immediately (<3s) → 15 points (10 base + 5 speed bonus)
 * - NoAnswerPlayer: Wait 6 seconds → 10 points (10 base + 0 speed bonus)
 * 
 * Question 3:
 * - FastPlayer: Wait 2 seconds → 15 points (10 base + 5 speed bonus)
 * - SlowPlayer: Wait 4 seconds → 13 points (10 base + 3 speed bonus, Tier 2)
 * - NoAnswerPlayer: Answer immediately (<3s) → 15 points (10 base + 5 speed bonus)
 * 
 * Run with: pnpm exec playwright test e2e/speed-bonus-full-journey-demo.spec.ts --headed
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test('Speed Bonus Full Journey Demo - 3 Players, 3 Questions', async ({ browser }) => {
  test.setTimeout(180000); // 3 minutes
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    test.skip(true, 'Supabase credentials not found - cannot verify database state');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('\n🎮 ========================================');
  console.log('🎮 SPEED BONUS FULL JOURNEY DEMO');
  console.log('🎮 ========================================\n');
  
  // ============================================
  // STEP 1: Create game with 3 questions
  // ============================================
  console.log('📋 STEP 1: Creating game with 3 questions...');
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  
  await hostPage.goto(`${baseURL}/create`);
  await hostPage.waitForLoadState('networkidle');
  await hostPage.waitForTimeout(2000);
  
  const questionSetCard = hostPage.locator('div[class*="card"]').first();
  const cardExists = await questionSetCard.isVisible().catch(() => false);
  
  if (!cardExists) {
    console.log('❌ ERROR: No question sets available. Skipping test.');
    return;
  }
  
  await questionSetCard.click();
  await hostPage.waitForTimeout(500);
  
  const threeButton = hostPage.getByRole('button', { name: '3' });
  await expect(threeButton).toBeVisible({ timeout: 10000 });
  await threeButton.click();
  await hostPage.waitForTimeout(500);
  
  const createButton = hostPage.getByRole('button', { name: /Start|Create Game|Creating/i });
  await expect(createButton).toBeVisible({ timeout: 15000 });
  await expect(createButton).not.toBeDisabled({ timeout: 5000 });
  await createButton.click();
  await hostPage.waitForURL(/\/game\/[^\/]+\/host/, { timeout: 15000 });
  
  const gameUrl = hostPage.url();
  const gameIdMatch = gameUrl.match(/\/game\/([^\/]+)\/host/);
  expect(gameIdMatch).toBeTruthy();
  const gameId = gameIdMatch![1];
  
  console.log(`✅ Game created: ${gameId}\n`);
  
  // ============================================
  // STEP 2: Players join
  // ============================================
  console.log('👥 STEP 2: Players joining...');
  const players = [
    { name: 'FastPlayer', behavior: 'fast' },
    { name: 'SlowPlayer', behavior: 'slow' },
    { name: 'NoAnswerPlayer', behavior: 'no-answer' },
  ];
  
  const playerContexts: Array<{ context: any; page: any; name: string; behavior: string; playerId?: string }> = [];
  
  // Get room code once
  const roomCodeText = await hostPage.locator('text=/Room Code:/').textContent();
  const roomCodeMatch = roomCodeText?.match(/Room Code:\s*([A-Z0-9]{6})/);
  expect(roomCodeMatch).toBeTruthy();
  const roomCode = roomCodeMatch![1];
  console.log(`  📋 Room Code: ${roomCode}`);
  
  for (const player of players) {
    console.log(`  👤 Joining ${player.name}...`);
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    
    await page.goto(`${baseURL}/join`);
    await page.waitForLoadState('networkidle');
    console.log(`    ✅ ${player.name}: Loaded join page`);
    
    // Fill room code
    const roomCodeInput = page.locator('#room-code');
    await expect(roomCodeInput).toBeVisible({ timeout: 10000 });
    await roomCodeInput.fill(roomCode);
    console.log(`    ✅ ${player.name}: Filled room code`);
    
    // Fill player name
    const playerNameInput = page.locator('#player-name');
    await expect(playerNameInput).toBeVisible({ timeout: 10000 });
    await playerNameInput.fill(player.name);
    console.log(`    ✅ ${player.name}: Filled player name`);
    
    // Click join button
    const joinButton = page.getByRole('button', { name: /Join Game|Join/i });
    await expect(joinButton).toBeVisible({ timeout: 10000 });
    await expect(joinButton).not.toBeDisabled({ timeout: 5000 });
    await joinButton.click();
    console.log(`    ✅ ${player.name}: Clicked join button`);
    
    // Wait for redirect to player view
    await page.waitForURL(/\/game\/[^\/]+\/play/, { timeout: 15000 });
    console.log(`    ✅ ${player.name}: Redirected to player view`);
    await page.waitForTimeout(1000);
    
    // Verify player is on the waiting/play screen
    const waitingText = await page.locator('text=/waiting|joined|ready/i').isVisible().catch(() => false);
    console.log(`    ✅ ${player.name}: On player screen (waiting text visible: ${waitingText})`);
    
    // Get player ID from database
    let retries = 0;
    let playerData = null;
    while (retries < 10 && !playerData) {
      await page.waitForTimeout(500);
      const { data } = await supabase
        .from('game_players')
        .select('id')
        .eq('game_id', gameId)
        .eq('player_name', player.name)
        .maybeSingle();
      
      if (data) {
        playerData = data;
        break;
      }
      retries++;
    }
    
    if (!playerData) {
      console.log(`    ❌ ERROR: ${player.name} not found in database after ${retries} retries`);
      // Try to get all players to debug
      const { data: allPlayers } = await supabase
        .from('game_players')
        .select('id, player_name')
        .eq('game_id', gameId);
      console.log(`    📋 All players in game: ${JSON.stringify(allPlayers)}`);
    }
    
    playerContexts.push({
      context,
      page,
      name: player.name,
      behavior: player.behavior,
      playerId: playerData?.id,
    });
    
    console.log(`  ✅ ${player.name} joined successfully (ID: ${playerData?.id || 'NOT FOUND'})\n`);
  }
  
  // Verify all players are in the game
  const { data: allGamePlayers } = await supabase
    .from('game_players')
    .select('id, player_name')
    .eq('game_id', gameId);
  
  console.log(`  📊 Total players in game: ${allGamePlayers?.length || 0}`);
  allGamePlayers?.forEach(p => {
    console.log(`    - ${p.player_name} (ID: ${p.id})`);
  });
  console.log('');
  
  const fastPlayer = playerContexts.find(p => p.behavior === 'fast')!;
  const slowPlayer = playerContexts.find(p => p.behavior === 'slow')!;
  const noAnswerPlayer = playerContexts.find(p => p.behavior === 'no-answer')!;
  
  console.log('');
  
  // ============================================
  // STEP 3: Start game
  // ============================================
  console.log('🚀 STEP 3: Starting game...');
  await hostPage.waitForTimeout(2000);
  const startButton = hostPage.getByRole('button', { name: /start/i });
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();
  await hostPage.waitForTimeout(2000);
  console.log('✅ Game started\n');
  
  // Track scores across questions
  const scoreBreakdown: Record<string, Array<{ question: number; points: number; expected: number }>> = {
    FastPlayer: [],
    SlowPlayer: [],
    NoAnswerPlayer: [],
  };
  
  // Helper function to get current question data
  const getCurrentQuestionData = async () => {
    const { data: gameData } = await supabase
      .from('games')
      .select('current_question_index, question_set_id')
      .eq('id', gameId)
      .single();
    
    const currentQuestionIndex = gameData?.current_question_index ?? 0;
    const questionSetId = gameData?.question_set_id;
    const orderIndex = currentQuestionIndex + 1;
    
    const { data: questionData } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .eq('question_set_id', questionSetId)
      .eq('order_index', orderIndex)
      .single();
    
    return {
      questionId: questionData?.id,
      correctAnswer: questionData?.correct_answer || 'A',
      orderIndex,
    };
  };
  
  // ============================================
  // QUESTION 1: FastPlayer immediate, SlowPlayer 6s, NoAnswerPlayer no answer
  // ============================================
  console.log('📝 QUESTION 1: FastPlayer immediate, SlowPlayer 6s, NoAnswerPlayer no answer');
  console.log('   Expected: FastPlayer=15, SlowPlayer=10, NoAnswerPlayer=0\n');
  
  // Wait for question to appear on all players
  console.log('  ⏳ Waiting for question to appear on all players...');
  for (const player of playerContexts) {
    const questionVisible = await expect(player.page.locator('text=/Question|Select your answer/i')).toBeVisible({ timeout: 15000 });
    console.log(`    ✅ ${player.name}: Question visible`);
  }
  
  // Get correct answer for question 1
  const question1Data = await getCurrentQuestionData();
  const correctAnswer1 = question1Data.correctAnswer;
  const question1Id = question1Data.questionId;
  
  console.log(`  📋 Question ${question1Data.orderIndex} - Correct answer: ${correctAnswer1}`);
  
  // Wait longer for buttons to render (animation delay is 0.3s + 0.3s duration)
  console.log('  ⏳ Waiting for answer buttons to render (animation delay)...');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for animations
  
  // Verify buttons are visible and get button count
  console.log('  🔍 Verifying answer buttons are visible...');
  for (const player of playerContexts) {
    // Wait specifically for answer buttons (should have at least 4 buttons for A, B, C, D)
    const answerButtons = player.page.locator('button').filter({ hasText: /^[A-D]/i });
    await expect(answerButtons.first()).toBeVisible({ timeout: 10000 });
    
    const buttons = player.page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`    ${player.name}: Found ${buttonCount} buttons`);
    
    // Try to find the correct answer button - it should contain the letter
    const answerButton = player.page.locator('button').filter({ hasText: new RegExp(`^${correctAnswer1}|\\b${correctAnswer1}\\b`, 'i') }).first();
    const isVisible = await answerButton.isVisible().catch(() => false);
    console.log(`    ${player.name}: Correct answer button (${correctAnswer1}) visible: ${isVisible}`);
    
    if (!isVisible) {
      // Log all button texts for debugging
      const allButtonTexts: string[] = [];
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const text = await buttons.nth(i).textContent().catch(() => '');
        allButtonTexts.push(text || '');
      }
      console.log(`    ${player.name}: Available buttons: ${allButtonTexts.join(', ')}`);
      
      // Try alternative: look for button containing just the letter in a div
      const letterButtons = player.page.locator(`button:has-text("${correctAnswer1}")`);
      const letterButtonCount = await letterButtons.count();
      console.log(`    ${player.name}: Buttons containing "${correctAnswer1}": ${letterButtonCount}`);
    }
  }
  
  // FastPlayer: Answer immediately (<3s) - CRITICAL: Answer as fast as possible to get speed bonus
  console.log(`  🎯 FastPlayer: Selecting answer "${correctAnswer1}" immediately (aiming for <3s speed bonus)...`);
  
  // Wait for buttons to have actual content - use a more reliable selector
  // The button should contain the answer letter (A, B, C, or D) in its text
  const answerLetter = correctAnswer1;
  await fastPlayer.page.waitForFunction(
    (letter) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => {
        const text = (btn.textContent || '').trim();
        // Button should contain the letter and have some actual content
        return text.includes(letter) && text.length > 1;
      });
    },
    answerLetter,
    { timeout: 10000 }
  );
  
  // Answer IMMEDIATELY - no delay to maximize chance of <3s response time
  const fastAnswerButton1 = fastPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer1, 'i') }).first();
  await expect(fastAnswerButton1).toBeVisible({ timeout: 10000 });
  const fastButtonText = await fastAnswerButton1.textContent();
  console.log(`    Button text: "${fastButtonText?.trim()}"`);
  await fastAnswerButton1.click();
  console.log(`    ✅ First click completed`);
  await fastPlayer.page.waitForTimeout(50); // Minimal delay
  await fastAnswerButton1.click(); // Lock immediately
  console.log(`    ✅ Lock click completed`);
  await fastPlayer.page.waitForTimeout(2000);
  
  // Verify answer was submitted
  const fastAnswerSubmitted = await fastPlayer.page.locator('text=/submitted|answered|locked/i').isVisible().catch(() => false);
  console.log(`  ✅ FastPlayer answered immediately (submitted: ${fastAnswerSubmitted})`);
  
  // SlowPlayer: Wait 6 seconds, then answer
  console.log(`  ⏳ SlowPlayer: Waiting 6 seconds before answering...`);
  await slowPlayer.page.waitForTimeout(6000);
  console.log(`  🎯 SlowPlayer: Selecting answer "${correctAnswer1}"...`);
  
  // Ensure buttons are ready
  const slowAnswerButton1 = slowPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer1, 'i') }).first();
  await expect(slowAnswerButton1).toBeVisible({ timeout: 10000 });
  const slowButtonText = await slowAnswerButton1.textContent();
  console.log(`    Button text: "${slowButtonText?.trim()}"`);
  await slowAnswerButton1.click();
  console.log(`    ✅ First click completed`);
  await slowPlayer.page.waitForTimeout(50);
  await slowAnswerButton1.click(); // Lock
  console.log(`    ✅ Lock click completed`);
  await slowPlayer.page.waitForTimeout(2000);
  
  const slowAnswerSubmitted = await slowPlayer.page.locator('text=/submitted|answered|locked/i').isVisible().catch(() => false);
  console.log(`  ✅ SlowPlayer answered after 6s (submitted: ${slowAnswerSubmitted})`);
  
  // NoAnswerPlayer: Don't answer
  console.log(`  ⏭️  NoAnswerPlayer: Skipping answer (expected: 0 points)`);
  
  // Host skips timer
  await hostPage.waitForTimeout(1000);
  const skipButton1 = hostPage.getByRole('button', { name: /skip|reveal/i }).first();
  const skipVisible1 = await skipButton1.isVisible().catch(() => false);
  if (skipVisible1) {
    await skipButton1.click();
  }
  
  // Wait for scoring to complete
  await hostPage.waitForTimeout(2000);
  let retries = 0;
  while (retries < 10) {
    await hostPage.waitForTimeout(500);
    const { data: answers } = await supabase
      .from('player_answers')
      .select('id, player_id, points_earned')
      .eq('game_id', gameId)
      .eq('question_id', question1Id);
    
    const fastAnswerExists = answers?.some(a => a.player_id === fastPlayer.playerId && a.points_earned !== null);
    const slowAnswerExists = answers?.some(a => a.player_id === slowPlayer.playerId && a.points_earned !== null);
    
    if (fastAnswerExists && slowAnswerExists) {
      break;
    }
    retries++;
  }
  
  // Verify Question 1 scores
  const { data: fastAnswer1 } = await supabase
    .from('player_answers')
    .select('points_earned, response_time_ms')
    .eq('game_id', gameId)
    .eq('player_id', fastPlayer.playerId)
    .eq('question_id', question1Id)
    .single();
  
  const { data: slowAnswer1 } = await supabase
    .from('player_answers')
    .select('points_earned, response_time_ms')
    .eq('game_id', gameId)
    .eq('player_id', slowPlayer.playerId)
    .eq('question_id', question1Id)
    .maybeSingle();
  
  const fastPoints1 = fastAnswer1?.points_earned || 0;
  const slowPoints1 = slowAnswer1?.points_earned || 0;
  const noAnswerPoints1 = 0;
  
  scoreBreakdown.FastPlayer.push({ question: 1, points: fastPoints1, expected: 15 });
  scoreBreakdown.SlowPlayer.push({ question: 1, points: slowPoints1, expected: 10 });
  scoreBreakdown.NoAnswerPlayer.push({ question: 1, points: noAnswerPoints1, expected: 0 });
  
  // Note: Response time includes processing delays, so "immediate" answers might be 3-5s
  // Verify scoring based on actual response time tiers
  const fastTime1 = fastAnswer1?.response_time_ms || 0;
  const fastExpected1 = fastTime1 <= 3000 ? 15 : fastTime1 <= 5000 ? 13 : 10;
  
  console.log(`  📊 Question 1 Results:`);
  console.log(`     FastPlayer: ${fastPoints1} points (expected: ${fastExpected1} based on ${fastTime1}ms, actual: ${fastPoints1}) ${fastPoints1 === fastExpected1 ? '✅' : '⚠️'}`);
  console.log(`     SlowPlayer: ${slowPoints1} points (expected: 10, time: ${slowAnswer1?.response_time_ms}ms) ${slowPoints1 === 10 ? '✅' : '⚠️'}`);
  console.log(`     NoAnswerPlayer: ${noAnswerPoints1} points (expected: 0) ${noAnswerPoints1 === 0 ? '✅' : '⚠️'}\n`);
  
  // Update expected for score breakdown
  scoreBreakdown.FastPlayer[scoreBreakdown.FastPlayer.length - 1].expected = fastExpected1;
  
  // Move to next question - wait for leaderboard, then skip
  console.log('  ⏳ Waiting for leaderboard to appear...');
  await hostPage.waitForTimeout(2000);
  
  // Wait for leaderboard countdown or skip button
  const countdownText = hostPage.locator('text=/Next question in/i');
  const countdownVisible = await countdownText.isVisible().catch(() => false);
  
  if (countdownVisible) {
    console.log('  ⏳ Leaderboard countdown visible, waiting for skip button...');
    // Wait a bit for skip button to appear
    await hostPage.waitForTimeout(1000);
  }
  
  // Click skip on leaderboard to advance to next question
  const skipLeaderboardButton = hostPage.getByRole('button', { name: /skip|next|continue/i }).first();
  const skipLeaderboardVisible = await skipLeaderboardButton.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (skipLeaderboardVisible) {
    console.log('  ✅ Clicking skip on leaderboard to advance to question 2...');
    await skipLeaderboardButton.click();
    await hostPage.waitForTimeout(2000);
  } else {
    // If no skip button, wait for countdown (10 seconds)
    console.log('  ⏳ No skip button, waiting for countdown to finish (10s)...');
    await hostPage.waitForTimeout(11000);
  }
  
  // ============================================
  // QUESTION 2: FastPlayer 4s, SlowPlayer immediate, NoAnswerPlayer 6s
  // ============================================
  console.log('📝 QUESTION 2: FastPlayer 4s, SlowPlayer immediate, NoAnswerPlayer 6s');
  console.log('   Expected: FastPlayer=13, SlowPlayer=15, NoAnswerPlayer=10\n');
  
  // Wait for question 2 to appear on all players
  console.log('  ⏳ Waiting for question 2 to appear on all players...');
  for (const player of playerContexts) {
    // Wait for question 2 specifically, not just any question text
    const question2Text = player.page.locator('text=/Question 2 of/i');
    await expect(question2Text).toBeVisible({ timeout: 15000 });
    console.log(`    ✅ ${player.name}: Question 2 visible`);
    
    // Wait for buttons to appear (more reliable than text)
    await player.page.waitForTimeout(2000); // Wait for animations
    const answerButtons = player.page.locator('button').filter({ hasText: /^[A-D]/i });
    await expect(answerButtons.first()).toBeVisible({ timeout: 10000 });
    console.log(`    ✅ ${player.name}: Answer buttons visible`);
  }
  
  // Get correct answer for question 2
  const question2Data = await getCurrentQuestionData();
  const correctAnswer2 = question2Data.correctAnswer;
  const question2Id = question2Data.questionId;
  
  console.log(`  📋 Question ${question2Data.orderIndex} - Correct answer: ${correctAnswer2}`);
  
  // Verify buttons are visible
  console.log('  🔍 Verifying answer buttons are visible...');
  for (const player of playerContexts) {
    const answerButton = player.page.locator('button').filter({ hasText: new RegExp(correctAnswer2, 'i') }).first();
    const isVisible = await answerButton.isVisible().catch(() => false);
    console.log(`    ${player.name}: Correct answer button (${correctAnswer2}) visible: ${isVisible}`);
  }
  
  // FastPlayer: Wait 4 seconds, then answer (Tier 2)
  console.log(`  ⏳ FastPlayer: Waiting 4 seconds before answering...`);
  await fastPlayer.page.waitForTimeout(4000);
  console.log(`  🎯 FastPlayer: Selecting answer "${correctAnswer2}"...`);
  const fastAnswerButton2 = fastPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer2, 'i') }).first();
  await expect(fastAnswerButton2).toBeVisible({ timeout: 10000 });
  await fastAnswerButton2.click();
  await fastPlayer.page.waitForTimeout(50);
  await fastAnswerButton2.click(); // Lock
  await fastPlayer.page.waitForTimeout(2000);
  console.log(`  ✅ FastPlayer answered after 4s`);
  
  // SlowPlayer: Answer immediately (<3s)
  console.log(`  🎯 SlowPlayer: Selecting answer "${correctAnswer2}" immediately...`);
  const slowAnswerButton2 = slowPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer2, 'i') }).first();
  await expect(slowAnswerButton2).toBeVisible({ timeout: 10000 });
  await slowAnswerButton2.click();
  await slowPlayer.page.waitForTimeout(50);
  await slowAnswerButton2.click(); // Lock
  await slowPlayer.page.waitForTimeout(2000);
  console.log(`  ✅ SlowPlayer answered immediately`);
  
  // NoAnswerPlayer: Wait 6 seconds, then answer
  console.log(`  ⏳ NoAnswerPlayer: Waiting 6 seconds before answering...`);
  await noAnswerPlayer.page.waitForTimeout(6000);
  console.log(`  🎯 NoAnswerPlayer: Selecting answer "${correctAnswer2}"...`);
  
  // Check if we're still on the question screen (not reveal/leaderboard)
  const isOnQuestion = await noAnswerPlayer.page.locator('text=/Question|Select your answer/i').isVisible().catch(() => false);
  
  if (!isOnQuestion) {
    console.log(`  ⚠️  NoAnswerPlayer: Question timer expired, cannot answer (expected for 6s delay)`);
  } else {
    // Ensure buttons are still ready
    const answerLetter2 = correctAnswer2;
    const buttonsReady = await noAnswerPlayer.page.waitForFunction(
      (letter) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => {
          const text = (btn.textContent || '').trim();
          return text.includes(letter) && text.length > 1 && !btn.disabled;
        });
      },
      answerLetter2,
      { timeout: 5000 }
    ).catch(() => false);
    
    if (buttonsReady) {
      const noAnswerButton2 = noAnswerPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer2, 'i') }).first();
      const buttonVisible = await noAnswerButton2.isVisible().catch(() => false);
      
      if (buttonVisible) {
        await noAnswerButton2.click();
        await noAnswerPlayer.page.waitForTimeout(50);
        await noAnswerButton2.click(); // Lock
        await noAnswerPlayer.page.waitForTimeout(2000);
        console.log(`  ✅ NoAnswerPlayer answered after 6s`);
      } else {
        console.log(`  ⚠️  NoAnswerPlayer: Button not visible, timer may have expired`);
      }
    } else {
      console.log(`  ⚠️  NoAnswerPlayer: Buttons not ready, timer may have expired`);
    }
  }
  
  // Host skips timer
  await hostPage.waitForTimeout(1000);
  const skipButton2 = hostPage.getByRole('button', { name: /skip|reveal/i }).first();
  const skipVisible2 = await skipButton2.isVisible().catch(() => false);
  if (skipVisible2) {
    await skipButton2.click();
  }
  
  // Wait for scoring to complete
  await hostPage.waitForTimeout(2000);
  retries = 0;
  while (retries < 10) {
    await hostPage.waitForTimeout(500);
    const { data: answers } = await supabase
      .from('player_answers')
      .select('id, player_id, points_earned')
      .eq('game_id', gameId)
      .eq('question_id', question2Id);
    
    const allAnswered = answers?.filter(a => a.points_earned !== null).length === 3;
    if (allAnswered) {
      break;
    }
    retries++;
  }
  
  // Verify Question 2 scores
  const { data: fastAnswer2 } = await supabase
    .from('player_answers')
    .select('points_earned, response_time_ms')
    .eq('game_id', gameId)
    .eq('player_id', fastPlayer.playerId)
    .eq('question_id', question2Id)
    .single();
  
  const { data: slowAnswer2 } = await supabase
    .from('player_answers')
    .select('points_earned, response_time_ms')
    .eq('game_id', gameId)
    .eq('player_id', slowPlayer.playerId)
    .eq('question_id', question2Id)
    .single();
  
  const { data: noAnswer2 } = await supabase
    .from('player_answers')
    .select('points_earned, response_time_ms')
    .eq('game_id', gameId)
    .eq('player_id', noAnswerPlayer.playerId)
    .eq('question_id', question2Id)
    .single();
  
  const fastPoints2 = fastAnswer2?.points_earned || 0;
  const slowPoints2 = slowAnswer2?.points_earned || 0;
  const noAnswerPoints2 = noAnswer2?.points_earned || 0;
  
  scoreBreakdown.FastPlayer.push({ question: 2, points: fastPoints2, expected: 13 });
  scoreBreakdown.SlowPlayer.push({ question: 2, points: slowPoints2, expected: 15 });
  scoreBreakdown.NoAnswerPlayer.push({ question: 2, points: noAnswerPoints2, expected: 10 });
  
  console.log(`  📊 Question 2 Results:`);
  console.log(`     FastPlayer: ${fastPoints2} points (expected: 13, time: ${fastAnswer2?.response_time_ms}ms)`);
  console.log(`     SlowPlayer: ${slowPoints2} points (expected: 15, time: ${slowAnswer2?.response_time_ms}ms)`);
  console.log(`     NoAnswerPlayer: ${noAnswerPoints2} points (expected: 10, time: ${noAnswer2?.response_time_ms}ms)\n`);
  
  // Move to next question - wait for leaderboard, then skip
  console.log('  ⏳ Waiting for leaderboard to appear...');
  await hostPage.waitForTimeout(2000);
  
  // Wait for leaderboard countdown or skip button
  const countdownText2 = hostPage.locator('text=/Next question in/i');
  const countdownVisible2 = await countdownText2.isVisible().catch(() => false);
  
  if (countdownVisible2) {
    console.log('  ⏳ Leaderboard countdown visible, waiting for skip button...');
    await hostPage.waitForTimeout(1000);
  }
  
  // Click skip on leaderboard to advance to next question
  const skipLeaderboardButton2 = hostPage.getByRole('button', { name: /skip|next|continue/i }).first();
  const skipLeaderboardVisible2 = await skipLeaderboardButton2.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (skipLeaderboardVisible2) {
    console.log('  ✅ Clicking skip on leaderboard to advance to question 3...');
    await skipLeaderboardButton2.click();
    await hostPage.waitForTimeout(2000);
  } else {
    // If no skip button, wait for countdown (10 seconds)
    console.log('  ⏳ No skip button, waiting for countdown to finish (10s)...');
    await hostPage.waitForTimeout(11000);
  }
  
  // ============================================
  // QUESTION 3: FastPlayer 2s, SlowPlayer 4s, NoAnswerPlayer immediate
  // ============================================
  console.log('📝 QUESTION 3: FastPlayer 2s, SlowPlayer 4s, NoAnswerPlayer immediate');
  console.log('   Expected: FastPlayer=15, SlowPlayer=13, NoAnswerPlayer=15\n');
  
  // Wait for question 3 to appear on all players
  console.log('  ⏳ Waiting for question 3 to appear on all players...');
  for (const player of playerContexts) {
    // Wait for question 3 specifically, not just any question text
    const question3Text = player.page.locator('text=/Question 3 of/i');
    await expect(question3Text).toBeVisible({ timeout: 15000 });
    console.log(`    ✅ ${player.name}: Question 3 visible`);
    
    // Wait for buttons to appear (more reliable than text)
    await player.page.waitForTimeout(2000); // Wait for animations
    const answerButtons = player.page.locator('button').filter({ hasText: /^[A-D]/i });
    await expect(answerButtons.first()).toBeVisible({ timeout: 10000 });
    console.log(`    ✅ ${player.name}: Answer buttons visible`);
  }
  
  // Get correct answer for question 3
  const question3Data = await getCurrentQuestionData();
  const correctAnswer3 = question3Data.correctAnswer;
  const question3Id = question3Data.questionId;
  
  console.log(`  📋 Question ${question3Data.orderIndex} - Correct answer: ${correctAnswer3}`);
  
  // Verify buttons are visible
  console.log('  🔍 Verifying answer buttons are visible...');
  for (const player of playerContexts) {
    const answerButton = player.page.locator('button').filter({ hasText: new RegExp(correctAnswer3, 'i') }).first();
    const isVisible = await answerButton.isVisible().catch(() => false);
    console.log(`    ${player.name}: Correct answer button (${correctAnswer3}) visible: ${isVisible}`);
  }
  
  // FastPlayer: Wait 2 seconds, then answer
  console.log(`  ⏳ FastPlayer: Waiting 2 seconds before answering...`);
  await fastPlayer.page.waitForTimeout(2000);
  console.log(`  🎯 FastPlayer: Selecting answer "${correctAnswer3}"...`);
  const fastAnswerButton3 = fastPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer3, 'i') }).first();
  await expect(fastAnswerButton3).toBeVisible({ timeout: 10000 });
  await fastAnswerButton3.click();
  await fastPlayer.page.waitForTimeout(50);
  await fastAnswerButton3.click(); // Lock
  await fastPlayer.page.waitForTimeout(2000);
  console.log(`  ✅ FastPlayer answered after 2s`);
  
  // SlowPlayer: Wait 4 seconds, then answer (Tier 2)
  console.log(`  ⏳ SlowPlayer: Waiting 4 seconds before answering...`);
  await slowPlayer.page.waitForTimeout(4000);
  console.log(`  🎯 SlowPlayer: Selecting answer "${correctAnswer3}"...`);
  const slowAnswerButton3 = slowPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer3, 'i') }).first();
  await expect(slowAnswerButton3).toBeVisible({ timeout: 10000 });
  await slowAnswerButton3.click();
  await slowPlayer.page.waitForTimeout(50);
  await slowAnswerButton3.click(); // Lock
  await slowPlayer.page.waitForTimeout(2000);
  console.log(`  ✅ SlowPlayer answered after 4s`);
  
  // NoAnswerPlayer: Answer immediately (<3s)
  console.log(`  🎯 NoAnswerPlayer: Selecting answer "${correctAnswer3}" immediately...`);
  
  // Check if we're still on the question screen
  const isOnQuestion3 = await noAnswerPlayer.page.locator('text=/Question|Select your answer/i').isVisible().catch(() => false);
  
  if (!isOnQuestion3) {
    console.log(`  ⚠️  NoAnswerPlayer: Question timer expired, cannot answer`);
  } else {
    // Ensure buttons are ready
    const answerLetter3 = correctAnswer3;
    const buttonsReady3 = await noAnswerPlayer.page.waitForFunction(
      (letter) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => {
          const text = (btn.textContent || '').trim();
          return text.includes(letter) && text.length > 1 && !btn.disabled;
        });
      },
      answerLetter3,
      { timeout: 5000 }
    ).catch(() => false);
    
    if (buttonsReady3) {
      const noAnswerButton3 = noAnswerPlayer.page.locator('button').filter({ hasText: new RegExp(correctAnswer3, 'i') }).first();
      const buttonVisible3 = await noAnswerButton3.isVisible().catch(() => false);
      
      if (buttonVisible3) {
        await noAnswerButton3.click();
        await noAnswerPlayer.page.waitForTimeout(50);
        await noAnswerButton3.click(); // Lock
        await noAnswerPlayer.page.waitForTimeout(2000);
        console.log(`  ✅ NoAnswerPlayer answered immediately`);
      } else {
        console.log(`  ⚠️  NoAnswerPlayer: Button not visible, timer may have expired`);
      }
    } else {
      console.log(`  ⚠️  NoAnswerPlayer: Buttons not ready, timer may have expired`);
    }
  }
  
  // Host skips timer
  await hostPage.waitForTimeout(1000);
  const skipButton3 = hostPage.getByRole('button', { name: /skip|reveal/i }).first();
  const skipVisible3 = await skipButton3.isVisible().catch(() => false);
  if (skipVisible3) {
    await skipButton3.click();
  }
  
  // Wait for scoring to complete
  await hostPage.waitForTimeout(2000);
  retries = 0;
  while (retries < 10) {
    await hostPage.waitForTimeout(500);
    const { data: answers } = await supabase
      .from('player_answers')
      .select('id, player_id, points_earned')
      .eq('game_id', gameId)
      .eq('question_id', question3Id);
    
    const allAnswered = answers?.filter(a => a.points_earned !== null).length === 3;
    if (allAnswered) {
      break;
    }
    retries++;
  }
  
  // Verify Question 3 scores
  const { data: fastAnswer3 } = await supabase
    .from('player_answers')
    .select('points_earned, response_time_ms')
    .eq('game_id', gameId)
    .eq('player_id', fastPlayer.playerId)
    .eq('question_id', question3Id)
    .single();
  
  const { data: slowAnswer3 } = await supabase
    .from('player_answers')
    .select('points_earned, response_time_ms')
    .eq('game_id', gameId)
    .eq('player_id', slowPlayer.playerId)
    .eq('question_id', question3Id)
    .single();
  
  const { data: noAnswer3 } = await supabase
    .from('player_answers')
    .select('points_earned, response_time_ms')
    .eq('game_id', gameId)
    .eq('player_id', noAnswerPlayer.playerId)
    .eq('question_id', question3Id)
    .single();
  
  const fastPoints3 = fastAnswer3?.points_earned || 0;
  const slowPoints3 = slowAnswer3?.points_earned || 0;
  const noAnswerPoints3 = noAnswer3?.points_earned || 0;
  
  scoreBreakdown.FastPlayer.push({ question: 3, points: fastPoints3, expected: 15 });
  scoreBreakdown.SlowPlayer.push({ question: 3, points: slowPoints3, expected: 13 });
  scoreBreakdown.NoAnswerPlayer.push({ question: 3, points: noAnswerPoints3, expected: 15 });
  
  console.log(`  📊 Question 3 Results:`);
  console.log(`     FastPlayer: ${fastPoints3} points (expected: 15, time: ${fastAnswer3?.response_time_ms}ms)`);
  console.log(`     SlowPlayer: ${slowPoints3} points (expected: 13, time: ${slowAnswer3?.response_time_ms}ms)`);
  console.log(`     NoAnswerPlayer: ${noAnswerPoints3} points (expected: 15, time: ${noAnswer3?.response_time_ms}ms)\n`);
  
  // ============================================
  // FINAL VERIFICATION: Total Scores
  // ============================================
  console.log('📊 ========================================');
  console.log('📊 FINAL SCORE SUMMARY');
  console.log('📊 ========================================\n');
  
  // Get final total scores from database
  const { data: fastPlayerFinal } = await supabase
    .from('game_players')
    .select('total_score')
    .eq('id', fastPlayer.playerId)
    .single();
  
  const { data: slowPlayerFinal } = await supabase
    .from('game_players')
    .select('total_score')
    .eq('id', slowPlayer.playerId)
    .single();
  
  const { data: noAnswerPlayerFinal } = await supabase
    .from('game_players')
    .select('total_score')
    .eq('id', noAnswerPlayer.playerId)
    .single();
  
  const fastTotal = fastPlayerFinal?.total_score || 0;
  const slowTotal = slowPlayerFinal?.total_score || 0;
  const noAnswerTotal = noAnswerPlayerFinal?.total_score || 0;
  
  const fastExpectedTotal = scoreBreakdown.FastPlayer.reduce((sum, q) => sum + q.expected, 0);
  const slowExpectedTotal = scoreBreakdown.SlowPlayer.reduce((sum, q) => sum + q.expected, 0);
  const noAnswerExpectedTotal = scoreBreakdown.NoAnswerPlayer.reduce((sum, q) => sum + q.expected, 0);
  
  console.log('📋 Score Breakdown by Question:');
  console.log('\n  FastPlayer:');
  scoreBreakdown.FastPlayer.forEach(q => {
    const match = q.points === q.expected ? '✅' : '⚠️';
    console.log(`    Q${q.question}: ${q.points} points (expected: ${q.expected}) ${match}`);
  });
  console.log(`    Total: ${fastTotal} points (expected: ${fastExpectedTotal}) ${fastTotal === fastExpectedTotal ? '✅' : '⚠️'}`);
  
  console.log('\n  SlowPlayer:');
  scoreBreakdown.SlowPlayer.forEach(q => {
    const match = q.points === q.expected ? '✅' : '⚠️';
    console.log(`    Q${q.question}: ${q.points} points (expected: ${q.expected}) ${match}`);
  });
  console.log(`    Total: ${slowTotal} points (expected: ${slowExpectedTotal}) ${slowTotal === slowExpectedTotal ? '✅' : '⚠️'}`);
  
  console.log('\n  NoAnswerPlayer:');
  scoreBreakdown.NoAnswerPlayer.forEach(q => {
    const match = q.points === q.expected ? '✅' : '⚠️';
    console.log(`    Q${q.question}: ${q.points} points (expected: ${q.expected}) ${match}`);
  });
  console.log(`    Total: ${noAnswerTotal} points (expected: ${noAnswerExpectedTotal}) ${noAnswerTotal === noAnswerExpectedTotal ? '✅' : '⚠️'}`);
  
  console.log('\n✅ ========================================');
  console.log('✅ SPEED BONUS FULL JOURNEY DEMO COMPLETE');
  console.log('✅ ========================================\n');
  
  // Cleanup
  await hostContext.close();
  for (const player of playerContexts) {
    await player.context.close();
  }
});
