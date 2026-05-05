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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Join Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Invite Code</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-primary"
            />
          </div>
          {error && <p className="text-danger text-xs">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500">Cancel</button>
            <button type="submit" disabled={loading || code.length !== 6} className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {loading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
