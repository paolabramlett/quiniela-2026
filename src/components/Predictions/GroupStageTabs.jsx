import { useState } from 'react'
import GroupTab from './GroupTab'

const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function GroupStageTabs({ matchesByGroup, groupPredictions, advancementPredictions, onPredict, onAdvancement }) {
  const [active, setActive] = useState('A')

  return (
    <div>
      <div className="flex overflow-x-auto gap-1 pb-2 mb-4 no-scrollbar">
        {GROUP_LETTERS.map(letter => (
          <button
            key={letter}
            onClick={() => setActive(letter)}
            className={`flex-shrink-0 w-9 h-9 rounded-lg text-sm font-bold transition-colors
              ${active === letter ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
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
          onPredict={onPredict}
          onAdvancement={onAdvancement}
        />
      )}
    </div>
  )
}
