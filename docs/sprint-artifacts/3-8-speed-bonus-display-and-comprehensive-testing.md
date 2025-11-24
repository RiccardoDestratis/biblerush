# Story 3.8: Speed Bonus Display & Comprehensive Testing

Status: completed

## Story

As a player,
I want to see a clear breakdown of my points after each round showing base points and speed bonus separately,
So that I understand how my speed affects my score and am incentivized to answer faster.

## Acceptance Criteria

**Given** a player has answered a question correctly
**When** the answer reveal screen is displayed (after question timer expires)
**Then** the player feedback component (`components/game/player-answer-feedback.tsx`) displays:
- Base points: "10 points" (always shown for correct answers)
- Speed bonus: "+5 speed bonus" or "+3 speed bonus" or "No speed bonus" (only if speed bonus > 0)
- Total points breakdown: "10 points + 5 speed bonus = 15 total" (for correct answers with speed bonus)
- Clear visual hierarchy: Base points in primary color, speed bonus highlighted in accent color (teal/yellow)
- Response time display: "Answered in 2.3s" (formatted to 1 decimal place)

**And** for incorrect answers or no answer:
- Shows "0 points" clearly
- Does not show speed bonus (since no bonus for incorrect)
- Shows correct answer text

**And** comprehensive test coverage for all speed bonus scenarios:
- Test file: `lib/game/scoring.test.ts` (enhance existing tests)
- Test file: `components/game/player-answer-feedback.test.tsx` (new component tests)
- Test file: `e2e/speed-bonus-display.spec.ts` (new E2E tests)

**And** unit tests for scoring function cover ALL boundary cases:
- **Tier 1 (0-3000ms = +5 bonus):**
  - 0ms → 15 points (edge case: instant answer)
  - 500ms → 15 points
  - 1000ms → 15 points
  - 2000ms → 15 points
  - 2500ms → 15 points
  - 2999ms → 15 points
  - 3000ms → 15 points (boundary: exactly 3 seconds)
  
- **Tier 2 (3001-5000ms = +3 bonus):**
  - 3001ms → 13 points (boundary: just over 3 seconds)
  - 3500ms → 13 points
  - 4000ms → 13 points
  - 4500ms → 13 points
  - 4999ms → 13 points
  - 5000ms → 13 points (boundary: exactly 5 seconds)
  
- **Tier 3 (5001-15000ms = +0 bonus):**
  - 5001ms → 10 points (boundary: just over 5 seconds)
  - 6000ms → 10 points
  - 8000ms → 10 points
  - 10000ms → 10 points
  - 12000ms → 10 points
  - 15000ms → 10 points (boundary: max question time)
  - 16000ms → 10 points (edge case: beyond max time, no bonus)
  
- **Incorrect answers:**
  - Incorrect answer, 0ms → 0 points
  - Incorrect answer, 2000ms → 0 points
  - Incorrect answer, 5000ms → 0 points
  - Incorrect answer, 10000ms → 0 points
  - No answer (null), any time → 0 points

**And** component tests for `PlayerAnswerFeedback`:
- Renders correct answer with speed bonus display
- Renders correct answer without speed bonus
- Renders incorrect answer (no speed bonus shown)
- Renders no answer submitted (no speed bonus shown)
- Displays response time correctly formatted
- Animates points count-up correctly
- Shows proper breakdown: "10 points + 5 speed bonus = 15 total"
- Shows proper breakdown: "10 points + 3 speed bonus = 13 total"
- Shows proper breakdown: "10 points (no speed bonus)" or "10 points + 0 speed bonus = 10 total"
- Visual styling: Speed bonus highlighted in accent color
- Total score updates correctly

**And** E2E tests for speed bonus display:
- Player answers correctly in 2 seconds → sees "10 points + 5 speed bonus = 15 total"
- Player answers correctly in 4 seconds → sees "10 points + 3 speed bonus = 13 total"
- Player answers correctly in 10 seconds → sees "10 points (no speed bonus)" or "10 points + 0 speed bonus = 10 total"
- Player answers incorrectly → sees "0 points" (no speed bonus mentioned)
- Player doesn't answer → sees "0 points" (no speed bonus mentioned)
- Response time displays correctly for all scenarios
- Total score accumulates correctly across multiple questions
- Speed bonus display appears after answer reveal (not before)
- Speed bonus display persists for 5 seconds (matches reveal duration)

**And** integration tests for scoring calculation:
- `processQuestionScores` correctly calculates speed bonus for all tiers
- Speed bonus stored in database correctly
- Multiple players with different response times scored correctly
- Batch processing handles 20 players with various response times
- Edge cases: 0ms, exactly 3000ms, exactly 5000ms, exactly 15000ms

**And** visual design requirements:
- Base points: Large, bold, primary text color (gray-900)
- Speed bonus: Highlighted in accent color (teal-600 or green-600), slightly smaller but prominent
- Total breakdown: Clear equation format "10 + 5 = 15" or "10 + 3 = 13"
- Response time: Smaller text, secondary color (gray-600)
- Icons: CheckCircle for correct (green), XCircle for incorrect (red/orange)
- Animation: Smooth count-up animation for points (500ms duration)
- Layout: Centered, mobile-friendly, clear visual hierarchy

**And** accessibility requirements:
- All text has sufficient color contrast (WCAG AA)
- Screen reader announces: "Correct answer. 10 points plus 5 speed bonus equals 15 total points"
- Focus states visible for any interactive elements
- Text is readable at mobile sizes (minimum 16px base font)

## Tasks / Subtasks

- [x] Enhance `PlayerAnswerFeedback` component display
  - [ ] Update points display to show breakdown: "10 points + 5 speed bonus = 15 total"
  - [ ] Show "10 points (no speed bonus)" or "10 points + 0 speed bonus = 10 total" for Tier 3
  - [ ] Add response time display: "Answered in 2.3s"
  - [ ] Improve visual hierarchy: Base points primary, speed bonus accent color
  - [ ] Ensure proper formatting for all speed bonus tiers (5, 3, 0)
  - [ ] Test responsive design on mobile devices
  - [ ] Verify accessibility (WCAG AA contrast, screen reader support)

- [x] Enhance unit tests in `lib/game/scoring.test.ts`
  - [ ] Add comprehensive boundary tests for all speed bonus tiers
  - [ ] Test every millisecond boundary: 0ms, 3000ms, 3001ms, 5000ms, 5001ms, 15000ms
  - [ ] Test mid-tier values: 1500ms, 4000ms, 8000ms
  - [ ] Test edge cases: negative time (should handle gracefully), very large times
  - [ ] Test incorrect answers with all time ranges
  - [ ] Achieve 100% coverage for `calculateScore` and `getSpeedBonus` functions
  - [ ] Add performance tests for batch calculations

- [x] Create component tests `components/game/player-answer-feedback.test.tsx`
  - [ ] Test rendering with correct answer + Tier 1 speed bonus (5 points)
  - [ ] Test rendering with correct answer + Tier 2 speed bonus (3 points)
  - [ ] Test rendering with correct answer + Tier 3 speed bonus (0 points)
  - [ ] Test rendering with incorrect answer
  - [ ] Test rendering with no answer submitted
  - [ ] Test points count-up animation
  - [ ] Test response time formatting
  - [ ] Test total score display
  - [ ] Test visual styling (colors, sizes, layout)
  - [ ] Test accessibility attributes

- [x] Create E2E tests `e2e/speed-bonus-display.spec.ts`
  - [ ] Test complete flow: Answer in 2s → See "10 + 5 = 15" breakdown
  - [ ] Test complete flow: Answer in 4s → See "10 + 3 = 13" breakdown
  - [ ] Test complete flow: Answer in 10s → See "10 + 0 = 10" or "10 (no bonus)"
  - [ ] Test incorrect answer → See "0 points" (no speed bonus)
  - [ ] Test no answer → See "0 points" (no speed bonus)
  - [ ] Test response time display accuracy
  - [ ] Test total score accumulation across multiple questions
  - [ ] Test timing: Speed bonus appears after reveal, not before
  - [ ] Test display duration: Shows for 5 seconds (matches reveal)

- [x] Integration tests for `processQuestionScores`
  - [ ] Test batch processing with players in all speed bonus tiers
  - [ ] Test boundary cases: 0ms, 3000ms, 3001ms, 5000ms, 5001ms, 15000ms
  - [ ] Test database updates: `points_earned` and `total_score` correct
  - [ ] Test error handling: Invalid data, database errors
  - [ ] Test performance: 20 players processed in <500ms

- [ ] Documentation updates
  - [ ] Update component JSDoc comments
  - [ ] Add test coverage report to README
  - [ ] Document speed bonus display format in user-facing docs (if applicable)

## Technical Notes

- **Component Location:** `components/game/player-answer-feedback.tsx`
- **Scoring Logic:** Uses existing `getSpeedBonus()` from `lib/game/scoring.ts`
- **Test Framework:** 
  - Unit tests: Vitest (`lib/game/scoring.test.ts`)
  - Component tests: Vitest + React Testing Library (`components/game/player-answer-feedback.test.tsx`)
  - E2E tests: Playwright (`e2e/speed-bonus-display.spec.ts`)
- **Display Format:**
  - Tier 1 (0-3s): "10 points + 5 speed bonus = 15 total"
  - Tier 2 (3-5s): "10 points + 3 speed bonus = 13 total"
  - Tier 3 (5-15s): "10 points (no speed bonus)" or "10 points + 0 speed bonus = 10 total"
  - Incorrect: "0 points" (no speed bonus mentioned)
- **Response Time Format:** "Answered in 2.3s" (1 decimal place, from `formatResponseTime()`)
- **Visual Design:**
  - Base points: `text-gray-900`, `text-3xl`, `font-bold`
  - Speed bonus: `text-teal-600` or `text-green-600`, `text-xl`, `font-semibold`
  - Response time: `text-gray-600`, `text-sm`
- **Animation:** Points count-up over 500ms (existing implementation)
- **Accessibility:** WCAG AA contrast, screen reader support, focus states

## Prerequisites

- Story 3.1: Scoring Calculation Engine (completed)
- Story 3.2: Answer Reveal on Projector (completed)
- Story 3.3: Player Answer Feedback (completed - component exists)
- Database schema: `player_answers` table with `response_time_ms`, `points_earned`, `is_correct`
- Database schema: `game_players` table with `total_score`

## Dependencies

- Epic 3: Scoring, Leaderboards & Game Completion
- Story 3.1: Scoring Calculation Engine (uses `getSpeedBonus()` function)
- Story 3.2: Answer Reveal on Projector (triggers feedback display)
- Story 3.3: Player Answer Feedback (enhances existing component)

## Notes

- **Critical for Release:** This story is essential for launch as it ensures players understand the scoring system and are incentivized to answer quickly
- **User Incentive:** Clear speed bonus display encourages faster answers, improving game engagement
- **Test Coverage:** Comprehensive testing ensures all speed bonus scenarios work correctly across all tiers
- **Visual Clarity:** Breaking down points (10 + 5 = 15) helps players understand how speed affects their score
- **Edge Cases:** Must handle all boundary conditions (exactly 3s, exactly 5s, etc.) correctly
- **Performance:** Tests should verify scoring calculation performance with 20+ players

## Enhancements (Future)

- Show speed bonus breakdown on leaderboard (optional)
- Add sound effects for speed bonus (optional)
- Show speed bonus history across all questions (optional)
- Add achievement badges for speed bonuses (optional)

---

