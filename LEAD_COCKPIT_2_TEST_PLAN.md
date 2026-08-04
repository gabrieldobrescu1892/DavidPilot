# Lead Cockpit 2.0 test plan

1. Run `supabase/migrations/20260804_lead_cockpit_v2.sql`.
2. Deploy the feature branch to Vercel Preview.
3. Open `/admin`, open a lead, and test all four tabs.
4. Change status, meeting state, dates, owner, and notes; refresh and verify persistence.
5. Confirm timeline entries appear.
6. Test search, status filters, priority filters, and mobile layout.
