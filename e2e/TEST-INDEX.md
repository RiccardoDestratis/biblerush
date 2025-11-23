# Playwright E2E Test Index

This document lists all available Playwright E2E tests with descriptions and how to run them.

## Running Tests

```bash
# Run all tests
pnpm exec playwright test

# Run a specific test file
pnpm exec playwright test e2e/full-game-flow-scoring-leaderboard.spec.ts

# Run with UI (recommended for debugging)
pnpm exec playwright test --ui

# Run in headed mode (see browser)
pnpm exec playwright test --headed
```

## Test Files

### 1. `basic.spec.ts`
**Description:** Basic homepage and navigation tests  
**Stories:** None (basic functionality)  
**What it tests:**
- Homepage loads correctly
- "Create New Game" button exists and works
- Navigation to create page

**Run:** `pnpm exec playwright test e2e/basic.spec.ts`

---

### 2. `create-and-join.spec.ts`
**Description:** Game creation and player joining flow  
**Stories:** Epic 1 (Foundation)  
**What it tests:**
- Host creates a game with 10 questions
- 5 players join the game
- Real-time player list updates
- Game can be started

**Run:** `pnpm exec playwright test e2e/create-and-join.spec.ts`

---

### 3. `game-start-question-loading.spec.ts`
**Description:** Game start and question data loading  
**Stories:** Story 2.3  
**What it tests:**
- Game start triggers question loading
- Question data loads correctly
- Error handling for starting without players

**Run:** `pnpm exec playwright test e2e/game-start-question-loading.spec.ts`

---

### 4. `question-display-projector.spec.ts`
**Description:** Question display on projector view  
**Stories:** Story 2.4  
**What it tests:**
- Question text displays correctly
- Answer options in 2x2 grid
- Timer displays and counts down
- Multiple players can see questions

**Run:** `pnpm exec playwright test e2e/question-display-projector.spec.ts`

---

### 5. `question-display-player-mobile.spec.ts`
**Description:** Question display on player mobile view with tap-to-lock  
**Stories:** Stories 2.5 & 2.6  
**What it tests:**
- Mobile-optimized question display
- Tap-to-lock answer selection pattern
- Timer with low-time warning
- Answer submission

**Run:** `pnpm exec playwright test e2e/question-display-player-mobile.spec.ts`

---

### 6. `answer-submission-edge-cases.spec.ts`
**Description:** Edge cases for answer submission  
**Stories:** Story 2.6  
**What it tests:**
- Selection changes before lock
- Duplicate submission prevention
- Error handling and retry logic
- Network failure scenarios

**Run:** `pnpm exec playwright test e2e/answer-submission-edge-cases.spec.ts`

---

### 7. `question-advancement.spec.ts`
**Description:** Question advancement and synchronization  
**Stories:** Story 2.7  
**What it tests:**
- Server Action `advanceQuestion()` works
- `question_advance` event broadcasts correctly
- Host and player views update synchronously
- Multiple question advances
- State resets correctly

**Run:** `pnpm exec playwright test e2e/question-advancement.spec.ts`

---

### 8. `pause-resume.spec.ts`
**Description:** Game pause and resume functionality  
**Stories:** Story 2.7  
**What it tests:**
- Pause button works
- Timer pauses correctly
- Resume functionality
- Synchronization across devices

**Run:** `pnpm exec playwright test e2e/pause-resume.spec.ts`

---

### 9. `full-game-flow-scoring-leaderboard.spec.ts` ⭐ NEW
**Description:** Complete game flow with scoring and leaderboards  
**Stories:** Stories 3.2, 3.3, 3.4, 3.5  
**What it tests:**
- **Story 3.2:** Answer reveal on projector (5 seconds)
- **Story 3.3:** Player answer feedback (synchronized)
- **Story 3.4:** Live leaderboard on projector (10 seconds)
- **Story 3.5:** Personal leaderboard on mobile (10 seconds)
- Full question flow: Question → Answer → Reveal → Feedback → Leaderboard → Next Question
- Complete 3-question game (demo)
- Complete 10-question game (full)

**Run:** 
```bash
# Demo version (3 questions)
pnpm exec playwright test e2e/full-game-flow-scoring-leaderboard.spec.ts -g "demo"

# Full version (10 questions)
pnpm exec playwright test e2e/full-game-flow-scoring-leaderboard.spec.ts -g "full"
```

---

## Test Coverage by Story

| Story | Test File | Status |
|-------|-----------|--------|
| Epic 1: Foundation | `create-and-join.spec.ts` | ✅ |
| Story 2.3: Game Start | `game-start-question-loading.spec.ts` | ✅ |
| Story 2.4: Projector Display | `question-display-projector.spec.ts` | ✅ |
| Story 2.5: Player Mobile View | `question-display-player-mobile.spec.ts` | ✅ |
| Story 2.6: Answer Submission | `answer-submission-edge-cases.spec.ts` | ✅ |
| Story 2.7: Question Advancement | `question-advancement.spec.ts` | ✅ |
| Story 2.7: Pause/Resume | `pause-resume.spec.ts` | ✅ |
| Story 3.2: Answer Reveal | `full-game-flow-scoring-leaderboard.spec.ts` | ✅ |
| Story 3.3: Player Feedback | `full-game-flow-scoring-leaderboard.spec.ts` | ✅ |
| Story 3.4: Projector Leaderboard | `full-game-flow-scoring-leaderboard.spec.ts` | ✅ |
| Story 3.5: Personal Leaderboard | `full-game-flow-scoring-leaderboard.spec.ts` | ✅ |

## Prerequisites

Before running tests, ensure:
1. Database has question sets imported:
   ```bash
   pnpm import:questions docs/questions_import/complete_questions.json
   ```
2. Development server is running:
   ```bash
   pnpm dev
   ```
3. Environment variables are set (if needed)

## Tips

- Use `--ui` flag to see all browser windows and debug visually
- Use `--headed` to see the browser during test execution
- Use `--debug` to step through tests line by line
- Check `playwright-report/` for detailed test reports after running

