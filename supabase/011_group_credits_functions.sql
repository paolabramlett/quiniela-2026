-- increment_group_slots: atomically adds slots to a user's group_credits row.
-- Called by the stripe-webhook edge function on checkout.session.completed.
create or replace function public.increment_group_slots(p_user_id uuid, p_slots int)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.group_credits (user_id, slots_purchased, updated_at)
  values (p_user_id, p_slots, now())
  on conflict (user_id)
  do update set
    slots_purchased = group_credits.slots_purchased + excluded.slots_purchased,
    updated_at = now();
end;
$$;

-- get_user_by_email: looks up a user by their auth email, returning public profile fields.
-- Used by the admin AccessesTab to find a user before granting/revoking access.
-- Restricted to admin_whitelist members to prevent PII enumeration by regular users.
create or replace function public.get_user_by_email(p_email text)
returns table(id uuid, display_name text, avatar_url text)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Only admins may look up users by email
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  return query
    select u.id, u.display_name, u.avatar_url
    from public.users u
    join auth.users a on a.id = u.id
    where lower(a.email) = lower(p_email)
    limit 1;
end;
$$;

-- Admin write policy: allows admin_whitelist users to upsert group_credits rows
-- (used by AccessesTab to grant/revoke free access).
-- Note: admin_whitelist has RLS enabled with no insert policy — only service role
-- can add emails to that table, so this chain is safe against self-promotion.
create policy "group_credits_admin_write" on public.group_credits
  for all
  using (public.is_admin())
  with check (public.is_admin());
