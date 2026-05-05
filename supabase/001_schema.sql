-- Enums
create type match_phase as enum ('group_stage', 'r16', 'qf', 'sf', 'final');
create type match_status as enum ('scheduled', 'in_progress', 'finished');
create type group_result as enum ('home', 'draw', 'away');

-- Users (extends auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Matches
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  phase match_phase not null,
  group_letter char(1),
  home_team text not null,
  away_team text not null,
  kickoff_at timestamptz not null,
  status match_status not null default 'scheduled',
  constraint group_letter_required check (
    (phase = 'group_stage' and group_letter is not null) or
    (phase != 'group_stage' and group_letter is null)
  )
);

-- Group stage per-match predictions
create table public.group_stage_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  prediction group_result not null,
  locked_at timestamptz,
  created_at timestamptz default now(),
  constraint unique_user_match unique (user_id, match_id)
);

-- Group advancement predictions
create table public.group_advancement_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  group_letter char(1) not null,
  team_1 text not null,
  team_2 text not null,
  locked_at timestamptz,
  created_at timestamptz default now(),
  constraint unique_user_group unique (user_id, group_letter)
);

-- Knockout predictions
create table public.knockout_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  predicted_winner text not null,
  locked_at timestamptz,
  created_at timestamptz default now(),
  constraint unique_user_knockout_match unique (user_id, match_id)
);

-- Match results (entered by admin)
create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  result group_result,              -- group stage only
  winner_team text,                 -- knockout only
  entered_by uuid references public.users(id),
  entered_at timestamptz default now(),
  constraint result_xor_winner check (
    (result is not null and winner_team is null) or
    (result is null and winner_team is not null)
  )
);

-- Group advancement results (entered by admin)
create table public.group_advancement_results (
  group_letter char(1) primary key,
  team_1 text not null,
  team_2 text not null,
  entered_by uuid references public.users(id),
  entered_at timestamptz default now()
);

-- Friend groups
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code char(6) not null unique,
  created_by uuid not null references public.users(id),
  max_members int,                  -- null = unlimited
  created_at timestamptz default now()
);

-- Group membership
create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- Prediction scores (source of truth for points)
create table public.prediction_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  prediction_type text not null, -- 'match_result' | 'advancement' | 'knockout'
  reference_id text not null,    -- match_id (uuid) or group_letter
  points int not null,
  scored_at timestamptz default now(),
  constraint unique_prediction_score unique (user_id, prediction_type, reference_id)
);

-- Global leaderboard (denormalized)
create table public.leaderboard_global (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  total_points int not null default 0,
  correct_predictions int not null default 0,
  rank int,
  updated_at timestamptz default now()
);

-- Group leaderboard (denormalized)
create table public.leaderboard_group (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  total_points int not null default 0,
  correct_predictions int not null default 0,
  rank int,
  updated_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- Admin whitelist
create table public.admin_whitelist (
  email text primary key
);
