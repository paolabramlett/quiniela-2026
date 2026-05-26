# Post-Match Recap Design

## Goal

Show users how their recent predictions did, directly on the Dashboard, without navigating anywhere. Increases engagement by giving users a reason to open the app after every match.

## Placement

New section on `Dashboard.jsx`, positioned **between** the "Próximo Cierre" card and the leaderboard section.

## What It Shows

The last **3** completed matches the user made a prediction on, in reverse chronological order (newest first). If fewer than 3 exist, show however many are available. If the user has no predictions on any completed match, the section is hidden entirely.

Each row is a single compact line:

```
🇲🇽 2 — 0 🇿🇦  ·  Grupo A  ·  Tu pick: México   ✓ ACERTASTE
🇦🇷 1 — 1 🇨🇦  ·  Grupo B  ·  Tu pick: Argentina  ✗ FALLASTE
```

Section heading: **"Últimos Resultados"** (same style as other Dashboard section labels).

## Row Content

| Field | Source |
|---|---|
| Home flag + score + away flag | `matches` + `match_results` |
| Phase/group label | `matches.phase`, `matches.group_letter` |
| User's pick label | `group_stage_predictions.prediction` or `knockout_predictions.predicted_winner` |
| ✓ / ✗ badge | Computed: did prediction match result? |

**Correct prediction logic:**
- Group stage: `prediction` (`home`/`draw`/`away`) matches `match_results.result`
- Knockout: `predicted_winner` matches `match_results.winner_team`

**Badge styles:**
- ✓ ACERTASTE — `text-accent` (teal), small rounded pill
- ✗ FALLASTE — `text-danger` (red), same pill style
- No prediction made for a match — that match is skipped (not shown)

## Data Query

New custom hook `useRecentResults` (or inline query in Dashboard):

```js
// Fetch last 3 completed matches the user predicted on
// Joins: matches + match_results + group_stage_predictions (or knockout_predictions)
// Filter: match_results exists (match is complete)
// Filter: user has a prediction for the match
// Order: kickoff_at DESC
// Limit: 3
```

Two sub-queries (one per prediction table), merged and sorted client-side, then sliced to 3.

Alternatively, a single Supabase RPC `get_recent_results(p_user_id)` that does the join server-side and returns the 3 rows directly. **Recommended** — avoids multiple round trips and keeps Dashboard.jsx clean.

## New Files

- `src/hooks/useRecentResults.js` — fetches the 3 rows, returns `{ results, loading }`
- `src/components/Dashboard/RecentResults.jsx` — renders the section (heading + rows)
- `supabase/015_recent_results_function.sql` — `get_recent_results(p_user_id uuid)` RPC

## Modified Files

- `src/components/Dashboard/Dashboard.jsx` — import and render `<RecentResults />` between Próximo Cierre and leaderboard

## RPC Function Signature

```sql
create or replace function public.get_recent_results(p_user_id uuid)
returns table(
  match_id      uuid,
  home_team     text,
  away_team     text,
  home_score    int,
  away_score    int,
  phase         text,
  group_letter  text,
  result        text,       -- 'home' | 'draw' | 'away' | null (knockout)
  winner_team   text,       -- null for group stage
  user_pick     text,       -- prediction value or team name
  is_correct    boolean,
  kicked_off_at timestamptz
)
language plpgsql
security definer
set search_path = public
```

Returns rows ordered by `kicked_off_at DESC`, limit 3. Only matches where `match_results` exists AND user has a prediction are included.

## Row Component

```
[flag] [score] [flag]  ·  [phase label]  ·  Tu pick: [pick]   [badge]
```

- Flags via existing `getFlag()` utility
- Score: `home_score — away_score`
- Phase label: same `PHASE_LABELS` map already used in the app (`Grupo A`, `Octavos de Final`, etc.)
- Pick label: for group stage picks (`home`/`draw`/`away`), translate to team name or "Empate"; for knockout, use the team name directly
- Badge: pill — teal ✓ ACERTASTE or red ✗ FALLASTE

## Empty / Loading States

- Loading: subtle skeleton or nothing (section simply absent until data loads)
- No results yet: section hidden (no "nothing here" message needed on Dashboard)

## Styling

Consistent with existing Dashboard cards: `bg-card border border-line rounded-2xl`. Each result row is a `flex` row with `gap-2`, `py-2.5`, separated by a subtle `border-b border-line` except the last.
