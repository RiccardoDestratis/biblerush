# Story 3.5: Personal Leaderboard - Player View

Status: ready-for-dev

## Story

As a player,
I want to see my current rank and score after each question on my phone,
So that I know how I'm performing compared to others.

## Acceptance Criteria

**Given** answer feedback has completed (5 seconds, Story 3.3)
**When** personal leaderboard is triggered (after `leaderboard_ready` broadcast from Story 3.4)
**Then** player view transitions to personal leaderboard:
- Display for 10 seconds (synced with projector leaderboard from Story 3.4)
- Layout (mobile-optimized, 375px minimum width):

**Personal Stats Section (top, prominent):**
- "You're in [X] place!" (32px font, centered, bold)
- Rank change indicator: "↑ Moved up 2 places!" or "↓ Moved down 1 place" or "— Stayed in 3rd" (20px, colored text)
- Total score: "[X] points" (28px, bold, animated count-up)
- Points earned this round: "+[X] points" (18px, green if gained, gray if 0)
- Encouraging message based on rank:
  - Top 3: "Great job! You're on the podium!" (green text, 18px)
  - Top 50%: "Keep it up! You're doing well!" (teal text, 18px)
  - Lower 50%: "You can do it! Stay focused!" (coral text, 18px)

**Top 3 Players (always shown):**
- Podium visual (🥇🥈🥉) with names and scores
- Each podium position:
  - Medal icon (🥇🥈🥉) - 48px size
  - Player name (24px font, bold)
  - Total score (28px font, bold)
- Player's own row highlighted if in top 3 (purple background #8B5CF6, white text)
- Other players: White/light gray backgrounds

**Context Leaderboard (if player not in top 3):**
- Player immediately above current player
- Current player (highlighted with purple background #8B5CF6, white text)
- Player immediately below current player
- Format: "4. Alice - 45 pts / 5. You - 42 pts / 6. Bob - 40 pts"
- Each row shows rank number, name, and score (20px font)
- Player's own row clearly distinguished with purple background

**And** encouraging messages based on rank:
- Top 3: "Great job! You're on the podium!" (green text #22C55E)
- Top 50%: "Keep it up! You're doing well!" (teal text #14B8A6)
- Lower 50%: "You can do it! Stay focused!" (coral text #F97316)

**And** visual styling: Player's row has distinct background (deep purple #8B5CF6), white text
- Purple background makes player's position clear
- High contrast: White text on purple background
- Other players: White/light gray backgrounds, dark text

**And** smooth transition: Fade from feedback to leaderboard (300ms) using Framer Motion
- Fade out feedback display
- Fade in leaderboard display

**And** leaderboard data fetched from Server Action (same data as projector from Story 3.4):
- Use same `getLeaderboard(gameId)` Server Action from Story 3.4
- Filter for player's position and context (top 3 + player's position)
- Calculate rank change: Compare current rank to previous rank
- Store previous rank in local component state

**And** listens to `leaderboard_ready` broadcast to sync transition (from Story 3.4):
- Listens for `leaderboard_ready` event via Realtime subscription
- Event payload: `{ gameId: string, questionId: string }`
- Updates leaderboard state when event received
- Synchronizes transition with projector leaderboard

**And** after 10 seconds, listens for `question_advance` or `game_end` event to proceed:
- After 10 seconds, transitions back to question display (Story 2.5) for next question
- If `game_end` event received, transitions to game results screen (Story 3.6)
- Smooth fade transition (300ms) back to question display

**And** accessibility:
- Screen reader announces: "You're in [rank] place with [score] points"
- High contrast: Purple background (#8B5CF6) with white text for player's row
- Clear visual distinction between player's row and other players

**And** error handling:
- If leaderboard data fetch fails, show error state: "Unable to load leaderboard. Please try again."
- If player not found in leaderboard, show error state: "Your rank could not be determined"
- If Realtime broadcast fails, continue with local state (may not sync perfectly)

## Tasks / Subtasks

- [ ] Create `PersonalLeaderboard` component in `components/game/personal-leaderboard.tsx`
  - [ ] Mobile-optimized layout (375px minimum, responsive)
  - [ ] Personal stats section (top, prominent):
    - [ ] "You're in [X] place!" heading (32px, centered, bold)
    - [ ] Rank change indicator (↑↓—→) with message (20px, colored text)
    - [ ] Total score display (28px, bold, animated count-up)
    - [ ] Points earned this round (18px, green if gained)
    - [ ] Encouraging message based on rank (18px, colored text)
  - [ ] Top 3 players section (always shown):
    - [ ] Podium visual with medal icons (🥇🥈🥉)
    - [ ] Player names and scores (24px, bold)
    - [ ] Highlight player's own row if in top 3 (purple background)
  - [ ] Context leaderboard (if player not in top 3):
    - [ ] Player above, current player (highlighted), player below
    - [ ] Format: "Rank. Name - Score pts"
    - [ ] Player's row highlighted with purple background
  - [ ] Countdown indicator: "Next question in [X]..." (16px, bottom-center)
  - [ ] Score count-up animation (1 second) using Framer Motion
  - [ ] Fade-in animation (300ms) using Framer Motion
  - [ ] High contrast styling for mobile visibility
  - [ ] Responsive: Works on mobile devices (375px+ width)

- [ ] Update `PlayerGameView` component in `components/game/player-game-view.tsx`
  - [ ] Update `feedbackState` to include 'leaderboard' state
  - [ ] Listen for `leaderboard_ready` event via Realtime subscription:
    - [ ] Update `feedbackState` to 'leaderboard' when event received
    - [ ] Fetch leaderboard data using `getLeaderboard(gameId)` Server Action
    - [ ] Filter for player's position and context (top 3 + player's position)
  - [ ] Listen for `question_advance` or `game_end` event:
    - [ ] After 10 seconds or when `question_advance` received, update `feedbackState` to 'question'
    - [ ] Transition back to question display (Story 2.5)
    - [ ] If `game_end` received, transition to game results (Story 3.6)
  - [ ] Conditional render based on `feedbackState`:
    - [ ] Show question display when `feedbackState === 'question'`
    - [ ] Show feedback when `feedbackState === 'feedback'`
    - [ ] Show personal leaderboard when `feedbackState === 'leaderboard'`
  - [ ] Fade transitions between states (300ms)

- [ ] Use Server Action `getLeaderboard` from Story 3.4
  - [ ] Same Server Action: `getLeaderboard(gameId)` in `lib/actions/games.ts`
  - [ ] Returns top 10 players + total player count
  - [ ] Filter for player's position and context in component
  - [ ] Calculate rank change: Compare current rank to previous rank

- [ ] Update game store (`lib/store/game-store.ts`) - if needed
  - [ ] Verify `leaderboard_ready` event handling exists (from Story 3.2)
  - [ ] Player view may use local component state instead of global store (check existing pattern)

- [ ] Update Realtime subscription (already done in Story 3.2)
  - [ ] Verify `onLeaderboardReady` callback handling exists
  - [ ] Verify `onQuestionAdvance` callback handling exists
  - [ ] Update `PlayerGameView` component to subscribe to game channel with these callbacks

- [ ] Rank change calculation
  - [ ] Store previous rank in local component state
  - [ ] Compare current rank to previous rank for player
  - [ ] Calculate rank change: `previousRank - currentRank`
  - [ ] Display rank change indicator (↑↓—→) based on rank change
  - [ ] Display encouraging message based on rank change

- [ ] Encouraging messages logic
  - [ ] Top 3: "Great job! You're on the podium!" (green #22C55E)
  - [ ] Top 50%: "Keep it up! You're doing well!" (teal #14B8A6)
  - [ ] Lower 50%: "You can do it! Stay focused!" (coral #F97316)
  - [ ] Calculate based on total player count and current rank

- [ ] Score animation (Framer Motion)
  - [ ] Use `useMotionValue` and `useTransform` for count-up animation
  - [ ] Animate from previous score to new score over 1 second
  - [ ] Display score during animation with smooth transitions

- [ ] Styling and animations
  - [ ] Use Framer Motion for all animations
  - [ ] Purple background for player's row: #8B5CF6 (Tailwind `purple-500`)
  - [ ] White text on purple background for contrast
  - [ ] Medal icons: 48px size for podium positions
  - [ ] Smooth transitions: 300ms fade-in/fade-out

- [ ] Error handling
  - [ ] Handle leaderboard data fetch failures
  - [ ] Handle player not found in leaderboard
  - [ ] Handle Realtime broadcast failures
  - [ ] Show appropriate error states

- [ ] Testing
  - [ ] Test personal leaderboard displays after feedback
  - [ ] Test rank change indicators (↑↓—→)
  - [ ] Test encouraging messages based on rank
  - [ ] Test top 3 podium display
  - [ ] Test context leaderboard (player above/below)
  - [ ] Test player's row highlighting (purple background)
  - [ ] Test score count-up animation
  - [ ] Test transition to next question after 10 seconds
  - [ ] Test transition to game results on `game_end` event
  - [ ] Test synchronization with projector leaderboard
  - [ ] Test on mobile devices (375px width)

## Technical Notes

- Component location: `components/game/personal-leaderboard.tsx`
- Server Action location: `lib/actions/games.ts` (`getLeaderboard` - same as Story 3.4)
- Event types: `leaderboard_ready`, `question_advance`, `game_end` (from Stories 3.2, 2.7)
- Display duration: 10 seconds (matches Story 3.4 projector leaderboard)
- Transition animation: 300ms fade-in (Framer Motion)
- Score animation: 1 second count-up (Framer Motion)
- Synchronization: Realtime `leaderboard_ready` broadcast ensures personal leaderboard appears simultaneously with projector
- Integration: Triggered after `leaderboard_ready` event from Story 3.4 (after 5-second reveal and 10-second projector leaderboard)
- Next step: After 10 seconds, transitions to next question (Story 2.5) or game results (Story 3.6)
- Previous rank: Stored in local component state for rank change calculation
- Visual design: Follows UX Design "Personal Leaderboard (Phone)" specifications
- Accessibility: WCAG AA contrast ratios, screen reader support

## Prerequisites

- Stories 2.5, 2.6, 3.1, 3.2, 3.3, 3.4 (completed)
- Story 2.5: Player game view component exists
- Story 2.6: Answer submission stores player's answer
- Story 3.1: Scoring calculation engine completes and updates `game_players.total_score`
- Story 3.2: Answer reveal broadcasts `answer_reveal` event
- Story 3.3: Player answer feedback displays feedback
- Story 3.4: Projector leaderboard broadcasts `leaderboard_ready` event and implements `getLeaderboard` Server Action

## Dependencies

- Epic 3: Scoring, Leaderboards & Game Completion
- Architecture: Real-Time Game State Synchronization
- Story 3.1: Scoring Calculation Engine (provides `calculateRankings()` function)
- Story 3.2: Answer Reveal on Projector (broadcasts `answer_reveal` event)
- Story 3.3: Player Answer Feedback (transitions to leaderboard after 5 seconds)
- Story 3.4: Live Leaderboard - Projector Display (broadcasts `leaderboard_ready` event, provides `getLeaderboard` Server Action)

## Notes

- This story implements the personal leaderboard for players on mobile
- Personal leaderboard shows player's rank, score, and encouraging messages
- Top 3 podium display creates excitement for top performers
- Context leaderboard shows players above/below for competitive context
- Rank change indicators show player progress (moved up/down/stayed same)
- Encouraging messages motivate players based on their performance
- 10-second display duration matches projector leaderboard for synchronization
- After 10 seconds, automatically transitions to next question or game results
- Note: Players do NOT see their score after each question (only at end) per UX Design, but they see their rank

## Enhancements (Future)

- Sound effects for rank changes (optional, accessibility consideration)
- Celebration animation for top 3 (optional)
- Social sharing of achievements (optional, Epic 6)
- Export personal stats (optional, Epic 6)

---

