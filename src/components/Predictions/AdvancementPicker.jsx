export default function AdvancementPicker({ teams, selection, onSelect, locked }) {
  const toggle = (team) => {
    if (locked) return
    if (selection.includes(team)) {
      onSelect(selection.filter(t => t !== team))
    } else if (selection.length < 2) {
      onSelect([...selection, team])
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-3">
        ¿Quién avanza? <span className="text-gray-700">(elige 2)</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {teams.map(team => {
          const selected = selection.includes(team)
          const maxed = selection.length === 2 && !selected
          return (
            <button
              key={team}
              disabled={locked || maxed}
              onClick={() => toggle(team)}
              aria-label={team}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                ${selected
                  ? 'bg-accent border-accent text-black'
                  : 'bg-surface border-line text-gray-400 hover:border-gray-500 hover:text-white'
                }
                ${maxed ? 'opacity-30' : ''}
                disabled:cursor-not-allowed`}
            >
              {team}
            </button>
          )
        })}
      </div>
    </div>
  )
}
