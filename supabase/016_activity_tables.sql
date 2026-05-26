-- supabase/016_activity_tables.sql

-- Activity event log
create table if not exists public.group_activity (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_type  text not null check (event_type in ('joined','rank_up','rank_down','correct_streak','prediction_complete')),
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists idx_group_activity_group_created
  on public.group_activity(group_id, created_at desc);

create index if not exists idx_group_activity_user_created
  on public.group_activity(user_id, created_at desc);

-- Last known rank per user per group (for rank-change detection)
create table if not exists public.rank_snapshots (
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rank        integer not null,
  captured_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- RLS: members can read activity for their own groups
alter table public.group_activity enable row level security;
create policy "members can read group activity"
  on public.group_activity for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_activity.group_id
        and gm.user_id = auth.uid()
    )
  );

-- rank_snapshots: no direct user reads (only accessed via SECURITY DEFINER functions)
alter table public.rank_snapshots enable row level security;

-- Trigger: write 'joined' event when a user joins a group
create or replace function public.trg_group_member_joined()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_activity(group_id, user_id, event_type, payload)
  values (new.group_id, new.user_id, 'joined', '{}');
  return new;
end;
$$;

drop trigger if exists on_group_member_joined on public.group_members;
create trigger on_group_member_joined
  after insert on public.group_members
  for each row execute function public.trg_group_member_joined();
