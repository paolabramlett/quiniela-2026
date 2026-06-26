import { describe, it, expect } from 'vitest'
import { computeGroupAdvancement } from '../utils/advancement'

const makeMatches = (pairs) => pairs.map((p, i) => ({ id: `m${i}`, home_team: p[0], away_team: p[1] }))

describe('computeGroupAdvancement', () => {
  it('clinches a team with an insurmountable points lead and no matches left', () => {
    const matches = makeMatches([
      ['Mexico', 'South Africa'], ['South Korea', 'Czechia'],
      ['Czechia', 'South Africa'], ['Mexico', 'South Korea'],
      ['Mexico', 'Czechia'], ['South Africa', 'South Korea'],
    ])
    const results = {
      m0: { result: 'home' }, // Mexico beats South Africa
      m1: { result: 'draw' },
      m2: { result: 'home' }, // Czechia beats South Africa
      m3: { result: 'home' }, // Mexico beats South Korea
      m4: { result: 'home' }, // Mexico beats Czechia
      // m5 (South Africa vs South Korea) still unplayed
    }
    const { clinched, eliminated } = computeGroupAdvancement(matches, results)
    expect(clinched).toContain('Mexico')
    expect(eliminated).toContain('South Africa')
  })

  it('clinches nobody when no matches have been played yet', () => {
    const matches = makeMatches([
      ['A', 'B'], ['C', 'D'], ['A', 'C'], ['B', 'D'], ['A', 'D'], ['B', 'C'],
    ])
    const { clinched, eliminated } = computeGroupAdvancement(matches, {})
    expect(clinched).toEqual([])
    expect(eliminated).toEqual([])
  })

  it('leaves teams tied at the qualification cutoff as contested, not eliminated', () => {
    const matches = makeMatches([
      ['Canada', 'Bosnia-Herzegovina'], ['Qatar', 'Switzerland'],
      ['Switzerland', 'Bosnia-Herzegovina'], ['Canada', 'Qatar'],
      ['Switzerland', 'Canada'], ['Bosnia-Herzegovina', 'Qatar'],
    ])
    const results = {
      m0: { result: 'draw' }, m1: { result: 'draw' }, m2: { result: 'home' },
      m3: { result: 'home' }, m4: { result: 'home' }, m5: { result: 'home' },
    }
    // Points: Switzerland=7, Canada=4, Bosnia=4 (tied for the 2nd spot), Qatar=1
    const { clinched, eliminated } = computeGroupAdvancement(matches, results)
    expect(clinched).toEqual(['Switzerland'])
    expect(eliminated).toEqual(['Qatar'])
    expect(eliminated).not.toContain('Canada')
    expect(eliminated).not.toContain('Bosnia-Herzegovina')
  })

  it('resolves both spots once every match is finished with no ties at the cutoff', () => {
    const matches = makeMatches([['A', 'B'], ['C', 'D'], ['A', 'C'], ['B', 'D'], ['A', 'D'], ['B', 'C']])
    const results = {
      m0: { result: 'home' }, // A beats B
      m1: { result: 'home' }, // C beats D
      m2: { result: 'home' }, // A beats C
      m3: { result: 'home' }, // B beats D
      m4: { result: 'home' }, // A beats D
      m5: { result: 'home' }, // B beats C
    }
    // Points: A=9, B=6, C=3, D=0 — clean top 2, no ties
    const { clinched, eliminated } = computeGroupAdvancement(matches, results)
    expect(clinched.sort()).toEqual(['A', 'B'])
    expect(eliminated.sort()).toEqual(['C', 'D'])
  })
})
