-- get_my_feed's `group_id` OUT parameter collided with the `group_id`
-- column referenced inside its own subquery ("select group_id from
-- group_members where user_id = p_user_id"), raising "column reference
-- group_id is ambiguous" on every call. That's why the Feed always showed
-- "Sin actividad reciente" even after activity events existed.
create or replace function public.get_my_feed(p_user_id uuid)
returns table(
  id                  uuid,
  group_id            uuid,
  group_name          text,
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
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;

  return query
    select
      ga.id,
      ga.group_id,
      g.name         as group_name,
      ga.event_type,
      ga.payload,
      ga.created_at,
      u.display_name as actor_display_name,
      u.avatar_url   as actor_avatar_url
    from public.group_activity ga
    join public.groups g on g.id = ga.group_id
    left join public.users u on u.id = ga.user_id
    where ga.group_id in (
      select gm.group_id from public.group_members gm where gm.user_id = p_user_id
    )
      and ga.created_at >= now() - interval '7 days'
    order by ga.created_at desc;
end;
$$;
