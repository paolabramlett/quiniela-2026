import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdmin } from '../../hooks/useAdmin'
import MatchResultForm from './MatchResultForm'
import AdvancementResultForm from './AdvancementResultForm'
import AccessesTab from './AccessesTab'
import UsersTab from './UsersTab'

const PHASE_LABELS = { group_stage: 'Fase de Grupos', r32: 'Dieciseisavos de Final', r16: 'Octavos de Final', qf: 'Cuartos de Final', sf: 'Semifinales', final: 'Final' }
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
      <div className="bg-card border border-line rounded-2xl p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl tracking-wider text-white mb-1">ACCESO ADMIN</h1>
        <p className="text-xs text-gray-600 mb-6 uppercase tracking-widest font-semibold">Solo para administradores</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="Contraseña"
            autoFocus
            className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors"
          />
          {error && <p className="text-danger text-xs font-semibold">Contraseña incorrecta</p>}
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors">
            Ingresar
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
  const [activeTab, setActiveTab] = useState('resultados')

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const data = await syncMatches()
      setSyncResult({ ok: true, msg: `Sincronizados ${data.matchesUpserted} partidos, ${data.resultsUpserted} resultados.` })
    } catch (err) {
      setSyncResult({ ok: false, msg: err.message })
    } finally {
      setSyncing(false)
    }
  }

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />
  if (loading) return (
    <div className="flex items-center justify-center mt-20">
      <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">Verificando...</p>
    </div>
  )
  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-0.5">Panel</p>
          <h1 className="font-display text-3xl tracking-wider text-white">ADMIN</h1>
        </div>
        {activeTab === 'resultados' && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-surface border border-line text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-40 hover:border-gray-500 hover:text-white transition-colors"
          >
            {syncing ? 'Sincronizando...' : '↻ Sincronizar'}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 bg-surface border border-line rounded-xl p-1">
        <button
          onClick={() => setActiveTab('resultados')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'resultados' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Resultados
        </button>
        <button
          onClick={() => setActiveTab('accesos')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'accesos' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Accesos
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'usuarios' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Usuarios
        </button>
      </div>

      {activeTab === 'resultados' && (
        <>
          {syncResult && (
            <p className={`text-xs font-semibold mb-4 ${syncResult.ok ? 'text-accent' : 'text-danger'}`}>{syncResult.msg}</p>
          )}

          {['group_stage', 'r32', 'r16', 'qf', 'sf', 'final'].map(phase => (
            matchesByPhase[phase]?.length > 0 && (
              <div key={phase} className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                    {PHASE_LABELS[phase]}
                  </span>
                  <div className="h-px flex-1 bg-line" />
                </div>
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
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                  Clasificación de Grupos
                </span>
                <div className="h-px flex-1 bg-line" />
              </div>
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
        </>
      )}

      {activeTab === 'accesos' && <AccessesTab />}
      {activeTab === 'usuarios' && <UsersTab />}
    </div>
  )
}
