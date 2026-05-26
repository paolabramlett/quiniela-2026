import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityEvent from '../components/Activity/ActivityEvent'

const base = {
  id: 'evt-1',
  event_type: 'joined',
  payload: {},
  created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  actor_display_name: 'Paola',
  actor_avatar_url: null,
}

describe('ActivityEvent', () => {
  it('renders joined event text', () => {
    render(<ActivityEvent event={base} />)
    expect(screen.getByText(/paola se unió al grupo/i)).toBeInTheDocument()
  })

  it('renders rank_up event text with new rank', () => {
    render(<ActivityEvent event={{ ...base, event_type: 'rank_up', payload: { old_rank: 4, new_rank: 2 } }} />)
    expect(screen.getByText(/subió al lugar #2/i)).toBeInTheDocument()
  })

  it('renders rank_down event text with new rank', () => {
    render(<ActivityEvent event={{ ...base, event_type: 'rank_down', payload: { old_rank: 2, new_rank: 5 } }} />)
    expect(screen.getByText(/bajó al lugar #5/i)).toBeInTheDocument()
  })

  it('renders correct_streak event text with streak count', () => {
    render(<ActivityEvent event={{ ...base, event_type: 'correct_streak', payload: { streak: 3 } }} />)
    expect(screen.getByText(/acertó 3 seguidos/i)).toBeInTheDocument()
  })

  it('renders prediction_complete event text', () => {
    render(<ActivityEvent event={{ ...base, event_type: 'prediction_complete', payload: { phase: 'group_stage' } }} />)
    expect(screen.getByText(/completó sus quinielas/i)).toBeInTheDocument()
  })

  it('renders a relative timestamp', () => {
    render(<ActivityEvent event={base} />)
    expect(screen.getByText(/hace/i)).toBeInTheDocument()
  })

  it('renders initials avatar when actor_avatar_url is null', () => {
    render(<ActivityEvent event={base} />)
    expect(screen.getByText('P')).toBeInTheDocument()
  })

  it('renders img when actor_avatar_url is set', () => {
    render(<ActivityEvent event={{ ...base, actor_avatar_url: 'https://example.com/avatar.jpg' }} />)
    expect(screen.getByAltText('')).toBeInTheDocument()
  })
})
