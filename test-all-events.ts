/**
 * Comprehensive test: All game events propagate correctly
 * Tests: answer_reveal, leaderboard_ready, question_advance, game_end
 * Run: pnpm tsx test-all-events.ts
 */

import { createBrowserClient } from "@supabase/ssr";
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing SUPABASE env vars');
  process.exit(1);
}

function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

function createGameChannel(gameId: string) {
  const supabase = createClient();
  return supabase.channel(`game:${gameId}`);
}

function subscribeToGameChannel(
  channel: ReturnType<typeof createClient>['channel'],
  callbacks: {
    onAnswerReveal?: (payload: any) => void;
    onLeaderboardReady?: (payload: any) => void;
    onQuestionAdvance?: (payload: any) => void;
    onGameEnd?: (payload: any) => void;
  }
) {
  channel.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    callbacks.onAnswerReveal?.(payload.payload);
  });
  
  channel.on('broadcast', { event: 'leaderboard_ready' }, (payload) => {
    callbacks.onLeaderboardReady?.(payload.payload);
  });
  
  channel.on('broadcast', { event: 'question_advance' }, (payload) => {
    callbacks.onQuestionAdvance?.(payload.payload);
  });
  
  channel.on('broadcast', { event: 'game_end' }, (payload) => {
    callbacks.onGameEnd?.(payload.payload);
  });
  
  channel.subscribe((status) => {
    console.log(`   Status: ${status}`);
  });
}

async function broadcastEvent(
  channel: ReturnType<typeof createClient>['channel'],
  event: string,
  payload: any
) {
  await channel.send({
    type: 'broadcast',
    event,
    payload,
  });
}

async function testAllEvents() {
  console.log('🔥 Testing ALL game events propagation...\n');
  
  const gameId = 'test-game-' + Date.now();
  
  const results = {
    answerReveal: { host: false, player: false },
    leaderboardReady: { host: false, player: false },
    questionAdvance: { host: false, player: false },
    gameEnd: { host: false, player: false },
  };
  
  // Host
  const hostChannel = createGameChannel(gameId);
  subscribeToGameChannel(hostChannel, {
    onAnswerReveal: (p) => { results.answerReveal.host = true; console.log('🔥 [HOST] answer_reveal'); },
    onLeaderboardReady: (p) => { results.leaderboardReady.host = true; console.log('🔥 [HOST] leaderboard_ready'); },
    onQuestionAdvance: (p) => { results.questionAdvance.host = true; console.log('🔥 [HOST] question_advance'); },
    onGameEnd: (p) => { results.gameEnd.host = true; console.log('🔥 [HOST] game_end'); },
  });
  
  // Player
  setTimeout(() => {
    const playerChannel = createGameChannel(gameId);
    subscribeToGameChannel(playerChannel, {
      onAnswerReveal: (p) => { results.answerReveal.player = true; console.log('🔥 [PLAYER] answer_reveal'); },
      onLeaderboardReady: (p) => { results.leaderboardReady.player = true; console.log('🔥 [PLAYER] leaderboard_ready'); },
      onQuestionAdvance: (p) => { results.questionAdvance.player = true; console.log('🔥 [PLAYER] question_advance'); },
      onGameEnd: (p) => { results.gameEnd.player = true; console.log('🔥 [PLAYER] game_end'); },
    });
    
    // Wait for both to subscribe, then test all events
    setTimeout(async () => {
      const hostState = (hostChannel as any).state;
      const playerState = (playerChannel as any).state;
      
      if (hostState !== 'joined' && hostState !== 'SUBSCRIBED') {
        console.error('❌ Host not subscribed');
        process.exit(1);
      }
      if (playerState !== 'joined' && playerState !== 'SUBSCRIBED') {
        console.error('❌ Player not subscribed');
        process.exit(1);
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('TESTING ALL EVENTS:');
      console.log('='.repeat(60));
      
      // Test 1: answer_reveal
      console.log('\n1. Testing answer_reveal...');
      await broadcastEvent(hostChannel, 'answer_reveal', {
        gameId,
        questionId: 'q1',
        correctAnswer: 'A',
        scriptureReference: 'John 3:16'
      });
      await new Promise(r => setTimeout(r, 2000));
      
      // Test 2: leaderboard_ready
      console.log('\n2. Testing leaderboard_ready...');
      await broadcastEvent(hostChannel, 'leaderboard_ready', {
        gameId,
        questionId: 'q1'
      });
      await new Promise(r => setTimeout(r, 2000));
      
      // Test 3: question_advance
      console.log('\n3. Testing question_advance...');
      await broadcastEvent(hostChannel, 'question_advance', {
        gameId,
        questionNumber: 2
      });
      await new Promise(r => setTimeout(r, 2000));
      
      // Test 4: game_end
      console.log('\n4. Testing game_end...');
      await broadcastEvent(hostChannel, 'game_end', {
        gameId
      });
      await new Promise(r => setTimeout(r, 2000));
      
      // Results
      console.log('\n' + '='.repeat(60));
      console.log('RESULTS:');
      console.log('='.repeat(60));
      
      const allPassed = Object.entries(results).every(([event, { host, player }]) => {
        const passed = player; // Player receiving is what matters
        console.log(`   ${event}:`);
        console.log(`     Host: ${host ? '✅' : '❌'}`);
        console.log(`     Player: ${player ? '✅' : '❌'}`);
        return passed;
      });
      
      if (allPassed) {
        console.log('\n✅ ALL TESTS PASSED - All events propagate correctly!');
        process.exit(0);
      } else {
        console.log('\n❌ SOME TESTS FAILED');
        process.exit(1);
      }
    }, 3000);
  }, 1000);
  
  setTimeout(() => {
    console.log('\n⏱️ TIMEOUT');
    process.exit(1);
  }, 20000);
}

testAllEvents().catch(console.error);

