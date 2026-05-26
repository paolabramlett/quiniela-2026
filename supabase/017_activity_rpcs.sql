-- supabase/017_activity_rpcs.sql

-- Called by the admin after entering a match result.
-- Writes rank_up/rank_down, correct_streak, and prediction_complete events
-- for all group members who had predictions on the given match.
create or replace function public.generate_match_activity(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id          uuid;
  v_user_id           uuid;
  v_old_rank          integer;
  v_new_rank          integer;
  v_streak            integer;
  v_phase             text;
  v_total_matches     integer;
  v_user_predictions  integer;
begin
  -- Get match phase
  select phase into v_phase from public.matches where id = p_match_id;
  if not found then
    raise exception 'Match % not found', p_match_id;
  end if;

  -- Iterate over each group that has at least one member who predicted this match
  for v_group_id in
    select distinct gm.group_id
    from public.group_members gm
    where gm.user_id in (
      select user_id from public.group_stage_predictions where match_id = p_match_id
      union
      select user_id from public.knockout_predictions     where match_id = p_match_id
    )
  loop

    -- 1. Rank changes: compare leaderboard_group to rank_snapshots
    for v_user_id, v_new_rank in
      select lg.user_id, lg.rank
      from public.leaderboard_group lg
      where lg.group_id = v_group_id
    loop
      select rs.rank into v_old_rank
      from public.rank_snapshots rs
      where rs.group_id = v_group_id and rs.user_id = v_user_id;

      if v_old_rank is not null then
        if v_new_rank < v_old_rank then
          insert into public.group_activity(group_id, user_id, event_type, payload)
          values (v_group_id, v_user_id, 'rank_up',
                  jsonb_build_object('old_rank', v_old_rank, 'new_rank', v_new_rank));
        elsif v_new_rank > v_old_rank then
          insert into public.group_activity(group_id, user_id, event_type, payload)
          values (v_group_id, v_user_id, 'rank_down',
                  jsonb_build_object('old_rank', v_old_rank, 'new_rank', v_new_rank));
        end if;
      end if;

      -- Upsert snapshot with current rank
      insert into public.rank_snapshots(group_id, user_id, rank, captured_at)
      values (v_group_id, v_user_id, v_new_rank, now())
      on conflict (group_id, user_id) do update
        set rank = excluded.rank, captured_at = excluded.captured_at;
    end loop;

    -- 2. Streaks + prediction_complete: only for members who predicted this match
    for v_user_id in
      select gm.user_id
      from public.group_members gm
      where gm.group_id = v_group_id
        and gm.user_id in (
          select user_id from public.group_stage_predictions where match_id = p_match_id
          union
          select user_id from public.knockout_predictions     where match_id = p_match_id
        )
    loop

      -- Count current consecutive correct streak (most recent predictions first)
      select count(*) into v_streak
      from (
        select 1
        from (
          select
            m.kickoff_at,
            coalesce(
              case
                when m.phase = 'group_stage'
                then (gsp.prediction = mr.result)
                else (kp.predicted_winner = mr.winner_team)
              end,
              false
            ) as is_correct,
            sum(
              case
                when coalesce(
                  case
                    when m.phase = 'group_stage'
                    then (gsp.prediction = mr.result)
                    else (kp.predicted_winner = mr.winner_team)
                  end,
                  false
                ) = false then 1 else 0
              end
            ) over (
              order by m.kickoff_at desc
              rows between unbounded preceding and current row
            ) as breaks
          from public.matches m
          join public.match_results mr on mr.match_id = m.id
          left join public.group_stage_predictions gsp
            on gsp.match_id = m.id and gsp.user_id = v_user_id and m.phase = 'group_stage'
          left join public.knockout_predictions kp
            on kp.match_id = m.id and kp.user_id = v_user_id and m.phase <> 'group_stage'
          where (gsp.user_id is not null or kp.user_id is not null)
        ) inner_q
        where breaks = 0
      ) streak_q;

      -- Write streak event at exactly 3 and every additional 3 correct in a row
      if v_streak >= 3 and v_streak % 3 = 0 then
        insert into public.group_activity(group_id, user_id, event_type, payload)
        values (v_group_id, v_user_id, 'correct_streak',
                jsonb_build_object('streak', v_streak));
      end if;

      -- Count total phase matches that now have results
      select count(*) into v_total_matches
      from public.matches m
      join public.match_results mr on mr.match_id = m.id
      where m.phase = v_phase;

      -- Count user predictions for this phase that have results
      if v_phase = 'group_stage' then
        select count(*) into v_user_predictions
        from public.group_stage_predictions gsp
        join public.matches m  on m.id = gsp.match_id
        join public.match_results mr on mr.match_id = m.id
        where gsp.user_id = v_user_id and m.phase = 'group_stage';
      else
        select count(*) into v_user_predictions
        from public.knockout_predictions kp
        join public.matches m  on m.id = kp.match_id
        join public.match_results mr on mr.match_id = m.id
        where kp.user_id = v_user_id and m.phase = v_phase;
      end if;

      -- Write prediction_complete once per user per phase
      if v_total_matches > 0
         and v_user_predictions = v_total_matches
         and not exists (
           select 1 from public.group_activity
           where group_id = v_group_id
             and user_id  = v_user_id
             and event_type = 'prediction_complete'
             and payload->>'phase' = v_phase
         )
      then
        insert into public.group_activity(group_id, user_id, event_type, payload)
        values (v_group_id, v_user_id, 'prediction_complete',
                jsonb_build_object('phase', v_phase));
      end if;

    end loop; -- per user
  end loop;   -- per group
end;
$$;

-- Returns last 7 days of activity for one group.
-- Caller must be a member of the group.
create or replace function public.get_group_activity(p_group_id uuid)
returns table(
  id                  uuid,
  group_id            uuid,
  event_type          text,
  payload             jsonb,
  created_at          timestamptz,
  actor_display_name  text,
  actor_avatar_url    text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Auth guard: caller must be a member
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  return query
    select
      ga.id,
      ga.group_id,
      ga.event_type,
      ga.payload,
      ga.created_at,
      u.display_name as actor_display_name,
      u.avatar_url   as actor_avatar_url
    from public.group_activity ga
    left join public.users u on u.id = ga.user_id
    where ga.group_id = p_group_id
      and ga.created_at >= now() - interval '7 days'
    order by ga.created_at desc;
end;
$$;

-- Returns last 7 days of activity across all groups the caller belongs to.
create or replace function public.get_my_feed(p_user_id uuid)
returns table(
  id                  uuid,
  group_id            uuid,
  group_name          text,
  event_type          text,
  payload             jsonb,
  created_at          timestamptz,
  actor_display_name  text,
  actor_avatar_url    text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Auth guard
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;

  return query
    select
      ga.id,
      ga.group_id,
      g.name         as group_name,
      ga.event_type,
      ga.payload,
      ga.created_at,
      u.display_name as actor_display_name,
      u.avatar_url   as actor_avatar_url
    from public.group_activity ga
    join public.groups g on g.id = ga.group_id
    left join public.users u on u.id = ga.user_id
    where ga.group_id in (
      select group_id from public.group_members where user_id = p_user_id
    )
      and ga.created_at >= now() - interval '7 days'
    order by ga.created_at desc;
end;
$$;
