import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { calculatePoints, getResultType } from '@/lib/scoring'

// GET /api/scores - לוח דירוג
export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ leaderboard: data || [] })
}

// POST /api/scores/recalculate - אדמין מחשב מחדש
export async function POST(request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: finishedMatches } = await admin
    .from('matches')
    .select('*')
    .in('status', ['FINISHED', 'AWARDED'])
    .not('home_score_full', 'is', null)

  if (!finishedMatches?.length) {
    return Response.json({ success: true, message: 'אין משחקים מסוכמים' })
  }

  let totalScored = 0

  for (const match of finishedMatches) {
    const { data: guesses } = await admin
      .from('guesses')
      .select('*')
      .eq('match_id', match.id)

    if (!guesses?.length) continue

    const scoreRows = guesses.map(g => ({
      user_id: g.user_id,
      match_id: match.id,
      points: calculatePoints(g, match),
      result_type: getResultType(g, match),
      updated_at: new Date().toISOString(),
    }))

    await admin
      .from('scores')
      .upsert(scoreRows, { onConflict: 'user_id,match_id' })

    totalScored += scoreRows.length
  }

  return Response.json({ success: true, totalScored })
}
