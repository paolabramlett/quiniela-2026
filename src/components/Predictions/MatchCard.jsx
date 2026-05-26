import { isMatchLocked, getCountdownLabel } from '../../utils/scoring'
import { getFlag } from '../../utils/teamFlags'

// Per-choice colors — home=red, draw=gold, away=teal (WC2026 palette)
const CHOICE_SELECTED = {
  home: 'bg-primary border-primary text-white',
  draw: 'bg-gold border-gold text-black',
  away: 'bg-accent border-accent text-black',
}

// showDraw=false for knockout rounds (no draw possible)
export default function MatchCard({ match, prediction, onPredict, showDraw = true }) {
  const locked = isMatchLocked(match.kickoff_at)
  const countdown = getCountdownLabel(match.kickoff_at)
  const isUrgent = !locked && countdown && !countdown.includes('h')

  const choices = [
    { value: 'home', label: '1', ariaLabel: match.home_team },
    ...(showDraw ? [{ value: 'draw', label: 'X', ariaLabel: 'draw' }] : []),
    { value: 'away', label: '2', ariaLabel: match.away_team },
  ]

  return (
    <div className={`bg-card border border-line rounded-xl overflow-hidden transition-opacity ${locked ? 'opacity-50' : ''}`}>
      {/* Match row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Home team */}
        <span className="flex-1 text-sm font-semibold text-white truncate">
          <span className="mr-1.5" aria-hidden="true">{getFlag(match.home_team)}</span>{match.home_team}
        </span>

        {/* Pick buttons */}
        <div className="flex gap-1.5 flex-shrink-0">
          {choices.map(({ value, label, ariaLabel }) => {
            const isSelected = prediction === value
            return (
              <button
                key={value}
                disabled={locked}
                onClick={() => onPredict(match.id, isSelected ? null : value)}
                aria-label={ariaLabel}
                className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all
                  ${isSelected
                    ? CHOICE_SELECTED[value]
                    : 'bg-surface border-line text-gray-500 hover:border-gray-400 hover:text-white'
                  }
                  disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Away team */}
        <span className="flex-1 text-sm font-semibold text-white truncate text-right">
          {match.away_team}<span className="ml-1.5" aria-hidden="true">{getFlag(match.away_team)}</span>
        </span>
      </div>

      {/* Countdown / lock bar */}
      {countdown && (
        <div className={`px-4 pb-2.5 flex justify-end`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${
            locked ? 'text-gray-700' : isUrgent ? 'text-primary' : 'text-gray-700'
          }`}>
            {locked ? '🔒 Cerrado' : `⏱ ${countdown}`}
          </span>
        </div>
      )}
    </div>
  )
}
