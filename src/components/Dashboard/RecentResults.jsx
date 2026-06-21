// src/components/Dashboard/RecentResults.jsx
import { getFlag } from '../../utils/teamFlags'

const PHASE_LABELS = {
  group_stage: 'Grupo',
  r32:         'Dieciseisavos',
  r16:         'Octavos',
  qf:          'Cuartos',
  sf:          'Semifinal',
  final:       'Final',
}

function pickLabel(row) {
  // For group stage: translate 'home'/'draw'/'away' to a display string
  if (row.phase === 'group_stage') {
    if (row.user_pick === 'home') return row.home_team
    if (row.user_pick === 'away') return row.away_team
    return 'Empate'
  }
  // For knockout: pick is already the team name
  return row.user_pick
}

function phaseLabel(row) {
  const base = PHASE_LABELS[row.phase] ?? row.phase
  return row.group_letter ? `${base} ${row.group_letter}` : base
}

export default function RecentResults({ results, loading }) {
  if (loading || results.length === 0) return null

  return (
    <div className="bg-card border border-line rounded-2xl overflow-hidden">
      <div className="px-5 pt-4 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
          Últimos Resultados
        </p>
      </div>

      <div className="divide-y divide-line">
        {results.map((row) => (
          <div
            key={row.match_id}
            className="px-5 py-3 flex items-center gap-3"
          >
            {/* Score */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span aria-hidden="true">{getFlag(row.home_team)}</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {row.home_score} — {row.away_score}
              </span>
              <span aria-hidden="true">{getFlag(row.away_team)}</span>
            </div>

            {/* Phase + pick */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                {phaseLabel(row)}
              </span>
              <span className="text-[10px] text-gray-600"> · Tu pick: </span>
              <span className="text-[10px] text-white font-semibold">
                {pickLabel(row)}
              </span>
            </div>

            {/* Badge */}
            {row.is_correct ? (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
                ✓ Acertaste
              </span>
            ) : (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                ✗ Fallaste
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
