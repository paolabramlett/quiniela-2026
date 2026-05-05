import { useState } from 'react'
import { usePredictions } from '../../hooks/usePredictions'
import GroupStageTabs from './GroupStageTabs'
import KnockoutBracket from './KnockoutBracket'

export default function PredictionsPage() {
  const [tab, setTab] = useState('groups')
  const {
    matchesByGroup, knockoutMatches,
    groupPredictions, advancementPredictions, knockoutPredictions,
    loading, error,
    saveGroupPrediction, saveAdvancementPrediction, saveKnockoutPrediction,
  } = usePredictions()

  if (loading) return <div className="text-center text-gray-400 mt-10">Loading predictions...</div>
  if (error) return <div className="text-center text-danger mt-10">Error: {error}</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">My Picks</h1>

      <div className="flex gap-2 mb-6">
        {['groups', 'knockout'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${tab === t ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
          >
            {t === 'groups' ? 'Group Stage' : 'Knockout'}
          </button>
        ))}
      </div>

      {tab === 'groups' ? (
        <GroupStageTabs
          matchesByGroup={matchesByGroup}
          groupPredictions={groupPredictions}
          advancementPredictions={advancementPredictions}
          onPredict={saveGroupPrediction}
          onAdvancement={saveAdvancementPrediction}
        />
      ) : (
        <KnockoutBracket
          knockoutMatches={knockoutMatches}
          knockoutPredictions={knockoutPredictions}
          onPredict={saveKnockoutPrediction}
        />
      )}
    </div>
  )
}
