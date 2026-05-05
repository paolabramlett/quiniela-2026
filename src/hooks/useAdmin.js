import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'

export const useAdmin = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [matches, setMatches] = useState([])
  const [results, setResults] = useState({})       // { matchId: result row }
  const [advResults, setAdvResults] = useState({}) // { groupLetter: result row }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    checkAdmin()
  }, [user])

  const checkAdmin = async () => {
    const { data } = await supabase
      .from('admin_whitelist')
      .select('email')
      .eq('email', user.email)
      .single()

    setIsAdmin(!!data)
    if (data) await fetchAll()
    else setLoading(false)
  }

  const fetchAll = async () => {
    const [matchesRes, resultsRes, advRes] = await Promise.all([
      supabase.from('matches').select('*').order('kickoff_at'),
      supabase.from('match_results').select('*'),
      supabase.from('group_advancement_results').select('*'),
    ])

    setMatches(matchesRes.data ?? [])

    const r = {}
    resultsRes.data?.forEach(row => { r[row.match_id] = row })
    setResults(r)

    const a = {}
    advRes.data?.forEach(row => { a[row.group_letter] = row })
    setAdvResults(a)

    setLoading(false)
  }

  const saveMatchResult = async (matchId, { result, winner_team }) => {
    const { error } = await supabase
      .from('match_results')
      .upsert({ match_id: matchId, result: result ?? null, winner_team: winner_team ?? null, entered_by: user.id }, { onConflict: 'match_id' })

    if (error) throw error
    await fetchAll()
  }

  const saveAdvancementResult = async (groupLetter, { team1, team2 }) => {
    const { error } = await supabase
      .from('group_advancement_results')
      .upsert({ group_letter: groupLetter, team_1: team1, team_2: team2, entered_by: user.id }, { onConflict: 'group_letter' })

    if (error) throw error
    await fetchAll()
  }

  const matchesByPhase = matches.reduce((acc, m) => {
    if (!acc[m.phase]) acc[m.phase] = []
    acc[m.phase].push(m)
    return acc
  }, {})

  return { isAdmin, loading, matchesByPhase, results, advResults, saveMatchResult, saveAdvancementResult }
}
