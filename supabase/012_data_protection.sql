-- ============================================================
-- 012_data_protection.sql
-- Safeguards to prevent accidental deletion of user data.
-- These triggers block destructive operations on matches and
-- groups once users have data attached to them.
-- ============================================================

-- -----------------------------------------------------------------
-- 1. Block deletion of a match that has user predictions attached
-- -----------------------------------------------------------------
-- Why: matches → (group_stage_predictions, knockout_predictions,
--                  match_results) are all ON DELETE CASCADE.
-- Deleting a match silently wipes every user's picks for that game.
create or replace function public.protect_match_delete()
returns trigger language plpgsql as $$
declare
  prediction_count int;
begin
  select count(*) into prediction_count
  from (
    select 1 from public.group_stage_predictions where match_id = old.id
    union all
    select 1 from public.knockout_predictions    where match_id = old.id
  ) sub;

  if prediction_count > 0 then
    raise exception
      'Cannot delete match % — it has % prediction(s) attached. '
      'Remove predictions first or use UPDATE instead.',
      old.id, prediction_count;
  end if;

  return old;
end;
$$;

drop trigger if exists trg_protect_match_delete on public.matches;
create trigger trg_protect_match_delete
  before delete on public.matches
  for each row execute function public.protect_match_delete();


-- -----------------------------------------------------------------
-- 2. Block deletion of a group that has members (other than creator)
-- -----------------------------------------------------------------
-- Why: groups → group_members, leaderboard_group are ON DELETE CASCADE.
-- Deleting a group removes all member associations and scores.
create or replace function public.protect_group_delete()
returns trigger language plpgsql as $$
declare
  member_count int;
begin
  select count(*) into member_count
  from public.group_members
  where group_id = old.id
    and user_id != old.created_by;

  if member_count > 0 then
    raise exception
      'Cannot delete group "%" — it has % member(s) besides the creator. '
      'Remove members first.',
      old.name, member_count;
  end if;

  return old;
end;
$$;

drop trigger if exists trg_protect_group_delete on public.groups;
create trigger trg_protect_group_delete
  before delete on public.groups
  for each row execute function public.protect_group_delete();


-- -----------------------------------------------------------------
-- 3. Prevent truncating prediction tables (extra safety net)
-- -----------------------------------------------------------------
-- Supabase doesn't expose TRUNCATE in the dashboard by default,
-- but this makes it explicit that these tables must not be wiped.
-- Note: Postgres triggers cannot block TRUNCATE the same way, but
-- the RLS policies already prevent non-admin access.
-- This comment serves as documentation for future migrations.

-- Tables that MUST NOT be truncated or have rows deleted in bulk:
--   public.group_stage_predictions   (user match picks)
--   public.group_advancement_predictions (user group picks)
--   public.knockout_predictions       (user knockout picks)
--   public.group_members              (group participation)
--   public.group_credits              (paid/granted access)
