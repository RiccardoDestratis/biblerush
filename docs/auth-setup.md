# Authentication Setup - Following Supabase Best Practices

This authentication implementation follows the **official Supabase Next.js tutorial** exactly, with no workarounds.

## What Was Implemented

### 1. Supabase Clients
- **`lib/supabase/client.ts`** - Simple browser client (no extra config)
- **`lib/supabase/server.ts`** - Server client with cookie support
- **`lib/supabase/middleware.ts`** - Middleware for session refresh

### 2. Middleware
- **`middleware.ts`** - Refreshes auth tokens on every request
- Required for SSR to keep sessions in sync

### 3. Login Page
- **`app/login/page.tsx`** - Simple form with email/password
- **`app/login/actions.ts`** - Server actions for login and signup

### 4. Auth Confirmation
- **`app/auth/confirm/route.ts`** - Handles email confirmation using `token_hash`
- This is the **official way** for email/password signup (not `code`)

### 5. Sign Out
- **`app/auth/signout/route.ts`** - Server-side sign out handler

## Required Supabase Configuration

### Email Template Update

**Why change the template?** The default `{{ .ConfirmationURL }}` works for client-side flows, but for SSR (Server-Side Rendering) with Next.js, you need to customize it because:

- The default `{{ .ConfirmationURL }}` redirects to Supabase's endpoint, then to your app with the session in URL fragments (hash)
- URL fragments (`#access_token=...`) can't be read server-side
- For SSR, you need the session in the response body, not fragments

**Solution:** Update the email templates in Supabase Dashboard:

1. Go to: [Supabase Dashboard → Auth → Email Templates](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/templates)
2. Update the **"Magic Link"** template:
   - Change `{{ .ConfirmationURL }}` to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
   - See `docs/email-templates.md` for the complete template
3. Update the **"Confirm signup"** template:
   - Change `{{ .ConfirmationURL }}` to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
   - See `docs/email-templates.md` for the complete template

This redirects directly to your server endpoint (`/auth/confirm`), which can verify the token server-side and create a session in cookies (accessible server-side).

### Site URL Configuration

1. Go to: [Supabase Dashboard → Auth → URL Configuration](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/url-configuration)
2. Set **Site URL** to: `https://bible-rush.com` (or your production domain)
3. Add **Redirect URLs**:
   - `https://bible-rush.com/**`
   - `https://*.vercel.app/**` (for preview deployments)
   - `http://localhost:3000/**` (for local development)

## How It Works

1. **Signup**: User enters email/password → Server action calls `supabase.auth.signUp()` → Email sent
2. **Email Click**: User clicks link → Goes to `/auth/confirm?token_hash=...&type=email`
3. **Confirmation**: Route handler calls `supabase.auth.verifyOtp()` with `token_hash` → Session created → Redirect to `/create`

## Key Differences from Previous Attempts

- ✅ Uses `token_hash` (official pattern) instead of `code` (PKCE flow)
- ✅ Simple client setup (no extra config)
- ✅ Follows official Supabase Next.js tutorial exactly
- ✅ No workarounds or custom code exchange logic

## Testing

1. Go to `/login`
2. Enter email and password
3. Click "Sign up"
4. Check email for confirmation link
5. Click link → Should redirect to `/create` and be logged in

