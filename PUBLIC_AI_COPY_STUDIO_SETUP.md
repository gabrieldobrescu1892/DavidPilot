# Public AI Copy Studio

The homepage now contains a bilingual AI Copy Studio showcase and one-free-generation lead funnel.

## Flow

1. Visitor opens the homepage section.
2. Visitor clicks Try one free generation.
3. Visitor provides a brief and contact details.
4. `/api/leads` stores and analyzes the lead in Supabase.
5. `/api/copy-trial` generates the copy.
6. The visitor can copy the result or book a strategy session.

## Environment variables

Required:

- `OPENAI_API_KEY`
- `OPENAI_COPY_MODEL` (recommended: `gpt-5-mini`)
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

No additional database migration is required beyond the existing Lead Intelligence migration.

## Preview test

- Test both EN and RO modes.
- Confirm `POST /api/leads` returns 200.
- Confirm `POST /api/copy-trial` returns 200.
- Confirm the lead appears in Supabase and Lead Cockpit.
- Confirm the booking button opens the correct Cal.com event.
