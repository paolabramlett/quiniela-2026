const LOCKOUT_MS = 30 * 60 * 1000
const COUNTDOWN_THRESHOLD_MS = 2 * 60 * 60 * 1000

export const isMatchLocked = (kickoffAt) => {
  return new Date(kickoffAt) - Date.now() < LOCKOUT_MS
}

export const getCountdownLabel = (kickoffAt) => {
  const ms = new Date(kickoffAt) - Date.now()
  if (ms > COUNTDOWN_THRESHOLD_MS) return null
  if (ms <= 0) return 'Locked'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export const pointsForPhase = (phase) => {
  const map = { group_stage: 5, r32: 10, r16: 15, qf: 20, sf: 25, final: 50 }
  return map[phase] ?? 0
}
