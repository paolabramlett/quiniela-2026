import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdvancementReminder from '../components/Dashboard/AdvancementReminder'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const future = (daysFromNow) => new Date(Date.now() + daysFromNow * 86400000).toISOString()

describe('AdvancementReminder', () => {
  it('renders nothing when every unlocked group has a complete pick', () => {
    const matchesByGroup = { A: [{ kickoff_at: future(3) }] }
    const advancementPredictions = { A: ['Mexico', 'Czechia'] }
    const { container } = render(
      <MemoryRouter>
        <AdvancementReminder matchesByGroup={matchesByGroup} advancementPredictions={advancementPredictions} />
      </MemoryRouter>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a reminder naming groups with a missing or incomplete pick', () => {
    const matchesByGroup = {
      A: [{ kickoff_at: future(3) }],
      B: [{ kickoff_at: future(5) }],
    }
    const advancementPredictions = { A: ['Mexico'] } // B has no prediction at all
    render(
      <MemoryRouter>
        <AdvancementReminder matchesByGroup={matchesByGroup} advancementPredictions={advancementPredictions} />
      </MemoryRouter>
    )
    expect(screen.getByText(/Grupos A, B/)).toBeInTheDocument()
  })

  it('ignores groups whose last match has already locked', () => {
    const matchesByGroup = { A: [{ kickoff_at: future(-3) }] } // already played
    const { container } = render(
      <MemoryRouter>
        <AdvancementReminder matchesByGroup={matchesByGroup} advancementPredictions={{}} />
      </MemoryRouter>
    )
    expect(container).toBeEmptyDOMElement()
  })
})
