// src/__tests__/ActivityFeed.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityFeed from '../components/Activity/ActivityFeed'

const events = [
  {
    id: 'evt-1',
    group_id: 'g-1',
    group_name: 'Los Amigos',
    event_type: 'joined',
    payload: {},
    created_at: new Date().toISOString(),
    actor_display_name: 'Paola',
    actor_avatar_url: null,
  },
  {
    id: 'evt-2',
    group_id: 'g-1',
    group_name: 'Los Amigos',
    event_type: 'correct_streak',
    payload: { streak: 3 },
    created_at: new Date().toISOString(),
    actor_display_name: 'Juan',
    actor_avatar_url: null,
  },
]

describe('ActivityFeed', () => {
  it('shows spinner while loading', () => {
    render(<ActivityFeed events={[]} loading={true} />)
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('shows empty state when no events', () => {
    render(<ActivityFeed events={[]} loading={false} />)
    expect(screen.getByText(/sin actividad reciente/i)).toBeInTheDocument()
  })

  it('renders all events when provided', () => {
    render(<ActivityFeed events={events} loading={false} />)
    expect(screen.getByText(/paola se unió al grupo/i)).toBeInTheDocument()
    expect(screen.getByText(/juan acertó 3 seguidos/i)).toBeInTheDocument()
  })

  it('shows group name when showGroupName is true', () => {
    render(<ActivityFeed events={events} loading={false} showGroupName />)
    expect(screen.getAllByText('Los Amigos').length).toBeGreaterThan(0)
  })

  it('does not show group name by default', () => {
    render(<ActivityFeed events={events} loading={false} />)
    expect(screen.queryByText('Los Amigos')).not.toBeInTheDocument()
  })
})
