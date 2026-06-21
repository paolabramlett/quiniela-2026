-- generate_match_activity declared v_phase as text but compared it against
-- the match_phase enum column (m.phase = v_phase), which always raised
-- "operator does not exist: match_phase = text". This silently meant the
-- function never wrote any rank_up/rank_down/streak/prediction_complete
-- activity events. Fix the type so the comparisons type-check.
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
  v_phase             match_phase;
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
             and payload->>'phase' = v_phase::text
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
