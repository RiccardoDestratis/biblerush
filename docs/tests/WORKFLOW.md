# Test Workflow - When and How to Run Tests

## Quick Answer: When Do I Run Tests?

### ✅ Always Run Tests:
1. **Before committing changes** → Catch issues early
2. **After major changes** → Ensure nothing broke
3. **Before creating PR** → Validate your feature works
4. **After fixing bugs** → Ensure fix didn't break other things

### 🔄 Run Tests Automatically:
Consider setting up a pre-commit hook (future enhancement) or just make it a habit before commits.

---

## Typical Development Workflow

### Scenario 1: Making a Small Change (Button Text, UI Fix)

```bash
# 1. Make your change
# 2. Start dev server (if not running)
pnpm dev

# 3. Quick test to verify change works
pnpm test:e2e

# 4. If tests pass, commit
git add .
git commit -m "fix: update button text"
```

### Scenario 2: Adding a New Feature

```bash
# 1. Start dev server
pnpm dev

# 2. In another terminal, run tests in UI mode
pnpm test:e2e:ui

# 3. Make your changes (watch tests fail/pass in UI)

# 4. Update tests if needed (see UPDATE_TEST_CHECKLIST.md)

# 5. Run tests again
pnpm test:e2e

# 6. If all pass, commit
git add .
git commit -m "feat: add new feature"
```

### Scenario 3: Major Refactoring (Database Schema, API Changes)

```bash
# 1. Before starting:
pnpm test:e2e  # Baseline - note what works

# 2. Make your changes

# 3. Update tests (will likely need updates)
# - Check UPDATE_TEST_CHECKLIST.md
# - Update test helpers
# - Update test scenarios

# 4. Run tests repeatedly during refactoring
pnpm test:e2e:ui  # Keep UI open to see progress

# 5. Fix tests as you go

# 6. When all tests pass:
pnpm test:e2e
pnpm build  # Also verify build works

# 7. Commit
git add .
git commit -m "refactor: major changes + update tests"
```

---

## Common Test Scenarios

### "I Just Changed Button Text"

**Do tests need updating?** Maybe
- If selector uses text: `button:has-text("Create")` → YES, update
- If selector uses ID: `button#create-button` → NO, probably fine

**Quick check:**
```bash
pnpm test:e2e
# If it fails, update selector
# If it passes, you're good!
```

### "I Added a New Required Field to a Form"

**Do tests need updating?** YES

**Steps:**
1. Update test helper to fill new field
2. Run test
3. Fix if needed

**Example:**
```typescript
// Before: createGame() helper
// After: createGame() helper now needs to fill "difficulty" field
```

### "I Changed a Route URL"

**Do tests need updating?** YES

**Steps:**
1. Update URL patterns in test helpers
2. Update assertions that check URLs
3. Run tests

**Example:**
```typescript
// Before: /game/[id]/host
// After: /host/[id]
// Update: waitForURL() patterns
```

### "I Added a New Step in User Flow"

**Do tests need updating?** YES

**Steps:**
1. Add new step to test
2. Update test helpers if needed
3. Run test

**Example:**
```typescript
// Test now includes:
// 1. Select question set
// 2. Select question count
// 3. NEW: Select difficulty  <-- Add this
// 4. Create game
```

---

## Test Maintenance After Changes

### Quick Checklist (from UPDATE_TEST_CHECKLIST.md):

1. **Run tests:** `pnpm test:e2e`
2. **Check failures:**
   - Is it a test issue? → Update test
   - Is it a code issue? → Fix code
3. **Update documentation:**
   - Update `docs/tests/test-status.md` if status changed
   - Add entry to Test Update Log
4. **Verify everything:**
   - Tests pass
   - Manual test confirms feature works
   - Ready to commit

---

## Running Tests: Commands Reference

### Development (Use Most Often)
```bash
pnpm test:e2e:ui      # Interactive UI - see tests run, debug easily
```

### Quick Check
```bash
pnpm test:e2e         # Fast, headless mode
```

### Debugging
```bash
pnpm test:e2e:debug   # Step through test line by line
pnpm test:e2e:headed  # See browser windows
```

### Reporting
```bash
pnpm test:e2e:report  # View HTML report with screenshots
```

---

## Questions & Answers

### Q: Do I need to run tests after every tiny change?
**A:** Not necessarily, but it's a good habit. Run them before committing.

### Q: What if a test fails but my feature works manually?
**A:** Likely a test issue. The test might need updating (outdated selector, timing issue, etc.)

### Q: What if a test fails and my feature doesn't work?
**A:** Code issue. Fix the feature, then verify test passes.

### Q: Can I skip tests if I'm just fixing a typo?
**A:** You can, but running tests is quick and catches surprises. Recommended: always run before commit.

### Q: How do I know which tests to update?
**A:** Run tests - they'll tell you what's broken. Then check UPDATE_TEST_CHECKLIST.md to see what changed.

### Q: Tests are slow. How can I speed them up?
**A:** 
- Use `pnpm test:e2e` (headless) instead of UI mode
- Run specific test: `pnpm exec playwright test e2e/specific-test.spec.ts`
- Run specific test in file: `pnpm exec playwright test -g "test name"`

---

## Before Committing Checklist

```bash
# 1. Run tests
pnpm test:e2e

# 2. If any fail:
#    - Determine if code issue or test issue
#    - Fix accordingly
#    - Run tests again

# 3. If all pass:
#    - Run build to verify
#    pnpm build

# 4. Commit
git add .
git commit -m "your message"
```

---

## Pro Tips

1. **Keep dev server running** - Saves time
2. **Use test:ui mode** - See what's happening visually
3. **Update tests alongside code** - Don't wait until the end
4. **Document test changes** - Future you will thank you
5. **Run tests before committing** - Catch issues early

---

## Summary

- ✅ Run tests before committing
- ✅ Run tests after major changes
- ✅ Update tests when requirements change
- ✅ Use `test:e2e:ui` for development
- ✅ Use `test:e2e` for quick checks
- ✅ Check UPDATE_TEST_CHECKLIST.md when unsure

**Remember:** Tests are documentation. Keep them accurate!

