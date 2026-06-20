import { useState } from 'react'
import GroupTab from './GroupTab'

const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function GroupStageTabs({ matchesByGroup, groupPredictions, advancementPredictions, results, onPredict, onAdvancement }) {
  const [active, setActive] = useState('A')

  return (
    <div>
      {/* Group letter selector */}
      <div className="flex overflow-x-auto gap-1.5 pb-2 mb-5 no-scrollbar">
        {GROUP_LETTERS.map(letter => (
          <button
            key={letter}
            onClick={() => setActive(letter)}
            className={`flex-shrink-0 w-9 h-9 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors
              ${active === letter
                ? 'bg-primary text-white'
                : 'bg-card border border-line text-gray-500 hover:border-gray-500 hover:text-white'
              }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {matchesByGroup[active] && (
        <GroupTab
          groupLetter={active}
          matches={matchesByGroup[active]}
          groupPredictions={groupPredictions}
          advancementPrediction={advancementPredictions[active]}
          results={results}
          onPredict={onPredict}
          onAdvancement={onAdvancement}
        />
      )}
    </div>
  )
}
