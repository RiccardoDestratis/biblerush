# Story 2.7: Question Advancement & Synchronization

Status: in-progress

## Story

As a host user,
I want the game to automatically advance to the next question after the leaderboard phase completes,
So that gameplay flows smoothly through all questions without manual intervention.

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

- [ ] Update `QuestionAdvancePayload` type in `lib/types/realtime.ts` (if needed)
  - [ ] Ensure it matches the payload structure from Server Action
  - [ ] Include `questionNumber`, `timerDuration`, `startedAt`, `totalQuestions`

- [ ] Update game store in `lib/store/game-store.ts`
  - [ ] Add `advanceQuestion` action:
    - [ ] Update `currentQuestion` with new question data
    - [ ] Increment `questionNumber`
    - [ ] Update `startedAt` with new server timestamp
    - [ ] Clear previous selections (if stored in store)
  - [ ] Handle `question_advance` event payload

- [ ] Update realtime subscription handlers
  - [ ] Ensure `question_advance` event is properly handled in `lib/supabase/realtime.ts`
  - [ ] Update PostgreSQL change tracking for `current_question_index` changes (if needed)

- [ ] Update host component (`components/game/question-display-projector.tsx`)
  - [ ] Listen for `question_advance` event
  - [ ] Update game store when event received
  - [ ] Smooth transition: Fade out old question, fade in new question (300ms)
  - [ ] Reset timer with new `startedAt` timestamp

- [ ] Update player component (`components/game/question-display-player.tsx`)
  - [ ] Listen for `question_advance` event
  - [ ] Update game store when event received
  - [ ] Reset answer selections (`selectedAnswer`, `lockedAnswer`, `submissionStatus`)
  - [ ] Smooth transition: Fade out old question, fade in new question (300ms)
  - [ ] Reset timer with new `startedAt` timestamp

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

## Technical Notes

- Server Action location: `lib/actions/games.ts`
- Event type: `question_advance` (already defined in `lib/types/realtime.ts`)
- Advancement latency: <500ms (NFR1, FR13)
- Question pre-loading: Fetch next question data during current question phase (future enhancement)
- Edge cases: Host disconnect pauses game (no auto-recovery in MVP), player disconnect records NULL answer
- Trigger: Called by Story 3.4 (Leaderboard) after countdown completes, not on timer expiration
- Game end: When `current_question_index >= question_count`, game ends and broadcasts `game_end` event

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

