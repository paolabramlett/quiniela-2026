-- Allow group creator to remove any member from their group
create policy "gm_delete_by_creator" on public.group_members for delete
using (
  exists (
    select 1 from public.groups
    where groups.id = group_members.group_id
      and groups.created_by = auth.uid()
  )
);
