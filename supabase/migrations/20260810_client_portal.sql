-- DavidPilot Client Portal V1
-- Safe additive migration. Run once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  primary_contact_name text,
  primary_contact_email text,
  status text not null default 'active' check (status in ('active','onboarding','paused','closed')),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.client_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'client_member' check (role in ('client_admin','client_member')),
  unique(client_id,user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'planning' check (status in ('planning','active','blocked','completed','cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  starts_at date,
  target_date date
);

create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','blocked')),
  due_at timestamptz,
  sort_order integer not null default 0
);

create table if not exists public.client_meetings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  meeting_url text,
  notes text
);

create table if not exists public.client_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  category text,
  url text,
  description text
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  subject text not null,
  message text not null,
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  admin_response text
);

create table if not exists public.client_activity (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  type text not null,
  label text not null,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.proposals add column if not exists client_id uuid references public.clients(id) on delete set null;

create index if not exists client_users_user_idx on public.client_users(user_id);
create index if not exists client_users_client_idx on public.client_users(client_id);
create index if not exists projects_client_idx on public.projects(client_id);
create index if not exists milestones_client_idx on public.project_milestones(client_id);
create index if not exists milestones_project_idx on public.project_milestones(project_id);
create index if not exists meetings_client_idx on public.client_meetings(client_id);
create index if not exists documents_client_idx on public.client_documents(client_id);
create index if not exists support_client_idx on public.support_requests(client_id);
create index if not exists activity_client_idx on public.client_activity(client_id);
create index if not exists proposals_client_idx on public.proposals(client_id);

create or replace function public.current_user_client_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id from public.client_users where user_id = auth.uid();
$$;
revoke all on function public.current_user_client_ids() from public;
grant execute on function public.current_user_client_ids() to authenticated;

alter table public.clients enable row level security;
alter table public.client_users enable row level security;
alter table public.projects enable row level security;
alter table public.project_milestones enable row level security;
alter table public.client_meetings enable row level security;
alter table public.client_documents enable row level security;
alter table public.support_requests enable row level security;
alter table public.client_activity enable row level security;
alter table public.proposals enable row level security;

drop policy if exists "portal clients select" on public.clients;
create policy "portal clients select" on public.clients for select to authenticated using (id in (select public.current_user_client_ids()));

drop policy if exists "portal membership select" on public.client_users;
create policy "portal membership select" on public.client_users for select to authenticated using (user_id = auth.uid());

drop policy if exists "portal projects select" on public.projects;
create policy "portal projects select" on public.projects for select to authenticated using (client_id in (select public.current_user_client_ids()));

drop policy if exists "portal milestones select" on public.project_milestones;
create policy "portal milestones select" on public.project_milestones for select to authenticated using (client_id in (select public.current_user_client_ids()));

drop policy if exists "portal meetings select" on public.client_meetings;
create policy "portal meetings select" on public.client_meetings for select to authenticated using (client_id in (select public.current_user_client_ids()));

drop policy if exists "portal documents select" on public.client_documents;
create policy "portal documents select" on public.client_documents for select to authenticated using (client_id in (select public.current_user_client_ids()));

drop policy if exists "portal proposals select" on public.proposals;
create policy "portal proposals select" on public.proposals for select to authenticated using (client_id in (select public.current_user_client_ids()));

drop policy if exists "portal support select" on public.support_requests;
create policy "portal support select" on public.support_requests for select to authenticated using (client_id in (select public.current_user_client_ids()));
drop policy if exists "portal support insert" on public.support_requests;
create policy "portal support insert" on public.support_requests for insert to authenticated with check (client_id in (select public.current_user_client_ids()) and created_by = auth.uid());

drop policy if exists "portal activity select" on public.client_activity;
create policy "portal activity select" on public.client_activity for select to authenticated using (client_id in (select public.current_user_client_ids()));
