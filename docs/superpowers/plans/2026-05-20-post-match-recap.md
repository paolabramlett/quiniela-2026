# Post-Match Recap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show users their last 3 completed match predictions on the Dashboard so they see how they did as soon as they open the app.

**Architecture:** A new Supabase RPC `get_recent_results(p_user_id)` does a server-side join of matches + results + predictions and returns up to 3 rows. A new `useRecentResults` hook calls the RPC. A new `RecentResults` component renders the section. Dashboard imports and renders `<RecentResults />` between the "Próximo Cierre" card and the quick actions grid.

**Tech Stack:** React 18, Supabase JS client (`supabase.rpc()`), Tailwind CSS, Vitest + @testing-library/react

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/015_recent_results_function.sql` | Create | SQL function returning last 3 completed predictions |
| `src/hooks/useRecentResults.js` | Create | Fetches RPC result, returns `{ results, loading }` |
| `src/components/Dashboard/RecentResults.jsx` | Create | Section heading + result rows |
| `src/__tests__/RecentResults.test.jsx` | Create | Tests for the component |
| `src/components/Dashboard/Dashboard.jsx` | Modify | Import and render `<RecentResults />` |

---

### Task 1: Database function `get_recent_results`

**Files:**
- Create: `supabase/015_recent_results_function.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/015_recent_results_function.sql
-- Returns the last 3 completed matches a user made a prediction on,
-- with the match result and whether their prediction was correct.
create or replace function public.get_recent_results(p_user_id uuid)
returns table(
  match_id       uuid,
  home_team      text,
  away_team      text,
  home_score     int,
  away_score     int,
  phase          text,
  group_letter   text,
  user_pick      text,
  is_correct     boolean,
  kicked_off_at  timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Caller must be fetching their own data
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;

  return query
    -- Group stage predictions
    select
      m.id            as match_id,
      m.home_team,
      m.away_team,
      mr.home_score,
      mr.away_score,
      m.phase,
      m.group_letter,
      gsp.prediction  as user_pick,
      (gsp.prediction = mr.result) as is_correct,
      m.kickoff_at    as kicked_off_at
    from public.matches m
    join public.match_results mr on mr.match_id = m.id
    join public.group_stage_predictions gsp
      on gsp.match_id = m.id and gsp.user_id = p_user_id
    where m.phase = 'group_stage'

    union all

    -- Knockout predictions
    select
      m.id            as match_id,
      m.home_team,
      m.away_team,
      mr.home_score,
      mr.away_score,
      m.phase,
      m.group_letter,
      kp.predicted_winner as user_pick,
      (kp.predicted_winner = mr.winner_team) as is_correct,
      m.kickoff_at    as kicked_off_at
    from public.matches m
    join public.match_results mr on mr.match_id = m.id
    join public.knockout_predictions kp
      on kp.match_id = m.id and kp.user_id = p_user_id
    where m.phase != 'group_stage'

    order by kicked_off_at desc
    limit 3;
end;
$$;
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Call `apply_migration` with:
- project_id: `hvjxkplcawwrimfwckgp`
- name: `recent_results_function`
- query: the SQL above

Expected: `{ "success": true }`

- [ ] **Step 3: Verify the function exists**

Run via `execute_sql` (project `hvjxkplcawwrimfwckgp`):
```sql
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_name = 'get_recent_results';
```
Expected: one row.

- [ ] **Step 4: Commit**

```bash
git add supabase/015_recent_results_function.sql
git commit -m "feat: add get_recent_results RPC function"
```

---

### Task 2: `useRecentResults` hook

**Files:**
- Create: `src/hooks/useRecentResults.js`

There is no separate test file for this hook — it is covered by the RecentResults component tests in Task 3 via mocking.

- [ ] **Step 1: Create the hook**

```js
// src/hooks/useRecentResults.js
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'

export const useRecentResults = () => {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchResults = async () => {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_recent_results', {
        p_user_id: user.id,
      })
      if (!error) setResults(data ?? [])
      setLoading(false)
    }

    fetchResults()
  }, [user])

  return { results, loading }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useRecentResults.js
git commit -m "feat: add useRecentResults hook"
```

---

### Task 3: `RecentResults` component

**Files:**
- Create: `src/components/Dashboard/RecentResults.jsx`
- Test: `src/__tests__/RecentResults.test.jsx`

Context needed:
- `getFlag(teamName)` is imported from `../../utils/teamFlags`
- Phase labels: `{ group_stage: 'Grupo', r16: 'Octavos', qf: 'Cuartos', sf: 'Semifinal', final: 'Final' }`
- For group stage picks, `user_pick` is `'home'`/`'draw'`/`'away'` — must be translated to a human label using `home_team`/`away_team` from the row, or `'Empate'`
- For knockout picks, `user_pick` is the team name directly
- `is_correct: true` → teal `✓ ACERTASTE` badge; `is_correct: false` → red `✗ FALLASTE` badge
- Section is hidden entirely when `results` is empty (no empty state message)
- Loading state: return `null` (section absent while fetching)

- [ ] **Step 1: Write the failing tests**

```jsx
// src/__tests__/RecentResults.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RecentResults from '../components/Dashboard/RecentResults'

const groupResult = {
  match_id: 'match-1',
  home_team: 'Mexico',
  away_team: 'South Africa',
  home_score: 2,
  away_score: 0,
  phase: 'group_stage',
  group_letter: 'A',
  user_pick: 'home',
  is_correct: true,
  kicked_off_at: '2026-06-11T18:00:00Z',
}

const knockoutResult = {
  match_id: 'match-2',
  home_team: 'Argentina',
  away_team: 'Brazil',
  home_score: 1,
  away_score: 0,
  phase: 'r16',
  group_letter: null,
  user_pick: 'Brazil',
  is_correct: false,
  kicked_off_at: '2026-07-01T20:00:00Z',
}

describe('RecentResults', () => {
  it('renders nothing when results array is empty', () => {
    const { container } = render(<RecentResults results={[]} loading={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing while loading', () => {
    const { container } = render(<RecentResults results={[]} loading={true} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders section heading when results exist', () => {
    render(<RecentResults results={[groupResult]} loading={false} />)
    expect(screen.getByText(/últimos resultados/i)).toBeInTheDocument()
  })

  it('renders the score for a match', () => {
    render(<RecentResults results={[groupResult]} loading={false} />)
    expect(screen.getByText('2 — 0')).toBeInTheDocument()
  })

  it('shows ACERTASTE for correct prediction', () => {
    render(<RecentResults results={[groupResult]} loading={false} />)
    expect(screen.getByText(/acertaste/i)).toBeInTheDocument()
  })

  it('shows FALLASTE for incorrect prediction', () => {
    render(<RecentResults results={[knockoutResult]} loading={false} />)
    expect(screen.getByText(/fallaste/i)).toBeInTheDocument()
  })

  it('translates home/draw/away pick to team name or Empate', () => {
    render(<RecentResults results={[groupResult]} loading={false} />)
    // user_pick='home', home_team='Mexico' → should show 'Mexico'
    expect(screen.getAllByText('Mexico').length).toBeGreaterThan(0)
  })

  it('shows team name directly for knockout pick', () => {
    render(<RecentResults results={[knockoutResult]} loading={false} />)
    // user_pick='Brazil' for knockout → shown directly
    expect(screen.getAllByText('Brazil').length).toBeGreaterThan(0)
  })

  it('renders multiple results', () => {
    render(<RecentResults results={[groupResult, knockoutResult]} loading={false} />)
    expect(screen.getByText('2 — 0')).toBeInTheDocument()
    expect(screen.getByText('1 — 0')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/RecentResults.test.jsx
```
Expected: all 9 tests FAIL with "Cannot find module"

- [ ] **Step 3: Implement `RecentResults.jsx`**

```jsx
// src/components/Dashboard/RecentResults.jsx
import { getFlag } from '../../utils/teamFlags'

const PHASE_LABELS = {
  group_stage: 'Grupo',
  r16:         'Octavos',
  qf:          'Cuartos',
  sf:          'Semifinal',
  final:       'Final',
}

function pickLabel(row) {
  // For group stage: translate 'home'/'draw'/'away' to a display string
  if (row.phase === 'group_stage') {
    if (row.user_pick === 'home') return row.home_team
    if (row.user_pick === 'away') return row.away_team
    return 'Empate'
  }
  // For knockout: pick is already the team name
  return row.user_pick
}

function phaseLabel(row) {
  const base = PHASE_LABELS[row.phase] ?? row.phase
  return row.group_letter ? `${base} ${row.group_letter}` : base
}

export default function RecentResults({ results, loading }) {
  if (loading || results.length === 0) return null

  return (
    <div className="bg-card border border-line rounded-2xl overflow-hidden">
      <div className="px-5 pt-4 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
          Últimos Resultados
        </p>
      </div>

      <div className="divide-y divide-line">
        {results.map((row) => (
          <div
            key={row.match_id}
            className="px-5 py-3 flex items-center gap-3"
          >
            {/* Score */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span aria-hidden="true">{getFlag(row.home_team)}</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {row.home_score} — {row.away_score}
              </span>
              <span aria-hidden="true">{getFlag(row.away_team)}</span>
            </div>

            {/* Phase + pick */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                {phaseLabel(row)}
              </span>
              <span className="text-[10px] text-gray-600"> · Tu pick: </span>
              <span className="text-[10px] text-white font-semibold">
                {pickLabel(row)}
              </span>
            </div>

            {/* Badge */}
            {row.is_correct ? (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
                ✓ Acertaste
              </span>
            ) : (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                ✗ Fallaste
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/RecentResults.test.jsx
```
Expected: all 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Dashboard/RecentResults.jsx src/__tests__/RecentResults.test.jsx
git commit -m "feat: add RecentResults component"
```

---

### Task 4: Wire RecentResults into Dashboard

**Files:**
- Modify: `src/components/Dashboard/Dashboard.jsx`

- [ ] **Step 1: Write the failing test**

Add to a new file `src/__tests__/Dashboard.test.jsx`:

```jsx
// src/__tests__/Dashboard.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, profile: { display_name: 'Paola' } }),
}))
vi.mock('../hooks/useLeaderboard', () => ({
  useLeaderboard: () => ({ userEntry: { total_points: 30, correct_predictions: 3, rank: 2 } }),
}))
vi.mock('../hooks/usePredictions', () => ({
  usePredictions: () => ({ matches: [] }),
}))
vi.mock('../hooks/useRecentResults', () => ({
  useRecentResults: () => ({
    loading: false,
    results: [
      {
        match_id: 'match-1',
        home_team: 'Mexico',
        away_team: 'South Africa',
        home_score: 2,
        away_score: 0,
        phase: 'group_stage',
        group_letter: 'A',
        user_pick: 'home',
        is_correct: true,
        kicked_off_at: '2026-06-11T18:00:00Z',
      },
    ],
  }),
}))

import Dashboard from '../components/Dashboard/Dashboard'

describe('Dashboard', () => {
  it('renders the RecentResults section when results exist', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByText(/últimos resultados/i)).toBeInTheDocument()
  })

  it('renders the score from recent results', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByText('2 — 0')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/Dashboard.test.jsx
```
Expected: FAIL — "Últimos Resultados" not found

- [ ] **Step 3: Update `Dashboard.jsx`**

Add import after the existing `getFlag` import line:
```jsx
import { useRecentResults } from '../../hooks/useRecentResults'
import RecentResults from './RecentResults'
```

Add hook call inside the component, after the existing hooks:
```jsx
const { results: recentResults, loading: recentLoading } = useRecentResults()
```

Add `<RecentResults />` between the "Próximo Cierre" card and the quick actions grid:
```jsx
      {/* Recent results */}
      <div className="animate-fade-up stagger-4">
        <RecentResults results={recentResults} loading={recentLoading} />
      </div>

      {/* Quick actions */}
      <div className="animate-fade-up stagger-4 grid grid-cols-3 gap-3">
```

Note: the quick actions div already has `stagger-4` — change it to `stagger-5` to maintain animation sequencing:
```jsx
      <div className="animate-fade-up stagger-5 grid grid-cols-3 gap-3">
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/Dashboard.test.jsx
```
Expected: both tests PASS

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```
Expected: all tests PASS (no regressions)

- [ ] **Step 6: Commit**

```bash
git add src/components/Dashboard/Dashboard.jsx src/__tests__/Dashboard.test.jsx
git commit -m "feat: show post-match recap on Dashboard"
```
