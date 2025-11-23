# Story 3.6: Game Completion & Final Results - Projector

Status: backlog

## Story

As a host user,
I want a final results screen celebrating the winner and showing all player rankings,
So that the game has a satisfying conclusion and recognizes top performers.

## Acceptance Criteria

**Given** the last question's leaderboard has completed
**When** game completion is triggered (by `game_end` broadcast)
**Then** host view transitions to final results:
- Game status updated to `completed` with `completed_at=NOW()` in DB

**Winner Celebration (3 seconds):**
- "Game Over!" heading (80px font)
- Winner's name in huge text (100px): "[Winner Name] Wins!" with trophy icon 🏆
- Confetti animation covering screen (Framer Motion particles in primary colors)
- Background: Gradient with purple/coral/teal

**Full Leaderboard (after confetti clears):**
- All players ranked (1 to N), scrollable if >15 players
- Podium section for top 3 with gold/silver/bronze styling
- Each row: Rank, Player Name, Final Score

**Game stats displayed:**
- Total questions: "[N] questions"
- Game duration: "Completed in [X] minutes"
- Average score: "[X] points per player"

**And** "Play Again" button (bottom-right, large):
- Redirects host to `/create` to start new game

**And** "Dashboard" button (bottom-left, secondary):
- Redirects to `/dashboard` to see past games

**And** visual styling: Celebratory, vibrant colors, high contrast for projector
**And** confetti animation: 3 seconds duration, smooth particles (no flashing, per accessibility)

## Tasks / Subtasks

- [ ] Create `FinalResultsProjector` component in `components/game/final-results-projector.tsx`
  - [ ] Full-screen layout (1920x1080, matches Story 2.4 projector layout)
  - [ ] Winner celebration phase (3 seconds):
    - [ ] "Game Over!" heading (80px, centered top)
    - [ ] Winner's name with trophy icon (100px, bold)
    - [ ] Confetti animation using Framer Motion particles
    - [ ] Gradient background (purple/coral/teal)
  - [ ] Full leaderboard phase (after confetti):
    - [ ] All players ranked (1 to N)
    - [ ] Podium section for top 3 (gold/silver/bronze)
    - [ ] Scrollable if >15 players
    - [ ] Each row: Rank, Player Name, Final Score
  - [ ] Game stats section:
    - [ ] Total questions count
    - [ ] Game duration (calculated from started_at to completed_at)
    - [ ] Average score per player
  - [ ] Navigation buttons:
    - [ ] "Play Again" button (bottom-right, large, primary)
    - [ ] "Dashboard" button (bottom-left, secondary)
  - [ ] High contrast styling for projector visibility
  - [ ] Responsive fallback for smaller screens

- [ ] Create Server Action `getFinalResults` in `lib/actions/games.ts`
  - [ ] Function signature: `getFinalResults(gameId: string)`
  - [ ] Return type: `Promise<{ success: true; winner: RankedPlayer; players: RankedPlayer[]; gameStats: GameStats } | { success: false; error: string }>`
  - [ ] Fetch all `game_players` for this `game_id`
  - [ ] Use `calculateRankings()` from `lib/game/scoring.ts` to sort and assign ranks
  - [ ] Return winner (rank 1), all players, and game stats
  - [ ] Calculate game stats:
    - [ ] Total questions from `games.question_count`
    - [ ] Game duration from `games.started_at` and `games.completed_at`
    - [ ] Average score: SUM of all scores / player count
  - [ ] Handle errors gracefully

- [ ] Update `QuestionDisplayProjector` component (`components/game/question-display-projector.tsx`)
  - [ ] When `game_end` event received, transition to final results:
    - [ ] Update game store status to 'ended'
    - [ ] Render `FinalResultsProjector` component
    - [ ] Fetch final results data using `getFinalResults` Server Action
  - [ ] Remove TODO comment on line 110

- [ ] Update game store (`lib/store/game-store.ts`)
  - [ ] Add `gameStatus: 'ended'` state handling
  - [ ] Add action to handle `game_end` event

- [ ] Confetti animation (Framer Motion)
  - [ ] Use `framer-motion` particles or `react-confetti` library
  - [ ] 3-second duration
  - [ ] Smooth motion (no flashing per accessibility)
  - [ ] Primary colors (purple, coral, teal)

- [ ] Styling and animations
  - [ ] Use Framer Motion for transitions
  - [ ] Podium colors: Gold (#FFD700), Silver (#C0C0C0), Bronze (#CD7F32)
  - [ ] High contrast text: Black on light backgrounds
  - [ ] Gradient backgrounds for celebratory feel

- [ ] Error handling
  - [ ] Handle final results data fetch failures
  - [ ] Handle empty leaderboard (no players)
  - [ ] Show appropriate error states

- [ ] Integration testing
  - [ ] Test final results displays after game end
  - [ ] Test winner celebration with confetti
  - [ ] Test full leaderboard display
  - [ ] Test game stats calculation
  - [ ] Test navigation buttons (Play Again, Dashboard)
  - [ ] Test on projector display (1920x1080)

## Technical Notes

- Component location: `components/game/final-results-projector.tsx`
- Server Action location: `lib/actions/games.ts` (`getFinalResults`)
- Scoring utility: `calculateRankings()` from `lib/game/scoring.ts` (Story 3.1)
- Event type: `game_end` (from Story 2.7)
- Winner celebration: 3 seconds duration (matches UX Design)
- Confetti animation: Framer Motion particles, smooth motion (no flashing per NFR accessibility)
- Game stats: Calculate from `games` table (started_at, completed_at, question_count)
- Visual design: Follows UX Design "Final Results (Projector)" specifications
- Accessibility: WCAG AA contrast ratios, large text, readable from projector distance

## Prerequisites

- Stories 2.7, 3.1, 3.4 (completed)
- Story 2.7: Question advancement broadcasts `game_end` event when game completes
- Story 3.1: Scoring calculation engine provides `calculateRankings()` function
- Story 3.4: Leaderboard projector provides `getLeaderboard` Server Action (can reuse for final results)

## Dependencies

- Epic 3: Scoring, Leaderboards & Game Completion
- Architecture: Real-Time Game State Synchronization
- Story 2.7: Question Advancement & Synchronization (broadcasts `game_end` event)
- Story 3.1: Scoring Calculation Engine (provides `calculateRankings()` function)

## Notes

- This story implements the final results screen for the host/projector view
- Winner celebration creates excitement and recognition for top performer
- Full leaderboard shows all players' final rankings
- Game stats provide context about the game session
- Navigation buttons allow host to start new game or view dashboard
- Confetti animation adds celebratory feel (3 seconds, smooth motion)
- After confetti clears, full leaderboard is displayed
- Game status is updated to 'completed' in database when final results are shown

## Enhancements (Future)

- Sound effects for winner celebration (optional, accessibility consideration)
- Social sharing of results (optional, Epic 6)
- Export results data (optional, Epic 6)
- Replay game highlights (optional, Epic 6)

---

