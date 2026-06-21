-- Same bug as get_my_feed (021): the group_id OUT column collided with
-- the bare group_id column in this function's own auth-guard subquery,
-- raising "column reference group_id is ambiguous" on every call.
create or replace function public.get_group_activity(p_group_id uuid)
returns table(
  id                  uuid,
  group_id            uuid,
  event_type          text,
  payload             jsonb,
  created_at          timestamptz,
  actor_display_name  text,
  actor_avatar_url    text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.group_members gm
    where gm.group_id = p_group_id and gm.user_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  return query
    select
      ga.id,
      ga.group_id,
      ga.event_type,
      ga.payload,
      ga.created_at,
      u.display_name as actor_display_name,
      u.avatar_url   as actor_avatar_url
    from public.group_activity ga
    left join public.users u on u.id = ga.user_id
    where ga.group_id = p_group_id
      and ga.created_at >= now() - interval '7 days'
    order by ga.created_at desc;
end;
$$;
