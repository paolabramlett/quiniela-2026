// Determines which teams in a group are mathematically guaranteed to
// advance (clinched) or guaranteed not to (eliminated), given results
// already in and every possible outcome of the matches still left to play.
const OUTCOMES = ['home', 'draw', 'away']

const applyOutcome = (points, match, outcome) => {
  const next = { ...points }
  if (outcome === 'home') next[match.home_team] += 3
  else if (outcome === 'away') next[match.away_team] += 3
  else { next[match.home_team] += 1; next[match.away_team] += 1 }
  return next
}

export function computeGroupAdvancement(matches, results) {
  const teams = [...new Set(matches.flatMap(m => [m.home_team, m.away_team]))]
  const basePoints = {}
  teams.forEach(t => { basePoints[t] = 0 })

  const remaining = []
  matches.forEach(m => {
    const result = results[m.id]?.result
    if (!result) {
      remaining.push(m)
    } else {
      Object.assign(basePoints, applyOutcome(basePoints, m, result))
    }
  })

  // Enumerate every possible combination of outcomes for the unplayed matches
  let scenarios = [basePoints]
  remaining.forEach(m => {
    scenarios = scenarios.flatMap(scenario => OUTCOMES.map(o => applyOutcome(scenario, m, o)))
  })

  // In each scenario a team only counts as "definitely advancing" if its
  // points strictly beat the 3rd-place total, and "definitely eliminated"
  // only if its points are strictly below the 2nd-place total. A team
  // tied at the cutoff (e.g. tied for 2nd with the 3rd-place team) is
  // neither — it's genuinely ambiguous without tiebreaker data (goal
  // difference, head-to-head), so it must not be marked eliminated just
  // because it didn't clinch.
  const advancingCount = {}
  const eliminatedCount = {}
  teams.forEach(t => { advancingCount[t] = 0; eliminatedCount[t] = 0 })

  scenarios.forEach(scenario => {
    const ranked = [...teams].sort((a, b) => scenario[b] - scenario[a])
    const secondPlacePoints = scenario[ranked[1]]
    const thirdPlacePoints = scenario[ranked[2]]
    teams.forEach(t => {
      if (scenario[t] > thirdPlacePoints) advancingCount[t]++
      else if (scenario[t] < secondPlacePoints) eliminatedCount[t]++
    })
  })

  const total = scenarios.length
  const clinched = teams.filter(t => advancingCount[t] === total)
  const eliminated = teams.filter(t => eliminatedCount[t] === total)

  return { clinched, eliminated }
}
