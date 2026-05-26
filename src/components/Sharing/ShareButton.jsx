// src/components/Sharing/ShareButton.jsx
import { useRef } from 'react'
import { useShareCard } from '../../hooks/useShareCard'
import ShareCard from './ShareCard'

export default function ShareButton({
  displayName, rank, points, correctPredictions, totalMatches, groupName, inviteCode,
}) {
  const cardRef = useRef(null)
  const { share, sharing, copied } = useShareCard(cardRef, {
    displayName, rank, points, groupName, inviteCode,
  })

  return (
    <div className="relative inline-block">
      {/* Off-screen card for html2canvas capture */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <ShareCard
          ref={cardRef}
          displayName={displayName}
          rank={rank}
          points={points}
          correctPredictions={correctPredictions}
          totalMatches={totalMatches}
          groupName={groupName}
          inviteCode={inviteCode}
        />
      </div>

      <button
        onClick={share}
        disabled={sharing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-line text-xs font-bold text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
      >
        {sharing ? (
          <span className="inline-block w-3 h-3 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
        ) : (
          <span aria-hidden="true">📤</span>
        )}
        Compartir
      </button>

      {copied && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent text-black text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
          ¡Copiado!
        </div>
      )}
    </div>
  )
}
