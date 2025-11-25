# Brevo Link Tracking Issue - Workarounds

## The Problem

**Brevo does NOT allow disabling link tracking for SMTP transactional emails** through the dashboard. This is a known limitation that many users have requested, but it's not available.

## Solutions

### Option 1: Contact Brevo Support (Recommended First Step)

Brevo support can sometimes disable link tracking for trusted clients on a case-by-case basis:

1. Go to [Brevo Support](https://help.brevo.com/hc/en-us/requests/new)
2. Request: "Please disable link tracking for transactional emails sent via SMTP for my account"
3. Explain: "Link tracking is breaking authentication magic links in my application"
4. Mention: "This is a security-sensitive use case (authentication emails)"

**Note:** They may or may not be able to do this, but it's worth trying.

### Option 2: Use Supabase's Default Email Service for Auth (Easiest)

Use Supabase's built-in email service for authentication emails, and keep Brevo for other transactional emails:

1. Go to [Supabase Dashboard → Auth → Email Settings](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/providers)
2. **Disable custom SMTP** for authentication emails
3. Use Supabase's default email service (no link tracking issues)
4. Keep Brevo configured for other transactional emails if needed

**Pros:**
- ✅ No link tracking issues
- ✅ Works immediately
- ✅ No code changes needed

**Cons:**
- ❌ Can't customize email branding as much
- ❌ Uses Supabase's email service (may have rate limits)

### Option 3: Switch to a Different SMTP Provider

Use an SMTP provider that allows disabling link tracking:

**Recommended providers:**
- **Mailgun** - Allows disabling click tracking
- **SendGrid** - Can disable link tracking per email
- **Amazon SES** - No link tracking by default
- **Postmark** - No link tracking, great for transactional emails

**Steps:**
1. Set up new SMTP provider
2. Configure in Supabase Dashboard → Auth → Email Settings
3. Update SMTP credentials

### Option 4: Use Brevo API (May Not Work)

Try using Brevo's API instead of SMTP, but note that even the API may not support disabling link tracking:

1. Check [Brevo API Documentation](https://developers.brevo.com/)
2. Look for tracking parameters in the API
3. This may require code changes to send emails via API instead of SMTP

**Note:** This may not solve the problem if the API also tracks links.

## Recommended Approach

**For immediate fix:** Use Option 2 (Supabase default email service) - it's the fastest solution.

**For long-term:** Try Option 1 (contact Brevo support) while using Option 2 as a temporary solution.

## Testing After Fix

1. Request a new magic link
2. Check the email - link should NOT go through `sendibt2.com`
3. Link should go directly to: `https://www.bible-rush.com/auth/confirm?token_hash=...`
4. Click it - should work correctly

