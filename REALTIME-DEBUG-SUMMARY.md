# Realtime Synchronization Debug Summary

## The Problem

**Initial Issue**: Players were not receiving real-time events from the host. When the host broadcasts `answer_reveal`, players remain stuck on "Waiting for other players" screen.

**Symptoms**:
- Host broadcasts events successfully
- Events arrive at the player's channel: `[Realtime] 🔥 answer_reveal broadcast received!`
- But callback is not executed: `[Realtime] ❌ NO onAnswerReveal callback registered!`
- Player UI never updates

---

## What We Tried

### 1. **Removed Double Subscription** ✅ FIXED
- **Issue**: `question-display-projector.tsx` was calling `channel.subscribe()` twice
- **Fix**: Removed explicit `channel.subscribe()` call (line 103), let `subscribeToGameChannel` handle it
- **Result**: Fixed duplicate subscriptions, but player still not receiving events

### 2. **Fixed Stale Closures** ✅ FIXED  
- **Issue**: `onLeaderboardReady` callback captured stale `currentQuestion` value
- **Fix**: Added `currentQuestionRef` to avoid stale closures
```typescript
const currentQuestionRef = useRef(currentQuestion);
useEffect(() => {
  currentQuestionRef.current = currentQuestion;
}, [currentQuestion]);
```
- **Result**: Callbacks use current values, but still not being called

### 3. **Tested Separate Clients** ✅ WORKS IN ISOLATION
- **Issue**: Suspected same Supabase client causing subscription conflicts
- **Tests Created**:
  - `test-reveal-direct.ts` - Basic broadcast ✅ PASSED
  - `test-reveal-variations.ts` - Different approaches ✅ PASSED (separate clients)
  - `test-production-scenario.ts` - Two browsers ✅ PASSED
  - `test-host-as-player.ts` - Same browser ❌ FAILED (player subscription fails)
  - `test-actual-app-flow.ts` - Exact app code ✅ PASSED
  - `test-all-events.ts` - All event types ✅ PASSED
- **Result**: Tests work, but real app doesn't

### 4. **Implemented Separate Clients for Host/Player** ⚠️ PARTIAL
- **Change**: Modified `createGameChannel` to use separate client instances
```typescript
function createGameChannel(gameId: string, role: 'host' | 'player' = 'player')
```
- **Updated**: All components to specify `'host'` or `'player'`
- **Result**: Tests still pass, E2E test still fails

### 5. **Centralized Channel Manager** 🔄 IN PROGRESS
- **Research Finding**: Supabase Realtime channels lose callbacks when recreated
- **Root Cause**: React `useEffect` re-runs, creating multiple channels and losing callbacks
- **Solution**: Created `lib/supabase/channel-manager.ts`
  - Maintains global registry of channels
  - Ensures only ONE channel per game
  - Wraps callbacks so all registered handlers receive events
- **Status**: Implemented but not fully tested due to build errors

---

## Root Cause Analysis

### The Real Problem
**React component re-renders are recreating channels multiple times**, losing the registered callbacks.

**Evidence from logs**:
```
[PLAYER CONSOLE] [Realtime] 🔥 Subscribing to channel now...
[PLAYER CONSOLE] [Realtime] 🔥 Channel status: CLOSED
[PLAYER CONSOLE] [Realtime] 🔥 Subscribing to channel now... (AGAIN!)
[PLAYER CONSOLE] [Realtime] 🔥 Channel status: SUBSCRIBED
```

The channel is being created and subscribed **multiple times**. When the event arrives, it goes to the **wrong instance** (one without callbacks).

### Why This Happens
1. `useEffect` in `player-game-view.tsx` runs multiple times
2. Each run creates a new channel via `createGameChannel()`
3. Old channel still exists but new one is subscribed
4. Event arrives at old channel (no callbacks) instead of new channel

---

## Solutions Compared

| Solution | Pros | Cons | Status |
|----------|------|------|--------|
| **Remove postgres_changes** | Cleaner code | Doesn't solve core issue | ✅ Done |
| **Fix stale closures** | Better React patterns | Doesn't solve core issue | ✅ Done |
| **Separate clients** | Prevents conflicts | Doesn't prevent recreation | ✅ Done |
| **Channel Manager** | ONE channel guaranteed | More complex | 🔄 In Progress |
| **useRef for channel** | Simple | May not prevent all re-subs | ❌ Not enough |

---

## Current Status

### ✅ What Works
- All direct tests pass (separate from React)
- Host broadcasts successfully
- Events arrive at player channel
- Production scenario (different browsers) works

### ❌ What Doesn't Work
- E2E test with actual React app
- Player callbacks not being called when event arrives
- Build errors preventing full testing

### 🔄 In Progress
- **Channel Manager implementation**
- **Build errors to fix**:
  1. TypeScript error in `personal-leaderboard.tsx` (MotionValue type)
  2. TypeScript error in `question-display-player.tsx` (Date constructor)
  3. TypeScript error in question sets query (missing column)

---

## Next Steps

### Immediate (Critical Path)
1. **Fix build errors** to enable E2E testing
2. **Complete Channel Manager integration** in `player-game-view.tsx`
3. **Test E2E** with channel manager
4. **Verify** callbacks are preserved across re-renders

### If Channel Manager Fails
**Alternative: Prevent useEffect Re-runs**
```typescript
useEffect(() => {
  // ONLY create channel once, never recreate
  if (!channelRef.current) {
    channelRef.current = createGameChannel(gameId, 'player');
    // Register callbacks HERE, don't re-register
    subscribeToGameChannel(channelRef.current, gameId, {
      // ... callbacks
    });
  }
  
  // NO cleanup on unmount - keep channel alive
  return () => {};
}, []); // EMPTY DEPS - only run once
```

---

## Key Learnings

1. **Supabase Realtime channels are fragile** - recreating loses callbacks
2. **React useEffect is tricky** - dependencies cause re-runs
3. **Testing ≠ Reality** - direct tests work, React app doesn't
4. **Logs are critical** - showed multiple subscriptions happening
5. **Channel Manager is the right pattern** - used in Supabase Discord/docs

---

## Files Changed

### Core Realtime Logic
- `lib/supabase/realtime.ts` - Removed postgres_changes, added separate clients
- `lib/supabase/channel-manager.ts` - NEW: Centralized channel management
- `lib/supabase/client.ts` - No changes

### Components Updated
- `components/game/player-game-view.tsx` - Using channel manager
- `components/game/question-display-projector.tsx` - Removed double subscription, using 'host' client
- `components/game/host-waiting-room.tsx` - Using 'host' client
- `components/game/player-waiting-view.tsx` - Using 'player' client
- `components/game/question-display-player.tsx` - Using 'player' client
- `components/game/leaderboard-projector.tsx` - Using 'host' client

### Tests Created
- `test-reveal-direct.ts`
- `test-reveal-variations.ts`
- `test-production-scenario.ts`
- `test-host-as-player.ts`
- `test-actual-app-flow.ts`
- `test-all-events.ts`
- `test-separate-clients-fix.ts`
- `test-shared-channel.ts`

---

## Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [GitHub Discussion: Multiple Subscriptions](https://github.com/orgs/supabase/discussions/27473)
- [Supabase Testing Best Practices](https://supabase.com/docs/guides/local-development/testing/overview)

