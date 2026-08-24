alter table public.proposals
  add column if not exists shared_at timestamptz,
  add column if not exists viewed_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists declined_at timestamptz,
  add column if not exists changes_requested_at timestamptz,
  add column if not exists client_response text,
  add column if not exists response_by uuid references auth.users(id) on delete set null;

create index if not exists proposals_status_idx on public.proposals(status);
create index if not exists proposals_shared_at_idx on public.proposals(shared_at desc);
