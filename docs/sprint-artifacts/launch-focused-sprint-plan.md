# Launch-Focused Sprint Plan
**Date:** 2025-01-27  
**Goal:** Prepare Bible Memory Quiz Game for public launch  
**Timeline:** Focus on launch-critical features only

---

## Sprint Goal

**"Launch a working quiz game with authentication, pricing, and landing page - ready for users to sign up and play."**

---

## Launch Readiness Criteria

### ✅ Must Have (Launch Blockers)
1. **User Authentication** - Hosts can sign up and log in
2. **Landing Page** - Clear value proposition and pricing
3. **Pricing Model** - Free tier (10 players) + Daily Pass (25€) + Subscription
4. **Tier Enforcement** - Limits enforced server-side
5. **Basic Dashboard** - Users can see their games
6. **Full Testing** - End-to-end testing of complete flow
7. **Error Handling** - Production-ready error handling
8. **Performance** - Lighthouse targets met

### 🔄 Can Defer Post-Launch
- Complete remaining question sets (launch with existing sets)
- Admin dashboard (use Supabase dashboard initially)
- Enhanced dashboard features (basic version sufficient)
- Beta launch preparation (minimal for MVP)

---

## Prioritized Story Backlog

### **Sprint 0: Critical Bug Fixes** (Immediate - Before Launch)

#### Story: Fix Scoring Calculation System
**Priority:** P0 - CRITICAL BLOCKER  
**Status:** Bug Fix - Needs Investigation

**Problem:**
- Scoring calculation is not working properly
- Points are not being calculated or displayed
- Speed bonuses (early speed boost) are missing
- Score collection is not functioning

**Acceptance Criteria:**
- ✅ `processQuestionScores` is called correctly when timer expires
- ✅ Points are calculated correctly:
  - Correct answer: 10 base points + speed bonus
  - Incorrect answer: 0 points
  - Speed bonus tiers:
    - 0-3000ms (0-3 seconds): +5 points → Total 15
    - 3001-5000ms (3-5 seconds): +3 points → Total 13
    - 5001-15000ms (5-15 seconds): +0 points → Total 10
- ✅ Points are saved to `player_answers.points_earned` in database
- ✅ Total scores are updated in `game_players.total_score`
- ✅ Points are displayed correctly in UI:
  - Player answer feedback shows points earned
  - Leaderboard shows correct total scores
  - Personal leaderboard shows points earned per question
- ✅ All scenarios tested:
  - Correct answer with fast response (0-3s)
  - Correct answer with medium response (3-5s)
  - Correct answer with slow response (5-15s)
  - Incorrect answers
  - No answer submitted (timer expires)

**Investigation Steps:**
1. Check if `processQuestionScores` is being called when timer expires
2. Verify scoring calculation logic in `lib/game/scoring.ts`
3. Check database updates (are `points_earned` and `total_score` being saved?)
4. Verify UI display (are points showing in components?)
5. Test with real game flow end-to-end

**Dependencies:** None (blocks everything else)  
**Estimated Effort:** 1-2 days (investigation + fix + testing)

---

### **Sprint 1: Authentication & Security** (Week 1)

#### Story 5.2: User Authentication with Supabase Auth
**Priority:** P0 - Critical  
**Status:** Backlog → Ready for Dev

**Acceptance Criteria:**
- Signup/login pages at `/login` and `/signup`
- Email/password authentication
- Google OAuth (optional but recommended)
- Protected routes: `/dashboard`, `/create` require auth
- Players can join games without auth (optional accounts)
- Session management via Supabase Auth

**Dependencies:** None  
**Estimated Effort:** 2-3 days

---

#### Story 5.2.5: Row Level Security (RLS) Policies
**Priority:** P0 - Critical  
**Status:** Backlog → Ready for Dev

**Acceptance Criteria:**
- RLS enabled on all tables
- Users can only access their own data
- Hosts can manage their own games
- Players can submit answers but not modify
- Anonymous users can join games
- Service role can perform admin operations

**Dependencies:** Story 5.2  
**Estimated Effort:** 1-2 days

---

#### Story 5.2.1: Conditional Navigation Based on Auth
**Priority:** P1 - High  
**Status:** Backlog → Ready for Dev

**Acceptance Criteria:**
- Header shows different links based on auth status
- Unauthenticated: Home, Join Game, Login/Signup
- Authenticated hosts: Home, Create Game, Dashboard, Logout
- Authenticated players: Home, Join Game, My Games, Logout
- Protected links redirect to login if not authenticated

**Dependencies:** Story 5.2  
**Estimated Effort:** 1 day

---

### **Sprint 2: Landing Page & Pricing** (Week 1-2)

#### Story: Landing Page with Product Explanation
**Priority:** P0 - Critical  
**Status:** New Story - Needs Creation

**Acceptance Criteria:**
- Landing page at `/` (home route)
- Clear value proposition: "Interactive Bible Quiz Games for Churches"
- Key features highlighted:
  - Real-time multiplayer
  - Mobile-friendly (players use phones)
  - Projector display (host view)
  - Bible-based questions
- Call-to-action: "Get Started" → Signup
- Pricing preview: "Free for up to 10 players, 25€ daily pass, or subscribe"
- Link to `/pricing` for full details

**Dependencies:** None  
**Estimated Effort:** 2-3 days

---

#### Story 5.5: Upgrade Flow & Pricing Page
**Priority:** P0 - Critical  
**Status:** Backlog → Ready for Dev

**Acceptance Criteria:**
- Pricing page at `/pricing`
- Three tiers displayed:
  - **Free:** Up to 10 players, 3 question sets, 5 games/month
  - **Daily Pass:** 25€ one-time, unlimited players for 24 hours
  - **Subscription:** Monthly/annual pricing (TBD)
- Clear feature comparison
- "Upgrade" buttons for each tier
- Payment integration (Stripe recommended)
- After payment: User tier updated in database

**Dependencies:** Story 5.2 (authentication)  
**Estimated Effort:** 3-4 days

---

#### Story 5.3: Freemium Tier Restrictions & Enforcement
**Priority:** P0 - Critical  
**Status:** Backlog → Ready for Dev

**Acceptance Criteria:**
- Free tier limits enforced:
  - Max 10 players per game (updated from original 20)
  - 3 of 5 question sets available
  - 5 games per month (rolling 30-day window)
- Usage tracking table: `user_usage`
- Server-side validation (cannot bypass)
- UI indicators:
  - Lock icons on restricted question sets
  - "Upgrade" prompts when limits reached
  - Usage stats in dashboard
- Daily pass: 25€ for 24-hour unlimited access
- Subscription: Full access while active

**Dependencies:** Story 5.2, Story 5.5  
**Estimated Effort:** 2-3 days

---

### **Sprint 3: Dashboard & Testing** (Week 2)

#### Story 5.4: User Dashboard Enhancement (Basic Version)
**Priority:** P1 - High  
**Status:** Backlog → Ready for Dev

**Acceptance Criteria:**
- Dashboard at `/dashboard` (protected route)
- Shows:
  - Tier display (Free/Pro/Daily Pass)
  - Usage stats: "3 of 5 games used this month"
  - Past games list (date, question set, players, status)
  - "Create New Game" button (prominent CTA)
- Empty state: "No games yet. Create your first game!"
- Basic version sufficient (enhancements can come post-launch)

**Dependencies:** Story 5.2, Story 5.3  
**Estimated Effort:** 2 days

---

#### Story 5.6: Production Error Handling & Monitoring
**Priority:** P0 - Critical  
**Status:** Backlog → Ready for Dev

**Acceptance Criteria:**
- Error boundaries for React components
- Server Action error handling with user-friendly messages
- Network error handling (reconnection prompts)
- Real-time connection error handling
- Error logging (Vercel Analytics or similar)
- User-facing error messages (no technical jargon)
- Graceful degradation when services unavailable

**Dependencies:** None  
**Estimated Effort:** 2 days

---

#### Story 5.7: Performance Optimization & Lighthouse Targets
**Priority:** P0 - Critical  
**Status:** Backlog → Ready for Dev

**Acceptance Criteria:**
- Lighthouse Performance score >90
- First Contentful Paint <1.8s
- Time to Interactive <3.8s
- Image optimization (Next.js Image component)
- Code splitting (automatic via App Router)
- Bundle size optimization
- Database query optimization
- Real-time subscription optimization

**Dependencies:** None  
**Estimated Effort:** 2-3 days

---

### **Sprint 4: Full Testing & Launch Prep** (Week 2-3)

#### Story: Full End-to-End Testing
**Priority:** P0 - Critical  
**Status:** New Story - Needs Creation

**Acceptance Criteria:**
- Complete user flow tested:
  1. Signup → Create Game → Join Game → Play → Results
  2. Free tier limit enforcement
  3. Upgrade flow (daily pass purchase)
  4. Dashboard functionality
  5. Error scenarios (network failures, etc.)
- E2E tests updated for authentication
- Manual testing checklist completed
- Cross-browser testing (Chrome, Safari, Firefox)
- Mobile testing (iOS Safari, Chrome Android)
- Performance testing (Lighthouse)
- Load testing (optional but recommended)

**Dependencies:** All previous stories  
**Estimated Effort:** 2-3 days

---

## Updated Pricing Model

Based on your requirements:

### Free Tier
- **Players:** Up to 10 players per game (updated from 20)
- **Question Sets:** 3 of 5 sets available
- **Games:** 5 games per month (rolling 30-day window)
- **Price:** Free

### Daily Pass
- **Players:** Unlimited players for 24 hours
- **Question Sets:** All 5 sets
- **Games:** Unlimited games for 24 hours
- **Price:** 25€ one-time payment
- **Duration:** 24 hours from purchase

### Subscription (TBD)
- **Players:** Unlimited
- **Question Sets:** All 5 sets
- **Games:** Unlimited
- **Price:** Monthly/annual pricing to be determined
- **Duration:** While subscription active

---

## Story Dependencies

```
Story 5.2 (Auth)
  ├── Story 5.2.5 (RLS)
  ├── Story 5.2.1 (Navigation)
  └── Story 5.3 (Tier Enforcement)
       └── Story 5.4 (Dashboard)

Story 5.5 (Pricing)
  └── Story 5.3 (Tier Enforcement)

Landing Page
  └── (No dependencies)

Story 5.6 (Error Handling)
  └── (No dependencies)

Story 5.7 (Performance)
  └── (No dependencies)

Full Testing
  └── (All stories must be complete)
```

---

## Launch Checklist

### Pre-Launch
- [ ] Authentication working (signup, login, protected routes)
- [ ] Landing page live with clear value proposition
- [ ] Pricing page with payment integration
- [ ] Free tier limits enforced
- [ ] Daily pass purchase working
- [ ] Basic dashboard functional
- [ ] Error handling in place
- [ ] Performance targets met
- [ ] Full E2E testing passed
- [ ] Cross-browser testing completed
- [ ] Mobile testing completed

### Launch Day
- [ ] Production deployment verified
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Monitoring set up
- [ ] Support channel ready (email/contact form)
- [ ] Documentation updated

### Post-Launch
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Track usage metrics
- [ ] Plan enhancements based on feedback

---

## Risk Mitigation

### High-Risk Items
1. **Payment Integration** - Use proven solution (Stripe) and test thoroughly
2. **Tier Enforcement** - Must be server-side (security critical)
3. **Real-time Sync** - Already validated, but test with authentication

### Mitigation Strategies
- Test payment flow in staging before production
- Code review for tier enforcement logic
- Load testing with authentication enabled
- Gradual rollout (soft launch with limited users)

---

## Success Metrics

### Launch Success Criteria
- ✅ Users can sign up and create accounts
- ✅ Free tier users can create games (up to 10 players)
- ✅ Daily pass purchase works end-to-end
- ✅ Landing page converts visitors to signups
- ✅ No critical bugs in production
- ✅ Performance targets met
- ✅ Error handling prevents user frustration

### Post-Launch Metrics (Week 1)
- Signup conversion rate
- Daily pass purchases
- Game creation rate
- Error rate
- Performance metrics (Lighthouse scores)

---

## Next Steps

1. **Create new stories:**
   - Landing Page story
   - Full E2E Testing story

2. **Update sprint-status.yaml:**
   - Mark Epic 1-3 as complete
   - Add retrospective status
   - Update Epic 5 stories with launch priorities

3. **Begin Sprint 1:**
   - Start with Story 5.2 (Authentication)
   - Follow dependency chain

---

**Sprint Owner:** Scrum Master  
**Last Updated:** 2025-01-27

