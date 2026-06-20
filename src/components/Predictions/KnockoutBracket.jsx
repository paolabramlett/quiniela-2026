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

// Expected number of matches per phase — always show the full bracket structure
const PHASE_SLOTS = { r16: 8, qf: 4, sf: 2, final: 1 }

export default function KnockoutBracket({ knockoutMatches, knockoutPredictions, results, onPredict }) {
  const byPhase = knockoutMatches.reduce((acc, m) => {
    if (!acc[m.phase]) acc[m.phase] = []
    acc[m.phase].push(m)
    return acc
  }, {})

  const known = (match) => match.home_team && match.away_team

  return (
    <div className="space-y-8">
      {['r16', 'qf', 'sf', 'final'].map(phase => {
        const matches = byPhase[phase] ?? []
        const placeholdersNeeded = Math.max(0, PHASE_SLOTS[phase] - matches.length)

        return (
          <div key={phase}>
            {/* Phase header */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`font-display text-2xl tracking-wider ${PHASE_ACCENT[phase]}`}>
                {PHASE_LABELS[phase].toUpperCase()}
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <div className="space-y-2.5">
              {matches.map(match => (
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
                    result={
                      results[match.id]?.winner_team === match.home_team ? 'home'
                      : results[match.id]?.winner_team === match.away_team ? 'away'
                      : null
                    }
                    onPredict={(id, side) => {
                      const winner = side === null ? null : side === 'home' ? match.home_team : match.away_team
                      onPredict(id, winner)
                    }}
                  />
                ) : (
                  <TBDCard key={match.id} />
                )
              ))}

              {/* Fill remaining slots with TBD placeholders */}
              {Array.from({ length: placeholdersNeeded }, (_, i) => (
                <TBDCard key={`placeholder-${phase}-${i}`} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TBDCard() {
  return (
    <div className="bg-card border border-line rounded-xl p-4 flex items-center justify-between opacity-40">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Por definir</span>
      <div className="flex gap-2">
        <div className="w-10 h-8 rounded-lg bg-surface border border-line" />
        <div className="w-10 h-8 rounded-lg bg-surface border border-line" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Por definir</span>
    </div>
  )
}
