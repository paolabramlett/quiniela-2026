// src/components/Groups/PaymentSuccessScreen.jsx
import { useEffect } from 'react'

export default function PaymentSuccessScreen({ slotsAvailable, onDismiss }) {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div className="text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="font-display text-4xl tracking-wider text-white mb-2">¡LISTO!</h2>
        <p className="text-sm text-gray-400 mb-1">
          Ya tienes <span className="text-accent font-bold">{slotsAvailable} grupo{slotsAvailable !== 1 ? 's' : ''}</span> disponibles para crear.
        </p>
        <p className="text-[10px] text-gray-700 uppercase tracking-widest font-bold mt-4">
          Toca para continuar
        </p>
      </div>
    </div>
  )
}
