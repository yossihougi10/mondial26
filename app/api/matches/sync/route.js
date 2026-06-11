import { createAdminClient, createServerClient } from '@/lib/supabase/server'
import { fetchAllMatches, transformMatch } from '@/lib/football-api'
import { calculatePoints, getResultType } from '@/lib/scoring'

export async function POST(request) {
  // Vercel Cron Secret או בדיקת session אדמין
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  let authorized = false

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    authorized = true
  } else {
    // בדיקת session (קריאה מה-UI)
    const serverSupabase = createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (user?.email === process.env.ADMIN_EMAIL) authorized = true
    else {
      const { data: prof } = await serverSupabase.from('profiles').select('is_admin').eq('id', user?.id || '').single()
      if (prof?.is_admin) authorized = true
    }
  }

  if (!authorized) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    const apiMatches = await fetchAllMatches()

    if (!apiMatches.length) {
      return Response.json({ success: true, matchCount: 0, message: 'אין משחקים ב-API' })
    }

    const transformed = apiMatches.map(transformMatch)

    // Upsert matches
    const { error: upsertError } = await supabase
      .from('matches')
      .upsert(transformed, { onConflict: 'id' })

    if (upsertError) {
      console.error('upsert matches error:', upsertError)
      return Response.json({ error: upsertError.message }, { status: 500 })
    }

    // נעל ניחושים למשחקים שהתחילו
    const startedIds = transformed
      .filter(m => ['IN_PLAY', 'PAUSED', 'FINISHED', 'AWARDED'].includes(m.status))
      .map(m => m.id)

    if (startedIds.length > 0) {
      await supabase
        .from('guesses')
        .update({ is_locked: true })
        .in('match_id', startedIds)
        .eq('is_locked', false)
    }

    // חשב ניקוד למשחקים שהסתיימו
    const finishedMatches = transformed.filter(m =>
      ['FINISHED', 'AWARDED'].includes(m.status) &&
      m.home_score_full !== null
    )

    for (const match of finishedMatches) {
      await recalculateScores(supabase, match)
    }

    return Response.json({
      success: true,
      matchCount: apiMatches.length,
      scored: finishedMatches.length,
    })
  } catch (err) {
    console.error('sync error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

async function recalculateScores(supabase, match) {
  const { data: guesses } = await supabase
    .from('guesses')
    .select('*')
    .eq('match_id', match.id)

  if (!guesses?.length) return

  const scoreRows = guesses.map(guess => ({
    user_id: guess.user_id,
    match_id: match.id,
    points: calculatePoints(guess, match),
    result_type: getResultType(guess, match),
    updated_at: new Date().toISOString(),
  }))

  await supabase
    .from('scores')
    .upsert(scoreRows, { onConflict: 'user_id,match_id' })
}
