create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  session_id text,
  lead_id uuid references public.leads(id) on delete set null,
  language text,
  source text,
  page text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_event_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_session_id_idx on public.analytics_events(session_id);
create index if not exists analytics_events_lead_id_idx on public.analytics_events(lead_id);
