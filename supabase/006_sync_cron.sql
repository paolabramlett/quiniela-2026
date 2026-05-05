-- Run this AFTER deploying the sync-matches edge function.
-- First enable these two extensions in Supabase dashboard:
--   Database → Extensions → pg_cron (enable)
--   Database → Extensions → pg_net (enable)
--
-- Replace YOUR_PROJECT_REF with your Supabase project reference
-- (found in Supabase dashboard URL: https://supabase.com/dashboard/project/YOUR_PROJECT_REF)

select cron.schedule(
  'sync-matches-daily',
  '0 6 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-matches',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);
