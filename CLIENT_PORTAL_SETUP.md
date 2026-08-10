# Setup

Add one Vercel variable for Client Portal V1: `SUPABASE_PUBLISHABLE_KEY=sb_publishable_...` (Sensitive OFF). The portal also uses the existing `SUPABASE_URL` and server-only `SUPABASE_SECRET_KEY`. The publishable key is used for user authentication and RLS-scoped requests; the secret key remains server-only for admin operations.

Run `supabase/migrations/20260810_client_portal.sql` in Supabase SQL Editor before opening the portal.

Client accounts are created from `/admin/clients`. The generated client signs in at `/portal/login`.

The Supabase Secret Key must remain Sensitive in Vercel and must never be exposed with a `NEXT_PUBLIC_` prefix.
