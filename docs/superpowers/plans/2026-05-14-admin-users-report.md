# Admin Users Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Usuarios tab to the Admin panel showing total users, paying users, free-access users, and a full user list.

**Architecture:** A new `get_users_report()` Supabase RPC function (SECURITY DEFINER, admin-only) joins `public.users`, `auth.users`, and `group_credits` to return one row per user. A new `UsersTab.jsx` component calls that RPC and renders three stat cards plus a user table. `AdminPage.jsx` gets a third tab wired to `UsersTab`.

**Tech Stack:** React 18, Supabase JS client (`supabase.rpc()`), Tailwind CSS, Vitest + @testing-library/react

---

### Task 1: Database function `get_users_report`

**Files:**
- Create: `supabase/013_users_report_function.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/013_users_report_function.sql
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
      a.email::text,
      a.created_at,
      coalesce(gc.slots_purchased, 0)::int as slots_purchased,
      coalesce(gc.granted_free, false) as granted_free
    from public.users u
    join auth.users a on a.id = u.id
    left join public.group_credits gc on gc.user_id = u.id
    order by a.created_at desc;
end;
$$;
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Call `apply_migration` with project_id `hvjxkplcawwrimfwckgp`, name `users_report_function`, and the SQL above.

Expected: `{ "success": true }`

- [ ] **Step 3: Verify the function exists**

Run via `execute_sql`:
```sql
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_name = 'get_users_report';
```
Expected: one row with `get_users_report`.

- [ ] **Step 4: Commit**

```bash
git add supabase/013_users_report_function.sql
git commit -m "feat: add get_users_report admin RPC function"
```

---

### Task 2: `UsersTab` component

**Files:**
- Create: `src/components/Admin/UsersTab.jsx`
- Test: `src/__tests__/UsersTab.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/__tests__/UsersTab.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import UsersTab from '../components/Admin/UsersTab'

vi.mock('../utils/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

import { supabase } from '../utils/supabase'

const mockUsers = [
  {
    id: 'uuid-1',
    display_name: 'Ana López',
    avatar_url: null,
    email: 'ana@test.com',
    created_at: '2026-05-01T10:00:00Z',
    slots_purchased: 1,
    granted_free: false,
  },
  {
    id: 'uuid-2',
    display_name: 'Carlos Ruiz',
    avatar_url: null,
    email: 'carlos@test.com',
    created_at: '2026-05-02T10:00:00Z',
    slots_purchased: 0,
    granted_free: true,
  },
  {
    id: 'uuid-3',
    display_name: 'María Soto',
    avatar_url: null,
    email: 'maria@test.com',
    created_at: '2026-05-03T10:00:00Z',
    slots_purchased: 0,
    granted_free: false,
  },
]

beforeEach(() => {
  supabase.rpc.mockResolvedValue({ data: mockUsers, error: null })
})

describe('UsersTab', () => {
  it('shows total users stat card', async () => {
    render(<UsersTab />)
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
    expect(screen.getByText(/total usuarios/i)).toBeInTheDocument()
  })

  it('shows paying users count', async () => {
    render(<UsersTab />)
    await waitFor(() => expect(screen.getByText(/usuarios pagadores/i)).toBeInTheDocument())
    // 1 user has slots_purchased > 0
    const cards = screen.getAllByRole('heading', { level: 2 })
    expect(cards.some(el => el.textContent === '1')).toBe(true)
  })

  it('shows free access count', async () => {
    render(<UsersTab />)
    await waitFor(() => expect(screen.getByText(/accesos gratuitos/i)).toBeInTheDocument())
  })

  it('renders a row for each user', async () => {
    render(<UsersTab />)
    await waitFor(() => expect(screen.getByText('Ana López')).toBeInTheDocument())
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
    expect(screen.getByText('María Soto')).toBeInTheDocument()
  })

  it('shows Pagador badge for paying users', async () => {
    render(<UsersTab />)
    await waitFor(() => expect(screen.getByText('Pagador')).toBeInTheDocument())
  })

  it('shows Gratuito badge for free access users', async () => {
    render(<UsersTab />)
    await waitFor(() => expect(screen.getByText('Gratuito')).toBeInTheDocument())
  })

  it('shows error message when RPC fails', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'Unauthorized' } })
    render(<UsersTab />)
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/UsersTab.test.jsx
```
Expected: all 7 tests FAIL with "Cannot find module '../components/Admin/UsersTab'"

- [ ] **Step 3: Implement `UsersTab.jsx`**

```jsx
// src/components/Admin/UsersTab.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

function StatCard({ label, value }) {
  return (
    <div className="bg-card border border-line rounded-xl p-4 flex flex-col gap-1">
      <h2 className="font-display text-3xl text-white">{value}</h2>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">{label}</p>
    </div>
  )
}

function Avatar({ name, avatarUrl }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />
  }
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  return (
    <div className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-[10px] font-bold text-gray-400">
      {initials}
    </div>
  )
}

function Badge({ slots_purchased, granted_free }) {
  if (slots_purchased > 0) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
        Pagador
      </span>
    )
  }
  if (granted_free) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
        Gratuito
      </span>
    )
  }
  return <span className="text-gray-700">—</span>
}

export default function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data, error: err } = await supabase.rpc('get_users_report')
      if (err) {
        setError(err.message)
      } else {
        setUsers(data ?? [])
      }
      setLoading(false)
    }
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <p className="text-gray-600 text-sm font-bold uppercase tracking-widest mt-4">
        Cargando usuarios...
      </p>
    )
  }

  if (error) {
    return (
      <p className="text-danger text-sm font-semibold mt-4">
        Error al cargar usuarios: {error}
      </p>
    )
  }

  const totalUsers = users.length
  const payingUsers = users.filter(u => u.slots_purchased > 0).length
  const freeUsers = users.filter(u => u.granted_free).length

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total usuarios" value={totalUsers} />
        <StatCard label="Usuarios pagadores" value={payingUsers} />
        <StatCard label="Accesos gratuitos" value={freeUsers} />
      </div>

      {/* User table */}
      {users.length === 0 ? (
        <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">
          No hay usuarios registrados
        </p>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              className="bg-card border border-line rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.display_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <p className="text-xs text-gray-600 hidden sm:block shrink-0">
                {new Date(user.created_at).toLocaleDateString('es-MX', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </p>
              <div className="shrink-0">
                <Badge slots_purchased={user.slots_purchased} granted_free={user.granted_free} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/UsersTab.test.jsx
```
Expected: all 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Admin/UsersTab.jsx src/__tests__/UsersTab.test.jsx
git commit -m "feat: add UsersTab component with stat cards and user list"
```

---

### Task 3: Wire Usuarios tab into AdminPage

**Files:**
- Modify: `src/components/Admin/AdminPage.jsx`

- [ ] **Step 1: Write the failing test**

Add to `src/__tests__/AdminPage.test.jsx` (create the file if it doesn't exist):

```jsx
// src/__tests__/AdminPage.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock useAdmin so we don't need real Supabase
vi.mock('../hooks/useAdmin', () => ({
  useAdmin: () => ({
    isAdmin: true,
    loading: false,
    matchesByPhase: {},
    results: {},
    advResults: {},
    saveMatchResult: vi.fn(),
    saveAdvancementResult: vi.fn(),
    syncMatches: vi.fn(),
  }),
}))

// Mock AccessesTab and UsersTab to isolate AdminPage
vi.mock('../components/Admin/AccessesTab', () => ({
  default: () => <div>AccessesTab</div>,
}))
vi.mock('../components/Admin/UsersTab', () => ({
  default: () => <div>UsersTab</div>,
}))

import AdminPage from '../components/Admin/AdminPage'

// Unlock the password gate for all tests
beforeEach(() => {
  sessionStorage.setItem('adminUnlocked', '1')
})

describe('AdminPage tabs', () => {
  it('renders three tabs: Resultados, Accesos, Usuarios', () => {
    render(<MemoryRouter><AdminPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /resultados/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accesos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /usuarios/i })).toBeInTheDocument()
  })

  it('shows UsersTab when Usuarios tab is clicked', () => {
    render(<MemoryRouter><AdminPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /usuarios/i }))
    expect(screen.getByText('UsersTab')).toBeInTheDocument()
  })

  it('does not show Sincronizar button on Usuarios tab', () => {
    render(<MemoryRouter><AdminPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /usuarios/i }))
    expect(screen.queryByRole('button', { name: /sincronizar/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run src/__tests__/AdminPage.test.jsx
```
Expected: FAIL — "Usuarios" button not found and UsersTab not rendered.

- [ ] **Step 3: Update `AdminPage.jsx`**

Add the import at the top (after the existing AccessesTab import):
```jsx
import UsersTab from './UsersTab'
```

Replace the tab switcher block (the `<div className="flex gap-2 mb-6 ...">` section) with:
```jsx
<div className="flex gap-2 mb-6 bg-surface border border-line rounded-xl p-1">
  <button
    onClick={() => setActiveTab('resultados')}
    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'resultados' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
  >
    Resultados
  </button>
  <button
    onClick={() => setActiveTab('accesos')}
    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'accesos' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
  >
    Accesos
  </button>
  <button
    onClick={() => setActiveTab('usuarios')}
    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'usuarios' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
  >
    Usuarios
  </button>
</div>
```

At the bottom of the JSX, after `{activeTab === 'accesos' && <AccessesTab />}`, add:
```jsx
{activeTab === 'usuarios' && <UsersTab />}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/__tests__/AdminPage.test.jsx
```
Expected: all 3 tests PASS

- [ ] **Step 5: Run full test suite to confirm no regressions**

```bash
npx vitest run
```
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/Admin/AdminPage.jsx src/__tests__/AdminPage.test.jsx
git commit -m "feat: add Usuarios tab to admin panel"
```
