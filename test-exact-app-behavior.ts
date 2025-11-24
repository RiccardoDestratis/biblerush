/**
 * Test EXACT app behavior - including double subscription bug
 * Run: pnpm tsx test-exact-app-behavior.ts
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

function createClientApp() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

function createGameChannel(gameId: string) {
  const supabase = createClientApp();
  const channelName = `game:${gameId}`;
  return supabase.channel(channelName);
}

// Simulate subscribeToGameChannel exactly
function subscribeToGameChannel(
  channel: ReturnType<typeof createClientApp>['channel'],
  callbacks: { onAnswerReveal?: (payload: any) => void }
) {
  // Set up handlers FIRST
  channel.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [Handler] answer_reveal received, calling callback');
    callbacks.onAnswerReveal?.(payload.payload);
  });
  
  // THEN subscribe (this is what subscribeToGameChannel does)
  console.log('   [subscribeToGameChannel] Calling channel.subscribe()...');
  channel.subscribe((status) => {
    console.log(`   [subscribeToGameChannel] Status: ${status}`);
  });
}

async function testExactAppBehavior() {
  console.log('🔥 Testing EXACT app behavior...\n');
  
  const gameId = 'test-game-' + Date.now();
  
  let hostReceived = false;
  let playerReceived = false;
  
  // HOST: Mimics question-display-projector.tsx
  console.log('='.repeat(60));
  console.log('HOST (question-display-projector.tsx behavior):');
  console.log('='.repeat(60));
  
  const channel1 = createGameChannel(gameId);
  console.log('1. Host creates channel');
  console.log(`   Channel state: ${channel1.state}`);
  
  // BUG: Host subscribes TWICE (line 103 + subscribeToGameChannel)
  console.log('2. Host calls channel.subscribe() explicitly (BUG - line 103)');
  channel1.subscribe((status) => {
    console.log(`   [Explicit subscribe] Status: ${status}`);
  });
  
  // Then calls subscribeToGameChannel which also subscribes
  console.log('3. Host calls subscribeToGameChannel (which ALSO subscribes)');
  subscribeToGameChannel(channel1, {
    onAnswerReveal: (payload) => {
      console.log('🔥 [HOST] onAnswerReveal callback called!', payload);
      hostReceived = true;
    }
  });
  
  // PLAYER: Mimics player-game-view.tsx
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('PLAYER (player-game-view.tsx behavior):');
    console.log('='.repeat(60));
    
    const channel2 = createGameChannel(gameId);
    console.log('1. Player creates channel');
    console.log(`   Channel state: ${channel2.state}`);
    
    // Player only calls subscribeToGameChannel (no double subscribe)
    console.log('2. Player calls subscribeToGameChannel');
    subscribeToGameChannel(channel2, {
      onAnswerReveal: (payload) => {
        console.log('🔥 [PLAYER] onAnswerReveal callback called!', payload);
        playerReceived = true;
      }
    });
    
    // Check states and broadcast
    setTimeout(() => {
      const channel1State = (channel1 as any).state;
      const channel2State = (channel2 as any).state;
      
      console.log('\n' + '='.repeat(60));
      console.log('CHECKING STATES:');
      console.log('='.repeat(60));
      console.log(`   Host channel state: ${channel1State}`);
      console.log(`   Player channel state: ${channel2State}`);
      
      const hostReady = channel1State === 'joined' || channel1State === 'SUBSCRIBED';
      const playerReady = channel2State === 'joined' || channel2State === 'SUBSCRIBED';
      
      if (hostReady && playerReady) {
        console.log('\n' + '='.repeat(60));
        console.log('BROADCASTING answer_reveal from host...');
        console.log('='.repeat(60));
        
        channel1.send({
          type: 'broadcast',
          event: 'answer_reveal',
          payload: { questionId: 'test-123', correctAnswer: 'A' },
        }).then(() => {
          setTimeout(() => {
            console.log('\n' + '='.repeat(60));
            console.log('RESULTS:');
            console.log('='.repeat(60));
            console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
            console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
            
            if (playerReceived) {
              console.log('\n✅ TEST PASSED - Player received event');
              process.exit(0);
            } else {
              console.log('\n❌ TEST FAILED - Player did NOT receive event');
              console.log('   This is the bug in the app!');
              process.exit(1);
            }
          }, 3000);
        }).catch((error) => {
          console.error('❌ Broadcast error:', error);
          process.exit(1);
        });
      } else {
        console.log('\n❌ Channels not ready');
        console.log(`   Host ready: ${hostReady}`);
        console.log(`   Player ready: ${playerReady}`);
        process.exit(1);
      }
    }, 3000);
  }, 1000);
  
  // Timeout
  setTimeout(() => {
    console.log('\n⏱️ TIMEOUT');
    console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
    process.exit(playerReceived ? 0 : 1);
  }, 15000);
}

testExactAppBehavior().catch(console.error);


