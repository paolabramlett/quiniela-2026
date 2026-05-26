import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
)
const PicksIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 17.93V18a1 1 0 0 0-2 0v1.93A8.001 8.001 0 0 1 4.07 13H6a1 1 0 0 0 0-2H4.07A8.001 8.001 0 0 1 11 4.07V6a1 1 0 0 0 2 0V4.07A8.001 8.001 0 0 1 19.93 11H18a1 1 0 0 0 0 2h1.93A8.001 8.001 0 0 1 13 19.93zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
  </svg>
)
const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
)
const GroupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
)
const FeedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
)

const navItems = [
  { to: '/',            label: 'Inicio',  Icon: HomeIcon },
  { to: '/predictions', label: 'Picks',   Icon: PicksIcon },
  { to: '/leaderboard', label: 'Ranking', Icon: TrophyIcon },
  { to: '/groups',      label: 'Grupo',   Icon: GroupIcon },
  { to: '/feed',        label: 'Feed',    Icon: FeedIcon },
]

export default function AppLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Desktop top nav */}
      <nav
        className="hidden md:flex items-center justify-between bg-card border-b border-line px-6 py-3"
        aria-label="Main navigation"
      >
        <span className="font-display text-2xl tracking-wider text-white">
          QUINIELA <span className="text-primary">26</span>
        </span>
        <div className="flex gap-8">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `text-sm font-semibold uppercase tracking-widest transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.paolabramlett.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-700 hover:text-accent transition-colors uppercase tracking-widest font-semibold"
          >
            Por Paola ↗
          </a>
          <span className="text-gray-700">·</span>
          <span className="text-sm text-gray-500">{profile?.display_name}</span>
          <button
            onClick={signOut}
            className="text-xs text-gray-600 hover:text-primary transition-colors uppercase tracking-widest font-semibold"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* Mobile top bar — user info + actions */}
      <div className="md:hidden flex items-center justify-between bg-card border-b border-line px-4 py-2.5">
        <span className="font-display text-lg tracking-wider text-white">
          QUINIELA <span className="text-primary">26</span>
        </span>
        <div className="flex items-center gap-3">
          <a
            href="https://www.paolabramlett.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-accent transition-colors"
          >
            Por Paola ↗
          </a>
          <span className="text-gray-700 text-xs">·</span>
          <span className="text-xs text-gray-500 font-semibold truncate max-w-24">{profile?.display_name}</span>
          <button
            onClick={signOut}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-primary transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Page content */}
      <main className="flex-1 pb-24 md:pb-0 max-w-2xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom tabs */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-line flex"
        aria-label="Mobile navigation"
      >
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-600'
              }`
            }
          >
            <Icon />
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
