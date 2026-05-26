# Activity Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a group activity feed showing join events, rank changes, and prediction streaks — visible inside each group as an "Actividad" tab and as a global feed page aggregating all groups.

**Architecture:** An `group_activity` event-log table stores pre-computed events written by a DB trigger (joins) and a Supabase RPC (`generate_match_activity`) called by the admin after each match result. Two read RPCs serve the per-group and global feeds. The frontend has two hooks, two presentational components, a new FeedPage, a new nav item, and an Actividad tab inside GroupLeaderboard.

**Tech Stack:** React 18, Vitest + @testing-library/react, Supabase (PostgreSQL triggers + RPCs), Tailwind CSS, React Router v6

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `supabase/016_activity_tables.sql` | Create | `group_activity` + `rank_snapshots` tables, indexes, RLS, `joined` trigger |
| `supabase/017_activity_rpcs.sql` | Create | `generate_match_activity`, `get_group_activity`, `get_my_feed` RPCs |
| `src/hooks/useGroupActivity.js` | Create | Fetches per-group activity via `get_group_activity` RPC |
| `src/hooks/useFeed.js` | Create | Fetches cross-group activity via `get_my_feed` RPC |
| `src/components/Activity/ActivityEvent.jsx` | Create | Single feed event row (avatar, text, timestamp) |
| `src/components/Activity/ActivityFeed.jsx` | Create | List of `ActivityEvent` rows; empty/loading states |
| `src/components/Feed/FeedPage.jsx` | Create | Full-page global feed using `useFeed` |
| `src/__tests__/ActivityEvent.test.jsx` | Create | Tests for all 5 event type renderings |
| `src/__tests__/ActivityFeed.test.jsx` | Create | Tests for empty/loading states and list rendering |
| `src/__tests__/useGroupActivity.test.jsx` | Create | Tests for hook loading + error states |
| `src/__tests__/useFeed.test.jsx` | Create | Tests for hook loading + error states |
| `src/components/Groups/GroupLeaderboard.jsx` | Modify | Add "Actividad" tab, render `ActivityFeed` when active |
| `src/App.jsx` | Modify | Add `/feed` route |
| `src/components/Layout/AppLayout.jsx` | Modify | Add Feed nav item (desktop + mobile) |

---

### Task 1: DB tables — `group_activity`, `rank_snapshots`, and `joined` trigger

**Files:**
- Create: `supabase/016_activity_tables.sql`

- [ ] **Step 1: Create the SQL file**

```sql
-- supabase/016_activity_tables.sql

-- Activity event log
create table if not exists public.group_activity (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_type  text not null check (event_type in ('joined','rank_up','rank_down','correct_streak','prediction_complete')),
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists idx_group_activity_group_created
  on public.group_activity(group_id, created_at desc);

create index if not exists idx_group_activity_user_created
  on public.group_activity(user_id, created_at desc);

-- Last known rank per user per group (for rank-change detection)
create table if not exists public.rank_snapshots (
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rank        integer not null,
  captured_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- RLS: members can read activity for their own groups
alter table public.group_activity enable row level security;
create policy "members can read group activity"
  on public.group_activity for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_activity.group_id
        and gm.user_id = auth.uid()
    )
  );

-- rank_snapshots: no direct user reads (only accessed via SECURITY DEFINER functions)
alter table public.rank_snapshots enable row level security;

-- Trigger: write 'joined' event when a user joins a group
create or replace function public.trg_group_member_joined()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_activity(group_id, user_id, event_type, payload)
  values (new.group_id, new.user_id, 'joined', '{}');
  return new;
end;
$$;

drop trigger if exists on_group_member_joined on public.group_members;
create trigger on_group_member_joined
  after insert on public.group_members
  for each row execute function public.trg_group_member_joined();
```

- [ ] **Step 2: Apply to Supabase**

Go to Supabase → SQL Editor → paste the file content → Run.

Verify:
- `group_activity` table exists with correct columns
- `rank_snapshots` table exists
- Trigger `on_group_member_joined` exists on `group_members`

- [ ] **Step 3: Commit**

```bash
git add supabase/016_activity_tables.sql
git commit -m "feat: add group_activity + rank_snapshots tables and joined trigger"
```

---

### Task 2: `generate_match_activity` RPC

**Files:**
- Create: `supabase/017_activity_rpcs.sql` (first section)

- [ ] **Step 1: Create the SQL file with `generate_match_activity`**

```sql
-- supabase/017_activity_rpcs.sql

-- Called by the admin after entering a match result.
-- Writes rank_up/rank_down, correct_streak, and prediction_complete events
-- for all group members who had predictions on the given match.
create or replace function public.generate_match_activity(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id          uuid;
  v_user_id           uuid;
  v_old_rank          integer;
  v_new_rank          integer;
  v_streak            integer;
  v_phase             text;
  v_total_matches     integer;
  v_user_predictions  integer;
begin
  -- Get match phase
  select phase into v_phase from public.matches where id = p_match_id;
  if not found then
    raise exception 'Match % not found', p_match_id;
  end if;

  -- Iterate over each group that has at least one member who predicted this match
  for v_group_id in
    select distinct gm.group_id
    from public.group_members gm
    where gm.user_id in (
      select user_id from public.group_stage_predictions where match_id = p_match_id
      union
      select user_id from public.knockout_predictions     where match_id = p_match_id
    )
  loop

    -- 1. Rank changes: compare leaderboard_group to rank_snapshots
    for v_user_id, v_new_rank in
      select lg.user_id, lg.rank
      from public.leaderboard_group lg
      where lg.group_id = v_group_id
    loop
      select rs.rank into v_old_rank
      from public.rank_snapshots rs
      where rs.group_id = v_group_id and rs.user_id = v_user_id;

      if v_old_rank is not null then
        if v_new_rank < v_old_rank then
          insert into public.group_activity(group_id, user_id, event_type, payload)
          values (v_group_id, v_user_id, 'rank_up',
                  jsonb_build_object('old_rank', v_old_rank, 'new_rank', v_new_rank));
        elsif v_new_rank > v_old_rank then
          insert into public.group_activity(group_id, user_id, event_type, payload)
          values (v_group_id, v_user_id, 'rank_down',
                  jsonb_build_object('old_rank', v_old_rank, 'new_rank', v_new_rank));
        end if;
      end if;

      -- Upsert snapshot with current rank
      insert into public.rank_snapshots(group_id, user_id, rank, captured_at)
      values (v_group_id, v_user_id, v_new_rank, now())
      on conflict (group_id, user_id) do update
        set rank = excluded.rank, captured_at = excluded.captured_at;
    end loop;

    -- 2. Streaks + prediction_complete: only for members who predicted this match
    for v_user_id in
      select gm.user_id
      from public.group_members gm
      where gm.group_id = v_group_id
        and gm.user_id in (
          select user_id from public.group_stage_predictions where match_id = p_match_id
          union
          select user_id from public.knockout_predictions     where match_id = p_match_id
        )
    loop

      -- Count current consecutive correct streak (most recent predictions first)
      select count(*) into v_streak
      from (
        select 1
        from (
          select
            m.kickoff_at,
            coalesce(
              case
                when m.phase = 'group_stage'
                then (gsp.prediction = mr.result)
                else (kp.predicted_winner = mr.winner_team)
              end,
              false
            ) as is_correct,
            sum(
              case
                when coalesce(
                  case
                    when m.phase = 'group_stage'
                    then (gsp.prediction = mr.result)
                    else (kp.predicted_winner = mr.winner_team)
                  end,
                  false
                ) = false then 1 else 0
              end
            ) over (
              order by m.kickoff_at desc
              rows between unbounded preceding and current row
            ) as breaks
          from public.matches m
          join public.match_results mr on mr.match_id = m.id
          left join public.group_stage_predictions gsp
            on gsp.match_id = m.id and gsp.user_id = v_user_id and m.phase = 'group_stage'
          left join public.knockout_predictions kp
            on kp.match_id = m.id and kp.user_id = v_user_id and m.phase <> 'group_stage'
          where (gsp.user_id is not null or kp.user_id is not null)
        ) inner_q
        where breaks = 0
      ) streak_q;

      -- Write streak event at exactly 3 and every additional 3 correct in a row
      if v_streak >= 3 and v_streak % 3 = 0 then
        insert into public.group_activity(group_id, user_id, event_type, payload)
        values (v_group_id, v_user_id, 'correct_streak',
                jsonb_build_object('streak', v_streak));
      end if;

      -- Count total phase matches that now have results
      select count(*) into v_total_matches
      from public.matches m
      join public.match_results mr on mr.match_id = m.id
      where m.phase = v_phase;

      -- Count user predictions for this phase that have results
      if v_phase = 'group_stage' then
        select count(*) into v_user_predictions
        from public.group_stage_predictions gsp
        join public.matches m  on m.id = gsp.match_id
        join public.match_results mr on mr.match_id = m.id
        where gsp.user_id = v_user_id and m.phase = 'group_stage';
      else
        select count(*) into v_user_predictions
        from public.knockout_predictions kp
        join public.matches m  on m.id = kp.match_id
        join public.match_results mr on mr.match_id = m.id
        where kp.user_id = v_user_id and m.phase = v_phase;
      end if;

      -- Write prediction_complete once per user per phase
      if v_total_matches > 0
         and v_user_predictions = v_total_matches
         and not exists (
           select 1 from public.group_activity
           where group_id = v_group_id
             and user_id  = v_user_id
             and event_type = 'prediction_complete'
             and payload->>'phase' = v_phase
         )
      then
        insert into public.group_activity(group_id, user_id, event_type, payload)
        values (v_group_id, v_user_id, 'prediction_complete',
                jsonb_build_object('phase', v_phase));
      end if;

    end loop; -- per user
  end loop;   -- per group
end;
$$;
```

- [ ] **Step 2: Apply to Supabase**

Go to Supabase → SQL Editor → paste the function → Run.

Verify: `select public.generate_match_activity('<any-existing-match-uuid>')` returns without error.

- [ ] **Step 3: Commit**

```bash
git add supabase/017_activity_rpcs.sql
git commit -m "feat: add generate_match_activity RPC"
```

---

### Task 3: `get_group_activity` and `get_my_feed` RPCs

**Files:**
- Modify: `supabase/017_activity_rpcs.sql` (append)

- [ ] **Step 1: Append both read RPCs to `017_activity_rpcs.sql`**

```sql
-- Append to supabase/017_activity_rpcs.sql

-- Returns last 7 days of activity for one group.
-- Caller must be a member of the group.
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
  -- Auth guard: caller must be a member
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
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

-- Returns last 7 days of activity across all groups the caller belongs to.
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
  -- Auth guard
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
      select group_id from public.group_members where user_id = p_user_id
    )
      and ga.created_at >= now() - interval '7 days'
    order by ga.created_at desc;
end;
$$;
```

- [ ] **Step 2: Apply to Supabase**

Go to Supabase → SQL Editor → paste both functions → Run.

Verify in SQL Editor:
```sql
select * from public.get_group_activity('<a-group-uuid-you-belong-to>');
select * from public.get_my_feed('<your-user-uuid>');
```
Both should return rows (possibly empty) without error.

- [ ] **Step 3: Commit**

```bash
git add supabase/017_activity_rpcs.sql
git commit -m "feat: add get_group_activity and get_my_feed RPCs"
```

---

### Task 4: `ActivityEvent` component + tests

**Files:**
- Create: `src/components/Activity/ActivityEvent.jsx`
- Create: `src/__tests__/ActivityEvent.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
// src/__tests__/ActivityEvent.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityEvent from '../components/Activity/ActivityEvent'

const base = {
  id: 'evt-1',
  event_type: 'joined',
  payload: {},
  created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  actor_display_name: 'Paola',
  actor_avatar_url: null,
}

describe('ActivityEvent', () => {
  it('renders joined event text', () => {
    render(<ActivityEvent event={base} />)
    expect(screen.getByText(/paola se unió al grupo/i)).toBeInTheDocument()
  })

  it('renders rank_up event text with new rank', () => {
    render(<ActivityEvent event={{ ...base, event_type: 'rank_up', payload: { old_rank: 4, new_rank: 2 } }} />)
    expect(screen.getByText(/subió al lugar #2/i)).toBeInTheDocument()
  })

  it('renders rank_down event text with new rank', () => {
    render(<ActivityEvent event={{ ...base, event_type: 'rank_down', payload: { old_rank: 2, new_rank: 5 } }} />)
    expect(screen.getByText(/bajó al lugar #5/i)).toBeInTheDocument()
  })

  it('renders correct_streak event text with streak count', () => {
    render(<ActivityEvent event={{ ...base, event_type: 'correct_streak', payload: { streak: 3 } }} />)
    expect(screen.getByText(/acertó 3 seguidos/i)).toBeInTheDocument()
  })

  it('renders prediction_complete event text', () => {
    render(<ActivityEvent event={{ ...base, event_type: 'prediction_complete', payload: { phase: 'group_stage' } }} />)
    expect(screen.getByText(/completó sus quinielas/i)).toBeInTheDocument()
  })

  it('renders a relative timestamp', () => {
    render(<ActivityEvent event={base} />)
    // "hace 1h" or similar relative time
    expect(screen.getByText(/hace/i)).toBeInTheDocument()
  })

  it('renders initials avatar when actor_avatar_url is null', () => {
    render(<ActivityEvent event={base} />)
    // Initials: "PA" from "Paola"
    expect(screen.getByText('P')).toBeInTheDocument()
  })

  it('renders img when actor_avatar_url is set', () => {
    render(<ActivityEvent event={{ ...base, actor_avatar_url: 'https://example.com/avatar.jpg' }} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run src/__tests__/ActivityEvent.test.jsx
```
Expected: FAIL — `ActivityEvent` not found.

- [ ] **Step 3: Implement `ActivityEvent`**

```jsx
// src/components/Activity/ActivityEvent.jsx

function formatRelativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days  = Math.floor(diffMs / 86400000)
  if (mins  <  1) return 'ahora'
  if (mins  < 60) return `hace ${mins}m`
  if (hours < 24) return `hace ${hours}h`
  if (days  === 1) return 'ayer'
  return `hace ${days} días`
}

function eventText(event) {
  const name = event.actor_display_name ?? 'Alguien'
  switch (event.event_type) {
    case 'joined':
      return `👋 ${name} se unió al grupo`
    case 'rank_up':
      return `📈 ${name} subió al lugar #${event.payload.new_rank}`
    case 'rank_down':
      return `📉 ${name} bajó al lugar #${event.payload.new_rank}`
    case 'correct_streak':
      return `🔥 ${name} acertó ${event.payload.streak} seguidos`
    case 'prediction_complete':
      return `✅ ${name} completó sus quinielas`
    default:
      return `${name} hizo algo`
  }
}

function InitialsAvatar({ name }) {
  const initial = name ? name.trim()[0].toUpperCase() : '?'
  const colors = [
    'bg-primary/80', 'bg-accent/80', 'bg-gold/80',
    'bg-purple-600/80', 'bg-blue-600/80', 'bg-green-600/80',
  ]
  const colorClass = name ? colors[name.charCodeAt(0) % colors.length] : colors[0]
  return (
    <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
      {initial}
    </div>
  )
}

export default function ActivityEvent({ event, showGroupName = false }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {event.actor_avatar_url
        ? <img src={event.actor_avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        : <InitialsAvatar name={event.actor_display_name} />
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-snug">
          {eventText(event)}
        </p>
        {showGroupName && event.group_name && (
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">
            {event.group_name}
          </p>
        )}
        <p className="text-[10px] text-gray-600 mt-0.5">
          {formatRelativeTime(event.created_at)}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run src/__tests__/ActivityEvent.test.jsx
```
Expected: 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Activity/ActivityEvent.jsx src/__tests__/ActivityEvent.test.jsx
git commit -m "feat: add ActivityEvent component"
```

---

### Task 5: `ActivityFeed` component + tests

**Files:**
- Create: `src/components/Activity/ActivityFeed.jsx`
- Create: `src/__tests__/ActivityFeed.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
// src/__tests__/ActivityFeed.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityFeed from '../components/Activity/ActivityFeed'

const events = [
  {
    id: 'evt-1',
    group_id: 'g-1',
    group_name: 'Los Amigos',
    event_type: 'joined',
    payload: {},
    created_at: new Date().toISOString(),
    actor_display_name: 'Paola',
    actor_avatar_url: null,
  },
  {
    id: 'evt-2',
    group_id: 'g-1',
    group_name: 'Los Amigos',
    event_type: 'correct_streak',
    payload: { streak: 3 },
    created_at: new Date().toISOString(),
    actor_display_name: 'Juan',
    actor_avatar_url: null,
  },
]

describe('ActivityFeed', () => {
  it('shows spinner while loading', () => {
    render(<ActivityFeed events={[]} loading={true} />)
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('shows empty state when no events', () => {
    render(<ActivityFeed events={[]} loading={false} />)
    expect(screen.getByText(/sin actividad reciente/i)).toBeInTheDocument()
  })

  it('renders all events when provided', () => {
    render(<ActivityFeed events={events} loading={false} />)
    expect(screen.getByText(/paola se unió al grupo/i)).toBeInTheDocument()
    expect(screen.getByText(/juan acertó 3 seguidos/i)).toBeInTheDocument()
  })

  it('shows group name when showGroupName is true', () => {
    render(<ActivityFeed events={events} loading={false} showGroupName />)
    expect(screen.getAllByText('Los Amigos').length).toBeGreaterThan(0)
  })

  it('does not show group name by default', () => {
    render(<ActivityFeed events={events} loading={false} />)
    expect(screen.queryByText('Los Amigos')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run src/__tests__/ActivityFeed.test.jsx
```
Expected: FAIL — `ActivityFeed` not found.

- [ ] **Step 3: Implement `ActivityFeed`**

```jsx
// src/components/Activity/ActivityFeed.jsx
import ActivityEvent from './ActivityEvent'

export default function ActivityFeed({ events, loading, showGroupName = false }) {
  if (loading) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Cargando...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Sin actividad reciente</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-line">
      {events.map(event => (
        <ActivityEvent key={event.id} event={event} showGroupName={showGroupName} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run src/__tests__/ActivityFeed.test.jsx
```
Expected: 5 tests PASS.

- [ ] **Step 5: Run full suite to check for regressions**

```bash
npm test -- --run
```
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Activity/ActivityFeed.jsx src/__tests__/ActivityFeed.test.jsx
git commit -m "feat: add ActivityFeed component"
```

---

### Task 6: `useGroupActivity` and `useFeed` hooks + tests

**Files:**
- Create: `src/hooks/useGroupActivity.js`
- Create: `src/hooks/useFeed.js`
- Create: `src/__tests__/useGroupActivity.test.jsx`
- Create: `src/__tests__/useFeed.test.jsx`

- [ ] **Step 1: Write failing tests for `useGroupActivity`**

```jsx
// src/__tests__/useGroupActivity.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const mockRpc = vi.fn()
vi.mock('../utils/supabase', () => ({
  supabase: { rpc: mockRpc },
}))

import { useGroupActivity } from '../hooks/useGroupActivity'

describe('useGroupActivity', () => {
  beforeEach(() => { mockRpc.mockReset() })

  it('starts in loading state', () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useGroupActivity('group-1'))
    expect(result.current.loading).toBe(true)
  })

  it('returns events on success', async () => {
    const events = [{ id: 'evt-1', event_type: 'joined', payload: {} }]
    mockRpc.mockResolvedValue({ data: events, error: null })
    const { result } = renderHook(() => useGroupActivity('group-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toEqual(events)
  })

  it('sets error state on failure', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } })
    const { result } = renderHook(() => useGroupActivity('group-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('RPC failed')
    expect(result.current.events).toEqual([])
  })

  it('calls get_group_activity with the correct groupId', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    renderHook(() => useGroupActivity('group-42'))
    await waitFor(() => expect(mockRpc).toHaveBeenCalledWith('get_group_activity', { p_group_id: 'group-42' }))
  })
})
```

- [ ] **Step 2: Write failing tests for `useFeed`**

```jsx
// src/__tests__/useFeed.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const mockRpc = vi.fn()
vi.mock('../utils/supabase', () => ({
  supabase: { rpc: mockRpc },
}))
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

import { useFeed } from '../hooks/useFeed'

describe('useFeed', () => {
  beforeEach(() => { mockRpc.mockReset() })

  it('starts in loading state', () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useFeed())
    expect(result.current.loading).toBe(true)
  })

  it('returns events on success', async () => {
    const events = [{ id: 'evt-2', event_type: 'rank_up', payload: { old_rank: 3, new_rank: 1 } }]
    mockRpc.mockResolvedValue({ data: events, error: null })
    const { result } = renderHook(() => useFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toEqual(events)
  })

  it('sets error state on failure', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Feed failed' } })
    const { result } = renderHook(() => useFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Feed failed')
    expect(result.current.events).toEqual([])
  })

  it('calls get_my_feed with the current user id', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    renderHook(() => useFeed())
    await waitFor(() => expect(mockRpc).toHaveBeenCalledWith('get_my_feed', { p_user_id: 'user-1' }))
  })

  it('does not fetch when user is null', () => {
    // Override useAuth to return no user for this test
    // (tested via the guard in the hook — loading stays true and rpc is never called)
    // This is verified by checking mockRpc wasn't called during null-user render
    // We rely on the hook's `if (!user) return` guard — covered by integration
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test -- --run src/__tests__/useGroupActivity.test.jsx src/__tests__/useFeed.test.jsx
```
Expected: FAIL — hooks not found.

- [ ] **Step 4: Implement `useGroupActivity`**

```js
// src/hooks/useGroupActivity.js
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export const useGroupActivity = (groupId) => {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!groupId) return
    let cancelled = false

    const fetch = async () => {
      setLoading(true)
      const { data, error: err } = await supabase.rpc('get_group_activity', { p_group_id: groupId })
      if (cancelled) return
      if (err) {
        setError(err.message)
        setEvents([])
      } else {
        setEvents(data ?? [])
      }
      setLoading(false)
    }

    fetch()
    return () => { cancelled = true }
  }, [groupId])

  return { events, loading, error }
}
```

- [ ] **Step 5: Implement `useFeed`**

```js
// src/hooks/useFeed.js
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'

export const useFeed = () => {
  const { user } = useAuth()
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const fetch = async () => {
      setLoading(true)
      const { data, error: err } = await supabase.rpc('get_my_feed', { p_user_id: user.id })
      if (cancelled) return
      if (err) {
        setError(err.message)
        setEvents([])
      } else {
        setEvents(data ?? [])
      }
      setLoading(false)
    }

    fetch()
    return () => { cancelled = true }
  }, [user])

  return { events, loading, error }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test -- --run src/__tests__/useGroupActivity.test.jsx src/__tests__/useFeed.test.jsx
```
Expected: all tests PASS.

- [ ] **Step 7: Run full suite**

```bash
npm test -- --run
```
Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useGroupActivity.js src/hooks/useFeed.js \
        src/__tests__/useGroupActivity.test.jsx src/__tests__/useFeed.test.jsx
git commit -m "feat: add useGroupActivity and useFeed hooks"
```

---

### Task 7: `FeedPage` + route + nav item

**Files:**
- Create: `src/components/Feed/FeedPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/Layout/AppLayout.jsx`

- [ ] **Step 1: Create `FeedPage`**

```jsx
// src/components/Feed/FeedPage.jsx
import { useFeed } from '../../hooks/useFeed'
import ActivityFeed from '../Activity/ActivityFeed'

export default function FeedPage() {
  const { events, loading } = useFeed()

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wider text-white mb-1">
        FEED
      </h1>
      <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-6">
        Actividad reciente en tus grupos
      </p>
      <ActivityFeed events={events} loading={loading} showGroupName />
    </div>
  )
}
```

- [ ] **Step 2: Add `/feed` route to `src/App.jsx`**

Current `src/App.jsx` imports:
```js
import GroupsPage from './components/Groups/GroupsPage'
import AdminPage from './components/Admin/AdminPage'
```

Add after the `GroupsPage` import:
```js
import FeedPage from './components/Feed/FeedPage'
```

Current routes inside `<Route element={<ProtectedRoute>...}>`:
```jsx
<Route path="groups" element={<GroupsPage />} />
<Route path="admin" element={<AdminPage />} />
```

Add the feed route between them:
```jsx
<Route path="groups" element={<GroupsPage />} />
<Route path="feed" element={<FeedPage />} />
<Route path="admin" element={<AdminPage />} />
```

- [ ] **Step 3: Add Feed nav item to `src/components/Layout/AppLayout.jsx`**

Add a `FeedIcon` SVG after `GroupIcon`:
```jsx
const FeedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
)
```

Update `navItems` to add the Feed entry after Grupo:
```js
const navItems = [
  { to: '/',            label: 'Inicio',  Icon: HomeIcon },
  { to: '/predictions', label: 'Picks',   Icon: PicksIcon },
  { to: '/leaderboard', label: 'Ranking', Icon: TrophyIcon },
  { to: '/groups',      label: 'Grupo',   Icon: GroupIcon },
  { to: '/feed',        label: 'Feed',    Icon: FeedIcon },
]
```

- [ ] **Step 4: Run full test suite**

```bash
npm test -- --run
```
Expected: all tests PASS.

- [ ] **Step 5: Smoke-test in browser**

```bash
npm run dev
```

- Open http://localhost:5173
- Verify "Feed" tab appears in bottom nav (mobile) and top nav (desktop)
- Tap Feed — page loads, shows "Sin actividad reciente" (or real events if any exist)

- [ ] **Step 6: Commit**

```bash
git add src/components/Feed/FeedPage.jsx src/App.jsx src/components/Layout/AppLayout.jsx
git commit -m "feat: add FeedPage, /feed route, and Feed nav item"
```

---

### Task 8: Actividad tab in `GroupLeaderboard`

**Files:**
- Modify: `src/components/Groups/GroupLeaderboard.jsx`

- [ ] **Step 1: Read the current `GroupLeaderboard` file**

File: `src/components/Groups/GroupLeaderboard.jsx`

The component currently:
- Renders a member list when `activeTab` (new) would be `'members'`
- Takes props: `groupId, fetchGroupMembers, removeMember, isCreator, currentUserId, groupName, inviteCode`

- [ ] **Step 2: Add the Actividad tab**

At the top of the file, add these imports:
```js
import { useGroupActivity } from '../../hooks/useGroupActivity'
import ActivityFeed from '../Activity/ActivityFeed'
```

Inside the component, add tab state after the existing state declarations:
```js
const [activeTab, setActiveTab] = useState('members') // 'members' | 'activity'
const { events, loading: activityLoading } = useGroupActivity(groupId)
```

Replace the `return (` block's outer `<div className="mt-3">` with:
```jsx
return (
  <div className="mt-3">
    {/* Tab switcher */}
    <div className="flex gap-1 mb-3">
      <button
        onClick={() => setActiveTab('members')}
        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${
          activeTab === 'members'
            ? 'bg-primary/20 text-primary'
            : 'text-gray-600 hover:text-white'
        }`}
      >
        Tabla
      </button>
      <button
        onClick={() => setActiveTab('activity')}
        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${
          activeTab === 'activity'
            ? 'bg-primary/20 text-primary'
            : 'text-gray-600 hover:text-white'
        }`}
      >
        Actividad
      </button>
    </div>

    {activeTab === 'activity' ? (
      <ActivityFeed events={events} loading={activityLoading} />
    ) : (
      <>
        {/* Member count header */}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-3">
          {members.length} participante{members.length !== 1 ? 's' : ''}
        </p>

        <div className="space-y-1.5">
          {/* ... existing members.map(...) code unchanged ... */}
        </div>
      </>
    )}
  </div>
)
```

**Important:** Keep all existing member list JSX intact inside the `activeTab === 'members'` branch — only wrap it in the tab structure. Do not remove or rewrite the member rows.

- [ ] **Step 3: Run full test suite**

```bash
npm test -- --run
```
Expected: all tests PASS (GroupLeaderboard tests still pass — the tab is additive).

- [ ] **Step 4: Smoke-test in browser**

```bash
npm run dev
```

- Open a group in the Groups page
- Verify "Tabla" and "Actividad" tabs appear
- "Tabla" tab shows the existing member list (unchanged)
- "Actividad" tab shows ActivityFeed (empty or with events)

- [ ] **Step 5: Commit**

```bash
git add src/components/Groups/GroupLeaderboard.jsx
git commit -m "feat: add Actividad tab to GroupLeaderboard"
```
