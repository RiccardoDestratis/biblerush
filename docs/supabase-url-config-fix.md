# Supabase URL Configuration Fix

## Issue Identified

Your Supabase configuration has a mismatch:
- **Site URL**: `https://bible-rush.com` (no www)
- **Production domain**: `https://www.bible-rush.com` (with www)

This causes magic links to use the wrong domain in email templates.

## Required Changes

### 1. Update Site URL

**Current:** `https://bible-rush.com`  
**Should be:** `https://www.bible-rush.com`

**Steps:**
1. Go to [Supabase Dashboard → Auth → URL Configuration](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/url-configuration)
2. Change **Site URL** from `https://bible-rush.com` to `https://www.bible-rush.com`
3. Click **Save changes**

**Why?** The `{{ .SiteURL }}` variable in email templates uses this value. Since your production domain uses `www`, the Site URL should match.

### 2. Verify Redirect URLs (Already Correct ✅)

Your current redirect URLs are good:
- ✅ `https://bible-rush.com/**` (non-www version)
- ✅ `https://bible-rush.com` (non-www exact)
- ✅ `https://www.bible-rush.com/**` (www version with wildcard)
- ✅ `http://localhost:3000/**` (local development)
- ✅ Vercel preview URLs (for deployments)

**No changes needed here** - you have both www and non-www covered.

## After Making Changes

1. **Update Email Templates** (if not done already):
   - Go to [Auth → Email Templates](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/templates)
   - Update Magic Link template to use: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
   - See `docs/email-templates.md` for complete template

2. **Test:**
   - Request a magic link
   - Check the email - link should be: `https://www.bible-rush.com/auth/confirm?token_hash=...`
   - Click link - should redirect to `/create` successfully

## Summary

- ✅ Redirect URLs: Already correct
- ⚠️ Site URL: Needs update from `https://bible-rush.com` → `https://www.bible-rush.com`
- ⏳ Email Templates: Update to use `token_hash` format (see `docs/email-templates.md`)

