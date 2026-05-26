// src/components/Sharing/ShareCard.jsx
import { forwardRef } from 'react'

const GRADIENT = 'linear-gradient(135deg, #2563EB 0%, #7C3AED 30%, #E8351E 60%, #F59E0B 100%)'

export default forwardRef(function ShareCard(
  { displayName, rank, points, correctPredictions, totalMatches, groupName, inviteCode },
  ref
) {
  const hasGroup = !!(groupName && inviteCode)
  const hasScore = points != null && points > 0

  let variant
  if (hasGroup && hasScore) variant = 'score-invite'
  else if (hasGroup && !hasScore) variant = 'pre-match'
  else variant = 'score-only'

  return (
    <div
      ref={ref}
      style={{
        width: 400,
        height: 600,
        background: GRADIENT,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Noto Sans', sans-serif",
      }}
    >
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', width: 180, height: 180, background: '#E8351E', borderRadius: '50%', top: -50, left: -50, opacity: 0.7 }} />
      <div style={{ position: 'absolute', width: 120, height: 120, background: '#22C55E', borderRadius: '50%', bottom: 80, right: -30, opacity: 0.6 }} />
      <div style={{ position: 'absolute', width: 90, height: 90, background: '#F59E0B', bottom: -20, left: 30, transform: 'rotate(45deg)', opacity: 0.5 }} />

      {/* White card */}
      <div style={{
        background: '#fff',
        borderRadius: 22,
        padding: '28px 24px',
        width: 300,
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
      }}>
        {variant === 'pre-match' ? (
          <>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', fontWeight: 700, lineHeight: 1.4 }}>
              ¿Te animas a la quiniela?
            </p>
            <div>
              <p style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>Únete a</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: '#111', lineHeight: 1.1, letterSpacing: '0.03em' }}>
                {groupName}
              </p>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', fontWeight: 700, lineHeight: 1.4 }}>
              ¿Crees que me puedes ganar?
            </p>
            <div>
              <p style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>{displayName} lleva</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: '#111', lineHeight: 1, letterSpacing: '0.02em' }}>
                {points} pts
              </p>
              <p style={{ fontSize: 14, color: '#E8351E', fontWeight: 800 }}>
                Lugar #{rank}
                {correctPredictions != null && totalMatches != null
                  ? ` · ${correctPredictions} de ${totalMatches} ✓`
                  : ''}
              </p>
            </div>
          </>
        )}

        {hasGroup && (
          <div style={{ border: '2px dashed #ddd', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              {variant === 'pre-match' ? 'Código de grupo' : 'Únete con el código'}
            </p>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#111', letterSpacing: '0.2em' }}>
              {inviteCode}
            </p>
          </div>
        )}

        {/* QUINIELA 26 wordmark */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#111', borderRadius: 10, padding: '8px 14px', alignSelf: 'center' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#fff', letterSpacing: '0.04em' }}>QUINIELA</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#E8351E', letterSpacing: '0.04em' }}>26</span>
        </div>
      </div>
    </div>
  )
})
