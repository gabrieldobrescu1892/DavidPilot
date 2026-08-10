# Cal.com Sync Release Notes

- Added signed Cal.com webhook endpoint at `/api/webhooks/calcom`.
- Synchronizes booking creation, rescheduling, cancellation, meeting completion and no-show status.
- Updates Lead Cockpit meeting state and CRM activity.
- Creates/updates Client Portal meetings by attendee email.
- Adds Cal.com events to first-party Analytics.
- Adds webhook event deduplication.
- Verifies Cal.com HMAC signatures before processing events.
