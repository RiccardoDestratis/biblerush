/**
 * Reset Test Game Script
 * 
 * Quick utility to reset a persistent test game to a specific state.
 * 
 * Usage:
 *   pnpm tsx scripts/reset-test-game.ts [gameName] [questionNumber]
 * 
 * Examples:
 *   pnpm tsx scripts/reset-test-game.ts q3-to-gameover 3
 *   pnpm tsx scripts/reset-test-game.ts q3-to-gameover 1
 */

import { config } from 'dotenv';
import {
  getOrCreateTestGame,
  resetGameToQuestion,
  getGameState,
  addTestPlayer,
} from '../lib/test-utils/persistent-game';

config({ path: '.env.local' });

const gameName = process.argv[2] || 'q3-to-gameover';
const questionNumber = parseInt(process.argv[3] || '3', 10);

async function resetTestGame() {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 RESET TEST GAME');
  console.log('='.repeat(80) + '\n');

  try {
    console.log(`Game Name: ${gameName}`);
    console.log(`Target Question: ${questionNumber}\n`);

    // Get or create game
    console.log('📋 Getting or creating test game...');
    const gameId = await getOrCreateTestGame(gameName, 3);
    console.log(`✅ Game ID: ${gameId}\n`);

    // Get current state
    const currentState = await getGameState(gameId);
    console.log('📊 Current State:');
    console.log(`   Status: ${currentState.status}`);
    console.log(`   Current Question: ${currentState.currentQuestionIndex + 1} of ${currentState.questionCount}`);
    console.log(`   Players: ${currentState.playerCount}\n`);

    // Reset to target question
    console.log(`🔄 Resetting to question ${questionNumber}...`);
    await resetGameToQuestion(gameId, questionNumber);

    // Ensure we have a test player
    if (currentState.playerCount === 0) {
      console.log('👤 Adding test player...');
      await addTestPlayer(gameId, 'TestPlayer');
    }

    // Get final state
    const finalState = await getGameState(gameId);
    console.log('\n✅ Reset Complete!');
    console.log('📊 Final State:');
    console.log(`   Status: ${finalState.status}`);
    console.log(`   Current Question: ${finalState.currentQuestionIndex + 1} of ${finalState.questionCount}`);
    console.log(`   Players: ${finalState.playerCount}`);
    console.log(`   Game ID: ${gameId}`);
    console.log(`   Room Code: ${finalState.roomCode}\n`);

    console.log('💡 You can now test the flow from question', questionNumber, 'to game over!');
    console.log('   Run: pnpm tsx test-question3-to-gameover.ts\n');

  } catch (error) {
    console.error('❌ Error resetting test game:', error);
    process.exit(1);
  }
}

resetTestGame();


