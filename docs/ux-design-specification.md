# quizgame UX Design Specification

_Created on 2025-01-27 by Riccardo_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

Bible Memory Quiz Game is a real-time, competitive quiz platform purpose-built for Christian communities. The experience combines proven Kahoot-style mechanics with Bible-specific curated content and AI-generated Biblical imagery, optimized for two distinct viewing contexts: shared projector displays (creating group excitement) and individual player phones (focused on fast, intuitive answer submission).

The design philosophy prioritizes zero friction over visual sophistication—users should feel the app "just works" within seconds of first use. The projector view emphasizes bold typography, vibrant colors, and dramatic AI imagery to create memorable shared moments, while player phones use large tap targets and minimal UI to eliminate interaction mistakes during fast-paced gameplay.

**Visual Tone:** Modern, vibrant, and celebratory without feeling childish or overly "churchy." Think ESPN leaderboard energy meets Apple product simplicity. The UI should feel contemporary enough for youth while being approachable for all ages (middle school through senior adults).

**Color Philosophy:** Pastel, minty palette that's game-like but not harsh. Light mode optimized for projector readability. Colors should be easily configurable via settings/config (not hardcoded).

**Visual Style:** Game-focused, not SaaS. Buttons and interactive elements should have 3D effects, shadows, gradients, and playful styling that feels like a game interface rather than a business application. Think game UI aesthetics with depth, elevation, and tactile feel.

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Primary Design System:** shadcn/ui
- Modern, customizable, Tailwind-based component library
- Copy-paste components (full control over styling)
- Built on Radix UI primitives (accessibility built-in)
- Unstyled by default (easy theming for pastel/minty palette)
- Perfect for custom branding and projector-optimized light mode

**Animation Library:** Framer Motion
- Free, open-source (MIT license)
- Handles confetti, score animations, leaderboard transitions
- Smooth, performant animations for game elements

**Component Strategy:**
- **shadcn/ui** for base components: buttons, cards, inputs, modals, toasts, badges, forms
- **Custom game components** built on shadcn/ui primitives:
  - Timer component (countdown with circular progress, gradient background, 3D effect)
  - AnswerButton component (large, game-style buttons with gradients, 3D shadows, states)
  - Leaderboard component (ranked lists with podium styling, 3D effects)
  - ScoreDisplay component (animated counters with gradient backgrounds)
  - Answer reveal animations (with gradient overlays)
  - Real-time sync indicators
- **Framer Motion** for all animations: confetti, score count-ups, transitions, reveals
- **Lucide React** for all icons (no emojis) - consistent, professional iconography
- **Gradient backgrounds** throughout for engaging, dynamic visuals

**Rationale:** This combination provides accessible, consistent base components while giving full control over game-specific styling and animations. All styled with Tailwind CSS for easy theming and projector-optimized light mode.

---

## 2. Core User Experience

### 2.1 Defining Experience

**The ONE thing users do most:** Hosts create a game in under 2 minutes; players join via QR code and answer Bible questions in real time.

**What should be effortless:**
- Joining a game (QR scan or room code entry)
- Answer submission (select → lock pattern)
- Real-time synchronization across all devices

**Most critical action:** Player answer submission under time pressure (15 seconds per question)

**Core Experience Pattern:** Two-screen synchronized gameplay
- Projector = Shared spectacle: Large text, dramatic visuals, leaderboard reveals, winner celebrations
- Phone = Personal control center: Answer selection and confirmation, score tracking, minimal distraction

### 2.2 Novel UX Patterns

_To be determined in Step 3_

---

## 3. Visual Foundation

### 3.1 Color System

**Chosen Theme:** Soft Lavender
- Primary: #C5B5E8 (Gentle lavender)
- Secondary: #FFD9B3 (Warm peach)
- Accent: #B8E0D2 (Soft mint)
- Success: #A8D5BA (Mint green)
- Error: #F4A5A5 (Soft coral)
- Neutral: Warm grays (#FAFAF9 to #1C1917)

**Color Philosophy:**
- Pastel, minty palette that's game-like but not harsh
- Light mode optimized for projector readability
- Colors easily configurable via settings/config (not hardcoded)
- Avoid dark mode heavy designs for projector visibility

**Game-Like Visual Treatment:**
- Buttons: 3D effects with gradients, shadows, and depth
- Interactive elements: Elevated, tactile feel with hover/active states
- Cards: Subtle 3D elevation, not flat SaaS-style
- Answer buttons: Large, game-style with depth and visual weight
- Leaderboards: Podium-style 3D effects for top 3
- Overall: Playful, game-focused aesthetic, not corporate SaaS

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Approach

**Selected Direction:** Bold Game (Direction 1) with Playful Depth elements (Direction 2)

**Design Philosophy:**
- Strong 3D effects with bold shadows and high contrast
- Maximum game feel with dramatic depth
- Balanced with approachable, friendly elements from Direction 2
- Gradient backgrounds for engaging, dynamic visuals
- Icon system: Lucide React icons (no emojis)

**Key Design Decisions:**

**Layout Approach:**
- Centered, focused layouts for projector views
- Card-based organization for game setup
- Clear visual hierarchy with bold typography

**Visual Hierarchy:**
- Bold 3D effects on interactive elements
- High visual impact for projector displays
- Balanced spacing (not too dense, not too sparse)

**Interaction Patterns:**
- Large, chunky game-style buttons with dramatic depth
- Hover/active states with clear elevation changes
- Tactile feel on all interactive elements

**Visual Style:**
- **Weight:** Bold 3D with strong shadows and gradients
- **Depth:** Dramatic elevation with multiple shadow layers
- **Backgrounds:** Gradient backgrounds for engaging, dynamic feel
- **Buttons:** Game-style with gradients, shadows, and 3D effects
- **Icons:** Lucide React icons throughout (no emojis)

**Component Styling:**
- Answer buttons: Large, chunky, with gradients and strong 3D shadows
- Game cards: Elevated with gradient backgrounds and depth
- Leaderboards: Podium-style 3D effects for top 3
- Timer: Circular with gradient background and 3D effect
- All buttons: Game-style with gradients, not flat SaaS styling

**Rationale:** 
Combines the high-energy, competitive feel of Bold Game with the approachable, friendly elements of Playful Depth. Gradient backgrounds add visual interest and engagement. Lucide icons provide consistent, professional iconography without emoji dependency. Perfect for creating an exciting game experience that works well on projectors while feeling approachable for all ages.

**Interactive Mockups:**

- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

#### Journey 1: Host Creates and Starts Game

**User Goal:** Create a game room, generate QR code, wait for players, and start gameplay

**Approach:** Wizard/Stepper flow (3 steps)

**Flow Steps:**

**Step 1: Game Setup (Wizard)**
- **Screen:** Create Game Wizard - Step 1
- **User sees:**
  - "Create New Game" heading
  - Room name input field (required, 2-30 characters)
  - Question set selection (grid of cards with thumbnails, descriptions, lock icons for premium sets)
  - Progress indicator: "Step 1 of 2"
  - "Next" button (disabled until room name entered and set selected)
- **User does:** 
  - Enters room name
  - Selects question set (click card)
- **System responds:**
  - Selected card highlights with 3D effect
  - "Next" button enables with animation
  - Real-time validation feedback

**Step 2: Confirmation**
- **Screen:** Create Game Wizard - Step 2
- **User sees:**
  - "Review & Create" heading
  - Summary card showing:
    - Room name (editable)
    - Selected question set (editable)
    - Question count (default: 15, can adjust)
  - "Create Game" button (primary, large, 3D style)
  - "Back" button (secondary)
- **User does:**
  - Reviews details
  - Optionally adjusts question count (10/15/20)
  - Clicks "Create Game"
- **System responds:**
  - Loading state with spinner
  - Game created, room code generated
  - Transitions to waiting room

**Step 3: Waiting Room (Projector View)**
- **Screen:** Waiting Room / QR Code Display
- **User sees:**
  - Large QR code (centered, scannable)
  - Room code in huge text below QR (e.g., "ABC123")
  - "Room Code" label
  - Real-time player list (animated entries as players join)
  - Player count: "5 players joined"
  - "Start Game" button (always enabled, no minimum requirement)
  - "Cancel Game" button (secondary)
- **User does:**
  - Waits for players to join (optional)
  - Clicks "Start Game" when ready (any time)
- **System responds:**
  - Player count updates in real-time
  - New players animate into list
  - "Start Game" button ready immediately
  - On start: Transitions to first question

**Decision Points:**
- Room name validation: 2-30 characters, alphanumeric + spaces
- Question set selection: Free tier shows lock icons on premium sets
- Question count: Default 15, can change in Step 2

**Error States:**
- Invalid room name: Inline error message, "Next" disabled
- Network error: Toast notification, retry option
- Premium set selected (free tier): Upgrade prompt modal

**Success State:**
- Game created successfully
- QR code displayed immediately
- Waiting room active, ready for players
- Real-time player updates

**Next Action:**
- Start game → First question displays
- Cancel game → Return to dashboard

#### Journey 2: Player Joins Game

**User Goal:** Join a game quickly via QR code or room code entry

**Approach:** Direct entry with minimal friction

**Flow Steps:**

**Entry Point 1: QR Code Scan (Primary)**
- **Action:** Player opens phone camera, scans QR code
- **System responds:**
  - Deep link opens game join page
  - Room code auto-filled from QR
  - Direct to name entry screen

**Entry Point 2: Website Visit (Fallback)**
- **Screen:** Join Game page
- **User sees:**
  - "Join Game" heading
  - Room code input field (6 characters, auto-formatted)
  - "Join" button
- **User does:** 
  - Enters room code (or scans QR)
  - Clicks "Join"
- **System responds:**
  - Validates room code
  - If valid: Proceeds to name entry
  - If invalid: Error message "Room code was invalid, please provide the room ID"

**Step 1: Name Entry**
- **Screen:** Enter Your Name
- **User sees:**
  - "What's your name?" heading
  - Name input field (2-30 characters)
  - "Join Game" button
- **User does:**
  - Enters display name
  - Clicks "Join Game"
- **System responds:**
  - Validates name
  - Joins game room
  - Transitions to waiting room

**Step 2: Waiting Room (Player View)**
- **Screen:** Waiting for host to start
- **User sees:**
  - "Waiting for host to start..." message
  - Current player count
  - Player list with their name highlighted
- **User does:** Waits
- **System responds:**
  - Real-time updates as players join
  - When host starts: Transitions to first question

**Error States:**
- Invalid room code: Error message displayed, can retry
- Name too short/long: Inline validation error
- Room full: Message "Room is full" (if limit reached)
- Room not found: "Room code was invalid, please provide the room ID"

**Success State:**
- Successfully joined game
- Name appears in player list
- Waiting for host to start

#### Journey 3: Gameplay Flow (Question → Answer → Reveal → Leaderboard)

**User Goal:** Answer questions, see results, compete on leaderboard

**Approach:** Automatic progression with host control options

**Flow Steps:**

**Question Phase (30 seconds)**
- **Projector View:**
  - Question text (large, bold)
  - 4 answer options (A/B/C/D)
  - Countdown timer (30 seconds, large, animated)
  - Current question number
  - Auto mode indicator icon (if enabled)
  - Host controls: "Skip Question" / "Lock Question" buttons
- **Player View:**
  - Question text
  - 4 large answer buttons (A/B/C/D with option text)
  - Countdown timer
  - "Lock Answer" button (enabled after selection)
- **User does:**
  - Players select answer → Lock answer
  - Host can skip/lock question manually (optional)
- **System responds:**
  - Timer counts down (30 seconds)
  - If timer expires: No answer = no points (player is out for that question)
  - If host skips/locks: Question ends immediately
  - Auto-advances to reveal phase

**Reveal Phase (5 seconds)**
- **Projector View:**
  - AI-generated Biblical image (full background, dimmed)
  - Correct answer overlaid (large text with drop shadow)
  - Scripture reference
  - 5-second display with fade transition
- **Player View:**
  - Correct/incorrect indicator (✓/✗)
  - Points earned display (+15 points)
  - Correct answer shown if wrong
  - AI image preview (small)
- **System responds:**
  - Shows correct answer
  - Calculates scores
  - Transitions to leaderboard

**Leaderboard Phase (10-15 seconds)**
- **Projector View:**
  - Top 10 players with rank/name/score
  - Podium styling for top 3 (gold/silver/bronze)
  - Rank change indicators (↑↓—)
  - Score animations counting up
  - Auto mode countdown (if enabled): "Next question in 10..." (countdown)
  - Host controls: "Next Question" button (if auto mode disabled)
- **Player View:**
  - Personal rank prominently displayed
  - Rank change indicator
  - Top 3 players shown
  - Players above/below you
  - Encouraging message
  - **Note:** Players do NOT see their score after each question (only at end)
- **System responds:**
  - Updates leaderboard in real-time
  - If auto mode enabled: Countdown 10-15 seconds → Auto-advances
  - If auto mode disabled: Waits for host to press "Next Question"

**Auto Mode Control:**
- **Default:** Auto mode ENABLED
- **Indicator:** Small icon on projector view: "Auto mode enabled" / "Auto mode disabled"
- **Host can toggle:** Click icon to enable/disable at any time
- **Behavior:**
  - Enabled: After leaderboard, 10-15 second countdown → Auto-advance to next question
  - Disabled: Host must press "Next Question" button (arrow icon) to advance

**Final Results:**
- **Projector View:**
  - "Game Over!" heading
  - Winner name in huge text with trophy icon
  - Confetti animation (3 seconds)
  - Full rankings (scrollable)
  - Game stats (duration, total questions, accuracy)
  - "Play Again" and "Dashboard" buttons
- **Player View:**
  - Final rank with celebratory message
  - Final score with accuracy (e.g., "12/15 correct - 80%")
  - Average response time
  - Mini confetti if top 3
  - "Play Again" button

**Decision Points:**
- Host skip/lock: Can end question early
- Timer expiry: No answer = no points for that question
- Auto mode: Default enabled, can toggle anytime
- Manual advance: Only if auto mode disabled

**Error States:**
- Connection lost: "Reconnecting..." with spinner, graceful rejoin
- Answer submission failed: Toast notification, retry option

**Success State:**
- Question answered successfully
- Score calculated and displayed
- Leaderboard updated
- Game progresses smoothly

---

## 6. Component Library

### 6.1 Component Strategy

**From shadcn/ui (Base Components):**
- Button (base for game buttons)
- Card (base for question set cards)
- Input (room code, name entry)
- Badge (question count, player count)
- Toast (error messages, notifications)
- Modal (upgrade prompts, confirmations)

**Custom Game Components:**

1. **AnswerButton** — Large, game-style answer buttons
   - **Purpose:** Primary interaction during gameplay
   - **Content:** Answer option letter (A/B/C/D) + text
   - **Actions:** Select answer, show selected state, lock state
   - **States:**
     - Default: Same color for all options (Soft Lavender theme primary #C5B5E8)
     - Selected: Yellow background when clicked/selected
     - Locked: Yellow with checkmark icon, disabled state
     - Hover: Slight elevation increase
   - **Variants:** All same color, large size for mobile (60px+ height)
   - **3D Styling:** Gradients, shadows, depth effects
   - **Behavior:** Click to select (turns yellow), can confirm/lock, or timer auto-submits

2. **Timer** — Circular countdown timer with progress ring
   - **Purpose:** Show time remaining for question
   - **Content:** Countdown number (30, 29, 28...) + circular progress ring
   - **Visual:** Number in center, progress ring animates as time decreases
   - **States:** Normal, warning (last 5 seconds - ring turns red/orange), expired
   - **Variants:** Large for projector (120px), smaller for mobile (80px)
   - **3D Styling:** Gradient background, 3D circular progress ring with depth
   - **Animation:** Progress ring fills from full to empty as timer counts down

3. **Leaderboard** — Ranked player list with podium
   - **Purpose:** Show competition standings
   - **Content:** Rank, name, score, rank change indicators
   - **Actions:** Scroll (if many players), highlight top 3
   - **States:** Default, updating (animations)
   - **Variants:** Full (top 10), compact (top 3), personal view
   - **3D Styling:** Podium effects for top 3, elevated cards
   - **Animation:** Score changes animate with count-up effect (Framer Motion)

4. **ScoreDisplay** — Animated score counter
   - **Purpose:** Show points earned
   - **Content:** Score number with animation
   - **Actions:** Count-up animation
   - **States:** Default, animating, final
   - **Variants:** Large (projector), small (mobile)

5. **QRCodeDisplay** — QR code generator/display
   - **Purpose:** Allow players to join
   - **Content:** QR code image + room code text
   - **Actions:** Generate, display, copy room code
   - **States:** Generating, displayed

6. **AutoModeToggle** — Auto mode control
   - **Purpose:** Enable/disable auto-advance
   - **Content:** Icon (Lucide) + label ("Auto mode enabled/disabled")
   - **Actions:** Toggle on/off
   - **States:** Enabled, disabled
   - **Variants:** Small icon on projector view

**Implementation Notes:**
- All custom components built on shadcn/ui primitives
- Framer Motion for all animations (score count-ups, transitions)
- Lucide React icons throughout (no emojis)
- Gradient backgrounds for engaging visuals
- 3D effects with shadows and depth for game-like feel

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

**Button Hierarchy:**
- **Primary action:** Large, 3D game-style button with gradient (e.g., "Create Game", "Start Game", "Join Game")
- **Secondary action:** Medium, 3D game-style button with lighter gradient (e.g., "Cancel", "Back")
- **Answer buttons:** All same color (theme primary), turn yellow when selected, can confirm/lock
- **Destructive action:** Red/coral gradient with 3D effect (e.g., "Cancel Game", "End Game")

**Feedback Patterns:**
- **Success:** Toast notification (top-right) with green gradient, auto-dismiss 3 seconds
- **Error:** Toast notification (top-right) with red/coral gradient, auto-dismiss 5 seconds, retry option
- **Warning:** Toast notification (top-right) with orange/peach gradient, auto-dismiss 4 seconds
- **Info:** Toast notification (top-right) with blue/mint gradient, auto-dismiss 3 seconds
- **Loading:** Skeleton loaders for content, spinner for actions, progress indicators for long operations
- **Real-time updates:** Smooth animations (Framer Motion) for score changes, player joins, leaderboard updates

**Form Patterns:**
- **Label position:** Above input fields (clear, readable)
- **Required field indicator:** Asterisk (*) + "required" text for clarity
- **Validation timing:** Real-time validation on blur (after user leaves field)
- **Error display:** Inline error message below field, red text, clear message
- **Help text:** Tooltip on hover (for complex fields), caption text below (for simple guidance)
- **Input styling:** 3D effect with border, gradient background on focus, game-like appearance

**Modal Patterns:**
- **Size variants:** 
  - Small: Confirmation dialogs (400px max-width)
  - Medium: Upgrade prompts, settings (600px max-width)
  - Large: Full-screen on mobile, centered on desktop
- **Dismiss behavior:** Click outside to close (except critical actions), Escape key, X button
- **Focus management:** Auto-focus on primary action button
- **Stacking:** Only one modal at a time (no nested modals in MVP)

**Navigation Patterns:**
- **Active state indication:** Bold text + underline + background highlight
- **Breadcrumb usage:** Not needed (simple flows, wizard shows progress)
- **Back button behavior:** Browser back works, wizard has "Back" button
- **Deep linking:** Supported for game rooms (shareable URLs)

**Empty State Patterns:**
- **First use:** Dashboard shows "Create your first game" with large CTA button
- **No results:** "No games yet" message with "Create Game" button
- **No players:** Waiting room shows "Waiting for players..." with QR code

**Confirmation Patterns:**
- **Delete/Cancel Game:** Confirmation modal required (destructive action)
- **Leave unsaved:** Not applicable (no unsaved state in MVP)
- **Irreversible actions:** Always show confirmation modal

**Notification Patterns:**
- **Placement:** Top-right corner (toast notifications)
- **Duration:** Auto-dismiss based on type (3-5 seconds)
- **Stacking:** Multiple toasts stack vertically, newest on top
- **Priority levels:** 
  - Critical: Error messages (red, longer duration)
  - Important: Success confirmations (green, medium duration)
  - Info: General updates (blue, short duration)

**Search Patterns:**
- **Not applicable for MVP:** No search functionality in initial release

**Date/Time Patterns:**
- **Format:** Relative time for recent games ("2 hours ago"), absolute for older ("Nov 19, 2025")
- **Timezone handling:** User's local timezone
- **Pickers:** Not needed in MVP (no date selection)

**Game-Specific Patterns:**
- **Answer selection:** Click to select (turns yellow), optional confirm/lock, timer auto-submits
- **Score display:** Animated count-up on leaderboard updates (Framer Motion)
- **Timer display:** Circular progress ring with number, color changes in warning state
- **Auto mode:** Toggle icon on projector view, clear visual indicator of state
- **Real-time sync:** Smooth animations for all state changes, no jarring updates

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

**Breakpoint Strategy:**
- **Mobile:** < 768px (single column layout, large tap targets 60px+)
- **Tablet:** 768px - 1024px (simplified desktop layout, touch-optimized)
- **Desktop:** > 1024px (full projector view, multi-column layouts)

**Adaptation Patterns:**
- **Navigation:** Not needed (linear flows, wizard shows progress)
- **Answer buttons:** 2x2 grid on desktop/tablet, single column on mobile
- **Timer:** Scales proportionally (120px desktop → 80px tablet → 60px mobile)
- **Leaderboard:** Scrollable list on mobile, grid/podium on desktop
- **Cards:** Grid to single column on mobile
- **Modals:** Full-screen on mobile, centered on desktop

**Device Optimization:**
- **Projector:** 1920x1080 or 1280x720 (16:9 aspect ratio), large text (48px+)
- **Player phones:** 375px - 430px viewports, touch-optimized (60px+ tap targets)
- **Host laptop:** Minimum 1280px width for dashboard, 1920px ideal for projector view

### 8.2 Accessibility Strategy

**WCAG Compliance Target:** Level AA (recommended standard)

**Key Requirements:**
- **Color contrast:** 4.5:1 for normal text, 3:1 for large text and UI components
- **Keyboard navigation:** Supported for host dashboard (not required for gameplay due to time constraints)
- **Focus indicators:** Visible 2px outline in primary color on all interactive elements
- **ARIA labels:** Meaningful labels for screen readers (buttons, inputs, status updates)
- **Alt text:** Descriptive text for AI-generated images (Biblical scene descriptions)
- **Form labels:** Proper label associations for all inputs
- **Error identification:** Clear, descriptive error messages
- **Touch target size:** Minimum 60px for mobile (answer buttons)

**Testing Strategy:**
- **Automated:** Lighthouse accessibility audit, axe DevTools
- **Manual:** Keyboard-only navigation testing (host dashboard)
- **Screen reader:** Basic testing with VoiceOver/NVDA
- **Color contrast:** Automated checking with tools

**Considerations for All Ages:**
- **Font sizes:** Minimum 16px on mobile, 18px for body text, 48px+ on projector
- **No flashing animations:** Smooth motion only (confetti particles are smooth)
- **Clear language:** Simple, direct language ("Lock Answer" not "Submit Response")
- **Error recovery:** Plain English instructions ("Try refreshing" not technical jargon)

**Known Limitations (Acceptable for MVP):**
- No full keyboard-only gameplay (phone requires touch for time-constrained interactions)
- Screen reader support is basic, not optimized for visually impaired users (casual church events typically not primary use case)
- No closed captions (no audio/video in MVP)

---

## 9. Implementation Guidance

### 9.1 Completion Summary

**What We Created Together:**

- **Design System:** shadcn/ui with Framer Motion animations and Lucide React icons
- **Visual Foundation:** Soft Lavender color theme with pastel, minty palette optimized for projector readability
- **Design Direction:** Bold Game (Direction 1) with Playful Depth elements - game-focused 3D styling with gradients
- **User Journeys:** 3 critical flows designed (Host creation, Player joining, Gameplay loop)
- **UX Patterns:** 10+ consistency rules established for cohesive game experience
- **Responsive Strategy:** 3 breakpoints with adaptation patterns for all device sizes
- **Accessibility:** WCAG Level AA compliance requirements defined

**Core Deliverables:**
- ✅ UX Design Specification: `docs/ux-design-specification.md`
- ✅ Interactive Color Themes: `docs/ux-color-themes.html`
- ✅ Design Direction Mockups: `docs/ux-design-directions.html`

**Key Design Decisions:**
- **Color Theme:** Soft Lavender (pastel, minty, projector-optimized)
- **Visual Style:** Game-focused 3D effects, not SaaS - gradients, shadows, depth
- **Answer Buttons:** Same color, turn yellow when selected
- **Timer:** Circular progress ring with countdown number
- **Leaderboard:** Animated score count-ups, podium styling for top 3
- **Auto Mode:** Default enabled, toggleable, 10-15 second countdown between questions
- **Icons:** Lucide React only (no emojis)

**What Happens Next:**
- Designers can create high-fidelity mockups from this foundation
- Developers can implement with clear UX guidance and rationale
- All design decisions are documented with reasoning for future reference

**Next Required Workflow:**
- **create-architecture** (architect agent) - Define system architecture with UX context

---

## Appendix

### Related Documents

- Product Requirements: `.bmad/docs/prd.md`
- Product Brief: `.bmad/docs/projectbried.md`

### Core Interactive Deliverables

This UX Design Specification was created through visual collaboration:

- **Color Theme Visualizer**: [ux-color-themes.html](./ux-color-themes.html)
  - Interactive HTML showing all color theme options explored
  - Live UI component examples in each theme
  - Side-by-side comparison and semantic color usage

- **Design Direction Mockups**: [ux-design-directions.html](./ux-design-directions.html)
  - Interactive HTML with 6-8 complete design approaches
  - Full-screen mockups of key screens
  - Design philosophy and rationale for each direction

### Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Wireframe Generation Workflow** - Create detailed wireframes from user flows
- **Figma Design Workflow** - Generate Figma files via MCP integration
- **Interactive Prototype Workflow** - Build clickable HTML prototypes
- **Component Showcase Workflow** - Create interactive component library
- **AI Frontend Prompt Workflow** - Generate prompts for v0, Lovable, Bolt, etc.
- **Solution Architecture Workflow** - Define technical architecture with UX context

### Version History

| Date       | Version | Changes                         | Author    |
| ---------- | ------- | ------------------------------- | --------- |
| 2025-01-27 | 1.0     | Initial UX Design Specification | Riccardo  |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._

