import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { usePredictions } from '../../hooks/usePredictions'
import { getCountdownLabel, isMatchLocked } from '../../utils/scoring'
import { getFlag } from '../../utils/teamFlags'
import { useRecentResults } from '../../hooks/useRecentResults'
import RecentResults from './RecentResults'
import ShareButton from '../Sharing/ShareButton'
import AdvancementReminder from './AdvancementReminder'

const quickActions = [
  { label: 'Hacer Picks', sub: 'Elige tus favoritos', to: '/predictions', color: 'bg-primary', icon: '🎯' },
  { label: 'Ranking',     sub: 'Tabla global',        to: '/leaderboard', color: 'bg-accent',  icon: '🏆' },
  { label: 'Mi Grupo',    sub: 'Compite con amigos',  to: '/groups',      color: 'bg-gold',    icon: '👥' },
]

export default function Dashboard() {
  const { profile } = useAuth()
  const { userEntry } = useLeaderboard()
  const { matches, matchesByGroup, advancementPredictions } = usePredictions()
  const { results: recentResults, loading: recentLoading } = useRecentResults()
  const navigate = useNavigate()

  const nextMatch = matches
    .filter(m => !isMatchLocked(m.kickoff_at))
    .sort((a, b) => new Date(a.kickoff_at) - new Date(b.kickoff_at))[0]

  const countdown = nextMatch ? getCountdownLabel(nextMatch.kickoff_at) : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-fade-up stagger-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-600">Bienvenido/a</p>
        <h1 className="font-display text-4xl tracking-wider text-white mt-0.5">
          {profile?.display_name?.toUpperCase()}
        </h1>
      </div>

      {/* Score card */}
      <div className="animate-fade-up stagger-2 bg-card border border-line rounded-2xl overflow-hidden">
        {/* Red accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-gold to-accent" />
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-1">Tu Puntaje</p>
            <p className="font-display text-6xl text-white leading-none">
              {userEntry?.total_points ?? 0}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {userEntry?.correct_predictions ?? 0} predicciones correctas
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-1">Posición</p>
            <p className="font-display text-5xl text-primary leading-none">
              {userEntry?.rank ? `#${userEntry.rank}` : '—'}
            </p>
            <p className="text-xs text-gray-600 mt-2">ranking global</p>
          </div>
        </div>
        {userEntry && (
          <div className="px-5 pb-4">
            <ShareButton
              displayName={profile?.display_name}
              rank={userEntry.rank}
              points={userEntry.total_points}
              correctPredictions={userEntry.correct_predictions}
            />
          </div>
        )}
      </div>

      {/* Advancement pick reminder */}
      <div className="animate-fade-up stagger-3">
        <AdvancementReminder matchesByGroup={matchesByGroup} advancementPredictions={advancementPredictions} />
      </div>

      {/* Next match countdown */}
      {nextMatch && countdown && (
        <div className="animate-fade-up stagger-3 bg-card border border-line rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-1">Próximo Cierre</p>
            <p className="text-sm font-semibold text-white">
              <span aria-hidden="true">{getFlag(nextMatch.home_team)}</span> {nextMatch.home_team} <span className="text-gray-600">vs</span> {nextMatch.away_team} <span aria-hidden="true">{getFlag(nextMatch.away_team)}</span>
            </p>
          </div>
          <span className="font-display text-2xl text-primary tracking-wider">{countdown}</span>
        </div>
      )}

      {/* Recent results */}
      <div className="animate-fade-up stagger-4">
        <RecentResults results={recentResults} loading={recentLoading} />
      </div>

      {/* Quick actions */}
      <div className="animate-fade-up stagger-5 grid grid-cols-3 gap-3">
        {quickActions.map(({ label, sub, to, color, icon }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="bg-card border border-line rounded-2xl p-4 flex flex-col items-start gap-3 hover:border-gray-500 transition-colors text-left"
          >
            <span className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center text-lg`}>
              {icon}
            </span>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
