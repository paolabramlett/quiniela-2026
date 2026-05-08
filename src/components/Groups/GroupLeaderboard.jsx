import { useState, useEffect, useCallback } from 'react'

function InitialsAvatar({ name, size = 'md' }) {
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'

  // Deterministic color from name
  const colors = [
    'bg-primary/80', 'bg-accent/80', 'bg-gold/80',
    'bg-purple-600/80', 'bg-blue-600/80', 'bg-green-600/80',
  ]
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0
  const colorClass = colors[colorIndex]

  return (
    <div className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function GroupLeaderboard({ groupId, fetchGroupMembers, removeMember, isCreator, currentUserId }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null) // user_id pending confirm

  const load = useCallback(() => {
    setLoading(true)
    fetchGroupMembers(groupId)
      .then(setMembers)
      .finally(() => setLoading(false))
  }, [groupId, fetchGroupMembers])

  useEffect(() => { load() }, [load])

  const handleRemove = async (userId) => {
    setRemovingId(userId)
    try {
      await removeMember(groupId, userId)
      setMembers(prev => prev.filter(m => m.user_id !== userId))
    } finally {
      setRemovingId(null)
      setConfirmRemove(null)
    }
  }

  if (loading) return (
    <div className="text-center py-6">
      <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Cargando...</p>
    </div>
  )

  if (members.length === 0) return (
    <p className="text-xs text-gray-700 text-center py-6 uppercase tracking-widest font-bold">
      Nadie en este grupo aún
    </p>
  )

  return (
    <div className="mt-3">
      {/* Member count header */}
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-3">
        {members.length} participante{members.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-1.5">
        {members.map((member, idx) => {
          const isMe = member.user_id === currentUserId
          const isConfirming = confirmRemove === member.user_id
          const canRemove = isCreator && !isMe

          return (
            <div key={member.user_id}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors
                ${isMe ? 'bg-primary/10 border-primary/30' : 'bg-surface border-line'}`}
              >
                {/* Rank number */}
                <span className={`font-display text-base w-5 text-center leading-none flex-shrink-0 ${
                  idx === 0 ? 'text-gold' : isMe ? 'text-primary' : 'text-gray-600'
                }`}>
                  {idx + 1}
                </span>

                {/* Avatar */}
                {member.avatar_url
                  ? <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  : <InitialsAvatar name={member.display_name} />
                }

                {/* Name */}
                <span className={`flex-1 text-sm font-semibold truncate ${isMe ? 'text-white' : 'text-gray-300'}`}>
                  {member.display_name ?? 'Jugador'}
                  {isMe && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-primary">Tú</span>
                  )}
                </span>

                {/* Points */}
                <span className={`font-display text-lg leading-none flex-shrink-0 ${
                  idx === 0 ? 'text-gold' : isMe ? 'text-primary' : 'text-white'
                }`}>
                  {member.total_points}
                  <span className="text-[10px] text-gray-600 ml-0.5 font-sans font-bold">pts</span>
                </span>

                {/* Remove button — only for creator, not self */}
                {canRemove && !isConfirming && (
                  <button
                    onClick={() => setConfirmRemove(member.user_id)}
                    className="text-gray-700 hover:text-danger transition-colors text-xs ml-1 flex-shrink-0"
                    title="Eliminar del grupo"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Inline confirm strip */}
              {isConfirming && (
                <div className="flex items-center justify-between gap-3 px-3 py-2 bg-danger/5 border border-danger/20 rounded-xl mt-1">
                  <p className="text-xs text-danger font-semibold">
                    ¿Eliminar a {member.display_name}?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmRemove(null)}
                      className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleRemove(member.user_id)}
                      disabled={removingId === member.user_id}
                      className="text-[10px] font-bold uppercase tracking-wider text-danger hover:text-white transition-colors disabled:opacity-50"
                    >
                      {removingId === member.user_id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
