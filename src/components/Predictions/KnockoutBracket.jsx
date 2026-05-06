import MatchCard from './MatchCard'

const PHASE_LABELS = {
  r16:   'Octavos de Final',
  qf:    'Cuartos de Final',
  sf:    'Semifinales',
  final: 'Final',
}

const PHASE_ACCENT = {
  r16:   'text-gray-500',
  qf:    'text-accent',
  sf:    'text-gold',
  final: 'text-primary',
}

export default function KnockoutBracket({ knockoutMatches, knockoutPredictions, onPredict }) {
  const byPhase = knockoutMatches.reduce((acc, m) => {
    if (!acc[m.phase]) acc[m.phase] = []
    acc[m.phase].push(m)
    return acc
  }, {})

  const known = (match) => match.home_team && match.away_team

  return (
    <div className="space-y-8">
      {['r16', 'qf', 'sf', 'final'].map(phase => (
        byPhase[phase]?.length > 0 && (
          <div key={phase}>
            {/* Phase header */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`font-display text-2xl tracking-wider ${PHASE_ACCENT[phase]}`}>
                {PHASE_LABELS[phase].toUpperCase()}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <div className="space-y-2.5">
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
                      const winner = side === null ? null : side === 'home' ? match.home_team : match.away_team
                      onPredict(id, winner)
                    }}
                  />
                ) : (
                  <div key={match.id} className="bg-card border border-line rounded-xl p-4">
                    <p className="text-xs text-gray-700 text-center uppercase tracking-widest font-bold">
                      Por definir
                    </p>
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
