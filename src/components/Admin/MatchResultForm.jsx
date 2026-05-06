import { useState } from 'react'

export default function MatchResultForm({ match, existingResult, onSave }) {
  const isGroupStage = match.phase === 'group_stage'
  const [result, setResult] = useState(existingResult?.result ?? '')
  const [winner, setWinner] = useState(existingResult?.winner_team ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (isGroupStage) {
        await onSave(match.id, { result, winner_team: null })
      } else {
        await onSave(match.id, { result: null, winner_team: winner })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">
          {match.home_team} vs {match.away_team}
        </p>
        {existingResult && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Guardado</span>}
      </div>

      {isGroupStage ? (
        <div className="flex gap-2">
          {['home', 'draw', 'away'].map(opt => (
            <button
              key={opt}
              onClick={() => setResult(opt)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                ${result === opt ? 'bg-primary text-white border-primary' : 'bg-bg text-gray-600 border-gray-200'}`}
            >
              {opt === 'home' ? match.home_team : opt === 'away' ? match.away_team : 'Empate'}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          {[match.home_team, match.away_team].map(team => (
            <button
              key={team}
              onClick={() => setWinner(team)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                ${winner === team ? 'bg-primary text-white border-primary' : 'bg-bg text-gray-600 border-gray-200'}`}
            >
              {team}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-danger text-xs mt-2">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || (isGroupStage ? !result : !winner)}
        className="mt-3 w-full py-2 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-40"
      >
        {saving ? 'Guardando...' : 'Guardar Resultado'}
      </button>
    </div>
  )
}
