-- supabase/010_group_credits.sql

-- Tracks group creation slots per user.
-- slots_purchased: total slots unlocked via Stripe OR admin grant.
-- granted_free: true when admin manually granted access (no payment).
-- Slots used = count of groups.created_by = user_id (computed in app).
-- Slots available = slots_purchased - slots_used.
-- Admin (checked by email in app) bypasses this table entirely.

create table public.group_credits (
  user_id uuid primary key references public.users(id) on delete cascade,
  slots_purchased int not null default 0 check (slots_purchased >= 0),
  granted_free boolean not null default false,
  updated_at timestamptz default now()
);

-- Users can only read their own row; writes come from edge functions (service role).
alter table public.group_credits enable row level security;

create policy "group_credits_read_own" on public.group_credits
  for select using (auth.uid() = user_id);
