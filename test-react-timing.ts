/**
 * Test React component timing issues
 * Simulates React useEffect execution order
 * Run: pnpm tsx test-react-timing.ts
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

// Simulate subscribeToGameChannel
function subscribeToGameChannel(
  channel: ReturnType<typeof createClientApp>['channel'],
  callbacks: { onAnswerReveal?: (payload: any) => void }
) {
  // Set up handlers FIRST
  channel.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 Handler received answer_reveal:', payload);
    callbacks.onAnswerReveal?.(payload.payload);
  });
  
  // THEN subscribe
  channel.subscribe((status) => {
    console.log(`   Channel status: ${status}`);
  });
}

async function testReactTiming() {
  console.log('🔥 Testing React component timing...\n');
  
  const gameId = 'test-game-' + Date.now();
  const channelName = `game:${gameId}`;
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  // Host component mounts first (React effect runs)
  console.log('1. Host component mounts...');
  const client1 = createClientApp();
  const channel1 = client1.channel(channelName);
  
  // Wait a bit (simulating other React effects)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('2. Host sets up subscription...');
  subscribeToGameChannel(channel1, {
    onAnswerReveal: (payload) => {
      console.log('🔥 [HOST] onAnswerReveal callback called!', payload);
      hostReceived = true;
    }
  });
  
  // Player component mounts later (different React effect)
  setTimeout(() => {
    console.log('3. Player component mounts...');
    const client2 = createClientApp();
    const channel2 = client2.channel(channelName);
    
    console.log('4. Player sets up subscription...');
    subscribeToGameChannel(channel2, {
      onAnswerReveal: (payload) => {
        console.log('🔥 [PLAYER] onAnswerReveal callback called!', payload);
        playerReceived = true;
      }
    });
    
    // Check subscription status
    setTimeout(() => {
      const channel1State = (channel1 as any).state;
      const channel2State = (channel2 as any).state;
      
      console.log(`\n5. Channel states:`);
      console.log(`   Host channel state: ${channel1State}`);
      console.log(`   Player channel state: ${channel2State}`);
      
      hostSubscribed = channel1State === 'joined' || channel1State === 'SUBSCRIBED';
      playerSubscribed = channel2State === 'joined' || channel2State === 'SUBSCRIBED';
      
      if (hostSubscribed && playerSubscribed) {
        console.log('\n6. Both subscribed! Broadcasting...');
        channel1.send({
          type: 'broadcast',
          event: 'answer_reveal',
          payload: { questionId: 'test-123', correctAnswer: 'A' },
        }).then(() => {
          setTimeout(() => {
            console.log('\n7. Results:');
            console.log(`   Host subscribed: ${hostSubscribed ? '✅' : '❌'}`);
            console.log(`   Player subscribed: ${playerSubscribed ? '✅' : '❌'}`);
            console.log(`   Host received: ${hostReceived ? '✅ YES' : '❌ NO'}`);
            console.log(`   Player received: ${playerReceived ? '✅ YES' : '❌ NO'}`);
            
            if (playerReceived) {
              console.log('\n✅ TEST PASSED');
              process.exit(0);
            } else {
              console.log('\n❌ TEST FAILED - Player did not receive event');
              console.log('   This might be the bug in the app!');
              process.exit(1);
            }
          }, 3000);
        });
      } else {
        console.log('\n❌ Not both subscribed - cannot test broadcast');
        process.exit(1);
      }
    }, 2000);
  }, 500);
  
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

testReactTiming().catch(console.error);

