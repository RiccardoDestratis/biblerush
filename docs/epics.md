# quizgame - Epic Breakdown

**Author:** Riccardo
**Date:** 2025-01-27
**Project Level:** MVP
**Target Scale:** 50+ weekly active users within 6 months

---

## Overview

This document provides the complete epic and story breakdown for quizgame, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Living Document Notice:** This document incorporates context from PRD, UX Design Specification, and Architecture documents. It will be updated as implementation progresses.

**Epic Summary:**
- **Epic 1:** Foundation & Core Infrastructure (7 stories)
- **Epic 2:** Real-Time Game Engine & Player Experience (7 stories)
- **Epic 3:** Scoring, Leaderboards & Game Completion (6 stories)
- **Epic 4:** Content Infrastructure & AI Visual System (5 stories)
- **Epic 5:** Content Library Completion & Launch Readiness (11 stories)

**Total:** 35 stories across 5 epics

---

## Functional Requirements Inventory

**FR1:** The system shall allow hosts to create a new game room with a unique 6-character alphanumeric room code in under 2 minutes from account creation.

**FR2:** The system shall generate both a scannable QR code and a numeric room ID for each game session to enable player joining via camera scan or manual entry.

**FR3:** The system shall provide 5 pre-curated question sets at launch covering major Bible themes: "Gospels: Life of Jesus," "Old Testament Heroes," "Miracles & Parables," "New Testament Church," and "Bible Basics," totaling 100 theologically accurate questions.

**FR4:** The system shall allow hosts to select a question set and choose game length (10, 15, or 20 questions) before starting a game.

**FR5:** Players shall join games via mobile browser without app download by scanning QR code or entering room ID and providing a display name (2-30 characters).

**FR6:** The system shall display a waiting room on the projector view showing all joined players in real-time with animated entries before game start.

**FR7:** The system shall present multiple-choice questions with 4 answer options (A/B/C/D) simultaneously on both projector and player devices with synchronized timing.

**FR8:** The system shall enforce a 15-second countdown timer per question, displaying time remaining on all devices with visual countdown.

**FR9:** Players shall select an answer option on their mobile device, confirm/lock their selection, and be unable to change after confirmation. If timer expires, the currently selected answer (if any) is automatically submitted.

**FR10:** The system shall calculate scores using: 10 base points for correct answers + speed bonus (0-3 seconds = +5 points, 3-5 seconds = +3 points, >5 seconds = +0 bonus).

**FR11:** After each question timer expires, the system shall display an AI-generated Biblical image related to the correct answer on the projector for 5 seconds with the correct answer overlaid.

**FR12:** The system shall show a live leaderboard after each question displaying the top 10 players with cumulative scores, rank changes, and podium highlighting for top 3.

**FR13:** The system shall advance through all selected questions automatically, maintaining synchronization across all connected devices with <500ms latency.

**FR14:** At game end, the system shall display final results with winner celebration (confetti animation), complete rankings, and game statistics (duration, total questions, accuracy).

**FR15:** The system shall support concurrent gameplay with up to 20 simultaneous players per game session in the free tier, with unlimited players in Pro/Church tiers.

**FR16:** The system shall provide user authentication via email/password and Google OAuth for account creation and session management.

**FR17:** The system shall track user tier (free, pro, church) and enforce usage limits: free tier allows 3 of 5 question sets, 20 players max, 5 games per month (rolling 30-day window).

**FR18:** The system shall maintain a user dashboard showing past games list, usage statistics (games used this month), and prominent "Create New Game" call-to-action.

**FR19:** The system shall display locked question sets with "Pro" badges and upgrade prompts when free tier users attempt to access premium content.

**FR20:** Each question shall include a scripture reference citation for theological traceability and learning reinforcement.

---

## FR Coverage Map

**Epic 1: Foundation & Core Infrastructure**
- Covers infrastructure needs for all FRs
- FR1: Game room creation (Story 1.4)
- FR2: QR code and room ID generation (Story 1.5)
- FR4: Question set selection and game length (Story 1.4)
- FR5: Player join flow (Story 1.6)

**Epic 2: Real-Time Game Engine & Player Experience**
- FR6: Real-time waiting room (Story 2.2)
- FR7: Question display synchronization (Stories 2.4, 2.5)
- FR8: Countdown timer (Stories 2.4, 2.5)
- FR9: Answer selection and locking (Story 2.6)
- FR13: Automatic question advancement (Story 2.7)

**Epic 3: Scoring, Leaderboards & Game Completion**
- FR10: Scoring calculation (Story 3.1)
- FR12: Live leaderboards (Stories 3.4, 3.5)
- FR14: Final results and winner celebration (Stories 3.6, 3.7)

**Epic 4: Content Infrastructure & AI Visual System**
- FR3: Question set infrastructure (Story 4.1)
- FR11: AI-generated images (Stories 4.2, 4.3)
- FR20: Scripture references (Story 4.1)

**Epic 5: Content Library Completion & Launch Readiness**
- FR3: Complete 5 question sets (Story 5.1)
- FR15: Player limit enforcement (Story 5.3)
- FR16: User authentication (Story 5.2)
- FR17: Tier tracking and limits (Story 5.3)
- FR18: User dashboard (Story 5.4)
- FR19: Upgrade prompts (Story 5.3)

---

## Epic 1: Foundation & Core Infrastructure

**Epic Goal:** Establish a production-ready Next.js 15 application with Supabase backend, basic database schema, and game creation capability. Deliver a deployable foundation that all subsequent epics build upon, including developer tooling, core UI components, and the ability for hosts to create game rooms (without full authentication—manual user ID for development speed).

**User Value:** After this epic, hosts can create game rooms and generate QR codes for players to join. Players can scan QR codes and enter their names to join games. This establishes the core user flows before adding real-time gameplay.

### Story 1.1: Project Setup & Development Environment

As a developer,
I want a fully configured Next.js 15 project with TypeScript, Tailwind CSS, shadcn/ui, and essential tooling,
So that I have a solid foundation for rapid feature development with type safety and consistent code quality.

**Acceptance Criteria:**

**Given** I am starting a new project
**When** I initialize the Next.js 15 application
**Then** the project is configured with:
- Next.js 15 using `pnpm create next-app@latest quizgame --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`
- TypeScript strict mode enabled in `tsconfig.json`
- Tailwind CSS configured with custom color palette in `tailwind.config.ts`:
  - Primary: Deep Purple #7C3AED
  - Secondary: Coral Orange #FF6B6B
  - Accent: Bright Teal #14B8A6
  - Success: #22C55E, Error: #EF4444
  - Warm grays: #FAFAF9 to #1C1917
- shadcn/ui initialized with `npx shadcn-ui@latest init` and components directory configured
- pnpm configured as package manager with `pnpm-lock.yaml` committed
- ESLint and Prettier configured with Next.js and TypeScript rules
- Git repository initialized with `.gitignore` for Next.js, `.env*` files, and `node_modules`

**And** the folder structure is created:
- `app/` - Next.js App Router pages
- `components/ui/` - shadcn/ui components
- `components/game/` - Game-specific components
- `lib/` - Utilities and helpers
- `public/` - Static assets

**And** the development server runs successfully on `http://localhost:3000`
**And** environment variables are configured for two environments (MVP best practice):

**Development Environment (Local + Staging Combined):**
- `.env.local` file created (gitignored) with development values
- `.env.example` template created with all required variables and documentation:
  ```bash
  # Supabase - Development Project (used for local dev AND staging)
  NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key
  
  # OpenAI (for image generation)
  OPENAI_API_KEY=your-openai-key
  
  # App Configuration
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NEXT_PUBLIC_ENVIRONMENT=development
  ```
- Environment variable documentation in `README.md` explaining each variable

**Production Environment (Vercel Production):**
- Vercel production deployment from `main` branch
- Supabase production project created (separate from dev)
- Vercel environment variables configured for production:
  - `NEXT_PUBLIC_SUPABASE_URL` (production project)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production project)
  - `SUPABASE_SERVICE_ROLE_KEY` (production project)
  - `NEXT_PUBLIC_APP_URL` (production domain)
  - `NEXT_PUBLIC_ENVIRONMENT=production`

**And** GitHub branch strategy (2 branches for MVP):
- `main` branch: Production deployments (protected, requires PR)
- `staging` branch: Staging/preview deployments (Vercel auto-deploys from this branch)
- Feature branches: Created from `staging`, merged back via PR

**And** Supabase setup (2 projects for MVP):
- **Development Project:** Used for local development AND staging (shared)
  - Can use Supabase branching feature for staging if needed (optional)
  - Or: Use same project for both local dev and staging previews
- **Production Project:** Separate production database with production data

**And** Vercel configuration:
- Production: Deploys from `main` branch automatically
- Preview/Staging: Deploys from `develop` branch automatically
- Environment variables configured per deployment type (Production vs Preview)

**And** environment helper utility created in `lib/utils/env.ts`:
- Function `getEnvironment()`: Returns 'development' | 'production'
- Function `isProduction()`: Boolean check for production environment
- Function `isDevelopment()`: Boolean check for development environment
- Type-safe environment variable access with validation

**And** `README.md` includes:
- Project title and description
- Setup instructions (install, dev server)
- **Step-by-step environment setup guide:**
  - **GitHub Setup:**
    1. Create repository on GitHub
    2. Create `main` branch (default, for production)
    3. Create `staging` branch: `git checkout -b staging && git push -u origin staging`
    4. Set `staging` as default branch for development
  - **Supabase Setup:**
    1. Create Development project: `quizgame-dev` (for local + staging)
    2. Create Production project: `quizgame-prod` (for production)
    3. Copy connection strings to `.env.local` (dev) and Vercel (prod)
    4. Optional: Use Supabase branching for staging if needed
  - **Vercel Setup:**
    1. Connect GitHub repository to Vercel
    2. Configure Production: Deploy from `main` branch
    3. Configure Preview: Auto-deploy from `develop` branch
    4. Set environment variables:
       - Production: Use production Supabase project credentials
       - Preview: Use development Supabase project credentials
  - **Local Development Setup:**
    1. Copy `.env.example` to `.env.local`
    2. Fill in development Supabase credentials
    3. Run `pnpm install && pnpm dev`
- Development workflow: Local dev → Push to `staging` (staging preview) → Merge to `main` (production)
- First commit pushed to GitHub repository

**Prerequisites:** None (first story)

**Technical Notes:**
- Always use `pnpm` commands (never `npm` or `yarn`) per user rules
- Follow Next.js 15 App Router patterns from Architecture document
- Color palette matches UX Design Specification (Soft Lavender theme with Deep Purple primary)
- Project structure follows Architecture document section "Project Structure"
- **Environment Strategy:** Three separate Supabase projects (dev/staging/prod) for clean isolation
- **Vercel Setup:** Preview deployments for staging, production from main branch
- **Security:** Never commit `.env.local` or service role keys to repository

---

### Story 1.2: Supabase Project Setup & Database Schema

As a developer,
I want a Supabase project with initial database schema for users, games, questions, and players,
So that I have backend infrastructure ready to store application data with proper relationships.

**Acceptance Criteria:**

**Given** I have a Supabase account
**When** I create a new Supabase project
**Then** the project is provisioned with PostgreSQL database

**And** database tables are created via SQL migration in Supabase SQL Editor:
- `users` (id UUID PK, email TEXT UNIQUE, display_name TEXT, tier TEXT DEFAULT 'free', locale_preference TEXT DEFAULT 'en', created_at, updated_at)
- `question_sets` (id UUID PK, title TEXT, description TEXT, question_count INT DEFAULT 0, tier_required TEXT DEFAULT 'free', is_published BOOLEAN DEFAULT false, created_at)
- `questions` (id UUID PK, question_set_id UUID FK, question_text TEXT, option_a/b/c/d TEXT, correct_answer CHAR(1), image_url TEXT, scripture_reference TEXT, order_index INT, created_at)
- `games` (id UUID PK, host_id UUID FK users, room_code TEXT UNIQUE, question_set_id UUID FK, question_count INT, status TEXT DEFAULT 'waiting', current_question_index INT DEFAULT 0, started_at, completed_at, created_at)
- `game_players` (id UUID PK, game_id UUID FK games, player_name TEXT, total_score INT DEFAULT 0, joined_at)
- `player_answers` (id UUID PK, game_id UUID FK, player_id UUID FK game_players, question_id UUID FK, selected_answer CHAR(1), is_correct BOOLEAN, response_time_ms INT, points_earned INT, answered_at)

**And** indexes are created for performance:
- `CREATE INDEX idx_games_room_code ON games(room_code);`
- `CREATE INDEX idx_games_status ON games(status);`
- `CREATE INDEX idx_game_players_game_id ON game_players(game_id);`
- `CREATE INDEX idx_player_answers_game_id ON player_answers(game_id);`
- `CREATE INDEX idx_player_answers_player_id ON player_answers(player_id);`

**And** foreign key relationships are established with CASCADE deletes where appropriate
**And** Supabase connection environment variables are added to `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**And** Supabase client helpers are created:
- `lib/supabase/client.ts` - Browser client using `createBrowserClient()`
- `lib/supabase/server.ts` - Server client for Server Components and Server Actions

**And** test connection works: Simple Server Component fetches `question_sets` table (should return empty array)
**And** database is accessible via Supabase Dashboard Table Editor for manual inspection
**And** seed script created: `scripts/seed-test-questions.ts` generates 5-10 test questions for development
**And** migration SQL saved in `/migrations/001_initial_schema.sql` for version control

**Prerequisites:** Story 1.1

**Technical Notes:**
- Database schema matches Architecture document section "Data Architecture"
- Row Level Security (RLS) policies will be added in Epic 5 (NFR8)
- Schema includes `locale_preference` for future i18n support (Architecture section "Internationalization")
- Use Supabase CLI for local development if needed (Architecture section "Development Environment")

---

### Story 1.3: Basic UI Components with shadcn/ui

As a developer,
I want core shadcn/ui components installed and customized for the application,
So that I have reusable, accessible UI building blocks for rapid development.

**Acceptance Criteria:**

**Given** shadcn/ui is initialized
**When** I install core components
**Then** the following components are installed via CLI:
- `button` - Primary, secondary, destructive variants
- `card` - For question set selection and dashboard
- `input` - Text input for room codes, player names
- `label` - Form labels
- `toast` - Toast notifications for errors/success
- `dialog` - Modal dialogs for confirmations
- `badge` - For tier indicators, question counts

**And** components are customized in `components/ui/` to use application color palette:
- Button variants configured: Default (Deep Purple), Secondary (Coral Orange), Outline (Teal border)
- All components use Soft Lavender theme colors from UX Design Specification

**And** typography utilities are created in `lib/utils.ts` for consistent text sizing:
- Projector text: 48px+ for headings, 32px+ for body
- Mobile text: 18px for body, 16px minimum

**And** layout components are created:
- `components/layout/header.tsx` - Top navigation with logo placeholder
- `components/layout/footer.tsx` - Basic footer

**And** test page created at `app/test-components/page.tsx` showcasing all installed components
**And** Tailwind CSS IntelliSense works in VS Code (autocomplete for className values)
**And** responsive breakpoints tested (mobile 375px, desktop 1280px)
**And** dark mode setup skipped for MVP (light mode only, per UX Design)
**And** accessibility verified: Focus indicators visible, keyboard navigation works (WCAG AA compliance)

**Prerequisites:** Story 1.1

**Technical Notes:**
- Component styling follows UX Design Specification section "Component Library"
- Use Lucide React icons (no emojis) per UX Design
- 3D effects and gradients will be added in later stories (UX Design "Game-Like Visual Treatment")
- All components must be WCAG AA compliant (4.5:1 contrast ratio, focus indicators)

---

### Story 1.4: Game Creation Flow - Setup Page

As a host user,
I want to create a new game by selecting a question set and game length,
So that I can configure a game session before inviting players.

**Acceptance Criteria:**

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

**Prerequisites:** Stories 1.1, 1.2, 1.3

**Technical Notes:**
- Server Action in `lib/actions/games.ts` following Architecture patterns
- Room code generation: Use crypto.randomBytes or similar, validate uniqueness
- Question set cards use shadcn/ui Card component with 3D styling (gradients, shadows)
- Follow UX Design "Journey 1: Host Creates and Starts Game" flow
- Wizard/Stepper pattern from UX Design (3 steps, but Step 1 only in this story)

---

### Story 1.5: Waiting Room - Host View with QR Code

As a host user,
I want to see a waiting room with QR code, room ID, and placeholder for joining players,
So that I can share the game code and prepare to start the game.

**Acceptance Criteria:**

**Given** I have created a game
**When** I navigate to `/game/[gameId]/host` (dynamic route, gameId from URL params)
**Then** Server Component fetches game from DB by gameId and verifies `status='waiting'`

**And** I see a full-screen layout optimized for projector (1920x1080):
- Large "Waiting for Players" heading (64px font size, per UX Design)
- QR code generated containing join URL: `https://[APP_URL]/join?code=[room_code]`
- Room code displayed below QR in huge text (80px): "Room Code: ABC123"
- Instructions: "Scan QR code or go to [APP_URL]/join and enter: ABC123" (32px)
- QR code size: 300x300px, centered on screen
- Player list section: "0 Players Joined" placeholder (real-time updates in Epic 2)
- "Start Game" button visible but disabled (will enable in Epic 2 when players join)
- "Cancel Game" button in corner (secondary, destructive style) to delete game and return to creation page

**And** QR code is generated using `qrcode.react` library (install as dependency)
**And** visual styling: Deep purple background gradient, white text, high contrast for projector (per UX Design)
**And** error handling: If gameId invalid or game not found, redirect to `/create` with error toast

**Prerequisites:** Stories 1.1, 1.2, 1.3, 1.4

**Technical Notes:**
- QR code library: `pnpm add qrcode.react @types/qrcode.react`
- Projector optimization: Large text (48px+), high contrast, readable from 20+ feet (UX Design section "Responsive Design")
- Follow UX Design "Waiting Room (Projector View)" specifications
- Cancel Game button triggers Server Action to delete game and all related records (CASCADE)

---

### Story 1.6: Player Join Flow - Join Page & Name Entry

As a player,
I want to join a game by scanning QR code or entering room code and my name,
So that I can participate in the quiz from my mobile phone without downloading an app.

**Acceptance Criteria:**

**Given** I am a player wanting to join a game
**When** I navigate to `/join` (public route, no auth required)
**Then** I see:
- If URL contains `?code=[room_code]` query param (from QR scan), room code input is auto-populated
- Room code input field: 6-character text input (auto-uppercase, auto-format), Label: "Room Code", Placeholder: "ABC123"
- Player name input field: Text input (2-30 characters, trimmed), Label: "Your Name", Placeholder: "Enter your name", Required validation
- "Join Game" button (large, 60px height for touch targets, per UX Design)

**When** I enter a room code and my name and click "Join Game"
**Then** a Server Action is triggered that:
- Validates room code exists in `games` table with `status='waiting'`
- If invalid: Shows error toast "Room code was invalid, please provide the room ID" (per PRD FR5)
- If game status='active' or 'completed': Shows error toast "This game has already started."
- If valid: Inserts player into `game_players` table: `game_id`, `player_name`, `total_score=0`, `joined_at`
- Redirects to `/game/[gameId]/play` (player view)

**And** mobile-optimized layout (375px width):
- Large input fields (48px height)
- Large button (60px height)
- Generous spacing for easy tapping (per UX Design "Touch-First Mobile Design")

**And** QR code scanning: When user scans QR code with phone camera, opens join URL in browser directly
**And** loading state: Button shows spinner during validation/insertion
**And** error handling: Network errors show "Connection failed. Try again."

**Prerequisites:** Stories 1.1, 1.2, 1.3, 1.4, 1.5

**Technical Notes:**
- Server Action in `lib/actions/players.ts`
- Name validation: 2-30 characters, trim whitespace, allow alphanumeric + spaces
- Follow UX Design "Journey 2: Player Joins Game" flow
- QR code deep linking: Browser handles `?code=` parameter automatically
- Mobile-first design: 60px+ tap targets, large fonts (18px+), minimal UI

---

### Story 1.7: Player Waiting View & Basic Dashboard

As a player,
I want to see a waiting screen confirming I joined the game,
So that I know my connection is working while waiting for the host to start.

**Acceptance Criteria:**

**Given** I have joined a game
**When** I navigate to `/game/[gameId]/play` (dynamic route)
**Then** Server Component fetches game by gameId and current player from `game_players` (identify by player name for now)

**And** waiting state UI is displayed when `game.status='waiting'`:
- "Waiting for host to start..." message (24px font)
- Player's name displayed: "Hi, [PlayerName]!" (18px)
- Current player count: "3 players joined" (fetched from `game_players` count)
- Loading animation (pulsing dots or spinner)

**And** mobile-optimized layout (375px):
- Centered content
- Minimal UI (no distractions)
- Easy-to-read text

**And** if game status changes to 'active', shows placeholder message: "Game starting soon..." (real gameplay in Epic 2)
**And** if game not found or player not in game, redirects to `/join` with error toast
**And** visual styling: Coral orange accent color, warm gray background (per UX Design)

**And** basic host dashboard at `/dashboard` (simple placeholder):
- "Your Games" heading
- List of past games (fetch from `games` WHERE `host_id` = current_user, placeholder host ID for now)
- "Create New Game" button linking to `/create`
- Empty state if no games: "No games yet. Create your first game!"

**Prerequisites:** Stories 1.1, 1.2, 1.3, 1.4, 1.5, 1.6

**Technical Notes:**
- Player identification: For MVP, use player name matching (Epic 5 adds proper auth)
- Auto-refresh placeholder: Epic 2 will add Realtime subscription for live updates
- Follow UX Design "Waiting Room (Player View)" specifications
- Dashboard will be enhanced in Epic 5 with full authentication and usage stats

---

**Epic 1 Complete!**

This epic delivers:
- ✅ Full Next.js 15 + Supabase foundation with TypeScript and Tailwind CSS
- ✅ Database schema with all core tables and relationships
- ✅ shadcn/ui components ready for use
- ✅ Host can create games with QR codes and room IDs
- ✅ Players can join via QR scan or manual code entry
- ✅ Waiting rooms ready for both host and players (static for now, real-time in Epic 2)
- ✅ Basic dashboard placeholder for host game history

**Authentication deferred:** Using stubbed host ID for development speed. Real auth added in Epic 5.

---

## Epic 2: Real-Time Game Engine & Player Experience

**Epic Goal:** Build core multiplayer mechanics enabling real-time synchronization across all devices using Supabase Realtime. Implement question display on projector and phones, Select → Confirm/Lock answer submission pattern, and automatic question advancement. Uses 5-10 seed questions for testing. Proves the technical approach works before investing in curated content.

**User Value:** After this epic, hosts can start games and players can answer questions in real-time with synchronized timing. The core gameplay loop works end-to-end, proving the technical architecture before content investment.

### Story 2.1: Supabase Realtime Setup & Game Channels

As a developer,
I want Supabase Realtime configured with game-specific channels for state synchronization,
So that all devices in a game session receive updates instantly via WebSockets.

**Acceptance Criteria:**

**Given** Supabase project is set up
**When** I enable Realtime in Supabase Dashboard project settings
**Then** Realtime is enabled for PostgreSQL changes and broadcast events

**And** real-time helper utility is created in `lib/supabase/realtime.ts`:
- `createGameChannel(gameId: string)` - Creates and returns Realtime channel for game
- `subscribeToGameChannel(channel, callbacks)` - Subscribe with event handlers
- `broadcastGameEvent(channel, event, payload)` - Broadcast event to all subscribers

**And** game channel naming convention: `game:${gameId}` for per-game isolation
**And** channel events are defined as TypeScript types in `lib/types/realtime.ts`:
- `player_joined` - Payload: { playerId, playerName }
- `game_start` - Payload: { startedAt }
- `question_advance` - Payload: { questionIndex, questionData }
- `game_end` - Payload: { completedAt }

**And** PostgreSQL Change tracking is configured via Supabase Realtime:
- Listen to INSERT on `game_players` table (filter by `game_id`)
- Listen to UPDATE on `games` table (filter by `id`, track `status` and `current_question_index` changes)

**And** reconnection logic: Exponential backoff with 3 retry attempts (1s, 2s, 4s delays)
**And** error handling: Display "Connection lost. Reconnecting..." toast if WebSocket drops
**And** connection status indicator component created: `components/game/ConnectionStatus.tsx` (green dot = connected, yellow = reconnecting, red = failed)

**Prerequisites:** Stories 1.1, 1.2

**Technical Notes:**
- Follow Architecture document "Real-Time Game State Synchronization" pattern
- Use Supabase Realtime channels per Architecture section "Novel Pattern Designs"
- Reconnection logic matches NFR2 (90%+ uptime, exponential backoff)
- Channel isolation prevents cross-game leakage (security)

---

### Story 2.2: Real-Time Player List in Waiting Room

As a host user,
I want to see player names appear in real-time as they join the game,
So that I know who's participating before I start the game.

**Acceptance Criteria:**

**Given** I am on the host waiting room
**When** I subscribe to the game channel on mount
**Then** I listen for:
- `player_joined` broadcast event
- PostgreSQL INSERT on `game_players` (fallback/confirmation)

**And** player list section displays:
- Player count: "5 players joined" (updates in real-time)
- Numbered list of player names (1. Alice, 2. Bob, 3. Charlie...)
- List scrollable if >10 players

**When** a new player joins:
**Then** name animates into list with slide-in effect (Framer Motion)
**And** player count increments
**And** brief highlight on new player name (fades after 1 second)

**And** maximum 20 players enforced (free tier limit):
- Server Action rejects join if `COUNT(game_players) >= 20`
- Shows error toast: "Game is full (20 players max). Upgrade to Pro for unlimited."

**And** "Start Game" button enabled when `player_count >= 1`, disabled if 0 players
**And** optimistic UI: Player list updates immediately on broadcast (no wait for DB confirmation)
**And** duplicate player names allowed (no uniqueness check) but numbered (Alice, Alice (2), Alice (3))

**Prerequisites:** Stories 1.5, 2.1

**Technical Notes:**
- Convert host waiting room to Client Component for real-time updates
- Use Framer Motion for animations (per UX Design "Animation Library")
- Follow UX Design "Waiting Room (Projector View)" - animated entries
- Real-time latency target: <500ms (NFR1)

---

### Story 2.3: Game Start & Question Data Loading

As a host user,
I want to start the game and load the first question across all devices,
So that gameplay begins simultaneously for everyone.

**Acceptance Criteria:**

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

**Prerequisites:** Stories 2.1, 2.2

**Technical Notes:**
- Server Action in `lib/actions/games.ts`: `startGame(gameId)`
- Use Zustand store for game state (current question, timer, player answers) per Architecture
- Question pre-loading strategy matches NFR3 (image loading optimization)
- Synchronization: Server timestamp ensures all devices start timer at same time

---

### Story 2.4: Question Display - Projector View

As a host user,
I want questions displayed on the projector with answer options and countdown timer,
So that all players can see the question simultaneously on the shared screen.

**Acceptance Criteria:**

**Given** the game has started
**When** I am on the host question display state (part of `/game/[gameId]/host` page, conditional render)
**Then** I see a full-screen layout optimized for projector (1920x1080):
- Question text displayed at top in large, bold typography (48px, max 3 lines, per UX Design)
- Four answer boxes in 2x2 grid below question:
  - Each box: Large letter label (A/B/C/D) + option text (32px)
  - Boxes have colored borders (purple, orange, teal, green) for visual distinction
- Countdown timer displayed prominently above answer boxes:
  - Circular progress ring or large numbers (80px font)
  - Counts down from 15 to 0 seconds
  - Color changes: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
- Question number and total: "Question 3 of 15" (top-right corner, 24px)
- Player count: "12 players" (top-left corner, 24px)
- Generic background: Solid gradient or subtle pattern (no images yet—Epic 4 adds AI images)

**And** timer implementation:
- Client-side countdown using `setInterval` (1 second ticks)
- Synchronized with server time on load (prevent drift)
- When timer reaches 0, broadcasts `timer_expired` event

**And** answer boxes are non-interactive on projector (view-only, players submit on phones)
**And** smooth transitions: Fade in when question loads, fade out when advancing
**And** responsive fallback: If displayed on smaller screen (laptop), scales down appropriately
**And** accessibility: High contrast text on background, readable from 20+ feet away

**Prerequisites:** Stories 2.1, 2.3

**Technical Notes:**
- Follow UX Design "Question Display (Projector)" specifications
- Timer component: Custom circular timer with Framer Motion animations
- Projector optimization: 48px+ text, high contrast, 16:9 aspect ratio (CR2)
- Timer synchronization: Use server timestamp to prevent client drift

---

### Story 2.5: Question Display - Player Mobile View

As a player,
I want to see the question and answer options on my phone with a countdown timer,
So that I can read the question and select my answer quickly.

**Acceptance Criteria:**

**Given** the game has started
**When** I am on the player question display state (part of `/game/[gameId]/play` page, conditional render)
**Then** I see a mobile-optimized layout (375px-430px width):
- Question text at top (18px font, max 4 lines, scrollable if longer)
- Four answer buttons stacked vertically:
  - Each button: Large tap target (60px height, per UX Design)
  - Letter label (A/B/C/D) + option text (16px, 2 lines max)
  - Buttons use primary/secondary color variants (purple, orange, teal, coral)
- Countdown timer displayed between question and buttons:
  - Progress bar or circular timer (40px height)
  - Numeric countdown (e.g., "12s remaining")

**When** I tap a button to select answer:
**Then** selected button is highlighted (thicker border, darker background)
**And** other buttons remain normal
**And** selection is VISUAL ONLY (not submitted yet)
**And** I can change selection before confirming (tap different button)

**And** "Lock Answer" button appears below answer buttons ONLY after selection:
- Large button (60px height, full width)
- Primary color (deep purple)
- Text: "Lock Answer" or "Confirm"
- Disabled/hidden until selection made

**And** timer counts down (synchronized with host):
- Updates every second
- Color changes: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
- If timer expires before locking, currently selected answer auto-submits (Story 2.6)

**And** question number displayed: "Question 3 of 15" (small text, top)
**And** smooth transitions: Fade in when question loads

**Prerequisites:** Stories 2.1, 2.3, 2.4

**Technical Notes:**
- Follow UX Design "Question View (Phone)" and "Select → Confirm/Lock" pattern
- Touch targets: 60px+ height (CR3, UX Design "Touch-First Mobile Design")
- Answer buttons: All same color initially, turn yellow when selected (UX Design "AnswerButton" component)
- Timer synchronization: Must match projector timer within 500ms (NFR1)

---

### Story 2.6: Answer Submission with Confirm/Lock Pattern

As a player,
I want to lock my answer so it cannot be changed, or have my selection auto-submitted when time expires,
So that my response is recorded fairly without accidental changes.

**Acceptance Criteria:**

**Given** I have selected an answer
**When** I click "Lock Answer" button
**Then** Client Component function:
- Disables all answer buttons (prevent further changes)
- Hides "Lock Answer" button
- Shows "Answer Locked ✓" confirmation message (green text)
- Calculates `responseTimeMs` (time from question start to lock click)
- Calls Server Action: `submitAnswer(gameId, playerId, questionId, selectedAnswer, responseTimeMs)`

**And** Server Action `submitAnswer`:
- Inserts row into `player_answers` table:
  - `game_id`, `player_id`, `question_id`, `selected_answer` (A/B/C/D), `response_time_ms`, `answered_at=NOW()`
  - `is_correct` and `points_earned` NULL (calculated in Epic 3)
- Returns success/error status

**And** after successful submission, player view shows "Waiting for others..." message (replaces lock button)

**When** timer expires before I click "Lock Answer":
**Then** automatically triggers submission with currently selected answer
**And** if no answer selected, submits `selected_answer=NULL` (no response)

**And** player cannot submit multiple times per question (insert-only, no updates)
**And** error handling:
- If submission fails (network error), retries once automatically
- If retry fails, shows toast: "Submission failed. Your answer may not be recorded."
**And** optimistic UI: Shows "Answer Locked ✓" immediately, confirms in background
**And** visual feedback: Brief haptic vibration on lock (if browser supports)

**Prerequisites:** Stories 2.1, 2.3, 2.5

**Technical Notes:**
- Server Action in `lib/actions/answers.ts`
- Follow UX Design "Answer selection" pattern: Click to select (turns yellow), optional confirm/lock, timer auto-submits
- Response time calculation: Use `performance.now()` or Date.now() from question start
- Optimistic updates: Immediate UI feedback, server confirmation in background (Architecture "State Management")

---

### Story 2.7: Question Advancement & Synchronization

As a host user,
I want the game to automatically advance to the next question after all players answer or timer expires,
So that gameplay flows smoothly without manual intervention.

**Acceptance Criteria:**

**Given** a question is active
**When** the timer expires (15 seconds)
**Then** host Client Component:
- Waits 2 additional seconds (brief pause)
- After pause, triggers Server Action: `advanceQuestion(gameId)`

**And** Server Action `advanceQuestion`:
- Updates `games` table: `current_question_index += 1`
- Fetches next question from `questions` table (by `order_index`)
- Broadcasts `question_advance` event with new question data via Realtime

**And** all connected devices (host + players) listen for `question_advance` event:
- Transition to new question display
- Reset timer to 15 seconds
- Clear previous answers/selections

**When** `current_question_index >= question_count`:
**Then** game ends (transition to results—Epic 3)
**And** updates `games` table: `status='completed'`, `completed_at=NOW()`
**And** broadcasts `game_end` event

**And** smooth transitions: Fade out current question, fade in next question (300ms animation)
**And** no blank screens or jarring jumps between questions

**Prerequisites:** Stories 2.1, 2.3, 2.4, 2.5, 2.6

**Technical Notes:**
- Server Action in `lib/actions/games.ts`: `advanceQuestion(gameId)`
- Advancement latency: <500ms (NFR1, FR13)
- Question pre-loading: Fetch next question data during current question phase
- Edge cases: Host disconnect pauses game (no auto-recovery in MVP), player disconnect records NULL answer

---

**Epic 2 Complete!**

This epic delivers the core gameplay loop:
- ✅ Real-time synchronization across all devices using Supabase Realtime
- ✅ Players join and appear in waiting room instantly
- ✅ Game starts simultaneously for everyone
- ✅ Questions display on projector and phones with synchronized timers
- ✅ Select → Confirm/Lock answer submission pattern prevents accidental changes
- ✅ Timer expiry auto-submits current selection
- ✅ Questions advance automatically through entire game
- ✅ All tested with 5-10 seed questions (no curated content or images yet)

**Major technical risk validated:** Real-time sync with 20+ players works reliably.

---

## Epic 3: Scoring, Leaderboards & Game Completion

**Epic Goal:** Implement fair scoring calculations with speed bonuses, display live leaderboards after each question showing player rankings and changes, provide personal feedback to players, and create celebratory final results screens with winner recognition. This completes the competitive gameplay loop that drives engagement and repeat play.

**User Value:** After this epic, players see their scores, compete on leaderboards, and experience satisfying game conclusions with winner celebrations. The competitive element drives engagement and repeat play.

### Story 3.1: Scoring Calculation Engine

As a developer,
I want a reliable scoring calculation function that computes points based on correctness and speed,
So that players are scored fairly and consistently across all games.

**Acceptance Criteria:**

**Given** a question has ended
**When** scoring is calculated
**Then** scoring utility in `lib/game/scoring.ts`:
- Function `calculateScore(isCorrect: boolean, responseTimeMs: number): number`
- Logic:
  - If `isCorrect === false`: return 0
  - If `isCorrect === true`: return 10 + speedBonus
  - Speed bonus:
    - 0-3000ms (0-3 seconds): +5 points → Total 15
    - 3001-5000ms (3-5 seconds): +3 points → Total 13
    - 5001-15000ms (5-15 seconds): +0 points → Total 10

**And** Server Action `processQuestionScores(gameId, questionId)` is created:
- Called automatically after question timer expires (triggered by Epic 2 advancement logic)
- Fetches all `player_answers` for this `game_id` and `question_id`
- Fetches correct answer from `questions` table
- For each answer:
  - Calculates `is_correct` (compare `selected_answer` to `correct_answer`)
  - Calculates `points_earned` using `calculateScore()` function
  - Updates `player_answers` row with `is_correct` and `points_earned`
  - Updates `game_players.total_score` (cumulative sum: `total_score += points_earned`)

**And** tie-breaking rule implemented:
- If two players have same `total_score`, rank by lower cumulative `response_time_ms` (sum across all questions)
- Helper function `calculateRankings(players)` returns sorted array with rank numbers

**And** unit tests for scoring function (Vitest):
- Correct answer, 2s response → 15 points
- Correct answer, 4s response → 13 points
- Correct answer, 10s response → 10 points
- Incorrect answer, any time → 0 points
- No answer (NULL `selected_answer`) → 0 points

**And** error handling: If scoring fails for any player, logs error but continues processing others
**And** performance: Process 20 players' scores in <500ms
**And** after processing, broadcasts `scores_updated` event via Realtime (for leaderboard refresh)

**Prerequisites:** Stories 2.1, 2.6, 2.7

**Technical Notes:**
- Scoring logic matches FR10 exactly
- Server Action in `lib/actions/answers.ts`: `processQuestionScores()`
- Unit tests: 80%+ coverage target (Architecture "Testing Requirements")
- Tie-breaking: Faster total time wins (Architecture "Scoring System")

---

### Story 3.2: Answer Reveal on Projector

As a host user,
I want to see which answer was correct after each question,
So that players learn the right answer before seeing the leaderboard.

**Acceptance Criteria:**

**Given** a question timer has expired
**When** answer reveal state is triggered
**Then** host view transitions to "Answer Reveal" state:
- Display for 5 seconds (static duration, per FR11)
- Layout:
  - Original question text (smaller, 32px, top of screen)
  - Correct answer highlighted with large checkmark icon (✓) and green background
  - Text: "Correct Answer: [Letter] - [Answer Text]" (48px font)
  - Scripture reference below if exists (e.g., "Matthew 2:1" in 24px font)
  - Background: Solid color or subtle gradient (no images yet—Epic 4 adds AI images)
  - Correct answer box from question display (Story 2.4) highlighted in green
  - Incorrect answer boxes remain visible but grayed out

**And** transition animation: Fade in reveal (300ms) after timer reaches zero
**And** reveal state synchronized to all devices via Realtime `answer_reveal` broadcast:
- Host broadcasts event with `correctAnswer` (letter) when entering reveal state
- Players listen and display same reveal on mobile (Story 3.3)

**And** after 5 seconds, automatic transition to leaderboard (Story 3.4)
**And** visual styling: Success green (#22C55E) for correct answer, warm grays for incorrect
**And** accessibility: High contrast, checkmark icon large enough to see from distance (80px)

**Prerequisites:** Stories 2.4, 3.1

**Technical Notes:**
- Follow UX Design "Answer Reveal (Projector)" specifications
- 5-second display matches FR11
- Scripture reference display (FR20) - Epic 4 adds full image reveal
- Synchronization: Broadcast ensures all devices see reveal simultaneously

---

### Story 3.3: Player Answer Feedback

As a player,
I want to see if my answer was correct or incorrect immediately after the timer expires,
So that I get instant feedback on my performance.

**Acceptance Criteria:**

**Given** I have submitted an answer (or timer expired)
**When** answer feedback state is triggered
**Then** player view transitions to feedback state:
- Display until host advances to leaderboard (5 seconds, matches reveal timing)
- Layout (mobile-optimized, 375px):

**If correct:**
- Green checkmark icon (✓) on selected button
- Text: "+[X] points" (large, 32px font, animated count-up)
- Encouraging message: "Correct! Well done!" (24px)

**If incorrect:**
- Red X icon (✗) on selected button
- Text: "Incorrect. Correct answer: [Letter]" (20px)
- Correct answer highlighted in green below
- Points: "+0 points"

**If no answer:**
- Text: "Time's up! No answer submitted."
- Correct answer shown: "Correct answer: [Letter]"
- Points: "+0 points"

**And** cumulative score updated: "Total Score: [X] points" (18px, bottom of screen)
**And** points earned animated: Count up from 0 to actual points (e.g., 0→15 over 500ms)
**And** scripture reference displayed if available (small text, 14px)
**And** visual feedback synced with projector reveal (listen to `answer_reveal` broadcast)
**And** smooth transition: Fade from answer submission to feedback (300ms)
**And** after 5 seconds, automatic transition to personal leaderboard (Story 3.5)

**Prerequisites:** Stories 2.5, 2.6, 3.1, 3.2

**Technical Notes:**
- Follow UX Design "Answer Feedback (Phone)" specifications
- Points animation: Framer Motion count-up effect
- Feedback timing: 5 seconds matches projector reveal (FR11)
- Cumulative score: Updates from `game_players.total_score`

---

### Story 3.4: Live Leaderboard - Projector Display

As a host user,
I want a live leaderboard displayed on the projector after each question,
So that the competitive element engages all participants and creates excitement.

**Acceptance Criteria:**

**Given** answer reveal has completed (5 seconds)
**When** leaderboard display is triggered
**Then** projector transitions to leaderboard display:
- Display for 10 seconds before advancing to next question
- Layout (full-screen, 1920x1080):
  - Large "Leaderboard" heading (64px, centered top)
  - Top 10 players displayed in ranked order (sorted by `total_score` DESC, ties broken by cumulative response time)
  - Each leaderboard row:
    - Rank number (1, 2, 3... or 🥇🥈🥉 for podium)
    - Player name (40px font)
    - Total score (48px font, bold)
    - Rank change indicator (↑ moved up, ↓ moved down, — stayed same)
  - Podium styling for top 3:
    - 1st: Gold background gradient, crown icon
    - 2nd: Silver background, medal icon
    - 3rd: Bronze background, medal icon
  - Remaining 7 players: White/light gray rows
  - If >10 players, show "...and [X] more" at bottom (with total player count)

**And** rank change calculation:
- Compare player's rank after this question vs. previous question
- Store previous rank in Zustand game state
- Display arrow indicator (↑ green, ↓ red, — gray)

**And** score animation: Scores count up from previous total to new total (1 second animation)
**And** ranking animation: Players slide into position (Framer Motion, staggered 100ms delay per row)
**And** visual design: Use secondary colors (coral, teal) for vibrancy, bold typography
**And** current question number displayed: "After Question 5 of 15" (top-right, 24px)
**And** total player count: "15 players" (top-left, 24px)

**And** leaderboard data fetched via Server Action after `processQuestionScores()` completes:
- Query `game_players` WHERE `game_id` ORDER BY `total_score` DESC, cumulative response time
- Return top 10 + total count
- Broadcast `leaderboard_ready` event to sync transition across devices

**And** after 10 seconds, broadcasts `question_advance` to move to next question (or `game_end` if last question)

**Prerequisites:** Stories 2.4, 3.1, 3.2

**Technical Notes:**
- Follow UX Design "Leaderboard (Projector)" specifications
- Server Action in `lib/actions/games.ts`: `getLeaderboard(gameId)`
- Animations: Framer Motion for score count-ups and ranking slides
- Podium styling: 3D effects with gradients (UX Design "Game-Like Visual Treatment")
- Top 10 display matches FR12

---

### Story 3.5: Personal Leaderboard - Player View

As a player,
I want to see my current rank and score after each question on my phone,
So that I know how I'm performing compared to others.

**Acceptance Criteria:**

**Given** answer feedback has completed (5 seconds)
**When** personal leaderboard is triggered
**Then** player view transitions to personal leaderboard:
- Display for 10 seconds (synced with projector leaderboard)
- Layout (mobile-optimized, 375px):

**Personal Stats Section (top, prominent):**
- "You're in [X] place!" (32px font, centered)
- Rank change indicator: "↑ Moved up 2 places!" or "— Stayed in 3rd" (20px)
- Total score: "[X] points" (28px, bold)
- Points earned this round: "+[X] points" (18px, green if gained)

**Top 3 Players (always shown):**
- Podium visual (🥇🥈🥉) with names and scores
- Player's own row highlighted if in top 3 (purple background)

**Context Leaderboard (if player not in top 3):**
- Player immediately above current player
- Current player (highlighted with purple background)
- Player immediately below current player
- E.g., "4. Alice - 45 pts / 5. You - 42 pts / 6. Bob - 40 pts"

**And** encouraging messages based on rank:
- Top 3: "Great job! You're on the podium!" (green text)
- Top 50%: "Keep it up! You're doing well!" (teal text)
- Lower 50%: "You can do it! Stay focused!" (coral text)

**And** visual styling: Player's row has distinct background (deep purple), white text
**And** smooth transition: Fade from feedback to leaderboard (300ms)
**And** leaderboard data fetched from Server Action (same data as projector, filtered for personal view)
**And** listens to `leaderboard_ready` broadcast to sync transition
**And** after 10 seconds, listens for `question_advance` or `game_end` event to proceed

**Prerequisites:** Stories 2.5, 3.1, 3.3, 3.4

**Technical Notes:**
- Follow UX Design "Personal Leaderboard (Phone)" specifications
- Note: Players do NOT see their score after each question (only at end) per UX Design
- Personal rank prominently displayed with encouraging messages
- Context leaderboard shows players above/below for competitive context

---

### Story 3.6: Game Completion & Final Results - Projector

As a host user,
I want a final results screen celebrating the winner and showing all player rankings,
So that the game has a satisfying conclusion and recognizes top performers.

**Acceptance Criteria:**

**Given** the last question's leaderboard has completed
**When** game completion is triggered (by `game_end` broadcast)
**Then** host view transitions to final results:
- Game status updated to `completed` with `completed_at=NOW()` in DB

**Winner Celebration (3 seconds):**
- "Game Over!" heading (80px font)
- Winner's name in huge text (100px): "[Winner Name] Wins!" with trophy icon 🏆
- Confetti animation covering screen (Framer Motion particles in primary colors)
- Background: Gradient with purple/coral/teal

**Full Leaderboard (after confetti clears):**
- All players ranked (1 to N), scrollable if >15 players
- Podium section for top 3 with gold/silver/bronze styling
- Each row: Rank, Player Name, Final Score

**Game stats displayed:**
- Total questions: "[N] questions"
- Game duration: "Completed in [X] minutes"
- Average score: "[X] points per player"

**And** "Play Again" button (bottom-right, large):
- Redirects host to `/create` to start new game

**And** "Dashboard" button (bottom-left, secondary):
- Redirects to `/dashboard` to see past games

**And** visual styling: Celebratory, vibrant colors, high contrast for projector
**And** confetti animation: 3 seconds duration, smooth particles (no flashing, per accessibility)

**Prerequisites:** Stories 2.7, 3.1, 3.4

**Technical Notes:**
- Follow UX Design "Final Results (Projector)" specifications
- Confetti: Framer Motion particles, smooth motion (no flashing per NFR accessibility)
- Winner celebration: 3 seconds matches UX Design
- Game stats: Calculate from `games` table (started_at, completed_at, question_count)

---

### Story 3.7: Game Completion & Final Results - Player View

As a player,
I want to see my final rank and performance statistics at game end,
So that I know how I performed and feel motivated to play again.

**Acceptance Criteria:**

**Given** the game has ended
**When** final results are displayed
**Then** player view shows:

**Final rank with celebratory message:**
- "You finished in [X] place!" (32px font)
- Mini confetti if top 3 (smaller particles, 2 seconds)

**Final score with accuracy:**
- "Final Score: [X] points" (28px, bold)
- "Accuracy: [X]/[N] correct - [Y]%" (e.g., "12/15 correct - 80%")
- Average response time: "[X] seconds average" (18px)

**Top 3 players shown:**
- Podium visual with names and scores
- Player's own row highlighted if in top 3

**Encouraging message based on performance:**
- Top 3: "Outstanding! You're a Bible quiz champion!" (green)
- Top 50%: "Great job! You know your Bible well!" (teal)
- Lower 50%: "Keep studying! You'll do better next time!" (coral)

**And** "Play Again" button (large, full width, 60px height):
- Redirects to `/join` to join another game

**And** visual styling: Mobile-optimized, celebratory but not overwhelming
**And** smooth transition: Fade from last leaderboard to final results (300ms)

**Prerequisites:** Stories 2.5, 3.1, 3.5, 3.6

**Technical Notes:**
- Follow UX Design "Final Results (Phone)" specifications
- Accuracy calculation: Count correct answers / total questions answered
- Average response time: Sum of all response times / number of answers
- Mini confetti: Smaller particle count for mobile performance

---

**Epic 3 Complete!**

This epic delivers the competitive gameplay completion:
- ✅ Fair scoring with speed bonuses (FR10)
- ✅ Answer reveals with correct answer display (FR11)
- ✅ Live leaderboards after each question (FR12)
- ✅ Personal feedback for players
- ✅ Final results with winner celebration (FR14)
- ✅ Complete gameplay loop from start to finish

**Engagement drivers:** Leaderboards, rank changes, and celebrations create excitement and repeat play.

---

## Epic 4: Content Infrastructure & AI Visual System

**Epic Goal:** Build content management system, integrate DALL-E 3 for AI image generation, and deliver ONE fully curated question set (20 questions + images) as proof of concept. This validates the content pipeline works before bulk creation of remaining 4 sets.

**User Value:** After this epic, games include stunning AI-generated Biblical imagery that creates memorable "wow" moments. The content infrastructure enables rapid creation of remaining question sets.

### Story 4.1: Question Set Data Model & Seed Script

As a developer,
I want a robust question set data model with scripture references and seed scripts,
So that I can efficiently create and manage curated Bible question content.

**Acceptance Criteria:**

**Given** the database schema exists (Story 1.2)
**When** I create question sets
**Then** question set structure supports:
- `question_sets` table: `title`, `description`, `question_count`, `tier_required`, `is_published`
- `questions` table: All fields from schema including `scripture_reference` (FR20)
- Questions linked to sets via `question_set_id` foreign key
- `order_index` for question sequencing within set

**And** seed script created: `scripts/seed-question-set.ts`:
- Accepts question set metadata (title, description)
- Accepts array of question objects with:
  - `questionText`, `optionA`, `optionB`, `optionC`, `optionD`, `correctAnswer`, `scriptureReference`
- Inserts question set row
- Inserts all questions with proper `order_index`
- Updates `question_sets.question_count` automatically
- Returns question set ID for image generation (Story 4.2)

**And** "Gospels: Life of Jesus" question set seeded with 20 questions:
- Questions cover major Gospel stories (birth, ministry, miracles, parables, crucifixion, resurrection)
- All questions include scripture references (e.g., "Matthew 2:1", "John 3:16")
- Theologically accurate, denomination-neutral, age-appropriate (NFR7)
- Questions reviewed by 2-3 Christian educators before seeding

**And** question format validation:
- Question text: 10-200 characters
- Each option: 5-100 characters
- Correct answer: Must be A, B, C, or D
- Scripture reference: Format validation (e.g., "Book Chapter:Verse")

**And** seed script executable via: `pnpm run seed:gospels`

**Prerequisites:** Stories 1.2

**Technical Notes:**
- Question set structure matches Architecture "Data Architecture" section
- Scripture references stored as TEXT (FR20)
- Content review process: Manual review before seeding (NFR7)
- Seed script: TypeScript, uses Supabase client for inserts

---

### Story 4.2: AI Image Generation Pipeline with DALL-E 3

As a developer,
I want an automated pipeline to generate AI Biblical imagery for each question,
So that every correct answer has a stunning visual that creates memorable learning moments.

**Acceptance Criteria:**

**Given** I have a question set with questions
**When** I run the image generation script
**Then** script `scripts/generate-images.ts`:
- Accepts question set ID as parameter
- Fetches all questions for that set from database
- For each question:
  - Generates DALL-E 3 prompt based on correct answer and scripture reference
  - Calls OpenAI DALL-E 3 API with prompt
  - Downloads generated image
  - Optimizes image: Compress to <300KB, convert to WebP with JPEG fallback (NFR4)
  - Uploads to Supabase Storage in `question-images/` bucket
  - Updates `questions.image_url` with Supabase Storage URL
  - Logs progress (e.g., "Generated 5/20 images")

**And** DALL-E 3 prompts follow format:
- "A photorealistic Biblical scene showing [answer subject]. Warm lighting, reverent tone, suitable for all ages. No text, no modern elements."
- Example: "A photorealistic Biblical scene showing the birth of Jesus in a stable in Bethlehem. Warm lighting, reverent tone, suitable for all ages. No text, no modern elements."

**And** image optimization:
- Target size: <300KB per image (NFR4)
- Format: WebP with JPEG fallback (CR5)
- Dimensions: 1920x1080 for projector, auto-scaled for mobile
- Compression: Balance quality and bandwidth for church WiFi (5-20 Mbps, NFR4)

**And** error handling:
- If API call fails, retries once with exponential backoff
- If retry fails, logs error and continues with next question
- Placeholder image URL stored if generation fails (fallback in Story 4.3)

**And** cost tracking: Logs total API cost (target: <$50 for 100 images, NFR9)
**And** script executable via: `pnpm run generate:images gospels`

**Prerequisites:** Stories 1.2, 4.1

**Technical Notes:**
- OpenAI API: DALL-E 3, ~$0.04 per image (Architecture "AI Image Delivery")
- Supabase Storage: Public bucket for CDN delivery (Architecture "Storage")
- Image prompts: Follow UX Design "Photography/Imagery" specifications (warm lighting, reverent tone)
- Batch processing: Generate all 20 images for "Gospels" set in one run

---

### Story 4.3: Supabase Storage Integration & Image Pre-loading

As a developer,
I want images stored in Supabase Storage with CDN delivery and pre-loading strategy,
So that images load quickly on projector and mobile devices during gameplay.

**Acceptance Criteria:**

**Given** images are generated and uploaded
**When** images are accessed during gameplay
**Then** Supabase Storage configuration:
- Public bucket `question-images` created with public read access
- CDN enabled with 30-day cache headers (NFR4)
- Images accessible via public URL: `https://[PROJECT].supabase.co/storage/v1/object/public/question-images/[filename]`

**And** image pre-loading strategy implemented:
- During current question phase, pre-load next 3 questions' images in background
- Pre-loading happens on host projector view (larger images)
- Pre-loading happens on player mobile view (smaller compressed versions)
- Images cached in browser cache after first load

**And** image display components:
- `components/game/ImageReveal.tsx` for projector view:
  - Full-screen background image (1920x1080)
  - Dimmed overlay for text readability
  - Correct answer overlaid in large text with drop shadow (48px)
  - Scripture reference below (24px)
  - 5-second display with fade transition (FR11)

**And** fallback handling:
- If image fails to load, shows placeholder with question text
- Placeholder: Gradient background with correct answer text
- Loading state: Skeleton loader while image loads

**And** image optimization for mobile:
- Smaller compressed versions served to mobile (375px width)
- Progressive loading: Low-quality placeholder → Full image
- Bandwidth optimization: <500KB total for 20 questions on mobile (NFR4)

**And** performance targets:
- Image loads on projector within 2 seconds (NFR3)
- Pre-loading ensures next question image ready before needed
- CDN delivery ensures fast global access

**Prerequisites:** Stories 1.2, 4.1, 4.2

**Technical Notes:**
- Supabase Storage: Public bucket with CDN (Architecture "Storage")
- Pre-loading: Load next 3 questions during current question (NFR3)
- Image component: Follow UX Design "ImageReveal" component specifications
- Fallback: Placeholder ensures gameplay continues even if image fails

---

### Story 4.4: Enhanced Answer Reveal with AI Images

As a host user,
I want AI-generated Biblical imagery displayed after each question,
So that players experience memorable visual learning moments that reinforce correct answers.

**Acceptance Criteria:**

**Given** a question timer has expired
**When** answer reveal is triggered
**Then** projector view displays:
- AI-generated image as full background (1920x1080, dimmed overlay)
- Correct answer overlaid in large text with drop shadow (48px): "Correct Answer: [Letter] - [Answer Text]"
- Scripture reference displayed below (24px): "[Book Chapter:Verse]"
- 5-second display with fade transition (FR11)

**And** player mobile view displays:
- Smaller version of same image (375px width, compressed)
- Correct/incorrect indicator (✓/✗) with points earned
- Correct answer shown if wrong
- Scripture reference (small text, 14px)

**And** image reveal animation:
- Fade in image (300ms)
- Text overlays fade in after image (200ms delay)
- Smooth, non-jarring transition from question to reveal

**And** if image fails to load:
- Placeholder gradient background with correct answer text
- Gameplay continues without interruption
- Error logged but not shown to users

**And** image pre-loading:
- Next 3 questions' images loaded during current question phase
- Ensures reveal images ready when needed (NFR3)

**Prerequisites:** Stories 2.4, 3.2, 4.1, 4.2, 4.3

**Technical Notes:**
- Follow UX Design "Answer Reveal (Projector)" with AI images
- Image reveal: 5 seconds matches FR11
- Pre-loading: Ensures <2s load time (NFR3)
- Component: `ImageReveal.tsx` with Framer Motion animations

---

### Story 4.5: Content Validation & Quality Assurance

As a developer,
I want validation and QA processes for question content,
So that all questions are theologically accurate and appropriate for all ages.

**Acceptance Criteria:**

**Given** question content is created
**When** questions are seeded
**Then** validation checks:
- Question text: 10-200 characters, no profanity, appropriate language
- Options: All 4 options are valid (no duplicates, reasonable length)
- Correct answer: Matches one of the 4 options
- Scripture reference: Valid format (Book Chapter:Verse), exists in Bible
- Age-appropriateness: No violent or inappropriate content (NFR7)

**And** content review process:
- Questions reviewed by 2-3 Christian educators before publication
- Review checklist:
  - Theological accuracy
  - Denomination-neutral language
  - Age-appropriateness (middle school through adult)
  - Clear, concise wording
- Review feedback incorporated before seeding

**And** "Gospels: Life of Jesus" set validated:
- All 20 questions reviewed and approved
- Scripture references verified
- Images reviewed for appropriateness (no controversial depictions)

**And** content management:
- Questions marked as `is_published=false` until reviewed
- Only published questions appear in game creation flow
- Admin can unpublish questions if issues found post-launch

**And** error reporting (future):
- Placeholder for user reporting system (Epic 5)
- Questions can be flagged for review

**Prerequisites:** Stories 4.1, 4.2

**Technical Notes:**
- Content validation: Manual review process (NFR7)
- Quality assurance: 2-3 reviewers before publication
- Denomination-neutral: Avoid controversial theological topics (Project Brief)
- Age-appropriateness: Middle school through adult (PRD target users)

---

**Epic 4 Complete!**

This epic delivers the content infrastructure:
- ✅ Question set data model with scripture references (FR20)
- ✅ AI image generation pipeline with DALL-E 3
- ✅ Supabase Storage integration with CDN delivery
- ✅ Image pre-loading for fast reveals
- ✅ Enhanced answer reveals with AI imagery (FR11)
- ✅ ONE complete question set ("Gospels: Life of Jesus") with 20 questions + images

**Content pipeline validated:** Ready for bulk creation of remaining 4 sets in Epic 5.

---

## Epic 5: Content Library Completion & Launch Readiness

**Epic Goal:** Complete remaining 4 question sets (80 questions + images), add authentication, implement freemium model, and polish for public launch. Transforms MVP from prototype to market-ready product.

**User Value:** After this epic, the product is launch-ready with all 5 question sets, user accounts, freemium restrictions, and production-quality polish. Users can sign up, create accounts, and play with curated content.

### Story 5.1: Complete Remaining Question Sets

As a developer,
I want to create the remaining 4 question sets with AI images,
So that the MVP launches with all 5 promised question sets (100 total questions).

**Acceptance Criteria:**

**Given** the "Gospels" set is complete (Epic 4)
**When** I create remaining question sets
**Then** 4 additional sets are created:
- "Old Testament Heroes" (20 questions)
- "Miracles & Parables" (20 questions)
- "New Testament Church" (20 questions)
- "Bible Basics" (20 questions)

**And** each set follows same process:
- Questions written and reviewed by 2-3 Christian educators
- Scripture references included for all questions (FR20)
- Questions seeded via `scripts/seed-question-set.ts`
- Images generated via `scripts/generate-images.ts`
- Images uploaded to Supabase Storage
- Sets marked as `is_published=true`

**And** total content:
- 100 questions across 5 sets (FR3)
- 100 AI-generated images (one per question)
- All questions theologically accurate and age-appropriate (NFR7)

**And** question set metadata:
- Titles and descriptions match PRD FR3
- All sets marked as `tier_required='free'` initially (freemium restrictions in Story 5.3)
- `question_count` updated automatically (20 per set)

**And** content validation:
- All questions pass validation (Story 4.5)
- All images reviewed for appropriateness
- Scripture references verified

**Prerequisites:** Stories 4.1, 4.2, 4.3, 4.5

**Technical Notes:**
- Content creation: Manual process, ~20 questions per set
- Image generation: Batch process, ~$32 for 80 images (NFR9 budget)
- Total cost: ~$40 for 100 images (under $50 target, NFR9)
- Sets ready for freemium tier assignment (Story 5.3)

---

### Story 5.2: User Authentication with Supabase Auth

**Authentication Strategy:**
- **Hosts (Game Creators):** Authentication is **REQUIRED**. Hosts must create an account to create games, access dashboard, and manage their games.
- **Players:** Authentication is **OPTIONAL**. Players can join games anonymously (no account needed), but can optionally create an account to:
  - View their game history and statistics
  - Track their performance across multiple games
  - See personal leaderboards and achievements (future feature)

As a user,
I want to create an account and log in securely,
So that my games are tracked and I can access my dashboard.

**Acceptance Criteria:**

**Given** I am a new user
**When** I navigate to `/login` or `/signup`
**Then** I see authentication forms:
- Signup: Email, password, display name fields
- Login: Email, password fields
- "Sign in with Google" button (OAuth)
- Links to switch between login/signup
- **Note for players:** Optional signup message: "Create an account to track your game history and stats (optional - you can play without an account)"

**When** I sign up with email/password:
**Then** Server Action creates account via Supabase Auth:
- Email validation (RFC 5322 format)
- Password requirements: 8+ characters (Supabase default)
- Display name: 2-30 characters, trimmed
- Inserts row into `users` table: `email`, `display_name`, `tier='free'`, `created_at`
- Sends email verification (Supabase handles)
- Redirects to dashboard after successful signup

**When** I sign in with Google:
**Then** OAuth flow completes via Supabase Auth:
- Google OAuth configured in Supabase Dashboard
- User redirected to Google, then back to app
- User record created/updated in `users` table
- Display name from Google profile (or prompts if missing)

**When** I log in:
**Then** session is managed via Supabase Auth:
- JWT token stored in httpOnly cookie (automatic via Supabase client)
- User redirected to dashboard
- Session persists across page refreshes

**And** authentication pages:
- Mobile-optimized (375px)
- Error handling: Clear messages for invalid credentials, network errors
- Loading states: Spinners during auth operations
- Accessibility: WCAG AA compliant (focus indicators, labels)

**And** protected routes:
- `/dashboard`, `/create` require authentication (hosts only)
- Unauthenticated users attempting to access protected routes redirected to `/login`
- `/join` and `/game/[gameId]/play` remain public (no auth required for players)
- Middleware checks auth status

**And** player experience:
- Players can join games via `/join` without authentication
- Players can optionally create account from join page or after game completion
- Optional account creation allows players to track their game history

**Prerequisites:** Stories 1.1, 1.2

**Technical Notes:**
- Supabase Auth: Email/password + Google OAuth (FR16, Architecture "Authentication")
- Session management: Automatic via Supabase client (Architecture "Authentication")
- Protected routes: Next.js middleware checks auth status
- Follow UX Design "Authentication Screens" specifications
- **Authentication Strategy:** Hosts required, players optional (documented in this story)
- **Note:** RLS policies are implemented in Story 5.2.5 (Security Policies)

---

### Story 5.2.1: Conditional Navigation Based on Authentication & Role

As a user,
I want to see only relevant navigation links based on whether I'm authenticated and my role,
So that the interface is clean and appropriate for my use case.

**Acceptance Criteria:**

**Given** I am not authenticated
**When** I view the header navigation
**Then** I see:
- Home link
- Join Game link (public, for players)
- Login/Signup link
- **NOT** Dashboard link (hosts only)
- **NOT** Create Game link (hosts only)

**Given** I am authenticated as a host
**When** I view the header navigation
**Then** I see:
- Home link
- Create Game link (protected, hosts only)
- Dashboard link (protected, hosts only)
- Join Game link (optional, for testing)
- User menu with: Profile, Logout

**Given** I am authenticated as a player (optional account)
**When** I view the header navigation
**Then** I see:
- Home link
- Join Game link
- My Games/Stats link (if player has game history)
- User menu with: Profile, Logout
- **NOT** Create Game link (hosts only)
- **NOT** Dashboard link (hosts only - different from player stats)

**And** navigation implementation:
- Header component checks authentication status via Supabase client
- Conditionally renders links based on `auth.user` presence
- Role detection: Hosts have created games (or explicit role flag), players have joined games
- Mobile-responsive: Navigation collapses on small screens

**And** route protection:
- Clicking protected links when unauthenticated redirects to `/login` with return URL
- Middleware enforces route protection server-side

**Prerequisites:** Story 5.2 (Authentication)

**Technical Notes:**
- Header component: `components/layout/header.tsx` - convert to check auth status
- Use `createClient()` from `@/lib/supabase/client` to check `auth.getUser()`
- Role detection: Check if user has created games (host) vs only joined games (player)
- Alternative: Add `user_role` field to `users` table ('host' | 'player' | 'both')
- Follow UX Design "Navigation" specifications

---

### Story 5.2.5: Row Level Security (RLS) Policies Implementation

As a developer,
I want Row Level Security policies implemented for all database tables,
So that data access is properly restricted and users can only access their own data.

**Acceptance Criteria:**

**Given** Supabase project is set up and authentication is working
**When** I implement RLS policies
**Then** RLS is enabled on all tables via Supabase SQL Editor:

**Users Table Policies:**
- `users_select_own`: Users can SELECT their own record (WHERE `id = auth.uid()`)
- `users_update_own`: Users can UPDATE their own record (WHERE `id = auth.uid()`)
- `users_insert_own`: Users can INSERT their own record (with `id = auth.uid()`)
- `service_role_full_access`: Service role can perform all operations (for Server Actions)

**Games Table Policies:**
- `games_select_public_waiting`: Anyone can SELECT games with `status='waiting'` (for joining)
- `games_select_own`: Hosts can SELECT their own games (WHERE `host_id = auth.uid()`)
- `games_insert_own`: Authenticated users can INSERT games (with `host_id = auth.uid()`)
- `games_update_own`: Hosts can UPDATE their own games (WHERE `host_id = auth.uid()`)
- `games_delete_own`: Hosts can DELETE their own games (WHERE `host_id = auth.uid()`)

**Game Players Table Policies:**
- `game_players_insert_anyone`: Anyone can INSERT as player (for anonymous joining)
- `game_players_select_game`: Anyone can SELECT players for active games (WHERE `game_id` matches)
- `game_players_select_own`: Players can SELECT their own record (if identifiable)

**Player Answers Table Policies:**
- `player_answers_insert_own`: Players can INSERT their own answers (WHERE `player_id` matches their game_player record)
- `player_answers_select_own`: Players can SELECT their own answers
- `player_answers_select_game_host`: Hosts can SELECT all answers for their games (for leaderboard)
- `player_answers_no_update`: No UPDATE policy (answers are immutable once submitted)

**Question Sets & Questions Tables Policies:**
- `question_sets_select_published`: Anyone can SELECT published question sets
- `question_sets_select_tier`: Free tier users can SELECT free tier sets, Pro/Church can SELECT all
- `questions_select_published`: Anyone can SELECT questions from published sets

**User Usage Table Policies:**
- `user_usage_select_own`: Users can SELECT their own usage records
- `user_usage_update_own`: Service role can UPDATE (via Server Actions)
- `user_usage_insert_own`: Service role can INSERT (via Server Actions)

**And** policies are tested:
- Test that users cannot access other users' data
- Test that hosts can manage their own games
- Test that players can submit answers but not modify them
- Test that anonymous users can join games but not access protected data
- Test that service role can perform administrative operations

**And** policy documentation created in `docs/security-policies.md`:
- List of all policies with descriptions
- Testing approach
- Policy modification procedures

**And** RLS is enabled on all tables:
- `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE games ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE player_answers ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE questions ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;` (if created in Story 5.3)

**And** migration SQL saved in `/migrations/002_rls_policies.sql` for version control

**Prerequisites:** Stories 1.2, 5.2

**Technical Notes:**
- RLS policies match Architecture document "Security Architecture" section
- Policies enforce NFR8 (Security requirements)
- Service role key used in Server Actions for administrative operations
- Anonymous access allowed for game joining (public games with `status='waiting'`)
- Policies tested in all three environments (dev/staging/prod)
- Follow Supabase RLS best practices: explicit policies, no default deny-all without explicit allow

---

### Story 5.3: Freemium Tier Restrictions & Enforcement

As a product owner,
I want free tier users to experience core value but hit clear limits that encourage upgrading,
So that we can convert satisfied users to paying customers.

**Acceptance Criteria:**

**Given** I have a user account
**When** I attempt to create a game or access features
**Then** tier enforcement logic in `lib/auth/tier-check.ts`:
- Function `canCreateGame(userId: string)`: Checks monthly game limit (5 for free tier)
- Function `canAccessQuestionSet(userId: string, setId: string)`: Checks if set is available for tier
- Function `canExceedPlayerLimit(userId: string)`: Checks if user can have >20 players

**And** free tier limits defined in `lib/constants/tiers.ts`:
- Question sets: 3 of 5 (Gospels, Bible Basics, OT Heroes)
- Max players per game: 20
- Max games per month: 5 (rolling 30-day window)
- Features: Basic leaderboard only

**And** usage tracking table created:
- `user_usage` table: `user_id`, `games_created_this_month`, `month_start_date`, `last_game_created_at`
- Tracks monthly game creation count
- Resets on month rollover (day 1 of new month)

**When** free tier user creates game:
**Then** Server Action checks:
- `games_created_this_month < 5` (free tier limit)
- If limit reached, returns error: `{allowed: false, reason: 'monthly_limit'}`
- Shows upgrade modal (Story 5.5)

**When** free tier user selects question set:
**Then** locked sets (Miracles, NT Church) show:
- Lock icon overlay
- "Pro" badge
- Tooltip: "Upgrade to Pro to unlock this question set"
- Disabled state (cannot select)

**When** free tier game reaches 20 players:
**Then** 21st player join attempt is rejected:
- Error message: "Game is full (20 players max). Host can upgrade to Pro for unlimited players."
- Host sees upgrade prompt

**And** UI indicators:
- Dashboard shows: "3 of 5 games used this month" (progress bar)
- Question set cards show lock icon + "Pro" badge on restricted sets
- Usage stats visible in dashboard

**Prerequisites:** Stories 1.2, 5.2

**Technical Notes:**
- Tier enforcement: Server-side validation (security, cannot bypass)
- Usage tracking: Monthly rolling window (30 days from first game)
- Free tier limits match FR17 exactly
- Upgrade prompts: Clear but not aggressive (UX Design "Upgrade Prompts")

---

### Story 5.4: User Dashboard Enhancement

As a host user,
I want to see my past games, usage statistics, and quick access to create new games,
So that I can track my activity and easily start new games.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to `/dashboard`
**Then** I see:

**Header Section:**
- "Your Games" heading (48px, bold)
- "Create New Game" button (large, primary, 3D style, prominent CTA)

**Usage Statistics Card:**
- Tier display: "Free Plan" or "Pro Plan" badge
- Games used this month: "3 of 5 games" (progress bar, visual indicator)
- Player limit: "Up to 20 players per game" (free tier) or "Unlimited players" (Pro)
- Question sets available: "3 of 5 sets" (free tier) or "All sets" (Pro)
- Upgrade CTA if free tier: "Upgrade to Pro" button (secondary, links to /pricing)

**Past Games List:**
- Table or card list of past games:
  - Game date/time (relative: "2 hours ago" or absolute: "Nov 19, 2025")
  - Question set name (e.g., "Gospels: Life of Jesus")
  - Number of players
  - Game status (completed, cancelled)
  - "View Details" link (future: game results page)
- Sorted by most recent first
- Pagination if >10 games
- Empty state: "No games yet. Create your first game!" with CTA button

**Quick Actions:**
- "Create New Game" button (always visible, sticky on mobile)
- "View All Games" link (if >5 games shown)

**And** responsive design:
- Mobile (375px): Stacked layout, full-width cards
- Desktop (1280px+): Two-column layout, side-by-side stats and games

**And** data fetching:
- Server Component fetches games WHERE `host_id = auth.user.id`
- Sorted by `created_at DESC`
- Usage stats calculated from `user_usage` table

**Prerequisites:** Stories 1.2, 1.7, 5.2, 5.3

**Technical Notes:**
- Dashboard matches FR18 requirements
- Usage stats: Real-time calculation from `user_usage` table
- Past games: Query `games` table filtered by `host_id`
- Follow UX Design "Dashboard" specifications
- Empty state: Encouraging, clear CTA

---

### Story 5.5: Upgrade Flow & Pricing Page

As a free tier user,
I want to easily understand pricing and upgrade when I hit limits,
So that I can unlock full platform features when ready.

**Acceptance Criteria:**

**Given** I am a free tier user
**When** I navigate to `/pricing`
**Then** I see pricing page with three-column comparison:

**Free Column:**
- Price: "$0/month"
- Features: 3 question sets, 20 players max, 5 games/month, Basic leaderboard
- "Current Plan" badge if user is free tier

**Pro Column:**
- Price: "$12.99/month"
- Features: All 5+ question sets, Unlimited players, Unlimited games, Basic leaderboard, Downloadable results (coming soon)
- "Upgrade" button (primary, purple, 3D style)

**Church Column:**
- Price: "$299/year (Save 50%!)"
- Features: Everything in Pro, plus Custom questions (Phase 2), Analytics dashboard (Phase 2), Priority support
- "Contact Sales" button (secondary) or "Upgrade" button

**When** I click "Upgrade" on Pro:
**Then** upgrade flow:
- Redirects to Stripe Checkout (or payment provider)
- Pre-fills user email
- Monthly subscription: $12.99/month
- After payment, updates `users.tier = 'pro'` in database
- Redirects back to dashboard with success toast: "Welcome to Pro! All features unlocked."

**When** I hit a free tier limit:
**Then** upgrade modal appears:
- Modal title: "Upgrade to Pro"
- Message: "You've reached your free tier limit. Upgrade to unlock:"
- List of Pro features
- "Upgrade Now" button (links to /pricing)
- "Maybe Later" button (dismisses modal)

**And** pricing page:
- Mobile-optimized (375px): Stacked columns
- Desktop (1280px+): Three-column layout
- Clear feature comparison
- Testimonials or social proof (optional, future)

**Prerequisites:** Stories 5.2, 5.3

**Technical Notes:**
- Payment integration: Stripe Checkout (or similar) for MVP
- Tier update: Webhook or Server Action updates `users.tier` after payment
- Upgrade prompts: Non-intrusive, clear value proposition
- Pricing: $12.99/mo Pro, $299/yr Church (Project Brief)
- Follow UX Design "Upgrade Prompts" pattern

---

### Story 5.6: Production Error Handling & Monitoring

As a developer,
I want comprehensive error handling and monitoring in production,
So that issues are caught early and users experience graceful failures.

**Acceptance Criteria:**

**Given** the application is in production
**When** errors occur
**Then** error handling:

**Client-Side Errors:**
- React Error Boundaries wrap major sections (dashboard, game creation, gameplay)
- Error boundary displays: "Something went wrong. Please refresh the page."
- Errors logged to console in development, structured logs in production
- User-friendly messages: No technical jargon (e.g., "Connection failed. Try again." not "WebSocket timeout")

**Server-Side Errors:**
- Server Actions return: `{success: false, error: {message: string, code?: string}}`
- Error messages: Plain English, actionable
- Never expose technical details (database errors, stack traces)
- Logging: Structured JSON logs with context (user ID, game ID, timestamp)

**Network Errors:**
- Realtime disconnection: "Connection lost. Reconnecting..." with spinner
- Exponential backoff reconnection (1s, 2s, 4s, max 3 retries)
- Graceful degradation: Show cached data if available

**Form Validation Errors:**
- Inline error messages below fields (red text, 14px)
- Real-time validation on blur (after user leaves field)
- Clear error messages: "Room code must be 6 characters" not "Invalid input"

**And** monitoring setup:
- Vercel Analytics: Built-in performance monitoring (Web Vitals, page views)
- Custom event tracking: Track key events (signup, game created, game completed)
- Error tracking: Vercel logs or external service (Sentry optional for MVP)
- Uptime monitoring: External service (UptimeRobot or similar)

**And** error recovery:
- Retry buttons on failed actions
- Clear recovery instructions: "Try refreshing" not "Clear cache and invalidate session"
- Non-critical failures don't break experience (missing image → placeholder)

**Prerequisites:** All previous stories

**Technical Notes:**
- Error handling matches NFR14 requirements
- Monitoring: Vercel Analytics (free tier, Architecture "Error Handling & Monitoring")
- Error boundaries: React Error Boundaries for graceful failures
- User-friendly messages: Plain English, no technical jargon (UX Design "Error Recovery")

---

### Story 5.7: Performance Optimization & Lighthouse Targets

As a developer,
I want the application to meet performance and accessibility targets,
So that users experience fast, accessible gameplay on all devices.

**Acceptance Criteria:**

**Given** the application is built
**When** I run Lighthouse audit
**Then** scores meet targets:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

**And** performance optimizations:
- First Contentful Paint (FCP): <1.5s on 4G (NFR13)
- Time to Interactive (TTI): <3s on 4G (NFR13)
- Image optimization: WebP with JPEG fallback, <300KB per image (NFR4)
- Code splitting: Automatic via Next.js App Router
- Bundle size: Monitor with `pnpm build` analysis

**And** accessibility optimizations:
- Color contrast: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- Keyboard navigation: Supported for dashboard and settings
- Focus indicators: Visible 2px outline in primary color
- ARIA labels: Meaningful labels for screen readers
- Alt text: Descriptive text for AI-generated images

**And** mobile performance:
- Touch targets: 60px+ height (CR3)
- Viewport optimization: 375px-430px support
- Network optimization: Aggressive caching, compression

**And** real-time performance:
- Realtime latency: <500ms p95 (NFR1, FR13)
- Connection stability: 90%+ uptime (NFR2)
- Graceful reconnection: Exponential backoff

**Prerequisites:** All previous stories

**Technical Notes:**
- Performance targets match NFR13 exactly
- Lighthouse audit: Run before launch, fix critical issues
- Accessibility: WCAG AA compliance (UX Design "Accessibility Strategy")
- Real-time latency: Monitor in production, track p95

---

### Story 5.8: Beta Launch Preparation & Documentation

As a product owner,
I want the application ready for beta launch with documentation and launch checklist,
So that we can soft launch with confidence and gather user feedback.

**Acceptance Criteria:**

**Given** all features are complete
**When** preparing for beta launch
**Then** launch checklist completed:

**Technical Readiness:**
- ✅ All 5 question sets seeded with 100 questions + images
- ✅ Authentication working (email/password + Google OAuth)
- ✅ Freemium restrictions enforced
- ✅ Real-time sync tested with 20+ players
- ✅ Error handling comprehensive
- ✅ Performance targets met (Lighthouse >90)
- ✅ Production environment variables configured
- ✅ Custom domain configured (Vercel DNS)
- ✅ SSL certificates active (automatic via Vercel)

**Content Readiness:**
- ✅ All 100 questions reviewed by 2-3 Christian educators
- ✅ All 100 images reviewed for appropriateness
- ✅ Scripture references verified
- ✅ Question sets marked as `is_published=true`

**Documentation:**
- ✅ README.md with setup instructions
- ✅ User guide (simple, 1-page): How to create game, join game, play
- ✅ FAQ page: Common questions (room codes, player limits, etc.)
- ✅ Terms of Service (basic, MVP version)
- ✅ Privacy Policy (basic, MVP version)

**Beta Testing Plan:**
- ✅ 5-10 beta churches identified
- ✅ Beta tester onboarding process
- ✅ Feedback collection method (survey or form)
- ✅ Support channel (email or simple form)

**Monitoring Setup:**
- ✅ Analytics tracking active
- ✅ Error logging configured

---

### Story 5.9: Admin Dashboard for Question Management

As an administrator,
I want an admin dashboard to view, add, edit, and manage questions and question sets,
So that I can easily maintain and expand the question library without direct database access.

**Acceptance Criteria:**

**Given** I am an authenticated admin user (identified by `users.is_admin = true` or `users.tier = 'church'`)
**When** I navigate to `/admin/questions`
**Then** I see admin dashboard with:

**Question Set Management:**
- List of all question sets with: name, description, difficulty, question count, published status
- "Create New Set" button
- Edit/delete actions for each set
- Filter/search by name, difficulty, published status

**Question Management:**
- Table view of all questions with columns:
  - Question text (truncated)
  - Question Set
  - Correct Answer
  - Has Image (yes/no)
  - Actions (Edit, Delete, Regenerate Image)
- Pagination (50 questions per page)
- Filter by question set, search by question text
- "Add Question" button (manual entry)
- "Bulk Upload" button (CSV import)

**Manual Question Entry:**
**When** I click "Add Question"
**Then** I see form with fields:
- Question Set (dropdown)
- Question Text (textarea)
- Option A, B, C, D (text inputs)
- Correct Answer (radio: A/B/C/D)
- Scripture Reference (text input)
- Verse Content (textarea, optional)
- Image Content Prompt (textarea for DALL-E prompt)
- Image Style (textarea for DALL-E style)
- Upload Custom Image (file upload, optional - overrides AI generation)
- Difficulty (dropdown: beginner/intermediate/advanced, optional)

**When** I submit the form:
**Then** question is created in database
**And** if image prompt provided: AI image is generated via DALL-E 3 and uploaded to Supabase Storage
**And** if custom image uploaded: Image is uploaded to Supabase Storage
**And** success toast: "Question created successfully"

**CSV Bulk Upload:**
**When** I click "Bulk Upload"
**Then** I see upload interface:
- File picker (accepts .csv)
- Format specification link/help text
- "Upload" button

**CSV Format:**
```csv
set_name,set_description,difficulty,question,option_a,option_b,option_c,option_d,right_answer,verse_content,verse_reference,image_content_prompt,image_style
"Foundations: Biblical Essentials","Core truths and fundamental stories",beginner,"What is the first book of the Bible?","Exodus","Psalms","Genesis","Matthew","Genesis","In the beginning God created the heavens and the earth.","Genesis 1:1","Ancient Hebrew scroll opened to first words circa 400 BC Middle East, aged parchment with Hebrew text visible, warm candlelight illuminating the writing, simple wooden reading stand, stone wall background, scholarly atmosphere of ancient Jewish scriptorium","Photorealistic, historically accurate biblical scene, warm candlelight, cinematic composition, reverent tone suitable for all ages, cultural authenticity of ancient Middle Eastern period, 8K quality"
```

**When** I upload valid CSV:
**Then** CSV is parsed and validated
**And** for each row:
  - Question set is created if doesn't exist (or matched if exists)
  - Question is created with all fields
  - If `image_content_prompt` provided: AI image generated and uploaded
  - Progress indicator shows: "Processing 1 of 20 questions..."
**And** success summary: "20 questions imported successfully. 3 images generated."
**And** errors shown if any rows fail: "Row 5: Invalid correct_answer. Must be A, B, C, or D."

**Image Management:**
**When** I view a question in the table
**Then** I see "Regenerate Image" button if image exists
**And** I see "Generate Image" button if no image exists

**When** I click "Regenerate Image":
**Then** modal appears:
  - Current image preview (if exists)
  - Image Content Prompt (editable textarea)
  - Image Style (editable textarea)
  - "Upload Custom Image" option (file picker)
  - "Generate with DALL-E" button
  - "Upload Custom" button
  - "Cancel" button

**When** I click "Generate with DALL-E":
**Then** DALL-E 3 API is called with prompt + style
**And** new image is generated and uploaded to Supabase Storage
**And** `questions.image_url` is updated
**And** success toast: "Image regenerated successfully"
**And** old image is deleted from storage (optional cleanup)

**When** I upload custom image:
**Then** image is validated (format: PNG/JPEG/WebP, max 5MB)
**And** image is uploaded to Supabase Storage
**And** `questions.image_url` is updated
**And** success toast: "Custom image uploaded successfully"

**Question Editing:**
**When** I click "Edit" on a question
**Then** I see edit form (same as "Add Question" but pre-filled)
**And** I can modify any field
**And** I can regenerate/change image
**And** "Save Changes" button updates question in database

**Database Schema Updates:**
**Given** admin dashboard is implemented
**Then** database schema includes new fields:

```sql
-- Add to question_sets table:
ALTER TABLE question_sets ADD COLUMN difficulty TEXT; -- 'beginner', 'intermediate', 'advanced'
ALTER TABLE question_sets ADD COLUMN is_published BOOLEAN DEFAULT true;

-- Add to questions table:
ALTER TABLE questions ADD COLUMN verse_content TEXT; -- Full verse text
ALTER TABLE questions ADD COLUMN image_content_prompt TEXT; -- DALL-E prompt
ALTER TABLE questions ADD COLUMN image_style TEXT; -- DALL-E style
ALTER TABLE questions ADD COLUMN is_custom_image BOOLEAN DEFAULT false; -- True if uploaded, false if AI-generated

-- Add to users table (if not exists):
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
```

**Security:**
- Admin routes protected: `/admin/*` requires `is_admin = true` or `tier = 'church'`
- RLS policies: Admins can read/write all questions and question_sets
- CSV upload: Validated server-side, max file size 10MB
- Image upload: Validated format and size server-side

**Prerequisites:** Stories 5.2 (Auth), 4.2 (AI Image Generation)

**Technical Notes:**
- Admin dashboard uses shadcn/ui components (DataTable, Form, FileUpload)
- CSV parsing: Use `papaparse` or similar library
- Image upload: Supabase Storage with public bucket
- DALL-E integration: Reuse logic from Story 4.2
- Admin check: Middleware or Server Action validates `is_admin` or `tier = 'church'`
- Follow UX Design patterns for admin interfaces (clean, functional, not game-styled)

**CSV Format Specification:**
- Headers: `set_name`, `set_description`, `difficulty`, `question`, `option_a`, `option_b`, `option_c`, `option_d`, `right_answer`, `verse_content`, `verse_reference`, `image_content_prompt`, `image_style`
- All fields except `verse_content`, `image_content_prompt`, `image_style` are required
- `right_answer` must be exactly "A", "B", "C", or "D" (case-sensitive)
- `difficulty` must be "beginner", "intermediate", or "advanced" (case-insensitive)
- CSV encoding: UTF-8
- Line breaks in text fields: Use `\n` or quoted fields with actual line breaks

---
- ✅ Uptime monitoring active
- ✅ Usage metrics dashboard (basic)

**Launch Communication:**
- ✅ Beta launch announcement (email or social)
- ✅ Beta tester instructions
- ✅ Feedback collection process

**Prerequisites:** All previous stories

**Technical Notes:**
- Beta launch: Soft launch with 5-10 churches (Project Brief "Beta Launch")
- Documentation: Keep simple for MVP, expand in Phase 2
- Support: Email or simple contact form (no live chat in MVP)
- Feedback: Post-game survey or email collection

---

**Epic 5 Complete!**

This epic delivers launch readiness:
- ✅ All 5 question sets complete (100 questions + images, FR3)
- ✅ User authentication (FR16)
- ✅ Freemium tier restrictions (FR17, FR19)
- ✅ User dashboard (FR18)
- ✅ Upgrade flow and pricing
- ✅ Production error handling (NFR14)
- ✅ Performance optimization (NFR13)
- ✅ Beta launch preparation

**MVP Complete:** Product is ready for beta launch with all core features and content.

---

## FR Coverage Matrix

**FR1:** Game room creation → Epic 1, Story 1.4
**FR2:** QR code and room ID generation → Epic 1, Story 1.5
**FR3:** 5 pre-curated question sets (100 questions) → Epic 4, Story 4.1; Epic 5, Story 5.1
**FR4:** Question set selection and game length → Epic 1, Story 1.4
**FR5:** Player join via QR code or room ID → Epic 1, Story 1.6
**FR6:** Real-time waiting room → Epic 2, Story 2.2
**FR7:** Question display synchronization → Epic 2, Stories 2.4, 2.5
**FR8:** 15-second countdown timer → Epic 2, Stories 2.4, 2.5
**FR9:** Answer selection and locking → Epic 2, Story 2.6
**FR10:** Scoring calculation → Epic 3, Story 3.1
**FR11:** AI-generated image reveal → Epic 4, Story 4.4
**FR12:** Live leaderboard → Epic 3, Stories 3.4, 3.5
**FR13:** Automatic question advancement → Epic 2, Story 2.7
**FR14:** Final results with winner celebration → Epic 3, Stories 3.6, 3.7
**FR15:** Player limit enforcement (20 free, unlimited Pro) → Epic 5, Story 5.3
**FR16:** User authentication → Epic 5, Story 5.2 (Auth implementation) + Story 5.2.5 (RLS policies for security)
**FR17:** Tier tracking and limits → Epic 5, Story 5.3
**FR18:** User dashboard → Epic 5, Story 5.4
**FR19:** Upgrade prompts → Epic 5, Story 5.5
**FR20:** Scripture references → Epic 4, Story 4.1

**All 20 functional requirements are covered by stories across the 5 epics.**

---

## Summary

This epic breakdown decomposes the Bible Memory Quiz Game PRD into 34 implementable stories across 5 epics, organized by user value delivery:

**Epic 1: Foundation & Core Infrastructure (7 stories)**
- Establishes Next.js 15 + Supabase foundation with three-environment setup (dev/staging/prod)
- Enables game creation and player joining
- Delivers QR code generation and waiting rooms

**Epic 2: Real-Time Game Engine & Player Experience (7 stories)**
- Implements real-time synchronization with Supabase Realtime
- Delivers core gameplay loop: questions, answers, advancement
- Validates technical architecture with 5-10 seed questions

**Epic 3: Scoring, Leaderboards & Game Completion (6 stories)**
- Implements fair scoring with speed bonuses
- Delivers live leaderboards and personal feedback
- Creates celebratory final results with winner recognition

**Epic 4: Content Infrastructure & AI Visual System (5 stories)**
- Builds content management system
- Integrates DALL-E 3 for AI image generation
- Delivers ONE complete question set (20 questions + images) as proof of concept

**Epic 5: Content Library Completion & Launch Readiness (11 stories)**
- Completes remaining 4 question sets (80 questions + images)
- Adds user authentication with Row Level Security (RLS) policies
- Implements freemium model with tier restrictions
- Polishes for production launch with error handling and performance optimization

**Total:** 36 stories, all functional requirements covered, ready for Phase 4 implementation.

**Context Incorporated:**
- ✅ PRD requirements (all 20 FRs mapped)
- ✅ UX Design interaction patterns and component specifications
- ✅ Architecture technical decisions and API contracts

**Next Steps:**
- Ready for Phase 4: Sprint Planning and story implementation
- Use `create-story` workflow to generate individual story implementation plans
- Begin with Epic 1, Story 1.1: Project Setup & Development Environment

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document incorporates context from PRD, UX Design Specification, and Architecture documents. It will be updated as implementation progresses._
