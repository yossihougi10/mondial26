import { createServerClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/matches - קבל כל המשחקים עם ניחושים
export async function GET(request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('utc_date', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ matches: matches || [] })
}

// PATCH /api/matches - אדמין מעדכן תוצאה ידנית
export async function PATCH(request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, home_score_full, away_score_full, winner, status } = body

  if (!id) return Response.json({ error: 'Missing match id' }, { status: 400 })

  const admin = createAdminClient()

  const updateData = {
    last_updated: new Date().toISOString(),
  }
  if (home_score_full !== undefined) updateData.home_score_full = home_score_full
  if (away_score_full !== undefined) updateData.away_score_full = away_score_full
  if (winner !== undefined) updateData.winner = winner
  if (status !== undefined) updateData.status = status

  const { data: match, error } = await admin
    .from('matches')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // נעל ניחושים אם המשחק התחיל
  if (['IN_PLAY', 'PAUSED', 'FINISHED'].includes(status)) {
    await admin.from('guesses').update({ is_locked: true }).eq('match_id', id)
  }

  return Response.json({ success: true, match })
}
