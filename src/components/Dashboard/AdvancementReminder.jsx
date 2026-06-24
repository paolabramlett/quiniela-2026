import { useNavigate } from 'react-router-dom'
import { isMatchLocked } from '../../utils/scoring'

// Groups whose "¿Quién avanza?" pick is still missing (or incomplete) and
// whose lock deadline (the group's last match) hasn't passed yet.
function pendingGroups(matchesByGroup, advancementPredictions) {
  return Object.keys(matchesByGroup).filter(letter => {
    const matches = matchesByGroup[letter]
    const lastMatch = [...matches].sort((a, b) => new Date(b.kickoff_at) - new Date(a.kickoff_at))[0]
    if (!lastMatch || isMatchLocked(lastMatch.kickoff_at)) return false
    const picked = advancementPredictions[letter] ?? []
    return picked.length < 2
  }).sort()
}

export default function AdvancementReminder({ matchesByGroup = {}, advancementPredictions = {} }) {
  const navigate = useNavigate()
  const pending = pendingGroups(matchesByGroup, advancementPredictions)

  if (pending.length === 0) return null

  return (
    <button
      onClick={() => navigate('/predictions')}
      className="w-full bg-gold/10 border border-gold/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-left hover:border-gold transition-colors"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-1">
          ⚠ Te falta elegir avance
        </p>
        <p className="text-sm font-semibold text-white">
          Grupo{pending.length > 1 ? 's' : ''} {pending.join(', ')} — elige quién avanza antes de que cierre
        </p>
      </div>
      <span className="text-gold text-lg flex-shrink-0">›</span>
    </button>
  )
}
