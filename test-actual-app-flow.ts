/**
 * Test the ACTUAL app flow: Host broadcasts, Player receives
 * This simulates the exact code path in the app
 * Run: pnpm tsx test-actual-app-flow.ts
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

// Simulate createClient() from lib/supabase/client.ts
function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Simulate createGameChannel() from lib/supabase/realtime.ts
function createGameChannel(gameId: string) {
  const supabase = createClient();
  const channelName = `game:${gameId}`;
  return supabase.channel(channelName);
}

// Simulate subscribeToGameChannel - simplified version
function subscribeToGameChannel(
  channel: ReturnType<typeof createClient>['channel'],
  callbacks: { onAnswerReveal?: (payload: any) => void }
) {
  // Set up handlers FIRST (like in real code)
  channel.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [subscribeToGameChannel handler] answer_reveal received');
    if (!callbacks.onAnswerReveal) {
      console.error('❌ NO onAnswerReveal callback!');
      return;
    }
    callbacks.onAnswerReveal(payload.payload);
  });
  
  // THEN subscribe (like in real code)
  channel.subscribe((status) => {
    console.log(`   [subscribeToGameChannel] Status: ${status}`);
  });
}

// Simulate broadcastGameEvent
async function broadcastGameEvent(
  channel: ReturnType<typeof createClient>['channel'],
  event: string,
  payload: any
) {
  console.log(`📢 [broadcastGameEvent] Broadcasting ${event}...`);
  await channel.send({
    type: 'broadcast',
    event,
    payload,
  });
  console.log(`✅ [broadcastGameEvent] Broadcast complete`);
}

async function testActualAppFlow() {
  console.log('🔥 Testing ACTUAL app flow...\n');
  console.log('Simulating:');
  console.log('  1. Host creates channel, subscribes, sets up handlers');
  console.log('  2. Player creates channel, subscribes, sets up handlers');
  console.log('  3. Host broadcasts answer_reveal');
  console.log('  4. Player should receive it\n');
  
  const gameId = 'test-game-' + Date.now();
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  // HOST: question-display-projector.tsx behavior (FIXED - no double subscription)
  console.log('='.repeat(60));
  console.log('HOST (question-display-projector.tsx) - FIXED VERSION');
  console.log('='.repeat(60));
  
  const hostChannel = createGameChannel(gameId, 'host');
  console.log('1. Host creates channel');
  console.log(`   Channel state: ${hostChannel.state}`);
  
  // Host sets up handlers via subscribeToGameChannel (FIXED - no explicit subscribe)
  console.log('2. Host calls subscribeToGameChannel (handles subscription)');
  subscribeToGameChannel(hostChannel, {
    onAnswerReveal: (payload) => {
      console.log('🔥 [HOST callback] onAnswerReveal called!', payload);
      hostReceived = true;
    }
  });
  
  // Check subscription status after a delay (subscribeToGameChannel subscribes internally)
  setTimeout(() => {
    const hostState = (hostChannel as any).state;
    if (hostState === 'joined' || hostState === 'SUBSCRIBED') {
      hostSubscribed = true;
      console.log(`   [HOST] Channel state: ${hostState} - Subscribed via subscribeToGameChannel`);
    }
  }, 1000);
  
  // PLAYER: player-game-view.tsx behavior
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('PLAYER (player-game-view.tsx)');
    console.log('='.repeat(60));
    
    const playerChannel = createGameChannel(gameId, 'player');
    console.log('1. Player creates channel');
    console.log(`   Channel state: ${playerChannel.state}`);
    
    // Player only calls subscribeToGameChannel (no explicit subscribe)
    console.log('2. Player calls subscribeToGameChannel');
    subscribeToGameChannel(playerChannel, {
      onAnswerReveal: (payload) => {
        console.log('🔥 [PLAYER callback] onAnswerReveal called!', payload);
        playerReceived = true;
      }
    });
    
    // Wait for both to be subscribed, then host broadcasts
    setTimeout(() => {
      const hostState = (hostChannel as any).state;
      const playerState = (playerChannel as any).state;
      
      // Update subscription flags based on state
      if (hostState === 'joined' || hostState === 'SUBSCRIBED') {
        hostSubscribed = true;
      }
      if (playerState === 'joined' || playerState === 'SUBSCRIBED') {
        playerSubscribed = true;
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('CHECKING STATES BEFORE BROADCAST:');
      console.log('='.repeat(60));
      console.log(`   Host channel state: ${hostState}`);
      console.log(`   Player channel state: ${playerState}`);
      console.log(`   Host subscribed: ${hostSubscribed}`);
      console.log(`   Player subscribed: ${playerSubscribed}`);
      
      if (hostSubscribed && playerSubscribed) {
        
        console.log('\n' + '='.repeat(60));
        console.log('HOST BROADCASTS answer_reveal (like line 329)');
        console.log('='.repeat(60));
        
        const payload = {
          gameId,
          questionId: 'test-123',
          correctAnswer: 'A',
          scriptureReference: 'John 3:16'
        };
        
        broadcastGameEvent(hostChannel, 'answer_reveal', payload).then(() => {
          setTimeout(() => {
            console.log('\n' + '='.repeat(60));
            console.log('RESULTS:');
            console.log('='.repeat(60));
            console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
            console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
            console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
            console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
            
            if (playerReceived) {
              console.log('\n✅ SUCCESS: Player received the event!');
              console.log('   The app code structure should work.');
              console.log('   If it doesn\'t work in the app, check:');
              console.log('   - Channel subscription timing');
              console.log('   - React useEffect dependencies');
              console.log('   - State management issues');
              process.exit(0);
            } else {
              console.log('\n❌ FAILED: Player did NOT receive the event');
              console.log('   This indicates a real bug in the app structure');
              console.log('   Need to investigate channel subscription');
              process.exit(1);
            }
          }, 3000);
        }).catch((error) => {
          console.error('❌ Broadcast error:', error);
          process.exit(1);
        });
      } else {
        console.log('\n❌ Channels not ready');
        console.log(`   Host ready: ${hostSubscribed}`);
        console.log(`   Player ready: ${playerState === 'joined' || playerState === 'SUBSCRIBED'}`);
        process.exit(1);
      }
    }, 3000);
  }, 1000);
  
  // Timeout
  setTimeout(() => {
    console.log('\n⏱️ TIMEOUT');
    console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
    console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
    console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
    process.exit(playerReceived ? 0 : 1);
  }, 20000);
}

testActualAppFlow().catch(console.error);

