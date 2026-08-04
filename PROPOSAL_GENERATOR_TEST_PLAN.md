# Test plan

1. Run `supabase/migrations/20260804_proposal_generator.sql`.
2. Add `OPENAI_PROPOSAL_MODEL=gpt-5-mini` in Vercel Preview.
3. Open the Preview `/admin/proposals` page.
4. Select a qualified lead and generate a proposal.
5. Confirm `POST /api/admin/proposals` returns 200.
6. Confirm the proposal appears in Supabase `proposals`.
7. Edit content, save, refresh and confirm persistence.
8. Use Export PDF and verify the print layout.
9. Test English and Romanian proposals.
