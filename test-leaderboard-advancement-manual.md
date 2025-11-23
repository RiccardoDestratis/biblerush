# Manual Test: Leaderboard → Next Question Fix

## Quick Test Steps

1. **Open Browser Console** (F12 or Cmd+Option+I)
2. **Create a game** and start it
3. **Complete Question 1** (skip or wait for timer)
4. **Watch the console logs** when leaderboard countdown reaches 0

## What to Look For

### ✅ SUCCESS Indicators:

When leaderboard countdown finishes, you should see these logs **in order**:

```
[Host] 🎯 Leaderboard complete for question <id>
[QuestionAdvance] 📞 Calling server action: advanceQuestion(<game-id>)
[QuestionAdvance] ➡️ Advancing to question 2, broadcasting question_advance
[Host] 📝 Updating store immediately (local echo) for question 2
[GameStore] 🔄 advanceQuestion called: question 2
[GameStore] 📝 Setting revealState: "leaderboard" → "question"
[Host] ✅ Advancement initiated, waiting for question_advance event...
```

**Question 2 should appear IMMEDIATELY** (within 1-2 seconds).

### ⚠️ If Event Arrives Later:

If the broadcast event arrives later (which is fine), you'll see:

```
[Host] ✅ Received question_advance event, advancing to question 2
[Host] ⚠️ Ignoring duplicate question_advance (already on question 2)
```

This is **CORRECT** - it means the duplicate protection is working!

## Expected Behavior

- **Before Fix**: Question 2 never appeared (stuck on "Next question in 0...")
- **After Fix**: Question 2 appears immediately when countdown finishes

## Console Filter

To filter logs in browser console, use:
- Filter: `Leaderboard complete` OR `local echo` OR `advanceQuestion` OR `question_advance`

## Test Result

- [ ] Question 2 appears immediately ✅
- [ ] "local echo" log appears ✅  
- [ ] No stuck state ✅
- [ ] Game continues smoothly ✅

