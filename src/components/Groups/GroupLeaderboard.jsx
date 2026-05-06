import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function GroupLeaderboard({ groupId, fetchGroupLeaderboard }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroupLeaderboard(groupId).then(setEntries).finally(() => setLoading(false))
  }, [groupId])

  if (loading) return (
    <div className="text-center py-6">
      <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Cargando...</p>
    </div>
  )

  if (entries.length === 0) return (
    <p className="text-xs text-gray-700 text-center py-6 uppercase tracking-widest font-bold">
      Nadie ha anotado puntos aún
    </p>
  )

  return (
    <div className="space-y-2 mt-3">
      {entries.map(entry => {
        const isMe = entry.user_id === user?.id
        return (
          <div
            key={entry.user_id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors
              ${isMe ? 'bg-primary/10 border-primary/30' : 'bg-surface border-line'}`}
          >
            <span className={`font-display text-lg w-6 text-center leading-none ${isMe ? 'text-primary' : 'text-gray-600'}`}>
              {entry.rank}
            </span>
            <span className={`flex-1 text-sm font-semibold truncate ${isMe ? 'text-white' : 'text-gray-300'}`}>
              {entry.display_name}
            </span>
            <span className={`font-display text-lg leading-none ${isMe ? 'text-primary' : 'text-white'}`}>
              {entry.total_points}
              <span className="text-[10px] text-gray-600 ml-0.5 font-sans font-bold">pts</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
