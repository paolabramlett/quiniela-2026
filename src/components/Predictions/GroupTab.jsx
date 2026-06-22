import { useEffect } from 'react'
import MatchCard from './MatchCard'
import AdvancementPicker from './AdvancementPicker'
import { isMatchLocked } from '../../utils/scoring'
import { computeGroupAdvancement } from '../../utils/advancement'

export default function GroupTab({ groupLetter, matches, groupPredictions, advancementPrediction, results, onPredict, onAdvancement }) {
  const teams = [...new Set(matches.flatMap(m => [m.home_team, m.away_team]))]
  const lastMatch = [...matches].sort((a, b) => new Date(b.kickoff_at) - new Date(a.kickoff_at))[0]
  const advancementLocked = lastMatch ? isMatchLocked(lastMatch.kickoff_at) : false

  const { clinched, eliminated } = computeGroupAdvancement(matches, results)
  const selection = advancementPrediction ?? []

  // Once a team's advancement becomes mathematically certain, lock it into
  // the pick automatically — drop any selection that's been eliminated.
  useEffect(() => {
    if (advancementLocked || clinched.length === 0) return
    const alreadyHasAllClinched = clinched.every(t => selection.includes(t))
    if (alreadyHasAllClinched) return
    const keep = selection.filter(t => !eliminated.includes(t) && !clinched.includes(t))
    const merged = [...clinched, ...keep].slice(0, 2)
    onAdvancement(groupLetter, merged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupLetter, advancementLocked, clinched.join(','), eliminated.join(',')])

  return (
    <div className="space-y-2.5">
      {/* Group header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-display text-3xl text-white tracking-wider">GRUPO {groupLetter}</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {matches.map(match => (
        <MatchCard
          key={match.id}
          match={match}
          prediction={groupPredictions[match.id] ?? null}
          result={results[match.id]?.result ?? null}
          onPredict={onPredict}
        />
      ))}

      {/* Advancement picker */}
      <div className="bg-card border border-line rounded-xl p-4 mt-1">
        <AdvancementPicker
          teams={teams}
          selection={selection}
          onSelect={(teams) => onAdvancement(groupLetter, teams)}
          locked={advancementLocked}
          clinched={clinched}
          eliminated={eliminated}
        />
      </div>
    </div>
  )
}
