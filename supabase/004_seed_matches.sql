-- Group stage seed data (placeholder teams — update with actual 2026 World Cup schedule)
-- Each group has 6 matches (4 teams, round-robin). Kickoff times are placeholders.

-- Group A
insert into public.matches (phase, group_letter, home_team, away_team, kickoff_at) values
('group_stage', 'A', 'USA',       'Mexico',      '2026-06-11 20:00:00+00'),
('group_stage', 'A', 'Canada',    'Uruguay',     '2026-06-12 00:00:00+00'),
('group_stage', 'A', 'USA',       'Canada',      '2026-06-16 20:00:00+00'),
('group_stage', 'A', 'Mexico',    'Uruguay',     '2026-06-16 23:00:00+00'),
('group_stage', 'A', 'USA',       'Uruguay',     '2026-06-20 20:00:00+00'),
('group_stage', 'A', 'Mexico',    'Canada',      '2026-06-20 20:00:00+00'),

-- Group B
('group_stage', 'B', 'Argentina', 'Chile',       '2026-06-11 23:00:00+00'),
('group_stage', 'B', 'Ecuador',   'Peru',        '2026-06-12 02:00:00+00'),
('group_stage', 'B', 'Argentina', 'Ecuador',     '2026-06-17 20:00:00+00'),
('group_stage', 'B', 'Chile',     'Peru',        '2026-06-17 23:00:00+00'),
('group_stage', 'B', 'Argentina', 'Peru',        '2026-06-21 20:00:00+00'),
('group_stage', 'B', 'Chile',     'Ecuador',     '2026-06-21 20:00:00+00'),

-- Group C
('group_stage', 'C', 'Brazil',    'Colombia',    '2026-06-12 20:00:00+00'),
('group_stage', 'C', 'Venezuela', 'Bolivia',     '2026-06-13 00:00:00+00'),
('group_stage', 'C', 'Brazil',    'Venezuela',   '2026-06-18 20:00:00+00'),
('group_stage', 'C', 'Colombia',  'Bolivia',     '2026-06-18 23:00:00+00'),
('group_stage', 'C', 'Brazil',    'Bolivia',     '2026-06-22 20:00:00+00'),
('group_stage', 'C', 'Colombia',  'Venezuela',   '2026-06-22 20:00:00+00'),

-- Group D
('group_stage', 'D', 'France',    'Belgium',     '2026-06-13 20:00:00+00'),
('group_stage', 'D', 'Portugal',  'Netherlands', '2026-06-14 00:00:00+00'),
('group_stage', 'D', 'France',    'Portugal',    '2026-06-19 20:00:00+00'),
('group_stage', 'D', 'Belgium',   'Netherlands', '2026-06-19 23:00:00+00'),
('group_stage', 'D', 'France',    'Netherlands', '2026-06-23 20:00:00+00'),
('group_stage', 'D', 'Belgium',   'Portugal',    '2026-06-23 20:00:00+00'),

-- Group E
('group_stage', 'E', 'Germany',   'Spain',       '2026-06-14 20:00:00+00'),
('group_stage', 'E', 'Croatia',   'Denmark',     '2026-06-15 00:00:00+00'),
('group_stage', 'E', 'Germany',   'Croatia',     '2026-06-20 00:00:00+00'),
('group_stage', 'E', 'Spain',     'Denmark',     '2026-06-20 03:00:00+00'),
('group_stage', 'E', 'Germany',   'Denmark',     '2026-06-24 20:00:00+00'),
('group_stage', 'E', 'Spain',     'Croatia',     '2026-06-24 20:00:00+00'),

-- Group F
('group_stage', 'F', 'England',   'Serbia',      '2026-06-15 20:00:00+00'),
('group_stage', 'F', 'Switzerland','Hungary',    '2026-06-16 00:00:00+00'),
('group_stage', 'F', 'England',   'Switzerland', '2026-06-21 00:00:00+00'),
('group_stage', 'F', 'Serbia',    'Hungary',     '2026-06-21 03:00:00+00'),
('group_stage', 'F', 'England',   'Hungary',     '2026-06-25 20:00:00+00'),
('group_stage', 'F', 'Serbia',    'Switzerland', '2026-06-25 20:00:00+00'),

-- Group G
('group_stage', 'G', 'Japan',     'South Korea', '2026-06-15 23:00:00+00'),
('group_stage', 'G', 'Australia', 'Iran',        '2026-06-16 02:00:00+00'),
('group_stage', 'G', 'Japan',     'Australia',   '2026-06-21 20:00:00+00'),
('group_stage', 'G', 'South Korea','Iran',       '2026-06-21 23:00:00+00'),
('group_stage', 'G', 'Japan',     'Iran',        '2026-06-26 20:00:00+00'),
('group_stage', 'G', 'South Korea','Australia',  '2026-06-26 20:00:00+00'),

-- Group H
('group_stage', 'H', 'Morocco',   'Senegal',     '2026-06-16 20:00:00+00'),
('group_stage', 'H', 'Egypt',     'Ghana',       '2026-06-17 00:00:00+00'),
('group_stage', 'H', 'Morocco',   'Egypt',       '2026-06-22 00:00:00+00'),
('group_stage', 'H', 'Senegal',   'Ghana',       '2026-06-22 03:00:00+00'),
('group_stage', 'H', 'Morocco',   'Ghana',       '2026-06-26 23:00:00+00'),
('group_stage', 'H', 'Senegal',   'Egypt',       '2026-06-26 23:00:00+00'),

-- Group I
('group_stage', 'I', 'Saudi Arabia','Qatar',     '2026-06-17 20:00:00+00'),
('group_stage', 'I', 'Turkey',    'Algeria',     '2026-06-18 00:00:00+00'),
('group_stage', 'I', 'Saudi Arabia','Turkey',    '2026-06-23 00:00:00+00'),
('group_stage', 'I', 'Qatar',     'Algeria',     '2026-06-23 03:00:00+00'),
('group_stage', 'I', 'Saudi Arabia','Algeria',   '2026-06-27 20:00:00+00'),
('group_stage', 'I', 'Qatar',     'Turkey',      '2026-06-27 20:00:00+00'),

-- Group J
('group_stage', 'J', 'Mexico',    'Poland',      '2026-06-18 20:00:00+00'),
('group_stage', 'J', 'Ukraine',   'Romania',     '2026-06-19 00:00:00+00'),
('group_stage', 'J', 'Mexico',    'Ukraine',     '2026-06-24 00:00:00+00'),
('group_stage', 'J', 'Poland',    'Romania',     '2026-06-24 03:00:00+00'),
('group_stage', 'J', 'Mexico',    'Romania',     '2026-06-28 20:00:00+00'),
('group_stage', 'J', 'Poland',    'Ukraine',     '2026-06-28 20:00:00+00'),

-- Group K
('group_stage', 'K', 'Portugal',  'Nigeria',     '2026-06-19 20:00:00+00'),
('group_stage', 'K', 'Cameroon',  'Cape Verde',  '2026-06-20 00:00:00+00'),
('group_stage', 'K', 'Portugal',  'Cameroon',    '2026-06-25 00:00:00+00'),
('group_stage', 'K', 'Nigeria',   'Cape Verde',  '2026-06-25 03:00:00+00'),
('group_stage', 'K', 'Portugal',  'Cape Verde',  '2026-06-29 20:00:00+00'),
('group_stage', 'K', 'Nigeria',   'Cameroon',    '2026-06-29 20:00:00+00'),

-- Group L
('group_stage', 'L', 'Spain',     'Brazil',      '2026-06-20 20:00:00+00'),
('group_stage', 'L', 'Colombia',  'Paraguay',    '2026-06-21 00:00:00+00'),
('group_stage', 'L', 'Spain',     'Colombia',    '2026-06-26 00:00:00+00'),
('group_stage', 'L', 'Brazil',    'Paraguay',    '2026-06-26 03:00:00+00'),
('group_stage', 'L', 'Spain',     'Paraguay',    '2026-06-30 20:00:00+00'),
('group_stage', 'L', 'Brazil',    'Colombia',    '2026-06-30 20:00:00+00');

-- Knockout round placeholder matches (teams TBD — will be populated as tournament progresses)
-- Round of 16 (8 matches)
insert into public.matches (phase, home_team, away_team, kickoff_at) values
('r16', 'TBD', 'TBD', '2026-07-04 20:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-04 23:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-05 20:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-05 23:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-06 20:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-06 23:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-07 20:00:00+00'),
('r16', 'TBD', 'TBD', '2026-07-07 23:00:00+00'),

-- Quarter-finals (4 matches)
('qf', 'TBD', 'TBD', '2026-07-10 20:00:00+00'),
('qf', 'TBD', 'TBD', '2026-07-10 23:00:00+00'),
('qf', 'TBD', 'TBD', '2026-07-11 20:00:00+00'),
('qf', 'TBD', 'TBD', '2026-07-11 23:00:00+00'),

-- Semi-finals (2 matches)
('sf', 'TBD', 'TBD', '2026-07-14 20:00:00+00'),
('sf', 'TBD', 'TBD', '2026-07-15 20:00:00+00'),

-- Final (1 match)
('final', 'TBD', 'TBD', '2026-07-19 20:00:00+00');
