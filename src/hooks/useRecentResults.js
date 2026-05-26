// src/hooks/useRecentResults.js
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'

export const useRecentResults = () => {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchResults = async () => {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_recent_results', {
        p_user_id: user.id,
      })
      if (!error) setResults(data ?? [])
      setLoading(false)
    }

    fetchResults()
  }, [user])

  return { results, loading }
}
