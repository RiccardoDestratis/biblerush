/**
 * Test: Share the same channel subscription with multiple handlers
 * This is the REAL fix - no need for separate clients!
 * Run: pnpm tsx test-shared-channel.ts
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

async function testSharedChannel() {
  console.log('🔥 Testing: Share same channel, multiple handlers (THE FIX)\n');
  console.log('Key insight: Subscribe ONCE, add multiple handlers\n');
  
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  const gameId = 'test-game-' + Date.now();
  const channelName = `game:${gameId}`;
  
  let hostReceived = false;
  let playerReceived = false;
  let subscribed = false;
  
  const channel = client.channel(channelName);
  
  // Add host handler
  console.log('1. Adding HOST handler...');
  channel.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [HOST handler] Received answer_reveal:', payload);
    hostReceived = true;
  });
  
  // Add player handler (BEFORE subscribing)
  console.log('2. Adding PLAYER handler...');
  channel.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [PLAYER handler] Received answer_reveal:', payload);
    playerReceived = true;
  });
  
  // Subscribe ONCE (both handlers will receive events)
  console.log('3. Subscribing ONCE (both handlers will work)...');
  channel.subscribe((status) => {
    console.log(`   Status: ${status}`);
    if (status === 'SUBSCRIBED') {
      subscribed = true;
      console.log('   ✅ Subscribed - both handlers active');
      
      // Broadcast from separate client (you don't receive your own broadcasts)
      setTimeout(() => {
        console.log('\n4. Broadcasting from separate client...');
        const broadcasterClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
        const broadcasterChannel = broadcasterClient.channel(channelName);
        
        broadcasterChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            broadcasterChannel.send({
              type: 'broadcast',
              event: 'answer_reveal',
              payload: { questionId: 'test-123', correctAnswer: 'A' },
            }).then(() => {
          setTimeout(() => {
            console.log('\n📊 RESULTS:');
            console.log(`   Subscribed: ${subscribed ? '✅' : '❌'}`);
            console.log(`   Host handler received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
            console.log(`   Player handler received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
            
            if (hostReceived && playerReceived) {
              console.log('\n✅ SUCCESS: Same channel, multiple handlers works!');
              console.log('   💡 THIS IS THE FIX:');
              console.log('      - Use same channel instance');
              console.log('      - Add all handlers BEFORE subscribing');
              console.log('      - Subscribe ONCE');
              console.log('      - Both handlers receive events');
              process.exit(0);
            } else {
              console.log('\n❌ FAILED: Not all handlers received event');
              process.exit(1);
            }
          }, 3000);
            }).catch((error) => {
              console.error('❌ Broadcast error:', error);
              process.exit(1);
            });
          }
        });
      }, 2000);
    }
  });
  
  // Timeout
  setTimeout(() => {
    console.log('\n⏱️ TIMEOUT');
    console.log(`   Subscribed: ${subscribed ? '✅' : '❌'}`);
    console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
    process.exit(hostReceived && playerReceived ? 0 : 1);
  }, 15000);
}

testSharedChannel().catch(console.error);

