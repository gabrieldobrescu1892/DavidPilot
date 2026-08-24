-- Reconcile Lead Cockpit pipeline status with existing proposal lifecycle records.
-- Safe to run more than once.

update public.leads l
set status = 'customer',
    last_activity = coalesce(p.accepted_at, p.updated_at, now())
from public.proposals p
where p.lead_id = l.id
  and p.status = 'accepted'
  and l.status <> 'customer';

update public.leads l
set status = 'proposal_sent',
    last_activity = coalesce(p.changes_requested_at, p.viewed_at, p.shared_at, p.updated_at, now())
from public.proposals p
where p.lead_id = l.id
  and p.status in ('shared','viewed','changes_requested')
  and l.status not in ('customer','closed');
