# Lead Cockpit proposal lifecycle sync fix

This patch makes proposal lifecycle visible in Lead Cockpit and repairs CRM status synchronization.

## What changed
- Accepted proposal => lead status `customer` (shown as Won)
- Shared/viewed/changes-requested proposal => lead status `proposal_sent` unless already Won/Lost
- Latest proposal status appears on every linked lead card
- Lead drawer shows proposal title, lifecycle status, response, and timestamps
- Lead Cockpit refreshes every 15 seconds and on window focus
- Proposal acceptance writes a matching lead activity event and no longer swallows Supabase sync failures
- GET `/api/admin/leads` self-reconciles stale linked proposal states

## Existing accepted proposals
Run `supabase/migrations/20260824_proposal_lead_status_backfill.sql` once to immediately repair old data. The Lead Cockpit API also self-reconciles linked records when loaded.
