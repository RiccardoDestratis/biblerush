# Story 3.1: Scoring Calculation Engine

Status: ready-for-dev

## Story

As a developer,
I want a reliable scoring calculation function that computes points based on correctness and speed,
So that players are scored fairly and consistently across all games.

## Acceptance Criteria

**Given** a question has ended (timer expired or all players answered)
**When** scoring is calculated
**Then** scoring utility in `lib/game/scoring.ts`:
- Function `calculateScore(isCorrect: boolean, responseTimeMs: number): number`
- Logic:
  - If `isCorrect === false`: return 0
  - If `isCorrect === true`: return 10 + speedBonus
  - Speed bonus:
    - 0-3000ms (0-3 seconds): +5 points → Total 15
    - 3001-5000ms (3-5 seconds): +3 points → Total 13
    - 5001-15000ms (5-15 seconds): +0 points → Total 10

**And** Server Action `processQuestionScores(gameId, questionId)` is created in `lib/actions/answers.ts`:
- Called automatically after question timer expires (triggered by Story 2.7 advancement logic or Story 3.2 answer reveal)
- Fetches all `player_answers` for this `game_id` and `question_id`
- Fetches correct answer from `questions` table (using `correct_answer` column)
- For each answer:
  - Calculates `is_correct` (compare `selected_answer` to `correct_answer`)
  - Calculates `points_earned` using `calculateScore()` function
  - Updates `player_answers` row with `is_correct` and `points_earned`
  - Updates `game_players.total_score` (cumulative sum: `total_score += points_earned`)
- Handles NULL `selected_answer` (no answer submitted) → `is_correct = false`, `points_earned = 0`

**And** tie-breaking rule implemented:
- Helper function `calculateRankings(players)` in `lib/game/scoring.ts`
- If two players have same `total_score`, rank by lower cumulative `response_time_ms` (sum across all questions)
- Returns sorted array with rank numbers (1, 2, 3, etc.)
- Used by leaderboard components (Stories 3.4, 3.5)

**And** unit tests for scoring function (Vitest):
- Test file: `lib/game/scoring.test.ts`
- Test cases:
  - Correct answer, 2s response (2000ms) → 15 points
  - Correct answer, 4s response (4000ms) → 13 points
  - Correct answer, 10s response (10000ms) → 10 points
  - Correct answer, 0s response (0ms) → 15 points (edge case)
  - Correct answer, 3s response (3000ms) → 15 points (boundary)
  - Correct answer, 3.001s response (3001ms) → 13 points (boundary)
  - Correct answer, 5s response (5000ms) → 13 points (boundary)
  - Correct answer, 5.001s response (5001ms) → 10 points (boundary)
  - Incorrect answer, any time → 0 points
  - No answer (NULL `selected_answer`) → 0 points
- 80%+ coverage target

**And** error handling:
- If scoring fails for any player (database error, invalid data), logs error but continues processing others
- Returns partial success if some players processed successfully
- Error logging: Use `console.error` with player ID and error details

**And** performance:
- Process 20 players' scores in <500ms
- Use batch database updates where possible
- Optimize database queries (fetch all answers in one query, update in batch)

**And** after processing, broadcasts `scores_updated` event via Realtime:
- Event type: `scores_updated`
- Payload: `{ gameId: string, questionId: string }`
- Broadcast to game channel: `game:${gameId}`
- Used by leaderboard components to refresh scores (Stories 3.4, 3.5)

**And** response time display preparation:
- Store `response_time_ms` in `player_answers` table (already exists from Story 2.6)
- Format helper function: `formatResponseTime(responseTimeMs: number): string`
  - Returns: "2.3s", "12.5s", etc. (formatted to 1 decimal place)
  - Used by leaderboard components (Stories 3.4, 3.5) to display response time

**And** speed bonus notification data:
- Store speed bonus amount in scoring result (for notification display in Story 3.3)
- Helper function: `getSpeedBonus(responseTimeMs: number): number`
  - Returns: 5, 3, or 0 (speed bonus points earned)
  - Used to show "Speed bonus! +5 pts" notification after answer reveal (Story 3.3)

## Tasks / Subtasks

- [ ] Create scoring utility `lib/game/scoring.ts`
  - [ ] Function `calculateScore(isCorrect: boolean, responseTimeMs: number): number`
  - [ ] Function `getSpeedBonus(responseTimeMs: number): number` (returns 5, 3, or 0)
  - [ ] Function `formatResponseTime(responseTimeMs: number): string` (returns "2.3s" format)
  - [ ] Function `calculateRankings(players: PlayerScore[]): RankedPlayer[]`
    - [ ] Sort by `total_score` (descending)
    - [ ] Tie-breaking: Same score → sort by cumulative `response_time_ms` (ascending)
    - [ ] Assign rank numbers (1, 2, 3, etc.)
    - [ ] Handle ties (same score and time → same rank)

- [ ] Create Server Action `processQuestionScores` in `lib/actions/answers.ts`
  - [ ] Function signature: `processQuestionScores(gameId: string, questionId: string)`
  - [ ] Return type: `Promise<{ success: true; processedCount: number } | { success: false; error: string }>`
  - [ ] Validate inputs: Check gameId and questionId are valid UUIDs
  - [ ] Fetch all `player_answers` for this `game_id` and `question_id`
  - [ ] Fetch correct answer from `questions` table
  - [ ] For each answer:
    - [ ] Calculate `is_correct` (compare `selected_answer` to `correct_answer`)
    - [ ] Calculate `points_earned` using `calculateScore()` function
    - [ ] Update `player_answers` row: `is_correct`, `points_earned`
    - [ ] Update `game_players.total_score` (cumulative: `total_score += points_earned`)
  - [ ] Handle errors gracefully (continue processing other players)
  - [ ] Broadcast `scores_updated` event after processing
  - [ ] Return success with processed count

- [ ] Update Realtime types in `lib/types/realtime.ts`
  - [ ] Add `scores_updated` to `RealtimeEvent` type
  - [ ] Add `ScoresUpdatedPayload` interface: `{ gameId: string, questionId: string }`
  - [ ] Update `RealtimeEventPayload` union type
  - [ ] Update `GameChannelCallbacks` interface to include `onScoresUpdated` handler

- [ ] Create unit tests `lib/game/scoring.test.ts`
  - [ ] Test `calculateScore()` with all speed bonus tiers
  - [ ] Test boundary cases (exactly 3s, 5s, etc.)
  - [ ] Test incorrect answers
  - [ ] Test `getSpeedBonus()` function
  - [ ] Test `formatResponseTime()` function
  - [ ] Test `calculateRankings()` with ties
  - [ ] Achieve 80%+ coverage

- [ ] Update `lib/supabase/realtime.ts`
  - [ ] Add `onScoresUpdated` callback to `GameChannelCallbacks`
  - [ ] Handle `scores_updated` event in `subscribeToGameChannel`

- [ ] Integration with question advancement (Story 2.7)
  - [ ] Call `processQuestionScores()` after question timer expires
  - [ ] Trigger from `advanceQuestion()` or separate hook
  - [ ] Ensure scores are calculated before answer reveal (Story 3.2)

- [ ] Testing
  - [ ] Test scoring calculation with various response times
  - [ ] Test batch processing of 20 players
  - [ ] Test error handling (invalid data, database errors)
  - [ ] Test tie-breaking logic
  - [ ] Test performance (<500ms for 20 players)
  - [ ] Test `scores_updated` event broadcast
  - [ ] Test integration with question advancement

## Technical Notes

- Scoring logic matches FR10 exactly
- Server Action location: `lib/actions/answers.ts`
- Scoring utility location: `lib/game/scoring.ts`
- Unit tests: Vitest (80%+ coverage target)
- Tie-breaking: Faster total time wins (Architecture "Scoring System")
- Response time format: Display as "2.3s" (1 decimal place) on leaderboards
- Speed bonus notification: Show after answer reveal (Story 3.3), not on lock
- Performance: Batch database updates, optimize queries
- Event broadcast: `scores_updated` triggers leaderboard refresh (Stories 3.4, 3.5)

## Prerequisites

- Stories 2.1, 2.6, 2.7 (completed)
- Database schema: `player_answers` table with `response_time_ms`, `selected_answer`, `is_correct`, `points_earned` columns
- Database schema: `game_players` table with `total_score` column
- Database schema: `questions` table with `correct_answer` column

## Dependencies

- Epic 3: Scoring, Leaderboards & Game Completion
- Architecture: Scoring System
- Story 3.2: Answer Reveal on Projector (uses scoring results)
- Story 3.3: Player Answer Feedback (shows speed bonus notification)
- Story 3.4: Live Leaderboard - Projector Display (uses rankings)
- Story 3.5: Personal Leaderboard - Player View (uses rankings)

## Notes

- This story implements the core scoring calculation engine
- Scoring happens automatically after each question ends
- Speed bonus is calculated based on response time (0-5 seconds for bonus)
- Response time is displayed on leaderboards (formatted as "2.3s")
- Speed bonus notification appears after answer reveal (Story 3.3), not immediately on lock
- Tie-breaking ensures fair rankings when scores are equal
- Performance is critical: Must process 20 players quickly for smooth gameplay

## Enhancements (Future)

- Speed bonus notification after answer reveal (Story 3.3)
- Response time display on leaderboard (Stories 3.4, 3.5)
- Game rules/instructions in waiting room (clarify tap-to-lock mechanic)

---

