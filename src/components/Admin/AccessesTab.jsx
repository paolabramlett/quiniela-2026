// src/components/Admin/AccessesTab.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'

export default function AccessesTab() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)   // { user, credits } | null
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null) // { ok, text }

  // Always-visible list of users with free access
  const [freeUsers, setFreeUsers] = useState([])
  const [loadingFree, setLoadingFree] = useState(true)

  const fetchFreeUsers = async () => {
    setLoadingFree(true)
    const { data } = await supabase.rpc('get_users_report')
    setFreeUsers((data ?? []).filter(u => u.granted_free))
    setLoadingFree(false)
  }

  useEffect(() => { fetchFreeUsers() }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSearching(true)
    setResult(null)
    setMessage(null)

    try {
      const { data: userData, error: userErr } = await supabase
        .rpc('get_user_by_email', { p_email: email.trim().toLowerCase() })

      if (userErr || !userData?.[0]?.id) {
        setMessage({ ok: false, text: 'Usuario no encontrado.' })
        return
      }

      const user = userData[0]

      const { data: credits, error: creditsErr } = await supabase
        .from('group_credits')
        .select('slots_purchased, granted_free')
        .eq('user_id', user.id)
        .maybeSingle()

      if (creditsErr) {
        setMessage({ ok: false, text: 'Error cargando créditos del usuario.' })
        return
      }

      setResult({
        user,
        credits: credits ?? { slots_purchased: 0, granted_free: false },
      })
    } finally {
      setSearching(false)
    }
  }

  const handleGrant = async () => {
    if (!result) return
    setSaving(true)
    setMessage(null)
    try {
      // Free grant gives exactly 1 slot. If they already have paid slots, keep the higher count.
      const newSlots = Math.max(result.credits.slots_purchased, 1)
      const { error } = await supabase
        .from('group_credits')
        .upsert({
          user_id: result.user.id,
          slots_purchased: newSlots,
          granted_free: true,
        }, { onConflict: 'user_id' })

      if (error) throw error
      setResult(prev => ({ ...prev, credits: { slots_purchased: newSlots, granted_free: true } }))
      setMessage({ ok: true, text: `Acceso gratuito otorgado a ${result.user.display_name}.` })
      fetchFreeUsers() // refresh the always-visible list
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleRevoke = async (userId, displayName, isFromList = false) => {
    setSaving(true)
    setMessage(null)
    try {
      const { error } = await supabase
        .from('group_credits')
        // Revoke zeroes out all slots (both paid and free) per spec:
        // "Revoke access: sets granted_free = false, slots_purchased = 0"
        .upsert({
          user_id: userId,
          slots_purchased: 0,
          granted_free: false,
        }, { onConflict: 'user_id' })

      if (error) throw error
      setMessage({ ok: true, text: `Acceso revocado para ${displayName}.` })
      if (!isFromList) {
        setResult(prev => ({ ...prev, credits: { slots_purchased: 0, granted_free: false } }))
      }
      fetchFreeUsers() // refresh the always-visible list
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Always-visible free access list */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
            Accesos gratuitos activos
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {loadingFree ? (
          <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Cargando...</p>
        ) : freeUsers.length === 0 ? (
          <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Ningún usuario con acceso gratuito</p>
        ) : (
          <div className="space-y-2">
            {freeUsers.map(u => (
              <div key={u.id} className="bg-surface border border-line rounded-xl px-4 py-3 flex items-center gap-3">
                {u.avatar_url
                  ? <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  : <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {u.display_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.display_name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <button
                  onClick={() => handleRevoke(u.id, u.display_name, true)}
                  disabled={saving}
                  className="shrink-0 px-3 py-1.5 border border-danger/40 text-danger rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-danger/10 transition-colors"
                >
                  Revocar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search to grant access to a new user */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
            Otorgar o gestionar acceso
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            type="email"
            className="flex-1 bg-surface border border-line rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-red-600 transition-colors"
          >
            {searching ? '...' : 'Buscar'}
          </button>
        </form>

        {message && (
          <p className={`text-xs font-semibold mb-4 ${message.ok ? 'text-accent' : 'text-danger'}`}>
            {message.text}
          </p>
        )}

        {result && (
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              {result.user.avatar_url
                ? <img src={result.user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                : <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center text-white font-bold text-sm">
                    {result.user.display_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
              }
              <div>
                <p className="font-semibold text-white text-sm">{result.user.display_name}</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                  {result.credits.granted_free ? '✓ Acceso gratuito' : result.credits.slots_purchased > 0 ? 'Usuario de pago' : 'Sin acceso'}
                  {' · '}{result.credits.slots_purchased} slot{result.credits.slots_purchased !== 1 ? 's' : ''} comprados
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGrant}
                disabled={saving || result.credits.granted_free}
                className="flex-1 py-2.5 bg-accent/20 border border-accent/40 text-accent rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-accent/30 transition-colors"
              >
                {saving ? '...' : 'Otorgar acceso gratuito'}
              </button>
              <button
                onClick={() => handleRevoke(result.user.id, result.user.display_name)}
                disabled={saving || (!result.credits.granted_free && result.credits.slots_purchased === 0)}
                className="flex-1 py-2.5 border border-danger/40 text-danger rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-danger/10 transition-colors"
              >
                {saving ? '...' : 'Revocar todo el acceso'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
