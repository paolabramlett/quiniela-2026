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
    // 1 user has slots_purchased > 0 — stat cards render in order: total, paying, free
    const cards = screen.getAllByRole('heading', { level: 2 })
    expect(cards[1].textContent).toBe('1')
  })

  it('shows free access count', async () => {
    render(<UsersTab />)
    await waitFor(() => expect(screen.getByText(/accesos gratuitos/i)).toBeInTheDocument())
    // 1 user has granted_free = true
    const cards = screen.getAllByRole('heading', { level: 2 })
    expect(cards[2].textContent).toBe('1')
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
