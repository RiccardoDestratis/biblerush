/**
 * Test Utilities for Persistent Game Testing
 * 
 * This module provides utilities to create and manage persistent games for testing.
 * Instead of creating a new game every time, you can reuse a game ID and reset its state.
 * 
 * Usage:
 *   import { getOrCreateTestGame, resetGameToQuestion, addTestPlayer } from '@/lib/test-utils/persistent-game';
 *   
 *   // Get or create a persistent test game
 *   const gameId = await getOrCreateTestGame('test-game-q3-to-end');
 *   
 *   // Reset game to question 3 (ready to test game over flow)
 *   await resetGameToQuestion(gameId, 3);
 *   
 *   // Add a test player
 *   const playerId = await addTestPlayer(gameId, 'TestPlayer');
 */

import { createServiceClient } from "@/lib/supabase/server";
import { config } from 'dotenv';

config({ path: '.env.local' });

const TEST_GAME_PREFIX = 'TEST-';
const DEFAULT_QUESTION_SET_ID = 'b057652d-01b0-4b5e-aa1d-403ddaa33f5a'; // Bible Basics

/**
 * Get or create a persistent test game
 * If the game exists, it will be reused. If not, a new one will be created.
 * 
 * @param gameName - Unique name for the test game (will be prefixed with TEST-)
 * @param questionCount - Number of questions (default: 3 for fast testing)
 * @returns Game ID
 */
export async function getOrCreateTestGame(
  gameName: string,
  questionCount: number = 3
): Promise<string> {
  const supabase = createServiceClient();
  const roomCode = `${TEST_GAME_PREFIX}${gameName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
  
  console.log(`[TestUtils] 🔍 Looking for test game: ${roomCode}`);
  
  // Try to find existing game
  const { data: existingGame, error: findError } = await supabase
    .from('games')
    .select('id, status, question_count')
    .eq('room_code', roomCode)
    .single();
  
  if (existingGame && !findError) {
    console.log(`[TestUtils] ✅ Found existing test game: ${existingGame.id}`);
    console.log(`[TestUtils]    Status: ${existingGame.status}, Questions: ${existingGame.question_count}`);
    return existingGame.id;
  }
  
  // Create new game
  console.log(`[TestUtils] 📝 Creating new test game: ${roomCode}`);
  const { data: newGame, error: createError } = await supabase
    .from('games')
    .insert({
      host_id: null,
      room_code: roomCode,
      question_set_id: DEFAULT_QUESTION_SET_ID,
      question_count: questionCount,
      status: 'waiting',
      current_question_index: 0,
    })
    .select('id')
    .single();
  
  if (createError || !newGame) {
    throw new Error(`Failed to create test game: ${createError?.message || 'Unknown error'}`);
  }
  
  console.log(`[TestUtils] ✅ Created test game: ${newGame.id}`);
  return newGame.id;
}

/**
 * Reset a game to a specific question state
 * This will:
 * 1. Set game status to 'active'
 * 2. Set current_question_index to the specified question (0-based)
 * 3. Set started_at timestamp
 * 4. Clear completed_at if set
 * 
 * @param gameId - Game ID to reset
 * @param questionNumber - Question number to reset to (1-based, e.g., 3 for question 3)
 */
export async function resetGameToQuestion(
  gameId: string,
  questionNumber: number
): Promise<void> {
  const supabase = createServiceClient();
  const questionIndex = questionNumber - 1; // Convert to 0-based
  
  console.log(`[TestUtils] 🔄 Resetting game ${gameId} to question ${questionNumber} (index ${questionIndex})`);
  
  // Get game info to validate
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id, question_count, status')
    .eq('id', gameId)
    .single();
  
  if (gameError || !game) {
    throw new Error(`Game not found: ${gameId}`);
  }
  
  if (questionNumber > game.question_count) {
    throw new Error(`Question ${questionNumber} exceeds game question count (${game.question_count})`);
  }
  
  // Reset game state
  const { error: updateError } = await supabase
    .from('games')
    .update({
      status: 'active',
      current_question_index: questionIndex,
      started_at: new Date().toISOString(),
      completed_at: null, // Clear completion if set
    })
    .eq('id', gameId);
  
  if (updateError) {
    throw new Error(`Failed to reset game: ${updateError.message}`);
  }
  
  console.log(`[TestUtils] ✅ Game reset to question ${questionNumber}`);
}

/**
 * Add a test player to a game
 * 
 * @param gameId - Game ID
 * @param playerName - Player name
 * @returns Player ID
 */
export async function addTestPlayer(
  gameId: string,
  playerName: string
): Promise<string> {
  const supabase = createServiceClient();
  
  console.log(`[TestUtils] 👤 Adding test player "${playerName}" to game ${gameId}`);
  
  // Check if player already exists
  const { data: existingPlayer } = await supabase
    .from('game_players')
    .select('id')
    .eq('game_id', gameId)
    .eq('player_name', playerName)
    .single();
  
  if (existingPlayer) {
    console.log(`[TestUtils] ✅ Player "${playerName}" already exists: ${existingPlayer.id}`);
    return existingPlayer.id;
  }
  
  // Create new player
  const { data: newPlayer, error: createError } = await supabase
    .from('game_players')
    .insert({
      game_id: gameId,
      player_name: playerName,
      total_score: 0,
      joined_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  
  if (createError || !newPlayer) {
    throw new Error(`Failed to add test player: ${createError?.message || 'Unknown error'}`);
  }
  
  console.log(`[TestUtils] ✅ Added test player: ${newPlayer.id}`);
  return newPlayer.id;
}

/**
 * Get game room code
 * 
 * @param gameId - Game ID
 * @returns Room code
 */
export async function getGameRoomCode(gameId: string): Promise<string> {
  const supabase = createServiceClient();
  
  const { data: game, error } = await supabase
    .from('games')
    .select('room_code')
    .eq('id', gameId)
    .single();
  
  if (error || !game) {
    throw new Error(`Game not found: ${gameId}`);
  }
  
  return game.room_code;
}

/**
 * Clean up test game (delete it)
 * 
 * @param gameId - Game ID to delete
 */
export async function cleanupTestGame(gameId: string): Promise<void> {
  const supabase = createServiceClient();
  
  console.log(`[TestUtils] 🗑️  Cleaning up test game: ${gameId}`);
  
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId);
  
  if (error) {
    console.error(`[TestUtils] ⚠️  Failed to cleanup game: ${error.message}`);
    throw new Error(`Failed to cleanup test game: ${error.message}`);
  }
  
  console.log(`[TestUtils] ✅ Test game cleaned up`);
}

/**
 * Get game state info for debugging
 * 
 * @param gameId - Game ID
 * @returns Game state info
 */
export async function getGameState(gameId: string): Promise<{
  id: string;
  roomCode: string;
  status: string;
  currentQuestionIndex: number;
  questionCount: number;
  startedAt: string | null;
  completedAt: string | null;
  playerCount: number;
}> {
  const supabase = createServiceClient();
  
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id, room_code, status, current_question_index, question_count, started_at, completed_at')
    .eq('id', gameId)
    .single();
  
  if (gameError || !game) {
    throw new Error(`Game not found: ${gameId}`);
  }
  
  const { count: playerCount } = await supabase
    .from('game_players')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId);
  
  return {
    id: game.id,
    roomCode: game.room_code,
    status: game.status || 'waiting',
    currentQuestionIndex: game.current_question_index ?? 0,
    questionCount: game.question_count,
    startedAt: game.started_at,
    completedAt: game.completed_at,
    playerCount: playerCount || 0,
  };
}


