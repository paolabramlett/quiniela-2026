import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_KEY = Deno.env.get('FOOTBALL_DATA_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getPhase(stage: string): string | null {
  if (stage === 'GROUP_STAGE') return 'group_stage'
  if (stage === 'LAST_16') return 'r16'
  if (stage === 'QUARTER_FINALS') return 'qf'
  if (stage === 'SEMI_FINALS') return 'sf'
  if (stage === 'FINAL') return 'final'
  return null
}

function getStatus(status: string): string {
  if (status === 'FINISHED') return 'finished'
  if (['IN_PLAY', 'PAUSED', 'HALF_TIME'].includes(status)) return 'in_progress'
  return 'scheduled'
}

function getGroupLetter(group: string | null): string | null {
  if (!group) return null
  return group.replace('GROUP_', '').trim() || null
}

function getGroupResult(home: number, away: number): string {
  if (home > away) return 'home'
  if (home < away) return 'away'
  return 'draw'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': API_KEY },
    })

    if (!res.ok) {
      const text = await res.text()
      return new Response(JSON.stringify({ error: 'football-data.org request failed', status: res.status, body: text }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { matches } = await res.json()

    let matchesUpserted = 0
    let matchesSkipped = 0
    let resultsUpserted = 0
    const errors: string[] = []

    for (const m of matches) {
      const phase = getPhase(m.stage)
      if (!phase) continue

      // Skip matches where teams aren't decided yet (TBD knockout slots)
      if (!m.homeTeam?.name || !m.awayTeam?.name) {
        matchesSkipped++
        continue
      }

      const group_letter = getGroupLetter(m.group ?? null)
      const status = getStatus(m.status)

      const { data: match, error: matchErr } = await supabase
        .from('matches')
        .upsert(
          {
            api_fixture_id: m.id,
            phase,
            group_letter,
            home_team: m.homeTeam.name,
            away_team: m.awayTeam.name,
            kickoff_at: m.utcDate,
            status,
          },
          { onConflict: 'api_fixture_id' }
        )
        .select('id, phase')
        .single()

      if (matchErr) {
        errors.push(`match ${m.id}: ${matchErr.message}`)
        continue
      }
      matchesUpserted++

      if (status !== 'finished') continue

      const homeGoals = m.score?.fullTime?.home
      const awayGoals = m.score?.fullTime?.away
      if (homeGoals === null || homeGoals === undefined) continue
      if (awayGoals === null || awayGoals === undefined) continue

      if (phase === 'group_stage') {
        const result = getGroupResult(homeGoals, awayGoals)
        const { error: resultErr } = await supabase
          .from('match_results')
          .upsert({ match_id: match.id, result, winner_team: null }, { onConflict: 'match_id' })
        if (resultErr) errors.push(`result ${match.id}: ${resultErr.message}`)
        else resultsUpserted++
      } else {
        const winner = homeGoals > awayGoals ? m.homeTeam.name : m.awayTeam.name
        const { error: resultErr } = await supabase
          .from('match_results')
          .upsert({ match_id: match.id, result: null, winner_team: winner }, { onConflict: 'match_id' })
        if (resultErr) errors.push(`result ${match.id}: ${resultErr.message}`)
        else resultsUpserted++
      }
    }

    return new Response(
      JSON.stringify({ success: true, matchesUpserted, matchesSkipped, resultsUpserted, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
