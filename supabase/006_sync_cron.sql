-- Runs AFTER deploying the sync-matches edge function (verify_jwt = false).
-- Prerequisites in Supabase dashboard:
--   Database → Extensions → pg_cron (enable)
--   Database → Extensions → pg_net (enable)
--
-- Syncs match results from API-Football every 15 minutes.
-- During the World Cup this keeps scores current without manual updates.

select cron.schedule(
  'sync-matches-15min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://hvjxkplcawwrimfwckgp.supabase.co/functions/v1/sync-matches',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);
