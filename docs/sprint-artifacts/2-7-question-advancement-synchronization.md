# Story 2.7: Question Advancement & Synchronization

Status: done

## Story

As a host user,
I want the game to automatically advance to the next question after the leaderboard phase completes,
So that gameplay flows smoothly through all questions without manual intervention.

**Additionally**, as a host user,
I want to pause/resume the game and skip to the next question using two prominent buttons,
So that I can control the game flow when needed (e.g., for discussions, technical issues, or time management).

## Acceptance Criteria

**Given** the leaderboard phase has completed (after reveal phase)
**When** the leaderboard countdown reaches zero
**Then** Story 3.4 (Leaderboard) triggers Server Action: `advanceQuestion(gameId)`

**And** Server Action `advanceQuestion`:
- Updates `games` table: `current_question_index += 1`
- Fetches next question from `questions` table (by `order_index`)
- Broadcasts `question_advance` event with new question data via Realtime
- If `current_question_index >= question_count`, ends game instead (Story 3.6)

**And** all connected devices (host + players) listen for `question_advance` event:
- Transition to new question display
- Reset timer to 15 seconds
- Clear previous answers/selections
- Update game store with new question data
- Smooth fade transitions (300ms)

**When** `current_question_index >= question_count`:
**Then** game ends (transition to results—Epic 3)
**And** updates `games` table: `status='completed'`, `completed_at=NOW()`
**And** broadcasts `game_end` event (Story 3.6)

**And** smooth transitions: Fade out current question, fade in next question (300ms animation)
**And** no blank screens or jarring jumps between questions

**Additionally**, as a host user:

**Given** I am viewing the question display (projector view)
**When** I click the Pause button
**Then** the game pauses for all connected devices (host + players)
**And** the timer freezes at the current remaining time
**And** a freezing animation is displayed on all devices (e.g., subtle overlay with pause icon)
**And** the Pause button transforms into a Play button
**And** all game interactions are disabled (timer stops, answer submissions paused)

**When** I click the Play button (while paused)
**Then** the game resumes for all connected devices
**And** the timer resumes from the frozen time
**And** the freezing animation is removed
**And** the Play button transforms back into a Pause button
**And** all game interactions are re-enabled

**When** I click the Skip to Next Question button (from either active or paused state)
**Then** the game immediately advances to the next question
**And** if the game was paused, it automatically resumes
**And** the advancement is synchronized across all devices via `question_advance` event
**And** the timer resets to 15 seconds for the new question
**And** previous answers/selections are cleared

## Tasks / Subtasks

- [ ] Create Server Action `advanceQuestion` in `lib/actions/games.ts`
  - [ ] Function signature: `advanceQuestion(gameId: string)`
  - [ ] Return type: `Promise<{ success: true; questionData: {...} } | { success: false; error: string }>`
  - [ ] Validate game exists and is active
  - [ ] Get current `current_question_index` from `games` table
  - [ ] Check if `current_question_index + 1 >= question_count`:
    - [ ] If yes: End game (update `status='completed'`, `completed_at=NOW()`, broadcast `game_end`)
    - [ ] If no: Advance to next question
  - [ ] Update `games` table: `current_question_index += 1`
  - [ ] Fetch next question from `questions` table:
    - [ ] Query by `question_set_id` and `order_index = current_question_index + 1`
    - [ ] Return question data: `id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `scripture_reference`
  - [ ] Format question data payload for broadcast
  - [ ] Return question data (client will broadcast via Realtime)

- [ ] Update realtime types in `lib/types/realtime.ts`
  - [ ] Add `game_pause` and `game_resume` to `RealtimeEvent` type
  - [ ] Add `GamePausePayload` interface: `{ pausedAt: string }` (ISO timestamp)
  - [ ] Add `GameResumePayload` interface: `{ resumedAt: string, pauseDuration: number }` (ISO timestamp, seconds)
  - [ ] Update `RealtimeEventPayload` union type to include new payloads
  - [ ] Update `GameChannelCallbacks` interface to include `onGamePause` and `onGameResume` handlers
  - [ ] Ensure `QuestionAdvancePayload` matches the payload structure from Server Action
  - [ ] Include `questionNumber`, `timerDuration`, `startedAt`, `totalQuestions` in `QuestionAdvancePayload`

- [ ] Update game store in `lib/store/game-store.ts`
  - [ ] Add `isPaused` state (boolean)
  - [ ] Add `pausedAt` timestamp (ISO string | null) to track when pause occurred
  - [ ] Add `pauseDuration` (number) to track total paused time
  - [ ] Add `setPaused` action: Sets `isPaused = true`, records `pausedAt` timestamp
  - [ ] Add `setResumed` action: Sets `isPaused = false`, calculates `pauseDuration`, clears `pausedAt`
  - [ ] Add `advanceQuestion` action:
    - [ ] Update `currentQuestion` with new question data
    - [ ] Increment `questionNumber`
    - [ ] Update `startedAt` with new server timestamp
    - [ ] Clear previous selections (if stored in store)
    - [ ] Reset `isPaused = false` and clear pause-related state
  - [ ] Handle `question_advance` event payload

- [ ] Update realtime subscription handlers in `lib/supabase/realtime.ts`
  - [ ] Ensure `question_advance` event is properly handled
  - [ ] Add handlers for `game_pause` and `game_resume` events
  - [ ] Update `subscribeToGameChannel` to accept `onGamePause` and `onGameResume` callbacks
  - [ ] Update PostgreSQL change tracking for `current_question_index` changes (if needed)

- [ ] Update host component (`components/game/question-display-projector.tsx`)
  - [ ] Listen for `question_advance` event
  - [ ] Update game store when event received
  - [ ] Smooth transition: Fade out old question, fade in new question (300ms)
  - [ ] Reset timer with new `startedAt` timestamp
  - [ ] Replace settings dropdown menu with two large, prominent buttons:
    - [ ] Pause/Play button (toggles based on `isPaused` state)
    - [ ] Skip to Next Question button
  - [ ] Implement pause functionality:
    - [ ] Broadcast `game_pause` event when pause clicked
    - [ ] Update local `isPaused` state
    - [ ] Display freezing overlay with animation
  - [ ] Implement resume functionality:
    - [ ] Broadcast `game_resume` event when play clicked
    - [ ] Update local `isPaused` state
    - [ ] Remove freezing overlay
    - [ ] Adjust `startedAt` timestamp to account for pause duration
  - [ ] Implement skip functionality:
    - [ ] Call `advanceQuestionAndBroadcast` function
    - [ ] If paused, automatically resume before skipping
    - [ ] Show loading state during skip operation

- [ ] Update player component (`components/game/question-display-player.tsx`)
  - [ ] Listen for `question_advance` event
  - [ ] Update game store when event received
  - [ ] Reset answer selections (`selectedAnswer`, `lockedAnswer`, `submissionStatus`)
  - [ ] Smooth transition: Fade out old question, fade in new question (300ms)
  - [ ] Reset timer with new `startedAt` timestamp
  - [ ] Listen for `game_pause` event:
    - [ ] Update game store `isPaused` state
    - [ ] Display freezing overlay with animation
    - [ ] Disable answer submission interactions
  - [ ] Listen for `game_resume` event:
    - [ ] Update game store `isPaused` state
    - [ ] Remove freezing overlay
    - [ ] Re-enable answer submission interactions
    - [ ] Adjust timer to account for pause duration
- [ ] Update timer component (`components/game/circular-timer.tsx`)
  - [ ] Add `isPaused` prop (boolean)
  - [ ] When `isPaused = true`: Stop timer countdown, freeze at current remaining time
  - [ ] When `isPaused = false`: Resume countdown from frozen time
  - [ ] Add `pausedAt` prop (ISO timestamp | null) to track pause start time
  - [ ] Adjust calculation to account for pause duration when resuming
  - [ ] Add visual indicator when paused (e.g., subtle animation or overlay)

- [ ] Add error handling
  - [ ] Handle case where next question doesn't exist (end game early)
  - [ ] Handle case where game is not active
  - [ ] Handle network errors during advancement

- [ ] Testing
  - [ ] Test advancement through multiple questions
  - [ ] Test all devices receive `question_advance` event simultaneously
  - [ ] Test smooth transitions between questions
  - [ ] Test game ends when `current_question_index >= question_count`
  - [ ] Test error handling (game not found, question not found, network errors)
  - [ ] Test pause functionality:
    - [ ] Host clicks pause → all devices pause simultaneously
    - [ ] Timer freezes at correct remaining time
    - [ ] Freezing animation displays on all devices
    - [ ] Answer submissions are disabled on player devices
  - [ ] Test resume functionality:
    - [ ] Host clicks play → all devices resume simultaneously
    - [ ] Timer resumes from frozen time (not reset)
    - [ ] Freezing animation is removed
    - [ ] Answer submissions are re-enabled
  - [ ] Test skip functionality:
    - [ ] Skip from active game → advances immediately
    - [ ] Skip from paused game → resumes and advances
    - [ ] Skip synchronizes across all devices
    - [ ] Timer resets to 15 seconds for new question
  - [ ] Test pause/resume timing accuracy:
    - [ ] Pause for 10 seconds → resume → timer should continue from where it paused
    - [ ] Multiple pause/resume cycles work correctly

## Technical Notes

- Server Action location: `lib/actions/games.ts`
- Event types: `question_advance`, `game_pause`, `game_resume` (defined in `lib/types/realtime.ts`)
- Advancement latency: <500ms (NFR1, FR13)
- Pause/resume latency: <500ms (synchronized across all devices)
- Question pre-loading: Fetch next question data during current question phase (future enhancement)
- Edge cases: Host disconnect pauses game (no auto-recovery in MVP), player disconnect records NULL answer
- Trigger: Called by Story 3.4 (Leaderboard) after countdown completes, not on timer expiration
- Game end: When `current_question_index >= question_count`, game ends and broadcasts `game_end` event
- Pause state: Stored in game store (`isPaused`), synchronized via Realtime events (not persisted to database)
- Timer pause: Timer component receives `isPaused` prop and freezes countdown, resumes from frozen time when `isPaused = false`
- Skip behavior: Works from both active and paused states; if paused, automatically resumes before advancing
- UI: Two large, prominent buttons replace settings dropdown menu (better UX for projector view)

## Prerequisites

- Stories 2.1, 2.3, 2.4, 2.5, 2.6 (completed)
- Story 3.4 (Leaderboard) will call this Server Action

## Dependencies

- Epic 2: Real-Time Game Engine & Player Experience
- Architecture: Real-Time Game State Synchronization
- Story 3.4: Live Leaderboard - Projector Display (triggers advancement)
- Story 3.6: Game Completion - Final Results (handles game end)

## Notes

- This story implements the question advancement mechanism
- The actual trigger (when to advance) comes from Story 3.4 after leaderboard countdown
- For now, we can test by manually calling `advanceQuestion()` (Story 3.4 will implement the automatic trigger)
- Advancement is synchronized across all devices via Realtime `question_advance` broadcast
- Question data is fetched server-side and broadcast to all clients for consistency
- Smooth transitions prevent jarring jumps between questions
- Game end is handled when all questions are complete

---

