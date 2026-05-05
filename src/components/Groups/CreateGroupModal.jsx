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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Create Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Group Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Los Campeones"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Max Members (optional)</label>
            <input
              type="number"
              min="2"
              value={maxMembers}
              onChange={e => setMaxMembers(e.target.value)}
              placeholder="Unlimited"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          {error && <p className="text-danger text-xs">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => onClose(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
