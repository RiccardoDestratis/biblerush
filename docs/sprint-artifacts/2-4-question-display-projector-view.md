# Story 2.4: Question Display - Projector View

Status: done

## Story

As a host user,
I want questions displayed on the projector with answer options and countdown timer,
So that all players can see the question simultaneously on the shared screen.

## Acceptance Criteria

**Given** the game has started
**When** I am on the host question display state (part of `/game/[gameId]/host` page, conditional render)
**Then** I see a full-screen layout optimized for projector (1920x1080):
- Question text displayed at top in large, bold typography (48px, max 3 lines, per UX Design)
- Four answer boxes in 2x2 grid below question:
  - Each box: Large letter label (A/B/C/D) + option text (32px)
  - Boxes have colored borders (purple, orange, teal, green) for visual distinction
- Countdown timer displayed prominently above answer boxes:
  - Circular progress ring or large numbers (80px font)
  - Counts down from 15 to 0 seconds
  - Color changes: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
- Question number and total: "Question 3 of 15" (top-right corner, 24px)
- Player count: "12 players" (top-left corner, 24px)
- Generic background: Solid gradient or subtle pattern (no images yet—Epic 4 adds AI images)

**And** timer implementation:
- Client-side countdown using `setInterval` (1 second ticks)
- Synchronized with server time on load (prevent drift)
- When timer reaches 0, broadcasts `timer_expired` event

**And** answer boxes are non-interactive on projector (view-only, players submit on phones)
**And** smooth transitions: Fade in when question loads, fade out when advancing
**And** responsive fallback: If displayed on smaller screen (laptop), scales down appropriately
**And** accessibility: High contrast text on background, readable from 20+ feet away

## Tasks / Subtasks

- [x] Create `QuestionDisplayProjector` component in `components/game/question-display-projector.tsx`
  - [x] Full-screen layout (1920x1080 optimized, responsive fallback)
  - [x] Question text display (48px, bold, max 3 lines, truncate with ellipsis)
  - [x] Four answer boxes in 2x2 grid layout
  - [x] Answer box styling: Large letter label (A/B/C/D) + option text (32px)
  - [x] Colored borders: Purple (A), Orange (B), Teal (C), Green (D)
  - [x] Generic background (gradient or subtle pattern)
  - [x] High contrast for readability from 20+ feet

- [x] Create `CircularTimer` component in `components/game/circular-timer.tsx`
  - [x] Circular progress ring using SVG or Framer Motion
  - [x] Large number display (80px font) showing seconds remaining
  - [x] Color transitions: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
  - [x] Smooth animations for countdown
  - [x] Accessible: ARIA labels for screen readers

- [x] Implement timer synchronization logic
  - [x] Extract `startedAt` timestamp from game store (from Story 2.3)
  - [x] Calculate remaining time: `timerDuration - (now - startedAt)`
  - [x] Use `setInterval` for 1-second countdown updates
  - [x] Handle timer reaching 0: Broadcast `timer_expired` event
  - [x] Prevent drift: Re-sync with server time if drift > 1 second

- [x] Add metadata displays
  - [x] Question number: "Question X of Y" (top-right, 24px)
  - [x] Player count: "X players" (top-left, 24px)
  - [x] Fetch player count from game store or Realtime subscription

- [x] Integrate with host page (`app/game/[gameId]/host/page.tsx`)
  - [x] Conditional render: Show `QuestionDisplayProjector` when `gameStatus === "active"` and `currentQuestion !== null`
  - [x] Hide `HostWaitingRoom` when game is active
  - [x] Use game store to get current question data
  - [x] Handle transition: Fade in when question loads

- [x] Implement smooth transitions
  - [x] Fade in animation when question loads (300ms)
  - [x] Fade out animation when advancing (300ms)
  - [x] Use Framer Motion for animations

- [x] Add responsive fallback
  - [x] Scale down layout for smaller screens (laptop, tablet)
  - [x] Maintain aspect ratio and readability
  - [ ] Test at 1280x720, 1920x1080, and smaller breakpoints

- [x] Broadcast `timer_expired` event
  - [x] When timer reaches 0, broadcast via Realtime channel
  - [x] Event payload: `{ questionId, questionNumber, timestamp }`
  - [x] Used by Story 2.7 for automatic question advancement

- [x] Update game store (if needed)
  - [x] Add `startedAt` timestamp to game store state
  - [x] Store `startedAt` when `startGame` is called
  - [x] Add `timer_expired` event type to realtime types

- [ ] Testing
  - [ ] Test question display with various question lengths
  - [ ] Test timer countdown accuracy and synchronization
  - [ ] Test color transitions (Green → Yellow → Red)
  - [ ] Test responsive layout on different screen sizes
  - [ ] Test accessibility (high contrast, screen reader)
  - [ ] Test smooth transitions and animations
  - [ ] Test `timer_expired` event broadcast

## Technical Notes

- Component location: `components/game/question-display-projector.tsx`
- Timer component: `components/game/circular-timer.tsx`
- Use Zustand game store for question data: `useGameStore()`
- Timer synchronization: Use `startedAt` from game store (from Story 2.3)
- Follow UX Design "Question Display (Projector)" specifications
- Timer component: Custom circular timer with Framer Motion animations
- Projector optimization: 48px+ text, high contrast, 16:9 aspect ratio
- Timer synchronization: Use server timestamp to prevent client drift
- Use Framer Motion for smooth animations (already installed from Story 1.3)
- Answer boxes are view-only (non-interactive) - players submit on phones (Story 2.5)
- Background: Generic gradient/pattern (Epic 4 adds AI images)

## Prerequisites

- Stories 2.1, 2.3 (completed)
- Game store has current question data from Story 2.3
- Framer Motion installed (from Story 1.3)

## Dependencies

- Epic 2: Real-Time Game Engine & Player Experience
- Architecture: Real-Time Game State Synchronization
- UX Design: Question Display (Projector)
- Story 2.3: Game Start & Question Data Loading (provides question data)

## Notes

- This story implements the projector view for question display
- Timer synchronization is critical for fair gameplay
- Answer boxes are non-interactive (view-only) - players interact on mobile (Story 2.5)
- Timer expiration triggers automatic question advancement (Story 2.7)
- Background images will be added in Epic 4 (AI-generated images)
- Responsive design ensures it works on laptops/tablets, not just projectors

---

