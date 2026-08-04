# TypeScript lead insert fix

The Lead Cockpit 2.0 schema added required CRM fields to `StoredLead`, but the lead creation route still submitted the older insert shape. This caused `TS2345` during the Vercel build.

The route now initializes:

- `meeting_status` as `not_booked`
- `meeting_at` as `null`
- `next_follow_up` as `null`
- `owner` as `null`
- `lost_reason` as `null`
- `activity` with the initial lead-created event

The shared `LeadStatus` type also now includes `proposal_sent`.
