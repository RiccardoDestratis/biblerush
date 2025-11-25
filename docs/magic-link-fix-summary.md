# Magic Link Authentication Fix Summary

## Problem

Magic links were not working correctly:
- **On localhost**: Redirecting to `/error` page
- **On production**: Redirecting to `/?code=...` instead of properly authenticating

## Root Cause

1. **Email template was using `{{ .ConfirmationURL }}`** which uses PKCE flow (client-side)
2. **PKCE flow doesn't work well with SSR** - the `code` parameter needs to be exchanged client-side
3. **For Next.js SSR**, we need to use `token_hash` instead, which can be verified server-side

## Solution Implemented

### 1. Updated Email Template Documentation
- Modified `docs/email-templates.md` to use `token_hash` for magic links
- Changed from: `{{ .ConfirmationURL }}`
- Changed to: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

### 2. Improved Auth Confirmation Route
- Updated `app/auth/confirm/route.ts` to:
  - Prioritize `token_hash` flow (SSR-compatible)
  - Better error handling and logging
  - Still support PKCE flow for backward compatibility

### 3. Added Root Page Handler
- Updated `app/page.tsx` to detect `code` parameter and redirect to `/auth/confirm`
- Provides backward compatibility if old email templates are still in use

## Required Supabase Configuration

### Step 1: Update Email Templates

1. Go to [Supabase Dashboard → Auth → Email Templates](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/templates)
2. **Update Magic Link template:**
   - Copy the template from `docs/email-templates.md`
   - Replace the entire HTML content
   - Make sure the link uses: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
3. **Update Confirm Signup template:**
   - Also use `token_hash` format for consistency
   - See `docs/email-templates.md` for the complete template

### Step 2: Verify Redirect URLs

1. Go to [Supabase Dashboard → Auth → URL Configuration](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/url-configuration)
2. **Site URL** should be set to:
   - Production: `https://www.bible-rush.com` ⚠️ **Currently set to `https://bible-rush.com` - needs update!**
   - This is what `{{ .SiteURL }}` uses in email templates
3. **Redirect URLs** should include:
   - `https://www.bible-rush.com/**` ✅ (already present)
   - `https://bible-rush.com/**` ✅ (already present - for non-www redirects)
   - `https://*.vercel.app/**` ✅ (already present via wildcard patterns)
   - `http://localhost:3000/**` ✅ (already present)
   
   **Note:** Your current redirect URLs look good! Just need to update the Site URL.

### Step 3: Test

1. **Test on localhost:**
   - Request a magic link
   - Click the link in the email
   - Should redirect to `/create` (not `/error`)

2. **Test on production:**
   - Request a magic link
   - Click the link in the email
   - Should redirect to `/create` (not `/?code=...`)

## Technical Details

### Why `token_hash` instead of `code`?

- **`code` (PKCE flow)**: Requires client-side exchange, session stored in URL fragments
- **`token_hash` (SSR flow)**: Can be verified server-side, session stored in cookies

### Flow Comparison

**Old Flow (PKCE):**
1. User clicks link → `https://supabase.co/auth/v1/verify?code=...`
2. Supabase redirects → `https://bible-rush.com/?code=...`
3. Client-side code exchange needed (doesn't work well with SSR)

**New Flow (token_hash):**
1. User clicks link → `https://bible-rush.com/auth/confirm?token_hash=...&type=email`
2. Server verifies token → Creates session in cookies
3. Redirects to `/create` with authenticated session

## Files Changed

- `docs/email-templates.md` - Updated magic link template
- `app/auth/confirm/route.ts` - Improved error handling and flow priority
- `app/page.tsx` - Added backward compatibility for `code` parameter
- `docs/auth-setup.md` - Updated documentation

## Next Steps

1. ✅ Code changes complete
2. ⏳ **Update Supabase email templates** (required)
3. ⏳ **Verify Supabase redirect URLs** (required)
4. ⏳ **Test on localhost and production**

