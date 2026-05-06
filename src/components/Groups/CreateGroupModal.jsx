import { useState } from 'react'

export default function CreateGroupModal({ onCreate, onClose }) {
  const [name, setName] = useState('')
  const [maxMembers, setMaxMembers] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const group = await onCreate({ name: name.trim(), maxMembers: maxMembers ? parseInt(maxMembers) : null })
      onClose(group)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
      <div className="bg-card border border-line rounded-2xl p-6 w-full max-w-sm">
        <h2 className="font-display text-2xl tracking-wider text-white mb-5">CREAR GRUPO</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 block mb-1.5">
              Nombre del grupo
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Los Campeones"
              className="w-full bg-surface border border-line rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 block mb-1.5">
              Máx. de integrantes <span className="text-gray-700">(opcional)</span>
            </label>
            <input
              type="number"
              min="2"
              value={maxMembers}
              onChange={e => setMaxMembers(e.target.value)}
              placeholder="Sin límite"
              className="w-full bg-surface border border-line rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {error && <p className="text-danger text-xs font-semibold">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="flex-1 py-2.5 border border-line text-gray-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-gray-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-red-600 transition-colors"
            >
              {loading ? '...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
