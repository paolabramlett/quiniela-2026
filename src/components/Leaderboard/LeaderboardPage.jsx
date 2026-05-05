import { useLeaderboard } from '../../hooks/useLeaderboard'
import { useAuth } from '../../hooks/useAuth'

function LeaderboardRow({ entry, isCurrentUser }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${isCurrentUser ? 'bg-primary/10 border border-primary/30' : 'bg-white'} shadow-sm`}>
      <span className={`w-7 text-center text-sm font-bold ${entry.rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`}>
        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
      </span>
      {entry.avatar_url
        ? <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full" />
        : <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
            {entry.display_name?.[0]}
          </div>
      }
      <span className="flex-1 text-sm font-medium text-gray-800">{entry.display_name}</span>
      <span className="text-sm font-bold text-primary">{entry.total_points} pts</span>
    </div>
  )
}

export default function LeaderboardPage() {
  const { entries, userEntry, loading, error } = useLeaderboard()
  const { user } = useAuth()
  const isInTop100 = entries.some(e => e.user_id === user?.id)

  if (loading) return <div className="text-center text-gray-400 mt-10">Loading leaderboard...</div>
  if (error) return <div className="text-center text-danger mt-10">Error: {error}</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Global Ranking</h1>
      <div className="space-y-2">
        {entries.map(entry => (
          <LeaderboardRow key={entry.user_id} entry={entry} isCurrentUser={entry.user_id === user?.id} />
        ))}
      </div>

      {!isInTop100 && userEntry && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <LeaderboardRow entry={userEntry} isCurrentUser />
        </div>
      )}
    </div>
  )
}
