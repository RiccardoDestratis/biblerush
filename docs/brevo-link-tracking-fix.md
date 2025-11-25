# Fix: Brevo Link Tracking Breaking Magic Links

## Problem

Brevo (formerly Sendinblue) **enables link tracking by default**, which rewrites all links in emails. This breaks Supabase magic links because:

1. Brevo wraps your links with tracking URLs (like `sendibt2.com`)
2. The tracking redirect can lose or modify query parameters (`token_hash`, `type`)
3. Your `/auth/confirm` endpoint receives broken or missing parameters

## ⚠️ Important: Brevo Limitation

**Brevo does NOT provide a setting to disable link tracking for SMTP transactional emails** in the dashboard. This is a known limitation.

**See `docs/brevo-link-tracking-workaround.md` for actual solutions.**

## Verify the Fix

After disabling link tracking:

1. **Request a new magic link** (old ones won't work)
2. **Right-click the link** in the email and "Copy link address"
3. The link should be:
   - ✅ `https://www.bible-rush.com/auth/confirm?token_hash=...&type=email`
   - ❌ NOT `https://sendibt2.com/...` (tracking URL)

## Alternative: Use Supabase's Default Email Service

If you can't disable tracking in Brevo, you can:
1. Use Supabase's default email service for authentication emails
2. Keep Brevo for other transactional emails
3. Configure this in Supabase Dashboard → Auth → Email Settings

## Important Notes

- **Link tracking must be disabled** for authentication emails to work
- You'll need to request **new magic links** after disabling tracking
- Old magic links that went through tracking won't work
- This is a common issue with email providers that track links (Brevo, Mailchimp, etc.)

## Testing

After disabling tracking:
1. Request a new magic link
2. Check the email - link should go directly to your site
3. Click it - should redirect to `/create` successfully
4. Check server logs - should see `token_hash` parameter received

