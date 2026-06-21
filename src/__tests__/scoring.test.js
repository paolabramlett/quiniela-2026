import { describe, it, expect } from 'vitest'
import { isMatchLocked, getCountdownLabel, pointsForPhase } from '../utils/scoring'

describe('isMatchLocked', () => {
  it('returns true when kickoff is less than 30 minutes away', () => {
    const kickoffAt = new Date(Date.now() + 20 * 60 * 1000).toISOString()
    expect(isMatchLocked(kickoffAt)).toBe(true)
  })

  it('returns false when kickoff is more than 30 minutes away', () => {
    const kickoffAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    expect(isMatchLocked(kickoffAt)).toBe(false)
  })

  it('returns true when kickoff has already passed', () => {
    const kickoffAt = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(isMatchLocked(kickoffAt)).toBe(true)
  })
})

describe('getCountdownLabel', () => {
  it('returns null when kickoff is more than 2 hours away', () => {
    const kickoffAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
    expect(getCountdownLabel(kickoffAt)).toBeNull()
  })

  it('returns a label string when kickoff is less than 2 hours away', () => {
    const kickoffAt = new Date(Date.now() + 90 * 60 * 1000).toISOString()
    const label = getCountdownLabel(kickoffAt)
    expect(label).toMatch(/1h \d+m/)
  })

  it('returns minutes only when less than 1 hour away', () => {
    const kickoffAt = new Date(Date.now() + 25 * 60 * 1000).toISOString()
    const label = getCountdownLabel(kickoffAt)
    expect(label).toMatch(/25m/)
  })
})

describe('pointsForPhase', () => {
  it('returns 5 for group_stage', () => expect(pointsForPhase('group_stage')).toBe(5))
  it('returns 10 for r32', () => expect(pointsForPhase('r32')).toBe(10))
  it('returns 15 for r16', () => expect(pointsForPhase('r16')).toBe(15))
  it('returns 20 for qf', () => expect(pointsForPhase('qf')).toBe(20))
  it('returns 25 for sf', () => expect(pointsForPhase('sf')).toBe(25))
  it('returns 50 for final', () => expect(pointsForPhase('final')).toBe(50))
})
