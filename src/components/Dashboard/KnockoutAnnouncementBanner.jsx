import { useNavigate } from 'react-router-dom'

// Shown once at least one knockout fixture has real teams (not the
// "TBD vs TBD" placeholders), so there's actually something to predict.
function hasKnownKnockoutMatch(matches) {
  return matches.some(m => m.phase !== 'group_stage' && m.home_team !== 'TBD' && m.away_team !== 'TBD')
}

export default function KnockoutAnnouncementBanner({ matches }) {
  const navigate = useNavigate()

  if (!hasKnownKnockoutMatch(matches)) return null

  return (
    <button
      onClick={() => navigate('/predictions', { state: { tab: 'knockout' } })}
      className="w-full bg-accent/10 border border-accent/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-left hover:border-accent transition-colors"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1">
          🏆 Ya puedes predecir Eliminatorias
        </p>
        <p className="text-sm font-semibold text-white">
          Ve a <span className="text-accent">Picks</span> y elige la pestaña <span className="text-accent">"Eliminatorias"</span> para hacer tus picks
        </p>
      </div>
      <span className="text-accent text-lg flex-shrink-0">›</span>
    </button>
  )
}
