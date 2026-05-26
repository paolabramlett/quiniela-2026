// src/hooks/useFeed.js
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'

export const useFeed = () => {
  const { user } = useAuth()
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false

    const fetch = async () => {
      setLoading(true)
      const { data, error: err } = await supabase.rpc('get_my_feed', { p_user_id: user.id })
      if (cancelled) return
      if (err) {
        setError(err.message)
        setEvents([])
      } else {
        setError(null)
        setEvents(data ?? [])
      }
      setLoading(false)
    }

    fetch().catch(console.error)
    return () => { cancelled = true }
  }, [user?.id])

  return { events, loading, error }
}
