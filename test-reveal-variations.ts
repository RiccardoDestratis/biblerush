/**
 * Test different approaches to Supabase Realtime broadcast
 * Run: pnpm tsx test-reveal-variations.ts
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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testApproach(approach: number) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔥 TESTING APPROACH ${approach}`);
  console.log('='.repeat(60));
  
  const gameId = `test-${approach}-${Date.now()}`;
  const channelName = `game:${gameId}`;
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  let channel1: ReturnType<typeof supabase.channel>;
  let channel2: ReturnType<typeof supabase.channel>;
  let supabaseHost = supabase;
  let supabasePlayer = supabase;
  
  // Different approaches
  if (approach === 1) {
    // Approach 1: Same client, same channel name, subscribe immediately
    console.log('Approach 1: Same client, subscribe immediately');
    channel1 = supabase.channel(channelName);
    channel2 = supabase.channel(channelName);
  } else if (approach === 2) {
    // Approach 2: Separate clients, subscribe immediately
    console.log('Approach 2: Separate clients, subscribe immediately');
    supabaseHost = createClient(supabaseUrl, supabaseAnonKey);
    supabasePlayer = createClient(supabaseUrl, supabaseAnonKey);
    channel1 = supabaseHost.channel(channelName);
    channel2 = supabasePlayer.channel(channelName);
  } else if (approach === 3) {
    // Approach 3: Separate clients, player subscribes after delay
    console.log('Approach 3: Separate clients, player subscribes after delay');
    supabaseHost = createClient(supabaseUrl, supabaseAnonKey);
    supabasePlayer = createClient(supabaseUrl, supabaseAnonKey);
    channel1 = supabaseHost.channel(channelName);
    channel2 = supabasePlayer.channel(channelName);
  }
  
  // Set up host
  console.log('Setting up host...');
  channel1.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [HOST] Received answer_reveal:', payload);
    hostReceived = true;
  });
  
  channel1.subscribe((status) => {
    console.log(`   [HOST] Status: ${status}`);
    if (status === 'SUBSCRIBED') {
      hostSubscribed = true;
      tryBroadcast();
    }
  });
  
  // Set up player
  function setupPlayer() {
    console.log('Setting up player...');
    channel2.on('broadcast', { event: 'answer_reveal' }, (payload) => {
      console.log('🔥 [PLAYER] Received answer_reveal:', payload);
      playerReceived = true;
    });
    
    channel2.subscribe((status) => {
      console.log(`   [PLAYER] Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        playerSubscribed = true;
        tryBroadcast();
      }
    });
  }
  
  if (approach === 3) {
    // Delay player subscription
    setTimeout(setupPlayer, 1000);
  } else {
    setupPlayer();
  }
  
  function tryBroadcast() {
    if (!hostSubscribed || (approach !== 3 && !playerSubscribed)) {
      return;
    }
    
    // Wait a bit for approach 3
    setTimeout(() => {
      if (!hostSubscribed || !playerSubscribed) {
        console.log('⏱️ Not all subscribed, skipping broadcast');
        return;
      }
      
      console.log('\n📢 Broadcasting answer_reveal...');
      channel1.send({
        type: 'broadcast',
        event: 'answer_reveal',
        payload: { questionId: 'test-123', correctAnswer: 'A' },
      }).then(() => {
        setTimeout(() => {
          console.log('\n📊 Results:');
          console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
          console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
          console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
          console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
          
          if (playerReceived) {
            console.log(`\n✅ APPROACH ${approach} PASSED`);
          } else {
            console.log(`\n❌ APPROACH ${approach} FAILED`);
          }
          
          // Cleanup
          channel1.unsubscribe();
          channel2.unsubscribe();
          resolveTest(approach, playerReceived);
        }, 3000);
      }).catch((error) => {
        console.error('❌ Broadcast error:', error);
        resolveTest(approach, false);
      });
    }, approach === 3 ? 2000 : 1000);
  }
  
  // Timeout after 10 seconds
  setTimeout(() => {
    console.log(`\n⏱️ APPROACH ${approach} TIMEOUT`);
    console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
    console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
    console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
    channel1.unsubscribe();
    channel2.unsubscribe();
    resolveTest(approach, playerReceived);
  }, 10000);
}

const results: Record<number, boolean> = {};
let currentTest = 0;
const totalTests = 3;

function resolveTest(approach: number, passed: boolean) {
  results[approach] = passed;
  currentTest++;
  
  if (currentTest >= totalTests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(60));
    for (let i = 1; i <= totalTests; i++) {
      console.log(`   Approach ${i}: ${results[i] ? '✅ PASSED' : '❌ FAILED'}`);
    }
    process.exit(Object.values(results).some(r => r) ? 0 : 1);
  }
}

// Run all tests sequentially
async function runAllTests() {
  for (let i = 1; i <= totalTests; i++) {
    await testApproach(i);
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

runAllTests().catch(console.error);

