/**
 * Test: Should we use separate clients for host and player?
 * This tests if using separate clients fixes the callback registration issue
 * Run: pnpm tsx test-separate-clients-fix.ts
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

// Current approach: createClient() - might return same instance
function createClientCurrent() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// New approach: Force separate clients
let hostClientInstance: ReturnType<typeof createBrowserClient> | null = null;
let playerClientInstance: ReturnType<typeof createBrowserClient> | null = null;

function createClientForHost() {
  if (!hostClientInstance) {
    hostClientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return hostClientInstance;
}

function createClientForPlayer() {
  if (!playerClientInstance) {
    playerClientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return playerClientInstance;
}

function createGameChannel(gameId: string, client: ReturnType<typeof createBrowserClient>) {
  return client.channel(`game:${gameId}`);
}

function subscribeToGameChannel(
  channel: ReturnType<typeof createBrowserClient>['channel'],
  callbacks: { onAnswerReveal?: (payload: any) => void }
) {
  channel.on('broadcast', { event: 'answer_reveal' }, (payload) => {
    console.log('🔥 [Handler] answer_reveal received');
    if (!callbacks.onAnswerReveal) {
      console.error('❌ NO onAnswerReveal callback!');
      return;
    }
    callbacks.onAnswerReveal(payload.payload);
  });
  
  channel.subscribe((status) => {
    console.log(`   Status: ${status}`);
  });
}

async function testSeparateClients() {
  console.log('🔥 Testing: Separate clients for host and player\n');
  
  const gameId = 'test-game-' + Date.now();
  
  let hostReceived = false;
  let playerReceived = false;
  let hostSubscribed = false;
  let playerSubscribed = false;
  
  // Test 1: Current approach (same client function)
  console.log('='.repeat(60));
  console.log('TEST 1: Current approach (createClient() - might be same)');
  console.log('='.repeat(60));
  
  const client1 = createClientCurrent();
  const client2 = createClientCurrent();
  console.log(`client1 === client2: ${client1 === client2}`);
  
  const channel1 = createGameChannel(gameId, client1);
  const channel2 = createGameChannel(gameId, client2);
  
  let callback1Called = false;
  let callback2Called = false;
  
  subscribeToGameChannel(channel1, {
    onAnswerReveal: () => {
      callback1Called = true;
      hostReceived = true;
      console.log('🔥 [HOST] Callback called');
    }
  });
  
  setTimeout(() => {
    subscribeToGameChannel(channel2, {
      onAnswerReveal: () => {
        callback2Called = true;
        playerReceived = true;
        console.log('🔥 [PLAYER] Callback called');
      }
    });
    
    setTimeout(() => {
      const state1 = (channel1 as any).state;
      const state2 = (channel2 as any).state;
      
      hostSubscribed = state1 === 'joined' || state1 === 'SUBSCRIBED';
      playerSubscribed = state2 === 'joined' || state2 === 'SUBSCRIBED';
      
      console.log(`\n   Host subscribed: ${hostSubscribed}`);
      console.log(`   Player subscribed: ${playerSubscribed}`);
      
      if (hostSubscribed && playerSubscribed) {
        console.log('\n   Broadcasting...');
        channel1.send({
          type: 'broadcast',
          event: 'answer_reveal',
          payload: { questionId: 'test-123', correctAnswer: 'A' },
        }).then(() => {
          setTimeout(() => {
            console.log(`\n   TEST 1 Results:`);
            console.log(`     Host callback called: ${callback1Called ? '✅' : '❌'}`);
            console.log(`     Player callback called: ${callback2Called ? '✅' : '❌'}`);
            
            // Test 2: Separate clients
            console.log('\n' + '='.repeat(60));
            console.log('TEST 2: Separate clients (hostClient vs playerClient)');
            console.log('='.repeat(60));
            
            const hostClient = createClientForHost();
            const playerClient = createClientForPlayer();
            console.log(`hostClient === playerClient: ${hostClient === playerClient}`);
            
            const hostChannel = createGameChannel(gameId + '-2', hostClient);
            const playerChannel = createGameChannel(gameId + '-2', playerClient);
            
            let hostCallbackCalled = false;
            let playerCallbackCalled = false;
            
            subscribeToGameChannel(hostChannel, {
              onAnswerReveal: () => {
                hostCallbackCalled = true;
                console.log('🔥 [HOST 2] Callback called');
              }
            });
            
            setTimeout(() => {
              subscribeToGameChannel(playerChannel, {
                onAnswerReveal: () => {
                  playerCallbackCalled = true;
                  console.log('🔥 [PLAYER 2] Callback called');
                }
              });
              
              setTimeout(() => {
                const hostState = (hostChannel as any).state;
                const playerState = (playerChannel as any).state;
                
                console.log(`\n   Host subscribed: ${hostState === 'joined' || hostState === 'SUBSCRIBED'}`);
                console.log(`   Player subscribed: ${playerState === 'joined' || playerState === 'SUBSCRIBED'}`);
                
                if ((hostState === 'joined' || hostState === 'SUBSCRIBED') && 
                    (playerState === 'joined' || playerState === 'SUBSCRIBED')) {
                  console.log('\n   Broadcasting...');
                  hostChannel.send({
                    type: 'broadcast',
                    event: 'answer_reveal',
                    payload: { questionId: 'test-456', correctAnswer: 'B' },
                  }).then(() => {
                    setTimeout(() => {
                      console.log(`\n   TEST 2 Results:`);
                      console.log(`     Host callback called: ${hostCallbackCalled ? '✅' : '❌'}`);
                      console.log(`     Player callback called: ${playerCallbackCalled ? '✅' : '❌'}`);
                      
                      console.log('\n' + '='.repeat(60));
                      console.log('CONCLUSION:');
                      console.log('='.repeat(60));
                      
                      if (callback2Called && playerCallbackCalled) {
                        console.log('✅ Both approaches work - callbacks are registered');
                        console.log('   The issue is likely React re-renders causing channel recreation');
                        process.exit(0);
                      } else if (playerCallbackCalled && !callback2Called) {
                        console.log('✅ Separate clients FIX the issue!');
                        console.log('   💡 SOLUTION: Use separate client instances');
                        process.exit(0);
                      } else {
                        console.log('❌ Both approaches failed');
                        process.exit(1);
                      }
                    }, 3000);
                  });
                }
              }, 3000);
            }, 1000);
          }, 3000);
        });
      }
    }, 2000);
  }, 1000);
  
  setTimeout(() => {
    console.log('\n⏱️ TIMEOUT');
    process.exit(1);
  }, 30000);
}

testSeparateClients().catch(console.error);


