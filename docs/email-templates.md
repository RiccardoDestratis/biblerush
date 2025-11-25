# Email Templates for Supabase

Copy these templates into your Supabase Dashboard → Auth → Email Templates

## Magic Link Template

**Subject:** Your Magic Link

**HTML Content:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Magic Link</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #7C3AED 0%, #FF6B6B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #7C3AED;">
                BibleRush
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1a1a1a;">
                Magic Link
              </h2>
              <p style="margin: 0 0 24px; font-size: 16px; color: #666666;">
                Click the button below to log in to your BibleRush account. This link will expire in 1 hour.
              </p>
              
              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #7C3AED 0%, #9D4EDD 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      Log In
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 14px; color: #999999; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #7C3AED; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                This email was sent to {{ .Email }}. If you didn't request this, you can safely ignore it.
              </p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #999999; text-align: center;">
                © BibleRush - Interactive Bible quiz games for your community
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Confirm Signup Template

**Subject:** Confirm Your Signup

**HTML Content:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Signup</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #7C3AED 0%, #FF6B6B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #7C3AED;">
                BibleRush
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1a1a1a;">
                Welcome to BibleRush!
              </h2>
              <p style="margin: 0 0 16px; font-size: 16px; color: #666666;">
                Thanks for signing up! We're excited to have you join our community of Bible quiz enthusiasts.
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #666666;">
                Please confirm your email address by clicking the button below. This link will expire in 24 hours.
              </p>
              
              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #7C3AED 0%, #9D4EDD 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      Confirm Your Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 14px; color: #999999; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #7C3AED; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          
          <!-- Features Section -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1a1a1a;">
                      What you can do with BibleRush:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666666;">
                      <li style="margin-bottom: 8px;">Create interactive Bible quiz games for your community</li>
                      <li style="margin-bottom: 8px;">Real-time leaderboards and scoring</li>
                      <li style="margin-bottom: 8px;">No app required - works on any device</li>
                      <li style="margin-bottom: 0;">Completely free to get started</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                This email was sent to {{ .Email }}. If you didn't create an account, you can safely ignore this email.
              </p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #999999; text-align: center;">
                © BibleRush - Interactive Bible quiz games for your community
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Reset Password Template

**Subject:** Reset Your Password

**HTML Content:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #7C3AED 0%, #FF6B6B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #7C3AED;">
                BibleRush
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #1a1a1a;">
                Reset Your Password
              </h2>
              <p style="margin: 0 0 16px; font-size: 16px; color: #666666;">
                We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #666666;">
                Click the button below to reset your password. This link will expire in 1 hour.
              </p>
              
              <!-- Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #7C3AED 0%, #9D4EDD 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 14px; color: #999999; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #7C3AED; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                This email was sent to {{ .Email }}. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #999999; text-align: center;">
                © BibleRush - Interactive Bible quiz games for your community
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## How to Use

1. Go to [Supabase Dashboard → Auth → Email Templates](https://supabase.com/dashboard/project/epswejbixjdhoezxczzu/auth/templates)
2. Select the template you want to update:
   - **Magic Link** - Use the Magic Link template above
   - **Confirm signup** - Use the Confirm Signup template above
   - **Reset Password** - Use the Reset Password template above
3. Copy the HTML content from above
4. Paste it into the template editor
5. Save the changes

## Design Notes

- **Colors:** Matches your landing page with Deep Purple (#7C3AED) and Coral Orange (#FF6B6B)
- **Typography:** Uses system fonts for best email client compatibility
- **Responsive:** Works on mobile and desktop email clients
- **Accessibility:** Proper table structure for email clients
- **No Images:** Pure HTML/CSS as requested

