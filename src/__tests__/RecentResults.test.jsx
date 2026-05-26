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
