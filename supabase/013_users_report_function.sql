-- supabase/013_users_report_function.sql
-- Admin-only function returning one row per registered user with their
-- profile, email, signup date, and group credit status (paid or free).
-- Accessible only to admin accounts via is_admin() guard.
create or replace function public.get_users_report()
returns table(
  id uuid,
  display_name text,
  avatar_url text,
  email text,
  created_at timestamptz,
  slots_purchased int,
  granted_free boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;
  return query
    select
      u.id,
      u.display_name,
      u.avatar_url,
      a.email::text,
      a.created_at,
      coalesce(gc.slots_purchased, 0)::int as slots_purchased,
      coalesce(gc.granted_free, false) as granted_free
    from public.users u
    join auth.users a on a.id = u.id
    left join public.group_credits gc on gc.user_id = u.id
    order by a.created_at desc;
end;
$$;
