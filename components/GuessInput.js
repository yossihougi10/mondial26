'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isGroupStage } from '@/lib/scoring'

export default function GuessInput({ match, initialGuess, userId, onGuessChange }) {
  const supabase = createClient()
  const [guess, setGuess] = useState(initialGuess || null)
  const [saving, setSaving] = useState(false)

  const locked = new Date(match.utc_date) <= new Date() || !['SCHEDULED', 'TIMED'].includes(match.status)
  const groupStage = isGroupStage(match.stage)

  async function saveGuess(newGuess) {
    if (locked) return
    setSaving(true)
    const payload = {
      user_id: userId, match_id: match.id, is_locked: false, updated_at: new Date().toISOString(),
      ...(groupStage ? { prediction: newGuess.prediction } : {
        predicted_home_score: newGuess.home, predicted_away_score: newGuess.away,
      }),
    }
    const { error } = await supabase.from('guesses').upsert(payload, { onConflict: 'user_id,match_id' })
    if (!error) { setGuess(newGuess); onGuessChange?.(match.id, newGuess) }
    setSaving(false)
  }

  if (locked) {
    const hasGuess = guess && (guess.prediction || (guess.home !== null && guess.home !== undefined) || (guess.predicted_home_score !== null && guess.predicted_home_score !== undefined))
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white/20 text-xs">🔒</span>
        {hasGuess ? (
          <span className="font-bold text-white/70 bg-white/8 px-2.5 py-1 rounded-lg text-sm">
            {groupStage ? guess.prediction : `${guess.home ?? guess.predicted_home_score} - ${guess.away ?? guess.predicted_away_score}`}
          </span>
        ) : (
          <span className="text-white/25 text-xs">לא ניחשת</span>
        )}
      </div>
    )
  }

  if (groupStage) {
    const labels = { '1': 'בית', 'X': 'תיקו', '2': 'אורח' }
    return (
      <div className="space-y-1.5">
        <div className="flex gap-2">
          {['1', 'X', '2'].map(opt => (
            <button key={opt} disabled={saving} onClick={() => saveGuess({ prediction: opt })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                guess?.prediction === opt
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105'
                  : 'bg-white/8 text-white/60 border border-white/10 hover:bg-white/15 hover:text-white hover:border-white/20'
              }`}>
              {opt}
            </button>
          ))}
        </div>
        <div className="flex gap-2 text-xs text-white/25 px-0.5">
          {['בית', 'תיקו', 'אורח'].map(l => <span key={l} className="flex-1 text-center">{l}</span>)}
        </div>
      </div>
    )
  }

  const homeVal = guess?.home ?? guess?.predicted_home_score ?? ''
  const awayVal = guess?.away ?? guess?.predicted_away_score ?? ''

  function handleScoreChange(side, val) {
    const parsed = val === '' ? null : parseInt(val, 10)
    if (val !== '' && (isNaN(parsed) || parsed < 0 || parsed > 20)) return
    const newHome = side === 'home' ? parsed : (homeVal === '' ? null : parseInt(homeVal, 10))
    const newAway = side === 'away' ? parsed : (awayVal === '' ? null : parseInt(awayVal, 10))
    if (newHome !== null && newAway !== null) saveGuess({ home: newHome, away: newAway })
    else setGuess(g => ({ ...g, [side]: parsed }))
  }

  return (
    <div className="flex items-center gap-3 justify-center">
      <input type="number" min="0" max="20" value={homeVal} onChange={e => handleScoreChange('home', e.target.value)}
        disabled={saving}
        className="w-14 h-12 text-center text-xl font-black bg-white/8 border-2 border-white/15 rounded-xl text-white focus:border-green-500 focus:bg-green-500/10 focus:outline-none transition-all"
        placeholder="0" />
      <span className="text-white/30 font-bold text-lg">—</span>
      <input type="number" min="0" max="20" value={awayVal} onChange={e => handleScoreChange('away', e.target.value)}
        disabled={saving}
        className="w-14 h-12 text-center text-xl font-black bg-white/8 border-2 border-white/15 rounded-xl text-white focus:border-green-500 focus:bg-green-500/10 focus:outline-none transition-all"
        placeholder="0" />
    </div>
  )
}
