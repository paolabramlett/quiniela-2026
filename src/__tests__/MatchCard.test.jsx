import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MatchCard from '../components/Predictions/MatchCard'

const baseMatch = {
  id: 'match-1',
  home_team: 'Argentina',
  away_team: 'Mexico',
  kickoff_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2h away
  phase: 'group_stage',
}

describe('MatchCard', () => {
  it('renders both team names', () => {
    render(<MatchCard match={baseMatch} prediction={null} onPredict={vi.fn()} />)
    expect(screen.getAllByText('Argentina').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Mexico').length).toBeGreaterThan(0)
  })

  it('calls onPredict with "home" when home button clicked', () => {
    const onPredict = vi.fn()
    render(<MatchCard match={baseMatch} prediction={null} onPredict={onPredict} />)
    fireEvent.click(screen.getByRole('button', { name: /argentina/i }))
    expect(onPredict).toHaveBeenCalledWith('match-1', 'home')
  })

  it('calls onPredict with "draw" when draw button clicked', () => {
    const onPredict = vi.fn()
    render(<MatchCard match={baseMatch} prediction={null} onPredict={onPredict} />)
    fireEvent.click(screen.getByRole('button', { name: /draw/i }))
    expect(onPredict).toHaveBeenCalledWith('match-1', 'draw')
  })

  it('shows selected state for current prediction', () => {
    render(<MatchCard match={baseMatch} prediction="home" onPredict={vi.fn()} />)
    const homeBtn = screen.getByRole('button', { name: /argentina/i })
    expect(homeBtn).toHaveClass('bg-primary')
  })

  it('disables all buttons when match is locked', () => {
    const lockedMatch = {
      ...baseMatch,
      kickoff_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10min away — locked
    }
    render(<MatchCard match={lockedMatch} prediction={null} onPredict={vi.fn()} />)
    screen.getAllByRole('button').forEach(btn => {
      expect(btn).toBeDisabled()
    })
  })

  it('shows countdown label when less than 2 hours away', () => {
    render(<MatchCard match={baseMatch} prediction={null} onPredict={vi.fn()} />)
    expect(screen.getByText(/1h \d+m|[0-9]+m/)).toBeInTheDocument()
  })

  it('hides Draw button when showDraw is false', () => {
    render(<MatchCard match={baseMatch} prediction={null} onPredict={vi.fn()} showDraw={false} />)
    expect(screen.queryByRole('button', { name: /draw/i })).not.toBeInTheDocument()
  })
})
