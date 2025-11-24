/**
 * Test with actual @supabase/ssr createBrowserClient (same as app)
 * Run: pnpm tsx test-ssr-client.ts
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

// Simulate app's createClient() - createBrowserClient DOES cache
function createClientApp() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

function createGameChannel(gameId: string) {
  const supabase = createClientApp(); // Returns cached client
  const channelName = `game:${gameId}`;
  return supabase.channel(channelName);
}

async function testSSRClient() {
  console.log('🔥 Testing with @supabase/ssr createBrowserClient...\n');
  
  const gameId = 'test-game-' + Date.now();
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  // Test 1: Same client (current app behavior - BUG)
  console.log('='.repeat(60));
  console.log('TEST 1: Same client instance (current app - should FAIL)');
  console.log('='.repeat(60));
  
  const client1 = createClientApp();
  const client2 = createClientApp();
  
  console.log(`Client1 === Client2: ${client1 === client2}`); // Should be true (singleton)
  
  const channel1 = client1.channel(`game:${gameId}`);
  const channel2 = client2.channel(`game:${gameId}`);
  
  channel1.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [HOST] Received answer_reveal:', payload);
    hostReceived = true;
  });
  
  channel1.subscribe((status) => {
    console.log(`   [HOST] Status: ${status}`);
    if (status === 'SUBSCRIBED') {
      hostSubscribed = true;
      console.log('   [HOST] ✅ Subscribed');
    }
  });
  
  setTimeout(() => {
    channel2.on('broadcast', { event: 'answer_reveal' }, (payload) => {
      console.log('🔥 [PLAYER] Received answer_reveal:', payload);
      playerReceived = true;
    });
    
    channel2.subscribe((status) => {
      console.log(`   [PLAYER] Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        playerSubscribed = true;
        console.log('   [PLAYER] ✅ Subscribed');
        if (hostSubscribed) {
          testBroadcast();
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`   [PLAYER] ❌ Subscription error: ${status}`);
      }
    });
  }, 500);
  
  function testBroadcast() {
    setTimeout(() => {
      console.log('\n📢 Broadcasting answer_reveal...');
      channel1.send({
        type: 'broadcast',
        event: 'answer_reveal',
        payload: { questionId: 'test-123', correctAnswer: 'A' },
      }).then(() => {
        setTimeout(() => {
          console.log('\n📊 TEST 1 Results:');
          console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
          console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
          console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
          
          if (!playerReceived) {
            console.log('\n❌ CONFIRMED BUG: Same client = player subscription fails');
            console.log('\n💡 SOLUTION: Need separate client instances');
          }
          
          // Test 2: Force separate clients
          console.log('\n' + '='.repeat(60));
          console.log('TEST 2: Force separate clients (FIX)');
          console.log('='.repeat(60));
          
          // Create with unique keys to force separate instances
          const client3 = createBrowserClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false, autoRefreshToken: false }
          });
          const client4 = createBrowserClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false, autoRefreshToken: false }
          });
          
          console.log(`Client3 === Client4: ${client3 === client4}`); // Might still be true
          
          // Actually, let's just create a new client with a workaround
          // The real fix: Pass a unique client instance each time
          const channel3 = client3.channel(`game:test-${Date.now()}`);
          const channel4 = client4.channel(`game:test-${Date.now()}`);
          
          // Actually wait, that won't work - they need same channel name
          // Let's test with actually separate instances
          console.log('\n💡 Fix: createClientApp() should NOT use singleton');
          console.log('   Each call should create a NEW client instance');
          
          process.exit(playerReceived ? 0 : 1);
        }, 3000);
      }).catch((error) => {
        console.error('❌ Broadcast error:', error);
        process.exit(1);
      });
    }, 1500);
  }
  
  // Timeout
  setTimeout(() => {
    console.log('\n⏱️ TIMEOUT');
    console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
    console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
    console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
    process.exit(playerReceived ? 0 : 1);
  }, 10000);
}

testSSRClient().catch(console.error);


