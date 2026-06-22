import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'
import { isMatchLocked } from '../utils/scoring'

export const usePredictions = () => {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [results, setResults] = useState({}) // { matchId: { result, winner_team } }
  const [groupPredictions, setGroupPredictions] = useState({})   // { matchId: 'home'|'draw'|'away' }
  const [advancementPredictions, setAdvancementPredictions] = useState({}) // { groupLetter: ['Team1','Team2'] }
  const [knockoutPredictions, setKnockoutPredictions] = useState({}) // { matchId: 'TeamName' }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchAll()

    // Real-time: update match status live when sync-matches writes to DB
    const matchSub = supabase
      .channel('matches-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        setMatches(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_results' }, () => {
        // A result was added or updated — refetch matches to pick up joined result data
        fetchAll()
      })
      .subscribe()

    return () => { supabase.removeChannel(matchSub) }
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [matchesRes, resultsRes, gspRes, gapRes, kpRes] = await Promise.all([
        supabase.from('matches').select('*').order('kickoff_at'),
        supabase.from('match_results').select('*'),
        supabase.from('group_stage_predictions').select('*').eq('user_id', user.id),
        supabase.from('group_advancement_predictions').select('*').eq('user_id', user.id),
        supabase.from('knockout_predictions').select('*').eq('user_id', user.id),
      ])

      if (matchesRes.error) throw matchesRes.error

      setMatches(matchesRes.data)

      const res = {}
      resultsRes.data?.forEach(r => { res[r.match_id] = r })
      setResults(res)

      const gsp = {}
      gspRes.data?.forEach(p => { gsp[p.match_id] = p.prediction })
      setGroupPredictions(gsp)

      const gap = {}
      gapRes.data?.forEach(p => { gap[p.group_letter] = [p.team_1, p.team_2] })
      setAdvancementPredictions(gap)

      const kp = {}
      kpRes.data?.forEach(p => { kp[p.match_id] = p.predicted_winner })
      setKnockoutPredictions(kp)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveGroupPrediction = useCallback(async (matchId, prediction) => {
    const match = matches.find(m => m.id === matchId)
    if (!match || isMatchLocked(match.kickoff_at)) return

    if (prediction === null) {
      const { error } = await supabase
        .from('group_stage_predictions')
        .delete()
        .eq('user_id', user.id)
        .eq('match_id', matchId)
      if (!error) setGroupPredictions(prev => { const next = { ...prev }; delete next[matchId]; return next })
    } else {
      const { error } = await supabase
        .from('group_stage_predictions')
        .upsert({ user_id: user.id, match_id: matchId, prediction }, { onConflict: 'user_id,match_id' })
      if (!error) setGroupPredictions(prev => ({ ...prev, [matchId]: prediction }))
    }
  }, [matches, user])

  const saveAdvancementPrediction = useCallback(async (groupLetter, teams) => {
    // Advancement picks lock with the group's last match, same as the UI
    const lastMatch = matches
      .filter(m => m.phase === 'group_stage' && m.group_letter === groupLetter)
      .sort((a, b) => new Date(b.kickoff_at) - new Date(a.kickoff_at))[0]

    if (lastMatch && isMatchLocked(lastMatch.kickoff_at)) return

    // Update local state immediately so buttons respond on first click
    setAdvancementPredictions(prev => ({ ...prev, [groupLetter]: teams }))

    if (teams.length === 2) {
      // Both teams chosen — persist to DB
      const { error } = await supabase
        .from('group_advancement_predictions')
        .upsert(
          { user_id: user.id, group_letter: groupLetter, team_1: teams[0], team_2: teams[1] },
          { onConflict: 'user_id,group_letter' }
        )
      if (error) setError(error.message)
    } else {
      // Partial selection — clear any previous DB record so refresh doesn't restore stale data
      await supabase
        .from('group_advancement_predictions')
        .delete()
        .eq('user_id', user.id)
        .eq('group_letter', groupLetter)
    }
  }, [matches, user])

  const saveKnockoutPrediction = useCallback(async (matchId, winner) => {
    const match = matches.find(m => m.id === matchId)
    if (!match || isMatchLocked(match.kickoff_at)) return

    if (winner === null) {
      const { error } = await supabase
        .from('knockout_predictions')
        .delete()
        .eq('user_id', user.id)
        .eq('match_id', matchId)
      if (!error) setKnockoutPredictions(prev => { const next = { ...prev }; delete next[matchId]; return next })
    } else {
      const { error } = await supabase
        .from('knockout_predictions')
        .upsert({ user_id: user.id, match_id: matchId, predicted_winner: winner }, { onConflict: 'user_id,match_id' })
      if (!error) setKnockoutPredictions(prev => ({ ...prev, [matchId]: winner }))
    }
  }, [matches, user])

  const matchesByGroup = matches
    .filter(m => m.phase === 'group_stage')
    .reduce((acc, m) => {
      if (!acc[m.group_letter]) acc[m.group_letter] = []
      acc[m.group_letter].push(m)
      return acc
    }, {})

  const knockoutMatches = matches.filter(m => m.phase !== 'group_stage')

  return {
    matches,
    matchesByGroup,
    knockoutMatches,
    results,
    groupPredictions,
    advancementPredictions,
    knockoutPredictions,
    loading,
    error,
    saveGroupPrediction,
    saveAdvancementPrediction,
    saveKnockoutPrediction,
  }
}
