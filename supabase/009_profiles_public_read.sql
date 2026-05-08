-- Allow any authenticated user to read public profile info (display_name, avatar_url)
-- Profiles are non-sensitive — names are visible in leaderboards anyway
create policy "profiles_public_read" on public.profiles
  for select using (auth.uid() is not null);
