// src/hooks/useShareCard.js
import { useState } from 'react'
import html2canvas from 'html2canvas'

const APP_URL = 'https://quiniela-2026.netlify.app'

export const useShareCard = (cardRef, { displayName, rank, points, groupName, inviteCode }) => {
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const getShareText = () => {
    const hasScore = points != null && points > 0
    if (!hasScore && groupName) {
      return `¿Te animas a la quiniela? Únete a ${groupName} con el código ${inviteCode}. Juega Quiniela 2026 — ${APP_URL}`
    }
    return `¿Crees que me puedes ganar? Llevo ${points} puntos en el lugar #${rank}. Juega Quiniela 2026 — ${APP_URL}`
  }

  const share = async () => {
    if (!cardRef.current || sharing) return
    setSharing(true)
    try {
      const canvas = await html2canvas(cardRef.current, { useCORS: true, scale: 2 })
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], 'quiniela-26.png', { type: 'image/png' })
      const text = getShareText()

      if (navigator.share) {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text, url: APP_URL })
        } else {
          await navigator.share({ text, url: APP_URL })
        }
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      // User cancelled share dialog — not an error
      if (err?.name !== 'AbortError') console.error(err)
    } finally {
      setSharing(false)
    }
  }

  return { share, sharing, copied }
}
