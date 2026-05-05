import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { usePredictions } from '../../hooks/usePredictions'
import { getCountdownLabel, isMatchLocked } from '../../utils/scoring'

export default function Dashboard() {
  const { profile } = useAuth()
  const { userEntry } = useLeaderboard()
  const { matches } = usePredictions()
  const navigate = useNavigate()

  const nextMatch = matches
    .filter(m => !isMatchLocked(m.kickoff_at))
    .sort((a, b) => new Date(a.kickoff_at) - new Date(b.kickoff_at))[0]

  const countdown = nextMatch ? getCountdownLabel(nextMatch.kickoff_at) : null

  const quickActions = [
    { label: 'Make Picks', icon: '🎯', to: '/predictions' },
    { label: 'Rankings', icon: '🏆', to: '/leaderboard' },
    { label: 'My Group', icon: '👥', to: '/groups' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-500 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold text-gray-900">{profile?.display_name} 👋</h1>
      </div>

      {/* Score card */}
      <div className="bg-primary rounded-2xl p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-primary-200 text-xs font-medium opacity-70">Your Score</p>
            <p className="text-4xl font-extrabold mt-1">{userEntry?.total_points ?? 0}</p>
            <p className="text-xs opacity-70 mt-1">{userEntry?.correct_predictions ?? 0} correct predictions</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Global Rank</p>
            <p className="text-3xl font-extrabold mt-1">
              {userEntry?.rank ? `#${userEntry.rank}` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Next lockout */}
      {nextMatch && countdown && (
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Next Lockout</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              {nextMatch.home_team} vs {nextMatch.away_team}
            </p>
          </div>
          <span className="text-lg font-bold text-danger">{countdown}</span>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map(({ label, icon, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-semibold text-gray-600">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
