-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.matches enable row level security;
alter table public.group_stage_predictions enable row level security;
alter table public.group_advancement_predictions enable row level security;
alter table public.knockout_predictions enable row level security;
alter table public.match_results enable row level security;
alter table public.group_advancement_results enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.prediction_scores enable row level security;
alter table public.leaderboard_global enable row level security;
alter table public.leaderboard_group enable row level security;
alter table public.admin_whitelist enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.admin_whitelist
    where email = auth.jwt() ->> 'email'
  )
$$;

-- users: anyone can read, only own row to insert/update
create policy "users_select" on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (id = auth.uid());
create policy "users_update" on public.users for update using (id = auth.uid());

-- matches: public read
create policy "matches_select" on public.matches for select using (true);
create policy "matches_admin_write" on public.matches for all using (public.is_admin());

-- group_stage_predictions: own rows only
create policy "gsp_select" on public.group_stage_predictions for select using (user_id = auth.uid());
create policy "gsp_insert" on public.group_stage_predictions for insert with check (user_id = auth.uid());
create policy "gsp_update" on public.group_stage_predictions for update using (user_id = auth.uid());

-- group_advancement_predictions: own rows only
create policy "gap_select" on public.group_advancement_predictions for select using (user_id = auth.uid());
create policy "gap_insert" on public.group_advancement_predictions for insert with check (user_id = auth.uid());
create policy "gap_update" on public.group_advancement_predictions for update using (user_id = auth.uid());

-- knockout_predictions: own rows only
create policy "kp_select" on public.knockout_predictions for select using (user_id = auth.uid());
create policy "kp_insert" on public.knockout_predictions for insert with check (user_id = auth.uid());
create policy "kp_update" on public.knockout_predictions for update using (user_id = auth.uid());

-- match_results: public read, admin write
create policy "mr_select" on public.match_results for select using (true);
create policy "mr_admin_write" on public.match_results for all using (public.is_admin());

-- group_advancement_results: public read, admin write
create policy "gar_select" on public.group_advancement_results for select using (true);
create policy "gar_admin_write" on public.group_advancement_results for all using (public.is_admin());

-- groups: members can read their groups
create policy "groups_select" on public.groups for select using (
  created_by = auth.uid() or
  exists (select 1 from public.group_members where group_id = id and user_id = auth.uid())
);
create policy "groups_insert" on public.groups for insert with check (created_by = auth.uid());
create policy "groups_update" on public.groups for update using (created_by = auth.uid());

-- group_members: members can read, anyone authed can insert own membership
create policy "gm_select" on public.group_members for select using (
  exists (select 1 from public.group_members gm2 where gm2.group_id = group_id and gm2.user_id = auth.uid())
);
create policy "gm_insert" on public.group_members for insert with check (user_id = auth.uid());

-- prediction_scores: own rows
create policy "ps_select" on public.prediction_scores for select using (user_id = auth.uid());

-- leaderboard_global: public read
create policy "lb_global_select" on public.leaderboard_global for select using (true);

-- leaderboard_group: members only
create policy "lb_group_select" on public.leaderboard_group for select using (
  exists (select 1 from public.group_members where group_id = leaderboard_group.group_id and user_id = auth.uid())
);

-- admin_whitelist: admin read only (no user access)
create policy "aw_admin" on public.admin_whitelist for select using (public.is_admin());
