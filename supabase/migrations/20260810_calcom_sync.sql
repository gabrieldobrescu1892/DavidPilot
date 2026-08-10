-- DavidPilot Cal.com Sync
-- Additive migration. Safe to run more than once.

alter table public.leads add column if not exists cal_booking_uid text;
alter table public.leads add column if not exists cal_event_type text;
alter table public.leads add column if not exists cal_synced_at timestamptz;
create index if not exists leads_cal_booking_uid_idx on public.leads(cal_booking_uid);

alter table public.client_meetings add column if not exists cal_booking_uid text;
alter table public.client_meetings add column if not exists cal_event_type text;
alter table public.client_meetings add column if not exists attendee_email text;
alter table public.client_meetings add column if not exists rescheduled_from_uid text;
alter table public.client_meetings add column if not exists cancellation_reason text;
alter table public.client_meetings add column if not exists cal_metadata jsonb not null default '{}'::jsonb;
alter table public.client_meetings add column if not exists cal_synced_at timestamptz;

-- Allow Cal.com no-show state in the portal meeting model.
alter table public.client_meetings drop constraint if exists client_meetings_status_check;
alter table public.client_meetings
  add constraint client_meetings_status_check
  check (status in ('scheduled','completed','cancelled','no_show'));

create unique index if not exists client_meetings_cal_booking_uid_unique
  on public.client_meetings(cal_booking_uid);

create table if not exists public.calcom_webhook_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_key text not null unique,
  trigger_event text not null,
  booking_uid text,
  payload jsonb not null default '{}'::jsonb
);
create index if not exists calcom_webhook_events_booking_uid_idx on public.calcom_webhook_events(booking_uid);
create index if not exists calcom_webhook_events_trigger_idx on public.calcom_webhook_events(trigger_event);
