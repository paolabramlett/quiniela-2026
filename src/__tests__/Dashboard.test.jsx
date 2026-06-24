// src/__tests__/Dashboard.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('html2canvas', () => ({ default: vi.fn() }))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, profile: { display_name: 'Paola' } }),
}))
vi.mock('../hooks/useLeaderboard', () => ({
  useLeaderboard: () => ({ userEntry: { total_points: 30, correct_predictions: 3, rank: 2 } }),
}))
vi.mock('../hooks/usePredictions', () => ({
  usePredictions: () => ({ matches: [], matchesByGroup: {}, advancementPredictions: {} }),
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

  it('renders the ShareButton when userEntry is present', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument()
  })
})
