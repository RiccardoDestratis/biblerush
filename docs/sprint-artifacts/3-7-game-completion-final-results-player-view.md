# Story 3.7: Game Completion & Final Results - Player View

Status: backlog

## Story

As a player,
I want to see my final rank and performance statistics at game end,
So that I know how I performed and feel motivated to play again.

## Acceptance Criteria

**Given** the game has ended
**When** final results are displayed
**Then** player view shows:

**Final rank with celebratory message:**
- "You finished in [X] place!" (32px font)
- Mini confetti if top 3 (smaller particles, 2 seconds)

**Final score with accuracy:**
- "Final Score: [X] points" (28px, bold)
- "Accuracy: [X]/[N] correct - [Y]%" (e.g., "12/15 correct - 80%")
- Average response time: "[X] seconds average" (18px)

**Top 3 players shown:**
- Podium visual with names and scores
- Player's own row highlighted if in top 3

**Encouraging message based on performance:**
- Top 3: "Outstanding! You're a Bible quiz champion!" (green)
- Top 50%: "Great job! You know your Bible well!" (teal)
- Lower 50%: "Keep studying! You'll do better next time!" (coral)

**And** "Play Again" button (large, full width, 60px height):
- Redirects to `/join` to join another game

**And** visual styling: Mobile-optimized, celebratory but not overwhelming
**And** smooth transition: Fade from last leaderboard to final results (300ms)

## Tasks / Subtasks

- [ ] Create `FinalResultsPlayer` component in `components/game/final-results-player.tsx`
  - [ ] Mobile-optimized layout (375px minimum, responsive)
  - [ ] Final rank section (top, prominent):
    - [ ] "You finished in [X] place!" heading (32px, centered, bold)
    - [ ] Mini confetti if top 3 (smaller particles, 2 seconds)
  - [ ] Final score section:
    - [ ] "Final Score: [X] points" (28px, bold)
    - [ ] "Accuracy: [X]/[N] correct - [Y]%" (18px)
    - [ ] Average response time: "[X] seconds average" (18px)
  - [ ] Top 3 players section:
    - [ ] Podium visual with medal icons (🥇🥈🥉)
    - [ ] Player names and scores (24px, bold)
    - [ ] Highlight player's own row if in top 3 (purple background)
  - [ ] Encouraging message:
    - [ ] Based on rank (top 3, top 50%, lower 50%)
    - [ ] Colored text (green, teal, coral)
  - [ ] "Play Again" button (large, full width, 60px height, primary)
  - [ ] Fade-in animation (300ms) using Framer Motion
  - [ ] High contrast styling for mobile visibility
  - [ ] Responsive: Works on mobile devices (375px+ width)

- [ ] Create Server Action `getPlayerFinalResults` in `lib/actions/games.ts`
  - [ ] Function signature: `getPlayerFinalResults(gameId: string, playerId: string)`
  - [ ] Return type: `Promise<{ success: true; playerRank: number; playerScore: number; accuracy: { correct: number; total: number; percentage: number }; averageResponseTime: number; top3Players: RankedPlayer[]; totalPlayers: number } | { success: false; error: string }>`
  - [ ] Fetch player's final rank from leaderboard
  - [ ] Calculate accuracy: Count correct answers / total questions answered
  - [ ] Calculate average response time: Sum of all response times / number of answers
  - [ ] Fetch top 3 players
  - [ ] Return all data needed for display
  - [ ] Handle errors gracefully

- [ ] Update `PlayerGameView` component in `components/game/player-game-view.tsx`
  - [ ] When `game_end` event received, transition to final results:
    - [ ] Update `feedbackState` to 'final-results'
    - [ ] Render `FinalResultsPlayer` component
    - [ ] Fetch final results data using `getPlayerFinalResults` Server Action
  - [ ] Remove TODO comment on line 103
  - [ ] Add 'final-results' to `FeedbackState` type

- [ ] Accuracy calculation
  - [ ] Count correct answers from `player_answers` table (WHERE `is_correct = true`)
  - [ ] Count total questions answered (WHERE `selected_answer IS NOT NULL`)
  - [ ] Calculate percentage: (correct / total) * 100
  - [ ] Format: "[X]/[N] correct - [Y]%"

- [ ] Average response time calculation
  - [ ] Sum all `response_time_ms` from `player_answers` table
  - [ ] Divide by number of answers
  - [ ] Convert to seconds: `response_time_ms / 1000`
  - [ ] Format: "[X] seconds average" (1 decimal place)

- [ ] Encouraging messages logic
  - [ ] Top 3: "Outstanding! You're a Bible quiz champion!" (green #22C55E)
  - [ ] Top 50%: "Great job! You know your Bible well!" (teal #14B8A6)
  - [ ] Lower 50%: "Keep studying! You'll do better next time!" (coral #F97316)
  - [ ] Calculate based on total player count and current rank

- [ ] Mini confetti animation (if top 3)
  - [ ] Use Framer Motion particles or `react-confetti` library
  - [ ] Smaller particle count for mobile performance
  - [ ] 2-second duration
  - [ ] Smooth motion (no flashing per accessibility)

- [ ] Styling and animations
  - [ ] Use Framer Motion for all animations
  - [ ] Purple background for player's row if in top 3: #8B5CF6 (Tailwind `purple-500`)
  - [ ] Medal icons: 48px size for podium positions
  - [ ] Smooth transitions: 300ms fade-in/fade-out

- [ ] Error handling
  - [ ] Handle final results data fetch failures
  - [ ] Handle player not found in leaderboard
  - [ ] Show appropriate error states

- [ ] Testing
  - [ ] Test final results displays after game end
  - [ ] Test final rank display
  - [ ] Test accuracy calculation
  - [ ] Test average response time calculation
  - [ ] Test top 3 podium display
  - [ ] Test encouraging messages based on rank
  - [ ] Test mini confetti for top 3
  - [ ] Test "Play Again" button navigation
  - [ ] Test on mobile devices (375px width)

## Technical Notes

- Component location: `components/game/final-results-player.tsx`
- Server Action location: `lib/actions/games.ts` (`getPlayerFinalResults`)
- Event type: `game_end` (from Story 2.7)
- Display duration: Permanent (until player clicks "Play Again")
- Transition animation: 300ms fade-in (Framer Motion)
- Mini confetti: 2 seconds duration, smaller particle count for mobile performance
- Accuracy calculation: Count correct answers / total questions answered
- Average response time: Sum of all response times / number of answers
- Visual design: Follows UX Design "Final Results (Phone)" specifications
- Accessibility: WCAG AA contrast ratios, screen reader support

## Prerequisites

- Stories 2.5, 2.7, 3.1, 3.5 (completed)
- Story 2.5: Player game view component exists
- Story 2.7: Question advancement broadcasts `game_end` event when game completes
- Story 3.1: Scoring calculation engine updates `player_answers.is_correct` and `player_answers.response_time_ms`
- Story 3.5: Personal leaderboard provides `getLeaderboard` Server Action (can reuse for top 3)

## Dependencies

- Epic 3: Scoring, Leaderboards & Game Completion
- Architecture: Real-Time Game State Synchronization
- Story 2.7: Question Advancement & Synchronization (broadcasts `game_end` event)
- Story 3.1: Scoring Calculation Engine (provides accuracy and response time data)
- Story 3.5: Personal Leaderboard - Player View (provides leaderboard data structure)

## Notes

- This story implements the final results screen for players on mobile
- Final rank and score provide closure and motivation
- Accuracy calculation shows player's performance (correct/total percentage)
- Average response time shows player's speed across all questions
- Top 3 podium display creates excitement for top performers
- Encouraging messages motivate players based on their performance
- Mini confetti for top 3 adds celebratory feel (2 seconds, smaller particles for mobile)
- "Play Again" button allows players to join another game
- Smooth transition from leaderboard to final results (300ms fade)

## Enhancements (Future)

- Sound effects for top 3 celebration (optional, accessibility consideration)
- Social sharing of achievements (optional, Epic 6)
- Export personal stats (optional, Epic 6)
- Achievement badges (optional, Epic 6)

---


