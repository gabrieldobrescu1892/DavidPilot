# Cal.com Sync Test Plan

1. Run the migration and redeploy with `CALCOM_WEBHOOK_SECRET`.
2. Configure the Cal.com webhook with the same secret.
3. Book a strategy session using an email that already exists as a DavidPilot lead.
4. Confirm Vercel logs show `POST /api/webhooks/calcom` with 200.
5. Confirm the lead becomes `demo_booked`, `meeting_status=booked`, and `meeting_at` is populated.
6. Confirm Analytics receives a `meeting_booked` event.
7. If the same email belongs to a client, confirm the meeting appears automatically in Client Portal → Meetings.
8. Reschedule the booking and confirm the date changes automatically.
9. Cancel it and confirm both Lead Cockpit and Client Portal show cancelled status.
10. Test a second client/lead email to confirm matching is isolated to the correct account.
11. Send/replay the exact same webhook payload and confirm the endpoint returns `{ duplicate: true }` without creating another meeting.
