'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import LeaderboardTable from '@/components/LeaderboardTable'
import { createClient } from '@/lib/supabase/client'

export default function LeaderboardPage() {
  const supabase = createClient()
  const [loading, setLoading]     = useState(true)
  const [profile, setProfile]     = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [specialBets, setSpecialBets] = useState([])
  const [userId, setUserId]       = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const [profileRes, leaderRes, betsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('leaderboard').select('*'),
        supabase.from('special_bets').select('user_id, bet_type, value'),
      ])
      setProfile(profileRes.data)
      setLeaderboard(leaderRes.data || [])
      setSpecialBets(betsRes.data || [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl" style={{ animation:'float 1s ease-in-out infinite' }}>🏆</div>
      </div>
    )
  }

  const myRank = leaderboard.findIndex(r => r.id === userId) + 1
  const myRow  = leaderboard.find(r => r.id === userId)

  return (
    <>
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-3 py-6">

        {/* ── Header ───────────────────────────────── */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-black text-white leading-tight">טבלת דירוג</h1>
            <p className="text-sm font-medium mt-0.5" style={{ color:'#94A3B8' }}>
              עמדו בתחרות עם החברים
            </p>
          </div>
          <div className="text-4xl mt-1">🏆</div>
        </div>

        {/* ── My rank card ─────────────────────────── */}
        {myRow && (
          <div className="rounded-[20px] p-5 mb-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(16,185,129,0.07) 100%)',
              border: '1px solid rgba(34,197,94,0.30)',
              boxShadow: '0 0 32px rgba(34,197,94,0.08)',
            }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 to-transparent pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-green-400/60 mb-1.5">
                  המיקום שלי
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-[42px] font-black leading-none">
                    {myRank <= 3 ? ['🥇','🥈','🥉'][myRank-1] : `#${myRank}`}
                  </p>
                  <p className="text-lg font-black text-white">{myRow.display_name}</p>
                </div>
              </div>
              <div className="text-end shrink-0">
                <p className="text-[46px] font-black leading-none gradient-text">{myRow.total_points}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color:'rgba(34,197,94,0.55)' }}>
                  נקודות
                </p>
                <div className="flex gap-3 mt-1.5 text-[11px] font-medium" style={{ color:'rgba(255,255,255,0.35)' }}>
                  <span>✓✓ {myRow.exact_count}</span>
                  <span>✓ {myRow.direction_count}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Scoring legend ───────────────────────── */}
        <div className="flex gap-3 mb-5 px-4 py-3 rounded-2xl"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-black px-2.5 py-1 rounded-lg"
              style={{ background:'rgba(34,197,94,0.18)', color:'#22C55E' }}>3</span>
            <span style={{ color:'rgba(148,163,184,0.70)' }}>תוצאה מדויקת</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-black px-2.5 py-1 rounded-lg"
              style={{ background:'rgba(59,130,246,0.18)', color:'#60A5FA' }}>1</span>
            <span style={{ color:'rgba(148,163,184,0.70)' }}>כיוון נכון</span>
          </div>
        </div>

        <LeaderboardTable rows={leaderboard} currentUserId={userId} specialBets={specialBets} />
      </main>
    </>
  )
}
