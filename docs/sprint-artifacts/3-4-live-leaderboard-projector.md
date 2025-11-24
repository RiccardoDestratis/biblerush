# Story 3.4: Live Leaderboard - Projector Display

Status: ready-for-dev

## Story

As a host user,
I want a live leaderboard displayed on the projector after each question,
So that the competitive element engages all participants and creates excitement.

## Acceptance Criteria

**Given** answer reveal has completed (5 seconds, Story 3.2)
**When** leaderboard display is triggered (after `leaderboard_ready` broadcast from Story 3.2)
**Then** projector transitions to leaderboard display:
- Display for 10 seconds before advancing to next question
- Layout (full-screen, 1920x1080 projector-optimized):
  - Large "Leaderboard" heading (64px, centered top, bold, gradient text)
  - Subtitle: "After Question [X] of [Total]" (24px, gray-600, top-right)
  - Player count: "[X] players" (24px, gray-600, top-left)
  - Top 10 players displayed in ranked order (sorted by `total_score` DESC, ties broken by cumulative response time ASC)
  - Each leaderboard row:
    - Rank number (1, 2, 3... or 🥇🥈🥉 for podium positions 1-3)
    - Player name (40px font, bold)
    - Total score (48px font, bold, animated count-up)
    - Rank change indicator (↑ moved up, ↓ moved down, — stayed same, → new player)
  - Podium styling for top 3:
    - 1st place: Gold background gradient (#FFD700 to #FFA500), crown icon (👑), larger row
    - 2nd place: Silver background (#C0C0C0), medal icon (🥈), medium row
    - 3rd place: Bronze background (#CD7F32), medal icon (🥉), smaller row
  - Remaining 7 players (4-10): White/light gray rows with subtle borders
  - If >10 players, show "...and [X] more players" at bottom (18px, gray-600, centered)
  - Bottom countdown: "Next question in [X]..." (20px, gray-500, bottom-center)

**And** rank change calculation:
- Compare player's rank after this question vs. previous question
- Store previous rank in game store or component state
- Calculate rank change: `previousRank - currentRank` (positive = moved up, negative = moved down, 0 = same)
- Display arrow indicator:
  - ↑ Green arrow if moved up (better rank)
  - ↓ Red arrow if moved down (worse rank)
  - — Gray dash if stayed same
  - → Blue arrow if new player (first question)

**And** score animation: Scores count up from previous total to new total (1 second animation)
- Use Framer Motion for smooth count-up animation
- Display score during animation (e.g., 42 → 57 over 1 second)
- Start animation when leaderboard appears

**And** ranking animation: Players slide into position (Framer Motion, staggered 100ms delay per row)
- New positions animated with slide-in from right/left
- Staggered delay: 1st row at 0ms, 2nd row at 100ms, 3rd row at 200ms, etc.
- Smooth transition makes leaderboard visually engaging

**And** visual design: Use secondary colors (coral, teal) for vibrancy, bold typography
- Background: Gradient (blue-50 via indigo-50 to purple-50, matches question display)
- Text: High contrast, readable from projector distance (minimum 32px font)
- Icons: Large enough to see from 20+ feet away (64px minimum)

**And** current question number displayed: "After Question 5 of 15" (top-right, 24px)
- Uses `questionNumber` and `totalQuestions` from game store

**And** total player count: "[X] players" (top-left, 24px)
- Fetched from `game_players` table (COUNT WHERE game_id)

**And** leaderboard data fetched via Server Action after `processQuestionScores()` completes (Story 3.1):
- Server Action: `getLeaderboard(gameId: string)` in `lib/actions/games.ts`
- Query `game_players` WHERE `game_id` = gameId
- Calculate cumulative response time for each player (SUM of `player_answers.response_time_ms`)
- Sort by `total_score` DESC, then by cumulative response time ASC (using `calculateRankings` from Story 3.1)
- Return top 10 players + total player count
- Return previous rank for rank change calculation (requires storing previous rank in database or memory)

**And** previous rank storage:
- Store previous rank after each question in game store or database
- Option 1: Add `previous_rank` column to `game_players` table (updated after each question)
- Option 2: Store previous rank in game store state (in-memory, resets on refresh)
- For MVP, use in-memory storage in game store (simpler)

**And** broadcast `leaderboard_ready` event after 10 seconds to sync transition:
- Event payload: `{ gameId: string, questionId: string }`
- Broadcasts to game channel for synchronization
- Players listen and transition to personal leaderboard (Story 3.5)

**And** after 10 seconds, automatically advance to next question:
- Broadcast `question_advance` event (Story 2.7) or call `advanceQuestionAndBroadcast()`
- If last question, broadcast `game_end` event instead
- Update `revealState` in game store to 'question' for next question

**And** error handling:
- If leaderboard data fetch fails, show error state: "Unable to load leaderboard. Please try again."
- If no players found, show empty state: "No players in game"
- If Realtime broadcast fails, continue with local state (other devices may not sync perfectly)

**And** accessibility:
- High contrast ratios meet WCAG AA standards
- Text readable from projector distance (minimum 32px font)
- Screen reader announces: "Leaderboard: [Player name] is in [rank] place with [score] points"

## Tasks / Subtasks

- [ ] Create Server Action `getLeaderboard` in `lib/actions/games.ts`
  - [ ] Function signature: `getLeaderboard(gameId: string)`
  - [ ] Return type: `Promise<{ success: true; players: RankedPlayer[]; totalCount: number } | { success: false; error: string }>`
  - [ ] Fetch all `game_players` for this `game_id`
  - [ ] For each player, calculate cumulative `response_time_ms` (SUM of `player_answers.response_time_ms` for all questions)
  - [ ] Use `calculateRankings()` from `lib/game/scoring.ts` to sort and assign ranks
  - [ ] Return top 10 players + total player count
  - [ ] Include `playerId`, `playerName`, `totalScore`, `cumulativeResponseTimeMs`, `rank`
  - [ ] Handle errors gracefully

- [ ] Create `LeaderboardProjector` component in `components/game/leaderboard-projector.tsx`
  - [ ] Full-screen layout (1920x1080, matches Story 2.4 projector layout)
  - [ ] Display "Leaderboard" heading (64px, centered top)
  - [ ] Display "After Question [X] of [Total]" subtitle (24px, top-right)
  - [ ] Display "[X] players" count (24px, top-left)
  - [ ] Display top 10 players in ranked order:
    - [ ] Podium styling for top 3 (gold, silver, bronze backgrounds)
    - [ ] Regular rows for 4-10 (white/light gray)
    - [ ] Rank number with icons (🥇🥈🥉 for podium)
    - [ ] Player name (40px, bold)
    - [ ] Total score (48px, bold, animated count-up)
    - [ ] Rank change indicator (↑↓—→)
  - [ ] Display "...and [X] more players" if >10 players (18px, bottom)
  - [ ] Display countdown: "Next question in [X]..." (20px, bottom-center)
  - [ ] Score count-up animation (1 second) using Framer Motion
  - [ ] Ranking slide-in animation (staggered 100ms delay) using Framer Motion
  - [ ] High contrast styling for projector visibility
  - [ ] Responsive fallback for smaller screens

- [ ] Update game store (`lib/store/game-store.ts`)
  - [ ] Add `previousRanks` state: `Record<string, number>` (maps playerId to previous rank)
  - [ ] Add `setPreviousRanks` action: Updates previous ranks after leaderboard display
  - [ ] Store previous ranks after each question for rank change calculation
  - [ ] Update `revealState` to 'leaderboard' when leaderboard displays

- [ ] Update `QuestionDisplayProjector` component (`components/game/question-display-projector.tsx`)
  - [ ] When `revealState === 'leaderboard'`, render `LeaderboardProjector` instead
  - [ ] Listen for `leaderboard_ready` event (already listening from Story 3.2)
  - [ ] After 10 seconds, advance to next question:
    - [ ] Call `advanceQuestionAndBroadcast()` from `lib/utils/question-advancement.ts`
    - [ ] If last question, broadcast `game_end` event
    - [ ] Update `revealState` to 'question' for next question

- [ ] Update Realtime subscription (already done in Story 3.2)
  - [ ] Verify `onLeaderboardReady` callback handling exists
  - [ ] Leaderboard component listens for `leaderboard_ready` event for synchronization

- [ ] Rank change calculation
  - [ ] Store previous ranks in game store after each question
  - [ ] Compare current rank to previous rank for each player
  - [ ] Calculate rank change: `previousRank - currentRank`
  - [ ] Display arrow indicator (↑↓—→) based on rank change
  - [ ] Handle new players (first question) with → indicator

- [ ] Score animation (Framer Motion)
  - [ ] Use `useMotionValue` and `useTransform` for count-up animation
  - [ ] Animate from previous score to new score over 1 second
  - [ ] Display score during animation with smooth transitions

- [ ] Ranking animation (Framer Motion)
  - [ ] Slide-in animation for each player row
  - [ ] Staggered delay: 0ms, 100ms, 200ms, etc.
  - [ ] Smooth transition makes leaderboard visually engaging

- [ ] Styling and animations
  - [ ] Use Framer Motion for all animations
  - [ ] Podium colors: Gold (#FFD700), Silver (#C0C0C0), Bronze (#CD7F32)
  - [ ] Arrow colors: Green (↑), Red (↓), Gray (—), Blue (→)
  - [ ] High contrast text: Black on light backgrounds
  - [ ] Gradient backgrounds for podium positions

- [ ] Error handling
  - [ ] Handle leaderboard data fetch failures
  - [ ] Handle empty leaderboard (no players)
  - [ ] Handle Realtime broadcast failures
  - [ ] Show appropriate error states

- [ ] Integration testing
  - [ ] Test leaderboard displays after answer reveal
  - [ ] Test score count-up animation
  - [ ] Test ranking slide-in animation
  - [ ] Test rank change indicators (↑↓—→)
  - [ ] Test podium styling for top 3
  - [ ] Test "and X more" display for >10 players
  - [ ] Test 10-second countdown and automatic question advancement
  - [ ] Test last question → game_end event
  - [ ] Test synchronization across devices

## Technical Notes

- Component location: `components/game/leaderboard-projector.tsx`
- Server Action location: `lib/actions/games.ts` (`getLeaderboard`)
- Scoring utility: `calculateRankings()` from `lib/game/scoring.ts` (Story 3.1)
- Event type: `leaderboard_ready` (from Story 3.2)
- Display duration: 10 seconds (before advancing to next question)
- Transition animation: 300ms fade-in (Framer Motion)
- Score animation: 1 second count-up (Framer Motion)
- Ranking animation: Staggered slide-in (100ms delay per row, Framer Motion)
- Synchronization: Realtime `leaderboard_ready` broadcast ensures all devices see leaderboard simultaneously
- Integration: Triggered after `leaderboard_ready` event from Story 3.2 (after 5-second reveal)
- Next step: After 10 seconds, advances to next question (Story 2.7) or ends game
- Previous rank: Stored in game store state for rank change calculation
- Visual design: Follows UX Design "Leaderboard (Projector)" specifications
- Accessibility: WCAG AA contrast ratios, large text, readable from projector distance

## Prerequisites

- Stories 2.4, 2.7, 3.1, 3.2 (completed)
- Story 2.4: Question display projector view component exists
- Story 2.7: Question advancement mechanism exists
- Story 3.1: Scoring calculation engine completes and updates `game_players.total_score`
- Story 3.2: Answer reveal broadcasts `leaderboard_ready` event after 5 seconds

## Dependencies

- Epic 3: Scoring, Leaderboards & Game Completion
- Architecture: Real-Time Game State Synchronization
- Story 3.1: Scoring Calculation Engine (provides `calculateRankings()` function)
- Story 3.2: Answer Reveal on Projector (broadcasts `leaderboard_ready` event)
- Story 3.5: Personal Leaderboard - Player View (listens to same `leaderboard_ready` event)

## Notes

- This story implements the leaderboard display after each question
- Leaderboard shows top 10 players ranked by score and response time
- Podium styling for top 3 creates excitement and visual interest
- Rank change indicators show player progress (moved up/down/stayed same)
- Score animations make leaderboard updates visually engaging
- 10-second display duration allows players to see rankings before next question
- After 10 seconds, automatically advances to next question or ends game
- Synchronization ensures all devices see leaderboard at the same time

## Enhancements (Future)

- Sound effects for rank changes (optional, accessibility consideration)
- Animated confetti for top 3 players (optional)
- Social sharing of leaderboard (optional, Epic 6)
- Export leaderboard data (optional, Epic 6)

---


