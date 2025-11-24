# Testing FAQ - Quick Answers

## Your Questions Answered

### 1. "How does this now work? Can you run the tests?"

**Answer:** Yes! Tests work like this:

1. **Playwright uses multiple browser contexts** - simulates multiple devices
2. **All run simultaneously** - tests real-time synchronization
3. **No manual QR scanning needed** - everything automated

**Run tests:**
```bash
# Start dev server first (in one terminal)
pnpm dev

# Then run tests (in another terminal)
pnpm test:e2e          # Quick check
pnpm test:e2e:ui       # Interactive UI (recommended)
```

**Example:** The test will:
1. Open browser 1 (host) → Create game → Get room code
2. Open browser 2 (player 1) → Join with room code
3. Open browser 3 (player 2) → Join with room code
4. Verify all appear in waiting room (real-time)
5. All in one automated test!

**Try it now:**
```bash
# Terminal 1:
pnpm dev

# Terminal 2:
pnpm test:e2e:ui
```

---

### 2. "Every time we did a major change to make sure that we did not ruin anything?"

**Answer:** Yes! Here's when to run tests:

#### ✅ Always Run Before:
- Committing changes
- Creating Pull Request
- Merging to staging/main

#### ✅ Always Run After:
- Major refactoring (database schema, API changes)
- New feature implementation
- Bug fixes
- UI/UX changes
- Route/URL changes

**Workflow:**
```bash
# 1. Make changes
# 2. Run tests
pnpm test:e2e

# 3. Fix any failures (code or test updates)
# 4. Run tests again
pnpm test:e2e

# 5. If all pass, commit
git commit -m "your changes"
```

**Pro tip:** Run tests in UI mode while developing:
```bash
pnpm test:e2e:ui
# Keep this open while you code - see tests fail/pass as you work
```

---

### 3. "What if the requirements change and stuff?"

**Answer:** Tests need updating when requirements change. Here's how:

#### When Requirements Change:

1. **Identify what changed:**
   - UI/UX change? → Update selectors
   - Flow change? → Update test steps
   - API change? → Update helpers
   - Route change? → Update URLs

2. **Update tests:**
   - Check `docs/tests/UPDATE_TEST_CHECKLIST.md` for guidance
   - Update test helpers (`e2e/fixtures/test-helpers.ts`)
   - Update test scenarios (`e2e/*.spec.ts`)

3. **Run tests:**
   ```bash
   pnpm test:e2e
   ```

4. **Update documentation:**
   - Update `docs/tests/test-status.md`
   - Add entry to Test Update Log

**Example:** Requirements say "Add difficulty selection to game creation"

**Action:**
1. Update `createGame()` helper to select difficulty
2. Update test to verify difficulty selection
3. Run tests
4. Update test status docs

**Checklist:** Use `docs/tests/UPDATE_TEST_CHECKLIST.md` when unsure!

---

### 4. "Is there any documentation where we document the tests so we know when we have to change the tests again?"

**Answer:** Yes! We have comprehensive documentation:

#### Main Documents:

1. **`docs/testing-guide.md`** - Complete testing guide
   - How tests work
   - How to run tests
   - When to run tests
   - When to update tests
   - Troubleshooting

2. **`docs/tests/test-status.md`** - Test status tracking
   - Which tests are working ✅
   - Which tests are pending ⏳
   - What features block them
   - Test update log

3. **`docs/tests/UPDATE_TEST_CHECKLIST.md`** - Update checklist
   - When to update tests
   - What to update
   - Step-by-step guide

4. **`docs/tests/WORKFLOW.md`** - Workflow examples
   - Typical development workflows
   - Common scenarios
   - Quick reference

5. **`e2e/README.md`** - Quick reference in test directory

#### Test Update Log

**Location:** `docs/tests/test-status.md` (Test Update Log section)

**Example entry:**
```markdown
### 2025-01-28 - Added Difficulty Selection
**Feature:** Game creation now includes difficulty selection
**Test File:** `e2e/multi-player-game-flow.spec.ts`
**Changes:**
- Updated `createGame()` helper to select difficulty
- Added difficulty verification in test
**Status:** ✅ Working
```

**Update this log whenever you update tests!**

---

## Quick Reference: What Documents Should I Check?

| Question | Document | Section |
|----------|----------|---------|
| How do I run tests? | `docs/testing-guide.md` | Running Tests |
| When do I run tests? | `docs/tests/WORKFLOW.md` | When Do I Run Tests? |
| What tests are working? | `docs/tests/test-status.md` | Test Coverage Status |
| Do I need to update tests? | `docs/tests/UPDATE_TEST_CHECKLIST.md` | Types of Changes |
| How do I update tests? | `docs/tests/UPDATE_TEST_CHECKLIST.md` | Step-by-step |
| What's the workflow? | `docs/tests/WORKFLOW.md` | Typical Workflows |

---

## Real-World Example

**Scenario:** You're adding a "difficulty selection" step to game creation.

### Step 1: Check Documentation
- Read `docs/tests/test-status.md` to see current test status
- Read `docs/tests/UPDATE_TEST_CHECKLIST.md` to see what needs updating

### Step 2: Make Changes
- Implement difficulty selection in UI
- Update `createGame()` helper in `e2e/fixtures/test-helpers.ts`
- Update test to verify difficulty selection

### Step 3: Run Tests
```bash
pnpm test:e2e:ui
# See test run, verify it passes
```

### Step 4: Update Documentation
- Update `docs/tests/test-status.md`:
  - Add entry to Test Update Log
  - Note that difficulty selection test is now working

### Step 5: Commit
```bash
git add .
git commit -m "feat: add difficulty selection + update tests"
```

---

## Summary

1. **Can you run tests?** ✅ Yes - `pnpm test:e2e:ui`
2. **When to run tests?** ✅ Before committing, after major changes
3. **What if requirements change?** ✅ Update tests using checklist
4. **Is there documentation?** ✅ Yes - multiple docs covering everything

**Start here:**
- Quick start: `docs/testing-guide.md`
- Test status: `docs/tests/test-status.md`
- When to update: `docs/tests/UPDATE_TEST_CHECKLIST.md`
- Workflow: `docs/tests/WORKFLOW.md`

---

## Still Have Questions?

1. Check `docs/testing-guide.md` for comprehensive guide
2. Check `docs/tests/test-status.md` for current status
3. Run tests and see what happens: `pnpm test:e2e:ui`
4. Tests will tell you what broke! 😊


