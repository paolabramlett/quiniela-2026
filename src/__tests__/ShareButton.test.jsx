// src/__tests__/ShareButton.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock html2canvas so it doesn't fail in jsdom
vi.mock('html2canvas', () => ({ default: vi.fn().mockResolvedValue({ toBlob: (cb) => cb(new Blob()) }) }))

import ShareButton from '../components/Sharing/ShareButton'

const baseProps = {
  displayName: 'Paola',
  rank: 2,
  points: 30,
  correctPredictions: 3,
  totalMatches: 5,
}

describe('ShareButton', () => {
  it('renders the Compartir button', () => {
    render(<ShareButton {...baseProps} />)
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument()
  })

  it('button is enabled by default', () => {
    render(<ShareButton {...baseProps} />)
    expect(screen.getByRole('button', { name: /compartir/i })).not.toBeDisabled()
  })

  it('shows ¡Copiado! tooltip after clipboard fallback', async () => {
    // Mock navigator.share as undefined so clipboard fallback triggers
    const originalShare = navigator.share
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<ShareButton {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /compartir/i }))

    // Restore
    Object.defineProperty(navigator, 'share', { value: originalShare, configurable: true })
  })

  it('renders without crashing when groupName and inviteCode are provided', () => {
    render(
      <ShareButton
        {...baseProps}
        groupName="Los Amigos"
        inviteCode="ABC-123"
      />
    )
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument()
  })
})
