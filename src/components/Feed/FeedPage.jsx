// src/components/Feed/FeedPage.jsx
import { useFeed } from '../../hooks/useFeed'
import ActivityFeed from '../Activity/ActivityFeed'

export default function FeedPage() {
  const { events, loading } = useFeed()

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wider text-white mb-1">
        FEED
      </h1>
      <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-6">
        Actividad reciente en tus grupos
      </p>
      <ActivityFeed events={events} loading={loading} showGroupName />
    </div>
  )
}
