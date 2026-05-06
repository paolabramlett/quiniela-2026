import MatchCard from './MatchCard'

const PHASE_LABELS = { r16: 'Octavos de Final', qf: 'Cuartos de Final', sf: 'Semifinales', final: 'Final' }

export default function KnockoutBracket({ knockoutMatches, knockoutPredictions, onPredict }) {
  const byPhase = knockoutMatches.reduce((acc, m) => {
    if (!acc[m.phase]) acc[m.phase] = []
    acc[m.phase].push(m)
    return acc
  }, {})

  const known = (match) => match.home_team && match.away_team

  return (
    <div className="space-y-6">
      {['r16', 'qf', 'sf', 'final'].map(phase => (
        byPhase[phase]?.length > 0 && (
          <div key={phase}>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              {PHASE_LABELS[phase]}
            </h3>
            <div className="space-y-3">
              {byPhase[phase].map(match => (
                known(match) ? (
                  <MatchCard
                    key={match.id}
                    match={{ ...match, phase }}
                    showDraw={false}
                    prediction={
                      knockoutPredictions[match.id] === match.home_team ? 'home'
                      : knockoutPredictions[match.id] === match.away_team ? 'away'
                      : null
                    }
                    onPredict={(id, side) => {
                      const winner = side === 'home' ? match.home_team : match.away_team
                      onPredict(id, winner)
                    }}
                  />
                ) : (
                  <div key={match.id} className="bg-white rounded-xl shadow-sm p-4 opacity-40">
                    <p className="text-sm text-gray-400 text-center">TBD vs TBD</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  )
}
