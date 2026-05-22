import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

function StatCard({ label, value }) {
  return (
    <div className="bg-card border border-line rounded-xl p-4 flex flex-col gap-1">
      <h2 className="font-display text-3xl text-white">{value}</h2>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">{label}</p>
    </div>
  )
}

function Avatar({ name, avatarUrl }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />
  }
  const initials = name
    ? name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  return (
    <div className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-[10px] font-bold text-gray-400">
      {initials}
    </div>
  )
}

function Badge({ slots_purchased, granted_free }) {
  // Check granted_free first — free users also have slots_purchased > 0
  if (granted_free) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
        Gratuito
      </span>
    )
  }
  if (slots_purchased > 0) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
        Pagador
      </span>
    )
  }
  return <span className="text-gray-700">—</span>
}

export default function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data, error: err } = await supabase.rpc('get_users_report')
      if (err) {
        setError(err.message)
      } else {
        setUsers(data ?? [])
      }
      setLoading(false)
    }
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <p className="text-gray-600 text-sm font-bold uppercase tracking-widest mt-4">
        Cargando usuarios...
      </p>
    )
  }

  if (error) {
    return (
      <p className="text-danger text-sm font-semibold mt-4">
        Error al cargar usuarios: {error}
      </p>
    )
  }

  const totalUsers = users.length
  const payingUsers = users.filter(u => u.slots_purchased > 0 && !u.granted_free).length
  const freeUsers = users.filter(u => u.granted_free).length

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total usuarios" value={totalUsers} />
        <StatCard label="Usuarios pagadores" value={payingUsers} />
        <StatCard label="Accesos gratuitos" value={freeUsers} />
      </div>

      {/* User list */}
      {users.length === 0 ? (
        <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">
          No hay usuarios registrados
        </p>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              className="bg-card border border-line rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <Avatar name={user.display_name} avatarUrl={user.avatar_url} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.display_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <p className="text-xs text-gray-600 hidden sm:block shrink-0">
                {new Date(user.created_at).toLocaleDateString('es-MX', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </p>
              <div className="shrink-0">
                <Badge slots_purchased={user.slots_purchased} granted_free={user.granted_free} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
