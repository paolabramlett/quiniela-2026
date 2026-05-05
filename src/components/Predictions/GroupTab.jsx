import MatchCard from './MatchCard'
import AdvancementPicker from './AdvancementPicker'
import { isMatchLocked } from '../../utils/scoring'

export default function GroupTab({ groupLetter, matches, groupPredictions, advancementPrediction, onPredict, onAdvancement }) {
  const teams = [...new Set(matches.flatMap(m => [m.home_team, m.away_team]))]
  const firstMatch = [...matches].sort((a, b) => new Date(a.kickoff_at) - new Date(b.kickoff_at))[0]
  const advancementLocked = firstMatch ? isMatchLocked(firstMatch.kickoff_at) : false

  return (
    <div className="space-y-3">
      {matches.map(match => (
        <MatchCard
          key={match.id}
          match={match}
          prediction={groupPredictions[match.id] ?? null}
          onPredict={onPredict}
        />
      ))}
      <div className="bg-white rounded-xl shadow-sm p-4">
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
