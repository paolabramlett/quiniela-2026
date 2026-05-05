import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_KEY = Deno.env.get('API_FOOTBALL_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getPhase(round: string): string | null {
  if (round.toLowerCase().includes('group')) return 'group_stage'
  if (round === 'Round of 16') return 'r16'
  if (round === 'Quarter-finals') return 'qf'
  if (round === 'Semi-finals') return 'sf'
  if (round === 'Final') return 'final'
  return null
}

function getStatus(short: string): string {
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished'
  if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'].includes(short)) return 'in_progress'
  return 'scheduled'
}

function getGroupResult(homeGoals: number, awayGoals: number): string {
  if (homeGoals > awayGoals) return 'home'
  if (homeGoals < awayGoals) return 'away'
  return 'draw'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', {
      headers: { 'x-apisports-key': API_KEY },
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'API-Football request failed', status: res.status }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { response: fixtures } = await res.json()

    let matchesUpserted = 0
    let resultsUpserted = 0
    const errors: string[] = []

    for (const f of fixtures) {
      const phase = getPhase(f.league.round)
      if (!phase) continue

      const group_letter = phase === 'group_stage' && f.league.group
        ? f.league.group.replace('Group ', '').trim()
        : null

      const status = getStatus(f.fixture.status.short)

      const { data: match, error: matchErr } = await supabase
        .from('matches')
        .upsert(
          {
            api_fixture_id: f.fixture.id,
            phase,
            group_letter,
            home_team: f.teams.home.name,
            away_team: f.teams.away.name,
            kickoff_at: f.fixture.date,
            status,
          },
          { onConflict: 'api_fixture_id' }
        )
        .select('id, phase')
        .single()

      if (matchErr) {
        errors.push(`match ${f.fixture.id}: ${matchErr.message}`)
        continue
      }
      matchesUpserted++

      if (status !== 'finished') continue

      if (phase === 'group_stage') {
        const { home, away } = f.goals
        if (home === null || away === null) continue
        const result = getGroupResult(home, away)

        const { error: resultErr } = await supabase
          .from('match_results')
          .upsert({ match_id: match.id, result, winner_team: null }, { onConflict: 'match_id' })

        if (resultErr) errors.push(`result ${match.id}: ${resultErr.message}`)
        else resultsUpserted++
      } else {
        const winner = f.teams.home.winner
          ? f.teams.home.name
          : f.teams.away.winner
            ? f.teams.away.name
            : null

        if (!winner) continue

        const { error: resultErr } = await supabase
          .from('match_results')
          .upsert({ match_id: match.id, result: null, winner_team: winner }, { onConflict: 'match_id' })

        if (resultErr) errors.push(`result ${match.id}: ${resultErr.message}`)
        else resultsUpserted++
      }
    }

    return new Response(
      JSON.stringify({ success: true, matchesUpserted, resultsUpserted, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
