'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isGroupStage } from '@/lib/scoring'

export default function GuessInput({ match, initialGuess, userId, onGuessChange }) {
  const supabase = createClient()
  const [guess, setGuess] = useState(initialGuess || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const locked = new Date(match.utc_date) <= new Date() || match.status !== 'SCHEDULED'
  const groupStage = isGroupStage(match.stage)

  async function saveGuess(newGuess) {
    if (locked) return
    setSaving(true)
    setError('')

    const payload = {
      user_id: userId,
      match_id: match.id,
      is_locked: false,
      updated_at: new Date().toISOString(),
      ...(groupStage
        ? { prediction: newGuess.prediction }
        : {
            predicted_home_score: newGuess.home,
            predicted_away_score: newGuess.away,
          }),
    }

    const { error: err } = await supabase
      .from('guesses')
      .upsert(payload, { onConflict: 'user_id,match_id' })

    if (err) {
      setError('שגיאה בשמירה')
    } else {
      setGuess(newGuess)
      onGuessChange?.(match.id, newGuess)
    }
    setSaving(false)
  }

  if (locked) {
    return (
      <div className="text-xs text-slate-400 flex items-center gap-1">
        <span>🔒</span>
        {guess ? (
          <span className="font-medium text-slate-600">
            {groupStage
              ? labelFor1X2(guess.prediction)
              : `${guess.home ?? guess.predicted_home_score} - ${guess.away ?? guess.predicted_away_score}`}
          </span>
        ) : (
          <span>לא ניחשת</span>
        )}
      </div>
    )
  }

  if (groupStage) {
    return (
      <div className="space-y-1">
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-1">
          {['1', 'X', '2'].map(opt => (
            <button
              key={opt}
              disabled={saving}
              onClick={() => saveGuess({ prediction: opt })}
              className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                guess?.prediction === opt
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-green-400 active:scale-95'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex gap-1 text-xs text-slate-400 px-0.5">
          <span className="flex-1 text-center">בית</span>
          <span className="flex-1 text-center">תיקו</span>
          <span className="flex-1 text-center">אורח</span>
        </div>
      </div>
    )
  }

  // שלב נוקאאוט
  const homeVal = guess?.home ?? guess?.predicted_home_score ?? ''
  const awayVal = guess?.away ?? guess?.predicted_away_score ?? ''

  function handleScoreChange(side, val) {
    const parsed = val === '' ? null : parseInt(val, 10)
    if (val !== '' && (isNaN(parsed) || parsed < 0 || parsed > 20)) return
    const newHome = side === 'home' ? parsed : (homeVal === '' ? null : parseInt(homeVal, 10))
    const newAway = side === 'away' ? parsed : (awayVal === '' ? null : parseInt(awayVal, 10))
    if (newHome !== null && newAway !== null) {
      saveGuess({ home: newHome, away: newAway })
    } else {
      setGuess(g => ({ ...g, [side === 'home' ? 'home' : 'away']: parsed }))
    }
  }

  return (
    <div className="space-y-1">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex items-center gap-2 justify-center">
        <input
          type="number"
          min="0" max="20"
          value={homeVal}
          onChange={e => handleScoreChange('home', e.target.value)}
          disabled={saving}
          className="w-14 h-10 text-center text-lg font-bold border-2 border-slate-200 rounded-lg focus:border-green-500 focus:outline-none"
          placeholder="0"
        />
        <span className="text-slate-400 font-bold">-</span>
        <input
          type="number"
          min="0" max="20"
          value={awayVal}
          onChange={e => handleScoreChange('away', e.target.value)}
          disabled={saving}
          className="w-14 h-10 text-center text-lg font-bold border-2 border-slate-200 rounded-lg focus:border-green-500 focus:outline-none"
          placeholder="0"
        />
      </div>
      {saving && <p className="text-xs text-slate-400 text-center">שומר...</p>}
    </div>
  )
}

function labelFor1X2(val) {
  return val === '1' ? 'בית (1)' : val === '2' ? 'אורח (2)' : 'תיקו (X)'
}
