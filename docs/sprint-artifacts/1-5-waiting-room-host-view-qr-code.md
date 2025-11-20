# Story 1.5: Waiting Room - Host View with QR Code

Status: done

## Story

As a host user,
I want to see a waiting room with QR code, room ID, and placeholder for joining players,
So that I can share the game code and prepare to start the game.

## Acceptance Criteria

**Given** I have created a game
**When** I navigate to `/game/[gameId]/host` (dynamic route, gameId from URL params)
**Then** Server Component fetches game from DB by gameId and verifies `status='waiting'`

**And** I see a full-screen layout optimized for projector (1920x1080):
- Large "Waiting for Players" heading (64px font size, per UX Design)
- QR code generated containing join URL: `https://[APP_URL]/join?code=[room_code]`
- Room code displayed below QR in huge text (80px): "Room Code: ABC123"
- Instructions: "Scan QR code or go to [APP_URL]/join and enter: ABC123" (32px)
- QR code size: 300x300px, centered on screen
- Player list section: "0 Players Joined" placeholder (real-time updates in Epic 2)
- "Start Game" button visible but disabled (will enable in Epic 2 when players join)
- "Cancel Game" button in corner (secondary, destructive style) to delete game and return to creation page

**And** QR code is generated using `qrcode.react` library (install as dependency)
**And** visual styling: Deep purple background gradient, white text, high contrast for projector (per UX Design)
**And** error handling: If gameId invalid or game not found, redirect to `/create` with error toast

**When** I click "Cancel Game" button
**Then** a Server Action is triggered that:
- Deletes the game record from `games` table
- Deletes all related records (game_players via CASCADE if configured)
- Redirects to `/create` page
- Shows success toast: "Game cancelled"

## Tasks / Subtasks

- [x] Create `/game/[gameId]/host` route (AC: Route setup)
  - [x] Create `app/game/[gameId]/host/page.tsx`
  - [x] Create `app/game/layout.tsx` (required by Next.js 15)
  - [x] Fetch game by gameId using Server Component
  - [x] Verify game status is 'waiting'
  - [x] Handle invalid gameId - redirect to `/create` with error
  
- [x] Install QR code library (AC: QR code dependency)
  - [x] Run `pnpm add qrcode.react @types/qrcode.react`
  
- [x] Create waiting room UI components (AC: Full-screen layout)
  - [x] Create `components/game/host-waiting-room.tsx` component
  - [x] Create waiting room layout with deep purple gradient background
  - [x] Add "Waiting for Players" heading (64px+)
  - [x] Generate QR code component with join URL (dynamic network URL in dev)
  - [x] Display room code in huge text (80px)
  - [x] Add instructions text (32px)
  - [x] Add player list placeholder section
  - [x] Add disabled "Start Game" button
  - [x] Add "Cancel Game" button (destructive style, top-right corner)
  
- [x] Implement Server Actions (AC: Game management)
  - [x] Create `getGame` function in `lib/actions/games.ts`
  - [x] Create `cancelGame` function in `lib/actions/games.ts`
  - [x] Delete game record from database
  - [x] Handle CASCADE deletion of related records
  - [x] Return success/error status
  - [x] Redirect to `/create` on success
  
- [x] Add network URL detection (AC: Mobile testing support)
  - [x] Create `/api/network-url` API route
  - [x] Detect network IP automatically in development
  - [x] Use network IP for QR codes in dev, APP_URL in production
  - [x] Update QR code dynamically based on network detection
  
- [x] Add error handling (AC: Error handling)
  - [x] Handle invalid gameId
  - [x] Handle game not found
  - [x] Handle non-waiting game status
  - [x] Show appropriate error toasts
  
- [x] Test projector optimization (AC: Visual styling)
  - [x] Verify large text sizes (64px, 80px, 32px)
  - [x] Verify high contrast (white on deep purple gradient)
  - [x] Verify QR code is clearly visible at 300x300px
  - [x] Test responsive layout

## Dev Notes

### Relevant Architecture Patterns
- Server Components for data fetching (fetch game from database) [Source: docs/architecture.md]
- Server Actions for cancel game functionality [Source: docs/architecture.md#Server-Actions]
- Dynamic routes using Next.js App Router `[gameId]` params [Source: docs/architecture.md]
- Projector optimization: Large text, high contrast, full-screen layout [Source: docs/ux-design-specification.md]

### Source Tree Components to Touch
- `app/game/[gameId]/host/page.tsx` - Waiting room host page (created)
- `app/game/layout.tsx` - Game routes layout (created, required by Next.js 15)
- `lib/actions/games.ts` - Added `getGame` and `cancelGame` Server Actions (modified)
- `components/game/host-waiting-room.tsx` - Waiting room component (created)
- `app/api/network-url/route.ts` - Network URL detection API (created)
- `lib/utils/network-url.ts` - Network URL utilities (created)

### Testing Standards Summary
- Manual testing: Create game, navigate to waiting room, verify QR code, test cancel
- Test error cases: Invalid gameId, game not found, non-waiting status
- Test projector display: 1920x1080 resolution, large text visibility
- Verify QR code scans correctly and opens join URL
- No automated tests required for this story

### Project Structure Notes
- QR code library: `qrcode.react` for React/Next.js integration
- Join URL format: `https://[APP_URL]/join?code=[room_code]` (APP_URL from env)
- CASCADE deletion: Configured in database schema (Story 1.2)
- Projector optimization: Full-screen layout, no mobile responsive needed for this view

### References
- [Source: docs/epics.md#Story-1.5] - Story acceptance criteria and technical notes
- [Source: docs/ux-design-specification.md] - Waiting room design patterns and projector optimization
- [Source: docs/architecture.md#Server-Actions] - Server Action patterns for cancel game

