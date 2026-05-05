-- Points per phase
create or replace function public.points_for_phase(p match_phase)
returns int language sql immutable as $$
  select case p
    when 'group_stage' then 5
    when 'r16' then 15
    when 'qf' then 20
    when 'sf' then 25
    when 'final' then 50
    else 0
  end
$$;

-- Refresh leaderboard_global for a set of user_ids
create or replace function public.refresh_leaderboard_global(affected_users uuid[])
returns void language plpgsql security definer as $$
begin
  insert into public.leaderboard_global (user_id, display_name, avatar_url, total_points, correct_predictions, updated_at)
  select
    u.id,
    u.display_name,
    u.avatar_url,
    coalesce(sum(ps.points), 0),
    count(ps.id),
    now()
  from public.users u
  left join public.prediction_scores ps on ps.user_id = u.id
  where u.id = any(affected_users)
  group by u.id, u.display_name, u.avatar_url
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    total_points = excluded.total_points,
    correct_predictions = excluded.correct_predictions,
    updated_at = excluded.updated_at;

  update public.leaderboard_global lg set rank = r.rank
  from (
    select user_id, rank() over (order by total_points desc) as rank
    from public.leaderboard_global
  ) r
  where lg.user_id = r.user_id;
end;
$$;

-- Refresh leaderboard_group for affected users
create or replace function public.refresh_leaderboard_groups(affected_users uuid[])
returns void language plpgsql security definer as $$
begin
  insert into public.leaderboard_group (group_id, user_id, display_name, avatar_url, total_points, correct_predictions, updated_at)
  select
    gm.group_id,
    u.id,
    u.display_name,
    u.avatar_url,
    coalesce(sum(ps.points), 0),
    count(ps.id),
    now()
  from public.group_members gm
  join public.users u on u.id = gm.user_id
  left join public.prediction_scores ps on ps.user_id = gm.user_id
  where gm.user_id = any(affected_users)
  group by gm.group_id, u.id, u.display_name, u.avatar_url
  on conflict (group_id, user_id) do update set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    total_points = excluded.total_points,
    correct_predictions = excluded.correct_predictions,
    updated_at = excluded.updated_at;

  update public.leaderboard_group lg set rank = r.rank
  from (
    select group_id, user_id,
      rank() over (partition by group_id order by total_points desc) as rank
    from public.leaderboard_group
  ) r
  where lg.group_id = r.group_id and lg.user_id = r.user_id;
end;
$$;

-- Trigger function: score match results
create or replace function public.score_match_result()
returns trigger language plpgsql security definer as $$
declare
  v_phase match_phase;
  v_pts int;
  v_affected uuid[];
begin
  select phase into v_phase from public.matches where id = new.match_id;
  v_pts := public.points_for_phase(v_phase);

  if v_phase = 'group_stage' then
    insert into public.prediction_scores (user_id, prediction_type, reference_id, points, scored_at)
    select user_id, 'match_result', new.match_id::text, v_pts, now()
    from public.group_stage_predictions
    where match_id = new.match_id and prediction = new.result
    on conflict (user_id, prediction_type, reference_id) do update set points = excluded.points, scored_at = excluded.scored_at;

    select array_agg(user_id) into v_affected
    from public.group_stage_predictions
    where match_id = new.match_id and prediction = new.result;
  else
    insert into public.prediction_scores (user_id, prediction_type, reference_id, points, scored_at)
    select user_id, 'knockout', new.match_id::text, v_pts, now()
    from public.knockout_predictions
    where match_id = new.match_id and predicted_winner = new.winner_team
    on conflict (user_id, prediction_type, reference_id) do update set points = excluded.points, scored_at = excluded.scored_at;

    select array_agg(user_id) into v_affected
    from public.knockout_predictions
    where match_id = new.match_id and predicted_winner = new.winner_team;
  end if;

  if v_affected is not null then
    perform public.refresh_leaderboard_global(v_affected);
    perform public.refresh_leaderboard_groups(v_affected);
  end if;

  return new;
end;
$$;

create trigger on_match_result_entered
  after insert or update on public.match_results
  for each row execute function public.score_match_result();

-- Trigger function: score advancement results
create or replace function public.score_advancement_result()
returns trigger language plpgsql security definer as $$
declare
  v_affected uuid[];
begin
  insert into public.prediction_scores (user_id, prediction_type, reference_id, points, scored_at)
  select user_id, 'advancement', new.group_letter || '_t1', 10, now()
  from public.group_advancement_predictions
  where group_letter = new.group_letter
    and (team_1 = new.team_1 or team_1 = new.team_2 or team_2 = new.team_1 or team_2 = new.team_2)
    and new.team_1 in (team_1, team_2)
  on conflict (user_id, prediction_type, reference_id) do update set points = excluded.points, scored_at = excluded.scored_at;

  insert into public.prediction_scores (user_id, prediction_type, reference_id, points, scored_at)
  select user_id, 'advancement', new.group_letter || '_t2', 10, now()
  from public.group_advancement_predictions
  where group_letter = new.group_letter
    and new.team_2 in (team_1, team_2)
  on conflict (user_id, prediction_type, reference_id) do update set points = excluded.points, scored_at = excluded.scored_at;

  select array_agg(distinct user_id) into v_affected
  from public.group_advancement_predictions
  where group_letter = new.group_letter;

  if v_affected is not null then
    perform public.refresh_leaderboard_global(v_affected);
    perform public.refresh_leaderboard_groups(v_affected);
  end if;

  return new;
end;
$$;

create trigger on_advancement_result_entered
  after insert or update on public.group_advancement_results
  for each row execute function public.score_advancement_result();

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
