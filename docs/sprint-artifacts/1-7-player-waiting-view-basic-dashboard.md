# Story 1.7: Player Waiting View & Basic Dashboard

Status: done

## Story

As a player,
I want to see a waiting screen confirming I joined the game,
So that I know my connection is working while waiting for the host to start.

## Acceptance Criteria

**Given** I have joined a game
**When** I navigate to `/game/[gameId]/play` (dynamic route)
**Then** Server Component fetches game by gameId and current player from `game_players` (identify by player name for now)

**And** waiting state UI is displayed when `game.status='waiting'`:
- "Waiting for host to start..." message (24px font)
- Player's name displayed: "Hi, [PlayerName]!" (18px)
- Current player count: "3 players joined" (fetched from `game_players` count)
- Loading animation (pulsing dots or spinner)

**And** mobile-optimized layout (375px):
- Centered content
- Minimal UI (no distractions)
- Easy-to-read text

**And** if game status changes to 'active', shows placeholder message: "Game starting soon..." (real gameplay in Epic 2)
**And** if game not found or player not in game, redirects to `/join` with error toast
**And** visual styling: Coral orange accent color, warm gray background (per UX Design)

**And** basic host dashboard at `/dashboard` (simple placeholder):
- "Your Games" heading
- List of past games (fetch from `games` WHERE `host_id` = current_user, placeholder host ID for now)
- "Create New Game" button linking to `/create`
- Empty state if no games: "No games yet. Create your first game!"

## Tasks / Subtasks

- [x] Create player waiting view route (AC: Dynamic route)
  - [x] Create `app/game/[gameId]/play/page.tsx`
  - [x] Fetch game by gameId using Server Component
  - [x] Fetch players to verify current player is in game
  - [x] Identify player by name (MVP approach, Epic 5 adds auth)
  - [x] Redirect to `/join` if game not found or player not in game
  
- [x] Create PlayerWaitingView component (AC: Waiting state UI)
  - [x] Create `components/game/player-waiting-view.tsx`
  - [x] Display "Waiting for host to start..." message (24px font)
  - [x] Display "Hi, [PlayerName]!" (18px font)
  - [x] Display current player count
  - [x] Add loading animation (pulsing dots with coral orange accent)
  - [x] Handle 'active' status with placeholder message
  - [x] Mobile-optimized layout (centered, minimal UI)
  - [x] Coral orange accent color, warm gray background
  
- [x] Verify Server Actions exist (AC: Data fetching)
  - [x] Verify `getGame` function in `lib/actions/games.ts`
  - [x] Verify `getPlayers` function in `lib/actions/players.ts`
  - [x] Verify `getPlayerCount` function in `lib/actions/players.ts`
  
- [x] Verify dashboard implementation (AC: Basic host dashboard)
  - [x] Verify `app/dashboard/page.tsx` exists
  - [x] Verify "Your Games" heading
  - [x] Verify list of past games (using `getPastGames` Server Action)
  - [x] Verify "Create New Game" button linking to `/create`
  - [x] Verify empty state message

## Dev Notes

### Relevant Architecture Patterns
- Server Components for data fetching [Source: docs/architecture.md#React-Server-Components]
- Dynamic routes with params [Source: docs/architecture.md#Project-Structure]
- Mobile-first design with centered content [Source: docs/ux-design-specification.md]
- Player identification by name (MVP approach) [Source: docs/epics.md#Story-1.7]

### Source Tree Components to Touch
- `app/game/[gameId]/play/page.tsx` - Player waiting view route (already exists, verified)
- `components/game/player-waiting-view.tsx` - Player waiting view component (updated)
- `app/dashboard/page.tsx` - Host dashboard (already exists, verified)
- `lib/actions/games.ts` - Server Actions for game data (already exists, verified)
- `lib/actions/players.ts` - Server Actions for player data (already exists, verified)

### Testing Standards Summary
- Manual testing: Join a game, verify waiting view displays correctly
- Test player name display: Verify "Hi, [PlayerName]!" shows correct name
- Test player count: Verify count updates as players join (static for now, real-time in Epic 2)
- Test mobile layout: 375px viewport, centered content, readable text
- Test game status handling: Verify 'waiting' shows waiting message, 'active' shows placeholder
- Test error handling: Invalid gameId, player not in game, redirects to `/join`
- Test dashboard: Verify past games list, empty state, "Create New Game" button
- No automated tests required for this story

### Project Structure Notes
- Player view URL: `/game/[gameId]/play?playerName=[name]` (playerName passed as query param)
- Player identification: By name matching (Epic 5 adds proper auth)
- Dashboard: Fetches all games (host_id is NULL for MVP, Epic 5 filters by user)
- Color scheme: Coral orange (secondary) for accent, warm gray (muted) for background

### References
- [Source: docs/epics.md#Story-1.7] - Story acceptance criteria and technical notes
- [Source: docs/ux-design-specification.md] - Waiting Room (Player View) specifications
- [Source: docs/architecture.md#React-Server-Components] - Server Component patterns
- [Source: docs/prd.md#FR6] - Functional requirement for waiting room



