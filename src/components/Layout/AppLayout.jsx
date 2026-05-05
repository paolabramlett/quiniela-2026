import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/',            label: 'Home',    icon: '🏠' },
  { to: '/predictions', label: 'Picks',   icon: '🎯' },
  { to: '/leaderboard', label: 'Ranking', icon: '🏆' },
  { to: '/groups',      label: 'Group',   icon: '👥' },
]

export default function AppLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center justify-between bg-white shadow-sm px-6 py-3">
        <span className="font-bold text-lg">⚽ Quiniela <span className="text-primary">2026</span></span>
        <div className="flex gap-6">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-500 hover:text-gray-800'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{profile?.display_name}</span>
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-danger">Sign out</button>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0 max-w-2xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
