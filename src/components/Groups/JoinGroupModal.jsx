import { useState } from 'react'

export default function JoinGroupModal({ onJoin, onClose }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== 6) return
    setLoading(true)
    setError(null)
    try {
      await onJoin(code)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
      <div className="bg-card border border-line rounded-2xl p-6 w-full max-w-sm">
        <h2 className="font-display text-2xl tracking-wider text-white mb-5">UNIRSE A GRUPO</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 block mb-1.5">
              Código de invitación
            </label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              className="w-full bg-surface border border-line rounded-lg px-3 py-2.5 text-sm font-mono tracking-[0.3em] text-center text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {error && <p className="text-danger text-xs font-semibold">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-line text-gray-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-gray-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-red-600 transition-colors"
            >
              {loading ? '...' : 'Unirse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
