/**
 * Test: Can same client subscribe to same channel twice?
 * Or do we need separate clients?
 * Run: pnpm tsx test-same-client-same-channel.ts
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

async function testSameClientSameChannel() {
  console.log('🔥 Testing: Same client, same channel, multiple subscriptions...\n');
  
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  const gameId = 'test-game-' + Date.now();
  const channelName = `game:${gameId}`;
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  // Approach 1: Same channel, subscribe twice
  console.log('='.repeat(60));
  console.log('APPROACH 1: Same channel object, subscribe twice');
  console.log('='.repeat(60));
  
  const channel = client.channel(channelName);
  
  // First subscription (host)
  channel.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [HOST handler] Received:', payload);
    hostReceived = true;
  });
  
  channel.subscribe((status) => {
    console.log(`   [HOST] Status: ${status}`);
    if (status === 'SUBSCRIBED') {
      hostSubscribed = true;
      console.log('   [HOST] ✅ Subscribed');
    }
  });
  
  // Second subscription (player) - SAME channel object
  setTimeout(() => {
    console.log('\n   Adding player handler to SAME channel...');
    channel.on('broadcast', { event: 'answer_reveal' }, (payload) => {
      console.log('🔥 [PLAYER handler] Received:', payload);
      playerReceived = true;
    });
    
    // Try subscribing again (might fail or might work)
    console.log('   Trying to subscribe again to same channel...');
    channel.subscribe((status) => {
      console.log(`   [PLAYER] Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        playerSubscribed = true;
        console.log('   [PLAYER] ✅ Subscribed');
        testBroadcast();
      }
    });
    
    if (hostSubscribed) {
      setTimeout(() => testBroadcast, 2000);
    }
  }, 1000);
  
  function testBroadcast() {
    if (!hostSubscribed) {
      return;
    }
    
    setTimeout(() => {
      console.log('\n' + '='.repeat(60));
      console.log('BROADCASTING...');
      console.log('='.repeat(60));
      
      channel.send({
        type: 'broadcast',
        event: 'answer_reveal',
        payload: { questionId: 'test-123', correctAnswer: 'A' },
      }).then(() => {
        setTimeout(() => {
          console.log('\n📊 APPROACH 1 RESULTS:');
          console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
          console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
          console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
          console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
          
          if (hostReceived && playerReceived) {
            console.log('\n✅ APPROACH 1 WORKS: Same channel, multiple handlers');
            console.log('   💡 SOLUTION: Use same channel, add multiple handlers');
            testApproach2();
          } else {
            console.log('\n❌ APPROACH 1 FAILED');
            testApproach2();
          }
        }, 3000);
      });
    }, 2000);
  }
  
  function testApproach2() {
    console.log('\n' + '='.repeat(60));
    console.log('APPROACH 2: Same client, DIFFERENT channel objects');
    console.log('='.repeat(60));
    
    const client2 = createBrowserClient(supabaseUrl, supabaseAnonKey);
    const channel2a = client2.channel(channelName); // Same name!
    const channel2b = client2.channel(channelName); // Same name again!
    
    console.log(`channel2a === channel2b: ${channel2a === channel2b}`);
    
    let host2Received = false;
    let player2Received = false;
    let host2Subscribed = false;
    let player2Subscribed = false;
    
    // Host channel
    channel2a.on('broadcast', { event: 'answer_reveal' }, (payload) => {
      console.log('🔥 [HOST 2] Received:', payload);
      host2Received = true;
    });
    
    channel2a.subscribe((status) => {
      console.log(`   [HOST 2] Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        host2Subscribed = true;
        console.log('   [HOST 2] ✅ Subscribed');
      }
    });
    
    // Player channel (different object, same name)
    setTimeout(() => {
      channel2b.on('broadcast', { event: 'answer_reveal' }, (payload) => {
        console.log('🔥 [PLAYER 2] Received:', payload);
        player2Received = true;
      });
      
      channel2b.subscribe((status) => {
        console.log(`   [PLAYER 2] Status: ${status}`);
        if (status === 'SUBSCRIBED') {
          player2Subscribed = true;
          console.log('   [PLAYER 2] ✅ Subscribed');
          testBroadcast2();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`   [PLAYER 2] ❌ FAILED: ${status}`);
          console.log('\n❌ APPROACH 2 FAILED: Same client cannot have two channels with same name');
          console.log('   💡 SOLUTION: Need separate clients OR share same channel');
          process.exit(1);
        }
      });
      
      if (host2Subscribed) {
        setTimeout(testBroadcast2, 2000);
      }
    }, 1000);
    
    function testBroadcast2() {
      if (!host2Subscribed || !player2Subscribed) {
        return;
      }
      
      setTimeout(() => {
        console.log('\n📢 Broadcasting from channel2a...');
        channel2a.send({
          type: 'broadcast',
          event: 'answer_reveal',
          payload: { questionId: 'test-456', correctAnswer: 'B' },
        }).then(() => {
          setTimeout(() => {
            console.log('\n📊 APPROACH 2 RESULTS:');
            console.log(`   Host subscribed: ${host2Subscribed ? '✅' : '❌'}`);
            console.log(`   Player subscribed: ${player2Subscribed ? '✅' : '❌'}`);
            console.log(`   Host received: ${host2Received ? '✅ YES' : '❌ NO'}`);
            console.log(`   Player received: ${player2Received ? '✅ YES' : '❌ NO'}`);
            
            if (player2Received) {
              console.log('\n✅ APPROACH 2 WORKS');
              process.exit(0);
            } else {
              console.log('\n❌ APPROACH 2 FAILED');
              process.exit(1);
            }
          }, 3000);
        });
      }, 2000);
    }
  }
  
  // Timeout
  setTimeout(() => {
    console.log('\n⏱️ TIMEOUT');
    process.exit(1);
  }, 30000);
}

testSameClientSameChannel().catch(console.error);


