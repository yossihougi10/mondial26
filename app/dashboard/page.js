'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import MatchCard from '@/components/MatchCard'
import { createClient } from '@/lib/supabase/client'

function groupMatchesByDate(matches) {
  const groups = {}
  matches.forEach(m => {
    const key = new Date(m.utc_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  })
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

function getTodayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [matches, setMatches] = useState([])
  const [guesses, setGuesses] = useState([])
  const [allGuesses, setAllGuesses] = useState([])
  const [profiles, setProfiles] = useState([])
  const [scores, setScores] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [userId, setUserId] = useState(null)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [profileRes, matchRes, myGuessRes, allGuessRes, profilesRes, scoresRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('matches').select('*').order('utc_date', { ascending: true }),
      supabase.from('guesses').select('*').eq('user_id', user.id),
      supabase.from('guesses').select('*').eq('is_locked', true),
      supabase.from('profiles').select('id, display_name'),
      supabase.from('scores').select('*').eq('user_id', user.id),
    ])

    setProfile(profileRes.data)
    setMatches(matchRes.data || [])
    setGuesses(myGuessRes.data || [])
    setAllGuesses(allGuessRes.data || [])
    setProfiles(profilesRes.data || [])
    setScores(scoresRes.data || [])

    if (!selectedDate) {
      const today = getTodayKey()
      const dates = [...new Set((matchRes.data || []).map(m =>
        new Date(m.utc_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
      ))].sort()
      setSelectedDate(dates.includes(today) ? today : dates[0] || null)
    }
    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(() => {
    loadData()
    const iv = setInterval(loadData, 60000)
    return () => clearInterval(iv)
  }, [loadData])

  function handleGuessChange(matchId, newGuess) {
    setGuesses(gs => {
      const existing = gs.find(g => g.match_id === matchId)
      if (existing) return gs.map(g => g.match_id === matchId ? { ...g, ...newGuess } : g)
      return [...gs, { match_id: matchId, user_id: userId, ...newGuess }]
    })
  }

  const allDates = [...new Set(matches.map(m =>
    new Date(m.utc_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
  ))].sort()

  const displayedMatches = selectedDate
    ? matches.filter(m => new Date(m.utc_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }) === selectedDate)
    : matches

  const hasLive = matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
  const today = getTodayKey()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4" style={{ animation: 'float 1s ease-in-out infinite' }}>⚽</div>
          <p className="text-white/40">טוען...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar profile={profile} onSyncMatches={loadData} />
      <main className="max-w-2xl mx-auto px-3 py-5">
        {/* כותרת */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">לוח המשחקים</h1>
            {hasLive && (
              <div className="flex items-center gap-2 mt-1">
                <span className="live-dot w-2 h-2 bg-red-500 rounded-full inline-block" />
                <span className="text-sm text-red-400 font-medium">יש משחק חי עכשיו!</span>
              </div>
            )}
          </div>
          <div className="text-3xl">🏟️</div>
        </div>

        {/* תאריכים */}
        {allDates.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-3 px-3 no-scrollbar">
            {allDates.map(date => {
              const isToday = date === today
              const isSelected = date === selectedDate
              const dateMatches = matches.filter(m =>
                new Date(m.utc_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }) === date
              )
              const hasLiveDate = dateMatches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')

              return (
                <button key={date} onClick={() => setSelectedDate(date)}
                  className={`shrink-0 relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'glass border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}>
                  {isToday && <span className="text-xs block leading-none mb-0.5 opacity-70">היום</span>}
                  <span>{formatDayLabel(date)}</span>
                  {hasLiveDate && (
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#080c18] live-dot" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* משחקים */}
        {displayedMatches.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <p className="text-5xl mb-4">📅</p>
            <p>אין משחקים בתאריך זה</p>
            {matches.length === 0 && profile?.is_admin && (
              <p className="text-sm mt-2 text-white/20">לחץ על "סנכרן" בתפריט לטעינת לוח המשחקים</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedMatches.map(match => (
              <MatchCard key={match.id} match={match}
                userGuess={guesses.find(g => g.match_id === match.id)}
                allGuesses={allGuesses.filter(g => g.match_id === match.id)}
                profiles={profiles} userId={userId} onGuessChange={handleGuessChange}
                userScore={scores.find(s => s.match_id === match.id)}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
