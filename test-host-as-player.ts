/**
 * Test scenario: Host also joins as player (same browser/tab)
 * This tests if the host can be both host AND player
 * Run: pnpm tsx test-host-as-player.ts
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

// Simulate: Host opens /game/xxx/host AND /game/xxx/play in same browser
function createClientApp() {
  // Same browser = same client instance (createBrowserClient might cache)
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

async function testHostAsPlayer() {
  console.log('🔥 Testing: Host also joins as player (same browser)...\n');
  console.log('Scenario:');
  console.log('  - Same browser opens /game/xxx/host (host view)');
  console.log('  - Same browser opens /game/xxx/play (player view)');
  console.log('  - Both use same client instance\n');
  
  const gameId = 'test-game-' + Date.now();
  const channelName = `game:${gameId}`;
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  // Same browser, same client
  const client = createClientApp();
  const client2 = createClientApp();
  console.log(`client === client2: ${client === client2}`);
  console.log('   (Same browser = same client instance?)\n');
  
  // Host channel
  console.log('='.repeat(60));
  console.log('HOST CHANNEL (from /host route)');
  console.log('='.repeat(60));
  const channelHost = client.channel(channelName);
  
  channelHost.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [HOST] Received answer_reveal:', payload);
    hostReceived = true;
  });
  
  channelHost.subscribe((status) => {
    console.log(`   [HOST] Status: ${status}`);
    if (status === 'SUBSCRIBED') {
      hostSubscribed = true;
      console.log('   [HOST] ✅ Subscribed');
    }
  });
  
  // Player channel (same browser, same client)
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('PLAYER CHANNEL (from /play route, same browser)');
    console.log('='.repeat(60));
    const channelPlayer = client.channel(channelName); // SAME client!
    
    channelPlayer.on('broadcast', { event: 'answer_reveal' }, (payload) => {
      console.log('🔥 [PLAYER] Received answer_reveal:', payload);
      playerReceived = true;
    });
    
    channelPlayer.subscribe((status) => {
      console.log(`   [PLAYER] Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        playerSubscribed = true;
        console.log('   [PLAYER] ✅ Subscribed');
        if (hostSubscribed) {
          testBroadcast();
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`   [PLAYER] ❌ Subscription FAILED: ${status}`);
        console.error('   ⚠️  THIS IS THE BUG: Same client = second subscription fails!');
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
      console.log('BROADCASTING from host channel...');
      console.log('='.repeat(60));
      
      channelHost.send({
        type: 'broadcast',
        event: 'answer_reveal',
        payload: { questionId: 'test-123', correctAnswer: 'A' },
      }).then(() => {
        setTimeout(() => {
          console.log('\n' + '='.repeat(60));
          console.log('HOST-AS-PLAYER SCENARIO RESULTS:');
          console.log('='.repeat(60));
          console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
          console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
          console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
          console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
          
          if (!playerSubscribed) {
            console.log('\n❌ CONFIRMED BUG: Host cannot join as player');
            console.log('   Same client instance = second subscription fails');
            console.log('   💡 SOLUTION: Need separate client instances');
            process.exit(1);
          } else if (playerReceived) {
            console.log('\n✅ WORKS: Host can join as player');
            console.log('   Same client instance works for multiple channels');
            process.exit(0);
          } else {
            console.log('\n⚠️  PARTIAL: Player subscribed but no event received');
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
    
    if (!playerSubscribed) {
      console.log('\n❌ CONFIRMED: Same client = second subscription fails');
      process.exit(1);
    }
    process.exit(playerReceived ? 0 : 1);
  }, 15000);
}

testHostAsPlayer().catch(console.error);


