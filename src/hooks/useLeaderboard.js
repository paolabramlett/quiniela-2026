import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'

export const useLeaderboard = () => {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [userEntry, setUserEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchLeaderboard()

    const sub = supabase
      .channel('leaderboard_global_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard_global' }, fetchLeaderboard)
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [user])

  const fetchLeaderboard = async () => {
    try {
      const { data, error: err } = await supabase
        .from('leaderboard_global')
        .select('*')
        .order('rank', { ascending: true })
        .limit(100)

      if (err) throw err
      setEntries(data)

      const mine = data.find(e => e.user_id === user.id)
      if (!mine) {
        const { data: own } = await supabase
          .from('leaderboard_global')
          .select('*')
          .eq('user_id', user.id)
          .single()
        setUserEntry(own)
      } else {
        setUserEntry(mine)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { entries, userEntry, loading, error }
}
