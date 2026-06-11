import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: bets, error } = await supabase
    .from('special_bets')
    .select('*, profiles(display_name)')
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ bets: bets || [], userId: user.id })
}

export async function POST(request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { bet_type, value } = await request.json()
  if (!['champion', 'top_scorer'].includes(bet_type)) {
    return Response.json({ error: 'Invalid bet type' }, { status: 400 })
  }
  if (!value?.trim()) return Response.json({ error: 'Value required' }, { status: 400 })

  const { error } = await supabase.from('special_bets').upsert(
    { user_id: user.id, bet_type, value: value.trim(), updated_at: new Date().toISOString() },
    { onConflict: 'user_id,bet_type' }
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
