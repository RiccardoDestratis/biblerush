# Story 3.3: Player Answer Feedback

Status: done

## Story

As a player,
I want to see if my answer was correct or incorrect immediately after the timer expires,
So that I get instant feedback on my performance.

## Acceptance Criteria

**Given** I have submitted an answer (or timer expired without an answer)
**When** answer is revealed on the projector (after `answer_reveal` broadcast from Story 3.2)
**Then** player view transitions to feedback state:
- Display until host advances to leaderboard (5 seconds, matches reveal timing from Story 3.2)
- Layout (mobile-optimized, 375px minimum width):

**If correct:**
- Green checkmark icon (✓, CheckCircle2 from lucide-react, 64px) on selected button
- Large animated points: "+[X] points" (32px font, animated count-up from 0 to actual points over 500ms)
- Speed bonus notification (if applicable): "+5 speed bonus!" or "+3 speed bonus!" (20px, teal color, below points)
- Encouraging message: "Correct! Well done!" (24px, green text, bold)
- Selected answer button remains highlighted in green

**If incorrect:**
- Red X icon (✗, XCircle from lucide-react, 64px) on selected button
- Text: "Incorrect" (24px, red text, bold)
- Correct answer shown: "Correct answer: [Letter] - [Answer Text]" (18px, gray-700)
- Points: "+0 points" (18px, gray-600)
- Selected answer button shows red border/styling

**If no answer:**
- Text: "Time's up! No answer submitted." (24px, orange text)
- Correct answer shown: "Correct answer: [Letter] - [Answer Text]" (18px, gray-700)
- Points: "+0 points" (18px, gray-600)

**And** cumulative score updated: "Total Score: [X] points" (18px, bottom of screen, bold)
- Fetched from `game_players.total_score` (updated by Story 3.1 scoring)
- Displays below feedback content, centered

**And** points earned animated: Count up from 0 to actual points (e.g., 0→15 over 500ms) using Framer Motion
- **IMPORTANT:** Points display only shows when answer is revealed (after `answer_reveal` broadcast)
- Speed bonus notification only shows when answer is revealed (after `answer_reveal` broadcast)
- Use `useMotionValue` and `useTransform` for smooth count-up animation
- Display speed bonus separately if earned (+5 or +3)
- Timing: Points and speed bonus revealed simultaneously with projector reveal

**And** scripture reference displayed if available (small text, 14px, gray-600, below correct answer)
- Uses `scriptureReference` from `answer_reveal` event payload

**And** visual feedback synced with projector reveal (listen to `answer_reveal` broadcast from Story 3.2):
- **IMPORTANT:** Feedback does NOT show immediately when timer expires
- Feedback ONLY shows when answer is revealed on projector (after `answer_reveal` broadcast)
- Listens for `answer_reveal` event via Realtime subscription
- Event payload: `{ gameId, questionId, correctAnswer, scriptureReference }`
- Compares player's `selected_answer` (from Story 2.6) to `correctAnswer` to determine if correct
- Updates feedback state immediately when `answer_reveal` event received (synchronized with projector reveal)
- Timing: After timer expires → Scoring completes (Story 3.1) → Reveal on projector → Reveal on mobile (simultaneous)

**And** smooth transition: Fade from answer submission to feedback (300ms) using Framer Motion
- Fade out answer buttons/selected state
- Fade in feedback display

**And** after 5 seconds, automatic transition to personal leaderboard (Story 3.5):
- Same 5-second duration as projector reveal (Story 3.2)
- Transition triggered when `leaderboard_ready` event received (from Story 3.4)
- Fade out feedback, fade in leaderboard (300ms transition)

**And** accessibility:
- Screen reader announces: "Correct! You earned [X] points" or "Incorrect. The correct answer was [Letter]"
- High contrast: Green for correct (#22C55E), red for incorrect (#EF4444), orange for time's up (#F97316)
- Icons large enough to see clearly (64px minimum)

**And** error handling:
- If `answer_reveal` event not received after 10 seconds, show generic feedback: "Waiting for results..."
- If player's answer data not found, show "Answer could not be determined"
- If Realtime connection fails, continue with local state (may not sync perfectly)

## Tasks / Subtasks

- [ ] Update Realtime types in `lib/types/realtime.ts`
  - [ ] Verify `answer_reveal` event type exists (added in Story 3.2)
  - [ ] Verify `leaderboard_ready` event type exists (added in Story 3.2)
  - [ ] Add `onAnswerReveal` and `onLeaderboardReady` callbacks if not already present

- [ ] Create `PlayerAnswerFeedback` component in `components/game/player-answer-feedback.tsx`
  - [ ] Mobile-optimized layout (375px minimum, responsive)
  - [ ] Display feedback based on answer correctness:
    - [ ] Correct: Green checkmark, animated points, speed bonus notification
    - [ ] Incorrect: Red X, correct answer shown, 0 points
    - [ ] No answer: Time's up message, correct answer shown, 0 points
  - [ ] Display cumulative total score from `game_players.total_score`
  - [ ] Display scripture reference if available (14px, gray-600)
  - [ ] Animated points count-up using Framer Motion (0→actual over 500ms)
  - [ ] Speed bonus notification if earned (+5 or +3, teal color)
  - [ ] Fade-in animation (300ms) using Framer Motion
  - [ ] Accessible: Screen reader announcements, high contrast colors
  - [ ] Responsive: Works on mobile devices (375px+ width)

- [ ] Update `PlayerGameView` component in `components/game/player-game-view.tsx`
  - [ ] Add `feedbackState` to local state: `'question' | 'feedback' | 'leaderboard' | 'waiting'`
  - [ ] Add `playerAnswer` state: Stores player's submitted answer (from Story 2.6)
  - [ ] Add `pointsEarned` state: Points earned for this question (fetched from `player_answers.points_earned` after scoring)
  - [ ] Add `totalScore` state: Cumulative score (from `game_players.total_score`)
  - [ ] **IMPORTANT:** Do NOT show feedback immediately when timer expires
  - [ ] **IMPORTANT:** Only show feedback when `answer_reveal` event is received (synchronized with projector reveal)
  - [ ] Listen for `answer_reveal` event via Realtime subscription:
    - [ ] Update `feedbackState` to 'feedback' when event received (NOT on timer expiration)
    - [ ] Compare player's `selected_answer` to `correctAnswer` from event
    - [ ] Store `correctAnswer` and `scriptureReference` from event payload
    - [ ] Fetch player's answer data from `player_answers` table to get `points_earned` and `is_correct`
    - [ ] Display points and speed bonus ONLY after `answer_reveal` event received
  - [ ] Listen for `leaderboard_ready` event (from Story 3.4):
    - [ ] Update `feedbackState` to 'leaderboard' after 5 seconds
    - [ ] Transition to personal leaderboard (Story 3.5)
  - [ ] Conditional render based on `feedbackState`:
    - [ ] Show question display when `feedbackState === 'question'`
    - [ ] Show `PlayerAnswerFeedback` when `feedbackState === 'feedback'`
    - [ ] Show personal leaderboard (Story 3.5) when `feedbackState === 'leaderboard'`
  - [ ] Fade transitions between states (300ms)

- [ ] Create Server Action `getPlayerAnswerResult` in `lib/actions/answers.ts` (optional helper)
  - [ ] Function signature: `getPlayerAnswerResult(gameId: string, playerId: string, questionId: string)`
  - [ ] Return type: `Promise<{ success: true; isCorrect: boolean; pointsEarned: number; totalScore: number } | { success: false; error: string }>`
  - [ ] Fetches `player_answers` row for this game/player/question
  - [ ] Returns `is_correct`, `points_earned`, and current `total_score` from `game_players`
  - [ ] Handles missing answer (no submission) → returns `isCorrect: false, pointsEarned: 0`
  - [ ] Used to get player's specific results after scoring completes (Story 3.1)

- [ ] Update game store (`lib/store/game-store.ts`) - if needed for player view
  - [ ] Verify `answer_reveal` event handling exists (added in Story 3.2)
  - [ ] Player view may use local component state instead of global store (check existing pattern)

- [ ] Update Realtime subscription in `lib/supabase/realtime.ts`
  - [ ] Verify `onAnswerReveal` callback handling exists (added in Story 3.2)
  - [ ] Verify `onLeaderboardReady` callback handling exists (added in Story 3.2)
  - [ ] Update `PlayerGameView` component to subscribe to game channel with these callbacks

- [ ] Integrate with Story 2.6 (Answer Submission)
  - [ ] Ensure `selected_answer` is available in component state when feedback triggered
  - [ ] Pass player's submitted answer to feedback component for comparison

- [ ] Styling and animations
  - [ ] Use Framer Motion for count-up animation: `useMotionValue`, `useTransform`, `useSpring`
  - [ ] Green feedback: #22C55E (Tailwind `green-500`)
  - [ ] Red feedback: #EF4444 (Tailwind `red-500`)
  - [ ] Orange time's up: #F97316 (Tailwind `orange-500`)
  - [ ] Teal speed bonus: #14B8A6 (Tailwind `teal-500`)
  - [ ] Smooth transitions: 300ms fade-in/fade-out

- [ ] Error handling
  - [ ] Handle missing `answer_reveal` event (timeout after 10 seconds)
  - [ ] Handle missing player answer data
  - [ ] Handle Realtime connection failures
  - [ ] Show appropriate error states

- [ ] Testing
  - [ ] Test correct answer feedback with points animation
  - [ ] Test incorrect answer feedback
  - [ ] Test no answer submitted feedback
  - [ ] Test speed bonus notification display
  - [ ] Test cumulative score display
  - [ ] Test scripture reference display
  - [ ] Test transition to leaderboard after 5 seconds
  - [ ] Test synchronization with `answer_reveal` event
  - [ ] Test on mobile devices (375px width)

## Technical Notes

- Component location: `components/game/player-answer-feedback.tsx`
- Server Action location: `lib/actions/answers.ts` (optional helper)
- Event types: `answer_reveal`, `leaderboard_ready` (from Story 3.2)
- Display duration: 5 seconds (matches Story 3.2 reveal duration)
- Transition animation: 300ms fade-in (Framer Motion)
- **IMPORTANT:** Feedback does NOT show immediately when timer expires
- **IMPORTANT:** Feedback ONLY shows when `answer_reveal` event is received (synchronized with projector reveal)
- Synchronization: Realtime `answer_reveal` broadcast ensures feedback appears simultaneously with projector reveal
- Integration: Triggered AFTER `answer_reveal` event received (from Story 3.2), NOT on timer expiration
- Timing sequence: Timer expires → Scoring (Story 3.1) → Reveal on projector (Story 3.2) → Reveal on mobile (Story 3.3) - simultaneous
- Next step: After 5 seconds, transitions to personal leaderboard (Story 3.5)
- Speed bonus: Displayed if `getSpeedBonus(responseTimeMs) > 0` (from Story 3.1)
- Cumulative score: Fetched from `game_players.total_score` (updated by Story 3.1)
- Visual design: Follows UX Design "Answer Feedback (Phone)" specifications
- Accessibility: WCAG AA contrast ratios, screen reader support

## Prerequisites

- Stories 2.5, 2.6, 3.1, 3.2 (completed)
- Story 2.5: Player game view component exists
- Story 2.6: Answer submission stores `selected_answer` and `response_time_ms`
- Story 3.1: Scoring calculation engine completes and updates `player_answers.points_earned` and `game_players.total_score`
- Story 3.2: Answer reveal broadcasts `answer_reveal` event with `correctAnswer` and `scriptureReference`

## Dependencies

- Epic 3: Scoring, Leaderboards & Game Completion
- Architecture: Real-Time Game State Synchronization
- Story 3.1: Scoring Calculation Engine (provides `points_earned` and `is_correct`)
- Story 3.2: Answer Reveal on Projector (broadcasts `answer_reveal` event)
- Story 3.5: Personal Leaderboard - Player View (transitions to after 5 seconds)

## Notes

- **IMPORTANT:** This story implements player feedback synchronized with projector reveal, NOT immediately after timer expiration
- **Timing Sequence:** Timer expires → Scoring completes (Story 3.1) → Reveal on projector (Story 3.2) → Reveal on mobile (Story 3.3) - simultaneous
- Players do NOT see their answer result or points immediately when timer expires
- Players only see feedback when answer is revealed on projector (after `answer_reveal` broadcast)
- Feedback duration matches projector reveal (5 seconds) for synchronization
- Speed bonus notification appears only if player earned bonus points (0-5 seconds response time)
- Points animation provides satisfying visual feedback for correct answers (only after reveal)
- Cumulative score helps players track their progress throughout the game
- Scripture reference provides additional context for the answer
- Synchronization with projector ensures all players see feedback at the same time as reveal
- After 5 seconds, automatically transitions to personal leaderboard (Story 3.5)

## Enhancements (Future)

- Sound effects for correct/incorrect feedback (optional, accessibility consideration)
- Haptic feedback on mobile devices for correct answers
- Celebration animation for perfect scores (15 points)
- Social sharing of achievements (optional, Epic 6)

---

