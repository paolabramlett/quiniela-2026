// src/components/Groups/GroupsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useGroups } from '../../hooks/useGroups'
import CreateGroupModal from './CreateGroupModal'
import JoinGroupModal from './JoinGroupModal'
import GroupLeaderboard from './GroupLeaderboard'
import PaywallModal from './PaywallModal'
import PaymentSuccessScreen from './PaymentSuccessScreen'

export default function GroupsPage() {
  const { user } = useAuth()
  const {
    groups, loading, error,
    credits, slotsAvailable, canCreateGroup,
    createGroup, joinGroup, updateGroup, deleteGroup, leaveGroup,
    fetchGroupLeaderboard, fetchGroupMembers, removeMember, fetchCredits,
    maxGroups,
  } = useGroups()

  const [searchParams, setSearchParams] = useSearchParams()
  const paymentParam = searchParams.get('payment')

  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false) // false | 'pack' | 'addon'
  const [checkoutError, setCheckoutError] = useState(null)
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [editName, setEditName] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState(null)
  const [cancelledMsg, setCancelledMsg] = useState(false)

  // Handle ?payment=success|cancelled on mount
  useEffect(() => {
    if (paymentParam === 'success') {
      fetchCredits() // refresh credits from DB
      setShowSuccess(true)
      setSearchParams({}, { replace: true })
    } else if (paymentParam === 'cancelled') {
      setCancelledMsg(true)
      setShowPaywall(true)
      setSearchParams({}, { replace: true })
    }
  }, [paymentParam])

  const handleCreateClick = () => {
    if (canCreateGroup) {
      setShowCreate(true)
    } else {
      setCancelledMsg(false)
      setCheckoutError(null)
      setShowPaywall(true)
    }
  }

  const handleCheckout = useCallback(async (product) => {
    setCheckoutLoading(product)
    setCheckoutError(null)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { product },
      })
      if (error) throw error
      window.location.href = data.url
    } catch (err) {
      setCheckoutError('No pudimos conectar con el sistema de pagos. Intenta de nuevo.')
      setCheckoutLoading(false)
    }
  }, [])

  const atLimit = groups.length >= maxGroups

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const startEdit = (e, group) => {
    e.stopPropagation()
    setEditingGroup(group.id)
    setEditName(group.name)
  }

  const saveEdit = async (groupId) => {
    if (!editName.trim()) return
    setSavingEdit(true)
    try {
      await updateGroup(groupId, { name: editName.trim() })
      setEditingGroup(null)
    } finally {
      setSavingEdit(false)
    }
  }

  const confirmDelete = async (groupId) => {
    const group = groups.find(g => g.id === groupId)
    const isCreator = group?.created_by === user?.id
    if (isCreator) {
      await deleteGroup(groupId)
    } else {
      await leaveGroup(groupId)
    }
    setDeletingGroup(null)
    if (expandedGroup === groupId) setExpandedGroup(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center mt-20">
      <p className="text-gray-600 text-sm font-semibold uppercase tracking-widest">Cargando...</p>
    </div>
  )
  if (error) return <div className="text-center text-danger mt-10 text-sm">{error}</div>

  return (
    <div>
      {/* Success screen overlay */}
      {showSuccess && (
        <PaymentSuccessScreen
          slotsAvailable={slotsAvailable}
          onDismiss={() => { setShowSuccess(false); setShowCreate(true) }}
        />
      )}

      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-0.5">Gestiona</p>
        <h1 className="font-display text-4xl tracking-wider text-white">MIS GRUPOS</h1>
      </div>

      {/* Slots indicator for paying users */}
      {!canCreateGroup && credits !== null && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 mb-5 text-sm text-gold font-semibold">
          Necesitas comprar slots para crear grupos.
        </div>
      )}
      {canCreateGroup && credits?.slots_purchased > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 mb-5 text-sm text-accent font-semibold">
          {slotsAvailable} slot{slotsAvailable !== 1 ? 's' : ''} disponible{slotsAvailable !== 1 ? 's' : ''} para crear grupos.
        </div>
      )}

      {/* Limit warning */}
      {atLimit && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 mb-5 text-sm text-gold font-semibold">
          Límite de {maxGroups} grupos alcanzado — sal de uno para unirte o crear otro.
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleCreateClick}
          disabled={atLimit}
          className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-red-600 transition-colors"
        >
          {canCreateGroup ? '+ Crear Grupo' : '🔒 Crear Grupo'}
        </button>
        <button
          onClick={() => setShowJoin(true)}
          disabled={atLimit}
          className="flex-1 py-3 border border-line text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:border-gray-500 hover:text-white transition-colors"
        >
          Unirse
        </button>
      </div>

      {/* Groups list */}
      <div className="space-y-3">
        {groups.map(group => {
          const isCreator = group.created_by === user?.id
          const isEditing = editingGroup === group.id
          const isConfirmingDelete = deletingGroup === group.id

          return (
            <div key={group.id} className="bg-card border border-line rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-surface transition-colors"
                onClick={() => !isEditing && setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              >
                <div className="flex-1 min-w-0 mr-3">
                  {isEditing ? (
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(group.id); if (e.key === 'Escape') setEditingGroup(null) }}
                        className="flex-1 bg-surface border border-primary rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(group.id)} disabled={savingEdit} className="text-xs text-primary font-bold uppercase tracking-wider">
                        {savingEdit ? '...' : 'OK'}
                      </button>
                      <button onClick={() => setEditingGroup(null)} className="text-xs text-gray-600 uppercase tracking-wider font-bold">✕</button>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-white truncate">{group.name}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 font-mono tracking-[0.2em]">
                        {group.invite_code}
                        <span className="ml-2 font-sans not-italic normal-case tracking-normal">
                          · {group.group_members?.[0]?.count ?? 0} participante{group.group_members?.[0]?.count !== 1 ? 's' : ''}
                        </span>
                      </p>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); copyCode(group.invite_code) }}
                      className="text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:text-accent transition-colors"
                    >
                      {copiedCode === group.invite_code ? '✓ Copiado' : 'Copiar'}
                    </button>
                    {isCreator && (
                      <button
                        onClick={e => startEdit(e, group)}
                        className="text-gray-700 hover:text-white transition-colors text-sm"
                        title="Editar nombre"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); setDeletingGroup(group.id) }}
                      className="text-gray-700 hover:text-danger transition-colors text-sm"
                      title={isCreator ? 'Eliminar grupo' : 'Salir del grupo'}
                    >
                      {isCreator ? '🗑️' : '↩️'}
                    </button>
                    <span className="text-gray-700 text-xs">{expandedGroup === group.id ? '▲' : '▼'}</span>
                  </div>
                )}
              </div>

              {isConfirmingDelete && (
                <div
                  className="border-t border-line px-4 py-3 bg-danger/5 flex items-center justify-between gap-3"
                  onClick={e => e.stopPropagation()}
                >
                  <p className="text-sm text-danger font-semibold">
                    {isCreator ? '¿Eliminar este grupo?' : '¿Salir de este grupo?'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeletingGroup(null)}
                      className="text-xs text-gray-500 border border-line rounded-lg px-3 py-1.5 hover:border-gray-500 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => confirmDelete(group.id)}
                      className="text-xs text-white bg-danger rounded-lg px-3 py-1.5 font-bold"
                    >
                      {isCreator ? 'Eliminar' : 'Salir'}
                    </button>
                  </div>
                </div>
              )}

              {expandedGroup === group.id && !isConfirmingDelete && (
                <div className="border-t border-line px-4 pb-4">
                  <GroupLeaderboard
                    groupId={group.id}
                    fetchGroupMembers={fetchGroupMembers}
                    removeMember={removeMember}
                    isCreator={isCreator}
                    currentUserId={user?.id}
                  />
                </div>
              )}
            </div>
          )
        })}

        {groups.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-6xl text-line mb-4">GRP</p>
            <p className="text-sm text-gray-600 uppercase tracking-widest font-bold">
              Aún no te has unido a ningún grupo
            </p>
          </div>
        )}
      </div>

      {showPaywall && (
        <PaywallModal
          onClose={() => { setShowPaywall(false); setCancelledMsg(false) }}
          onCheckout={handleCheckout}
          slotsAvailable={slotsAvailable}
          loading={checkoutLoading}
          error={cancelledMsg ? 'El pago fue cancelado. Intenta de nuevo cuando quieras.' : checkoutError}
        />
      )}

      {showCreate && (
        <CreateGroupModal
          onCreate={createGroup}
          onClose={(group) => { setShowCreate(false); if (group) setExpandedGroup(group.id) }}
        />
      )}
      {showJoin && <JoinGroupModal onJoin={joinGroup} onClose={() => setShowJoin(false)} />}
    </div>
  )
}
