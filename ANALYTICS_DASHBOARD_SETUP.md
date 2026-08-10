# Setup

No new Vercel environment variable is required.

The dashboard uses the existing server-side variables:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `ADMIN_SESSION_SECRET`

Run the Supabase migration before opening the dashboard:

`supabase/migrations/20260810_analytics_dashboard.sql`

The migration only adds a new `analytics_events` table and indexes. It does not alter existing lead, proposal or copy-draft data.
