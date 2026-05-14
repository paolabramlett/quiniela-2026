# Admin Users Report Design

## Goal

Add a Usuarios tab to the Admin panel showing total signups, paying users, and a full user list.

## Routes & Access

- Existing `/admin` route, new tab within `AdminPage.jsx`
- Protected by existing `PasswordGate` + `isAdmin` check — no additional auth needed

## New Files

- `src/components/Admin/UsersTab.jsx` — tab content: stat cards + user table
- `supabase/013_users_report_function.sql` — admin-only DB function

## Modified Files

- `src/components/Admin/AdminPage.jsx` — add Usuarios tab to tab switcher and render `<UsersTab />`

## Database Function

New function `public.get_users_report()` using `SECURITY DEFINER` with `is_admin()` guard.

Returns one row per user:

| Column | Source |
|---|---|
| `id` | `public.users.id` |
| `display_name` | `public.users.display_name` |
| `avatar_url` | `public.users.avatar_url` |
| `email` | `auth.users.email` |
| `created_at` | `auth.users.created_at` |
| `slots_purchased` | `group_credits.slots_purchased` (0 if no row) |
| `granted_free` | `group_credits.granted_free` (false if no row) |

Ordered by `created_at DESC` (newest first).

```sql
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
      a.email,
      a.created_at,
      coalesce(gc.slots_purchased, 0) as slots_purchased,
      coalesce(gc.granted_free, false) as granted_free
    from public.users u
    join auth.users a on a.id = u.id
    left join public.group_credits gc on gc.user_id = u.id
    order by a.created_at desc;
end;
$$;
```

## UsersTab Component

### Stat Cards (row of 3)

| Card | Value |
|---|---|
| Total usuarios | `data.length` |
| Usuarios pagadores | `data.filter(u => u.slots_purchased > 0).length` |
| Accesos gratuitos | `data.filter(u => u.granted_free).length` |

Dark themed cards matching app style (`bg-card border border-line rounded-xl`).

### User Table

Columns: Avatar + Name, Email, Registro (formatted date), Pagador (✓ badge or —).

- Avatar: 32×32 rounded circle, fallback initials if `avatar_url` is null
- Pagador badge: small `bg-accent/10 text-accent` pill showing "Pagador" if `slots_purchased > 0`, "Gratuito" if `granted_free`, dash otherwise
- Date: formatted as `DD MMM YYYY` using `toLocaleDateString('es-MX')`
- Empty state: "No hay usuarios registrados" if list is empty

### Loading / Error States

- Loading: same skeleton pattern used elsewhere (`text-gray-600 text-sm font-bold uppercase tracking-widest`)
- Error: red error message inline

## Styling

Consistent with existing admin tabs — dark theme, `bg-bg`, `font-display` headings, `text-gray-400` secondary text.
