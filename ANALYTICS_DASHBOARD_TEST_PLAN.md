# Analytics Dashboard Test Plan

1. Run `supabase/migrations/20260810_analytics_dashboard.sql` once.
2. Deploy the `feature/analytics-dashboard` branch to Vercel Preview.
3. Open several public pages in an incognito window.
4. Open the DavidPilot AI Consultant and send at least one message.
5. Submit a test lead through the AI chat.
6. Open the booking modal.
7. Generate one public AI Copy Studio trial.
8. Open `/admin/analytics` on the Preview URL.
9. Confirm visitors, chat activity, leads, booking opens and Copy Studio activity are populated.
10. Change a lead status in Lead Cockpit and verify a `lead_status_changed` event is written to `analytics_events`.
11. Generate a proposal and verify `proposal_generated` appears in `analytics_events`.
12. Test all four date ranges and mobile layout.
13. Verify `/admin/analytics` returns 401 when signed out.
