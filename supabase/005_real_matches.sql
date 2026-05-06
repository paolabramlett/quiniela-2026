-- Real 2026 World Cup match data
-- Clear existing fake data first
delete from public.match_results;
delete from public.group_advancement_results;
delete from public.group_stage_predictions;
delete from public.group_advancement_predictions;
delete from public.knockout_predictions;
delete from public.matches;

-- Group Stage Matches
insert into public.matches (phase, group_letter, home_team, away_team, kickoff_at) values

-- Group A
('group_stage', 'A', 'Mexico', 'South Africa', '2026-06-11 19:00:00+00'),
('group_stage', 'A', 'South Korea', 'Czechia', '2026-06-12 02:00:00+00'),
('group_stage', 'A', 'Czechia', 'South Africa', '2026-06-18 16:00:00+00'),
('group_stage', 'A', 'Mexico', 'South Korea', '2026-06-19 03:00:00+00'),
('group_stage', 'A', 'Mexico', 'Czechia', '2026-06-24 19:00:00+00'),
('group_stage', 'A', 'South Africa', 'South Korea', '2026-06-24 19:00:00+00'),

-- Group B
('group_stage', 'B', 'Canada', 'Bosnia and Herzegovina', '2026-06-12 19:00:00+00'),
('group_stage', 'B', 'Qatar', 'Switzerland', '2026-06-13 19:00:00+00'),
('group_stage', 'B', 'Switzerland', 'Bosnia and Herzegovina', '2026-06-18 19:00:00+00'),
('group_stage', 'B', 'Canada', 'Qatar', '2026-06-18 22:00:00+00'),
('group_stage', 'B', 'Switzerland', 'Canada', '2026-06-24 22:00:00+00'),
('group_stage', 'B', 'Qatar', 'Bosnia and Herzegovina', '2026-06-24 22:00:00+00'),

-- Group C
('group_stage', 'C', 'Brazil', 'Morocco', '2026-06-13 22:00:00+00'),
('group_stage', 'C', 'Haiti', 'Scotland', '2026-06-14 01:00:00+00'),
('group_stage', 'C', 'Scotland', 'Morocco', '2026-06-19 22:00:00+00'),
('group_stage', 'C', 'Brazil', 'Haiti', '2026-06-20 01:00:00+00'),
('group_stage', 'C', 'Brazil', 'Scotland', '2026-06-25 03:00:00+00'),
('group_stage', 'C', 'Morocco', 'Haiti', '2026-06-25 03:00:00+00'),

-- Group D
('group_stage', 'D', 'United States', 'Paraguay', '2026-06-13 01:00:00+00'),
('group_stage', 'D', 'United States', 'Australia', '2026-06-19 19:00:00+00'),
('group_stage', 'D', 'Türkiye', 'Paraguay', '2026-06-20 04:00:00+00'),
('group_stage', 'D', 'United States', 'Türkiye', '2026-06-26 03:00:00+00'),
('group_stage', 'D', 'Australia', 'Paraguay', '2026-06-26 03:00:00+00'),
('group_stage', 'D', 'Australia', 'Türkiye', '2026-06-19 19:00:00+00'),

-- Group E
('group_stage', 'E', 'Germany', 'Curaçao', '2026-06-14 17:00:00+00'),
('group_stage', 'E', 'Côte d''Ivoire', 'Ecuador', '2026-06-14 23:00:00+00'),
('group_stage', 'E', 'Germany', 'Côte d''Ivoire', '2026-06-20 20:00:00+00'),
('group_stage', 'E', 'Ecuador', 'Curaçao', '2026-06-21 00:00:00+00'),
('group_stage', 'E', 'Curaçao', 'Côte d''Ivoire', '2026-06-25 19:00:00+00'),
('group_stage', 'E', 'Ecuador', 'Germany', '2026-06-25 19:00:00+00'),

-- Group F
('group_stage', 'F', 'Netherlands', 'Japan', '2026-06-14 20:00:00+00'),
('group_stage', 'F', 'Sweden', 'Tunisia', '2026-06-15 02:00:00+00'),
('group_stage', 'F', 'Netherlands', 'Sweden', '2026-06-20 17:00:00+00'),
('group_stage', 'F', 'Tunisia', 'Japan', '2026-06-21 02:00:00+00'),
('group_stage', 'F', 'Japan', 'Sweden', '2026-06-25 22:00:00+00'),
('group_stage', 'F', 'Tunisia', 'Netherlands', '2026-06-25 22:00:00+00'),

-- Group G
('group_stage', 'G', 'Belgium', 'Egypt', '2026-06-15 22:00:00+00'),
('group_stage', 'G', 'Iran', 'New Zealand', '2026-06-16 04:00:00+00'),
('group_stage', 'G', 'Belgium', 'Iran', '2026-06-21 19:00:00+00'),
('group_stage', 'G', 'New Zealand', 'Egypt', '2026-06-22 01:00:00+00'),
('group_stage', 'G', 'Belgium', 'New Zealand', '2026-06-26 19:00:00+00'),
('group_stage', 'G', 'Egypt', 'Iran', '2026-06-26 19:00:00+00'),

-- Group H
('group_stage', 'H', 'Spain', 'Cabo Verde', '2026-06-15 17:00:00+00'),
('group_stage', 'H', 'Saudi Arabia', 'Uruguay', '2026-06-15 22:00:00+00'),
('group_stage', 'H', 'Spain', 'Saudi Arabia', '2026-06-21 16:00:00+00'),
('group_stage', 'H', 'Uruguay', 'Cabo Verde', '2026-06-21 22:00:00+00'),
('group_stage', 'H', 'Spain', 'Uruguay', '2026-06-26 22:00:00+00'),
('group_stage', 'H', 'Saudi Arabia', 'Cabo Verde', '2026-06-26 22:00:00+00'),

-- Group I
('group_stage', 'I', 'France', 'Senegal', '2026-06-16 19:00:00+00'),
('group_stage', 'I', 'Iraq', 'Norway', '2026-06-16 22:00:00+00'),
('group_stage', 'I', 'France', 'Iraq', '2026-06-22 21:00:00+00'),
('group_stage', 'I', 'Norway', 'Senegal', '2026-06-23 00:00:00+00'),
('group_stage', 'I', 'France', 'Norway', '2026-06-26 19:00:00+00'),
('group_stage', 'I', 'Iraq', 'Senegal', '2026-06-26 19:00:00+00'),

-- Group J
('group_stage', 'J', 'Argentina', 'Algeria', '2026-06-17 01:00:00+00'),
('group_stage', 'J', 'Austria', 'Jordan', '2026-06-17 04:00:00+00'),
('group_stage', 'J', 'Argentina', 'Austria', '2026-06-22 17:00:00+00'),
('group_stage', 'J', 'Jordan', 'Algeria', '2026-06-23 03:00:00+00'),
('group_stage', 'J', 'Argentina', 'Jordan', '2026-06-28 02:00:00+00'),
('group_stage', 'J', 'Algeria', 'Austria', '2026-06-28 02:00:00+00'),

-- Group K
('group_stage', 'K', 'Portugal', 'DR Congo', '2026-06-17 17:00:00+00'),
('group_stage', 'K', 'Uzbekistan', 'Colombia', '2026-06-18 02:00:00+00'),
('group_stage', 'K', 'Portugal', 'Uzbekistan', '2026-06-23 17:00:00+00'),
('group_stage', 'K', 'Colombia', 'DR Congo', '2026-06-24 02:00:00+00'),
('group_stage', 'K', 'Colombia', 'Portugal', '2026-06-27 23:30:00+00'),
('group_stage', 'K', 'DR Congo', 'Uzbekistan', '2026-06-27 23:30:00+00'),

-- Group L
('group_stage', 'L', 'England', 'Croatia', '2026-06-17 20:00:00+00'),
('group_stage', 'L', 'Ghana', 'Panama', '2026-06-17 23:00:00+00'),
('group_stage', 'L', 'England', 'Ghana', '2026-06-23 20:00:00+00'),
('group_stage', 'L', 'Panama', 'Croatia', '2026-06-23 23:00:00+00'),
('group_stage', 'L', 'England', 'Panama', '2026-06-27 21:00:00+00'),
('group_stage', 'L', 'Croatia', 'Ghana', '2026-06-27 21:00:00+00');

-- Knockout stage placeholders (teams revealed as tournament progresses)
insert into public.matches (phase, home_team, away_team, kickoff_at) values
-- Round of 16 (8 matches)
('r16', 'TBD', 'TBD', '2026-07-04 19:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-04 23:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-05 19:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-05 23:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-06 19:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-06 23:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-07 19:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-07 23:00:00+00'),
-- Quarter-finals (4 matches)
('qf', 'TBD', 'TBD', '2026-07-11 19:00:00+00'),
('qf', 'TBD', 'TBD', '2026-07-11 23:00:00+00'),
('qf', 'TBD', 'TBD', '2026-07-12 19:00:00+00'),
('qf', 'TBD', 'TBD', '2026-07-12 23:00:00+00'),
-- Semi-finals (2 matches)
('sf', 'TBD', 'TBD', '2026-07-15 23:00:00+00'),
('sf', 'TBD', 'TBD', '2026-07-16 23:00:00+00'),
-- Final
('final', 'TBD', 'TBD', '2026-07-19 23:00:00+00');
