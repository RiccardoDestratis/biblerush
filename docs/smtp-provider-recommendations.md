# SMTP Provider Recommendations for Supabase Auth

## Supabase Default Email Service Limitations

Supabase's default email service has these limitations:
- ✅ **Free** (included in Pro plan)
- ❌ **Only sends to team members** (not production users)
- ❌ **Rate limited** (~30 emails/hour, can change)
- ❌ **No SLA guarantee**
- ❌ **No custom domain** (uses Supabase's domain)
- ❌ **Not for production use**

**Verdict:** Not suitable for production, even with Pro plan.

## Best Solution: Switch to a Better SMTP Provider

Since Brevo doesn't allow disabling link tracking, switch to a provider that:
1. ✅ Allows disabling link tracking
2. ✅ Supports custom domain
3. ✅ Works with Supabase
4. ✅ Good deliverability

## Recommended Providers

### Option 1: Resend (Best for Supabase) ⭐

**Why:** Built specifically for developers, great Supabase integration

- ✅ **Free tier:** 3,000 emails/month
- ✅ **Can disable link tracking**
- ✅ **Custom domain support**
- ✅ **Great deliverability**
- ✅ **Easy Supabase setup**

**Setup:**
1. Sign up at [Resend](https://resend.com)
2. Verify your domain (add DNS records)
3. Get SMTP credentials
4. Configure in Supabase Dashboard → Auth → SMTP Settings

**Cost:** Free for 3,000/month, then $20/month for 50,000

### Option 2: Mailgun

- ✅ **Free tier:** 5,000 emails/month (first 3 months)
- ✅ **Can disable click tracking**
- ✅ **Custom domain support**
- ✅ **Good deliverability**

**Cost:** Free for 3 months, then $35/month for 50,000

### Option 3: Postmark

- ✅ **No link tracking by default**
- ✅ **Custom domain support**
- ✅ **Excellent deliverability**
- ❌ **No free tier** ($15/month for 10,000 emails)

**Best for:** Production apps that need reliability

### Option 4: Amazon SES

- ✅ **Very cheap** ($0.10 per 1,000 emails)
- ✅ **No link tracking**
- ✅ **Custom domain support**
- ❌ **More complex setup**

**Best for:** High volume, cost-sensitive apps

## Quick Setup: Resend (Recommended)

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up (free)
3. Verify your email

### Step 2: Add Your Domain
1. Go to **Domains** → **Add Domain**
2. Enter: `bible-rush.com` (or subdomain like `auth.bible-rush.com`)
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for verification (~5-10 minutes)

### Step 3: Get SMTP Credentials
1. Go to **API Keys** → **SMTP**
2. Copy:
   - SMTP Host: `smtp.resend.com`
   - SMTP Port: `465` (SSL) or `587` (TLS)
   - SMTP User: `resend`
   - SMTP Password: (your API key)

### Step 4: Configure in Supabase
1. Go to [Supabase Dashboard → Auth → SMTP Settings](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/providers)
2. Enable **Custom SMTP**
3. Enter:
   - **Sender Email:** `no-reply@bible-rush.com` (or your verified domain)
   - **Sender Name:** `BibleRush`
   - **SMTP Host:** `smtp.resend.com`
   - **SMTP Port:** `587`
   - **SMTP User:** `resend`
   - **SMTP Password:** (your Resend API key)
4. Save

### Step 5: Disable Link Tracking (Important!)
1. In Resend dashboard, go to **Settings**
2. Find **Link Tracking** or **Click Tracking**
3. **Disable it** for transactional emails
4. Or use Resend API with `tracking: { clicks: false }`

## Cost Comparison

| Provider | Free Tier | Paid (50k emails) | Link Tracking Control |
|----------|-----------|-------------------|----------------------|
| **Resend** | 3,000/month | $20/month | ✅ Yes |
| **Mailgun** | 5,000/month (3mo) | $35/month | ✅ Yes |
| **Postmark** | None | $15/month (10k) | ✅ Yes (disabled by default) |
| **Amazon SES** | None | ~$5/month | ✅ Yes |
| **Brevo** | 300/day | Varies | ❌ **No** (can't disable) |

## Recommendation

**Use Resend:**
- ✅ Free tier covers most use cases
- ✅ Easy Supabase integration
- ✅ Can disable link tracking
- ✅ Custom domain support
- ✅ Great documentation

**Migration Steps:**
1. Set up Resend account
2. Verify your domain
3. Configure in Supabase
4. Test with a magic link
5. Remove Brevo SMTP config

## After Switching

1. ✅ Magic links will work (no tracking issues)
2. ✅ Emails from your custom domain
3. ✅ Better deliverability
4. ✅ More control over email settings

