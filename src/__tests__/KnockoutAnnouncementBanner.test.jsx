import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import KnockoutAnnouncementBanner from '../components/Dashboard/KnockoutAnnouncementBanner'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

describe('KnockoutAnnouncementBanner', () => {
  it('renders nothing when every knockout match is still TBD', () => {
    const matches = [
      { phase: 'group_stage', home_team: 'Mexico', away_team: 'South Africa' },
      { phase: 'r32', home_team: 'TBD', away_team: 'TBD' },
    ]
    const { container } = render(
      <MemoryRouter><KnockoutAnnouncementBanner matches={matches} /></MemoryRouter>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the announcement once a real knockout fixture exists', () => {
    const matches = [
      { phase: 'group_stage', home_team: 'Mexico', away_team: 'South Africa' },
      { phase: 'r32', home_team: 'Brazil', away_team: 'Japan' },
    ]
    render(<MemoryRouter><KnockoutAnnouncementBanner matches={matches} /></MemoryRouter>)
    expect(screen.getByText(/Ya puedes predecir Eliminatorias/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Eliminatorias/).length).toBeGreaterThan(0)
  })
})
