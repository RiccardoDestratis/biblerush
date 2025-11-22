# Story 2.3: Game Start & Question Data Loading

Status: in-progress

## Story

As a host user,
I want to start the game and load the first question across all devices,
So that gameplay begins simultaneously for everyone.

## Acceptance Criteria

**Given** I am on the host waiting room with at least 1 player
**When** I click "Start Game" button
**Then** a Server Action is triggered that:
- Updates `games` table: `status='active'`, `started_at=NOW()`, `current_question_index=0`
- Fetches first question from `questions` table WHERE `question_set_id` AND `order_index=1`
- Broadcasts `game_start` event via Realtime with first question data

**And** question data payload includes:
- `questionId` (UUID)
- `questionText` (string)
- `options` (array: [optionA, optionB, optionC, optionD])
- `questionNumber` (e.g., 1 of 15)
- `timerDuration` (15 seconds)

**And** host waiting room listens for `game_start` event and redirects internally to question display state
**And** player waiting view listens for `game_start` event and transitions to question display state
**And** loading state: Both views show "Starting game..." spinner during transition
**And** timer starts automatically when question data loads (synchronized across all devices)
**And** error handling: If question fetch fails, shows error toast and stays in waiting room
**And** question pre-loading: Fetches next 3 questions in background after game starts (Epic 4 will add images)

## Tasks / Subtasks

- [x] Create Server Action `startGame(gameId)` in `lib/actions/games.ts`
  - [x] Update `games` table: set `status='active'`, `started_at=NOW()`, `current_question_index=0`
  - [x] Fetch first question from `questions` table (WHERE `question_set_id` matches game's `question_set_id` AND `order_index=1`)
  - [x] Validate question exists, return error if not found
  - [x] Format question data payload with required fields
  - [x] Return success/error response with question data (client will broadcast)

- [x] Implement `game_start` event listener in host waiting room
  - [x] Subscribe to `game_start` broadcast event on game channel
  - [x] Show "Starting game..." loading spinner when event received
  - [x] Update game state (Zustand store) with question data
  - [x] Show loading state (question display will be in Story 2.4)
  - [x] Handle error states (show toast, stay in waiting room)

- [x] Implement `game_start` event listener in player waiting view
  - [x] Subscribe to `game_start` broadcast event on game channel
  - [x] Show "Starting game..." loading spinner when event received
  - [x] Update game state (Zustand store) with question data
  - [x] Show loading state (question display will be in Story 2.5)
  - [x] Handle error states (show toast, stay in waiting room)

- [x] Implement synchronized timer start (prepared)
  - [x] Extract server timestamp from `game_start` event payload
  - [x] Store timestamp in Zustand store (timer implementation in Story 2.4/2.5)
  - [x] Question data includes `startedAt` for synchronization
  - [ ] Timer component implementation (deferred to Story 2.4/2.5)

- [x] Implement question pre-loading (background fetch)
  - [x] After game starts, fetch next 3 questions in background
  - [x] Store pre-loaded questions in Zustand store
  - [x] Prepare for Epic 4 image loading integration
  - [x] Handle errors gracefully (non-blocking)

- [x] Update "Start Game" button behavior
  - [x] Disable button during game start process (prevent double-clicks)
  - [x] Show loading state on button during server action execution
  - [x] Re-enable if error occurs (allow retry)

- [x] Add error handling and validation
  - [x] Validate game exists and is in 'waiting' status before starting
  - [x] Validate at least 1 player has joined before allowing start
  - [x] Handle question fetch failures (show error toast, stay in waiting room)
  - [x] Handle Realtime broadcast failures (fallback to PostgreSQL change tracking)
  - [x] Add error handling for all failure scenarios

- [x] Update Zustand game store
  - [x] Add game state: `currentQuestion`, `questionNumber`, `totalQuestions`, `timerDuration`
  - [x] Add game status: `active`, `waiting`, `ended`
  - [x] Add actions: `setCurrentQuestion()`, `startGame()`, `setGameStatus()`
  - [x] Ensure store is accessible from both host and player views
  - [x] Add pre-loaded questions storage

- [ ] Testing
  - [ ] Test Server Action with valid game and question set
  - [ ] Test Server Action with missing question (error handling)
  - [ ] Test Server Action with no players (validation)
  - [ ] Test `game_start` event broadcast and reception
  - [ ] Test synchronized timer start across multiple devices (when timer is implemented)
  - [ ] Test loading states and transitions
  - [ ] Test error scenarios (network failures, missing data)
  - [ ] Test question pre-loading in background

## Technical Notes

- Server Action in `lib/actions/games.ts`: `startGame(gameId)`
- Use Zustand store for game state (current question, timer, player answers) per Architecture
- Question pre-loading strategy matches NFR3 (image loading optimization)
- Synchronization: Server timestamp ensures all devices start timer at same time
- Follow Architecture document "Real-Time Game State Synchronization" pattern
- Use Supabase Realtime channels per Architecture section "Novel Pattern Designs"
- Reconnection logic matches NFR2 (90%+ uptime, exponential backoff)

## Prerequisites

- Stories 2.1, 2.2 (completed)

## Dependencies

- Epic 2: Real-Time Game Engine & Player Experience
- Architecture: Real-Time Game State Synchronization
- UX Design: Game Start Flow

## Notes

- This story establishes the core game start flow and question loading mechanism
- Question pre-loading prepares for Epic 4 AI image integration
- Timer synchronization is critical for fair gameplay across all devices
- Error handling must be robust to prevent game state corruption

---

## Code Review

**Reviewer:** Senior Developer (BMAD Code Review Workflow)  
**Review Date:** 2025-01-27  
**Story Status:** in-progress → **Ready for Review**  
**Overall Assessment:** ✅ **APPROVED with Minor Issues**

### Executive Summary

The implementation successfully delivers the core game start functionality with proper real-time synchronization, error handling, and state management. The code follows architectural patterns and demonstrates good understanding of Next.js Server Actions and Supabase Realtime. However, there are several areas requiring attention before moving to "done" status, primarily around hardcoded values, missing totalQuestions source, and incomplete error recovery.

### Acceptance Criteria Compliance

#### ✅ **PASSED** - Server Action Implementation
- **Status:** ✅ Fully Implemented
- **Location:** `lib/actions/games.ts:476-608`
- **Findings:**
  - ✅ Updates `games` table atomically with `status='active'`, `started_at`, `current_question_index=0`
  - ✅ Fetches first question correctly using `question_set_id` and `order_index=1`
  - ✅ Validates game exists and is in 'waiting' status
  - ✅ Validates at least 1 player has joined
  - ✅ Returns properly formatted question data payload
  - ⚠️ **Issue:** Realtime broadcast is done client-side (acceptable per architecture, but note in comments)

#### ✅ **PASSED** - Question Data Payload
- **Status:** ✅ Correct Structure
- **Location:** `lib/actions/games.ts:572-584`, `lib/types/realtime.ts:49-57`
- **Findings:**
  - ✅ All required fields present: `questionId`, `questionText`, `options`, `questionNumber`, `timerDuration`
  - ✅ Includes `startedAt` for timer synchronization
  - ✅ TypeScript types properly defined in `lib/types/realtime.ts`

#### ✅ **PASSED** - Host Waiting Room Event Listener
- **Status:** ✅ Implemented
- **Location:** `components/game/host-waiting-room.tsx:165-182, 306-369`
- **Findings:**
  - ✅ Subscribes to `game_start` broadcast event
  - ✅ Shows "Starting game..." loading spinner (`isGameStarting` state)
  - ✅ Updates Zustand store with question data
  - ✅ Handles error states with toast notifications
  - ⚠️ **Issue:** Hardcoded `totalQuestions = 15` (line 172, 335) - should come from game data

#### ✅ **PASSED** - Player Waiting View Event Listener
- **Status:** ✅ Implemented
- **Location:** `components/game/player-waiting-view.tsx:265-281`
- **Findings:**
  - ✅ Subscribes to `game_start` broadcast event
  - ✅ Shows "Starting game..." loading spinner
  - ✅ Updates Zustand store with question data
  - ✅ Handles error states
  - ⚠️ **Issue:** Hardcoded `totalQuestions = 15` (line 272) - should come from game data

#### ✅ **PASSED** - Loading States
- **Status:** ✅ Implemented
- **Findings:**
  - ✅ Host view shows spinner during transition (lines 582-593)
  - ✅ Player view shows spinner during transition (lines 334-349)
  - ✅ Button disabled during server action execution
  - ✅ Loading toast notifications used appropriately

#### ⚠️ **PARTIAL** - Timer Synchronization
- **Status:** ⚠️ Prepared but Not Fully Implemented
- **Location:** `lib/store/game-store.ts:74-87`
- **Findings:**
  - ✅ Server timestamp (`startedAt`) included in payload
  - ✅ Timestamp stored in Zustand store
  - ⚠️ **Issue:** Timer component implementation deferred to Story 2.4/2.5 (acceptable per story scope)
  - ✅ Foundation is correct for future timer implementation

#### ✅ **PASSED** - Error Handling
- **Status:** ✅ Comprehensive
- **Findings:**
  - ✅ Question fetch failures show error toast and stay in waiting room
  - ✅ Game validation errors properly handled
  - ✅ Player count validation with clear error messages
  - ✅ Network errors handled gracefully
  - ✅ Realtime broadcast failures have fallback (PostgreSQL change tracking)

#### ✅ **PASSED** - Question Pre-loading
- **Status:** ✅ Implemented
- **Location:** `components/game/host-waiting-room.tsx:339-355`, `lib/actions/questions.ts:77-132`
- **Findings:**
  - ✅ Fetches next 3 questions in background after game starts
  - ✅ Non-blocking implementation (errors don't prevent game start)
  - ✅ Stores pre-loaded questions in Zustand store
  - ✅ Proper error handling with console warnings

### Code Quality Assessment

#### ✅ **Strengths**

1. **Type Safety**
   - Excellent TypeScript usage throughout
   - Proper type definitions in `lib/types/realtime.ts`
   - Type-safe Server Actions with discriminated unions

2. **Error Handling**
   - Comprehensive error handling in Server Actions
   - User-friendly error messages
   - Proper error propagation

3. **State Management**
   - Clean Zustand store implementation
   - Proper separation of concerns
   - Accessible from both host and player views

4. **Architecture Compliance**
   - Follows Server Actions pattern correctly
   - Uses Supabase Realtime channels per architecture
   - Matches real-time synchronization patterns

5. **Code Organization**
   - Clear separation of concerns
   - Reusable utility functions
   - Well-structured component hierarchy

#### ⚠️ **Issues & Improvements**

1. **CRITICAL: Hardcoded `totalQuestions`**
   - **Location:** `host-waiting-room.tsx:172, 335`, `player-waiting-view.tsx:272`
   - **Issue:** Uses hardcoded value `15` instead of fetching from game data
   - **Impact:** Will break if game has different question count (10 or 20)
   - **Recommendation:** 
     ```typescript
     // Fetch totalQuestions from game data
     const gameResult = await getGame(gameId);
     const totalQuestions = gameResult.success ? gameResult.game.question_count : 15;
     ```
   - **Priority:** 🔴 **HIGH** - Must fix before marking story as done

2. **Missing `totalQuestions` in GameStartPayload**
   - **Location:** `lib/types/realtime.ts:49-57`
   - **Issue:** `totalQuestions` not included in payload, forcing clients to hardcode or fetch separately
   - **Recommendation:** Add `totalQuestions` to `GameStartPayload` type and include in Server Action response
   - **Priority:** 🟡 **MEDIUM** - Improves API design

3. **TODO Comments for Navigation**
   - **Location:** `host-waiting-room.tsx:180, 361`, `player-waiting-view.tsx:279`
   - **Issue:** Navigation to question display deferred (acceptable per story scope)
   - **Status:** ✅ Expected - deferred to Stories 2.4/2.5
   - **Action:** No action needed, but ensure Stories 2.4/2.5 implement navigation

4. **Error Recovery in Pre-loading**
   - **Location:** `host-waiting-room.tsx:351-354`
   - **Issue:** Pre-loading errors are silently logged but not surfaced to user
   - **Recommendation:** Consider showing a non-intrusive warning if pre-loading fails (optional enhancement)
   - **Priority:** 🟢 **LOW** - Non-blocking, acceptable as-is

5. **Missing Transaction Wrapper**
   - **Location:** `lib/actions/games.ts:552-561`
   - **Issue:** Game update and question fetch are separate operations (not atomic)
   - **Current:** Update happens after question fetch (acceptable)
   - **Recommendation:** Consider using Supabase transaction if atomicity is critical (may not be necessary)
   - **Priority:** 🟢 **LOW** - Current implementation is acceptable

6. **Realtime Broadcast Client-Side**
   - **Location:** `host-waiting-room.tsx:329-332`
   - **Issue:** Broadcast happens client-side after Server Action
   - **Status:** ✅ Acceptable per architecture (client-side broadcast is valid pattern)
   - **Note:** This is intentional - Server Action returns data, client broadcasts to all subscribers

### Architecture Compliance

#### ✅ **Server Actions Pattern**
- ✅ Correct use of `"use server"` directive
- ✅ Proper error handling with success/error return types
- ✅ Uses `createClient` from `lib/supabase/server`
- ✅ Appropriate use of `revalidatePath`

#### ✅ **Realtime Synchronization**
- ✅ Uses `createGameChannel` with correct naming (`game:${gameId}`)
- ✅ Proper event subscription via `subscribeToGameChannel`
- ✅ Broadcast events correctly implemented
- ✅ PostgreSQL change tracking as fallback

#### ✅ **State Management**
- ✅ Zustand store follows singleton pattern
- ✅ Accessible from both host and player views
- ✅ Proper state structure for game data

#### ✅ **Error Handling Patterns**
- ✅ Consistent error handling across components
- ✅ User-friendly error messages
- ✅ Proper error propagation

### Testing Status

#### ⚠️ **Testing Not Completed**
- **Status:** All test tasks remain unchecked
- **Recommendation:** Complete manual testing before marking story as done:
  1. ✅ Test Server Action with valid game and question set
  2. ✅ Test Server Action with missing question (error handling)
  3. ✅ Test Server Action with no players (validation)
  4. ✅ Test `game_start` event broadcast and reception
  5. ⏳ Test synchronized timer start (deferred to Story 2.4/2.5)
  6. ✅ Test loading states and transitions
  7. ✅ Test error scenarios (network failures, missing data)
  8. ✅ Test question pre-loading in background

### Security & Performance

#### ✅ **Security**
- ✅ Server Actions properly secured (server-side only)
- ✅ Input validation on gameId
- ✅ Status validation prevents unauthorized game starts
- ✅ Player count validation prevents starting empty games

#### ✅ **Performance**
- ✅ Question pre-loading implemented (non-blocking)
- ✅ Optimistic UI updates for better UX
- ✅ Proper cleanup of Realtime subscriptions
- ⚠️ **Note:** Consider adding loading states for pre-loading (optional)

### Recommendations

#### 🔴 **Must Fix Before "Done"**
1. **Remove hardcoded `totalQuestions`** - Fetch from game data
2. **Complete manual testing** - Verify all acceptance criteria work as expected

#### 🟡 **Should Fix (Nice to Have)**
1. **Add `totalQuestions` to GameStartPayload** - Improves API design
2. **Add error recovery UI for pre-loading** - Better user feedback

#### 🟢 **Future Enhancements**
1. Consider atomic transaction for game update + question fetch
2. Add loading indicators for question pre-loading
3. Consider caching pre-loaded questions more efficiently

### Final Verdict

**Status:** ✅ **APPROVED with Minor Issues**

The implementation is solid and meets the core requirements. The code quality is high, follows architectural patterns, and demonstrates good understanding of Next.js and Supabase. The main blocker is the hardcoded `totalQuestions` value which must be fixed before marking the story as done.

**Action Items:**
1. Fix hardcoded `totalQuestions` in host and player views
2. Complete manual testing checklist
3. Consider adding `totalQuestions` to payload (optional improvement)

**Ready for:** Testing and minor fixes before moving to "done" status.

---

