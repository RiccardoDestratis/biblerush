/**
 * Test mimicking the actual app structure
 * Run: pnpm tsx test-app-structure.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing SUPABASE env vars');
  process.exit(1);
}

// Simulate the app's createClient() function
// In browser, createBrowserClient returns a singleton per URL/key
let clientSingleton: ReturnType<typeof createClient> | null = null;

function createClientApp() {
  // This simulates what createBrowserClient does - returns singleton
  if (!clientSingleton) {
    console.log('Creating new client instance...');
    clientSingleton = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.log('Reusing existing client instance (singleton)');
  }
  return clientSingleton;
}

// Simulate createGameChannel
function createGameChannel(gameId: string) {
  const supabase = createClientApp(); // This returns the same client!
  const channelName = `game:${gameId}`;
  return supabase.channel(channelName);
}

async function testAppStructure() {
  console.log('🔥 Testing app structure (singleton client)...\n');
  
  const gameId = 'test-game-' + Date.now();
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  // Host creates channel (like in question-display-projector.tsx)
  console.log('1. Host creating channel...');
  const channel1 = createGameChannel(gameId);
  console.log(`   Channel1 state: ${channel1.state}`);
  
  // Player creates channel (like in player-game-view.tsx)
  console.log('2. Player creating channel...');
  const channel2 = createGameChannel(gameId); // Same client instance!
  console.log(`   Channel2 state: ${channel2.state}`);
  
  // Set up host listeners and subscribe
  console.log('3. Setting up host listeners...');
  channel1.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [HOST] Received answer_reveal:', payload);
    hostReceived = true;
  });
  
  channel1.subscribe((status) => {
    console.log(`   [HOST] Status: ${status}`);
    if (status === 'SUBSCRIBED') {
      hostSubscribed = true;
      console.log('   [HOST] ✅ Subscribed');
      tryBroadcast();
    }
  });
  
  // Wait a bit, then set up player (simulating React component mount timing)
  setTimeout(() => {
    console.log('4. Setting up player listeners...');
    channel2.on('broadcast', { event: 'answer_reveal' }, (payload) => {
      console.log('🔥 [PLAYER] Received answer_reveal:', payload);
      playerReceived = true;
    });
    
    channel2.subscribe((status) => {
      console.log(`   [PLAYER] Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        playerSubscribed = true;
        console.log('   [PLAYER] ✅ Subscribed');
        tryBroadcast();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`   [PLAYER] ❌ Subscription error: ${status}`);
      }
    });
  }, 500);
  
  function tryBroadcast() {
    if (!hostSubscribed || !playerSubscribed) {
      return;
    }
    
    setTimeout(() => {
      console.log('\n5. Broadcasting answer_reveal...');
      channel1.send({
        type: 'broadcast',
        event: 'answer_reveal',
        payload: { questionId: 'test-123', correctAnswer: 'A' },
      }).then(() => {
        setTimeout(() => {
          console.log('\n6. Results:');
          console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
          console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
          console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
          console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
          
          if (playerReceived) {
            console.log('\n✅ TEST PASSED');
            process.exit(0);
          } else {
            console.log('\n❌ TEST FAILED - Player did not receive event');
            console.log('   This is the bug! Same client = player subscription fails.');
            process.exit(1);
          }
        }, 3000);
      }).catch((error) => {
        console.error('❌ Broadcast error:', error);
        process.exit(1);
      });
    }, 1000);
  }
  
  // Timeout
  setTimeout(() => {
    console.log('\n⏱️ TIMEOUT');
    console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
    console.log(`   Player subscribed: ${playerSubscribed ? '❌' : '❌'}`);
    console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
    process.exit(playerReceived ? 0 : 1);
  }, 15000);
}

testAppStructure().catch(console.error);


