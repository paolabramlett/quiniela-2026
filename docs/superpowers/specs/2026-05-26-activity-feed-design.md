# Group Activity Feed Design

## Goal

Show a live social feed of group activity — who joined, who's on a streak, who moved up or down in the rankings. Appears in two places: inside each group (per-group tab) and in a global feed tab aggregating activity across all the user's groups.

## Event Types

| Event | Trigger | Display |
|---|---|---|
| `joined` | User joins a group | "👋 **Paola** se unió al grupo" |
| `rank_up` | User's group rank improves after a match result | "📈 **Juan** subió al lugar #2" |
| `rank_down` | User's group rank drops after a match result | "📉 **Carlos** bajó al lugar #5" |
| `correct_streak` | User gets 3+ predictions correct in a row | "🔥 **Paola** acertó 3 seguidos" |
| `prediction_complete` | User completes all predictions for the current phase | "✅ **Ana** completó sus quinielas" |

Feed shows last 7 days of events. Loads on page open — no auto-refresh, no polling.

## Data Model

### `group_activity`

```sql
create table group_activity (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_type  text not null check (event_type in ('joined','rank_up','rank_down','correct_streak','prediction_complete')),
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index on group_activity(group_id, created_at desc);
create index on group_activity(user_id, created_at desc);
```

**Payload shape by event type:**
- `joined`: `{}`
- `rank_up`: `{ "old_rank": 4, "new_rank": 2 }`
- `rank_down`: `{ "old_rank": 2, "new_rank": 5 }`
- `correct_streak`: `{ "streak": 3 }`
- `prediction_complete`: `{ "phase": "group_stage" }`

### `rank_snapshots`

Stores the last known group rank per user, used to detect rank changes between match results.

```sql
create table rank_snapshots (
  group_id    uuid not null references groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rank        integer not null,
  captured_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
```

## Backend Functions

### `joined` events — DB trigger

A trigger on `group_members INSERT` writes a `joined` event automatically:

```sql
create or replace function trg_group_member_joined()
returns trigger language plpgsql security definer as $$
begin
  insert into group_activity(group_id, user_id, event_type, payload)
  values (new.group_id, new.user_id, 'joined', '{}');
  return new;
end;
$$;

create trigger on_group_member_joined
  after insert on group_members
  for each row execute function trg_group_member_joined();
```

### `generate_match_activity(p_match_id uuid)` — RPC

Called by the admin after entering a match result. Runs inside a transaction:

1. For each group containing members who predicted this match:
   - Read current ranks from `leaderboard_group`
   - Compare to `rank_snapshots`; write `rank_up` / `rank_down` events for members whose rank changed
   - Update `rank_snapshots` with new ranks
   - For each member who predicted correctly: check their last N predictions; if 3+ consecutive correct, write `correct_streak` event (only once per streak: the function only writes this event if the prediction immediately before the streak started was incorrect or absent, ensuring each streak is recorded exactly once at the moment it reaches 3)
   - For each member who just completed all predictions for the active phase, write `prediction_complete` event

**Rank change skipping:** if a user has no prior entry in `rank_snapshots`, skip their rank event on this run (no baseline to compare). They'll get events from the next match result onward.

**Transaction safety:** the entire function runs in a single transaction. If anything fails, no partial events are written.

### `get_group_activity(p_group_id uuid)` — RPC

Returns the last 7 days of events for one group, joined with user display names and avatars. Auth guard: caller must be a member of the group.

```sql
-- Returns rows shaped as:
{
  id, group_id, event_type, payload, created_at,
  actor_display_name, actor_avatar_url
}
```

### `get_my_feed(p_user_id uuid)` — RPC

Returns the last 7 days of events across all groups the caller belongs to, with `group_name` included. Auth guard: `auth.uid() = p_user_id`.

```sql
-- Returns rows shaped as:
{
  id, group_id, group_name, event_type, payload, created_at,
  actor_display_name, actor_avatar_url
}
```

## Frontend

### New Files

| File | Responsibility |
|---|---|
| `src/components/Activity/ActivityFeed.jsx` | Renders a list of `ActivityEvent` rows; accepts `events`, `loading`, optional `showGroupName` prop |
| `src/components/Activity/ActivityEvent.jsx` | Single event row: avatar, formatted text, relative timestamp |
| `src/hooks/useGroupActivity.js` | Calls `get_group_activity(groupId)`, returns `{ events, loading, error }` |
| `src/hooks/useFeed.js` | Calls `get_my_feed(userId)`, returns `{ events, loading, error }` |
| `src/pages/FeedPage.jsx` | Full-page global feed using `useFeed`; added to main nav |

### Modified Files

| File | Change |
|---|---|
| `src/components/Groups/GroupLeaderboard.jsx` | Adds "Actividad" tab alongside member list; uses `useGroupActivity` |
| `src/App.jsx` (or router) | Adds `/feed` route pointing to `FeedPage` |
| Bottom nav component | Adds Feed icon/tab (between Grupos and last tab) |

### ActivityEvent text rendering

Each event type maps to a Spanish string:

```js
function eventText(event) {
  const name = event.actor_display_name ?? 'Alguien'
  switch (event.event_type) {
    case 'joined':              return `👋 ${name} se unió al grupo`
    case 'rank_up':             return `📈 ${name} subió al lugar #${event.payload.new_rank}`
    case 'rank_down':           return `📉 ${name} bajó al lugar #${event.payload.new_rank}`
    case 'correct_streak':      return `🔥 ${name} acertó ${event.payload.streak} seguidos`
    case 'prediction_complete': return `✅ ${name} completó sus quinielas`
    default:                    return `${name} hizo algo`
  }
}
```

Timestamps displayed as relative time ("hace 2 horas", "ayer") using `date-fns/formatDistanceToNow` with `es` locale — already used in the project.

### Empty & error states

- `ActivityFeed` shows "Sin actividad reciente" when `events` is empty
- On fetch error, shows nothing (silent fail) — feed is non-critical and should not break the group view
- Loading state: simple spinner matching existing patterns

## Admin Workflow

After entering a match result in Supabase, the admin calls:

```js
await supabase.rpc('generate_match_activity', { p_match_id: '<uuid>' })
```

This is the same manual step as today's result entry. The admin panel (or a simple script) can expose this as a button alongside result entry.

## Testing

- `ActivityEvent` renders correct text for all 5 event types
- `ActivityFeed` renders empty state when events array is empty
- `useGroupActivity` / `useFeed` — mocked RPC, loading and error states
- `GroupLeaderboard` renders "Actividad" tab without regression on member list
- `generate_match_activity` SQL function — verified in dev against a group with known before/after ranks
