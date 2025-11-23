# Realtime Channel Architecture

## Overview

The game uses Supabase Realtime channels for event synchronization. There are **two types of channels** with different lifecycles:

## 1. Client-Side Channels (Persistent)

**Location:** `components/game/question-display-projector.tsx`, `components/game/player-game-view.tsx`

**Lifecycle:**
- ✅ Created **once** when component mounts
- ✅ Stays **subscribed for the entire game**
- ✅ Only unsubscribed when component unmounts (game ends)

**Purpose:**
- Listen for events from server and other clients
- Receive broadcasts (scores_updated, answer_reveal, etc.)
- Maintain real-time synchronization

**Example:**
```typescript
// Created once in useEffect
channelRef.current = createGameChannel(gameId);
channelRef.current.subscribe();

// Stays subscribed for entire game
// Only cleaned up on unmount:
useEffect(() => {
  return () => {
    channelRef.current?.unsubscribe(); // Only on unmount
  };
}, []);
```

## 2. Server-Side Channels (Temporary)

**Location:** `lib/actions/answers.ts` - `broadcastScoresUpdated()`

**Lifecycle:**
- ⚠️ Created **temporarily** for each broadcast
- ⚠️ Subscribe → Broadcast → Unsubscribe (immediately)
- ⚠️ Pattern repeats for each broadcast

**Purpose:**
- Server Actions need to broadcast events
- Server Actions are stateless (can't maintain persistent channels)
- Must create temporary channel for each broadcast

**Why This Pattern:**
- Server Actions run in isolated server context
- Can't reuse client-side channels
- Stateless nature requires temporary channels
- This is a **necessary pattern** for server-side broadcasting

**Example:**
```typescript
// In Server Action (stateless):
const channel = serviceClient.channel(`game:${gameId}`);
channel.subscribe(); // Temporary subscription
await channel.send({ type: "broadcast", event: "scores_updated", payload });
channel.unsubscribe(); // Clean up immediately
```

## Event Flow

```
┌─────────────────────────────────────────────────────────┐
│ Client-Side (Projector/Player)                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Channel: game:{gameId}                             │ │
│ │ Status: SUBSCRIBED (entire game)                    │ │
│ │                                                     │ │
│ │ Listens for:                                       │ │
│ │ - scores_updated                                    │ │
│ │ - answer_reveal                                     │ │
│ │ - question_advance                                  │ │
│ │ - etc.                                              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │ Receives broadcasts
                        │
┌─────────────────────────────────────────────────────────┐
│ Server Action (processQuestionScores)                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Create temporary channel                        │ │
│ │ 2. Subscribe (temporary)                           │ │
│ │ 3. Broadcast scores_updated                        │ │
│ │ 4. Unsubscribe (cleanup)                            │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Why Not Keep Server Channel Alive?

**Can't do it because:**
1. Server Actions are stateless - each call is isolated
2. No way to maintain state between Server Action calls
3. Next.js Server Actions don't support persistent connections
4. Would require a separate service/worker (overkill for this use case)

## Is This Efficient?

**Current Pattern:**
- ✅ Works correctly
- ✅ Client channels stay subscribed (efficient)
- ⚠️ Server creates temporary channels (necessary overhead)

**Alternatives Considered:**
1. **Channel Pool** - Complex, requires state management
2. **Keep Server Channel Alive** - Not possible with Server Actions
3. **WebSocket Service** - Overkill, adds complexity

**Conclusion:** Current pattern is the correct approach for Next.js Server Actions + Supabase Realtime.

## Summary

- **Client channels:** Stay subscribed for entire game ✅
- **Server channels:** Temporary, created per broadcast ⚠️ (necessary)
- **This is expected behavior** - not a bug or inefficiency
- The subscribe/unsubscribe you see in logs is from server-side temporary channels
- Client-side channels remain subscribed throughout the game

## Is This Efficient?

**Yes - this is the optimal pattern for Next.js Server Actions.**

After researching alternatives:
- ✅ Matches best practices for stateless server architectures
- ✅ More reliable than client-side broadcasting
- ✅ More flexible than database triggers
- ✅ Minimal overhead (acceptable for game event frequency)

**See `docs/channel-architecture-research.md` for detailed analysis of alternatives.**

## Cost Impact

**Good News: Temporary server channels don't increase costs!**

Key points:
- ✅ **Subscribe/unsubscribe operations are FREE** - Not counted as messages
- ✅ **Only broadcasts count as messages** - Each client receiving = 1 message
- ✅ **Temporary connections don't impact peak** - They last ~500ms

**Pro Plan Limits (Included):**
- 5 million Realtime messages/month ✅
- 500 peak concurrent connections ✅

**Our Usage:**
- ~220 messages per game (20 broadcasts × 11 clients)
- Can handle 22,000+ games/month before hitting limits
- Connection overhead from temporary channels is negligible

**See `docs/supabase-realtime-cost-analysis.md` for detailed cost analysis.**

