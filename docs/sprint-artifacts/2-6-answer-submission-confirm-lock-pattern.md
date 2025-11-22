# Story 2.6: Answer Submission with Tap-to-Lock Pattern

Status: in-progress

## Story

As a player,
I want to select answers with a tap and lock them by tapping again, or have my current selection auto-submitted when time expires,
So that I can quickly choose and confirm my answer with an intuitive interaction pattern.

## Acceptance Criteria

**Given** I am viewing a question on the player mobile view (Story 2.5)
**When** I tap an answer button
**Then** the answer button turns orange (selected state):
- Selected answer button shows orange/highlighted styling
- Selected answer is stored (e.g., `selectedAnswer = 'A'` or 'B', 'C', 'D')
- Other answer buttons remain in default state
- I can change my selection by tapping a different answer button
- Previous selection clears and new selection becomes orange
- Selected answer variable updates to the new choice
- No submission occurs yet (visual selection only)

**When** I tap the selected (orange) answer button again
**Then** the answer button turns green/shiny (locked state):
- Locked answer button shows green/shiny styling (distinct visual from orange selected)
- Shows on-screen message: "You selected. Waiting for other players." (not a toast)
  - Message appears below answer buttons, center-aligned
  - Medium text (18px), muted color (gray-700)
  - Smooth fade-in animation (300ms)
- Calculates `responseTimeMs` (time from question start to lock tap in milliseconds)
- Calls Server Action: `submitAnswer(gameId, playerId, questionId, selectedAnswer, responseTimeMs)`
- Optional haptic feedback: Brief vibration on lock (if browser supports `navigator.vibrate` - may not work on all devices)
- All answer buttons become disabled/non-interactive after successful submission

**When** timer reaches 5 seconds or less and I have not selected any answer yet:
**Then** a warning appears to encourage selection:
- Timer briefly enlarges (scale up animation, 1-2 seconds duration) to draw attention
- Warning message appears: "Select something now. You only have 5 more seconds!" (or "4 more seconds", etc. based on remaining time)
- Warning message displayed prominently below timer, center-aligned
- Medium-large text (20-24px), bold, attention-grabbing color (yellow/orange)
- Warning message disappears when answer is selected or timer expires
- Timer animation returns to normal size after 1-2 seconds (smooth transition)

**When** timer expires before I tap the selected answer again to lock:
**Then** automatically triggers submission with currently selected answer (if any):
- If an answer is selected (orange or green), uses that selection
- If no answer is selected, submits `selected_answer=NULL` (no response recorded)
- Uses same `submitAnswer` Server Action
- Calculates `responseTimeMs` from question start to timer expiration (15 seconds = 15000ms)
- Shows on-screen message: "You selected. Waiting for other players." (if answer was submitted)
- If no answer selected, shows message: "You did not select anything."
- All answer buttons become disabled/non-interactive after auto-submission

**And** Server Action `submitAnswer`:
- Validates inputs (gameId, playerId, questionId, selectedAnswer must be valid)
- Checks if answer already submitted (prevent duplicate submissions)
- Inserts row into `player_answers` table:
  - `game_id`, `player_id`, `question_id`, `selected_answer` (A/B/C/D or NULL), `response_time_ms`, `answered_at=NOW()`
  - `is_correct` and `points_earned` set to NULL (calculated in Epic 3, Story 3.1)
- Returns success/error status

**And** on-screen message (not a toast):
- Appears after successful submission (manual lock or timer auto-submit)
- Text: "You selected. Waiting for other players." (or "You did not select anything." if no answer)
- Displayed below answer buttons, center-aligned
- Medium text (18px), muted color (gray-700)
- Smooth fade-in animation (300ms)
- Remains visible until question advances (Story 2.7)

**And** low-time warning (when timer ≤ 5 seconds and no answer selected):
- Warning message: "Select something now. You only have X more seconds!" (X = remaining seconds)
- Displayed below timer, center-aligned, prominent position
- Medium-large text (20-24px), bold, attention-grabbing color (yellow/orange/amber)
- Smooth fade-in animation (300ms)
- Timer briefly enlarges (scale up 1.2-1.5x) for 1-2 seconds to draw attention
- Timer returns to normal size smoothly after attention animation
- Warning disappears immediately when answer is selected or when timer expires

**And** player cannot submit multiple times per question:
- Server Action checks for existing answer in `player_answers` table
- If answer exists for this `player_id` + `question_id`, returns error (insert-only, no updates)
- Client prevents lock tap if already submitted

**And** error handling:
- If submission fails (network error), retries once automatically after 500ms
- If retry fails, shows toast: "Submission failed. Your answer may not be recorded."
- If game not found or question not found, shows toast: "Game data error. Please refresh."
- Error state: Allows player to retry by tapping the selected answer again
- On error, locked state reverts to selected (orange) state

**And** optimistic UI:
- Shows green/shiny locked state immediately (before server confirmation)
- Shows on-screen message immediately
- Submits to server in background
- If submission fails, reverts to orange selected state and hides message
- Smooth transitions: Fade between orange → green → message (300ms each)

**And** visual feedback:
- Orange state: Highlighted/orange styling (selected, not locked)
- Green state: Shiny/green styling (locked, submitted)
- Smooth color transitions when changing selection or locking
- Timer continues to countdown (visual only, cannot prevent timer expiration)
- Low-time warning: Timer enlarges briefly (1-2 seconds) when ≤ 5 seconds and no answer selected
- Warning message appears below timer with attention-grabbing styling
- Haptic feedback on lock (brief 100ms pulse if supported)

## Tasks / Subtasks

- [ ] Create Server Action `submitAnswer` in `lib/actions/answers.ts`
  - [ ] Function signature: `submitAnswer(gameId: string, playerId: string, questionId: string, selectedAnswer: 'A' | 'B' | 'C' | 'D' | null, responseTimeMs: number)`
  - [ ] Return type: `Promise<{ success: true } | { success: false; error: string }>`
  - [ ] Validate inputs: Check gameId, playerId, questionId exist and are valid UUIDs
  - [ ] Validate selectedAnswer: Must be 'A', 'B', 'C', 'D', or null
  - [ ] Validate responseTimeMs: Must be >= 0 and <= 15000 (15 seconds max)

- [ ] Check for duplicate submissions
  - [ ] Query `player_answers` table: Check if answer exists for `player_id` + `question_id`
  - [ ] If exists, return error: "Answer already submitted"
  - [ ] Prevent multiple submissions per question (insert-only, no updates)

- [ ] Verify game and question exist
  - [ ] Query `games` table: Verify game exists and `status='active'`
  - [ ] Query `questions` table: Verify question exists and belongs to game's question set
  - [ ] Return error if game/question not found or invalid

- [ ] Insert answer into database
  - [ ] Insert row into `player_answers` table with all required fields
  - [ ] Set `is_correct` and `points_earned` to NULL (calculated later in Story 3.1)
  - [ ] Set `answered_at` to current timestamp
  - [ ] Handle database errors gracefully

- [ ] Update `QuestionDisplayPlayer` component state
  - [ ] Add state for selected answer: `const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null)`
    - This stores the answer string ('A', 'B', 'C', or 'D') when player selects an answer
    - Updates when player taps a different answer button
    - Used for submission when locked or timer expires
  - [ ] Add state for locked/submitted answer: `const [lockedAnswer, setLockedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null)`
    - Stores the locked answer string when player taps selected answer again
    - Null if not yet locked
  - [ ] Add state for submission status: `const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle')`
  - [ ] Store question start time: Use `startedAt` from game store (from Story 2.3)

- [ ] Implement three visual states for answer buttons
  - [ ] Default state: Normal styling (from Story 2.5)
  - [ ] Selected state (orange): Highlighted/orange styling when single-tapped
  - [ ] Locked state (green/shiny): Shiny/green styling when double-tapped and locked
  - [ ] Smooth CSS transitions between states (300ms)

- [ ] Note: Tap-to-lock handler above covers both selection and locking (no separate handler needed)

- [ ] Implement tap-to-lock handler
  - [ ] On tap of answer button:
    - If button is not selected (default state) OR button is different from currently selected:
      - Set `selectedAnswer` to tapped answer ('A', 'B', 'C', or 'D')
      - Update button styling: Default → orange (selected)
      - Clear previous selection (other buttons → default)
      - Hide low-time warning message if visible (answer now selected)
    - If button is already selected (orange state) AND not yet locked:
      - Set `lockedAnswer` to `selectedAnswer`
      - Update button styling: Orange → green/shiny (locked)
      - Calculate `responseTimeMs` from question start to lock tap
      - Call `submitAnswer` Server Action with locked answer
      - Show on-screen message: "You selected. Waiting for other players."
      - Hide low-time warning message if visible
      - Optional: Trigger haptic feedback (if supported - may not work on all devices)

- [ ] Implement on-screen message display
  - [ ] Create message component below answer buttons (not a toast)
  - [ ] Show "You selected. Waiting for other players." after successful submission
  - [ ] Show "Time's up. No answer submitted." if timer expires with no selection
  - [ ] Medium text (18px), muted color (gray-700), center-aligned
  - [ ] Smooth fade-in animation (300ms)
  - [ ] Remain visible until question advances (Story 2.7)

- [ ] Implement low-time warning (timer ≤ 5 seconds, no answer selected)
  - [ ] In timer countdown logic, check when timer reaches 5 seconds or less
  - [ ] Check if `selectedAnswer === null` (no answer selected yet)
  - [ ] If no answer selected and timer ≤ 5 seconds:
    - Show warning message: "Select something now. You only have X more seconds!" (X = remaining seconds)
    - Display below timer, center-aligned, prominent position
    - Medium-large text (20-24px), bold, attention-grabbing color (yellow/orange/amber)
    - Animate timer to enlarge briefly (scale up 1.2-1.5x for 1-2 seconds)
    - Use Framer Motion or CSS animations for smooth transitions
  - [ ] Hide warning immediately when answer is selected (update `selectedAnswer`)
  - [ ] Hide warning when timer expires (auto-submit triggered)

- [ ] Implement timer enlargement animation
  - [ ] When warning triggers (timer ≤ 5s, no answer selected):
    - Animate timer component to scale up (1.2-1.5x larger)
    - Animation duration: 1-2 seconds
    - Smooth scale transition using Framer Motion or CSS transform
    - Return to normal size smoothly after attention period
  - [ ] Use spring or ease-out animation for natural feel
  - [ ] Ensure timer remains readable during enlargement

- [ ] Implement timer expiration auto-submit
  - [ ] In timer countdown logic (from Story 2.5), check when timer reaches 0
  - [ ] Hide low-time warning if still visible
  - [ ] Check current selection state:
    - If `lockedAnswer` exists (green): Already submitted, do nothing
    - If `selectedAnswer` exists (orange): Submit selected answer
    - If no selection: Submit null (no answer)
  - [ ] Calculate `responseTimeMs` from question start to timer expiration (15000ms)
  - [ ] Call `submitAnswer` Server Action with current selection
  - [ ] Only submit once (check `submissionStatus` to prevent duplicate submission)
  - [ ] Show on-screen message after auto-submit:
    - "You selected. Waiting for other players." (if answer submitted)
    - "You did not select anything." (if no answer)

- [ ] Disable answer buttons after submission
  - [ ] After successful submission (manual lock or timer auto-submit):
    - Disable all answer buttons (grayed out, non-interactive)
    - Prevent single-tap selection
    - Prevent double-tap unlock
    - Show on-screen message
    - Timer continues to countdown visually (disabled state)

- [ ] Add error handling and retry logic
  - [ ] Network error: Retry once automatically after 500ms
  - [ ] If retry fails, show toast: "Submission failed. Your answer may not be recorded."
  - [ ] On error, revert locked state to selected (orange) state
  - [ ] Hide on-screen message on error
  - [ ] Allow player to retry by double-tapping again
  - [ ] Handle duplicate submission error: Show toast: "Answer already submitted" (prevent further attempts)
  - [ ] Handle game/question not found: Show toast: "Game data error. Please refresh."

- [ ] Add optimistic UI updates
  - [ ] Show green/shiny locked state immediately when double-tapped (before server response)
  - [ ] Show on-screen message immediately
  - [ ] Submit to server in background
  - [ ] If submission fails, revert to orange selected state and hide message
  - [ ] Show error toast if submission fails after optimistic update

- [ ] Add haptic feedback (optional)
  - [ ] Check if browser supports `navigator.vibrate`
  - [ ] On tap-to-lock: Vibrate briefly (100ms pulse) if supported
  - [ ] Handle gracefully if not supported (no error, just skip - may not work on all web browsers)

- [ ] Prevent duplicate submissions (client-side)
  - [ ] Check `submissionStatus` before allowing submission
  - [ ] Prevent lock tap if `submissionStatus === 'submitted'`
  - [ ] Prevent timer auto-submit if already submitted
  - [ ] Show loading state during submission (disable buttons, show subtle spinner)

- [ ] Update game store (if needed)
  - [ ] Store submitted answer in game store for reference
  - [ ] Add `submittedAnswers` map: `{ [questionId]: { selectedAnswer, responseTimeMs, answeredAt } }`
  - [ ] Used for future reference and debugging

- [ ] Add realtime subscription for answer submission (optional)
  - [ ] Listen for `answer_submitted` broadcast event on game channel
  - [ ] Update UI when other players submit (for future leaderboard, Story 3.4)
  - [ ] Store submitted player count in game store

- [ ] Testing
  - [ ] Test tap selection (orange state) - `selectedAnswer` contains answer string
  - [ ] Test tap-to-lock (green/shiny state) - tapping selected answer again
  - [ ] Test changing selection (tap different answer - clears previous, selects new)
  - [ ] Test `selectedAnswer` state updates correctly ('A', 'B', 'C', or 'D')
  - [ ] Test low-time warning (appears at 5 seconds or less, no answer selected)
  - [ ] Test timer enlargement animation (scales up when warning appears)
  - [ ] Test warning message updates dynamically ("5 more seconds", "4 more seconds", etc.)
  - [ ] Test warning disappears when answer is selected
  - [ ] Test warning disappears when timer expires
  - [ ] Test timer returns to normal size after attention animation
  - [ ] Test timer auto-submission with selected (orange) answer
  - [ ] Test timer auto-submission with locked (green) answer (already submitted)
  - [ ] Test timer auto-submission with no answer selected (null)
  - [ ] Test "You did not select anything." message appears when no answer
  - [ ] Test duplicate submission prevention (client and server)
  - [ ] Test error handling (network error, retry logic)
  - [ ] Test optimistic UI (immediate feedback, background confirmation)
  - [ ] Test haptic feedback (optional - may not work on all web browsers)
  - [ ] Test on-screen message display (not toast)
  - [ ] Test error states (game not found, question not found)
  - [ ] Test response time calculation accuracy
  - [ ] Test button disabling after submission
  - [ ] Test database insert (verify data in Supabase)

## Technical Notes

- Server Action location: `lib/actions/answers.ts`
- Component location: `components/game/question-display-player.tsx` (from Story 2.5)
- Database table: `player_answers` (schema from migrations/001_initial_schema.sql)
- Response time calculation: Use `performance.now()` or `Date.now()` from question `startedAt` timestamp
- Timer duration: 15 seconds = 15000ms maximum
- Tap-to-lock pattern: Tap answer once (orange), tap same answer again (green/locked)
- Visual states: Default (normal) → Selected (orange) → Locked (green/shiny)
- Selected answer storage: `selectedAnswer` state contains answer string ('A', 'B', 'C', or 'D')
- Low-time warning: Triggers at ≤ 5 seconds remaining when no answer selected
- Timer animation: Scales up 1.2-1.5x for 1-2 seconds during low-time warning
- Optimistic updates: Immediate UI feedback, server confirmation in background (Architecture "State Management")
- Error handling: Retry once automatically, then allow manual retry by double-tapping again
- Duplicate prevention: Check database before insert (insert-only, no updates)
- Haptic feedback: Optional enhancement using `navigator.vibrate()` API (100ms pulse on lock) - may not work on all web browsers/devices
- On-screen message: Not a toast, displayed below answer buttons (stays until question advances)
- Real-time synchronization: Answer submission is recorded in database, future stories will broadcast for leaderboards

## Prerequisites

- Stories 2.1, 2.3, 2.5 (completed)
- Game store has `startedAt` timestamp from Story 2.3
- `QuestionDisplayPlayer` component exists with answer buttons (Story 2.5)
- Database table `player_answers` exists (from Story 1.2)

## Dependencies

- Epic 2: Real-Time Game Engine & Player Experience
- Architecture: Real-Time Game State Synchronization, Server Actions
- UX Design: Tap-to-lock pattern (new UX pattern - tap once to select, tap again to lock)
- Story 2.3: Game Start & Question Data Loading (provides `startedAt` timestamp)
- Story 2.5: Question Display - Player Mobile View (provides answer buttons and timer)

## Notes

- This story implements the tap-to-lock pattern for answer submission
- Tap answer = Select answer (orange/highlighted state) - `selectedAnswer` contains answer string ('A', 'B', 'C', or 'D')
- Tap selected answer again = Lock answer (green/shiny locked state) - submits answer
- Players can change selection by tapping a different answer (clears previous, selects new)
- Timer auto-submits current selection (orange) or nothing if no selection
- Low-time warning appears when timer ≤ 5 seconds and no answer selected:
  - Timer briefly enlarges to draw attention
  - Message: "Select something now. You only have X more seconds!"
  - Warning disappears when answer is selected or timer expires
- Answers are immutable once submitted (insert-only, no updates)
- On-screen message "You selected. Waiting for other players." is not a toast (stays visible on screen)
- If no answer submitted: "You did not select anything." message appears
- Selected answer is stored in state as string ('A', 'B', 'C', or 'D') for easy access during submission
- `is_correct` and `points_earned` are calculated later in Epic 3 (Story 3.1)
- Response time is recorded in milliseconds for accurate scoring calculations
- Optimistic UI provides immediate feedback, server confirmation ensures data integrity
- Future stories (Story 3.4) will use submitted answers for leaderboard display

---

