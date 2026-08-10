# Cal.com Sync Setup

## 1. Database
Run `supabase/migrations/20260810_calcom_sync.sql` in Supabase SQL Editor.

## 2. Vercel
Add `CALCOM_WEBHOOK_SECRET` to Preview and Production and mark it Sensitive. Use a long random value (32+ bytes recommended), then redeploy.

## 3. Cal.com webhook
Create a webhook in Cal.com and use the public production URL:

`https://davidpilot.com/api/webhooks/calcom`

Use the exact same secret as `CALCOM_WEBHOOK_SECRET`.

Subscribe to:
- BOOKING_CREATED
- BOOKING_RESCHEDULED
- BOOKING_CANCELLED
- MEETING_ENDED
- BOOKING_NO_SHOW_UPDATED

Keep the default webhook payload. Do not add a custom payload template; DavidPilot expects the normal Cal.com booking payload.

## 4. Matching rules
DavidPilot matches the first attendee email from Cal.com against:
1. lead email in `leads`;
2. `clients.primary_contact_email`;
3. client member email in `client_users`.

A matched lead is updated automatically. A matched client gets a synchronized row in `client_meetings`.

## 5. Security
The endpoint validates `x-cal-signature-256` using HMAC-SHA256 and the configured webhook secret. Unsigned or invalid webhook requests return 401.
