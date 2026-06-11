'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import LeaderboardTable from '@/components/LeaderboardTable'
import { createClient } from '@/lib/supabase/client'

export default function LeaderboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const [profileRes, leaderRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('leaderboard').select('*'),
      ])
      setProfile(profileRes.data)
      setLeaderboard(leaderRes.data || [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl" style={{ animation: 'float 1s ease-in-out infinite' }}>⚽</div>
      </div>
    )
  }

  const myRank = leaderboard.findIndex(r => r.id === userId) + 1
  const myRow = leaderboard.find(r => r.id === userId)

  return (
    <>
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-3 py-5">
        <h1 className="text-2xl font-black text-white mb-5">🏆 טבלת דירוג</h1>

        {/* כרטיס המיקום שלי */}
        {myRow && (
          <div className="rounded-2xl p-5 mb-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-green-400/70 text-sm mb-1">המיקום שלי</p>
                <p className="text-4xl font-black mb-1">
                  {myRank <= 3 ? ['🥇','🥈','🥉'][myRank-1] : `#${myRank}`}
                </p>
                <p className="text-white font-bold text-lg">{myRow.display_name}</p>
              </div>
              <div className="text-end">
                <p className="text-5xl font-black gradient-text">{myRow.total_points}</p>
                <p className="text-green-400/60 text-sm mt-1">נקודות</p>
                <div className="flex gap-3 mt-2 text-xs text-white/50">
                  <span>✓✓ {myRow.exact_count}</span>
                  <span>✓ {myRow.direction_count}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* מקרא */}
        <div className="glass rounded-xl border border-white/8 p-3 mb-5 flex gap-4 text-xs text-white/50">
          <div className="flex items-center gap-1.5">
            <span className="bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-lg">3</span>
            <span>תוצאה מדויקת</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-lg">1</span>
            <span>כיוון נכון</span>
          </div>
        </div>

        <LeaderboardTable rows={leaderboard} currentUserId={userId} />
      </main>
    </>
  )
}
