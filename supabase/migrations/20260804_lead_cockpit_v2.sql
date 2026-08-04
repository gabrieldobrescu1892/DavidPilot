-- Lead Cockpit 2.0 migration. Safe to run more than once.
alter table public.leads
  add column if not exists meeting_status text default 'not_booked' check (meeting_status in ('not_booked','booked','completed','cancelled','no_show')),
  add column if not exists meeting_at timestamptz,
  add column if not exists next_follow_up timestamptz,
  add column if not exists owner text,
  add column if not exists lost_reason text,
  add column if not exists activity jsonb default '[]'::jsonb;

create index if not exists leads_meeting_status_idx on public.leads (meeting_status);
create index if not exists leads_next_follow_up_idx on public.leads (next_follow_up);
