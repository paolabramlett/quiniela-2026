-- Auto-populate group_advancement_results once a group's top-2 are
-- mathematically certain, instead of requiring an admin to manually enter
-- it. Mirrors the same logic as src/utils/advancement.js: simulate every
-- possible outcome of the group's remaining matches and only call a team
-- "clinched" if it finishes strictly above 3rd place in every single one.
-- Ties at the qualification cutoff are left for an admin to resolve by hand
-- (goal difference / head-to-head aren't tracked here).
create or replace function public.compute_group_advancement(p_group_letter char(1))
returns jsonb
language plpgsql
as $$
declare
  v_home          text[];
  v_away          text[];
  v_result        text[];
  v_teams         text[];
  v_n             int;
  v_unplayed_idx  int[] := '{}';
  v_num_unplayed  int;
  v_total         bigint;
  v_base_points   jsonb := '{}'::jsonb;
  v_advancing     jsonb := '{}'::jsonb;
  v_scenario      jsonb;
  v_ranked        text[];
  v_third_points  int;
  v_team          text;
  v_s             bigint;
  v_tmp           bigint;
  v_outcome       int;
  v_match_i       int;
  v_clinched      text[] := '{}';
  v_eliminated    text[] := '{}';
  i               int;
begin
  select array_agg(m.home_team order by m.kickoff_at),
         array_agg(m.away_team order by m.kickoff_at),
         array_agg(mr.result::text order by m.kickoff_at)
    into v_home, v_away, v_result
  from public.matches m
  left join public.match_results mr on mr.match_id = m.id
  where m.phase = 'group_stage' and m.group_letter = p_group_letter;

  v_n := coalesce(array_length(v_home, 1), 0);
  if v_n = 0 then
    return jsonb_build_object('clinched', '[]'::jsonb, 'eliminated', '[]'::jsonb);
  end if;

  select array_agg(distinct t) into v_teams
  from (select unnest(v_home) as t union select unnest(v_away)) s;

  foreach v_team in array v_teams loop
    v_base_points := v_base_points || jsonb_build_object(v_team, 0);
  end loop;

  for i in 1..v_n loop
    if v_result[i] is null then
      v_unplayed_idx := array_append(v_unplayed_idx, i);
    elsif v_result[i] = 'home' then
      v_base_points := jsonb_set(v_base_points, array[v_home[i]], to_jsonb((v_base_points->>v_home[i])::int + 3));
    elsif v_result[i] = 'away' then
      v_base_points := jsonb_set(v_base_points, array[v_away[i]], to_jsonb((v_base_points->>v_away[i])::int + 3));
    else
      v_base_points := jsonb_set(v_base_points, array[v_home[i]], to_jsonb((v_base_points->>v_home[i])::int + 1));
      v_base_points := jsonb_set(v_base_points, array[v_away[i]], to_jsonb((v_base_points->>v_away[i])::int + 1));
    end if;
  end loop;

  v_num_unplayed := coalesce(array_length(v_unplayed_idx, 1), 0);
  v_total := pow(3, v_num_unplayed)::bigint;

  foreach v_team in array v_teams loop
    v_advancing := v_advancing || jsonb_build_object(v_team, 0);
  end loop;

  for v_s in 0..v_total - 1 loop
    v_scenario := v_base_points;
    v_tmp := v_s;
    for i in 1..v_num_unplayed loop
      v_outcome := v_tmp % 3;
      v_tmp := v_tmp / 3;
      v_match_i := v_unplayed_idx[i];
      if v_outcome = 0 then
        v_scenario := jsonb_set(v_scenario, array[v_home[v_match_i]], to_jsonb((v_scenario->>v_home[v_match_i])::int + 3));
      elsif v_outcome = 2 then
        v_scenario := jsonb_set(v_scenario, array[v_away[v_match_i]], to_jsonb((v_scenario->>v_away[v_match_i])::int + 3));
      else
        v_scenario := jsonb_set(v_scenario, array[v_home[v_match_i]], to_jsonb((v_scenario->>v_home[v_match_i])::int + 1));
        v_scenario := jsonb_set(v_scenario, array[v_away[v_match_i]], to_jsonb((v_scenario->>v_away[v_match_i])::int + 1));
      end if;
    end loop;

    select array_agg(t order by (v_scenario->>t)::int desc) into v_ranked
    from unnest(v_teams) as t;

    v_third_points := (v_scenario->>v_ranked[3])::int;

    foreach v_team in array v_teams loop
      if (v_scenario->>v_team)::int > v_third_points then
        v_advancing := jsonb_set(v_advancing, array[v_team], to_jsonb((v_advancing->>v_team)::int + 1));
      end if;
    end loop;
  end loop;

  foreach v_team in array v_teams loop
    if (v_advancing->>v_team)::int = v_total then
      v_clinched := array_append(v_clinched, v_team);
    elsif (v_advancing->>v_team)::int = 0 then
      v_eliminated := array_append(v_eliminated, v_team);
    end if;
  end loop;

  return jsonb_build_object('clinched', to_jsonb(v_clinched), 'eliminated', to_jsonb(v_eliminated));
end;
$$;

-- Fires after every match result entry/update; recomputes the affected
-- group and writes the official advancement result once both spots are
-- decided (idempotent — re-running with the same teams is a no-op for
-- score_advancement_result's own on-conflict logic).
create or replace function public.trg_auto_group_advancement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phase        match_phase;
  v_group_letter char(1);
  v_computed     jsonb;
  v_clinched     text[];
begin
  select phase, group_letter into v_phase, v_group_letter
  from public.matches where id = new.match_id;

  if v_phase is distinct from 'group_stage' or v_group_letter is null then
    return new;
  end if;

  v_computed := public.compute_group_advancement(v_group_letter);
  select array_agg(value) into v_clinched
  from jsonb_array_elements_text(v_computed->'clinched');

  if array_length(v_clinched, 1) = 2 then
    insert into public.group_advancement_results (group_letter, team_1, team_2, entered_by, entered_at)
    values (v_group_letter, v_clinched[1], v_clinched[2], null, now())
    on conflict (group_letter) do update
      set team_1 = excluded.team_1, team_2 = excluded.team_2, entered_at = excluded.entered_at;
  end if;

  return new;
end;
$$;

drop trigger if exists on_match_result_check_advancement on public.match_results;
create trigger on_match_result_check_advancement
  after insert or update on public.match_results
  for each row execute function public.trg_auto_group_advancement();
