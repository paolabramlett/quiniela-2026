import { useState } from 'react'
import { useGroups } from '../../hooks/useGroups'
import CreateGroupModal from './CreateGroupModal'
import JoinGroupModal from './JoinGroupModal'
import GroupLeaderboard from './GroupLeaderboard'

export default function GroupsPage() {
  const { groups, loading, error, createGroup, joinGroup, fetchGroupLeaderboard } = useGroups()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading) return <div className="text-center text-gray-400 mt-10">Cargando grupos...</div>
  if (error) return <div className="text-center text-danger mt-10">Error: {error}</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Mis Grupos</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setShowCreate(true)} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold">+ Crear Grupo</button>
        <button onClick={() => setShowJoin(true)} className="flex-1 py-2.5 border border-primary text-primary rounded-xl text-sm font-semibold">Unirse a un Grupo</button>
      </div>

      <div className="space-y-3">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
            >
              <div>
                <p className="font-semibold text-gray-800">{group.name}</p>
                <p className="text-xs text-gray-400">
                  Código: <span className="font-mono font-bold tracking-wider text-gray-600">{group.invite_code}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); copyCode(group.invite_code) }}
                  className="text-xs text-primary font-medium"
                >
                  {copiedCode === group.invite_code ? '✓ Copiado' : 'Copiar'}
                </button>
                <span className="text-gray-400 text-sm">{expandedGroup === group.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedGroup === group.id && (
              <div className="border-t border-gray-100 px-4 pb-4">
                <GroupLeaderboard groupId={group.id} fetchGroupLeaderboard={fetchGroupLeaderboard} />
              </div>
            )}
          </div>
        ))}

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
