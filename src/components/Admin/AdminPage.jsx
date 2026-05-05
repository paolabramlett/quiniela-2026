import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdmin } from '../../hooks/useAdmin'
import MatchResultForm from './MatchResultForm'
import AdvancementResultForm from './AdvancementResultForm'

const PHASE_LABELS = { group_stage: 'Group Stage', r16: 'Round of 16', qf: 'Quarter-Finals', sf: 'Semi-Finals', final: 'Final' }
const ADMIN_PASSWORD = 'quiniela2026admin'

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminUnlocked', '1')
      onUnlock()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Admin Access</h1>
        <p className="text-sm text-gray-400 mb-6">Enter the admin password to continue</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="Password"
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
          {error && <p className="text-danger text-xs">Incorrect password</p>}
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { isAdmin, loading, matchesByPhase, results, advResults, saveMatchResult, saveAdvancementResult, syncMatches } = useAdmin()
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('adminUnlocked') === '1')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const data = await syncMatches()
      setSyncResult({ ok: true, msg: `Synced ${data.matchesUpserted} matches, ${data.resultsUpserted} results.` })
    } catch (err) {
      setSyncResult({ ok: false, msg: err.message })
    } finally {
      setSyncing(false)
    }
  }

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />
  if (loading) return <div className="text-center text-gray-400 mt-10">Checking access...</div>
  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Admin — Enter Results</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : '↻ Sync Matches'}
        </button>
      </div>
      {syncResult && (
        <p className={`text-sm mb-4 ${syncResult.ok ? 'text-green-600' : 'text-danger'}`}>{syncResult.msg}</p>
      )}

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
