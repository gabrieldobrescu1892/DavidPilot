-- DavidPilot automated client onboarding
create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','blocked')),
  sort_order integer not null default 0,
  completed_at timestamptz
);
create index if not exists onboarding_tasks_client_idx on public.onboarding_tasks(client_id);
create index if not exists onboarding_tasks_project_idx on public.onboarding_tasks(project_id);
alter table public.onboarding_tasks enable row level security;
drop policy if exists "portal onboarding select" on public.onboarding_tasks;
create policy "portal onboarding select" on public.onboarding_tasks for select to authenticated
using (client_id in (select public.current_user_client_ids()));
