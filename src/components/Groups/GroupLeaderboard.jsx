import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function GroupLeaderboard({ groupId, fetchGroupLeaderboard }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupLeaderboard(groupId).then(setEntries).finally(() => setLoading(false))
  }, [groupId])

  if (loading) return <div className="text-center text-gray-400 py-4">Cargando...</div>

  return (
    <div className="space-y-2 mt-3">
      {entries.map(entry => (
        <div key={entry.user_id} className={`flex items-center gap-3 p-3 rounded-xl shadow-sm ${entry.user_id === user?.id ? 'bg-primary/10 border border-primary/30' : 'bg-white'}`}>
          <span className="w-6 text-xs font-bold text-gray-400">#{entry.rank}</span>
          <span className="flex-1 text-sm font-medium">{entry.display_name}</span>
          <span className="text-sm font-bold text-primary">{entry.total_points} pts</span>
        </div>
      ))}
      {entries.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nadie ha anotado puntos aún.</p>}
    </div>
  )
}
