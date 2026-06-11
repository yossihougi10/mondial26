'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import MatchCard from '@/components/MatchCard'
import { createClient } from '@/lib/supabase/client'

function formatDateHebrew(dateStr) {
  return new Date(dateStr).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Jerusalem',
  })
}

function groupMatchesByDate(matches) {
  const groups = {}
  matches.forEach(m => {
    const dateKey = new Date(m.utc_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(m)
  })
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

function getTodayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
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

    // ברירת מחדל: עבור לתאריך היום אם קיים, אחרת לראשון
    if (!selectedDate) {
      const today = getTodayKey()
      const matchDates = (matchRes.data || []).map(m =>
        new Date(m.utc_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
      )
      const uniqueDates = [...new Set(matchDates)].sort()
      if (uniqueDates.includes(today)) setSelectedDate(today)
      else if (uniqueDates.length > 0) setSelectedDate(uniqueDates[0])
    }

    setLoading(false)
  }, []) // eslint-disable-line

  useEffect(() => {
    loadData()
    // רענון אוטומטי כל 60 שניות לתוצאות חיות
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [loadData])

  function handleGuessChange(matchId, newGuess) {
    setGuesses(gs => {
      const existing = gs.find(g => g.match_id === matchId)
      if (existing) return gs.map(g => g.match_id === matchId ? { ...g, ...newGuess } : g)
      return [...gs, { match_id: matchId, user_id: userId, ...newGuess }]
    })
  }

  const grouped = groupMatchesByDate(matches)
  const allDates = grouped.map(([date]) => date)

  const displayedMatches = selectedDate
    ? matches.filter(m =>
        new Date(m.utc_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }) === selectedDate
      )
    : matches

  const hasLive = matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⚽</div>
          <p className="text-slate-500">טוען...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar profile={profile} onSyncMatches={loadData} />

      <main className="max-w-2xl mx-auto px-3 py-4">
        {/* כותרת */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-800">לוח המשחקים</h1>
          {hasLive && (
            <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium mt-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              יש משחק חי עכשיו!
            </span>
          )}
        </div>

        {/* ניווט תאריכים */}
        {allDates.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-3 px-3">
            {allDates.map(date => {
              const isToday = date === getTodayKey()
              const isSelected = date === selectedDate
              const dateMatches = matches.filter(m =>
                new Date(m.utc_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }) === date
              )
              const hasLiveOnDate = dateMatches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
              const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('he-IL', {
                day: 'numeric',
                month: 'short',
                timeZone: 'UTC',
              })

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors relative ${
                    isSelected
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-green-400'
                  }`}
                >
                  {isToday && <span className="text-xs block leading-none mb-0.5 opacity-80">היום</span>}
                  <span>{dayLabel}</span>
                  {hasLiveOnDate && (
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* משחקים */}
        {displayedMatches.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-3">📅</p>
            <p>אין משחקים בתאריך זה</p>
            {matches.length === 0 && (
              <p className="text-sm mt-2">
                {profile?.is_admin
                  ? 'לחץ על "סנכרן" בתפריט לטעינת לוח המשחקים מה-API'
                  : 'לוח המשחקים יתעדכן בקרוב'}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedMatches.map(match => {
              const myGuess = guesses.find(g => g.match_id === match.id)
              const matchGuesses = allGuesses.filter(g => g.match_id === match.id)
              const myScore = scores.find(s => s.match_id === match.id)

              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  userGuess={myGuess}
                  allGuesses={matchGuesses}
                  profiles={profiles}
                  userId={userId}
                  onGuessChange={handleGuessChange}
                  userScore={myScore}
                />
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
