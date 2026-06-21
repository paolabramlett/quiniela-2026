-- Award points for the new round and seed its placeholder matches.
-- Split into its own migration because new enum values can't be used
-- in the same transaction that adds them (018_add_round_of_32.sql).

create or replace function public.points_for_phase(p match_phase)
returns int language sql immutable as $$
  select case p
    when 'group_stage' then 5
    when 'r32' then 10
    when 'r16' then 15
    when 'qf' then 20
    when 'sf' then 25
    when 'final' then 50
    else 0
  end
$$;

-- Round of 32 (16 matches, June 28 - July 3, 2026 per official calendar)
insert into public.matches (phase, home_team, away_team, kickoff_at) values
('r32', 'TBD', 'TBD', '2026-06-28 17:00:00+00'),
('r32', 'TBD', 'TBD', '2026-06-28 20:00:00+00'),
('r32', 'TBD', 'TBD', '2026-06-28 23:00:00+00'),
('r32', 'TBD', 'TBD', '2026-06-29 17:00:00+00'),
('r32', 'TBD', 'TBD', '2026-06-29 20:00:00+00'),
('r32', 'TBD', 'TBD', '2026-06-29 23:00:00+00'),
('r32', 'TBD', 'TBD', '2026-06-30 17:00:00+00'),
('r32', 'TBD', 'TBD', '2026-06-30 20:00:00+00'),
('r32', 'TBD', 'TBD', '2026-06-30 23:00:00+00'),
('r32', 'TBD', 'TBD', '2026-07-01 17:00:00+00'),
('r32', 'TBD', 'TBD', '2026-07-01 20:00:00+00'),
('r32', 'TBD', 'TBD', '2026-07-01 23:00:00+00'),
('r32', 'TBD', 'TBD', '2026-07-02 19:00:00+00'),
('r32', 'TBD', 'TBD', '2026-07-02 23:00:00+00'),
('r32', 'TBD', 'TBD', '2026-07-03 19:00:00+00'),
('r32', 'TBD', 'TBD', '2026-07-03 23:00:00+00');
