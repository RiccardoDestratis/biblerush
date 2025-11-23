# Story 3.2: Answer Reveal on Projector

Status: done

## Story

As a host user,
I want to see which answer was correct after each question,
So that players learn the right answer before seeing the leaderboard.

## Acceptance Criteria

**Given** a question timer has expired
**When** answer reveal state is triggered (after scoring calculation from Story 3.1)
**Then** host view transitions to "Answer Reveal" state:
- Display for 5 seconds (static duration, per FR11)
- Layout (full-screen, 1920x1080 projector-optimized):
  - Original question text (smaller, 32px, top of screen, max 2 lines)
  - Correct answer highlighted with large checkmark icon (✓, 80px) and green background (#22C55E)
  - Text: "Correct Answer: [Letter] - [Answer Text]" (48px font, bold)
  - Scripture reference below if exists (e.g., "Matthew 2:1" in 24px font, gray-600)
  - Background: Solid color or subtle gradient (no images yet—Epic 4 adds AI images)
  - Correct answer box from question display (Story 2.4) highlighted in green with border (4px, #22C55E)
  - Incorrect answer boxes remain visible but grayed out (opacity: 0.4, gray background)
  - Answer boxes maintain 2x2 grid layout from Story 2.4

**And** transition animation: Fade in reveal (300ms) after timer reaches zero
**And** reveal state synchronized to all devices via Realtime `answer_reveal` broadcast:
- Host broadcasts event with `correctAnswer` (letter: 'A', 'B', 'C', or 'D') when entering reveal state
- Event payload: `{ gameId: string, questionId: string, correctAnswer: string, scriptureReference: string | null }`
- Players listen and display same reveal on mobile (Story 3.3)
- Broadcast happens automatically after scoring calculation completes (Story 3.1)

**And** after 5 seconds, automatic transition to leaderboard (Story 3.4)
- Countdown indicator: Subtle countdown from 5 to 0 seconds (optional, small text bottom-right)
- Automatic broadcast of `leaderboard_ready` event after 5 seconds to trigger Story 3.4

**And** visual styling:
- Success green (#22C55E) for correct answer background and border
- Warm grays (#6B7280) for incorrect answer boxes
- High contrast: White text on green background for correct answer
- Checkmark icon: 80px size, white color, positioned above correct answer text

**And** accessibility:
- High contrast ratios meet WCAG AA standards
- Checkmark icon large enough to see from 20+ feet away (80px minimum)
- Text readable from projector distance (minimum 32px font)
- Screen reader support: Announce "Correct answer is [Letter] - [Answer Text]"

**And** error handling:
- If correct answer not found, show error state: "Answer could not be determined"
- If Realtime broadcast fails, fallback to local state update (other devices may not sync)
- If timer expires before reveal triggered, automatically trigger reveal

**And** integration with scoring (Story 3.1):
- Answer reveal triggered after `processQuestionScores()` completes
- Wait for `scores_updated` event from Story 3.1 before showing reveal
- Ensure scoring calculation completes before revealing answer

## Tasks / Subtasks

- [ ] Update Realtime types in `lib/types/realtime.ts`
  - [ ] Add `answer_reveal` to `RealtimeEvent` type
  - [ ] Add `AnswerRevealPayload` interface: `{ gameId: string, questionId: string, correctAnswer: string, scriptureReference: string | null }`
  - [ ] Update `RealtimeEventPayload` union type to include `AnswerRevealPayload`
  - [ ] Update `GameChannelCallbacks` interface to include `onAnswerReveal?: (payload: AnswerRevealPayload) => void`

- [ ] Create Server Action `broadcastAnswerReveal` in `lib/actions/games.ts` (or `lib/actions/questions.ts`)
  - [ ] Function signature: `broadcastAnswerReveal(gameId: string, questionId: string)`
  - [ ] Return type: `Promise<{ success: true } | { success: false, error: string }>`
  - [ ] Fetch correct answer from `questions` table (using `questionId`)
  - [ ] Fetch `scripture_reference` from `questions` table (may be null)
  - [ ] Return `correctAnswer` (letter: 'A', 'B', 'C', or 'D') and `scriptureReference`
  - [ ] Client will broadcast via Realtime (server doesn't broadcast directly)

- [ ] Create `AnswerRevealProjector` component in `components/game/answer-reveal-projector.tsx`
  - [ ] Full-screen layout (1920x1080, matches Story 2.4 projector layout)
  - [ ] Display original question text (32px, top of screen, max 2 lines)
  - [ ] Display correct answer with green highlight:
    - Large checkmark icon (✓, 80px, white)
    - "Correct Answer: [Letter] - [Answer Text]" (48px, bold, white text on green background)
    - Green background (#22C55E) with 4px border
  - [ ] Display scripture reference if exists (24px, gray-600, below correct answer)
  - [ ] Display all 4 answer boxes in 2x2 grid (from Story 2.4 layout):
    - Correct answer box: Green highlight (#22C55E), full opacity
    - Incorrect answer boxes: Grayed out (opacity: 0.4, gray background #6B7280)
  - [ ] Fade-in animation (300ms) using Framer Motion
  - [ ] Countdown indicator (optional, small text bottom-right): "Revealing leaderboard in 5..." counting down
  - [ ] High contrast styling for projector visibility
  - [ ] Responsive fallback for smaller screens

- [ ] Update host question display component (`components/game/question-display-projector.tsx` or host page)
  - [ ] Add `revealState` to game store or local state ('question' | 'reveal' | 'leaderboard')
  - [ ] Listen for `scores_updated` event from Story 3.1
  - [ ] After `scores_updated` received, trigger answer reveal:
    - Call `broadcastAnswerReveal` Server Action
    - Update local state to 'reveal'
    - Broadcast `answer_reveal` event via Realtime (using result from Server Action)
  - [ ] Transition from question display to answer reveal:
    - Fade out question display (300ms)
    - Fade in answer reveal (300ms)
  - [ ] After 5 seconds, transition to leaderboard:
    - Update state to 'leaderboard'
    - Broadcast `leaderboard_ready` event (triggers Story 3.4)
    - Fade out reveal, fade in leaderboard

- [ ] Update game store (`lib/store/game-store.ts`)
  - [ ] Add `revealState` state: `'question' | 'reveal' | 'leaderboard' | 'results'`
  - [ ] Add `correctAnswer` state: `string | null` (stores correct answer letter)
  - [ ] Add `scriptureReference` state: `string | null`
  - [ ] Add `setRevealState` action: Updates reveal state
  - [ ] Add `setCorrectAnswer` action: Stores correct answer and scripture reference
  - [ ] Add action to handle `scores_updated` event (from Story 3.1)
  - [ ] Add action to handle `answer_reveal` event (for sync across devices)

- [ ] Update Realtime subscription in `lib/supabase/realtime.ts`
  - [ ] Add `onAnswerReveal` callback to `GameChannelCallbacks` interface
  - [ ] Handle `answer_reveal` event in `subscribeToGameChannel`
  - [ ] Update game store when `answer_reveal` event received
  - [ ] Ensure reveal state synchronized across all devices

- [ ] Update timer component integration
  - [ ] When timer reaches 0, do NOT automatically transition to reveal
  - [ ] Wait for `scores_updated` event from Story 3.1 first
  - [ ] Then trigger answer reveal after scoring completes
  - [ ] Timer should show "Time's up!" or similar when reaching 0

- [ ] Add 5-second countdown after reveal
  - [ ] Create countdown hook or component for 5-second reveal duration
  - [ ] After 5 seconds, automatically trigger leaderboard transition
  - [ ] Optional: Display countdown text "Revealing leaderboard in [X]..." (subtle, bottom-right)

- [ ] Styling and animations
  - [ ] Use Framer Motion for fade-in animation (300ms)
  - [ ] Green highlight color: #22C55E (Tailwind `green-500`)
  - [ ] Gray incorrect answers: #6B7280 (Tailwind `gray-500`) with 0.4 opacity
  - [ ] Checkmark icon: Lucide React `CheckCircle2` icon, size 80px
  - [ ] High contrast text: White on green background
  - [ ] Responsive: Scales appropriately on smaller screens

- [ ] Error handling
  - [ ] If correct answer not found in database, show error state
  - [ ] If Realtime broadcast fails, log error but continue with local reveal
  - [ ] If timer expired before reveal, automatically trigger reveal
  - [ ] Handle edge cases: Game ended, question not found, etc.

- [ ] Integration testing
  - [ ] Test reveal triggers after scoring calculation completes
  - [ ] Test `answer_reveal` event broadcast and reception
  - [ ] Test 5-second reveal duration
  - [ ] Test automatic transition to leaderboard
  - [ ] Test synchronization across multiple devices
  - [ ] Test error handling scenarios

## Technical Notes

- Component location: `components/game/answer-reveal-projector.tsx`
- Server Action location: `lib/actions/games.ts` or `lib/actions/questions.ts`
- Event type: `answer_reveal` (defined in `lib/types/realtime.ts`)
- Display duration: 5 seconds (static, per FR11)
- Transition animation: 300ms fade-in (Framer Motion)
- Synchronization: Realtime `answer_reveal` broadcast ensures all devices see reveal simultaneously
- Integration: Triggered after `scores_updated` event from Story 3.1
- Next step: After 5 seconds, transitions to Story 3.4 (Leaderboard)
- Scripture reference: Display if available (Epic 4 adds full image reveal with scripture)
- Visual design: Follows UX Design "Answer Reveal (Projector)" specifications
- Accessibility: WCAG AA contrast ratios, large icons, readable text

## Prerequisites

- Stories 2.4, 3.1 (completed)
- Story 2.4: Question display projector view component exists
- Story 3.1: Scoring calculation engine completes and broadcasts `scores_updated` event

## Dependencies

- Epic 3: Scoring, Leaderboards & Game Completion
- Architecture: Real-Time Game State Synchronization
- Story 3.1: Scoring Calculation Engine (must complete before reveal)
- Story 3.3: Player Answer Feedback (listens to `answer_reveal` event)
- Story 3.4: Live Leaderboard - Projector Display (triggered after 5 seconds)

## Notes

- This story implements the answer reveal phase between question end and leaderboard
- Answer reveal must happen AFTER scoring calculation (Story 3.1) completes
- The 5-second reveal duration allows players to see the correct answer before leaderboard
- Scripture reference is displayed here, but Epic 4 will enhance with AI-generated images
- The reveal state is synchronized across all devices via Realtime broadcast
- After 5 seconds, the reveal automatically transitions to leaderboard (Story 3.4)

## Enhancements (Future)

- Epic 4: Enhanced answer reveal with AI-generated Biblical images
- Enhanced scripture reference display (styling, formatting)
- Sound effects for reveal (optional, accessibility consideration)

---
