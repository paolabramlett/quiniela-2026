import { useState } from 'react'

export default function AdvancementResultForm({ groupLetter, teams, existingResult, onSave }) {
  const [team1, setTeam1] = useState(existingResult?.team_1 ?? '')
  const [team2, setTeam2] = useState(existingResult?.team_2 ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const toggle = (team) => {
    if (team1 === team) { setTeam1(''); return }
    if (team2 === team) { setTeam2(''); return }
    if (!team1) { setTeam1(team); return }
    if (!team2) { setTeam2(team); return }
  }

  const selected = [team1, team2].filter(Boolean)

  const handleSave = async () => {
    if (selected.length !== 2) return
    setSaving(true)
    setError(null)
    try {
      await onSave(groupLetter, { team1, team2 })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">Group {groupLetter} — Advancement</p>
        {existingResult && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Entered</span>}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {teams.map(team => (
          <button
            key={team}
            onClick={() => toggle(team)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
              ${selected.includes(team) ? 'bg-primary text-white border-primary' : 'bg-bg text-gray-600 border-gray-200'}`}
          >
            {team}
          </button>
        ))}
      </div>
      {error && <p className="text-danger text-xs mb-2">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving || selected.length !== 2}
        className="w-full py-2 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-40"
      >
        {saving ? 'Saving...' : 'Save Advancement'}
      </button>
    </div>
  )
}
