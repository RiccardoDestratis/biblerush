# E2E Testing with Playwright

This directory contains end-to-end tests for BibleRush using Playwright.

## Current Testing Status

### ✅ Working Tests

1. **Basic Tests** (`basic.spec.ts`)
   - Homepage loads correctly
   - "Create New Game" button is visible
   - Button click navigates to create page

2. **Create and Join Flow** (`create-and-join.spec.ts`)
   - Creates a game with 10 questions
   - 5 players join the game successfully
   - All players appear on host page
   - Host starts the game

3. **Question Display Projector View** (`question-display-projector.spec.ts`) - Story 2.4
   - Verifies question display appears when game starts
   - Checks question text, answer options (A/B/C/D), timer display
   - Verifies metadata (question number, player count)
   - Tests timer countdown functionality
   - Validates accessibility (large text, high contrast for projector)

### Test Files

- `basic.spec.ts` - Basic homepage and navigation tests
- `create-and-join.spec.ts` - Full game creation and player join flow
- `question-display-projector.spec.ts` - Story 2.4: Question display projector view tests

## Setup

1. **Install dependencies** (already done):
   ```bash
   pnpm install
   ```

2. **Install Playwright browsers** (first time only):
   ```bash
   pnpm exec playwright install
   ```

## Running Tests

### Run all tests:
```bash
pnpm test:e2e
```

### Run a specific test:
```bash
pnpm test:e2e create-and-join
```

### Run tests in UI mode (interactive):
```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser):
```bash
pnpm test:e2e:headed
```

### Debug a specific test:
```bash
pnpm test:e2e:debug
```

### View test report:
```bash
pnpm test:e2e:report
```

## Configuration

Test configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:3000` (override with `PLAYWRIGHT_TEST_BASE_URL`)
- Browsers: Chromium
- Retries: 2 retries in CI, 0 locally
- Screenshots: Only on failure
- Trace: On first retry

## Requirements

Before running tests:

1. **Start the dev server**:
   ```bash
   pnpm dev
   ```

2. **Environment variables** must be set in `.env.local`

3. **Test data** should be seeded (optional, but recommended):
   ```bash
   pnpm seed:test
   ```

## Troubleshooting

**Tests fail with "Cannot connect to localhost:3000":**
- Make sure dev server is running: `pnpm dev`
- Check that port 3000 is not blocked

**Tests fail with timeout:**
- Increase timeout in test or config
- Check that the app is working correctly in the browser

**Browser not found:**
- Run `pnpm exec playwright install` to install browsers

**Warnings about NO_COLOR/FORCE_COLOR:**
- These are harmless warnings about color output settings
- They don't affect test functionality
