// src/__tests__/ShareCard.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ShareCard from '../components/Sharing/ShareCard'

const scoreProps = {
  displayName: 'Paola',
  rank: 2,
  points: 30,
  correctPredictions: 3,
  totalMatches: 5,
}

const groupScoreProps = {
  ...scoreProps,
  groupName: 'Los Amigos',
  inviteCode: 'ABC-123',
}

const preMatchProps = {
  displayName: 'Paola',
  rank: null,
  points: 0,
  groupName: 'Los Amigos',
  inviteCode: 'ABC-123',
}

describe('ShareCard', () => {
  it('renders score-only variant: shows points and rank', () => {
    render(<ShareCard {...scoreProps} />)
    expect(screen.getByText(/30 pts/i)).toBeInTheDocument()
    expect(screen.getByText(/#2/)).toBeInTheDocument()
  })

  it('score-only variant: does NOT show invite code', () => {
    render(<ShareCard {...scoreProps} />)
    expect(screen.queryByText('ABC-123')).not.toBeInTheDocument()
  })

  it('score-only variant: shows correct predictions fraction', () => {
    render(<ShareCard {...scoreProps} />)
    expect(screen.getByText(/3 de 5/)).toBeInTheDocument()
  })

  it('score-invite variant: shows points, rank, and invite code', () => {
    render(<ShareCard {...groupScoreProps} />)
    expect(screen.getByText(/30 pts/i)).toBeInTheDocument()
    expect(screen.getByText('ABC-123')).toBeInTheDocument()
  })

  it('pre-match variant: shows group name and invite code, not points', () => {
    render(<ShareCard {...preMatchProps} />)
    expect(screen.getByText('Los Amigos')).toBeInTheDocument()
    expect(screen.getByText('ABC-123')).toBeInTheDocument()
    expect(screen.queryByText(/30 pts/i)).not.toBeInTheDocument()
  })

  it('pre-match variant: shows recruit tagline', () => {
    render(<ShareCard {...preMatchProps} />)
    expect(screen.getByText(/te animas/i)).toBeInTheDocument()
  })

  it('score-invite variant: shows trash-talk tagline', () => {
    render(<ShareCard {...groupScoreProps} />)
    expect(screen.getByText(/crees que me puedes ganar/i)).toBeInTheDocument()
  })

  it('all variants: shows QUINIELA wordmark', () => {
    render(<ShareCard {...scoreProps} />)
    expect(screen.getByText('QUINIELA')).toBeInTheDocument()
    expect(screen.getByText('26')).toBeInTheDocument()
  })
})
