function formatRelativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days  = Math.floor(diffMs / 86400000)
  if (mins  <  1) return 'ahora'
  if (mins  < 60) return `hace ${mins}m`
  if (hours < 24) return `hace ${hours}h`
  if (days  === 1) return 'ayer'
  return `hace ${days} días`
}

function eventText(event) {
  const name = event.actor_display_name ?? 'Alguien'
  switch (event.event_type) {
    case 'joined':
      return `👋 ${name} se unió al grupo`
    case 'rank_up':
      return `📈 ${name} subió al lugar #${event.payload.new_rank}`
    case 'rank_down':
      return `📉 ${name} bajó al lugar #${event.payload.new_rank}`
    case 'correct_streak':
      return `🔥 ${name} acertó ${event.payload.streak} seguidos`
    case 'prediction_complete':
      return `✅ ${name} completó sus quinielas`
    default:
      return `${name} hizo algo`
  }
}

function InitialsAvatar({ name }) {
  const initial = name ? name.trim()[0].toUpperCase() : '?'
  const colors = [
    'bg-primary/80', 'bg-accent/80', 'bg-gold/80',
    'bg-purple-600/80', 'bg-blue-600/80', 'bg-green-600/80',
  ]
  const colorClass = name ? colors[name.charCodeAt(0) % colors.length] : colors[0]
  return (
    <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
      {initial}
    </div>
  )
}

export default function ActivityEvent({ event, showGroupName = false }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {event.actor_avatar_url
        ? <img src={event.actor_avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        : <InitialsAvatar name={event.actor_display_name} />
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-snug">
          {eventText(event)}
        </p>
        {showGroupName && event.group_name && (
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">
            {event.group_name}
          </p>
        )}
        <p className="text-[10px] text-gray-600 mt-0.5">
          {formatRelativeTime(event.created_at)}
        </p>
      </div>
    </div>
  )
}
