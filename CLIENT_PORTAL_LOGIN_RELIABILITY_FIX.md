# Client Portal login reliability fix

This patch prevents the Client Portal login from remaining indefinitely on **Signing in…**.

Changes:
- Browser login request aborts after 15 seconds.
- Supabase auth/network calls use a 12-second server timeout.
- Login always exits the loading state on failures.
- Successful login uses a hard navigation to `/portal`, ensuring the newly-set HTTP-only session cookie is included in the next request.
- Vercel now returns a clear 504 for an authentication timeout rather than leaving the request pending.

No database migration or new environment variables are required.
