-- Allow any authenticated user to read public user info (display_name, avatar_url)
-- User names are non-sensitive — they're visible in leaderboards anyway
create policy "users_public_read" on public.users
  for select using (auth.uid() is not null);
