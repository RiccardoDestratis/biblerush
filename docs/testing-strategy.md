# Testing Strategy: Persistent Games & Focused Testing

## Overview

Instead of creating a new game every time you test, you can now use **persistent test games** that can be reused and reset to specific states. This dramatically speeds up testing, especially when debugging specific flows like "question 3 to game over".

## Key Benefits

1. **No More Full Flow Setup**: Skip creating games, joining players, and advancing through questions 1-2 every time
2. **Fast Iteration**: Reset a game to question 3 in seconds, test the game over flow, then reset again
3. **Better Logging**: Enhanced logging throughout the question advancement and game end flow
4. **Focused Testing**: Test specific parts of the journey independently

## Quick Start

### 1. Reset a Test Game to Question 3

```bash
pnpm tsx scripts/reset-test-game.ts q3-to-gameover 3
```

This will:
- Get or create a test game named "q3-to-gameover"
- Reset it to question 3 (active state, ready to test game over)
- Add a test player if needed

### 2. Test the Question 3 to Game Over Flow

```bash
pnpm tsx test-question3-to-gameover.ts
```

This will:
- Use the persistent test game
- Verify it's at question 3
- Call `advanceQuestion()` which should trigger game end
- Monitor Realtime events (`question_advance`, `game_end`)
- Verify game status changes to "completed"
- Provide detailed logging of the entire flow

### 3. Verify with Headed UI Test

After the scripted test passes, verify with a real browser:

```bash
pnpm test:e2e test-game-over-direct
```

Or manually:
1. Open the game in browser using the room code from the reset script
2. You should see question 3
3. Skip the question to trigger game end
4. Verify final results appear

## Test Utilities

### `lib/test-utils/persistent-game.ts`

Provides utilities for managing persistent test games:

#### `getOrCreateTestGame(gameName, questionCount?)`
- Gets an existing test game or creates a new one
- Test games are prefixed with `TEST-` in the room code
- Example: `getOrCreateTestGame('q3-to-gameover', 3)`

#### `resetGameToQuestion(gameId, questionNumber)`
- Resets a game to a specific question state
- Sets status to 'active', updates `current_question_index`, sets `started_at`
- Example: `resetGameToQuestion(gameId, 3)` - resets to question 3

#### `addTestPlayer(gameId, playerName)`
- Adds a test player to a game
- Returns player ID (reuses existing player if name matches)

#### `getGameState(gameId)`
- Returns current game state for debugging
- Includes status, question index, player count, etc.

#### `cleanupTestGame(gameId)`
- Deletes a test game (cleanup)

## Enhanced Logging

### Server Action Logging

The `advanceQuestion` server action now includes detailed logging:

```
[advanceQuestion] 📊 Current question index: 2, Next: 3, Total questions: 3
[advanceQuestion] 🏁 Game complete! All 3 questions finished. Ending game...
[advanceQuestion] ✅ Game status updated to "completed" at 2024-01-01T12:00:00.000Z
[advanceQuestion] 📤 Returning gameEnded=true, client should broadcast game_end event
```

### Client-Side Logging

The `advanceQuestionAndBroadcast` function logs:

```
[QuestionAdvance] 📞 Calling server action: advanceQuestion(<game-id>)
[QuestionAdvance] 🏁 Game ended, updating store and broadcasting game_end
[QuestionAdvance] 📝 Updating store immediately (local echo): gameStatus = "ended", revealState = "results"
[QuestionAdvance] ✅ Store updated, FinalResultsProjector should render now
[QuestionAdvance] ✅ game_end event broadcast complete
```

### Test Script Logging

The test script provides structured logging:

```
[INFO] Step 1: Getting or creating persistent test game...
✅ [SUCCESS] Game ID: <game-id>
📊 [STATE] Initial game state: {...}
📨 [EVENT] game_end received: {...}
```

## Testing Workflow

### For Debugging Question 3 to Game Over

1. **Reset game to question 3**:
   ```bash
   pnpm tsx scripts/reset-test-game.ts q3-to-gameover 3
   ```

2. **Run focused test** (with logging):
   ```bash
   pnpm tsx test-question3-to-gameover.ts
   ```

3. **Check logs** for:
   - Game state transitions
   - Realtime events received
   - Server action results
   - Any errors

4. **If issues found**, fix and repeat steps 1-3

5. **Verify with UI** (headed test):
   ```bash
   pnpm test:e2e test-game-over-direct
   ```

### For Testing Other Flows

You can reset to any question:

```bash
# Reset to question 1
pnpm tsx scripts/reset-test-game.ts my-test-game 1

# Reset to question 2
pnpm tsx scripts/reset-test-game.ts my-test-game 2
```

Then test that specific flow.

## Persistent Game Naming

Test games use a naming convention:
- Room code format: `TEST-<gameName>`
- Example: `TEST-Q3-TO-GAMEOVER` for game name `q3-to-gameover`

The game name is normalized (uppercase, special chars replaced with `-`).

## Example: Complete Debug Session

```bash
# 1. Reset to question 3
pnpm tsx scripts/reset-test-game.ts q3-to-gameover 3

# 2. Run test (should pass)
pnpm tsx test-question3-to-gameover.ts

# 3. If test passes, verify with UI
# Open browser, use room code from step 1
# Navigate to /game/<game-id>/host
# Should see question 3
# Skip question → should see game over

# 4. If you need to test again, just reset:
pnpm tsx scripts/reset-test-game.ts q3-to-gameover 3
```

## Integration with E2E Tests

You can also use persistent games in Playwright tests:

```typescript
import { getOrCreateTestGame, resetGameToQuestion, getGameRoomCode } from '@/lib/test-utils/persistent-game';

test('game over flow', async ({ page }) => {
  // Get persistent game
  const gameId = await getOrCreateTestGame('e2e-test', 3);
  await resetGameToQuestion(gameId, 3);
  const roomCode = await getGameRoomCode(gameId);
  
  // Navigate to game
  await page.goto(`/game/${gameId}/host`);
  
  // Test the flow...
});
```

## Troubleshooting

### Game not found
- Make sure you're using the same game name
- Check that the game wasn't deleted manually

### Game in wrong state
- Use `resetGameToQuestion()` to reset to the desired state
- Check current state with `getGameState()`

### Events not received
- Check Realtime connection status
- Verify channel subscription
- Check server logs for broadcast errors

### Game status not updating
- Check server action logs
- Verify database updates
- Check for errors in console

## Best Practices

1. **Use descriptive game names**: `q3-to-gameover`, `leaderboard-test`, etc.
2. **Reset before each test**: Ensures clean state
3. **Check logs first**: Scripted tests provide detailed logs
4. **Verify with UI**: Always verify with headed tests after scripted tests pass
5. **Clean up when done**: Use `cleanupTestGame()` if you want to delete test games

## Future Enhancements

- [ ] Add utility to create test games with specific player counts
- [ ] Add utility to simulate player answers
- [ ] Add utility to fast-forward through multiple questions
- [ ] Add Playwright helpers for persistent games
- [ ] Add test game cleanup automation


