# Admin Dashboard with NanoBanana Integration - Analysis & Recommendations

## Executive Summary

**Status:** ✅ Story 5.9 updated to use NanoBanana  
**Effort:** Moderate (2-3 weeks)  
**Priority:** High (critical for content management)  
**Action Completed:** ✅ Updated Story 5.9 and Story 4.2 in epics.md to use NanoBanana instead of DALL-E

---

## Current State

### Existing Story: 5.9 - Admin Dashboard for Question Management

The admin dashboard story **already exists** in Epic 5, but it currently references **DALL-E 3** instead of NanoBanana. The story includes:

- ✅ Question Set Management (view, create, edit, delete)
- ✅ Question Management (CRUD operations)
- ✅ Image Management (generate/regenerate)
- ✅ CSV Bulk Upload
- ✅ Tier management (`tier_required` field already exists)

### Database Schema Status

✅ **Already in place:**
- `question_sets.tier_required` (free, pro, church)
- `questions.image_location` (URL to Supabase Storage)
- `questions.image_prompt` (text prompt for AI)
- `questions.image_style` (style specification)
- `questions.is_custom_image` (boolean: uploaded vs AI-generated)
- `users.is_admin` (boolean for admin access)

### What's Missing

- ❌ Admin routes (`/admin/*`)
- ❌ Admin dashboard UI
- ❌ NanoBanana API integration
- ❌ Image generation/upload logic
- ❌ Admin authentication middleware

---

## NanoBanana API Research

### Setup Requirements

1. **API Key Registration**
   - Sign up at [nanobananaapi.ai](https://nanobananaapi.ai/)
   - Obtain API key
   - Store in environment variables: `NANOBANANA_API_KEY`

2. **API Integration Pattern**
   - Endpoint: Typically REST API (needs verification)
   - Authentication: API key in headers
   - Request: POST with prompt/styling parameters
   - Response: Image URL or base64 encoded image

3. **Recommended Implementation**
   - Create API route: `/app/api/admin/generate-image/route.ts`
   - Server-side only (protect API key)
   - Error handling and retry logic
   - Image optimization before upload to Supabase

### API Request Example (Expected Format)

```typescript
// Expected format (to be verified with actual API docs)
const response = await fetch('https://api.nanobananaapi.ai/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.NANOBANANA_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Biblical scene showing...',
    style: 'photorealistic, warm lighting...',
    width: 1920,
    height: 1080,
  }),
});
```

**⚠️ Action Needed:** Verify actual NanoBanana API endpoint and request format from their documentation.

---

## Implementation Plan

### Phase 1: Admin Authentication & Routes (Week 1)

**Tasks:**
1. Create admin middleware to check `is_admin` flag
2. Create admin layout component (`/app/admin/layout.tsx`)
3. Set up protected routes (`/app/admin/*`)
4. Create admin navigation/sidebar

**Files to Create:**
- `app/admin/layout.tsx` - Admin layout with auth check
- `lib/middleware/admin.ts` - Admin auth utility
- `lib/actions/admin.ts` - Admin server actions

### Phase 2: Question Set Management UI (Week 1-2)

**Tasks:**
1. Create question set list view (`/app/admin/question-sets/page.tsx`)
2. Create question set form (create/edit)
3. Implement tier locking UI (free/pro/church dropdown)
4. Add publish/unpublish toggle

**Components:**
- `components/admin/question-set-list.tsx`
- `components/admin/question-set-form.tsx`
- `components/admin/tier-selector.tsx`

### Phase 3: Question Management UI (Week 2)

**Tasks:**
1. Create question list table with filters
2. Create question form (create/edit)
3. Integrate with existing question schema
4. Add bulk operations

**Components:**
- `components/admin/question-table.tsx`
- `components/admin/question-form.tsx`
- Use shadcn/ui DataTable component

### Phase 4: NanoBanana Integration (Week 2-3)

**Tasks:**
1. Research and verify NanoBanana API format
2. Create image generation API route
3. Integrate with Supabase Storage
4. Create image preview/generation UI
5. Handle image optimization

**Files to Create:**
- `app/api/admin/generate-image/route.ts`
- `lib/utils/image-generation.ts`
- `lib/utils/image-optimization.ts`
- `components/admin/image-generator.tsx`

**Supabase Storage Setup:**
- Create bucket: `question-images` (public)
- Set up upload policies
- Configure CORS if needed

### Phase 5: Image Management UI (Week 3)

**Tasks:**
1. Create image upload component
2. Create image preview/generation modal
3. Add prompt editing interface
4. Implement regenerate functionality

**Components:**
- `components/admin/image-upload.tsx`
- `components/admin/image-prompt-editor.tsx`
- `components/admin/image-preview.tsx`

---

## Required Modifications to Story 5.9

### Changes Needed:

1. **Replace DALL-E references with NanoBanana:**
   - Update Story 4.2 dependency to "NanoBanana Image Generation"
   - Change all "DALL-E 3" mentions to "NanoBanana"
   - Update prompt examples if API format differs

2. **Add Tier Management Explicitly:**
   - Add UI for setting `tier_required` on question sets
   - Show tier badges in question set list
   - Filter by tier in admin dashboard

3. **Enhance Image Generation:**
   - Add prompt editing interface (already mentioned, but emphasize)
   - Add style editing interface
   - Add batch generation for question sets

---

## Effort Estimation

### Development Time: 2-3 Weeks

**Breakdown:**
- Admin Authentication & Routes: 2-3 days
- Question Set Management UI: 3-4 days
- Question Management UI: 4-5 days
- NanoBanana Integration: 3-4 days
- Image Management UI: 2-3 days
- Testing & Polish: 2-3 days

**Complexity Factors:**
- ✅ Database schema already supports everything needed
- ✅ shadcn/ui components available for tables/forms
- ⚠️ NanoBanana API documentation needs verification
- ⚠️ Image optimization and upload pipeline
- ⚠️ Admin authentication middleware

---

## Story Agent Recommendation

**No new story needed!** This is already **Story 5.9: Admin Dashboard for Question Management**.

**Action Items:**
1. ✅ Review and approve this analysis
2. ✅ Verify NanoBanana API documentation
3. ✅ Update Story 5.9 to replace DALL-E with NanoBanana
4. ✅ Prioritize Story 5.9 for next sprint
5. ✅ Begin implementation following phases above

---

## Technical Dependencies

### Prerequisites (Already Met):
- ✅ Story 5.2: Authentication (users table with `is_admin`)
- ✅ Database schema with image fields
- ✅ Supabase Storage available

### New Dependencies:
- ⚠️ NanoBanana API account and key
- ⚠️ API documentation verification
- ⚠️ Environment variable setup

### Packages to Install:
```bash
pnpm add papaparse  # For CSV upload (mentioned in story)
# Image optimization libraries (to be determined)
```

---

## Next Steps

1. **Immediate:**
   - [ ] Sign up for NanoBanana API account
   - [ ] Verify API documentation and request format
   - [ ] Add `NANOBANANA_API_KEY` to environment variables

2. **Planning:**
   - [ ] Review Story 5.9 in epics.md
   - [ ] Update story to replace DALL-E with NanoBanana
   - [ ] Create detailed task breakdown

3. **Implementation:**
   - [ ] Start with Phase 1 (Admin Auth)
   - [ ] Iterate through phases sequentially
   - [ ] Test thoroughly after each phase

---

## Questions to Resolve

1. **NanoBanana API:**
   - [ ] What is the exact API endpoint?
   - [ ] What is the request/response format?
   - [ ] Are there rate limits?
   - [ ] What image formats/sizes are supported?

2. **Image Storage:**
   - [ ] Supabase Storage bucket configuration
   - [ ] Image optimization requirements
   - [ ] CDN delivery setup

3. **Tier Management:**
   - [ ] Confirm tier values: `free`, `pro`, `church`?
   - [ ] Should tier be editable after question set creation?

---

## Conclusion

This feature is **already planned** in your project (Story 5.9), but needs:
- Update from DALL-E to NanoBanana
- Implementation of the admin dashboard UI
- NanoBanana API integration

The database schema is ready, and the effort is **moderate** (2-3 weeks). No new story is needed—just update the existing one and implement it.

**Recommendation:** Prioritize this for the next sprint after verifying NanoBanana API setup.

