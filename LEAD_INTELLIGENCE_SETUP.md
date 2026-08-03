# DavidPilot Lead Intelligence setup

## 1. Use the feature branch

Commit this repository to `feature/lead-intelligence`, not directly to `main`.

## 2. Run the Supabase migration

Open Supabase → SQL Editor and run:

`supabase/migrations/20260803_lead_intelligence.sql`

This adds AI intelligence fields without deleting existing lead data.

## 3. Environment variables

The feature reuses:

- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL` (recommended: `gpt-5-mini`)
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

No new environment variable is required.

## 4. Test on Preview

1. Push to `feature/lead-intelligence`.
2. Open the Vercel Preview deployment.
3. Create a new lead through the AI Consultant.
4. Verify the row has `industry`, `recommended_service`, `ai_summary`, and value fields.
5. Open `/admin` and verify the new Lead Cockpit cards and detail drawer.

Existing leads will display with blank intelligence fields until new leads are captured or re-analyzed later.
