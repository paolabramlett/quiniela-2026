-- supabase/015_recent_results_function.sql
-- Returns the last 3 completed matches a user made a prediction on,
-- with the match result and whether their prediction was correct.
create or replace function public.get_recent_results(p_user_id uuid)
returns table(
  match_id       uuid,
  home_team      text,
  away_team      text,
  home_score     int,
  away_score     int,
  phase          text,
  group_letter   text,
  user_pick      text,
  is_correct     boolean,
  kicked_off_at  timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Caller must be fetching their own data
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;

  return query
    -- Group stage predictions
    select
      m.id            as match_id,
      m.home_team,
      m.away_team,
      mr.home_score,
      mr.away_score,
      m.phase,
      m.group_letter,
      gsp.prediction  as user_pick,
      (gsp.prediction = mr.result) as is_correct,
      m.kickoff_at    as kicked_off_at
    from public.matches m
    join public.match_results mr on mr.match_id = m.id
    join public.group_stage_predictions gsp
      on gsp.match_id = m.id and gsp.user_id = p_user_id
    where m.phase = 'group_stage'

    union all

    -- Knockout predictions
    select
      m.id            as match_id,
      m.home_team,
      m.away_team,
      mr.home_score,
      mr.away_score,
      m.phase,
      m.group_letter,
      kp.predicted_winner as user_pick,
      (kp.predicted_winner = mr.winner_team) as is_correct,
      m.kickoff_at    as kicked_off_at
    from public.matches m
    join public.match_results mr on mr.match_id = m.id
    join public.knockout_predictions kp
      on kp.match_id = m.id and kp.user_id = p_user_id
    where m.phase != 'group_stage'

    order by kicked_off_at desc
    limit 3;
end;
$$;
