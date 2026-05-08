// src/__tests__/PaywallModal.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PaywallModal from '../components/Groups/PaywallModal'

describe('PaywallModal', () => {
  const baseProps = {
    onClose: vi.fn(),
    onCheckout: vi.fn(),
    slotsAvailable: 0,
    loading: false,
    error: null,
  }

  it('renders pack and addon pricing options', () => {
    render(<PaywallModal {...baseProps} />)
    expect(screen.getByText('Comprar — $299 MXN')).toBeInTheDocument()
    expect(screen.getByText('Compra el pack primero')).toBeInTheDocument()
  })

  it('disables addon button when slotsAvailable is 0', () => {
    render(<PaywallModal {...baseProps} slotsAvailable={0} />)
    const addonBtn = screen.getByRole('button', { name: /addon/i })
    expect(addonBtn).toBeDisabled()
  })

  it('enables addon button when user already has slots', () => {
    render(<PaywallModal {...baseProps} slotsAvailable={1} />)
    const addonBtn = screen.getByRole('button', { name: /addon/i })
    expect(addonBtn).not.toBeDisabled()
  })

  it('shows loading state on checkout button', () => {
    render(<PaywallModal {...baseProps} loading="pack" />)
    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    render(<PaywallModal {...baseProps} error="No pudimos conectar con el sistema de pagos. Intenta de nuevo." />)
    expect(screen.getByText(/No pudimos conectar/)).toBeInTheDocument()
  })
})
