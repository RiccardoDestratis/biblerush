Bible Memory Quiz Game - Product Requirements Document (PRD)
Version: 1.0
 Date: November 19, 2025
 Author: John (Product Manager)
 Status: Draft - Ready for Review

Goals and Background Context
Goals
Create a frictionless, engaging Bible quiz platform that churches want to use repeatedly for casual events and community building
Enable youth pastors and ministry leaders to run competitive quiz events in under 5 minutes with zero preparation time
Build a viral B2C → B2B conversion funnel where individual success drives church-wide adoption
Establish product-market fit with 50+ weekly active users within 6 months of launch
Generate sustainable revenue ($1,500+ MRR by Month 12) through freemium conversion to Pro ($12.99/mo) and Church ($299/yr) tiers
Differentiate from Kahoot through Bible-specific curated content and AI-generated Biblical imagery that creates memorable "wow" moments
Deliver MVP launch within 6 weeks with 5 curated question sets (100 total theologically accurate questions)
Background Context
Christian communities lack engaging, ready-to-use tools for Bible learning in group settings. Current solutions force churches to choose between outdated desktop software, individual study apps without social engagement, or generic platforms like Kahoot that require hours of manual Bible content creation with no theological guidance.
Bible Memory Quiz Game fills this critical gap by combining proven competitive gameplay mechanics (inspired by Kahoot) with purpose-built Biblical content and AI-enhanced visuals. The platform enables churches to run live multiplayer quiz events where participants use their phones to answer questions while a central projector displays stunning AI-generated Biblical imagery and real-time leaderboards.
The primary use case is casual church events—youth nights, small groups, family gatherings—where the goal is community building and making faith fun, not formal education. By providing curated, theologically accurate question sets and zero-prep setup (QR code joining, pre-made content), we eliminate the friction that prevents churches from running these engaging activities regularly.
Target Market: Youth pastors, small group leaders, and church event coordinators managing groups of 10-50 people.
Business Model: Freemium B2C (individuals/small groups get limited access) converting to B2B church licensing ($299/year) for unlimited features. Free tier provides 3 question sets, 20 players max, 5 games/month. Conversion happens when champions prove value at small scale and advocate for church-wide adoption.
Why Now: Post-COVID, churches actively seek digital-first tools that work with devices people already carry (smartphones) and create engaging experiences for all ages. There's growing recognition that spiritual growth happens through community and joy, not just serious study. No competitor has built Kahoot-style mechanics specifically for Christian communities with Bible-focused content and AI visual enhancement.
Change Log
Date
Version
Description
Author
2025-11-19
1.0
Initial PRD creation from Project Brief
John (PM)


Requirements
Functional Requirements
FR1: The system shall allow hosts to create a new game room with a unique 6-character alphanumeric room code in under 2 minutes from account creation.
FR2: The system shall generate both a scannable QR code and a numeric room ID for each game session to enable player joining via camera scan or manual entry.
FR3: The system shall provide 5 pre-curated question sets at launch covering major Bible themes: "Gospels: Life of Jesus," "Old Testament Heroes," "Miracles & Parables," "New Testament Church," and "Bible Basics," totaling 100 theologically accurate questions.
FR4: The system shall allow hosts to select a question set and choose game length (10, 15, or 20 questions) before starting a game.
FR5: Players shall join games via mobile browser without app download by scanning QR code or entering room ID and providing a display name (2-30 characters).
FR6: The system shall display a waiting room on the projector view showing all joined players in real-time with animated entries before game start.
FR7: The system shall present multiple-choice questions with 4 answer options (A/B/C/D) simultaneously on both projector and player devices with synchronized timing.
FR8: The system shall enforce a 15-second countdown timer per question, displaying time remaining on all devices with visual countdown.
FR9: Players shall select an answer option on their mobile device, confirm/lock their selection, and be unable to change after confirmation. If timer expires, the currently selected answer (if any) is automatically submitted.
FR10: The system shall calculate scores using: 10 base points for correct answers + speed bonus (0-3 seconds = +5 points, 3-5 seconds = +3 points, >5 seconds = +0 bonus).
FR11: After each question timer expires, the system shall display an AI-generated Biblical image related to the correct answer on the projector for 5 seconds with the correct answer overlaid.
FR12: The system shall show a live leaderboard after each question displaying the top 10 players with cumulative scores, rank changes, and podium highlighting for top 3.
FR13: The system shall advance through all selected questions automatically, maintaining synchronization across all connected devices with <500ms latency.
FR14: At game end, the system shall display final results with winner celebration (confetti animation), complete rankings, and game statistics (duration, total questions, accuracy).
FR15: The system shall support concurrent gameplay with up to 20 simultaneous players per game session in the free tier, with unlimited players in Pro/Church tiers.
FR16: The system shall provide user authentication via email/password and Google OAuth for account creation and session management.
FR17: The system shall track user tier (free, pro, church) and enforce usage limits: free tier allows 3 of 5 question sets, 20 players max, 5 games per month (rolling 30-day window).
FR18: The system shall maintain a user dashboard showing past games list, usage statistics (games used this month), and prominent "Create New Game" call-to-action.
FR19: The system shall display locked question sets with "Pro" badges and upgrade prompts when free tier users attempt to access premium content.
FR20: Each question shall include a scripture reference citation for theological traceability and learning reinforcement.
Non-Functional Requirements
NFR1: The system shall synchronize game state (question advance, answer submission, leaderboard updates) across all devices in real-time using Supabase Realtime with WebSocket connections, maintaining <500ms latency at p95.
NFR2: The system shall maintain 90%+ uptime during game sessions with graceful reconnection handling for temporary disconnections (exponential backoff, 3 retry attempts).
NFR3: AI-generated images shall load on projector view within 2 seconds using pre-loading strategy (load next 3 questions during gameplay), with fallback placeholders for slow connections.
NFR4: The system shall optimize for church WiFi environments (5-20 Mbps typical) by compressing images to under 300KB each and implementing aggressive CDN caching (30-day headers).
NFR5: The mobile player interface shall be responsive and functional on iOS Safari 14+ and Chrome Android 90+ browsers, covering 95%+ of mobile users, with viewport support from 375px (iPhone SE) to 430px (iPhone 14 Pro Max).
NFR6: The system shall handle player device disconnections gracefully by freezing their score and allowing rejoin without disrupting other players or game flow.
NFR7: All Biblical content shall be theologically accurate, denomination-neutral, and appropriate for all ages (middle school through adult), with content reviewed by 2-3 Christian educators before publication.
NFR8: The system shall implement Row Level Security (RLS) policies in Supabase ensuring hosts can only modify their own games and players can only submit their own answers, with server-side enforcement.
NFR9: The system shall remain within budget constraints during MVP: Supabase free tier (500MB database, 1GB storage, 2GB bandwidth, 200 concurrent connections), Vercel free tier (100GB bandwidth), and OpenAI costs under $50 for 100 image generations.
NFR10: The complete user flow from signup to playing first game shall take under 5 minutes for new users, with setup time under 2 minutes for returning hosts.
NFR11: The system shall support up to 200 concurrent real-time connections (sufficient for 6-7 simultaneous games with 20 players each) within Supabase free tier limits, validated by load testing before launch.
NFR12: The codebase shall use TypeScript strict mode for type safety, Next.js 15 App Router patterns for modern React architecture, and Server Actions for data mutations to optimize performance and developer experience.
NFR13: The system shall achieve Lighthouse performance score >90 and accessibility score >90, with First Contentful Paint <1.5s and Time to Interactive <3s on 4G connections.
NFR14: The system shall handle errors gracefully with user-friendly messages and recovery actions, logging all errors with context for debugging without exposing technical details to users.
Compatibility Requirements
CR1: The system shall function in modern web browsers (Chrome 90+, Safari 14+, Firefox 88+) without requiring browser plugins or extensions.
CR2: The projector view shall be optimized for 1920x1080 resolution displays with fallback responsive sizing for 1280x720, maintaining 16:9 aspect ratio.
CR3: The player mobile view shall be optimized for viewport widths from 375px (iPhone SE) to 430px (iPhone 14 Pro Max) with touch-optimized tap targets (60px+ height).
CR4: The system shall integrate with Supabase Realtime using WebSocket connections with polling fallback for restrictive networks that block WebSocket protocols.
CR5: The system shall serve images as WebP format with JPEG fallback for browsers not supporting WebP, ensuring universal compatibility.

User Interface Design Goals
Overall UX Vision
Bible Memory Quiz Game delivers a fun, energetic, and frictionless experience optimized for two distinct viewing contexts: the shared projector display (creating group excitement and "wow" moments) and individual player phones (focused on fast, intuitive answer submission).
The design philosophy prioritizes zero friction over visual sophistication—users should feel the app "just works" within seconds of first use. The projector view emphasizes bold typography, vibrant colors, and dramatic AI imagery to create memorable shared moments, while player phones use large tap targets and minimal UI to eliminate interaction mistakes during fast-paced gameplay.
Visual tone: Modern, vibrant, and celebratory without feeling childish or overly "churchy." Think ESPN leaderboard energy meets Apple product simplicity. The UI should feel contemporary enough for youth while being approachable for all ages (middle school through senior adults).
Key Interaction Paradigms
Two-Screen Experience:
Projector = Shared spectacle: Large text, dramatic visuals, leaderboard reveals, winner celebrations
Phone = Personal control center: Answer selection and confirmation, score tracking, minimal distraction
Touch-First Mobile Design:
Large answer buttons (minimum 60px height) for fast tapping under time pressure
Select → Confirm/Lock interaction pattern: Player taps answer to select (highlighted), then taps "Lock Answer" button to confirm and prevent changes. Timer expiry auto-submits currently selected answer.
Single-tap interactions only—no complex gestures or swipes
Haptic feedback on answer selection and confirmation (if browser supports)
Clear visual confirmation of locked state (disabled buttons, checkmark icon)
QR Code + Fallback Pattern:
Primary: Scan QR code with phone camera → instant join via deep link
Fallback: Manual room ID entry (6-character code) for users without camera access or scanning issues
Zero app download friction—works in mobile browser immediately
Real-Time Feedback:
Instant visual response to every interaction (button press, answer lock, leaderboard update)
Loading states never exceed 2 seconds, with skeleton loaders and progress indicators
Clear error messages with recovery actions (e.g., "Connection lost. Reconnecting..." with spinner)
Progressive Disclosure:
Host sees only what they need at each step (create → configure → wait → play → results)
Players see minimal UI during questions (only question text, answer options, timer, lock button)
Complexity hidden behind simple defaults (e.g., default to 15 questions, pre-select most popular set)
Core Screens and Views
Host Flow:
Dashboard - Past games list with date/set/players, usage stats (3 of 5 games used), prominent "Create New Game" CTA, account tier display
Game Setup - Question set selection (cards with thumbnails, descriptions, lock icons for premium), question count selector (10/15/20 radio buttons)
Waiting Room (Projector) - Large QR code, room ID in huge text, joining player names animating in with numbered positions, player count, "Start Game" button
Question Display (Projector) - Full-screen question text (48px+), 4 answer options in colored boxes, countdown timer (large, animated), current question number, player count
Answer Reveal (Projector) - AI-generated image as full background (dimmed overlay), correct answer overlaid in large text with drop shadow, scripture reference, 5-second display with fade transition
Leaderboard (Projector) - Top 10 players with rank/name/score, podium styling for top 3 (gold/silver/bronze), rank change indicators (↑↓—), score animations counting up
Final Results (Projector) - "Game Over!" heading, winner name in huge text with trophy, confetti animation (3 seconds), full rankings scrollable, game stats, "Play Again" and "Dashboard" buttons
Player Flow:
Join Screen - Camera view for QR scan OR manual room ID input (auto-formatted), name entry field (2-30 chars), "Join Game" button
Waiting Room (Phone) - "Waiting for host to start..." message, current player count, your name highlighted in player list
Question View (Phone) - Question text (18px, readable), 4 large answer buttons (A/B/C/D with option text), countdown timer, "Lock Answer" button (enabled after selection)
Answer Locked (Phone) - Selected answer highlighted with checkmark, "Answer Locked" confirmation, disabled buttons, "Waiting for others..." message
Answer Feedback (Phone) - Correct/incorrect indicator (✓/✗), points earned display (+15 points), correct answer shown if wrong, cumulative score, AI image preview (small)
Personal Leaderboard (Phone) - Your rank prominently (e.g., "You're in 3rd place!"), rank change (↑↓—), top 3 players, players above/below you, encouraging message
Final Results (Phone) - Your final rank with celebratory message, final score with accuracy (12/15 correct - 80%), average response time, mini confetti if top 3, "Play Again" button
Authentication Screens:
Login - Email/password fields, "Sign in with Google" button, "Create account" link
Signup - Email, password, display name fields, "Sign up" button, "Already have account?" link
Account Settings - Profile info, tier display with upgrade CTA, usage stats, logout button
Accessibility
WCAG AA Compliance (targeting 90%+ conformance for MVP):
Sufficient color contrast ratios (4.5:1 for normal text, 3:1 for large text and UI components)
Keyboard navigation support for host dashboard and settings (not required for gameplay due to time constraints)
Screen reader labels for all interactive elements (buttons, inputs, links) using ARIA attributes
No information conveyed by color alone—use icons + text for correct/incorrect indicators
Visible focus indicators on all interactive elements (2px outline in primary color)
Considerations for All Ages:
Font sizes: Minimum 16px on mobile, 18px for body text, 48px+ on projector for distance viewing
No flashing animations that could trigger seizures (confetti particles are smooth motion)
Clear, simple language avoiding jargon (e.g., "Lock Answer" not "Submit Response")
Error recovery instructions in plain English (e.g., "Try refreshing" not "Cache invalidation required")
Known Limitations (acceptable for MVP):
No full keyboard-only gameplay (phone requires touch for time-constrained interactions)
Screen reader support is basic, not optimized for visually impaired users (casual church events typically not primary use case)
No closed captions (no audio/video in MVP)
Timer countdown may stress users with anxiety—no accommodation mode in MVP
Branding
Visual Identity:
Color Palette:
Primary: Deep Purple (#7C3AED) - royal, spiritual depth, memorable brand identity
Secondary: Coral Orange (#FF6B6B) - warm, inviting, celebratory excitement
Accent: Bright Teal (#14B8A6) - fresh, modern, clear visual contrast for CTAs
Success: Vibrant Green (#22C55E), Error: Warm Red (#EF4444)
Neutral: Warm grays (#FAFAF9 to #1C1917) - softer than pure gray, creates approachable feel
Typography:
Headings: Inter (bold/extra bold weights, modern, highly readable at distance)
Body: Inter (regular/medium weights, clean, professional)
Projector: Extra bold weights (800-900) for visibility from 20+ feet away
Mobile: Medium weights (500-600) for readability on smaller screens
Iconography: Lucide React icons (consistent, modern, open-source, good coverage)
Photography/Imagery: AI-generated Biblical scenes (DALL-E 3) with warm lighting, reverent tone, photorealistic style suitable for all ages
Tone & Voice:
Encouraging and celebratory (not preachy or overly religious)
Clear and direct (avoid industry jargon like "WebSocket reconnection")
Energetic but not chaotic (excitement without stress)
Age-appropriate for youth while respecting adults (avoid slang, use timeless language)
No Denominational Imagery:
Avoid crosses, church buildings, or denominational symbols in branding
Focus on Biblical scenes and characters (universal Christian appeal)
Neutral theological language (avoid Calvinist vs. Arminian debates, Catholic vs. Protestant distinctions)
Target Platforms
Web Responsive (Primary):
Desktop/laptop for host dashboard and projector view (1280px+ width)
Mobile web for player experience (375px to 430px width)
Tablet support secondary (will work but not specifically optimized)
Browser Support:
Chrome 90+ (primary development target, ~65% of users)
Safari 14+ (iOS requirement, ~30% of users)
Firefox 88+ (secondary, ~3% of users)
No Internet Explorer support (end-of-life)
Device Optimization:
Projector: 1920x1080 or 1280x720 resolution (16:9 aspect ratio assumed for churches)
Player phones: iPhone SE (375px) minimum, up to iPhone 14 Pro Max (430px)
Host laptop: Minimum 1280px width for dashboard, 1920px ideal for projector view
Network Assumptions:
Church WiFi: Variable quality, 5-20 Mbps typical, moderate latency (50-100ms)
4G cellular as fallback for players if WiFi congested
Optimized for moderate bandwidth (aggressive caching, compression, pre-loading)
PWA Considerations (Future):
MVP is web-only, but architected to support Progressive Web App conversion in Phase 2
"Add to home screen" capability (iOS Safari, Chrome Android)
Service Worker infrastructure can be added later
Offline mode NOT supported in MVP (requires internet connection)

Technical Assumptions
Repository Structure
Monorepo - Single repository containing all code (frontend, backend logic via Server Actions, database migrations, content scripts, shared utilities).
Rationale: For a solo developer with tightly coupled frontend/backend (Next.js Server Actions), monorepo eliminates coordination overhead and keeps versioning synchronized. All code changes deploy atomically. No need for polyrepo complexity when we have <5 distinct concerns.
Folder Structure:
/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Auth-related routes (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── create/            # Game creation flow
│   ├── game/[id]/         # Game views (host, play, results)
│   ├── join/              # Player join screen
│   └── pricing/           # Pricing and upgrade
├── components/            # React components (shadcn/ui + custom)
│   ├── ui/               # shadcn/ui components
│   ├── game/             # Game-specific components
│   └── layout/           # Layout components
├── lib/                   # Shared utilities and logic
│   ├── actions/          # Server Actions
│   ├── supabase/         # Supabase clients and helpers
│   ├── utils/            # Utility functions
│   └── hooks/            # Custom React hooks
├── scripts/               # Content generation and migration scripts
├── public/                # Static assets
└── docs/                  # Documentation
Service Architecture
Next.js 15 Server-Side Architecture with Supabase Backend Services
Architecture Pattern:
Frontend: Next.js 15 React Server Components (RSC) for initial page loads + Client Components for interactivity
Backend Logic: Next.js Server Actions for all data mutations (create game, submit answer, update score)
Database: PostgreSQL via Supabase with Row Level Security (RLS)
Real-Time: Supabase Realtime (Phoenix/Elixir WebSocket infrastructure) for game state synchronization
Storage: Supabase Storage with CDN for AI-generated images
Authentication: Supabase Auth (email/password + Google OAuth)
Why This Architecture:
Server Actions over API Routes: Simpler, type-safe, automatic request deduplication, better for mutations
RSC for Performance: Server-rendered pages with minimal client JavaScript, fast initial loads
Supabase as Backend Platform: Proven real-time capabilities (validated by research showing thousands of concurrent users), managed services reduce solo developer DevOps burden
Serverless Deployment: Vercel's serverless functions scale automatically without infrastructure management
No Microservices: Right-sized for MVP scale (<1000 users), avoid unnecessary complexity
Component Strategy:
Server Components: Dashboard, game setup, results pages (data fetching, no interactivity)
Client Components: Game views (real-time updates, timers, answer submission), forms, interactive UI
Server Actions: All write operations (create game, join game, submit answer, update score)
Supabase Realtime: All broadcast events (player joined, question advance, game state changes)
Testing Requirements
Pragmatic Testing Strategy Balancing Solo Developer Velocity with Quality
Testing Approach:
Unit Tests: Critical business logic (scoring calculations, game state machine, tier validation) using Vitest
Integration Tests: Server Actions, database queries, Supabase interactions using Vitest + Supabase local environment
Manual Testing: UI flows, real-time synchronization, cross-device gameplay (primary QA method)
Load Testing: Simulate 50+ concurrent players before launch using k6 or Artillery
Coverage Targets:
80%+ coverage for scoring logic, game state management, tier enforcement (must be perfect)
60%+ coverage for Server Actions and database queries (catch obvious bugs)
Manual QA for all user-facing flows (real-time sync, gameplay, UI/UX)
Local Testability:
Supabase Local: Use Supabase CLI to run local PostgreSQL + Realtime for development without cloud dependencies
Mock Realtime: Mock Supabase Realtime channels for unit testing game logic in isolation
Seed Scripts: Generate test questions, games, and players for consistent test data
Browser DevTools: Debug real-time sync by opening multiple tabs as different players
CI/CD Pipeline:
GitHub Actions: Run tests on every PR (TypeScript check, ESLint, Vitest)
Vercel Preview: Automatic preview deployments for each branch (manual testing link)
Type Safety: TypeScript strict mode catches errors at compile time
Linting: ESLint with Next.js config enforces code quality
Load Testing Plan:
Scenario: 5 simultaneous games with 10 players each (50 concurrent connections)
Tools: k6 or Artillery to simulate WebSocket connections and answer submissions
Metrics: Real-time message latency (target p95 <500ms), connection stability (0 drops), score accuracy
Timing: Run before launch after Epic 3 completion to validate real-time sync at scale
Rationale: Heavy unit testing where bugs are costly (scoring), integration testing on data layer, manual QA where automated tests provide diminishing returns (UX, real-time feel). Solo developer must balance quality with velocity—this approach catches critical bugs without slowing down MVP delivery.
Additional Technical Assumptions and Requests
Development Environment:
Node.js 20+ LTS for stability and long-term support
pnpm for package management (faster installs, better disk efficiency than npm/yarn, workspaces support)
TypeScript 5+ strict mode for type safety and better IDE experience
ESLint + Prettier for code consistency (Next.js ESLint config + Prettier defaults)
VS Code recommended with extensions: ESLint, Prettier, Tailwind CSS IntelliSense, TypeScript
Database Strategy:
PostgreSQL 15+ via Supabase (managed, no local DB installation required)
Row Level Security (RLS) enforces all data access policies at database level (defense in depth)
Database Migrations: Managed via Supabase Dashboard or CLI for schema changes
Seed Scripts: Node.js scripts to populate question sets and test data (run via pnpm scripts)
Indexes: Created on room_code, game_id foreign keys, user_id for performance
Real-Time Implementation:
Supabase Realtime: Built on Phoenix/Elixir, handles thousands of concurrent WebSocket connections
Game Channels: Isolated per-game using pattern game:${gameId} to prevent cross-game leakage
Channel Events:
player_joined - Broadcast when new player enters waiting room
game_start - Broadcast when host starts game
question_advance - Broadcast when moving to next question
answer_submitted - Notification when player locks answer (optional, for UI feedback)
game_end - Broadcast when game completes
Database Change Events: PostgreSQL triggers via Supabase Realtime (INSERT on game_players, UPDATE on games status)
Presence Tracking: Track active connections to detect player disconnections
Reconnection Logic: Exponential backoff with 3 retry attempts (1s, 2s, 4s delays)
Image Handling:
AI Generation: OpenAI DALL-E 3 API for Biblical imagery (batch pre-generation before launch)
Storage: Supabase Storage with public bucket for question images
CDN: Supabase Storage serves via CDN with 30-day cache headers
Optimization:
Next.js Image component for automatic WebP conversion with JPEG fallback
Responsive sizing: 1920x1080 for projector, 375x375 for mobile
Compression target: <300KB per image (balance quality and bandwidth)
Pre-loading Strategy: Load next 3 questions' images during current question phase (rolling window)
Fallback: Placeholder image with loading spinner if image fails to load
Authentication:
Supabase Auth for user management (battle-tested, handles OAuth complexity)
Email/Password: Standard authentication with password reset flow
Google OAuth: Configured via Supabase Dashboard with Google Cloud Console credentials
Session Management: JWT tokens stored in httpOnly cookies (automatic via Supabase client)
RLS Integration: Authenticated user ID (auth.uid()) used in Row Level Security policies
State Management:
React Server Components: Fetch data on server, no client-side state for initial page loads
React Context: Global app state (user session, theme preferences) via Context API
Zustand: Complex real-time game state (current question, player list, scores, timer) for performance and simplicity
Optimistic Updates: Instant UI feedback on actions (answer selection) with server confirmation
Server Actions: Handle state mutations server-side with automatic revalidation
UI Component Library:
shadcn/ui: Unstyled, accessible components built on Radix UI primitives (copy-paste, full control)
Tailwind CSS: Utility-first styling with custom color palette configuration
Lucide React: 1000+ consistent, modern icons (tree-shakeable, small bundle size)
Framer Motion: Declarative animations for leaderboard reveals, confetti, transitions
Error Handling & Monitoring:
Vercel Analytics: Built-in performance monitoring (Web Vitals, page views) - no additional cost
Custom Event Tracking: Track key events (signup, game created, game completed) via Vercel Analytics
Error Boundaries: React Error Boundaries wrap major sections (dashboard, game creation, gameplay)
Toast Notifications: shadcn/ui Toast component for user-friendly error messages
Structured Logging: Console logs in development, structured JSON logs in production (Vercel logs)
Graceful Degradation: Non-critical failures don't break experience (missing image → placeholder, leaderboard error → show scores only)
Security Considerations:
HTTPS Only: Enforced by Vercel (automatic SSL certificates)
CORS: Configured for Supabase API calls (allow only production domain)
Rate Limiting: Supabase has built-in rate limiting on auth endpoints; custom rate limiting on Server Actions if needed
Input Validation: Zod schemas validate all user input (room codes, player names, question selections)
SQL Injection Prevention: Supabase uses parameterized queries (safe by default)
XSS Protection: React's built-in escaping prevents XSS; sanitize any user-generated content
RLS Policies: All database access controlled at row level (users can only access their own data)
Performance Targets:
First Contentful Paint (FCP): <1.5s on 4G connection
Time to Interactive (TTI): <3s on 4G connection
Real-time Latency: <500ms for game state updates (p95 percentile)
Image Load Time: <2s on projector, <3s on mobile (with pre-loading)
Lighthouse Scores: Performance >90, Accessibility >90, Best Practices >90, SEO >90
Deployment & Infrastructure:
Vercel: Next.js hosting with automatic preview deployments on every PR
Supabase Cloud: Backend services (database, realtime, auth, storage) on managed infrastructure
Custom Domain: Configured via Vercel DNS (e.g., biblememorycuiz.com)
Environment Variables: Managed via Vercel dashboard + .env.local for development
Branch Deployments: Preview URLs for every Git branch (staging + feature branches)
Production: Deploy from main branch with automatic rollback on errors
Content Management:
Question Sets: Stored in PostgreSQL question_sets and questions tables
MVP: Manage via Supabase Dashboard SQL editor (manual inserts)
Phase 2: Build admin UI for CRUD operations on questions (web interface)
Scripture References: Stored with each question for theological traceability and citation
AI Image Prompts: Documented in scripts for reproducibility and regeneration if needed
Budget Constraints (Explicit):
Supabase Free Tier: 500MB database size, 1GB file storage, 2GB egress/month, 200 concurrent connections, 50,000 monthly active users
Vercel Free Tier: 100GB bandwidth/month, unlimited deployments, 100 GB-hours serverless function execution
OpenAI: ~$8 for 200 DALL-E 3 images (one-time cost for 100 MVP questions + 100 spares)
Target MVP: Stay under $50 total for MVP development and launch
Post-Launch: Monitor usage; stay under $100/month until $500+ MRR achieved
Development Workflow:
Git Branching: Feature branches off main, PR reviews before merge
Commits: Conventional Commits format (feat:, fix:, docs:, chore:)
Code Reviews: Self-review critical code, peer review optional (solo developer)
Deployment: Merge to main triggers automatic production deployment via Vercel
Rollback: Vercel dashboard allows instant rollback to previous deployment

Epic List
Epic 1: Foundation & Core Infrastructure
Establish project foundation with database setup, basic UI structure, and game creation flow (authentication deferred to Epic 5 for faster iteration).
Delivers a fully deployable application skeleton with the ability to create game rooms and display waiting rooms. Authentication is stubbed (manual user ID) to unblock development—real auth added in Epic 5. This epic prioritizes proving the tech stack works and establishing development patterns.

Epic 2: Real-Time Game Engine & Player Experience
Build core multiplayer mechanics with real-time synchronization, question display, and answer submission using Select → Confirm/Lock pattern.
Delivers a functional end-to-end game experience: players join via QR code/room ID, questions display on projector and phones, players select and lock answers within time limit, real-time sync works across devices. Uses 5-10 seed questions (no curated content yet). This epic proves the technical approach works before investing in content.

Epic 3: Scoring, Leaderboards & Game Completion
Implement scoring calculations, live leaderboards, and celebratory final results displays.
Delivers the competitive engagement: fair scoring with speed bonuses, live leaderboards after each question showing rank changes, personal performance feedback for players, winner celebrations with confetti. Completes the core gameplay loop from start to finish with satisfying conclusion.

Epic 4: Content Infrastructure & AI Visual System
Build content management system, integrate DALL-E 3 for AI image generation, and deliver ONE fully curated question set (20 questions + images) as proof of concept.
Delivers the content differentiator: question set data model, AI image generation pipeline, Supabase Storage integration, image pre-loading, and enhanced answer reveals with Biblical imagery. ONE complete set (Gospels: Life of Jesus) validates the content pipeline works before bulk creation.

Epic 5: Content Library Completion & Launch Readiness
Complete remaining 4 question sets (80 questions + images), add authentication, implement freemium model, and polish for public launch.
Delivers a launch-ready product: all 100 questions with AI imagery, real user authentication (email/password + Google OAuth), freemium tier restrictions with upgrade prompts, production error handling, performance optimization, analytics, and beta launch process. Transforms MVP from prototype to market-ready product.

Epic 1: Foundation & Core Infrastructure
Epic Goal: Establish a production-ready Next.js 15 application with Supabase backend, basic database schema, and game creation capability. Deliver a deployable foundation that all subsequent epics build upon, including developer tooling, core UI components, and the ability for hosts to create game rooms (without full authentication—manual user ID for development speed).

Story 1.1: Project Setup & Development Environment
As a developer, I want a fully configured Next.js 15 project with TypeScript, Tailwind CSS, shadcn/ui, and essential tooling, so that I have a solid foundation for rapid feature development with type safety and consistent code quality.
Acceptance Criteria
Next.js 15 project initialized using create-next-app with App Router and TypeScript strict mode
Tailwind CSS configured with custom color palette in tailwind.config.ts:
Primary: Deep Purple #7C3AED
Secondary: Coral Orange #FF6B6B
Accent: Bright Teal #14B8A6
Success: #22C55E, Error: #EF4444
Warm grays: #FAFAF9 to #1C1917
shadcn/ui initialized with components directory and theme configuration
pnpm configured as package manager with pnpm-lock.yaml committed
ESLint and Prettier configured with Next.js and TypeScript rules
Git repository initialized with .gitignore for Next.js, .env* files, and node_modules
Basic folder structure created:
app/ - Next.js App Router pages
components/ui/ - shadcn/ui components
components/game/ - Game-specific components
lib/ - Utilities and helpers
public/ - Static assets
Development server runs successfully on http://localhost:3000
Environment variables template created as .env.example with placeholder values
README.md with project title, description, and setup instructions (install, dev server)
First commit pushed to GitHub repository with CI placeholder (GitHub Actions workflow file)

Story 1.2: Supabase Project Setup & Database Schema
As a developer, I want a Supabase project with initial database schema for users, games, questions, and players, so that I have backend infrastructure ready to store application data with proper relationships.
Acceptance Criteria
Supabase project created via Supabase Dashboard with PostgreSQL database provisioned
Database tables created via SQL migration in Supabase SQL Editor:
users (id UUID PK, email TEXT, display_name TEXT, tier TEXT DEFAULT 'free', created_at, updated_at)
question_sets (id UUID PK, title TEXT, description TEXT, question_count INT DEFAULT 0, tier_required TEXT DEFAULT 'free', is_published BOOLEAN DEFAULT false, created_at)
questions (id UUID PK, question_set_id UUID FK, question_text TEXT, option_a/b/c/d TEXT, correct_answer CHAR(1), image_url TEXT, scripture_reference TEXT, order_index INT, created_at)
games (id UUID PK, host_id UUID FK users, room_code TEXT UNIQUE, question_set_id UUID FK, question_count INT, status TEXT DEFAULT 'waiting', current_question_index INT DEFAULT 0, started_at, completed_at, created_at)
game_players (id UUID PK, game_id UUID FK games, player_name TEXT, total_score INT DEFAULT 0, joined_at)
player_answers (id UUID PK, game_id UUID FK, player_id UUID FK game_players, question_id UUID FK, selected_answer CHAR(1), is_correct BOOLEAN, response_time_ms INT, points_earned INT, answered_at)
Indexes created for performance:
CREATE INDEX idx_games_room_code ON games(room_code);
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_player_answers_game_id ON player_answers(game_id);
Foreign key relationships established with CASCADE deletes where appropriate (e.g., delete game → delete players)
Supabase connection environment variables added to .env.local:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
Supabase client helpers created:
lib/supabase/client.ts - Browser client using createBrowserClient()
lib/supabase/server.ts - Server client for Server Components and Server Actions
Test connection: Simple Server Component fetches question_sets table (should return empty array)
Database accessible via Supabase Dashboard Table Editor for manual inspection
Seed script created: scripts/seed-test-questions.ts generates 5-10 test questions for development
Migration SQL saved in /migrations/001_initial_schema.sql for version control

Story 1.3: Basic UI Components with shadcn/ui
As a developer, I want core shadcn/ui components installed and customized for the application, so that I have reusable, accessible UI building blocks for rapid development.
Acceptance Criteria
shadcn/ui components installed via CLI:
button - Primary, secondary, destructive variants
card - For question set selection and dashboard
input - Text input for room codes, player names
label - Form labels
toast - Toast notifications for errors/success
dialog - Modal dialogs for confirmations
badge - For tier indicators, question counts
Components customized in components/ui/ to use application color palette
Button variants configured:
Default: Deep Purple background
Secondary: Coral Orange background
Outline: Teal border
Typography utilities created in lib/utils.ts for consistent text sizing (projector vs mobile)
Layout components created:
components/layout/header.tsx - Top navigation with logo placeholder
components/layout/footer.tsx - Basic footer
Test page created at app/test-components/page.tsx showcasing all installed components
Tailwind CSS IntelliSense working in VS Code (autocomplete for className values)
Responsive breakpoints tested (mobile 375px, desktop 1280px)
Dark mode setup skipped for MVP (light mode only)
Accessibility verified: Focus indicators visible, keyboard navigation works

Story 1.4: Game Creation Flow - Setup Page
As a host user, I want to create a new game by selecting a question set and game length, so that I can configure a game session before inviting players.
Acceptance Criteria
Game creation page at /create (public route for MVP - auth later)
Page header: "Create New Game" with brief instructions
Question set selection displayed as cards in responsive grid (2 columns desktop, 1 mobile):
Card shows: Title, description, question count badge, difficulty indicator
5 placeholder cards with titles: "Gospels," "OT Heroes," "Miracles," "NT Church," "Bible Basics"
Sets 2-5 have "Coming Soon" overlay and disabled state (only "Gospels" selectable initially)
Selected question set highlighted with purple border
Game length selector below sets: Radio buttons for 10, 15, 20 questions (default 15 selected)
"Create Game" button at bottom (shadcn/ui Button, primary variant)
Button disabled until question set selected, enabled after selection
Clicking "Create Game" triggers Server Action:
Generate unique 6-character room code (uppercase alphanumeric, check uniqueness in DB)
Insert row into games table: host_id (stubbed UUID for now), room_code, question_set_id, question_count, status='waiting', created_at
Redirect to /game/[gameId]/host (waiting room)
Error handling: If DB insert fails, show toast notification "Failed to create game. Try again."
Loading state: Button shows spinner during creation
Responsive layout works on mobile (375px) and desktop (1280px+)
Test: Create 3 games, verify unique room codes generated and games saved in DB

Story 1.5: Waiting Room - Host View with QR Code
As a host user, I want to see a waiting room with QR code, room ID, and placeholder for joining players, so that I can share the game code and prepare to start the game.
Acceptance Criteria
Host waiting room page at /game/[gameId]/host (dynamic route, gameId from URL params)
Server Component fetches game from DB by gameId, verifies status='waiting'
Full-screen layout optimized for projector (1920x1080):
Large "Waiting for Players" heading (64px font size)
QR code generated containing join URL: https://[APP_URL]/join?code=[room_code]
Room code displayed below QR in huge text (80px): "Room Code: ABC123"
Instructions: "Scan QR code or go to [APP_URL]/join and enter: ABC123" (32px)
QR code generated using qrcode.react library (install as dependency)
QR code size: 300x300px, centered on screen
Player list section: "0 Players Joined" placeholder (real-time updates in Epic 2)
"Start Game" button visible but disabled (will enable in Epic 2 when players join)
"Cancel Game" button in corner to delete game and return to creation page
Visual styling: Deep purple background gradient, white text, high contrast for projector
Error handling: If gameId invalid or game not found, redirect to /create with error toast
Test: Navigate to waiting room after game creation, verify QR code scans to join URL
Test: Room code displayed matches DB value

Story 1.6: Player Join Flow - Join Page & Name Entry
As a player, I want to join a game by scanning QR code or entering room code and my name, so that I can participate in the quiz from my mobile phone without downloading an app.
Acceptance Criteria
Join page at /join (public route, no auth required)
If URL contains ?code=[room_code] query param (from QR scan), auto-populate room code input
Room code input field:
6-character text input (auto-uppercase, auto-format)
Label: "Room Code"
Placeholder: "ABC123"
Player name input field:
Text input (2-30 characters, trimmed)
Label: "Your Name"
Placeholder: "Enter your name"
Required validation
"Join Game" button (large, 60px height for touch targets)
Clicking "Join Game" triggers Server Action:
Validate room code exists in games table with status='waiting'
If invalid: Show error toast "Game not found. Check your code and try again."
If game status='active' or 'completed': Show error toast "This game has already started."
Insert player into game_players table: game_id, player_name, total_score=0, joined_at
Redirect to /game/[gameId]/play (player view)
Mobile-optimized layout (375px width):
Large input fields (48px height)
Large button (60px height)
Generous spacing for easy tapping
QR code scanning: When user scans QR code with phone camera, opens join URL in browser directly
Loading state: Button shows spinner during validation/insertion
Error handling: Network errors show "Connection failed. Try again."
Test: Scan QR code on phone, join game successfully
Test: Manual room code entry works, player saved in DB

Story 1.7: Player Waiting View & Basic Dashboard
As a player, I want to see a waiting screen confirming I joined the game, so that I know my connection is working while waiting for the host to start.
Acceptance Criteria
Player view page at /game/[gameId]/play (dynamic route)
Server Component fetches game by gameId and current player from game_players (identify by player name for now)
Waiting state UI (displayed when game.status='waiting'):
"Waiting for host to start..." message (24px font)
Player's name displayed: "Hi, [PlayerName]!" (18px)
Current player count: "3 players joined" (fetched from game_players count)
Loading animation (pulsing dots or spinner)
Mobile-optimized layout (375px):
Centered content
Minimal UI (no distractions)
Easy-to-read text
Auto-refresh or placeholder for real-time updates (Epic 2 will add Realtime subscription)
If game status changes to 'active', show placeholder message: "Game starting soon..." (real gameplay in Epic 2)
If game not found or player not in game, redirect to /join with error toast
Visual styling: Coral orange accent color, warm gray background
Test: Join game as player, see waiting screen with correct name and player count
Basic host dashboard at /dashboard (simple placeholder):
"Your Games" heading
List of past games (fetch from games WHERE host_id = current_user, placeholder host ID for now)
"Create New Game" button linking to /create
Empty state if no games: "No games yet. Create your first game!"

Epic 1 Complete!
This epic delivers:
✅ Full Next.js 15 + Supabase foundation with TypeScript and Tailwind CSS
✅ Database schema with all core tables and relationships
✅ shadcn/ui components ready for use
✅ Host can create games with QR codes and room IDs
✅ Players can join via QR scan or manual code entry
✅ Waiting rooms ready for both host and players (static for now, real-time in Epic 2)
✅ Basic dashboard placeholder for host game history
Authentication deferred: Using stubbed host ID for development speed. Real auth added in Epic 5.

Epic 2: Real-Time Game Engine & Player Experience
Epic Goal: Build core multiplayer mechanics enabling real-time synchronization across all devices using Supabase Realtime. Implement question display on projector and phones, Select → Confirm/Lock answer submission pattern, and automatic question advancement. Uses 5-10 seed questions for testing. Proves the technical approach works before investing in curated content.

Story 2.1: Supabase Realtime Setup & Game Channels
As a developer, I want Supabase Realtime configured with game-specific channels for state synchronization, so that all devices in a game session receive updates instantly via WebSockets.
Acceptance Criteria
Supabase Realtime enabled in Supabase Dashboard project settings
Real-time helper utility created in lib/supabase/realtime.ts:
createGameChannel(gameId: string) - Creates and returns Realtime channel for game
subscribeToGameChannel(channel, callbacks) - Subscribe with event handlers
broadcastGameEvent(channel, event, payload) - Broadcast event to all subscribers
Game channel naming convention: game:${gameId} for per-game isolation
Channel events defined as TypeScript types in lib/types/realtime.ts:
player_joined - Payload: { playerId, playerName }
game_start - Payload: { startedAt }
question_advance - Payload: { questionIndex, questionData }
game_end - Payload: { completedAt }
PostgreSQL Change tracking configured via Supabase Realtime:
Listen to INSERT on game_players table (filter by game_id)
Listen to UPDATE on games table (filter by id, track status and current_question_index changes)
Test setup:
Host page subscribes to game channel on mount
Player page subscribes to game channel on mount
Both unsubscribe on unmount (cleanup)
Reconnection logic: Exponential backoff with 3 retry attempts (1s, 2s, 4s delays)
Error handling: Display "Connection lost. Reconnecting..." toast if WebSocket drops
Connection status indicator component created: components/game/ConnectionStatus.tsx (green dot = connected, yellow = reconnecting, red = failed)
Test: Open host in one tab, player in another, verify both connect to same channel
Test: Simulate disconnect (kill network), verify reconnection attempts work
Network quality monitoring: Log latency for channel messages (compare timestamp)

Story 2.2: Real-Time Player List in Waiting Room
As a host user, I want to see player names appear in real-time as they join the game, so that I know who's participating before I start the game.
Acceptance Criteria
Host waiting room (/game/[gameId]/host) converted to Client Component for real-time updates
On mount, subscribe to game channel and listen for:
player_joined broadcast event
PostgreSQL INSERT on game_players (fallback/confirmation)
Player list section displays:
Player count: "5 players joined" (updates in real-time)
Numbered list of player names (1. Alice, 2. Bob, 3. Charlie...)
List scrollable if >10 players
When new player joins:
Name animates into list with slide-in effect (Framer Motion)
Player count increments
Brief highlight on new player name (fades after 1 second)
Maximum 20 players enforced (free tier limit):
Server Action rejects join if COUNT(game_players) >= 20
Shows error toast: "Game is full (20 players max). Upgrade to Pro for unlimited."
"Start Game" button enabled when player_count >= 1, disabled if 0 players
Optimistic UI: Player list updates immediately on broadcast (no wait for DB confirmation)
Duplicate player names allowed (no uniqueness check) but numbered (Alice, Alice (2), Alice (3))
If player disconnects before game starts, they remain in list (can rejoin by re-entering name)
Test: Join game from 3 different devices, verify all names appear on host projector within 500ms
Test: Reach 20 players, verify 21st player sees "Game is full" error

Story 2.3: Game Start & Question Data Loading
As a host user, I want to start the game and load the first question across all devices, so that gameplay begins simultaneously for everyone.
Acceptance Criteria
"Start Game" button on host waiting room triggers Server Action:
Update games table: status='active', started_at=NOW(), current_question_index=0
Fetch first question from questions table WHERE question_set_id AND order_index=1
Broadcast game_start event via Realtime with first question data
Question data payload includes:
questionId (UUID)
questionText (string)
options (array: [optionA, optionB, optionC, optionD])
questionNumber (e.g., 1 of 15)
timerDuration (15 seconds)
Host waiting room listens for game_start event, redirects internally to question display state
Player waiting view listens for game_start event, transitions to question display state
Loading state: Both views show "Starting game..." spinner during transition
Timer starts automatically when question data loads (synchronized across all devices)
Error handling: If question fetch fails, show error toast and stay in waiting room
Question pre-loading: Fetch next 3 questions in background after game starts (Epic 4 will add images)
State management: Use Zustand store for game state (current question, timer, player answers)
Test: Start game from host, verify all connected players transition to question view simultaneously
Test: Timer starts at same time on all devices (within 500ms variance)
Performance: Question data loads in <1 second on 4G connection

Story 2.4: Question Display - Projector View
As a host user, I want questions displayed on the projector with answer options and countdown timer, so that all players can see the question simultaneously on the shared screen.
Acceptance Criteria
Host question display state (part of /game/[gameId]/host page, conditional render):
Full-screen layout optimized for projector (1920x1080)
Question text displayed at top in large, bold typography (48px, max 3 lines)
Four answer boxes in 2x2 grid below question:
Each box: Large letter label (A/B/C/D) + option text (32px)
Boxes have colored borders (purple, orange, teal, green) for visual distinction
Countdown timer displayed prominently above answer boxes:
Circular progress ring or large numbers (80px font)
Counts down from 15 to 0 seconds
Color changes: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
Question number and total: "Question 3 of 15" (top-right corner, 24px)
Player count: "12 players" (top-left corner, 24px)
Generic background: Solid gradient or subtle pattern (no images yet—Epic 4 adds AI images)
Timer implementation:
Client-side countdown using setInterval (1 second ticks)
Synchronized with server time on load (prevent drift)
When timer reaches 0, broadcast timer_expired event
Answer boxes non-interactive on projector (view-only, players submit on phones)
Smooth transitions: Fade in when question loads, fade out when advancing
Responsive fallback: If displayed on smaller screen (laptop), scales down appropriately
Accessibility: High contrast text on background, readable from 20+ feet away
Test: Display question on projector, verify text is readable from distance
Test: Timer counts down accurately (compare to system clock)
Test: Question number and player count display correctly

Story 2.5: Question Display - Player Mobile View
As a player, I want to see the question and answer options on my phone with a countdown timer, so that I can read the question and select my answer quickly.
Acceptance Criteria
Player question display state (part of /game/[gameId]/play page, conditional render):
Mobile-optimized layout (375px-430px width)
Question text at top (18px font, max 4 lines, scrollable if longer)
Four answer buttons stacked vertically:
Each button: Large tap target (60px height)
Letter label (A/B/C/D) + option text (16px, 2 lines max)
Buttons use primary/secondary color variants (purple, orange, teal, coral)
Countdown timer displayed between question and buttons:
Progress bar or circular timer (40px height)
Numeric countdown (e.g., "12s remaining")
Buttons initially unselected (default state)
Player taps button to select answer:
Selected button highlighted (thicker border, darker background)
Other buttons remain normal
Selection is VISUAL ONLY (not submitted yet)
Player can change selection before confirming (tap different button)
"Lock Answer" button appears below answer buttons ONLY after selection:
Large button (60px height, full width)
Primary color (deep purple)
Text: "Lock Answer" or "Confirm"
Disabled/hidden until selection made
Tapping "Lock Answer" triggers submission (Story 2.6)
Timer counts down (synchronized with host):
Updates every second
Color changes: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
If timer expires before locking, currently selected answer auto-submits (Story 2.6)
Question number displayed: "Question 3 of 15" (small text, top)
Smooth transitions: Fade in when question loads
Accessibility: Touch targets 60px min, high contrast, focus indicators
Test: Load question on iPhone SE (375px), verify all text readable and buttons tappable
Test: Select answer, verify "Lock Answer" button appears
Test: Change selection, verify visual highlight updates

Story 2.6: Answer Submission with Confirm/Lock Pattern
As a player, I want to lock my answer so it cannot be changed, or have my selection auto-submitted when time expires, so that my response is recorded fairly without accidental changes.
Acceptance Criteria
"Lock Answer" button triggers Client Component function:
Disable all answer buttons (prevent further changes)
Hide "Lock Answer" button
Show "Answer Locked ✓" confirmation message (green text)
Calculate responseTimeMs (time from question start to lock click)
Call Server Action: submitAnswer(gameId, playerId, questionId, selectedAnswer, responseTimeMs)
Server Action submitAnswer:
Insert row into player_answers table:
game_id, player_id, question_id, selected_answer (A/B/C/D), response_time_ms, answered_at=NOW()
is_correct and points_earned NULL (calculated in Epic 3)
Return success/error status
After successful submission, player view shows "Waiting for others..." message (replaces lock button)
If timer expires before player clicks "Lock Answer":
Automatically trigger submission with currently selected answer
If no answer selected, submit selected_answer=NULL (no response)
Player cannot submit multiple times per question (insert-only, no updates)
Error handling:
If submission fails (network error), retry once automatically
If retry fails, show toast: "Submission failed. Your answer may not be recorded."
Optimistic UI: Show "Answer Locked ✓" immediately, confirm in background
Visual feedback: Brief haptic vibration on lock (if browser supports)
Test: Select answer, click "Lock Answer", verify saved in DB with correct response time
Test: Let timer expire without locking, verify selected answer auto-submitted
Test: Let timer expire with no selection, verify NULL answer saved
Test: Network disconnect during submission, verify retry logic works

Story 2.7: Question Advancement & Synchronization
As a host user, I want the game to automatically advance to the next question after all players answer or timer expires, so that gameplay flows smoothly without manual intervention.
Acceptance Criteria
Host Client Component tracks answer submissions:
Listen to player_answers table INSERT events via Realtime (filter by game_id and question_id)
Count submitted answers vs. total players
Advancement logic:
When timer expires (15 seconds), wait 2 additional seconds (brief pause)
After pause, check if all players submitted (optional—advance regardless)
Trigger Server Action: advanceQuestion(gameId)
Server Action advanceQuestion:
Update games table: current_question_index += 1
Fetch next question from questions table (by order_index)
Broadcast question_advance event with new question data via Realtime
All connected devices (host + players) listen for question_advance event:
Transition to new question display
Reset timer to 15 seconds
Clear previous answers/selections
If current_question_index >= question_count:
Game ends (transition to results—Epic 3)
Update games table: status='completed', completed_at=NOW()
Broadcast game_end event
Smooth transitions: Fade out current question, fade in next question (300ms animation)
No blank screens or jarring jumps between questions
Edge case - Host disconnect: If host disconnects mid-game, game pauses (no auto-recovery in MVP)
Edge case - Player disconnect: Player's lack of answer recorded as NULL, game continues
Test: Complete game with 3 players through 5 questions, verify all devices advance synchronously
Test: Advancement latency <500ms (measure time from broadcast to render on player phone)
Test: Game ends after last question, verify status updated to 'completed'

Epic 2 Complete!
This epic delivers the core gameplay loop:
✅ Real-time synchronization across all devices using Supabase Realtime
✅ Players join and appear in waiting room instantly
✅ Game starts simultaneously for everyone
✅ Questions display on projector and phones with synchronized timers
✅ Select → Confirm/Lock answer submission pattern prevents accidental changes
✅ Timer expiry auto-submits current selection
✅ Questions advance automatically through entire game
✅ All tested with 5-10 seed questions (no curated content or images yet)
Major technical risk validated: Real-time sync with 20+ players works reliably.

Epic 3: Scoring, Leaderboards & Game Completion
Epic Goal: Implement fair scoring calculations with speed bonuses, display live leaderboards after each question showing player rankings and changes, provide personal feedback to players, and create celebratory final results screens with winner recognition. This completes the competitive gameplay loop that drives engagement and repeat play.

Story 3.1: Scoring Calculation Engine
As a developer, I want a reliable scoring calculation function that computes points based on correctness and speed, so that players are scored fairly and consistently across all games.
Acceptance Criteria
Scoring utility created in lib/game/scoring.ts:
Function calculateScore(isCorrect: boolean, responseTimeMs: number): number
Logic:
If isCorrect === false: return 0
If isCorrect === true: return 10 + speedBonus
Speed bonus:
0-3000ms (0-3 seconds): +5 points → Total 15
3001-5000ms (3-5 seconds): +3 points → Total 13
5001-15000ms (5-15 seconds): +0 points → Total 10
Server Action processQuestionScores(gameId, questionId) created:
Called automatically after question timer expires (triggered by Epic 2 advancement logic)
Fetch all player_answers for this game_id and question_id
Fetch correct answer from questions table
For each answer:
Calculate is_correct (compare selected_answer to correct_answer)
Calculate points_earned using calculateScore() function
Update player_answers row with is_correct and points_earned
Update game_players.total_score (cumulative sum: total_score += points_earned)
Tie-breaking rule implemented:
If two players have same total_score, rank by lower cumulative response_time_ms (sum across all questions)
Add helper function calculateRankings(players) that returns sorted array with rank numbers
Unit tests for scoring function (Vitest):
Correct answer, 2s response → 15 points
Correct answer, 4s response → 13 points
Correct answer, 10s response → 10 points
Incorrect answer, any time → 0 points
No answer (NULL selected_answer) → 0 points
Integration test:
Create test game with 3 players
Insert mock answers (one correct fast, one correct slow, one incorrect)
Run processQuestionScores()
Verify total_score updated correctly in DB
Error handling: If scoring fails for any player, log error but continue processing others
Performance: Process 20 players' scores in <500ms
Test: Run game with 5 players, verify scores calculated correctly after each question
Test: Tie scenario: Two players with 30 points, faster player ranks higher
Scoring broadcast: After processing, broadcast scores_updated event via Realtime (for leaderboard refresh)

Story 3.2: Answer Reveal on Projector
As a host user, I want to see which answer was correct after each question, so that players learn the right answer before seeing the leaderboard.
Acceptance Criteria
After question timer expires (Epic 2 Story 2.7 triggers this), host view transitions to "Answer Reveal" state:
Display for 5 seconds (static duration)
Layout:
Original question text (smaller, 32px, top of screen)
Correct answer highlighted with large checkmark icon (✓) and green background
Text: "Correct Answer: [Letter] - [Answer Text]" (48px font)
Scripture reference below if exists (e.g., "Matthew 2:1" in 24px font)
Background: Solid color or subtle gradient (no images yet—Epic 4 adds AI images)
Correct answer box from question display (Story 2.4) highlighted in green
Incorrect answer boxes remain visible but grayed out
Transition animation: Fade in reveal (300ms) after timer reaches zero
Reveal state synchronized to all devices via Realtime answer_reveal broadcast:
Host broadcasts event with correctAnswer (letter) when entering reveal state
Players listen and display same reveal on mobile (Story 3.3)
After 5 seconds, automatic transition to leaderboard (Story 3.4)
Visual styling: Success green (#22C55E) for correct answer, warm grays for incorrect
Accessibility: High contrast, checkmark icon large enough to see from distance (80px)
Test: Complete question, verify correct answer displayed matches DB correct_answer field
Test: Reveal displays for 5 seconds, then advances to leaderboard automatically
Test: All players see reveal state simultaneously (within 500ms)

Story 3.3: Player Answer Feedback
As a player, I want to see if my answer was correct or incorrect immediately after the timer expires, so that I get instant feedback on my performance.
Acceptance Criteria
After player's answer locks or timer expires (Story 2.6), player view transitions to feedback state:
Display until host advances to leaderboard (5 seconds, matches reveal timing)
Layout (mobile-optimized, 375px):
Player's selected answer button highlighted
If correct:
Green checkmark icon (✓) on selected button
Text: "+[X] points" (large, 32px font, animated count-up)
Encouraging message: "Correct! Well done!" (24px)
If incorrect:
Red X icon (✗) on selected button
Text: "Incorrect. Correct answer: [Letter]" (20px)
Correct answer highlighted in green below
Points: "+0 points"
If no answer:
Text: "Time's up! No answer submitted."
Correct answer shown: "Correct answer: [Letter]"
Points: "+0 points"
Cumulative score updated: "Total Score: [X] points" (18px, bottom of screen)
Points earned animated: Count up from 0 to actual points (e.g., 0→15 over 500ms)
Scripture reference displayed if available (small text, 14px)
Visual feedback synced with projector reveal (listen to answer_reveal broadcast)
Smooth transition: Fade from answer submission to feedback (300ms)
After 5 seconds, automatic transition to personal leaderboard (Story 3.5)
Test: Answer correctly in 2 seconds, see "+15 points" with green checkmark
Test: Answer incorrectly, see red X and correct answer displayed
Test: Let timer expire with no answer, see "No answer" message
Test: Cumulative score updates correctly (previous total + new points)

Story 3.4: Live Leaderboard - Projector Display
As a host user, I want a live leaderboard displayed on the projector after each question, so that the competitive element engages all participants and creates excitement.
Acceptance Criteria
After answer reveal (5 seconds), projector transitions to leaderboard display:
Display for 10 seconds before advancing to next question
Layout (full-screen, 1920x1080):
Large "Leaderboard" heading (64px, centered top)
Top 10 players displayed in ranked order (sorted by total_score DESC, ties broken by cumulative response time)
Each leaderboard row:
Rank number (1, 2, 3... or 🥇🥈🥉 for podium)
Player name (40px font)
Total score (48px font, bold)
Rank change indicator (↑ moved up, ↓ moved down, — stayed same)
Podium styling for top 3:
1st: Gold background gradient, crown icon
2nd: Silver background, medal icon
3rd: Bronze background, medal icon
Remaining 7 players: White/light gray rows
If >10 players, show "...and [X] more" at bottom (with total player count)
Rank change calculation:
Compare player's rank after this question vs. previous question
Store previous rank in Zustand game state
Display arrow indicator (↑ green, ↓ red, — gray)
Score animation: Scores count up from previous total to new total (1 second animation)
Ranking animation: Players slide into position (Framer Motion, staggered 100ms delay per row)
Visual design: Use secondary colors (coral, teal) for vibrancy, bold typography
Current question number displayed: "After Question 5 of 15" (top-right, 24px)
Total player count: "15 players" (top-left, 24px)
Leaderboard data fetched via Server Action after processQuestionScores() completes:
Query game_players WHERE game_id ORDER BY total_score DESC, cumulative response time
Return top 10 + total count
Broadcast leaderboard_ready event to sync transition across devices
After 10 seconds, broadcast question_advance to move to next question (or game_end if last question)
Test: Complete question with 15 players, verify top 10 displayed in correct order
Test: Player moves from 5th to 2nd place, verify green ↑ indicator shown
Test: Scores animate smoothly, rankings slide into position

Story 3.5: Personal Leaderboard - Player View
As a player, I want to see my current rank and score after each question on my phone, so that I know how I'm performing compared to others.
Acceptance Criteria
After answer feedback (5 seconds), player view transitions to personal leaderboard:
Display for 10 seconds (synced with projector leaderboard)
Layout (mobile-optimized, 375px):
Personal Stats Section (top, prominent):
"You're in [X] place!" (32px font, centered)
Rank change indicator: "↑ Moved up 2 places!" or "— Stayed in 3rd" (20px)
Total score: "[X] points" (28px, bold)
Points earned this round: "+[X] points" (18px, green if gained)
Top 3 Players (always shown):
Podium visual (🥇🥈🥉) with names and scores
Player's own row highlighted if in top 3 (purple background)
Context Leaderboard (if player not in top 3):
Player immediately above current player
Current player (highlighted with purple background)
Player immediately below current player
E.g., "4. Alice - 45 pts / 5. You - 42 pts / 6. Bob - 40 pts"
Encouraging messages based on rank:
Top 3: "Great job! You're on the podium!" (green text)
Top 50%: "Keep it up! You're doing well!" (teal text)
Lower 50%: "You can do it! Stay focused!" (coral text)
Visual styling: Player's row has distinct background (deep purple), white text
Smooth transition: Fade from feedback to leaderboard (300ms)
Leaderboard data fetched from Server Action (same data as projector, filtered for personal view)
Listen to leaderboard_ready broadcast to sync transition
After 10 seconds, listen for question_advance or game_end event to proceed
Test: Player in 8th place sees Top 3, then 7th, 8th (highlighted), 9th
Test: Player in 2nd place sees themselves in podium with silver medal
Test: Rank change message updates correctly (moved up/down/stayed)
Test: Encouraging message matches rank category

Story 3.6: Game Completion & Final Results - Projector
As a host user, I want a final results screen celebrating the winner and showing all player rankings, so that the game has a satisfying conclusion and recognizes top performers.
Acceptance Criteria
After last question's leaderboard (when current_question_index == question_count), host view transitions to final results:
Triggered by game_end broadcast (sent by advanceQuestion Server Action)
Game status updated to completed with completed_at=NOW() in DB
Final results layout (full-screen, 1920x1080):
Winner Celebration (3 seconds):
"Game Over!" heading (80px font)
Winner's name in huge text (100px): "[Winner Name] Wins!" with trophy icon 🏆
Confetti animation covering screen (Framer Motion particles in primary colors)
Background: Gradient with purple/coral/teal
Full Leaderboard (after confetti clears):
All players ranked (1 to N), scrollable if >15 players
Podium section for top 3 with gold/silver/bronze styling
Each row: Rank, Player Name, Final Score
Game stats displayed:
Total questions: "[N] questions"
Game duration: "Completed in [X] minutes"
Average score: "[X] points per player"
"Play Again" button (bottom-right, large):
Redirects host to /create to start new game
"Back to Dashboard" button (bottom-left):
Redirects to /dashboard
Final results persist in database (game already saved with status='completed')
Confetti animation:
Uses Framer Motion or canvas-confetti library
Particles in purple, coral, teal colors
Burst from top, falls to bottom over 3 seconds
Game duration calculation: completed_at - started_at (convert to minutes)
Visual styling: Celebratory, high-energy, bold typography
Results screen remains accessible at /game/[gameId]/results for review (static page)
Test: Complete 10-question game, verify winner displayed correctly
Test: Confetti animates smoothly for 3 seconds
Test: Full rankings show all 15 players in correct order
Test: Game duration calculated and displayed accurately

Story 3.7: Player Final Results & Celebration
As a player, I want to see my final rank and score with encouraging feedback, so that I feel recognized for my participation and motivated to play again.
Acceptance Criteria
After last question's leaderboard, player view transitions to final results:
Triggered by game_end broadcast
Display permanently (no auto-redirect, player controls navigation)
Final results layout (mobile-optimized, 375px):
Personal Results (top, prominent):
Final rank: "You finished in [X] place!" (32px font)
Trophy/medal icon if top 3 (🥇🥈🥉)
Final score: "[X] points" (40px, bold)
Accuracy: "[Correct]/[Total] correct - [%]" (20px)
Average response time: "[X]s per question" (18px)
Personalized Message based on rank:
1st: "Champion! You won! 🎉" (animated confetti)
2nd-3rd: "Great job! You made the podium! 🏅"
Top 50%: "Well done! Solid performance! 👏"
Everyone else: "Thanks for playing! Try again! 💪"
Quick Stats:
Fastest answer time: "[X]s on Question [N]"
Most points earned: "+15 on Question [N]"
Streak: "[X] correct answers in a row"
Mini confetti animation if player in top 3 (1 second burst)
"Play Again" button (full-width, 60px height):
Redirects to /join to join another game
"Share Results" button (disabled, grayed out):
Text: "Share (Coming Soon)" - Phase 2 feature
Visual styling: Celebratory colors (gold for 1st, silver for 2nd, bronze for 3rd, purple for others)
Accuracy calculation: (correct_answers / total_questions) * 100
Average response time: Sum of response_time_ms / number of questions answered
Results remain visible indefinitely (player can screenshot or review)
Results accessible at /game/[gameId]/results?player=[playerId] (unique URL per player)
Test: Player finishing 1st sees winner message with confetti
Test: Player finishing 8th sees participation message with stats
Test: Accuracy percentage calculated correctly (12/15 = 80%)
Test: "Play Again" button navigates to join screen

Epic 3 Complete!
This epic delivers competitive engagement:
✅ Fair, transparent scoring with speed bonuses (0-5 points)
✅ Automatic score processing after each question
✅ Live leaderboards on projector with rank change indicators
✅ Personal performance feedback for players with encouraging messages
✅ Celebratory final results with winner recognition and confetti
✅ Complete gameplay loop from start to satisfying finish
✅ Players motivated to play again
Core MVP gameplay now complete! Next epic adds the content differentiator (AI images).

Epic 4: Content Infrastructure & AI Visual System
Epic Goal: Build content management infrastructure for question sets, integrate OpenAI DALL-E 3 for AI image generation, implement Supabase Storage for images, add pre-loading for smooth gameplay, and deliver ONE fully curated question set (Gospels: Life of Jesus, 20 questions with AI-generated Biblical imagery) as proof of concept. This epic validates the content pipeline before bulk creation in Epic 5.

Story 4.1: Question Set Management & Enhanced Data Model
As a developer, I want an enhanced question set data model with metadata and publishing controls, so that hosts can select from organized, themed question collections and we can manage draft vs. published sets.
Acceptance Criteria
Database migration to enhance question_sets table:
Add column: thumbnail_url TEXT (optional, for set card display)
Add column: difficulty_level TEXT DEFAULT 'beginner' (beginner/intermediate/advanced)
Add column: is_published BOOLEAN DEFAULT false (controls visibility to users)
Add column: display_order INT (controls sort order on selection screen)
Seed data for all 5 question sets in DB (via migration or seed script):
Set 1: "Gospels: Life of Jesus" - Beginner, 20 questions, is_published=true
Set 2: "Old Testament Heroes" - Beginner, 20 questions, is_published=false
Set 3: "Miracles & Parables" - Intermediate, 20 questions, is_published=false
Set 4: "New Testament Church" - Intermediate, 20 questions, is_published=false
Set 5: "Bible Basics" - Beginner, 20 questions, is_published=false
Server Action getQuestionSets() returns only published sets by default (filter is_published=true)
Admin override (future): Can view unpublished sets (not implemented in MVP)
Question set selection UI (/create page) updated:
Display sets as shadcn/ui Cards in responsive grid
Each card shows: Title, description, question count badge, difficulty badge, thumbnail (placeholder for now)
Unpublished sets show "Coming Soon" overlay with lock icon (disabled state)
Only published sets clickable/selectable
Thumbnail placeholders created (can be simple colored gradient cards with icons):
Gospels: Cross icon on purple gradient
OT Heroes: Shield icon on blue gradient
Miracles: Star icon on teal gradient
NT Church: Flame icon on orange gradient
Bible Basics: Book icon on green gradient
Database query helper in lib/database/questions.ts:
getQuestionsBySet(setId: string) returns questions ordered by order_index
getRandomQuestions(setId: string, count: number) for future randomization (Phase 2)
Test: Fetch published sets, verify only "Gospels" returned initially
Test: Attempt to create game with unpublished set, verify error/prevention
Migration rollback script included for safety

Story 4.2: OpenAI DALL-E 3 Integration & Image Generation Pipeline
As a developer, I want an automated pipeline to generate Biblical imagery using DALL-E 3, so that each question's correct answer has a relevant, reverent visual representation.
Acceptance Criteria
Install OpenAI SDK: pnpm add openai
Environment variable: OPENAI_API_KEY added to .env.local and .env.example
Image generation utility created in lib/ai/image-generation.ts:
Function generateBiblicalImage(prompt: string, questionId: string): Promise<string>
Calls OpenAI API:
Model: dall-e-3
Size: 1024x1024 (square, flexible for responsive use)
Quality: standard (balance quality vs. cost)
Style: natural (photorealistic, reverent tone)
Returns image URL from OpenAI response
Prompt engineering template for consistency:
Base structure: "A reverent, biblically accurate scene depicting [subject]. [Details]. Warm lighting, historical accuracy, photorealistic style, suitable for all ages."
Example: "A reverent, biblically accurate scene depicting the Bethlehem stable where Jesus was born. Wooden manger, straw, warm candlelight, starry night visible through doorway. Warm lighting, historical accuracy, photorealistic style, suitable for all ages."
Generated images downloaded and saved temporarily (Node.js fs module)
Supabase Storage bucket created: question-images (public access for CDN delivery)
Upload function: Uploads image to Supabase Storage, returns public URL
Database update: Store public URL in questions.image_url field
Batch generation script: scripts/generate-images.ts
Accepts question set ID as input
Fetches all questions for set
Generates image for each question sequentially (respects OpenAI rate limits)
Uploads to Supabase Storage
Updates DB with URLs
Logs progress and cost (~$0.04 per image)
Rate limiting: Add delay between requests (OpenAI: 5 requests/minute for DALL-E 3)
Error handling: If generation fails, log error, skip question, continue (allows manual retry)
Cost tracking: Script outputs total cost estimate at end
Test: Generate 3 sample images for test questions, verify uploaded to Supabase Storage and URLs stored in DB
Test: Images accessible via public URL (CDN delivery)

Story 4.3: Curated Question Set #1 - "Gospels: Life of Jesus"
As a content creator, I want to create 20 theologically accurate questions about Jesus' life with scripture references and AI image prompts, so that we have one complete, high-quality question set for MVP launch.
Acceptance Criteria
20 questions written covering key Gospel events (content creation task):
Birth and early life: 3 questions (Bethlehem, Egypt flight, baptism)
Ministry and teachings: 6 questions (Sermon on Mount, parables, disciples)
Miracles: 4 questions (feeding 5000, walking on water, healing blind man, raising Lazarus)
Passion week: 4 questions (Last Supper, crucifixion, burial)
Resurrection and ascension: 3 questions (empty tomb, appearances, ascension)
Each question formatted with:
Clear, concise question text (one sentence, <100 characters for readability)
Four distinct answer options (A/B/C/D)
One obviously correct answer
Three plausible but incorrect options (not trick questions)
Scripture reference cited (e.g., "Matthew 2:1" for birth location)
Questions appropriate for all ages (middle school through adult comprehension)
Denomination-neutral wording:
Avoid Catholic vs. Protestant distinctions (e.g., "Mary, mother of Jesus" not "Blessed Virgin")
Avoid Calvinist vs. Arminian theology debates
Focus on events and facts, not interpretations
Theological accuracy verified:
Self-review against Bible text
Optional: Peer review by 2-3 Christians for accuracy check
Questions inserted into DB via seed script or manual SQL:
question_set_id = Gospels set UUID
order_index = 1 to 20 (logical progression through Jesus' life)
correct_answer = A/B/C/D
scripture_reference = book, chapter, verse
AI image prompts documented for each question:
Stored in comments/notes field OR separate file (e.g., image-prompts.md)
Example prompts:
Q1 (Birth): "Bethlehem stable, wooden manger with baby, straw bedding, warm candlelight, starry night through door"
Q5 (Feeding 5000): "Hillside with large crowd seated, disciples distributing bread and fish, Sea of Galilee backdrop, warm afternoon light"
Q12 (Crucifixion): "Three wooden crosses on hill, dark cloudy sky, reverent and solemn, not graphic"
Questions reviewed for difficulty balance:
8 easy (common knowledge): "Where was Jesus born?"
10 medium (requires some Biblical knowledge): "Who baptized Jesus?"
2 hard (less common facts): "What town did Jesus grow up in?"
Test: Query Gospels set from DB, verify 20 questions returned in correct order
Test: All questions have 4 options, correct answer marked, scripture reference present
Content approved: Finalized question list reviewed and approved before image generation

Story 4.4: AI Image Generation for Gospels Question Set
As a developer, I want to generate 20 AI images for the Gospels question set using the batch pipeline, so that the complete visual experience is ready for the first playable set.
Acceptance Criteria
Run batch generation script: pnpm run generate-images --set=gospels
Script reads all 20 questions from Gospels set in DB
For each question:
Use documented AI image prompt (from Story 4.3)
Call generateBiblicalImage() function
Download image from OpenAI
Upload to Supabase Storage: /question-images/gospels/q[1-20].png
Update DB questions.image_url with public URL
Image quality review (manual):
All 20 images reviewed for appropriateness and quality
Biblical accuracy: Scene matches question content
Reverent tone: Not cartoonish, not irreverent
All-ages appropriate: No violence, graphic content, or disturbing imagery
Visual clarity: Subject matter recognizable and clear
Image regeneration if needed:
Any unsatisfactory images flagged
Prompts refined for clarity
Regenerate with improved prompt (up to 2 retries per question)
Image optimization:
Original images saved as backup (locally: /backups/originals/)
Images compressed using sharp or similar tool (target <300KB each)
Compression maintains visual quality (no visible artifacts)
CDN delivery verified:
Supabase Storage configured with public access
Cache headers set to 30 days (Cache-Control: public, max-age=2592000)
Test image load speed on moderate connection (<2 seconds)
Cost tracking:
Script logs each generation with cost (~$0.04 per image)
Total cost calculated and logged (20 × $0.04 = $0.80 estimated)
Test: Load game with Gospels set, advance through 5 questions, verify all images display correctly during answer reveals
Test: Images load within 2 seconds on throttled 3G connection (Chrome DevTools)
Documentation: Image prompt template saved in /docs/image-generation-guide.md for future sets

Story 4.5: Image Pre-loading & Performance Optimization
As a developer, I want images pre-loaded during gameplay to eliminate loading delays, so that answer reveals are instant and dramatic without waiting for downloads.
Acceptance Criteria
Image pre-loading utility created in lib/utils/image-preloader.ts:
Function preloadImages(imageUrls: string[]): Promise<void>
Uses browser's native Image constructor to trigger downloads
Returns promise that resolves when all images loaded
Pre-loading strategy (implemented in game Client Component):
On game start: Pre-load first 3 questions' images immediately
After each question displays: Pre-load next 3 upcoming images (rolling window)
Example: Currently on Q3 → Pre-load Q4, Q5, Q6
Server Action enhancement:
When advanceQuestion called, include next 3 questions' image URLs in response
Client receives URLs and triggers pre-load in background
Fallback for failed pre-load:
If image fails to load, display placeholder with loading spinner during answer reveal
Placeholder: Gray box with icon + "Loading image..." text
Retry loading once after 2 seconds
Browser caching leveraged:
Supabase Storage CDN configured with aggressive caching (30-day headers)
Images cached in browser after first download (subsequent games skip download)
Next.js Image component integration:
Use <Image> component from next/image for automatic optimization
Formats: Automatic WebP conversion with JPEG fallback (browser support detection)
Responsive sizing: 1920x1080 for projector (host), 375x375 for mobile (player)
Lazy loading disabled for game images (eager loading for immediate display)
Performance metrics tracked:
Log image load time for each pre-loaded image
Target: <1 second per image on 4G connection
Alert/log if any image takes >3 seconds (investigate)
Test: Start game, verify first 3 images pre-loaded before Q1 displays
Test: Advance through 10 questions, verify images appear instantly during reveal (<500ms)
Test:
Retry
R
Continue
Test: Throttle network to 3G speed in Chrome DevTools, verify pre-loading prevents stutter and images still display within 2 seconds 11. Test: Disable network mid-game, verify fallback placeholder displays gracefully 12. Performance measurement: Total image payload for 20-question game <6MB (20 images × 300KB avg)

Story 4.6: Enhanced Answer Reveal with AI Imagery
As a host user, I want stunning AI-generated Biblical images to appear during answer reveals on the projector, so that each correct answer creates a memorable "wow" moment that reinforces learning.
Acceptance Criteria
Answer reveal screen (Epic 3 Story 3.2) enhanced with AI image display:
Full-screen AI-generated image as background
Semi-transparent dark overlay (40% opacity black) for text readability
Correct answer text overlaid on image:
Large white text with drop shadow (48px font)
Format: "Correct Answer: [Letter] - [Answer Text]"
Positioned center or bottom-third for readability
Scripture reference below answer (28px font, lighter color)
Image transition animation:
Fade in from question screen (500ms smooth transition)
Image scales slightly (1.0 to 1.05) for subtle "zoom" effect
Text appears 200ms after image (staggered reveal)
Image aspect ratio handling:
Images are 1024x1024 (square) from DALL-E 3
Displayed at 1920x1080 (16:9) on projector
CSS: object-fit: cover centers and crops to fill screen
No stretching or distortion
Text overlay styling:
White text with dark drop shadow (2px offset, 80% opacity black shadow)
Semi-transparent background behind text (purple with 60% opacity) for guaranteed readability
Text container: Rounded corners, padding for breathing room
Mobile player view enhancement:
Smaller version of same image (375px square, optimized)
Same text overlay pattern
Image positioned at top, text at bottom
Maintains consistent experience across devices
Fallback for missing images:
If image_url is NULL or fails to load, display solid gradient background (purple-to-coral)
Generic icon (e.g., open book) in center
Text overlay remains same (no broken experience)
Synchronization:
Host broadcasts answer_reveal event with image URL and correct answer
Players listen and display same image (mobile-optimized version)
Display duration: 5 seconds (unchanged from Epic 3)
Accessibility: Text contrast ratio >4.5:1 against overlay background (WCAG AA compliance)
Test: Complete question, verify AI image displays correctly with answer text overlaid
Test: Image enhances experience without distracting from answer (subjective assessment)
Test: Text is readable on all images (test with 10 different images)
Test: Fallback displays correctly if image URL missing or fails to load

Story 4.7: Question Set Selection UI Enhancement
As a host user, I want an attractive question set selection interface showing available sets with visual previews, so that I can easily choose which Biblical theme to play.
Acceptance Criteria
Game creation page (/create) displays question sets as large cards in responsive grid:
Desktop (1280px+): 2 columns, 3 rows
Tablet (768-1279px): 2 columns
Mobile (375-767px): 1 column, stacked
Each card (shadcn/ui Card component) shows:
Thumbnail image at top (placeholder gradients for now, 300x200px)
Set title in bold (24px font)
Description text (2-3 sentences, 16px font, gray color)
Question count badge (e.g., "20 questions" with icon)
Difficulty badge (icon + text: "Beginner" / "Intermediate" / "Advanced")
"Published" status (checkmark icon) OR "Coming Soon" overlay (lock icon)
Published set card (Gospels only initially):
Fully colored and vibrant
Hover effect: Box shadow increases, slight scale (1.02)
Clickable cursor
Selected state: Purple border (4px), checkmark icon in corner
Unpublished set cards (Sets 2-5):
Grayscale filter (80% desaturated)
"Coming Soon" overlay badge (coral orange background, white text)
Lock icon (Lucide React Lock icon)
Disabled state: No hover effect, not clickable, cursor default
Tooltip on hover: "This question set will be available soon"
Thumbnail placeholder designs (use Tailwind gradients):
Gospels: Purple-to-coral gradient with cross icon
OT Heroes: Blue-to-teal gradient with shield icon
Miracles: Teal-to-green gradient with star/sparkle icon
NT Church: Orange-to-red gradient with flame icon
Bible Basics: Green-to-yellow gradient with book icon
Selection interaction:
Click card to select (border highlights)
Click different card to change selection (previous deselects)
Only one set selectable at a time
Visual hierarchy:
Selected card stands out (purple border, elevated shadow)
Unpublished cards clearly secondary (grayscale, overlay)
"Create Game" button remains at bottom (Epic 1 Story 1.4):
Enabled only when published set selected
Disabled if unpublished set selected (with tooltip: "Select an available question set")
Responsive grid spacing:
Generous gaps between cards (24px)
Cards fill available width with max-width constraint (500px per card)
Accessibility:
Keyboard navigation: Tab through cards, Enter to select
Screen reader: Announces "Gospels: Life of Jesus, 20 questions, Beginner difficulty, Published. Select to create game."
Focus indicators visible (2px purple outline)
Test: Navigate to /create, verify Gospels card is colored and selectable
Test: Hover over unpublished card, verify "Coming Soon" overlay and tooltip
Test: Select Gospels set, verify purple border appears
Test: Click "Create Game" with Gospels selected, verify game creation proceeds normally

Epic 4 Complete!
This epic delivers the content differentiator:
✅ Enhanced question set data model with publishing controls
✅ OpenAI DALL-E 3 integration with batch generation pipeline
✅ ONE complete question set: Gospels (20 questions + 20 AI-generated images)
✅ Image pre-loading strategy for smooth, instant reveals
✅ Enhanced answer reveals with stunning Biblical imagery
✅ Professional question set selection UI
✅ Proof of concept: Content pipeline validated and ready for scale
Content creation can now proceed in parallel with Epic 5 development.

Epic 5: Content Library Completion & Launch Readiness
Epic Goal: Complete the remaining 4 question sets (80 questions with AI-generated images), implement user authentication (email/password + Google OAuth), add freemium tier restrictions and upgrade flows, production-harden the application with error handling and performance optimization, set up analytics and monitoring, and execute beta launch process. This epic transforms the MVP from functional prototype to market-ready product.

Story 5.1: Question Sets 2-5 Content Creation
As a content creator, I want to create 80 additional theologically accurate questions across 4 themed sets, so that hosts have diverse Biblical content to choose from for repeated gameplay.
Acceptance Criteria
Set 2: "Old Testament Heroes" (20 questions)
Coverage:
Abraham and patriarchs (5 questions): Abraham's covenant, Isaac, Jacob's ladder, Joseph in Egypt
Moses and Exodus (5 questions): Burning bush, plagues, Red Sea, Ten Commandments, wilderness
David and kings (5 questions): David vs. Goliath, David's psalms, Solomon's wisdom, temple building
Prophets (5 questions): Elijah and fire, Daniel in lions' den, Jonah and whale, Isaiah prophecies
Difficulty: Beginner
Format: Same as Gospels (4 options, scripture references, AI image prompts)
Set 3: "Miracles & Parables" (20 questions)
Coverage:
Jesus' miracles (10 questions): Water to wine, healing paralytic, walking on water, calming storm, feeding 5000, raising Lazarus, healing blind man, casting out demons
Jesus' parables (10 questions): Good Samaritan, Prodigal Son, Lost Sheep, Sower and seeds, Talents, Rich man and Lazarus, Wise/Foolish builders
Difficulty: Intermediate
Format: Same structure with scripture references
Set 4: "New Testament Church" (20 questions)
Coverage:
Book of Acts (8 questions): Pentecost, Peter's sermon, Saul's conversion, Philip and Ethiopian, Peter and Cornelius
Paul's missionary journeys (6 questions): Damascus road, Antioch church, Athens sermon, Ephesus riot, shipwreck
New Testament letters (6 questions): Love chapter (1 Cor 13), Armor of God (Eph 6), Faith by hearing (Rom 10), Fruit of Spirit (Gal 5)
Difficulty: Intermediate
Format: Same structure
Set 5: "Bible Basics" (20 questions)
Coverage:
Ten Commandments and key laws (5 questions): "No other gods," "Honor parents," Sabbath, Greatest commandment
Books of the Bible (5 questions): First book (Genesis), Longest book (Psalms), Gospel books, Paul's letters
Major Biblical figures (5 questions): First man (Adam), First king (Saul), Oldest person (Methuselah), Mary's role
Key Biblical events (5 questions): Creation, Noah's flood, Tower of Babel, Passover, Resurrection
Difficulty: Beginner (easiest set, suitable for all ages including children)
Format: Same structure
All 80 questions follow same quality standards as Gospels:
Clear, concise text (<100 characters)
Four distinct options with one correct answer
Scripture reference for each question
Denomination-neutral, all-ages appropriate
AI image prompt documented for generation
Theological accuracy review:
Self-review against Bible text (cross-reference scripture citations)
Optional peer review by 2-3 Christians
No controversial theological positions (stick to events and facts)
Difficulty balance within each set:
Each set has mix of easy/medium questions
No "trick questions" or obscure trivia
Progressive difficulty (easier questions first)
Questions inserted into database:
Correct question_set_id for each set
order_index 1-20 within each set
All metadata complete (scripture references, prompts)
No duplicate questions across all 5 sets (100 total unique questions)
Test: Query each set, verify 20 questions returned with proper metadata
Content finalized and approved before image generation (Story 5.2)

Story 5.2: AI Image Generation for Remaining Question Sets
As a developer, I want to generate 80 AI images for question sets 2-5 using the established pipeline, so that all question sets have complete visual experiences ready for launch.
Acceptance Criteria
Run batch generation script for each set:
pnpm run generate-images --set=ot-heroes
pnpm run generate-images --set=miracles-parables
pnpm run generate-images --set=nt-church
pnpm run generate-images --set=bible-basics
Script process (same as Story 4.4):
Read questions from DB for specified set
Use documented AI image prompts
Generate via DALL-E 3 API
Upload to Supabase Storage: /question-images/[set-name]/q[1-20].png
Update DB questions.image_url with public URLs
Image prompt refinements for each set:
OT Heroes: Historical scenes with warm, epic lighting (Abraham's tent, Moses at Red Sea, David with sling)
Miracles: Dramatic moments with divine light effects (water to wine, healing scenes, calming storm)
NT Church: Early Christian scenes, warm community gatherings (Pentecost flames, Paul preaching, prison scenes)
Bible Basics: Iconic, simple imagery (stone tablets, scroll with text, Noah's ark, creation scenes)
Quality review (manual for all 80 images):
Biblical accuracy: Scenes match question content
Reverent tone: Not cartoonish, appropriate for church settings
All-ages appropriate: No graphic violence or disturbing imagery
Visual clarity: Subject matter recognizable
Image regeneration as needed:
Flag unsatisfactory images (target <10% regeneration rate)
Refine prompts for clarity
Regenerate with improved prompts (up to 2 retries per image)
Image optimization:
All original images backed up locally
Compress to <300KB each while maintaining quality
Verify compression doesn't introduce artifacts
Database updates:
All 80 image_url fields populated
All 5 question sets marked is_published=true
Verify image URLs accessible via CDN
Cost tracking:
Log generation costs: 80 images × $0.04 = ~$3.20
Total MVP image cost: 100 images × $0.04 = ~$4.00
Performance verification:
Test random sampling of 20 images from all sets
Verify load times <2 seconds on 3G connection
CDN caching headers confirmed (30-day)
Test: Create games with all 5 sets, advance through multiple questions per set, verify all images display correctly
Test: Image quality consistent across all sets (no outliers or low-quality generations)
Documentation: Final image generation report saved (/docs/image-generation-summary.md) with costs, regeneration rate, lessons learned

Story 5.3: User Authentication with Supabase Auth
As a host user, I want to sign up and log in using email/password or Google OAuth, so that I can create an account and access game hosting features with my games tracked to my account.
Acceptance Criteria
Supabase Auth configuration:
Email/password authentication enabled in Supabase Dashboard
Google OAuth provider configured:
Google Cloud Console project created
OAuth 2.0 credentials generated (Client ID and Secret)
Authorized redirect URIs configured for Supabase
Credentials added to Supabase Auth settings
Auth utilities created in lib/auth/:
auth.ts: Helper functions (signup, login, logout, getCurrentUser)
auth-provider.tsx: React Context Provider for auth state
useAuth.ts: Custom hook for accessing auth context
Login page at /login:
Email input field (validated format)
Password input field (toggle visibility icon)
"Sign In" button (primary)
Divider: "Or continue with"
"Sign in with Google" button (Google logo, secondary variant)
Link: "Don't have an account? Sign up"
Error handling: Display auth errors (invalid credentials, too many attempts)
Signup page at /signup:
Display name input (2-30 characters, required)
Email input (validated format)
Password input (minimum 8 characters, show strength indicator)
Confirm password input (must match)
"Create Account" button
"Sign up with Google" button
Link: "Already have an account? Log in"
Terms acceptance checkbox (required): "I agree to Terms of Service"
Authentication flow:
Successful login/signup → Redirect to /dashboard
Failed login → Show error toast with message
Google OAuth → Opens popup, returns with session token
Session persists across page refreshes (Supabase handles via cookies)
User profile creation:
On first login (email or OAuth), create row in users table:
id (Supabase auth UID)
email (from auth)
display_name (from signup form or Google profile)
tier DEFAULT 'free'
created_at NOW()
Use Database Trigger or Server Action on first login
Protected routes middleware:
Middleware checks auth status for routes: /dashboard, /create, /game/[id]/host
If not authenticated → Redirect to /login with return URL
If authenticated → Allow access
Session management:
Logout functionality: Clear session, redirect to landing page
Session expiry: Supabase handles auto-refresh (7-day default)
"Remember me" handled by Supabase (persistent session)
User context available throughout app:
useAuth() hook provides: user, loading, error
User object includes: id, email, displayName, tier
Navigation header updated:
If logged in: Show user's display name + dropdown (Dashboard, Settings, Logout)
If logged out: Show "Log In" and "Sign Up" buttons
Previous "stubbed host ID" replaced with real authenticated user ID:
Game creation uses auth.user.id for host_id
Dashboard queries games WHERE host_id = auth.user.id
Test: Sign up with email/password, verify user created in DB and redirected to dashboard
Test: Log in with existing account, verify session persists after page refresh
Test: Sign in with Google, verify user created and OAuth flow works
Test: Access /create without auth, verify redirected to /login
Test: Logout, verify session cleared and redirected appropriately

Story 5.4: Freemium Tier Restrictions & Enforcement
As a product owner, I want free tier users to experience core value but hit clear limits that encourage upgrading, so that we can convert satisfied users to paying customers.
Acceptance Criteria
Tier enforcement logic created in lib/auth/tier-check.ts:
Function canCreateGame(userId: string): Promise<{allowed: boolean, reason?: string}>
Function canAccessQuestionSet(userId: string, setId: string): Promise<boolean>
Function canExceedPlayerLimit(userId: string): Promise<boolean>
Free tier limits defined (hardcoded constants in lib/constants/tiers.ts):
typescript
  FREE_TIER = {
     questionSets: ['gospels', 'bible-basics', 'ot-heroes'], // 3 of 5 sets
     maxPlayersPerGame: 20,
     maxGamesPerMonth: 5,
     features: ['basic_leaderboard']
   }
   PRO_TIER = {
     questionSets: 'all', // All 5+ sets
     maxPlayersPerGame: Infinity,
     maxGamesPerMonth: Infinity,
     features: ['basic_leaderboard', 'downloadable_results']
   }
   CHURCH_TIER = {
     ...PRO_TIER,
     features: [...PRO_TIER.features, 'custom_questions', 'analytics_dashboard']
   }
Usage tracking table created (migration):
sql
  CREATE TABLE user_usage (
     user_id UUID PRIMARY KEY REFERENCES users(id),
     games_created_this_month INT DEFAULT 0,
     month_start_date DATE NOT NULL,
     last_game_created_at TIMESTAMP,
     updated_at TIMESTAMP DEFAULT NOW()
   );
Usage tracking logic:
On game creation, increment games_created_this_month
On month rollover (day 1), reset counter to 0 and update month_start_date
Server Action trackGameCreation(userId) handles increment
Game creation flow checks (Server Action):
Before allowing creation:
Check user.tier from DB
If free tier, check games_created_this_month < 5
If limit reached, return error: {allowed: false, reason: 'monthly_limit'}
If limit hit, show upgrade modal (Story 5.5)
Question set access control:
In getQuestionSets() Server Action:
Fetch user tier
If free tier, filter to only allowed sets (Gospels, Bible Basics, OT Heroes)
Sets 4-5 (Miracles, NT Church) show as locked with "Pro" badge
Player limit enforcement:
In player join flow (Server Action):
Count current players: SELECT COUNT(*) FROM game_players WHERE game_id
Fetch game host's tier
If free tier AND count >= 20, reject join with error: "Game is full (20 players max). Host can upgrade to Pro for unlimited players."
UI indicators for tier restrictions:
Dashboard shows usage: "3 of 5 games used this month" (progress bar)
Question set cards show lock icon + "Pro" badge on restricted sets
Tooltip on locked sets: "Upgrade to Pro to unlock this question set"
Tier check caching:
Cache user tier in React Context (avoid repeated DB queries)
Refresh on tier change (upgrade)
Test: Free user creates 5 games, verify 6th attempt shows upgrade prompt
Test: Free user attempts to select locked question set, verify "Pro" badge and tooltip
Test: Free user's game reaches 20 players, verify 21st player sees "Game is full" error
Test: Pro user (manually set tier in DB) can access all 5 sets and unlimited games
Test: Usage counter resets on month rollover (simulate by setting month_start_date to last month)

Story 5.5: Upgrade Flow & Pricing Page
As a free tier user, I want to easily understand pricing and prepare to upgrade when I hit limits, so that I can unlock full platform features when ready.
Acceptance Criteria
Pricing page created at /pricing:
Three-column comparison table (Free, Pro, Church)
Free Column:
Price: $0/month
3 question sets (listed)
20 players max per game
5 games per month
Basic leaderboard
"Current Plan" badge if user is free tier
Pro Column:
Price: $12.99/month
All 5+ question sets
Unlimited players
Unlimited games
Basic leaderboard
Downloadable results (coming soon badge)
"Upgrade" button (primary, purple)
Church Column:
Price: $299/year (Save 50%!)
Everything in Pro, plus:
Custom question upload (Phase 2)
Analytics dashboard (Phase 2)
Priority support
"Contact Sales" button (secondary)
Upgrade CTAs throughout app:
Dashboard: When approaching limit (4/5 games), show banner: "1 game left this month. Upgrade to Pro for unlimited games."
Game Creation: When limit hit, show modal: "You've reached your monthly limit. Upgrade to Pro to continue hosting games."
Question Set Selection: Lock icon on restricted sets, "Upgrade to Pro" text below
All CTAs link to /pricing
Upgrade page at /upgrade:
Tier selection (Pro or Church, radio buttons)
Payment form placeholder: "Coming Soon - Launching December 2025"
Email signup form for launch notification:
Email input
"Notify Me When Available" button
Stores in waitlist table: CREATE TABLE waitlist (email TEXT UNIQUE, tier_interest TEXT, signed_up_at TIMESTAMP)
Confirmation message: "Thanks! We'll email you when payments go live."
FAQ section on pricing page:
"Can I cancel anytime?" → Yes, cancel anytime, no commitments
"Is there a refund policy?" → 30-day money-back guarantee (Phase 2)
"How do I verify for Church pricing?" → Contact us with church info (manual approval)
"Can I switch from Pro to Church?" → Yes, prorate and upgrade anytime
"Do you offer discounts for multiple churches?" → Contact sales for volume pricing
Social proof (placeholders for MVP):
Testimonial section: "What Youth Pastors Say" (3 placeholder quotes)
Trust badges: "Used by 50+ churches" (update post-launch)
Visual design:
Comparison table uses primary colors (purple highlights for recommended plan)
Clear visual hierarchy (Pro column slightly elevated/highlighted)
Mobile-responsive: Stacks columns vertically on mobile
Analytics event tracking:
Track "Upgrade CTA Clicked" with source (dashboard, game creation, question set)
Track "Email Signup Submitted" on waitlist form
Tier upgrade (manual for MVP beta):
Admin can manually update users.tier in Supabase Dashboard
Beta testers get Pro tier for free during beta period
Test: Navigate to /pricing, verify all tiers and features displayed correctly
Test: Click "Upgrade" button, land on /upgrade page with email signup
Test: Submit email to waitlist, verify saved in DB and confirmation shown
Test: Free user hits game limit, verify modal with "Upgrade to Pro" CTA appears
Test: Manually set user to Pro tier in DB, verify all restrictions lifted

Story 5.6: Production Error Handling & User Feedback
As a user, I want clear, actionable error messages when something goes wrong, so that I know what happened and how to recover without frustration.
Acceptance Criteria
Error boundary components created (React Error Boundaries):
components/error-boundary.tsx: Wraps main app sections
Catches unhandled errors in component tree
Displays user-friendly fallback UI:
Heading: "Oops! Something went wrong."
Message: "We're sorry for the inconvenience. Try refreshing the page."
"Refresh Page" button and "Go to Dashboard" button
Error categories defined:
Network Errors: Connection lost, API timeout, fetch failed
Database Errors: Query failed, constraint violation, not found
Real-time Sync Errors: WebSocket disconnected, channel error
Validation Errors: Invalid input, room code not found, game full
Authentication Errors: Session expired, unauthorized, login failed
User-facing error messages (friendly, actionable):
Network: "Connection lost. Check your internet and try again."
Game not found: "Game not found. Check your room code and try again."
Game started: "This game has already started. Ask the host to create a new game."
Game full: "Game is full (20 players max). The host can upgrade to Pro for unlimited players."
Authentication: "Session expired. Please log in again."
Toast notification component (shadcn/ui Toast):
Error toasts: Red background, X icon, auto-dismiss after 5 seconds
Success toasts: Green background, checkmark icon, auto-dismiss after 3 seconds
Info toasts: Blue background, info icon, manual dismiss
Used throughout app for transient feedback
Error logging (development and production):
Development: console.error() with full stack trace
Production: Structured JSON logs to Vercel logs:
json
    {
       "level": "error",
       "message": "Game creation failed",
       "userId": "uuid",
       "error": "error message",
       "timestamp": "ISO datetime"
     }
Critical error reporting:
Full-page error states for catastrophic failures (auth system down, DB unreachable)
"Report Problem" button opens pre-filled email template:
To: support@[domain]
Subject: "Error Report: [Error Type]"
Body: Pre-filled with error message, user ID, timestamp
Graceful degradation:
Missing image → Show placeholder with book icon
Leaderboard error → Show scores without rankings (simple list)
Real-time sync failure → Fall back to manual refresh button
Network status indicator (component in game views):
Green dot: "Connected" (WebSocket active)
Yellow dot: "Reconnecting..." (attempting reconnection)
Red dot: "Disconnected" (failed after retries, with "Refresh" button)
Retry logic for transient failures:
Automatic retry: 3 attempts with exponential backoff (1s, 2s, 4s)
User-triggered retry: "Try Again" button on error states
Applies to: Server Actions, image loading, real-time connections
Error boundary testing:
Simulate component error (throw error in render), verify boundary catches
Verify fallback UI displays with recovery options
Test: Disconnect network mid-game, verify "Connection lost. Reconnecting..." message appears
Test: Invalid room code, verify "Game not found" toast with actionable message
Test: Trigger various error types, verify appropriate toasts/messages display
Test: Critical error (simulate DB failure), verify full-page error state with "Report Problem" button

Story 5.7: Performance Optimization & Load Testing
As a developer, I want the application to perform smoothly under realistic load conditions, so that games run reliably with 20+ players on church WiFi without lag or failures.
Acceptance Criteria
Lighthouse audit run on all key pages:
Pages tested: Landing, Dashboard, Game Creation, Game Host View, Game Player View
Target scores (average):
Performance: >90
Accessibility: >90
Best Practices: >90
SEO: >85
Performance targets verified:
First Contentful Paint (FCP): <1.5s on 4G connection
Time to Interactive (TTI): <3s on 4G connection
Largest Contentful Paint (LCP): <2.5s
Cumulative Layout Shift (CLS): <0.1
First Input Delay (FID): <100ms
Image optimization verified:
All images served as WebP with JPEG fallback (automatic via Next.js Image)
Responsive sizing: Correct image dimensions loaded per device (1920x1080 projector, 375x375 mobile)
Lazy loading: Off-screen images not loaded until needed (except game images which are pre-loaded)
Total payload: 20-question game <6MB total image data
Database query optimization:
Indexes confirmed on frequently queried columns:
games.room_code (unique index)
game_players.game_id (foreign key index)
player_answers.game_id (foreign key index)
questions.question_set_id (foreign key index)
N+1 query issues resolved (use joins, batch queries)
Query execution times measured: <100ms for game state fetches
JavaScript bundle size optimization:
Client bundle: <200KB gzipped (measure with next build)
Code splitting: Separate bundles for routes (dashboard vs. gameplay)
Tree shaking: Unused dependencies removed (audit with pnpm why [package])
Dynamic imports: Heavy libraries loaded on-demand (e.g., QR code generator)
Server Component vs. Client Component optimization:
Server Components used for: Dashboard, game setup, results (data fetching, no interactivity)
Client Components used for: Game views (real-time updates, timers, interactions)
Minimize client-side JavaScript where possible
Supabase connection pooling:
Verify Supabase handles pooling automatically (PgBouncer enabled by default)
No custom connection pool needed for MVP scale
CDN caching verified:
Static assets: Cached 1 year (Cache-Control: public, max-age=31536000, immutable)
Images: Cached 30 days (Cache-Control: public, max-age=2592000)
HTML: No caching for dynamic pages (Cache-Control: no-cache)
Load testing with k6 or Artillery:
Test Scenario: 5 simultaneous games with 10 players each (50 concurrent WebSocket connections)
Script simulates:
50 players join games (WebSocket connect)
Host starts game (broadcast game_start)
10 questions cycle (question display, answer submit, reveal, leaderboard)
Game completes (broadcast game_end)
Metrics measured:
Real-time message latency: p95 <500ms ✓
WebSocket connection stability: 0 dropped connections ✓
Database query response time: p95 <100ms ✓
Server Action response time: p95 <200ms ✓
Run test for: 10 minutes continuous gameplay
Performance regression monitoring:
Establish baseline metrics (record current performance scores)
Future deploys compared against baseline (manual check for now, automate Phase 2)
Test: Run Lighthouse on dashboard, verify Performance score >90
Test: Run load test with 50 concurrent players, verify all metrics within targets
Test: Measure bundle size, verify <200KB gzipped for client JavaScript
Test: Audit database queries during game, verify no N+1 issues or slow queries (>100ms)

Story 5.8: Analytics & Monitoring Setup
As a product owner, I want basic analytics to track user behavior and system health, so that I can measure success metrics and identify issues proactively.
Acceptance Criteria
Vercel Analytics enabled:
Enable in Vercel Dashboard (free tier, no additional cost)
Tracks: Page views, Web Vitals (FCP, LCP, FID, CLS), unique visitors
Custom event tracking implemented (Vercel Analytics):
Events defined in lib/analytics/events.ts:
typescript
    - 'user_signup' (method: 'email' | 'google')
     - 'game_created' (question_set_id, question_count)
     - 'game_started' (game_id, player_count)
     - 'game_completed' (game_id, duration_minutes, player_count)
     - 'upgrade_cta_clicked' (source: 'dashboard' | 'game_creation' | 'question_set')
     - 'waitlist_signup' (tier_interest: 'pro' | 'church')
Track function: trackEvent(eventName: string, properties?: object)
Called at appropriate points in user flows
Event tracking integration:
User signup: Track after successful registration (Server Action)
Game created: Track after game inserted in DB
Game started: Track when host clicks "Start Game"
Game completed: Track when game status updates to 'completed'
Upgrade CTA: Track onClick for all upgrade buttons/links
Waitlist signup: Track after email submitted
Dashboard for metrics (Vercel Dashboard):
User Metrics:
Total registered users (query users table)
New signups (daily/weekly/monthly)
User tier distribution (free vs. pro vs. church)
Game Metrics:
Games created (daily/weekly/monthly)
Games started (measure activation)
Games completed (measure success rate: completed / started)
Average player count per game
Popular question sets (most selected)
Engagement Metrics:
Active users (users who created game in last 30 days)
Returning users (created 2+ games)
Average games per user per month
System health monitoring (Supabase Dashboard):
Database Metrics:
Database size (track against 500MB free tier limit)
Query performance (slow queries, >1s execution time)
Connection pool usage
Realtime Metrics:
Concurrent connections (track against 200 connection limit)
Message throughput (messages per second)
Connection errors (failed WebSocket handshakes)
Storage Metrics:
Storage used (track against 1GB free tier limit)
Bandwidth used (track against 2GB egress limit)
Usage alerts (manual for MVP):
Weekly review of Supabase Dashboard metrics
Email notification if approaching limits:
Database >400MB (80% of 500MB)
Storage >800MB (80% of 1GB)
Bandwidth >1.6GB (80% of 2GB)
Error rate tracking:
Vercel logs capture all unhandled errors
Manual review of logs weekly
Track: Error frequency, common error types, affected routes
Post-game survey (optional):
After game completes, show 1-question modal on player view:
"How was your experience?" (1-5 stars)
"Leave feedback (optional)" (text area)
"Submit" button
Stores in game_feedback table:
sql
    CREATE TABLE game_feedback (
       id UUID PRIMARY KEY,
       game_id UUID REFERENCES games(id),
       player_id UUID REFERENCES game_players(id),
       rating INT CHECK (rating BETWEEN 1 AND 5),
       comment TEXT,
       submitted_at TIMESTAMP DEFAULT NOW()
     );
```
   - Analytics: Average rating per game, overall average rating

9. Budget monitoring:
   - Track Supabase usage metrics against free tier limits (weekly check)
   - Track OpenAI costs (already logged in image generation script)
   - Track Vercel usage against free tier limits (automatic in dashboard)

10. Test: Trigger 'user_signup' event, verify logged in Vercel Analytics
11. Test: Complete a game, verify 'game_completed' event tracked with correct properties
12. Test: Review Supabase Dashboard, verify metrics visible and updating
13. Test: Submit post-game feedback, verify saved in DB with correct rating

---

### Story 5.9: Beta Launch & Iteration Readiness

As a **product owner**,
I want **to soft launch with 5 beta churches and gather feedback before public launch**,
so that **we can identify and fix issues with real users in a controlled setting**.

#### Acceptance Criteria

1. Beta invitation list created:
   - 5 target churches/youth groups identified (use personal network, youth ministry connections)
   - Mix of church sizes: 2 small (50-100 members), 2 medium (100-300), 1 large (300+)
   - Mix of denominations: Evangelical, non-denominational, Catholic (if possible)

2. Beta invitation email drafted and sent:
   - Subject: "You're Invited: Exclusive Early Access to Bible Memory Quiz Game"
   - Body:
     - Exclusive early access positioning (VIP treatment)
     - Brief product description (Kahoot for churches with Bible content)
     - What we're asking: 2 weeks of testing, 3-5 games hosted, feedback survey
     - What you get: Free Pro account during beta + church license discount if you convert
     - Direct support: Email + Slack channel (if group is large enough)
     - Call to action: "Click here to join beta program" → link to signup

3. Beta user setup:
   - All beta testers manually upgraded to "Pro" tier in Supabase (set `users.tier='pro'`)
   - Unlimited games, all question sets, unlimited players (bypass all freemium limits)
   - Beta flag added to `users` table: `is_beta_tester BOOLEAN DEFAULT false`

4. Beta feedback survey created (Google Form or Typeform):
   - **Overall Experience:** "Rate your overall experience (1-5 stars)"
   - **What Worked Well:** "What did you enjoy most about the game?" (open text)
   - **What Needs Improvement:** "What frustrated you or didn't work well?" (open text)
   - **Technical Issues:** "Did you encounter any bugs or errors?" (open text)
   - **Likelihood to Use Regularly:** "Would you use this for youth night or small groups?" (1-5 scale)
   - **Pricing Feedback:** "Would your church pay $299/year for unlimited access?" (Yes/No/Maybe + comment)
   - **Feature Requests:** "What features would make this more useful?" (open text)
   - **Testimonial Permission:** "Can we use your feedback as a testimonial?" (Yes/No + quote)

5. Beta testing period: 2 weeks of active use
   - Start date: [Week 7 after MVP development starts]
   - End date: [Week 9]
   - Target: Each beta tester hosts 3-5 games minimum

6. Daily monitoring during beta:
   - **User Activity:** Check Vercel Analytics for signups, games created, games completed
   - **Error Rates:** Review Vercel logs for errors, crashes, failed requests
   - **Support Requests:** Monitor email for bug reports, questions, confusion
   - **Survey Responses:** Check survey daily for new feedback submissions

7. Rapid iteration plan:
   - **Critical Bugs** (broken gameplay, data loss): Fix within 24 hours, deploy immediately
   - **High Priority** (bad UX, confusing UI): Fix within 48 hours, deploy end of week
   - **Medium Priority** (polish, nice-to-haves): Document, schedule for Phase 2
   - **Low Priority** (edge cases, rare issues): Document, backlog

8. Beta success criteria for moving to public launch:
   - ✅ 20+ games completed across all beta users
   - ✅ 90%+ game completion rate (started games that finished without crashes)
   - ✅ 4+ star average rating from feedback survey
   - ✅ <5 critical bugs identified
   - ✅ Positive feedback on core value prop ("This is better than Kahoot for church")

9. Post-beta retrospective:
   - Document lessons learned (`/docs/beta-retrospective.md`)
   - Summarize feedback themes (what worked, what didn't)
   - List required changes before public launch
   - Estimate additional work needed (1 week polish sprint?)

10. Public launch decision gate:
    - **Go:** Success criteria met → Schedule public launch announcement
    - **No-Go:** Major issues identified → Additional iteration sprint (1-2 weeks)

11. If Go: Public launch plan:
    - Waitlist email sent: "We're live! Your exclusive early access link inside."
    - Social media announcement: LinkedIn, Twitter/X, Reddit (r/youthpastors if exists)
    - Youth ministry network outreach: Facebook groups, Slack communities
    - Demo video uploaded: YouTube (3-minute walkthrough, unlisted or public)

12. Test: Send beta invitations, verify delivery and responses
13. Test: Beta tester creates account, verify Pro tier applied and limits bypassed
14. Test: Monitor first beta game session live, verify smooth experience
15. Test: Collect first survey response, verify data captured correctly

---

**Epic 5 Complete!**

This epic delivers a launch-ready product:
- ✅ Complete content library: 100 questions across 5 themed sets, all with AI-generated Biblical imagery
- ✅ Real user authentication: Email/password + Google OAuth
- ✅ Freemium business model: Tier restrictions enforced, upgrade flows in place
- ✅ Production-ready: Error handling, performance optimized, load tested
- ✅ Analytics and monitoring: Key metrics tracked, system health monitored
- ✅ Beta launch process: 5 churches testing, feedback collection, rapid iteration

**MVP is complete and ready for controlled beta launch!**

---

## Checklist Results Report

**Status:** Ready for PM Checklist Execution

The PM Checklist (`pm-checklist.md`) should now be executed to validate:
- Problem definition and context completeness
- MVP scope appropriateness and feasibility
- Requirements clarity, testability, and completeness
- Epic structure and story sequencing logic
- Technical guidance sufficiency for Architecture phase
- Overall PRD readiness for handoff

**To execute checklist:**
```
Run command: execute-checklist with checklist: pm-checklist.md
This section will be populated with validation results after checklist execution.

