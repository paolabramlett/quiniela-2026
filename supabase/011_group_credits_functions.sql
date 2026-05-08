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

-- Admin write policy: allows admin_whitelist users to upsert group_credits rows
-- (used by AccessesTab to grant/revoke free access).
create policy "group_credits_admin_write" on public.group_credits
  for all using (
    exists (
      select 1 from public.admin_whitelist
      where email = (select email from auth.users where id = auth.uid())
    )
  );
