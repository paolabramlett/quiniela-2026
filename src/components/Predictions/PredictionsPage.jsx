import { useState } from 'react'
import { usePredictions } from '../../hooks/usePredictions'
import GroupStageTabs from './GroupStageTabs'
import KnockoutBracket from './KnockoutBracket'

export default function PredictionsPage() {
  const [tab, setTab] = useState('groups')
  const {
    matchesByGroup, knockoutMatches, results,
    groupPredictions, advancementPredictions, knockoutPredictions,
    loading, error,
    saveGroupPrediction, saveAdvancementPrediction, saveKnockoutPrediction,
  } = usePredictions()

  if (loading) return (
    <div className="flex items-center justify-center mt-20">
      <p className="text-gray-600 text-sm font-semibold uppercase tracking-widest">Cargando...</p>
    </div>
  )
  if (error) return <div className="text-center text-danger mt-10 text-sm">{error}</div>

  return (
    <div>
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-0.5">Selecciona</p>
        <h1 className="font-display text-4xl tracking-wider text-white">MIS PICKS</h1>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 p-1 bg-card border border-line rounded-xl">
        {['groups', 'knockout'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors
              ${tab === t
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-white'
              }`}
          >
            {t === 'groups' ? 'Fase de Grupos' : 'Eliminatorias'}
          </button>
        ))}
      </div>

      {tab === 'groups' ? (
        <GroupStageTabs
          matchesByGroup={matchesByGroup}
          groupPredictions={groupPredictions}
          advancementPredictions={advancementPredictions}
          results={results}
          onPredict={saveGroupPrediction}
          onAdvancement={saveAdvancementPrediction}
        />
      ) : (
        <KnockoutBracket
          knockoutMatches={knockoutMatches}
          knockoutPredictions={knockoutPredictions}
          results={results}
          onPredict={saveKnockoutPrediction}
        />
      )}
    </div>
  )
}
