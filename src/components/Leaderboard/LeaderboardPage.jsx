import { useLeaderboard } from '../../hooks/useLeaderboard'
import { useAuth } from '../../hooks/useAuth'
import ShareButton from '../Sharing/ShareButton'

const RANK_STYLE = {
  1: { label: '1', color: 'text-gold',  bg: 'bg-gold/10  border-gold/30' },
  2: { label: '2', color: 'text-gray-400', bg: 'bg-surface border-line' },
  3: { label: '3', color: 'text-[#CD7F32]', bg: 'bg-[#CD7F32]/10 border-[#CD7F32]/30' },
}

function LeaderboardRow({ entry, isCurrentUser, shareButton }) {
  const special = RANK_STYLE[entry.rank]
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors
      ${isCurrentUser
        ? 'bg-primary/10 border-primary/30'
        : special
          ? `${special.bg}`
          : 'bg-card border-line'
      }`}
    >
      {/* Rank */}
      <span className={`w-7 text-center font-display text-xl leading-none
        ${isCurrentUser ? 'text-primary' : special ? special.color : 'text-gray-600'}`}>
        {entry.rank}
      </span>

      {/* Avatar */}
      {entry.avatar_url
        ? <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
        : <div className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-gray-500">
            {entry.display_name?.[0]?.toUpperCase()}
          </div>
      }

      {/* Name */}
      <span className={`flex-1 text-sm font-semibold truncate ${isCurrentUser ? 'text-white' : 'text-gray-300'}`}>
        {entry.display_name}
        {isCurrentUser && <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-primary">Tú</span>}
      </span>

      {/* Points */}
      <div className="text-right">
        <span className={`font-display text-xl leading-none ${isCurrentUser ? 'text-primary' : special ? special.color : 'text-white'}`}>
          {entry.total_points}
        </span>
        <span className="text-[10px] text-gray-600 ml-1">pts</span>
      </div>

      {/* Share button — only passed for current user */}
      {shareButton}
    </div>
  )
}

export default function LeaderboardPage() {
  const { entries, userEntry, loading, error } = useLeaderboard()
  const { user } = useAuth()
  const isInTop100 = entries.some(e => e.user_id === user?.id)

  if (loading) return (
    <div className="flex items-center justify-center mt-20">
      <p className="text-gray-600 text-sm font-semibold uppercase tracking-widest">Cargando...</p>
    </div>
  )
  if (error) return <div className="text-center text-danger mt-10 text-sm">{error}</div>

  return (
    <div>
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-0.5">Top 100</p>
        <h1 className="font-display text-4xl tracking-wider text-white">RANKING GLOBAL</h1>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 animate-fade-up">
          <div className="font-display text-8xl text-line mb-4 leading-none">26</div>
          <p className="font-semibold text-gray-400 text-sm">El ranking está vacío por ahora</p>
          <p className="text-xs text-gray-700 mt-2 uppercase tracking-widest">
            Se activa el 11 de junio
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {entries.map(entry => (
              <LeaderboardRow
                key={entry.user_id}
                entry={entry}
                isCurrentUser={entry.user_id === user?.id}
                shareButton={entry.user_id === user?.id ? (
                  <ShareButton
                    displayName={entry.display_name}
                    rank={entry.rank}
                    points={entry.total_points}
                    correctPredictions={entry.correct_predictions}
                  />
                ) : null}
              />
            ))}
          </div>

          {/* Current user if outside top 100 */}
          {!isInTop100 && userEntry && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Tu posición</p>
              <LeaderboardRow
                entry={userEntry}
                isCurrentUser
                shareButton={
                  <ShareButton
                    displayName={userEntry.display_name}
                    rank={userEntry.rank}
                    points={userEntry.total_points}
                    correctPredictions={userEntry.correct_predictions}
                  />
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
