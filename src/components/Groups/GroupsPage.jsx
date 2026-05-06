import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useGroups } from '../../hooks/useGroups'
import CreateGroupModal from './CreateGroupModal'
import JoinGroupModal from './JoinGroupModal'
import GroupLeaderboard from './GroupLeaderboard'

export default function GroupsPage() {
  const { user } = useAuth()
  const { groups, loading, error, createGroup, joinGroup, updateGroup, deleteGroup, leaveGroup, fetchGroupLeaderboard, maxGroups } = useGroups()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null) // { id, name }
  const [editName, setEditName] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState(null) // group id pending confirm

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

  if (loading) return <div className="text-center text-gray-400 mt-10">Cargando grupos...</div>
  if (error) return <div className="text-center text-danger mt-10">Error: {error}</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Mis Grupos</h1>

      {atLimit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-sm text-yellow-800">
          Alcanzaste el límite de {maxGroups} grupos. Sal de uno para poder unirte o crear otro.
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowCreate(true)}
          disabled={atLimit}
          className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-40"
        >
          + Crear Grupo
        </button>
        <button
          onClick={() => setShowJoin(true)}
          disabled={atLimit}
          className="flex-1 py-2.5 border border-primary text-primary rounded-xl text-sm font-semibold disabled:opacity-40"
        >
          Unirse a un Grupo
        </button>
      </div>

      <div className="space-y-3">
        {groups.map(group => {
          const isCreator = group.created_by === user?.id
          const isEditing = editingGroup === group.id
          const isConfirmingDelete = deletingGroup === group.id

          return (
            <div key={group.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => !isEditing && setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              >
                <div className="flex-1 min-w-0 mr-3">
                  {isEditing ? (
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(group.id); if (e.key === 'Escape') setEditingGroup(null) }}
                        className="flex-1 border border-primary rounded-lg px-2 py-1 text-sm focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(group.id)} disabled={savingEdit} className="text-xs text-primary font-semibold">
                        {savingEdit ? '...' : 'Guardar'}
                      </button>
                      <button onClick={() => setEditingGroup(null)} className="text-xs text-gray-400">Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-800 truncate">{group.name}</p>
                      <p className="text-xs text-gray-400">
                        Código: <span className="font-mono font-bold tracking-wider text-gray-600">{group.invite_code}</span>
                      </p>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); copyCode(group.invite_code) }} className="text-xs text-primary font-medium">
                      {copiedCode === group.invite_code ? '✓ Copiado' : 'Copiar'}
                    </button>
                    {isCreator && (
                      <button onClick={e => startEdit(e, group)} className="text-gray-400 hover:text-gray-600 text-sm" title="Editar nombre">✏️</button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); setDeletingGroup(group.id) }}
                      className="text-gray-400 hover:text-danger text-sm"
                      title={isCreator ? 'Eliminar grupo' : 'Salir del grupo'}
                    >
                      {isCreator ? '🗑️' : '↩️'}
                    </button>
                    <span className="text-gray-400 text-sm">{expandedGroup === group.id ? '▲' : '▼'}</span>
                  </div>
                )}
              </div>

              {isConfirmingDelete && (
                <div className="border-t border-gray-100 px-4 py-3 bg-red-50 flex items-center justify-between gap-3" onClick={e => e.stopPropagation()}>
                  <p className="text-sm text-danger font-medium">
                    {isCreator ? '¿Eliminar este grupo?' : '¿Salir de este grupo?'}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setDeletingGroup(null)} className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5">Cancelar</button>
                    <button onClick={() => confirmDelete(group.id)} className="text-xs text-white bg-danger rounded-lg px-3 py-1.5 font-semibold">
                      {isCreator ? 'Eliminar' : 'Salir'}
                    </button>
                  </div>
                </div>
              )}

              {expandedGroup === group.id && !isConfirmingDelete && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  <GroupLeaderboard groupId={group.id} fetchGroupLeaderboard={fetchGroupLeaderboard} />
                </div>
              )}
            </div>
          )
        })}

        {groups.length === 0 && (
          <p className="text-center text-gray-400 mt-10">Aún no te has unido a ningún grupo.</p>
        )}
      </div>

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
