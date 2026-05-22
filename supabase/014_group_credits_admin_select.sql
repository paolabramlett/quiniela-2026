-- 014_group_credits_admin_select.sql
-- Add explicit FOR SELECT admin policy on group_credits.
-- The existing FOR ALL policy covers SELECT in theory, but PostgREST
-- requires an explicit FOR SELECT policy to reliably return rows via
-- the supabase-js client when querying another user's row as admin.
drop policy if exists "group_credits_admin_select" on public.group_credits;
create policy "group_credits_admin_select" on public.group_credits
  for select using (public.is_admin());
