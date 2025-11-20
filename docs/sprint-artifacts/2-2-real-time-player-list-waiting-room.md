# Story 2.2: Real-Time Player List in Waiting Room

Status: drafted

## Story

As a host user,
I want to see player names appear in real-time as they join the game,
So that I know who's participating before I start the game.

## Acceptance Criteria

**Given** I am on the host waiting room
**When** I subscribe to the game channel on mount
**Then** I listen for:
- `player_joined` broadcast event
- PostgreSQL INSERT on `game_players` (fallback/confirmation)

**And** player list section displays:
- Player count: "5 players joined" (updates in real-time)
- Numbered list of player names (1. Alice, 2. Bob, 3. Charlie...)
- List scrollable if >10 players

**When** a new player joins:
**Then** name animates into list with slide-in effect (Framer Motion)
**And** player count increments
**And** brief highlight on new player name (fades after 1 second)

**And** technical safety limit enforced (200 players max):
- Server Action rejects join if `COUNT(game_players) >= 200` (prevents overwhelming Realtime connections)
- Shows error toast: "Game is full (200 players max). Please create a new game."
- Note: Tier-based enforcement (20 for free tier, unlimited for Pro/Church) will be added in Story 5.3 with host authentication

**And** "Start Game" button enabled when `player_count >= 1`, disabled if 0 players
**And** optimistic UI: Player list updates immediately on broadcast (no wait for DB confirmation)
**And** duplicate player names allowed (no uniqueness check) but numbered (Alice, Alice (2), Alice (3))

## Tasks / Subtasks

- [ ] Convert host waiting room to Client Component (AC: Real-time updates)
  - [ ] Convert `app/game/[gameId]/host/page.tsx` to Client Component (or extract Client Component wrapper)
  - [ ] Ensure Server Component data fetching pattern is maintained
  - [ ] Create client-side component for real-time player list updates

- [ ] Implement real-time subscription on mount (AC: Channel subscription)
  - [ ] Use `createGameChannel(gameId)` from `lib/supabase/realtime.ts`
  - [ ] Subscribe to `player_joined` broadcast events
  - [ ] Subscribe to PostgreSQL INSERT on `game_players` table (filter by `game_id`)
  - [ ] Clean up subscription on component unmount

- [ ] Create player list component with real-time updates (AC: Display player list)
  - [ ] Create `components/game/player-list.tsx` component
  - [ ] Display player count: "X players joined" (updates in real-time)
  - [ ] Display numbered list of player names (1. Alice, 2. Bob, etc.)
  - [ ] Make list scrollable if >10 players
  - [ ] Handle empty state (0 players)

- [ ] Add Framer Motion animations (AC: Slide-in animations)
  - [ ] Install Framer Motion: `pnpm add framer-motion`
  - [ ] Add slide-in animation for new players joining
  - [ ] Add highlight effect that fades after 1 second on new player name
  - [ ] Smooth list updates without jarring transitions

- [ ] Implement player count state management (AC: Player count updates)
  - [ ] Track player count in component state
  - [ ] Increment count on `player_joined` event
  - [ ] Sync with database on mount (fetch initial count)
  - [ ] Handle duplicate player names with numbering (Alice, Alice (2), Alice (3))

- [ ] Update "Start Game" button logic (AC: Button enable/disable)
  - [ ] Enable button when `player_count >= 1`
  - [ ] Disable button when `player_count === 0`
  - [ ] Update button state reactively based on player count

- [ ] Implement optimistic UI updates (AC: Immediate updates)
  - [ ] Update player list immediately on `player_joined` broadcast
  - [ ] Don't wait for database confirmation
  - [ ] Handle potential conflicts if DB insert fails (revert optimistic update)

- [ ] Add technical safety limit enforcement (AC: Maximum players)
  - [ ] Update `joinGame` Server Action in `lib/actions/players.ts`
  - [ ] Check `COUNT(game_players WHERE game_id = gameId) >= 200` (technical safety limit)
  - [ ] Return error if limit reached
  - [ ] Show error toast: "Game is full (200 players max). Please create a new game."
  - [ ] Prevent join from completing
  - [ ] Note: Tier-based limits (20 for free tier) will be added in Story 5.3 with host authentication

- [ ] Update player join flow to broadcast event (AC: Broadcast on join)
  - [ ] Modify `joinGame` Server Action to broadcast `player_joined` event
  - [ ] Use `broadcastGameEvent` from `lib/supabase/realtime.ts`
  - [ ] Include payload: { playerId, playerName }
  - [ ] Ensure broadcast happens after successful DB insert

- [ ] Test real-time synchronization (AC: Latency validation)
  - [ ] Test player list updates within <500ms of join (NFR1)
  - [ ] Test with multiple players joining simultaneously
  - [ ] Test with network interruptions (reconnection logic)
  - [ ] Verify animations work smoothly

## Dev Notes

### Relevant Architecture Patterns
- Real-Time Game State Synchronization pattern [Source: docs/architecture.md#Novel-Pattern-Designs]
- Supabase Realtime channels per game isolation [Source: docs/architecture.md#Novel-Pattern-Designs]
- Optimistic UI updates for immediate feedback [Source: docs/architecture.md#Real-Time-Game-State-Synchronization]
- Client Component pattern for real-time subscriptions [Source: docs/architecture.md#Component-Architecture]

### Source Tree Components to Touch
- `app/game/[gameId]/host/page.tsx` - Convert to Client Component or extract client wrapper (modified)
- `components/game/host-waiting-room.tsx` - Add real-time player list (modified)
- `components/game/player-list.tsx` - Real-time player list component (to be created)
- `lib/actions/players.ts` - Update `joinGame` to broadcast event and enforce limit (modified)
- `lib/supabase/realtime.ts` - Use existing realtime helpers (already created in Story 2.1)

### Testing Standards Summary
- Manual testing: Open waiting room, join game from another device, verify real-time updates
- Test technical safety limit: Join 200 players, verify 201st player is rejected with error message
- Note: Tier-based limits (20 for free tier) will be tested in Story 5.3 with authentication
- Test animations: Verify slide-in and highlight animations work smoothly
- Test optimistic UI: Verify list updates immediately before DB confirmation
- Test duplicate names: Join players with same name, verify numbering (Alice, Alice (2))
- Test latency: Measure time from join to list update (<500ms target)
- Test reconnection: Disconnect network, verify player list updates resume on reconnect
- No automated tests required for this story

### Project Structure Notes
- Framer Motion: Use for smooth animations per UX Design "Animation Library"
- Real-time latency target: <500ms (NFR1)
- Player limit: Technical safety limit of 200 players (prevents overwhelming Realtime connections)
- Tier-based limits: 20 for free tier, unlimited for Pro/Church - will be enforced in Story 5.3 with host authentication
- Duplicate names: Allow duplicates but number them for clarity
- Optimistic updates: Update UI immediately on broadcast, confirm with DB subscription

### References
- [Source: docs/epics.md#Story-2.2] - Story acceptance criteria and technical notes
- [Source: docs/architecture.md#Novel-Pattern-Designs] - Real-Time Multi-Device Game State Synchronization pattern
- [Source: docs/architecture.md#Real-Time-Game-State-Synchronization] - Realtime architecture decisions
- [Source: docs/sprint-artifacts/2-1-supabase-realtime-setup-game-channels.md] - Realtime setup (prerequisite)
- [Source: docs/ux-design-specification.md] - Waiting room design patterns and animations

