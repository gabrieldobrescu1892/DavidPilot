# DavidPilot Client Password Management

Adds:
- Forgot password link on `/portal/login`
- Recovery request page `/portal/forgot-password`
- Recovery destination `/portal/reset-password`
- Authenticated Account tab with current-password verification
- Admin `Send password reset` action on each client workspace

## Supabase configuration
In Supabase Dashboard > Authentication > URL Configuration:

Site URL:
`https://www.davidpilot.com`

Add Redirect URLs:
- `https://www.davidpilot.com/portal/reset-password`
- For Vercel Preview testing, add your exact preview reset URL or an appropriate Vercel preview wildcard supported by your Supabase redirect policy.

The recovery request intentionally returns a generic success message so the UI does not reveal whether an email is registered.

No database migration is required. Passwords remain entirely in Supabase Auth.
