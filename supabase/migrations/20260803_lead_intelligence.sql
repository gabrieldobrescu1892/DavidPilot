-- Run once in Supabase SQL Editor before deploying the lead-intelligence branch.
alter table public.leads
  add column if not exists industry text,
  add column if not exists company_size text,
  add column if not exists urgency text check (urgency in ('low','medium','high')),
  add column if not exists buying_intent text check (buying_intent in ('low','medium','high')),
  add column if not exists ai_maturity text check (ai_maturity in ('early','developing','advanced')),
  add column if not exists estimated_value_min integer,
  add column if not exists estimated_value_max integer,
  add column if not exists recommended_service text,
  add column if not exists ai_summary text,
  add column if not exists next_action text,
  add column if not exists last_activity timestamptz default now();

create index if not exists leads_lead_score_idx on public.leads (lead_score desc);
create index if not exists leads_industry_idx on public.leads (industry);
create index if not exists leads_status_idx on public.leads (status);
