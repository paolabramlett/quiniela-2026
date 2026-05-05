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
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Who advances?</p>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                ${selected ? 'bg-primary text-white border-primary' : 'bg-bg text-gray-600 border-gray-200'}
                ${maxed ? 'opacity-40' : 'hover:border-primary'}
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
