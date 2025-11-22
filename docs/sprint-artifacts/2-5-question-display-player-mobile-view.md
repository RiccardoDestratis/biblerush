# Story 2.5: Question Display - Player Mobile View

Status: in-progress

## Story

As a player,
I want to see the question and answer options on my phone with a countdown timer,
So that I can read the question and select my answer quickly.

## Acceptance Criteria

**Given** the game has started
**When** I am on the player question display state (part of `/game/[gameId]/play` page, conditional render)
**Then** I see a mobile-optimized layout (375px-430px width):
- Question text at top (18px font, max 4 lines, scrollable if longer)
- Four answer buttons stacked vertically:
  - Each button: Large tap target (60px height, per UX Design)
  - Letter label (A/B/C/D) + option text (16px, 2 lines max)
  - Buttons use primary/secondary color variants (purple, orange, teal, coral)
- Countdown timer displayed between question and buttons:
  - Progress bar or circular timer (40px height)
  - Numeric countdown (e.g., "12s remaining")

**When** I tap a button to select answer:
**Then** selected button is highlighted (thicker border, darker background)
**And** other buttons remain normal
**And** selection is VISUAL ONLY (not submitted yet)
**And** I can change selection before confirming (tap different button)

**And** "Lock Answer" button appears below answer buttons ONLY after selection:
- Large button (60px height, full width)
- Primary color (deep purple)
- Text: "Lock Answer" or "Confirm"
- Disabled/hidden until selection made

**And** timer counts down (synchronized with host):
- Updates every second
- Color changes: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
- If timer expires before locking, currently selected answer auto-submits (Story 2.6)

**And** question number displayed: "Question 3 of 15" (small text, top)
**And** smooth transitions: Fade in when question loads

## Tasks / Subtasks

- [x] Create `QuestionDisplayPlayer` component in `components/game/question-display-player.tsx`
  - [x] Mobile-optimized layout (375px-430px width, full viewport height)
  - [x] Question text display (18px, max 4 lines, scrollable)
  - [x] Four answer buttons stacked vertically
  - [x] Answer button styling: Large tap target (60px height minimum)
  - [x] Letter label (A/B/C/D) + option text (16px, 2 lines max)
  - [x] Button colors: Purple (A), Orange (B), Teal (C), Coral (D)
  - [x] Selected state: Thicker border, darker background, yellow highlight
  - [x] Generic background (gradient matching projector view)

- [x] Create mobile timer component or adapt `CircularTimer`
  - [x] Progress bar or compact circular timer (40px height)
  - [x] Numeric countdown display (e.g., "12s remaining")
  - [x] Color transitions: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
  - [x] Synchronized with server time (same logic as projector timer)
  - [x] Accessible: ARIA labels for screen readers

- [x] Implement answer selection logic
  - [x] Track selected answer index in component state
  - [x] Handle button tap/click to select answer
  - [x] Visual feedback: Highlight selected button, reset others
  - [x] Allow changing selection (tap different button)
  - [x] Selection is visual only (not submitted yet)

- [x] Implement "Lock Answer" button
  - [x] Show button ONLY after answer is selected
  - [x] Large button (60px height, full width)
  - [x] Primary color (deep purple)
  - [x] Text: "Lock Answer" or "Confirm"
  - [x] Disabled/hidden until selection made
  - [x] On click: Store selection (will submit in Story 2.6)

- [x] Add metadata displays
  - [x] Question number: "Question X of Y" (small text, top)
  - [x] Use game store to get questionNumber and totalQuestions

- [x] Integrate with player page (`app/game/[gameId]/play/page.tsx`)
  - [x] Conditional render: Show `QuestionDisplayPlayer` when `gameStatus === "active"` and `currentQuestion !== null`
  - [x] Hide `PlayerWaitingRoom` when game is active
  - [x] Use game store to get current question data
  - [x] Handle transition: Fade in when question loads

- [x] Implement smooth transitions
  - [x] Fade in animation when question loads (300ms)
  - [x] Use Framer Motion for animations

- [x] Timer synchronization
  - [x] Use same `startedAt` timestamp from game store (from Story 2.3)
  - [x] Calculate remaining time: `timerDuration - (now - startedAt)`
  - [x] Use `setInterval` for 1-second countdown updates
  - [x] Timer must match projector timer within 500ms (NFR1)
  - [x] Handle timer expiration: Auto-submit selected answer (Story 2.6)

- [x] Update game store (if needed)
  - [x] Store selected answer index in component state (not in store yet)
  - [x] Store locked answer when "Lock Answer" is clicked (for Story 2.6)

## Technical Notes

- Component location: `components/game/question-display-player.tsx`
- Timer component: Reuse or adapt `CircularTimer` for mobile (smaller size)
- Use Zustand game store for question data: `useGameStore()`
- Timer synchronization: Use `startedAt` from game store (from Story 2.3)
- Follow UX Design "Question View (Phone)" and "Select → Confirm/Lock" pattern
- Touch targets: 60px+ height (CR3, UX Design "Touch-First Mobile Design")
- Answer buttons: All same color initially, turn yellow when selected (UX Design "AnswerButton" component)
- Timer synchronization: Must match projector timer within 500ms (NFR1)
- Use Framer Motion for smooth animations (already installed from Story 1.3)
- Selection is visual only - actual submission happens in Story 2.6
- Background: Generic gradient/pattern (Epic 4 adds AI images)

## Prerequisites

- Stories 2.1, 2.3, 2.4 (completed)
- Game store has current question data from Story 2.3
- Framer Motion installed (from Story 1.3)
- CircularTimer component exists (from Story 2.4)

## Dependencies

- Epic 2: Real-Time Game Engine & Player Experience
- Architecture: Real-Time Game State Synchronization
- UX Design: Question View (Phone)
- Story 2.3: Game Start & Question Data Loading (provides question data)
- Story 2.4: Question Display - Projector View (provides timer component reference)

## Notes

- This story implements the player mobile view for question display
- Timer synchronization is critical for fair gameplay (must match projector)
- Answer selection is visual only - submission happens in Story 2.6
- "Lock Answer" button allows players to confirm before timer expires
- Timer expiration auto-submits selected answer (if any) - Story 2.6
- Background images will be added in Epic 4 (AI-generated images)
- Mobile-first design ensures optimal experience on phones (375px-430px width)

---

