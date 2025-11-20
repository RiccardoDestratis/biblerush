# Story 1.4: Game Creation Flow - Setup Page

Status: done

## Story

As a host user,
I want to create a new game by selecting a question set and game length,
So that I can configure a game session before inviting players.

## Acceptance Criteria

**Given** I am on the game creation page
**When** I navigate to `/create` (public route for MVP - auth later)
**Then** I see:
- Page header: "Create New Game" with brief instructions
- Question set selection displayed as cards in responsive grid (2 columns desktop, 1 mobile)
- Each card shows: Title, description, question count badge, tier indicator
- 5 placeholder cards with titles: "Gospels: Life of Jesus," "Old Testament Heroes," "Miracles & Parables," "New Testament Church," "Bible Basics"
- Sets 2-5 have "Coming Soon" overlay and disabled state (only "Gospels" selectable initially)
- Selected question set highlighted with purple border (3D effect per UX Design)
- Game length selector below sets: Radio buttons for 10, 15, 20 questions (default 15 selected)
- "Create Game" button at bottom (shadcn/ui Button, primary variant, large 3D style)

**When** I select a question set
**Then** the selected card highlights with 3D effect and "Create Game" button enables

**When** I click "Create Game"
**Then** a Server Action is triggered that:
- Generates unique 6-character room code (uppercase alphanumeric, check uniqueness in DB)
- Inserts row into `games` table: `host_id` (stubbed UUID for now), `room_code`, `question_set_id`, `question_count`, `status='waiting'`, `created_at`
- Redirects to `/game/[gameId]/host` (waiting room)

**And** error handling: If DB insert fails, show toast notification "Failed to create game. Try again."
**And** loading state: Button shows spinner during creation
**And** responsive layout works on mobile (375px) and desktop (1280px+)

## Tasks / Subtasks

- [x] Create Server Action for game creation (AC: Server Action)
  - [x] Create `lib/actions/games.ts` with `createGame` function
  - [x] Implement room code generation (6-character, uppercase alphanumeric)
  - [x] Check room code uniqueness in database
  - [x] Insert game record with stubbed host_id
  - [x] Return game ID for redirect
  - [x] Handle placeholder question set IDs (create if doesn't exist)
- [x] Create `/create` page (AC: Page layout)
  - [x] Create `app/create/page.tsx`
  - [x] Add page header with instructions
  - [x] Create responsive grid layout (2 columns desktop, 1 mobile)
- [x] Create question set selection cards (AC: Question set cards)
  - [x] Create question set card component (`components/game/question-set-card.tsx`)
  - [x] Display 5 placeholder question sets
  - [x] Add "Coming Soon" overlay for sets 2-5
  - [x] Implement selection state with 3D highlight effect
  - [x] Add question count badge and tier indicator
- [x] Add game length selector (AC: Game length selector)
  - [x] Create radio button group for 10, 15, 20 questions
  - [x] Set default to 15 questions
  - [x] Style with shadcn/ui RadioGroup component
- [x] Add Create Game button (AC: Create button)
  - [x] Large button with 3D styling
  - [x] Disabled until question set selected
  - [x] Show loading spinner during creation
- [x] Implement error handling and loading states (AC: Error handling)
  - [x] Toast notifications for errors
  - [x] Loading state on button
  - [x] Redirect on success using useRouter
- [x] Test responsive layout (AC: Responsive layout)
  - [x] Build successful - no compilation errors
  - [x] Responsive grid (1 column mobile, 2 columns desktop)

## Dev Notes

### Relevant Architecture Patterns
- Server Actions in `lib/actions/games.ts` following Architecture patterns [Source: docs/architecture.md#Server-Actions]
- Room code generation: Use crypto.randomBytes or similar, validate uniqueness [Source: docs/epics.md#Story-1.4]
- Question set cards use shadcn/ui Card component with 3D styling (gradients, shadows) [Source: docs/epics.md#Story-1.4]
- Follow UX Design "Journey 1: Host Creates and Starts Game" flow [Source: docs/epics.md#Story-1.4]

### Source Tree Components to Touch
- `app/create/page.tsx` - Game creation page (new)
- `lib/actions/games.ts` - Server Action for game creation (new)
- `components/game/question-set-card.tsx` - Question set card component (new, optional)
- `components/ui/radio-group.tsx` - Radio group component (already installed)

### Testing Standards Summary
- Manual testing: Create game flow, error handling, responsive layout
- Test room code uniqueness
- Test redirect to waiting room
- No automated tests required for this story

### Project Structure Notes
- Server Actions follow Next.js 15 App Router patterns [Source: docs/architecture.md#Server-Actions]
- Room code: 6-character uppercase alphanumeric [Source: docs/epics.md#Story-1.4]
- Host ID stubbed for MVP (auth in Epic 5) [Source: docs/epics.md#Story-1.4]

### References
- [Source: docs/epics.md#Story-1.4] - Story acceptance criteria and technical notes
- [Source: docs/ux-design-specification.md] - Design patterns and component styling
- [Source: docs/architecture.md#Server-Actions] - Server Action patterns

