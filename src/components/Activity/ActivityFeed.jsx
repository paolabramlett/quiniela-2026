// src/components/Activity/ActivityFeed.jsx
import ActivityEvent from './ActivityEvent'

export default function ActivityFeed({ events, loading, showGroupName = false }) {
  if (loading) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Cargando...</p>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Sin actividad reciente</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-line">
      {events.map(event => (
        <ActivityEvent key={event.id} event={event} showGroupName={showGroupName} />
      ))}
    </div>
  )
}
