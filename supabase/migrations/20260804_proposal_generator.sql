create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  language text not null default 'en',
  status text not null default 'draft',
  currency text not null default 'EUR',
  investment_min integer,
  investment_max integer,
  timeline text,
  valid_until date,
  content jsonb not null default '{}'::jsonb
);
create index if not exists proposals_lead_id_idx on public.proposals(lead_id);
create index if not exists proposals_created_at_idx on public.proposals(created_at desc);
