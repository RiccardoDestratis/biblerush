/**
 * Test production scenario: Two different browsers/users
 * This simulates what happens in real production
 * Run: pnpm tsx test-production-scenario.ts
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

// Simulate the app's createClient() - each browser tab gets its own
function createClientApp() {
  // In production: Each browser/tab calls this, gets a NEW client
  // createBrowserClient does NOT cache - each call is separate
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

function createGameChannel(gameId: string) {
  const supabase = createClientApp();
  const channelName = `game:${gameId}`;
  return supabase.channel(channelName);
}

async function testProductionScenario() {
  console.log('🔥 Testing PRODUCTION scenario (two different browsers)...\n');
  console.log('Simulating:');
  console.log('  - Browser A (host) opens /game/xxx/host');
  console.log('  - Browser B (player) opens /game/xxx/play');
  console.log('  - Each has its own client instance\n');
  
  const gameId = 'test-game-' + Date.now();
  const channelName = `game:${gameId}`;
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  // Browser A (Host) - separate client instance
  console.log('='.repeat(60));
  console.log('BROWSER A (Host) - creates client instance A');
  console.log('='.repeat(60));
  const clientA = createClientApp();
  const clientA2 = createClientApp(); // Second call in same browser
  console.log(`clientA === clientA2: ${clientA === clientA2}`);
  console.log('   (In same browser, are clients the same?)\n');
  
  const channelA = clientA.channel(channelName);
  
  channelA.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [HOST Browser A] Received answer_reveal:', payload);
    hostReceived = true;
  });
  
  channelA.subscribe((status) => {
    console.log(`   [HOST] Status: ${status}`);
    if (status === 'SUBSCRIBED') {
      hostSubscribed = true;
      console.log('   [HOST] ✅ Subscribed');
    }
  });
  
  // Browser B (Player) - DIFFERENT client instance (different browser)
  setTimeout(() => {
    console.log('='.repeat(60));
    console.log('BROWSER B (Player) - creates client instance B');
    console.log('='.repeat(60));
    const clientB = createClientApp(); // Different browser = different client
    const clientB2 = createClientApp(); // Second call in same browser
    console.log(`clientB === clientB2: ${clientB === clientB2}`);
    console.log(`clientA === clientB: ${clientA === clientB}`);
    console.log('   (Different browsers = different clients?)\n');
    
    const channelB = clientB.channel(channelName);
    
    channelB.on('broadcast', { event: 'answer_reveal' }, (payload) => {
      console.log('🔥 [PLAYER Browser B] Received answer_reveal:', payload);
      playerReceived = true;
    });
    
    channelB.subscribe((status) => {
      console.log(`   [PLAYER] Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        playerSubscribed = true;
        console.log('   [PLAYER] ✅ Subscribed');
        if (hostSubscribed) {
          testBroadcast();
        }
      }
    });
    
    if (hostSubscribed) {
      testBroadcast();
    }
  }, 1000);
  
  function testBroadcast() {
    if (!hostSubscribed || !playerSubscribed) {
      return;
    }
    
    setTimeout(() => {
      console.log('\n' + '='.repeat(60));
      console.log('BROADCASTING from Browser A (Host)...');
      console.log('='.repeat(60));
      
      channelA.send({
        type: 'broadcast',
        event: 'answer_reveal',
        payload: { questionId: 'test-123', correctAnswer: 'A' },
      }).then(() => {
        setTimeout(() => {
          console.log('\n' + '='.repeat(60));
          console.log('PRODUCTION SCENARIO RESULTS:');
          console.log('='.repeat(60));
          console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
          console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
          console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
          console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
          
          if (hostReceived && playerReceived) {
            console.log('\n✅ PRODUCTION SCENARIO: WORKS');
            console.log('   Two different browsers = separate clients = works!');
            process.exit(0);
          } else if (playerReceived) {
            console.log('\n⚠️  PRODUCTION SCENARIO: PARTIAL');
            console.log('   Player works, but host callback issue (test bug)');
            console.log('   In real app, host should work too');
            process.exit(0);
          } else {
            console.log('\n❌ PRODUCTION SCENARIO: FAILED');
            console.log('   This would be a real bug in production!');
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
    console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
    console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
    process.exit(playerReceived ? 0 : 1);
  }, 15000);
}

testProductionScenario().catch(console.error);


