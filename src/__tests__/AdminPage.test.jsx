import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

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

vi.mock('../components/Admin/AccessesTab', () => ({
  default: () => <div>AccessesTab</div>,
}))
vi.mock('../components/Admin/UsersTab', () => ({
  default: () => <div>UsersTab</div>,
}))

import AdminPage from '../components/Admin/AdminPage'

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
