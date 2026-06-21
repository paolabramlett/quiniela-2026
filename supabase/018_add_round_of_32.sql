-- 2026 World Cup expanded to 48 teams: 32 advance from groups into a
-- Round of 32 before the Round of 16. That round was missing entirely.
alter type match_phase add value 'r32' before 'r16';
