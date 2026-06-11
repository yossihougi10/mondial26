'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

function ScorerInput({ initial, saving, onSave }) {
  const [v, setV] = useState(initial || '')
  useEffect(() => { if (initial) setV(initial) }, [initial])
  return (
    <div className="flex gap-2">
      <input type="text" placeholder="שם שחקן, לדוגמה: ויניסיוס ג'וניור" value={v}
        onChange={e => setV(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && v.trim()) onSave(v) }}
        className="flex-1 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-green-500/50 transition-all"
      />
      <button onClick={() => onSave(v)} disabled={saving || !v.trim()}
        className="px-4 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shrink-0">
        {saving ? '...' : 'שמור'}
      </button>
    </div>
  )
}

export default function SpecialPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [userId, setUserId] = useState(null)
  const [teams, setTeams] = useState([])
  const [myBets, setMyBets] = useState({})
  const [allBets, setAllBets] = useState([])
  const [isLocked, setIsLocked] = useState(false)
  const [saving, setSaving] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [profileRes, matchRes, betsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('matches').select('home_team_name, away_team_name, utc_date, status')
          .order('utc_date').limit(200),
        fetch('/api/special-bets').then(r => r.json()),
      ])

      setProfile(profileRes.data)

      if (matchRes.data?.length) {
        const teamSet = new Set()
        matchRes.data.forEach(m => {
          if (m.home_team_name) teamSet.add(m.home_team_name)
          if (m.away_team_name) teamSet.add(m.away_team_name)
        })
        setTeams([...teamSet].sort((a, b) => a.localeCompare(b, 'he')))

        const first = matchRes.data[0]
        setIsLocked(
          !['SCHEDULED', 'TIMED'].includes(first.status) ||
          new Date(first.utc_date) <= new Date()
        )
      }

      if (betsRes.bets) {
        setAllBets(betsRes.bets)
        const mine = {}
        betsRes.bets.filter(b => b.user_id === user.id).forEach(b => { mine[b.bet_type] = b.value })
        setMyBets(mine)
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  async function saveBet(betType, value) {
    if (isLocked || !value?.trim()) return
    setSaving(s => ({ ...s, [betType]: true }))
    const res = await fetch('/api/special-bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet_type: betType, value: value.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      setMyBets(b => ({ ...b, [betType]: value.trim() }))
      setAllBets(prev => {
        const without = prev.filter(b => !(b.user_id === userId && b.bet_type === betType))
        return [...without, { user_id: userId, bet_type: betType, value: value.trim(),
          profiles: { display_name: profile?.display_name } }]
      })
    }
    setSaving(s => ({ ...s, [betType]: false }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl" style={{ animation: 'float 1s ease-in-out infinite' }}>⭐</div>
      </div>
    )
  }

  const championBets = allBets.filter(b => b.bet_type === 'champion')
  const scorerBets = allBets.filter(b => b.bet_type === 'top_scorer')
  const filteredTeams = search.trim()
    ? teams.filter(t => t.toLowerCase().includes(search.toLowerCase()))
    : teams

  return (
    <>
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-3 py-5">

        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">⭐ בחירות מיוחדות</h1>
          <p className="text-white/40 text-sm mt-1">ניחושים לאורך כל הטורניר — נעולים עם פתיחת המשחק הראשון</p>
        </div>

        {isLocked && (
          <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/8 p-3 mb-5 flex items-center gap-2.5 text-sm">
            <span className="text-lg">🔒</span>
            <span className="text-yellow-300/80 font-medium">הניחושים נעולים — הטורניר התחיל</span>
          </div>
        )}

        {/* אלוף הטורניר */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden mb-4">
          <div className="px-4 py-3.5 border-b border-white/6" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/20 flex items-center justify-center text-2xl shrink-0">
                🏆
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black">הנבחרת המנצחת</p>
                <p className="text-white/35 text-xs">מי תזכה במונדיאל 2026?</p>
              </div>
              {myBets.champion && (
                <div className="bg-green-500/15 border border-green-500/25 rounded-xl px-3 py-1.5 shrink-0">
                  <span className="text-green-400 text-sm font-black">{myBets.champion}</span>
                </div>
              )}
            </div>
          </div>

          {!isLocked && (
            <div className="p-4">
              <input type="text" placeholder="🔍 חפש נבחרת..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/25 mb-3 transition-all"
              />
              {filteredTeams.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-4">
                  {teams.length === 0 ? 'טוען נבחרות... (יש לסנכרן משחקים קודם)' : 'לא נמצאה נבחרת'}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto">
                  {filteredTeams.map(team => (
                    <button key={team} onClick={() => saveBet('champion', team)}
                      disabled={saving.champion}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold text-center transition-all active:scale-95 truncate ${
                        myBets.champion === team
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                          : 'bg-white/6 text-white/60 border border-white/8 hover:bg-white/12 hover:text-white hover:border-white/15'
                      }`}>
                      {team}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* לאחר נעילה — ניחושי כולם */}
          {isLocked && (
            <div className="p-4">
              {championBets.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-3">אף אחד לא ניחש עדיין</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {championBets.map((b, i) => {
                    const isMe = b.user_id === userId
                    return (
                      <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs border transition-all ${
                        isMe ? 'bg-green-500/15 border-green-500/25' : 'bg-white/5 border-white/6'
                      }`}>
                        <span className={`font-medium truncate ${isMe ? 'text-green-400' : 'text-white/50'}`}>
                          {b.profiles?.display_name || '?'}{isMe ? ' ✓' : ''}
                        </span>
                        <span className={`font-black mr-2 shrink-0 ${isMe ? 'text-green-300' : 'text-white/80'}`}>
                          {b.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* מלך השערים */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-white/6" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/20 flex items-center justify-center text-2xl shrink-0">
                👟
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black">מלך השערים</p>
                <p className="text-white/35 text-xs">מי יהיה מלך השערים של המונדיאל?</p>
              </div>
              {myBets.top_scorer && (
                <div className="bg-blue-500/15 border border-blue-500/25 rounded-xl px-3 py-1.5 shrink-0">
                  <span className="text-blue-300 text-sm font-black">{myBets.top_scorer}</span>
                </div>
              )}
            </div>
          </div>

          {!isLocked && (
            <div className="p-4">
              <ScorerInput initial={myBets.top_scorer} saving={saving.top_scorer}
                onSave={v => saveBet('top_scorer', v)} />
            </div>
          )}

          {isLocked && (
            <div className="p-4">
              {scorerBets.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-3">אף אחד לא ניחש עדיין</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {scorerBets.map((b, i) => {
                    const isMe = b.user_id === userId
                    return (
                      <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs border transition-all ${
                        isMe ? 'bg-blue-500/15 border-blue-500/25' : 'bg-white/5 border-white/6'
                      }`}>
                        <span className={`font-medium truncate ${isMe ? 'text-blue-400' : 'text-white/50'}`}>
                          {b.profiles?.display_name || '?'}{isMe ? ' ✓' : ''}
                        </span>
                        <span className={`font-black mr-2 shrink-0 ${isMe ? 'text-blue-300' : 'text-white/80'}`}>
                          {b.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="glass rounded-xl border border-white/7 p-3.5 mt-4 space-y-1 text-xs text-white/30">
          <p>• הניחושים נעולים ברגע שהמשחק הראשון מתחיל</p>
          <p>• לאחר הנעילה ניחושי כולם נחשפים</p>
        </div>
      </main>
    </>
  )
}
