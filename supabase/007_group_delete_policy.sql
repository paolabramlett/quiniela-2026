-- Allow group creator to delete their group (members cascade automatically)
create policy "groups_delete" on public.groups for delete using (created_by = auth.uid());

-- Allow members to remove themselves from a group
create policy "gm_delete" on public.group_members for delete using (user_id = auth.uid());
