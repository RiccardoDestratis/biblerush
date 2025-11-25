# Email Tracking Breaking Magic Links

## Problem

Your magic links are going through email tracking services (like `sendibt2.com`), which rewrite the URLs and break the authentication flow.

## Why This Happens

Email providers or corporate email security services often:
1. Rewrite all links in emails to track clicks
2. Add redirect layers that can break query parameters
3. Modify URLs in ways that lose the `token_hash` or `code` parameters

## Solutions

### Option 1: Disable Email Tracking (Recommended)

If you're using a custom SMTP provider:
1. Go to your email provider settings
2. **Disable link tracking** for authentication emails
3. This is the cleanest solution

**Note:** Supabase's default email service should not have this issue, but if you're using a custom SMTP provider, check their settings.

### Option 2: Use Email OTP Instead

Instead of magic links, use 6-digit OTP codes:
1. Update email template to show `{{ .Token }}` instead of a link
2. User enters the code manually
3. No links = no tracking issues

### Option 3: Verify Email Template Was Updated

**Critical:** Make sure you actually updated the email template in Supabase Dashboard!

1. Go to [Supabase Dashboard → Auth → Email Templates](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/templates)
2. Check the **Magic Link** template
3. Verify it uses: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
4. If it still uses `{{ .ConfirmationURL }}`, that's the problem!

### Option 4: Check What URL Actually Arrives

The tracking URLs you showed suggest the email template might not be updated yet. 

**To verify:**
1. Request a new magic link
2. **Right-click** the link in the email and "Copy link address"
3. Check if the final destination (after all redirects) is:
   - ✅ `https://www.bible-rush.com/auth/confirm?token_hash=...&type=email`
   - ❌ `https://www.bible-rush.com/?code=...` (old format)
   - ❌ `https://supabase.co/auth/v1/verify?...` (default format)

## Debugging Steps

1. **Check server logs** - The `/auth/confirm` route now logs what parameters it receives
2. **Test with a fresh magic link** - Request a new one after updating the template
3. **Check the actual destination** - Right-click the link to see where it goes

## Next Steps

1. ✅ Verify email template is updated in Supabase Dashboard
2. ✅ Request a NEW magic link (old ones won't work)
3. ✅ Check server logs to see what parameters are received
4. ⏳ If tracking persists, disable link tracking in your email provider

