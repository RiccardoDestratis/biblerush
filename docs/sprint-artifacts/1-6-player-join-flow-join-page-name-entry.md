# Story 1.6: Player Join Flow - Join Page & Name Entry

Status: done

## Story

As a player,
I want to join a game by scanning QR code or entering room code and my name,
So that I can participate in the quiz from my mobile phone without downloading an app.

## Acceptance Criteria

**Given** I am a player wanting to join a game
**When** I navigate to `/join` (public route, no auth required)
**Then** I see:
- If URL contains `?code=[room_code]` query param (from QR scan), room code input is auto-populated
- Room code input field: 6-character text input (auto-uppercase, auto-format), Label: "Room Code", Placeholder: "ABC123"
- Player name input field: Text input (2-30 characters, trimmed), Label: "Your Name", Placeholder: "Enter your name", Required validation
- "Join Game" button (large, 60px height for touch targets, per UX Design)

**When** I enter a room code and my name and click "Join Game"
**Then** a Server Action is triggered that:
- Validates room code exists in `games` table with `status='waiting'`
- If invalid: Shows error toast "Room code was invalid, please provide the room ID" (per PRD FR5)
- If game status='active' or 'completed': Shows error toast "This game has already started."
- If valid: Inserts player into `game_players` table: `game_id`, `player_name`, `total_score=0`, `joined_at`
- Redirects to `/game/[gameId]/play` (player view)

**And** mobile-optimized layout (375px width):
- Large input fields (48px height)
- Large button (60px height)
- Generous spacing for easy tapping (per UX Design "Touch-First Mobile Design")

**And** QR code scanning: When user scans QR code with phone camera, opens join URL in browser directly
**And** loading state: Button shows spinner during validation/insertion
**And** error handling: Network errors show "Connection failed. Try again."

## Tasks / Subtasks

- [x] Create `/join` route (AC: Public route)
  - [x] Create `app/join/page.tsx`
  - [x] Handle `?code=[room_code]` query parameter
  - [x] Auto-populate room code input from query param
  
- [x] Create join form component (AC: Form inputs)
  - [x] Create `components/game/join-form.tsx` component
  - [x] Room code input: 6-character, auto-uppercase, auto-format
  - [x] Player name input: 2-30 characters, trimmed, required
  - [x] "Join Game" button: 60px height, large touch target
  - [x] Mobile-optimized layout: 48px input height, generous spacing
  
- [x] Implement Server Action for joining game (AC: Validation and insertion)
  - [x] Create `joinGame` function in `lib/actions/players.ts`
  - [x] Validate room code exists in `games` table
  - [x] Check game status is 'waiting'
  - [x] Insert player into `game_players` table
  - [x] Return gameId for redirect
  
- [x] Add form validation (AC: Input validation)
  - [x] Room code: 6 characters, alphanumeric, uppercase
  - [x] Player name: 2-30 characters, trim whitespace, alphanumeric + spaces
  - [x] Real-time validation on blur
  - [x] Inline error messages
  
- [x] Add loading and error states (AC: UX feedback)
  - [x] Loading spinner on button during submission
  - [x] Error toast for invalid room code
  - [x] Error toast for game already started
  - [x] Error toast for network errors
  - [x] Success redirect to player view
  
- [x] Test mobile optimization (AC: Mobile layout)
  - [x] Verify 48px input height
  - [x] Verify 60px button height
  - [x] Verify generous spacing
  - [x] Test on 375px viewport
  - [x] Test touch targets are easily tappable

## Dev Notes

### Relevant Architecture Patterns
- Server Actions for player join functionality [Source: docs/architecture.md#Server-Actions]
- Public route (no auth required) [Source: docs/architecture.md#Project-Structure]
- Mobile-first design with large touch targets [Source: docs/ux-design-specification.md]
- Query parameter handling for QR code deep linking [Source: docs/epics.md#Story-1.6]

### Source Tree Components to Touch
- `app/join/page.tsx` - Join page route (to be created)
- `components/game/join-form.tsx` - Join form component (to be created)
- `lib/actions/players.ts` - Server Action for joining game (to be created/modified)

### Testing Standards Summary
- Manual testing: Navigate to `/join`, test room code entry, test name entry, test join flow
- Test QR code deep linking: Scan QR code, verify room code auto-populated
- Test validation: Invalid room code, game already started, invalid name
- Test mobile layout: 375px viewport, touch targets, spacing
- Test error handling: Network errors, invalid inputs
- No automated tests required for this story

### Project Structure Notes
- Join URL format: `https://[APP_URL]/join?code=[room_code]` (matches Story 1.5 QR code)
- Player name validation: 2-30 characters, alphanumeric + spaces, trimmed
- Room code validation: 6 characters, alphanumeric, uppercase
- Mobile-first: 60px+ touch targets, large fonts (18px+), minimal UI

### References
- [Source: docs/epics.md#Story-1.6] - Story acceptance criteria and technical notes
- [Source: docs/ux-design-specification.md] - Mobile-first design patterns and touch targets
- [Source: docs/architecture.md#Server-Actions] - Server Action patterns for player join
- [Source: docs/prd.md#FR5] - Functional requirement for player joining

