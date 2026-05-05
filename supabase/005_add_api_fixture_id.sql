-- Add API fixture ID column for reliable upserts from API-Football
alter table public.matches add column if not exists api_fixture_id integer unique;

-- Clear fake seed data (predictions cascade automatically)
delete from public.match_results;
delete from public.group_advancement_results;
delete from public.matches;
