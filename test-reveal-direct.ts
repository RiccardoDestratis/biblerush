/**
 * Quick direct test of Supabase Realtime broadcast
 * No UI - just test if events are received
 * Run: pnpm tsx test-reveal-direct.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load env vars
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing SUPABASE env vars');
  process.exit(1);
}

console.log(`Using Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBroadcast() {
  console.log('🔥 Testing Supabase Realtime broadcast directly...\n');
  
  const gameId = 'test-game-' + Date.now();
  const channelName = `game:${gameId}`;
  
  console.log(`1. Creating channels: ${channelName}`);
  
  // Create separate clients to simulate host vs player
  const supabaseHost = createClient(supabaseUrl, supabaseAnonKey);
  const supabasePlayer = createClient(supabaseUrl, supabaseAnonKey);
  
  const channel1 = supabaseHost.channel(channelName); // Host
  const channel2 = supabasePlayer.channel(channelName); // Player
  
  console.log(`   Channel1 created: ${channel1.state}`);
  console.log(`   Channel2 created: ${channel2.state}`);
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  console.log('2. Setting up host listener...');
  // Register handlers FIRST
  channel1.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [HOST] Received answer_reveal:', payload);
    hostReceived = true;
  });
  
  // THEN subscribe
  channel1.subscribe((status) => {
    console.log(`   [HOST] Channel status: ${status}`);
    if (status === 'SUBSCRIBED') {
      hostSubscribed = true;
      console.log('   [HOST] ✅ Subscribed, ready to send/receive');
      tryBroadcast();
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.error(`   [HOST] ❌ Subscription error: ${status}`);
    }
  });
  
  // Wait a bit before setting up player (simulate separate devices)
  setTimeout(() => {
    console.log('3. Setting up player listener...');
    // Register handlers FIRST
    channel2.on('broadcast', { event: 'answer_reveal' }, (payload) => {
      console.log('🔥 [PLAYER] Received answer_reveal:', payload);
      playerReceived = true;
    });
    
    // THEN subscribe
    console.log(`   [PLAYER] Subscribing, current state: ${channel2.state}`);
    channel2.subscribe((status) => {
      console.log(`   [PLAYER] Channel status: ${status}`);
      if (status === 'SUBSCRIBED') {
        playerSubscribed = true;
        console.log('   [PLAYER] ✅ Subscribed, ready to receive');
        tryBroadcast();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`   [PLAYER] ❌ Subscription error: ${status}`);
      }
    });
  }, 1000);
  
  // Try to broadcast when both are ready
  function tryBroadcast() {
    if (!hostSubscribed || !playerSubscribed) {
      return;
    }
    
    // Only broadcast once
    if ((hostReceived || playerReceived)) {
      return;
    }
    
    console.log('\n4. Both subscribed! Broadcasting answer_reveal from host...');
    channel1.send({
      type: 'broadcast',
      event: 'answer_reveal',
      payload: { questionId: 'test-123', correctAnswer: 'A' },
    }).then((result) => {
      console.log('   Broadcast result:', result);
      
      // Check if player received it after 2 seconds
      setTimeout(() => {
        console.log('\n5. Results:');
        console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
        console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
        console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
        console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
        
        if (playerReceived) {
          console.log('\n✅ TEST PASSED - Player received the event!');
          process.exit(0);
        } else {
          console.log('\n❌ TEST FAILED - Player did NOT receive the event');
          process.exit(1);
        }
      }, 3000);
    }).catch((error) => {
      console.error('❌ Error broadcasting:', error);
      process.exit(1);
    });
  }
  
  // Timeout after 15 seconds
  setTimeout(() => {
    console.log('\n⏱️  TIMEOUT after 15 seconds');
    console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
    console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
    console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
    process.exit(playerReceived ? 0 : 1);
  }, 15000);
}

testBroadcast().catch((error) => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
