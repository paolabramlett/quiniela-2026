import { isMatchLocked, getCountdownLabel } from '../../utils/scoring'

// showDraw=false for knockout rounds (no draw possible)
export default function MatchCard({ match, prediction, onPredict, showDraw = true }) {
  const locked = isMatchLocked(match.kickoff_at)
  const countdown = getCountdownLabel(match.kickoff_at)
  const isUrgent = locked || (countdown && !countdown.includes('h'))

  const choices = [
    { value: 'home', label: match.home_team, ariaLabel: match.home_team },
    ...(showDraw ? [{ value: 'draw', label: 'Empate', ariaLabel: 'draw' }] : []),
    { value: 'away', label: match.away_team, ariaLabel: match.away_team },
  ]

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 ${locked ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-700 flex-1">{match.home_team}</span>

        <div className="flex gap-2">
          {choices.map(({ value, label, ariaLabel }) => {
            const isSelected = prediction === value
            return (
              <button
                key={value}
                disabled={locked}
                onClick={() => onPredict(match.id, value)}
                aria-label={ariaLabel}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border
                  ${isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg text-gray-600 border-gray-200 hover:border-primary'
                  }
                  disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <span className="text-sm font-medium text-gray-700 flex-1 text-right">{match.away_team}</span>
      </div>

      {countdown && (
        <p className={`text-xs mt-2 text-right font-medium ${isUrgent ? 'text-danger' : 'text-gray-400'}`}>
          {locked ? '🔒 Locked' : `⏱ ${countdown}`}
        </p>
      )}
    </div>
  )
}
