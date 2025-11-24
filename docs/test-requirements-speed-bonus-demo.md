# Test Requirements: Speed Bonus Full Journey Demo

## Objective
Create an end-to-end Playwright test that demonstrates the complete speed bonus scoring system with 3 players across 3 questions, showing different speed bonus scenarios.

## Test Scenario

### Setup
1. Create a game with 3 questions
2. 3 players join:
   - **FastPlayer**: Answers quickly (aims for Tier 1: <3s = 15 points)
   - **SlowPlayer**: Answers slowly (aims for Tier 3: >5s = 10 points)  
   - **NoAnswerPlayer**: Varies behavior per question

### Question 1
- FastPlayer: Answer immediately (<3s) → Should get 15 points (10 base + 5 speed bonus)
- SlowPlayer: Wait 6 seconds, then answer → Should get 10 points (10 base + 0 speed bonus)
- NoAnswerPlayer: Don't answer → Should get 0 points

### Question 2
- FastPlayer: Wait 4 seconds, then answer → Should get 13 points (10 base + 3 speed bonus, Tier 2)
- SlowPlayer: Answer immediately (<3s) → Should get 15 points (10 base + 5 speed bonus)
- NoAnswerPlayer: Wait 6 seconds, then answer → Should get 10 points (10 base + 0 speed bonus)

### Question 3
- FastPlayer: Wait 2 seconds, then answer → Should get 15 points (10 base + 5 speed bonus)
- SlowPlayer: Wait 4 seconds, then answer → Should get 13 points (10 base + 3 speed bonus, Tier 2)
- NoAnswerPlayer: Answer immediately (<3s) → Should get 15 points (10 base + 5 speed bonus)

## Key Requirements

### Button Selection
- Use the EXACT same button selection pattern as `e2e/speed-bonus-accounting-verification.spec.ts` (which works)
- Pattern: `player.page.locator('button').filter({ hasText: new RegExp(correctAnswer, 'i') }).first()`
- Wait for question text first: `await expect(player.page.locator('text=/Question|Select your answer/i')).toBeVisible({ timeout: 15000 })`
- Then wait 1 second for buttons to render
- Click pattern: Click button, wait 50ms, click again (to lock), wait 2000ms for submission

### Answer Selection
- Fetch correct answer from Supabase using:
  ```typescript
  const { data: questionData } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .eq('question_set_id', questionSetId)
    .eq('order_index', orderIndex)
    .single();
  const correctAnswer = questionData?.correct_answer || 'A';
  ```

### Timing
- Host must skip timer IMMEDIATELY after all players answer (before 15s timer expires)
- Use: `hostPage.getByRole('button', { name: /skip|reveal/i }).first()`

### Verification
- After each question, verify scores in database
- Show final total scores after all 3 questions
- Display score breakdown per question

## Reference Implementation
- Working test: `e2e/speed-bonus-accounting-verification.spec.ts`
- Copy the EXACT patterns from that test for:
  - Game creation
  - Player joining
  - Question waiting
  - Button clicking
  - Answer submission

## Expected Output
- Test should complete in ~2-3 minutes
- All players should successfully answer questions
- Scores should match expected values based on response times
- Final leaderboard should show accumulated scores

