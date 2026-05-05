import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AdvancementPicker from '../components/Predictions/AdvancementPicker'

const teams = ['Argentina', 'Mexico', 'Poland', 'Saudi Arabia']

describe('AdvancementPicker', () => {
  it('renders all 4 team buttons', () => {
    render(<AdvancementPicker teams={teams} selection={[]} onSelect={vi.fn()} locked={false} />)
    teams.forEach(t => expect(screen.getByRole('button', { name: t })).toBeInTheDocument())
  })

  it('calls onSelect with team when clicked', () => {
    const onSelect = vi.fn()
    render(<AdvancementPicker teams={teams} selection={[]} onSelect={onSelect} locked={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Argentina' }))
    expect(onSelect).toHaveBeenCalledWith(['Argentina'])
  })

  it('deselects a team when clicked again', () => {
    const onSelect = vi.fn()
    render(<AdvancementPicker teams={teams} selection={['Argentina']} onSelect={onSelect} locked={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Argentina' }))
    expect(onSelect).toHaveBeenCalledWith([])
  })

  it('does not allow selecting a 3rd team when 2 are already selected', () => {
    const onSelect = vi.fn()
    render(<AdvancementPicker teams={teams} selection={['Argentina', 'Mexico']} onSelect={onSelect} locked={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Poland' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('disables all buttons when locked', () => {
    render(<AdvancementPicker teams={teams} selection={[]} onSelect={vi.fn()} locked={true} />)
    screen.getAllByRole('button').forEach(btn => expect(btn).toBeDisabled())
  })
})
