import { createServerClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: bets, error } = await admin
    .from('special_bets')
    .select('*, profiles(display_name)')
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ bets: bets || [], userId: user.id })
}

export async function POST(request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { bet_type, value } = await request.json()
  if (!['champion', 'top_scorer'].includes(bet_type)) {
    return Response.json({ error: 'Invalid bet type' }, { status: 400 })
  }
  if (!value?.trim()) return Response.json({ error: 'Value required' }, { status: 400 })

  // admin client עוקף RLS — המשתמש כבר אומת למעלה
  const admin = createAdminClient()
  const { error } = await admin.from('special_bets').upsert(
    { user_id: user.id, bet_type, value: value.trim(), updated_at: new Date().toISOString() },
    { onConflict: 'user_id,bet_type' }
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
