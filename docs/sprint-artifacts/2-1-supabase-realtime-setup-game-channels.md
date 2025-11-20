# Story 2.1: Supabase Realtime Setup & Game Channels

Status: done

## Story

As a developer,
I want Supabase Realtime configured with game-specific channels for state synchronization,
So that all devices in a game session receive updates instantly via WebSockets.

## Acceptance Criteria

**Given** Supabase project is set up
**When** I enable Realtime in Supabase Dashboard project settings
**Then** Realtime is enabled for PostgreSQL changes and broadcast events

**And** real-time helper utility is created in `lib/supabase/realtime.ts`:
- `createGameChannel(gameId: string)` - Creates and returns Realtime channel for game
- `subscribeToGameChannel(channel, callbacks)` - Subscribe with event handlers
- `broadcastGameEvent(channel, event, payload)` - Broadcast event to all subscribers

**And** game channel naming convention: `game:${gameId}` for per-game isolation
**And** channel events are defined as TypeScript types in `lib/types/realtime.ts`:
- `player_joined` - Payload: { playerId, playerName }
- `game_start` - Payload: { startedAt }
- `question_advance` - Payload: { questionIndex, questionData }
- `game_end` - Payload: { completedAt }

**And** PostgreSQL Change tracking is configured via Supabase Realtime:
- Listen to INSERT on `game_players` table (filter by `game_id`)
- Listen to UPDATE on `games` table (filter by `id`, track `status` and `current_question_index` changes)

**And** reconnection logic: Exponential backoff with 3 retry attempts (1s, 2s, 4s delays)
**And** error handling: Display "Connection lost. Reconnecting..." toast if WebSocket drops
**And** connection status indicator component created: `components/game/ConnectionStatus.tsx` (green dot = connected, yellow = reconnecting, red = failed)

## Tasks / Subtasks

- [ ] Enable Realtime in Supabase Dashboard (AC: Realtime enabled)
  - [ ] Navigate to Supabase Dashboard → Project Settings → Realtime
  - [ ] Enable Realtime for PostgreSQL changes
  - [ ] Enable Realtime for broadcast events
  - [ ] Verify Realtime is active

- [ ] Create realtime helper utility (AC: Helper functions)
  - [ ] Create `lib/supabase/realtime.ts` file
  - [ ] Implement `createGameChannel(gameId: string)` function
  - [ ] Implement `subscribeToGameChannel(channel, callbacks)` function
  - [ ] Implement `broadcastGameEvent(channel, event, payload)` function
  - [ ] Use channel naming convention: `game:${gameId}`

- [ ] Define TypeScript types for realtime events (AC: Type definitions)
  - [ ] Create `lib/types/realtime.ts` file
  - [ ] Define `RealtimeEvent` type with event names
  - [ ] Define `PlayerJoinedPayload` type
  - [ ] Define `GameStartPayload` type
  - [ ] Define `QuestionAdvancePayload` type
  - [ ] Define `GameEndPayload` type
  - [ ] Export all types

- [ ] Configure PostgreSQL Change tracking (AC: Database subscriptions)
  - [ ] Configure INSERT listener on `game_players` table (filter by `game_id`)
  - [ ] Configure UPDATE listener on `games` table (filter by `id`)
  - [ ] Track `status` and `current_question_index` changes in games table
  - [ ] Test database change events are received

- [ ] Implement reconnection logic (AC: Exponential backoff)
  - [ ] Implement exponential backoff function (1s, 2s, 4s delays)
  - [ ] Add retry counter (max 3 attempts)
  - [ ] Handle WebSocket disconnection events
  - [ ] Reconnect automatically on failure
  - [ ] Display "Connection lost. Reconnecting..." toast on disconnect

- [ ] Create ConnectionStatus component (AC: Status indicator)
  - [ ] Create `components/game/ConnectionStatus.tsx` component
  - [ ] Implement green dot for connected state
  - [ ] Implement yellow dot for reconnecting state
  - [ ] Implement red dot for failed state
  - [ ] Add tooltip with connection status text
  - [ ] Make component accessible (ARIA labels)

## Dev Notes

### Relevant Architecture Patterns
- Real-Time Game State Synchronization pattern [Source: docs/architecture.md#Novel-Pattern-Designs]
- Supabase Realtime channels per game isolation [Source: docs/architecture.md#Novel-Pattern-Designs]
- Exponential backoff reconnection logic [Source: docs/architecture.md#Novel-Pattern-Designs]
- Connection recovery with retry attempts [Source: docs/architecture.md#Novel-Pattern-Designs]

### Source Tree Components to Touch
- `lib/supabase/realtime.ts` - Realtime helper utility (to be created)
- `lib/types/realtime.ts` - TypeScript types for realtime events (to be created)
- `components/game/ConnectionStatus.tsx` - Connection status indicator (to be created)

### Testing Standards Summary
- Manual testing: Enable Realtime in Supabase Dashboard, verify it's active
- Test channel creation: Create game channel, verify channel name format `game:${gameId}`
- Test event broadcasting: Broadcast test event, verify subscribers receive it
- Test database change tracking: Insert into `game_players`, verify event received
- Test reconnection: Disconnect network, verify exponential backoff reconnection
- Test ConnectionStatus component: Verify visual states (green/yellow/red)
- No automated tests required for this story

### Project Structure Notes
- Channel naming: `game:${gameId}` for per-game isolation
- Realtime events: Use broadcast events for custom game events
- Database changes: Use PostgreSQL change tracking for database-driven events
- Reconnection: Exponential backoff with 3 retry attempts (1s, 2s, 4s)

### References
- [Source: docs/epics.md#Story-2.1] - Story acceptance criteria and technical notes
- [Source: docs/architecture.md#Novel-Pattern-Designs] - Real-Time Multi-Device Game State Synchronization pattern
- [Source: docs/architecture.md#Real-Time-Game-State-Synchronization] - Realtime architecture decisions

