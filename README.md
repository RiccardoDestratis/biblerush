# BibleRush

Interactive Bible quiz game for churches and groups. A real-time multiplayer quiz experience with AI-generated imagery.

## Project Overview

This is an MVP project built with Next.js 15, Supabase, and TypeScript. The application enables hosts to create quiz games that players can join via QR codes or room IDs, with real-time synchronization across all devices.

## Technology Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Realtime, Auth, Storage)
- **AI:** OpenAI DALL-E 3 for image generation
- **Hosting:** Vercel
- **Package Manager:** pnpm (always use pnpm, never npm or yarn)

## Prerequisites

- **Node.js:** 20+ LTS
- **pnpm:** Latest (install via `npm install -g pnpm`)
- **Git:** Latest
- **Supabase Account:** For database, auth, and storage
- **OpenAI Account:** For AI image generation (optional for initial setup)

## Setup Instructions

### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd Quizgame

# Install dependencies (ALWAYS use pnpm)
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory (copy from `.env.example`):

```bash
# Official Supabase Environment Variables
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key / Secret Key (Optional - only needed for admin operations)
# Create a new "Secret key" in API settings (recommended) or use the old service_role key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key-or-service-role-key-here
```

**Getting Supabase Credentials:**
1. Create a Supabase project at https://supabase.com (name it `biblerush` or similar)
2. Go to Project Settings → API
3. Copy the `URL` → Use as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon` key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Service Role Key / Secret Key (Optional):** Only needed for admin operations or seed scripts
   - **Recommended:** Create a new "Secret key" in API settings (format: `sb_secret_...`)
   - **Alternative:** Use the old `service_role` JWT-based key (also works)
   - Both work the same way - use either one as `SUPABASE_SERVICE_ROLE_KEY`
   - Only add this when you need it (e.g., for seed scripts or when RLS is enabled)
6. **Note:** These are the official Supabase environment variable names. For MVP, we use one Supabase project for all environments (local, staging, production).

**Setting Up the Database:**
The database schema has already been applied via Supabase MCP. If you need to apply it manually:
1. In your Supabase project, go to SQL Editor
2. Open the file `migrations/001_initial_schema.sql` from this project
3. Copy and paste the entire SQL into the SQL Editor
4. Click "Run" to execute the migration
5. This creates all necessary tables, indexes, and triggers

**Test Data:**
Test data (1 question set with 5 questions) has already been seeded. If you need to seed more:
```bash
pnpm seed:test
```
This creates additional test question sets with sample questions for development.

**Getting OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key to `.env.local`

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

### Branch Strategy (2 branches for MVP)

- `main` branch → Production deployment (protected, requires PR)
- `staging` branch → Staging/preview deployments (Vercel auto-deploys)
- Feature branches → Created from `staging`, merged back via PR

**Initial Branch Setup:**
```bash
# Create staging branch from main
git checkout -b staging
git push -u origin staging

# Set staging as default branch for development (optional, in GitHub settings)
# Protect main branch (GitHub Settings → Branches → Add rule)
```

### Environment Setup

**Development/Staging Environment:**
- **Local:** Next.js dev server (`pnpm dev`) on `http://localhost:3000`
- **Staging:** Vercel Preview Deployments (automatic from `staging` branch)
- **Database:** Supabase Main Project (shared across all environments for MVP)
- **Configuration:** `.env.local` (local) and Vercel Preview Environment Variables (staging)

**Production Environment:**
- **Frontend:** Vercel Production Deployment (from `main` branch)
- **Database:** Supabase Main Project (same project as staging for MVP)
- **Configuration:** Vercel Production Environment Variables
- **Domain:** Custom domain via Vercel DNS

**Note:** For MVP, we use one Supabase project for simplicity. You can add separate staging/production projects later if needed.

### Supabase Project Setup

**Single Project (Simplified for MVP):**
- **Main Project:** `biblerush` (used for all environments initially)
  - Used by: Local `.env.local`, Vercel Preview deployments (staging), and Vercel Production deployments
  - Can be separated into staging/prod projects later if needed
  - **Note:** For MVP, we use one Supabase project. You can add a separate staging project later.

## Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm dev:clean    # Clear cache (.next, node_modules/.cache) and restart dev server
                  # Use this after bigger changes (schema updates, major refactors, etc.)
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint
pnpm type-check    # Run TypeScript type checking

# Testing
pnpm test                    # Run type-check and build (quick validation)
pnpm test:full              # Run type-check, build, and E2E tests
pnpm test:e2e               # Run Playwright E2E tests
pnpm test:e2e:ui            # Run tests in interactive UI mode
pnpm test:e2e:headed        # Run tests with visible browser
pnpm test:e2e:debug         # Debug tests step-by-step
pnpm test:e2e:report        # View test report

# Package Management (ALWAYS use pnpm)
pnpm add <package>           # Add dependency
pnpm add -D <package>        # Add dev dependency
pnpm remove <package>        # Remove dependency
pnpm update                  # Update dependencies
```

**When to use `pnpm dev:clean`:**
- After database schema changes
- After major refactoring
- When experiencing caching issues
- After environment variable changes
- When Next.js seems to be serving stale content

**⚠️ CRITICAL:** Never use `npm` or `yarn` commands. Always use `pnpm`.

## Project Structure

```
biblerush/
├── app/                    # Next.js 15 App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── game/              # Game-specific components
│   └── layout/            # Layout components
├── lib/                    # Shared utilities
│   ├── actions/           # Server Actions
│   ├── supabase/          # Supabase clients
│   ├── utils/             # General utilities
│   └── hooks/             # Custom React hooks
├── public/                 # Static assets
│   ├── images/            # Static images
│   └── icons/             # App icons
├── scripts/                # Utility scripts
├── types/                  # TypeScript types
└── e2e/                    # End-to-end tests
```

## Development Guidelines

### Code Style
- **TypeScript:** Strict mode enabled
- **ESLint:** Next.js and TypeScript rules
- **Prettier:** Configured for consistent formatting
- **Components:** PascalCase file names
- **Server Actions:** `lib/actions/{resource}.ts`

### Color Palette
- **Primary:** Deep Purple #7C3AED
- **Secondary:** Coral Orange #FF6B6B
- **Accent:** Bright Teal #14B8A6
- **Success:** #22C55E
- **Error:** #EF4444
- **Background:** Warm grays (#FAFAF9 to #1C1917)

## Next Steps

1. ✅ Project setup complete (Story 1.1)
2. ⏳ Supabase project setup & database schema (Story 1.2)
3. ⏳ Basic UI components with shadcn/ui (Story 1.3)
4. ⏳ Game creation flow (Story 1.4)
5. ⏳ Waiting room with QR code (Story 1.5)
6. ⏳ Player join flow (Story 1.6)
7. ⏳ Player waiting view (Story 1.7)

## Documentation

- **PRD:** `docs/prd.md`
- **Architecture:** `docs/architecture.md`
- **UX Design:** `docs/ux-design-specification.md`
- **Epics & Stories:** `docs/epics.md`
- **Testing:** `e2e/README.md`

## Support

For questions or issues, refer to the project documentation in the `docs/` directory.

---

**Note:** This project uses pnpm as the package manager. Always use `pnpm` commands, never `npm` or `yarn`.
