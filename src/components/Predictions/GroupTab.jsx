import MatchCard from './MatchCard'
import AdvancementPicker from './AdvancementPicker'
import { isMatchLocked } from '../../utils/scoring'

export default function GroupTab({ groupLetter, matches, groupPredictions, advancementPrediction, results, onPredict, onAdvancement }) {
  const teams = [...new Set(matches.flatMap(m => [m.home_team, m.away_team]))]
  const firstMatch = [...matches].sort((a, b) => new Date(a.kickoff_at) - new Date(b.kickoff_at))[0]
  const advancementLocked = firstMatch ? isMatchLocked(firstMatch.kickoff_at) : false

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
          selection={advancementPrediction ?? []}
          onSelect={(teams) => onAdvancement(groupLetter, teams)}
          locked={advancementLocked}
        />
      </div>
    </div>
  )
}
