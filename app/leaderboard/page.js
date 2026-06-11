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
        <div className="text-5xl animate-spin">⚽</div>
      </div>
    )
  }

  const myRank = leaderboard.findIndex(r => r.id === userId) + 1
  const myRow = leaderboard.find(r => r.id === userId)

  return (
    <>
      <Navbar profile={profile} />

      <main className="max-w-2xl mx-auto px-3 py-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">🏆 טבלת דירוג</h1>

        {/* כרטיס המיקום שלי */}
        {myRow && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-4 mb-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">המיקום שלי</p>
                <p className="text-3xl font-bold">{myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : `#${myRank}`}</p>
                <p className="font-semibold mt-0.5">{myRow.display_name}</p>
              </div>
              <div className="text-end">
                <p className="text-5xl font-bold">{myRow.total_points}</p>
                <p className="text-green-200 text-sm">נקודות</p>
              </div>
            </div>
            <div className="flex gap-4 mt-3 pt-3 border-t border-green-500/50 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-green-200">מדויק:</span>
                <span className="font-bold">{myRow.exact_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-200">כיוון:</span>
                <span className="font-bold">{myRow.direction_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-200">משחקים:</span>
                <span className="font-bold">{myRow.games_scored}</span>
              </div>
            </div>
          </div>
        )}

        {/* מקרא ניקוד */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">מערכת הניקוד</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-xs">3</span>
              <span className="text-slate-600">ניחוש תוצאה מדויקת (נוקאאוט)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">1</span>
              <span className="text-slate-600">ניחוש כיוון נכון (1X2 / מנצח)</span>
            </div>
          </div>
        </div>

        <LeaderboardTable rows={leaderboard} currentUserId={userId} />
      </main>
    </>
  )
}
