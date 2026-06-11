import { createServerClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/guesses?match_id=X  -  ניחושים לפי משחק
export async function GET(request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get('match_id')

  let query = supabase.from('guesses').select('*')
  if (matchId) query = query.eq('match_id', matchId)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ guesses: data || [] })
}

// POST /api/guesses - שמור ניחוש (רגיל)
export async function POST(request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { match_id, prediction, predicted_home_score, predicted_away_score } = body

  if (!match_id) return Response.json({ error: 'Missing match_id' }, { status: 400 })

  const { error } = await supabase.from('guesses').upsert(
    {
      user_id: user.id,
      match_id,
      prediction: prediction || null,
      predicted_home_score: predicted_home_score ?? null,
      predicted_away_score: predicted_away_score ?? null,
      is_locked: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,match_id' }
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}

// PUT /api/guesses - אדמין מזין ניחוש עבור משתמש
export async function PUT(request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { user_id, match_id, prediction, predicted_home_score, predicted_away_score } = body

  if (!user_id || !match_id) {
    return Response.json({ error: 'Missing user_id or match_id' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error } = await admin.from('guesses').upsert(
    {
      user_id,
      match_id,
      prediction: prediction || null,
      predicted_home_score: predicted_home_score ?? null,
      predicted_away_score: predicted_away_score ?? null,
      is_locked: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,match_id' }
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
