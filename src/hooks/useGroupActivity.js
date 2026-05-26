// src/hooks/useGroupActivity.js
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export const useGroupActivity = (groupId) => {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!groupId) {
      setLoading(false)
      return
    }
    let cancelled = false

    const fetch = async () => {
      setLoading(true)
      const { data, error: err } = await supabase.rpc('get_group_activity', { p_group_id: groupId })
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
  }, [groupId])

  return { events, loading, error }
}
