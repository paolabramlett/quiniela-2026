import { Navigate } from 'react-router-dom'
import { useAdmin } from '../../hooks/useAdmin'
import MatchResultForm from './MatchResultForm'
import AdvancementResultForm from './AdvancementResultForm'

const PHASE_LABELS = { group_stage: 'Group Stage', r16: 'Round of 16', qf: 'Quarter-Finals', sf: 'Semi-Finals', final: 'Final' }

export default function AdminPage() {
  const { isAdmin, loading, matchesByPhase, results, advResults, saveMatchResult, saveAdvancementResult } = useAdmin()

  if (loading) return <div className="text-center text-gray-400 mt-10">Checking access...</div>
  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Admin — Enter Results</h1>

      {['group_stage', 'r16', 'qf', 'sf', 'final'].map(phase => (
        matchesByPhase[phase]?.length > 0 && (
          <div key={phase} className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              {PHASE_LABELS[phase]}
            </h2>
            <div className="space-y-3">
              {matchesByPhase[phase].map(match => (
                <MatchResultForm
                  key={match.id}
                  match={match}
                  existingResult={results[match.id] ?? null}
                  onSave={saveMatchResult}
                />
              ))}
            </div>
          </div>
        )
      ))}

      {matchesByPhase['group_stage']?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Group Advancement
          </h2>
          <div className="space-y-3">
            {['A','B','C','D','E','F','G','H','I','J','K','L'].map(letter => {
              const groupMatches = matchesByPhase['group_stage'].filter(m => m.group_letter === letter)
              const teams = [...new Set(groupMatches.flatMap(m => [m.home_team, m.away_team]))]
              return (
                <AdvancementResultForm
                  key={letter}
                  groupLetter={letter}
                  teams={teams}
                  existingResult={advResults[letter] ?? null}
                  onSave={saveAdvancementResult}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
