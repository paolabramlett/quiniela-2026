import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TermsPage from '../components/Legal/TermsPage'
import PrivacyPage from '../components/Legal/PrivacyPage'
import LoginPage from '../components/Auth/LoginPage'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ signInWithGoogle: vi.fn() }),
}))

describe('TermsPage', () => {
  it('renders the main heading', () => {
    render(<MemoryRouter><TermsPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /términos y condiciones/i })).toBeInTheDocument()
  })

  it('renders the back link to /login', () => {
    render(<MemoryRouter><TermsPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /volver/i })).toHaveAttribute('href', '/login')
  })

  it('renders key legal sections', () => {
    render(<MemoryRouter><TermsPage /></MemoryRouter>)
    expect(screen.getByText(/no es un servicio de apuestas/i)).toBeInTheDocument()
    expect(screen.getByText(/limitación de responsabilidad/i)).toBeInTheDocument()
  })
})

describe('PrivacyPage', () => {
  it('renders the main heading', () => {
    render(<MemoryRouter><PrivacyPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /política de privacidad/i })).toBeInTheDocument()
  })

  it('renders the back link to /login', () => {
    render(<MemoryRouter><PrivacyPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /volver/i })).toHaveAttribute('href', '/login')
  })

  it('renders key privacy sections', () => {
    render(<MemoryRouter><PrivacyPage /></MemoryRouter>)
    expect(screen.getByText(/derechos arco/i)).toBeInTheDocument()
    expect(screen.getByText(/google llc/i)).toBeInTheDocument()
  })
})

describe('LoginPage legal links', () => {
  it('renders Terms link pointing to /terminos', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /términos y condiciones/i })).toHaveAttribute('href', '/terminos')
  })

  it('renders Privacy link pointing to /privacidad', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /política de privacidad/i })).toHaveAttribute('href', '/privacidad')
  })
})
