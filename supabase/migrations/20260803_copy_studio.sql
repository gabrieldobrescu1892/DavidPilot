create table if not exists public.copy_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null default 'Untitled draft',
  content_type text not null,
  language text not null check (language in ('en','ro')),
  tone text,
  audience text,
  goal text,
  topic text,
  call_to_action text,
  output text not null,
  lead_id uuid references public.leads(id) on delete set null,
  status text not null default 'draft'
);

create index if not exists copy_drafts_created_at_idx on public.copy_drafts(created_at desc);
create index if not exists copy_drafts_lead_id_idx on public.copy_drafts(lead_id);
