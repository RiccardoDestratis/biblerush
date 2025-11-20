# Architecture

## Executive Summary

Bible Memory Quiz Game uses a Next.js 15 App Router architecture with Supabase for real-time synchronization, optimized for a two-screen experience (projector host view + mobile player views). The architecture emphasizes real-time game state synchronization across multiple devices, AI-generated content delivery, and internationalization support for three languages (English, German, Italian) starting with English-only development.

**Key Architectural Principles:**
- Server Actions over API Routes for type-safe mutations
- React Server Components for optimal performance
- Supabase Realtime for sub-500ms game state synchronization
- i18n-ready structure for multilingual UI and content
- Projector-optimized layouts with mobile-first player experience

---

## Project Initialization

**First implementation story should execute:**

```bash
pnpm create next-app@latest quizgame --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

**Note:** Always use `pnpm` as package manager (never npm or yarn)

This establishes the base architecture with these decisions:
- Next.js 15 with App Router
- TypeScript with strict mode
- Tailwind CSS for styling
- ESLint for code quality
- No `src/` directory (root-level app/ directory)

---

## Decision Summary

| Category | Decision | Version | Affects FR Categories | Rationale |
| -------- | -------- | ------- | --------------------- | --------- |
| **Framework** | Next.js | 15.x | All | Modern App Router, Server Components, Server Actions |
| **Language** | TypeScript | 5.x (strict mode) | All | Type safety, better DX, catch errors at compile time |
| **Package Manager** | pnpm | Latest | All | Faster installs, better disk efficiency, workspace support |
| **Styling** | Tailwind CSS | 3.x | UI/UX | Utility-first, projector-optimized, rapid development |
| **Component Library** | shadcn/ui | Latest | UI/UX | Accessible, customizable, game-style components |
| **Animation** | Framer Motion | 10.x | Game UI | Confetti, score animations, smooth transitions |
| **Icons** | Lucide React | Latest | All | Consistent, no emojis, professional iconography |
| **Database** | PostgreSQL (Supabase) | 15+ | Data Persistence | ACID compliance, JSON support, proven reliability |
| **ORM/Query** | Supabase Client | Latest | Data Access | Native integration, real-time subscriptions, RLS |
| **Real-Time** | Supabase Realtime | Latest | Game State | WebSocket infrastructure, <500ms latency, proven scale |
| **Authentication** | Supabase Auth | Latest | User Management | Email/password + Google OAuth, session management |
| **Storage** | Supabase Storage | Latest | Media Assets | AI-generated images, CDN delivery, 30-day cache |
| **Internationalization** | next-intl | 3.x | UI & Content | Next.js 15 App Router support, type-safe translations |
| **Hosting** | Vercel | Latest | Deployment | Zero-config Next.js deployment, edge network, serverless |
| **AI Image Gen** | OpenAI DALL-E 3 | Latest | Content | Pre-generated Biblical imagery, batch processing |
| **Unit Testing** | Vitest | Latest | Testing | Fast unit tests for business logic, scoring, game state |
| **E2E Testing** | Playwright | Latest | Testing | Multi-device e2e tests for critical user flows, real-time sync validation |
| **Browser Automation** | Browser MCP | Latest | Testing | AI-powered browser automation for visual regression, accessibility, complex flows |
| **Database Testing** | Supabase MCP | Latest | Testing | Automated database operations, migrations, RLS validation, test data management |
| **Load Testing** | Artillery/k6 | Latest | Testing | Simulate 50+ concurrent players to validate real-time sync at scale |

---

## Project Structure

```
quizgame/
├── app/                          # Next.js 15 App Router
│   ├── [locale]/                 # i18n route segment (en, de, it)
│   │   ├── (auth)/               # Auth routes (login, signup)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── dashboard/        # User dashboard
│   │   │   ├── games/            # Past games list
│   │   │   └── settings/         # Account settings + language
│   │   ├── admin/                # Admin routes (requires is_admin or tier='church')
│   │   │   └── questions/        # Question management dashboard
│   │   ├── create/               # Create new game flow
│   │   ├── game/
│   │   │   └── [gameId]/
│   │   │       ├── host/         # Projector/host view
│   │   │       ├── play/         # Player view
│   │   │       └── results/      # Final results
│   │   ├── join/                 # Join game by code
│   │   ├── pricing/              # Upgrade/Church license
│   │   ├── layout.tsx            # Root layout with i18n provider
│   │   └── page.tsx              # Home page
│   ├── api/                      # API routes (webhooks only)
│   │   └── webhooks/             # Supabase webhooks
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── toast.tsx
│   │   └── ...                   # Other shadcn components
│   ├── game/                     # Game-specific components
│   │   ├── AnswerButton.tsx      # Game-style answer buttons
│   │   ├── Timer.tsx             # Circular countdown timer
│   │   ├── Leaderboard.tsx       # Podium-style leaderboard
│   │   ├── ScoreDisplay.tsx      # Animated score counter
│   │   ├── QRCodeDisplay.tsx     # QR code generator
│   │   ├── WaitingRoom.tsx       # Waiting room display
│   │   ├── QuestionDisplay.tsx   # Projector question view
│   │   ├── AutoModeToggle.tsx    # Auto-advance toggle
│   │   └── ImageReveal.tsx       # AI image reveal animation
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageSwitcher.tsx  # i18n language selector
│   └── providers/                # Context providers
│       ├── SupabaseProvider.tsx
│       └── RealtimeProvider.tsx
├── lib/                          # Shared utilities and logic
│   ├── actions/                  # Server Actions
│   │   ├── games.ts              # Game CRUD operations
│   │   ├── players.ts            # Player join/leave
│   │   ├── answers.ts            # Answer submission
│   │   ├── questions.ts          # Question fetching
│   │   ├── users.ts              # User management
│   │   └── translations.ts       # Translation fetching
│   ├── supabase/                 # Supabase clients and helpers
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── realtime.ts           # Realtime helpers
│   ├── i18n/                     # Internationalization
│   │   ├── config.ts             # next-intl configuration
│   │   ├── request.ts            # Server-side i18n request
│   │   ├── translations.ts       # Translation fetching from Supabase
│   │   └── cache.ts              # Translation caching
│   ├── scoring.ts                # Score calculation logic
│   ├── game-state.ts             # Game state machine
│   ├── utils.ts                  # General utilities
│   └── hooks/                    # Custom React hooks
│       ├── useRealtime.ts        # Realtime subscription hook
│       ├── useGameState.ts       # Game state management
│       └── useTranslations.ts    # i18n hook wrapper
├── public/                       # Static assets
│   ├── images/                   # Static images
│   └── icons/                    # App icons
├── scripts/                      # Utility scripts
│   ├── generate-images.ts        # Batch AI image generation
│   ├── seed-questions.ts         # Seed question sets
│   └── migrate-translations.ts   # Translation migration (future)
├── e2e/                          # End-to-end tests (Playwright)
│   ├── game-flow.spec.ts         # Critical game flow tests
│   ├── realtime-sync.spec.ts     # Real-time synchronization tests
│   ├── fixtures/                 # Test fixtures and helpers
│   └── playwright.config.ts      # Playwright configuration
├── types/                        # TypeScript types
│   ├── database.ts               # Supabase generated types
│   ├── game.ts                   # Game-related types
│   ├── i18n.ts                   # i18n types
│   └── index.ts
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js              # ESLint configuration
├── prettier.config.js            # Prettier configuration
├── pnpm-workspace.yaml           # pnpm workspace config
├── package.json                  # Dependencies (pnpm)
├── pnpm-lock.yaml                # Lock file (pnpm)
└── README.md                     # Project documentation
```

---

## FR Category to Architecture Mapping

| FR Category | Lives In | Components | Server Actions | Database Tables |
| ----------- | -------- | ---------- | -------------- | --------------- |
| **Game Creation** | `app/[locale]/create/` | `GameSetup.tsx`, `QuestionSetSelector.tsx` | `lib/actions/games.ts` | `games`, `question_sets` |
| **Player Joining** | `app/[locale]/join/`, `app/[locale]/game/[id]/play/` | `JoinScreen.tsx`, `WaitingRoom.tsx` | `lib/actions/players.ts` | `game_players` |
| **Gameplay Flow** | `app/[locale]/game/[id]/host/`, `app/[locale]/game/[id]/play/` | `QuestionDisplay.tsx`, `AnswerButton.tsx`, `Timer.tsx` | `lib/actions/answers.ts`, `lib/actions/games.ts` | `games`, `player_answers` |
| **Real-Time Sync** | `lib/supabase/realtime.ts`, `components/providers/` | `RealtimeProvider.tsx`, `useRealtime.ts` | N/A (Realtime subscriptions) | All tables (via Realtime) |
| **Scoring System** | `lib/scoring.ts` | `Leaderboard.tsx`, `ScoreDisplay.tsx` | `lib/actions/answers.ts` | `player_answers` |
| **Question Library** | `lib/actions/questions.ts` | `QuestionSetSelector.tsx` | `lib/actions/questions.ts` | `questions`, `question_sets` |
| **AI Visuals** | `components/game/ImageReveal.tsx` | `ImageReveal.tsx` | N/A (pre-generated) | `questions.image_url` (Supabase Storage) |
| **User Auth** | `app/[locale]/(auth)/` | `LoginForm.tsx`, `SignupForm.tsx` | Supabase Auth (built-in) | `auth.users` (Supabase) |
| **Tier Management** | `app/[locale]/(dashboard)/settings/` | `TierDisplay.tsx`, `UpgradePrompt.tsx` | `lib/actions/users.ts` | `users.tier` |
| **Internationalization** | `lib/i18n/`, `lib/actions/translations.ts` | `LanguageSwitcher.tsx` | `lib/actions/translations.ts`, `lib/actions/users.ts` | `translations`, `question_translations`, `users.locale_preference` |

---

## Technology Stack Details

### Core Technologies

**Next.js 15 (App Router)**
- **Version:** 15.x (latest stable)
- **Rationale:** Modern React Server Components, Server Actions for mutations, optimized performance
- **Key Features Used:**
  - Server Components for initial renders
  - Server Actions for type-safe mutations
  - Route Groups for organization
  - Dynamic routes for game IDs
  - Middleware for i18n routing

**TypeScript 5.x (Strict Mode)**
- **Version:** 5.x (latest stable)
- **Rationale:** Type safety, better IDE support, catch errors at compile time
- **Configuration:**
  - `strict: true` in tsconfig.json
  - No implicit any
  - Strict null checks

**pnpm (Package Manager)**
- **Version:** Latest
- **Rationale:** Faster installs, better disk efficiency, workspace support, deterministic installs
- **Always use:** `pnpm` commands (never `npm` or `yarn`)
- **Commands:**
  - `pnpm install` - Install dependencies
  - `pnpm add <package>` - Add dependency
  - `pnpm dev` - Development server
  - `pnpm build` - Production build

**Supabase (Backend Platform)**
- **PostgreSQL 15+:** Managed database with RLS
- **Supabase Realtime:** WebSocket infrastructure (Phoenix/Elixir)
- **Supabase Auth:** Email/password + Google OAuth
- **Supabase Storage:** CDN-backed file storage for images
- **Rationale:** Proven real-time capabilities, managed services reduce DevOps burden

**next-intl (Internationalization)**
- **Version:** 3.x (latest)
- **Rationale:** Best Next.js 15 App Router support, type-safe translations, server/client compatible
- **Setup:**
  - Route-based locale segments (`/[locale]/...`)
  - Translations stored in Supabase database (`translations` table)
  - Cached in Next.js cache for performance
  - Server-side rendering support
  - Type-safe translation keys

### Integration Points

**Real-Time Game State Synchronization**
- **Pattern:** Supabase Realtime channels (`game:${gameId}`)
- **Events:** `player_joined`, `question_advance`, `answer_submitted`, `game_end`
- **Latency Target:** <500ms p95
- **Implementation:** `lib/supabase/realtime.ts`, `hooks/useRealtime.ts`

**Two-Screen Experience**
- **Projector View:** Large text (48px+), full-screen animations, leaderboard reveals
- **Player View:** Mobile-optimized (375-430px), large tap targets (60px+), minimal UI
- **Synchronization:** Shared Realtime channel, synchronized question state

**AI Image Delivery**
- **Generation:** OpenAI DALL-E 3 API (pre-generated batch)
- **Storage:** Supabase Storage with public bucket
- **Delivery:** CDN with 30-day cache headers
- **Optimization:** WebP format with JPEG fallback, <300KB per image
- **Pre-loading:** Next 3 questions during current question phase

**Internationalization Architecture**
- **UI Translations:** Stored in Supabase `translations` table (key-value pairs per locale)
- **Question Translations:** Stored in Supabase `question_translations` table
- **Translation Caching:** Next.js cache + in-memory cache for performance
- **Locale Detection:** User preference (from settings) → Browser → Default (English)
- **Route Structure:** `/[locale]/...` for all routes
- **MVP:** English only (translations seeded in database)
- **Future:** German and Italian translations added via database

---

## Novel Pattern Designs

### Pattern 1: Real-Time Multi-Device Game State Synchronization

**Purpose:** Synchronize game state across host projector and multiple player phones with <500ms latency

**Components:**
- **Realtime Channel Manager** (`lib/supabase/realtime.ts`): Manages game channel subscriptions
- **Game State Machine** (`lib/game-state.ts`): Centralized state transitions
- **Optimistic Updates** (`hooks/useGameState.ts`): Immediate UI updates before server confirmation
- **Connection Recovery** (`lib/supabase/realtime.ts`): Exponential backoff reconnection

**Data Flow:**
1. Host creates game → Database insert → Realtime broadcast `game_created`
2. Players join → Database insert → Realtime broadcast `player_joined`
3. Host advances question → Server Action → Database update → Realtime broadcast `question_advance`
4. Players submit answers → Server Action → Database insert → Realtime broadcast `answer_submitted`
5. Scoring calculated → Server Action → Database update → Realtime broadcast `leaderboard_update`

**Implementation Guide:**
- Use Supabase Realtime channel per game: `supabase.channel('game:${gameId}')`
- Subscribe to PostgreSQL changes for real-time updates
- Use broadcast events for custom game events
- Implement presence tracking for connection status
- Handle reconnection with exponential backoff (1s, 2s, 4s)

**Affects FR Categories:** Game Creation, Player Joining, Gameplay Flow, Real-Time Sync

---

### Pattern 2: Two-Screen Synchronized Experience

**Purpose:** Coordinate different UI experiences on projector (spectator) and phones (participants) while maintaining sync

**Components:**
- **Host View Component** (`app/[locale]/game/[id]/host/page.tsx`): Full-screen projector view
- **Player View Component** (`app/[locale]/game/[id]/play/page.tsx`): Mobile-optimized player view
- **Shared State Hook** (`hooks/useGameState.ts`): Shared Realtime subscription
- **View-Specific Renderers:** Different components for same data

**Data Flow:**
- Both views subscribe to same Realtime channel
- Projector view receives question → Displays large text, answer options, timer
- Player view receives question → Displays question text, large answer buttons
- Both views receive `question_advance` → Synchronize transition timing
- Projector view shows leaderboard after reveal
- Player view shows personal rank only

**Implementation Guide:**
- Detect view type via route path (`/host/` vs `/play/`)
- Share Realtime subscription via Context Provider
- Use view-specific components for different layouts
- Sync timing via server-triggered events (no client-side timers for sync)

**Affects FR Categories:** Gameplay Flow, Real-Time Sync

---

## Implementation Patterns

### Naming Conventions

**Database Tables:**
- Plural, snake_case: `games`, `game_players`, `player_answers`
- Foreign keys: `game_id`, `user_id`, `question_id`
- Timestamps: `created_at`, `updated_at`

**API Routes:**
- RESTful, plural: `/api/webhooks/supabase` (only webhooks in API routes)
- Server Actions: `/lib/actions/` (preferred over API routes)

**Server Actions:**
- File: `lib/actions/{resource}.ts` (e.g., `games.ts`, `players.ts`)
- Function: `createGame`, `joinGame`, `submitAnswer` (camelCase verbs)
- Export: `'use server'` directive at top of file

**Components:**
- File: PascalCase: `AnswerButton.tsx`, `Leaderboard.tsx`
- Component: Same as filename: `export function AnswerButton()`
- Props: TypeScript interfaces: `AnswerButtonProps`

**Hooks:**
- File: camelCase with `use` prefix: `useRealtime.ts`, `useGameState.ts`
- Hook: Same as filename: `export function useRealtime()`

**Types:**
- File: `types/{domain}.ts`: `game.ts`, `database.ts`
- Type: PascalCase: `Game`, `Player`, `Answer`
- Enums: PascalCase: `GameStatus`, `PlayerTier`

**i18n Keys:**
- Nested objects: `game.waitingRoom.joinPrompt`
- Use dots in JSON: `{ "game": { "waitingRoom": { "joinPrompt": "Join Game" } } }`
- Translation function: `t('game.waitingRoom.joinPrompt')`

**Constants:**
- File: `lib/constants.ts` or co-located
- Format: `UPPER_SNAKE_CASE`: `MAX_PLAYERS_FREE = 20`

---

### Code Organization

**Component Structure:**
- By feature (preferred): `components/game/`, `components/auth/`
- Shared UI: `components/ui/` (shadcn/ui components)
- Layout: `components/layout/`

**Server Actions:**
- Grouped by resource: `lib/actions/games.ts`, `lib/actions/players.ts`
- One file per domain entity
- All mutations use Server Actions (no API routes except webhooks)

**Hooks:**
- Custom hooks in `lib/hooks/`
- One hook per file
- Export default or named export

**Utilities:**
- Domain-specific: Co-located with feature
- General: `lib/utils.ts`
- Constants: `lib/constants.ts` or co-located

**Tests:**
- Unit tests: Co-located with code: `__tests__/AnswerButton.test.tsx` (Vitest)
- E2E tests: `e2e/` directory: `e2e/game-flow.spec.ts` (Playwright)
- Test utils: `lib/__tests__/utils.ts`
- E2E fixtures: `e2e/fixtures/` for test data and helpers

**i18n Files:**
- One file per locale: `messages/en.json`, `messages/de.json`, `messages/it.json`
- Nested structure matching UI hierarchy
- MVP: Only `en.json` complete, others have placeholders

---

### Format Patterns

**API Response Format (Server Actions):**
```typescript
// Success
{ success: true, data: Game }

// Error
{ success: false, error: { message: string, code?: string } }
```

**Date Format:**
- Database: UTC timestamps (`TIMESTAMP`)
- JSON: ISO 8601 strings (`2025-01-27T10:00:00Z`)
- UI: User's local timezone via `Intl.DateTimeFormat`

**Error Format:**
- User-facing: `{ message: string, code?: string }`
- Logging: Structured with context
- Never expose technical details to users

---

### Communication Patterns

**Realtime Events:**
- Channel name: `game:${gameId}`
- Event names: snake_case: `player_joined`, `question_advance`
- Payload: TypeScript interfaces in `types/game.ts`

**Server Actions:**
- Input: TypeScript interfaces
- Output: `{ success: boolean, data?: T, error?: Error }`
- Error handling: Try-catch with user-friendly messages

**State Management:**
- Server state: Server Components + Server Actions
- Client state: React Context for game state
- Realtime state: Supabase Realtime subscriptions
- UI state: useState for local component state

---

### Lifecycle Patterns

**Loading States:**
- Skeleton loaders for content
- Spinner for actions
- Progress indicators for long operations

**Error Recovery:**
- Realtime: Exponential backoff (1s, 2s, 4s) with max 3 retries
- Server Actions: Toast notification with retry button
- Network: "Reconnecting..." message with spinner

**Retry Logic:**
- Realtime connection: Exponential backoff
- Server Actions: User-initiated retry
- Image loading: Placeholder on failure

---

### Location Patterns

**Static Assets:**
- Images: `public/images/`
- Icons: `public/icons/`
- AI images: Supabase Storage (not public/)

**Configuration Files:**
- Root level: `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Environment: `.env.local` (gitignored), `.env.example` (committed)

**Database Migrations:**
- Managed via Supabase Dashboard or CLI
- Not in repository (Supabase handles)

---

### Consistency Patterns

**Date Formatting:**
- UI: `Intl.DateTimeFormat` with user's locale
- Display: Relative time for recent ("2 hours ago"), absolute for older

**Error Messages:**
- User-facing: Plain English, actionable
- Never technical jargon
- Include recovery actions

**Logging:**
- Development: `console.log` with context
- Production: Structured logs (consider Vercel Analytics)

**i18n Translation Keys:**
- Always use translation function: `t('key')`
- Never hardcode strings in components
- MVP: English only, but structure ready for German/Italian

---

## Data Architecture

### Database Schema

**Users Table** (`users`)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  tier TEXT DEFAULT 'free', -- 'free', 'pro', 'church'
  locale_preference TEXT DEFAULT 'en', -- 'en', 'de', 'it'
  is_admin BOOLEAN DEFAULT false, -- Admin access for question management
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Translations Table** (`translations`)
```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locale TEXT NOT NULL, -- 'en', 'de', 'it'
  namespace TEXT NOT NULL, -- 'common', 'game', 'auth', etc.
  key TEXT NOT NULL, -- Translation key (e.g., 'join', 'waitingRoom.joinPrompt')
  value TEXT NOT NULL, -- Translated text
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(locale, namespace, key)
);

-- Index for fast lookups
CREATE INDEX idx_translations_locale_namespace ON translations(locale, namespace);
```

**Question Sets Table** (`question_sets`)
```sql
CREATE TABLE question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  question_count INT DEFAULT 0,
  tier_required TEXT DEFAULT 'free',
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Questions Table** (`questions`)
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_set_id UUID REFERENCES question_sets(id),
  question_text TEXT NOT NULL, -- English (MVP)
  option_a TEXT NOT NULL, -- English (MVP)
  option_b TEXT NOT NULL, -- English (MVP)
  option_c TEXT NOT NULL, -- English (MVP)
  option_d TEXT NOT NULL, -- English (MVP)
  correct_answer CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
  image_url TEXT, -- Supabase Storage URL
  scripture_reference TEXT,
  verse_content TEXT, -- Full verse text (optional)
  image_content_prompt TEXT, -- DALL-E prompt for AI generation
  image_style TEXT, -- DALL-E style specification
  is_custom_image BOOLEAN DEFAULT false, -- True if uploaded, false if AI-generated
  order_index INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Question Translations Table** (`question_translations`)
```sql
CREATE TABLE question_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id),
  locale TEXT NOT NULL, -- 'en', 'de', 'it'
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_id, locale)
);

-- Index for fast lookups
CREATE INDEX idx_question_translations_question_locale ON question_translations(question_id, locale);
```

**Note:** Questions MVP will use English directly in `questions` table. When adding German/Italian, migrate to `question_translations` table structure.

**Games Table** (`games`)
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES users(id),
  room_code TEXT UNIQUE NOT NULL, -- 6-character code
  question_set_id UUID REFERENCES question_sets(id),
  question_count INT NOT NULL,
  status TEXT DEFAULT 'waiting', -- 'waiting', 'active', 'completed'
  current_question_index INT DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Game Players Table** (`game_players`)
```sql
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  player_name TEXT NOT NULL,
  total_score INT DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW()
);
```

**Player Answers Table** (`player_answers`)
```sql
CREATE TABLE player_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES game_players(id),
  question_id UUID REFERENCES questions(id),
  selected_answer CHAR(1), -- 'A', 'B', 'C', 'D'
  is_correct BOOLEAN,
  response_time_ms INT, -- milliseconds to answer
  points_earned INT,
  answered_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_games_room_code ON games(room_code);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_player_answers_game_id ON player_answers(game_id);
CREATE INDEX idx_player_answers_player_id ON player_answers(player_id);
```

### Row Level Security (RLS) Policies

**Games:**
- Hosts can only update their own games
- Anyone can read active games (for joining)

**Players:**
- Anyone can insert as player (anonymous joining)
- Players can read their own records

**Answers:**
- Players can only insert their own answers
- Players can read their own answers
- Host can read all answers for their game

---

## API Contracts

### Server Actions

**Create Game:**
```typescript
async function createGame(data: {
  hostId: string;
  questionSetId: string;
  questionCount: number;
}): Promise<{ success: true; data: Game } | { success: false; error: Error }>
```

**Join Game:**
```typescript
async function joinGame(data: {
  gameId: string;
  playerName: string;
}): Promise<{ success: true; data: Player } | { success: false; error: Error }>
```

**Submit Answer:**
```typescript
async function submitAnswer(data: {
  gameId: string;
  playerId: string;
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  responseTimeMs: number;
}): Promise<{ success: true; data: Answer } | { success: false; error: Error }>
```

**Advance Question:**
```typescript
async function advanceQuestion(data: {
  gameId: string;
  hostId: string;
}): Promise<{ success: true; data: Game } | { success: false; error: Error }>
```

---

## Security Architecture

### Authentication
- **Provider:** Supabase Auth
- **Methods:** Email/password + Google OAuth
- **Session Management:** Supabase handles JWT tokens
- **Password Requirements:** Supabase default (8+ characters)

### Authorization
- **Row Level Security (RLS):** Database-level enforcement
- **Host Permissions:** Only hosts can modify their games
- **Player Permissions:** Players can only submit their own answers
- **Tier Enforcement:** Server-side validation for tier limits

### Data Protection
- **Encryption in Transit:** HTTPS/WSS (Vercel + Supabase)
- **Encryption at Rest:** Supabase managed
- **API Keys:** Environment variables, never in code
- **PII Handling:** Minimal data collection (email, display name only)

---

## Performance Considerations

### Real-Time Latency
- **Target:** <500ms p95 for game state updates
- **Optimization:** Supabase Realtime (Phoenix/Elixir), optimized channel subscriptions
- **Monitoring:** Track Realtime message latency in production

### Image Loading
- **Pre-loading:** Next 3 questions during current question
- **Compression:** <300KB per image (WebP with JPEG fallback)
- **CDN:** Supabase Storage with 30-day cache headers
- **Fallback:** Placeholder image on load failure

### Database Queries
- **Indexes:** On room_code, game_id, player_id for fast lookups
- **Connection Pooling:** Supabase managed
- **Query Optimization:** Use Server Components for data fetching

### Frontend Performance
- **Lighthouse Target:** >90 performance score
- **Code Splitting:** Automatic via Next.js App Router
- **Image Optimization:** Next.js Image component
- **Bundle Size:** Monitor with `pnpm build` analysis

---

## Deployment Architecture

### Environment Strategy (MVP Best Practice)

The application uses a **two-environment setup** for MVP (development/staging combined + production):

**1. Development/Staging Environment (Combined)**
- **Purpose:** Local development and pre-production testing
- **Frontend Local:** Next.js dev server (`pnpm dev`) on `http://localhost:3000`
- **Frontend Staging:** Vercel Preview Deployments (automatic from `develop` branch)
- **Database:** Supabase Development Project (shared for local dev + staging)
- **Configuration:** 
  - Local: `.env.local` file (gitignored)
  - Staging: Vercel Preview Environment Variables (same Supabase project as local)
- **URL Pattern (Staging):** `quizgame-git-develop-username.vercel.app`
- **Use Case:** Daily development, feature implementation, integration testing, QA

**2. Production Environment**
- **Purpose:** Live production application
- **Frontend:** Vercel Production Deployment (from `main` branch)
- **Database:** Supabase Production Project (separate from dev)
- **Configuration:** Vercel Production Environment Variables
- **Domain:** Custom domain via Vercel DNS (e.g., `quizgame.com`)
- **Use Case:** Live user-facing application

**Rationale for Two-Environment Setup:**
- **Simpler for MVP:** Reduces complexity and maintenance overhead
- **Cost-effective:** Only 2 Supabase projects instead of 3
- **Sufficient isolation:** Development/staging can share data (testing data), production is isolated
- **Easy to scale:** Can add dedicated staging later if needed

### Supabase Project Setup

**Two Projects (MVP Best Practice):**
- **Development Project:** `quizgame-dev` (for local development AND staging previews)
  - Used by: Local `.env.local` and Vercel Preview deployments
  - Can use Supabase branching feature for staging isolation if needed (optional)
- **Production Project:** `quizgame-prod` (for production only)
  - Used by: Vercel Production deployments
  - Contains real user data, isolated from development

**Alternative: Supabase Branching (Optional)**
- Supabase supports database branching for staging environments
- Can create a `staging` branch from development project
- Useful if you need data isolation between local dev and staging
- For MVP: Not required, but available if needed

**Database Migrations:**
- Migrations applied to both environments
- Development: Manual via Supabase Dashboard SQL Editor (dev project)
- Production: Applied during production deployment window (prod project)
- **Best Practice:** Test migrations in dev project before applying to production

### GitHub Branch Strategy (2 Branches for MVP)

**Branch Structure:**
- `main` branch → Production deployment (protected, requires PR)
- `staging` branch → Staging/preview deployments (Vercel auto-deploys)
- Feature branches → Created from `staging`, merged back via PR

**Step-by-Step Branch Setup:**
```bash
# 1. Create staging branch from main
git checkout -b staging
git push -u origin staging

# 2. Set staging as default branch for development (optional, in GitHub settings)
# 3. Protect main branch (GitHub Settings → Branches → Add rule)
#    - Require pull request reviews
#    - Require status checks to pass
```

### Vercel Configuration

**Deployment Settings:**
- **Production:** Deploys from `main` branch automatically
- **Preview/Staging:** Deploys from `develop` branch automatically
- **Feature Branches:** Auto-creates preview deployments for testing

**Environment Variables per Environment:**

**Development (`.env.local` - Local Development):**
```bash
# Supabase - Development Project (shared with staging)
NEXT_PUBLIC_SUPABASE_URL=https://quizgame-dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=dev-service-role-key

# OpenAI (for image generation)
OPENAI_API_KEY=your-openai-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,de,it
```

**Staging (Vercel Preview Environment Variables - from `staging` branch):**
```bash
# Same Supabase project as development (shared)
NEXT_PUBLIC_SUPABASE_URL=https://quizgame-dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=dev-service-role-key
OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_APP_URL=https://quizgame-git-develop-username.vercel.app
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,de,it
```

**Production (Vercel Production Environment Variables - from `main` branch):**
```bash
# Separate Supabase production project
NEXT_PUBLIC_SUPABASE_URL=https://quizgame-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_APP_URL=https://quizgame.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,de,it
```

### Environment Helper Utility

**Location:** `lib/utils/env.ts`

```typescript
export function getEnvironment(): 'development' | 'production' {
  return (process.env.NEXT_PUBLIC_ENVIRONMENT || 'development') as 'development' | 'production';
}

export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}
```

### Deployment Process

**Local Development:**
1. Make code changes locally
2. Test with `pnpm dev` (uses `.env.local`)
3. Commit to feature branch
4. Push to GitHub

**Staging (Preview):**
1. Merge feature branch to `staging` branch
2. Vercel automatically creates preview deployment from `staging`
3. Uses development Supabase project (shared with local)
4. Test staging deployment
5. Verify all features work correctly

**Production:**
1. Create PR from `staging` to `main` branch
2. Review and approve PR
3. Merge `staging` into `main` branch
4. Vercel automatically deploys to production from `main`
5. Run database migrations on Supabase Production project (if needed)
6. Verify production deployment health
7. Monitor for issues

### Hosting Details
- **Frontend:** Vercel (automatic deployments from branches)
- **Database/Backend:** Supabase Cloud (three separate projects)
- **CDN:** Vercel Edge Network + Supabase Storage CDN
- **Domain:** Custom domain via Vercel DNS (production only)
- **SSL:** Automatic via Vercel (HTTPS for all environments)

---

## Development Environment

### Prerequisites
- **Node.js:** 20+ LTS
- **pnpm:** Latest (install via `npm install -g pnpm`)
- **Git:** Latest
- **VS Code:** Recommended with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript
  - next-intl (if available)

### Setup Commands

```bash
# Clone repository
git clone <repo-url>
cd quizgame

# Install dependencies (ALWAYS use pnpm)
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run Supabase locally (optional, for development)
pnpm supabase start

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production server locally
pnpm start

# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Run unit tests (Vitest)
pnpm test

# Run e2e tests (Playwright)
pnpm test:e2e

# Install Playwright browsers (first time only)
pnpm exec playwright install
```

### Package Management Commands (pnpm only)

```bash
# Add dependency
pnpm add <package>

# Add dev dependency
pnpm add -D <package>

# Remove dependency
pnpm remove <package>

# Update dependencies
pnpm update

# Install dependencies
pnpm install
```

**⚠️ CRITICAL:** Never use `npm` or `yarn` commands. Always use `pnpm`.

---

## Testing Architecture

### Testing Stack

**Unit & Integration Tests: Vitest**
- **Purpose:** Fast unit tests for business logic (scoring, game state, tier validation)
- **Location:** Co-located with code: `__tests__/ComponentName.test.tsx`
- **Coverage Target:** 80%+ for critical logic (scoring, game state), 60%+ for Server Actions
- **Setup:** Vitest with React Testing Library for component tests

**End-to-End Tests: Playwright**
- **Purpose:** Multi-device e2e tests for critical user flows, real-time sync validation
- **Location:** `e2e/` directory
- **Key Test Scenarios:**
  - Complete game flow: Create game → Join → Play → Results
  - Real-time synchronization: Multiple devices (host + players) stay in sync
  - Cross-browser compatibility: iOS Safari, Chrome Android
  - Answer submission and scoring accuracy
- **Setup:** Playwright with multiple browser contexts to simulate host + players

**Load Testing: k6 or Artillery**
- **Purpose:** Validate real-time sync at scale (50+ concurrent players)
- **What is Load Testing?** Simulates many users (50-200+) connecting simultaneously to test system performance under stress
- **What is Artillery?** Open-source load testing tool that can simulate WebSocket connections (perfect for Supabase Realtime)
- **Timing:** Run before launch after Epic 3 completion
- **Metrics:** Real-time message latency (p95 <500ms), connection stability, no dropped connections
- **Alternative:** k6 (another popular load testing tool, also supports WebSockets)

**Browser MCP Automation:**
- **Purpose:** Automated UI/UX testing using Browser MCP (Model Context Protocol)
- **What is Browser MCP?** AI-powered browser automation that can navigate, interact, and validate UI flows
- **Advantages:** Can automate visual testing, accessibility checks, and complex user flows that traditional e2e tests struggle with
- **Use Cases:** 
  - Visual regression testing
  - Accessibility validation
  - Complex multi-step flows
  - Real-time sync visual validation
- **Integration:** Use alongside Playwright for comprehensive coverage

**Supabase MCP:**
- **Purpose:** Database operations, migrations, and data validation during testing
- **What is Supabase MCP?** Model Context Protocol integration for Supabase that enables AI-assisted database operations
- **Use Cases:**
  - Automated database migrations
  - Test data seeding and cleanup
  - RLS policy validation
  - Query optimization testing
  - Real-time channel testing
- **Integration:** Use in test scripts and CI/CD pipelines

### E2E Test Structure

```
e2e/
├── game-flow.spec.ts          # Complete game flow: create → join → play → results
├── realtime-sync.spec.ts      # Real-time synchronization across devices
├── player-joining.spec.ts      # QR code and room ID joining flows
├── scoring.spec.ts            # Answer submission and scoring accuracy
├── fixtures/
│   ├── test-users.ts          # Test user accounts
│   ├── test-games.ts          # Game creation helpers
│   └── supabase-helpers.ts    # Supabase test utilities (uses Supabase MCP)
├── browser-mcp/               # Browser MCP automation tests
│   ├── visual-regression.spec.ts  # Visual UI testing
│   ├── accessibility.spec.ts      # A11y automated checks
│   └── complex-flows.spec.ts      # Multi-step user journeys
├── load/                       # Load testing scripts
│   ├── artillery-config.yml   # Artillery load test config
│   └── k6-script.js           # Alternative k6 load test
└── playwright.config.ts       # Playwright configuration
```

### Testing Strategy

**Unit Tests (Vitest):**
- Critical business logic: `lib/scoring.ts`, `lib/game-state.ts`
- Server Actions: `lib/actions/*.ts`
- Component logic: Game components with React Testing Library

**E2E Tests (Playwright):**
- **Multi-Context Testing:** Use Playwright's multiple browser contexts to simulate:
  - Host device (projector view)
  - Multiple player devices (mobile views)
  - Real-time synchronization between all contexts
- **Critical Paths:**
  1. Host creates game → Players join via QR/room ID → Game starts
  2. Questions display on all devices → Players submit answers → Scores update
  3. Real-time leaderboard updates → Game completion → Final results

**Browser MCP Automation:**
- **Automated UI/UX Testing:** Use Browser MCP to automate visual and interaction testing
- **Test Scenarios:**
  - Visual regression: Screenshot comparison of UI states
  - Accessibility: Automated a11y checks (ARIA labels, keyboard navigation)
  - Complex flows: Multi-step user journeys with visual validation
  - Real-time sync: Visual validation of synchronized states across devices
  - Cross-browser: Test on actual iOS Safari, Chrome Android via MCP
- **Advantages over Manual Testing:**
  - Repeatable and consistent
  - Can run in CI/CD pipelines
  - Catches visual regressions automatically
  - Faster than manual testing
- **When to Use:** All UI flows that can be automated (replaces manual testing for most scenarios)

**Supabase MCP Integration:**
- **Database Testing:** Use Supabase MCP for automated database operations
- **Test Data Management:**
  - Seed test questions, games, players
  - Clean up test data after runs
  - Validate RLS policies
- **Migration Testing:** Test migrations before applying to production
- **Real-time Testing:** Validate Supabase Realtime channels and subscriptions
- **Query Validation:** Test database queries and performance

### CI/CD Integration

**GitHub Actions:**
- Run Vitest unit tests on every PR
- Run Playwright e2e tests on staging deployments
- Run Browser MCP visual regression tests on UI changes
- Run Supabase MCP database validation (migrations, RLS policies)
- TypeScript check and ESLint on every commit
- Load testing (Artillery/k6) on staging before production deployment

**Vercel Preview:**
- Automatic preview deployments for testing
- E2E tests (Playwright + Browser MCP) can target preview URLs
- Supabase MCP can validate against preview database

**MCP Integration:**
- **Browser MCP:** Automated visual testing, accessibility checks, complex flow validation
- **Supabase MCP:** Database migrations, test data seeding, RLS policy validation, query testing

---

## Internationalization (i18n) Architecture

### Translation Storage: Supabase Database

**UI Translations** (`translations` table):
- Stored in Supabase PostgreSQL database
- Structure: `locale` + `namespace` + `key` → `value`
- Example data:
  ```sql
  -- English
  INSERT INTO translations (locale, namespace, key, value) VALUES
  ('en', 'common', 'join', 'Join'),
  ('en', 'common', 'cancel', 'Cancel'),
  ('en', 'game', 'waitingRoom.joinPrompt', 'Join Game'),
  ('en', 'game', 'waitingRoom.roomCode', 'Room Code');
  
  -- German (future)
  INSERT INTO translations (locale, namespace, key, value) VALUES
  ('de', 'common', 'join', 'Beitreten'),
  ('de', 'common', 'cancel', 'Abbrechen'),
  ('de', 'game', 'waitingRoom.joinPrompt', 'Spiel beitreten');
  
  -- Italian (future)
  INSERT INTO translations (locale, namespace, key, value) VALUES
  ('it', 'common', 'join', 'Unisciti'),
  ('it', 'common', 'cancel', 'Annulla'),
  ('it', 'game', 'waitingRoom.joinPrompt', 'Unisciti al gioco');
  ```

**Question Translations** (`question_translations` table):
- Questions stored in `questions` table (English only for MVP)
- Translations stored in `question_translations` table (future: German, Italian)
- Questions fetched based on user's locale preference
- Fallback to English if translation missing

### Translation Caching Strategy

**Performance Optimization:**
- **Next.js Cache:** Server-side cache for translations (revalidate every 1 hour)
- **In-Memory Cache:** Runtime cache for frequently accessed translations
- **Cache Invalidation:** On translation update via webhook or admin action

**Implementation:**
```typescript
// lib/i18n/translations.ts
export async function getTranslations(locale: string) {
  // Check Next.js cache first
  // Then Supabase
  // Cache result for 1 hour
}
```

### Locale Detection
1. User preference from settings (`users.locale_preference`)
2. Browser language detection (next-intl default)
3. Fallback to English (`en`)

### Route Structure
- All routes under `/[locale]/` segment
- Supported locales: `en`, `de`, `it`
- Default locale: `en` (MVP)
- Locale switching via `LanguageSwitcher` component
- Updates `users.locale_preference` on change

### Implementation Notes
- **MVP:** English translations seeded in `translations` table
- **German/Italian:** Empty initially, add via database (seed script or admin UI)
- **Questions:** English only in MVP (directly in `questions` table)
- **Future:** Question translations in `question_translations` table
- **Translation Loading:** Server-side fetch with caching (Next.js cache)
- **Admin UI (Future):** Manage translations via database admin panel

### Translation Key Structure
- Use dot notation: `namespace.key` or `namespace.nested.key`
- Example: `game.waitingRoom.joinPrompt`
- Namespaces: `common`, `game`, `auth`, `dashboard`, `errors`

---

## Architecture Decision Records (ADRs)

### ADR-001: Next.js 15 App Router
**Decision:** Use Next.js 15 with App Router instead of Pages Router
**Rationale:** Server Components for better performance, Server Actions for type-safe mutations, better developer experience
**Alternatives Considered:** Pages Router (legacy), Remix (different paradigm)
**Date:** 2025-01-27

### ADR-002: Supabase over Custom Backend
**Decision:** Use Supabase for database, auth, real-time, and storage instead of custom backend
**Rationale:** Proven real-time capabilities, managed services reduce DevOps burden, fits MVP timeline
**Alternatives Considered:** Custom Node.js backend, Firebase (less SQL-friendly)
**Date:** 2025-01-27

### ADR-003: Server Actions over API Routes
**Decision:** Use Server Actions for mutations instead of API routes
**Rationale:** Type-safe, automatic request deduplication, simpler code, better DX
**Alternatives Considered:** API routes (more boilerplate), tRPC (overkill for MVP)
**Date:** 2025-01-27

### ADR-004: pnpm as Package Manager
**Decision:** Use pnpm instead of npm or yarn
**Rationale:** Faster installs, better disk efficiency, workspace support, deterministic installs
**Alternatives Considered:** npm (slower), yarn (less efficient)
**Date:** 2025-01-27

### ADR-005: next-intl for Internationalization
**Decision:** Use next-intl for i18n instead of react-i18next or next-i18next
**Rationale:** Best Next.js 15 App Router support, type-safe translations, server/client compatible
**Alternatives Considered:** react-i18next (client-only), next-i18next (Pages Router only)
**Date:** 2025-01-27

### ADR-006: Database-Backed Translations (Supabase)
**Decision:** Store all translations in Supabase database instead of JSON files
**Rationale:** Updates without code deployment, future admin UI possible, consistent with question storage, more flexible for customers
**Alternatives Considered:** File-based JSON (requires deployment), hybrid approach (more complex)
**Date:** 2025-01-27

### ADR-007: English-Only MVP with i18n Structure
**Decision:** Build MVP with English only but include i18n architecture from start
**Rationale:** Faster MVP delivery, but database structure ready for German/Italian in Phase 2
**Alternatives Considered:** Full 3-language support (slower MVP), no i18n (harder to add later)
**Date:** 2025-01-27

---

_Generated by BMAD Decision Architecture Workflow v1.0_  
_Date: 2025-01-27_  
_For: Riccardo_
